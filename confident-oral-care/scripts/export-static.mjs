// Netlify package and single-file preview.
//
//   node scripts/export-static.mjs            -> deliverables/netlify-site/ and deliverables/confident-oral-care-netlify.zip
//   node scripts/export-static.mjs --single   -> also deliverables/confident-oral-care-preview.html (one self-contained file)
//
// The Netlify zip is the full site: pre-rendered pages plus one pre-bundled Netlify Function
// (netlify/functions/api.mjs) for the booking API, confident AI and the test calendar, with data in
// Netlify Blobs. No build step or npm install is needed; upload the zip as-is.
// The single-file preview runs the real application core inside the page (src/preview/browser.mjs):
// booking, the test calendar and confident AI in demo mode all work offline, with test data kept in
// the browser's localStorage.

import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { notFoundPage } from '../src/render/pages.mjs';
import { pageRoutes } from '../src/render/routes.mjs';
import { loadSite } from '../src/site.mjs';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const OUT = join(ROOT, 'deliverables');
const SITE_DIR = join(OUT, 'netlify-site');
const single = process.argv.includes('--single');

const fullSite = await loadSite(ROOT);
const site = await loadSite(ROOT, { staticPreview: true }); // single-file preview only
const routes = pageRoutes(site);
const fullRoutes = pageRoutes(fullSite);

const fileFor = (path) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

/* ---------------------------------------------------------------- Netlify folder */

async function exportSite() {
  await rm(SITE_DIR, { recursive: true, force: true });
  await mkdir(SITE_DIR, { recursive: true });

  for (const [path, render] of fullRoutes) {
    const file = join(SITE_DIR, fileFor(path));
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, render());
  }
  await writeFile(join(SITE_DIR, '404.html'), notFoundPage(fullSite));

  // One self-contained function file (all dependencies included).
  await build({
    entryPoints: [join(ROOT, 'netlify/functions/api.mjs')],
    outfile: join(SITE_DIR, 'netlify/functions/api.mjs'),
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'node20',
    legalComments: 'none',
    logLevel: 'warning',
    banner: { js: "import { createRequire as __cr } from 'node:module'; const require = __cr(import.meta.url);" },
  });
  await writeFile(join(SITE_DIR, 'netlify.toml'), `# ConfiDent Oral Care: pre-built site. No build command; publish the zip root as-is.
[build]
  publish = "."

[functions]
  directory = "netlify/functions"
`);

  const filter = (src) => !src.includes(`${join('public', 'img', 'original')}`);
  for (const dir of ['css', 'js', 'fonts', 'img', 'media']) {
    await cp(join(ROOT, 'public', dir), join(SITE_DIR, dir), { recursive: true, filter });
  }

  const preview = Boolean(fullSite.siteConfig.preview);
  await writeFile(join(SITE_DIR, 'robots.txt'), preview ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');

  // Explicit clean-URL rewrites (status 200) so /about serves about.html on any Netlify setting,
  // then a 404 fallback.
  // Keep deployment files private, then clean-URL rewrites. /api/* and /preview/test-calendar are
  // served by the function (its config.path).
  const redirects = ['/netlify/*  /404.html  404!', '/netlify.toml  /404.html  404!'];
  redirects.push(...[...fullRoutes.keys()]
    .filter((p) => p !== '/')
    .map((p) => `${p}  /${fileFor(p)}  200`));
  await writeFile(join(SITE_DIR, '_redirects'), `${redirects.join('\n')}\n`);

  await writeFile(join(SITE_DIR, '_headers'), `/*
${preview ? '  X-Robots-Tag: noindex, nofollow\n' : ''}  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; media-src 'self'; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
/fonts/*
  Cache-Control: public, max-age=31536000, immutable
/img/*
  Cache-Control: public, max-age=604800
/media/*
  Cache-Control: public, max-age=604800
`);

  const zip = join(OUT, 'confident-oral-care-netlify.zip');
  await rm(zip, { force: true });
  execFileSync('zip', ['-qr', '-X', zip, '.'], { cwd: SITE_DIR });
  console.log(`Netlify folder: ${SITE_DIR}`);
  console.log(`Netlify zip:    ${zip}`);
}

