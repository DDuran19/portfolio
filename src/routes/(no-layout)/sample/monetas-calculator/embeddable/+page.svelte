<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// ─────────────────────────────────────────────
	// CALCULATION ENGINE
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
	// ANALYTICS (GTM / GA4 only, UI removed)
	// ─────────────────────────────────────────────
	function fireEvent(eventName: string, payload: Record<string, unknown> = {}) {
		if (typeof window !== 'undefined') {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).dataLayer = (window as any).dataLayer || [];
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(window as any).dataLayer.push({ event: eventName, ...payload });
		}
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
	let loanRaw = $state('500,000');
	let termValue = $state(25);
	let result: CalcResult | null = $state(calculate(500000, 25));

	let loanError = $state('');
	let termError = $state('');
	let showBreakdown = $state(false);
	let hasInteracted = false;
	let ctaClicked = false;
	let visibilityFired = false;
	let isIframe = $state(true);

	let calcDebounce: ReturnType<typeof setTimeout> | null = null;
	let abandonTimer: ReturnType<typeof setTimeout> | null = null;
	let observer: IntersectionObserver | null = null;
	let cardEl: HTMLElement | undefined = $state();

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
		// Handle your CTA action here (e.g., window.parent.postMessage(...) or redirect)
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
		// Enforce Iframe only. If window === top, it's NOT an iframe.
		if (window.self === window.top) {
			isIframe = false;
		}

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
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link
		href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=DM+Sans:wght@400;500;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

