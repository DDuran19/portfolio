<script lang="ts">
	import Chip from '$lib/components/Chip/Chip.svelte';
	import SearchPage from '$lib/components/SearchPage.svelte';
	import UIcon from '$lib/components/Icon/UIcon.svelte';
	import { BLOGS } from '$lib/params';
	import { onMount } from 'svelte';

	const { items, title } = BLOGS;

	const description =
		'Collection of technical articles and insights on web development, performance optimization, security, and best practices.';

	let search = $state('');
	let selectedTag = $state('');

	const allTags = [...new Set(items.flatMap((b) => b.tags))].sort();

	const onSearch = (value: string) => {
		search = value;
	};

	onMount(() => {
		const queryParams = new URLSearchParams(location.search);
		const item = queryParams.get('item');
		if (item) search = item;
	});

	let displayed = $derived(
		items.filter((blog) => {
			const matchesSearch =
				search.trim().length === 0 ||
				blog.title.toLowerCase().includes(search.trim().toLowerCase()) ||
				blog.description.toLowerCase().includes(search.trim().toLowerCase()) ||
				blog.tags.some((tag) => tag.toLowerCase().includes(search.trim().toLowerCase()));

			const matchesTag = !selectedTag || blog.tags.includes(selectedTag);

			return matchesSearch && matchesTag;
		})
	);
</script>

<SearchPage {title} {description} {onSearch}>
	<div class="blogs-filters">
		{#each allTags as tag}
			<Chip
				active={selectedTag === tag}
				classes={'text-0.8em'}
				onclick={() => (selectedTag = selectedTag === tag ? '' : tag)}
			>
				{tag}
			</Chip>
		{/each}
	</div>

	{#if displayed.length === 0}
		<div class="p-5 col-center gap-3 m-y-auto text-[var(--accent-text)] flex-1">
			<UIcon icon="i-carbon-document" classes="text-3.5em" />
			<p class="font-300">Could not find any articles...</p>
		</div>
	{:else}
		<div class="blogs-list mt-5">
			{#each displayed as blog}
				<a href={`/blog/${blog.slug}`} class="blog-card">
					{#if blog.coverImage}
						<img src={blog.coverImage} alt={blog.coverImageAlt} class="blog-cover" loading="lazy" />
					{/if}
					<div class="blog-body">
						<div class="blog-tags">
							{#each blog.tags as tag}
								<span class="blog-tag">{tag}</span>
							{/each}
						</div>
						<h3 class="blog-title">{blog.title}</h3>
						<p class="blog-excerpt">{blog.excerpt}</p>
						<div class="blog-meta">
							<span>{blog.date}</span>
							<span>{blog.author}</span>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</SearchPage>

<style lang="scss">
	.blogs-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.blogs-list {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;

		@media (max-width: 1350px) {
			grid-template-columns: repeat(2, 1fr);
		}
		@media (max-width: 850px) {
			grid-template-columns: repeat(1, 1fr);
		}
	}

	.blog-card {
		display: flex;
		flex-direction: column;
		border: 1px solid var(--border);
		border-radius: 8px;
		overflow: hidden;
		background: var(--main);
		text-decoration: none;
		color: inherit;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		}
	}

	.blog-cover {
		width: 100%;
		height: 160px;
		object-fit: cover;
	}

	.blog-body {
		display: flex;
		flex-direction: column;
		gap: 10px;
		padding: 16px;
		flex: 1;
	}

	.blog-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.blog-tag {
		font-size: 0.75em;
		padding: 2px 8px;
		border-radius: 12px;
		background: var(--accent);
		color: var(--accent-text);
	}

	.blog-title {
		font-size: 1em;
		font-weight: 600;
		margin: 0;
		line-height: 1.4;
		color: var(--main-text);
	}

	.blog-excerpt {
		font-size: 0.875em;
		color: var(--secondary-text);
		line-height: 1.6;
		margin: 0;
		flex: 1;
	}

	.blog-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.8em;
		color: var(--secondary-text);
		padding-top: 8px;
		border-top: 1px solid var(--border);
	}
</style>