/* ----------------------------------------------------------- Single-file preview */

const MIME = { '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const dataUris = new Map();
async function dataUri(publicPath) {
  if (!dataUris.has(publicPath)) {
    const buf = await readFile(join(ROOT, 'public', publicPath));
    dataUris.set(publicPath, `data:${MIME[extname(publicPath)]};base64,${buf.toString('base64')}`);
  }
  return dataUris.get(publicPath);
}

async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  for (const m of str.matchAll(re)) {
    parts.push(str.slice(last, m.index), await fn(...m));
    last = m.index + m[0].length;
  }
  parts.push(str.slice(last));
  return parts.join('');
}

/** Pick the srcset entry closest to the target width, preferring WebP. */
function pickFromSrcset(srcset, target) {
  const entries = srcset.split(',').map((e) => e.trim().split(/\s+/)).map(([url, w]) => ({ url, w: parseInt(w, 10) || target }));
  entries.sort((a, b) => Math.abs(a.w - target) - Math.abs(b.w - target));
  return entries[0].url;
}

async function inlinePictures(html) {
  html = await replaceAsync(html, /<picture([^>]*)>([\s\S]*?)<\/picture>/g, async (whole, attrs, inner) => {
    const portraitAll = inner.match(/<source media="all" type="image\/webp" srcset="([^"]+)"/);
    const landscapeWebp = inner.match(/<source type="image\/webp" srcset="([^"]+)"/);
    const chosen = portraitAll ? pickFromSrcset(portraitAll[1], 720) : landscapeWebp ? pickFromSrcset(landscapeWebp[1], 1200) : null;
    let img = inner.match(/<img[^>]*>/)[0].replace(/\s(srcset|sizes)="[^"]*"/g, '');
    if (chosen) img = img.replace(/src="[^"]*"/, `src="${await dataUri(chosen)}"`);
    if (portraitAll) img = img.replace(/width="\d+" height="\d+"/, 'width="864" height="1536"');
    return `<picture${attrs}>${img}</picture>`;
  });
  // Remaining standalone images (logo).
  html = await replaceAsync(html, /<img([^>]*?)src="(\/img\/[^"]+)"([^>]*)>/g, async (whole, a, src, b) => {
    const better = src.replace('confident-logo-240.png', 'confident-logo-480.webp');
    return `<img${a.replace(/\s(srcset|sizes)="[^"]*"/g, '')}src="${await dataUri(better)}"${b.replace(/\s(srcset|sizes)="[^"]*"/g, '')}>`;
  });
  // Videos: inline poster; the clip itself is embedded once and attached by script.
  html = await replaceAsync(html, /<video([^>]*)poster="([^"]+)"([^>]*)>([\s\S]*?)<\/video>/g, async (whole, a, poster, b, inner) => {
    const src = (inner.match(/<source src="([^"]+)"/) || [])[1];
    return `<video${a}poster="${await dataUri(poster)}"${b} data-inline-src="${src}"></video>`;
  });
  return html;
}

function slugFor(path) {
  return path === '/' ? 'home' : path.slice(1).replace(/\//g, '-');
}

/** Prefix ids within one page so every page can live in a single document. */
function scopeIds(main, slug, routeSet) {
  const ids = new Set([...main.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const scoped = (id) => (ids.has(id) ? `${slug}--${id}` : id);
  return main
    .replace(/\s(id|for|aria-labelledby|aria-controls|aria-describedby)="([^"]+)"/g, (m, attr, val) => ` ${attr}="${val.split(' ').map(scoped).join(' ')}"`)
    .replace(/href="#([^"]+)"/g, (m, id) => (ids.has(id) ? `href="#${slug}--${id}"` : m))
    .replace(/href="(\/[^"#?]*)(?:\?[^"#]*)?(?:#([^"]*))?"/g, (m, path, hash) => {
      if (!routeSet.has(path)) return m;
      const target = slugFor(path);
      return `href="#${hash ? `${target}--${hash}` : `r-${target}`}"`;
    });
}

