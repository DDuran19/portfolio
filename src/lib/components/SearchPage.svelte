<script lang="ts">
	import { onMount } from 'svelte';
	import CommonPage from './CommonPage.svelte';
	import Input from './Input/Input.svelte';
	import { browser } from '$app/environment';

	interface Props {
		title?: string;
		search?: string;
		description?: string;
		image?: string;
		onSearch?: (value: string) => void;
		children?: import('svelte').Snippet;
	}

	let {
		title = $bindable('Title'),
		search = $bindable(''),
		description = $bindable(''),
		image = $bindable(''),
		onSearch,
		children
	}: Props = $props();

	let mounted = $state(false);

	$effect(() => {
		onSearch?.(search.trim().toLowerCase());
	});

	$effect(() => {
		if (browser && mounted) {
			const searchParams = new URLSearchParams(window.location.search);
			searchParams.set('q', search);
			const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${searchParams.toString()}`;
			window.history.replaceState(window.history.state, '', url);
		}
	});

	onMount(() => {
		const searchParams = new URLSearchParams(window.location.search);
		search = searchParams.get('q') ?? '';
		mounted = true;
	});
</script>

<CommonPage bind:title bind:description bind:image>
	<div class="w-100% row">
		<Input bind:value={search} placeholder={'Search...'} />
	</div>
	<div class="w-100% col flex-1">
		{@render children?.()}
	</div>
</CommonPage>
