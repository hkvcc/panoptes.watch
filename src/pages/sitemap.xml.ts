import type { APIRoute } from 'astro';

// Builds sitemap.xml from every .astro page at build time (excluding utility routes).
const pages = import.meta.glob('./**/*.astro', { eager: false });
const EXCLUDE = ['/404/'];

export const GET: APIRoute = ({ site }) => {
  const urls = Object.keys(pages)
    .map((p) => p.replace(/^\.\//, '/').replace(/\.astro$/, '').replace(/\/index$/, '/').replace(/^\/index$/, '/'))
    .map((p) => (p.endsWith('/') ? p : `${p}/`))
    .filter((p) => !p.includes('[') && !EXCLUDE.includes(p))
    .sort((a, b) => a.split('/').length - b.split('/').length || a.localeCompare(b));
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${new URL(u, site).href}</loc><lastmod>${lastmod}</lastmod><priority>${u === '/' ? '1.0' : u.split('/').length <= 3 ? '0.8' : '0.6'}</priority></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
