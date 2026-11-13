import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categoryCounts, matchesQuery, normalize, pageList, parseState, runQuery, serializeState, slugify, DEFAULT_STATE, type QueryItem } from '../src/lib/blog-query.ts';

const item = (id: string, category: string, date: number, meta: string, tags: string[] = [], body?: string): QueryItem =>
  ({ id, category, date, meta: normalize(meta), tags, body: body && normalize(body) });

const items: QueryItem[] = Array.from({ length: 12 }, (_, i) =>
  item(`p${i + 1}`, i % 2 ? 'metrics' : 'process', i + 1, `Article ${i + 1} ${i % 2 ? 'KPI dashboards' : 'Onboarding queues'}`, i % 3 ? ['kpis'] : ['queues']));

test('normalize lower-cases, strips accents and collapses whitespace', () => {
  assert.equal(normalize('  Café   ÉTAPE\tOne  '), 'cafe etape one');
  assert.equal(slugify('Process & operations'), 'process-operations');
});

test('search is case-insensitive, partial and requires every term', () => {
  const it = item('a', 'x', 1, 'Onboarding verification queues');
  assert.ok(matchesQuery(it, 'ONBOARD'));
  assert.ok(matchesQuery(it, '  verif   queue '));
  assert.ok(!matchesQuery(it, 'onboarding invoices'));
  assert.ok(matchesQuery(it, ''));
});

test('search covers article body once the index is loaded', () => {
  const it = item('a', 'x', 1, 'Title', [], 'mentions reconciliation backlogs');
  assert.ok(matchesQuery(it, 'reconcil'));
});

test('category, tag and search combine', () => {
  const r = runQuery(items, { ...DEFAULT_STATE, category: 'metrics', tag: 'kpis', q: 'dashboards' });
  assert.ok(r.total > 0);
  for (const id of r.ids) {
    const it = items.find((x) => x.id === id)!;
    assert.equal(it.category, 'metrics');
    assert.ok(it.tags.includes('kpis'));
  }
});

test('sorting newest/oldest', () => {
  assert.equal(runQuery(items, DEFAULT_STATE).ids[0], 'p12');
  assert.equal(runQuery(items, { ...DEFAULT_STATE, sort: 'oldest' }).ids[0], 'p1');
});

test('pagination respects filters and clamps out-of-range pages', () => {
  const r1 = runQuery(items, DEFAULT_STATE, undefined, 5);
  assert.deepEqual([r1.pages, r1.ids.length, r1.total], [3, 5, 12]);
  const r3 = runQuery(items, { ...DEFAULT_STATE, page: 99 }, undefined, 5);
  assert.deepEqual([r3.page, r3.ids.length], [3, 2]);
  const filtered = runQuery(items, { ...DEFAULT_STATE, category: 'process', page: 2 }, undefined, 5);
  assert.deepEqual([filtered.total, filtered.pages, filtered.page], [6, 2, 2]);
});

test('featured article is pulled out only in the unfiltered view', () => {
  const plain = runQuery(items, DEFAULT_STATE, 'p12');
  assert.ok(plain.showFeatured && !plain.ids.includes('p12'));
  assert.equal(plain.total, 12);
  const searched = runQuery(items, { ...DEFAULT_STATE, q: 'article 12' }, 'p12');
  assert.ok(!searched.showFeatured && searched.ids.includes('p12'));
  const page2 = runQuery(items, { ...DEFAULT_STATE, page: 2 }, 'p12', 5);
  assert.ok(!page2.showFeatured && !page2.ids.includes('p12'));
});

test('category counts reflect the active search and tag', () => {
  const counts = categoryCounts(items, { ...DEFAULT_STATE, q: 'onboarding' });
  assert.equal(counts.get('process'), 6);
  assert.equal(counts.get('metrics') ?? 0, 0);
});

test('URL state round-trips and omits defaults', () => {
  assert.equal(serializeState(DEFAULT_STATE), '');
  const s = parseState(new URLSearchParams('q=%20observability%20%20kpis&category=Engineering&sort=oldest&page=3'));
  assert.deepEqual(s, { q: 'observability kpis', category: 'engineering', tag: '', sort: 'oldest', page: 3 });
  assert.deepEqual(parseState(new URLSearchParams(serializeState(s).slice(1))), s);
  assert.equal(parseState(new URLSearchParams('page=-4&sort=bogus')).page, 1);
  assert.equal(parseState(new URLSearchParams('sort=bogus')).sort, 'newest');
});

test('page list collapses long ranges', () => {
  assert.deepEqual(pageList(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(pageList(6, 12), [1, '…', 5, 6, 7, '…', 12]);
});
