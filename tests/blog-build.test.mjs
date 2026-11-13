// Integration: builds the real site against generated fixture articles and checks the output.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build, read, exists } from './helpers/build.mjs';
import { writeValidFixtures, writeInvalidFixture, fixtureAuthor } from './helpers/fixtures.mjs';

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
  assert.ok(!/No articles published yet/i.test(html), 'empty-state placeholder must be gone');
  // Bylines link to the author page and show the role (cards and featured slot)
  has(html, /<a href="\/blog\/authors\/kieran-lovell\/" class="fa-author" rel="author"[^>]*>Kieran Lovell<\/a>, Product Lead/);
  has(html, /<a href="\/blog\/authors\/florian-andrews\/" class="bc-author" rel="author"[^>]*>Florian Andrews<\/a><span class="bc-role"[^>]*>Journey Intelligence<\/span>/);
});

const ldOf = (html) => JSON.parse(/<script type="application\/ld\+json">(.*?)<\/script>/s.exec(html)[1])['@graph'];

test('article byline and BlogPosting author are the registered Person', () => {
  const html = read(out, 'blog/fixture-article-04/index.html');
  has(html, /By <a href="\/blog\/authors\/florian-andrews\/" rel="author"[^>]*>Florian Andrews<\/a>, Journey Intelligence/);
  has(html, /ex BCG BPA Consultant forging the ultimate agentic chief of staff/);
  assert.ok(!/Panoptes Editorial Team/.test(html));
  const post = ldOf(html).find((n) => n['@type'] === 'BlogPosting');
  assert.deepEqual(post.author, { '@type': 'Person', name: 'Florian Andrews', jobTitle: 'Journey Intelligence', url: 'https://panoptes.watch/blog/authors/florian-andrews/' });
});

test('author pages: one h1, role, tagline, their articles only, ProfilePage + Person, unique title', () => {
  const titles = new Set();
  for (const [slug, name, role, tagline] of [
    ['kieran-lovell', 'Kieran Lovell', 'Product Lead', 'Business Intelligence turned BusinessOS SME'],
    ['florian-andrews', 'Florian Andrews', 'Journey Intelligence', 'ex BCG BPA Consultant forging the ultimate agentic chief of staff'],
  ]) {
    const html = read(out, `blog/authors/${slug}/index.html`);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, slug);
    has(html, new RegExp(`<h1[^>]*>${name}</h1>`));
    assert.ok(html.includes(role) && html.includes(tagline), slug);
    has(html, new RegExp(`<link rel="canonical" href="https://panoptes.watch/blog/authors/${slug}/"`));
    const title = /<title>(.*?)<\/title>/.exec(html)[1];
    assert.equal(title, `${name}, ${role} | Panoptes`);
    titles.add(title);
    const expected = slugs.filter((_, i) => fixtureAuthor(i + 1) === slug);
    const listed = [...html.matchAll(/data-post data-id="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual([...listed].sort(), [...expected].sort(), slug);
    assert.ok(!html.includes('fixture-draft'));
    const graph = ldOf(html);
    const profile = graph.find((n) => n['@type'] === 'ProfilePage');
    assert.equal(profile.mainEntity['@type'], 'Person');
    assert.equal(profile.mainEntity.name, name);
    assert.equal(profile.mainEntity.jobTitle, role);
    assert.equal(profile.mainEntity.url, `https://panoptes.watch/blog/authors/${slug}/`);
    assert.equal(profile.hasPart.length, expected.length);
    assert.ok(graph.some((n) => n['@type'] === 'BreadcrumbList'));
  }
  assert.equal(titles.size, 2);
  assert.ok(!exists(out, 'blog/authors/index.html'));
});

test('sitemap lists author pages; RSS names each article\'s author', () => {
  const sm = read(out, 'sitemap.xml');
  for (const a of ['kieran-lovell', 'florian-andrews']) assert.ok(sm.includes(`<loc>https://panoptes.watch/blog/authors/${a}/</loc>`), a);
  assert.ok(!sm.includes('['));
  const rss = read(out, 'blog/rss.xml');
  has(rss, /xmlns:dc="http:\/\/purl.org\/dc\/elements\/1.1\/"/);
  assert.equal((rss.match(/<dc:creator>Kieran Lovell<\/dc:creator>/g) ?? []).length, 7);
  assert.equal((rss.match(/<dc:creator>Florian Andrews<\/dc:creator>/g) ?? []).length, 6);
});

test('with no published articles /blog/ renders the hero only: no placeholder, cards or author pages', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'panoptes-empty-'));
  fs.writeFileSync(path.join(dir, 'only-draft.md'), '---\ntitle: "Draft fixture that must stay hidden"\nmeta_description: "A draft that keeps the blog at zero published articles for this test case."\nauthor: "kieran-lovell"\npublished: "2026-10-01"\ndraft: true\n---\n\n# Draft\n\nText.\n');
  const res = build(dir, 'empty');
  assert.ok(res.ok, res.output.slice(-3000));
  const html = read(res.outDir, 'blog/index.html');
  assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
  assert.ok(!/No articles published yet/i.test(html));
  assert.ok(!/data-post|data-blog|data-featured/.test(html));
  assert.ok(!exists(res.outDir, 'blog/authors'));
  assert.ok(!exists(res.outDir, 'blog/only-draft/index.html'));
  const rss = read(res.outDir, 'blog/rss.xml');
  assert.ok(!rss.includes('<item>'));
  assert.ok(!read(res.outDir, 'sitemap.xml').includes('/blog/authors/'));
});

for (const kind of ['missing-title', 'unknown-key', 'slug-mismatch', 'no-date', 'unknown-author', 'missing-author']) {
  test(`invalid metadata fails the build: ${kind}`, () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `panoptes-bad-${kind}-`));
    writeInvalidFixture(dir, kind);
    const res = build(dir, `bad-${kind}`);
    assert.ok(!res.ok, `build should fail for ${kind}`);
    has(res.output, /bad-article/);
    if (kind.endsWith('-author')) has(res.output, /kieran-lovell, florian-andrews/);
  });
}
