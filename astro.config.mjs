// @ts-check
import { defineConfig } from 'astro/config';

/**
 * Blog articles carry their display heading as a Markdown `# H1` (the SEO agent's
 * contract, see seo/business-observability/RUNBOOK.md). The article template renders
 * the H1 itself, so drop it from the rendered body to keep exactly one <h1> per page.
 * The heading text is read from the raw source by src/lib/blog.ts.
 */
function remarkDropH1() {
  /** @param {{ children: { type: string, depth?: number }[] }} tree */
  return (tree) => {
    const i = tree.children.findIndex((n) => n.type === 'heading' && n.depth === 1);
    if (i !== -1) tree.children.splice(i, 1);
  };
}

export default defineConfig({
  site: 'https://panoptes.watch',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  // Test builds point this elsewhere so they never share a content cache with real builds.
  cacheDir: process.env.ASTRO_CACHE_DIR || './node_modules/.astro',
  markdown: {
    remarkPlugins: [remarkDropH1],
    // Dual-theme highlighting: colours are emitted as CSS variables and switched by data-theme.
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false, wrap: false },
  },
});
