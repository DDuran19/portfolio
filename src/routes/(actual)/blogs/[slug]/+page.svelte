<script lang="ts">
	import Markdown from '$lib/components/Markdown.svelte';
	import TabTitle from '$lib/components/TabTitle.svelte';
	import UIcon from '$lib/components/Icon/UIcon.svelte';
	import type { BlogPost } from '$lib/types';
	import { resolve } from '$app/paths';
	import { getScrollContext } from '$lib/stores/contexts/scroll.svelte';

	const scrollCtx = getScrollContext();
	scrollCtx.setTopId('__top__');
	$effect(() => {
		scrollCtx.setTopId('__top__');
		return () => {
			scrollCtx.resetTopId();
		};
	});
	interface Props {
		data: {
			post?: BlogPost;
			prev: BlogPost | null;
			next: BlogPost | null;
		};
	}

	let { data }: Props = $props();
	const { post, prev, next } = data;
</script>

<TabTitle title={post?.title ?? 'Blog'} description={post?.description ?? ''} />

<div class="pb-10 col flex-1">
	<span id="__top__" class="h-0 w-0"></span>

	{#if !post}
		<div class="p-5 col-center gap-3 m-y-auto text-[var(--accent-text)]">
			<UIcon icon="i-carbon-document" classes="text-3.5em" />
			<p class="font-300">Could not load post...</p>
		</div>
	{:else}
		<!-- Cover -->
		{#if post.coverImage}
			<div class="w-full overflow-hidden">
				<img src={post.coverImage} alt={post.coverImageAlt} class="w-full h-full object-cover" />
			</div>
		{/if}

		<div class="px-10px mx-auto">
			<!-- Header -->
			<div class="flex items-center gap-4 text-xs text-[var(--secondary-text)]">
				<span class="flex items-center gap-1">
					<UIcon icon="i-carbon-user" classes="text-0.9em" />
					{post.author}
				</span>
				<span class="flex items-center gap-1">
					<UIcon icon="i-carbon-calendar" classes="text-0.9em" />
					{post.date}
				</span>
				{#if post.lastUpdated && post.lastUpdated !== post.date}
					<span class="flex items-center gap-1">
						<UIcon icon="i-carbon-edit" classes="text-0.9em" />
						Updated {post.lastUpdated}
					</span>
				{/if}
			</div>

			<!-- Content -->
			<Markdown content={post.content} slug={post.slug} filename={post.slug} />

			<!-- Prev / Next -->
			<div class="mt-12 pt-6 border-t border-[var(--border)] grid grid-cols-2 gap-4">
				<div>
					{#if prev}
						<a
							href={resolve(`/blogs/${prev.slug}`)}
							class="flex flex-col gap-1 p-4 rounded-lg border border-[var(--border)] bg-[var(--main)] no-underline hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all"
						>
							<span class="flex items-center gap-1 text-xs text-[var(--secondary-text)]">
								<UIcon icon="i-carbon-arrow-left" classes="text-0.9em" />
								Previous
							</span>
							<span class="text-sm font-500 text-[var(--main-text)] line-clamp-2">{prev.title}</span
							>
						</a>
					{/if}
				</div>

				<div>
					{#if next}
						<a
							href={resolve(`/blogs/${next.slug}`)}
							class="flex flex-col gap-1 p-4 rounded-lg border border-[var(--border)] bg-[var(--main)] no-underline hover:border-[var(--border-hover)] hover:-translate-y-0.5 transition-all text-right"
						>
							<span
								class="flex items-center justify-end gap-1 text-xs text-[var(--secondary-text)]"
							>
								Next
								<UIcon icon="i-carbon-arrow-right" classes="text-0.9em" />
							</span>
							<span class="text-sm font-500 text-[var(--main-text)] line-clamp-2">{next.title}</span
							>
						</a>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
