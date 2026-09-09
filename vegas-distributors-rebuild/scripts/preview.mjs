/**
 * Builds a single self-contained HTML file of the site for visual sign-off.
 *
 * It opens on the real Home page and carries the site's own navigation: the
 * internal links are rewritten to swap between the bundled pages in place.
 * There is no selector, banner or explanatory chrome of any kind.
 *
 * Usage: node scripts/preview.mjs
 */
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const OUT_DIR = join(ROOT, 'release');
const OUT = join(OUT_DIR, 'preview.html');

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('dist/ not built. Run `npm run build` first.');
  process.exit(1);
}

const catalog = JSON.parse(readFileSync(join(ROOT, 'data', 'catalog.json'), 'utf8'));

/** Home first: the file opens on it. */
const VIEWS = [
  { id: 'home', path: '' },
  { id: 'about', path: 'about' },
  { id: 'divisions', path: 'divisions' },
  { id: 'industries', path: 'divisions/vegas-industries' },
  { id: 'lubricants', path: 'divisions/international-lubricants-belize' },
  { id: 'brands', path: 'brands' },
  { id: 'wines', path: 'wines-and-spirits' },
  { id: 'whatsNew', path: 'whats-new' },
  { id: 'gallery', path: 'gallery' },
  { id: 'network', path: 'sales-network' },
  { id: 'contact', path: 'contact' },
  { id: 'es-home', path: 'es' },
  { id: 'es-about', path: 'es/about' },
  { id: 'es-divisions', path: 'es/divisions' },
  { id: 'es-industries', path: 'es/divisions/vegas-industries' },
  { id: 'es-lubricants', path: 'es/divisions/international-lubricants-belize' },
  { id: 'es-brands', path: 'es/brands' },
  { id: 'es-wines', path: 'es/vinos-y-licores' },
  { id: 'es-whatsNew', path: 'es/novedades' },
  { id: 'es-gallery', path: 'es/gallery' },
  { id: 'es-network', path: 'es/sales-network' },
  { id: 'es-contact', path: 'es/contact' },
  // Every brand detail page is carried, so nothing in the directory dead-ends.
  ...catalog.brands.map((b) => ({ id: `brand-${b.slug}`, path: `products/${b.slug}` })),
  ...catalog.brands.map((b) => ({ id: `es-brand-${b.slug}`, path: `es/products/${b.slug}` })),
];

/**
 * /products/ and /es/products/ are signposts that the host redirects to the
 * brand directory, so links to them are followed here the way a visitor would
 * experience them. The category query they carry is dropped, as the directory
 * opens on its full listing.
 */
const ALIASES = { products: 'brands', 'es/products': 'es-brands' };

