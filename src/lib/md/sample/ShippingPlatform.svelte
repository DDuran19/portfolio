<script lang="ts">
	// ── Types ────────────────────────────────────────────────────────────────
	type Region = 'MY' | 'SG';
	type OrderType = 'me' | 'friend';
	type PaymentStatus = 'paid' | 'pending';

	interface OrderRow {
		id: string;
		recipient: string;
		phone: string;
		address: string;
		region: Region;
		orderType: OrderType;
		payment: PaymentStatus;
		courier: string;
	}

	type LogStep = 'quote' | 'create_order' | 'skip';

	interface LogEntry {
		time: string;
		step: LogStep;
		region: Region;
		orderType: OrderType;
		orderId: string;
		status: number | 'SKIP';
		payload?: string;
		response?: string;
		expanded: boolean;
	}

	// ── Form state ───────────────────────────────────────────────────────────
	let region: Region = 'MY';
	let orderType: OrderType = 'me';

	let senderName = 'Denver Duran';
	let senderPhone = '+60 11-222 3333';

	// Defaulting to 'me' state
	let recipientName = senderName;
	let recipientPhone = senderPhone;
	let recipientAddr = '18 Jalan Bukit Bintang, KL';

	let paymentMethod = 'Credit card';
	let amount = '89.00';

	// ── DB + log state ───────────────────────────────────────────────────────
	let orderCounter = 41;

	let orders: OrderRow[] = [
		{
			id: 'ORD-0041',
			recipient: 'Ahmad Razif',
			phone: '+60 12-000 1111',
			address: '22 Jln Ampang, KL',
			region: 'MY',
			orderType: 'friend',
			payment: 'paid',
			courier: 'LALAMOVE_MY'
		},
		{
			id: 'ORD-0040',
			recipient: 'Priya Nair',
			phone: '+65 9100 2200',
			address: '10 Raffles Place, Singapore 048583',
			region: 'SG',
			orderType: 'me',
			payment: 'paid',
			courier: 'NINJA_VAN_SG'
		},
		{
			id: 'ORD-0039',
			recipient: 'Tan Wei Lin',
			phone: '+60 13-999 8888',
			address: '1 Penang Road, George Town',
			region: 'MY',
			orderType: 'me',
			payment: 'pending',
			courier: '—'
		}
	];

	let logs: LogEntry[] = [
		{
			time: '14:02:30',
			step: 'quote',
			status: 200,
			region: 'MY',
			orderType: 'friend',
			orderId: 'ORD-0041',
			payload: JSON.stringify(
				{
					endpoint: '/v1/quote',
					destination_country: 'MY'
				},
				null,
				2
			),
			response: JSON.stringify(
				{
					courier: 'LALAMOVE_MY',
					fee_myr: 8.5
				},
				null,
				2
			),
			expanded: false
		},
		{
			time: '14:02:31',
			step: 'create_order',
			status: 200,
			region: 'MY',
			orderType: 'friend',
			orderId: 'ORD-0041',
			payload: JSON.stringify(
				{
					endpoint: '/v1/orders',
					order_ref: 'ORD-0041',
					courier: 'LALAMOVE_MY',
					is_gift: true
				},
				null,
				2
			),
			response: JSON.stringify(
				{
					tracking_number: 'LM-8892',
					status: 'DISPATCHED'
				},
				null,
				2
			),
			expanded: false
		},
		{
			time: '13:48:18',
			step: 'quote',
			status: 200,
			region: 'SG',
			orderType: 'me',
			orderId: 'ORD-0040',
			payload: JSON.stringify(
				{
					endpoint: '/v1/quote',
					destination_country: 'SG'
				},
				null,
				2
			),
			response: JSON.stringify(
				{
					courier: 'NINJA_VAN_SG',
					fee_myr: 22.0
				},
				null,
				2
			),
			expanded: false
		},
		{
			time: '13:48:19',
			step: 'create_order',
			status: 200,
			region: 'SG',
			orderType: 'me',
			orderId: 'ORD-0040',
			payload: JSON.stringify(
				{
					endpoint: '/v1/orders',
					order_ref: 'ORD-0040',
					courier: 'NINJA_VAN_SG',
					is_gift: false
				},
				null,
				2
			),
			response: JSON.stringify(
				{
					tracking_number: 'NV-5541',
					status: 'DISPATCHED'
				},
				null,
				2
			),
			expanded: false
		},
		{
			time: '13:31:05',
			step: 'skip',
			status: 'SKIP',
			region: 'MY',
			orderType: 'me',
			orderId: 'ORD-0039',
			expanded: false
		}
	];

	// ── Derived stats ────────────────────────────────────────────────────────
	$: dispatched = orders.filter((o) => o.payment === 'paid').length;
	$: awaitingPayment = orders.filter((o) => o.payment === 'pending').length;

	// ── Helpers ──────────────────────────────────────────────────────────────
	function setOrderType(type: OrderType) {
		orderType = type;
		if (type === 'me') {
			recipientName = senderName;
			recipientPhone = senderPhone;
		} else {
			recipientName = 'Sarah Lim';
			recipientPhone = region === 'MY' ? '+60 12-345 6789' : '+65 9100 0001';
		}
	}

	function setRegion(r: Region) {
		region = r;
		if (r === 'MY') {
			recipientAddr = '18 Jalan Bukit Bintang, KL';
			if (orderType === 'friend') recipientPhone = '+60 12-345 6789';
		} else {
			recipientAddr = '1 Harbourfront Walk, Singapore 098585';
			if (orderType === 'friend') recipientPhone = '+65 9100 0001';
		}
	}

	function now(): string {
		const d = new Date();
		return [d.getHours(), d.getMinutes(), d.getSeconds()]
			.map((n) => String(n).padStart(2, '0'))
			.join(':');
	}

	function pickCourier(r: Region): string {
		return r === 'MY' ? 'LALAMOVE_MY' : 'NINJA_VAN_SG';
	}

	// ── Simulate placing an order (two-step: Quote → Create Order) ──────────
	function placeOrder() {
		orderCounter++;
		const orderId = `ORD-0${orderCounter}`;
		const courier = pickCourier(region);
		const t = now();

		const newOrder: OrderRow = {
			id: orderId,
			recipient: recipientName || 'Customer',
			phone: recipientPhone,
			address: recipientAddr,
			region,
			orderType,
			payment: 'paid',
			courier
		};

		orders = [newOrder, ...orders];

		const dbRecord = orders.find((o) => o.id === orderId);

		if (dbRecord?.payment !== 'paid') {
			return;
		}

		const quoteReq = {
			endpoint: '/v1/quote',
			destination_country: region
		};
		const quoteRes = {
			courier: dbRecord.courier,
			fee_myr: region === 'MY' ? 8.5 : 22.0
		};

		const quoteLog: LogEntry = {
			time: t,
			step: 'quote',
			status: 200,
			region,
			orderType,
			orderId,
			payload: JSON.stringify(quoteReq, null, 2),
			response: JSON.stringify(quoteRes, null, 2),
			expanded: false
		};

		const createReq = {
			endpoint: '/v1/orders',
			order_ref: dbRecord.id,
			courier: quoteRes.courier,
			is_gift: orderType === 'friend'
		};

		const createRes = {
			tracking_number: `${region === 'MY' ? 'LM' : 'NV'}-${Math.floor(
				1000 + Math.random() * 9000
			)}`,
			status: 'DISPATCHED'
		};

		const createLog: LogEntry = {
			time: t,
			step: 'create_order',
			status: 200,
			region,
			orderType,
			orderId,
			payload: JSON.stringify(createReq, null, 2),
			response: JSON.stringify(createRes, null, 2),
			expanded: false
		};

		logs = [createLog, quoteLog, ...logs];
	}

	function toggleLog(index: number) {
		logs = logs.map((l, i) => (i === index ? { ...l, expanded: !l.expanded } : l));
	}
