// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update `site` to the final production domain before the first deploy.
// Netlify will also inject the correct URL, but a real value here powers
// canonical URLs, sitemap and social share tags.
export default defineConfig({
  site: 'https://dukemarinebz.com',
  output: 'static',
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
