// On-page SEO audit of the built site.
// Usage: node scripts/seo-audit.mjs [distDir]   (default ./dist; run after a build)
// Reports per page: <h1> count ≠ 1, <title> > 60 chars or duplicated, meta description outside
// 120–160 chars or duplicated, <img> without an alt attribute, skipped heading levels,
// missing canonical, missing og:image. Exits 1 if any problem is found.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
if (!fs.existsSync(dist)) { console.error(`No build output at ${dist}`); process.exit(2); }

const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist).filter((f) => f.endsWith('.html')).sort();

const decode = (s) => s
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : null;
};
const metaContent = (head, key, val) => {
  for (const m of head.matchAll(/<meta\b[^>]*>/gi)) if (attr(m[0], key) === val) return attr(m[0], 'content');
  return null;
};

const pages = [];
for (const file of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const route = '/' + path.relative(dist, file).split(path.sep).join('/').replace(/index\.html$/, '');
  if (/<meta[^>]+http-equiv=["']?refresh/i.test(raw)) continue; // redirect stubs
  // Ignore content that is not part of the document outline.
  const html = raw.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/<template\b[\s\S]*?<\/template>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const head = (html.match(/<head\b[\s\S]*?<\/head>/i) ?? [''])[0];
  const body = (html.match(/<body\b[\s\S]*<\/body>/i) ?? [html])[0].replace(/<svg\b[\s\S]*?<\/svg>/gi, '<svg/>');
  const title = decode(((head.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? [])[1] ?? '').trim());
  const desc = metaContent(head, 'name', 'description');
  const noindex = /noindex/i.test(metaContent(head, 'name', 'robots') ?? '');
  const canonical = [...head.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).find((t) => attr(t, 'rel') === 'canonical');
  const ogImage = metaContent(head, 'property', 'og:image');
  const headings = [...body.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => ({ level: +m[1], text: decode(m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()) }));
  const imgs = [...body.matchAll(/<img\b[^>]*>/gi)].map((m) => m[0]);

  const issues = [];
  const h1s = headings.filter((h) => h.level === 1).length;
  if (h1s !== 1) issues.push(`h1 count is ${h1s}`);
  if (!title) issues.push('missing <title>');
  else if (title.length > 60) issues.push(`title is ${title.length} chars (>60): "${title}"`);
  if (desc == null || !desc.trim()) issues.push('missing meta description');
  else if (desc.length < 120 || desc.length > 160) issues.push(`description is ${desc.length} chars (outside 120–160)`);
  for (const img of imgs) if (attr(img, 'alt') === null) issues.push(`<img> without alt: src=${attr(img, 'src')}`);
  let prev = 0;
  for (const h of headings) {
    if (h.level > prev + 1) issues.push(`heading skip h${prev || 0}→h${h.level}: "${h.text.slice(0, 60)}"`);
    prev = h.level;
  }
  if (!canonical || !attr(canonical, 'href')) issues.push('missing canonical');
  if (!ogImage) issues.push('missing og:image');
  pages.push({ route, title, desc, noindex, issues });
}

// Duplicates (indexable pages only: a noindex page such as 404 may share copy).
const dupes = (key, label) => {
  const by = new Map();
  for (const p of pages) if (!p.noindex && p[key]) by.set(p[key], [...(by.get(p[key]) ?? []), p]);
  for (const [v, ps] of by) if (ps.length > 1) for (const p of ps) p.issues.push(`duplicate ${label} (shared with ${ps.filter((o) => o !== p).map((o) => o.route).join(', ')}): "${v.slice(0, 70)}"`);
};
dupes('title', 'title');
dupes('desc', 'description');

let count = 0;
for (const p of pages) {
  if (!p.issues.length) continue;
  console.log(p.route);
  for (const i of p.issues) { console.log(`  - ${i}`); count++; }
}
console.log(`\nAudited ${pages.length} pages: ${count} issue(s) on ${pages.filter((p) => p.issues.length).length} page(s).`);
process.exit(count ? 1 : 0);
