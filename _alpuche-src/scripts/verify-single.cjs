// Checks the single-file preview: direct open (desktop, mobile), sandboxed iframe, and no-JS fallback.
//   node _alpuche-src/scripts/verify-single.cjs <path to single-file html>
const { chromium, devices } = require('playwright');
const fs = require('fs');
const FILE = process.argv[2];
const ROUTES = ['/', '/about/', '/practice-areas/', '/practice-areas/real-estate/', '/practice-areas/corporate-commercial/', '/practice-areas/banking-finance-tax-regulatory/', '/practice-areas/dispute-resolution/', '/practice-areas/intellectual-property/', '/practice-areas/family-law/', '/practice-areas/qualified-retired-persons/', '/working-with-us/', '/contact/', '/insights/', '/insights/buying-property-in-belize/', '/insights/starting-a-business-in-belize/', '/insights/planning-retirement-in-belize/', '/website-notice/'];
let fails = 0, passes = 0; const ok = (c, m) => { if (c) passes++; else { fails++; console.log('  ✗ ' + m); } };
const h1 = async (f) => (await f.locator('h1').first().textContent({ timeout: 5000 }).catch(async () => 'NO H1 at ' + (await f.evaluate(() => location.href + ' | ' + document.body.innerHTML.slice(0, 200)))));
async function exercise(f, label) {
  const go = (href) => f.evaluate((h) => { const a = document.createElement('a'); a.href = h; document.body.appendChild(a); a.click(); a.remove(); }, href);
  for (const r of ROUTES) {
    await go('#' + r);
    await f.waitForTimeout(60);
    const info = await f.evaluate(async () => { await document.fonts.ready; return {
      h1: document.querySelector('h1')?.textContent.trim(), n: document.querySelectorAll('#app h1').length,
      imgs: [...document.querySelectorAll('#app img')].map(i => i.complete && i.naturalWidth > 0),
      serif: document.fonts.check('600 40px "Cormorant Garamond"'),
      internal: [...document.querySelectorAll('#app a[href^="#/"]')].map(a => a.getAttribute('href').split('?')[0].split('#')[1]),
      relLeft: [...document.querySelectorAll('#app a[href]')].map(a => a.getAttribute('href')).filter(h => /index\.html|^\.\.\//.test(h)),
      bg: getComputedStyle(document.body).backgroundColor }; });
    ok(info.n === 1 && info.h1, `${label} ${r} renders one h1 (${info.h1})`);
    ok(info.imgs.every(Boolean), `${label} ${r} all images loaded`);
    ok(info.serif, `${label} ${r} fonts loaded`);
    ok(info.relLeft.length === 0, `${label} ${r} no unconverted links ${info.relLeft}`);
    for (const t of info.internal) ok(ROUTES.includes(t), `${label} ${r} link target exists: ${t}`);
  }
  // Real flows with real clicks
  await go('#/');
  await f.click('.practice-card a[href*="real-estate"]');
  ok((await h1(f)).includes('Real estate'), `${label} home card opens Real Estate`);
  if (await f.locator('.toc').isVisible()) {
  await f.click('.toc a[href="#frequently-asked-questions"]');
  ok(await f.evaluate(() => Math.abs(document.getElementById('frequently-asked-questions').getBoundingClientRect().top) < 40), `${label} in-page TOC link scrolls`);
  }
  await f.click('.contact-band a[href*="buying-property"]');
  ok((await h1(f)).includes('Buying property'), `${label} Real Estate → property guide`);
  await f.click('.contact-band a.button[href*="area=real-estate"]');
  ok(await f.locator('select[name=area]').inputValue() === 'real-estate', `${label} consultation link preselects Real Estate`);
  ok(await f.locator('[data-area-note]').isVisible(), `${label} practice note shown`);
  await f.click('.office-assistant > summary');
  await f.click('button[data-topic="retirement"]');
  await f.click('.assistant-answer a.answer-next');
  ok((await h1(f)).includes('Qualified Retired Persons'), `${label} assistant → QRP page`);
  try {
    const mobile = await f.locator('.desktop-nav').isHidden();
    if (mobile) { await f.locator('.mobile-nav > summary').click({ timeout: 5000 }); await f.locator('.mobile-nav nav a', { hasText: 'Contact' }).click({ timeout: 5000 }); }
    else await f.locator('.desktop-nav a', { hasText: 'Contact' }).click({ timeout: 5000 });
  } catch (e) { ok(false, `${label} Contact nav click: ${e.message.split('\n').slice(0, 6).join(' / ')}`); }
  ok(await f.locator('select[name=area]').inputValue() === '', `${label} plain Contact has no preselect`);
  await f.click('footer a >> text=Photo credits');
  ok(await f.evaluate(() => { const r = document.getElementById('photo-credits').getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; }), `${label} footer photo-credits anchor scrolls into view`);
}
(async () => {
  const b = await chromium.launch();
  // 1. Direct file open (desktop + mobile)
  for (const [label, opts] of [['desktop', { viewport: { width: 1366, height: 900 } }], ['mobile', devices['iPhone 13']]]) {
    const c = await b.newContext(opts); const p = await c.newPage();
    const errs = []; p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + FILE);
    await exercise(p, label);
    await p.goBack(); await p.waitForTimeout(100);
    ok((await h1(p)).length > 0, `${label} back button renders previous page`);
    ok(errs.length === 0, `${label} no errors ${errs.slice(0, 2)}`);
    await c.close();
  }
  // 2. Sandboxed srcdoc iframe (scripts only), like an in-app viewer
  const c = await b.newContext({ viewport: { width: 1366, height: 900 } }); const p = await c.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.setContent('<iframe id="v" sandbox="allow-scripts" style="width:1366px;height:900px;border:0"></iframe>');
  await p.evaluate((html) => { document.getElementById('v').srcdoc = html; }, fs.readFileSync(FILE, 'utf8'));
  await p.waitForTimeout(800);
  const f = p.frames().find(fr => fr !== p.mainFrame());
  await exercise(f, 'sandboxed');
  ok(errs.length === 0, `sandboxed no errors ${errs.slice(0, 2)}`);
  await c.close();
  // 3. JavaScript disabled: home page still shows
  const nc = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1366, height: 900 } }); const np = await nc.newPage();
  await np.goto('file://' + FILE);
  const st = await np.evaluate(() => ({ h1: document.querySelector('h1')?.textContent, portrait: document.querySelector('.hero-portrait img')?.naturalWidth }));
  ok(/Legal counsel/.test(st.h1) && st.portrait > 0, 'no-JS fallback shows the home page with portrait');
  await nc.close();
  console.log(`${passes} passed, ${fails} failed`); await b.close(); process.exit(fails ? 1 : 0);
})();
