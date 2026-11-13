/**
 * Search, filter, sort and pagination for the /blog/ index. Pure functions with no
 * imports, shared by the browser script (src/components/blog/BlogBrowser.astro) and the
 * unit tests (tests/blog-query.test.ts). The page state lives in the URL:
 *   /blog/?q=onboarding&category=process-monitoring&tag=kpis&sort=oldest&page=2
 */

export type Sort = 'newest' | 'oldest';

export interface QueryState {
  q: string;
  category: string; // category slug, '' = all
  tag: string;      // tag slug, '' = all
  sort: Sort;
  page: number;     // 1-based
}

export interface QueryItem {
  id: string;
  category: string;  // category slug
  tags: string[];    // tag slugs
  date: number;      // publication time (ms) used for sorting
  meta: string;      // normalised title, description, category, tags, keyword
  body?: string;     // normalised article text, once the search index has loaded
}

export const PAGE_SIZE = 9;
export const DEFAULT_STATE: QueryState = { q: '', category: '', tag: '', sort: 'newest', page: 1 };

/** Lower-case, strip accents and punctuation noise, collapse whitespace. */
export function normalize(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^\p{L}\p{N}'+#.\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** URL-safe identifier for categories and tags: "Process & operations" → "process-operations". */
export function slugify(input: string): string {
  return normalize(input).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function terms(q: string): string[] {
  return normalize(q).split(' ').filter(Boolean);
}

/** Every term must appear somewhere (partial words match: "onboard" finds "onboarding"). */
export function matchesQuery(item: QueryItem, q: string): boolean {
  const t = terms(q);
  if (!t.length) return true;
  const hay = item.body ? `${item.meta} ${item.body}` : item.meta;
  return t.every((term) => hay.includes(term));
}

export function parseState(params: URLSearchParams): QueryState {
  const sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
  const page = Number.parseInt(params.get('page') ?? '1', 10);
  return {
    q: (params.get('q') ?? '').replace(/\s+/g, ' ').trim().slice(0, 120),
    category: slugify(params.get('category') ?? ''),
    tag: slugify(params.get('tag') ?? ''),
    sort,
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

/** Only non-default values are written, so the plain /blog/ URL stays canonical. */
export function serializeState(s: QueryState): string {
  const p = new URLSearchParams();
  if (s.q) p.set('q', s.q);
  if (s.category) p.set('category', s.category);
  if (s.tag) p.set('tag', s.tag);
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.page > 1) p.set('page', String(s.page));
  const str = p.toString();
  return str ? `?${str}` : '';
}

export const isFiltered = (s: QueryState) => Boolean(s.q || s.category || s.tag);

export interface QueryResult {
  ids: string[];        // ids on the current page, in display order
  total: number;        // matching articles (all pages)
  page: number;         // clamped current page
  pages: number;
  showFeatured: boolean;
}

/**
 * Applies search + category + tag, sorts, then paginates. With no filters active the
 * featured article is shown in its own slot and left out of the grid (on every page,
 * so page boundaries don't shift); once the reader filters, it competes like any other.
 */
export function runQuery(items: QueryItem[], s: QueryState, featuredId?: string, pageSize = PAGE_SIZE): QueryResult {
  const filtered = isFiltered(s);
  let list = items.filter(
    (it) =>
      (!s.category || it.category === s.category) &&
      (!s.tag || it.tags.includes(s.tag)) &&
      matchesQuery(it, s.q),
  );
  const showFeatured = !filtered && !!featuredId && items.some((it) => it.id === featuredId);
  if (showFeatured) list = list.filter((it) => it.id !== featuredId);
  list = [...list].sort((a, b) => (s.sort === 'oldest' ? a.date - b.date : b.date - a.date) || a.id.localeCompare(b.id));
  const pages = Math.max(1, Math.ceil(list.length / pageSize));
  const page = Math.min(Math.max(1, s.page), pages);
  return {
    ids: list.slice((page - 1) * pageSize, page * pageSize).map((it) => it.id),
    total: list.length + (showFeatured ? 1 : 0),
    page,
    pages,
    showFeatured: showFeatured && page === 1,
  };
}

/** Per-category counts for the current search and tag, so filter labels stay truthful. */
export function categoryCounts(items: QueryItem[], s: QueryState): Map<string, number> {
  const counts = new Map<string, number>();
  for (const it of items) {
    if ((s.tag && !it.tags.includes(s.tag)) || !matchesQuery(it, s.q)) continue;
    counts.set(it.category, (counts.get(it.category) ?? 0) + 1);
  }
  return counts;
}

/** Compact page list with gaps, e.g. [1, '…', 4, 5, 6, '…', 12]. */
export function pageList(page: number, pages: number): (number | '…')[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, pages, page - 1, page, page + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | '…')[] = [];
  sorted.forEach((n, i) => {
    if (i && n - sorted[i - 1] > 1) out.push('…');
    out.push(n);
  });
  return out;
}
