<script lang="ts">
	import { gfmHeadingId } from 'marked-gfm-heading-id';
	import { mangle } from 'marked-mangle';
	import Prism from 'prismjs';
	import createSanitizer from 'dompurify';
	import { marked } from 'marked';
	import 'prismjs/components/prism-typescript';
	import 'prismjs/themes/prism-tomorrow.css';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';

	let container: HTMLDivElement = $state();

	interface Props {
		content: string;
		filename?: string;
	}

	let { content, filename = 'document' }: Props = $props();

	let isExporting = $state(false);
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
		isExporting = true;
		try {
			const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
				import('html2canvas'),
				import('jspdf')
			]);

			const pageWidthMm = 210;
			const pageHeightMm = 297;
			const marginMm = 14;
			const headerMm = 14;
			const footerMm = 14;
			const contentWidthMm = pageWidthMm - marginMm * 2;
			const contentHeightMm = pageHeightMm - marginMm - headerMm - footerMm;
			const currentUrl = get(page).url.href;
			const originUrl = get(page).url.origin;

			// add temp padding so content doesn't hug edges
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

			// compute page slice boundaries
			const slices: number[] = [0];
			let currentY = 0;
			while (currentY + contentHeightPx < fullCanvas.height) {
				const rawBoundary = currentY + contentHeightPx;
				const safeY = findSafeSliceY(fullCanvas, rawBoundary);
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

				// ── Header ───────────────────────────────────────────
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

				// ── Canvas slice ─────────────────────────────────────
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
				const imgHeightMm = pageCanvas.height / pxPerMm;
				pdf.addImage(imgData, 'JPEG', marginMm, headerMm, contentWidthMm, imgHeightMm);

				// ── Footer ───────────────────────────────────────────
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

	onMount(() => {
		marked.use(gfmHeadingId());
		marked.use(mangle());

		const sanitizer = createSanitizer(window);

		if (window) {
			const parsed = marked.parse(content);
			container.innerHTML = sanitizer.sanitize(parsed);
			Prism.highlightAllUnder(container);
		}
	});
</script>

<button
	onclick={downloadAsPdf}
	disabled={isExporting}
	class="sticky top-4 float-right z-50 w-48 cursor-pointer rounded-full bg-gray-900 px-4 py-2 text-sm text-white shadow-lg transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
>
	{isExporting ? 'Exporting...' : '⬇ Download as PDF'}
</button>
<div bind:this={container} class="markdown-container"></div>

<style>
	:global(.markdown-container img) {
		max-width: 100% !important;
		max-height: 480px !important;
		width: auto !important;
		height: auto !important;
		display: block !important;
		object-fit: contain !important;
	}
</style>
