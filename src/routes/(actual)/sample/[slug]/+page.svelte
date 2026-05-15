<script lang="ts">
	import { run } from 'svelte/legacy';

	import { sampleComponents } from '$lib/md/sample';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

	let slug = page.params.slug;
	let component = sampleComponents.find((c) => c.slug === slug)?.component;
	run(() => {
		if (!component) {
			goto('/sample');
		}
	});
</script>

{#if component}
	{@const SvelteComponent = component}
	<SvelteComponent />
{:else}
	<p>Sample not found, check the <a href="/sample">sample list</a></p>
{/if}
