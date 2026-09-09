/**
 * Static QA over the built output: link integrity, metadata, headings,
 * image attributes and locale completeness.
 *
 * Usage: node scripts/check.mjs
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

const problems = [];
const warnings = [];
const fail = (page, msg) => problems.push(`${page}: ${msg}`);
const warn = (page, msg) => warnings.push(`${page}: ${msg}`);

/** Turns the handful of entities this build emits back into their characters. */
const decodeEntities = (str) =>
  str
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

/** Every .html file in the output. */
const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });

const pages = walk(DIST);
const titles = new Map();
const descriptions = new Map();
const localeOf = (rel) => (rel.startsWith('es/') ? 'es' : 'en');

const attr = (tag, name) => {
  const m = new RegExp(`${name}="([^"]*)"`).exec(tag);
  return m ? m[1] : null;
};

for (const file of pages) {
  const rel = relative(DIST, file);
  const html = readFileSync(file, 'utf8');

  /* --- Metadata ------------------------------------------------- */

  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  if (!title) fail(rel, 'missing <title>');
  else {
    // Measure what a reader sees, not the markup: an escaped apostrophe is one
    // character on the page and five in the source.
    const shown = decodeEntities(title);
    if (shown.length > 70) warn(rel, `title is ${shown.length} characters`);
    const tk = `${localeOf(rel)}::${title}`;
    titles.set(tk, [...(titles.get(tk) ?? []), rel]);
  }

  const descTag = /<meta name="description"[^>]*>/.exec(html)?.[0];
  const desc = descTag && attr(descTag, 'content');
  if (!desc) fail(rel, 'missing meta description');
  else {
    if (desc.length > 165) warn(rel, `meta description is ${desc.length} characters`);
    const dk = `${localeOf(rel)}::${desc}`;
    descriptions.set(dk, [...(descriptions.get(dk) ?? []), rel]);
  }

  if (!/<link rel="canonical"/.test(html)) fail(rel, 'missing canonical');
  if (!/<html lang="(en|es)"/.test(html)) fail(rel, 'missing or unexpected html lang');
  if (!/rel="alternate" hreflang="es"/.test(html)) fail(rel, 'missing hreflang alternates');
  if (!/<meta property="og:title"/.test(html)) fail(rel, 'missing Open Graph title');

  /* --- Headings -------------------------------------------------- */

  const h1s = html.match(/<h1[\s>]/g) ?? [];
  if (h1s.length !== 1) fail(rel, `expected exactly one h1, found ${h1s.length}`);

  const levels = [...html.matchAll(/<h([1-4])[\s>]/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      warn(rel, `heading jumps from h${levels[i - 1]} to h${levels[i]}`);
      break;
    }
  }

  /* --- Landmarks and skip link ----------------------------------- */

  if (!/<main id="main">/.test(html)) fail(rel, 'missing <main id="main">');
  if (!/class="skip-link"/.test(html)) fail(rel, 'missing skip link');
  if (!/<footer/.test(html)) fail(rel, 'missing footer landmark');

  /* --- Images ---------------------------------------------------- */

  for (const tag of html.match(/<img[^>]*>/g) ?? []) {
    if (!/\salt="/.test(tag)) fail(rel, `img without alt: ${tag.slice(0, 90)}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag)) {
      fail(rel, `img without intrinsic dimensions: ${tag.slice(0, 90)}`);
    }
    if (!/\sloading="/.test(tag)) warn(rel, `img without loading hint: ${tag.slice(0, 70)}`);
  }

  /* --- Links ----------------------------------------------------- */

  for (const tag of html.match(/<a\s[^>]*>/g) ?? []) {
    const href = attr(tag, 'href');
    if (href === null) { fail(rel, `anchor without href: ${tag.slice(0, 70)}`); continue; }

    if (href === '#') {
      // The current-language control is inert by design; anything else is a stub.
      if (!/aria-current="true"/.test(tag)) fail(rel, `placeholder "#" link: ${tag.slice(0, 90)}`);
      continue;
    }
    if (href.startsWith('mailto:')) {
      if (!/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/.test(href)) fail(rel, `malformed mailto: ${href}`);
      continue;
    }
    if (href.startsWith('tel:')) {
      if (!/^tel:\+?\d{6,}$/.test(href)) fail(rel, `malformed tel: ${href}`);
      continue;
    }
    if (/^(https?:)?\/\//.test(href)) continue;

    // Resolve a relative internal link against this page's directory.
    const [path] = href.split(/[?#]/);
    if (!path) continue;
    const target = resolve(dirname(file), path);
    const candidates = [target, join(target, 'index.html')];
    if (!candidates.some((c) => existsSync(c) && statSync(c).isFile())) {
      fail(rel, `broken internal link: ${href}`);
    }
  }

  /* --- Referenced assets ----------------------------------------- */

  for (const m of html.matchAll(/(?:src|href)="((?:\.\.?\/)[^"]+\.(?:css|js|png|jpg|webp|woff2))"/g)) {
    const target = resolve(dirname(file), m[1]);
    if (!existsSync(target)) fail(rel, `missing asset: ${m[1]}`);
  }

  /* --- Locale completeness --------------------------------------- */

  if (rel.startsWith('es/')) {
    // Interface chrome that must never remain in English on a Spanish page.
    for (const leak of ['>Sales Network<', '>Request a Quote<', '>Find a Representative<', '>Contact<', '>Products<']) {
      if (html.includes(leak)) fail(rel, `untranslated interface string ${leak}`);
    }
  }
}

/* --- Cross-page uniqueness -------------------------------------- */

for (const [key, where] of titles) {
  if (where.length > 1) fail('site', `duplicate title "${key.slice(4)}" on ${where.join(', ')}`);
}
for (const [, where] of descriptions) {
  if (where.length > 1) fail('site', `duplicate meta description on ${where.join(', ')}`);
}

/* --- Required files --------------------------------------------- */

for (const f of ['index.html', '404.html', 'sitemap.xml', 'robots.txt', 'netlify.toml', '_headers']) {
  if (!existsSync(join(DIST, f))) fail('site', `missing ${f}`);
}

/* --- Report ------------------------------------------------------ */

console.log(`Checked ${pages.length} pages.`);
if (warnings.length) {
  console.log(`\nWarnings (${warnings.length}):`);
  for (const w of warnings.slice(0, 25)) console.log('  - ' + w);
  if (warnings.length > 25) console.log(`  ... ${warnings.length - 25} more`);
}
if (problems.length) {
  console.log(`\nProblems (${problems.length}):`);
  for (const p of problems.slice(0, 40)) console.log('  - ' + p);
  if (problems.length > 40) console.log(`  ... ${problems.length - 40} more`);
  process.exit(1);
}
console.log('\nNo problems found.');
