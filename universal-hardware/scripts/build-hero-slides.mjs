// Encodes the homepage slideshow images (desktop and mobile versions of each
// slide) as AVIF / WebP at two widths plus a JPEG fallback, under
// content-hashed names in public/hero/slides/, and lists them in
// src/hero/slides.json for HeroCarousel.astro. A changed image always gets a
// new URL, so no host or browser cache can serve an old one.
// Usage: node scripts/build-hero-slides.mjs <source-dir>
//   <source-dir> holds <slide>-desktop.png and <slide>-mobile.png for each slide below.
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const SLIDES = ['storefront', 'interior', 'aisle'];
const WIDTHS = { desktop: [1200, 1672], mobile: [750, 1122] };
const src = path.resolve(process.argv[2] ?? '');
const out = path.resolve('public/hero/slides');
const manifest = path.resolve('src/hero/slides.json');

const hashed = (name, ext, buf) => `${name}.${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10)}.${ext}`;

fs.mkdirSync(out, { recursive: true });
const result = {};
const keep = new Set();
for (const slide of SLIDES) {
  result[slide] = {};
  for (const variant of ['desktop', 'mobile']) {
    const file = path.join(src, `${slide}-${variant}.png`);
    const { width, height } = await sharp(file).metadata();
    const entry = { width, height, avif: [], webp: [] };
    for (const w of WIDTHS[variant].filter((x) => x <= width)) {
      const img = sharp(file).resize({ width: w });
      const encoded = {
        avif: await img.clone().avif({ quality: 52, effort: 6 }).toBuffer(),
        webp: await img.clone().webp({ quality: 72, effort: 6 }).toBuffer(),
      };
      for (const [ext, buf] of Object.entries(encoded)) {
        const name = hashed(`${slide}-${variant}-${w}`, ext, buf);
        fs.writeFileSync(path.join(out, name), buf);
        entry[ext].push({ w, file: name });
        keep.add(name);
        console.log('wrote', name, `${Math.round(buf.length / 1024)} KB`);
      }
    }
    // JPEG only for browsers without AVIF or WebP.
    const jpg = await sharp(file).resize({ width: WIDTHS[variant][0] }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    entry.jpg = hashed(`${slide}-${variant}`, 'jpg', jpg);
    fs.writeFileSync(path.join(out, entry.jpg), jpg);
    keep.add(entry.jpg);
    result[slide][variant] = entry;
  }
}
// Remove files from earlier runs.
for (const f of fs.readdirSync(out)) if (!keep.has(f)) fs.unlinkSync(path.join(out, f));
fs.writeFileSync(manifest, JSON.stringify(result, null, 1) + '\n');
