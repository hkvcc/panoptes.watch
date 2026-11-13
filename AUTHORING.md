# Authoring guide — Panoptes website

How pages, components and visual assets are built in this project. Read this before adding or editing a page.

## Stack

- Astro 5, static output, `trailingSlash: 'always'`, `build.format: 'directory'` → every page is `dist/<route>/index.html`.
- Plain CSS with design tokens in `src/styles/global.css` (no Tailwind). Page-specific styles go in a scoped `<style>` block in the page.
- Minimal client JS. Shared behaviours live in `src/scripts/site.ts` (theme, menus, tabs, reveal, copy-email, lightbox, article TOC). Page-specific interactivity goes in a `<script>` in the page/component (Astro bundles it).

## Page skeleton

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import PageHero from '../../components/PageHero.astro';
import SectionHead from '../../components/SectionHead.astro';
import Diagram from '../../components/Diagram.astro';
import CTA from '../../components/CTA.astro';
const crumbs = [{ label: 'Platform', href: '/platform/' }, { label: 'Business Graph', href: '/platform/business-graph/' }];
---
<BaseLayout title="Business Graph" description="Unique 140–160 char description…" ogImage="/social/og-platform.png" breadcrumbs={crumbs}>
  <PageHero eyebrow="Platform · Business Graph" title="…" lede="…" breadcrumbs={crumbs} split>
    <div class="btn-row"><a class="btn btn-primary" href="/demo/">Book a Demo</a></div>
    <Fragment slot="visual"><Diagram src="/diagrams/…svg" alt="…" frame="window title" zoom /></Fragment>
  </PageHero>
  <section class="section">…</section>
  <CTA title="…" text="…" />
