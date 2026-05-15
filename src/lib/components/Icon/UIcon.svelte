<script lang="ts">

	interface Props {
		icon?: string;
		classes?: string;
	}

	let { icon = '', classes = '' }: Props = $props();
</script>

<i class={`${icon} ${classes}`}></i>
<!-- <i class="i-carbon-logo-github"></i> -->