const readPage = (path) => readFileSync(join(DIST, path, 'index.html'), 'utf8');
const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(join(DIST, file)).toString('base64')}`;

/* ------------------------------------------------------------------ *
 * Inline assets
 * ------------------------------------------------------------------ */

const FONTS = [
  ['Inter', 400, 'assets/fonts/inter-400-latin.woff2'],
  ['Inter', 500, 'assets/fonts/inter-500-latin.woff2'],
  ['Inter', 600, 'assets/fonts/inter-600-latin.woff2'],
  ['Inter', 700, 'assets/fonts/inter-700-latin.woff2'],
  ['Archivo', 600, 'assets/fonts/archivo-600-latin.woff2'],
  ['Archivo', 700, 'assets/fonts/archivo-700-latin.woff2'],
];

const fontCss = FONTS.map(
  ([family, weight, file]) =>
    `@font-face{font-family:'${family}';font-style:normal;font-weight:${weight};font-display:swap;` +
    `src:url(${dataUri(file, 'font/woff2')}) format('woff2');}`
).join('\n');

/* Read from what the build actually produced rather than from a list kept by
   hand. A stylesheet or a script added to a page but forgotten here left that
   part of the site dead in this file while working perfectly on the real one,
   which is a bug that looks exactly like a broken feature. */
const bundle = (dir, ext) =>
  readdirSync(join(DIST, 'assets', dir))
    .filter((f) => f.endsWith(ext))
    .sort()
    .map((f) => readFileSync(join(DIST, 'assets', dir, f), 'utf8'));

// fonts.css is replaced by the inlined faces above, so it is left out.
const css = readdirSync(join(DIST, 'assets', 'styles'))
  .filter((f) => f.endsWith('.css') && f !== 'fonts.css')
  .sort()
  .map((f) => readFileSync(join(DIST, 'assets', 'styles', f), 'utf8'))
  .join('\n');

const js = bundle('js', '.js');

const imageCache = new Map();
const resolveAsset = (ref) => ref.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');

function inlineImage(ref) {
  const file = resolveAsset(ref);
  if (imageCache.has(file)) return imageCache.get(file);
  const mime = file.endsWith('.webp') ? 'image/webp'
    : file.endsWith('.avif') ? 'image/avif'
    : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const uri = existsSync(join(DIST, file)) ? dataUri(file, mime) : '';
  imageCache.set(file, uri);
  return uri;
}

/** Picks the smallest derivative in a srcset that is still wide enough. */
function chooseFrom(srcset, target) {
  const candidates = srcset
    .split(',')
    .map((entry) => {
      const [url, w] = entry.trim().split(/\s+/);
      return { url, w: parseInt(w, 10) || 0 };
    })
    .sort((a, b) => a.w - b.w);
  return (candidates.find((c) => c.w >= target) ?? candidates[candidates.length - 1])?.url;
}

/**
 * Collapses a responsive <picture> to inlined sources.
 *
 * Weight matters more than art direction between widths of the same picture,
 * so a plain picture keeps one derivative. Art direction between different
 * pictures is not the same thing: the campaign artwork is supplied as a
 * landscape cut and a portrait cut, and dropping the portrait one would leave a
 * phone showing the landscape composition cropped to a slot it was never
 * composed for. So a source carrying a media query survives, one per query.
 */
function inlinePictures(html) {
  return html
    .replace(/<picture([^>]*)>([\s\S]*?)<\/picture>/g, (whole, attrs, inner) => {
      const kept = [];
      const seen = new Set();

      for (const [tag] of inner.matchAll(/<source[^>]*>/g)) {
        const media = /media="([^"]*)"/.exec(tag)?.[1];
        // WebP is carried rather than JPEG: it is a third of the weight and
        // every browser this file will be opened in decodes it, so the source
        // can keep its type attribute and still be certain to render.
        if (!media || seen.has(media) || !/type="image\/webp"/.test(tag)) continue;
        const srcset = /srcset="([^"]*)"/.exec(tag)?.[1];
        if (!srcset) continue;
        const chosen = chooseFrom(srcset, 720);
        if (!chosen) continue;
        seen.add(media);
        kept.push(`<source media="${media}" type="image/webp" srcset="${inlineImage(chosen)}">`);
      }

      return `<picture${attrs}>${kept.join('')}${inner.replace(/<source[^>]*>/g, '')}</picture>`;
    })
    .replace(/<img([^>]*)>/g, (tag, attrsStr) => {
      const srcset = /srcset="([^"]*)"/.exec(attrsStr)?.[1];
      let chosen = /src="([^"]*)"/.exec(attrsStr)?.[1];
      const isHero = /assets\/(?:heroes|campaign)\//.test(attrsStr);

      // An image already inlined by the pass above is left alone.
      if (chosen && chosen.startsWith('data:')) return tag;
      if (srcset) chosen = chooseFrom(srcset, isHero ? 960 : 800) ?? chosen;

      const cleaned = attrsStr
        .replace(/\ssrcset="[^"]*"/g, '')
        .replace(/\ssizes="[^"]*"/g, '')
        .replace(/\ssrc="[^"]*"/g, '');
      return `<img src="${inlineImage(chosen)}"${cleaned}>`;
    });
}

/**
 * The campaign film.
 *
 * Only the MP4 is carried. Both derivatives together would roughly double the
 * file for no benefit here: every browser this file will be opened in plays
 * H.264, and the WebM exists on the built site for the Chromium builds that
 * ship without it.
 */
function inlineVideo(html) {
  return html
    .replace(/<source[^>]*type="video\/webm"[^>]*>/g, '')
    .replace(/<source([^>]*)src="([^"]*\.mp4)"([^>]*)>/g, (whole, a, ref, b) => {
      const file = resolveAsset(ref);
      if (!existsSync(join(DIST, file))) return whole;
      return `<source${a}src="${dataUri(file, 'video/mp4')}"${b}>`;
    })
    .replace(/poster="([^"]*\.(?:jpg|png|webp))"/g, (whole, ref) => {
      const file = resolveAsset(ref);
      if (!existsSync(join(DIST, file))) return whole;
      return `poster="${inlineImage(ref)}"`;
    });
}

/** Internal links become in-page navigation between the bundled pages. */
function rewriteLinks(html) {
  return html.replace(/href="([^"]*)"/g, (whole, href) => {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) return whole;
    const path = href
      .replace(/^(?:\.\.\/)+/, '')
      .replace(/^\.\//, '')
      .split(/[?#]/)[0]
      .replace(/\/$/, '');
    const view = VIEWS.find((v) => v.path === path);
    if (view) return `href="#${view.id}" data-view="${view.id}"`;
    if (ALIASES[path]) return `href="#${ALIASES[path]}" data-view="${ALIASES[path]}"`;
    // Nothing should reach here; if it does, the link is inert rather than
    // sending the visitor somewhere they did not ask for.
    return 'href="#" data-inert';
  });
}

const extractMain = (html) => /<main id="main">([\s\S]*?)<\/main>/.exec(html)[1];

/**
 * The lightbox reads its images and brand links from a JSON payload rather
 * than from markup, so that payload needs the same treatment as the rest of
 * the page: images inlined, internal links turned into view switches.
 */
function rewritePayload(html) {
  return html.replace(
    /(<script type="application\/json" data-gallery-data>)([\s\S]*?)(<\/script>)/,
    (whole, open, json, close) => {
      let items;
      try { items = JSON.parse(json); } catch { return whole; }
      const rewritten = items.map((item) => {
        const path = String(item.href ?? '')
          .replace(/^(?:\.\.\/)+/, '')
          .replace(/^\.\//, '')
          .replace(/\/$/, '');
        const view = VIEWS.find((v) => v.path === path);
        return {
          ...item,
          src: inlineImage(item.src),
          href: view ? `#${view.id}` : null,
        };
      });
      return open + JSON.stringify(rewritten).replace(/</g, '\\u003c') + close;
    }
  );
}

