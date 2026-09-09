/**
 * Parses the Vega's handoff pack into a structured catalogue dataset.
 *
 * The live site publishes each brand as a page whose body is a plain-text
 * table: an optional section heading ("BALL SOAP<TAB>SIZE"), then rows of
 * "PRODUCT NAME<TAB>SIZE". Layout varies per page, so the parser classifies
 * every line rather than assuming a fixed shape.
 *
 * Source of truth is the pack; output is data/catalog.json, which is committed
 * so the site builds without the pack present.
 *
 * Usage: node scripts/extract-catalog.mjs [--pack <dir>]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argPack = process.argv.indexOf('--pack');
const PACK = argPack > -1 ? process.argv[argPack + 1] : process.env.VEGAS_PACK;

if (!PACK || !existsSync(PACK)) {
  console.error('Handoff pack not found. Pass --pack <path to vegas_cc_pack> or set VEGAS_PACK.');
  process.exit(1);
}

const ref = (p) => join(PACK, 'reference', p);

/* ------------------------------------------------------------------ *
 * Taxonomy
 * ------------------------------------------------------------------ */

// The eight discovery categories. Categories with no published product rows
// still appear, backed by the company's published import list, and render an
// enquiry state rather than fabricated products.
const CATEGORIES = [
  { id: 'food-pantry', en: 'Food and pantry staples', es: 'Alimentos y básicos de despensa' },
  { id: 'snacks-confectionery', en: 'Snacks and confectionery', es: 'Snacks y confitería' },
  { id: 'beverages', en: 'Beverages and powdered drinks', es: 'Bebidas y refrescos en polvo' },
  { id: 'cleaning-household', en: 'Cleaning and household products', es: 'Limpieza y productos para el hogar' },
  { id: 'hotel-institutional', en: 'Hotel and institutional supplies', es: 'Suministros hoteleros e institucionales' },
  { id: 'construction', en: 'Construction-related products', es: 'Productos para construcción' },
  { id: 'wines-spirits', en: 'Wines and spirits', es: 'Vinos y licores' },
  { id: 'lubricants', en: 'Oils, coolants and lubricants', es: 'Aceites, refrigerantes y lubricantes' },
];

// Source section headings, as published, mapped to a discovery category.
const SECTION_TO_CATEGORY = {
  'BALL SOAP': 'cleaning-household',
  'BALL SOAPS': 'cleaning-household',
  'INSECTICIDE': 'cleaning-household',
  'INSECTICIDES': 'cleaning-household',
  'POWDERED DETERGENT': 'cleaning-household',
  'BROOMS': 'cleaning-household',
  'BLEACH': 'cleaning-household',
  'CHIPS': 'snacks-confectionery',
  'BISCUITS': 'snacks-confectionery',
  'SNACK MIX': 'snacks-confectionery',
  'CONFECTIONERY': 'snacks-confectionery',
  'CONFECTIONARY': 'snacks-confectionery',
  'CHOCOLATES': 'snacks-confectionery',
  'LIQUID CHOCOLATE': 'snacks-confectionery',
  'ICE CREAM CONES': 'snacks-confectionery',
  'CONES': 'snacks-confectionery',
  'JELLO': 'snacks-confectionery',
  'JUICE': 'beverages',
  'JUICES': 'beverages',
  'POWDERED DRINKS': 'beverages',
  'REFRIED BEANS': 'food-pantry',
  'COOKING OIL': 'food-pantry',
  'COOKING OILS': 'food-pantry',
  'SHORTENING': 'food-pantry',
  'MARGARINE': 'food-pantry',
  'PASTAS': 'food-pantry',
  'PASTA': 'food-pantry',
  'CEREALS': 'food-pantry',
  'CORN FLOUR': 'food-pantry',
  'PANCAKE MIX': 'food-pantry',
  'INSTANT SOUPS': 'food-pantry',
  'KETCHUP': 'food-pantry',
  'MAYONNAISE AND DRESSINGS': 'food-pantry',
  'SAUCES AND SEASONINGS': 'food-pantry',
  'SEASONING': 'food-pantry',
  'TOMATO SAUCE': 'food-pantry',
  'TOMATO PASTE': 'food-pantry',
  'PASTE': 'food-pantry',
  'IDEAL ESSENCE': 'food-pantry',
  'GARLIC': 'food-pantry',
  'TOILET PAPER AND NAPKINS': 'hotel-institutional',
};

// Generic headings that carry no category meaning.
const GENERIC_HEADINGS = new Set(['PRODUCTS', 'PRODUCT', 'SIZE', 'SIZES']);

/**
 * Fallback category per brand, used for rows published without a section
 * heading. Also the category shown on the brand card.
 * `sourceNote` records where the published heading disagrees with the products.
 */
