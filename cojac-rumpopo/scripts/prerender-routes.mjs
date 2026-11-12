/**
 * Post-build step (runs after the client build and the SSR build):
 *  - writes dist/<route>/index.html (English) and dist/es/<route>/index.html
 *    (Spanish) for every page, with its full content rendered to HTML (readable
 *    without JavaScript by search engines, answer engines and AI crawlers), its own
 *    title/description/canonical/social tags, hreflang links to the other language
 *    and JSON-LD;
 *  - writes 404.html (+ es/404.html), sitemap.xml, robots.txt (with the live
 *    domain), llms.txt and _redirects.
 * No server is needed: every URL is a static file on Netlify or any static host.
 *
 * The SSR bundle is loaded twice: once in English and once in Spanish (a fresh
 * copy of the module, with the language set before it loads).
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

const ssrUrl = pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href;
globalThis.__COJAC_LANG__ = 'en';
const en = await import(ssrUrl);
globalThis.__COJAC_LANG__ = 'es';
const es = await import(`${ssrUrl}?lang=es`);
if (en.lang !== 'en' || es.lang !== 'es') throw new Error(`Language renderers not set up correctly (${en.lang}, ${es.lang})`);
const LANGS = { en, es };

const siteTs = readFileSync(join(root, 'src/content/site.ts'), 'utf8');
const siteUrl = (siteTs.match(/siteUrl:\s*'([^']+)'/)?.[1] ?? '').replace(/\/$/, '');
const PLACEHOLDER = /https:\/\/cojacs-rumpopo\.netlify\.app/g;
let template = readFileSync(join(dist, 'index.html'), 'utf8').replace(PLACEHOLDER, siteUrl);
// Speed: build the stylesheet into each page instead of a separate file the page must
// wait for, so phones can draw the page as soon as the HTML arrives (~18 KB compressed).
template = template.replace(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/, (tag, href) => {
  const file = join(dist, href.replace(/^\//, ''));
  try {
    return `<style>${readFileSync(file, 'utf8').replace(/<\/style/gi, '<\\/style')}</style>`;
  } catch {
    return tag;
  }
});


const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const setMeta = (html, attr, key, value) =>
  html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${esc(value)}$2`);

/** Router path ("/flavours") → site path in a language ("/flavours" or "/es/flavours"). */
const inLang = (lang, path) => (lang === 'en' ? path : path === '/' ? '/es/' : `/es${path}`);
/** Public address: always ends in "/", the form Netlify serves without a redirect. */
const urlFor = (lang, path) => siteUrl + inLang(lang, path).replace(/([^/])$/, '$1/');
const fileFor = (lang, path) => {
  const p = inLang(lang, path);
  return p.endsWith('/') ? join(dist, p.slice(1), 'index.html') : join(dist, p.slice(1), 'index.html');
};

const SPANISH = {
  ogImageAlt: 'Cojac’s Sumptuous Rumpopo: una botella de rumpopo y un vaso frente a un árbol de Navidad',
  noscript: 'Activa JavaScript para armar un pedido. Igual puedes leer todas las páginas.',
};

