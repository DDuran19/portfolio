<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';

	// ─────────────────────────────────────────────
	// CALCULATION ENGINE — pure, deterministic, unit-testable
	// ─────────────────────────────────────────────
	const CONFIG = {
		currentRate: 0.0589,
		optimisedRate: 0.0551,
		annualFee: 395,
		dischargeFee: 350
	};

	interface CalcResult {
		totalSavings: number;
		year1Saving: number;
		monthlySaving: number;
		currentRate: number;
		optimisedRate: number;
		rateDiff: number;
		currentMonthly: number;
		optimisedMonthly: number;
	}

	function monthlyRepayment(principal: number, annualRate: number, termYears: number): number {
		const r = annualRate / 12;
		const n = termYears * 12;
		if (r === 0) return principal / n;
		return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
	}

	function totalCost(
		principal: number,
		annualRate: number,
		termYears: number,
		annualFee: number
	): number {
		const monthly = monthlyRepayment(principal, annualRate, termYears);
		return monthly * termYears * 12 + annualFee * termYears;
	}

	function calculate(loanAmount: number, termYears: number): CalcResult {
		const currentMonthly = monthlyRepayment(loanAmount, CONFIG.currentRate, termYears);
		const optimisedMonthly = monthlyRepayment(loanAmount, CONFIG.optimisedRate, termYears);
		const currentTotal = totalCost(loanAmount, CONFIG.currentRate, termYears, 0);
		const optimisedTotal =
			totalCost(loanAmount, CONFIG.optimisedRate, termYears, CONFIG.annualFee) +
			CONFIG.dischargeFee;

		return {
			totalSavings: Math.max(0, currentTotal - optimisedTotal),
			year1Saving: Math.max(
				0,
				currentMonthly * 12 - optimisedMonthly * 12 - CONFIG.annualFee - CONFIG.dischargeFee
			),
			monthlySaving: Math.max(0, currentMonthly - optimisedMonthly),
			currentRate: CONFIG.currentRate,
			optimisedRate: CONFIG.optimisedRate,
			rateDiff: CONFIG.currentRate - CONFIG.optimisedRate,
			currentMonthly,
			optimisedMonthly
		};
	}

	// ─────────────────────────────────────────────
	// ANALYTICS — GTM dataLayer wrapper
	// ─────────────────────────────────────────────
	interface AnalyticsEvent {
		event: string;
		timestamp: string;
		[key: string]: unknown;
	}

	let analyticsLog: AnalyticsEvent[] = [];

	function fireEvent(eventName: string, payload: Record<string, unknown> = {}) {
		if (typeof window !== 'undefined') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).dataLayer = (window as any).dataLayer || [];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).dataLayer.push({ event: eventName, ...payload });
		}
		analyticsLog = [
			...analyticsLog,
			{
				event: eventName,
				timestamp: new Date().toLocaleTimeString('en-AU', { hour12: false }),
				...payload
			}
		];
	}

	// ─────────────────────────────────────────────
	// FORMATTING
	// ─────────────────────────────────────────────
	function fmt(n: number): string {
		return '$' + Math.round(n).toLocaleString('en-AU');
	}
	function fmtRate(r: number): string {
		return (r * 100).toFixed(2) + '%';
	}
	function parseLoan(s: string): number {
		return parseFloat(s.replace(/,/g, '')) || 0;
	}
	function formatLoanDisplay(raw: string): string {
		const digits = raw.replace(/[^0-9]/g, '');
		if (!digits) return '';
		return parseInt(digits).toLocaleString('en-AU');
	}

	// ─────────────────────────────────────────────
	// STATE
	// ─────────────────────────────────────────────
	let loanRaw = '500,000';
	let termValue = 25;
	let result: CalcResult | null = calculate(500000, 25);

	let loanError = '';
	let termError = '';
	let showBreakdown = false;
	let hasInteracted = false;
	let ctaClicked = false;
	let visibilityFired = false;
	let showLog = false;
	let showEmbedSection = false;
	let copied = false;

	let calcDebounce: ReturnType<typeof setTimeout> | null = null;
	let abandonTimer: ReturnType<typeof setTimeout> | null = null;
	let observer: IntersectionObserver | null = null;
	let cardEl: HTMLElement;
	let logEl: HTMLElement;
	let dialogEl: HTMLDialogElement;

	// ─────────────────────────────────────────────
	// EMBED SNIPPET
	// ─────────────────────────────────────────────
	const PORTFOLIO_URL = $page.url.origin;
	const DEMO_URL = $page.url.pathname;

	const embedSnippet = `<!-- Mortgage Savings Calculator -->
<!-- Built by Denver Duran · ${PORTFOLIO_URL} -->
<iframe
  src="${DEMO_URL}/embeddable"
  width="100%"
  height="780"
  style="border:none;border-radius:16px;overflow:hidden;"
  title="Mortgage Savings Calculator"
  loading="lazy"
></iframe>`;

	function copyEmbed() {
		navigator.clipboard.writeText(embedSnippet).then(() => {
			copied = true;
			setTimeout(() => (copied = false), 2000);
		});
	}

	// ─────────────────────────────────────────────
	// VALIDATION
	// ─────────────────────────────────────────────
	function validateLoan(): boolean {
		const n = parseLoan(loanRaw);
		if (!loanRaw) {
			loanError = '';
			return false;
		}
		if (n < 100_000) {
			loanError = 'Minimum loan amount is $100,000';
			return false;
		}
		if (n > 5_000_000) {
			loanError = 'Maximum loan amount is $5,000,000';
			return false;
		}
		loanError = '';
		return true;
	}

	function validateTerm(): boolean {
		if (termValue < 1 || termValue > 30) {
			termError = 'Term must be between 1 and 30 years';
			return false;
		}
		termError = '';
		return true;
	}

	// ─────────────────────────────────────────────
	// INPUT HANDLERS
	// ─────────────────────────────────────────────
	function onLoanInput(e: Event) {
		const target = e.target as HTMLInputElement;
		loanRaw = formatLoanDisplay(target.value);
		target.value = loanRaw;
		trackFirstInteraction();
		scheduleCalc('loan_amount');
	}

	function onTermInput() {
		trackFirstInteraction();
		scheduleCalc('loan_term');
	}

	function scheduleCalc(field: string) {
		fireEvent('input_changed', {
			field,
			loan_amount: parseLoan(loanRaw) || undefined,
			loan_term: termValue || undefined
		});
		if (calcDebounce) clearTimeout(calcDebounce);
		calcDebounce = setTimeout(() => {
			const loanOk = validateLoan();
			const termOk = validateTerm();
			if (!loanOk || !termOk) return;
			const loan = parseLoan(loanRaw);
			result = calculate(loan, termValue);
			fireEvent('calculation_completed', {
				loan_amount: loan,
				loan_term: termValue,
				total_savings: Math.round(result.totalSavings),
				year1_saving: Math.round(result.year1Saving)
			});
		}, 400);
	}

	function trackFirstInteraction() {
		if (hasInteracted) return;
		hasInteracted = true;
		fireEvent('first_input_interaction');
		abandonTimer = setTimeout(
			() => {
				if (!ctaClicked) {
					fireEvent('user_abandoned', {
						loan_amount: parseLoan(loanRaw),
						loan_term: termValue
					});
				}
			},
			5 * 60 * 1000
		);
	}

	function onBreakdownToggle() {
		showBreakdown = !showBreakdown;
		if (showBreakdown) {
			fireEvent('view_detailed_results', {
				loan_amount: parseLoan(loanRaw),
				loan_term: termValue
			});
		}
	}

	function onCta() {
		ctaClicked = true;
		fireEvent('cta_clicked', { loan_amount: parseLoan(loanRaw), loan_term: termValue });
		dialogEl.showModal();
	}

	function closeTcDialog() {
		dialogEl.close();
	}

	function onDialogClick(e: MouseEvent) {
		if (e.target === dialogEl) closeTcDialog();
	}

	// ─────────────────────────────────────────────
	// LIFECYCLE
	// ─────────────────────────────────────────────
	function onBeforeUnload() {
		if (hasInteracted && !ctaClicked) {
			fireEvent('user_abandoned', { loan_amount: parseLoan(loanRaw), loan_term: termValue });
		}
	}

	onMount(() => {
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !visibilityFired) {
						visibilityFired = true;
						fireEvent('calculator_visible');
						observer?.disconnect();
					}
				});
			},
			{ threshold: 0.5 }
		);
		if (cardEl) observer.observe(cardEl);
		window.addEventListener('beforeunload', onBeforeUnload);
	});

	onDestroy(() => {
		observer?.disconnect();
		if (calcDebounce) clearTimeout(calcDebounce);
		if (abandonTimer) clearTimeout(abandonTimer);
		if (typeof window !== 'undefined') window.removeEventListener('beforeunload', onBeforeUnload);
	});

	$: if (analyticsLog.length && logEl) {
		setTimeout(() => {
			logEl.scrollTop = logEl.scrollHeight;
		}, 10);
	}
