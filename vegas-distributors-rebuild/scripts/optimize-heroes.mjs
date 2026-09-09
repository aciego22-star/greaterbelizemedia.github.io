/**
 * Builds the responsive campaign hero backgrounds.
 *
 * Sources live in src/assets/hero-sources (committed), so this runs without the
 * original handoff pack. Output goes to src/assets/heroes and the manifest is
 * written to data/heroes.json.
 *
 * Format note: the visual-reset brief asks for AVIF and WebP with a PNG
 * fallback. These backgrounds are photographic, where PNG is 20x the weight of
 * JPEG at the same width (2169 KB vs 103 KB at 1440px) and buys no
 * compatibility: every browser without WebP also lacks AVIF but reads JPEG.
 * The fallback is therefore JPEG, and the deviation is reported.
 *
 * Width note: the sources are 1672px wide. Widths above that would be upscaled
 * pixels, so the ladder tops out at native and 1920px viewports are served the
 * 1672px file rather than a padded 1920px one.
 *
 * Usage: node scripts/optimize-heroes.mjs
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(ROOT, 'src', 'assets', 'hero-sources');
const PRODUCT_SRC = join(ROOT, 'src', 'assets', 'product-sources');
const OUT = join(ROOT, 'src', 'assets', 'heroes');

if (!existsSync(SRC)) {
  console.error('src/assets/hero-sources not found.');
  process.exit(1);
}

const WIDTHS = [640, 960, 1440, 1672];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const manifest = {};
let bytes = 0;

for (const file of readdirSync(SRC).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort()) {
  const id = basename(file).replace(/\.[a-z]+$/i, '');
  const meta = await sharp(join(SRC, file)).metadata();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.includes(meta.width)) widths.push(meta.width);

  const entry = { width: meta.width, height: meta.height, avif: [], webp: [], fallback: [] };

  for (const w of widths) {
    const h = Math.round((meta.height / meta.width) * w);
    const base = sharp(join(SRC, file)).resize({ width: w, withoutEnlargement: true });

    const jobs = [
      ['avif', `${id}-${w}.avif`, base.clone().avif({ quality: 50, effort: 4 })],
      ['webp', `${id}-${w}.webp`, base.clone().webp({ quality: 74, effort: 5 })],
      ['fallback', `${id}-${w}.jpg`, base.clone().jpeg({ quality: 80, mozjpeg: true })],
    ];

    for (const [kind, name, pipeline] of jobs) {
      await pipeline.toFile(join(OUT, name));
      entry[kind].push({ file: name, width: w, height: h });
      bytes += statSync(join(OUT, name)).size;
    }
  }

  manifest[id] = entry;
  console.log(`  ${id.padEnd(36)} ${meta.width}x${meta.height} -> ${widths.join(', ')}`);
}

/* ------------------------------------------------------------------ *
 * Campaign product artwork
 *
 * The published BOP banner is a can row followed by a baked-in product list
 * and a stock insect photograph. Only the can row belongs in a hero, so the
 * banner is cropped rather than machine-cut: label integrity and packaging
 * proportions are untouched.
 * ------------------------------------------------------------------ */

const CROPS = [
  { id: 'bop-cans', file: 'bop-banner.jpg', widthRatio: 0.5, widths: [400, 800] },
];

for (const crop of CROPS) {
  const file = join(PRODUCT_SRC, crop.file);
  if (!existsSync(file)) {
    console.warn(`  missing product source: ${crop.file}`);
    continue;
  }
  const meta = await sharp(file).metadata();
  const cropWidth = Math.round(meta.width * crop.widthRatio);
  const entry = { base: 'assets/heroes', width: cropWidth, height: meta.height, webp: [], fallback: [] };

  for (const w of crop.widths.filter((w) => w <= cropWidth).concat(crop.widths.some((w) => w <= cropWidth) ? [] : [cropWidth])) {
    const h = Math.round((meta.height / cropWidth) * w);
    const base = () =>
      sharp(file).extract({ left: 0, top: 0, width: cropWidth, height: meta.height }).resize({ width: w, withoutEnlargement: true });

    await base().webp({ quality: 82, effort: 5 }).toFile(join(OUT, `${crop.id}-${w}.webp`));
    await base().jpeg({ quality: 88, mozjpeg: true }).toFile(join(OUT, `${crop.id}-${w}.jpg`));
    entry.webp.push({ file: `${crop.id}-${w}.webp`, width: w, height: h });
    entry.fallback.push({ file: `${crop.id}-${w}.jpg`, width: w, height: h });
    bytes += statSync(join(OUT, `${crop.id}-${w}.webp`)).size + statSync(join(OUT, `${crop.id}-${w}.jpg`)).size;
  }

  manifest[crop.id] = entry;
  console.log(`  ${crop.id.padEnd(36)} cropped to ${cropWidth}x${meta.height}`);
}

writeFileSync(join(ROOT, 'data', 'heroes.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`\nBackgrounds: ${Object.keys(manifest).length}`);
console.log(`Total output: ${(bytes / 1024 / 1024).toFixed(2)} MB`);
