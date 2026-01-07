<script>
	/**
	 * Svelte 4 Prototype: Dashboard vs Mock Browser
	 * No localStorage. All state is in-memory.
	 */
	import { fade, fly } from 'svelte/transition';

	// --- 1. MOCK DATA (UPDATED) ---

	const businesses = [
		{ id: 'b1', name: 'Ruwais Tourism', domain: 'ruwais-tours.ae', color: 'bg-blue-600' },
		{ id: 'b2', name: 'LWL', domain: 'lwl-group.com', color: 'bg-orange-600' },
		{ id: 'b3', name: 'BCP Transport', domain: 'bcp-logistics.net', color: 'bg-purple-600' },
		{ id: 'b4', name: 'Arak Cafe', domain: 'arak-coffee.com', color: 'bg-teal-600' },
		{ id: 'b5', name: 'Middle Class', domain: 'middleclass-shop.com', color: 'bg-pink-600' }
	];

	const mockUsers = {
		b1: { user: 'agent_khalid', pass: 'desert_safari!', role: 'Travel Coordinator' },
		b2: { user: 'admin_lwl', pass: 'corp_access_99', role: 'System Admin' },
		b3: { user: 'fleet_mgr', pass: 'trucks&buses', role: 'Logistics Head' },
		b4: { user: 'barista_lead', pass: 'espresso_shot', role: 'Store Manager' },
		b5: { user: 'retail_ops', pass: 'inventory2026', role: 'Merchandiser' }
	};

	// --- 2. STATE ---

	// Browser State (Right Side)
	// Tracks the session status of each "tab" independently
	let browserTabs = businesses.map((b) => ({
		...b,
		isLoggedIn: false,
		currentUser: null,
		currentRole: null
	}));

	let activeTabIndex = 0; // Which tab is currently visible in the browser
	let notification = null; // Top notification state

	// --- 3. LOGIC ---

	// Action: User clicks "Launch" from Left Dashboard
	function dashboardAutoLogin(index) {
		const bizId = businesses[index].id;
		const creds = mockUsers[bizId];

		// 1. Switch Browser Tab to this business
		activeTabIndex = index;

		// 2. Simulate API "Auto-Login" (Bypassing login screen)
		browserTabs[index].isLoggedIn = true;
		browserTabs[index].currentUser = creds.user;
		browserTabs[index].currentRole = creds.role; // Preserving the specific role from dashboard

		// 3. Show Notification
		showNotification(`SSO Success: Logged into ${businesses[index].name} as ${creds.role}`);
	}

	// Action: User manually logs in inside the Mock Browser
	function manualBrowserLogin(index, username) {
		if (!username) return;

		browserTabs[index].isLoggedIn = true;
		browserTabs[index].currentUser = username;
		browserTabs[index].currentRole = 'User'; // Generic role for manual login
	}

	// Action: Logout
	function logout(index) {
		browserTabs[index].isLoggedIn = false;
		browserTabs[index].currentUser = null;
		browserTabs[index].currentRole = null;
	}

	// Helper: Notification System
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
			<p class="text-slate-500 text-sm">Centralized Business Access</p>
		</div>

		<div class="p-6 flex-1 overflow-y-auto">
			<div class="mb-6 bg-slate-800/50 p-4 rounded-lg border border-slate-700">
				<h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
					Available Credentials
				</h3>
				<div class="space-y-3">
					{#each businesses as biz, i}
						<div class="flex items-center justify-between text-xs font-mono">
							<span class="text-slate-300">{biz.name}</span>
							<div class="text-right text-slate-500">
								<span class="text-indigo-300">{mockUsers[biz.id].user}</span> /
								<span class="cursor-help transition-all">{mockUsers[biz.id].pass}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<h3 class="text-sm font-semibold text-slate-300 mb-4">Your Businesses</h3>

			<div class="space-y-4">
				{#each businesses as biz, i}
					<div
						class="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between group hover:border-slate-600 transition-all"
					>
						<div class="flex items-center gap-3">
							<div
								class={`w-10 h-10 rounded-lg ${biz.color} flex items-center justify-center text-white font-bold shadow-lg`}
							>
								{biz.name[0]}
							</div>
							<div>
								<div class="font-medium text-slate-200">{biz.name}</div>
								<div class="text-xs text-slate-500">{biz.domain}</div>
							</div>
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

		<div class="p-4 border-t border-slate-800 text-xs text-slate-600 text-center">
			v1.0.0 &bull; Secure Dashboard Environment
		</div>
	</aside>

	<main class="w-2/3 flex flex-col bg-slate-950 relative">
		{#if notification}
			<div
				transition:fly={{ y: -20, duration: 300 }}
				class="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white px-6 py-2 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2"
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
							px-4 py-2 rounded-t-lg text-xs font-medium flex items-center gap-2 min-w-[140px] transition-colors
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
							<span class="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-auto" title="Active Session"
							></span>
						{/if}
					</button>
				{/each}
				<div
					class="px-3 py-2 text-slate-500 text-lg leading-none hover:text-slate-300 cursor-pointer"
				>
					+
				</div>
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
					<span class="text-slate-600">🔒 Secure</span>
				</div>
			</div>
		</div>

		<div class="flex-1 bg-white relative overflow-hidden">
			{#key activeTabIndex}
				<div in:fade={{ duration: 200 }} class="absolute inset-0 h-full w-full">
					{#if browserTabs[activeTabIndex].isLoggedIn}
						<div class="h-full flex flex-col">
							<nav
								class={`${browserTabs[activeTabIndex].color} p-4 text-white flex justify-between items-center shadow-md`}
							>
								<div class="font-bold text-lg">{browserTabs[activeTabIndex].name}</div>
								<div class="flex items-center gap-4 text-sm">
									<span>Hello, <b>{browserTabs[activeTabIndex].currentUser}</b></span>
									<button
										on:click={() => logout(activeTabIndex)}
										class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition"
										>Logout</button
									>
								</div>
							</nav>

							<div class="flex-1 p-8 bg-slate-50">
								<h2 class="text-3xl font-bold text-slate-800 mb-4">Welcome back!</h2>
								<div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
									<p class="text-slate-600 mb-2">Current Role Session:</p>
									<span
										class="inline-block px-3 py-1 rounded bg-slate-100 text-slate-800 font-mono text-sm border border-slate-300"
									>
										{browserTabs[activeTabIndex].currentRole}
									</span>
								</div>

								<div class="grid grid-cols-3 gap-4 opacity-50 pointer-events-none select-none">
									<div class="h-32 bg-slate-200 rounded animate-pulse"></div>
									<div class="h-32 bg-slate-200 rounded animate-pulse"></div>
									<div class="h-32 bg-slate-200 rounded animate-pulse"></div>
								</div>
							</div>
						</div>
					{:else}
						<div class="h-full flex items-center justify-center bg-slate-50">
							<div
								class="w-full max-w-sm bg-white p-8 rounded-xl shadow-xl border border-slate-100 text-center"
							>
								<div
									class={`w-16 h-16 rounded-full ${browserTabs[activeTabIndex].color} mx-auto mb-6 flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
								>
									{browserTabs[activeTabIndex].name[0]}
								</div>
								<h2 class="text-xl font-bold text-slate-800 mb-1">
									{browserTabs[activeTabIndex].name}
								</h2>
								<p class="text-slate-400 text-sm mb-6">Please sign in to continue</p>

								<form
									on:submit|preventDefault={(e) =>
										manualBrowserLogin(activeTabIndex, e.target.username.value)}
									class="space-y-4 text-left"
								>
									<div>
										<label class="block text-xs font-semibold text-slate-500 mb-1">Username</label>
										<input
											name="username"
											type="text"
											placeholder="Enter any name..."
											class="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-black"
											required
										/>
									</div>
									<div>
										<label class="block text-xs font-semibold text-slate-500 mb-1">Password</label>
										<input
											type="password"
											placeholder="••••••"
											class="w-full border border-slate-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-black"
										/>
									</div>
									<button
										type="submit"
										class={`w-full py-2 rounded text-white font-semibold shadow-md active:scale-95 transition-all ${browserTabs[activeTabIndex].color}`}
									>
										Sign In
									</button>
								</form>

								<div class="mt-6 text-xs text-slate-400">
									<p>
										Don't have an account? <span class="text-indigo-500 underline cursor-pointer"
											>Sign up</span
										>
									</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</div>
	</main>
</div>
