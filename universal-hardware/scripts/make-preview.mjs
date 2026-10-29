// Converts the production build (dist/) into a private preview artifact copy
// (.preview/) without changing the design or behaviour. The artifact host
// differs from Netlify in a few ways, so this script only adapts plumbing:
//
//  - The artifact's main page is wrapped in the host's own document shell, so
//    index.html is emitted as head + body content without <html>/<head>/<body>.
//  - Pages are served from a sub-path, so root-absolute URLs ("/products/")
//    become relative ones ("../products/index.html") in HTML attributes, island
//    loader URLs and the Vite preload helper. Links that islands create at
//    runtime are rewritten by a small injected script.
//  - Font files are inlined as data URIs (the host's CSP only trusts inline or
//    Google-hosted fonts).
//  - Netlify-only files (_headers, robots, manifest, icons) are left out.
//  - The host reserves names starting with "_", so _assets/ becomes assets/.
//
// Usage: npm run build && node scripts/make-preview.mjs
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const out = path.resolve('.preview');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

const walk = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));

const fontData = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(dist, 'fonts', f)).toString('base64')}`;
const FONTS = {
  '/fonts/archivo-var.woff2': fontData('archivo-var.woff2'),
  '/fonts/inter-var.woff2': fontData('inter-var.woff2'),
  '/fonts/jetbrains-mono-500.woff2': fontData('jetbrains-mono-500.woff2'),
};

/** Root-absolute URL → path relative to a page `depth` folders below the root. */
function toRel(url, depth) {
  if (!url.startsWith('/') || url.startsWith('//')) return url;
  const m = url.match(/^([^?#]*)(\?[^#]*)?(#.*)?$/);
  let p = m[1];
  const rest = (m[2] || '') + (m[3] || '');
  if (p.endsWith('/')) p += 'index.html';
  else if (!/\.[a-z0-9]+$/i.test(p.split('/').pop())) p += '/index.html';
  return '../'.repeat(depth) + p.slice(1) + rest;
}

// Injected first on every page: rewrites links that islands render later.
const runtime = (depth) => `<script>
(function () {
  var up = ${JSON.stringify('../'.repeat(depth))};
  var root = document.documentElement;
  if (!root.lang) root.lang = 'en';
  root.setAttribute('data-root', up); // read by assetUrl() in islands
  function rel(u) {
    if (!u || u.charAt(0) !== '/' || u.charAt(1) === '/') return u;
    var m = u.match(/^([^?#]*)(\\?[^#]*)?(#.*)?$/), p = m[1];
    if (p.slice(-1) === '/') p += 'index.html';
    else if (!/\\.[a-z0-9]+$/i.test(p.split('/').pop())) p += '/index.html';
    return up + p.slice(1) + (m[2] || '') + (m[3] || '');
  }
  var SEL = 'a[href^="/"], form[action^="/"], img[src^="/"], img[srcset^="/"], source[srcset^="/"]';
  function fix(el) {
    if (el.nodeType !== 1) return;
    var list = el.matches && el.matches(SEL) ? [el] : [];
    if (el.querySelectorAll) list = list.concat([].slice.call(el.querySelectorAll(SEL)));
    list.forEach(function (n) {
      ['href', 'action', 'src'].forEach(function (a) {
        var v = n.getAttribute(a);
        if (v && v.charAt(0) === '/' && v.charAt(1) !== '/') n.setAttribute(a, rel(v));
      });
      var ss = n.getAttribute('srcset');
      if (ss && ss.charAt(0) === '/') n.setAttribute('srcset', ss.split(',').map(function (c) { var p = c.trim().split(/\s+/); p[0] = rel(p[0]); return p.join(' '); }).join(', '));
    });
  }
  new MutationObserver(function (records) {
    records.forEach(function (r) {
      if (r.type === 'attributes') fix(r.target);
      else r.addedNodes.forEach(fix);
    });
  }).observe(root, { subtree: true, childList: true, attributes: true, attributeFilter: ['href', 'action', 'src', 'srcset'] });
  document.addEventListener('DOMContentLoaded', function () { fix(document.body); });
})();
</script>
<style>
  /* Artifact host: keep the sticky header clear of phone system bars. */
  .site-header { top: env(safe-area-inset-top, 0px); }
  body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 60; background: #fff; }
</style>`;

function transformHtml(html, depth, isMain) {
  // Netlify-only head tags.
  html = html
    .replace(/<link rel="preload" href="\/fonts\/[^"]+"[^>]*>/g, '')
    .replace(/<link rel="(icon|apple-touch-icon|manifest|canonical)"[^>]*>/g, '')
    .replace(/<meta property="og:[^"]+" content="[^"]*"\s*\/?>/g, '');
  // Inline fonts.
  for (const [k, v] of Object.entries(FONTS)) html = html.split(`url(${k})`).join(`url(${v})`).split(`url('${k}')`).join(`url('${v}')`).split(`url("${k}")`).join(`url("${v}")`);
  // Asset root for islands (see src/lib/asset-url.ts).
  html = html.replace('data-root="/"', `data-root="${'../'.repeat(depth)}"`);
  // Root-absolute attribute values.
  html = html.replace(/\b(href|src|component-url|renderer-url|before-hydration-url|action|poster)="(\/[^"]*)"/g, (_, a, u) => `${a}="${toRel(u, depth)}"`);
  html = html.replace(/\bsrcset="([^"]*)"/g, (_, v) =>
    `srcset="${v.split(',').map((c) => { const [u, ...d] = c.trim().split(/\s+/); return [toRel(u, depth), ...d].join(' '); }).join(', ')}"`,
  );
  // Remaining CSS url(/...) references.
  html = html.replace(/url\((['"]?)(\/[^)'"]+)\1\)/g, (_, q, u) => `url(${q}${toRel(u, depth)}${q})`);
  // Preview runtime goes first in <head>.
  html = html.replace(/<head>/, `<head>${runtime(depth)}`);
  if (isMain) {
    // The host supplies doctype, html, head, body, charset and viewport.
    html = html
      .replace(/<!doctype html>/i, '')
      .replace(/<html[^>]*>/i, '')
      .replace(/<\/html>\s*$/i, '')
      .replace(/<head>/i, '')
      .replace(/<\/head>/i, '')
      .replace(/<body[^>]*>/i, '')
      .replace(/<\/body>/i, '')
      .replace(/<meta charset="utf-8"\s*\/?>/i, '')
      .replace(/<meta name="viewport"[^>]*>/i, '')
      .replace(/<title>[^<]*<\/title>/, '<title>Universal Hardware Concept</title>');
    // Title first so the host finds it in the first 8KB.
    const t = html.match(/<title>[^<]*<\/title>/)[0];
    html = t + '\n' + html.replace(t, '');
  }
  return html;
}

const files = [];
for (const f of walk(dist)) {
  const srcRel = path.relative(dist, f).split(path.sep).join('/');
  const rel = srcRel.replace(/^_assets\//, 'assets/');
  if (/^(_headers|robots\.txt|site\.webmanifest|favicon.*|apple-touch-icon\.png|icon-\d+\.png|og-concept\.jpg)$/.test(rel)) continue;
  if (rel.startsWith('fonts/')) continue; // inlined
  const dest = path.join(out, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (rel.endsWith('.html')) {
    const depth = rel.split('/').length - 1;
    fs.writeFileSync(dest, transformHtml(fs.readFileSync(f, 'utf8').split('/_assets/').join('/assets/'), depth, rel === 'index.html'));
  } else if (rel.endsWith('.js')) {
    let js = fs.readFileSync(f, 'utf8').split('_assets/').join('assets/');
    if (rel.includes('preload-helper')) {
      const before = js;
      js = js.replace('t=function(e){return`/`+e}', 't=function(e){return new URL(`../`+e,import.meta.url).href}');
      if (js === before) throw new Error('preload helper pattern not found — update make-preview.mjs');
    }
    fs.writeFileSync(dest, js);
  } else {
    fs.copyFileSync(f, dest);
  }
  if (rel !== 'index.html') files.push(rel);
}

// Sanity checks: no root-absolute references left in static HTML attributes.
const leftovers = [];
for (const f of walk(out).filter((x) => x.endsWith('.html'))) {
  const s = fs.readFileSync(f, 'utf8');
  const m = s.match(/\b(href|src|srcset|component-url|renderer-url|action)="\/(?!\/)[^"]*"/g);
  if (m) leftovers.push(`${path.relative(out, f)}: ${m.slice(0, 3).join(' ')}`);
}
if (leftovers.length) {
  console.error('Root-absolute references remain:\n  ' + leftovers.join('\n  '));
  process.exit(1);
}

const manifest = Object.fromEntries(
  files.sort().map((p) => [p, p.endsWith('.avif') ? { from: path.join(out, p), contentType: 'image/avif' } : path.join(out, p)]),
);
fs.writeFileSync(path.join(path.resolve('.cache'), 'preview-files.json'), JSON.stringify(manifest, null, 2));
const size = walk(out).reduce((n, f) => n + fs.statSync(f).size, 0);
console.log(`Preview ready in .preview/ — main page + ${files.length} files, ${(size / 1048576).toFixed(1)} MB. File map: .cache/preview-files.json`);
