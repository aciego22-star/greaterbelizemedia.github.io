// Captures the presentation screenshot set into deliverables/screenshots/.
// Usage: serve dist/ on :4322, then NODE_PATH=$(npm root -g) node scripts/screenshots.cjs
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const BASE = process.argv[2] || 'http://localhost:4322';
const OUT = path.resolve(__dirname, '../deliverables/screenshots');
fs.mkdirSync(OUT, { recursive: true });
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };

// Scrolls the 3D hero (below the homepage slideshow) just under the sticky header.
const toStage = (page) =>
  page.evaluate(() => {
    const el = document.querySelector('.hero');
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - document.querySelector('[data-header]').offsetHeight, behavior: 'instant' });
  });
// The 3D scene starts once its stage is on screen: bring it into view, wait, then return to the top.
async function ready(page) {
  if (await page.$('[data-hero-stage]')) await toStage(page);
  await page.waitForFunction(() => {
    const s = document.querySelector('[data-hero-stage]');
    return !s || s.dataset.state === 'ready' || s.dataset.state === 'fallback';
  }, null, { timeout: 40000 });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForFunction(() => { const i = document.querySelector('[data-reel-slide].is-active img'); return !i || (i.complete && i.naturalWidth > 1); });
}
async function scrollThrough(page, vh) {
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += Math.round(vh * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
}
// Scroll-and-stitch full-page capture (Chromium's fullPage mode wraps on this layout).
async function stitchFullPage(page, w, h, name) {
  const { execFileSync } = require('node:child_process');
  await page.addStyleTag({ content: '.site-header{position:relative!important}.guide-launcher{display:none!important}' });
  await page.waitForTimeout(200);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const parts = [];
  for (let y = 0, i = 0; y < H; y += h, i++) {
    await page.evaluate((t) => window.scrollTo(0, t), Math.min(y, H - h));
    await page.waitForTimeout(250);
    const f = path.join(OUT, `.part-${i}.png`);
    await page.screenshot({ path: f });
    const keep = Math.min(h, H - y);
    if (keep < h) execFileSync('convert', [f, '-gravity', 'South', '-crop', `${w}x${keep}+0+0`, '+repage', f]);
    parts.push(f);
  }
  execFileSync('convert', [...parts, '-append', path.join(OUT, name)]);
  parts.forEach((f) => fs.rmSync(f));
  console.log('  ', name);
}
const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(OUT, name), ...opts }).then(() => console.log('  ', name));

