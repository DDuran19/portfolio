<script lang="ts">
	import { TITLE_SUFFIX } from '$lib/params';
	import { useTitle } from '$lib/utils/helpers';
	import { page } from '$app/stores';

	export let title: string;
	export let description: string =
		'Solo full-stack developer specializing in SvelteKit, TypeScript, and Cloudflare-native web apps. Custom POS systems, multi-tenant platforms, and edge-deployed applications.';
	export let image: string = '';

	$: fullTitle = useTitle(title, TITLE_SUFFIX);
	$: origin = $page.url.origin;
	$: currentUrl = $page.url.href;
	$: ogImage = image
		? image.startsWith('http')
			? image
			: `${origin}${image}`
		: `${origin}/og-image.png`;
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />

	<!-- Open Graph -->
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:url" content={currentUrl} />
	<meta property="og:type" content="website" />

	<!-- Twitter/X -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
