/**
 * Post-build step: writes dist/<route>/index.html for every page with its own
 * <title>, description and canonical URL, plus 404.html and sitemap.xml.
 * This makes every URL load directly (and on refresh) on Netlify or any
 * static host — no server needed.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const routes = JSON.parse(readFileSync(join(root, 'src/content/routes.json'), 'utf8'));
const siteTs = readFileSync(join(root, 'src/content/site.ts'), 'utf8');
const siteUrl = (siteTs.match(/siteUrl:\s*'([^']+)'/)?.[1] ?? '').replace(/\/$/, '');
if (process.env.VITE_ARTIFACT === 'true') {
  console.log('Artifact build: single index.html, no route pre-rendering.');
  process.exit(0);
}
const template = readFileSync(join(dist, 'index.html'), 'utf8');

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function render({ title, description, path }, { noindex = false } = {}) {
  const url = siteUrl + (path === '/' ? '/' : path);
  let html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)
    .replace(/https:\/\/cojacs-rumpopo\.netlify\.app/g, siteUrl);
  if (noindex) html = html.replace('<!--app-head-->', '<meta name="robots" content="noindex" />');
  return html;
}

const today = new Date().toISOString().slice(0, 10);
const urls = [];
for (const r of Object.values(routes)) {
  const out = r.path === '/' ? join(dist, 'index.html') : join(dist, r.path.slice(1), 'index.html');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, render(r));
  urls.push(`  <url><loc>${siteUrl}${r.path === '/' ? '/' : r.path}</loc><lastmod>${today}</lastmod></url>`);
}
writeFileSync(join(dist, '404.html'), render({ title: 'Page not found | Cojac’s Sumptuous Rumpopo', description: 'This page could not be found.', path: '/404' }, { noindex: true }));
if (process.env.VITE_SHOW_LAUNCH_NOTES === 'true') {
  mkdirSync(join(dist, 'launch-notes'), { recursive: true });
  writeFileSync(join(dist, 'launch-notes', 'index.html'), render({ title: 'Launch notes (internal)', description: 'Internal', path: '/launch-notes' }, { noindex: true }));
}
const robots = readFileSync(join(dist, 'robots.txt'), 'utf8').replace(/https:\/\/cojacs-rumpopo\.netlify\.app/g, siteUrl);
writeFileSync(join(dist, 'robots.txt'), robots);
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`);
writeFileSync(join(dist, '_redirects'), '/*  /404.html  404\n');
console.log(`Pre-rendered ${urls.length} routes + 404.html + sitemap.xml for ${siteUrl}`);