</script>

<svelte:head>
	<title>Mortgage Savings Calculator – Demo by Denver Duran</title>
	<meta
		name="description"
		content="Embeddable mortgage savings calculator demo. Built by Denver Duran — full-stack developer at denvie.online"
	/>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<!-- ══════════════════════════════════════════
     T&C SAMPLE DIALOG
══════════════════════════════════════════ -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog bind:this={dialogEl} class="tc-dialog" on:click={onDialogClick}>
	<div class="tc-inner">
		<div class="tc-icon">🧪</div>
		<h2>This is a sample demo</h2>
		<p>
			This calculator is a <strong>portfolio demonstration</strong> built by
			<a href={PORTFOLIO_URL} target="_blank" rel="noopener">Denver Duran</a>
			to showcase embeddable widget development, GA4 analytics integration, and financial calculation
			logic.
		</p>
		<p>
			All figures are <strong>illustrative only</strong>, using representative rates. No real
			financial advice is provided here.
		</p>
		<div class="tc-actions">
			<a href={PORTFOLIO_URL} target="_blank" rel="noopener" class="tc-btn-primary">
				View full portfolio →
			</a>
			<button class="tc-btn-ghost" on:click={closeTcDialog}>Got it, close</button>
		</div>
	</div>
</dialog>

<!-- ══════════════════════════════════════════
     PAGE
