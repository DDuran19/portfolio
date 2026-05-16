import BLOG_POSTS from '$lib/blogs.params';

export function load({ params }: { params: Record<string, string> }) {
	if (params.slug) {
		const index = BLOG_POSTS.findIndex((p) => p.slug === params.slug);
		const post = BLOG_POSTS[index];

		return {
			post,
			prev: BLOG_POSTS[index - 1] ?? null,
			next: BLOG_POSTS[index + 1] ?? null,
		};
	}
}