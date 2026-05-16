import fs from 'fs';
import path from 'path';
import https from 'https';
import { promisify } from 'util';
import { execFile } from 'child_process';

const execFileP = promisify(execFile);

// ─── .env loader (no deps) ────────────────────────────────────────────────────

function loadDotEnv(envPath = '.env') {
	const resolved = path.resolve(envPath);
	if (!fs.existsSync(resolved)) return;
	const lines = fs.readFileSync(resolved, 'utf-8').split('\n');
	for (const raw of lines) {
		const line = raw.trim();
		if (!line || line.startsWith('#')) continue;
		const eq = line.indexOf('=');
		if (eq === -1) continue;
		const key = line.slice(0, eq).trim();
		let val = line.slice(eq + 1).trim();
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1);
		}
		if (!(key in process.env)) process.env[key] = val;
	}
}

loadDotEnv();

// ─── Config (resolved after TUI — populated by runTUI()) ─────────────────────

let BLOGS_DIR = 'src/lib/md/blogs';
let CF_ACCOUNT = '';
let CF_TOKEN = '';
let REPLACE_MODE = false;

// ── Models ──
const MODEL_PROMPT = '@cf/ibm-granite/granite-4.0-h-micro'; // Stage 1: prompt engineer
const MODEL_IMAGE = '@cf/black-forest-labs/flux-2-klein-4b'; // Stage 2: image generator

// ── Image output — 1024×512 2:1 for all slots ──
const IMG_W = 1024;
const IMG_H = 512;

// Delay between full pipelines (Granite call + Flux call = 2 API calls per image)
const DELAY_MS = 8000;

