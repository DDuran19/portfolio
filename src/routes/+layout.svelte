<script lang="ts">
	import 'uno.css';
	import NavMenu from '$lib/components/NavMenu/NavMenu.svelte';
	import '$lib/index.scss';
	import { onHydrated, theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/stores';
	import { quadInOut } from 'svelte/easing';
	import ScrollToTop from '$lib/components/Floaters/ScrollToTop.svelte';
	$: currentPage = $page.url.pathname;

	onMount(() => onHydrated());
</script>

<div class={`body contents ${$theme ? 'theme-dark' : 'theme-light'} overflow-hidden`}>
	<NavMenu />
	{#key currentPage}
		<div class="content container" in:fly={{ x: 200, duration: 400, easing: quadInOut }}>
			<slot />
		</div>
	{/key}
	<ScrollToTop />
</div>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		flex: 1;
		padding: 0px 0px;
		@media screen and (max-width: 550px) {
			margin-top: 10px;
			margin-bottom: 64px;
		}
	}

	.body {
		margin: 0px;
		background-color: var(--main);
		color: var(--main-text);
		font-family: var(--text-f);
		display: flex;
		flex-direction: column;
		transition-duration: 200ms;

		letter-spacing: 1px;

		min-height: 100vh;
	}

	:global(p) {
		margin: 0px;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		margin: 5px 0px;
	}
</style>
