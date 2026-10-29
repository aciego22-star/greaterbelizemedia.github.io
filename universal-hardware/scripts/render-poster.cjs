// Renders the static hero posters from the real 3D scene (same drill model),
// used as the instant first paint and the no-WebGL fallback, then encodes them
// as AVIF / WebP / PNG under content-hashed names (public/hero/), listed in
// src/hero/posters.json for Hero.astro. A changed poster always gets a new
// URL, so no host or browser cache can serve an old one.
// Usage: node scripts/render-poster.cjs [baseUrl]   (serve dist/ first)
const { chromium } = require('playwright');
const sharp = require('sharp');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const base = process.argv[2] || 'http://localhost:4322';
const out = path.resolve(__dirname, '../public/hero');
const raw = path.resolve(__dirname, '../.cache/posters');
const manifest = path.resolve(__dirname, '../src/hero/posters.json');
const shots = [
  { key: 'desktop', name: 'drill-poster-desktop', viewport: { width: 1440, height: 900 }, dpr: 2, query: '' },
  // Phones run the low-power profile (no shadow map), so the mobile poster does too.
  { key: 'mobile', name: 'drill-poster-mobile', viewport: { width: 390, height: 844 }, dpr: 2.5, query: '&lowpower' },
];

const hashed = (name, ext, buf) => `${name}.${crypto.createHash('sha256').update(buf).digest('hex').slice(0, 10)}.${ext}`;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(raw, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const result = {};
  for (const s of shots) {
    const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.dpr });
    await page.goto(`${base}/?poster${s.query}`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('poster-ready'), null, { timeout: 60000 });
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => document.querySelector('.hero__canvas').toDataURL('image/png'));
    const png = Buffer.from(data.split(',')[1], 'base64');
    fs.writeFileSync(path.join(raw, `${s.name}.png`), png);
    await page.close();

    const img = sharp(png);
    const { width, height } = await img.metadata();
    const encoded = {
      avif: await img.clone().avif({ quality: 55, effort: 4 }).toBuffer(),
      webp: await img.clone().webp({ quality: 72, effort: 6 }).toBuffer(),
      // PNG is only the fallback for browsers without AVIF or WebP.
      png: await img.clone().png({ palette: true, colours: 256, dither: 0, effort: 10 }).toBuffer(),
    };
    result[s.key] = { width, height };
    for (const [ext, buf] of Object.entries(encoded)) {
      const file = hashed(s.name, ext, buf);
      fs.writeFileSync(path.join(out, file), buf);
      result[s.key][ext] = file;
      console.log('wrote', file, `${Math.round(buf.length / 1024)} KB`);
    }
  }
  await browser.close();

  // Remove posters from earlier runs.
  const keep = new Set(Object.values(result).flatMap((r) => [r.avif, r.webp, r.png]));
  for (const f of fs.readdirSync(out)) if (f.startsWith('drill-poster-') && !keep.has(f)) fs.unlinkSync(path.join(out, f));
  fs.writeFileSync(manifest, JSON.stringify(result, null, 1) + '\n');
})();
