/**
 * Creates any missing WebP copies of the site's photos, so new images stay fast.
 * Runs automatically before every build (npm run build) and can be run alone:
 *   npm run images
 *
 * For every .jpg / .jpeg / .png in the photo folders below it writes a .webp
 * with the same name (only if it does not exist yet). In gallery, products and
 * blog it also writes the half-size version the pages use for phones and cards,
 * e.g. ..._Desktop_1600x1200.jpg -> ..._Desktop_800x600.webp.
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
console.log(`make-webp: ${made ? `${made} WebP file(s) created` : 'all photos already have WebP versions'}`);
