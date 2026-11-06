/**
 * QA screenshots: every page at desktop, tablet and two phone sizes.
 * Usage: npm run build && (npx vite preview --port 4173 &) && node scripts/qa-screenshots.mjs [outDir]
 * Also records any console errors / failed requests per page.
 */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const OUT = process.argv[2] || 'docs/screenshots';
const SCALE = Number(process.env.QA_SCALE || 1);
mkdirSync(OUT, { recursive: true });

const pages = (process.env.QA_TRAILING ? ['/', '/our-story/', '/flavours/', '/our-guarantee/', '/gallery/', '/videos-features/', '/order/', '/faqs/', '/contact/', '/privacy/'] : ['/', '/our-story', '/flavours', '/our-guarantee', '/gallery', '/videos-features', '/order', '/faqs', '/contact', '/privacy', '/does-not-exist']);
const viewports = {
  desktop: { width: 1440, height: 900 },
  tablet: { width: 834, height: 1112 },
  mobile: { width: 390, height: 844 },
  'mobile-small': { width: 360, height: 740 },
};
const only = process.env.QA_ONLY?.split(',');

const browser = await chromium.launch();
const report = [];
for (const [vpName, vp] of Object.entries(viewports)) {
  if (only && !only.includes(vpName)) continue;
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: SCALE, reducedMotion: 'reduce' });
  await ctx.addInitScript(() => localStorage.setItem('cojac-age-confirmed-v1', 'yes'));
  for (const path of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('requestfailed', (r) => errors.push(`request failed: ${r.url()}`));
    const res = await page.goto(BASE + path, { waitUntil: 'networkidle' });
    // Scroll through so lazy images and reveal animations load before the full-page capture.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(500);
    const name = `${vpName}${path === '/' ? '-home' : path.replace(/\//g, '-')}.jpg`;
    await page.screenshot({ path: `${OUT}/${name}`, fullPage: true, type: 'jpeg', quality: 62 });
    const hOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
    report.push({ viewport: vpName, path, status: res?.status(), title: await page.title(), horizontalOverflow: hOverflow, errors });
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(`${OUT}/qa-report.json`, JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.errors.length || r.horizontalOverflow);
console.log(`${report.length} page checks, ${bad.length} with issues`);
for (const b of bad) console.log(b.viewport, b.path, b.horizontalOverflow ? 'H-OVERFLOW' : '', b.errors);