const SKIP_HEADINGS = new Set([
	'sources',
	'key takeaways',
	'faq',
	'frequently asked questions',
	'conclusion',
	'next steps',
	'references',
	'introduction'
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
	console.log(`[${new Date().toLocaleTimeString()}] ${msg}`);
}

function httpsPost(hostname, urlPath, headers, body) {
	return new Promise((resolve, reject) => {
		const data = JSON.stringify(body);
		const req = https.request(
			{
				hostname,
				path: urlPath,
				method: 'POST',
				headers: { ...headers, 'Content-Length': Buffer.byteLength(data) }
			},
			(res) => {
				const chunks = [];
				res.on('data', (c) => chunks.push(c));
				res.on('end', () => {
					const buf = Buffer.concat(chunks);
					if (res.statusCode !== 200)
						reject(new Error(`HTTP ${res.statusCode}: ${buf.toString().slice(0, 300)}`));
					else resolve(buf);
				});
			}
		);
		req.on('error', reject);
		req.write(data);
		req.end();
	});
}

function cfPost(model, body) {
	return httpsPost(
		'api.cloudflare.com',
		`/client/v4/accounts/${CF_ACCOUNT}/ai/run/${model}`,
		{ Authorization: `Bearer ${CF_TOKEN}`, 'Content-Type': 'application/json' },
		body
	);
}

/**
 * Multipart form-data POST — required by Flux 2 models (flux-2-klein-4b, flux-2-dev).
 * Builds a minimal multipart body from a plain object of string fields.
 */
function cfPostMultipart(model, fields) {
	const boundary = `----FormBoundary${Math.random().toString(16).slice(2)}`;
	const lines = [];
	for (const [key, value] of Object.entries(fields)) {
		lines.push(`--${boundary}`);
		lines.push(`Content-Disposition: form-data; name="${key}"`);
		lines.push('');
		lines.push(String(value));
	}
	lines.push(`--${boundary}--`);
	const body = lines.join('\r\n');

	return new Promise((resolve, reject) => {
		const data = Buffer.from(body, 'utf-8');
		const req = https.request(
			{
				hostname: 'api.cloudflare.com',
				path: `/client/v4/accounts/${CF_ACCOUNT}/ai/run/${model}`,
				method: 'POST',
				headers: {
					Authorization: `Bearer ${CF_TOKEN}`,
					'Content-Type': `multipart/form-data; boundary=${boundary}`,
					'Content-Length': data.length
				}
			},
			(res) => {
				const chunks = [];
				res.on('data', (c) => chunks.push(c));
				res.on('end', () => {
					const buf = Buffer.concat(chunks);
					if (res.statusCode !== 200)
						reject(new Error(`HTTP ${res.statusCode}: ${buf.toString().slice(0, 300)}`));
					else resolve(buf);
				});
			}
		);
		req.on('error', reject);
		req.write(data);
		req.end();
	});
}

// ─── Stage 1: Granite — prompt engineer ──────────────────────────────────────

// Visual mood pool — Granite picks one implicitly via the style instruction
const MOODS = [
	'bright studio lighting, clean white background, airy and minimal',
	'soft natural daylight, warm beige tones, calm and open',
	'vibrant flat illustration, bold primary colors, playful and modern',
	'light isometric 3D render, pastel palette, soft shadows',
	'golden hour sunlight, warm amber tones, optimistic atmosphere',
	'dark cinematic lighting, deep navy and charcoal, dramatic',
	'neon-lit night scene, electric blues and purples, futuristic',
	'moody overcast light, muted cool tones, serious and focused'
];

/** Pick a pseudo-random mood based on a string seed (title/heading) so it's stable per image. */
function pickMood(seed) {
	let hash = 0;
	for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
	return MOODS[hash % MOODS.length];
}

const COVER_SYSTEM = `\
You are an image prompt engineer. Convert blog post metadata into a concise, vivid image generation prompt optimized for Flux diffusion models.
Rules:
- Output ONLY the image prompt. No explanations, no preamble, no quotes.
- Under 77 tokens, 1-3 sentences max.
- Describe only physical scenes, objects, lighting, and atmosphere — purely visual, no abstract concepts stated as words.
- Use the provided mood/lighting as the visual tone of the scene.
- Focus on metaphorical or environmental representations of the topic.
- End with one style tag: "photorealistic", "digital art", "3D render", or "flat illustration".`;

const SECTION_SYSTEM = `\
You are an image prompt engineer. Convert a blog section into a concise, vivid image generation prompt optimized for Flux diffusion models.
Rules:
- Output ONLY the image prompt. No explanations, no preamble, no quotes.
- Under 77 tokens, 1-3 sentences max.
- Describe only physical scenes, objects, lighting, and atmosphere — purely visual, no abstract concepts stated as words.
- Use the provided mood/lighting as the visual tone of the scene.
- Think of it as a chapter illustration: represent the section concept through objects and environment.
- End with one style tag: "photorealistic", "digital art", "3D render", or "flat illustration".`;

async function callGranite(systemPrompt, userMessage) {
	const buf = await cfPost(MODEL_PROMPT, {
		messages: [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userMessage }
		],
		max_tokens: 120,
		temperature: 0.7
	});

	const json = JSON.parse(buf.toString());
	if (!json.success) throw new Error(`Granite error: ${JSON.stringify(json.errors)}`);

	// CF chat models can return the text in several places depending on model version:
	//   json.result.response          — most common (llama, mistral, etc.)
	//   json.result.choices[0].message.content — OpenAI-compat shape
	//   json.result[0].response       — some older models
	const r = json.result;
	const raw =
		(typeof r?.response === 'string' ? r.response : null) ??
		(typeof r?.choices?.[0]?.message?.content === 'string' ? r.choices[0].message.content : null) ??
		(typeof r?.[0]?.response === 'string' ? r[0].response : null) ??
		'';

	if (!raw.trim()) {
		// Surface the raw result so you can see what shape came back
		throw new Error(`Granite returned an empty response. Raw result: ${JSON.stringify(r)}`);
	}
	return raw.trim();
}

// ─── Stage 1b: Post-process raw Granite output ───────────────────────────────

const KNOWN_STYLE_TAGS = [
	'photorealistic',
	'digital art',
	'3d render',
	'flat illustration',
	'cinematic',
	'editorial photography',
	'concept art',
	'oil painting',
	'watercolor',
	'vector art',
	'isometric',
	'low poly'
];

/**
 * Clean and harden the raw Granite prompt before sending to Flux:
 *  1. Strip markdown, surrounding quotes, preamble bleed
 *  2. Remove any explicit dimension / AR mentions (handled by API params)
 *  3. Ensure a style tag is present — default to "photorealistic" if missing
 *  4. Always append: no-text guard + wide landscape composition
 */