/**
 * The review file is served under a policy that does not admit third-party
 * frames, so the map is shown as a static card here. The built site keeps the
 * real embed.
 */
function replaceFrames(html) {
  return html.replace(/<div class="map-frame">[\s\S]*?<\/div>/, () =>
    `<div class="map-frame map-frame--static">` +
    `<p><strong>Pedro Guerra Mena Street</strong><br>Benque Viejo Town, Cayo District, Belize</p>` +
    `</div>`
  );
}

const views = VIEWS.map((v) => {
  const html = readPage(v.path);
  return {
    ...v,
    body: replaceFrames(rewritePayload(rewriteLinks(inlinePictures(inlineVideo(extractMain(html)))))),
    lang: /<html lang="es"/.test(html) ? 'es' : 'en',
  };
});

// Header and footer come from the two homepages: the Spanish views need the
// Spanish chrome.
const chrome = (path, selector) => {
  const html = readPage(path);
  const re = new RegExp(`<${selector}[\\s\\S]*?</${selector}>`);
  return rewriteLinks(inlinePictures(re.exec(html)[0]));
};

const headerEn = chrome('', 'header');
// Both language headers live in one document here, so the second one's panel
// takes its own id. Two elements sharing an id is invalid, and it pointed the
// Spanish menu button's aria-controls at the English panel.
const headerEs = chrome('es', 'header')
  .replace(/id="masthead-panel"/g, 'id="masthead-panel-es"')
  .replace(/aria-controls="masthead-panel"/g, 'aria-controls="masthead-panel-es"');
