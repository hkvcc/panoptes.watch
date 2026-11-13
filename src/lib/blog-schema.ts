/**
 * Front-matter contract for blog articles in content/blog/*.md.
 *
 * The first nine keys are the SEO campaign's contract (seo/business-observability/RUNBOOK.md,
 * checked by scripts/validate_seo.py); the rest are optional editorial keys. Unknown keys fail
 * the build, so a typo such as `categroy:` is caught rather than silently ignored.
 *
 * Kept free of `astro:*` imports so the unit tests can load it directly in Node.
 */
import { z } from 'astro/zod';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogSchema = z
  .object({
    // Campaign contract
    id: z.string().optional(),                                   // campaign brief id, e.g. "BO-01"
    title: z.string().trim().min(10).max(110),                   // SEO <title> (the display H1 is the body's "# " heading)
    meta_description: z.string().trim().min(50).max(200),
    slug: z.string().regex(/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/, 'slug must look like "/blog/my-article/"').optional(),
    canonical_url: z.string().url().optional(),
    primary_keyword: z.string().trim().min(1).optional(),
    author: z.string().trim().min(1).default('Panoptes Editorial Team'),
    reviewed: z.coerce.date().optional(),
    image_alt: z.string().trim().min(1).optional(),

    // Editorial keys
    published: z.coerce.date().optional(),                       // first publication; defaults to `reviewed`
    updated: z.coerce.date().optional(),
    category: z.string().trim().min(2).max(40).optional(),
    tags: z.array(z.string().trim().min(1).max(40)).max(12).default([]),
    cover: z.string().regex(/^\/[^\s]+\.(png|jpe?g|webp|avif|svg)$/i, 'cover must be a /public path to an image').optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  })
  .strict()
  .refine((d) => d.published || d.reviewed, { message: 'Set `published` (or `reviewed`) so the article has a publication date', path: ['published'] })
  .refine((d) => !d.cover || d.image_alt, { message: '`image_alt` is required when `cover` is set', path: ['image_alt'] })
  .refine((d) => !d.updated || !d.published || d.updated >= d.published, { message: '`updated` is earlier than `published`', path: ['updated'] });

export type BlogFrontMatter = z.infer<typeof blogSchema>;

export const isValidSlug = (s: string) => SLUG.test(s);

/**
 * Checks that need the file's slug (derived from its filename) as well as the front matter.
 * Returns a list of problems; empty when the article is consistent.
 */
export function crossCheck(fileSlug: string, data: BlogFrontMatter, origin: string): string[] {
  const problems: string[] = [];
  const path = `/blog/${fileSlug}/`;
  if (!isValidSlug(fileSlug)) problems.push(`filename "${fileSlug}" must be lowercase words separated by hyphens`);
  if (data.slug && data.slug !== path) problems.push(`slug "${data.slug}" does not match the filename (expected "${path}")`);
  if (data.canonical_url && data.canonical_url !== new URL(path, origin).href) {
    problems.push(`canonical_url "${data.canonical_url}" should be "${new URL(path, origin).href}"`);
  }
  return problems;
}
