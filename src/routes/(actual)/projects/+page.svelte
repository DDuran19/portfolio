<script lang="ts">
	import Chip from '$lib/components/Chip/Chip.svelte';
	import ProjectCard from '$lib/components/ProjectCard/ProjectCard.svelte';
	import SearchPage from '$lib/components/SearchPage.svelte';
	import { PROJECTS } from '$lib/params';
	import type { Skill } from '$lib/types';
	import { onMount } from 'svelte';
	import MY_SKILLS from '$lib/skills.params';
	import UIcon from '$lib/components/Icon/UIcon.svelte';

	interface SkillFilter extends Skill {
		isSelected?: boolean;
	}

	const { items, title } = PROJECTS;

	const description =
		'Portfolio of Denver Duran — custom POS systems, multi-tenant platforms, e-commerce sites, and edge-native web apps built solo with SvelteKit and Cloudflare.';

	let filters = $state<Array<SkillFilter>>(
		MY_SKILLS.filter((it) =>
			items.some((project) => project.skills.some((skill) => skill.slug === it.slug))
		)
	);

	let search = $state('');

	const isSelected = (slug: string): boolean =>
		filters.some((item) => item.slug === slug && item.isSelected);

	const onSelected = (slug: string) => {
		filters = filters.map((tech) =>
			tech.slug === slug ? { ...tech, isSelected: !isSelected(slug) } : tech
		);
	};

	let displayed = $derived(
		items.filter((project) => {
			const isFiltered =
				filters.every((item) => !item.isSelected) ||
				project.skills.some((tech) =>
					filters.some((filter) => filter.isSelected && filter.slug === tech.slug)
				);

			const isSearched =
				search.trim().length === 0 ||
				project.name.trim().toLowerCase().includes(search.trim().toLowerCase());

			return isFiltered && isSearched;
		})
	);

	const onSearch = (value: string) => {
		search = value;
	};

	onMount(() => {
		const queryParams = new URLSearchParams(location.search);
		const item = queryParams.get('item');
		if (item) search = item;
	});
</script>

<SearchPage {title} {description} {onSearch}>
	<div class="projects-filters">
		{#each filters as tech}
			<Chip active={tech.isSelected} classes={'text-0.8em'} onclick={() => onSelected(tech.slug)}>
				{tech.name}
			</Chip>
		{/each}
	</div>
	{#if displayed.length === 0}
		<div class="p-5 col-center gap-3 m-y-auto text-[var(--accent-text)] flex-1">
			<UIcon icon="i-carbon-cube" classes="text-3.5em" />
			<p class="font-300">Could not find anything...</p>
		</div>
	{:else}
		<div class="projects-list mt-5">
			{#each displayed as project}
				<ProjectCard {project} />
			{/each}
		</div>
	{/if}
</SearchPage>

<style lang="scss">
	.projects-list {
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
</style>
