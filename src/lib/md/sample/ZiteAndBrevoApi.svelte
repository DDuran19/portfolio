<script lang="ts">
	import { run } from 'svelte/legacy';

	import { theme } from '$lib/stores/theme';
	import { tick } from 'svelte';
	import { browser } from '$app/environment';

	// ─── Types ───────────────────────────────────────────────────────────────────
	type PaymentMethod = 'gcash' | 'billplz' | 'cod';
	type LogType = 'ok' | 'err' | '';
	interface LogEntry {
		time: string;
		fn: string;
		msg: string;
		type: LogType;
	}
	interface ZiteRecord {
		id: string;
		customer: string;
		total: string;
		paymentMethod: string;
		billplzId: string | null;
		status: 'pending' | 'paid';
		isNew?: boolean;
		isUpdated?: boolean;
	}
	interface BrevoContact {
		name: string;
		email: string;
		phone: string;
	}
	interface BrevoEmail {
		subject: string;
		to: string;
		params: Record<string, string>;
	}

	const FLOW_STEPS = [
		'Fill order',
		'Submit',
		'Server route',
		'Brevo contact',
		'Zite insert',
		'Payment',
		'Zite update',
		'Email sent'
	];

	const paymentMethods = [
		{ label: 'GCash', value: 'gcash' },
		{ label: 'BillPlz', value: 'billplz' },
		{ label: 'Cash On Delivery', value: 'cod' }
	] as const;

	// ─── State ───────────────────────────────────────────────────────────────────
	let name = $state('Ana Reyes');
	let email = $state('ana@example.com');
	let phone = $state('+63 917 123 4567');
	let address = $state('42 Katipunan Ave, QC');
	let deliveryType: 'standard' | 'express' | 'pickup' = $state('standard');
	let paymentMethod: PaymentMethod = $state('gcash');
	let freePack = $state(false);
	let isGift = $state(false); // Add this
	let recipientName = $state('John Doe'); // Add this
	let recipientPhone = $state('+63 917 999 0000'); // Add this

	let flowStep = $state(0);
	let running = $state(false);
	let phase: 'idle' | 'submitted' | 'paid' = $state('idle');

	let serverLogs: LogEntry[] = $state([]);
	let brevoApiLogs: LogEntry[] = $state([]);
	let ziteApiLogs: LogEntry[] = $state([]);
	let activePayload: object | null = $state(null);
	let activePanel: 'server' | 'brevo' | 'zite' | null = $state(null);

	let brevoContacts: BrevoContact[] = $state([]);
	let brevoEmails: BrevoEmail[] = $state([]);
	let ziteRecords: ZiteRecord[] = $state([]);

	let recordId = '';
	let paymentId = '';

	// ─── Helpers ─────────────────────────────────────────────────────────────────

	/** Called at push-time so the timestamp is always a real string, never undefined */
	function fmtTime(): string {
		const time = new Date().toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
		return time;
	}

	const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

	const randId = (prefix: string) => prefix + Math.random().toString(36).slice(2, 10).toUpperCase();

	function addLog(
		target: 'server' | 'brevo' | 'zite',
		fn: string,
		msg: string,
		type: LogType = ''
	) {
		const entry: LogEntry = { time: fmtTime(), fn, msg, type };
		if (target === 'server') serverLogs = [...serverLogs, entry];
		else if (target === 'brevo') brevoApiLogs = [...brevoApiLogs, entry];
		else ziteApiLogs = [...ziteApiLogs, entry];
	}

	// ─── Flow ────────────────────────────────────────────────────────────────────
	async function startFlow() {
		if (running || phase !== 'idle') return;
		running = true;
		flowStep = 1;
		await sleep(300);

		flowStep = 2;
		await sleep(350);

		// Step 3: Server receives
		flowStep = 3;
		activePanel = 'server';
		addLog('server', 'POST /api/order', 'Request received — validating body');
		activePayload = {
			customer: { name, email, phone },
			...(isGift ? { recipient: { name: recipientName, phone: recipientPhone } } : {}),
			order: {
				orderItems,
				subtotal,
				deliveryFee,
				total,
				deliveryAddress: address,
				deliveryType,
				paymentMethod
			}
		};
		await sleep(700);
		addLog(
			'server',
			'validateOrder()',
			`Items: ${orderItems.length}, total: ₱${total.toFixed(2)} ✓`,
			'ok'
		);
		await sleep(400);

		// Step 4: Brevo contact upsert
		flowStep = 4;
		activePanel = 'brevo';
		addLog('server', 'brevo.createContact()', 'Calling POST /v3/contacts');
		activePayload = {
			email,
			updateEnabled: true,
			attributes: { FIRSTNAME: name.split(' ')[0], PHONE: phone }
		};
		addLog(
			'brevo',
			'POST /v3/contacts',
			`→ { email: "${email}", attributes: { FIRSTNAME, PHONE } }`
		);
		await sleep(900);
		addLog('brevo', '← 201 Created', 'contact_id: 38291', 'ok');
		brevoContacts = [...brevoContacts, { name, email, phone }];
		await sleep(400);

		// Step 5: Zite insert
		flowStep = 5;
		activePanel = 'zite';
		recordId = randId('rec_');
		activePayload = {
			customer_name: name,
			customer_email: email,
			customer_phone: phone,
			...(isGift ? { recipient_name: recipientName, recipient_phone: recipientPhone } : {}),
			items: orderItems.map((i) => `${i.name} x${i.qty}`).join(', '),
			...(freePack ? { free_pack_qty: 1 } : {}),
			subtotal,
			delivery_fee: deliveryFee,
			total,
			delivery_address: address,
			delivery_type: deliveryType,
			payment_method: paymentMethod,
			order_date: new Date().toISOString(),
			status: 'pending',
			billplz_payment_id: null
		};
		addLog('server', 'zite.insertOrder()', 'Calling POST /{dbId}/{tableId}/records');
		addLog('zite', 'POST /v1/{dbId}/{tableId}/records', '→ Creating order record…');
		await sleep(1000);
		addLog('zite', '← 201 Created', `record_id: ${recordId}`, 'ok');
		ziteRecords = [
			...ziteRecords,
			{
				id: recordId.slice(0, 12),
				customer: name,
				total: total.toFixed(2),
				paymentMethod,
				billplzId: null,
				status: 'pending',
				isNew: true
			}
		];
		await sleep(500);
		ziteRecords = ziteRecords.map((r) => ({ ...r, isNew: false }));

		addLog('server', 'redirect()', `→ /thank-you/${paymentMethod}`, 'ok');
		activePanel = null;
		activePayload = null;
		phase = 'submitted';
		running = false;
	}

	async function simulatePayment() {
		if (running || phase !== 'submitted') return;
		running = true;
		flowStep = 6;
		await sleep(500);

		// Step 7: Zite PATCH
		flowStep = 7;
		paymentId = paymentMethod === 'cod' ? 'COD-' + randId('') : 'BP-' + randId('');
		activePanel = 'server';
		if (paymentMethod === 'cod') {
			addLog('server', 'adminUpdate()', 'Manual COD delivery confirmation received');
			activePayload = { payment_id: paymentId, status: 'paid', paid: true, amount: total };
		} else {
			addLog('server', 'billplzWebhook()', 'Payment callback received');
			addLog('server', 'verifySignature()', 'HMAC verified ✓', 'ok');
			activePayload = { payment_id: paymentId, status: 'paid', paid: true, amount: total * 100 };
		}
		await sleep(600);

		activePanel = 'zite';
		addLog('server', 'zite.updateOrder()', `Calling PATCH /{dbId}/{tableId}/records/${recordId}`);
		activePayload = { billplz_payment_id: paymentId, status: 'paid' };
		addLog(
			'zite',
			`PATCH /v1/{dbId}/{tableId}/records/${recordId}`,
			'→ { billplz_payment_id, status: "paid" }'
		);
		await sleep(900);
		addLog('zite', '← 200 OK', 'Record updated successfully', 'ok');
		ziteRecords = ziteRecords.map((r) =>
			r.id === recordId.slice(0, 12)
				? { ...r, billplzId: paymentId, status: 'paid', isUpdated: true }
				: r
		);
		await sleep(500);
		ziteRecords = ziteRecords.map((r) => ({ ...r, isUpdated: false }));

		// Step 8: Email
		flowStep = 8;
		activePanel = 'brevo';
		addLog('server', 'brevo.sendTransactional()', 'Calling POST /v3/smtp/email');
		const emailParams: Record<string, string> = {
			customerName: name,
			items: orderItems.map((i) => `${i.name} x${i.qty}`).join(', '),
			...(freePack ? { freePack: '1x sample pack' } : {}),
			subtotal: '₱' + subtotal.toFixed(2),
			deliveryFee: '₱' + deliveryFee.toFixed(2),
			total: '₱' + total.toFixed(2),
			deliveryAddress: address,
			deliveryType,
			paymentId,
			paymentMethod
		};
		activePayload = {
			sender: { name: 'Store', email: 'hello@store.com' },
			to: [{ email, name }],
			templateId: 42,
			params: emailParams
		};
		addLog(
			'brevo',
			'POST /v3/smtp/email',
			`→ { templateId: 42, to: [{ email: "${email}" }], params: {...} }`
		);
		await sleep(900);
		addLog('brevo', '← 201 Sent', `messageId: <${paymentId}@mail.brevo.com>`, 'ok');
		brevoEmails = [
			...brevoEmails,
			{ subject: `Order confirmation — ${paymentId}`, to: email, params: emailParams }
		];

		activePanel = null;
		activePayload = null;
		phase = 'paid';
		running = false;
	}

	function reset() {
		name = 'Ana Reyes';
		email = 'ana@example.com';
		phone = '+63 917 123 4567';
		address = '42 Katipunan Ave, QC';
		deliveryType = 'standard';
		paymentMethod = 'gcash';
		freePack = false;
		flowStep = 0;
		running = false;
		phase = 'idle';
		serverLogs = [];
		brevoApiLogs = [];
		ziteApiLogs = [];
		activePayload = null;
		activePanel = null;
		brevoContacts = [];
		brevoEmails = [];
		ziteRecords = [];
		recordId = '';
		paymentId = '';
	}

	// 2. The function no longer requires arguments
	async function doScroll() {
		if (!browser) return;
		await tick();
		const activeEl = document.querySelector('.zb-panel-active');

		if (activeEl) {
			activeEl.scrollIntoView({
				behavior: 'smooth',
				block: 'center'
			});
		}
	}
	// ─── Derived ─────────────────────────────────────────────────────────────────

	// orderItems must NOT reference subtotal (circular). subtotal is derived FROM orderItems.
	let orderItems = $derived([
		{ name: 'Green Tea Matcha', qty: 2, price: 140 },
		{ name: 'Jasmine Mist', qty: 1, price: 190 },
		...(freePack ? [{ name: 'Free sample pack', qty: 1, price: 0 }] : [])
	]);

	let subtotal = $derived(orderItems.reduce((sum, i) => sum + i.price * i.qty, 0));

	// Cast deliveryType to string to avoid the TS overlap error on literal comparisons
	let deliveryFee = $derived(
		(deliveryType as string) === 'express' ? 120 : (deliveryType as string) === 'pickup' ? 0 : 80
	);

	let total = $derived(subtotal + deliveryFee);
	// ─── Auto-Scroll Logic ───────────────────────────────────────────────────────
	// 1. Svelte tracks the variables here inside the reactive block
	run(() => {
		if (activePanel !== undefined || phase !== undefined) {
			doScroll();
		}
	});
