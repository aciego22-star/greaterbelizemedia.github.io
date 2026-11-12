// End-to-end checks for the built demo. Serve the repo root first, e.g.
//   npx http-server -p 8080 -s .      then      node _alpuche-src/scripts/verify.cjs
// Optional: BASE=http://localhost:8080/demos/jose-m-alpuche
const { chromium, devices } = require('playwright');

const BASE = (process.env.BASE || 'http://localhost:8080/demos/jose-m-alpuche').replace(/\/$/, '');
const ROUTES = [
  '/', '/about/', '/practice-areas/', '/practice-areas/real-estate/', '/practice-areas/corporate-commercial/',
  '/practice-areas/banking-finance-tax-regulatory/', '/practice-areas/dispute-resolution/',
  '/practice-areas/intellectual-property/', '/practice-areas/family-law/', '/practice-areas/qualified-retired-persons/',
  '/working-with-us/', '/contact/', '/insights/', '/insights/buying-property-in-belize/',
  '/insights/starting-a-business-in-belize/', '/insights/planning-retirement-in-belize/', '/website-notice/',
];
const PHOTO_PAGES = {
  '/': 'Jasmine Halki', '/practice-areas/real-estate/': 'Jasmine Halki', '/practice-areas/corporate-commercial/': 'Jasmine Halki',
  '/practice-areas/banking-finance-tax-regulatory/': 'Jasmine Halki', '/practice-areas/dispute-resolution/': 'Haakon S. Krohn',
  '/practice-areas/qualified-retired-persons/': 'Dave ten Broek', '/insights/buying-property-in-belize/': 'Kaldari',
  '/insights/starting-a-business-in-belize/': 'Jasmine Halki', '/insights/planning-retirement-in-belize/': 'Didier Moïse',
};

let failures = 0;
let passes = 0;
const ok = (cond, msg) => { if (cond) passes++; else { failures++; console.log('  ✗ ' + msg); } };
const section = (t) => console.log('\n' + t);