const BRAND_META = {
  'Ambar': { category: 'cleaning-household' },
  'Bop': { category: 'cleaning-household' },
  'Cashitas': { category: 'snacks-confectionery' },
  'Castilla': { category: 'food-pantry' },
  'Diana': { category: 'snacks-confectionery' },
  'Ducal': { category: 'food-pantry' },
  'Ducal Juice': { category: 'beverages' },
  'Escocesa': { category: 'cleaning-household' },
  'Espumil': { category: 'cleaning-household' },
  'Favora': { category: 'food-pantry' },
  'FERRERO ROCHER': { category: 'snacks-confectionery' },
  'Fun C': { category: 'beverages' },
  'Gama': { category: 'snacks-confectionery' },
  'Gold Medal': { category: 'food-pantry' },
  'Granada': { category: 'snacks-confectionery' },
  'Guandy': { category: 'snacks-confectionery' },
  'Ina': { category: 'food-pantry' },
  'Kelloggs': { category: 'food-pantry' },
  'Kerns': { category: 'beverages' },
  'Kerns Jr': { category: 'beverages' },
  'KINDER SORPRESA': { category: 'snacks-confectionery' },
  'Laky': { category: 'food-pantry' },
  'Lucciola': { category: 'food-pantry' },
  'Melher': { category: 'snacks-confectionery' },
  'Naledo': { category: 'food-pantry' },
  "Natura's": { category: 'food-pantry' },
  'NUTELLA': { category: 'snacks-confectionery' },
  'Olmeca': { category: 'food-pantry' },
  'Oreo': { category: 'snacks-confectionery' },
  'Pringles': { category: 'snacks-confectionery' },
  'RAFFAELLO': { category: 'snacts-placeholder' },
  'Regia': { category: 'food-pantry' },
  'Tang': { category: 'beverages' },
  'TICTAC': { category: 'snacks-confectionery' },
  'Tropi-Kuhl': {
    category: 'beverages',
    // The published heading contradicts the items listed beneath it, so the
    // brand default wins for discovery and the heading is shown as published.
    ignoreSectionCategories: true,
    sourceNote: 'The published page heads this list "Seasoning" while the items listed are powdered drinks. Grouped under beverages for discovery; the published heading is retained below. Confirm with the business.',
  },
  'Ultraklin': { category: 'cleaning-household' },
  'Zafari': { category: 'snacks-confectionery' },
};
BRAND_META['RAFFAELLO'].category = 'snacks-confectionery';

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const clean = (s) => s.replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

const slugify = (s) =>
  clean(s)
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Cuts the page body away from site chrome above and below the product table. */
function isolateBody(text) {
  const start = text.indexOf('PRODUCT CATALOG');
  let body = start > -1 ? text.slice(start + 'PRODUCT CATALOG'.length) : text;
  const stops = ['\nPrev', '\nNext', '\nRelated', '\nOur Values', '\nContact Information', '\nContact ILB'];
  const cut = stops.map((s) => body.indexOf(s)).filter((i) => i > -1);
  if (cut.length) body = body.slice(0, Math.min(...cut));
  return body;
}

/** Brand names listed under "Related" on the source page. */
function relatedBrands(text, known) {
  const i = text.indexOf('\nRelated');
  if (i < 0) return [];
  let tail = text.slice(i + '\nRelated'.length);
  const end = tail.indexOf('\nOur Values');
  if (end > -1) tail = tail.slice(0, end);
  return tail
    .split('\n')
    .map(clean)
    .filter((l) => l && known.has(l));
}

/**
 * Classifies one line of the product table.
 * Returns {type:'heading'|'product'|'skip', ...}
 */
function classifyLine(rawLine) {
  const line = rawLine.replace(/ /g, ' ');
  if (!line.trim()) return { type: 'skip' };

  // Slider indices ("0","1","2"...) leak into the captured text.
  if (/^\s*\d\s*$/.test(line)) return { type: 'skip' };

  if (line.includes('\t')) {
    const [left, ...rest] = line.split('\t');
    const name = clean(left);
    const value = clean(rest.join(' '));
    if (!name) return { type: 'skip' };
    // "BALL SOAP<TAB>SIZE" and "Refried Beans<TAB>" are both headings.
    if (!value || GENERIC_HEADINGS.has(value.toUpperCase())) {
      return { type: 'heading', label: name };
    }
    return { type: 'product', name, size: value };
  }

  const name = clean(line);
  const upper = name.toUpperCase();
  if (GENERIC_HEADINGS.has(upper)) return { type: 'skip' };
  if (SECTION_TO_CATEGORY[upper]) return { type: 'heading', label: name };
  // No tab and not a known heading: a product published without a size.
  return { type: 'product', name, size: '' };
}

/* ------------------------------------------------------------------ *
 * Extraction
 * ------------------------------------------------------------------ */

const productPages = JSON.parse(readFileSync(ref('product-pages.json'), 'utf8'));
const assetCatalog = JSON.parse(readFileSync(ref('asset-catalog.json'), 'utf8'));

