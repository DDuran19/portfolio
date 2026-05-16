<script lang="ts">
	import Chip from '$lib/components/Chip/Chip.svelte';
	import UIcon from '$lib/components/Icon/UIcon.svelte';

	interface Props {
		allTags: string[];
		selectedTags: string[];
		dateFilter: string;
		sortOrder: string;
		onApply: (tags: string[], date: string, sort: string) => void;
		onClose: () => void;
	}

	let { allTags, selectedTags, dateFilter, sortOrder, onApply, onClose }: Props = $props();

	let activeTab = $state<'tags' | 'date' | 'sort'>('tags');
	let localTags = $state<string[]>([...selectedTags]);
	let localDate = $state(dateFilter);
	let localSort = $state(sortOrder);
	let dialogEl: HTMLDialogElement;

	$effect(() => {
		dialogEl?.showModal();
	});

	const TAG_GROUPS: Record<string, string[]> = {
		Topics: [
			'API',
			'CI/CD',
			'DevOps',
			'QA',
			'UX',
			'security',
			'performance',
			'scalability',
			'testing',
			'best practices'
		],
		Infrastructure: [
			'deployment',
			'monitoring',
			'infrastructure',
			'reliability',
			'database',
			'dependencies',
			'integration'
		],
		Web: [
			'web development',
			'web design',
			'responsive design',
			'web analytics',
			'web applications',
			'website design'
		]
	};

	const ungrouped = allTags.filter((t) => !Object.values(TAG_GROUPS).flat().includes(t));

	function toggleTag(tag: string) {
		localTags = localTags.includes(tag) ? localTags.filter((t) => t !== tag) : [...localTags, tag];
	}

	function reset() {
		localTags = [];
		localDate = 'all';
		localSort = 'newest';
	}

	function apply() {
		onApply(localTags, localDate, localSort);
		onClose();
	}

	const DATE_OPTIONS = [
		{ value: 'all', label: 'All time' },
		{ value: '3mo', label: 'Last 3 months' },
		{ value: '6mo', label: 'Last 6 months' },
		{ value: 'year', label: 'This year' }
	];

	const SORT_OPTIONS = [
		{ value: 'newest', label: 'Newest first' },
		{ value: 'oldest', label: 'Oldest first' },
		{ value: 'az', label: 'A → Z' },
		{ value: 'za', label: 'Z → A' }
	];

	const activeCount = $derived(
		localTags.length + (localDate !== 'all' ? 1 : 0) + (localSort !== 'newest' ? 1 : 0)
	);
</script>

<dialog
	bind:this={dialogEl}
	onclose={onClose}
	onclick={(e) => e.target === dialogEl && onClose()}
	class="w-full max-w-[560px] max-h-[80vh] m-0 p-0 border border-[var(--border)] rounded-t-xl bg-[var(--main)] flex flex-col overflow-hidden"
>
	<!-- Header -->
	<div class="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
		<span class="text-[var(--main-text)] font-semibold text-sm">Filter articles</span>
		<button
			class="text-[var(--secondary-text)] hover:text-[var(--main-text)] hover:bg-[var(--secondary)] p-1 rounded-md cursor-pointer border-none bg-transparent"
			onclick={onClose}
			aria-label="Close"
		>
			<UIcon icon="i-carbon-close" />
		</button>
	</div>

	<!-- Tabs -->
	<div class="tab-bar">
		{#each ['tags', 'date', 'sort'] as const as tab}
			<button onclick={() => (activeTab = tab)} class="tab-btn {activeTab === tab ? 'active' : ''}">
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Body -->
	<div class="overflow-y-auto p-5 flex flex-col gap-5 h-[80vh]">
		{#if activeTab === 'tags'}
			{#each Object.entries(TAG_GROUPS) as [group, tags]}
				{@const visible = tags.filter((t) => allTags.includes(t))}
				{#if visible.length}
					<div>
						<div
							class="text-[10px] font-semibold uppercase tracking-widest text-[var(--secondary-text)] mb-2.5"
						>
							{group}
						</div>
						<div class="flex flex-wrap">
							{#each visible as tag}
								<Chip active={localTags.includes(tag)} onclick={() => toggleTag(tag)}>{tag}</Chip>
							{/each}
						</div>
					</div>
				{/if}
			{/each}
			{#if ungrouped.length}
				<div>
					<div
						class="text-[10px] font-semibold uppercase tracking-widest text-[var(--secondary-text)] mb-2.5"
					>
						Other
					</div>
					<div class="flex flex-wrap">
						{#each ungrouped as tag}
							<Chip active={localTags.includes(tag)} onclick={() => toggleTag(tag)}>{tag}</Chip>
						{/each}
					</div>
				</div>
			{/if}
		{:else if activeTab === 'date'}
			<div class="flex flex-wrap">
				{#each DATE_OPTIONS as opt}
					<Chip active={localDate === opt.value} onclick={() => (localDate = opt.value)}
						>{opt.label}</Chip
					>
				{/each}
			</div>
		{:else}
			<div class="flex flex-wrap">
				{#each SORT_OPTIONS as opt}
					<Chip active={localSort === opt.value} onclick={() => (localSort = opt.value)}
						>{opt.label}</Chip
					>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Footer -->
	<div class="flex items-center gap-2.5 px-5 py-3.5 border-t border-[var(--border)]">
		<button
			onclick={reset}
			class="text-xs text-[var(--secondary-text)] hover:text-[var(--main-text)] bg-transparent border-none cursor-pointer px-3 py-2 rounded-md hover:bg-[var(--secondary)]"
		>
			Reset all
		</button>
		<button
			onclick={apply}
			class="flex-1 h-9 rounded-lg text-xs font-medium cursor-pointer border-none bg-[var(--cta)] text-white hover:bg-[var(--cta-hover)] transition-colors"
		>
			Apply{activeCount > 0 ? ` (${activeCount})` : ''}
		</button>
	</div>
</dialog>

<style>
	dialog {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 560px;
		max-height: 80vh;
		border-radius: 12px;
	}
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.5);
	}
	.tab-bar {
		display: flex;
		border-bottom: 1px solid var(--border);
		padding: 0 20px;
		gap: 4px;
	}
	.tab-btn {
		position: relative;
		padding: 10px 16px;
		font-size: 13px;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--secondary-text);
		transition: color 150ms;
		bottom: -1px; /* overlap the border-bottom */
	}
	.tab-btn:hover {
		color: var(--main-text);
	}
	.tab-btn.active {
		color: var(--main-text);
		font-weight: 500;
		border-bottom: 2px solid var(--cta);
	}
</style>
