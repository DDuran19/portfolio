<script lang="ts">
	import BlogFilterModal from './BlogFilterModal.svelte';
	import SearchPage from '$lib/components/SearchPage.svelte';
	import UIcon from '$lib/components/Icon/UIcon.svelte';
	import { BLOGS } from '$lib/params';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	const { items, title } = BLOGS;

	const description =
		'Collection of technical articles and insights on web development, performance optimization, security, and best practices.';

	let search = $state('');
	let showFilterModal = $state(false);
	let selectedTags = $state<string[]>([]);
	let dateFilter = $state('all');
	let sortOrder = $state('newest');

	const allTags = [...new Set(items.flatMap((b) => b.tags))].sort();

	const onSearch = (value: string) => {
		search = value;
	};

	onMount(() => {
		const queryParams = new URLSearchParams(location.search);
		const item = queryParams.get('item');
		if (item) search = item;
	});

	function applyFilters(tags: string[], date: string, sort: string) {
		selectedTags = tags;
		dateFilter = date;
		sortOrder = sort;
	}

	function matchesDate(blogDate: string): boolean {
		if (dateFilter === 'all') return true;
		const d = new Date(blogDate);
		const now = new Date();
		const months = ({ '3mo': 3, '6mo': 6, year: 12 } as Record<string, number>)[dateFilter] ?? 999;
		const cutoff = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
		return d >= cutoff;
	}

	const activeCount = $derived(
		selectedTags.length + (dateFilter !== 'all' ? 1 : 0) + (sortOrder !== 'newest' ? 1 : 0)
	);

	let displayed = $derived(
		items
			.filter((blog) => {
				const matchesSearch =
					search.trim().length === 0 ||
					blog.title.toLowerCase().includes(search.trim().toLowerCase()) ||
					blog.description.toLowerCase().includes(search.trim().toLowerCase()) ||
					blog.tags.some((tag) => tag.toLowerCase().includes(search.trim().toLowerCase()));

				const matchesTags =
					selectedTags.length === 0 || selectedTags.some((t) => blog.tags.includes(t));
				return matchesSearch && matchesTags && matchesDate(blog.date);
			})
			.sort((a, b) => {
				if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
				if (sortOrder === 'az') return a.title.localeCompare(b.title);
				if (sortOrder === 'za') return b.title.localeCompare(a.title);
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			})
	);
	const DATE_LABELS: Record<string, string> = {
		'3mo': 'Last 3 months',
		'6mo': 'Last 6 months',
		year: 'This year'
	};
</script>

<SearchPage {title} {description} {onSearch}>
	<!-- Filter bar -->
	<div class="flex flex-wrap items-center gap-2">
		<button
			onclick={() => (showFilterModal = true)}
			class="flex items-center gap-1.5 px-3 h-8 rounded-full text-xs border border-solid cursor-pointer transition-colors
    {activeCount > 0
				? 'border-[var(--cta)] text-[var(--cta)] bg-transparent'
				: 'border-[var(--border)] text-[var(--secondary-text)] bg-transparent hover:text-[var(--main-text)] hover:border-[var(--border-hover)]'}"
		>
			<UIcon icon="i-carbon-settings-adjust" classes="text-0.9em" />
			Filters
			{#if activeCount > 0}
				<span
					class="flex items-center justify-center w-4 h-4 rounded-full bg-[var(--cta)] text-white text-[10px] font-medium"
				>
					{activeCount}
				</span>
			{/if}
		</button>

		<!-- Active tag pills -->
		{#each selectedTags as tag}
			<button
				onclick={() => (selectedTags = selectedTags.filter((t) => t !== tag))}
				class="flex items-center gap-1 px-2.5 h-7 rounded-full text-xs border border-[var(--cta)] text-[var(--cta)] bg-transparent cursor-pointer hover:bg-[var(--secondary)] transition-colors"
			>
				{tag}
				<UIcon icon="i-carbon-close" classes="text-0.8em" />
			</button>
		{/each}

		{#if dateFilter !== 'all'}
			<button
				onclick={() => (dateFilter = 'all')}
				class="flex items-center gap-1 px-2.5 h-7 rounded-full text-xs border border-[var(--cta)] text-[var(--cta)] bg-transparent cursor-pointer hover:bg-[var(--secondary)] transition-colors"
			>
				{DATE_LABELS[dateFilter] ?? dateFilter}
				<UIcon icon="i-carbon-close" classes="text-0.8em" />
			</button>
		{/if}

		{#if activeCount > 0}
			<button
				onclick={() => {
					selectedTags = [];
					dateFilter = 'all';
					sortOrder = 'newest';
				}}
				class="text-xs text-[var(--secondary-text)] hover:text-[var(--main-text)] underline bg-transparent border-none cursor-pointer px-1"
			>
				Clear all
			</button>
		{/if}
	</div>

	<!-- Empty state -->
	{#if displayed.length === 0}
		<div class="p-5 col-center gap-3 m-y-auto text-[var(--accent-text)] flex-1">
			<UIcon icon="i-carbon-document" classes="text-3.5em" />
			<p class="font-300">Could not find any articles...</p>
		</div>
	{:else}
		<div class="grid gap-5 mt-5 grid-cols-3 lt-xl:grid-cols-2 lt-md:grid-cols-1">
			{#each displayed as blog}
				<a
					href={resolve(`/blogs/${blog.slug}`)}
					class="flex flex-col border border-[var(--border)] rounded-lg overflow-hidden bg-[var(--main)] no-underline text-inherit transition-transform transition-shadow hover:-translate-y-0.5 hover:shadow-lg"
				>
					{#if blog.coverImage}
						<img
							src={blog.coverImage}
							alt={blog.coverImageAlt}
							class="w-full h-40 object-cover"
							loading="lazy"
						/>
					{/if}
					<div class="flex flex-col gap-2.5 p-4 flex-1">
						<div class="flex flex-wrap gap-1.5">
							{#each blog.tags as tag}
								<span
									class="text-[0.75em] px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-text)]"
								>
									{tag}
								</span>
							{/each}
						</div>
						<h3 class="text-[1em] font-600 m-0 leading-snug text-[var(--main-text)]">
							{blog.title}
						</h3>
						<p class="text-[0.875em] text-[var(--secondary-text)] leading-relaxed m-0 flex-1">
							{blog.excerpt}
						</p>
						<div
							class="flex justify-between text-[0.8em] text-[var(--secondary-text)] pt-2 border-t border-[var(--border)]"
						>
							<span>{blog.date}</span>
							<span>{blog.author}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</SearchPage>

{#if showFilterModal}
	<BlogFilterModal
		{allTags}
		{selectedTags}
		{dateFilter}
		{sortOrder}
		onApply={applyFilters}
		onClose={() => (showFilterModal = false)}
	/>
{/if}
