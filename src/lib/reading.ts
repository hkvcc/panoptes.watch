/** Shared reading-time rule used by ArticleLayout and the resources hub. */
export const countWords = (html: string): number =>
  html.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
export const readingMinutes = (words: number): number => Math.max(3, Math.round(words / 230));
