// Checks every internal href/src in built HTML resolves to a file in the output dir.
// Usage: node scripts/check-links.mjs [distDir]
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(process.argv[2] ?? 'dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const html = walk(dist).filter((f) => f.endsWith('.html'));
const exists = (p) => {
  const f = path.join(dist, decodeURIComponent(p));
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return true;
  return fs.existsSync(path.join(f, 'index.html'));
};
const problems = [];
const ids = new Map();
for (const file of html) {
  const src = fs.readFileSync(file, 'utf8');
  ids.set(file, new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
}
for (const file of html) {
  const src = fs.readFileSync(file, 'utf8');
  const route = '/' + path.relative(dist, file).replace(/index\.html$/, '');
  for (const m of src.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (/^(https?:|mailto:|tel:|data:|javascript:)/.test(url)) continue;
    if (url.startsWith('#')) { if (url.length > 1 && !ids.get(file).has(url.slice(1))) problems.push(`${route} → missing anchor ${url}`); continue; }
    const [pq, hash] = url.split('#');
    const p = pq.split('?')[0]; // query strings (e.g. /blog/?tag=kpis) don't change the target file
    const abs = p.startsWith('/') ? p : path.posix.join(route, p);
    if (!exists(abs)) problems.push(`${route} → ${url}`);
    else if (!abs.match(/\.[a-z0-9]+$/i) && !abs.endsWith('/')) problems.push(`${route} → ${url} (missing trailing slash)`);
    if (hash && exists(abs)) {
      const target = path.join(dist, abs, abs.endsWith('/') ? 'index.html' : '');
      if (ids.has(target) && !ids.get(target).has(hash)) problems.push(`${route} → ${url} (missing anchor)`);
    }
  }
}
console.log(`Checked ${html.length} pages.`);
if (problems.length) { console.log([...new Set(problems)].join('\n')); process.exit(1); }
console.log('All internal links and assets resolve.');