{#if isIframe}
	<div class="iframe-container">
		<div class="card" bind:this={cardEl}>
			<div class="field">
				<label for="loan-amount">Loan Value</label>
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
						oninput={onLoanInput}
					/>
				</div>
				<p class="hint" id="loan-hint">Min $100k · Max $5M</p>
				{#if loanError}
					<p class="err" id="loan-err" role="alert">{loanError}</p>
				{/if}
			</div>

			<div class="field">
				<label for="loan-term">Loan Term (year)</label>
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
						oninput={onTermInput}
					/>
					<span class="suffix">yrs</span>
				</div>
				<input
					type="range"
					min="1"
					max="30"
					aria-label="Loan term slider"
					bind:value={termValue}
					oninput={onTermInput}
					class="slider"
				/>
				<div class="slider-labels"><span>1 yr</span><span>30 yrs</span></div>
				{#if termError}
					<p class="err" id="term-err" role="alert">{termError}</p>
				{/if}
			</div>

			<hr class="divider" />

			{#if result}
				<div class="results" aria-live="polite" aria-label="Savings results">
					<div class="results-grid">
						<div class="result-block full">
							<p class="result-label">Total Savings Est.</p>
							<p class="result-value hero">{fmt(result.totalSavings)}</p>
						</div>
						<div class="result-block">
							<p class="result-label">1st Year Savings Est.</p>
							<p class="result-value">{fmt(result.year1Saving)}</p>
						</div>
						<div class="result-block">
							<p class="result-label">Monthly Savings</p>
							<p class="result-value">{fmt(result.monthlySaving)}</p>
						</div>
					</div>

					<button
						class="breakdown-btn"
						aria-expanded={showBreakdown}
						aria-controls="breakdown"
						onclick={onBreakdownToggle}
					>
						View breakdown
						<svg
							width="10"
							height="10"
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
								<span>Current repayment</span><span>{fmt(result.currentMonthly)}/mo</span>
							</div>
							<div class="brow">
								<span>Optimised repayment</span><span>{fmt(result.optimisedMonthly)}/mo</span>
							</div>
						</div>
					{/if}
				</div>
			{/if}

			<button class="cta" aria-label="Find my exact savings" onclick={onCta}>
				Find my exact savings >
			</button>
		</div>
	</div>
{:else}
	<div
		style="font-family: 'DM Sans', sans-serif; color: #111827; text-align: center; padding: 2rem;"
	>
		This widget is designed to be embedded via iframe.
	</div>
{/if}

<style>
	/* ── Global Reset to prevent iframe borders/scrollbars ── */
	:global(body, html) {
		margin: 0;
		padding: 0;
		background: transparent;
		overflow-x: hidden;
	}

	/* ── Iframe Container ── */
	.iframe-container {
		font-family: 'DM Sans', sans-serif;
		color: #111827; /* Dark text */
		width: 100%;
		display: flex;
		justify-content: center;
		padding: 12px;
		box-sizing: border-box;
	}

	/* ── Calculator Card (Light Theme) ── */
	.card {
		width: 100%;
		max-width: 420px;
		background: #e8f0ee; /* Light sage/mint background from image */
		border-radius: 16px;
		padding: 32px 24px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); /* Very soft shadow */
		box-sizing: border-box;
	}

	/* ── Fields ── */
	.field {
		margin-bottom: 20px;
		text-align: center; /* Center aligning to match the image style */
	}
	.field label {
		display: block;
		font-size: 0.95rem;
		font-weight: 600;
		color: #111827;
		margin-bottom: 8px;
	}
	.input-wrap {
		position: relative;
		display: flex;
		align-items: center;
	}
	.prefix {
		position: absolute;
		left: 12px;
		font-size: 0.95rem;
		color: #4b5563; /* Medium grey */
		pointer-events: none;
	}
	.suffix {
		position: absolute;
		right: 12px;
		font-size: 0.8rem;
		color: #4b5563;
		pointer-events: none;
	}
	.input-wrap input {
		width: 100%;
		box-sizing: border-box;
		background: #ffffff; /* White input */
		border: 1px solid #d1d5db; /* Light grey border */
		border-radius: 10px;
		padding: 10px 12px 10px 28px;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.95rem;
		color: #111827;
		text-align: center; /* Centered input text */
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
		padding-right: 36px;
		padding-left: 12px;
	}
	.input-wrap input:focus {
		border-color: #fa825c; /* Coral focus */
		box-shadow: 0 0 0 3px rgba(250, 130, 92, 0.15);
	}
	.input-wrap input.error {
		border-color: #ef4444;
	}
	.hint {
		margin-top: 6px;
		font-size: 0.75rem;
		color: #6b7280;
	}
	.err {
		margin-top: 6px;
		font-size: 0.75rem;
		color: #ef4444;
	}

	/* ── Slider ── */
	.slider {
		-webkit-appearance: none;
		width: 100%;
		height: 4px;
		background: #d1d5db; /* Light grey track */
		border-radius: 4px;
		outline: none;
		cursor: pointer;
		margin-top: 12px;
	}
	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 50%;
		background: #fa825c; /* Coral thumb */
		box-shadow: 0 0 0 3px rgba(250, 130, 92, 0.15);
		cursor: pointer;
		transition: box-shadow 0.2s;
	}
	.slider::-webkit-slider-thumb:hover {
		box-shadow: 0 0 0 6px rgba(250, 130, 92, 0.25);
	}
	.slider-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: #6b7280;
		margin-top: 6px;
	}

	/* ── Divider ── */
	.divider {
		border: none;
		border-top: 1px solid #d1d5db;
		margin: 12px 0 20px;
	}

	/* ── Results ── */
	.results {
		background: #ffffff;
		border: 1px solid #e5e7eb;
		border-radius: 12px;
		padding: 20px;
		margin-bottom: 24px;
		animation: fadeUp 0.35s ease both;
		text-align: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
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
		padding: 0;
	}
	.result-block.full {
		grid-column: 1 / -1;
		margin-bottom: 8px;
	}
	.result-label {
		font-size: 0.9rem;
		font-weight: 700;
		color: #111827;
		margin-bottom: 4px;
	}
	.result-value {
		font-family: 'DM Sans', sans-serif;
		font-size: 1.25rem;
		font-weight: 700;
		color: #fa825c; /* Coral Text */
		line-height: 1.2;
	}
	.result-value.hero {
		font-size: 1.8rem;
		letter-spacing: -0.02em;
	}

	/* ── Breakdown ── */
	.breakdown-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		gap: 6px;
		background: none;
		border: none;
		color: #6b7280;
		font-family: 'DM Sans', sans-serif;
		font-size: 0.8rem;
		cursor: pointer;
		padding: 16px 0 0;
		transition: color 0.2s;
	}
	.breakdown-btn:hover {
		color: #fa825c;
	}
	.breakdown {
		border-top: 1px solid #e5e7eb;
		margin-top: 12px;
		padding-top: 12px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		animation: fadeUp 0.25s ease both;
	}
	.brow {
		display: flex;
		justify-content: space-between;
		font-size: 0.8rem;
	}
	.brow span:first-child {
		color: #4b5563;
	}
	.brow span:last-child {
		font-weight: 600;
		color: #111827;
	}

	/* ── CTA ── */
	.cta {
		display: block;
		box-sizing: border-box;
		width: 100%;
		padding: 16px;
		background: #cbf954; /* Lime green */
		color: #111827;
		font-family: 'DM Sans', sans-serif;
		font-size: 1.05rem;
		font-weight: 500;
		border: none;
		border-radius: 30px; /* Pill shape matching image */
		cursor: pointer;
		transition:
			background 0.2s,
			transform 0.1s;
	}
	.cta:hover {
		background: #bdec40;
		transform: scale(1.02);
	}
	.cta:active {
		transform: scale(0.98);
	}
</style>
