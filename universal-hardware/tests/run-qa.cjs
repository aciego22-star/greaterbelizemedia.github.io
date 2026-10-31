/**
 * End-to-end QA for the Universal Hardware concept build.
 *
 *   npm run build && node scripts/serve.mjs dist 4322 &
 *   NODE_PATH=$(npm root -g) node tests/run-qa.cjs [baseUrl]
 *
 * Covers: every route on direct load, metadata/noindex/disclaimer, console
 * errors, horizontal overflow at 7 viewports, navigation, mobile menu
 * keyboard behaviour, catalogue search/filters/empty state, product finder,
 * English/Spanish switch (whole site, islands, Guide, checkout), Product Guide required
 * conversations, shop cart and demo checkout (no card fields, no payment
 * requests), session persistence, WebGL/fallback/reduced motion, link
 * formats, axe-core accessibility scan, and a network audit proving that no
 * interaction contacts any third-party origin.
 */
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [path.resolve(__dirname, '..')] }), 'utf8');

const BASE = process.argv[2] || 'http://localhost:4322';
const ORIGIN = new URL(BASE).origin;
const ROUTES = [
  '/', '/products/', '/brands/', '/locations/', '/about/', '/concept/', '/find/',
  '/products/power-tools/', '/products/welding-supplies/', '/products/generators/', '/products/water-pumps/',
  '/products/lawn-and-garden/', '/products/motorcycles/', '/products/household/', '/products/lighting-and-fans/',
  '/products/woodworking/', '/products/shop-tools/', '/products/agriculture/', '/products/hand-tools/',
  '/shop/', '/shop/makita-hp333dyx3b/', '/shop/lifan-lf100-a/', '/cart/', '/checkout/',
];
const VIEWPORTS = [
  [320, 640], [375, 812], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900],
];
const results = [];
let failed = 0;
const record = (group, name, pass, detail = '') => {
  results.push({ group, name, pass, detail });
  if (!pass) failed++;
  console.log(`${pass ? '  ✓' : '  ✗'} [${group}] ${name}${detail ? ` — ${detail}` : ''}`);
};

const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };

async function newPage(browser, vp = [1440, 900], opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: vp[0], height: vp[1] }, ...opts });
  const page = await ctx.newPage();
  page._errors = [];
  page._external = [];
  page.on('console', (m) => { if (m.type() === 'error') page._errors.push(m.text()); });
  page.on('pageerror', (e) => page._errors.push(e.message));
  page.on('request', (r) => { const u = r.url(); if (!u.startsWith(ORIGIN) && !u.startsWith('data:') && !u.startsWith('blob:')) page._external.push(u); });
  return { ctx, page };
}

