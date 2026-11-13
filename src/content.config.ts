import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { blogSchema } from './lib/blog-schema';

// Every Markdown file in content/blog/ is an article; the filename is its URL slug
// (content/blog/my-article.md → /blog/my-article/). Files starting with "_" are ignored.
// BLOG_CONTENT_DIR is only for the test suite, which builds against generated fixtures.
const blog = defineCollection({
  loader: glob({
    pattern: '[^_]*.md',
    base: process.env.BLOG_CONTENT_DIR || './content/blog',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: blogSchema,
});

export const collections = { blog };
