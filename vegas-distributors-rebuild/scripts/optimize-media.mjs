/**
 * Builds the campaign hero backgrounds and the gallery media.
 *
 * Sources are committed under src/assets, so this runs without any handoff
 * pack. Manifests are written to data/heroes.json and data/gallery-images.json.
 *
 * Format note: the hero backgrounds are photographic. PNG at 1440px is roughly
 * twenty times the weight of JPEG for the same picture and adds no
 * compatibility, since every engine without WebP also lacks AVIF but reads
 * JPEG, so JPEG is the fallback. Gallery media follows the same reasoning.
 *
 * Usage: node scripts/optimize-media.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const HERO_SRC = join(ROOT, 'src', 'assets', 'hero-sources');
const GALLERY_SRC = join(ROOT, 'src', 'assets', 'gallery-sources');
const PRODUCT_SRC = join(ROOT, 'src', 'assets', 'product-sources');
const HERO_OUT = join(ROOT, 'src', 'assets', 'heroes');
const GALLERY_OUT = join(ROOT, 'src', 'assets', 'gallery');

let bytes = 0;
const track = (p) => { bytes += statSync(p).size; };

/* ------------------------------------------------------------------ *
 * Hero backgrounds
 * ------------------------------------------------------------------ */

rmSync(HERO_OUT, { recursive: true, force: true });
mkdirSync(HERO_OUT, { recursive: true });

const HERO_WIDTHS = [640, 960, 1440];
const heroes = {};

for (const file of readdirSync(HERO_SRC).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
  const id = basename(file).replace(/\.[a-z]+$/i, '');
  const src = join(HERO_SRC, file);
  const meta = await sharp(src).metadata();
  const widths = [...new Set([...HERO_WIDTHS.filter((w) => w < meta.width), meta.width])];

  const entry = { width: meta.width, height: meta.height, avif: [], webp: [], fallback: [] };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = () => sharp(src).resize({ width: w, withoutEnlargement: true });
    // The smallest step is the phone's first paint, so it is compressed harder.
    const small = w <= 640;

    const jobs = [
      ['avif', `${id}-${w}.avif`, base().avif({ quality: small ? 42 : 50, effort: 4 })],
      ['webp', `${id}-${w}.webp`, base().webp({ quality: small ? 66 : 74, effort: 5 })],
      ['fallback', `${id}-${w}.jpg`, base().jpeg({ quality: small ? 72 : 80, mozjpeg: true })],
    ];
    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(HERO_OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      track(join(HERO_OUT, name));
    }
  }

  heroes[id] = entry;
  console.log(`  hero ${id.padEnd(34)} ${meta.width}x${meta.height} -> ${widths.join(', ')}`);
}

/* Product artwork layered onto the stage backgrounds. */
const CROPS = [
  { id: 'bop-cans', file: 'bop-banner.jpg', widthRatio: 0.5, widths: [375, 750] },
];

for (const crop of CROPS) {
  const file = join(PRODUCT_SRC, crop.file);
  if (!existsSync(file)) { console.warn(`  missing product source: ${crop.file}`); continue; }
  const meta = await sharp(file).metadata();
  const cropWidth = Math.round(meta.width * crop.widthRatio);
  const entry = { base: 'assets/heroes', width: cropWidth, height: meta.height, webp: [], fallback: [] };

  for (const w of crop.widths.filter((w) => w <= cropWidth)) {
    const h = Math.round((meta.height / cropWidth) * w);
    const base = () =>
      sharp(file).extract({ left: 0, top: 0, width: cropWidth, height: meta.height })
        .resize({ width: w, withoutEnlargement: true });
    await base().webp({ quality: 82, effort: 5 }).toFile(join(HERO_OUT, `${crop.id}-${w}.webp`));
    await base().jpeg({ quality: 88, mozjpeg: true }).toFile(join(HERO_OUT, `${crop.id}-${w}.jpg`));
    entry.webp.push({ file: `${crop.id}-${w}.webp`, width: w, height: h });
    entry.fallback.push({ file: `${crop.id}-${w}.jpg`, width: w, height: h });
    track(join(HERO_OUT, `${crop.id}-${w}.webp`));
    track(join(HERO_OUT, `${crop.id}-${w}.jpg`));
  }
  heroes[crop.id] = entry;
  console.log(`  art  ${crop.id.padEnd(34)} cropped to ${cropWidth}x${meta.height}`);
}

writeFileSync(join(ROOT, 'data', 'heroes.json'), JSON.stringify(heroes, null, 2) + '\n');

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

console.log(`\nHeroes: ${Object.keys(heroes).length}  Gallery: ${Object.keys(images).length}`);
console.log(`Total output: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
