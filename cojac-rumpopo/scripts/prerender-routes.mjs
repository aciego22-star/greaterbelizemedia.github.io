/**
 * Post-build step (runs after the client build and the SSR build):
 *  - writes dist/<route>/index.html for every page with its full content rendered
 *    to HTML (readable without JavaScript by search engines, answer engines and
 *    AI crawlers), its own title/description/canonical/social tags and JSON-LD;
 *  - writes 404.html, sitemap.xml, robots.txt (with the live domain) and llms.txt.
 * No server is needed: every URL is a static file on Netlify or any static host.
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

if (process.env.VITE_ARTIFACT === 'true') {
  console.log('Artifact build: single index.html, no route pre-rendering.');
  process.exit(0);
}

const ssr = await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href);
const { routes, render, jsonLdScript, postJsonLdScript, blogPages, llmsTxt } = ssr;
const siteTs = readFileSync(join(root, 'src/content/site.ts'), 'utf8');
const siteUrl = (siteTs.match(/siteUrl:\s*'([^']+)'/)?.[1] ?? '').replace(/\/$/, '');
const PLACEHOLDER = /https:\/\/cojacs-rumpopo\.netlify\.app/g;
const template = readFileSync(join(dist, 'index.html'), 'utf8').replace(PLACEHOLDER, siteUrl);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setMeta = (html, attr, key, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);

function page({ key, title, description, path, noindex = false, ld = '', image = null, article = null }) {
  const url = siteUrl + (path === '/' ? '/' : path);
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = html
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="alternate" hreflang="en-BZ" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="alternate" hreflang="x-default" href=")[^"]*(")/, `$1${url}$2`);
  if (noindex) {
    html = html
      .replace(/<meta name="robots" content="[^"]*" \/>/, '<meta name="robots" content="noindex, follow" />')
      .replace(/\s*<link rel="canonical"[^>]*>/, '')
      .replace(/\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '');
  }
  if (image) {
    html = setMeta(html, 'property', 'og:image', image.url);
    html = setMeta(html, 'property', 'og:image:width', String(image.width));
    html = setMeta(html, 'property', 'og:image:height', String(image.height));
    html = setMeta(html, 'property', 'og:image:alt', image.alt);
    html = setMeta(html, 'name', 'twitter:image', image.url);
  }
  let extra = '';
  if (article) {
    html = setMeta(html, 'property', 'og:type', 'article');
    extra +=
      `<meta property="article:published_time" content="${article.publishedAt}" />` +
      `<meta property="article:modified_time" content="${article.updatedAt}" />` +
      article.section.map((s) => `<meta property="article:section" content="${esc(s)}" />`).join('') +
      article.tags.map((t) => `<meta property="article:tag" content="${esc(t)}" />`).join('');
  }
  const head = (key ? jsonLdScript(key) : ld) + extra;
  html = html.replace('<!--app-head-->', head);
  html = html.replace('<div id="root"></div>', `<div id="root">${render(path)}</div>`);
  return html;
}

const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const [key, r] of Object.entries(routes)) {
  const out = r.path === '/' ? join(dist, 'index.html') : join(dist, r.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page({ key, ...r }));
  const loc = `${siteUrl}${r.path === '/' ? '/' : r.path}`;
  const image =
    key === 'home'
      ? `\n    <image:image><image:loc>${siteUrl}/brand/cojacs-logo-square-512.jpg</image:loc></image:image>\n    <image:image><image:loc>${siteUrl}/og-image.jpg</image:loc></image:image>`
      : '';
  const priority = key === 'home' ? '1.0' : key === 'flavours' || key === 'order' ? '0.9' : key === 'privacy' ? '0.3' : '0.7';
  urls.push(`  <url>\n    <loc>${loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>${image}\n  </url>`);
}
for (const b of blogPages()) {
  const out = join(dist, b.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, page({ title: b.title, description: b.description, path: b.path, ld: postJsonLdScript(b.slug), image: b.image, article: b }));
  urls.push(`  <url>\n    <loc>${siteUrl}${b.path}</loc>\n    <lastmod>${b.updatedAt}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n    <image:image><image:loc>${b.image.url}</image:loc></image:image>\n  </url>`);
}
writeFileSync(
  join(dist, '404.html'),
  page({ title: 'Page not found | Cojac’s Sumptuous Rumpopo', description: 'This page could not be found.', path: '/404', noindex: true }),
);
if (process.env.VITE_SHOW_LAUNCH_NOTES === 'true') {
  mkdirSync(join(dist, 'launch-notes'), { recursive: true });
  writeFileSync(join(dist, 'launch-notes', 'index.html'), page({ title: 'Launch notes (internal)', description: 'Internal', path: '/launch-notes', noindex: true }));
}
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`,
);
writeFileSync(join(dist, 'robots.txt'), readFileSync(join(dist, 'robots.txt'), 'utf8').replace(PLACEHOLDER, siteUrl));
writeFileSync(join(dist, 'llms.txt'), llmsTxt());
writeFileSync(join(dist, '_redirects'), '/*  /404.html  404\n');
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Pre-rendered ${urls.length} pages (full HTML + JSON-LD) + 404.html, sitemap.xml, robots.txt, llms.txt for ${siteUrl}`);
