<script lang="ts">
	import { onMount } from 'svelte';

	let el: HTMLElement | undefined = $state();

	interface Props {
		active?: boolean;
		size?: string;
		classes?: string;
		href?: string;
		target?: string | undefined;
		children?: import('svelte').Snippet;
		onclick?: () => void;
		onkeydown?: () => void;
		onkeypress?: () => void;
		onkeyup?: () => void;
	}

	let {
		active = false,
		size = 'auto',
		classes = '',
		href = '',
		target = undefined,
		onclick,
		onkeydown,
		onkeypress,
		onkeyup,
		children
	}: Props = $props();

	let className = $derived(
		`row-center cursor-pointer py-[5px] px-[15px] m-[2.5px] decoration-none inline-block border-[1px] border-solid border-[var(--border)] rounded-[20px] tracking-wider text-[0.9em] text-[var(--tertiary-text)] duration-[150ms] font-light  ${
			active
				? 'bg-[var(--accent)] hover:bg-[var(--accent-hover)]'
				: 'bg-transparent hover:bg-[var(--main-hover)]'
		} ${classes}`
	);

	onMount(() => {
		el?.style.setProperty('--size', size);
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:element
	this={href ? 'a' : 'button'}
	target={target ?? undefined}
	bind:this={el}
	{href}
	class={className}
	{onclick}
	{onkeydown}
	{onkeypress}
	{onkeyup}
>
	{@render children?.()}
</svelte:element>
