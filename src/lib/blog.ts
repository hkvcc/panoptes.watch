/**
 * Blog loader. Reads the `blog` content collection (content/blog/*.md), validates what the
 * schema can't see on its own, and returns published posts with everything the templates,
 * search index, RSS feed and sitemap need. Adding a Markdown file is the whole publishing
 * step: nothing here lists articles by hand.
 */
import fs from 'node:fs';
import path from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE } from '../data/site';
import { crossCheck } from './blog-schema';
import { normalize, slugify } from './blog-query';

export type BlogEntry = CollectionEntry<'blog'>;

export interface Term { label: string; slug: string }

export interface Post {
  id: string;
  entry: BlogEntry;
  href: string;            // /blog/<id>/
  url: string;             // absolute canonical URL
  heading: string;         // display H1
  seoTitle: string;        // <title>
  description: string;
  category: Term;
  tags: Term[];
  keyword?: string;
  author: string;
  published: Date;
  updated?: Date;          // only when later than `published`
  cover?: string;
  coverAlt?: string;
  featured: boolean;
  draft: boolean;
  words: number;
  minutes: number;
  plain: string;           // article text without Markdown syntax
}

/** Used when an article has no `category`; the campaign's articles are all on this topic. */
export const DEFAULT_CATEGORY = 'Business observability';
export const BLOG_TITLE = 'Panoptes blog';

const PUBLIC_DIR = path.resolve('public');

/** Strips Markdown syntax for word counts, excerpts and the search index. */
export function toPlainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')            // fenced code
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')                   // inline HTML
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')   // images → alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')    // links → text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')         // heading markers
    .replace(/^\s*[-*+]\s+|^\s*\d+\.\s+/gm, '') // list markers
    .replace(/^\s*>\s?/gm, '')                  // blockquotes
    .replace(/^\s*\|?\s*:?-{3,}.*$/gm, ' ')     // table rules
    .replace(/[|*_`~]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** The first "# " heading outside code fences, if any. */
export function extractH1(md: string): string | undefined {
  const m = /^#\s+(.+?)\s*#*\s*$/m.exec(md.replace(/```[\s\S]*?```/g, ''));
  return m?.[1].trim();
}

const countWords = (text: string) => (text.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length;

function toPost(entry: BlogEntry): Post {
  const d = entry.data;
  const problems = crossCheck(entry.id, d, SITE.origin);
  if (d.cover && !fs.existsSync(path.join(PUBLIC_DIR, d.cover))) problems.push(`cover "${d.cover}" not found in public/`);
  if (problems.length) {
    throw new Error(`Invalid blog article content/blog/${entry.id}.md:\n  - ${problems.join('\n  - ')}`);
  }
  const body = entry.body ?? '';
  const plain = toPlainText(body.replace(/^#\s+.+$/m, ''));
  const words = countWords(plain);
  const published = (d.published ?? d.reviewed) as Date;
  const latest = d.updated ?? d.reviewed;
  const categoryLabel = d.category ?? DEFAULT_CATEGORY;
  const tagLabels = d.tags.length ? d.tags : d.primary_keyword ? [d.primary_keyword] : [];
  const seen = new Set<string>();
  const tags = tagLabels
    .map((label) => ({ label, slug: slugify(label) }))
    .filter((t) => t.slug && !seen.has(t.slug) && seen.add(t.slug));
  return {
    id: entry.id,
    entry,
    href: `/blog/${entry.id}/`,
    url: new URL(`/blog/${entry.id}/`, SITE.origin).href,
    heading: extractH1(body) ?? d.title,
    seoTitle: d.title,
    description: d.meta_description,
    category: { label: categoryLabel, slug: slugify(categoryLabel) },
    tags,
    keyword: d.primary_keyword,
    author: d.author,
    published,
    updated: latest && latest.getTime() > published.getTime() ? latest : undefined,
    cover: d.cover,
    coverAlt: d.image_alt,
    featured: d.featured,
    draft: d.draft,
    words,
    minutes: Math.max(1, Math.round(words / 230)),
    plain,
  };
}

const byNewest = (a: Post, b: Post) => b.published.getTime() - a.published.getTime() || a.id.localeCompare(b.id);

/**
 * Published posts, newest first. Drafts are excluded from production builds entirely
 * (no page, no listing, no sitemap/RSS/search entry); `astro dev` shows them for preview.
 */
export async function getPosts(): Promise<Post[]> {
  const entries = await getCollection('blog');
  const posts = entries.map(toPost).sort(byNewest);
  return import.meta.env.DEV ? posts : posts.filter((p) => !p.draft);
}

/** The newest article marked `featured: true`, otherwise the newest article. */
export const pickFeatured = (posts: Post[]): Post | undefined => posts.find((p) => p.featured) ?? posts[0];

/** Categories that actually have published articles, most-used first. */
export function categoriesOf(posts: Post[]): (Term & { count: number })[] {
  const map = new Map<string, Term & { count: number }>();
  for (const p of posts) {
    const c = map.get(p.category.slug) ?? { ...p.category, count: 0 };
    c.count += 1;
    map.set(p.category.slug, c);
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

/** Related articles: shared tags weigh most, then category and keyword overlap; ties go to the newest. */
export function relatedPosts(post: Post, posts: Post[], limit = 3): Post[] {
  const tagSet = new Set(post.tags.map((t) => t.slug));
  const kw = new Set(normalize(post.keyword ?? '').split(' ').filter((w) => w.length > 3));
  return posts
    .filter((p) => p.id !== post.id)
    .map((p) => {
      let score = p.tags.filter((t) => tagSet.has(t.slug)).length * 3;
      if (p.category.slug === post.category.slug) score += 2;
      score += normalize(p.keyword ?? '').split(' ').filter((w) => kw.has(w)).length;
      return { p, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || byNewest(a.p, b.p))
    .slice(0, limit)
    .map((x) => x.p);
}

export const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Text the client search matches against before the full-text index has loaded. */
export const metaText = (p: Post) => normalize([p.heading, p.seoTitle, p.description, p.category.label, p.keyword ?? '', ...p.tags.map((t) => t.label)].join(' '));

export const isRasterImage = (src?: string) => !!src && /\.(png|jpe?g|webp)$/i.test(src);
