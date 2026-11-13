import { test } from 'node:test';
import assert from 'node:assert/strict';
import { blogSchema, crossCheck } from '../src/lib/blog-schema.ts';

// Exactly the front matter the scheduled SEO agent writes (seo/business-observability/RUNBOOK.md).
const campaign = {
  id: 'BO-01',
  title: 'What Is Business Observability? Definition and Examples',
  meta_description: 'Business observability connects business events, technical telemetry and outcomes. Learn what it covers, how it differs from BI and how to start.',
  slug: '/blog/business-observability/',
  canonical_url: 'https://panoptes.watch/blog/business-observability/',
  primary_keyword: 'business observability',
  author: 'Panoptes Editorial Team',
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
