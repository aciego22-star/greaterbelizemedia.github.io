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
  }),
});

export const collections = { news };
