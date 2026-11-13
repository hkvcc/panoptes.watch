/**
 * Content model for /solutions/industries/<slug>/ pages (rendered by IndustryPage.astro).
 * All scenarios and figures are illustrative; capabilities are described as design intent.
 */
export interface IndustryLink { label: string; href: string; desc?: string; icon?: string }

export interface Industry {
  slug: string;
  /** Short name, used in breadcrumbs and cards (matches INDUSTRIES label in src/data/site.ts). */
  name: string;
  /** Primary target query, used in the H1 and WebPage `about`. */
  keyword: string;
  /** <title> without "| Panoptes" — max 49 characters so the full title is ≤ 60. */
  metaTitle: string;
  /** Meta description, 140–160 characters. */
  description: string;
  /** H1 (HTML allowed, e.g. a gradient-text span). Must contain the keyword naturally. */
  h1: string;
  lede: string;
  /** Hero visual: an existing diagram from /public/diagrams with descriptive alt text. */
  visual?: { src: string; alt: string; frame: string };
  problem: { title: string; paras: string[]; points: string[] };
  /** Value streams to observe — rendered as H3 cards under one H2. */
  flows: { title: string; icon: string; text: string; signals: string[] }[];
  /** Indicators worth watching — rendered as a table. */
  indicators: { name: string; why: string; pair: string }[];
  /** Illustrative investigation (clearly labelled as fictional). */
  scenario: { title: string; intro: string; steps: { k: string; t: string }[]; caveat: string };
  /** Exactly four platform capabilities, each linking to /platform/…/. */
  capabilities: { title: string; text: string; href: string; icon: string }[];
  /** Related role, use-case and resource links (internal, trailing slash). */
  related: IndustryLink[];
  faqs: { q: string; a: string }[];
}
