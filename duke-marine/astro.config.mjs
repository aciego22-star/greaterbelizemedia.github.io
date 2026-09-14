// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Update `site` to the final production domain before the first deploy.
// Netlify will also inject the correct URL, but a real value here powers
// canonical URLs, sitemap and social share tags.

// Every page is regenerated on each build and the whole folder is deployed
// together, so the build time is the honest "last modified" date for all of
// them. Frozen once per build so a 117-page sitemap carries one timestamp
// rather than 117 timestamps a few milliseconds apart.
const builtAt = new Date().toISOString();

// How important each page is relative to the others on this site. Google
// ignores priority and changefreq; Bing and others still read them. lastmod is
// the field that actually earns a re-crawl, and it is the reason this block
// exists: without it a sitemap only says what exists, never that anything
// changed, so an established domain settles into a slow crawl and stays there.
function priorityFor(pathname) {
  if (pathname === '/') return 1.0;
  const depth = pathname.replace(/^\/|\/$/g, '').split('/').length;
  if (depth <= 1) return 0.8;
  return 0.6;
}

export default defineConfig({
  site: 'https://dukemarinebz.com',
  output: 'static',
  integrations: [
    sitemap({
      serialize(item) {
        item.lastmod = builtAt;
        item.changefreq = 'weekly';
        item.priority = priorityFor(new URL(item.url).pathname);
        return item;
      },
    }),
  ],
  build: {
    inlineStylesheets: 'auto',
  },
});
