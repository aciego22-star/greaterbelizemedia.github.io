/**
 * Builds a single self-contained HTML preview of the site for review.
 *
 * This is a review artifact, not the deployable website: it inlines a subset of
 * routes, their CSS, fonts and images into one file and swaps between them in
 * the page. The deployable output is dist/ and the Netlify ZIP.
 *
 * Usage: node scripts/preview.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
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

/**
 * Routes carried into the preview. Interactive views appear once so that the
 * element ids their scripts rely on stay unique in a single document.
 */
const VIEWS = [
  { id: 'home', path: '', label: 'Home' },
  { id: 'about', path: 'about', label: 'About' },
  { id: 'divisions', path: 'divisions', label: 'Divisions' },
  { id: 'industries', path: 'divisions/vegas-industries', label: "Vega's Industries" },
  { id: 'lubricants', path: 'divisions/international-lubricants-belize', label: 'Lubricants (ILB)' },
  { id: 'products', path: 'products', label: 'Products' },
  { id: 'brand', path: 'products/olmeca', label: 'Brand detail' },
  { id: 'network', path: 'sales-network', label: 'Sales Network' },
  { id: 'contact', path: 'contact', label: 'Contact' },
  { id: 'es-home', path: 'es', label: 'Inicio (ES)' },
];

const readPage = (path) => readFileSync(join(DIST, path, 'index.html'), 'utf8');

/* ------------------------------------------------------------------ *
 * Inline assets
 * ------------------------------------------------------------------ */

const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(join(DIST, file)).toString('base64')}`;

// Only the Latin subsets actually needed for this preview are carried.
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

const siteCss = readFileSync(join(DIST, 'assets/styles/site.css'), 'utf8');
const heroCss = readFileSync(join(DIST, 'assets/styles/hero.css'), 'utf8');

/* ------------------------------------------------------------------ *
 * Rewrite each view
 * ------------------------------------------------------------------ */

const imageCache = new Map();

/** Resolves a page-relative asset reference to a path inside dist/. */
const resolveAsset = (ref) => ref.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '');

function inlineImage(ref) {
  const file = resolveAsset(ref);
  if (imageCache.has(file)) return imageCache.get(file);
  const mime = file.endsWith('.webp') ? 'image/webp' : file.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const uri = existsSync(join(DIST, file)) ? dataUri(file, mime) : '';
  imageCache.set(file, uri);
  return uri;
}

/**
 * Collapses a responsive <picture> to a single inlined source.
 * Preview size matters more than art direction here, so the smallest
 * derivative that still reads well is used and srcset/sizes are dropped.
 */
function inlinePictures(html) {
  return html
    // Drop the webp <source> entirely; the <img> fallback carries the image.
    .replace(/<source[^>]*>/g, '')
    .replace(/<img([^>]*)>/g, (tag, attrsStr) => {
      const srcset = /srcset="([^"]*)"/.exec(attrsStr)?.[1];
      let chosen = /src="([^"]*)"/.exec(attrsStr)?.[1];

      if (srcset) {
        // Prefer a mid-size derivative over the largest available.
        const candidates = srcset.split(',').map((s) => {
          const [url, w] = s.trim().split(/\s+/);
          return { url, w: parseInt(w, 10) || 0 };
        });
        candidates.sort((a, b) => a.w - b.w);
        chosen = (candidates.find((c) => c.w >= 700) ?? candidates[candidates.length - 1]).url;
      }

      const cleaned = attrsStr
        .replace(/\ssrcset="[^"]*"/g, '')
        .replace(/\ssizes="[^"]*"/g, '')
        .replace(/\ssrc="[^"]*"/g, '');

      return `<img src="${inlineImage(chosen)}"${cleaned}>`;
    });
}

/** Turns internal links into in-page view switches, or disables them. */
function rewriteLinks(html) {
  return html.replace(/href="([^"]*)"/g, (whole, href) => {
    if (/^(https?:|mailto:|tel:|#|data:)/.test(href)) return whole;

    // Normalise a page-relative link ("./products/", "../../contact/") to a route.
    const path = href
      .replace(/^(?:\.\.\/)+/, '')
      .replace(/^\.\//, '')
      .split(/[?#]/)[0]
      .replace(/\/$/, '');

    const view = VIEWS.find((v) => v.path === path);
    if (view) return `href="#${view.id}" data-view="${view.id}"`;

    // A real route this preview does not carry. Marked rather than silently dead.
    return `href="#" data-missing="${path || 'home'}" title="/${path} is a separate page in the full build; this preview carries one brand page as a sample."`;
  });
}

const extractMain = (html) => /<main id="main">([\s\S]*?)<\/main>/.exec(html)[1];

const views = VIEWS.map((v) => {
  const html = readPage(v.path);
  const body = rewriteLinks(inlinePictures(extractMain(html)));
  return { ...v, body, lang: /<html lang="es"/.test(html) ? 'es' : 'en' };
});

// The masthead and footer are taken from the homepage and shared by every view.
const homeHtml = readPage('');
const chrome = (selector) => {
  const re = new RegExp(`<${selector}[\\s\\S]*?</${selector}>`);
  return rewriteLinks(inlinePictures(re.exec(homeHtml)[0]));
};

const masthead = chrome('header');
const footer = chrome('footer');
const conceptBar = rewriteLinks(inlinePictures(/<aside class="concept-bar"[\s\S]*?<\/aside>/.exec(homeHtml)[0]));

const siteJs = readFileSync(join(DIST, 'assets/js/site.js'), 'utf8');
const catalogJs = readFileSync(join(DIST, 'assets/js/catalog.js'), 'utf8');
const enquiryJs = readFileSync(join(DIST, 'assets/js/enquiry.js'), 'utf8');
const heroJs = readFileSync(join(DIST, 'assets/js/hero.js'), 'utf8');

/* ------------------------------------------------------------------ */

const nav = views
  .map((v) => `<button type="button" role="tab" data-view="${v.id}" aria-selected="${v.id === 'home'}">${v.label}</button>`)
  .join('');

const sections = views
  .map(
    (v) =>
      `<div class="preview-view" id="view-${v.id}" lang="${v.lang}"${v.id === 'home' ? '' : ' hidden'}>${v.body}</div>`
  )
  .join('');

const doc = `<title>Vega's Distributors Rebuild</title>
<style>
${fontCss}
${siteCss}
${heroCss}

