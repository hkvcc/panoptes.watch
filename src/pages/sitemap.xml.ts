import type { APIRoute } from 'astro';
import { getPosts, isoDate } from '../lib/blog';

// Builds sitemap.xml at build time from every .astro page (excluding utility and dynamic
// routes) plus every published blog article. Drafts never reach getPosts() in production.
const pages = import.meta.glob('./**/*.astro', { eager: false });
const EXCLUDE = ['/404/'];

export const GET: APIRoute = async ({ site }) => {
  const today = new Date().toISOString().slice(0, 10);
  const posts = await getPosts();
  const entries = new Map<string, string>();
  Object.keys(pages)
    .map((p) => p.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/').replace(/^\/index$/, '/'))
    .map((p) => (p.endsWith('/') ? p : `${p}/`))
    .filter((p) => !p.includes('[') && !EXCLUDE.includes(p))
    .forEach((p) => entries.set(p, today));
  if (posts.length) entries.set('/blog/', isoDate(posts[0].updated ?? posts[0].published));
  for (const p of posts) entries.set(p.href, isoDate(p.updated ?? p.published));

  const urls = [...entries.keys()].sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
  const priority = (u: string) => (u === '/' ? '1.0' : u.split('/').length <= 3 ? '0.8' : '0.6');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc><lastmod>${entries.get(u)}</lastmod><priority>${priority(u)}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
