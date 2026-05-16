<script lang="ts">
	import 'uno.css';
	import NavMenu from '$lib/components/NavMenu/NavMenu.svelte';
	import '$lib/index.scss';
	import { onHydrated, theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { page } from '$app/state';
	import { quadInOut } from 'svelte/easing';
	import ScrollToTop from '$lib/components/Floaters/ScrollToTop.svelte';
	import { setScrollContext } from '$lib/stores/contexts/scroll.svelte';
	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
	let currentPage = $derived(page.url.pathname);

	setScrollContext();
	onMount(() => onHydrated());
</script>

<svelte:head>
	<link rel="author" href="/humans.txt" />
	<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "Person",
			"name": "Denver James Duran",
			"jobTitle": "Full-Stack Developer",
			"email": "denver02.james14@gmail.com",
			"telephone": "+63 966 978 0902",
			"url": "https://denvie.online",
			"sameAs": ["https://github.com/DDuran19", "https://upwork.com/freelancers/denverjamesduran"],
			"address": {
				"@type": "PostalAddress",
				"addressLocality": "Valenzuela",
				"addressRegion": "Metro Manila",
				"addressCountry": "PH"
			},
			"knowsAbout": [
				"SvelteKit",
				"Svelte 5",
				"TypeScript",
				"Cloudflare Workers",
				"Cloudflare D1",
				"Cloudflare R2",
				"Hono.js",
				"Drizzle ORM",
				"TailwindCSS",
				"DaisyUI",
				"shadcn-svelte",
				"PocketBase",
				"POS Systems",
				"Offline-first PWA",
				"IndexedDB",
				"Service Workers",
				"RBAC",
				"Multi-tenant Architecture",
				"Stripe API",
				"Shopify API",
				"Meta Ads",
				"Franchise Management",
				"Kotlin",
				"Android"
			],
			"worksFor": [
				{
					"@type": "Organization",
					"name": "KDCI Outsourcing",
					"url": "https://www.cpooutlets.com"
				},
				{
					"@type": "Organization",
					"name": "413 Double D Enterprises OPC"
				}
			],
			"alumniOf": {
				"@type": "CollegeOrUniversity",
				"name": "Pamantasan ng Lungsod ng Valenzuela"
			},
			"description": "Solo full-stack developer specializing in SvelteKit, TypeScript, and Cloudflare-native web apps. Builds custom POS systems, multi-tenant platforms, and edge-deployed applications independently from requirements to production."
		}
	</script>
</svelte:head>

<div class={`body contents ${$theme ? 'theme-dark' : 'theme-light'}`}>
	<NavMenu />
	{#key currentPage}
		<div class="content container" in:fly={{ x: 200, duration: 400, easing: quadInOut }}>
			{@render children?.()}
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
		overflow-y: auto;
		height: 100vh;
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
		overflow: hidden;
		letter-spacing: 1px;
		height: 100vh;
		min-height: 100vh;
	}

	:global(p) {
		margin: 0px;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		margin: 5px 0px;
	}
</style>
