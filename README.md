# Panoptes — panoptes.watch

Marketing website for **Panoptes**, the Business Observability platform — *Observability for your entire business.*

A fully static Astro site (pre-rendered HTML, minimal JavaScript, self-hosted fonts, original SVG artwork) built for Cloudflare Pages, with one optional Pages Function for the demo/contact forms.

## Quick start

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/ (static output + route verification)
npm run preview    # serve the built site locally
npm run check:links  # after a build: verify every internal link, anchor and asset
npm test           # blog tests: unit, fixture build, browser (Node 22.6+, Chrome)
```

Node 18.17+ (22 recommended).

## Project structure

```
├── public/                 Static files copied as-is into dist/
│   ├── _headers            Security headers, CSP and caching (Cloudflare Pages)
│   ├── _redirects          Path aliases (e.g. /about → /company/)
│   ├── robots.txt, site.webmanifest, favicon.svg, favicon.ico, apple-touch-icon.png
│   ├── logos/              Master SVG logos + png/ exports (256/512/1024)
│   ├── icons/              Favicon/app-icon PNGs, ui/ stroke icons, integrations/ category icons
│   ├── diagrams/           Theme-aware SVG diagrams
│   ├── illustrations/      Theme-aware spot illustrations
│   ├── screenshots/        Fictional product screen mockups
│   ├── social/             1200×630 Open Graph images (PNG + SVG master)
│   └── fonts/              Inter, Space Grotesk, JetBrains Mono (WOFF2, OFL)
├── src/
│   ├── components/         Header, Footer, ThemeToggle, BusinessGraph, DemoDashboard, Diagram, Tabs, FAQ, …
│   ├── layouts/            BaseLayout (SEO, theme bootstrap), ArticleLayout (TOC, reading time, Article schema)
│   ├── pages/              One file per route (file-based routing) + sitemap.xml.ts
│   ├── data/               Navigation/site config, demo sample data
│   ├── scripts/site.ts     Theme, menus, tabs, reveal, copy-email, lightbox, TOC
│   ├── styles/global.css   Design tokens and component styles
│   └── lib/svg.ts          Build-time SVG inliner (ID namespacing, a11y attributes)
├── functions/api/contact.ts  Cloudflare Pages Function for form submissions
├── content/blog/            Blog articles (Markdown) — one file per article, see AUTHORING.md
├── tests/                  node:test suites for the blog (unit, build, browser)
├── scripts/                Asset generation, post-build verification, link checker, manifest, screenshot utility
├── deployment/             cloudflare-pages.md, forms.md
├── AUTHORING.md            How to add pages, components and diagrams; content rules
└── assets-manifest.md      Inventory of every brand and visual asset
```

## Deployment

See **[deployment/cloudflare-pages.md](deployment/cloudflare-pages.md)**. In short: Cloudflare Pages → connect the repo → build command `npm run build`, output directory `dist`. Form delivery requires environment variables — see **[deployment/forms.md](deployment/forms.md)**. Direct (ZIP) upload deploys only the static site, not the form function.

## Design system

- **Colour**: primary purple `#7126E8`, rich `#5920BC`, bright `#9965FF`, lavender `#EDE2FF`; light surfaces white / `#F7F5FB`; dark surfaces `#0A0710` / `#15101F` / `#21172D`. Semantic green/amber/red for status only. Tokens live in `src/styles/global.css`.
- **Type**: Space Grotesk (headlines), Inter (body), JetBrains Mono (labels/data).
- **Theme**: light/dark toggle in the header, persisted in `localStorage` (`panoptes-theme`), defaulting to the OS preference; applied before first paint.
- **Diagrams**: SVG files in `public/diagrams` and `public/illustrations` are inlined at build time and coloured with CSS variables so they follow the active theme. See AUTHORING.md.

## Brand assets

The logo symbol is an abstract **P** whose bowl is an aperture/iris, with a detached node — a business signal entering the field of view. Regenerate all logos, favicons and social images with `npm run assets` (`scripts/generate-assets.mjs`). Wordmark glyphs are converted to outlines, so the SVGs have no font dependency.

## Content principles

All product data in mockups is fictional and labelled as illustrative. The site makes no claims about customers, certifications, results or company history; capabilities that are not confirmed are described as design intent or product vision. Third-party products named in the integrations directory are examples of the ecosystem, not claims of availability. Legal pages (indexed at /legal/) are clearly marked drafts pending legal review. The blog publishes no articles until real ones are merged into content/blog/.
