// Post-build: verify every expected route exists in dist/ and validate sitemap XML.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const sitemap = fs.readFileSync(path.join(dist, 'sitemap.xml'), 'utf8');
const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const missing = locs.filter((p) => !fs.existsSync(path.join(dist, p, 'index.html')));
if (!fs.existsSync(path.join(dist, '404.html'))) missing.push('/404.html');
if (missing.length) { console.error('Missing built pages:', missing); process.exit(1); }
if (!sitemap.startsWith('<?xml') || !sitemap.trim().endsWith('</urlset>')) { console.error('sitemap.xml malformed'); process.exit(1); }
console.log(`postbuild: ${locs.length} sitemap URLs verified, 404.html present.`);