(async () => {
  const browser = await chromium.launch(LAUNCH);
  for (const [w, h, dpr, tag] of [[1440, 900, 1, 'desktop-1440x900'], [390, 844, 2, 'mobile-390x844']]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: w < 800, isMobile: w < 800 });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.mouse.move(w * 0.7, h * 0.45);
    await ready(page);
    await page.waitForTimeout(1200);
    await shot(page, `01-home-hero-${tag}.png`);
    await toStage(page);
    await page.mouse.move(w * 0.7, h * 0.5);
    await page.waitForTimeout(2600);
    await shot(page, `01b-home-3d-drill-${tag}.png`);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    {
      // Full-page capture from a non-emulated context (Chromium's full-page
      // capture duplicates content under mobile emulation).
      const fctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      const fp = await fctx.newPage();
      await fp.goto(BASE + '/', { waitUntil: 'load' });
      await fp.mouse.move(w * 0.7, h * 0.45);
      await ready(fp);
      await fp.waitForTimeout(2000);
      await scrollThrough(fp, h);
      await fp.mouse.move(1, 1);
      await stitchFullPage(fp, w, h, `02-home-full-${tag}.png`);
      await fctx.close();
    }

    // Finder flow
    await page.locator('#finder').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => {
      const isl = document.querySelector('astro-island[component-url*="ProductFinder"]');
      return isl && !isl.hasAttribute('ssr');
    }, null, { timeout: 30000 });
    await page.click('.finder__path:has-text("Backup power")');
    await page.click('.finder__option:has-text("Lights, fridge & fans")');
    await page.click('.finder__option:has-text("Occasional outages")');
    await page.click('.finder__option:has-text("At home")');
    await page.waitForSelector('.finder__results');
    await page.waitForTimeout(700);
    await page.locator('.finder').screenshot({ path: path.join(OUT, `03-finder-results-${tag}.png`) });
    console.log('  ', `03-finder-results-${tag}.png`);
    // Spanish: the header EN/ES button flips the whole page in place.
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => document.documentElement.lang === 'es' && document.documentElement.classList.contains('i18n-done'));
    await page.waitForTimeout(600);
    await shot(page, `04-home-spanish-${tag}.png`);
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.waitForTimeout(300);

    // Product Guide
    await page.click('.guide-launcher');
    await page.waitForSelector('.msg--guide');
    for (const q of ['I need backup power for my home. What type should I look at?']) {
      await page.fill('#guide-input', q);
      await page.press('#guide-input', 'Enter');
      await page.waitForTimeout(500);
    }
    await page.waitForTimeout(400);
    await shot(page, `05-product-guide-${tag}.png`);
    await page.keyboard.press('Escape');
    await ctx.close();

    // Inner pages
    const ctx2 = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: dpr, hasTouch: w < 800, isMobile: w < 800 });
    const p2 = await ctx2.newPage();
    await p2.goto(BASE + '/products/?q=pump', { waitUntil: 'load' });
    await p2.waitForTimeout(800);
    await shot(p2, `06-products-search-${tag}.png`);
    await p2.goto(BASE + '/products/generators/', { waitUntil: 'load' });
    await p2.waitForTimeout(800);
    await shot(p2, `07-category-generators-${tag}.png`);
    await p2.goto(BASE + '/locations/', { waitUntil: 'load' });
    await p2.waitForTimeout(800);
    await p2.evaluate(() => document.querySelector('#spanish-lookout')?.scrollIntoView({ block: 'start' }));
    await p2.waitForTimeout(500);
    await shot(p2, `08-locations-${tag}.png`);
    await p2.goto(BASE + '/brands/', { waitUntil: 'load' });
    await p2.waitForTimeout(800);
    await shot(p2, `09-brands-${tag}.png`);
    // Shop, cart and demo checkout
    await p2.goto(BASE + '/shop/', { waitUntil: 'load' });
    await p2.waitForFunction(() => document.documentElement.classList.contains('ui-ready'), null, { timeout: 20000 });
    const jump = (sel) => p2.evaluate((q) => { const el = document.querySelector(q); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 90, behavior: 'instant' }); }, sel);
    await jump('.shop-bar');
    await p2.waitForTimeout(800);
    await shot(p2, `13-shop-${tag}.png`);
    await p2.click('[data-add-to-cart="makita-hp333dyx3b"]');
    await p2.selectOption('[data-product="lifan-lf100-a"] [data-colour]', 'Blue');
    await p2.click('[data-add-to-cart="lifan-lf100-a"]');
    await p2.goto(BASE + '/cart/', { waitUntil: 'load' });
    await p2.waitForSelector('.cart-line');
    await p2.waitForTimeout(500);
    await shot(p2, `14-cart-${tag}.png`);
    await p2.goto(BASE + '/checkout/', { waitUntil: 'load' });
    await p2.waitForSelector('.pay-demo');
    await p2.click('text=Fill in sample details');
    await jump('.co-step:nth-of-type(3)');
    await p2.waitForTimeout(500);
    await shot(p2, `15-checkout-card-step-${tag}.png`);
    await p2.click('.pay-btn');
    await p2.waitForSelector('.confirm', { timeout: 8000 });
    await p2.waitForTimeout(500);
    await shot(p2, `16-order-confirmed-demo-${tag}.png`);
    if (w < 800) {
      await p2.goto(BASE + '/', { waitUntil: 'load' });
      await p2.click('[data-menu-open]');
      await p2.waitForTimeout(500);
      await shot(p2, `10-mobile-menu-${tag}.png`);
    }
    await ctx2.close();
  }
  // Extra breakpoints
  for (const [w, h] of [[320, 640], [768, 1024], [1024, 768]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, hasTouch: w < 1024, isMobile: w < 800 });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.mouse.move(w * 0.7, h * 0.5);
    await ready(page);
    await page.waitForTimeout(2000);
    await shot(page, `11-home-${w}x${h}.png`);
    await ctx.close();
  }
  {
    const b2 = await chromium.launch({ args: ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
    const page = await b2.newPage({ viewport: { width: 1440, height: 900 } });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await toStage(page);
    await page.waitForTimeout(1500);
    await shot(page, `12-home-no-webgl-fallback-1440x900.png`);
    await b2.close();
  }
  await browser.close();
})();
