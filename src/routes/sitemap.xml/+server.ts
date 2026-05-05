// src/routes/sitemap.xml/+server.ts

import MY_EXPERIENCES from "$lib/experiences.params";
import MY_PROJECTS from "$lib/projects.params";
import MY_SKILLS from "$lib/skills.params";


export async function GET() {
    const base = 'https://denvie.online';

    const staticPages = ['', '/projects', '/experience', '/skills', '/resume', '/search'];

    const projectPages = MY_PROJECTS.map(p => `/projects/${p.slug}`);
    const experiencePages = MY_EXPERIENCES.map(e => `/experience/${e.slug}`);
    const skillPages = MY_SKILLS.map(s => `/skills/${s.slug}`);

    const allPages = [...staticPages, ...projectPages, ...experiencePages, ...skillPages];

    const urls = allPages.map(p => `
        <url>
            <loc>${base}${p}</loc>
            <changefreq>monthly</changefreq>
            <priority>${p === '' ? '1.0' : '0.8'}</priority>
        </url>`).join('');

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/0.9/sitemap">
            ${urls}
        </urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
    );
}