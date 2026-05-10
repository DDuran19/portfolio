<script lang="ts">
	import { sampleComponents } from '$lib/md/sample';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let slug = $page.params.slug;
	let component = sampleComponents.find((c) => c.slug === slug)?.component;
	$: if (!component) {
		goto('/sample');
	}
</script>

{#if component}
	<svelte:component this={component} />
{:else}
	<p>Sample not found, check the <a href="/sample">sample list</a></p>
{/if}