</script>

<div class="zb-preface">
	<h3>Interactive Architecture Demo</h3>
	<p>
		This prototype demonstrates the server-side integration flow for <strong
			>Brevo (Transactional Emails)</strong
		>
		and <strong>Zite DB (Order Management)</strong>. Adjust the details below, select a payment
		method, and click "Place order" to watch the secure backend processes, database insertions, and
		webhook updates occur in real-time.
	</p>
</div>
<!-- ─── Template ──────────────────────────────────────────────────────────────── -->
<div class="zb-root" class:zb-dark={$theme}>
	<!-- Header -->
	<div class="zb-header">
		<span class="zb-title">Brevo + Zite DB — integration flow</span>
		<button class="zb-reset" onclick={reset}>↺ Reset</button>
	</div>

	<!-- Flow steps -->
	<div class="zb-flow">
		{#each FLOW_STEPS as label, i}
			<div
				class="zb-step"
				class:zb-step-active={flowStep === i + 1}
				class:zb-step-done={flowStep > i + 1}
			>
				<span class="zb-step-num">{i + 1}</span>{label}
			</div>
			{#if i < FLOW_STEPS.length - 1}
				<span class="zb-arrow">→</span>
			{/if}
		{/each}
	</div>

	<!-- Row 1: Consumer + Server -->
	<div class="zb-grid zb-mb">
		<!-- Customer screen -->
		<div class="zb-panel" class:zb-panel-active={activePanel === null && phase === 'idle'}>
			<div class="zb-panel-title">
				Customer screen <span class="zb-badge zb-badge-blue">Front-end</span>
			</div>
			<div class="zb-form-grid">
				<label class="zb-field">
					<span>Full name</span>
					<input bind:value={name} disabled={phase !== 'idle'} />
				</label>
				<label class="zb-field">
					<span>Email</span>
					<input bind:value={email} disabled={phase !== 'idle'} />
				</label>
				<label class="zb-field">
					<span>Phone</span>
					<input bind:value={phone} disabled={phase !== 'idle'} />
				</label>
				<label class="zb-field">
					<span>Delivery type</span>
					<select bind:value={deliveryType} disabled={phase !== 'idle'}>
						<option value="standard">Standard (+₱80)</option>
						<option value="express">Express (+₱120)</option>
						<option value="pickup">Pickup (free)</option>
					</select>
				</label>
				<label class="zb-field zb-span2">
					<span>Delivery address</span>
					<input bind:value={address} disabled={phase !== 'idle'} />
				</label>
			</div>

			<div class="zb-items">
				{#each orderItems as item}
					<div class="zb-item" class:zb-item-free={item.price === 0}>
						<span>{item.name} ×{item.qty}</span>
						<span>{item.price === 0 ? 'FREE' : '₱' + (item.price * item.qty).toFixed(2)}</span>
					</div>
				{/each}
			</div>

			<label class="zb-freepack">
				<input type="checkbox" bind:checked={freePack} disabled={phase !== 'idle'} />
				Include free sample pack?
			</label>
			<label class="zb-freepack">
				<input type="checkbox" bind:checked={isGift} disabled={phase !== 'idle'} />
				Ordering for a friend?
			</label>

			{#if isGift}
				<div
					class="zb-form-grid zb-mb-sm"
					style="padding: 10px; border: 1px dashed var(--border-em); border-radius: 8px;"
				>
					<label class="zb-field">
						<span>Recipient Name</span>
						<input bind:value={recipientName} disabled={phase !== 'idle'} />
					</label>
					<label class="zb-field">
						<span>Recipient Phone</span>
						<input bind:value={recipientPhone} disabled={phase !== 'idle'} />
					</label>
				</div>
			{/if}
			<div class="zb-totals">
				<div class="zb-total-row"><span>Subtotal</span><span>₱{subtotal.toFixed(2)}</span></div>
				<div class="zb-total-row"><span>Delivery</span><span>₱{deliveryFee.toFixed(2)}</span></div>
				<div class="zb-total-row zb-total-grand">
					<span>Total</span><span>₱{total.toFixed(2)}</span>
				</div>
			</div>

			<p class="zb-field-label">Payment method</p>
			<div class="zb-pm-row">
				{#each paymentMethods as { label, value }}
					<button
						type="button"
						class="zb-pm"
						class:zb-pm-active={paymentMethod === value}
						disabled={phase !== 'idle'}
						onclick={() => (paymentMethod = value)}
					>
						{label}
					</button>
				{/each}
			</div>

			{#if phase === 'idle'}
				<button class="zb-action" disabled={running} onclick={startFlow}>
					{running ? 'Processing…' : 'Place order →'}
				</button>
			{:else if phase === 'submitted'}
				<button class="zb-action zb-action-pay" disabled={running} onclick={simulatePayment}>
					{running
						? 'Processing...'
						: paymentMethod === 'cod'
							? 'Simulate Delivery & Pay (Admin) ↗'
							: 'Simulate Webhook Payment ↗'}
				</button>
			{:else}
				<button class="zb-action zb-action-done" disabled>✓ Order complete</button>
			{/if}
		</div>

		<!-- Server log -->
		<div class="zb-panel" class:zb-panel-active={activePanel === 'server'}>
			<div class="zb-panel-title">
				SvelteKit server route <span class="zb-badge zb-badge-muted">+server.ts</span>
			</div>
			<div class="zb-log">
				{#if serverLogs.length === 0}
					<p class="zb-empty">Waiting for form submission…</p>
				{:else}
					{#each serverLogs as e}
						<div class="zb-log-row">
							<span class="zb-log-time">{e.time}</span>
							<span class="zb-log-fn">{e.fn}</span>
							<span class="zb-log-msg" class:zb-ok={e.type === 'ok'} class:zb-err={e.type === 'err'}
								>{e.msg}</span
							>
						</div>
					{/each}
				{/if}
			</div>
			{#if activePayload}
				<p class="zb-payload-label">Active payload</p>
				<pre class="zb-payload">{JSON.stringify(activePayload, null, 2)}</pre>
			{/if}
		</div>
	</div>

	<!-- Row 2: API logs -->
	<div class="zb-grid zb-mb">
		<div class="zb-panel" class:zb-panel-active={activePanel === 'brevo'}>
			<div class="zb-panel-title">
				Brevo API calls <span class="zb-badge zb-badge-blue">api.brevo.com</span>
			</div>
			<div class="zb-log">
				{#if brevoApiLogs.length === 0}
					<p class="zb-empty">No API calls yet…</p>
				{:else}
					{#each brevoApiLogs as e}
						<div class="zb-log-row">
							<span class="zb-log-time">{e.time}</span>
							<span class="zb-log-fn">{e.fn}</span>
							<span class="zb-log-msg" class:zb-ok={e.type === 'ok'} class:zb-err={e.type === 'err'}
								>{e.msg}</span
							>
						</div>
					{/each}
				{/if}
			</div>
		</div>

		<div class="zb-panel" class:zb-panel-active={activePanel === 'zite'}>
			<div class="zb-panel-title">
				Zite DB API calls <span class="zb-badge zb-badge-muted">api.fillout.com</span>
			</div>
			<div class="zb-log">
				{#if ziteApiLogs.length === 0}
					<p class="zb-empty">No API calls yet…</p>
				{:else}
					{#each ziteApiLogs as e}
						<div class="zb-log-row">
							<span class="zb-log-time">{e.time}</span>
							<span class="zb-log-fn">{e.fn}</span>
							<span class="zb-log-msg" class:zb-ok={e.type === 'ok'} class:zb-err={e.type === 'err'}
								>{e.msg}</span
							>
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>

	<!-- Row 3: Memory screens -->
	<div class="zb-grid zb-mb">
		<!-- Brevo memory -->
		<div class="zb-panel">
			<div class="zb-panel-title">Brevo</div>
			<p class="zb-mem-title">Contacts</p>
			{#if brevoContacts.length === 0}
				<p class="zb-empty zb-mb-sm">No contacts yet…</p>
			{:else}
				{#each brevoContacts as c}
					{@const nameParts = c.name.split(' ')}
					{@const firstName = nameParts.length ? nameParts[0] : ''}
					{@const attr = JSON.stringify({
						FIRSTNAME: firstName,
						PHONE: c.phone
					})}
					<div class="zb-card zb-mb-sm">
						<p class="zb-card-name">{c.name}</p>
						<p class="zb-card-meta">{c.email} · {c.phone}</p>
						<pre class="zb-mini-pre">ATTRIBUTES: {attr}</pre>
					</div>
				{/each}
			{/if}
			<p class="zb-mem-title zb-mt-sm">Transactional emails sent</p>
			{#if brevoEmails.length === 0}
				<p class="zb-empty">No emails sent yet…</p>
			{:else}
				{#each brevoEmails as e}
					<div class="zb-card zb-mb-sm">
						<p class="zb-card-name">{e.subject}</p>
						<p class="zb-card-meta">
							to: {e.to} · templateId: 42 · <span class="zb-ok">sent ✓</span>
						</p>
						<pre class="zb-mini-pre">{JSON.stringify(e.params, null, 2)}</pre>
					</div>
				{/each}
			{/if}
		</div>

		<!-- Zite DB memory -->
		<div class="zb-panel">
			<div class="zb-panel-title">
				Zite DB <span class="zb-badge zb-badge-muted">orders table</span>
			</div>
			{#if ziteRecords.length === 0}
				<p class="zb-empty">No records yet…</p>
			{:else}
				<div class="zb-table-wrap">
					<table class="zb-table">
						<thead>
							<tr>
								<th>record_id</th><th>customer_name</th><th>total</th>
								<th>payment_method</th><th>billplz_id</th><th>status</th>
							</tr>
						</thead>
						<tbody>
							{#each ziteRecords as r (r.id)}
								<tr class:zb-row-new={r.isNew} class:zb-row-updated={r.isUpdated}>
									<td>{r.id}</td><td>{r.customer}</td><td>₱{r.total}</td>
									<td>{r.paymentMethod}</td><td>{r.billplzId ?? '—'}</td>
									<td>
										<span
											class="zb-chip"
											class:zb-chip-pending={r.status === 'pending'}
											class:zb-chip-paid={r.status === 'paid'}
										>
											{r.status}
										</span>
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</div>

	<p class="zb-footer">
		Delays are simulated. All real API calls happen server-side in <code>+server.ts</code> — no secrets
		exposed to the browser.
	</p>
</div>

<!-- ─── Styles ────────────────────────────────────────────────────────────────── -->
<style>
	/*
	 * All colors reference your portfolio's CSS custom properties set by
	 * data-theme="light" / data-theme="dark" on :root via theme.ts.
	 * No hardcoded hex values — everything adapts automatically.
	 */

	/* ── Scoped theme tokens (map to your portfolio vars) ───────────────────── */
	.zb-root {
		/* light defaults — mirrors your parchment palette */
		--bg: var(--app-bg, #f6f4ef);
		--surface: var(--app-surface, #ffffff);
		--surface-2: var(--app-surface-2, #f0ede8);
		--border: var(--app-border, rgba(0, 0, 0, 0.1));
		--border-em: var(--app-border-em, rgba(0, 0, 0, 0.22));
		--text-1: var(--app-text, #1a1a18);
		--text-2: var(--app-text-2, #5a5a55);
		--text-3: var(--app-text-3, #9e9c97);
		--accent: var(--app-accent, #1a1a18);
		--accent-fg: var(--app-accent-fg, #f6f4ef);
		--blue: #1d4ed8;
		--blue-bg: #dbeafe;
		--green: #276238;
		--green-bg: #dcfce7;
		--amber: #92400e;
		--amber-bg: #fef9c3;
		--red: #dc2626;
		--fn-color: #1d4ed8;
		--glow: rgba(0, 0, 0, 0.05);

		background: var(--bg);
		color: var(--text-1);
		font-family: 'DM Mono', 'Fira Mono', ui-monospace, monospace;
		font-size: 14px;
		padding: 1.5rem;
		border-radius: 12px;
	}

	/* dark overrides — triggered by .zb-dark class set from $theme store */
	.zb-dark {
		--bg: #1a1917;
		--surface: #242320;
		--surface-2: #2e2c28;
		--border: rgba(255, 255, 255, 0.08);
		--border-em: rgba(255, 255, 255, 0.2);
		--text-1: #f0ede8;
		--text-2: #a8a49d;
		--text-3: #6b6860;
		--accent: #f0ede8;
		--accent-fg: #1a1917;
		--blue: #93c5fd;
		--blue-bg: #1e3a5f;
		--green: #86efac;
		--green-bg: #14532d;
		--amber: #fcd34d;
		--amber-bg: #451a03;
		--red: #f87171;
		--fn-color: #93c5fd;
		--glow: rgba(255, 255, 255, 0.04);
	}
	/* ── Preface ─────────────────────────────────────────────────────────────── */
	.zb-preface {
		background: var(--blue-bg);
		border-left: 4px solid var(--blue);
		padding: 12px 16px;
		border-radius: 0 8px 8px 0;
		margin-bottom: 1rem;
	}
	.zb-preface h3 {
		margin: 0 0 6px 0;
		font-size: 12px;
		font-weight: 700;
		color: var(--blue);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.zb-preface p {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-2);
	}

	/* ── Header ─────────────────────────────────────────────────────────────── */
	.zb-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;
	}
	.zb-title {
		font-size: 16px;
		font-weight: 600;
		letter-spacing: -0.02em;
		color: var(--text-1);
	}
	.zb-reset {
		font-size: 13px;
		padding: 4px 12px;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: 20px;
		background: transparent;
		color: var(--text-3);
		cursor: pointer;
		transition: all 0.15s;
	}
	.zb-reset:hover {
		border-color: var(--red);
		color: var(--red);
	}

	/* ── Flow bar ────────────────────────────────────────────────────────────── */
	.zb-flow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 4px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 12px;
		margin-bottom: 0.75rem;
	}
	.zb-step {
		display: flex;
		align-items: center;
		gap: 5px;
		padding: 3px 10px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		border: 1px solid var(--border);
		background: var(--surface-2);
		color: var(--text-2);
		transition: all 0.25s;
		letter-spacing: 0.03em;
	}
	.zb-step-active {
		background: var(--accent);
		color: var(--accent-fg);
		border-color: var(--accent);
	}
	.zb-step-done {
		background: var(--green-bg);
		color: var(--green);
		border-color: var(--green);
	}
	.zb-step-num {
		width: 15px;
		height: 15px;
		border-radius: 50%;
		font-size: 11px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(128, 128, 128, 0.25);
		flex-shrink: 0;
	}
	.zb-arrow {
		font-size: 12px;
		color: var(--text-2);
	}

	/* ── Grid / spacing ──────────────────────────────────────────────────────── */
	.zb-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.zb-mb {
		margin-bottom: 0.75rem;
	}
	.zb-mb-sm {
		margin-bottom: 0.5rem;
	}
	.zb-mt-sm {
		margin-top: 0.75rem;
	}

	/* ── Panel ───────────────────────────────────────────────────────────────── */
	.zb-panel {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 14px;
		transition:
			border-color 0.25s,
			box-shadow 0.25s;
	}
	.zb-panel-active {
		border-color: var(--blue);
		box-shadow: 0 0 0 4px var(--blue-bg);
	}
	.zb-panel-title {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 12px;
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
	}

	/* ── Badges ──────────────────────────────────────────────────────────────── */
	.zb-badge {
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 20px;
		font-weight: 700;
		letter-spacing: 0.04em;
	}
	.zb-badge-blue {
		background: var(--blue-bg);
		color: var(--blue);
	}
	.zb-badge-muted {
		background: var(--surface-2);
		color: var(--text-3);
	}

	/* ── Form ────────────────────────────────────────────────────────────────── */
	.zb-form-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-bottom: 10px;
	}
	.zb-span2 {
		grid-column: span 2;
	}
	.zb-field {
		display: flex;
		flex-direction: column;
		gap: 3px;
	}
	.zb-field span,
	.zb-field-label {
		font-size: 12px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-3);
	}
	.zb-field-label {
		margin-bottom: 6px;
	}
	.zb-field input,
	.zb-field select {
		font-family: inherit;
		font-size: 14px;
		padding: 5px 8px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface-2);
		color: var(--text-1);
		outline: none;
		transition: border-color 0.15s;
	}
	.zb-field input:focus,
	.zb-field select:focus {
		border-color: var(--border-em);
	}
	.zb-field input:disabled,
	.zb-field select:disabled {
		opacity: 0.45;
		cursor: default;
	}

	/* ── Items ───────────────────────────────────────────────────────────────── */
	.zb-items {
		display: flex;
		flex-direction: column;
		gap: 4px;
		margin-bottom: 10px;
	}
	.zb-item {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		padding: 5px 8px;
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		color: var(--text-2);
	}
	.zb-item-free {
		background: var(--green-bg);
		color: var(--green);
		border-color: var(--green);
	}

	/* ── Free pack ───────────────────────────────────────────────────────────── */
	.zb-freepack {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 10px;
		font-size: 13px;
		color: var(--text-3);
		cursor: pointer;
	}

	/* ── Totals ──────────────────────────────────────────────────────────────── */
	.zb-totals {
		border-top: 1px solid var(--border);
		padding-top: 8px;
		margin-bottom: 10px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.zb-total-row {
		display: flex;
		justify-content: space-between;
		font-size: 13px;
		color: var(--text-2);
	}
	.zb-total-grand {
		font-size: 15px;
		font-weight: 700;
		color: var(--text-1);
		padding-top: 4px;
	}

	/* ── Payment method ──────────────────────────────────────────────────────── */
	.zb-pm-row {
		display: flex;
		gap: 6px;
		margin-bottom: 10px;
	}
	.zb-pm {
		flex: 1;
		padding: 6px 4px;
		font-size: 13px;
		font-weight: 700;
		font-family: inherit;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface-2);
		color: var(--text-3);
		cursor: pointer;
		transition: all 0.15s;
	}
	.zb-pm:hover:not(:disabled) {
		border-color: var(--border-em);
		color: var(--text-1);
	}
	.zb-pm-active {
		background: var(--accent);
		color: var(--accent-fg);
		border-color: var(--accent);
	}
	.zb-pm:disabled {
		opacity: 0.45;
		cursor: default;
	}

	/* ── Action button ───────────────────────────────────────────────────────── */
	.zb-action {
		width: 100%;
		padding: 10px;
		font-size: 14px;
		font-weight: 700;
		font-family: inherit;
		border: 1px solid var(--accent);
		border-radius: 8px;
		background: var(--accent);
		color: var(--accent-fg);
		cursor: pointer;
		transition: opacity 0.2s;
		letter-spacing: 0.02em;
	}
	.zb-action:hover:not(:disabled) {
		opacity: 0.82;
	}
	.zb-action:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.zb-action-pay {
		background: var(--green);
		border-color: var(--green);
		color: var(--accent-fg);
	}
	.zb-action-done {
		background: var(--green-bg);
		border-color: var(--green);
		color: var(--green);
	}

	/* ── Logs ────────────────────────────────────────────────────────────────── */
	.zb-log {
		font-size: 12px;
		line-height: 1.65;
		color: var(--text-2);
		min-height: 80px;
		max-height: 190px;
		overflow-y: auto;
		margin-bottom: 8px;
	}
	.zb-log-row {
		display: grid;
		grid-template-columns: 72px minmax(0, auto) 1fr;
		gap: 6px;
		padding: 2px 0;
		border-bottom: 1px solid var(--border);
		animation: zbFade 0.2s ease;
	}
	@keyframes zbFade {
		from {
			opacity: 0;
			transform: translateY(-2px);
		}
		to {
			opacity: 1;
		}
	}
	.zb-log-time {
		color: var(--text-3);
		font-variant-numeric: tabular-nums;
	}
	.zb-log-fn {
		color: var(--fn-color);
		font-weight: 600;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.zb-log-msg {
		color: var(--text-2);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.zb-ok {
		color: var(--green);
	}
	.zb-err {
		color: var(--red);
	}

	/* ── Payload ─────────────────────────────────────────────────────────────── */
	.zb-payload-label {
		font-size: 11px;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
		margin-bottom: 4px;
	}
	.zb-payload {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 8px;
		font-family: inherit;
		font-size: 11px;
		line-height: 1.5;
		color: var(--text-2);
		max-height: 150px;
		overflow-y: auto;
		white-space: pre;
		overflow-x: auto;
	}

	/* ── Memory cards ────────────────────────────────────────────────────────── */
	.zb-mem-title {
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-3);
		margin-bottom: 6px;
	}
	.zb-card {
		background: var(--surface-2);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 8px;
		animation: zbFade 0.35s ease;
	}
	.zb-card-name {
		font-weight: 600;
		font-size: 13px;
		color: var(--text-1);
		margin-bottom: 2px;
	}
	.zb-card-meta {
		font-size: 12px;
		color: var(--text-3);
		margin-bottom: 5px;
	}
	.zb-mini-pre {
		font-family: inherit;
		font-size: 11px;
		line-height: 1.5;
		color: var(--text-2);
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 5px;
		white-space: pre;
		overflow-x: auto;
		max-height: 110px;
		overflow-y: auto;
	}

	/* ── Table ───────────────────────────────────────────────────────────────── */
	.zb-table-wrap {
		overflow-x: auto;
	}
	.zb-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 12px;
	}
	.zb-table th {
		text-align: left;
		padding: 5px 6px;
		font-size: 11px;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-3);
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}
	.zb-table td {
		padding: 5px 6px;
		border-bottom: 1px solid var(--border);
		color: var(--text-2);
		white-space: nowrap;
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.zb-row-new td {
		background: var(--blue-bg);
		color: var(--blue);
		animation: zbFade 0.4s ease;
	}
	.zb-row-updated td {
		background: var(--green-bg);
		color: var(--green);
		animation: zbFade 0.4s ease;
	}

	.zb-chip {
		font-size: 11px;
		padding: 2px 7px;
		border-radius: 20px;
		font-weight: 700;
		display: inline-block;
	}
	.zb-chip-pending {
		background: var(--amber-bg);
		color: var(--amber);
	}
	.zb-chip-paid {
		background: var(--green-bg);
		color: var(--green);
	}

	/* ── Misc ────────────────────────────────────────────────────────────────── */
	.zb-empty {
		font-size: 12px;
		color: var(--text-3);
		text-align: center;
		padding: 12px 0;
		font-style: italic;
	}
	.zb-footer {
		font-size: 12px;
		color: var(--text-3);
		text-align: center;
	}
	.zb-footer code {
		font-family: inherit;
		background: var(--surface-2);
		padding: 1px 5px;
		border-radius: 3px;
	}
</style>
