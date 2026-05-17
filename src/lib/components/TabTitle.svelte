<script lang="ts">
	import { TITLE_SUFFIX } from '$lib/params';
	import { useTitle } from '$lib/utils/helpers';
	import { page } from '$app/state';

	interface Props {
		title: string;
		description?: string;
		image?: string;
	}

	let {
		title = $bindable(),
		description = $bindable(
			'Solo full-stack developer specializing in SvelteKit, TypeScript, and Cloudflare-native web apps. Custom POS systems, multi-tenant platforms, and edge-deployed applications.'
		),
		image = $bindable('')
	}: Props = $props();

	let fullTitle = $derived(useTitle(title, TITLE_SUFFIX));
	const ORIGIN = 'https://denvie.online';

	let ogImage = $derived(
		image ? (image.startsWith('http') ? image : `${ORIGIN}${image}`) : `${ORIGIN}/og-image.png`
	);

	let currentUrl = $derived(`${ORIGIN}${page.url.pathname}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>

	<meta name="description" content={description} />
	<meta name="author" content="Denver James Duran" />

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