const footerEn = chrome('', 'footer');
const footerEs = chrome('es', 'footer');

const sections = views
  .map((v) => `<div class="view" id="view-${v.id}" lang="${v.lang}"${v.id === 'home' ? '' : ' hidden'}>${v.body}</div>`)
  .join('');

const doc = `<title>Vega's Distributors</title>
<style>
${fontCss}
${css}

/* Only the visible page participates in layout. */
.view[hidden] { display: none !important; }

.map-frame--static {
  display: grid;
  place-items: center;
  text-align: center;
  aspect-ratio: 16 / 7;
  background:
    repeating-linear-gradient(-45deg, #f3f4f6, #f3f4f6 14px, #eceef1 14px, #eceef1 28px);
  color: var(--slate);
}
.map-frame--static p { margin: 0; font-size: 1rem; line-height: 1.6; }
.map-frame--static strong { color: var(--ink); font-family: var(--display); font-size: 1.1rem; }
</style>

<a class="skip-link" href="#main">Skip to main content</a>
<div data-chrome="en">${headerEn}</div>
<div data-chrome="es" hidden>${headerEs}</div>
<main id="main">${sections}</main>
<div data-footer="en">${footerEn}</div>
<div data-footer="es" hidden>${footerEs}</div>

<script>
(function () {
  var views = document.querySelectorAll('.view');
  var current = 'home';

  function show(id) {
    var target = document.getElementById('view-' + id);
    if (!target) return;
    current = id;
    Array.prototype.forEach.call(views, function (v) { v.hidden = v.id !== 'view-' + id; });

    var lang = target.lang || 'en';
    document.documentElement.lang = lang;
    document.querySelector('[data-chrome="en"]').hidden = lang !== 'en';
    document.querySelector('[data-chrome="es"]').hidden = lang !== 'es';
    document.querySelector('[data-footer="en"]').hidden = lang !== 'en';
    document.querySelector('[data-footer="es"]').hidden = lang !== 'es';

    // The header only floats over a hero on the two homepages.
    var overHero = id === 'home' || id === 'es-home';
    document.body.classList.toggle('home', overHero);
    Array.prototype.forEach.call(document.querySelectorAll('.masthead'), function (m) {
      m.classList.toggle('masthead--over-hero', overHero);
    });

    // Mark the current page in the navigation, as the built site does.
    var paths = { home: '', about: 'about', divisions: 'divisions', brands: 'brands',
      wines: 'wines-and-spirits', whatsNew: 'whats-new', gallery: 'gallery',
      network: 'sales-network', contact: 'contact' };
    var key = id.replace(/^es-/, '').replace(/^brand-.*$/, 'brands')
      .replace('industries', 'divisions').replace('lubricants', 'divisions')
      .replace('vinos-y-licores', 'wines').replace('novedades', 'whatsNew');
    Array.prototype.forEach.call(document.querySelectorAll('.nav-list a'), function (a) {
      var v = a.getAttribute('data-view') || '';
      var vk = v.replace(/^es-/, '');
      if (vk === key) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    // Views change in place here rather than by loading a document, so the
    // mobile menu is closed by hand the way a page load would have closed it.
    var toggle = document.querySelector('[data-chrome="' + lang + '"] .nav-toggle');
    var panel = document.querySelector('[data-chrome="' + lang + '"] .masthead__panel');
    if (toggle && panel && window.matchMedia('(max-width: 52rem)').matches) {
      toggle.setAttribute('aria-expanded', 'false');
      panel.hidden = true;
      var header = toggle.closest('.masthead');
      if (header) header.classList.remove('is-open');
    }

    window.scrollTo(0, 0);

    // The showcase measures itself against the viewport, and it measures as
    // zero while its page is hidden. Ask it to place its cards again now that
    // the page it lives on is on screen.
    window.dispatchEvent(new Event('resize'));
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-view], a[data-inert], a[href^="#"]');
    if (!a) return;
    // The lightbox rewrites its brand link's href as the visitor moves through
    // the images, so a resolvable hash is more current than any data-view the
    // markup was built with. In-page anchors, such as the skip control, resolve
    // to nothing here and are left alone.
    var href = a.getAttribute('href') || '';
    var hash = href.charAt(0) === '#' ? href.slice(1) : '';
    var v = hash && document.getElementById('view-' + hash) ? hash : a.getAttribute('data-view');
    if (!v) {
      if (!a.hasAttribute('data-inert')) return;
      e.preventDefault();
      return;
    }
    e.preventDefault();
    var box = a.closest('[data-lightbox]');
    if (box) { box.hidden = true; document.body.style.overflow = ''; }
    show(v);
  });

  show('home');
})();
</script>
${js.map((s) => `<script>${s}</script>`).join('\n')}
`;

