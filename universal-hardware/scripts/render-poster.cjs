// Renders the static hero posters from the real 3D scene (same procedural
// model), used as the instant first paint and the no-WebGL fallback.
// Usage: node scripts/render-poster.cjs [baseUrl]   (serve dist/ first)
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const base = process.argv[2] || 'http://localhost:4322';
const out = path.resolve(__dirname, '../public/hero');
const shots = [
  { name: 'drill-poster-desktop', viewport: { width: 1440, height: 900 }, dpr: 2, query: '' },
  // Phones run the low-power profile (no shadow map), so the mobile poster does too.
  { name: 'drill-poster-mobile', viewport: { width: 390, height: 844 }, dpr: 2.5, query: '&lowpower' },
];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const s of shots) {
    const page = await browser.newPage({ viewport: s.viewport, deviceScaleFactor: s.dpr });
    await page.goto(`${base}/?poster${s.query}`, { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('poster-ready'), null, { timeout: 60000 });
    await page.waitForTimeout(800);
    const data = await page.evaluate(() => document.querySelector('.hero__canvas').toDataURL('image/png'));
    const file = path.join(out, `${s.name}.png`);
    fs.writeFileSync(file, Buffer.from(data.split(',')[1], 'base64'));
    console.log('wrote', file);
    await page.close();
  }
  await browser.close();
})();