function postProcessPrompt(raw) {
	let p = raw
		// Strip markdown formatting
		.replace(/[*_`~]/g, '')
		// Strip surrounding quotes
		.replace(/^["']|["']$/g, '')
		// Strip common preamble patterns Granite might bleed through
		.replace(/^(here(?:'s| is)(?: the)?(?: image)?(?: prompt)?[:\s]*)/i, '')
		.replace(/^(image prompt[:\s]*)/i, '')
		.replace(/^(prompt[:\s]*)/i, '')
		// Remove explicit dimension / aspect ratio text to avoid duplication with API params
		.replace(/\b\d+\s*[x×]\s*\d+\b/gi, '')
		.replace(/\b(?:16:9|4:3|1:1|2:1|3:2)\s*(?:ratio|format|mode|orientation)?\b/gi, '')
		.replace(/\b(?:landscape|portrait)\s*(?:ratio|format|mode|orientation)\b/gi, '')
		// Collapse stray whitespace
		.replace(/\s{2,}/g, ' ')
		.trim();

	// Ensure a sentence terminator before we append
	if (p && !/[.,;]$/.test(p)) p += '.';

	// If no known style tag is present, default to photorealistic
	const hasStyleTag = KNOWN_STYLE_TAGS.some((tag) => p.toLowerCase().includes(tag));
	if (!hasStyleTag) p += ' Photorealistic.';

	// Fixed requirements — always appended last
	p += ' Wide landscape composition.';

	return p;
}

// ─── Full Stage-1 helpers (build metadata → call Granite → post-process) ─────

async function buildCoverPrompt({ title, description, tags }) {
	const tagList = Array.isArray(tags) ? tags.join(', ') : tags;
	const mood = pickMood(title);
	const metadata = [
		`Title: ${title}`,
		description ? `Description: ${description}` : '',
		tagList ? `Tags: ${tagList}` : '',
		`Mood/lighting: ${mood}`
	]
		.filter(Boolean)
		.join('\n');

	const userMessage = `Generate a cover image prompt for a blog post with this metadata:\n${metadata}\nOutput only the Flux image prompt.`;

	log(`    [Granite] Generating cover prompt… (mood: ${mood.split(',')[0]})`);
	const raw = await callGranite(COVER_SYSTEM, userMessage);
	const processed = postProcessPrompt(raw);
	log(`    [Granite] → ${processed}`);
	return processed;
}

async function buildSectionPrompt({ sectionHeading, snippet, articleTitle, tags }) {
	const tagList = Array.isArray(tags) ? tags.join(', ') : tags;
	const mood = pickMood(sectionHeading);
	const metadata = [
		`Article title: ${articleTitle}`,
		tagList ? `Article tags: ${tagList}` : '',
		`Section heading: ${sectionHeading}`,
		snippet ? `Section summary: ${snippet}` : '',
		`Mood/lighting: ${mood}`
	]
		.filter(Boolean)
		.join('\n');

	const userMessage = `Generate a section illustration prompt for a blog section with this context:\n${metadata}\nOutput only the Flux image prompt.`;

	log(
		`    [Granite] Generating section prompt for "${sectionHeading}"… (mood: ${mood.split(',')[0]})`
	);
	const raw = await callGranite(SECTION_SYSTEM, userMessage);
	const processed = postProcessPrompt(raw);
	log(`    [Granite] → ${processed}`);
	return processed;
}

// ─── Stage 2: Flux — image generator ─────────────────────────────────────────

async function generateImage(prompt) {
	if (!CF_ACCOUNT || !CF_TOKEN) {
		throw new Error(
			'Missing CF_ACCOUNT_ID / CF_API_TOKEN. Add to .env, set as env vars, or pass --account / --token.'
		);
	}

	log(`    [Flux] Generating image…`);
	// flux-2-klein-4b (and all Flux 2 models) require multipart/form-data — not JSON
	const buf = await cfPostMultipart(MODEL_IMAGE, {
		prompt,
		width: IMG_W,
		height: IMG_H
		// num_steps is fixed at 4 for distilled klein models — omit to use default
	});
	const json = JSON.parse(buf.toString());
	if (!json.success) throw new Error(`Flux error: ${JSON.stringify(json.errors)}`);
	return Buffer.from(json.result.image, 'base64');
}

// ─── WebP conversion ──────────────────────────────────────────────────────────

async function pngToWebp(pngBuf, outPath) {
	const tmpPng = outPath.replace(/\.webp$/, '.tmp.png');
	fs.writeFileSync(tmpPng, pngBuf);
	try {
		await execFileP('ffmpeg', ['-y', '-i', tmpPng, '-quality', '85', outPath]);
		fs.unlinkSync(tmpPng);
		return true;
	} catch {
		// ffmpeg not available — rename PNG → .webp (browsers accept either)
		fs.renameSync(tmpPng, outPath);
		return false;
	}
}

/**
 * Orchestrate one full image slot:
 *   promptBuilder() → Granite raw → post-process → Flux → WebP
 */
async function runPipeline(promptBuilder, outPath) {
	const prompt = await promptBuilder();
	const pngBuf = await generateImage(prompt);
	const usedFfmpeg = await pngToWebp(pngBuf, outPath);
	log(`    [Done] ${path.basename(outPath)}${usedFfmpeg ? '' : ' (png renamed → .webp)'}`);
}

// ─── Markdown helpers ─────────────────────────────────────────────────────────

function splitFrontmatter(content) {
	const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
	if (!match) return { meta: '', rest: content };
	return { meta: match[1], rest: match[2] };
}

function fmGet(meta, key) {
	const match = meta.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'));
	return match ? match[1].trim() : '';
}

function fmSet(meta, key, value) {
	const quoted = `"${value}"`;
	const re = new RegExp(`^(${key}:\\s*).*$`, 'm');
	if (re.test(meta)) return meta.replace(re, `$1${quoted}`);
	return meta + `\n${key}: ${quoted}`;
}

function parseSections(body) {
	const lines = body.split('\n');
	const sections = [];
	let current = { heading: '__cover__', body: [] };
	for (const line of lines) {
		const h2 = line.match(/^##\s+(.+)/);
		if (h2) {
			sections.push({ heading: current.heading, body: current.body.join('\n').trim() });
			current = { heading: h2[1].trim(), body: [] };
		} else {
			current.body.push(line);
		}
	}
	sections.push({ heading: current.heading, body: current.body.join('\n').trim() });
	return sections;
}

function stripMarkdown(text) {
	return text
		.replace(/^#{1,6}\s+/gm, '')
		.replace(/\*\*|__|[*_~`]/g, '')
		.replace(/<[^>]*>/g, '')
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
		.replace(/^\s*[-*+]\s+/gm, '')
		.replace(/\n{3,}/g, '\n\n')
		.trim();
}

