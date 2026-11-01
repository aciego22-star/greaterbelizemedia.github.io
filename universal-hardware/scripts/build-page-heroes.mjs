// Encodes the hero photos for the inner pages (desktop and mobile versions of
// each) the same way as the homepage slideshow: AVIF / WebP at two widths plus
// a JPEG fallback, under content-hashed names in public/hero/pages/, listed in
// src/hero/pages.json for PageBanner.astro.
// Usage: node scripts/build-page-heroes.mjs <source-dir>
//   <source-dir> holds <page>-desktop.png and <page>-mobile.png for each page below
//   (desktop 1920 × 1080, mobile 1080 × 1350; a shorter desktop crop is fine).
import sharp from 'sharp';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const PAGES = ['shop', 'products', 'locations', 'about', 'whats-new'];
const WIDTHS = { desktop: [1200, 1920], mobile: [750, 1080] };
const src = path.resolve(process.argv[2] ?? '');
const out = path.resolve('public/hero/pages');
const manifest = path.resolve('src/hero/pages.json');

const hashed = (name, ext, buf) => `${name}.${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10)}.${ext}`;

fs.mkdirSync(out, { recursive: true });
const result = {};
const keep = new Set();
for (const page of PAGES) {
  result[page] = {};
  for (const variant of ['desktop', 'mobile']) {
    const file = path.join(src, `${page}-${variant}.png`);
    const { width, height } = await sharp(file).metadata();
    const entry = { width, height, avif: [], webp: [] };
    for (const w of WIDTHS[variant].filter((x) => x <= width)) {
      const img = sharp(file).resize({ width: w });
      const encoded = {
        avif: await img.clone().avif({ quality: 52, effort: 6 }).toBuffer(),
        webp: await img.clone().webp({ quality: 72, effort: 6 }).toBuffer(),
      };
      for (const [ext, buf] of Object.entries(encoded)) {
        const name = hashed(`${page}-${variant}-${w}`, ext, buf);
        fs.writeFileSync(path.join(out, name), buf);
        entry[ext].push({ w, file: name });
        keep.add(name);
        console.log('wrote', name, `${Math.round(buf.length / 1024)} KB`);
      }
    }
    // JPEG only for browsers without AVIF or WebP.
    const jpg = await sharp(file).resize({ width: WIDTHS[variant][0] }).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    entry.jpg = hashed(`${page}-${variant}`, 'jpg', jpg);
    fs.writeFileSync(path.join(out, entry.jpg), jpg);
    keep.add(entry.jpg);
    result[page][variant] = entry;
  }
}
// Remove files from earlier runs.
for (const f of fs.readdirSync(out)) if (!keep.has(f)) fs.unlinkSync(path.join(out, f));
fs.writeFileSync(manifest, JSON.stringify(result, null, 1) + '\n');
