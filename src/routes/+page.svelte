<script lang="ts">
	import Carrousel from '$lib/components/Carrousel/Carrousel.svelte';
	import Icon from '$lib/components/Icon/Icon.svelte';
	import MainTitle from '$lib/components/MainTitle/MainTitle.svelte';
	import { TITLE_SUFFIX } from '$lib/params';
	import { HOME, getPlatfromIcon } from '$lib/params';
	import MY_SKILLS from '$lib/skills.params';
	import { useTitle } from '$lib/utils/helpers';
	import { isBlank } from '@riadh-adrani/utils';
	import { onMount } from 'svelte';

	const { description, lastName, links, name, title, skills } = HOME;

	const isEmail = (email: string): boolean => {
		const reg =
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		return !isBlank(email) && reg.test(email);
	};

	onMount(() => {
		function showTooltip(event: MouseEvent) {
			// Create a new div element
			const tooltip = document.createElement('div');
			tooltip.textContent = 'Copied!';
			tooltip.style.position = 'fixed';
			tooltip.style.backgroundColor = '#2c3e50';
			tooltip.style.color = '#fff';
			tooltip.style.padding = '10px';
			tooltip.style.borderRadius = '5px';
			tooltip.style.zIndex = '1000';
			tooltip.style.cursor = 'pointer';
			tooltip.style.padding = '10px';
			tooltip.style.border = '1px solid #fff';
			tooltip.style.boxShadow =
				'0 0 10px rgba(255, 255, 255, 0.7), 0 0 20px rgba(255, 255, 255, 0.7), 0 0 30px rgba(255, 255, 255, 0.7)';

			const rect = tooltip.getBoundingClientRect();
			const x = event.clientX + window.scrollX - rect.width / 2;
			const y = event.clientY + window.scrollY - rect.height - 40; // Offset to position above the mouse

			// Set the position
			tooltip.style.left = `${x}px`;
			tooltip.style.top = `${y}px`;

			// Append it to the body
			document.body.appendChild(tooltip);

			// Remove after 2 seconds
			setTimeout(() => {
				tooltip.remove();
			}, 2000);
		}

		// Function to copy text to clipboard
		function copyText(text: string) {
			navigator.clipboard.writeText(text).then(
				function () {
					console.log('Copying to clipboard was successful!');
				},
				function (err) {
					console.error('Could not copy text: ', err);
				}
			);
		}

		// Function to handle click events on elements with class 'badge'
		function handleClick(event: MouseEvent) {
			// Prevent the default action (if any)
			event.preventDefault();

			// Get the target element
			const target = event.target as HTMLElement;

			// Check if the target has the class 'badge'
			if (target.classList.contains('badge')) {
				// Show the tooltip
				showTooltip(event);

				// Copy the text content of the span
				copyText(target.textContent || '');
			}
		}

		// Select all elements with class 'badge' and add the click handler
		const badges = document.querySelectorAll('.badge') as NodeListOf<HTMLElement>;
		badges.forEach((badge) => {
			badge.addEventListener('click', handleClick);
		});
	});
</script>

<svelte:head>
	<title>{useTitle(title, TITLE_SUFFIX)}</title>
</svelte:head>
<div
	class="col self-center flex-1 md:flex-row md:slef-stretch justify-center lg:justify-between items-center p-y-0px p-x-10px"
>
	<div class="flex flex-col justify-center md:justify-start md:flex-1 gap-10px">
		<MainTitle classes="md:text-left ">{name} {lastName}</MainTitle>
		<p class="text-[var(--tertiary-text)] text-center md:text-left text-[1.2em] font-extralight">
			{@html description}
		</p>
		<div class="row justify-center md:justify-start p-y-15px p-x-0px gap-2">
			{#each links as link}
				<a
					class="decoration-none"
					href={`${isEmail(link.link) ? 'mailto:' : ''}${link.link}`}
					target="_blank"
					rel="noreferrer"
				>
					<Icon icon={getPlatfromIcon(link.platform)} color={'var(--accent-text)'} size={'20px'} />
				</a>
			{/each}
		</div>
		<a
			href="mailto:inquiries@denvie.online?subject=Inquiry&body=Good day!%0A%0AI saw your portfolio on https://denvie.online, and I would like to "
			role="button"
			target="_blank"
			class="md:mx-0 mx-auto w-[fit-content] bg-[var(--cta)] hover:bg-[var(--cta-hover)] hover:text-white text-black font-600 uppercase no-underline px-4 py-2 rounded"
			>Get in touch</a
		>
	</div>
	<Carrousel items={skills ?? MY_SKILLS} />
</div>
