<script lang="ts">
	import { gfmHeadingId } from 'marked-gfm-heading-id';
	import { mangle } from 'marked-mangle';
	import Prism from 'prismjs';
	import createSanitizer from 'dompurify';
	import { marked } from 'marked';
	import 'prismjs/components/prism-typescript';
	import 'prismjs/themes/prism-tomorrow.css';
	import { onDestroy, onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { browser } from '$app/environment';
	import { resolveImage } from '$lib/blogs.params';
	import { getScrollContext } from '$lib/stores/contexts/scroll.svelte';
	import UIcon from './Icon/UIcon.svelte';

	interface Props {
		content: string;
		filename?: string;
		slug?: string;
		scrollContainer?: HTMLDivElement;
	}
	let { content, filename = 'document', slug = '', scrollContainer }: Props = $props();

	let container: HTMLDivElement | undefined = $state();
	let isExporting = $state(false);
	let copied = $state(false);
	let activeId = $state('');
	let tocOpen = $state(false);

	interface TocItem {
		id: string;
		text: string;
		level: number;
	}
	let toc = $state<TocItem[]>([]);

	async function share() {
		const url = window.location.href;
		if (navigator.share) {
			await navigator.share({ title: filename, url });
		} else {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		}
	}

	function buildToc() {
		if (!container) return;
		const headings = container.querySelectorAll('h1, h2, h3');
		toc = Array.from(headings).map((h) => ({
			id: h.id,
			text: h.textContent ?? '',
			level: parseInt(h.tagName[1])
		}));
	}

	function setupScrollSpy() {
		if (!browser) return;
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeId = entry.target.id;
				}
			},
			{ rootMargin: '0px 0px -70% 0px', threshold: 0 }
		);
		container?.querySelectorAll('h1, h2, h3').forEach((h) => observer.observe(h));
		return () => observer.disconnect();
	}

	function findSafeSliceY(fullCanvas: HTMLCanvasElement, rawY: number): number {
		const ctx = fullCanvas.getContext('2d')!;
		const scanBand = Math.round(20 * 1.5);
		const startY = Math.max(0, Math.round(rawY) - scanBand);
		const endY = Math.round(rawY);
		for (let y = endY; y >= startY; y--) {
			const pixel = ctx.getImageData(0, y, fullCanvas.width, 1).data;
			const isBlankRow = Array.from({ length: fullCanvas.width }, (_, x) => {
				const i = x * 4;
				return pixel[i] > 240 && pixel[i + 1] > 240 && pixel[i + 2] > 240;
			}).every(Boolean);
			if (isBlankRow) return y;
		}
		return rawY;
	}

	async function downloadAsPdf() {
		if (!container || !browser) return;
		isExporting = true;
		try {
			const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
				import('html2canvas'),
				import('jspdf')
			]);
			const pageWidthMm = 210,
				pageHeightMm = 297,
				marginMm = 14;
			const headerMm = 14,
				footerMm = 14;
			const contentWidthMm = pageWidthMm - marginMm * 2;
			const contentHeightMm = pageHeightMm - marginMm - headerMm - footerMm;
			const currentUrl = get(page).url.href;
			const originUrl = get(page).url.origin;
			const prevPadding = container.style.padding;
			const prevBg = container.style.background;
			container.style.padding = '24px';
			container.style.background = '#ffffff';
			const fullCanvas = await html2canvas(container, {
				scale: 1.5,
				useCORS: true,
				logging: false,
				backgroundColor: '#ffffff',
				windowWidth: container.scrollWidth,
				windowHeight: container.scrollHeight
			});
			container.style.padding = prevPadding;
			container.style.background = prevBg;
			const pxPerMm = fullCanvas.width / contentWidthMm;
			const contentHeightPx = contentHeightMm * pxPerMm;
			const slices: number[] = [0];
			let currentY = 0;
			while (currentY + contentHeightPx < fullCanvas.height) {
				const safeY = findSafeSliceY(fullCanvas, currentY + contentHeightPx);
				slices.push(safeY);
				currentY = safeY;
			}
			slices.push(fullCanvas.height);
			const totalPages = slices.length - 1;
			const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
			pdf.setProperties({ title: filename });
			const date = new Date().toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
			for (let p = 0; p < totalPages; p++) {
				if (p > 0) pdf.addPage();
				pdf.setFillColor(24, 24, 27);
				pdf.rect(0, 0, pageWidthMm, headerMm, 'F');
				pdf.setFont('helvetica', 'bold');
				pdf.setFontSize(8);
				pdf.setTextColor(255, 255, 255);
				pdf.textWithLink(filename, marginMm, headerMm / 2 + 1.5, { url: currentUrl });
				pdf.setFont('helvetica', 'normal');
				pdf.setFontSize(7.5);
				pdf.setTextColor(161, 161, 170);
				pdf.text(date, pageWidthMm - marginMm, headerMm / 2 + 1.5, { align: 'right' });
				const srcY = slices[p];
				const srcH = slices[p + 1] - srcY;
				const pageCanvas = document.createElement('canvas');
				pageCanvas.width = fullCanvas.width;
				pageCanvas.height = Math.round(contentHeightPx);
				const ctx = pageCanvas.getContext('2d')!;
				ctx.fillStyle = '#ffffff';
				ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
				ctx.drawImage(fullCanvas, 0, srcY, fullCanvas.width, srcH, 0, 0, fullCanvas.width, srcH);
				const imgData = pageCanvas.toDataURL('image/jpeg', 0.85);
				pdf.addImage(
					imgData,
					'JPEG',
					marginMm,
					headerMm,
					contentWidthMm,
					pageCanvas.height / pxPerMm
				);
				const footerY = pageHeightMm - footerMm;
				pdf.setDrawColor(228, 228, 231);
				pdf.setLineWidth(0.3);
				pdf.line(marginMm, footerY, pageWidthMm - marginMm, footerY);
				const footerTextY = footerY + footerMm / 2 + 1;
				pdf.setFont('helvetica', 'normal');
				pdf.setFontSize(7);
				pdf.setTextColor(113, 113, 122);
				pdf.text(originUrl, marginMm, footerTextY);
				pdf.setFont('helvetica', 'bolditalic');
				pdf.setFontSize(7);
				pdf.setTextColor(113, 113, 122);
				pdf.text(
					'"Whatever you do, do it all for the glory of God." — 1 Corinthians 10:31',
					pageWidthMm / 2,
					footerTextY,
					{ align: 'center' }
				);
				pdf.setFont('helvetica', 'normal');
				pdf.setFontSize(7);
				pdf.setTextColor(161, 161, 170);
				pdf.text(`Page ${p + 1} of ${totalPages}`, pageWidthMm - marginMm, footerTextY, {
					align: 'right'
				});
			}
			pdf.save(`${filename}.pdf`);
		} finally {
			isExporting = false;
		}
	}
	const scrollContext = getScrollContext();
	onMount(async () => {
		const scroller = scrollContainer ?? document;
		let touchStartY = 0;

		// Click/tap markdown → collapse banner
		container?.addEventListener('pointerdown', () => scrollContext.setMarkdownVisible(true));

		// Scroll back to top → expand banner
		document.addEventListener(
			'scroll',
			(e) => {
				const target = e.target as HTMLElement;
				if (!target) return;

				if (target.scrollTop === 0) {
					scrollContext.setMarkdownVisible(false); // at top → expand
				} else {
					scrollContext.setMarkdownVisible(true); // scrolled down → collapse
				}
			},
			{ passive: true, capture: true }
		);

		// Touch: track swipe start
		scroller.addEventListener(
			'touchstart',
			(e) => {
				touchStartY = (e as TouchEvent).touches[0].clientY;
			},
			{ passive: true }
		);

		// Touch: swipe down at top → expand banner
		scroller.addEventListener(
			'touchend',
			(e) => {
				const deltaY = (e as TouchEvent).changedTouches[0].clientY - touchStartY;
				const atTop = scrollContainer ? scrollContainer.scrollTop === 0 : window.scrollY === 0;
				if (atTop && deltaY > 30) scrollContext.setMarkdownVisible(false);
			},
			{ passive: true }
		);

		// Parse and render markdown
		marked.use(gfmHeadingId());
		marked.use(mangle());
		marked.use({
			renderer: {
				image({ href, title, text }) {
					const resolvedHref = slug ? resolveImage(slug, href) : href;
					const titleAttr = title ? ` title="${title}"` : '';
					return `<img src="${resolvedHref}" alt="${text}"${titleAttr} />`;
				}
			}
		});

		const sanitizer = createSanitizer(window);
		if (window && container) {
			const parsed = await marked.parse(content);
			container.innerHTML = sanitizer.sanitize(parsed);
			Prism.highlightAllUnder(container);
			buildToc();
			setupScrollSpy();
		}
	});
