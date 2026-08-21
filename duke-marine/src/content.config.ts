import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * News/articles live as Markdown so they read and edit like blog posts.
 * Products, brands and team are typed data modules under src/data.
 */
const news = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/news' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    category: z.string().default('News'),
    author: z.string().default('Duke Marine'),
    seed: z.string().optional(),
    /** Feature image: article cover plus social sharing. */
    image: z.string().optional(),
    imageAlt: z.string().optional(),
    /** Focal point for the cover crop, e.g. "center 52%". */
    imagePosition: z.string().optional(),
    /** Optional different image for the blog listing card. */
    cardImage: z.string().optional(),
    /** Decorative full-bleed image behind the article title. */
    heroImage: z.string().optional(),
    /** SEO overrides; fall back to title and excerpt when omitted. */
    seoTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    /** Editorial series, e.g. "Duke Marine On the Water Guide". */
    series: z.string().optional(),
    seriesPart: z.number().optional(),
  }),
});

export const collections = { news };
