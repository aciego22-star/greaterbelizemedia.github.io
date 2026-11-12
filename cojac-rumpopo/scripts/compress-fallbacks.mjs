/**
 * Post-build: re-saves the JPG fallback photos in dist/ (products and gallery)
 * as lighter progressive JPGs. Modern browsers load the WebP versions; the JPGs
 * are only for very old browsers, so they do not need to be full quality.
 * Only the deployed copies change; the originals in public/ are left as supplied.
 * Skipped quietly if the image library is unavailable.
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), '..', 'dist');
let sharp;
try {
  sharp = (await import('sharp')).default;
} catch {
  console.warn('compress-fallbacks: image library not available, skipping.');
  process.exit(0);
}

let before = 0;
let after = 0;
for (const folder of ['products', 'gallery']) {
  const dir = join(dist, folder);
  for (const file of readdirSync(dir)) {
    if (!/\.jpe?g$/i.test(file)) continue;
    const path = join(dir, file);
    const size = statSync(path).size;
    const out = await sharp(readFileSync(path)).jpeg({ quality: 78, progressive: true, mozjpeg: true }).toBuffer();
    before += size;
    if (out.length < size) {
      writeFileSync(path, out);
      after += out.length;
    } else after += size;
  }
}
const mb = (n) => (n / 1048576).toFixed(1);
console.log(`compress-fallbacks: JPG fallbacks ${mb(before)} MB -> ${mb(after)} MB`);
