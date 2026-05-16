<script lang="ts">
	import { getScrollContext } from '$lib/stores/contexts/scroll.svelte';

	interface Props {
		img?: string;
		useDefaultDimensions?: boolean;
		classes?: string;
		children?: import('svelte').Snippet;
		name?: string;
	}

	let {
		img = '',
		useDefaultDimensions = true,
		classes = '',
		children,
		name = ''
	}: Props = $props();

	const scrollCtx = getScrollContext();
	let manuallyExpanded = $state(false);

	let collapsed = $derived(scrollCtx.markdownVisible && !manuallyExpanded);

	function toggleExpand() {
		manuallyExpanded = !manuallyExpanded;
	}
	let bannerEl: HTMLDivElement | undefined = $state();

	$effect.pre(() => {
		function handlePointer(e: PointerEvent) {
			if (!bannerEl?.contains(e.target as Node)) {
				// On mobile, only collapse after a small delay to avoid accidental triggers
				setTimeout(() => scrollCtx.setMarkdownVisible(true), 100);
			} else {
				scrollCtx.setMarkdownVisible(false);
			}
		}
		document.addEventListener('pointerdown', handlePointer);
		return () => document.removeEventListener('pointerdown', handlePointer);
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={bannerEl}
	style={`--bg-img:url(${img})`}
	class={`row w-[100%] ${
		!collapsed && useDefaultDimensions
			? 'min-h-[50vh] sm:min-h-[250px] md:min-h-[300px] lg:min-h-[350px] px-4 md:px-10'
			: ''
	} items-center skill-cover ${classes} ${collapsed ? 'collapsed' : ''}`}
	role={collapsed ? 'button' : undefined}
	tabindex={collapsed ? 0 : undefined}
	onclick={collapsed ? toggleExpand : undefined}
	onkeydown={collapsed ? (e) => e.key === 'Enter' && toggleExpand() : undefined}
>
	{#if collapsed}
		<div class="collapsed-bar">
			<span class="collapsed-title mx-auto">{name}</span>
		</div>
	{:else}
		<div class="p-x-2 col flex-1">
			{@render children?.()}
		</div>
	{/if}
</div>

<style lang="scss">
	.skill-cover {
		background:
			linear-gradient(90deg, var(--main) 0%, var(--main) 55%, var(--main-60) 130%),
			no-repeat 110% 45% / 50% var(--bg-img);
		border-block-end: 1px solid var(--border);
		transition:
			min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
			max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
	}

	.skill-cover.collapsed {
		min-height: 52px !important; // was 0
		max-height: 52px;
		cursor: pointer;

		&:hover {
			background: linear-gradient(
				90deg,
				var(--secondary) 0%,
				var(--secondary) 55%,
				var(--main-60) 130%
			);
		}
	}

	.collapsed-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0 1rem;
	}

	.collapsed-title {
		font-weight: 600;
		color: var(--main-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