(async () => {
  const browser = await chromium.launch(LAUNCH);

  /* ---------- 1. Routes: direct load, metadata, console, axe ---------- */
  console.log('\n▶ Routes (direct load / refresh)');
  for (const r of ROUTES) {
    const { ctx, page } = await newPage(browser);
    const resp = await page.goto(BASE + r, { waitUntil: 'load' });
    await page.waitForTimeout(r === '/' ? 3500 : 1600);
    const meta = await page.evaluate(() => ({
      title: document.title,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') || '',
      h1: document.querySelectorAll('h1').length,
      disclaimer: document.body.innerText.includes('Not commissioned, approved or affiliated with Universal Hardware Company Ltd.'),
      concept: !!document.querySelector('.utility__badge'),
      imgsNoAlt: Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt')).length,
    }));
    const ok = resp.status() === 200 && meta.robots.startsWith('noindex') && meta.h1 === 1 && meta.disclaimer && meta.concept && !meta.imgsNoAlt;
    record('route', r, ok, `status ${resp.status()}, h1=${meta.h1}, noindex=${meta.robots.startsWith('noindex')}, disclaimer=${meta.disclaimer}`);

    const errs = page._errors.filter((e) => !/Failed to load resource/.test(e) || true);
    record('console', r, errs.length === 0, errs.join(' | '));
    // axe-core
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => {
      const res = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } });
      return res.violations.map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(', ')}`);
    });
    record('axe', r, axe.length === 0, axe.join(' || '));
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((res) => setTimeout(res, 60));
      }
      window.scrollTo(0, 0);
    });
    // Force lazy images to load so every image URL on the page is verified.
    const broken = await page.evaluate(async () => {
      // Slideshow images after the first carry their URLs in data-* until needed.
      document.querySelectorAll('[data-srcset]').forEach((el) => el.setAttribute('srcset', el.dataset.srcset));
      document.querySelectorAll('img[data-src]').forEach((el) => (el.src = el.dataset.src));
      const imgs = Array.from(document.images);
      imgs.forEach((i) => (i.loading = 'eager'));
      await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); setTimeout(r, 5000); }))));
      return imgs.filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src);
    });
    record('images', `${r} every image loads`, broken.length === 0, broken.join(', '));
    record('network', `${r} loads no third-party resources`, page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    const resp = await page.goto(BASE + '/this-page-does-not-exist/', { waitUntil: 'load' });
    const t = await page.textContent('h1');
    record('route', '404 for unknown URL', resp.status() === 404 && /isn't on the shelf/.test(t), `status ${resp.status()}`);
    const resp2 = await page.goto(BASE + '/products', { waitUntil: 'load' });
    record('route', '/products (no slash) resolves', resp2.status() === 200 && page.url().endsWith('/products/'), page.url());
    await ctx.close();
  }

  /* ---------- 2. Overflow at every viewport ---------- */
  console.log('\n▶ Horizontal overflow');
  for (const vp of VIEWPORTS) {
    const { ctx, page } = await newPage(browser, vp);
    const bad = [];
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(150);
      const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (ov > 0) bad.push(`${r} (+${ov}px)`);
    }
    record('overflow', `${vp[0]}×${vp[1]} all routes`, bad.length === 0, bad.join(', '));
    await ctx.close();
  }

  /* ---------- 3. Navigation & mobile menu ---------- */
  console.log('\n▶ Navigation');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    for (const [label, href] of [['Shop', '/shop/'], ['Products', '/products/'], ['Brands', '/brands/'], ['Locations', '/locations/'], ['About', '/about/']]) {
      await page.click(`.site-nav a:has-text("${label}")`);
      await page.waitForLoadState('load');
      const cur = await page.getAttribute('.site-nav a[aria-current="page"]', 'href').catch(() => null);
      record('nav', `header → ${label}`, page.url().endsWith(href) && cur === href, page.url());
    }
    await page.click('.site-header__explore');
    record('nav', 'header Explore Products CTA', page.url().endsWith('/products/'));
    await page.click('.site-header__find');
    record('nav', 'header Find the Right Product CTA', page.url().endsWith('/find/'));
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.click('.hero__ctas a:has-text("Find the Right Solution")');
    await page.waitForTimeout(600);
    record('nav', 'hero secondary CTA → #finder', page.url().endsWith('#finder'));
    const depts = await page.$$eval('.dept__link', (as) => as.map((a) => a.getAttribute('href')));
    let deptOk = true;
    for (const h of depts) { const r = await page.request.get(BASE + h); if (r.status() !== 200) deptOk = false; }
    record('nav', `8 department tiles link to live category pages`, depts.length === 8 && deptOk, depts.join(' '));
    // every internal link across all routes resolves
    const seen = new Set();
    const broken = [];
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href').split('#')[0]));
      for (const h of hrefs) {
        if (seen.has(h) || !h) continue;
        seen.add(h);
        const res = await page.request.get(BASE + h);
        if (res.status() !== 200) broken.push(`${h} (${res.status()}) on ${r}`);
      }
    }
    record('nav', `all ${seen.size} internal link targets resolve`, broken.length === 0, broken.join(', '));
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, [390, 844], { hasTouch: true, isMobile: true });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.click('[data-menu-open]');
    await page.waitForTimeout(400);
    const open = await page.evaluate(() => document.querySelector('[data-mobile-nav]').open);
    const expanded = await page.getAttribute('[data-menu-open]', 'aria-expanded');
    const focusInside = await page.evaluate(() => document.querySelector('[data-mobile-nav]').contains(document.activeElement));
    record('mobile-menu', 'opens as modal dialog with focus inside', open && expanded === 'true' && focusInside);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    const closed = await page.evaluate(() => !document.querySelector('[data-mobile-nav]').open);
    const back = await page.evaluate(() => document.activeElement?.hasAttribute('data-menu-open'));
    record('mobile-menu', 'Escape closes and returns focus to trigger', closed && back);
    await page.click('[data-menu-open]');
    await page.waitForTimeout(300);
    await page.click('.mobile-nav__links a:has-text("Locations")');
    await page.waitForLoadState('load');
    record('mobile-menu', 'menu link navigates', page.url().endsWith('/locations/'));
    const tt = await page.$$eval('a, button', (els) => els.filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && cs.visibility !== 'hidden' && e.offsetParent && (r.height < 24 || r.width < 24) && !e.closest('.crumbs, p, li, dd, address, figcaption, .site-footer__meta'); }).map((e) => (e.textContent || e.getAttribute('aria-label') || '').trim().slice(0, 30)));
    record('mobile-menu', 'no tiny standalone tap targets (<24px) on /locations/', tt.length === 0, tt.join(' | '));
    await ctx.close();
  }

  /* ---------- 4. Catalogue search ---------- */
  console.log('\n▶ Catalogue search');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/products/', { waitUntil: 'load' });
    await page.waitForSelector('.cat-card');
    await page.waitForFunction(() => { const i = document.querySelector('astro-island[component-url*="CatalogueSearch"]'); return i && !i.hasAttribute('ssr'); });
    const all = await page.$$eval('.cat-card', (c) => c.length);
    record('search', 'shows all 12 categories by default', all === 12, `${all}`);
    const t0 = Date.now();
    await page.fill('#catalogue-q', 'submersible pump');
    await page.waitForTimeout(100);
    const names = await page.$$eval('.cat-card__title', (h) => h.map((x) => x.textContent.trim()));
    const match = await page.$$eval('.cat-card__subs .is-match', (h) => h.map((x) => x.textContent.trim()));
    record('search', '"submersible pump" → Water Pumps with highlighted sub-type', names[0] === 'Water Pumps' && match.includes('Submersible pumps'), `${names.join(', ')} | ${match.join(', ')} (${Date.now() - t0}ms)`);
    const url = page.url();
    record('search', 'query synced to URL', /\?q=submersible\+pump/.test(url), url);
    for (const [q, expect] of [['MIG welder', 'Welding Supplies'], ['makita', 'Power Tools'], ['planta', 'Generators'], ['bomba de agua', 'Water Pumps'], ['chainsaws', 'Lawn and Garden'], ['fridge', 'Household'], ['barbed wire', 'Agriculture'], ['genrator', 'Generators'], ['scooter', 'Motorcycles & Equipment']]) {
      await page.fill('#catalogue-q', q);
      await page.waitForTimeout(60);
      const n = await page.$$eval('.cat-card__title', (h) => h.map((x) => x.textContent.trim()));
      record('search', `"${q}" → ${expect}`, n.includes(expect), n.slice(0, 4).join(', '));
    }
    await page.fill('#catalogue-q', 'zzqx spaceship');
    await page.waitForTimeout(80);
    const empty = await page.isVisible('.catalogue__empty');
    record('search', 'no-match query shows finished empty state', empty);
    await page.click('.catalogue__empty .btn--ghost');
    await page.waitForTimeout(80);
    record('search', 'empty state "clear" restores 12', (await page.$$eval('.cat-card', (c) => c.length)) === 12);
    await page.click('.catalogue__depts .chip:has-text("Home & Appliances")');
    await page.waitForTimeout(60);
    const dn = await page.$$eval('.cat-card__title', (h) => h.map((x) => x.textContent.trim()));
    record('search', 'department filter (Home & Appliances)', dn.length === 2 && dn.includes('Household') && dn.includes('Lighting and Fans'), dn.join(', '));
    await page.click('.catalogue__depts .chip:has-text("All departments")');
    await page.selectOption('#catalogue-brand', 'lincoln-electric');
    await page.waitForTimeout(60);
    const bn = await page.$$eval('.cat-card__title', (h) => h.map((x) => x.textContent.trim()));
    record('search', 'brand filter (Lincoln Electric) → Welding + Generators', bn.length === 2 && bn.includes('Welding Supplies') && bn.includes('Generators'), bn.join(', '));
    await page.goto(BASE + '/products/?q=hammer+drill', { waitUntil: 'load' });
    await page.waitForTimeout(400);
    const dl = await page.$$eval('.cat-card__title', (h) => h.map((x) => x.textContent.trim()));
    record('search', 'deep link ?q=hammer+drill restores results on load', dl[0] === 'Power Tools', dl.join(', '));
    await ctx.close();
  }

  /* ---------- 5. Finder ---------- */
  console.log('\n▶ Product finder');
  {
    const { ctx, page } = await newPage(browser, [1440, 900], { permissions: ['clipboard-read', 'clipboard-write'] });
    await page.goto(BASE + '/find/', { waitUntil: 'load' });
    await page.waitForSelector('.finder__path');
    const paths = await page.$$eval('.finder__path-label', (p) => p.map((x) => x.textContent.trim()));
    record('finder', 'six need paths', paths.join('|') === 'Power tools|Backup power|Water pumping|Outdoor maintenance|Motorcycles|Household needs', paths.join(', '));
    await page.click('.finder__path:has-text("Backup power")');
    await page.click('.finder__option:has-text("Lights, fridge & fans")');
    await page.click('.finder__option:has-text("Occasional outages")');
    await page.click('.finder__option:has-text("At home")');
    await page.waitForSelector('.finder__results');
    const best = await page.textContent('.match--primary .match__title');
    const caution = await page.textContent('.finder__caution');
    record('finder', 'backup power → Generators with electrician caution', best.trim() === 'Generators' && /electrician/i.test(caution), best);
    await page.click('.finder__link:has-text("Change answers")');
    record('finder', 'back navigation returns to last question', await page.isVisible('.finder__option:has-text("Shop or business premises")'));
    await page.click('.finder__option:has-text("Farm or ranch")');
    const titles = await page.$$eval('.match__title', (h) => h.map((x) => x.textContent.trim()));
    record('finder', 'farm answer adds Water Pumps as related', titles.includes('Water Pumps'), titles.join(', '));
    // Water pumping path
    await page.click('.finder__link:has-text("Start over")');
    await page.click('.finder__path:has-text("Water pumping")');
    await page.click('.finder__option:has-text("Deep well or borehole")');
    await page.click('.finder__option:has-text("Household water pressure")');
    await page.click('.finder__option:has-text("Yes")');
    const pumpFocus = await page.$$eval('.match--primary .match__focus li', (l) => l.map((x) => x.textContent.trim()));
    record('finder', 'deep well → Submersible pumps', pumpFocus.includes('Submersible pumps'), pumpFocus.join(', '));
    const leftovers = await page.evaluate(() => document.querySelectorAll('[data-open-enquiry], .enquiry-trigger, [data-enquiry-toggle]').length + (document.body.innerText.includes('Enquiry Summary') ? 1 : 0));
    record('finder', 'no Enquiry Summary controls or wording remain', leftovers === 0, `${leftovers}`);
    await page.click('.finder__next button:has-text("Ask the Product Guide")');
    await page.waitForSelector('.guide:not([hidden]) .msg--user', { timeout: 8000 });
    const handed = await page.$$eval('.guide .msg--user', (m) => m.map((x) => x.textContent.trim()).join(' | '));
    record('finder', 'Next step hands the answers to the Product Guide', handed.length > 10, handed.slice(0, 80));
    await page.keyboard.press('Escape');
    record('network', 'finder flows made no third-party requests', page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }

  /* ---------- 6. Product Guide ---------- */
  console.log('\n▶ Product Guide');
  {
    const { ctx, page } = await newPage(browser, [1440, 900]);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForSelector('.guide-launcher');
    await page.click('.guide-launcher');
    await page.waitForSelector('.msg--guide');
    const head = await page.textContent('.guide__sub');
    record('guide', 'panel opens with the Product Guide welcome', /Products, branches and services/.test(head) && /Product Guide/.test(await page.textContent('.msg--guide')), head);
    const ask = async (q) => {
      const before = await page.$$eval('.msg--guide', (m) => m.length);
      await page.fill('#guide-input', q);
      await page.press('#guide-input', 'Enter');
      await page.waitForFunction((n) => document.querySelectorAll('.msg--guide').length > n, before);
      return page.$$eval('.msg--guide', (m) => m[m.length - 1].innerText);
    };
    const cases = [
      ['I need backup power for my home. What type should I look at?', /appliances/i, 'generator asks appliances'],
      ['Lights, fridge and fans', /occasional|regular/i, 'generator asks frequency'],
      ['Occasional outages', /qualified electrician/i, 'generator recommends electrician'],
      ['I need a cordless drill for concrete and steel.', /hammer drill/i, 'drill distinguishes hammer vs standard'],
      ['I need a pump for my home water supply.', /deep well/i, 'pump clarifies source/depth'],
      ['Do you carry motorbikes?', /Meilun/, 'motorbikes → Meilun & Lifan page, no availability'],
      ['Where is your Belize City store?', /3380 Chetumal Street[\s\S]*224-4140/, 'Belize City branch details'],
      ['Can you send me a quote?', /can't send quotes[\s\S]*WhatsApp/i, 'quote → cannot transmit, points to branch WhatsApp'],
      ['Are you a real AI?', /rule-based/i, 'honest about being rule-based when asked'],
    ];
    for (const [q, re, name] of cases) {
      const t = await ask(q);
      record('guide', name, re.test(t), t.replace(/\s+/g, ' ').slice(0, 120));
    }
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => [...document.querySelectorAll('.msg--guide')].some((m) => /Hola/.test(m.textContent)), null, { timeout: 8000 }).catch(() => {});
    const welcomeEs = await page.$$eval('.msg--guide', (m) => m[m.length - 1].innerText);
    const es = await ask('Necesito una bomba de agua');
    record('guide', 'site switch to Spanish switches the Guide (welcome + replies)', /Hola/.test(welcomeEs) && /bomba/i.test(es) && /agua/i.test(es), es.slice(0, 80));
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    await page.focus('#guide-input');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    record('guide', 'Escape closes panel', await page.evaluate(() => document.querySelector('.guide').hidden));
    await page.goto(BASE + '/products/water-pumps/', { waitUntil: 'load' });
    await page.click('[data-open-guide]');
    await page.waitForFunction(() => document.querySelectorAll('.msg--user').length > 0, null, { timeout: 5000 }).catch(() => {});
    const prompted = await page.$$eval('.msg--user', (m) => m.map((x) => x.textContent));
    record('guide', 'category page hands a contextual prompt to the guide', prompted.some((t) => /pump/i.test(t)), prompted.join(' | '));
    record('network', 'guide conversations made no third-party requests', page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }

  /* ---------- 6b. English / Spanish ---------- */
  console.log('\n▶ English / Spanish');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const esChunkEarly = await page.evaluate(() => performance.getEntriesByType('resource').some((r) => /\/es\.[\w-]+\.js/.test(r.name)));
    record('i18n', 'English pages do not load the Spanish dictionary', !esChunkEarly);
    const label = await page.getAttribute('[data-lang-toggle]', 'aria-label');
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => document.documentElement.classList.contains('i18n-done') && document.documentElement.lang === 'es');
    const es = await page.evaluate(() => ({ h1: document.querySelector('h1').textContent.replace(/\s+/g, ' ').trim(), nav: [...document.querySelectorAll('.site-nav a')].map((a) => a.textContent.trim()).join('|'), title: document.title, btn: document.querySelector('[data-lang-toggle]').getAttribute('aria-label') }));
    record('i18n', 'header switch flips the page to Spanish (h1, menu, title, button label)', es.h1 === 'Hecho para cada trabajo.' && es.nav === 'Tienda|Productos|Marcas|Sucursales|Nosotros' && /Hecho para cada trabajo/.test(es.title) && label === 'Ver el sitio en español' && es.btn === 'View the site in English', JSON.stringify(es));
    await page.goto(BASE + '/shop/', { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('i18n-done'));
    record('i18n', 'Spanish persists across pages', (await page.textContent('h1')).includes('Pida en línea'));
    await page.click('[data-add-to-cart="makita-hp333dyx3b"]');
    await page.waitForSelector('.toast');
    const toastEs = await page.textContent('.toast');
    record('i18n', 'island toasts follow the language', /se agregó a su carrito/.test(toastEs) && /Ver carrito/.test(toastEs), toastEs);
    await page.goto(BASE + '/checkout/', { waitUntil: 'load' });
    await page.waitForSelector('.pay-demo');
    await page.waitForTimeout(200);
    await page.click('.pay-btn');
    await page.waitForTimeout(200);
    const errs = await page.$$eval('.field-error', (e) => e.map((x) => x.textContent));
    const pay = await page.textContent('.pay-btn');
    record('i18n', 'checkout in Spanish (errors, pay button)', errs.includes('Ingrese su nombre.') && /Pagar BZ\$248\.25/.test(pay), `${errs.join(' / ')} · ${pay}`);
    await page.click('.link-btn');
    await page.click('.pay-btn');
    await page.waitForSelector('.confirm', { timeout: 8000 });
    const conf = await page.textContent('.confirm');
    record('i18n', 'order confirmation in Spanish', /Pago aprobado/.test(conf) && /Recoger en|Recoja|Su pedido/.test(conf) && /Pedido TEST-/.test(conf), conf.replace(/\s+/g, ' ').slice(0, 120));
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map((v) => `${v.id} ×${v.nodes.length}`));
    record('axe', 'Spanish checkout confirmation', axe.length === 0, axe.join(' || '));
    await page.click('[data-lang-toggle]');
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    record('i18n', 'switching back restores English without a reload', /Payment approved/.test(await page.textContent('.confirm')) && (await page.textContent('h1')).trim() === 'Checkout');
    record('network', 'language switching made no third-party requests', page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, [390, 844], { locale: 'es-ES' });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('i18n-done'));
    const h1 = (await page.textContent('h1')).replace(/\s+/g, ' ').trim();
    record('i18n', 'a Spanish-language browser opens in Spanish', h1 === 'Hecho para cada trabajo.', h1);
    await page.addScriptTag({ content: AXE });
    const axe = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map((v) => `${v.id} ×${v.nodes.length}`));
    record('axe', 'Spanish homepage (mobile)', axe.length === 0, axe.join(' || '));
    const bad = [];
    for (const vp of [[320, 640], [1024, 768], [1200, 800]]) {
      await page.setViewportSize({ width: vp[0], height: vp[1] });
      for (const r of ['/', '/shop/', '/checkout/', '/products/power-tools/', '/locations/']) {
        await page.goto(BASE + r, { waitUntil: 'load' });
        await page.waitForFunction(() => document.documentElement.classList.contains('i18n-done'));
        const ov = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        if (ov > 0) bad.push(`${vp[0]} ${r} (+${ov}px)`);
      }
    }
    record('overflow', 'Spanish: no horizontal overflow at 320, 1024 and 1200 px', bad.length === 0, bad.join(', '));
    await ctx.close();
  }

  /* ---------- 7. Branches & links ---------- */
  console.log('\n▶ Branches & outbound links');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/locations/', { waitUntil: 'load' });
    const tels = await page.$$eval('a[href^="tel:"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))]);
    const was = await page.$$eval('a[href^="https://wa.me/"]', (a) => [...new Set(a.map((x) => x.getAttribute('href')))]);
    const expectTel = ['tel:+5018230254', 'tel:+5018800254', 'tel:+5012244140', 'tel:+5012800254'];
    const expectWa = ['https://wa.me/5016529933', 'https://wa.me/5016680311', 'https://wa.me/5016673937', 'https://wa.me/5016529330'];
    record('links', 'tel: links match website-listed numbers', expectTel.every((t) => tels.includes(t)) && tels.every((t) => /^tel:\+501\d{7}$/.test(t)), tels.join(' '));
    record('links', 'wa.me links match website-listed WhatsApp numbers', expectWa.every((t) => was.includes(t)) && was.every((t) => /^https:\/\/wa\.me\/501\d{7}$/.test(t)), was.join(' '));
    const ext = await page.$$eval('a[target="_blank"]', (a) => a.filter((x) => !(x.getAttribute('rel') || '').includes('noopener')).length);
    record('links', 'external links open with rel=noopener', ext === 0);
    await page.click('[data-branch-select="spanish-lookout"].chip');
    const sel = await page.evaluate(() => document.querySelector('[data-branch-card="spanish-lookout"]').classList.contains('is-selected'));
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const sel2 = await page.getAttribute('.branch [data-branch-select="spanish-lookout"]', 'aria-pressed');
    record('branch', 'preferred branch persists for the session', sel && sel2 === 'true');
    const store = await page.evaluate(() => ({ local: Object.keys(localStorage), cookies: document.cookie }));
    record('privacy', 'no localStorage keys or cookies written', store.local.length === 0 && !store.cookies, JSON.stringify(store));
    record('network', 'no third-party requests on navigation', page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }

  /* ---------- 7b. Shop, cart & demo checkout ---------- */
  console.log('\n▶ Shop & checkout');
  {
    const { ctx, page } = await newPage(browser);
    const writes = [];
    page.on('request', (r) => { if (r.method() !== 'GET') writes.push(`${r.method()} ${r.url()}`); });
    const axeCheck = async (name) => {
      await page.addScriptTag({ content: AXE });
      const v = await page.evaluate(async () => (await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'], rules: { region: { enabled: false } } })).violations.map((x) => `${x.id} ×${x.nodes.length}: ${x.nodes[0].target.join(' ')}`));
      record('axe', name, v.length === 0, v.join(' || '));
    };
    const badge = () => page.$eval('[data-cart-count]', (e) => (e.hidden ? 0 : Number(e.textContent)));
    await page.goto(BASE + '/shop/', { waitUntil: 'load' });
    await page.waitForFunction(() => document.documentElement.classList.contains('ui-ready'));
    const cards = await page.$$eval('.shop-grid .p-card', (c) => c.length);
    const priced = await page.$$eval('.p-card__price', (p) => p.every((x) => /^BZ\$[\d,]+\.\d{2}/.test(x.textContent.trim())));
    record('shop', 'lists 32 products, each with a BZ$ price', cards === 32 && priced, `${cards}`);
    await page.click('[data-shop-filter="motorcycles"]');
    const bikes = await page.$$eval('.shop-grid > li:not([hidden])', (l) => l.length);
    record('shop', 'motorcycle filter shows the 16 bikes', bikes === 16, `${bikes}`);
    await page.click('[data-shop-filter="all"]');
    await page.click('[data-add-to-cart="makita-hp333dyx3b"]');
    await page.selectOption('[data-product="lifan-lf100-a"] [data-colour]', 'Blue');
    await page.click('[data-add-to-cart="lifan-lf100-a"]');
    await page.waitForSelector('.toast a[href="/cart/"]');
    record('shop', 'add to cart updates the header count and offers View cart', (await badge()) === 2);
    await page.goto(BASE + '/shop/makita-dlx2180tx/', { waitUntil: 'load' });
    await page.selectOption('[data-qty]', '2');
    await page.click('.pdp [data-add-to-cart]');
    record('shop', 'product page adds the chosen quantity', (await badge()) === 4);
    await page.goto(BASE + '/cart/', { waitUntil: 'load' });
    await page.waitForSelector('.cart-line');
    const cart = await page.evaluate(() => ({ lines: document.querySelectorAll('.cart-line').length, total: document.querySelector('.summary__total span:last-child').textContent, colour: document.body.innerText.includes('Blue · BZ$1,742.40 each') }));
    record('cart', 'cart survives navigation with the right lines, colour and total', cart.lines === 3 && cart.total === 'BZ$3,654.15' && cart.colour, JSON.stringify(cart));
    await axeCheck('/cart/ with items');
    await page.click('.cart-line:nth-child(1) .stepper button:last-child');
    record('cart', 'stepper raises quantity and total', (await page.textContent('.summary__total span:last-child')) === 'BZ$3,902.40');
    await page.click('.cart-line:nth-child(1) .link-btn');
    record('cart', 'remove deletes the line', (await page.$$eval('.cart-line', (l) => l.length)) === 2);
    await page.goto(BASE + '/checkout/', { waitUntil: 'load' });
    await page.waitForSelector('.pay-demo');
    const cardFields = await page.$$eval('input, iframe', (els) => els.filter((e) => /cc-|card|cvc|cvv|expir/i.test(`${e.getAttribute('autocomplete')} ${e.getAttribute('name')} ${e.id}`) || e.tagName === 'IFRAME').length);
    record('checkout', 'demo card step has no card inputs or third-party frames', cardFields === 0, `${cardFields}`);
    await page.press('#co-phone', 'Enter');
    const errs = await page.evaluate(() => ({ n: document.querySelectorAll('.field-error').length, focus: document.activeElement?.id }));
    record('checkout', 'Enter with empty details rejects them and focuses the first field', errs.n === 3 && errs.focus === 'co-name', JSON.stringify(errs));
    await axeCheck('/checkout/ with errors');
    await page.click('text=Fill in sample details');
    await page.click('.seg label:has-text("Declined")');
    await page.click('.pay-btn');
    await page.waitForSelector('.pay-error', { timeout: 6000 });
    record('checkout', 'simulated decline shows an alert and keeps the cart', (await badge()) === 3);
    await page.click('.seg label:has-text("Approved")');
    await page.click('.pay-btn');
    await page.waitForSelector('.confirm', { timeout: 6000 });
    const conf = await page.evaluate(() => ({ ref: document.querySelector('.confirm__ref').textContent, demo: document.body.innerText.includes('no card was charged') }));
    record('checkout', 'approved simulated payment shows a TEST order reference and empties the cart', /^Order TEST-[A-Z2-9]{6}$/.test(conf.ref) && conf.demo && (await badge()) === 0, JSON.stringify(conf));
    await axeCheck('/checkout/ confirmation');
    const stored = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(sessionStorage))) + window.name);
    record('privacy', 'checkout details are never stored', !/Sample Customer|example\.com|000-0000/.test(stored), stored.slice(0, 120));
    record('network', 'shop and checkout sent nothing (no POST or other writes)', writes.length === 0, writes.join(', '));
    record('network', 'shop and checkout made no third-party requests', page._external.length === 0, page._external.join(', '));
    await ctx.close();
  }

  /* ---------- 7c. Homepage slideshow above the 3D hero ---------- */
  console.log('\n▶ Homepage slideshow');
  for (const [vp, variant] of [[[1440, 900], 'desktop'], [[768, 1024], 'desktop'], [[390, 844], 'mobile']]) {
    const { ctx, page } = await newPage(browser, vp);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const info = await page.evaluate(() => {
      const reel = document.querySelector('[data-reel]').getBoundingClientRect();
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const img = document.querySelector('[data-reel-slide].is-active img');
      return { above: reel.bottom <= hero.top + 1, first: document.querySelector('main > *') === document.querySelector('[data-reel]'), src: img.currentSrc, h: Math.round(reel.height) };
    });
    record('reel', `${vp[0]}×${vp[1]}: slideshow opens the page, 3D drill hero directly below, ${variant} images`, info.above && info.first && info.src.includes(`-${variant}-`), JSON.stringify(info));
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(1500);
    const early = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => r.name.includes('/hero/slides/')).map((r) => r.name.split('/').pop()));
    record('reel', 'only the first slideshow image loads with the page', early.length === 1 && early[0].startsWith('storefront-'), early.join(', '));
    const t0 = Date.now();
    await page.waitForFunction(() => document.querySelectorAll('[data-reel-slide]')[1].classList.contains('is-active'), null, { timeout: 12000 });
    const dt = Date.now() - t0;
    const hidden = await page.$$eval('[data-reel-slide]', (s) => s.map((x) => x.getAttribute('aria-hidden')));
    record('reel', 'autoplay fades to the next slide after about 7 s; inactive slides are aria-hidden', dt > 3500 && dt < 8000 && hidden.join() === 'true,,true', `${dt} ms after load, aria-hidden ${hidden.join()}`);
    await page.click('[data-reel-go="2"]');
    await page.waitForTimeout(8200);
    const after = await page.evaluate(() => ({ third: document.querySelectorAll('[data-reel-slide]')[2].classList.contains('is-active'), playing: document.querySelector('[data-reel]').classList.contains('is-playing') }));
    const label = await page.getAttribute('[data-reel-toggle]', 'aria-label');
    record('reel', 'choosing a slide stops autoplay (still on it 8 s later)', after.third && !after.playing && label === 'Play slideshow', JSON.stringify({ ...after, label }));
    await page.click('[data-reel-toggle]');
    const resumed = await page.evaluate(() => document.querySelector('[data-reel]').classList.contains('is-playing'));
    await page.keyboard.press('ArrowRight');
    const keyed = await page
      .waitForFunction(() => document.querySelectorAll('[data-reel-slide]')[0].classList.contains('is-active'), null, { timeout: 3000 })
      .then(() => true, () => false);
    record('reel', 'Play resumes autoplay; arrow keys change slide', resumed && keyed);
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, [1440, 900], { reducedMotion: 'reduce' });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.waitForTimeout(8000);
    const st = await page.evaluate(() => ({ first: document.querySelectorAll('[data-reel-slide]')[0].classList.contains('is-active'), playing: document.querySelector('[data-reel]').classList.contains('is-playing') }));
    record('reel', 'reduced motion: slideshow starts paused on the first image', st.first && !st.playing, JSON.stringify(st));
    await ctx.close();
  }

  /* ---------- 8. 3D hero: WebGL, fallback, motion ---------- */
  console.log('\n▶ 3D hero');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const firstState = await page.evaluate(() => document.querySelector('[data-hero-stage]').dataset.state);
    const scriptsAtLoad = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /drill-scene/.test(r.name)).length);
    record('3d', 'WebGL bundle not loaded before first paint (poster first)', firstState === 'poster' || firstState === 'loading', `state at load: ${firstState}, scene chunks at load: ${scriptsAtLoad}`);
    await page.waitForTimeout(3000);
    const offscreen = await page.evaluate(() => ({ state: document.querySelector('[data-hero-stage]').dataset.state, chunks: performance.getEntriesByType('resource').filter((r) => /drill-scene/.test(r.name)).length }));
    record('3d', 'scene waits while the stage is below the slideshow (poster only)', offscreen.state === 'poster' && offscreen.chunks === 0, JSON.stringify(offscreen));
    // The stage sits below the homepage slideshow; its 1.6 s intro plays once it is on screen.
    await page.locator('[data-hero-stage]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-hero-stage]').dataset.state === 'ready', null, { timeout: 30000 });
    record('3d', 'real-time scene initialises (state=ready) once scrolled into view', true);
    await page.waitForTimeout(2000);
    const a = await page.locator('.hero__canvas').screenshot();
    await page.waitForTimeout(1200);
    const b = await page.locator('.hero__canvas').screenshot();
    record('3d', 'idle motion animates', !a.equals(b));
    await page.click('[data-hero-pause]');
    const label = await page.textContent('[data-hero-pause] [data-label]');
    // Pause stops the idle motion; the 1.6 s intro may still be settling under
    // software rendering, so wait (up to ~8 s) for frames to stop changing.
    let c = await page.locator('.hero__canvas').screenshot();
    let d = c;
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(900);
      d = await page.locator('.hero__canvas').screenshot();
      if (c.equals(d)) break;
      c = d;
    }
    record('3d', 'Pause 3D motion stops animation', c.equals(d) && /Resume/.test(label), label);
    // drag rotate
    const box = await page.locator('.hero__canvas').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 160, box.y + box.height / 2, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(200);
    const e = await page.locator('.hero__canvas').screenshot();
    record('3d', 'drag rotates the model', !e.equals(d));
    const ta = await page.evaluate(() => getComputedStyle(document.querySelector('[data-hero-stage]')).touchAction);
    record('3d', 'touch-action pan-y (no vertical scroll trap)', ta === 'pan-y', ta);
    await ctx.close();
  }
  {
    const { ctx, page } = await newPage(browser, [1440, 900], { reducedMotion: 'reduce' });
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.locator('[data-hero-stage]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-hero-stage]').dataset.state === 'ready', null, { timeout: 30000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(800);
    // A one-off re-render (e.g. a late layout change) is not motion; require
    // that consecutive frames stop changing.
    const a = await page.locator('.hero__canvas').screenshot();
    await page.waitForTimeout(1200);
    const b = await page.locator('.hero__canvas').screenshot();
    let still = a.equals(b);
    if (!still) {
      await page.waitForTimeout(1200);
      const c = await page.locator('.hero__canvas').screenshot();
      still = b.equals(c);
    }
    record('3d', 'prefers-reduced-motion: no idle animation', still);
    const revealHidden = await page.$$eval('[data-reveal]', (els) => els.filter((e) => getComputedStyle(e).opacity !== '1').length);
    record('motion', 'reduced motion: reveal content visible immediately', revealHidden === 0, `${revealHidden} hidden`);
    await ctx.close();
  }
  {
    const browser2 = await chromium.launch({ args: ['--disable-gpu', '--disable-webgl', '--disable-webgl2', '--disable-3d-apis'] });
    const ctx = await browser2.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.locator('[data-hero-stage]').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => document.querySelector('[data-hero-stage]').dataset.state === 'fallback', null, { timeout: 10000 }).catch(() => {});
    const st = await page.evaluate(() => document.querySelector('[data-hero-stage]').dataset.state);
    const posterVisible = await page.evaluate(() => { const i = document.querySelector('.hero__poster img'); return i.complete && i.naturalWidth > 0 && getComputedStyle(document.querySelector('.hero__poster')).opacity === '1'; });
    const badge = await page.isVisible('.hero__badge-static');
    record('3d', 'no-WebGL browser: honest static render + "Static render" badge', st === 'fallback' && posterVisible && badge && errs.length === 0, `state=${st}`);
    await browser2.close();
  }
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    await page.click('[data-motion-toggle]');
    const m = await page.evaluate(() => document.documentElement.dataset.motion);
    await page.goto(BASE + '/about/', { waitUntil: 'load' });
    const m2 = await page.evaluate(() => document.documentElement.dataset.motion);
    record('motion', 'footer Reduce motion toggle applies and persists for session', m === 'reduced' && m2 === 'reduced');
    await ctx.close();
  }

  await browser.close();
  const outDir = path.join(__dirname, 'results');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'qa-results.json'), JSON.stringify({ base: BASE, date: new Date().toISOString(), passed: results.filter((r) => r.pass).length, failed, results }, null, 2));
  console.log(`\n${results.length - failed}/${results.length} checks passed${failed ? `, ${failed} failed` : ''}.`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(2);
});
