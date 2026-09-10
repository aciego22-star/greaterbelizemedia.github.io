/**
 * Builds the campaign artwork, the What's New card artwork, the homepage
 * product crop and the gallery media.
 *
 * Sources are committed under src/assets, so this runs without any handoff
 * pack. Manifests are written beside the data files it feeds.
 *
 * Format note: all of it is photographic. PNG at full width is roughly twenty
 * times the weight of JPEG for the same picture and adds no compatibility,
 * since every engine without WebP also lacks AVIF but reads JPEG, so JPEG is
 * the fallback everywhere.
 *
 * Usage: node scripts/optimize-media.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAMPAIGN_SRC = join(ROOT, 'src', 'assets', 'campaign-sources');
const FLYER_SRC = join(ROOT, 'src', 'assets', 'whats-new-sources');
const GALLERY_SRC = join(ROOT, 'src', 'assets', 'gallery-sources');
const PRODUCT_SRC = join(ROOT, 'src', 'assets', 'product-sources');
const ART_OUT = join(ROOT, 'src', 'assets', 'product-art');
const GALLERY_OUT = join(ROOT, 'src', 'assets', 'gallery');
const CAMPAIGN_OUT = join(ROOT, 'src', 'assets', 'campaign');
const FLYER_OUT = join(ROOT, 'src', 'assets', 'whats-new');

let bytes = 0;
const track = (p) => { bytes += statSync(p).size; };

/* ------------------------------------------------------------------ *
 * Hero backgrounds
 * ------------------------------------------------------------------ */

rmSync(ART_OUT, { recursive: true, force: true });
mkdirSync(ART_OUT, { recursive: true });
const productArt = {};

/* ------------------------------------------------------------------ *
 * Product artwork
 *
 * Supplied product photography shown beside copy on the homepage. These are
 * whole pictures, taken as given: nothing is cropped out of them.
 * ------------------------------------------------------------------ */

const PRODUCTS = [
  { id: 'bop-cans', file: 'bop-cans-product.jpg', widths: [360, 650] },
  // The promoted products turn on their own axis, so they are carried a little
  // larger than the box they sit in: the corners sweep past the edges mid turn.
  { id: 'promo-bop', file: 'promo-bop.png', widths: [420, 840] },
  { id: 'promo-aqua-max', file: 'promo-aqua-max.png', widths: [420, 840] },
  { id: 'promo-kelloggs', file: 'promo-kelloggs.png', widths: [420, 840] },
  { id: 'promo-ina', file: 'promo-ina.png', widths: [420, 840] },
  { id: 'promo-regia', file: 'promo-regia.png', widths: [420, 840] },
];

for (const item of PRODUCTS) {
  const file = join(PRODUCT_SRC, item.file);
  if (!existsSync(file)) { console.warn(`  missing product source: ${item.file}`); continue; }
  const meta = await sharp(file).metadata();
  const widths = [...new Set([...item.widths.filter((w) => w < meta.width), meta.width])];

  const entry = {
    base: 'assets/product-art',
    width: meta.width,
    height: meta.height,
    avif: [], webp: [], fallback: [],
  };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = () => sharp(file).resize({ width: w, withoutEnlargement: true });
    const jobs = [
      ['avif', `${item.id}-${w}.avif`, base().avif({ quality: 54, effort: 4 })],
      ['webp', `${item.id}-${w}.webp`, base().webp({ quality: 84, effort: 5 })],
      ['fallback', `${item.id}-${w}.jpg`, base().jpeg({ quality: 88, mozjpeg: true })],
    ];
    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(ART_OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      track(join(ART_OUT, name));
    }
  }

  productArt[item.id] = entry;
  console.log(`  art  ${item.id.padEnd(34)} ${meta.width}x${meta.height} -> ${widths.join(', ')}`);
}

writeFileSync(join(ROOT, 'data', 'product-art.json'), JSON.stringify(productArt, null, 2) + '\n');

/* ------------------------------------------------------------------ *
 * Campaign artwork
 *
 * Each campaign arrives as two finished compositions, one landscape and one
 * portrait. They are art direction, not one picture at two sizes, so each is
 * carried through the pipeline on its own and the markup picks between them by
 * media query rather than by srcset width.
 * ------------------------------------------------------------------ */

rmSync(CAMPAIGN_OUT, { recursive: true, force: true });
mkdirSync(CAMPAIGN_OUT, { recursive: true });

const CAMPAIGN_WIDTHS = { desktop: [960, 1280], mobile: [480, 720] };
const campaignArt = {};