/* The deployed site reveals sections on scroll. In a single-file review
   artifact that would leave the first frame and any thumbnail blank, so every
   section rests visible here. The effect itself is unchanged in dist/. */
.reveal, .reveal.is-armed { opacity: 1 !important; transform: none !important; }

/* Views are swapped in place, so a hero inside a hidden view must not claim
   viewport height or leave a gap. */
.preview-view[hidden] { display: none !important; }

/* The site commits to one light, warm-white identity taken from the brand
   guide, so it paints its own ground rather than borrowing the host theme. */
html, body { background: var(--surface); color: var(--ink); }

/* Preview chrome. Not part of the deployable site. */
.preview-bar {
  position: sticky; top: 0; z-index: 300;
  display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center;
  padding: 0.6rem clamp(0.75rem, 3vw, 1.5rem);
  background: #101010; border-bottom: 1px solid #2c2c2c;
}
.preview-bar strong {
  font-family: var(--display); color: #fff; font-size: 0.78rem;
  letter-spacing: 0.12em; text-transform: uppercase; margin-right: 0.6rem;
}
.preview-bar button {
  font: inherit; font-size: 0.85rem; font-weight: 500;
  color: #d4d1ca; background: transparent;
  border: 1px solid #3a3a3a; border-radius: 999px;
  padding: 0.35rem 0.8rem; min-height: 36px; cursor: pointer;
}
.preview-bar button:hover { border-color: #6a6a6a; color: #fff; }
.preview-bar button[aria-selected="true"] { background: var(--yellow); border-color: var(--yellow); color: #171717; font-weight: 600; }
.preview-bar button:focus-visible { outline: 3px solid var(--yellow); outline-offset: 2px; }
.preview-note {
  padding: 0.55rem clamp(0.75rem, 3vw, 1.5rem);
  background: var(--yellow-wash); border-bottom: 1px solid #f0dfa0;
  font-size: 0.82rem; color: var(--ink-soft);
}
</style>

<div class="preview-bar" role="tablist" aria-label="Preview pages"><strong>Preview</strong>${nav}</div>
<p class="preview-note"><strong>Review preview.</strong> A subset of routes bundled into one file for review. The deployable site is the Netlify build, where each of these is a separate URL. Links to routes not carried here are inert.</p>

${conceptBar}
${masthead}
<main id="main">${sections}</main>
${footer}

<script>
(function () {
  var views = document.querySelectorAll('.preview-view');
  var tabs = document.querySelectorAll('.preview-bar button');

  function show(id) {
    var found = false;
    Array.prototype.forEach.call(views, function (v) {
      var match = v.id === 'view-' + id;
      v.hidden = !match;
      if (match) found = true;
    });
    if (!found) return;
    Array.prototype.forEach.call(tabs, function (t) {
      t.setAttribute('aria-selected', String(t.getAttribute('data-view') === id));
    });
    document.documentElement.lang = document.getElementById('view-' + id).lang || 'en';
    // The header only floats over a hero on the two homepage views.
    var overHero = id === 'home' || id === 'es-home';
    document.body.classList.toggle('home', overHero);
    var mast = document.querySelector('.masthead');
    if (mast) mast.classList.toggle('masthead--over-hero', overHero);
    window.scrollTo(0, 0);
  }

  Array.prototype.forEach.call(tabs, function (t) {
    t.addEventListener('click', function () { show(t.getAttribute('data-view')); });
  });

  // Apply the opening view through the same path as a tab click, so the header
  // treatment and language are correct on first paint.
  show('home');

  // Links rewritten by the build carry the target view.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[data-view], a[data-missing]');
    if (!a) return;
    e.preventDefault();
    var v = a.getAttribute('data-view');
    if (v) { show(v); return; }

    // Explain rather than dead-end on a route the preview does not carry.
    var note = document.querySelector('.preview-note');
    note.dataset.original = note.dataset.original || note.innerHTML;
    note.innerHTML = '<strong>Not in this preview.</strong> /' + a.getAttribute('data-missing') +
      ' is a separate page in the full build. This preview carries one brand page as a sample.';
    clearTimeout(window.__noteTimer);
    window.__noteTimer = setTimeout(function () { note.innerHTML = note.dataset.original; }, 4000);
  });
})();
</script>
<script>${siteJs}</script>
<script>${catalogJs}</script>
<script>${enquiryJs}</script>
<script>${heroJs}</script>
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, doc);

console.log(`Views:  ${views.length}`);
console.log(`Images: ${imageCache.size} inlined`);
console.log(`Size:   ${(Buffer.byteLength(doc) / 1024 / 1024).toFixed(2)} MB`);
console.log(`Written: ${OUT}`);