const assetByUrl = new Map(assetCatalog.map((a) => [a.sourceUrl, a]));
const assetByFileStem = new Map();
for (const a of assetCatalog) {
  const stem = basename(a.sourceUrl).replace(/\.[a-z]+$/i, '').toLowerCase();
  if (!assetByFileStem.has(stem)) assetByFileStem.set(stem, a);
}

const knownNames = new Set(productPages.products.map((p) => p.name));

/** Slider thumbnails carry the brand name as alt text; fall back to filename. */
function findLogo(brandName) {
  const bySliderAlt = assetCatalog.find(
    (a) => a.sourceUrl.includes('/cache/mod_bt_contentslider/') && a.alt === brandName
  );
  if (bySliderAlt) return bySliderAlt;
  const stem = brandName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const candidates = [`${stem}logo`, `${stem}logo2`, `${stem}`];
  for (const c of candidates) {
    const hit = assetByFileStem.get(c);
    if (hit) return hit;
  }
  return null;
}

const brands = [];
const warnings = [];

for (const page of productPages.products) {
  const meta = BRAND_META[page.name];
  if (!meta) {
    warnings.push(`No brand metadata for "${page.name}" — defaulting category to food-pantry.`);
  }
  const defaultCategory = meta?.category ?? 'food-pantry';

  // Sections: rows accumulate under the most recent heading.
  const sections = [];
  let current = null;
  const pushProduct = (p) => {
    if (!current) {
      current = { label: null, category: defaultCategory, products: [] };
      sections.push(current);
    }
    current.products.push(p);
  };

  for (const raw of isolateBody(page.text).split('\n')) {
    const c = classifyLine(raw);
    if (c.type === 'skip') continue;
    if (c.type === 'heading') {
      const mapped = meta?.ignoreSectionCategories
        ? null
        : SECTION_TO_CATEGORY[c.label.toUpperCase()];
      current = {
        label: c.label,
        category: mapped ?? defaultCategory,
        products: [],
      };
      sections.push(current);
      continue;
    }
    pushProduct({ name: c.name, size: c.size });
  }

  // Headings with no rows beneath them add nothing.
  const kept = sections.filter((s) => s.products.length);
  if (!kept.length) warnings.push(`No products parsed for "${page.name}".`);

  // Product photography: everything that is not the site logo or a slider thumb.
  const photos = page.images
    .filter((i) => !i.src.includes('/cache/') && !i.src.endsWith('/images/logo.png'))
    // Kellogg's publishes both full images and "_th" thumbnails of the same shot.
    .filter((i) => !/_th\.[a-z]+$/i.test(i.src))
    .map((i) => {
      const a = assetByUrl.get(i.src);
      return a
        ? { file: basename(a.localFile), width: a.width || null, height: a.height || null, alt: clean(i.alt || '') }
        : null;
    })
    .filter(Boolean);

  if (!photos.length) warnings.push(`No product photography for "${page.name}".`);

  const logo = findLogo(page.name);
  if (!logo) warnings.push(`No logo found for "${page.name}".`);

  const productCount = kept.reduce((n, s) => n + s.products.length, 0);

  brands.push({
    slug: slugify(page.name),
    name: page.name,
    division: 'vegas-distributors',
    category: defaultCategory,
    categories: [...new Set(kept.map((s) => s.category))],
    logo: logo ? { file: basename(logo.localFile), width: logo.width || null, height: logo.height || null } : null,
    photos,
    sections: kept,
    productCount,
    related: relatedBrands(page.text, knownNames).map(slugify),
    sourceUrl: page.url,
    sourceNote: meta?.sourceNote ?? null,
    // Nothing on the live site establishes that these listings are current.
    verification: 'published-online-unconfirmed',
  });
}

brands.sort((a, b) => a.name.localeCompare(b.name, 'en'));

const catalog = {
  generatedFrom: productPages.source ?? 'https://www.vegasdistributors.bz/',
  collectedAt: productPages.collectedAt ?? null,
  generatedAt: new Date().toISOString().slice(0, 10),
  verificationNote:
    'Every brand, product name and pack size below was published on the public Vega\'s Distributors website when the pack was collected. None has been confirmed as current by the business.',
  categories: CATEGORIES,
  brands,
  totals: {
    brands: brands.length,
    products: brands.reduce((n, b) => n + b.productCount, 0),
  },
};

writeFileSync(join(ROOT, 'data', 'catalog.json'), JSON.stringify(catalog, null, 2) + '\n');

console.log(`Brands: ${catalog.totals.brands}`);
console.log(`Products: ${catalog.totals.products}`);
console.log('Category spread:');
for (const c of CATEGORIES) {
  const n = brands.filter((b) => b.categories.includes(c.id)).length;
  console.log(`  ${c.id.padEnd(22)} ${String(n).padStart(2)} brands`);
}
if (warnings.length) {
  console.log('\nWarnings:');
  for (const w of warnings) console.log('  - ' + w);
}
