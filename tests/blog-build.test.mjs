// Integration: builds the real site against generated fixture articles and checks the output.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, read, exists } from './helpers/build.mjs';
import { writeValidFixtures, writeInvalidFixture } from './helpers/fixtures.mjs';

let out;
// Short failure messages instead of dumping the whole page.
const has = (html, re) => assert.ok(re.test(html), `expected ${re}`);
before(() => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'panoptes-fixtures-'));
  writeValidFixtures(dir);
  const res = build(dir, 'valid');
  assert.ok(res.ok, res.output.slice(-3000));
  out = res.outDir;
});

const slugs = Array.from({ length: 13 }, (_, i) => `fixture-article-${String(i + 1).padStart(2, '0')}`);

test('every article file becomes a page, with no manual registration', () => {
  for (const s of slugs) assert.ok(exists(out, `blog/${s}/index.html`), s);
  assert.ok(!exists(out, 'blog/_ignored-partial/index.html'));
});

test('drafts are excluded everywhere', () => {
  assert.ok(!exists(out, 'blog/fixture-draft/index.html'));
  for (const f of ['blog/index.html', 'sitemap.xml', 'blog/rss.xml', 'blog/search-index.json']) {
    assert.ok(!read(out, f).includes('fixture-draft'), f);
    assert.ok(!/secret draft/i.test(read(out, f)), f);
  }
});

test('sitemap, RSS and search index list every published article', () => {
  const sm = read(out, 'sitemap.xml');
  const rss = read(out, 'blog/rss.xml');
  const idx = JSON.parse(read(out, 'blog/search-index.json'));
  for (const s of slugs) {
    assert.ok(sm.includes(`<loc>https://panoptes.watch/blog/${s}/</loc>`), s);
    assert.ok(rss.includes(`https://panoptes.watch/blog/${s}/`), s);
  }
  assert.equal(idx.length, 13);
  assert.ok(idx.find((r) => r.id === 'fixture-article-07').text.includes('reconciliation backlogs'));
});

test('article page SEO: title, description, canonical, OG, structured data, one h1', () => {
  const html = read(out, 'blog/fixture-article-03/index.html');
  has(html, /<title>Fixture article 03 about business flow \| Panoptes<\/title>/);
  has(html, /<link rel="canonical" href="https:\/\/panoptes.watch\/blog\/fixture-article-03\/"/);
  has(html, /<meta property="og:type" content="article"/);
  has(html, /article:published_time/);
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  has(html, /<h1[^>]*>Fixture heading 03<\/h1>/);
  assert.ok(!/noindex/.test(html));
  const ld = JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)[1]);
  const types = ld['@graph'].map((n) => n['@type']);
  assert.ok(types.includes('BlogPosting') && types.includes('BreadcrumbList'));
  // Code highlighting, tables and TOC
  has(html, /class="astro-code/);
  has(html, /<table>/);
  has(html, /data-toc-link/);
  // Related articles and share links
  has(html, /Related articles/);
  has(html, /linkedin\.com\/sharing/);
});

test('blog index renders featured article, category chips and all cards', () => {
  const html = read(out, 'blog/index.html');
  has(html, /data-featured="fixture-article-05"/);
  assert.equal((html.match(/data-post /g) ?? []).length, 13);
  has(html, /<li class="bc"[^>]*hidden[^>]*data-post data-id="fixture-article-05"/); // featured: hidden in the grid until filtering
  for (const c of ['process-monitoring', 'metrics', 'architecture']) has(html, new RegExp(`data-cat="${c}"`));
  has(html, /<link rel="canonical" href="https:\/\/panoptes.watch\/blog\/"/);
});

for (const kind of ['missing-title', 'unknown-key', 'slug-mismatch', 'no-date']) {
  test(`invalid metadata fails the build: ${kind}`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `panoptes-bad-${kind}-`));
    writeInvalidFixture(dir, kind);
    const res = build(dir, `bad-${kind}`);
    assert.ok(!res.ok, `build should fail for ${kind}`);
    has(res.output, /bad-article/);
  });
}
