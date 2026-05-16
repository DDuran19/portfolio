import type { BlogPost } from "./types";

// Dynamically import all blog markdown files — just drop a new .md in the folder
const blogModules = import.meta.glob('/src/lib/md/blogs/*/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const imageModules = import.meta.glob('/src/lib/md/blogs/*/images/*', {
	eager: true,
	import: 'default',
	query: '?url'
}) as Record<string, string>;

export function resolveImage(slug: string, relativePath: string): string {
	// relativePath might be "./images/cover.webp" or "images/cover.webp"
	const normalized = relativePath.replace(/^\.\//, '');
	const key = `/src/lib/md/blogs/${slug}/${normalized}`;
	return imageModules[key] ?? relativePath;
}

// Function to parse frontmatter from markdown content
export function parseFrontmatter(content: string): Record<string, string | string[]> {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
	const match = content.match(frontmatterRegex);

	if (!match) return {};

	const metadata: Record<string, string | string[]> = {};

	for (const line of match[1].split('\n')) {
		const colonIndex = line.indexOf(':');
		if (colonIndex === -1) continue;

		const key = line.slice(0, colonIndex).trim();
		const raw = line.slice(colonIndex + 1).trim();

		if (!key || !raw) continue;

		if (key === 'tags') {
			// Handle: tags: ["performance", "optimization"] or tags: [performance, optimization]
			metadata[key] = raw
				.replace(/[\[\]]/g, '')
				.split(',')
				.map((tag) => tag.trim().replace(/^["']|["']$/g, ''))
				.filter(Boolean);
		} else {
			// Strip surrounding quotes
			metadata[key] = raw.replace(/^["']|["']$/g, '');
		}
	}

	return metadata;
}

// Function to extract content without frontmatter
export function extractContent(content: string): string {
	return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, '').trim();
}

// Function to get a plain-text excerpt from markdown content
export function getExcerpt(content: string, maxLength = 160): string {
	const plainText = content
		.replace(/^#{1,6}\s+/gm, '')    // Remove heading markers
		.replace(/\*\*|__|[*_~`]/g, '') // Remove inline formatting
		.replace(/<[^>]*>/g, '')         // Remove HTML tags
		.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Unwrap links → keep label
		.replace(/\n+/g, ' ')            // Collapse newlines
		.trim();

	if (plainText.length <= maxLength) return plainText;

	// Try to cut at a sentence boundary
	const cut = plainText.slice(0, maxLength);
	const lastPeriod = cut.lastIndexOf('.');
	return lastPeriod > maxLength * 0.6
		? cut.slice(0, lastPeriod + 1)
		: cut.trimEnd() + '…';
}

function slugFromPath(path: string): string {
	// '/src/lib/md/blogs/api-integration-failures/index.md'
	// → 'api-integration-failures'
	const parts = path.split('/');
	return parts[parts.length - 2]; // folder name, not filename
}

// Parse every glob entry into a fully-typed BlogPost
const BLOG_POSTS: BlogPost[] = Object.entries(blogModules)
	.sort(([a], [b]) => a.localeCompare(b))
	.map(([path, raw]) => {
		const meta = parseFrontmatter(raw);
		const content = extractContent(raw);
		const slug = slugFromPath(path); // extract first so we can reuse it

		return {
			slug,
			title: (meta.title as string) ?? '',
			description: (meta.description as string) ?? '',
			coverImage: meta.coverImage ? resolveImage(slug, meta.coverImage as string) : '',
			// ^^^ resolve here so it's a proper Vite URL everywhere
			coverImageAlt: (meta.coverImageAlt as string) ?? '',
			date: (meta.date as string) ?? '',
			lastUpdated: (meta.lastUpdated as string) ?? '',
			author: (meta.author as string) ?? '',
			tags: (meta.tags as string[]) ?? [],
			content,
			excerpt: getExcerpt(content),
		};
	});

export default BLOG_POSTS;