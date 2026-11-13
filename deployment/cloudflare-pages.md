# Deploying panoptes.watch on Cloudflare Pages

The site is a fully pre-rendered Astro build (static HTML, CSS, JS, fonts and SVG/PNG assets) plus one optional **Pages Function** (`functions/api/contact.ts`) that handles the demo and contact forms.

## 1. Recommended: Git integration (deploys site + function)

1. Push this project to a Git repository (GitHub or GitLab).
2. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git** and pick the repository.
3. Build settings:
   | Setting | Value |
   |---|---|
   | Framework preset | Astro |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(repository root)* |
   | Environment variable | `NODE_VERSION` = `22` |
4. Add the form environment variables (see `deployment/forms.md`) under **Settings → Variables and Secrets** for *Production* (and *Preview* if you want previews to send mail).
5. Save and deploy. Cloudflare detects the `functions/` directory automatically and deploys `/api/contact` alongside the static files.

`npm run build` runs `astro build` and then `scripts/postbuild.mjs`, which fails the build if any page listed in `sitemap.xml` is missing or the sitemap is malformed.

## 2. Alternative: Wrangler CLI (deploys site + function)

```bash
npm ci
npm run build
npx wrangler@latest pages deploy dist --project-name panoptes-watch
```

Run this from the **project root** so Wrangler finds `functions/`. Secrets can be set with `npx wrangler@latest pages secret put RESEND_API_KEY --project-name panoptes-watch`.

## 3. Direct upload (static only)

The dashboard's drag-and-drop/ZIP **Direct Upload** deploys the contents of `dist/` only. **It does not deploy Pages Functions**, so the forms would return 404/405 and show their error state ("email sales@panoptes.watch directly"). Use this only for a static preview, and upload the *contents* of `dist/` (so `index.html` is at the root), not the `dist` folder itself.

## 4. Custom domain and DNS

1. Pages project → **Custom domains → Set up a custom domain** → `panoptes.watch`. If the zone is on Cloudflare, the CNAME/flattened record is created for you; otherwise add the record Cloudflare shows.
2. Add `www.panoptes.watch` as a second custom domain, then create a **Redirect Rule** (or Bulk Redirect) `www.panoptes.watch/*` → `https://panoptes.watch/${1}` with status 301. (`_redirects` handles paths only, not hostnames.)
3. SSL/TLS → set **Always Use HTTPS** on. HSTS is already sent by `_headers`.

## 5. What the build produces

- `dist/<route>/index.html` for every page (clean, trailing-slash URLs; refreshing nested paths works because each is a real file).
- `dist/404.html` — Cloudflare Pages serves it automatically for unknown paths.
- `dist/sitemap.xml`, `dist/robots.txt`, `dist/_headers`, `dist/_redirects`, `dist/site.webmanifest`, favicons.
- `dist/_astro/*` — hashed CSS/JS bundles (cached immutably via `_headers`).

## 6. Headers and security

`public/_headers` sets a strict Content-Security-Policy (`default-src 'self'`; inline scripts allowed for the theme bootstrap and JSON-LD), HSTS, `X-Frame-Options: DENY`, `nosniff`, a restrictive Permissions-Policy and long-lived caching for hashed assets and fonts. If you add Cloudflare Turnstile to the forms, extend the CSP: `script-src … https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com`.

## 7. Updating content

Edit `src/pages/**`, rebuild, push. Brand assets are regenerated with `npm run assets`; the asset inventory with `node scripts/assets-manifest.mjs`; internal links can be verified after a build with `npm run check:links`.
