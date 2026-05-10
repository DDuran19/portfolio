<script>
	/**
	 * Svelte 4 Prototype: Central Dashboard vs Mock Browser
	 * Updated: Strict Login Validation + Error States
	 */
	import { fade, fly } from 'svelte/transition';

	// --- 1. MOCK DATA ---

	const businesses = [
		{ id: 'b1', name: 'Ruwais Tourism', domain: 'ruwais-tours.ae', color: 'bg-blue-600' },
		{ id: 'b2', name: 'LWL', domain: 'lwl-group.com', color: 'bg-orange-600' },
		{ id: 'b3', name: 'BCP Transport', domain: 'bcp-logistics.net', color: 'bg-purple-600' },
		{ id: 'b4', name: 'Arak Cafe', domain: 'arak-coffee.com', color: 'bg-teal-600' },
		{ id: 'b5', name: 'Middle Class', domain: 'middleclass-shop.com', color: 'bg-pink-600' }
	];

	// The ONE Super User (Global Dashboard Login)
	const superUser = {
		user: 'nexus_master',
		role: 'Global Super Admin'
	};

	// 3 Valid Users per Business (With Passwords for Validation)
	const mockUsers = {
		b1: [
			{ user: 'agent_khalid', pass: '1234', role: 'Travel Coordinator' },
			{ user: 'guide_omar', pass: '1234', role: 'Senior Guide' },
			{ user: 'acc_layla', pass: '1234', role: 'Finance Audit' }
		],
		b2: [
			{ user: 'admin_lwl', pass: '1234', role: 'System Admin' },
			{ user: 'hr_sarah', pass: '1234', role: 'Recruiter' },
			{ user: 'dev_mike', pass: '1234', role: 'Tech Lead' }
		],
		b3: [
			{ user: 'fleet_mgr', pass: '1234', role: 'Logistics Head' },
			{ user: 'driver_01', pass: '1234', role: 'Transport Unit' },
			{ user: 'disp_ahmed', pass: '1234', role: 'Dispatcher' }
		],
		b4: [
			{ user: 'barista_lead', pass: '1234', role: 'Store Manager' },
			{ user: 'chef_mario', pass: '1234', role: 'Kitchen Head' },
			{ user: 'waiter_sam', pass: '1234', role: 'Service Staff' }
		],
		b5: [
			{ user: 'retail_ops', pass: '1234', role: 'Merchandiser' },
			{ user: 'stock_clerk', pass: '1234', role: 'Inventory Control' },
			{ user: 'sales_rep', pass: '1234', role: 'Floor Manager' }
		]
	};

	// --- 2. STATE ---

	let browserTabs = businesses.map((b) => ({
		...b,
		isLoggedIn: false,
		currentUser: null,
		currentRole: null,
		loginError: null // Tracks error message for this specific tab
	}));

	let activeTabIndex = 0;
	let notification = null;

	// --- 3. LOGIC ---

	// Action: DASHBOARD Login (Always Success via Super User)
	function dashboardAutoLogin(index) {
		const bizName = businesses[index].name;
		activeTabIndex = index;

		// Reset any previous errors
		browserTabs[index].loginError = null;

		// Simulate API "Auto-Login"
		browserTabs[index].isLoggedIn = true;
		browserTabs[index].currentUser = superUser.user;
		browserTabs[index].currentRole = superUser.role;

		showNotification(`SSO: Logged into ${bizName} as ${superUser.user}`);
	}

	// Action: MANUAL Browser Login (Strict Validation)
	function manualBrowserLogin(index, username, password) {
		// Reset error
		browserTabs[index].loginError = null;

		const bizId = businesses[index].id;

		// VALIDATION LOGIC
		// 1. Check if user exists in the list for this specific business
		const validUser = mockUsers[bizId].find((u) => u.user === username && u.pass === password);

		if (validUser) {
			// SUCCESS
			browserTabs[index].isLoggedIn = true;
			browserTabs[index].currentUser = validUser.user;
			browserTabs[index].currentRole = validUser.role;
		} else {
			// FAILURE
			browserTabs[index].loginError = 'Invalid username or password';

			// Auto-clear error after 2 seconds
			setTimeout(() => {
				if (browserTabs[index]) browserTabs[index].loginError = null;
			}, 2000);
		}
	}

	function logout(index) {
		browserTabs[index].isLoggedIn = false;
		browserTabs[index].currentUser = null;
		browserTabs[index].currentRole = null;
		browserTabs[index].loginError = null;
	}

	function showNotification(msg) {
		notification = msg;
		setTimeout(() => {
			notification = null;
		}, 3000);
	}