function firstSentence(text, max = 120) {
	const clean = stripMarkdown(text);
	const match = clean.match(/[^.!?]+[.!?]/);
	const s = match ? match[0].trim() : clean.slice(0, max);
	return s.length > max ? s.slice(0, max) + '…' : s;
}

// ─── Normal mode: process flat .md files ────────────────────────────────────

async function processFile(mdPath) {
	const filename = path.basename(mdPath, '.md');
	const dir = path.dirname(mdPath);
	const folderPath = path.join(dir, filename);
	const newMdPath = path.join(folderPath, 'index.md');
	const imgDir = path.join(folderPath, 'images');

	fs.mkdirSync(imgDir, { recursive: true });

	if (fs.existsSync(mdPath)) {
		fs.copyFileSync(mdPath, newMdPath);
		fs.unlinkSync(mdPath);
		log(`Moved ${filename}.md → ${filename}/index.md`);
	}

	const raw = fs.readFileSync(newMdPath, 'utf-8');
	const { meta, rest } = splitFrontmatter(raw);

	const title = fmGet(meta, 'title');
	const description = fmGet(meta, 'description');
	const tagsRaw = fmGet(meta, 'tags');
	const tags = tagsRaw
		.replace(/[\[\]"]/g, '')
		.split(',')
		.map((s) => s.trim());

	log(`Processing: ${title || filename}`);

	const sections = parseSections(rest);
	let updatedMeta = meta;
	let updatedBody = rest;

	// ── Cover ──
	const coverFile = path.join(imgDir, 'cover.webp');
	const coverRelPath = './images/cover.webp';

	log(`  Generating cover…`);
	try {
		await runPipeline(() => buildCoverPrompt({ title, description, tags }), coverFile);
		updatedMeta = fmSet(updatedMeta, 'coverImage', coverRelPath);
		updatedMeta = fmSet(updatedMeta, 'coverImageAlt', `Cover image for: ${title}`);
	} catch (err) {
		log(`  ✗ Cover failed: ${err.message}`);
	}

	await sleep(DELAY_MS);

	// ── Sections ──
	for (const section of sections) {
		if (section.heading === '__cover__') continue;
		if (SKIP_HEADINGS.has(section.heading.toLowerCase())) {
			log(`  Skipping section: "${section.heading}"`);
			continue;
		}

		const sectionSlug = section.heading
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');

		const imgFile = path.join(imgDir, `${sectionSlug}.webp`);
		const imgRelPath = `./images/${sectionSlug}.webp`;
		const snippet = firstSentence(section.body);

		log(`  Generating section: "${section.heading}"…`);
		try {
			await runPipeline(
				() =>
					buildSectionPrompt({
						sectionHeading: section.heading,
						snippet,
						articleTitle: title,
						tags
					}),
				imgFile
			);
			const headingPattern = new RegExp(
				`(^##\\s+${section.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$)`,
				'm'
			);
			updatedBody = updatedBody.replace(
				headingPattern,
				`$1\n\n![${section.heading}](${imgRelPath})\n`
			);
		} catch (err) {
			log(`  ✗ Section "${section.heading}" failed: ${err.message}`);
		}

		await sleep(DELAY_MS);
	}

	fs.writeFileSync(newMdPath, `---\n${updatedMeta}\n---\n${updatedBody}`, 'utf-8');
	log(`  ✓ index.md updated\n`);
}

// ─── Replace mode: re-generate images in existing folder/index.md ────────────

function collectExistingImageRefs(meta, body, imgDir) {
	const refs = [];
	const seen = new Set();

	const add = (relPath) => {
		const match = relPath.match(/\.\/images\/(.+)$/);
		if (!match) return;
		const name = match[1];
		if (seen.has(name)) return;
		seen.add(name);
		refs.push({ name, relPath, absPath: path.join(imgDir, name) });
	};

	const coverVal = fmGet(meta, 'coverImage');
	if (coverVal) add(coverVal);

	const inlineRe = /!\[[^\]]*\]\((\.\/images\/[^)]+)\)/g;
	let m;
	while ((m = inlineRe.exec(body)) !== null) add(m[1]);

	return refs;
}

