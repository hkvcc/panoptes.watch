/**
 * Blog author registry. Every article's front-matter `author:` must be one of these slugs
 * (checked by src/lib/blog-schema.ts, so a typo fails the build). Each author gets a page at
 * /blog/authors/<slug>/ listing their articles.
 *
 * Keep entries factual: name, role and tagline as supplied by the person, and a bio that only
 * restates the tagline. No invented employers, credentials, dates or photos.
 *
 * Plain TypeScript with no imports, so the unit tests can load it directly in Node.
 */
export interface Author {
  slug: string;
  name: string;
  role: string;     // job title, used as schema.org jobTitle
  tagline: string;  // one line, shown under the name
  bio: string;      // short neutral paragraph for the author page
  topics: string;   // what they write about; completes "Articles by <name>, <role> at Panoptes, on …" (author page meta description)
}

export const AUTHORS: readonly Author[] = [
  {
    slug: 'kieran-lovell',
    name: 'Kieran Lovell',
    role: 'Product Lead',
    tagline: 'Business Intelligence turned BusinessOS SME',
    bio: 'Kieran leads product at Panoptes. He came to the problem from business intelligence and now focuses on the Business Operating System: how KPIs, semantic models and a model of the business itself fit together so that an organisation can see how it is running, not only what it reported.',
    topics: 'moving from BI to business observability: KPI design, semantic and business models, and the BusinessOS',
  },
  {
    slug: 'florian-andrews',
    name: 'Florian Andrews',
    role: 'Journey Intelligence',
    tagline: 'ex BCG BPA Consultant forging the ultimate agentic chief of staff',
    bio: 'Florian works on Journey Intelligence at Panoptes. Formerly a BPA consultant at BCG, he writes about how work actually flows through an organisation, how to analyse and automate it, and what an agentic chief of staff should do for the people running the business.',
    topics: 'customer journeys, process analysis and automation, and agentic chief-of-staff workflows',
  },
] as const;

export const AUTHOR_SLUGS = AUTHORS.map((a) => a.slug);

export const authorHref = (slug: string) => `/blog/authors/${slug}/`;

export function getAuthor(slug: string): Author | undefined {
  return AUTHORS.find((a) => a.slug === slug);
}
