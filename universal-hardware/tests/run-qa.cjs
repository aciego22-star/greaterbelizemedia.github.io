/**
 * End-to-end QA for the Universal Hardware concept build.
 *
 *   npm run build && node scripts/serve.mjs dist 4322 &
 *   NODE_PATH=$(npm root -g) node tests/run-qa.cjs [baseUrl]
 *
 * Covers: every route on direct load, metadata/noindex/disclaimer, console
 * errors, horizontal overflow at 7 viewports, navigation, mobile menu
 * keyboard behaviour, catalogue search/filters/empty state, product finder,
 * Enquiry Summary add/remove/copy/reset + focus trap, Product Guide required
 * conversations, session persistence, WebGL/fallback/reduced motion, link
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
      official: !!document.querySelector('a[href="https://universalhardware.bz/"]'),
      imgsNoAlt: Array.from(document.querySelectorAll('img')).filter((i) => !i.hasAttribute('alt')).length,
    }));
    const ok = resp.status() === 200 && meta.robots.startsWith('noindex') && meta.h1 === 1 && meta.disclaimer && meta.concept && meta.official && !meta.imgsNoAlt;
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
    for (const [label, href] of [['Products', '/products/'], ['Brands', '/brands/'], ['Locations', '/locations/'], ['About', '/about/']]) {
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

  /* ---------- 5. Finder → enquiry → drawer ---------- */
  console.log('\n▶ Product finder & Enquiry Summary');
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
    await page.click('.match--primary button:has-text("Add to Enquiry Summary")');
    await page.waitForTimeout(150);
    const count = await page.textContent('[data-enquiry-count]');
    const toastTxt = await page.textContent('.toast').catch(() => '');
    record('enquiry', 'add from finder updates header count + toast', count.trim() === '1' && /added/.test(toastTxt), `count=${count} toast="${toastTxt}"`);
    // Water pumping path
    await page.click('.finder__link:has-text("Start over")');
    await page.click('.finder__path:has-text("Water pumping")');
    await page.click('.finder__option:has-text("Deep well or borehole")');
    await page.click('.finder__option:has-text("Household water pressure")');
    await page.click('.finder__option:has-text("Yes")');
    const pumpFocus = await page.$$eval('.match--primary .match__focus li', (l) => l.map((x) => x.textContent.trim()));
    record('finder', 'deep well → Submersible pumps', pumpFocus.includes('Submersible pumps'), pumpFocus.join(', '));
    await page.click('.finder__next button:has-text("Build an Enquiry Summary")');
    await page.waitForSelector('.drawer:not([hidden])');
    const items = await page.$$eval('.enq-item__name', (l) => l.map((x) => x.textContent.trim()));
    record('enquiry', 'Build an Enquiry Summary opens drawer with items', items.includes('Generators') && items.includes('Water Pumps'), items.join(', '));
    const inert = await page.evaluate(() => document.querySelector('main').hasAttribute('inert'));
    const modal = await page.getAttribute('.drawer', 'aria-modal');
    record('enquiry', 'drawer is modal (aria-modal + inert background)', inert && modal === 'true');
    // focus trap
    let trapped = true;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press('Tab');
      const inside = await page.evaluate(() => document.querySelector('.drawer').contains(document.activeElement));
      if (!inside) { trapped = false; break; }
    }
    record('enquiry', 'focus is trapped inside drawer (40 tabs)', trapped);
    await page.selectOption('#enq-use', 'Home or household');
    await page.check('input[name="enq-branch"][value="belize-city"]');
    await page.fill('#enq-notes', 'Need to lift water 60 ft to a raised tank.');
    const preview = await page.inputValue('#enq-preview');
    record('enquiry', 'summary includes categories, use, branch, notes and disclaimer',
      /Generators/.test(preview) && /Water Pumps/.test(preview) && /Intended use: Home or household/.test(preview) && /Belize City — 3380 Chetumal Street/.test(preview) && /60 ft/.test(preview) && /Nothing has been sent or submitted/.test(preview));
    await page.click('.drawer__actions .btn:has-text("Copy summary")');
    await page.waitForTimeout(250);
    const clip = await page.evaluate(() => navigator.clipboard.readText()).catch(() => '');
    const live = await page.textContent('.drawer__live');
    record('enquiry', 'Copy summary writes text to clipboard + announces', clip === preview && /Nothing was sent/.test(live), live);
    await page.click('.enq-item__remove[aria-label="Remove Water Pumps"]');
    const after = await page.$$eval('.enq-item__name', (l) => l.map((x) => x.textContent.trim()));
    record('enquiry', 'remove item', after.length === 1 && after[0] === 'Generators', after.join(', '));
    await page.selectOption('#enq-add', 'welding-supplies');
    await page.click('.drawer__add button');
    const after2 = await page.$$eval('.enq-item__name', (l) => l.length);
    record('enquiry', 'add category from drawer select', after2 === 2);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
    const closed = await page.evaluate(() => document.querySelector('.drawer').hidden && !document.querySelector('main').hasAttribute('inert'));
    record('enquiry', 'Escape closes drawer and restores background', closed);
    // persistence across pages
    await page.goto(BASE + '/products/generators/', { waitUntil: 'load' });
    await page.waitForTimeout(300);
    const pressed = await page.getAttribute('[data-enquiry-toggle="generators"]', 'aria-pressed');
    const count2 = await page.textContent('[data-enquiry-count]');
    record('enquiry', 'draft persists across navigation (session)', pressed === 'true' && count2.trim() === '2', `pressed=${pressed} count=${count2}`);
    await page.click('[data-enquiry-toggle="generators"]');
    record('enquiry', 'category page toggle removes item', (await page.getAttribute('[data-enquiry-toggle="generators"]', 'aria-pressed')) === 'false');
    await page.click('.enquiry-trigger');
    await page.waitForSelector('.drawer:not([hidden])');
    await page.click('.drawer__actions .btn:has-text("Reset")');
    const confirmTxt = await page.textContent('.drawer__actions .btn--ghost');
    await page.click('.drawer__actions .btn--ghost');
    const empty = await page.isVisible('.drawer__empty');
    record('enquiry', 'Reset requires confirmation, then clears', /Tap again/.test(confirmTxt) && empty);
    record('network', 'finder + enquiry flows made no third-party requests', page._external.length === 0, page._external.join(', '));
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
    const disc = await page.textContent('.guide__disclose');
    record('guide', 'identified as rule-based concept, not live AI', /not live AI/.test(head) && /not Universal Hardware's official customer service/.test(disc), head);
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
      ['Can you send me a quote?', /can't send quotes/i, 'quote → cannot transmit, offers summary'],
    ];
    for (const [q, re, name] of cases) {
      const t = await ask(q);
      record('guide', name, re.test(t), t.replace(/\s+/g, ' ').slice(0, 120));
    }
    const addBtn = await page.$('.msg--guide:last-child .msg__btn--primary:has-text("Open Enquiry Summary")');
    record('guide', 'quote reply offers Open Enquiry Summary action', !!addBtn);
    await page.click('.guide__lang button:has-text("ES")');
    const es = await ask('Necesito una bomba de agua');
    record('guide', 'Spanish mode responds in Spanish', /bomba/i.test(es) && /agua/i.test(es), es.slice(0, 80));
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
    const off = await page.$$eval('a[href^="https://universalhardware.bz"]', (a) => a.length);
    record('links', 'official-site links present and point to universalhardware.bz', off > 0);
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

  /* ---------- 8. 3D hero: WebGL, fallback, motion ---------- */
  console.log('\n▶ 3D hero');
  {
    const { ctx, page } = await newPage(browser);
    await page.goto(BASE + '/', { waitUntil: 'load' });
    const firstState = await page.evaluate(() => document.querySelector('[data-hero-stage]').dataset.state);
    const scriptsAtLoad = await page.evaluate(() => performance.getEntriesByType('resource').filter((r) => /drill-scene/.test(r.name)).length);
    record('3d', 'WebGL bundle not loaded before first paint (poster first)', firstState === 'poster' || firstState === 'loading', `state at load: ${firstState}, scene chunks at load: ${scriptsAtLoad}`);
    await page.waitForFunction(() => document.querySelector('[data-hero-stage]').dataset.state === 'ready', null, { timeout: 30000 });
    record('3d', 'real-time scene initialises (state=ready)', true);
    const a = await page.locator('.hero__canvas').screenshot();
    await page.waitForTimeout(1200);
    const b = await page.locator('.hero__canvas').screenshot();
    record('3d', 'idle motion animates', !a.equals(b));
    await page.click('[data-hero-pause]');
    const label = await page.textContent('[data-hero-pause] [data-label]');
    await page.waitForTimeout(500);
    const c = await page.locator('.hero__canvas').screenshot();
    await page.waitForTimeout(900);
    const d = await page.locator('.hero__canvas').screenshot();
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
    await page.waitForTimeout(2500);
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