async function replaceFile(folderPath) {
	const indexMd = path.join(folderPath, 'index.md');
	const imgDir = path.join(folderPath, 'images');

	if (!fs.existsSync(indexMd)) {
		log(`  Skipping (no index.md): ${folderPath}`);
		return;
	}

	const raw = fs.readFileSync(indexMd, 'utf-8');
	const { meta, rest } = splitFrontmatter(raw);

	const title = fmGet(meta, 'title');
	const description = fmGet(meta, 'description');
	const tagsRaw = fmGet(meta, 'tags');
	const tags = tagsRaw
		.replace(/[\[\]"]/g, '')
		.split(',')
		.map((s) => s.trim());

	log(`Replace mode — ${title || path.basename(folderPath)}`);

	if (!fs.existsSync(imgDir)) {
		log(`  No images/ folder found, skipping.`);
		return;
	}

	const refs = collectExistingImageRefs(meta, rest, imgDir);
	if (refs.length === 0) {
		log(`  No existing image references found, skipping.`);
		return;
	}

	log(`  Found ${refs.length} image reference(s) to replace.`);

	for (const ref of refs) {
		log(`  Re-generating: ${ref.name}…`);
		try {
			if (ref.name === 'cover.webp') {
				await runPipeline(() => buildCoverPrompt({ title, description, tags }), ref.absPath);
			} else {
				// Reverse the slug back to a heading
				const slug = ref.name.replace(/\.webp$/, '');
				const allHeadings = [...rest.matchAll(/^##\s+(.+)$/gm)].map((m) => m[1].trim());
				const matchedHeading =
					allHeadings.find(
						(h) =>
							h
								.toLowerCase()
								.replace(/[^a-z0-9]+/g, '-')
								.replace(/^-|-$/g, '') === slug
					) ?? slug.replace(/-/g, ' ');

				const sectionRe = new RegExp(
					`^##\\s+${matchedHeading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$([\\s\\S]*?)(?=^##\\s|$)`,
					'm'
				);
				const sectionMatch = rest.match(sectionRe);
				const snippet = sectionMatch ? firstSentence(sectionMatch[1]) : '';

				await runPipeline(
					() =>
						buildSectionPrompt({
							sectionHeading: matchedHeading,
							snippet,
							articleTitle: title,
							tags
						}),
					ref.absPath
				);
			}
			log(`  ✓ Replaced: ${ref.name}`);
		} catch (err) {
			log(`  ✗ Failed (${ref.name}): ${err.message}`);
		}

		await sleep(DELAY_MS);
	}

	log(`  ✓ Done\n`);
}

// ─── TUI ─────────────────────────────────────────────────────────────────────

import readline from 'readline';

// ANSI helpers
const c = {
	reset: '\x1b[0m',
	bold: '\x1b[1m',
	dim: '\x1b[2m',
	cyan: '\x1b[36m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	red: '\x1b[31m',
	blue: '\x1b[34m',
	gray: '\x1b[90m'
};

const fmt = {
	header: (s) => `${c.bold}${c.cyan}${s}${c.reset}`,
	label: (s) => `${c.bold}${s}${c.reset}`,
	dim: (s) => `${c.dim}${s}${c.reset}`,
	ok: (s) => `${c.green}${s}${c.reset}`,
	warn: (s) => `${c.yellow}${s}${c.reset}`,
	err: (s) => `${c.red}${s}${c.reset}`,
	accent: (s) => `${c.blue}${s}${c.reset}`
};

function clearScreen() {
	process.stdout.write('\x1bc');
}

function printBanner() {
	console.log(fmt.header('╔══════════════════════════════════════════╗'));
	console.log(fmt.header('║        Blog Image Generator  v2          ║'));
	console.log(fmt.header('║  Granite 4.0 → Flux 2 Klein  ·  CF AI    ║'));
	console.log(fmt.header('╚══════════════════════════════════════════╝'));
	console.log();
}

function printSummary(config) {
	console.log(fmt.header('┌─ Run config ──────────────────────────────'));
	console.log(`${fmt.header('│')} ${fmt.label('Directory')}  ${config.dir}`);
	console.log(
		`${fmt.header('│')} ${fmt.label('Mode     ')}  ${config.replace ? fmt.warn('Replace (overwrite existing images)') : fmt.ok('Normal (generate new images)')}`
	);
	console.log(
		`${fmt.header('│')} ${fmt.label('Account  ')}  ${config.account ? fmt.ok('✓ set') : fmt.err('✗ missing')}`
	);
	console.log(
		`${fmt.header('│')} ${fmt.label('Token    ')}  ${config.token ? fmt.ok('✓ set') : fmt.err('✗ missing')}`
	);
	console.log(fmt.header('└───────────────────────────────────────────'));
	console.log();
}

/**
 * Minimal readline prompt — resolves to trimmed user input.
 * Shows a default value in dim if provided; pressing Enter accepts it.
 */
function prompt(rl, question, defaultValue = '') {
	return new Promise((resolve) => {
		const hint = defaultValue ? ` ${fmt.dim(`(${defaultValue})`)}` : '';
		rl.question(`${fmt.accent('?')} ${question}${hint}: `, (answer) => {
			resolve(answer.trim() || defaultValue);
		});
	});
}

/**
 * Yes/no prompt — returns boolean.
 * Default is shown as [Y/n] or [y/N].
 */
function promptBool(rl, question, defaultYes = false) {
	return new Promise((resolve) => {
		const hint = defaultYes ? fmt.dim('[Y/n]') : fmt.dim('[y/N]');
		rl.question(`${fmt.accent('?')} ${question} ${hint}: `, (answer) => {
			const a = answer.trim().toLowerCase();
			if (!a) return resolve(defaultYes);
			resolve(a === 'y' || a === 'yes');
		});
	});
}

/**
 * Single-select menu — returns the chosen index.
 * options: string[]
 */
async function promptSelect(rl, question, options, defaultIndex = 0) {
	console.log(`${fmt.accent('?')} ${question}`);
	options.forEach((opt, i) => {
		const marker = i === defaultIndex ? fmt.ok('●') : fmt.dim('○');
		const num = fmt.dim(`${i + 1}.`);
		console.log(`  ${marker} ${num} ${i === defaultIndex ? fmt.label(opt) : opt}`);
	});

	return new Promise((resolve) => {
		rl.question(
			`  ${fmt.dim(`Enter 1–${options.length}`)} ${fmt.dim(`(default ${defaultIndex + 1})`)}: `,
			(answer) => {
				const n = parseInt(answer.trim(), 10);
				if (!answer.trim()) return resolve(defaultIndex);
				if (n >= 1 && n <= options.length) return resolve(n - 1);
				resolve(defaultIndex);
			}
		);
	});
}

/**
 * Full interactive TUI.
 * Populates the module-level config vars (BLOGS_DIR, CF_ACCOUNT, CF_TOKEN, REPLACE_MODE).
 */
async function runTUI() {
	clearScreen();
	printBanner();

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	// ── Credentials ──
	// Pre-fill from .env / env vars; only ask if still missing.
	let account = process.env.CF_ACCOUNT_ID ?? '';
	let token = process.env.CF_API_TOKEN ?? '';

	if (account) {
		console.log(`${fmt.ok('✓')} CF_ACCOUNT_ID loaded from environment`);
	} else {
		account = await prompt(rl, 'Cloudflare Account ID');
	}

	if (token) {
		console.log(`${fmt.ok('✓')} CF_API_TOKEN loaded from environment`);
	} else {
		token = await prompt(rl, 'Cloudflare API Token');
	}

	console.log();

	// ── Blogs directory ──
	const dir = await prompt(rl, 'Blogs directory', 'src/lib/md/blogs');
	console.log();

	// ── Mode ──
	const modeIdx = await promptSelect(
		rl,
		'Mode',
		[
			'Normal  — process flat .md files → move to folder + generate images',
			'Replace — re-generate images inside existing blog folders'
		],
		0
	);
	const replace = modeIdx === 1;
	console.log();

	rl.close();

	// ── Confirm ──
	printSummary({ dir, replace, account, token });

	// Validate before handing off
	const missing = [];
	if (!account) missing.push('Cloudflare Account ID');
	if (!token) missing.push('Cloudflare API Token');
	if (!fs.existsSync(dir)) missing.push(`Directory not found: ${dir}`);

	if (missing.length) {
		console.log(fmt.err('✗ Cannot run — missing required values:'));
		missing.forEach((m) => console.log(`  ${fmt.err('·')} ${m}`));
		process.exit(1);
	}

	// Commit to module-level config
	CF_ACCOUNT = account;
	CF_TOKEN = token;
	BLOGS_DIR = dir;
	REPLACE_MODE = replace;
}

// ─── Run ──────────────────────────────────────────────────────────────────────

async function run() {
	await runTUI();

	console.log(fmt.dim(`Stage 1 (prompt): ${MODEL_PROMPT}`));
	console.log(fmt.dim(`Stage 2 (image) : ${MODEL_IMAGE}`));
	console.log(fmt.dim(`Output           : ${IMG_W}×${IMG_H} WebP`));
	console.log(fmt.dim(`Delay            : ${DELAY_MS}ms between images`));
	console.log();

	if (REPLACE_MODE) {
		const entries = fs.readdirSync(BLOGS_DIR, { withFileTypes: true });
		const folders = entries
			.filter((e) => e.isDirectory())
			.map((e) => path.join(BLOGS_DIR, e.name))
			.sort();

		if (folders.length === 0) {
			console.log(fmt.warn('No subdirectories found in ' + BLOGS_DIR));
			process.exit(0);
		}

		log(`[Replace mode] Found ${folders.length} folder(s)`);
		for (const folderPath of folders) await replaceFile(folderPath);
	} else {
		const mdFiles = fs
			.readdirSync(BLOGS_DIR)
			.filter((f) => f.endsWith('.md'))
			.map((f) => path.join(BLOGS_DIR, f))
			.sort();

		if (mdFiles.length === 0) {
			console.log(fmt.warn('No .md files found in ' + BLOGS_DIR));
			process.exit(0);
		}

		log(`Found ${mdFiles.length} markdown file(s)`);
		for (const mdPath of mdFiles) await processFile(mdPath);
	}

	console.log();
	console.log(fmt.ok('✓ All done!'));
}

run().catch((err) => {
	console.error(fmt.err('Fatal: ') + err.message);
	process.exit(1);
});
