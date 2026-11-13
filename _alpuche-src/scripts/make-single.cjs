// Packs a --local build into ONE self-contained HTML file (all pages, CSS, fonts, images, JS)
// with hash routing, for viewing in a single-file viewer such as the Claude app's side panel.
//   node _alpuche-src/build.mjs --local
//   node _alpuche-src/scripts/make-single.cjs [localBuildDir] [out.html]
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', 'dist-local', 'jose-m-alpuche-preview'));
const OUT = path.resolve(process.argv[3] || path.join(__dirname, '..', 'dist-local', 'jose-m-alpuche-single-file-preview.html'));
const IMG = path.join(ROOT, 'assets', 'img');

// Collect pages: route → { title, html }
const pages = {};
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory() && e.name !== 'assets') walk(full);
    else if (e.name === 'index.html') {
      const rel = path.relative(ROOT, dir).split(path.sep).filter(Boolean);
      const route = '/' + rel.map((s) => s + '/').join('');
      pages[route] = fs.readFileSync(full, 'utf8');
    }
  }
})(ROOT);

const images = {};
function imageKey(file) {
  // Phone-sized WebP (1024 px wide at most) keeps the preview small enough to open as a page in the app.
  let candidate = file.replace(/-(640|1024|1280|1544|1600)\.(jpg|webp)$/, '-1024.webp');
  if (!fs.existsSync(path.join(IMG, candidate))) candidate = file.replace(/\.jpg$/, '.webp');
  if (!fs.existsSync(path.join(IMG, candidate))) candidate = file;
  if (!images[candidate]) {
    const type = candidate.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
    images[candidate] = `data:${type};base64,${fs.readFileSync(path.join(IMG, candidate)).toString('base64')}`;
  }
  return candidate;
}

function toHashRoute(href, fromRoute) {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return null;
  const u = new URL(href, 'http://local' + fromRoute);
  let route = u.pathname.replace(/index\.html$/, '');
  if (!route.endsWith('/')) route += '/';
  return '#' + route + u.search + (u.hash ? u.hash : '');
}

const out = {};
for (const [route, html] of Object.entries(pages)) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
  let body = html.slice(html.indexOf('<body>') + 6, html.indexOf('<!-- scripts -->'));
  body = body
    // Keep the phone/desktop switch for art-directed images (the nameplate): one embedded file per source.
    .replace(/<source media="([^"]+)"[^>]*?srcset="([^"]+)"[^>]*>/g, (m, media, set) => {
      if (!/type="image\/webp"/.test(m)) return '';
      const files = set.split(',').map((x) => x.trim().split(' ')[0].split('/').pop());
      return `<source media="${media}" data-srcset="${imageKey(files[0])}">`;
    })
    .replace(/<source (?![^>]*data-srcset)[^>]*>/g, '')
    .replace(/\s(srcset|sizes)="[^"]*"/g, '')
    .replace(/<source media="([^"]+)" data-srcset/g, '<source media="$1" data-srcset')
    .replace(/\ssrc="(?:\.\.\/)*assets\/img\/([^"]+)"/g, (_, f) => ` data-img="${imageKey(f)}"`)
    .replace(/\shref="([^"]+)"/g, (m, href) => {
      const h = toHashRoute(href.replace(/&amp;/g, '&'), route);
      return h ? ` href="${h.replace(/&/g, '&amp;')}"` : m;
    })
    // Links inside the assistant's JSON data (filled in by site.js) need the same conversion.
    .replace(/"href":"([^"]+)"/g, (m, href) => {
      const h = toHashRoute(href, route);
      return h ? `"href":"${h}"` : m;
    });
  out[route] = { title, body };
}

const homeStatic = out['/'].body.replace(/\sdata-img="([^"]+)"/g, (_, k) => ` src="${images[k]}"`);
const css = fs.readFileSync(path.join(ROOT, 'assets', 'css', 'site.css'), 'utf8');
const siteJs = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'site.js'), 'utf8');
const aiData = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'alpuche-ai-data.js'), 'utf8');
const aiEngine = fs.readFileSync(path.join(ROOT, 'assets', 'js', 'alpuche-ai.js'), 'utf8');
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const router = `
(function () {
  var pages = JSON.parse(document.getElementById('pages').textContent);
  var images = JSON.parse(document.getElementById('images').textContent);
  var app = document.getElementById('app');
  function initSite() {${siteJs}}
  var current = location.hash || '#/';
  function parse(hash) {
    var h = (hash || '#/').slice(1) || '/';
    var anchor = '';
    var i = h.indexOf('#');
    if (i >= 0) { anchor = h.slice(i + 1); h = h.slice(0, i); }
    var q = '';
    var j = h.indexOf('?');
    if (j >= 0) { q = h.slice(j); h = h.slice(0, j); }
    if (h.charAt(0) !== '/') return null; // plain in-page anchor
    if (h.slice(-1) !== '/') h += '/';
    return { route: h, query: q, anchor: anchor };
  }
  function render(hash) {
    current = hash || current;
    var r = parse(current);
    if (!r) return;
    var page = pages[r.route] || pages['/'];
    window.__routeQuery = r.query;
    window.__currentRoute = pages[r.route] ? r.route : '/';
    window.__linkMode = 'hash';
    app.innerHTML = page.body;
    app.querySelectorAll('source[data-srcset]').forEach(function (src) { src.srcset = images[src.getAttribute('data-srcset')]; });
    app.querySelectorAll('img[data-img]').forEach(function (img) { img.src = images[img.getAttribute('data-img')]; img.removeAttribute('loading'); });
    document.title = page.title.replace(/&amp;/g, '&');
    initSite();
    var target = r.anchor && document.getElementById(r.anchor);
    if (target) target.scrollIntoView({ behavior: 'instant' }); else window.scrollTo({ top: 0, behavior: 'instant' });
  }
  // In-page anchors (#how-we-can-help, #main) scroll without changing the route.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    // Consultation buttons open the Alpuche AI enquiry (handled in site.js) instead of navigating.
    if (a.hasAttribute('data-intake') && window.__alpucheEngine) return;
    var href = a.getAttribute('href');
    e.preventDefault();
    if (href.charAt(1) === '/') {
      // Route change: update the address when the viewer allows it, and render either way.
      try { history.pushState(null, '', href); } catch (err) { /* sandboxed viewers */ }
      render(href);
      return;
    }
    var el = document.getElementById(href.slice(1));
    if (el) { el.scrollIntoView({ behavior: 'instant' }); if (href === '#main') el.focus({ preventScroll: true }); }
  });
  window.addEventListener('hashchange', function () { if (location.hash !== current) render(location.hash); });
  window.addEventListener('popstate', function () { render(location.hash || '#/'); });
  render(current);
})();`;

const doc = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>José M. Alpuche · private single-file preview</title>
<style>${css}</style>
</head>
<body>
<div id="app">${homeStatic}</div>
<script type="application/json" id="pages">${json(out)}</script>
<script type="application/json" id="images">${json(images)}</script>
<script>${aiData.replace(/<\/script/gi, '<\\/script')}</script>
<script>${aiEngine.replace(/<\/script/gi, '<\\/script')}</script>
<script>${router}</script>
</body>
</html>
`;
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, doc);
console.log(`${Object.keys(out).length} pages, ${Object.keys(images).length} images → ${OUT} (${(doc.length / 1024).toFixed(0)} KB)`);