══════════════════════════════════════════ -->
<div class="page">
	<!-- DEMO BADGE -->
	<span class="badge">📐 Portfolio Demo · Embeddable Widget</span>

	<!-- HEADER -->
	<header class="header">
		<h1>How much could you <em>save</em> on your home loan?</h1>
		<p>Enter your loan details and we'll estimate your savings instantly.</p>
	</header>

	<!-- CALCULATOR CARD -->
	<div class="card" bind:this={cardEl}>
		<!-- LOAN AMOUNT -->
		<div class="field">
			<label for="loan-amount">Loan Amount</label>
			<div class="input-wrap">
				<span class="prefix">$</span>
				<input
					id="loan-amount"
					type="text"
					inputmode="numeric"
					placeholder="500,000"
					autocomplete="off"
					aria-label="Loan amount in Australian dollars"
					aria-describedby="loan-hint loan-err"
					class:error={loanError}
					value={loanRaw}
					on:input={onLoanInput}
				/>
			</div>
			<p class="hint" id="loan-hint">Min $100,000 · Max $5,000,000</p>
			{#if loanError}
				<p class="err" id="loan-err" role="alert">{loanError}</p>
			{/if}
		</div>

		<!-- LOAN TERM -->
		<div class="field">
			<label for="loan-term">Remaining Loan Term</label>
			<div class="input-wrap">
				<input
					id="loan-term"
					type="number"
					min="1"
					max="30"
					inputmode="numeric"
					aria-label="Remaining loan term in years"
					aria-describedby="term-err"
					class:error={termError}
					bind:value={termValue}
					on:input={onTermInput}
				/>
				<span class="suffix">yrs</span>
			</div>
			<input
				type="range"
				min="1"
				max="30"
				aria-label="Loan term slider"
				bind:value={termValue}
				on:input={onTermInput}
				class="slider"
			/>
			<div class="slider-labels"><span>1 yr</span><span>30 yrs</span></div>
			{#if termError}
				<p class="err" id="term-err" role="alert">{termError}</p>
			{/if}
		</div>

		<hr class="divider" />

		<!-- RESULTS -->
		{#if result}
			<div class="results" aria-live="polite" aria-label="Savings results">
				<div class="results-grid">
					<div class="result-block full">
						<p class="result-label">Total Estimated Savings</p>
						<p class="result-value hero">{fmt(result.totalSavings)}</p>
						<p class="result-sub">Over the life of your loan</p>
					</div>
					<div class="result-block">
						<p class="result-label">Year 1 Saving</p>
						<p class="result-value">{fmt(result.year1Saving)}</p>
					</div>
					<div class="result-block">
						<p class="result-label">Monthly Saving</p>
						<p class="result-value">{fmt(result.monthlySaving)}</p>
					</div>
				</div>

				<button
					class="breakdown-btn"
					aria-expanded={showBreakdown}
					aria-controls="breakdown"
					on:click={onBreakdownToggle}
				>
					View breakdown
					<svg
						width="12"
						height="12"
						viewBox="0 0 12 12"
						fill="none"
						style:transform={showBreakdown ? 'rotate(180deg)' : 'rotate(0)'}
						style:transition="transform 0.25s"
					>
						<path
							d="M2 4L6 8L10 4"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>

				{#if showBreakdown}
					<div id="breakdown" class="breakdown" role="region" aria-label="Detailed breakdown">
						<div class="brow">
							<span>Current rate (est.)</span><span>{fmtRate(result.currentRate)}</span>
						</div>
						<div class="brow">
							<span>Optimised rate (est.)</span><span>{fmtRate(result.optimisedRate)}</span>
						</div>
						<div class="brow">
							<span>Rate reduction</span><span>{fmtRate(result.rateDiff)}</span>
						</div>
						<div class="brow">
							<span>Current monthly repayment</span><span>{fmt(result.currentMonthly)}/mo</span>
						</div>
						<div class="brow">
							<span>Optimised monthly repayment</span><span>{fmt(result.optimisedMonthly)}/mo</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- CTA -->
		<button class="cta" aria-label="Find my exact savings" on:click={onCta}>
			Find my exact savings →
		</button>

		<!-- FOOTNOTE -->
		<p class="footnote">
			*Estimates are illustrative only. &nbsp;
			<button class="tc-link" on:click={() => dialogEl.showModal()}>
				Sample demo — see disclaimer
			</button>
		</p>
	</div>

	<!-- ══ EMBED SECTION ══ -->
	<div class="section-card">
		<button
			class="section-toggle"
			on:click={() => (showEmbedSection = !showEmbedSection)}
			aria-expanded={showEmbedSection}
		>
			<span class="arrow" class:open={showEmbedSection}>▶</span>
			🔗 &nbsp;Embed this calculator on your website
		</button>

		{#if showEmbedSection}
			<div class="section-body" role="region" aria-label="Embed instructions">
				<p class="section-desc">
					Paste the snippet below into any HTML page — Webflow, WordPress, Squarespace, or plain
					HTML. No dependencies, no scripts to install.
				</p>

				<div class="snippet-wrap">
					<pre class="snippet">{embedSnippet}</pre>
					<button class="copy-btn" on:click={copyEmbed} aria-label="Copy embed code">
						{copied ? '✅ Copied!' : '📋 Copy'}
					</button>
				</div>

				<p class="section-note">
					Need a custom version built for your brand? &nbsp;
					<a href={PORTFOLIO_URL} target="_blank" rel="noopener"> Reach out at denvie.online → </a>
				</p>
			</div>
		{/if}
	</div>

	<!-- ══ ANALYTICS LOG ══ -->
	<div class="section-card">
		<button class="section-toggle" on:click={() => (showLog = !showLog)}>
			<span class="arrow" class:open={showLog}>▶</span>
			🔍 &nbsp;GTM / GA4 Analytics Events (demo transparency)
		</button>

		{#if showLog}
			<div class="log-entries" bind:this={logEl}>
				{#if analyticsLog.length === 0}
					<p class="log-empty">Events will appear here as you interact with the calculator.</p>
				{:else}
					{#each analyticsLog as entry}
						<div class="log-entry">
							<span class="log-ts">{entry.timestamp}</span>
							<span class="log-ev">{entry.event}</span>
							<span class="log-payload">
								{JSON.stringify(
									Object.fromEntries(
										Object.entries(entry).filter(([k]) => k !== 'event' && k !== 'timestamp')
									)
								)}
							</span>
						</div>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	<!-- ══ PORTFOLIO BACKLINK ══ -->
	<footer class="backlink">
		<span>Built by</span>
		<a href={PORTFOLIO_URL} target="_blank" rel="noopener">
			<svg
				width="13"
				height="13"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
				<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
			</svg>
			Denver Duran · denvie.online
		</a>
	</footer>
</div>

<style>
	/* ── Reset & Page ── */
	.page {
		font-family: 'Sora', sans-serif;
		background: #0b1117;
		color: #e8f0f7;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48px 16px 80px;
	}

	/* ── Badge ── */
	.badge {
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		letter-spacing: 0.12em;
		color: #00c9a7;
		background: rgba(0, 201, 167, 0.12);
		border: 1px solid rgba(0, 201, 167, 0.2);
		border-radius: 100px;
		padding: 5px 14px;
		margin-bottom: 28px;
		text-transform: uppercase;
	}

	/* ── Header ── */
	.header {
		text-align: center;
		max-width: 520px;
		margin-bottom: 36px;
	}
	.header h1 {
		font-size: clamp(1.7rem, 5vw, 2.4rem);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: -0.02em;
	}
	.header h1 em {
		font-style: normal;
		color: #00c9a7;
	}
	.header p {
		margin-top: 10px;
		color: #7a9ab5;
		font-size: 0.95rem;
		line-height: 1.6;
	}

	/* ── Calculator Card ── */
	.card {
		width: 100%;
		max-width: 560px;
		background: #121b24;
		border: 1px solid rgba(0, 201, 167, 0.18);
		border-radius: 20px;
		padding: 36px 32px;
		box-shadow: 0 0 60px rgba(0, 201, 167, 0.06);
	}

	/* ── Fields ── */
	.field {
		margin-bottom: 24px;
	}
	.field label {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #7a9ab5;
		margin-bottom: 8px;
	}
	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}
	.prefix {
		position: absolute;
		left: 14px;
		font-family: 'DM Mono', monospace;
		font-size: 1rem;
		color: #00c9a7;
		pointer-events: none;
	}
	.suffix {
		position: absolute;
		right: 14px;
		font-family: 'DM Mono', monospace;
		font-size: 0.85rem;
		color: #7a9ab5;
		pointer-events: none;
	}
	.input-wrap input {
		width: 100%;
		background: #1a2635;
		border: 1.5px solid rgba(0, 201, 167, 0.18);
		border-radius: 12px;
		padding: 14px 14px 14px 34px;
		font-family: 'DM Mono', monospace;
		font-size: 1.05rem;
		color: #e8f0f7;
		outline: none;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
		-moz-appearance: textfield;
	}
	.input-wrap input::-webkit-outer-spin-button,
	.input-wrap input::-webkit-inner-spin-button {
		display: none;
	}
	#loan-term {
		padding-right: 48px;
	}
	.input-wrap input:focus {
		border-color: #00c9a7;
		box-shadow: 0 0 0 3px rgba(0, 201, 167, 0.15);
	}
	.input-wrap input.error {
		border-color: #ff6b6b;
	}
	.hint {
		margin-top: 6px;
		font-size: 0.75rem;
		color: #7a9ab5;
	}
	.err {
		margin-top: 6px;
		font-size: 0.75rem;
		color: #ff6b6b;
	}

	/* ── Slider ── */
	.slider {
		-webkit-appearance: none;
		width: 100%;
		height: 4px;
		background: #1a2635;
		border-radius: 4px;
		outline: none;
		cursor: pointer;
		margin-top: 10px;
	}
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #00c9a7;
		box-shadow: 0 0 0 4px rgba(0, 201, 167, 0.15);
		cursor: pointer;
		transition: box-shadow 0.2s;
	}
	.slider::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 7px rgba(0, 201, 167, 0.2);
	}
	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-family: 'DM Mono', monospace;
		font-size: 0.72rem;
		color: #7a9ab5;
		margin-top: 4px;
	}

	/* ── Divider ── */
	.divider {
		border: none;
		border-top: 1px solid rgba(0, 201, 167, 0.15);
		margin: 4px 0 24px;
	}

	/* ── Results ── */
	.results {
		background: #1a2635;
		border: 1px solid rgba(0, 201, 167, 0.18);
		border-radius: 14px;
		padding: 24px 20px;
		margin-bottom: 24px;
		animation: fadeUp 0.35s ease both;
	}
	@keyframes fadeUp {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	.results-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 16px;
	}
	.result-block {
		padding: 2px 0;
	}
	.result-block.full {
		grid-column: 1 / -1;
	}
	.result-label {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: #7a9ab5;
		margin-bottom: 4px;
	}
	.result-value {
		font-family: 'DM Mono', monospace;
		font-size: 1.5rem;
		font-weight: 500;
		color: #00c9a7;
		line-height: 1.1;
	}
	.result-value.hero {
		font-size: clamp(1.8rem, 6vw, 2.4rem);
		font-weight: 700;
		letter-spacing: -0.02em;
	}
	.result-sub {
		font-size: 0.75rem;
		color: #7a9ab5;
		margin-top: 3px;
	}

	/* ── Breakdown ── */
	.breakdown-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		background: none;
		border: none;
		color: #7a9ab5;
		font-family: 'Sora', sans-serif;
		font-size: 0.8rem;
		cursor: pointer;
		padding: 10px 0 0;
		transition: color 0.2s;
	}
	.breakdown-btn:hover {
		color: #00c9a7;
	}
	.breakdown {
		border-top: 1px solid rgba(0, 201, 167, 0.15);
		margin-top: 14px;
		padding-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		animation: fadeUp 0.25s ease both;
	}
	.brow {
		display: flex;
		justify-content: space-between;
		font-size: 0.82rem;
	}
	.brow span:first-child {
		color: #7a9ab5;
	}
	.brow span:last-child {
		font-family: 'DM Mono', monospace;
		color: #e8f0f7;
	}

	/* ── CTA ── */
	.cta {
		display: block;
		width: 100%;
		padding: 16px;
		background: #00c9a7;
		color: #0b1117;
		font-family: 'Sora', sans-serif;
		font-size: 1rem;
		font-weight: 700;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.15s,
			box-shadow 0.2s;
		box-shadow: 0 4px 24px rgba(0, 201, 167, 0.25);
	}
	.cta:hover {
		background: #00a98a;
		transform: translateY(-1px);
		box-shadow: 0 8px 32px rgba(0, 201, 167, 0.35);
	}
	.cta:active {
		transform: translateY(0);
	}

	/* ── Footnote ── */
	.footnote {
		margin-top: 14px;
		font-size: 0.72rem;
		color: #7a9ab5;
		text-align: center;
		line-height: 1.6;
	}
	.tc-link {
		background: none;
		border: none;
		color: #00c9a7;
		font-size: 0.72rem;
		font-family: 'Sora', sans-serif;
		cursor: pointer;
		text-decoration: underline;
		text-underline-offset: 2px;
		padding: 0;
	}
	.tc-link:hover {
		color: #00a98a;
	}

	/* ── T&C Dialog ── */
	.tc-dialog {
		background: #121b24;
		border: 1px solid rgba(0, 201, 167, 0.25);
		border-radius: 20px;
		padding: 0;
		max-width: 420px;
		width: calc(100% - 32px);
		color: #e8f0f7;
		font-family: 'Sora', sans-serif;
		box-shadow: 0 24px 80px rgba(0, 0, 0, 0.6);
	}
	.tc-dialog::backdrop {
		background: rgba(0, 0, 0, 0.75);
		backdrop-filter: blur(4px);
	}
	.tc-inner {
		padding: 36px 32px 28px;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 12px;
	}
	.tc-icon {
		font-size: 2.4rem;
	}
	.tc-inner h2 {
		font-size: 1.2rem;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.tc-inner p {
		font-size: 0.88rem;
		color: #7a9ab5;
		line-height: 1.65;
	}
	.tc-inner p strong {
		color: #e8f0f7;
	}
	.tc-inner a {
		color: #00c9a7;
		text-decoration: none;
	}
	.tc-inner a:hover {
		text-decoration: underline;
	}
	.tc-actions {
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: 100%;
		margin-top: 8px;
	}
	.tc-btn-primary {
		display: block;
		width: 100%;
		padding: 13px;
		background: #00c9a7;
		color: #0b1117;
		font-family: 'Sora', sans-serif;
		font-size: 0.9rem;
		font-weight: 700;
		border: none;
		border-radius: 10px;
		cursor: pointer;
		text-decoration: none;
		transition: background 0.2s;
		text-align: center;
	}
	.tc-btn-primary:hover {
		background: #00a98a;
	}
	.tc-btn-ghost {
		background: none;
		border: 1px solid rgba(0, 201, 167, 0.2);
		color: #7a9ab5;
		font-family: 'Sora', sans-serif;
		font-size: 0.85rem;
		padding: 11px;
		border-radius: 10px;
		cursor: pointer;
		transition:
			border-color 0.2s,
			color 0.2s;
	}
	.tc-btn-ghost:hover {
		border-color: rgba(0, 201, 167, 0.5);
		color: #e8f0f7;
	}

	/* ── Shared Section Card (Embed + Log) ── */
	.section-card {
		width: 100%;
		max-width: 560px;
		margin-top: 16px;
	}
	.section-toggle {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		font-family: 'DM Mono', monospace;
		font-size: 0.78rem;
		color: #7a9ab5;
		background: #121b24;
		border: 1px solid rgba(0, 201, 167, 0.18);
		border-radius: 10px;
		padding: 11px 14px;
		cursor: pointer;
		text-align: left;
		transition:
			color 0.2s,
			border-color 0.2s;
	}
	.section-toggle:hover {
		color: #00c9a7;
		border-color: rgba(0, 201, 167, 0.35);
	}
	.arrow {
		font-size: 0.6rem;
		color: #00c9a7;
		transition: transform 0.2s;
		display: inline-block;
	}
	.arrow.open {
		transform: rotate(90deg);
	}

	/* ── Embed Body ── */
	.section-body {
		background: #121b24;
		border: 1px solid rgba(0, 201, 167, 0.18);
		border-top: none;
		border-radius: 0 0 10px 10px;
		padding: 20px 16px;
		animation: fadeUp 0.2s ease both;
	}
	.section-desc {
		font-size: 0.82rem;
		color: #7a9ab5;
		line-height: 1.6;
		margin-bottom: 14px;
	}
	.snippet-wrap {
		position: relative;
	}
	.snippet {
		background: #0b1117;
		border: 1px solid rgba(0, 201, 167, 0.12);
		border-radius: 10px;
		padding: 14px 80px 14px 16px;
		font-family: 'DM Mono', monospace;
		font-size: 0.7rem;
		color: #7a9ab5;
		white-space: pre-wrap;
		word-break: break-all;
		line-height: 1.7;
	}
	.copy-btn {
		position: absolute;
		top: 10px;
		right: 10px;
		background: rgba(0, 201, 167, 0.12);
		border: 1px solid rgba(0, 201, 167, 0.25);
		color: #00c9a7;
		font-family: 'DM Mono', monospace;
		font-size: 0.72rem;
		padding: 5px 10px;
		border-radius: 6px;
		cursor: pointer;
		transition: background 0.2s;
		white-space: nowrap;
	}
	.copy-btn:hover {
		background: rgba(0, 201, 167, 0.22);
	}
	.section-note {
		margin-top: 12px;
		font-size: 0.78rem;
		color: #7a9ab5;
	}
	.section-note a {
		color: #00c9a7;
		text-decoration: none;
	}
	.section-note a:hover {
		text-decoration: underline;
	}

	/* ── Analytics Log entries ── */
	.log-entries {
		background: #121b24;
		border: 1px solid rgba(0, 201, 167, 0.18);
		border-top: none;
		border-radius: 0 0 10px 10px;
		padding: 12px;
		max-height: 220px;
		overflow-y: auto;
		font-family: 'DM Mono', monospace;
		font-size: 0.73rem;
		line-height: 1.8;
	}
	.log-empty {
		color: #7a9ab5;
		font-style: italic;
	}
	.log-entry {
		color: #7a9ab5;
	}
	.log-ts {
		color: #00c9a7;
		margin-right: 8px;
	}
	.log-ev {
		color: #e8f0f7;
		margin-right: 6px;
	}
	.log-payload {
		opacity: 0.7;
	}

	/* ── Portfolio Backlink ── */
	.backlink {
		margin-top: 40px;
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 0.78rem;
		color: #7a9ab5;
		font-family: 'DM Mono', monospace;
	}
	.backlink a {
		display: flex;
		align-items: center;
		gap: 5px;
		color: #00c9a7;
		text-decoration: none;
		transition: color 0.2s;
	}
	.backlink a:hover {
		color: #00a98a;
	}

	/* ── Mobile ── */
	@media (max-width: 400px) {
		.card {
			padding: 24px 16px;
		}
		.results-grid {
			grid-template-columns: 1fr;
		}
		.result-block.full {
			grid-column: 1;
		}
		.tc-inner {
			padding: 28px 20px 22px;
		}
	}
</style>