(async () => {
  const browser = await chromium.launch();

  // 1. Routes, metadata and link integrity ---------------------------------
  section('Routes, metadata, links and images');
  const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  const checked = new Map();
  const outbound = new Set();
  for (const route of ROUTES) {
    const res = await page.goto(BASE + route, { waitUntil: 'load' });
    ok(res.status() === 200, `${route} returns 200 (got ${res.status()})`);
    const info = await page.evaluate(() => ({
      robots: document.querySelector('meta[name=robots]')?.content || '',
      title: document.title,
      desc: document.querySelector('meta[name=description]')?.content || '',
      og: document.querySelector('meta[property="og:image"]')?.content || '',
      h1: document.querySelectorAll('h1').length,
      lang: document.documentElement.lang,
      links: [...document.querySelectorAll('a[href]')].map((a) => a.href),
      imgs: [...document.images].map((i) => ({ src: i.currentSrc || i.src, w: i.getAttribute('width'), h: i.getAttribute('height'), alt: i.getAttribute('alt') })),
      credit: document.querySelector('.credit')?.textContent || '',
      contactLinks: [...document.querySelectorAll('a[href*="contact/"]')].map((a) => a.getAttribute('href')),
      crumbs: !!document.querySelector('nav.breadcrumb'),
      noticeLink: !!document.querySelector('footer a[href*="website-notice/#photo-credits"]'),
    }));
    ok(/noindex/.test(info.robots), `${route} is noindex`);
    ok(info.title && info.desc, `${route} has title and description`);
    ok(/^https?:\/\/.+\.jpg$/.test(info.og), `${route} has absolute og:image`);
    ok(info.h1 === 1, `${route} has one h1 (found ${info.h1})`);
    ok(info.lang === 'en', `${route} lang=en`);
    ok(info.noticeLink, `${route} footer links to photo credits`);
    if (route !== '/') ok(info.crumbs, `${route} has breadcrumb`);
    ok(info.contactLinks.length > 0, `${route} reaches the contact page`);
    for (const img of info.imgs) ok(img.w && img.h && img.alt !== null, `${route} image has dimensions and alt: ${img.src}`);
    if (PHOTO_PAGES[route]) ok(info.credit.includes(PHOTO_PAGES[route]), `${route} shows photo credit for ${PHOTO_PAGES[route]}`);
    if (route.startsWith('/practice-areas/') && route !== '/practice-areas/') {
      ok(info.contactLinks.some((h) => /contact\/\?area=/.test(h)), `${route} has a practice-specific consultation link`);
    }
    for (const href of info.links) {
      if (href.startsWith(BASE)) checked.set(href.split('#')[0], route);
      else if (/^https?:/.test(href)) outbound.add(href);
    }
  }
  for (const [href, from] of checked) {
    const res = await page.request.get(href);
    ok(res.status() === 200, `link ${href} (from ${from}) resolves (got ${res.status()})`);
  }
  // Every asset referenced by the CSS/HTML on the home page loads.
  const failed = [];
  page.on('response', (r) => { if (r.status() >= 400) failed.push(r.url()); });
  for (const route of ROUTES) {
    await page.goto(BASE + route, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { for (const i of document.images) i.loading = 'eager'; });
    await page.waitForLoadState('networkidle');
  }
  ok(failed.length === 0, `no failed asset requests (${failed.join(', ')})`);
  ok((await page.request.get(BASE + '/website-notice/')).ok() &&
     await page.goto(BASE + '/website-notice/').then(() => page.locator('#photo-credits').count()) === 1, 'website notice has #photo-credits anchor');
  console.log(`  ${checked.size} internal URLs checked; ${outbound.size} distinct external links (not fetched).`);

  // 2. Assistant -----------------------------------------------------------
  section('Office assistant (prepared answers)');
  const expectations = {
    property: { text: 'title searches', next: '/practice-areas/real-estate/' },
    business: { text: 'Online Business Registry System', next: '/practice-areas/corporate-commercial/' },
    retirement: { text: 'Belize Tourism Board', next: '/practice-areas/qualified-retired-persons/' },
    contact: { text: 'contact@alpuchelaw.com', next: '/contact/' },
    deadline: { text: 'I cannot determine a legal deadline', next: '/contact/' },
    documents: { text: 'keep documents and personal details out of this chat', next: '/contact/' },
    fees: { text: 'Ask the office about current consultation', next: '/contact/' },
    unlisted: { text: 'not listed', next: '/contact/' },
  };
  await page.goto(BASE + '/practice-areas/real-estate/');
  const requests = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.click('.office-assistant > summary');
  for (const [topic, exp] of Object.entries(expectations)) {
    await page.click(`button[data-topic="${topic}"]`);
    const ans = await page.locator('.assistant-answer').innerText();
    ok(ans.includes(exp.text), `assistant "${topic}" answer contains "${exp.text}"`);
    const href = await page.locator('.assistant-answer a.answer-next').evaluate((a) => a.href);
    ok(href.startsWith(BASE + exp.next), `assistant "${topic}" routes to ${exp.next} (got ${href})`);
  }
  ok(await page.locator('.assistant-answer.urgent').count() === 0, 'last answer not flagged urgent');
  await page.click('button[data-topic="deadline"]');
  ok(await page.locator('.assistant-answer.urgent a[href="tel:+5012231194"]').count() === 1, 'urgent answer flagged and offers tap-to-call');
  ok(requests.length === 0, `assistant makes no network requests (${requests.length})`);
  await page.keyboard.press('Escape');
  ok(!(await page.locator('.office-assistant').evaluate((d) => d.open)), 'Escape closes the assistant');
  ok(await page.evaluate(() => document.activeElement.matches('.office-assistant > summary')), 'focus returns to the assistant toggle');
  ok(page.url() === BASE + '/practice-areas/real-estate/', 'closing keeps the current page');
  await page.keyboard.press('Enter');
  ok(await page.locator('.office-assistant').evaluate((d) => d.open), 'assistant opens from the keyboard');
  await page.click('.assistant-close');
  ok(!(await page.locator('.office-assistant').evaluate((d) => d.open)), 'Close button dismisses the assistant');

  // 3. Contact preselect and preview form ----------------------------------
  section('Contact page');
  await page.goto(BASE + '/contact/?area=real-estate');
  ok(await page.locator('select[name=area]').inputValue() === 'real-estate', '?area=real-estate preselects the practice');
  ok((await page.locator('[data-area-note]').innerText()).includes('Real Estate'), 'practice shown in enquiry note');
  ok((await page.locator('a.button[data-mail-subject]').getAttribute('href')).includes('Real%20Estate'), 'email subject carries the practice');
  await page.goto(BASE + '/contact/?area=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
  ok(!(await page.locator('[data-area-note]').isVisible()), 'unknown area value ignored');
  ok(!(await page.content()).includes('onerror=alert'), 'arbitrary area value never rendered');
  ok(await page.locator('select[name=area]').inputValue() === '', 'unknown area leaves select at "Not sure yet"');
  await page.goto(BASE + '/contact/?area=family-law');
  const formRequests = [];
  page.on('request', (r) => formRequests.push(r.url()));
  await page.fill('#f-name', 'Test Person');
  await page.fill('#f-desc', 'Sample text');
  await page.click('[data-preview-submit]');
  ok((await page.locator('.form-status').innerText()).includes('nothing was sent'), 'preview submit explains nothing was sent');
  ok(await page.inputValue('#f-name') === '' && await page.inputValue('#f-desc') === '', 'preview submit clears fields');
  ok(formRequests.length === 0, 'preview form makes no network requests');
  ok(await page.evaluate(() => localStorage.length + sessionStorage.length) === 0, 'nothing stored in web storage');
  ok(await page.locator('form[action]').count() === 0, 'form has no action');

  // 4. Mobile flows ---------------------------------------------------------
  section('Mobile (iPhone 13)');
  const m = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await m.newPage();
  await mp.goto(BASE + '/');
  ok(await mp.locator('.desktop-nav').isHidden(), 'desktop nav hidden');
  ok(await mp.locator('a.header-call[href^="tel:"]').isVisible(), 'tap-to-call visible in header');
  await mp.locator('.mobile-nav > summary').focus();
  await mp.keyboard.press('Enter');
  ok(await mp.locator('.mobile-nav nav').isVisible(), 'menu opens from keyboard');
  const labels = await mp.locator('.mobile-nav nav a').allInnerTexts();
  for (const l of ['Practice Areas', 'Our Team', 'What to Expect', 'Belize Legal Guides', 'Contact']) ok(labels.includes(l), `menu has "${l}"`);
  await mp.keyboard.press('Escape');
  ok(await mp.locator('.mobile-nav nav').isHidden(), 'Escape closes the menu');
  // Demo script: assistant → Retiring in Belize → QRP page.
  await mp.waitForTimeout(300);
  await mp.click('.office-assistant > summary', { force: true });
  await mp.click('button[data-topic="retirement"]');
  const panel = await mp.locator('.assistant-panel').boundingBox();
  const vp = mp.viewportSize();
  ok(panel.x >= 0 && panel.x + panel.width <= vp.width && panel.y >= 60, 'assistant panel fits the screen below the header');
  await mp.click('.assistant-answer a.answer-next');
  await mp.waitForLoadState('load');
  ok(mp.url() === BASE + '/practice-areas/qualified-retired-persons/', 'retirement answer leads to the QRP page');
  // Demo script: Real Estate → guide → contact carries practice.
  await mp.goto(BASE + '/');
  await mp.click('.practice-card a[href*="real-estate"]');
  ok(mp.url().endsWith('/practice-areas/real-estate/'), 'home practice card opens Real Estate');
  await mp.click('.contact-band a[href*="buying-property-in-belize"]');
  ok(mp.url().endsWith('/insights/buying-property-in-belize/'), 'Real Estate links to the property guide');
  await mp.click('.contact-band a.button[href*="area=real-estate"]');
  ok(await mp.locator('select[name=area]').inputValue() === 'real-estate', 'guide consultation link preselects Real Estate');

  // 5. Layout: overflow and assistant collisions at three widths -----------
  section('Layout at desktop, tablet and mobile widths');
  for (const [name, opts] of [['desktop', { viewport: { width: 1366, height: 900 } }], ['tablet', { viewport: { width: 820, height: 1180 } }], ['mobile', devices['iPhone 13']], ['small', { viewport: { width: 320, height: 568 } }]]) {
    const c = await browser.newContext(opts);
    const p = await c.newPage();
    for (const route of ROUTES) {
      await p.goto(BASE + route, { waitUntil: 'load' });
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 0, `${name} ${route}: no horizontal overflow (${overflow}px)`);
      // Sample several scroll positions: the visible assistant toggle must not cover a control.
      const collisions = await p.evaluate(async () => {
        const hits = [];
        const max = document.documentElement.scrollHeight - innerHeight;
        for (const f of [0, 0.25, 0.5, 0.75, 1]) {
          window.scrollTo({ top: max * f, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 450));
          const s = document.querySelector('.office-assistant > summary').getBoundingClientRect();
          for (const el of document.querySelectorAll('main a, main button, main input, main select, main textarea, footer a, header a, header summary')) {
            for (const r of el.getClientRects()) {
              if (r.left < s.right && r.right > s.left && r.top < s.bottom && r.bottom > s.top) hits.push(`${el.textContent.trim().slice(0, 30)} @${f}`);
            }
          }
        }
        return hits;
      });
      ok(collisions.length === 0, `${name} ${route}: assistant covers no control (${collisions.join('; ')})`);
    }
    // Hero: portrait, CTA and photographer credit visible in the first screens.
    await p.goto(BASE + '/');
    const hero = await p.evaluate(() => {
      const cta = document.querySelector('.hero .button-gold').getBoundingClientRect();
      const img = document.querySelector('.hero-portrait img').getBoundingClientRect();
      return { ctaTop: cta.top, imgW: img.width, imgH: img.height, vh: innerHeight };
    });
    ok(hero.ctaTop + 47 <= hero.vh, `${name}: consultation CTA in first screen (top ${Math.round(hero.ctaTop)} of ${hero.vh})`);
    ok(Math.abs(hero.imgW / hero.imgH - 710 / 1066) < 0.01, `${name}: portrait keeps full photographed area (credit included)`);
    await c.close();
  }

  await browser.close();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
