<script lang="ts">
	import { getScrollContext } from '$lib/stores/contexts/scroll.svelte';

	const scrollContext = getScrollContext();
	import UIcon from '../Icon/UIcon.svelte';
</script>

{#key scrollContext.topId}
	<a
		href={scrollContext.topId}
		class="fixed bottom-10 right-10 rounded-full bg-transparent p-1 cursor-pointer hover:bg-[color:var(--main-hover)]
     border-1px border-solid border-[var(--dark-0-60)] hover:border-[var(--border)]
     block
     "
		aria-label="Scroll to top"
		role="button"
		><UIcon icon="i-carbon-chevron-up text-1.5em" />
	</a>
{/key}

<style lang="scss">
	a {
		@media screen and (max-width: 550px) {
			display: none;
		}
	}
</style>
