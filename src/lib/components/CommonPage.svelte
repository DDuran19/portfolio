<script lang="ts">
	import MainTitle from './MainTitle/MainTitle.svelte';
	import TabTitle from './TabTitle.svelte';

	interface Props {
		title?: string;
		description?: string;
		image?: string;
		children?: import('svelte').Snippet;
	}

	let {
		title = $bindable('Title'),
		description = $bindable(''),
		image = $bindable(''),
		children
	}: Props = $props();
</script>

<TabTitle bind:title bind:description bind:image />
<div class="flex-1 col gap-5 px-2 sm:px-4 md:px-6 py-4 sm:py-8 md:py-12">
	<span id="__top__" class="h-0 w-0"></span>

	<MainTitle>{title}</MainTitle>
	<div class="col gap-5 flex-1">
		{@render children?.()}
	</div>
</div>
