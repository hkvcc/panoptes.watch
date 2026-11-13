// Generates the Panoptes brand assets: vector logos (text converted to paths),
// PNG exports, favicons, web-app icons and social sharing images.
// Run with: npm run assets   (outputs are committed to /public, so this is not part of the build)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (...p) => path.join(root, 'public', ...p);
const font = (pkg, file) => { const b = fs.readFileSync(path.join(root, 'node_modules', '@fontsource', pkg, 'files', file)); return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };

const grotesk = font('space-grotesk', 'space-grotesk-latin-600-normal.woff');
const groteskBold = font('space-grotesk', 'space-grotesk-latin-700-normal.woff');
const inter = font('inter', 'inter-latin-400-normal.woff');
const interMed = font('inter', 'inter-latin-500-normal.woff');

const C = {
  purple: '#7126E8', rich: '#5920BC', bright: '#9965FF', lavender: '#EDE2FF',
  ink: '#191326', inkPurple: '#1E0F3D', black: '#0A0710', white: '#FFFFFF', surface: '#15101F',
};

/* ---------- Symbol geometry (64×64 grid) ---------- */
// Stem + aperture ring form a "P"; the pupil is the observed core; the
// detached node at 45° is a business signal leaving the field of vision.
const ARC = 'M37.95 45.74 A17 17 0 1 1 51.74 31.95';
function symbol({ stem, ring, pupil, node }, tx = 0, ty = 0, s = 1) {
  return `<g transform="translate(${tx} ${ty}) scale(${s})">
    <rect x="9" y="9" width="10" height="46" rx="5" fill="${stem}"/>
    <path d="${ARC}" fill="none" stroke="${ring}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="35" cy="29" r="6" fill="${pupil}"/>
    <circle cx="47.6" cy="41.6" r="4.2" fill="${node}"/>
  </g>`;
}

// Glyph-by-glyph layout with kerning (avoids opentype.js GSUB shaping limitations).
function layout(f, text, size, ls = 0) {
  const scale = size / f.unitsPerEm; const glyphs = []; let x = 0, prev = null;
  for (const ch of text) {
    const g = f.charToGlyph(ch);
    if (prev) x += f.getKerningValue(prev, g) * scale;
    glyphs.push({ g, x }); x += g.advanceWidth * scale + ls; prev = g;
  }
  return { glyphs, width: x - ls };
}
function textPath(f, text, size, x, y, fill, ls = 0) {
  const d = layout(f, text, size, ls).glyphs.map(({ g, x: gx }) => g.getPath(x + gx, y, size).toPathData(2)).join('');
  return `<path d="${d}" fill="${fill}"/>`;
}
const textWidth = (f, text, size, ls = 0) => layout(f, text, size, ls).width;

const WORD = 'panoptes';
const WS = 44, WLS = -0.6; // wordmark size + tracking
const wordW = Math.ceil(textWidth(grotesk, WORD, WS, WLS));

