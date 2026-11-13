import type { APIRoute } from 'astro';
import { BLOG_TITLE, getPosts } from '../../lib/blog';
import { SITE } from '../../data/site';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const home = new URL('/blog/', SITE.origin).href;
  const items = posts.slice(0, 50).map((p) => `    <item>
      <title>${esc(p.heading)}</title>
      <link>${p.url}</link>
      <guid isPermaLink="true">${p.url}</guid>
      <description>${esc(p.description)}</description>
      <dc:creator>${esc(p.author.name)}</dc:creator>
      <category>${esc(p.category.label)}</category>
      <pubDate>${p.published.toUTCString()}</pubDate>
    </item>`).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(BLOG_TITLE)}</title>
    <link>${home}</link>
    <description>Articles from Panoptes on business observability.</description>
    <language>en-gb</language>
    <atom:link href="${new URL('/blog/rss.xml', SITE.origin).href}" rel="self" type="application/rss+xml" />
${posts.length ? `    <lastBuildDate>${(posts[0].updated ?? posts[0].published).toUTCString()}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
