<script lang="ts">
	import { goto } from '$app/navigation';
	import UIcon from '../Icon/UIcon.svelte';
</script>

<a
	href="#nav-menu"
	class="fixed bottom-10 right-10 rounded-full bg-transparent p-1 cursor-pointer hover:bg-[color:var(--main-hover)]
     border-1px border-solid border-[var(--dark-0-60)] hover:border-[var(--border)]
     block
     "
	aria-label="Scroll to top"
	role="button"
	on:click|preventDefault|stopPropagation={() => goto('#nav-menu')}
	><UIcon icon="i-carbon-chevron-up text-1.5em" />
</a>

<style lang="scss">
	a {
		@media screen and (max-width: 550px) {
			display: none;
		}
	}
</style>
