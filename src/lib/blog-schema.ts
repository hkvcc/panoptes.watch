/**
 * Front-matter contract for blog articles in content/blog/*.md.
 *
 * Required: `title`, `meta_description`, `author` (a slug registered in src/data/authors.ts) and a
 * date (`published` or `reviewed`). The SEO-style keys
 * (id, slug, canonical_url, primary_keyword, reviewed, image_alt) are accepted so articles drafted
 * with SEO tooling drop in unchanged; `slug`/`canonical_url`, when present, must match the filename.
 * (The scheduled SEO campaign publishes to /resources/, not here — see its RUNBOOK.md.)
 * Unknown keys fail the build, so a typo such as `categroy:` is caught rather than ignored.
 *
 * Kept free of `astro:*` imports so the unit tests can load it directly in Node.
 */
import { z } from 'astro/zod';
import { AUTHOR_SLUGS } from '../data/authors.ts';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const blogSchema = z
  .object({
    // SEO-style keys (optional except title / meta_description)
    id: z.string().optional(),                                   // campaign brief id, e.g. "BO-01"
    title: z.string().trim().min(10).max(60),                    // SEO <title>; the display H1 is the body's "# " heading
    meta_description: z.string().trim().min(50).max(200),
    slug: z.string().regex(/^\/blog\/[a-z0-9]+(?:-[a-z0-9]+)*\/$/, 'slug must look like "/blog/my-article/"').optional(),
    canonical_url: z.string().url().optional(),
    primary_keyword: z.string().trim().min(1).optional(),
    // Required. Defaults to '' only so a missing key gets the same helpful message as an unknown one.
    author: z
      .string()
      .trim()
      .default('')
      .refine((s) => AUTHOR_SLUGS.includes(s), (s) => ({
        message: s
          ? `Unknown author "${s}". Use one of: ${AUTHOR_SLUGS.join(', ')} (or add the person to src/data/authors.ts)`
          : `Set \`author\` to a registered author slug: ${AUTHOR_SLUGS.join(', ')}`,
      })),
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
  // BaseLayout appends " | Panoptes" (11 chars) unless the title already names Panoptes; keep the full <title> ≤ 60.
  .refine((d) => /Panoptes/.test(d.title) || d.title.length <= 49, { message: 'title must be 49 characters or fewer (the site appends " | Panoptes"), or name Panoptes and stay within 60', path: ['title'] })
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
