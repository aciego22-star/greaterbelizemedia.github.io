// Collects every piece of visible text on every built page (text nodes plus
// alt, aria-label, placeholder and title attributes, and the document title),
// including the interactive states of the islands (finder paths, cart and
// checkout, search). Used to build and check the Spanish dictionary.
//
// Usage: serve dist/ on :4322, then
//   node scripts/collect-text.cjs [baseUrl] [--lang=es] [--out=.cache/i18n/text.json]
// With --lang=es the site is switched to Spanish first, so the output lists
// what is still shown (used by scripts/i18n-check.mjs).
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const args = process.argv.slice(2);
const base = args.find((a) => !a.startsWith('--')) || 'http://localhost:4322';
const lang = (args.find((a) => a.startsWith('--lang=')) || '--lang=en').slice(7);
const out = (args.find((a) => a.startsWith('--out=')) || `--out=.cache/i18n/text-${lang}.json`).slice(6);

const dist = path.resolve(__dirname, '../dist');
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const routes = walk(dist)
  .filter((f) => f.endsWith('index.html'))
  .map((f) => '/' + path.relative(dist, path.dirname(f)).split(path.sep).join('/') + '/')
  .map((r) => r.replace(/^\/\.?\/$/, '/').replace('//', '/'))
  .sort();

// Runs in the page: every visible string, normalised.
function harvest() {
  const norm = (s) => s.replace(/\s+/g, ' ').trim();
  const found = [];
  const skip = (el) => !el || el.closest('script, style, noscript, template, [data-i18n-skip]');
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const t = norm(n.data);
    if (t && !skip(n.parentElement)) found.push(t);
  }
  for (const el of document.querySelectorAll('[alt], [aria-label], [placeholder], [title]')) {
    if (skip(el)) continue;
    for (const a of ['alt', 'aria-label', 'placeholder', 'title']) {
      const v = el.getAttribute(a);
      if (v && norm(v)) found.push(norm(v));
    }
  }
  for (const o of document.querySelectorAll('option')) if (norm(o.textContent)) found.push(norm(o.textContent));
  found.push(norm(document.title));
  return found;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  if (lang === 'es') await ctx.addInitScript(() => { try { sessionStorage.setItem('uhc.lang.v1', 'es'); } catch {} });
  const page = await ctx.newPage();
  const all = new Map();
  const add = (where, list) => list.forEach((s) => { if (!all.has(s)) all.set(s, new Set()); all.get(s).add(where); });
  const settle = async () => {
    await page.waitForFunction(() => document.documentElement.classList.contains('ui-ready'), null, { timeout: 20000 }).catch(() => {});
    if (lang === 'es') await page.waitForFunction(() => document.documentElement.classList.contains('i18n-done'), null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(250);
  };
  const grab = async (where) => add(where, await page.evaluate(harvest));

  for (const r of routes) {
    await page.goto(base + r, { waitUntil: 'load' });
    await settle();
    await grab(r);
  }

  // Interactive states.
  // Finder: every path and every answer combination's first option.
  await page.goto(base + '/find/', { waitUntil: 'load' });
  await settle();
  const paths = await page.$$eval('.finder__path', (b) => b.length);
  for (let p = 0; p < paths; p++) {
    await page.goto(base + '/find/', { waitUntil: 'load' });
    await settle();
    await page.locator('.finder__path').nth(p).click();
    for (let q = 0; q < 6; q++) {
      await page.waitForTimeout(150);
      await grab('/find/#path' + p);
      const opts = page.locator('.finder__option');
      const n = await opts.count();
      if (!n) break;
      // Visit each option's text, then take the first.
      await opts.nth(q % n).click();
    }
    await page.waitForTimeout(200);
    await grab('/find/#result' + p);
  }
  // Search states.
  await page.goto(base + '/products/', { waitUntil: 'load' });
  await settle();
  for (const q of ['pump', 'zzzz']) {
    await page.fill('#catalogue-q', q);
    await page.waitForTimeout(200);
    await grab('/products/?q=' + q);
  }
  // Cart, checkout errors, decline, confirmation.
  await page.goto(base + '/shop/', { waitUntil: 'load' });
  await settle();
  await page.click('[data-add-to-cart="makita-hp333dyx3b"]');
  await page.click('[data-add-to-cart="lifan-lf100-a"]');
  await page.waitForTimeout(300);
  await grab('/shop/#toast');
  // Every "Ask AI about this" description, opened at once (the page opens one at a time).
  await page.evaluate(() => document.querySelectorAll('.p-about').forEach((p) => (p.hidden = false)));
  await grab('/shop/#about');
  await page.goto(base + '/cart/', { waitUntil: 'load' });
  await settle();
  await grab('/cart/#items');
  await page.goto(base + '/checkout/', { waitUntil: 'load' });
  await settle();
  await grab('/checkout/#form');
  await page.click('.pay-btn');
  await page.waitForTimeout(200);
  await grab('/checkout/#errors');
  await page.click('.link-btn');
  await page.click('.seg label:nth-child(2)');
  await page.click('.pay-btn');
  await page.waitForSelector('.pay-error', { timeout: 6000 });
  await grab('/checkout/#declined');
  await page.click('.seg label:nth-child(1)');
  await page.click('.pay-btn');
  await page.waitForSelector('.confirm', { timeout: 6000 });
  await grab('/checkout/#confirm');
  // Site search: empty, results, nothing found; a request in the cart and checkout.
  await page.goto(base + '/', { waitUntil: 'load' });
  await settle();
  await page.click('[data-open-search]');
  await page.waitForSelector('#site-search-input');
  await page.waitForTimeout(300);
  await grab('/#search');
  for (const q of ['makita drill', 'motorcycle', 'pvc pipe 2 inch']) {
    await page.fill('#site-search-input', q);
    await page.waitForTimeout(250);
    await grab('/#search=' + q);
  }
  await page.click('.search-request .btn');
  await page.waitForTimeout(300);
  await grab('/#search-added');
  await page.keyboard.press('Escape');
  await page.goto(base + '/cart/', { waitUntil: 'load' });
  await settle();
  await grab('/cart/#request');
  await page.goto(base + '/checkout/', { waitUntil: 'load' });
  await settle();
  await grab('/checkout/#request');
  await page.click('text=Fill in sample details').catch(() => {});
  await page.click('.pay-btn');
  await page.waitForSelector('.confirm', { timeout: 6000 }).catch(() => {});
  await grab('/checkout/#request-confirm');
  // Universal AI chrome.
  await page.goto(base + '/', { waitUntil: 'load' });
  await settle();
  await page.click('.guide-launcher');
  await page.waitForTimeout(800);
  await grab('/#guide');
  // Universal AI answers with picture cards and the WhatsApp handoff.
  for (const q of ['show me makita drills', 'what do you sell?', 'tell me about Sankey', 'how much is a hisun utv?', "what's new at Universal?", 'add the LF125-5 to my cart', 'talk to a person']) {
    await page.fill('#guide-input', q);
    await page.press('#guide-input', 'Enter');
    await page.waitForTimeout(500);
    await grab('/#guide=' + q);
  }
  // Mobile menu.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/', { waitUntil: 'load' });
  await settle();
  await page.click('[data-menu-open]');
  await page.waitForTimeout(300);
  await grab('/#menu');

  await browser.close();
  const result = [...all.entries()].map(([text, where]) => ({ text, where: [...where].slice(0, 3), pages: where.size })).sort((a, b) => b.pages - a.pages || a.text.localeCompare(b.text));
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(result, null, 1));
  console.log(`${result.length} distinct strings from ${routes.length} pages → ${out}`);
})();
