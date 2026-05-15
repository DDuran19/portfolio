<script lang="ts">
	import { writable, derived } from 'svelte/store';
	import { fade } from 'svelte/transition';

	// ─── AUTH ────────────────────────────────────────────────────────────────────
	let showApp = false;
	let showLoginDialog = false;
	let loginError = '';
	let loginUsername = 'admin';
	let loginPassword = 'admin123';

	function handleLogin() {
		if (loginUsername === 'admin' && loginPassword === 'admin123') {
			showApp = true;
			showLoginDialog = false;
			loginError = '';
		} else {
			loginError = 'Invalid username or password.';
		}
	}

	function handleLogout() {
		showApp = false;
		loginUsername = '';
		loginPassword = '';
	}

	// ─── NAV ─────────────────────────────────────────────────────────────────────
	let activeTab = 'dashboard';

	const navItems = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'i-carbon-dashboard' },
		{ id: 'contacts', label: 'Contacts', icon: 'i-carbon-user-multiple' },
		{ id: 'marketing', label: 'Marketing Log', icon: 'i-carbon-location' },
		{ id: 'calendar', label: 'Calendar', icon: 'i-carbon-calendar' }
	];

	// ─── DATA ────────────────────────────────────────────────────────────────────
	let contacts = [
		{
			id: 1,
			name: 'Maria Santos',
			phone: '512-555-0101',
			email: 'maria@email.com',
			source: "St. David's Hospital",
			status: 'Interested',
			date: '2025-05-10',
			notes: 'Turning 65 in July'
		},
		{
			id: 2,
			name: 'Robert Kim',
			phone: '713-555-0188',
			email: 'rkim@email.com',
			source: 'Senior Expo - Dallas',
			status: 'Follow Up',
			date: '2025-05-12',
			notes: 'Currently on employer plan'
		},
		{
			id: 3,
			name: 'Linda Reyes',
			phone: '210-555-0144',
			email: 'linda.r@email.com',
			source: 'Baylor Clinic',
			status: 'Enrolled',
			date: '2025-05-08',
			notes: 'Enrolled in Plan G'
		},
		{
			id: 4,
			name: 'James Ortega',
			phone: '469-555-0177',
			email: 'jortega@email.com',
			source: 'Memorial Hermann',
			status: 'Not Interested',
			date: '2025-05-06',
			notes: 'Already covered by VA'
		},
		{
			id: 5,
			name: 'Susan Walker',
			phone: '214-555-0133',
			email: 'swalker@email.com',
			source: 'Senior Fair Austin',
			status: 'Interested',
			date: '2025-05-14',
			notes: 'Wants Plan N info'
		}
	];

	let activities = [
		{
			id: 1,
			place: "St. David's Medical Center",
			type: 'Hospital',
			contact: 'Nurse Manager - Joyce',
			date: '2025-05-10',
			result: 'Left brochures, 2 sign-ups',
			followUp: '2025-05-24'
		},
		{
			id: 2,
			place: 'Senior Expo Dallas',
			type: 'Public Event',
			contact: 'Event Coordinator',
			date: '2025-05-12',
			result: '15 interested, 3 contacts collected',
			followUp: '2025-05-19'
		},
		{
			id: 3,
			place: 'Baylor Scott & White Clinic',
			type: 'Clinic',
			contact: "Dr. Reyes' Office",
			date: '2025-05-08',
			result: 'Partnership discussion ongoing',
			followUp: '2025-05-22'
		},
		{
			id: 4,
			place: 'Memorial Hermann - Houston',
			type: 'Hospital',
			contact: 'Community Outreach Dir',
			date: '2025-05-06',
			result: 'Scheduled a lunch-and-learn for June',
			followUp: '2025-06-05'
		}
	];

	let events = [
		{
			id: 1,
			title: 'Visit Memorial Hermann',
			date: '2025-05-20',
			time: '10:00',
			type: 'Hospital Visit',
			reminder: true
		},
		{
			id: 2,
			title: 'Senior Fair - Austin',
			date: '2025-05-22',
			time: '09:00',
			type: 'Public Event',
			reminder: true
		},
		{
			id: 3,
			title: 'Follow up - Robert Kim',
			date: '2025-05-19',
			time: '14:00',
			type: 'Follow Up',
			reminder: false
		},
		{
			id: 4,
			title: 'Lunch & Learn - Hermann',
			date: '2025-06-05',
			time: '12:00',
			type: 'Hospital Visit',
			reminder: true
		}
	];

	// ─── CONTACTS STATE ──────────────────────────────────────────────────────────
	let contactSearch = '';
	let contactStatusFilter = 'All';
	let contactSort = 'date-desc';
	let showContactModal = false;
	let contactForm = {
		name: '',
		phone: '',
		email: '',
		source: '',
		status: 'Interested',
		date: '',
		notes: ''
	};

	// Contact Edit Drawer State
	let isContactDrawerOpen = false;
	let editingContact: any = null;

	const STATUS_LIST = ['All', 'Interested', 'Follow Up', 'Enrolled', 'Not Interested'];
	const CONTACT_SORTS = [
		{ value: 'date-desc', label: 'Newest First' },
		{ value: 'date-asc', label: 'Oldest First' },
		{ value: 'name-asc', label: 'Name A→Z' },
		{ value: 'name-desc', label: 'Name Z→A' }
	];
	const hour = new Date().getHours();
	const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

	$: filteredContacts = (() => {
		let list = contacts.filter((c) => {
			const q = contactSearch.toLowerCase();
			const matchQ =
				!q ||
				c.name.toLowerCase().includes(q) ||
				c.source.toLowerCase().includes(q) ||
				c.email.toLowerCase().includes(q);
			const matchS = contactStatusFilter === 'All' || c.status === contactStatusFilter;
			return matchQ && matchS;
		});
		if (contactSort === 'date-desc') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
		if (contactSort === 'date-asc') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
		if (contactSort === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
		if (contactSort === 'name-desc') list = [...list].sort((a, b) => b.name.localeCompare(a.name));
		return list;
	})();

	function addContact() {
		if (!contactForm.name.trim()) return;
		contacts = [...contacts, { ...contactForm, id: Date.now() }];
		contactForm = {
			name: '',
			phone: '',
			email: '',
			source: '',
			status: 'Interested',
			date: '',
			notes: ''
		};
		showContactModal = false;
	}

	function deleteContact(id: number) {
		contacts = contacts.filter((c) => c.id !== id);
	}

	function openContactDrawer(contact: any) {
		editingContact = { ...contact };
		isContactDrawerOpen = true;
	}

	function closeContactDrawer() {
		isContactDrawerOpen = false;
		setTimeout(() => {
			editingContact = null;
		}, 300);
	}

	function saveContactEdits() {
		const index = contacts.findIndex((c) => c.id === editingContact.id);
		if (index !== -1) {
			contacts[index] = { ...editingContact };
			contacts = [...contacts];
		}
		closeContactDrawer();
	}

	// ─── MARKETING STATE ─────────────────────────────────────────────────────────
	let mktSearch = '';
	let mktTypeFilter = 'All';
	let mktSort = 'date-desc';
	let showMktModal = false;
	let mktForm = { place: '', type: 'Hospital', contact: '', date: '', result: '', followUp: '' };

	// Mkt Edit Drawer State
	let isMktDrawerOpen = false;
	let editingActivity: any = null;

	const TYPE_LIST = ['All', 'Hospital', 'Clinic', 'Public Event', 'Follow Up'];
	const MKT_SORTS = [
		{ value: 'date-desc', label: 'Newest First' },
		{ value: 'date-asc', label: 'Oldest First' },
		{ value: 'place-asc', label: 'Place A→Z' }
	];

	$: filteredActivities = (() => {
		let list = activities.filter((a) => {
			const q = mktSearch.toLowerCase();
			const matchQ = !q || a.place.toLowerCase().includes(q) || a.contact.toLowerCase().includes(q);
			const matchT = mktTypeFilter === 'All' || a.type === mktTypeFilter;
			return matchQ && matchT;
		});
		if (mktSort === 'date-desc') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
		if (mktSort === 'date-asc') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
		if (mktSort === 'place-asc') list = [...list].sort((a, b) => a.place.localeCompare(b.place));
		return list;
	})();

	function addActivity() {
		if (!mktForm.place.trim()) return;
		activities = [...activities, { ...mktForm, id: Date.now() }];
		mktForm = { place: '', type: 'Hospital', contact: '', date: '', result: '', followUp: '' };
		showMktModal = false;
	}

	function deleteActivity(id: number) {
		activities = activities.filter((a) => a.id !== id);
	}

	function openMktDrawer(activity: any) {
		editingActivity = { ...activity };
		isMktDrawerOpen = true;
	}

	function closeMktDrawer() {
		isMktDrawerOpen = false;
		setTimeout(() => {
			editingActivity = null;
		}, 300);
	}

	function saveMktEdits() {
		const index = activities.findIndex((a) => a.id === editingActivity.id);
		if (index !== -1) {
			activities[index] = { ...editingActivity };
			activities = [...activities];
		}
		closeMktDrawer();
	}

	// ─── CALENDAR STATE ──────────────────────────────────────────────────────────
	let calSearch = '';
	let calTypeFilter = 'All';
	let calSort = 'date-asc';
	let showCalModal = false;
	let calForm = { title: '', date: '', time: '', type: 'Hospital Visit', reminder: false };

	// Event Edit Drawer State
	let isEventDrawerOpen = false;
	let editingEvent: any = null;

	const EVENT_TYPES = ['All', 'Hospital Visit', 'Clinic Visit', 'Public Event', 'Follow Up'];
	const CAL_SORTS = [
		{ value: 'date-asc', label: 'Soonest First' },
		{ value: 'date-desc', label: 'Latest First' },
		{ value: 'title-asc', label: 'Title A→Z' }
	];

	const today = new Date().toISOString().split('T')[0];

	$: filteredEvents = (() => {
		let list = events.filter((e) => {
			const q = calSearch.toLowerCase();
			const matchQ = !q || e.title.toLowerCase().includes(q);
			const matchT = calTypeFilter === 'All' || e.type === calTypeFilter;
			return matchQ && matchT;
		});
		if (calSort === 'date-asc') list = [...list].sort((a, b) => a.date.localeCompare(b.date));
		if (calSort === 'date-desc') list = [...list].sort((a, b) => b.date.localeCompare(a.date));
		if (calSort === 'title-asc') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
		return list;
	})();

	function addEvent() {
		if (!calForm.title.trim() || !calForm.date) return;
		events = [...events, { ...calForm, id: Date.now() }];
		calForm = { title: '', date: '', time: '', type: 'Hospital Visit', reminder: false };
		showCalModal = false;
	}

	function deleteEvent(id: number) {
		events = events.filter((e) => e.id !== id);
	}

	function openEventDrawer(event: any) {
		editingEvent = { ...event };
		isEventDrawerOpen = true;
	}

	function closeEventDrawer() {
		isEventDrawerOpen = false;
		setTimeout(() => {
			editingEvent = null;
		}, 300);
	}

	function saveEventEdits() {
		const index = events.findIndex((e) => e.id === editingEvent.id);
		if (index !== -1) {
			events[index] = { ...editingEvent };
			events = [...events];
		}
		closeEventDrawer();
	}

	// ─── HELPERS ─────────────────────────────────────────────────────────────────
	const STATUS_STYLE: Record<string, string> = {
		Interested: 'bg-blue-100 text-blue-700',
		'Follow Up': 'bg-amber-100 text-amber-700',
		Enrolled: 'bg-emerald-100 text-emerald-700',
		'Not Interested': 'bg-red-100 text-red-700'
	};

	const TYPE_STYLE: Record<string, string> = {
		Hospital: 'bg-rose-100 text-rose-700',
		Clinic: 'bg-violet-100 text-violet-700',
		'Public Event': 'bg-teal-100 text-teal-700',
		'Follow Up': 'bg-orange-100 text-orange-700',
		'Hospital Visit': 'bg-rose-100 text-rose-700',
		'Clinic Visit': 'bg-violet-100 text-violet-700'
	};

	const MONTHS = [
		'Jan',
		'Feb',
		'Mar',
		'Apr',
		'May',
		'Jun',
		'Jul',
		'Aug',
		'Sep',
		'Oct',
		'Nov',
		'Dec'
	];

	function getDay(d: string) {
		if (!d) return '';
		return parseInt(d.split('-')[2], 10);
	}

	function getMon(d: string) {
		if (!d) return '';
		return MONTHS[parseInt(d.split('-')[1], 10) - 1];
	}

	function fmtDate(d: string) {
		if (!d) return '';
		const parts = d.split('-');
		const m = MONTHS[parseInt(parts[1], 10) - 1];
		return `${m} ${parseInt(parts[2], 10)}, ${parts[0]}`;
	}

	$: enrolled = contacts.filter((c) => c.status === 'Enrolled').length;
	$: needFollowUp = contacts.filter((c) => c.status === 'Follow Up').length;
	$: upcomingCount = events.filter((e) => e.date >= today).length;
</script>

{#if !showApp}
	<div class="min-h-screen bg-[#f7f6f2] flex flex-col">
		<nav
			class="flex items-center justify-between px-12 py-5 border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10"
		>
			<div class="flex items-center gap-2.5">
				<div
					class="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white font-bold text-sm"
				>
					M
				</div>
				<span class="font-bold text-stone-800 tracking-tight text-lg">MedicJI</span>
			</div>
			<button
				on:click={() => (showLoginDialog = true)}
				class="bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors cursor-pointer"
			>
				Agent Login
			</button>
		</nav>

		<main class="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 gap-4">
			<div
				class="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full"
			>
				<span class="i-carbon-certificate w-3.5 h-3.5"></span>
				Licensed Medicare Insurance Agency · Texas
			</div>

			<h1 class="text-6xl font-bold text-stone-900 leading-tight max-w-2xl">
				Medicare Coverage <span class="text-teal-600 italic">Made Simple.</span>
			</h1>

			<p class="text-stone-500 text-xl max-w-xl leading-relaxed">
				We help Texans navigate Medicare with clarity, compassion, and zero pressure. Free
				consultations, personalized plan guidance.
			</p>

			<div class="flex items-center gap-4 mt-2">
				<button
					class="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm cursor-pointer"
				>
					Get a Free Consultation
				</button>
				<button
					class="border border-stone-300 hover:border-stone-400 text-stone-700 font-semibold px-8 py-3.5 rounded-xl transition-colors text-sm cursor-pointer"
				>
					Learn About Medicare
				</button>
			</div>
		</main>

		<section class="border-t border-stone-200 bg-white px-12 py-10">
			<div class="max-w-4xl mx-auto grid grid-cols-3 gap-4">
				{#each [{ icon: 'i-carbon-security', title: 'HIPAA Secure', desc: 'Your health information is protected and never shared.' }, { icon: 'i-carbon-favorite', title: 'Personalized Plans', desc: 'We match you with the right Medicare plan for your needs.' }, { icon: 'i-carbon-phone', title: 'Local Texas Agent', desc: 'Real human support — not a call center.' }] as f}
					<div class="flex flex-col gap-2">
						<span class="{f.icon} w-6 h-6 text-teal-600"></span>
						<p class="font-bold text-stone-800">{f.title}</p>
						<p class="text-stone-500 text-sm leading-relaxed">{f.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<footer class="text-center text-xs text-stone-400 py-5 border-t border-stone-200">
			© 2026 MedicJI Insurance Agency · Texas · www.medicji.com
		</footer>
	</div>

	{#if showLoginDialog}
		<div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
			<div
				class="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 flex flex-col gap-5 overflow-hidden"
			>
				<div class="flex items-center justify-between">
					<div>
						<h2 class="text-xl font-bold text-stone-800">Agent Login</h2>
						<p class="text-sm text-stone-400">Internal access only</p>
					</div>
					<button
						on:click={() => {
							showLoginDialog = false;
							loginError = '';
						}}
						class="text-stone-400 hover:text-stone-600 cursor-pointer"
					>
						<span class="i-carbon-close w-5 h-5"></span>
					</button>
				</div>

				<div class="flex flex-col gap-3">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
							>Username</label
						>
						<input
							bind:value={loginUsername}
							type="text"
							placeholder="admin"
							class="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							on:keydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>
					<div class="flex flex-col gap-1 w-full">
						<label class="text-xs font-semibold text-stone-500 uppercase tracking-wide"
							>Password</label
						>
						<input
							bind:value={loginPassword}
							type="password"
							placeholder="••••••••"
							class="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							on:keydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>
					<span class="text-xs text-muted-foreground"
						>Use admin as username and admin123 as password</span
					>
					{#if loginError}
						<p class="text-red-500 text-xs flex items-center gap-1">
							<span class="i-carbon-warning w-3.5 h-3.5"></span>{loginError}
						</p>
					{/if}
				</div>

				<button
					on:click={handleLogin}
					class="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm cursor-pointer"
				>
					Sign In
				</button>
			</div>
		</div>
	{/if}
{:else}
	<div class="flex h-screen bg-[#f5f4f0] overflow-hidden relative">
		<aside class="w-60 bg-[#1e1e1e] text-white flex flex-col shrink-0 relative z-10">
			<div class="px-5 py-5 border-b border-stone-700">
				<div class="flex items-center gap-2.5">
					<div
						class="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center font-bold text-sm"
					>
						M
					</div>
					<div>
						<p class="font-bold text-sm leading-none text-white">MedicJI</p>
						<p class="text-xs text-stone-300 mt-0.5">Agency Dashboard</p>
					</div>
				</div>
			</div>

			<nav class="flex flex-col gap-1 p-3 flex-1">
				{#each navItems as item}
					<button
						on:click={() => (activeTab = item.id)}
						class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer w-full text-left
			{activeTab === item.id
							? 'bg-teal-600 text-white'
							: 'bg-transparent text-stone-300 hover:text-white hover:bg-stone-800'}"
					>
						<span class="{item.icon} w-4.5 h-4.5 shrink-0"></span>
						{item.label}
					</button>
				{/each}
			</nav>

			<div class="p-3 border-t border-stone-700">
				<button
					on:click={handleLogout}
					class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium bg-transparent text-stone-300 hover:text-red-400 hover:bg-stone-800 transition-colors cursor-pointer w-full text-left"
				>
					<span class="i-carbon-logout w-4.5 h-4.5 shrink-0"></span>
					Logout
				</button>
			</div>
		</aside>

		<main class="flex-1 overflow-y-auto overflow-x-hidden w-full">
			{#if activeTab === 'dashboard'}
				<div class="p-4 flex flex-col gap-6 max-w-5xl mx-auto">
					<div>
						<h1 class="text-2xl font-bold text-stone-800">{greeting}! 👋</h1>
						<p class="text-stone-500 text-sm mt-1">Here's your MedicJI agency overview.</p>
					</div>

					<div class="grid grid-cols-4 gap-4">
						{#each [{ label: 'Total Contacts', value: contacts.length, sub: 'All prospects', color: 'bg-white border border-stone-200', accent: 'text-stone-800' }, { label: 'Enrolled', value: enrolled, sub: 'Successfully enrolled', color: 'bg-emerald-600 text-white', accent: 'text-white' }, { label: 'Need Follow Up', value: needFollowUp, sub: 'Action required', color: 'bg-amber-500 text-white', accent: 'text-white' }, { label: 'Upcoming Events', value: upcomingCount, sub: 'Scheduled visits', color: 'bg-teal-600 text-white', accent: 'text-white' }] as s}
							<div class="rounded-2xl p-5 {s.color} flex flex-col gap-1 shadow-sm">
								<span class="text-3xl font-bold {s.accent}">{s.value}</span>
								<span class="text-sm font-semibold opacity-80">{s.label}</span>
								<span class="text-xs opacity-60">{s.sub}</span>
							</div>
						{/each}
					</div>

					<div class="grid grid-cols-2 gap-6">
						<div class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
							<h3 class="font-bold text-stone-700 mb-4 flex items-center gap-2">
								<span class="i-carbon-user-multiple w-4 h-4 text-teal-600"></span>
								Recent Contacts
							</h3>
							<div class="flex flex-col gap-2">
								{#each contacts.slice(0, 4) as c}
									<div
										class="flex items-center justify-between py-2 border-b border-stone-50 last:border-0"
									>
										<div>
											<p class="font-semibold text-sm text-stone-800">{c.name}</p>
											<p class="text-xs text-stone-500">{c.source}</p>
										</div>
										<span
											class="text-xs font-semibold px-2 py-0.5 rounded-full {STATUS_STYLE[
												c.status
											] ?? 'bg-stone-100 text-stone-600'}"
										>
											{c.status}
										</span>
									</div>
								{/each}
							</div>
						</div>

						<div class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
							<h3 class="font-bold text-stone-700 mb-4 flex items-center gap-2">
								<span class="i-carbon-calendar w-4 h-4 text-teal-600"></span>
								Upcoming Events
							</h3>
							<div class="flex flex-col gap-2">
								{#each events
									.filter((e) => e.date >= today)
									.sort((a, b) => a.date.localeCompare(b.date))
									.slice(0, 4) as e}
									<div class="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
										<div
											class="bg-teal-100 text-teal-700 rounded-lg px-2 py-1 text-center min-w-[40px]"
										>
											<p class="text-[10px] font-bold leading-none">{getMon(e.date)}</p>
											<p class="text-base font-bold leading-none">{getDay(e.date)}</p>
										</div>
										<div>
											<p class="font-semibold text-sm text-stone-800">{e.title}</p>
											<p class="text-xs text-stone-500">{e.time}</p>
										</div>
										{#if e.reminder}<span
												class="i-carbon-notification w-3.5 h-3.5 text-amber-400 ml-auto"
											></span>{/if}
									</div>
								{/each}
							</div>
						</div>
					</div>

					<div class="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
						<h3 class="font-bold text-stone-700 mb-4 flex items-center gap-2">
							<span class="i-carbon-location w-4 h-4 text-teal-600"></span>
							Recent Marketing Activity
						</h3>
						<div class="flex flex-col gap-2">
							{#each activities.slice(0, 3) as a}
								<div
									class="flex items-start justify-between py-2 border-b border-stone-50 last:border-0"
								>
									<div>
										<p class="font-semibold text-sm text-stone-800">{a.place}</p>
										<p class="text-xs text-stone-500">{fmtDate(a.date)} · {a.contact}</p>
										<p class="text-xs text-stone-600 mt-0.5">{a.result}</p>
									</div>
									<span
										class="text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-4 {TYPE_STYLE[
											a.type
										] ?? 'bg-stone-100 text-stone-600'}"
									>
										{a.type}
									</span>
								</div>
							{/each}
						</div>
					</div>
				</div>
			{:else if activeTab === 'contacts'}
				<div class="p-4 flex flex-col gap-5 max-w-[1400px] mx-auto">
					<div class="flex items-center justify-between mb-2">
						<div>
							<h1 class="text-3xl font-bold text-stone-800">Contacts</h1>
							<p class="text-stone-500 mt-1">
								{filteredContacts.length} of {contacts.length} shown
							</p>
						</div>
						<button
							on:click={() => (showContactModal = true)}
							class="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
						>
							<span class="i-carbon-add w-5 h-5"></span> Add Contact
						</button>
					</div>

					<div class="flex flex-col items-center gap-3 flex-wrap">
						<div class=" w-full justify-start">
							<div class="relative flex-1 max-w-md w-full">
								<span
									class="i-carbon-search w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"
								></span>
								<input
									bind:value={contactSearch}
									placeholder="Search name, source, email..."
									class="pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
								/>
							</div>
						</div>
						<div class=" w-full justify-start">
							<select
								bind:value={contactStatusFilter}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each STATUS_LIST as s}<option>{s}</option>{/each}
							</select>
							<select
								bind:value={contactSort}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each CONTACT_SORTS as s}<option value={s.value}>{s.label}</option>{/each}
							</select>
						</div>
					</div>

					<div class="bg-white rounded-xl shadow-sm border border-stone-100 overflow-x-auto w-full">
						<table class="w-full text-left text-sm border-collapse">
							<thead>
								<tr class="border-b border-stone-100 bg-stone-50/50">
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Name</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Contact</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Source</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Date</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Status</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Notes</th
									>
									<th class="px-5 py-3 text-right"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-stone-50">
								{#each filteredContacts as c}
									<tr
										class="hover:bg-stone-50 transition-colors group cursor-pointer"
										on:click={() => openContactDrawer(c)}
									>
										<td class="px-5 py-3 font-medium text-stone-800 whitespace-nowrap">{c.name}</td>
										<td class="px-5 py-3 whitespace-nowrap">
											<p class="text-stone-700">{c.phone}</p>
											<p class="text-stone-500 text-xs">{c.email}</p>
										</td>
										<td class="px-5 py-3 text-stone-600 min-w-[150px]">{c.source}</td>
										<td class="px-5 py-3 text-stone-600 whitespace-nowrap">{fmtDate(c.date)}</td>
										<td class="px-5 py-3 whitespace-nowrap">
											<span
												class="text-xs font-semibold px-2.5 py-1 rounded-full {STATUS_STYLE[
													c.status
												] ?? 'bg-stone-100 text-stone-600'}">{c.status}</span
											>
										</td>
										<td class="px-5 py-3 text-stone-500 text-sm min-w-[200px]">{c.notes}</td>
										<td
											class="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
										>
											<div class="flex items-center justify-end gap-2">
												<button
													on:click|stopPropagation={() => deleteContact(c.id)}
													class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
													title="Delete"
												>
													<span class="i-carbon-trash-can text-lg block"></span>
												</button>
											</div>
										</td>
									</tr>
								{/each}
								{#if filteredContacts.length === 0}
									<tr>
										<td colspan="7" class="px-5 py-14 text-center">
											<span class="i-carbon-user-multiple w-8 h-8 text-stone-300 block mx-auto mb-2"
											></span>
											<p class="text-stone-400 font-medium text-sm">No contacts found.</p>
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			{:else if activeTab === 'marketing'}
				<div class="p-4 flex flex-col gap-5 max-w-[1400px] mx-auto">
					<div class="flex items-center justify-between mb-2">
						<div>
							<h1 class="text-3xl font-bold text-stone-800">Marketing Log</h1>
							<p class="text-stone-500 mt-1">
								{filteredActivities.length} of {activities.length} shown
							</p>
						</div>
						<button
							on:click={() => (showMktModal = true)}
							class="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
						>
							<span class="i-carbon-add w-5 h-5"></span> Log Visit
						</button>
					</div>

					<div class="flex flex-col items-center gap-3 flex-wrap">
						<div class=" w-full justify-start">
							<div class="relative flex-1 max-w-md w-full">
								<span
									class="i-carbon-search w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"
								></span>
								<input
									bind:value={mktSearch}
									placeholder="Search name, source, email..."
									class="pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
								/>
							</div>
						</div>
						<div class=" w-full justify-start">
							<select
								bind:value={mktTypeFilter}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each TYPE_LIST as s}<option>{s}</option>{/each}
							</select>
							<select
								bind:value={mktSort}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each MKT_SORTS as s}<option value={s.value}>{s.label}</option>{/each}
							</select>
						</div>
					</div>

					<div class="bg-white rounded-xl shadow-sm border border-stone-100 overflow-x-auto w-full">
						<table class="w-full text-left text-sm border-collapse">
							<thead>
								<tr class="border-b border-stone-100 bg-stone-50/50">
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Place</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Type</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Point of Contact</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Date Visited</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Result</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Follow Up</th
									>
									<th class="px-5 py-3 text-right"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-stone-50">
								{#each filteredActivities as a}
									<tr
										class="hover:bg-stone-50 transition-colors group cursor-pointer"
										on:click={() => openMktDrawer(a)}
									>
										<td class="px-5 py-3 font-medium text-stone-800 min-w-[150px]">{a.place}</td>
										<td class="px-5 py-3 whitespace-nowrap">
											<span
												class="text-xs font-medium px-2.5 py-1 rounded-full {TYPE_STYLE[a.type] ??
													'bg-stone-100 text-stone-600'}">{a.type}</span
											>
										</td>
										<td class="px-5 py-3 text-stone-700 whitespace-nowrap">{a.contact}</td>
										<td class="px-5 py-3 text-stone-700 whitespace-nowrap">{fmtDate(a.date)}</td>
										<td class="px-5 py-3 text-stone-600 min-w-[200px]">{a.result}</td>
										<td class="px-5 py-3 text-teal-600 font-medium whitespace-nowrap"
											>{a.followUp ? fmtDate(a.followUp) : '—'}</td
										>
										<td
											class="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
										>
											<div class="flex items-center justify-end gap-2">
												<button
													on:click|stopPropagation={() => deleteActivity(a.id)}
													class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
													title="Delete"
												>
													<span class="i-carbon-trash-can text-lg block"></span>
												</button>
											</div>
										</td>
									</tr>
								{/each}
								{#if filteredActivities.length === 0}
									<tr>
										<td colspan="7" class="px-5 py-14 text-center">
											<span class="i-carbon-location w-8 h-8 text-stone-300 block mx-auto mb-2"
											></span>
											<p class="text-stone-400 font-medium text-sm">No activities found.</p>
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			{:else if activeTab === 'calendar'}
				<div class="p-4 flex flex-col gap-5 max-w-[1400px] mx-auto">
					<div class="flex items-center justify-between mb-2">
						<div>
							<h1 class="text-3xl font-bold text-stone-800">Calendar</h1>
							<p class="text-stone-500 mt-1">{filteredEvents.length} of {events.length} shown</p>
						</div>
						<button
							on:click={() => (showCalModal = true)}
							class="bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
						>
							<span class="i-carbon-add w-5 h-5"></span> Add Event
						</button>
					</div>

					<div class="flex flex-col items-center gap-3 flex-wrap">
						<div class=" w-full justify-start">
							<div class="relative flex-1 max-w-md w-full">
								<span
									class="i-carbon-search w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2"
								></span>
								<input
									bind:value={calSearch}
									placeholder="Search name, source, email..."
									class="pl-10 pr-4 py-2.5 border border-stone-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 w-full"
								/>
							</div>
						</div>
						<div class=" w-full justify-start">
							<select
								bind:value={calTypeFilter}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each EVENT_TYPES as s}<option>{s}</option>{/each}
							</select>
							<select
								bind:value={calSort}
								class="border border-stone-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 cursor-pointer"
							>
								{#each CAL_SORTS as s}<option value={s.value}>{s.label}</option>{/each}
							</select>
						</div>
					</div>
					<div class="bg-white rounded-xl shadow-sm border border-stone-100 overflow-x-auto w-full">
						<table class="w-full text-left text-sm border-collapse">
							<thead>
								<tr class="border-b border-stone-100 bg-stone-50/50">
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Date</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Time</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Title</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Type</th
									>
									<th
										class="px-5 py-3 font-semibold text-stone-500 text-xs uppercase tracking-wider whitespace-nowrap"
										>Status</th
									>
									<th class="px-5 py-3 text-right"></th>
								</tr>
							</thead>
							<tbody class="divide-y divide-stone-50">
								{#each filteredEvents as e}
									<tr
										class="hover:bg-stone-50 transition-colors group cursor-pointer"
										on:click={() => openEventDrawer(e)}
									>
										<td class="px-5 py-3 text-stone-700 whitespace-nowrap">
											{fmtDate(e.date)}
										</td>
										<td class="px-5 py-3 text-stone-600 whitespace-nowrap">{e.time || '—'}</td>
										<td class="px-5 py-3 font-medium text-stone-800 min-w-[200px]">
											<div class="flex items-center gap-2">
												{e.title}
												{#if e.reminder}<span
														class="i-carbon-notification w-3.5 h-3.5 text-amber-400"
													></span>{/if}
											</div>
										</td>
										<td class="px-5 py-3 whitespace-nowrap">
											<span
												class="text-xs font-medium px-2.5 py-1 rounded-full {TYPE_STYLE[e.type] ??
													'bg-stone-100 text-stone-600'}">{e.type}</span
											>
										</td>
										<td class="px-5 py-3 whitespace-nowrap">
											{#if e.date >= today}
												<span class="text-xs font-bold text-teal-600 uppercase tracking-wider"
													>Upcoming</span
												>
											{:else}
												<span class="text-xs font-bold text-stone-400 uppercase tracking-wider"
													>Past</span
												>
											{/if}
										</td>
										<td
											class="px-5 py-3 text-right opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
										>
											<div class="flex items-center justify-end gap-2">
												<button
													on:click|stopPropagation={() => deleteEvent(e.id)}
													class="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
													title="Delete"
												>
													<span class="i-carbon-trash-can text-lg block"></span>
												</button>
											</div>
										</td>
									</tr>
								{/each}
								{#if filteredEvents.length === 0}
									<tr>
										<td colspan="6" class="px-5 py-14 text-center">
											<span class="i-carbon-calendar w-8 h-8 text-stone-300 block mx-auto mb-2"
											></span>
											<p class="text-stone-400 font-medium text-sm">No events found.</p>
										</td>
									</tr>
								{/if}
							</tbody>
						</table>
					</div>
				</div>
			{/if}
		</main>

		{#if isContactDrawerOpen}
			<div
				transition:fade={{ duration: 200 }}
				class="absolute inset-0 bg-stone-900/20 z-40 backdrop-blur-sm"
				on:click={closeContactDrawer}
			></div>
			<div
				class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
			>
				{#if editingContact}
					<div
						class="flex justify-between items-center px-6 py-5 border-b border-stone-100 shrink-0"
					>
						<h3 class="text-xl font-bold text-stone-800">Edit Contact</h3>
						<button on:click={closeContactDrawer} class="text-stone-400 hover:text-stone-600">
							<span class="i-carbon-close text-2xl block"></span>
						</button>
					</div>
					<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Name</label>
							<input
								type="text"
								bind:value={editingContact.name}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</label>
							<input
								type="text"
								bind:value={editingContact.phone}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Email</label>
							<input
								type="email"
								bind:value={editingContact.email}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Source</label
							>
							<input
								type="text"
								bind:value={editingContact.source}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Status</label
							>
							<select
								bind:value={editingContact.status}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
							>
								{#each STATUS_LIST.filter((s) => s !== 'All') as status}
									<option>{status}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
								>Date Met</label
							>
							<input
								type="date"
								bind:value={editingContact.date}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Notes</label>
							<textarea
								bind:value={editingContact.notes}
								rows="4"
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-sm"
							></textarea>
						</div>
					</div>
					<div
						class="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0"
					>
						<button
							on:click={closeContactDrawer}
							class="px-5 py-2.5 text-stone-600 hover:bg-stone-200 rounded-xl transition-colors font-semibold text-sm"
							>Cancel</button
						>
						<button
							on:click={saveContactEdits}
							class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-semibold shadow-sm text-sm"
							>Save Changes</button
						>
					</div>
				{/if}
			</div>
		{/if}

		{#if isMktDrawerOpen}
			<div
				transition:fade={{ duration: 200 }}
				class="absolute inset-0 bg-stone-900/20 z-40 backdrop-blur-sm"
				on:click={closeMktDrawer}
			></div>
			<div
				class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
			>
				{#if editingActivity}
					<div
						class="flex justify-between items-center px-6 py-5 border-b border-stone-100 shrink-0"
					>
						<h3 class="text-xl font-bold text-stone-800">Edit Log Entry</h3>
						<button on:click={closeMktDrawer} class="text-stone-400 hover:text-stone-600">
							<span class="i-carbon-close text-2xl block"></span>
						</button>
					</div>
					<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Place</label>
							<input
								type="text"
								bind:value={editingActivity.place}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Type</label>
							<select
								bind:value={editingActivity.type}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
							>
								{#each TYPE_LIST.filter((t) => t !== 'All') as type}
									<option>{type}</option>
								{/each}
							</select>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
								>Date Visited</label
							>
							<input
								type="date"
								bind:value={editingActivity.date}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
								>Point of Contact</label
							>
							<input
								type="text"
								bind:value={editingActivity.contact}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Result</label
							>
							<textarea
								bind:value={editingActivity.result}
								rows="4"
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-sm"
							></textarea>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
								>Follow Up Date</label
							>
							<input
								type="date"
								bind:value={editingActivity.followUp}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
					</div>
					<div
						class="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0"
					>
						<button
							on:click={closeMktDrawer}
							class="px-5 py-2.5 text-stone-600 hover:bg-stone-200 rounded-xl transition-colors font-semibold text-sm"
							>Cancel</button
						>
						<button
							on:click={saveMktEdits}
							class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-semibold shadow-sm text-sm"
							>Save Changes</button
						>
					</div>
				{/if}
			</div>
		{/if}

		{#if isEventDrawerOpen}
			<div
				transition:fade={{ duration: 200 }}
				class="absolute inset-0 bg-stone-900/20 z-40 backdrop-blur-sm"
				on:click={closeEventDrawer}
			></div>
			<div
				class="absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
			>
				{#if editingEvent}
					<div
						class="flex justify-between items-center px-6 py-5 border-b border-stone-100 shrink-0"
					>
						<h3 class="text-xl font-bold text-stone-800">Edit Event</h3>
						<button on:click={closeEventDrawer} class="text-stone-400 hover:text-stone-600">
							<span class="i-carbon-close text-2xl block"></span>
						</button>
					</div>
					<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
								>Event Title</label
							>
							<input
								type="text"
								bind:value={editingEvent.title}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Date</label>
							<input
								type="date"
								bind:value={editingEvent.date}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Time</label>
							<input
								type="time"
								bind:value={editingEvent.time}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
							/>
						</div>
						<div class="flex flex-col gap-1.5">
							<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Type</label>
							<select
								bind:value={editingEvent.type}
								class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
							>
								{#each EVENT_TYPES.filter((t) => t !== 'All') as type}
									<option>{type}</option>
								{/each}
							</select>
						</div>
						<label
							class="flex items-center gap-3 text-sm font-bold text-stone-600 cursor-pointer pt-1"
						>
							<input
								type="checkbox"
								bind:checked={editingEvent.reminder}
								class="rounded w-4 h-4 accent-teal-600"
							/>
							Enable reminder
							<span class="i-carbon-notification w-4 h-4 text-amber-400"></span>
						</label>
					</div>
					<div
						class="px-6 py-4 border-t border-stone-100 bg-stone-50 flex justify-end gap-3 shrink-0"
					>
						<button
							on:click={closeEventDrawer}
							class="px-5 py-2.5 text-stone-600 hover:bg-stone-200 rounded-xl transition-colors font-semibold text-sm"
							>Cancel</button
						>
						<button
							on:click={saveEventEdits}
							class="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors font-semibold shadow-sm text-sm"
							>Save Changes</button
						>
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

{#if showContactModal}
	<div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden"
		>
			<div class="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
				<h3 class="font-bold text-stone-800 text-xl">Add Contact</h3>
				<button
					on:click={() => (showContactModal = false)}
					class="text-stone-400 hover:text-stone-600 cursor-pointer"
				>
					<span class="i-carbon-close w-6 h-6 block"></span>
				</button>
			</div>

			<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Full Name</label>
					<input
						type="text"
						bind:value={contactForm.name}
						placeholder="e.g. Maria Santos"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Phone</label>
					<input
						type="text"
						bind:value={contactForm.phone}
						placeholder="512-555-0000"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Email</label>
					<input
						type="email"
						bind:value={contactForm.email}
						placeholder="email@example.com"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Source / Where Met</label
					>
					<input
						type="text"
						bind:value={contactForm.source}
						placeholder="e.g. St. David's Hospital"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Status</label>
					<select
						bind:value={contactForm.status}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
					>
						{#each STATUS_LIST.filter((s) => s !== 'All') as s}<option>{s}</option>{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Date Met</label>
					<input
						type="date"
						bind:value={contactForm.date}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Notes</label>
					<textarea
						bind:value={contactForm.notes}
						rows="3"
						placeholder="Any additional notes..."
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-sm"
					></textarea>
				</div>
			</div>

			<div class="px-6 py-4 border-t border-stone-100 bg-stone-50 shrink-0">
				<button
					on:click={addContact}
					class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
				>
					Save Contact
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showMktModal}
	<div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden"
		>
			<div class="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
				<h3 class="font-bold text-stone-800 text-xl">Log Marketing Visit</h3>
				<button
					on:click={() => (showMktModal = false)}
					class="text-stone-400 hover:text-stone-600 cursor-pointer"
				>
					<span class="i-carbon-close w-6 h-6 block"></span>
				</button>
			</div>

			<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Place / Organization</label
					>
					<input
						type="text"
						bind:value={mktForm.place}
						placeholder="e.g. Baylor Scott & White"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Type</label>
					<select
						bind:value={mktForm.type}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
					>
						{#each TYPE_LIST.filter((t) => t !== 'All') as t}<option>{t}</option>{/each}
					</select>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Date Visited</label
					>
					<input
						type="date"
						bind:value={mktForm.date}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Point of Contact</label
					>
					<input
						type="text"
						bind:value={mktForm.contact}
						placeholder="e.g. Nurse Manager - Joyce"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Result / Notes</label
					>
					<textarea
						bind:value={mktForm.result}
						rows="3"
						placeholder="What happened? How many interested?"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all resize-none text-sm"
					></textarea>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Follow Up Date</label
					>
					<input
						type="date"
						bind:value={mktForm.followUp}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
			</div>

			<div class="px-6 py-4 border-t border-stone-100 bg-stone-50 shrink-0">
				<button
					on:click={addActivity}
					class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
				>
					Save Activity
				</button>
			</div>
		</div>
	</div>
{/if}

{#if showCalModal}
	<div class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
		<div
			class="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] flex flex-col overflow-hidden"
		>
			<div class="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
				<h3 class="font-bold text-stone-800 text-xl">Add Event</h3>
				<button
					on:click={() => (showCalModal = false)}
					class="text-stone-400 hover:text-stone-600 cursor-pointer"
				>
					<span class="i-carbon-close w-6 h-6 block"></span>
				</button>
			</div>

			<div class="px-6 py-5 flex-1 overflow-y-auto flex flex-col gap-4">
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider"
						>Event Title</label
					>
					<input
						type="text"
						bind:value={calForm.title}
						placeholder="e.g. Visit Memorial Hermann"
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Date</label>
					<input
						type="date"
						bind:value={calForm.date}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Time</label>
					<input
						type="time"
						bind:value={calForm.time}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-sm"
					/>
				</div>
				<div class="flex flex-col gap-1.5">
					<label class="text-xs font-bold text-stone-500 uppercase tracking-wider">Type</label>
					<select
						bind:value={calForm.type}
						class="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all cursor-pointer text-sm"
					>
						{#each EVENT_TYPES.filter((t) => t !== 'All') as t}<option>{t}</option>{/each}
					</select>
				</div>
				<label class="flex items-center gap-3 text-sm font-bold text-stone-600 cursor-pointer pt-1">
					<input
						type="checkbox"
						bind:checked={calForm.reminder}
						class="rounded w-4 h-4 accent-teal-600"
					/>
					Enable reminder
					<span class="i-carbon-notification w-4 h-4 text-amber-400"></span>
				</label>
			</div>

			<div class="px-6 py-4 border-t border-stone-100 bg-stone-50 shrink-0">
				<button
					on:click={addEvent}
					class="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
				>
					Save Event
				</button>
			</div>
		</div>
	</div>
{/if}
