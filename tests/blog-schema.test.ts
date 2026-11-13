import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blogSchema, crossCheck } from '../src/lib/blog-schema.ts';
import { AUTHORS, AUTHOR_SLUGS, getAuthor } from '../src/data/authors.ts';

// Exactly the front matter the scheduled SEO agent writes (seo/business-observability/RUNBOOK.md).
const campaign = {
  id: 'BO-01',
  title: 'What Is Business Observability? A Definition',
  meta_description: 'Business observability connects business events, technical telemetry and outcomes. Learn what it covers, how it differs from BI and how to start.',
  slug: '/blog/business-observability/',
  canonical_url: 'https://panoptes.watch/blog/business-observability/',
  primary_keyword: 'business observability',
  author: 'kieran-lovell',
  reviewed: '2026-11-14',
  image_alt: 'Diagram of business events flowing into outcomes',
};

test('accepts the SEO campaign front matter unchanged', () => {
  const r = blogSchema.safeParse(campaign);
  assert.ok(r.success, JSON.stringify(r.error?.issues));
  assert.equal(r.data!.draft, false);
  assert.deepEqual(crossCheck('business-observability', r.data!, 'https://panoptes.watch'), []);
});

test('rejects missing required fields, unknown keys and a missing date', () => {
  const { title, ...noTitle } = campaign;
  assert.ok(!blogSchema.safeParse(noTitle).success);
  assert.ok(!blogSchema.safeParse({ ...campaign, categroy: 'typo' }).success);
  const { reviewed, ...noDate } = campaign;
  assert.ok(!blogSchema.safeParse(noDate).success);
  assert.ok(blogSchema.safeParse({ ...noDate, published: '2026-11-14' }).success);
});

test('cover requires alt text, and updated cannot precede published', () => {
  const { image_alt, ...noAlt } = campaign;
  assert.ok(!blogSchema.safeParse({ ...noAlt, cover: '/blog/x.png' }).success);
  assert.ok(!blogSchema.safeParse({ ...campaign, published: '2026-11-14', updated: '2026-01-01' }).success);
});

test('cross-check catches slug and canonical mismatches', () => {
  const d = blogSchema.parse(campaign);
  assert.equal(crossCheck('other-name', d, 'https://panoptes.watch').length, 2);
  assert.equal(crossCheck('Bad_Name', blogSchema.parse({ ...campaign, slug: undefined, canonical_url: undefined }), 'https://panoptes.watch').length, 1);
});

test('author must be a registered author slug', () => {
  for (const slug of AUTHOR_SLUGS) assert.ok(blogSchema.safeParse({ ...campaign, author: slug }).success, slug);
  const { author, ...noAuthor } = campaign;
  const missing = blogSchema.safeParse(noAuthor);
  assert.ok(!missing.success);
  assert.match(missing.error!.issues[0].message, /kieran-lovell/);
  for (const bad of ['Panoptes Editorial Team', 'Kieran Lovell', 'kieran', '']) {
    const r = blogSchema.safeParse({ ...campaign, author: bad });
    assert.ok(!r.success, bad);
    assert.equal(r.error!.issues[0].path[0], 'author');
  }
  assert.match(blogSchema.safeParse({ ...campaign, author: 'nobody' }).error!.issues[0].message, /Unknown author "nobody".*kieran-lovell, florian-andrews/);
});

test('author registry: unique slugs and the supplied names, roles and taglines', () => {
  assert.equal(new Set(AUTHOR_SLUGS).size, AUTHORS.length);
  for (const a of AUTHORS) assert.match(a.slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.deepEqual(
    { name: getAuthor('kieran-lovell')!.name, role: getAuthor('kieran-lovell')!.role, tagline: getAuthor('kieran-lovell')!.tagline },
    { name: 'Kieran Lovell', role: 'Product Lead', tagline: 'Business Intelligence turned BusinessOS SME' });
  assert.deepEqual(
    { name: getAuthor('florian-andrews')!.name, role: getAuthor('florian-andrews')!.role, tagline: getAuthor('florian-andrews')!.tagline },
    { name: 'Florian Andrews', role: 'Journey Intelligence', tagline: 'ex BCG BPA Consultant forging the ultimate agentic chief of staff' });
});

test('title must leave room for the " | Panoptes" suffix', () => {
  const ok = { ...campaign, title: 'x'.repeat(49) };
  assert.equal(blogSchema.safeParse(ok).success, true);
  assert.equal(blogSchema.safeParse({ ...campaign, title: 'x'.repeat(50) }).success, false);
  assert.equal(blogSchema.safeParse({ ...campaign, title: `${'x'.repeat(48)} | Panoptes` }).success, true);
});
