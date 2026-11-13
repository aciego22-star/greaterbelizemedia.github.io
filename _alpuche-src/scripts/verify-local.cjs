// Checks a --local build opened straight from disk (file://).
//   node _alpuche-src/scripts/verify-local.cjs _alpuche-src/dist-local/jose-m-alpuche-preview
const { chromium, devices } = require('playwright');
const fs = require('fs'); const path = require('path');
const ROOT = path.resolve(process.argv[2]);
const start = 'file://' + path.join(ROOT, 'index.html');
let fails = 0, passes = 0; const ok = (c, m) => { if (c) passes++; else { fails++; console.log('  ✗ ' + m); } };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('requestfailed', r => errs.push('FAILED ' + r.url()));
  // Crawl every internal link from the home page outward.
  const seen = new Set(); const queue = [start];
  while (queue.length) {
    const u = queue.shift(); const file = u.split(/[?#]/)[0];
    if (seen.has(file)) continue; seen.add(file);
    ok(fs.existsSync(new URL(file).pathname), 'exists: ' + file);
    await p.goto(u, { waitUntil: 'load' });
    await p.evaluate(async () => { for (const i of document.images) i.loading = 'eager'; await document.fonts.ready; });
    const info = await p.evaluate(() => ({
      links: [...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => h.startsWith('file:')),
      serif: document.fonts.check('600 40px "Cormorant Garamond"'), sans: document.fonts.check('400 16px Inter'),
      broken: [...document.images].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src),
      css: getComputedStyle(document.body).backgroundColor,
    }));
    ok(info.serif && info.sans, 'fonts loaded on ' + file);
    ok(info.broken.length === 0, 'images load on ' + file + ' ' + info.broken);
    ok(info.css === 'rgb(246, 242, 235)', 'stylesheet applied on ' + file);
    for (const l of info.links) if (!seen.has(l.split(/[?#]/)[0])) queue.push(l);
  }
  console.log('pages crawled:', seen.size);
  // Assistant + contact preselect from disk.
  await p.goto('file://' + path.join(ROOT, 'practice-areas/real-estate/index.html'));
  await p.evaluate(() => { window.ALPUCHE_TYPING_SCALE = 0.1; });
  const wr = (n) => p.waitForFunction((k) => document.querySelectorAll('.chat-log .msg-bot:not(.is-typing)').length > k && !document.querySelector('.chat-log .is-typing'), n, { timeout: 10000 });
  await p.click('.office-assistant > summary'); await wr(0);
  await p.fill('#chat-text', 'Can you help me retire in Belize?'); await p.click('.chat-send'); await wr(1);
  await p.locator('.chat-log .msg-bot .msg-link').last().click(); await p.waitForLoadState('load');
  ok(p.url().endsWith('practice-areas/qualified-retired-persons/index.html'), 'assistant link works from disk');
  await p.goto('file://' + path.join(ROOT, 'contact/index.html?area=real-estate'));
  ok(/Real Estate/.test(await p.locator('[data-contact-intake]').innerText()), 'contact page carries the practice from disk');
  await p.goto('file://' + path.join(ROOT, 'practice-areas/real-estate/index.html'));
  await p.evaluate(() => { window.ALPUCHE_TYPING_SCALE = 0.1; });
  await p.click('.contact-band a.button[href*="area=real-estate"]'); await wr(0);
  ok(p.url().endsWith('practice-areas/real-estate/index.html') && await p.locator('.office-assistant').evaluate((d) => d.open), 'consultation button opens Alpuche AI from disk');
  // Mobile menu from disk
  const m = await b.newPage({ ...devices['iPhone 13'] });
  await m.goto(start); await m.click('.mobile-nav > summary'); await m.click('.mobile-nav nav a >> text=Our Team'); await m.waitForLoadState('load');
  ok(m.url().endsWith('about/index.html'), 'mobile menu navigation works from disk');
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 3));
  console.log(`${passes} passed, ${fails} failed`); await b.close(); process.exit(fails ? 1 : 0);
})();