</script>

<div class="page-root">
	<div class="preface">
		<div class="preface-eyebrow">
			<span class="i-carbon-flow" aria-hidden="true"></span>
			Interactive demo
		</div>
		<h1 class="preface-title">UI → Backend → Shipping API</h1>
		<p class="preface-body">
			This demo illustrates the full data flow of a shipping integration — from a customer placing
			an order on the frontend, to the record being written to the database, to the system
			automatically dispatching a delivery via a third-party Shipping Platform API.
		</p>
		<p class="preface-body">
			Payment triggers are the key mechanic: the API call only fires when a payment is marked
			<code>paid</code> in the database. Orders still <code>pending</code> are skipped and logged as
			<span class="tag-skip">SKIP</span>. Both domestic (Malaysia) and international (Singapore)
			routes are supported, as well as <em>For Me</em> and <em>For a Friend</em>
			order types — the latter includes separate sender details in the API payload.
		</p>
		<div class="preface-stack">
			<span class="stack-tag"
				><span class="i-carbon-logo-svelte" aria-hidden="true"></span> SvelteKit</span
			>
			<span class="stack-tag"
				><span class="i-carbon-code" aria-hidden="true"></span> TypeScript</span
			>
			<span class="stack-tag"
				><span class="i-carbon-data-base" aria-hidden="true"></span> D1 / SQL</span
			>
			<span class="stack-tag"><span class="i-carbon-api-1" aria-hidden="true"></span> REST API</span
			>
			<span class="stack-tag"
				><span class="i-carbon-cloud" aria-hidden="true"></span> Cloudflare Workers</span
			>
		</div>
	</div>

	<div class="flow-row">
		<div class="flow-step">
			<span class="i-carbon-shopping-cart flow-icon" aria-hidden="true"></span>
			<span class="flow-label">Customer fills checkout</span>
		</div>
		<span class="i-carbon-arrow-right flow-arrow" aria-hidden="true"></span>
		<div class="flow-step">
			<span class="i-carbon-data-base flow-icon" aria-hidden="true"></span>
			<span class="flow-label">Order saved to DB</span>
		</div>
		<span class="i-carbon-arrow-right flow-arrow" aria-hidden="true"></span>
		<div class="flow-step">
			<span class="i-carbon-checkmark flow-icon" aria-hidden="true"></span>
			<span class="flow-label">Payment marked paid</span>
		</div>
		<span class="i-carbon-arrow-right flow-arrow" aria-hidden="true"></span>
		<div class="flow-step">
			<span class="i-carbon-api-1 flow-icon" aria-hidden="true"></span>
			<span class="flow-label">Shipping API triggered</span>
		</div>
	</div>

	<section>
		<p class="section-label">
			<span class="i-carbon-shopping-cart" aria-hidden="true"></span>
			Customer checkout
		</p>

		<div class="card card-form">
			<div class="card-title">
				<span class="i-carbon-package" aria-hidden="true"></span>
				Place order
				<span class="badge badge-info">checkout</span>
			</div>

			<div class="form-group">
				<p class="field-label">Delivery destination</p>
				<div class="toggle-row">
					<button
						class="toggle-btn"
						class:active={region === 'MY'}
						on:click={() => setRegion('MY')}
					>
						<span class="i-carbon-location" aria-hidden="true"></span> Malaysia (domestic)
					</button>
					<button
						class="toggle-btn"
						class:active={region === 'SG'}
						on:click={() => setRegion('SG')}
					>
						<span class="i-carbon-airport-01" aria-hidden="true"></span> Singapore (international)
					</button>
				</div>
			</div>

			<div class="form-group">
				<p class="field-label">Order type</p>
				<div class="toggle-row">
					<button
						class="toggle-btn"
						class:active={orderType === 'me'}
						on:click={() => setOrderType('me')}
					>
						<span class="i-carbon-user" aria-hidden="true"></span> For me
					</button>
					<button
						class="toggle-btn"
						class:active={orderType === 'friend'}
						on:click={() => setOrderType('friend')}
					>
						<span class="i-carbon-group" aria-hidden="true"></span> For a friend
					</button>
				</div>
			</div>

			<hr class="divider" />

			<div class="form-group">
				<div class="form-grid">
					<div class="field">
						<label for="rec-name">Full name</label>
						<input id="rec-name" type="text" bind:value={recipientName} />
					</div>
					<div class="field">
						<label for="rec-phone">Phone</label>
						<input id="rec-phone" type="text" bind:value={recipientPhone} />
					</div>
				</div>
				<div class="field">
					<label for="rec-addr">
						{region === 'SG' ? 'Delivery address (SG)' : 'Delivery address'}
					</label>
					<input id="rec-addr" type="text" bind:value={recipientAddr} />
				</div>
			</div>

			{#if orderType === 'friend'}
				<hr class="divider" />
				<div class="form-group">
					<p class="field-label">
						<span class="i-carbon-user-follow" aria-hidden="true"></span> Sender details
					</p>
					<div class="form-grid">
						<div class="field">
							<label for="sender-name">Sender name</label>
							<input id="sender-name" type="text" bind:value={senderName} />
						</div>
						<div class="field">
							<label for="sender-phone">Sender phone</label>
							<input id="sender-phone" type="text" bind:value={senderPhone} />
						</div>
					</div>
				</div>
			{/if}

			<hr class="divider" />

			<div class="form-group">
				<div class="form-grid">
					<div class="field">
						<label for="pay-method">Payment method</label>
						<select id="pay-method" bind:value={paymentMethod}>
							<option>Credit card</option>
							<option>FPX</option>
							<option>GrabPay</option>
						</select>
					</div>
					<div class="field">
						<label for="amount">Amount (MYR)</label>
						<input id="amount" type="text" bind:value={amount} />
					</div>
				</div>
			</div>

			<button class="place-btn" on:click={placeOrder}>
				<span class="i-carbon-flash" aria-hidden="true"></span> Pay & place order
			</button>
		</div>
	</section>

	<section>
		<p class="section-label">
			<span class="i-carbon-data-base" aria-hidden="true"></span>
			Database — orders table
		</p>

		<div class="card card-flush">
			<table class="db-table">
				<thead>
					<tr>
						<th>order id</th>
						<th>recipient</th>
						<th>region</th>
						<th>type</th>
						<th>payment</th>
						<th>courier</th>
					</tr>
				</thead>
				<tbody>
					{#each orders as order}
						<tr>
							<td class="mono">{order.id}</td>
							<td>{order.recipient}</td>
							<td>
								<span
									class="badge"
									class:badge-info={order.region === 'MY'}
									class:badge-warning={order.region === 'SG'}>{order.region}</span
								>
							</td>
							<td>
								<span
									class="badge"
									class:badge-info={order.orderType === 'me'}
									class:badge-warning={order.orderType === 'friend'}>{order.orderType}</span
								>
							</td>
							<td>
								<span
									class="badge"
									class:badge-success={order.payment === 'paid'}
									class:badge-danger={order.payment === 'pending'}>{order.payment}</span
								>
							</td>
							<td class="mono muted">{order.courier}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>

	<section>
		<p class="section-label">
			<span class="i-carbon-api-1" aria-hidden="true"></span>
			Shipping API — event log
		</p>

		<div class="stat-row">
			<div class="stat">
				<div class="stat-val">{orders.length}</div>
				<div class="stat-lbl">Orders processed</div>
			</div>
			<div class="stat">
				<div class="stat-val">{dispatched}</div>
				<div class="stat-lbl">Dispatched</div>
			</div>
			<div class="stat">
				<div class="stat-val">{awaitingPayment}</div>
				<div class="stat-lbl">Awaiting payment</div>
			</div>
		</div>

		<div class="card card-flush">
			{#each logs as log, i}
				<div class="log-entry">
					<div class="log-meta">
						<span class="log-time">{log.time}</span>

						{#if log.status === 200}
							<span class="badge badge-success">200 OK</span>
						{:else}
							<span class="badge badge-warning">SKIP</span>
						{/if}

						{#if log.step === 'quote'}
							<span class="badge step-quote">
								<span class="i-carbon-search" aria-hidden="true"></span> 1 · quote
							</span>
						{:else if log.step === 'create_order'}
							<span class="badge step-create">
								<span class="i-carbon-delivery" aria-hidden="true"></span> 2 · create order
							</span>
						{/if}

						<span
							class="badge"
							class:badge-info={log.region === 'MY'}
							class:badge-warning={log.region === 'SG'}>{log.region} · {log.orderType}</span
						>

						<span class="log-msg">
							{#if log.step === 'skip'}
								Payment pending — {log.orderId}, no dispatch
							{:else if log.step === 'quote'}
								Fetch quotes — {log.orderId}
							{:else}
								Create order — {log.orderId}
							{/if}
						</span>

						{#if log.payload}
							<button class="log-toggle" on:click={() => toggleLog(i)}>
								{log.expanded ? 'hide' : 'show'} req / res
							</button>
						{/if}
					</div>

					{#if log.payload && log.expanded}
						<div class="log-req-res">
							<div class="log-block">
								<div class="log-block-label">
									<span class="i-carbon-upload" aria-hidden="true"></span> request
								</div>
								<pre class="log-payload">{log.payload}</pre>
							</div>
							{#if log.response}
								<div class="log-block">
									<div class="log-block-label response">
										<span class="i-carbon-download" aria-hidden="true"></span> response
									</div>
									<pre class="log-payload">{log.response}</pre>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	/* ── Theme tokens ─────────────────────────────────────────────────────── */
	.page-root {
		--bg-card: rgb(255 255 255 / 0.04);
		--bg-surface: rgb(255 255 255 / 0.06);
		--bg-input: rgb(255 255 255 / 0.05);
		--border: rgb(255 255 255 / 0.1);
		--border-focus: rgb(99 179 237 / 0.55);
		--text-primary: inherit;
		--text-muted: rgb(156 163 175); /* gray-400 */
		--text-faint: rgb(107 114 128); /* gray-500 */
		--mono: ui-monospace, SFMono-Regular, Menlo, monospace;

		--badge-info-bg: rgb(59 130 246 / 0.15);
		--badge-info-fg: rgb(147 197 253);
		--badge-ok-bg: rgb(34 197 94 / 0.15);
		--badge-ok-fg: rgb(134 239 172);
		--badge-warn-bg: rgb(234 179 8 / 0.15);
		--badge-warn-fg: rgb(253 224 71);
		--badge-danger-bg: rgb(239 68 68 / 0.15);
		--badge-danger-fg: rgb(252 165 165);

		--accent-bg: rgb(59 130 246 / 0.18);
		--accent-fg: rgb(147 197 253);
		--accent-border: rgb(99 179 237 / 0.4);

		--preface-bg: rgb(59 130 246 / 0.07);
		--preface-border: rgb(99 179 237 / 0.25);

		--flow-icon: rgb(147 197 253);
		--flow-arrow: rgb(75 85 99);
	}

	/* Light-mode overrides */
	@media (prefers-color-scheme: light) {
		.page-root {
			--bg-card: #ffffff;
			--bg-surface: #f9fafb;
			--bg-input: #f9fafb;
			--border: #e5e7eb;
			--border-focus: #93c5fd;
			--text-muted: #6b7280;
			--text-faint: #9ca3af;

			--badge-info-bg: #dbeafe;
			--badge-info-fg: #1d4ed8;
			--badge-ok-bg: #dcfce7;
			--badge-ok-fg: #15803d;
			--badge-warn-bg: #fef9c3;
			--badge-warn-fg: #a16207;
			--badge-danger-bg: #fee2e2;
			--badge-danger-fg: #b91c1c;

			--accent-bg: #dbeafe;
			--accent-fg: #1d4ed8;
			--accent-border: #93c5fd;

			--preface-bg: #eff6ff;
			--preface-border: #93c5fd;

			--flow-icon: #3b82f6;
			--flow-arrow: #d1d5db;
		}
	}

	/* ── Page wrapper ─────────────────────────────────────────────────────── */
	.page-root {
		max-width: 760px;
		margin: 0 auto;
		padding: 2.5rem 1rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	/* ── Preface ──────────────────────────────────────────────────────────── */
	.preface {
		border: 1px solid var(--preface-border);
		border-radius: 12px;
		background: var(--preface-bg);
		padding: 1.5rem 1.75rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.preface-eyebrow {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--accent-fg);
	}
	.preface-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		line-height: 1.3;
		color: var(--text-primary);
	}
	.preface-body {
		font-size: 14px;
		line-height: 1.75;
		color: var(--text-muted);
		margin: 0;
	}
	.preface-body code {
		font-family: var(--mono);
		font-size: 12px;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 1px 5px;
		color: var(--accent-fg);
	}
	.tag-skip {
		font-family: var(--mono);
		font-size: 11px;
		background: var(--badge-warn-bg);
		color: var(--badge-warn-fg);
		border-radius: 4px;
		padding: 1px 6px;
		font-weight: 500;
	}
	.preface-stack {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-top: 0.25rem;
	}
	.stack-tag {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		font-size: 12px;
		font-weight: 500;
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 3px 10px;
		color: var(--text-muted);
	}

	/* ── Flow diagram ─────────────────────────────────────────────────────── */
	.flow-row {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		flex-wrap: wrap;
		padding: 0.5rem 0;
	}
	.flow-step {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		min-width: 90px;
	}
	.flow-icon {
		font-size: 22px;
		color: var(--flow-icon);
	}
	.flow-label {
		font-size: 11px;
		color: var(--text-muted);
		text-align: center;
		line-height: 1.4;
	}
	.flow-arrow {
		font-size: 18px;
		color: var(--flow-arrow);
		flex-shrink: 0;
	}

	/* ── Section label ────────────────────────────────────────────────────── */
	.section-label {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
		margin-bottom: 10px;
	}

	/* ── Cards ────────────────────────────────────────────────────────────── */
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 1.25rem;
	}
	.card-flush {
		padding: 0;
		overflow: hidden;
	}
	.card-title {
		font-size: 15px;
		font-weight: 500;
		color: var(--text-primary);
		display: flex;
		align-items: center;
		gap: 8px;
		/* margin-bottom handled by grid gap in card-form */
	}

	/* New layout class for form stacking */
	.card-form {
		display: grid;
		gap: 1.25rem;
	}

	/* ── Badges ───────────────────────────────────────────────────────────── */
	.badge {
		display: inline-block;
		font-size: 11px;
		padding: 2px 8px;
		border-radius: 4px;
		font-weight: 500;
		white-space: nowrap;
	}
	.badge-info {
		background: var(--badge-info-bg);
		color: var(--badge-info-fg);
	}
	.badge-success {
		background: var(--badge-ok-bg);
		color: var(--badge-ok-fg);
	}
	.badge-warning {
		background: var(--badge-warn-bg);
		color: var(--badge-warn-fg);
	}
	.badge-danger {
		background: var(--badge-danger-bg);
		color: var(--badge-danger-fg);
	}
	.step-quote {
		background: rgb(139 92 246 / 0.15);
		color: rgb(196 181 253);
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.step-create {
		background: rgb(20 184 166 / 0.15);
		color: rgb(94 234 212);
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	@media (prefers-color-scheme: light) {
		.step-quote {
			background: #ede9fe;
			color: #6d28d9;
		}
		.step-create {
			background: #ccfbf1;
			color: #0f766e;
		}
	}

	/* ── Form structure ───────────────────────────────────────────────────── */
	.form-group {
		display: grid;
		gap: 0.75rem;
	}
	.toggle-row {
		display: flex;
		gap: 8px;
	}
	.toggle-btn {
		flex: 1;
		padding: 8px 12px;
		font-size: 13px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-surface);
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		transition: all 0.15s;
	}
	.toggle-btn.active {
		background: var(--accent-bg);
		color: var(--accent-fg);
		border-color: var(--accent-border);
		font-weight: 500;
	}
	.toggle-btn:not(.active):hover {
		border-color: var(--border-focus);
	}

	/* 🔥 FLEXBOX FIX: Replaced CSS Grid with rigid Flexbox to prevent global blowout 🔥 */
	.form-grid {
		display: flex;
		gap: 12px;
		width: 100%;
	}
	.form-grid > .field {
		flex: 1 1 0%;
		min-width: 0; /* CRITICAL: Prevents long text from blowing out the container */
		display: flex;
		flex-direction: column;
	}

	.field label {
		display: block;
		font-size: 12px;
		color: var(--text-muted);
		margin-bottom: 4px;
	}
	.field input,
	.field select {
		width: 100%;
		box-sizing: border-box; /* Force borders to obey width */
		font-size: 14px;
		padding: 7px 10px;
		border: 1px solid var(--border);
		border-radius: 8px;
		background: var(--bg-input);
		color: var(--text-primary);
		outline: none;
		transition: border-color 0.15s;
		color-scheme: inherit;
	}
	.field input:focus,
	.field select:focus {
		border-color: var(--border-focus);
	}
	.field-label {
		font-size: 12px;
		color: var(--text-muted);
		margin: 0;
		display: flex;
		align-items: center;
		gap: 5px;
	}

	/* ── Divider ──────────────────────────────────────────────────────────── */
	.divider {
		border: none;
		height: 1px;
		background-color: var(--border);
		margin: 0.5rem 0; /* Ensures the line actually takes up physical space */
		width: 100%;
	}

	/* ── CTA button ───────────────────────────────────────────────────────── */
	.place-btn {
		width: 100%;
		padding: 10px;
		background: var(--accent-bg);
		color: var(--accent-fg);
		border: 1px solid var(--accent-border);
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		transition: opacity 0.15s;
	}
	.place-btn:hover {
		opacity: 0.8;
	}

	/* ── DB table ─────────────────────────────────────────────────────────── */
	.db-table {
		width: 100%;
		font-size: 13px;
		border-collapse: collapse;
	}
	.db-table th {
		font-size: 11px;
		font-weight: 500;
		color: var(--text-faint);
		text-align: left;
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		white-space: nowrap;
	}
	.db-table td {
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
		color: var(--text-primary);
		vertical-align: middle;
	}
	.db-table tr:last-child td {
		border-bottom: none;
	}
	.mono {
		font-family: var(--mono);
		font-size: 12px;
	}
	.muted {
		color: var(--text-muted);
	}

	/* ── Stat cards ───────────────────────────────────────────────────────── */
	.stat-row {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		margin-bottom: 1rem;
	}
	.stat {
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 8px;
		padding: 10px 14px;
	}
	.stat-val {
		font-size: 22px;
		font-weight: 500;
		color: var(--text-primary);
	}
	.stat-lbl {
		font-size: 11px;
		color: var(--text-muted);
		margin-top: 2px;
	}

	/* ── Log entries ──────────────────────────────────────────────────────── */
	.log-entry {
		padding: 10px 14px;
		border-bottom: 1px solid var(--border);
	}
	.log-entry:last-child {
		border-bottom: none;
	}
	.log-meta {
		display: flex;
		align-items: center;
		gap: 8px;
		flex-wrap: wrap;
	}
	.log-time {
		font-family: var(--mono);
		font-size: 11px;
		color: var(--text-faint);
	}
	.log-msg {
		font-size: 13px;
		color: var(--text-muted);
	}
	.log-req-res {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin-top: 8px;
	}
	.log-block-label {
		font-size: 10px;
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-faint);
		display: flex;
		align-items: center;
		gap: 4px;
		margin-bottom: 4px;
	}
	.log-block-label.response {
		color: var(--badge-ok-fg);
	}
	.log-payload {
		font-family: var(--mono);
		font-size: 13px;
		color: var(--text-muted);
		background: var(--bg-surface);
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 12px;
		white-space: pre-wrap;
		margin-top: 8px;
		overflow-x: auto;
	}
	.log-toggle {
		font-size: 11px;
		color: var(--accent-fg);
		cursor: pointer;
		background: none;
		border: none;
		padding: 0;
		font-family: inherit;
	}
	.log-toggle:hover {
		text-decoration: underline;
	}
</style>