for (const file of readdirSync(CAMPAIGN_SRC).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
  const id = basename(file).replace(/\.[a-z]+$/i, '');
  const orientation = /-mobile$/.test(id) ? 'mobile' : 'desktop';
  const src = join(CAMPAIGN_SRC, file);
  const meta = await sharp(src).metadata();
  const widths = [...new Set([...CAMPAIGN_WIDTHS[orientation].filter((w) => w < meta.width), meta.width])];

  const entry = {
    base: 'assets/campaign',
    orientation,
    width: meta.width,
    height: meta.height,
    avif: [], webp: [], fallback: [],
  };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    const small = w <= 720;
    const jobs = [
      ['avif', `${id}-${w}.avif`, base().avif({ quality: small ? 44 : 52, effort: 4 })],
      ['webp', `${id}-${w}.webp`, base().webp({ quality: small ? 68 : 76, effort: 5 })],
      ['fallback', `${id}-${w}.jpg`, base().jpeg({ quality: small ? 74 : 82, mozjpeg: true })],
    ];
    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(CAMPAIGN_OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      track(join(CAMPAIGN_OUT, name));
    }
  }

  campaignArt[id] = entry;
  console.log(`  campaign ${id.padEnd(30)} ${meta.width}x${meta.height} -> ${widths.join(', ')}`);
}

writeFileSync(join(ROOT, 'data', 'campaign-images.json'), JSON.stringify(campaignArt, null, 2) + '\n');

/* ------------------------------------------------------------------ *
 * What's New card artwork
 *
 * These are the client's own flyers, shown whole. They are portrait and dense
 * with small type, so the smallest step is still large enough to read the
 * headline before the visitor opens the card.
 * ------------------------------------------------------------------ */

rmSync(FLYER_OUT, { recursive: true, force: true });
mkdirSync(FLYER_OUT, { recursive: true });

const FLYER_WIDTHS = [420, 840];
const flyers = {};

for (const file of readdirSync(FLYER_SRC).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
  const id = basename(file).replace(/\.[a-z]+$/i, '');
  const src = join(FLYER_SRC, file);
  const meta = await sharp(src).metadata();
  const widths = [...new Set([...FLYER_WIDTHS.filter((w) => w < meta.width), meta.width])];

  const entry = { base: 'assets/whats-new', width: meta.width, height: meta.height, avif: [], webp: [], fallback: [] };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    const jobs = [
      ['avif', `${id}-${w}.avif`, base().avif({ quality: 50, effort: 4 })],
      ['webp', `${id}-${w}.webp`, base().webp({ quality: 78, effort: 5 })],
      ['fallback', `${id}-${w}.jpg`, base().jpeg({ quality: 84, mozjpeg: true })],
    ];
    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(FLYER_OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      track(join(FLYER_OUT, name));
    }
  }

  flyers[id] = entry;
  console.log(`  flyer ${id.padEnd(33)} ${meta.width}x${meta.height} -> ${widths.join(', ')}`);
}

writeFileSync(join(ROOT, 'data', 'whats-new-images.json'), JSON.stringify(flyers, null, 2) + '\n');

/* ------------------------------------------------------------------ *
 * Gallery media
 * ------------------------------------------------------------------ */

rmSync(GALLERY_OUT, { recursive: true, force: true });
mkdirSync(GALLERY_OUT, { recursive: true });

const manifest = JSON.parse(readFileSync(join(ROOT, 'data', 'gallery.json'), 'utf8'));
const GALLERY_WIDTHS = [400, 800, 1200];
const images = {};

for (const item of manifest.items) {
  const src = join(GALLERY_SRC, item.file);
  if (!existsSync(src)) { console.warn(`  missing gallery source: ${item.file}`); continue; }
  const meta = await sharp(src).metadata();
  const widths = [...new Set(GALLERY_WIDTHS.filter((w) => w < meta.width).concat(meta.width))];

  const entry = { base: 'assets/gallery', width: meta.width, height: meta.height, avif: [], webp: [], fallback: [] };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    const jobs = [
      ['avif', `${item.id}-${w}.avif`, base().avif({ quality: 52, effort: 4 })],
      ['webp', `${item.id}-${w}.webp`, base().webp({ quality: 78, effort: 5 })],
      ['fallback', `${item.id}-${w}.jpg`, base().jpeg({ quality: 82, mozjpeg: true })],
    ];
    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(GALLERY_OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      track(join(GALLERY_OUT, name));
    }
  }
  images[item.id] = entry;
}

writeFileSync(join(ROOT, 'data', 'gallery-images.json'), JSON.stringify(images, null, 2) + '\n');

console.log(`\nProduct art: ${Object.keys(productArt).length}  Campaign: ${Object.keys(campaignArt).length}` +
  `  Flyers: ${Object.keys(flyers).length}  Gallery: ${Object.keys(images).length}`);
console.log(`Total output: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