</BaseLayout>
```

- `BaseLayout` props: `title` (→ `<title>` "X | Panoptes"), `description` (unique per page), `ogImage` (one of `/social/og-{default,platform,solutions,use-cases,integrations,resources,company,demo}.png`), `schema` (JSON-LD object(s) without `@context`), `breadcrumbs` (emits BreadcrumbList), `noindex`.
- Exactly one `<h1>` per page (PageHero renders it). Sections use `<h2>`, cards `<h3>`.
- `ArticleLayout` (`src/layouts/ArticleLayout.astro`) is for long-form resources: it derives reading time and a table of contents from `<h2>`s and emits Article schema. Props: `title`, `description`, `eyebrow`, `dek`, `related` (array of resource hrefs from `RESOURCES` in `src/data/site.ts`).

## Components (`src/components/`)

| Component | Use |
|---|---|
| `PageHero` | Interior hero. Props `eyebrow, title (HTML allowed), lede, breadcrumbs, split, center`. Default slot = buttons; `slot="visual"` = visual. |
| `SectionHead` | Eyebrow + h2 + lede. `center` prop. |
| `FeatureCard` | Icon card, optional link. Props `title, text, href, icon, tag, cta`. |
| `RelatedLinks` | List of related pages with icons. Props `title, eyebrow, items[{label,href,desc,icon}]`. |
| `StoryFlow` | Use-case narrative. Named slots: `problem, signals, investigation, insight, action, outcome`. |
| `Tabs` + `TabPanel` | Accessible tabs: `<Tabs uid="x" label="…" tabs={[{id,label}]}>` containing `<TabPanel uid="x" id="a" first>…</TabPanel>`. Do **not** use dynamic `slot=` names inside `.map()` (Astro limitation). |
| `FAQ` | `items=[{q,a}]` → disclosure list + FAQPage schema. |
| `Diagram` | Inlines an SVG from `/public` so it follows the theme. Props `src, alt, caption, frame (string title or true), zoom (lightbox), illustrative (frame tag, default true), pad`. |
| `Icon` | `<Icon name="graph" />` from `/public/icons/ui/*.svg` (stroke icons, `currentColor`). |
| `CTA` | Dark closing band with demo CTA and copy-email. |
| `CopyEmail` | sales@panoptes.watch with copy button. |
| `BusinessGraph`, `DemoDashboard` | Interactive homepage visuals (reusable). |

Available icon names: `ls public/icons/ui`.

## CSS utilities (global.css)

Layout: `container`, `container-narrow`, `container-wide`, `section`, `section-tight`, `section-alt`, `section-dark`, `grid grid-2|3|4`, `split`, `split-rev`, `split-top`, `stack`.
Type: `eyebrow`, `lede`, `muted`, `small`, `note`, `gradient-text`, `kpi`, `kpi-label`, `mono`.
UI: `btn btn-primary|btn-ghost|btn-sm|btn-lg`, `btn-row`, `link-arrow`, `card card-link|card-raised|card-tint|card-accent`, `icon-tile`, `badge badge-outline|badge-ok|badge-warn|badge-crit`, `illustrative`, `checklist`, `dl-grid`, `pill-list`, `table-wrap > table.table`, `prose` (+ `.callout`), `faq`, form classes (`field`, `input`, `select`, `textarea`, `form-grid`, `check`, `form-status`), `frame`/`frame-bar`, `reveal` (fade-in on scroll), `bg-grid`, `bg-glow`, `hide-sm`/`show-sm`.

Colour tokens: `--text --text-2 --text-3 --bg --bg-2 --surface --surface-2 --elevated --border --border-strong --accent --accent-text --accent-soft --purple --purple-rich --purple-bright --ok/--warn/--crit (+ -text, -bg)`. Never hard-code light-only colours in page CSS; use tokens so dark mode works.

## SVG asset conventions (diagrams & illustrations)

- Location: `/public/diagrams/` (structural diagrams, charts, maps) and `/public/illustrations/` (smaller spot illustrations). Descriptive kebab-case filenames, e.g. `process-intelligence-stage-map.svg`.
- Every file starts with `<svg xmlns="http://www.w3.org/2000/svg" viewBox="…" fill="none">`, then the shared `<style>` block copied verbatim from `scripts/diagram-style.txt`, then a `<title>`.
- Colour **only** through the shared classes, never raw hex (except `#fff` text on an accent fill):
  `d-bg d-surface d-surface-2 d-soft` (fills) · `d-line` (stroke) `d-line-f` (fill) · `d-text d-muted` (text fill) · `d-accent d-accent-2` (fill) · `d-accent-s d-accent-2-s` (stroke) · `d-ok d-warn d-crit` (+ `-s` stroke variants) · fonts `d-t` (Inter) `d-tm` (mono) `d-td` (display) · animation `d-flow` (dashed flow) `d-pulse`.
  These resolve to theme variables when inlined, with light-mode fallbacks when the file is opened standalone.
- Any `id`s are auto-prefixed on inline, so gradients/markers are safe.
- Keep text ≥ 10px at the native viewBox width and design at the width it will display (≈ 560–1100 wide). For wide diagrams also provide a vertical `-vertical.svg` variant and switch with `hide-sm`/`show-sm`.
- Data in mockups must be visibly fictional (`frame` adds an "Illustrative data" tag).

## Content rules (non-negotiable)

1. No invented customers, logos, testimonials, statistics, research citations, certifications, awards, founding dates, team members, addresses or funding.
2. No performance claims ("reduce churn 30%"). Describe outcomes **to measure**, not outcomes achieved.
3. Unverified capabilities use conditional/vision language: "designed to", "can", "would", "the product vision is". AI Intelligence and automated execution are explicitly *vision*.
4. Root-cause content must distinguish correlation from verified causation.
5. Integrations: third-party product names are *examples of the ecosystem*; never "Available", "Certified", "Native" or partner language. No third-party logos — use our generic icons.
6. No employee surveillance framing. Panoptes observes business processes and outcomes, not individuals.
7. Avoid generic SaaS filler ("unlock insights", "supercharge", "seamless", "leverage synergies"). Be concrete and operational; use realistic scenarios (payment routing, onboarding verification queues, fulfilment cut-offs, invoice collection, etc.).
8. British English spelling (organisation, optimise, behaviour), sentence-case headings.
9. Every page has a unique title, description, and links to related pages. All internal links use trailing slashes.

## Build & check

```
npm run build                      # full build + route verification
npx astro build --outDir /tmp/x    # isolated build (use when several people build at once)
node scripts/check-links.mjs       # internal link + asset checker (after build)
```