</script>

<div class="min-h-screen bg-slate-950 text-slate-200 font-sans flex overflow-hidden">
	<aside class="w-1/3 min-w-[350px] flex flex-col border-r border-slate-800 bg-slate-900">
		<div class="p-6 border-b border-slate-800">
			<h1 class="text-2xl font-bold text-indigo-400">Central Dashboard</h1>
			<p class="text-slate-500 text-sm">Multi-Tenant Access System</p>
		</div>

		<div class="p-6 flex-1 overflow-y-auto custom-scrollbar">
			<div class="mb-8 space-y-4">
				<div class="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-lg">
					<h3 class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
						Global Access
					</h3>
					<div class="flex justify-between items-center font-mono text-xs">
						<span class="text-white">{superUser.user}</span>
						<span class="bg-indigo-600 px-2 py-0.5 rounded text-white text-[10px]"
							>{superUser.role}</span
						>
					</div>
				</div>

				<div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
					<h3 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
						Local Login Cheatsheet
					</h3>
					<p class="text-[10px] text-slate-500 mb-3 italic">
						Use Password: <b>"1234"</b> for all below
					</p>
					<div class="space-y-4">
						{#each businesses as biz}
							<div>
								<div class="text-xs text-slate-300 font-bold mb-1">{biz.name}</div>
								<div class="flex flex-wrap gap-2">
									{#each mockUsers[biz.id] as u}
										<span
											class="text-[10px] font-mono bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600 cursor-copy hover:text-white"
											title="Password: 1234"
										>
											{u.user}
										</span>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>

			<h3 class="text-sm font-semibold text-slate-300 mb-4">Launchpad</h3>

			<div class="space-y-3">
				{#each businesses as biz, i}
					<div
						class="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center justify-between group hover:border-slate-500 transition-all"
					>
						<div class="flex items-center gap-3">
							<div
								class={`w-8 h-8 rounded-lg ${biz.color} flex items-center justify-center text-white font-bold shadow-lg text-sm`}
							>
								{biz.name[0]}
							</div>
							<div class="font-medium text-slate-200 text-sm">{biz.name}</div>
						</div>

						<button
							on:click={() => dashboardAutoLogin(i)}
							class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg shadow-indigo-900/20 active:scale-95 transition-all flex items-center gap-2"
						>
							Login & Open
							<span class="text-[10px]">↗</span>
						</button>
					</div>
				{/each}
			</div>
		</div>
	</aside>

	<main class="w-2/3 flex flex-col bg-slate-950 relative border-l border-slate-900">
		{#if notification}
			<div
				transition:fly={{ y: -20, duration: 300 }}
				class="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-2 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2 border border-emerald-400"
			>
				<span
					class="bg-white text-emerald-600 rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold"
					>✓</span
				>
				{notification}
			</div>
		{/if}

		<div class="bg-slate-800 border-b border-slate-700 pt-3 px-3 flex flex-col gap-3">
			<div class="flex gap-1 overflow-x-auto no-scrollbar">
				{#each browserTabs as tab, i}
					<button
						on:click={() => (activeTabIndex = i)}
						class={`
							px-4 py-2 rounded-t-lg text-xs font-medium flex items-center gap-2 min-w-[140px] transition-colors relative
							${
								activeTabIndex === i
									? 'bg-slate-700 text-white border-t border-x border-slate-600'
									: 'bg-slate-800 text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'
							}
						`}
					>
						<span class={`w-2 h-2 rounded-full ${tab.color}`}></span>
						<span class="truncate max-w-[100px]">{tab.name}</span>
						{#if tab.isLoggedIn}
							<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-auto animate-pulse"></span>
						{/if}
					</button>
				{/each}
			</div>

			<div class="bg-slate-700 p-2 rounded flex items-center gap-3 mb-2">
				<div class="flex gap-1.5">
					<div class="w-3 h-3 rounded-full bg-red-500/50"></div>
					<div class="w-3 h-3 rounded-full bg-yellow-500/50"></div>
					<div class="w-3 h-3 rounded-full bg-green-500/50"></div>
				</div>
				<div
					class="flex-1 bg-slate-900 rounded px-3 py-1 text-xs font-mono text-slate-400 flex items-center justify-between"
				>
					<span
						>https://<span class="text-white">{browserTabs[activeTabIndex].domain}</span
						>/{browserTabs[activeTabIndex].isLoggedIn ? 'dashboard' : 'login'}</span
					>
					<div class="flex items-center gap-2">
						{#if browserTabs[activeTabIndex].isLoggedIn}
							<span class="text-emerald-500 text-[10px] uppercase font-bold tracking-wider"
								>Authenticated</span
							>
						{/if}
						<span class="text-slate-600">🔒 Secure</span>
					</div>
				</div>
			</div>
		</div>

		<div class="flex-1 bg-white relative overflow-hidden">
			{#key activeTabIndex}
				<div in:fade={{ duration: 200 }} class="absolute inset-0 h-full w-full overflow-y-auto">
					{#if browserTabs[activeTabIndex].isLoggedIn}
						<div class="h-full flex flex-col">
							<nav
								class={`${browserTabs[activeTabIndex].color} p-4 text-white flex justify-between items-center shadow-md sticky top-0 z-10`}
							>
								<div class="flex items-center gap-2">
									<div
										class="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold"
									>
										{browserTabs[activeTabIndex].name[0]}
									</div>
									<span class="font-bold text-lg tracking-tight"
										>{browserTabs[activeTabIndex].name}</span
									>
								</div>

								<div class="flex items-center gap-4 text-sm">
									<div class="text-right leading-tight">
										<div class="font-bold">{browserTabs[activeTabIndex].currentUser}</div>
										<div class="text-[10px] opacity-80 uppercase">
											{browserTabs[activeTabIndex].currentRole}
										</div>
									</div>
									<button
										on:click={() => logout(activeTabIndex)}
										class="bg-black/20 hover:bg-black/40 px-3 py-1.5 rounded text-xs transition"
										>Sign Out</button
									>
								</div>
							</nav>

							<div class="flex-1 p-8 bg-slate-50">
								{#if browserTabs[activeTabIndex].currentUser === superUser.user}
									<div
										class="bg-indigo-50 border border-indigo-200 p-4 rounded-lg mb-6 flex items-start gap-3"
									>
										<div class="text-2xl">⚡</div>
										<div>
											<h3 class="text-indigo-900 font-bold text-sm">Super Admin Mode Active</h3>
											<p class="text-indigo-700 text-xs">
												Global override session via Central Dashboard.
											</p>
										</div>
									</div>
								{/if}
								<h2 class="text-2xl font-bold text-slate-800 mb-6">Overview</h2>
								<div class="grid grid-cols-3 gap-6 opacity-50 select-none">
									<div class="h-40 bg-slate-200 rounded animate-pulse"></div>
									<div class="h-40 bg-slate-200 rounded animate-pulse"></div>
									<div class="h-40 bg-slate-200 rounded animate-pulse"></div>
								</div>
							</div>
						</div>
					{:else}
						<div class="h-full flex items-center justify-center bg-slate-50">
							<div
								class="w-full max-w-sm bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center relative overflow-hidden"
							>
								<div
									class={`absolute top-0 left-0 w-full h-2 ${browserTabs[activeTabIndex].color}`}
								></div>

								<div
									class={`w-16 h-16 rounded-2xl ${browserTabs[activeTabIndex].color} mx-auto mb-6 flex items-center justify-center text-white text-3xl font-bold shadow-lg rotate-3`}
								>
									{browserTabs[activeTabIndex].name[0]}
								</div>

								<h2 class="text-2xl font-bold text-slate-800">
									{browserTabs[activeTabIndex].name}
								</h2>
								<p class="text-slate-400 text-sm mb-8 mt-2">Secure Employee Access</p>

								<form
									on:submit|preventDefault={(e) =>
										manualBrowserLogin(
											activeTabIndex,
											e.target.username.value,
											e.target.password.value
										)}
									class="space-y-4 text-left"
								>
									<div>
										<label class="block text-xs font-bold text-slate-600 uppercase mb-1 ml-1"
											>Username</label
										>
										<input
											name="username"
											type="text"
											placeholder="e.g. agent_khalid"
											class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
											required
										/>
									</div>
									<div>
										<label class="block text-xs font-bold text-slate-600 uppercase mb-1 ml-1"
											>Password</label
										>
										<input
											name="password"
											type="password"
											placeholder="••••••••"
											class="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-800"
											required
										/>
									</div>

									{#if browserTabs[activeTabIndex].loginError}
										<div
											class="text-red-500 text-xs text-center font-bold bg-red-50 p-2 rounded animate-bounce"
										>
											{browserTabs[activeTabIndex].loginError}
										</div>
									{/if}

									<button
										type="submit"
										class={`w-full py-3 rounded-lg text-white font-bold shadow-lg shadow-slate-200 active:scale-95 transition-all ${browserTabs[activeTabIndex].color}`}
									>
										Sign In
									</button>
								</form>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</main>
</div>

<style>
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: #1e293b;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: #475569;
		border-radius: 4px;
	}
</style>