</script>

<!-- Layout -->
<div class="md-layout">
	<div class="md-content">
		<!-- Mobile TOC accordion -->
		{#if toc.length > 0}
			<aside class="toc-mobile lg:hidden">
				<button class="toc-toggle" onclick={() => (tocOpen = !tocOpen)}>
					<span class="toc-toggle-left">
						<span class="toc-dot {tocOpen ? 'active' : ''}"></span>
						On this page
					</span>
					<svg
						class="toc-chevron {tocOpen ? 'open' : ''}"
						width="14"
						height="14"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<polyline points="6 9 12 15 18 9" />
					</svg>
				</button>
				{#if tocOpen}
					<nav class="toc-mobile-nav">
						{#each toc as item}
							<a
								href={`#${item.id}`}
								onclick={() => (tocOpen = false)}
								class="toc-link {activeId === item.id ? 'active' : ''}"
								style="padding-left: {(item.level - 1) * 12 + 14}px"
							>
								{item.text}
							</a>
						{/each}
						<div class="toc-mobile-actions">
							<button class="action-btn row items-center justify-start pl-6! gap-2" onclick={share}>
								{#if copied}
									<UIcon icon="i-carbon-checkmark" classes="text-1rem" />
									Copied!
								{:else}
									<UIcon icon="i-carbon-share" classes="text-1rem" />
									Share
								{/if}
							</button>
							<button
								class="action-btn row items-center justify-start pl-6! gap-2"
								onclick={downloadAsPdf}
								disabled={isExporting}
							>
								{#if isExporting}
									<UIcon icon="i-carbon-circle-dash" classes="text-1rem animate-spin" />
									Exporting…
								{:else}
									<UIcon icon="i-carbon-document-pdf" classes="text-1rem" />
									PDF
								{/if}
							</button>
						</div>
					</nav>
				{/if}
			</aside>
		{/if}
		<div bind:this={container} class="markdown-container"></div>
	</div>

	<!-- Desktop TOC -->
	{#if toc.length > 0}
		<aside class="toc-desktop">
			<p class="toc-label">On this page</p>
			<nav class="toc-nav">
				{#each toc as item}
					<a
						href={`#${item.id}`}
						class="toc-link {activeId === item.id ? 'active' : ''}"
						style="padding-left: {(item.level - 1) * 12 + 8}px"
					>
						{item.text}
					</a>
				{/each}
			</nav>
			<div class="toc-actions">
				<button class="action-btn row items-center justify-start pl-6! gap-2" onclick={share}>
					{#if copied}
						<UIcon icon="i-carbon-checkmark" classes="text-1rem" />
						Copied!
					{:else}
						<UIcon icon="i-carbon-share" classes="text-1rem" />
						Share
					{/if}
				</button>
				<button
					class="action-btn row items-center justify-start pl-6! gap-2"
					onclick={downloadAsPdf}
					disabled={isExporting}
				>
					{#if isExporting}
						<UIcon icon="i-carbon-circle-dash" classes="text-1rem animate-spin" />
						Exporting…
					{:else}
						<UIcon icon="i-carbon-document-pdf" classes="text-1rem" />
						Download PDF
					{/if}
				</button>
			</div>
		</aside>
	{/if}
</div>

<style>
	.md-layout {
		display: flex;
		gap: 2rem;
		align-items: flex-start;
	}
	.md-content {
		min-width: 0;
		flex: 1;
	}

	/* ── Desktop TOC ── */
	.toc-desktop {
		display: none;
	}
	@media (min-width: 1024px) {
		.toc-desktop {
			display: flex;
			flex-direction: column;
			width: 220px;
			flex-shrink: 0;
			position: sticky;
			top: 1.5rem;
			max-height: calc(100vh - 3rem);
			overflow-y: auto;
			align-self: flex-start;
		}
	}
	.toc-label {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--secondary-text);
		margin: 0 0 8px 0;
		padding-left: 8px;
	}
	.toc-nav {
		display: flex;
		flex-direction: column;
		gap: 1px;
		flex: 1;
	}
	.toc-link {
		display: block;
		padding: 5px 8px;
		font-size: 12px;
		line-height: 1.4;
		color: var(--secondary-text);
		text-decoration: none;
		border-radius: 4px;
		border-left: 2px solid transparent;
		transition:
			color 150ms,
			border-color 150ms,
			background 150ms;
	}
	.toc-link:hover {
		color: var(--main-text);
		background: var(--secondary);
	}
	.toc-link.active {
		color: var(--cta);
		border-left-color: var(--cta);
		background: transparent;
	}
	.toc-actions {
		margin-top: 16px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	/* ── Mobile TOC accordion ── */
	.toc-mobile {
		/* Fix width: account for scrollbar and any parent padding */
		position: sticky;
		top: 0;
		z-index: 20;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;

		margin-bottom: 1.5rem;
		border: 1px solid var(--border);
		border-radius: 10px;
		overflow: hidden;
		/* Subtle shadow so it reads as "floating" when sticky */
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
	}

	.toc-toggle {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 11px 14px;
		background: var(--secondary);
		border: none;
		cursor: pointer;
		font-size: 13px;
		font-weight: 600;
		color: var(--main-text);
		letter-spacing: 0.01em;
		/* Prevent any tap highlight on mobile */
		-webkit-tap-highlight-color: transparent;
	}

	.toc-toggle:hover {
		background: color-mix(in srgb, var(--secondary) 85%, var(--cta) 15%);
	}

	.toc-toggle-left {
		display: flex;
		align-items: center;
		gap: 9px;
	}

	.toc-dot {
		flex-shrink: 0;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: transparent;
		border: 2px solid var(--cta);
		transition:
			background 150ms,
			transform 150ms;
	}

	.toc-dot.active {
		background: var(--cta);
		transform: scale(1.2);
	}

	.toc-chevron {
		flex-shrink: 0;
		color: var(--secondary-text);
		transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.toc-chevron.open {
		transform: rotate(180deg);
	}

	.toc-mobile-nav {
		display: flex;
		flex-direction: column;
		padding: 6px 0 4px;
		border-top: 1px solid var(--border);
		background: var(--main);
		/* Smooth expand — pair with Svelte transition if desired */
	}

	.toc-mobile-nav .toc-link {
		border-radius: 0;
		border-left: 2px solid transparent;
		padding-top: 7px;
		padding-bottom: 7px;
		padding-right: 14px;
		font-size: 13px;
		color: var(--secondary-text);
		text-decoration: none;
		transition:
			color 120ms,
			background 120ms,
			border-color 120ms;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.toc-mobile-nav .toc-link:hover {
		color: var(--main-text);
		background: var(--secondary);
	}

	.toc-mobile-nav .toc-link.active {
		color: var(--cta);
		background: color-mix(in srgb, var(--cta) 8%, transparent);
		border-left-color: var(--cta);
		font-weight: 500;
	}

	.toc-mobile-actions {
		display: flex;
		gap: 8px;
		padding: 10px 14px 10px;
		border-top: 1px solid var(--border);
		margin-top: 6px;
	}

	.action-btn {
		flex: 1;
		padding: 7px 10px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: var(--secondary);
		color: var(--secondary-text);
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition:
			background 120ms,
			color 120ms;
	}

	.action-btn:hover:not(:disabled) {
		background: var(--cta);
		color: #fff;
		border-color: var(--cta);
	}

	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Shared action button ── */
	.action-btn {
		flex: 1;
		padding: 6px 12px;
		border-radius: 6px;
		border: 1px solid var(--border);
		background: transparent;
		color: var(--secondary-text);
		font-size: 12px;
		cursor: pointer;
		transition:
			color 150ms,
			border-color 150ms,
			background 150ms;
		white-space: nowrap;
	}
	.action-btn:hover:not(:disabled) {
		color: var(--main-text);
		border-color: var(--border-hover);
		background: var(--secondary);
	}
	.action-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global(.markdown-container img) {
		max-width: 100% !important;
		max-height: 480px !important;
		width: auto !important;
		height: auto !important;
		display: block !important;
		object-fit: contain !important;
	}
</style>
