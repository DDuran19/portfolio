<script lang="ts">
	import { NavBar } from '$lib/params';
	import { theme, toggleTheme } from '$lib/stores/theme';

	import { base } from '$app/paths';
	import UIcon from '../Icon/UIcon.svelte';
	import { page } from '$app/stores';

	const items = [
		{ title: NavBar.skills, to: '/skills', icon: 'i-carbon-software-resource-cluster' },
		{ title: NavBar.personal, to: '/projects', icon: 'i-carbon-cube' },
		{ title: NavBar.career, to: '/experience', icon: 'i-carbon-development' },
		{ title: NavBar.resume, to: '/resume', icon: 'i-carbon-result' }
	];

	$: currentPage = $page.url.pathname;
</script>

<div class="nav-menu">
	<nav class="container grid grid-cols-[1fr_0.5fr_2fr_0.5fr_1fr] w-full text-sm">
		<a
			href={`${base}/`}
			class="col-start-1 row-start-1 nav-menu-left decoration-none flex flex-row items-center cursor-pointer px-4 text-[var(--secondary-text)] self-stretch hover:bg-[color:var(--main-hover)]"
		>
			<UIcon icon="i-carbon-code" classes="text-2em" />
			<span class="ml-2 text-md font-bold hidden md:inline">Denvie</span>
		</a>
		<div
			class="row-start-1 col-start-3 col-end-4 flex flex-row flex-1 self-center justify-center nav-menu-container"
		>
			{#each items as item}
				<a
					href={`${base}${item.to}`}
					class="relative nav-menu-item !text-[var(--secondary-text)] {item.to === currentPage
						? 'currentPage'
						: ''}"
				>
					<UIcon icon={item.icon} classes="text-1.5em md:text-1.3em " />
					<span class="nav-menu-item-label">{item.title}</span>
				</a>
			{/each}
		</div>
		<div class="col-start-5 justify-end flex flex-row self-stretch items-stretch gap-1 text-1.15em">
			<a
				href={`${base}/search`}
				class="text-inherit col-center self-stretch px-2 hover:bg-[color:var(--main-hover)]"
			>
				<UIcon icon="i-carbon-search" classes="text-1.5em md:text-1.3em " />
			</a>
			<button
				class="bg-transparent text-1em border-none cursor-pointer hover:bg-[color:var(--main-hover)] text-[var(--secondary-text)] px-2"
				on:click={() => toggleTheme()}
			>
				{#if $theme}
					<UIcon icon="i-carbon-moon" classes="text-1.5em md:text-1.3em " />
				{:else}
					<UIcon icon="i-carbon-sun" classes="text-1.5em md:text-1.3em " />
				{/if}
			</button>
		</div>
	</nav>
</div>

<style lang="scss">
	a.currentPage::after {
		content: '';
		width: 100%;
		background-color: #0ea5e9;
		transition: width 0.3s ease-in-out;
	}
	a::after {
		content: '';
		position: absolute;
		bottom: 0;
		right: 0;
		height: 3px;
		width: 0;
	}
	.nav-menu {
		display: flex;
		height: 64px;
		justify-content: center;
		position: sticky;
		top: 0px;
		z-index: 10;
		padding: 10px;
		@media screen and (max-width: 550px) {
			position: fixed;
			top: unset;
			bottom: 0;
			width: 100%;
			padding: 0%;
		}
		&-container {
			background: rgba(255, 255, 255, 0);
			border-radius: 16px;
			box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
			backdrop-filter: blur(9.7px);
			-webkit-backdrop-filter: blur(9.7px);
			border: 1px solid rgba(255, 255, 255, 0.12);
			padding: 0 10px;
		}
		&-item {
			text-decoration: none;
			font-weight: 400;
			padding: 10px 20px;
			color: inherit;
			display: flex;
			align-items: center;
			border-bottom: 3px solid transparent;

			&-label {
				margin-left: 10px;

				@media (max-width: 950px) {
					& {
						display: none;
					}
				}
			}

			&:hover {
				background-color: var(--main-hover);
			}
		}
	}
</style>
