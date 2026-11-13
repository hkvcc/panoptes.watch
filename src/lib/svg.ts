import fs from 'node:fs';
import path from 'node:path';

const cache = new Map<string, string>();

/** Reads an SVG asset from /public at build time so it can be inlined and themed with CSS variables. */
export function readSvg(publicPath: string): string {
  const hit = cache.get(publicPath);
  if (hit) return hit;
  const file = path.join(process.cwd(), 'public', publicPath.replace(/^\//, ''));
  let svg = fs.readFileSync(file, 'utf8').replace(/<\?xml[^>]*>\s*/, '').trim();
  // Namespace ids so several inlined assets on one page never collide.
  const prefix = path.basename(publicPath, '.svg').replace(/[^a-z0-9]/gi, '') + '-';
  const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    svg = svg
      .replace(new RegExp(`id="${esc}"`, 'g'), `id="${prefix}${id}"`)
      .replace(new RegExp(`url\\(#${esc}\\)`, 'g'), `url(#${prefix}${id})`)
      .replace(new RegExp(`href="#${esc}"`, 'g'), `href="#${prefix}${id}"`);
  }
  cache.set(publicPath, svg);
  return svg;
}

/** Inline SVG with accessibility attributes applied to the root element. */
export function svgWithA11y(svg: string, label?: string, extraClass = ''): string {
  const attrs = label ? ` role="img" aria-label="${label.replace(/"/g, '&quot;')}"` : ' aria-hidden="true" focusable="false"';
  return svg
    .replace(/<svg\b([^>]*?)\s(width|height)="[^"]*"/, '<svg$1')
    .replace(/<svg\b([^>]*?)\s(width|height)="[^"]*"/, '<svg$1')
    .replace(/<svg\b/, `<svg${attrs}${extraClass ? ` class="${extraClass}"` : ''}`);
}
