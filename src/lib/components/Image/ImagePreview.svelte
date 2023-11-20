<script lang="ts">
	export let item: {
		label: string;
		src: string;
		static?: string;
	};
</script>

<div
	class="col-center gap-3 overflow-hidden w-100% h-100% rounded-10px"
	role="img"
	data-image-preview-container
>
	{#if item.static}
		<img
			alt={item.label}
			class="aspect-video w-100%"
			src={item.src}
			title={item.label}
			loading="lazy"
			data-image-src
		/>
		<img
			alt={item.label}
			class="aspect-video w-100%"
			src={item.static}
			title={item.label}
			loading="lazy"
			data-image-static
		/>
	{:else}
		<img
			alt={item.label}
			class="aspect-video w-100%"
			src={item.src}
			title={item.label}
			loading="lazy"
		/>
	{/if}

	<p class="text-[var(--tertiary-text)] font-300">{item.label}</p>
</div>
