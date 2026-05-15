<script lang="ts">
	import SearchPage from '$lib/components/SearchPage.svelte';
	import UIcon from '$lib/components/Icon/UIcon.svelte';
	import { base } from '$app/paths';
	import { sampleComponents } from '$lib/md/sample/index';

	const title = 'Samples';
	const description =
		'Interactive demos by Denver Duran — embeddable widgets, shipping integrations, multi-tenant dashboards, and more. Built with SvelteKit and TypeScript.';

	let search = $state('');

	let displayed = $derived(sampleComponents.filter((s) => {
		const q = search.trim().toLowerCase();
		return q.length === 0 || s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
	}));

	const onSearch = (e: CustomEvent<{ search: string }>) => {
		search = e.detail.search;
	};
</script>

<SearchPage {title} {description} on:search={onSearch}>
	{#if displayed.length === 0}
		<div class="p-5 col-center gap-3 m-y-auto text-[var(--accent-text)] flex-1">
			<UIcon icon="i-carbon-cube" classes="text-3.5em" />
			<p class="font-300">Could not find anything...</p>
		</div>
	{:else}
		<div class="samples-list mt-5">
			{#each displayed as sample (sample.slug)}
				<a href="{base}/sample/{sample.slug}" class="sample-card decoration-none">
					<div class="sample-card-icon">
						<UIcon icon="i-carbon-application" classes="text-1.5em" />
					</div>
					<div class="sample-card-body">
						<p class="sample-card-name">{sample.name}</p>
						<p class="sample-card-desc">{sample.description}</p>
					</div>
					<div class="sample-card-arrow">
						<UIcon icon="i-carbon-arrow-right" classes="text-1em" />
					</div>
				</a>
			{/each}
		</div>
	{/if}
</SearchPage>

<style lang="scss">
	.samples-list {
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

	.sample-card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.25rem;
		border-radius: 12px;
		border: 1px solid var(--border);
		background: var(--main);
		color: var(--main-text);
		transition:
			border-color 0.2s,
			box-shadow 0.2s,
			transform 0.2s;
		cursor: pointer;
		position: relative;

		&:hover {
			border-color: var(--accent);
			box-shadow: 0 4px 24px 0 rgba(0, 0, 0, 0.12);
			transform: translateY(-2px);

			.sample-card-arrow {
				opacity: 1;
				transform: translateX(2px);
			}
		}
	}

	.sample-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		border-radius: 8px;
		background: var(--accent-nav-item-hover);
		color: var(--accent-text);
		flex-shrink: 0;
	}

	.sample-card-body {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		flex: 1;
	}

	.sample-card-name {
		font-size: 1rem;
		font-weight: 600;
		color: var(--main-text);
		margin: 0;
	}

	.sample-card-desc {
		font-size: 0.8rem;
		color: var(--tertiary-text);
		line-height: 1.55;
		margin: 0;
	}

	.sample-card-arrow {
		align-self: flex-end;
		color: var(--accent-text);
		opacity: 0;
		transition:
			opacity 0.2s,
			transform 0.2s;
	}
</style>
