import type { APIRoute } from 'astro';
import { getPosts } from '../../lib/blog';
import { normalize } from '../../lib/blog-query';

// Full-text index for /blog/ search, fetched only when a reader starts typing.
// Titles, descriptions, categories and tags are already on the cards; this adds article text.
export const GET: APIRoute = async () => {
  const posts = await getPosts();
  const rows = posts.map((p) => ({ id: p.id, text: normalize(p.plain) }));
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
