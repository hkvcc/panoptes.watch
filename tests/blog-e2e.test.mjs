// Browser test of the /blog/ client behaviour against a fixture build. Uses playwright-core
// with a locally installed Chrome (as scripts/shot.mjs does); skipped if none is found.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from './helpers/build.mjs';
import { writeValidFixtures } from './helpers/fixtures.mjs';

const CHROME = process.env.CHROME_PATH ?? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/usr/bin/google-chrome', '/usr/bin/chromium'].find((p) => fs.existsSync(p));
const skip = !CHROME && 'no Chrome/Chromium found (set CHROME_PATH)';

let server, browser, base;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.xml': 'application/xml' };

before(async () => {
  if (skip) return;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'panoptes-e2e-fixtures-'));
  writeValidFixtures(dir);
  const res = build(dir, 'e2e');
  assert.ok(res.ok, res.output.slice(-2000));
  server = http.createServer((req, res2) => {
    let f = path.join(res.outDir, decodeURIComponent(req.url.split('?')[0]));
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
    if (!fs.existsSync(f)) { res2.writeHead(404, { 'content-type': 'text/html' }); return res2.end(fs.readFileSync(path.join(res.outDir, '404.html'))); }
    res2.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
    res2.end(fs.readFileSync(f));
  }).listen(0);
  base = `http://localhost:${server.address().port}`;
  const { chromium } = await import('playwright-core');
  browser = await chromium.launch({ executablePath: CHROME });
});
after(async () => { await browser?.close(); server?.close(); });

async function open(url, width = 1280) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(base + url, { waitUntil: 'networkidle' });
  return { page, errors };
}
const visibleIds = (page) => page.$$eval('[data-post]:not([hidden])', (els) => els.map((e) => e.dataset.id));
const query = (page) => page.evaluate(() => location.search);

test('default view: featured slot, first page of 9, pager', { skip }, async () => {
  const { page, errors } = await open('/blog/');
  assert.equal(await page.isVisible('[data-featured]'), true);
  assert.equal((await visibleIds(page)).length, 9);
  assert.equal(await page.isVisible('[data-pager]'), true);
  assert.match(await page.textContent('[data-status]'), /Showing 1–10 of 13 articles/);
  assert.deepEqual(errors, []);
  await page.close();
});

test('full-text search, URL sync, clear and empty state', { skip }, async () => {
  const { page } = await open('/blog/');
  await page.fill('[data-search]', '  RECONCIL ');
  await page.waitForFunction(() => document.querySelectorAll('[data-post]:not([hidden])').length === 1);
  assert.deepEqual(await visibleIds(page), ['fixture-article-07']);
  assert.equal(await page.isVisible('[data-featured]'), false);
  assert.equal(await query(page), '?q=RECONCIL');
  await page.fill('[data-search]', 'zzzz nothing');
  await page.waitForSelector('[data-empty]:not([hidden])');
  await page.click('[data-empty] [data-reset]');
  assert.equal(await query(page), '');
  assert.equal((await visibleIds(page)).length, 9);
  await page.close();
});

test('category filter + search + sort combine, with truthful counts', { skip }, async () => {
  const { page } = await open('/blog/');
  await page.click('[data-cat="metrics"]');
  assert.equal(await page.getAttribute('[data-cat="metrics"]', 'aria-pressed'), 'true');
  const metrics = await visibleIds(page);
  assert.ok(metrics.length > 0 && metrics.length < 13);
  assert.equal(await page.textContent('[data-cat="metrics"] [data-count]'), String(metrics.length));
  await page.selectOption('[data-sort]', 'oldest');
  const dates = await page.$$eval('[data-post]:not([hidden])', (els) => els.map((e) => Number(e.dataset.date)));
  assert.deepEqual(dates, [...dates].sort((a, b) => a - b));
  assert.equal(await query(page), '?category=metrics&sort=oldest');
  await page.goBack();
  assert.equal(await page.inputValue('[data-sort]'), 'newest');
  await page.close();
});

test('shared URL restores state; tag filter shows a removable pill', { skip }, async () => {
  const { page } = await open('/blog/?category=process-monitoring&q=fixture&sort=oldest');
  assert.equal(await page.inputValue('[data-search]'), 'fixture');
  assert.equal(await page.getAttribute('[data-cat="process-monitoring"]', 'aria-pressed'), 'true');
  await page.goto(base + '/blog/?tag=kpis', { waitUntil: 'networkidle' });
  assert.equal(await page.isVisible('[data-tag-pill]'), true);
  assert.equal((await visibleIds(page)).length, 6);
  await page.click('[data-tag-clear]');
  assert.equal(await query(page), '');
  await page.close();
});

test('pagination moves through pages and updates the URL', { skip }, async () => {
  const { page } = await open('/blog/');
  await page.click('[data-pager] [data-page="2"]');
  assert.equal(await query(page), '?page=2');
  assert.equal((await visibleIds(page)).length, 3);
  assert.equal(await page.isVisible('[data-featured]'), false);
  assert.equal(await page.getAttribute('[data-pager] [aria-current="page"]', 'data-page'), '2');
  await page.close();
});

for (const route of ['/blog/', '/blog/fixture-article-03/']) {
  test(`no horizontal overflow or console errors at 390px: ${route}`, { skip }, async () => {
    const { page, errors } = await open(route, 390);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    assert.deepEqual(errors, []);
    await page.close();
  });
}

test('unknown article slug serves the 404 page', { skip }, async () => {
  const { page } = await open('/blog/does-not-exist/');
  assert.match(await page.title(), /not found/i);
  await page.close();
});
