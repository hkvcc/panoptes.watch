import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export const ROOT = path.resolve(import.meta.dirname, '../..');

/** Builds the site into a temp dir against the given content dir, with an isolated cache. */
export function build(contentDir, label) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `panoptes-${label}-`));
  const outDir = path.join(tmp, 'dist');
  const res = spawnSync('npx', ['astro', 'build', '--outDir', outDir], {
    cwd: ROOT, encoding: 'utf8',
    env: { ...process.env, BLOG_CONTENT_DIR: contentDir, ASTRO_CACHE_DIR: path.join(tmp, 'cache'), ASTRO_TELEMETRY_DISABLED: '1' },
  });
  return { ok: res.status === 0, outDir, output: `${res.stdout}\n${res.stderr}` };
}

export const read = (outDir, p) => fs.readFileSync(path.join(outDir, p), 'utf8');
export const exists = (outDir, p) => fs.existsSync(path.join(outDir, p));
