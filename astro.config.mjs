// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://panoptes.watch',
  trailingSlash: 'always',
  output: 'static',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
});