async function exportSingle() {
  const routeSet = new Set(fullRoutes.keys());
  const pagesHtml = new Map([...fullRoutes].map(([path, render]) => [path, render()]));
  const home = pagesHtml.get('/');
  const mainStart = home.indexOf('<main id="main" tabindex="-1">');
  const mainEnd = home.indexOf('</main>');
  let shell = home.slice(0, mainStart) + '<main id="main" tabindex="-1">\n%%ROUTES%%\n' + home.slice(mainEnd);

  const sections = [];
  const titles = {};
  for (const [path, html] of pagesHtml) {
    const slug = slugFor(path);
    const main = html.slice(html.indexOf('<main id="main" tabindex="-1">') + '<main id="main" tabindex="-1">'.length, html.indexOf('</main>'));
    titles[`r-${slug}`] = html.match(/<title>([^<]+)<\/title>/)[1].replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    sections.push(`<section class="route${path === '/' ? ' route-home' : ''}" id="r-${slug}">${scopeIds(main, slug, routeSet)}</section>`);
  }
  sections.push('<section class="route" id="r-test-calendar"><div class="container section"><p class="loading">Loading the test calendar…</p></div></section>');
  titles['r-test-calendar'] = 'Test calendar | ConfiDent Oral Care';

  // Shell links (header, footer, assistant panel) -> route anchors.
  shell = shell.replace(/href="(\/[^"#?]*)(?:\?[^"#]*)?(?:#([^"]*))?"/g, (m, path, hash) => {
    if (!routeSet.has(path)) return m;
    const target = slugFor(path);
    return `href="#${hash ? `${target}--${hash}` : `r-${target}`}"`;
  });
  shell = shell.replace('%%ROUTES%%', () => sections.join('\n'));

  // Inline CSS with fonts.
  let css = await readFile(join(ROOT, 'public/css/site.css'), 'utf8');
  css = await replaceAsync(css, /url\('(\/fonts\/[^']+)'\)/g, async (m, p) => `url('${await dataUri(p)}')`);
  css += `
/* Single-file preview: one section per page, shown with :target. */
.route { display: none; }
.route:target, .route:has(:target) { display: block; }
.route-home { display: block; }
main:has(.route:not(.route-home):target, .route:not(.route-home) :target) .route-home { display: none; }
.single-banner { background: #fff7e6; border-bottom: 1px dashed var(--gold-text); font-size: .85rem; padding: 8px var(--gutter); text-align: center; margin: 0; }
.single-banner a, .single-banner button { font: inherit; font-weight: 650; color: var(--gold-text); background: none; border: 0; padding: 0; cursor: pointer; text-decoration: underline; }
`;
  shell = shell
    .replace(/<link rel="preload"[^>]*>\n?/g, '')
    .replace('<link rel="stylesheet" href="/css/site.css">', () => `<style>${css}</style>`)
    .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" href="${await dataUri('/img/favicon.svg')}">`)
    .replace(/<meta property="og:image"[^>]*>\n?/, '')
    .replace('<a class="skip-link" href="#main">', '<p class="single-banner">Preview file: booking and confident AI (demo mode) work in this page, and test bookings are saved in this browser only. <a href="#r-test-calendar">Test calendar</a> · <button type="button" data-preview-reset>Reset test data</button></p>\n<a class="skip-link" href="#main">');

  shell = await inlinePictures(shell);

  // Bundle the browser modules into one inline script.
  const bundleModule = async (file, name) => {
    let src = await readFile(join(ROOT, 'public/js', file), 'utf8');
    src = src.replace(/^import .*$/gm, '');
    const exported = [...src.matchAll(/^export (?:async )?function (\w+)/gm)].map((m) => m[1]);
    src = src.replace(/^export /gm, '');
    return `const ${name} = (() => {\n${src}\nreturn { ${exported.join(', ')} };\n})();\nconst { ${exported.join(', ')} } = ${name};\n`;
  };
  const shims = {
    'node:crypto': join(ROOT, 'src/preview/shims/crypto.mjs'),
    'node:fs/promises': join(ROOT, 'src/preview/shims/fs.mjs'),
    '@anthropic-ai/sdk': join(ROOT, 'src/preview/shims/anthropic.mjs'),
  };
  const runtime = await build({
    entryPoints: [join(ROOT, 'src/preview/browser.mjs')],
    bundle: true,
    write: false,
    format: 'iife',
    platform: 'browser',
    define: { 'process.env': '{}' }, // server environment variables don't exist in the page
    target: 'es2020',
    minify: true,
    legalComments: 'none',
    logLevel: 'warning',
    plugins: [{
      name: 'preview-shims',
      setup(b) {
        b.onResolve({ filter: /^(node:crypto|node:fs\/promises|@anthropic-ai\/sdk)$/ }, (args) => ({ path: shims[args.path] }));
      },
    }],
  });
  const runtimeJs = runtime.outputFiles[0].text;
  const videoData = (await readFile(join(ROOT, 'public/media/route-to-confident.mp4'))).toString('base64');

  const routeMap = Object.fromEntries([...routeSet].map((p) => [p, `#r-${slugFor(p)}`]));
  const bundle = [
    await bundleModule('booking.js', '__booking'),
    await bundleModule('assistant.js', '__assistant'),
    (await readFile(join(ROOT, 'public/js/site.js'), 'utf8')).replace(/^import .*$/gm, ''),
    `
// Single-file routing helpers: map site paths to page anchors and keep the title in sync.
const ROUTES = ${JSON.stringify(routeMap)};
const TITLES = ${JSON.stringify(titles)};
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="/"]');
  if (!a) return;
  const url = new URL(a.getAttribute('href'), 'https://preview.local');
  const hash = ROUTES[url.pathname];
  if (hash) { e.preventDefault(); location.hash = hash.slice(1); document.getElementById('ai-panel').hidden = true; }
}, true);
const syncTitle = async () => {
  const target = location.hash && document.getElementById(location.hash.slice(1));
  const section = target ? target.closest('.route') : null;
  document.title = TITLES[section ? section.id : 'r-home'];
  if (section && target === section) window.scrollTo(0, 0);
  if (section && section.id === 'r-test-calendar') section.innerHTML = await window.__confidentPreview.calendarMain();
};
document.querySelector('[data-preview-reset]')?.addEventListener('click', () => {
  if (confirm('Clear the test bookings and chat saved in this browser?')) window.__confidentPreview.reset();
});
// Attach the embedded route video to every player (one copy in the file).
const videoEl = document.getElementById('route-video-data');
if (videoEl) {
  const attach = () => {
    const bin = atob(videoEl.textContent.trim());
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(new Blob([bytes], { type: 'video/mp4' }));
    document.querySelectorAll('video[data-inline-src]').forEach((v) => { v.src = url; });
  };
  (window.requestIdleCallback || ((fn) => setTimeout(fn, 300)))(attach);
}
window.addEventListener('hashchange', syncTitle);
syncTitle();
`,
  ].join('\n');
  // Function replacements: inserted code may contain "$&"-style sequences that String.replace would expand.
  const scripts = `<script>\n${runtimeJs.replace(/<\/script/gi, '<\\/script')}\n</script>\n<script type="module">\n${bundle.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  shell = shell.replace('<script type="module" src="/js/site.js"></script>', () => scripts);
  // Insert at the document's own </body> (the embedded runtime contains page templates with "</body>").
  const bodyEnd = shell.lastIndexOf('</body>');
  shell = `${shell.slice(0, bodyEnd)}<script type="application/octet-stream" id="route-video-data">${videoData}</script>\n${shell.slice(bodyEnd)}`;

  const file = join(OUT, 'confident-oral-care-preview.html');
  await writeFile(file, shell);
  console.log(`Single-file preview: ${file} (${(Buffer.byteLength(shell) / 1024 / 1024).toFixed(1)} MB)`);
}

await mkdir(OUT, { recursive: true });
await exportSite();
if (single) await exportSingle();

// Sanity check: every internal link in the Netlify folder resolves to a file or a rewrite.
const known = new Set([...routes.keys()]);
const missing = new Set();
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) {
      const html = await readFile(full, 'utf8');
      for (const [, p] of html.matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
        if (known.has(p)) continue;
        try { await readFile(join(SITE_DIR, p)); } catch { missing.add(p); }
      }
    }
  }
}
await walk(SITE_DIR);
if (missing.size) {
  console.error('Missing targets:', [...missing]);
  process.exit(1);
}
console.log('Link check: all internal links resolve.');