function horizontal(col, bg) {
  const w = 64 + 8 + wordW + 4, h = 64;
  const pad = bg ? 24 : 0;
  const W = w + pad * 2, H = h + pad * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Panoptes">
  <title>Panoptes</title>
  ${bg ? `<rect width="${W}" height="${H}" rx="${bg.r ?? 0}" fill="${bg.fill}"/>` : ''}
  ${symbol(col.sym, pad, pad)}
  ${textPath(grotesk, WORD, WS, pad + 72, pad + 45, col.word, WLS)}
</svg>`;
}
function stacked(col) {
  const W = Math.max(wordW, 96) + 16, symS = 1.5, symW = 64 * symS;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} 160" width="${W}" height="160" role="img" aria-label="Panoptes">
  <title>Panoptes</title>
  ${symbol(col.sym, (W - symW) / 2, 0, symS)}
  ${textPath(grotesk, WORD, WS, (W - wordW) / 2, 146, col.word, WLS)}
</svg>`;
}
const symbolSvg = (sym, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Panoptes symbol">
  <title>Panoptes</title>
  ${bg ? `<rect width="64" height="64" rx="14" fill="${bg}"/>` : ''}
  ${bg ? symbol(sym, 6, 6, 0.8125) : symbol(sym)}
</svg>`;

const SYM = {
  purple: { stem: C.purple, ring: C.purple, pupil: C.rich, node: C.bright },
  onDark: { stem: C.white, ring: C.bright, pupil: C.white, node: C.bright },
  white: { stem: C.white, ring: C.white, pupil: C.white, node: C.white },
  black: { stem: C.black, ring: C.black, pupil: C.black, node: C.black },
  onPurple: { stem: C.white, ring: C.white, pupil: C.white, node: C.lavender },
};

const logos = {
  'panoptes-horizontal-light.svg': horizontal({ sym: SYM.purple, word: C.inkPurple }),
  'panoptes-horizontal-dark.svg': horizontal({ sym: SYM.onDark, word: C.white }),
  'panoptes-horizontal-purple-white.svg': horizontal({ sym: SYM.onPurple, word: C.white }, { fill: C.purple, r: 16 }),
  'panoptes-horizontal-purple.svg': horizontal({ sym: SYM.purple, word: C.purple }),
  'panoptes-horizontal-mono-black.svg': horizontal({ sym: SYM.black, word: C.black }),
  'panoptes-horizontal-mono-white.svg': horizontal({ sym: SYM.white, word: C.white }),
  'panoptes-symbol-purple.svg': symbolSvg(SYM.purple),
  'panoptes-symbol-white.svg': symbolSvg(SYM.white),
  'panoptes-symbol-black.svg': symbolSvg(SYM.black),
  'panoptes-stacked.svg': stacked({ sym: SYM.purple, word: C.inkPurple }),
  'panoptes-stacked-dark.svg': stacked({ sym: SYM.onDark, word: C.white }),
  'panoptes-logo-transparent.svg': horizontal({ sym: SYM.purple, word: C.inkPurple }),
  'panoptes-logo-on-white.svg': horizontal({ sym: SYM.purple, word: C.inkPurple }, { fill: C.white }),
  'panoptes-logo-on-near-black.svg': horizontal({ sym: SYM.onDark, word: C.white }, { fill: C.black }),
  'panoptes-logo-on-purple.svg': horizontal({ sym: SYM.onPurple, word: C.white }, { fill: C.purple }),
  'panoptes-app-icon.svg': symbolSvg(SYM.onPurple, C.purple),
};

fs.mkdirSync(pub('logos', 'png'), { recursive: true });
for (const [name, svg] of Object.entries(logos)) {
  fs.writeFileSync(pub('logos', name), svg);
  for (const size of [256, 512, 1024]) {
    const isSquare = name.includes('symbol') || name.includes('icon');
    const img = sharp(Buffer.from(svg), { density: 600 });
    await (isSquare ? img.resize(size, size) : img.resize({ width: size }))
      .png().toFile(pub('logos', 'png', name.replace('.svg', `-${size}.png`)));
  }
}

/* ---------- Favicons ---------- */
// Favicon: white symbol on a purple rounded tile — legible on light and dark browser chrome.
const favSvg = symbolSvg(SYM.onPurple, C.purple);
fs.writeFileSync(pub('favicon.svg'), favSvg);
const iconPng = (size) => sharp(Buffer.from(favSvg), { density: 1200 }).resize(size, size).png().toBuffer();
fs.mkdirSync(pub('icons'), { recursive: true });
for (const s of [16, 32, 48]) fs.writeFileSync(pub('icons', `favicon-${s}.png`), await iconPng(s));
fs.writeFileSync(pub('apple-touch-icon.png'), await sharp(Buffer.from(symbolSvg(SYM.onPurple, C.purple).replace('rx="14"', 'rx="0"')), { density: 1200 }).resize(180, 180).png().toBuffer());
for (const s of [192, 512]) fs.writeFileSync(pub('icons', `icon-${s}.png`), await iconPng(s));
// Maskable: symbol inside safe zone on full-bleed purple.
const maskable = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${C.purple}"/>${symbol(SYM.onPurple, 12.8, 12.8, 0.6)}</svg>`;
fs.writeFileSync(pub('icons', 'icon-maskable-512.png'), await sharp(Buffer.from(maskable), { density: 1200 }).resize(512, 512).png().toBuffer());
fs.writeFileSync(pub('favicon.ico'), await pngToIco([await iconPng(16), await iconPng(32), await iconPng(48)]));

/* ---------- Social images (1200×630) ---------- */
function wrap(f, text, size, maxW) {
  const words = text.split(' '); const lines = []; let line = '';
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (textWidth(f, t, size, -1) > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  lines.push(line); return lines;
}
function ogSvg({ eyebrow, title, sub }) {
  const lines = wrap(groteskBold, title, 68, 900);
  const titleY = 300 - (lines.length - 1) * 38;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <radialGradient id="g" cx="0.82" cy="0.18" r="0.75"><stop offset="0" stop-color="${C.purple}" stop-opacity="0.55"/><stop offset="0.55" stop-color="${C.rich}" stop-opacity="0.12"/><stop offset="1" stop-color="${C.black}" stop-opacity="0"/></radialGradient>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ffffff" stroke-opacity="0.05"/></pattern>
  </defs>
  <rect width="1200" height="630" fill="${C.black}"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g opacity="0.9" fill="none" stroke="${C.bright}" stroke-opacity="0.35">
    <circle cx="1010" cy="170" r="120"/><circle cx="1010" cy="170" r="190" stroke-opacity="0.2"/><circle cx="1010" cy="170" r="260" stroke-opacity="0.1"/>
  </g>
  <circle cx="1010" cy="170" r="22" fill="${C.bright}"/>
  <circle cx="1094" cy="254" r="9" fill="${C.lavender}"/>
  ${symbol(SYM.onDark, 80, 70, 0.9)}
  ${textPath(grotesk, WORD, 38, 148, 112, C.white, -0.5)}
  ${textPath(interMed, eyebrow.toUpperCase(), 20, 80, titleY - 80, C.bright, 2.5)}
  ${lines.map((l, i) => textPath(groteskBold, l, 68, 80, titleY + i * 76, C.white, -1)).join('\n  ')}
  ${textPath(inter, sub, 26, 80, 545, '#B7A9C8')}
  ${textPath(interMed, 'panoptes.watch', 22, 960, 560, C.white)}
</svg>`;
}
const social = {
  'og-default': { eyebrow: 'Business Observability', title: 'Observability for your entire business.', sub: 'See your business as it actually operates.' },
  'og-platform': { eyebrow: 'The Platform', title: 'From business signals to business action.', sub: 'Business Graph, Command Center, Health, Intelligence and Actions.' },
  'og-solutions': { eyebrow: 'Solutions', title: 'Operational clarity for every leadership role.', sub: 'Executives, operations, finance, revenue and customer experience.' },
  'og-use-cases': { eyebrow: 'Use Cases', title: 'Every business has blind spots. Make them visible.', sub: 'Revenue leakage, bottlenecks, journey friction, anomalies and SLAs.' },
  'og-integrations': { eyebrow: 'Integrations', title: 'One connected picture from fragmented systems.', sub: 'CRM, payments, finance, warehouses, support, events and more.' },
  'og-resources': { eyebrow: 'Resources', title: 'Understand the business, not just the dashboards.', sub: 'Guides and essays on business observability.' },
  'og-company': { eyebrow: 'Company', title: 'Make the real workings of every business visible.', sub: 'The mission and vision behind Panoptes.' },
  'og-demo': { eyebrow: 'Book a Demo', title: 'See your business in a new light.', sub: 'Talk to the Panoptes team: sales@panoptes.watch' },
};
fs.mkdirSync(pub('social'), { recursive: true });
for (const [name, cfg] of Object.entries(social)) {
  const svg = ogSvg(cfg);
  fs.writeFileSync(pub('social', `${name}.svg`), svg);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: false }).toFile(pub('social', `${name}.png`));
}
console.log('Brand assets generated.');
