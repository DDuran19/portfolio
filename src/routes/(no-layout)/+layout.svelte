<script lang="ts">
	import { onHydrated } from '$lib/stores/theme';
	import { onMount } from 'svelte';
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
        "sameAs": [
            "https://github.com/DDuran19",
            "https://upwork.com/freelancers/denverjamesduran"
        ],
        "address": {
            "@type": "PostalAddress",
            "addressLocality": "Valenzuela",
            "addressRegion": "Metro Manila",
            "addressCountry": "PH"
        },
        "knowsAbout": [
            "SvelteKit", "Svelte 5", "TypeScript", "Cloudflare Workers",
            "Cloudflare D1", "Cloudflare R2", "Hono.js", "Drizzle ORM",
            "TailwindCSS", "DaisyUI", "shadcn-svelte", "PocketBase",
            "POS Systems", "Offline-first PWA", "IndexedDB", "Service Workers",
            "RBAC", "Multi-tenant Architecture", "Stripe API", "Shopify API",
            "Meta Ads", "Franchise Management", "Kotlin", "Android"
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

<slot />