function page(lang, { key, title, description, path, noindex = false, ld = '', image = null, article = null }) {
  const ssr = LANGS[lang];
  const url = urlFor(lang, path);
  let html = template.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace('<html lang="en-BZ"', `<html lang="${lang === 'es' ? 'es-BZ' : 'en-BZ'}"`);
  // Sends returning visitors to the language they chose, and first-time visitors
  // with a Spanish browser to the Spanish page, before anything is drawn.
  html = html.replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    <script>${ssr.LANG_REDIRECT_SCRIPT}</script>`);
  html = setMeta(html, 'name', 'description', description);
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', description);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
  const alternates =
    `<link rel="alternate" hreflang="en-BZ" href="${urlFor('en', path)}" />\n` +
    `    <link rel="alternate" hreflang="es" href="${urlFor('es', path)}" />\n` +
    `    <link rel="alternate" hreflang="x-default" href="${urlFor('en', path)}" />`;
  html = html
    .replace(/<link rel="alternate" hreflang="x-default"[^>]*>\s*/, '')
    .replace(/<link rel="alternate" hreflang="en-BZ"[^>]*>/, alternates);
  if (lang === 'es') {
    html = setMeta(html, 'property', 'og:locale', 'es_BZ');
    html = html.replace(/(<meta property="og:locale" content="es_BZ" \/>)/, '$1\n    <meta property="og:locale:alternate" content="en_BZ" />');
    html = setMeta(html, 'property', 'og:image:alt', SPANISH.ogImageAlt);
    html = html.replace(/(<noscript>\s*<p[^>]*>)[^<]*(<\/p>)/, `$1\n        ${SPANISH.noscript}\n      $2`);
  } else {
    html = html.replace(/(<meta property="og:locale" content="en_BZ" \/>)/, '$1\n    <meta property="og:locale:alternate" content="es_BZ" />');
  }
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
  const head = (key ? ssr.jsonLdScript(key) : ld) + extra;
  html = html.replace('<!--app-head-->', head);
  html = html.replace('<div id="root"></div>', `<div id="root">${ssr.render(inLang(lang, path))}</div>`);
  return html;
}

const write = (file, html) => {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
};

const today = new Date().toISOString().slice(0, 10);
const urls = [];
/** One sitemap entry per language, each listing both versions. */
function sitemapEntry(path, { lastmod, changefreq, priority, images = [] }) {
  const alts =
    `\n    <xhtml:link rel="alternate" hreflang="en-BZ" href="${urlFor('en', path)}" />` +
    `\n    <xhtml:link rel="alternate" hreflang="es" href="${urlFor('es', path)}" />` +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${urlFor('en', path)}" />`;
  const imgs = images.map((u) => `\n    <image:image><image:loc>${u}</image:loc></image:image>`).join('');
  for (const lang of ['en', 'es']) {
    urls.push(
      `  <url>\n    <loc>${urlFor(lang, path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>${alts}${imgs}\n  </url>`,
    );
  }
}

for (const [key, r] of Object.entries(en.routes)) {
  for (const lang of ['en', 'es']) {
    const lr = LANGS[lang].routes[key];
    write(fileFor(lang, r.path), page(lang, { key, ...lr }));
  }
  const images = key === 'home' ? [`${siteUrl}/brand/cojacs-logo-square-512.jpg`, `${siteUrl}/og-image.jpg`] : [];
  const priority = key === 'home' ? '1.0' : key === 'flavours' || key === 'order' ? '0.9' : key === 'privacy' ? '0.3' : '0.7';
  sitemapEntry(r.path, { lastmod: today, changefreq: 'weekly', priority, images });
}
for (const lang of ['en', 'es']) {
  for (const b of LANGS[lang].blogPages()) {
    write(
      fileFor(lang, b.path),
      page(lang, { title: b.title, description: b.description, path: b.path, ld: LANGS[lang].postJsonLdScript(b.slug), image: b.image, article: b }),
    );
  }
}
for (const b of en.blogPages()) sitemapEntry(b.path, { lastmod: b.updatedAt, changefreq: 'monthly', priority: '0.8', images: [b.image.url] });

write(
  join(dist, '404.html'),
  page('en', { title: 'Page not found | Cojac’s Sumptuous Rumpopo', description: 'This page could not be found.', path: '/404', noindex: true }),
);
write(
  join(dist, 'es', '404.html'),
  page('es', { title: 'Página no encontrada | Cojac’s Sumptuous Rumpopo', description: 'No encontramos esta página.', path: '/404', noindex: true }),
);
if (process.env.VITE_SHOW_LAUNCH_NOTES === 'true') {
  write(join(dist, 'launch-notes', 'index.html'), page('en', { title: 'Launch notes (internal)', description: 'Internal', path: '/launch-notes', noindex: true }));
}
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`,
);
writeFileSync(join(dist, 'robots.txt'), readFileSync(join(dist, 'robots.txt'), 'utf8').replace(PLACEHOLDER, siteUrl));
writeFileSync(
  join(dist, 'llms.txt'),
  en.llmsTxt() + `\n## Spanish version\nEvery page is also available in Spanish under ${siteUrl}/es/ (for example ${siteUrl}/es/flavours/).\n`,
);
// Unknown Spanish paths get the Spanish "page not found"; everything else the English one.
// The site's old Netlify address sends visitors and search engines to rumpopo.com.
const OLD_HOSTS = ['shiny-truffle-ef9459.netlify.app'];
const hostRedirects = OLD_HOSTS.flatMap((h) => [`https://${h}/*  ${siteUrl}/:splat  301!`, `http://${h}/*  ${siteUrl}/:splat  301!`]).join('\n');
writeFileSync(join(dist, '_redirects'), `${hostRedirects}\n/es/*  /es/404.html  404\n/*  /404.html  404\n`);
rmSync(join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`Pre-rendered ${urls.length} pages in English and Spanish (full HTML + JSON-LD) + 404 pages, sitemap.xml, robots.txt, llms.txt for ${siteUrl}`);
