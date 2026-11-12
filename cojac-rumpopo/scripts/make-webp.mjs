/**
 * Creates any missing WebP copies of the site's photos, so new images stay fast.
 * Runs automatically before every build (npm run build) and can be run alone:
 *   npm run images
 *
 * For every .jpg / .jpeg / .png in the photo folders below it writes a .webp
 * with the same name (only if it does not exist yet). In gallery, products and
 * blog it also writes the half-size version the pages use for phones and cards,
 * e.g. ..._Desktop_1600x1200.jpg -> ..._Desktop_800x600.webp.
 * In hero it also writes the smaller sizes phones and laptops use
 * (…_Mobile_9x16-540.webp / -720.webp, …_Desktop_16x9-960.webp / -1280.webp)
 * and a light JPG fallback (…_9x16.jpg / …_16x9.jpg) for very old browsers.
 * Hero originals can be PNG, JPG or WebP; keep big PNG originals in /originals/hero
 * (not deployed) once their JPG and WebP versions exist.
 * If the image library is unavailable the build continues without failing.
 */
import { existsSync, readdirSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
const FOLDERS = ['gallery', 'products', 'blog', 'hero', 'media', 'banks'];
const HALF_SIZE = new Set(['gallery', 'products', 'blog']);
const QUALITY = 84;

let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('make-webp: image library not available, skipping (existing WebP files are used).');
  process.exit(0);
}

let made = 0;
for (const folder of FOLDERS) {
  const dir = join(root, folder);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir)) {
    const ext = extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;
    const src = join(dir, file);
    const base = file.slice(0, -ext.length);
    const full = join(dir, `${base}.webp`);
    if (!existsSync(full)) {
      await sharp(src).webp({ quality: QUALITY }).toFile(full);
      made++;
      console.log(`make-webp: ${folder}/${base}.webp`);
    }
    const m = base.match(/^(.*_)(\d+)x(\d+)$/);
    if (HALF_SIZE.has(folder) && m) {
      const w = Math.round(Number(m[2]) / 2);
      const h = Math.round(Number(m[3]) / 2);
      const half = join(dir, `${m[1]}${w}x${h}.webp`);
      if (!existsSync(half)) {
        await sharp(src).resize(w, h).webp({ quality: QUALITY }).toFile(half);
        made++;
        console.log(`make-webp: ${folder}/${m[1]}${w}x${h}.webp`);
      }
    }
  }
}
// Hero: responsive sizes and a JPG fallback, made from the best source available.
const heroDir = join(root, 'hero');
if (existsSync(heroDir)) {
  const bases = new Set(
    readdirSync(heroDir)
      .map((f) => f.match(/^(.*_(?:9x16|16x9))\.(png|jpe?g|webp)$/i)?.[1])
      .filter(Boolean),
  );
  for (const base of bases) {
    const src = ['png', 'jpg', 'jpeg', 'webp'].map((e) => join(heroDir, `${base}.${e}`)).find((p) => existsSync(p));
    const widths = base.endsWith('9x16') ? [540, 720] : [960, 1280];
    for (const w of widths) {
      const out = join(heroDir, `${base}-${w}.webp`);
      if (!existsSync(out)) {
        await sharp(src).resize({ width: w }).webp({ quality: 80 }).toFile(out);
        made++;
        console.log(`make-webp: hero/${base}-${w}.webp`);
      }
    }
    const jpg = join(heroDir, `${base}.jpg`);
    if (!existsSync(jpg)) {
      await sharp(src).flatten({ background: '#3a0a13' }).jpeg({ quality: 80, progressive: true, mozjpeg: true }).toFile(jpg);
      made++;
      console.log(`make-webp: hero/${base}.jpg`);
    }
  }
}

console.log(`make-webp: ${made ? `${made} image file(s) created` : 'all photos already have WebP versions'}`);
