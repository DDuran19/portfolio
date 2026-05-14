<script lang="ts">
	import { browser } from '$app/environment';

	export let item: {
		label: string;
		src: string;
		static?: string;
	};

	// Modal state
	let showModal = false;
	let scale = 1;
	let position = { x: 0, y: 0 };
	let isDragging = false;
	let startX = 0;
	let startY = 0;
	let startOffsetX = 0;
	let startOffsetY = 0;
	let modalImg: HTMLImageElement;

	// Function to open the modal
	function openModal() {
		showModal = true;
		scale = 1;
		position = { x: 0, y: 0 };
	}

	// Function to close the modal
	function close() {
		showModal = false;
	}

	// Function to handle wheel zoom
	function handleWheel(event: WheelEvent) {
		if (showModal) {
			event.preventDefault();
			const dx = event.deltaY;
			if (dx < 0) {
				scale = Math.min(scale * 1.1, 10); // Max 10x zoom
			} else {
				scale = Math.max(scale / 1.1, 0.1); // Min 0.1x zoom
			}
		}
	}

	// Function to reset the modal
	function resetModal() {
		scale = 1;
		position = { x: 0, y: 0 };
	}

	// Function to handle touch/mouse events for panning
	function handleStart(event: MouseEvent | TouchEvent) {
		if (showModal) {
			event.preventDefault();
			isDragging = true;
			const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
			const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
			startX = clientX;
			startY = clientY;
			startOffsetX = position.x;
			startOffsetY = position.y;
		}
	}

	function handleMove(event: MouseEvent | TouchEvent) {
		if (isDragging && showModal) {
			event.preventDefault();
			const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
			const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;
			const dx = clientX - startX;
			const dy = clientY - startY;
			position.x = startOffsetX + dx;
			position.y = startOffsetY + dy;
		}
	}

	function handleEnd() {
		isDragging = false;
	}

	// Function to handle key events for the modal
	function handleKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			close();
		} else if (event.key === 'r' || event.key === 'R') {
			resetModal();
		}
	}

	// Add event listeners when component mounts
	import { onMount, onDestroy } from 'svelte';
	onMount(() => {
		if (!browser) return;
		window.addEventListener('keydown', handleKey);
		window.addEventListener('mouseup', handleEnd);
		window.addEventListener('mousemove', handleMove);
		window.addEventListener('touchmove', handleMove);
		window.addEventListener('touchend', handleEnd);
	});

	// Cleanup event listeners when component is destroyed
	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('keydown', handleKey);
		window.removeEventListener('touchend', handleEnd);
		window.removeEventListener('mousemove', handleMove);
		window.removeEventListener('touchmove', handleMove);
		window.removeEventListener('touchend', handleEnd);
	});
</script>

<div
	class="col-center gap-3 overflow-hidden w-100% rounded-10px"
	role="img"
	data-image-preview-container
>
	{#if item.static}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img
			alt={item.label}
			class="w-100% max-h-300px object-contain cursor-pointer"
			src={item.src}
			title={item.label}
			loading="lazy"
			data-image-src
			on:click={openModal}
		/>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img
			alt={item.label}
			class="w-100% max-h-300px object-contain cursor-pointer"
			src={item.static}
			title={item.label}
			loading="lazy"
			data-image-static
			on:click={openModal}
		/>
	{:else}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
		<img
			alt={item.label}
			class="w-100% max-h-300px object-contain cursor-pointer"
			src={item.src}
			title={item.label}
			loading="lazy"
			on:click={openModal}
		/>
	{/if}

	<p class="text-[var(--tertiary-text)] font-300">{item.label}</p>
</div>

{#if showModal}
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		role="dialog"
		tabindex="0"
		class="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4 cursor-grab"
		on:click={close}
		on:wheel={handleWheel}
	>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="relative w-full h-full flex items-center justify-center" on:click|stopPropagation>
			<button
				class="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 cursor-pointer z-10"
				on:click={close}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>

			<button
				class="absolute top-4 left-4 bg-black bg-opacity-50 text-white rounded-full p-2 cursor-pointer z-10"
				on:click={resetModal}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-6 w-6"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M4 4v5h16V4M4 20h16v-5H4v5zM4 9h16v3H4V9z"
					/>
				</svg>
			</button>

			<div
				class="relative"
				style="transform: translate({position.x}px, {position.y}px) scale({scale}); transform-origin: center; transition: {isDragging
					? 'none'
					: 'transform 0.1s ease'};"
				on:mousedown={handleStart}
			>
				<img
					bind:this={modalImg}
					alt={item.label}
					class="max-w-full max-h-full object-contain"
					src={item.src}
				/>
			</div>

			<div
				class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded text-sm"
			>
				<span>Drag to pan • Scroll to zoom • Press R to reset • ESC to close</span>
			</div>
		</div>
	</div>
{/if}
