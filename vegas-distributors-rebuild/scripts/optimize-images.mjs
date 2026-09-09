/**
 * Builds the site's image set from the handoff pack.
 *
 * Originals stay in the pack untouched; this writes optimised derivatives into
 * src/assets/images and records intrinsic dimensions in data/images.json so
 * every <img> can reserve its space and avoid layout shift.
 *
 * Usage: node scripts/optimize-images.mjs [--pack <dir>]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const argPack = process.argv.indexOf('--pack');
const PACK = argPack > -1 ? process.argv[argPack + 1] : process.env.VEGAS_PACK;

if (!PACK || !existsSync(PACK)) {
  console.error('Handoff pack not found. Pass --pack <path to vegas_cc_pack> or set VEGAS_PACK.');
  process.exit(1);
}

const OUT = join(ROOT, 'src', 'assets', 'images');
const catalog = JSON.parse(readFileSync(join(ROOT, 'data', 'catalog.json'), 'utf8'));
const company = JSON.parse(readFileSync(join(ROOT, 'data', 'company.json'), 'utf8'));

rmSync(OUT, { recursive: true, force: true });
for (const d of ['brands', 'logos', 'divisions', 'company']) mkdirSync(join(OUT, d), { recursive: true });

const manifest = {};
let written = 0;
let bytesIn = 0;
let bytesOut = 0;

/**
 * Emits one image as AVIF-free webp plus an original-format fallback, at each
 * requested width that does not upscale the source.
 */
async function emit(srcPath, outDir, name, widths, { transparent = false } = {}) {
  if (!existsSync(srcPath)) {
    console.warn(`  missing source: ${srcPath}`);
    return null;
  }
  const input = sharp(srcPath, { failOn: 'none' });
  const meta = await input.metadata();
  bytesIn += readFileSync(srcPath).length;

  const usable = widths.filter((w) => w <= meta.width);
  if (!usable.length) usable.push(meta.width);

  const fallbackExt = transparent ? 'png' : 'jpg';
  const sources = { webp: [], fallback: [] };

  for (const w of usable) {
    const h = Math.round((meta.height / meta.width) * w);

    const webpName = `${name}-${w}.webp`;
    await sharp(srcPath, { failOn: 'none' })
      .resize({ width: w, withoutEnlargement: true })
      .webp({ quality: 78, effort: 5 })
      .toFile(join(outDir, webpName));
    sources.webp.push({ file: webpName, width: w, height: h });

    const fbName = `${name}-${w}.${fallbackExt}`;
    const pipeline = sharp(srcPath, { failOn: 'none' }).resize({ width: w, withoutEnlargement: true });
    await (transparent
      ? pipeline.png({ compressionLevel: 9, palette: true })
      : pipeline.jpeg({ quality: 80, mozjpeg: true })
    ).toFile(join(outDir, fbName));
    sources.fallback.push({ file: fbName, width: w, height: h });

    bytesOut += readFileSync(join(outDir, webpName)).length + readFileSync(join(outDir, fbName)).length;
    written += 2;
  }

  return {
    dir: outDir.slice(OUT.length + 1),
    width: meta.width,
    height: meta.height,
    aspect: +(meta.width / meta.height).toFixed(4),
    webp: sources.webp,
    fallback: sources.fallback,
  };
}

const PHOTO_WIDTHS = [400, 800, 1200];
const LOGO_WIDTHS = [180, 360];
const MARK_WIDTHS = [320, 640];

const origDir = join(PACK, 'reference', 'assets-original');
const curatedDir = join(PACK, 'assets-curated');

console.log('Company and division marks...');
manifest.company = {};

// The official web logo is only 318px wide and carries transparency, so it is
// the right file for the header and for placement on dark surfaces.
manifest.company.logo = await emit(
  join(curatedDir, 'company', 'vegas-logo.png'),
  join(OUT, 'company'), 'vegas-logo', [318, 636], { transparent: true }
);

// The company's own 2022 product-catalogue cover slide carries the same mark at
// far higher resolution. These are straight crops of that published artwork:
// nothing is redrawn, recoloured or restretched. Used for large placements
// where the 318px web logo would break down.
const catalogueCover = join(origDir, 'Slide1-f06c73d5.jpg');
if (existsSync(catalogueCover)) {
  mkdirSync(join(OUT, 'company'), { recursive: true });
  const crops = [
    ['vegas-lockup', { left: 690, top: 100, width: 530, height: 490 }],
    ['vegas-mark', { left: 755, top: 115, width: 360, height: 345 }],
  ];
  for (const [name, box] of crops) {
    const tmp = join(OUT, 'company', `${name}-source.png`);
    await sharp(catalogueCover).extract(box).png().toFile(tmp);
    manifest.company[name] = await emit(
      tmp, join(OUT, 'company'), name, [box.width, box.width * 2], { transparent: true }
    );
    if (manifest.company[name]) manifest.company[name].provenance = 'Cropped from the published 2022 product-catalogue cover slide.';
    rmSync(tmp, { force: true });
  }
}

manifest.divisions = {};
const divisionSources = [
  ['blanca-max-logo', join(curatedDir, 'divisions', 'blanca-max-logo.png'), MARK_WIDTHS, true],
  ['blanca-max-1-litre', join(curatedDir, 'divisions', 'blanca-max-1-litre.jpg'), PHOTO_WIDTHS, false],
  ['blanca-max-half-litre', join(curatedDir, 'divisions', 'blanca-max-half-litre.jpg'), PHOTO_WIDTHS, false],
  ['international-lubricants-logo', join(curatedDir, 'divisions', 'international-lubricants-logo.png'), MARK_WIDTHS, true],
  ['international-lubricants-chevron-artwork', join(curatedDir, 'divisions', 'international-lubricants-chevron-artwork.jpg'), PHOTO_WIDTHS, false],
];
for (const [name, src, widths, transparent] of divisionSources) {
  manifest.divisions[name] = await emit(src, join(OUT, 'divisions'), name, widths, { transparent });
}

console.log('Brand logos and product photography...');
manifest.brands = {};
for (const brand of catalog.brands) {
  const entry = { logo: null, photos: [] };

  if (brand.logo) {
    entry.logo = await emit(
      join(origDir, brand.logo.file), join(OUT, 'logos'), `${brand.slug}-logo`, LOGO_WIDTHS
    );
  }

  // Cap the number of photos carried per brand: the detail pages show a lead
  // image plus a small gallery, and Kellogg's alone publishes nine.
  for (const [i, photo] of brand.photos.slice(0, 4).entries()) {
    const out = await emit(
      join(origDir, photo.file), join(OUT, 'brands'), `${brand.slug}-${i + 1}`, PHOTO_WIDTHS
    );
    if (out) entry.photos.push({ ...out, alt: photo.alt || '' });
  }

  manifest.brands[brand.slug] = entry;
}

writeFileSync(join(ROOT, 'data', 'images.json'), JSON.stringify(manifest, null, 2) + '\n');

const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`\nFiles written: ${written}`);
console.log(`Sources read:  ${mb(bytesIn)}`);
console.log(`Derivatives:   ${mb(bytesOut)}`);