/* ------------------------------------------------------------------ *
 * Deduplicate
 *
 * A brand logo or product photo appears on many of the bundled pages, and each
 * appearance was carrying its own copy of the bytes. One copy is enough: the
 * first use keeps the picture, later uses point back at it by index and are
 * filled in on load.
 * ------------------------------------------------------------------ */

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
const uris = new Map();

const deduped = doc.replace(
  /(src|poster)="(data:(image|video)\/[a-z0-9+.-]+;base64,[^"]+)"/g,
  (whole, attr, uri, kind) => {
    if (!uris.has(uri)) {
      uris.set(uri, uris.size);
      return `${whole} data-${kind === 'video' ? 'vid' : 'img'}="${uris.get(uri)}"`;
    }
    const ref = uris.get(uri);
    // A repeated picture stands on a blank pixel until it is filled in; a
    // repeated film stands on nothing, since an empty source is simply inert.
    return kind === 'video'
      ? `${attr}="" data-vid="${ref}"`
      : `${attr}="${BLANK}" data-img="${ref}"`;
  }
);

const expand =
  `<script>(function(){` +
  `var defs={};` +
  `var each=function(sel,fn){Array.prototype.forEach.call(document.querySelectorAll(sel),fn);};` +
  `var note=function(el,attr){` +
  `var k=el.getAttribute('data-img')||el.getAttribute('data-vid');` +
  `var v=el.getAttribute(attr);` +
  `if(k!==null&&v&&v.length>200&&defs[k]===undefined)defs[k]=v;};` +
  `each('img[data-img]',function(el){note(el,'src');});` +
  `each('video[data-img]',function(el){note(el,'poster');});` +
  `each('source[data-vid]',function(el){note(el,'src');});` +
  `each('img[data-img]',function(el){` +
  `var d=defs[el.getAttribute('data-img')];` +
  `if(d&&el.getAttribute('src')!==d)el.setAttribute('src',d);});` +
  `each('video[data-img]',function(el){` +
  `var d=defs[el.getAttribute('data-img')];` +
  `if(d&&el.getAttribute('poster')!==d)el.setAttribute('poster',d);});` +
  `each('source[data-vid]',function(el){` +
  `var d=defs[el.getAttribute('data-vid')];` +
  `if(d&&!el.getAttribute('src')){el.setAttribute('src',d);` +
  `var v=el.parentNode;if(v&&v.load)v.load();}});` +
  `})();</script>`;

const finalDoc = deduped + expand;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, finalDoc);

console.log(`Pages:  ${views.length}`);
console.log(`Images: ${imageCache.size} inlined`);
console.log(`Unique: ${uris.size} pictures`);
console.log(`Size:   ${(Buffer.byteLength(finalDoc) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Written: ${OUT}`);
