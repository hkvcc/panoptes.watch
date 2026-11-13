// Generates blog fixture articles for the build/e2e tests. They live in a temp dir and are
// passed to Astro via BLOG_CONTENT_DIR, so they never appear in content/blog/.
import fs from 'node:fs';
import path from 'node:path';

const CATS = ['Process monitoring', 'Metrics', 'Architecture'];
const fm = (o) => '---\n' + Object.entries(o).map(([k, v]) => `${k}: ${JSON.stringify(v)}`).join('\n') + '\n---\n';

export function writeValidFixtures(dir) {
  fs.mkdirSync(dir, { recursive: true });
  for (let i = 1; i <= 13; i++) {
    const n = String(i).padStart(2, '0');
    const slug = `fixture-article-${n}`;
    const extra = i === 3 ? '\n## Example query\n\n```ts\nconst late = orders.filter((o) => o.stage === "fulfilment");\n```\n\n| Stage | Median wait |\n| --- | --- |\n| Review | 4h |\n' : '';
    fs.writeFileSync(path.join(dir, `${slug}.md`), fm({
      id: `FX-${n}`,
      title: `Fixture article ${n} about business flow`,
      meta_description: `Fixture description number ${n}, long enough to satisfy the schema rules for meta descriptions in tests.`,
      slug: `/blog/${slug}/`,
      canonical_url: `https://panoptes.watch/blog/${slug}/`,
      primary_keyword: i % 2 ? 'business process monitoring' : 'kpi monitoring',
      author: 'Panoptes Editorial Team',
      reviewed: `2026-0${1 + (i % 9)}-${String(10 + i).padStart(2, '0')}`,
      published: `2026-0${1 + (i % 9)}-${String(10 + i).padStart(2, '0')}`,
      category: CATS[i % 3],
      tags: i % 2 ? ['Onboarding', 'Queues'] : ['KPIs'],
      featured: i === 5,
    }) + `\n# Fixture heading ${n}\n\nIntro paragraph for fixture ${n}.${i === 7 ? ' This one mentions reconciliation backlogs specifically.' : ''}\n\n## First section\n\nBody text.\n\n## Second section\n\nMore text.\n\n## Third section\n\nEven more.\n${extra}`);
  }
  fs.writeFileSync(path.join(dir, 'fixture-draft.md'), fm({
    title: 'Draft fixture that must stay hidden',
    meta_description: 'This draft article must never be built, listed, indexed or included in the sitemap, feed or search.',
    reviewed: '2026-10-01', category: 'Metrics', draft: true,
  }) + '\n# Draft heading\n\nSecret draft body.\n');
  fs.writeFileSync(path.join(dir, '_ignored-partial.md'), 'not an article');
}

export function writeInvalidFixture(dir, kind) {
  fs.mkdirSync(dir, { recursive: true });
  const base = { title: 'A perfectly valid title', meta_description: 'A description that is long enough to pass the minimum length rule set.', reviewed: '2026-11-01' };
  const variants = {
    'missing-title': { ...base, title: undefined },
    'unknown-key': { ...base, categroy: 'Typo' },
    'slug-mismatch': { ...base, slug: '/blog/something-else/' },
    'no-date': { ...base, reviewed: undefined },
  };
  const data = Object.fromEntries(Object.entries(variants[kind]).filter(([, v]) => v !== undefined));
  fs.writeFileSync(path.join(dir, 'bad-article.md'), fm(data) + '\n# Heading\n\nText.\n');
}
