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
  const cspErrors = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to/i.test(m.text())) cspErrors.push(m.text()); });
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
      arrows: (document.body.innerText.match(/[→↗]/g) || []).length +
        [...document.querySelectorAll('a')].filter((a) => /[→↗]/.test(getComputedStyle(a, '::after').content + getComputedStyle(a, '::before').content)).length,
      waNumberShown: /625[\s-]?3032/.test(document.body.innerText),
      gridLines: [...document.querySelectorAll('.practice-card')].filter((c) => parseFloat(getComputedStyle(c).borderLeftWidth) || parseFloat(getComputedStyle(c).borderBottomWidth)).length,
      lines: (() => {
        const bad = [];
        for (const el of document.querySelectorAll('body *')) {
          if (el.closest('svg') || el.matches('input, textarea, select, script, style')) continue;
          const cs = getComputedStyle(el);
          for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
            const w = parseFloat(cs['border' + side + 'Width']);
            const c = cs['border' + side + 'Color'];
            if (w > 0 && cs['border' + side + 'Style'] !== 'none' && c !== 'transparent' && !/,\s*0\)$/.test(c)) { bad.push((el.className || el.tagName) + ' border-' + side.toLowerCase()); break; }
          }
          const r = el.getBoundingClientRect();
          const bg = cs.backgroundColor;
          if (r.width >= 16 && r.height > 0 && r.height <= 3 && bg !== 'transparent' && !/,\s*0\)$/.test(bg)) bad.push('rule:' + (el.className || el.tagName));
        }
        return bad;
      })(),
      facebook: !!document.querySelector('footer a[href="https://www.facebook.com/alpuchelaw"][target="_blank"][rel~="noopener"] svg.icon-facebook'),
      whatsapp: !!document.querySelector('footer a[href="https://wa.me/5016253032"][target="_blank"][rel~="noopener"] svg.icon-whatsapp'),
    }));
    ok(/noindex/.test(info.robots), `${route} is noindex`);
    ok(info.title && info.desc, `${route} has title and description`);
    ok((process.env.OG_RELATIVE_OK ? /^(https?:\/\/.+|\/assets\/img\/.+)\.jpg$/ : /^https?:\/\/.+\.jpg$/).test(info.og), `${route} has og:image`);
    ok(info.h1 === 1, `${route} has one h1 (found ${info.h1})`);
    ok(info.lang === 'en', `${route} lang=en`);
    ok(info.noticeLink, `${route} footer links to photo credits`);
    ok(info.arrows === 0, `${route} has no arrows (${info.arrows})`);
    ok(!info.waNumberShown, `${route} does not show the WhatsApp number`);
    ok(info.gridLines === 0, `${route} practice cards have no grid lines`);
    ok(info.lines.length === 0, `${route} has no lines, rules or borders (${info.lines.slice(0, 5).join('; ')})`);
    ok(info.facebook, `${route} footer links to the firm’s Facebook, with its icon`);
    ok(info.whatsapp, `${route} footer links to the firm’s WhatsApp, with its icon`);
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
  ok(cspErrors.length === 0, `no Content-Security-Policy violations (${cspErrors.slice(0, 3).join(' | ')})`);
  console.log(`  ${checked.size} internal URLs checked; ${outbound.size} distinct external links (not fetched).`);

  // 2. Alpuche AI chat -------------------------------------------------------
  section('Alpuche AI chat');
  const botCount = (pg) => pg.locator('.chat-log .msg-bot:not(.is-typing)').count();
  const lastBot = (pg) => pg.locator('.chat-log .msg-bot:not(.is-typing)').last();
  async function waitReply(pg, before) {
    await pg.waitForFunction((n) => document.querySelectorAll('.chat-log .msg-bot:not(.is-typing)').length > n && !document.querySelector('.chat-log .is-typing'), before, { timeout: 15000 });
  }
  async function say(pg, text) {
    const before = await botCount(pg);
    await pg.fill('#chat-text', text);
    await pg.click('.chat-send');
    await waitReply(pg, before);
    return lastBot(pg);
  }
  async function tap(pg, label) {
    const before = await botCount(pg);
    await pg.locator('.chat-chips button', { hasText: label }).first().click();
    await waitReply(pg, before);
    return lastBot(pg);
  }
  const chatCtx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const cp = await chatCtx.newPage();
  const chatErrors = [];
  cp.on('pageerror', (e) => chatErrors.push(e.message));
  await cp.goto(BASE + '/practice-areas/real-estate/', { waitUntil: 'networkidle' });
  const chatRequests = [];
  cp.on('request', (r) => chatRequests.push(r.url()));
  ok((await cp.locator('.office-assistant > summary').innerText()).trim() === 'Alpuche AI', 'assistant is labelled “Alpuche AI”');
  const pulse = await cp.evaluate(() => { const cs = getComputedStyle(document.querySelector('.office-assistant > summary'), '::after'); return [cs.animationName, cs.animationDuration, cs.animationIterationCount].join(' '); });
  ok(pulse === 'ai-pulse 10s infinite', `launcher pulses every 10 seconds (${pulse})`);
  await cp.click('.office-assistant > summary');
  ok(await cp.waitForSelector('.chat-log .is-typing', { timeout: 1500 }).then(() => true).catch(() => false), 'typing indicator shows before the greeting');
  await waitReply(cp, 0);
  ok(/automated front-desk assistant/i.test(await lastBot(cp).innerText()) && /can’t give legal advice/.test(await lastBot(cp).innerText()), 'greeting identifies as automated and mentions no legal advice');
  ok((await cp.locator('.chat-chips button').allInnerTexts()).join('|') === 'Start an enquiry', 'no topic shortcut buttons, only “Start an enquiry”');
  // Timing: a reply arrives after roughly one to two seconds, with the indicator showing meanwhile.
  await cp.fill('#chat-text', 'Where is the office?');
  const t0 = Date.now();
  await cp.click('.chat-send');
  ok(await cp.locator('.chat-log .is-typing').isVisible(), 'typing indicator shows while “thinking”');
  await waitReply(cp, 1);
  const delay = Date.now() - t0;
  ok(delay >= 900 && delay <= 2800, `reply delay is about one to two seconds (${delay} ms)`);
  ok(/Northern Shops/.test(await lastBot(cp).innerText()), 'free-text question answered (office location)');
  ok((await lastBot(cp).locator('a.msg-link').first().getAttribute('href')).includes('contact/'), 'answer links to the contact page');
  await cp.evaluate(() => { window.ALPUCHE_TYPING_SCALE = 0.15; });
  let bubble = await say(cp, 'Do I have a case against my landlord?');
  ok(/not able to give legal advice/.test(await bubble.innerText()) && await bubble.evaluate((el) => el.classList.contains('is-guard')), 'legal-advice question gets the guardrail');
  ok(await cp.locator('.chat-chips button', { hasText: 'Start an enquiry' }).count() === 1, 'guardrail offers an enquiry');
  bubble = await say(cp, 'Here is my passport number A12345678');
  ok(!(await cp.content()).includes('A12345678'), 'passport number never appears on the page');
  ok(await cp.locator('.msg-user.is-redacted').count() === 1, 'visitor’s message hidden');
  bubble = await say(cp, 'Someone is trying to hurt me right now');
  ok(await bubble.locator('a[href="tel:911"]').count() === 1 && await bubble.evaluate((el) => el.classList.contains('is-urgent')), 'danger → 911 first, tap-to-call');
  bubble = await say(cp, 'I have a hearing tomorrow');
  ok(await bubble.locator('a[href="tel:+5012231194"]').count() >= 1, 'urgent date → call the office, tap-to-call');
  bubble = await say(cp, 'Is registering a business name the same as a trademark?');
  ok((await bubble.locator('a.msg-link').first().getAttribute('href')).includes('intellectual-property'), 'site content answer links to the right page');
  bubble = await say(cp, 'Can I WhatsApp you?');
  ok(await bubble.locator('a.msg-link[href="https://wa.me/5016253032"] svg.icon-whatsapp').count() === 1, 'chat WhatsApp link has the WhatsApp icon');
  ok(!/625[\s-]?3032/.test(await bubble.innerText()) && !/[→↗]/.test(await bubble.innerText()), 'WhatsApp answer hides the number and has no arrows');
  bubble = await say(cp, 'Are you on Facebook?');
  ok(await bubble.locator('a.msg-link[href="https://www.facebook.com/alpuchelaw"] svg.icon-facebook').count() === 1, 'chat Facebook link has the Facebook icon');
  bubble = await say(cp, 'What type of legal matters do you guys do?');
  ok(await bubble.locator('ul.msg-list li a').count() === 7 && (await bubble.locator('ul.msg-list li a').first().getAttribute('href')).includes('practice-areas/real-estate'), 'practice-areas question lists all seven areas as links');
  ok(!/Call the office or email/.test(await bubble.innerText()), 'practice-areas question is not answered with contact details');
  bubble = await say(cp, 'I need advice on a matter?');
  ok(/^Certainly\. Advice on a particular matter is given by the attorney/.test(await bubble.innerText()), 'advice request is routed to a consultation, not a site passage');
  ok(await cp.locator('.office-assistant > summary .ai-mark img[src*="jma-mark"]').count() === 1 && await cp.locator('.assistant-top .ai-mark img[src*="jma-mark"]').count() === 1, 'launcher and panel show the JMA logo');
  bubble = await tap(cp, 'Start an enquiry');
  ok(/pass a short enquiry/.test(await bubble.innerText()), 'chip starts an enquiry');
  bubble = await tap(cp, 'Not now');
  ok(/Nothing has been sent/.test(await bubble.innerText()), 'enquiry can be declined');
  ok(chatRequests.length === 0, `chat makes no network requests (${chatRequests.length})`);
  await cp.keyboard.press('Escape');
  ok(!(await cp.locator('.office-assistant').evaluate((d) => d.open)), 'Escape closes Alpuche AI');
  ok(await cp.evaluate(() => document.activeElement.matches('.office-assistant > summary')), 'focus returns to the toggle');
  ok(cp.url() === BASE + '/practice-areas/real-estate/', 'closing keeps the current page');
  await cp.keyboard.press('Enter');
  ok(await cp.locator('.office-assistant').evaluate((d) => d.open), 'Alpuche AI opens from the keyboard');
  ok(await cp.locator('.chat-log .msg').count() > 10, 'conversation kept while the page stays open');
  const beforeClear = await cp.locator('.chat-log .msg').count();
  await cp.click('.assistant-new');
  await waitReply(cp, 0);
  ok(beforeClear > 3 && await cp.locator('.chat-log .msg').count() === 1 && /welcome to the office/.test(await lastBot(cp).innerText()), `New chat clears the conversation and greets again (${beforeClear} → 1)`);
  await cp.click('.assistant-close');
  ok(!(await cp.locator('.office-assistant').evaluate((d) => d.open)), 'Close button dismisses Alpuche AI');
  ok(chatErrors.length === 0, `no script errors (${chatErrors.join(' | ')})`);

  // 3. Enquiry through Alpuche AI (demo mode) -------------------------------------
  section('Enquiry through Alpuche AI');
  const ep = await chatCtx.newPage();
  await ep.addInitScript(() => { window.ALPUCHE_TYPING_SCALE = 0.15; });
  await ep.goto(BASE + '/practice-areas/real-estate/', { waitUntil: 'networkidle' });
  const enquiryRequests = [];
  ep.on('request', (r) => enquiryRequests.push(r.url()));
  await ep.click('.contact-band a.button[data-intake]');
  await waitReply(ep, 0);
  ok(ep.url() === BASE + '/practice-areas/real-estate/', 'consultation button opens Alpuche AI instead of leaving the page');
  ok(/no names of other parties/.test(await lastBot(ep).innerText()), 'enquiry starts with the notice');
  bubble = await tap(ep, 'Continue');
  ok(/Real Estate/.test(await bubble.innerText()), 'practice carried from the button');
  await tap(ep, 'Yes');
  await say(ep, 'Jane Doe');
  ok(await ep.locator('.chat-chips button', { hasText: 'WhatsApp' }).locator('svg.icon-whatsapp').count() === 1, 'WhatsApp reply option has the icon');
  await tap(ep, 'Email');
  ok(await ep.locator('#chat-text').getAttribute('type') === 'email', 'email step switches the keyboard to email');
  await say(ep, 'jane@example.com');
  await tap(ep, 'No');
  bubble = await say(ep, 'Buying a lot near Placencia from an overseas seller');
  const summary = await bubble.innerText();
  ok(/Real Estate/.test(summary) && /Jane Doe/.test(summary) && /jane@example\.com/.test(summary), 'review summary shows the details');
  ok(await ep.locator('.chat-chips button', { hasText: 'Send on WhatsApp instead' }).locator('svg.icon-whatsapp').count() === 1, '“Send on WhatsApp instead” has the icon');
  bubble = await tap(ep, 'Send to the office');
  ok(/nothing was sent/.test(await bubble.innerText()), 'demo mode says nothing was sent');
  ok(await bubble.locator('details.msg-preview').count() === 2, 'demo shows the office email and visitor confirmation');
  ok(enquiryRequests.length === 0, 'demo enquiry makes no network requests');
  ok(await ep.evaluate(() => localStorage.length + sessionStorage.length) === 0, 'nothing stored in web storage');

  section('Contact page');
  await ep.goto(BASE + '/contact/?area=real-estate', { waitUntil: 'networkidle' });
  ok(await ep.locator('form').count() === 0, 'enquiry form removed');
  ok(await ep.locator('.office-card a[href="tel:+5012231194"]').isVisible(), 'phone still prominent');
  const waLink = ep.locator('.office-card a[href="https://wa.me/5016253032"]');
  ok(await waLink.locator('svg.icon-whatsapp').isVisible() && !/625/.test(await waLink.innerText()), 'WhatsApp in the contact details is the icon, number hidden');
  ok(/WhatsApp/.test(await waLink.textContent()), 'WhatsApp icon link has an accessible name');
  ok(await ep.locator('.actions a[href="https://wa.me/5016253032"]', { hasText: 'Message on WhatsApp' }).locator('svg.icon-whatsapp').isVisible(), 'WhatsApp (with icon) next to email and call');
  ok(await ep.locator('.office-card a[href="https://www.facebook.com/alpuchelaw"] svg.icon-facebook').isVisible(), 'Facebook link with icon in the contact details');
  ok(await ep.locator('svg.icon-whatsapp').evaluateAll((els) => els.every((e) => getComputedStyle(e).fill === 'rgb(37, 211, 102)')), 'WhatsApp icons use WhatsApp green');
  ok(await ep.locator('a[href^="https://wa.me/"], a[href^="https://www.facebook.com/"]').evaluateAll((els) => els.every((a) => a.target === '_blank' && a.rel.includes('noopener'))), 'WhatsApp and Facebook open in a new tab safely');
  const startBtn = ep.locator('[data-contact-intake]');
  ok(await startBtn.isVisible() && /Real Estate/.test(await startBtn.innerText()), 'Alpuche AI button carries the practice');
  ok((await ep.locator('[data-area-note]').innerText()).includes('Real Estate'), 'practice shown in note');
  ok((await ep.locator('a.button[data-mail-subject]').getAttribute('href')).includes('Real%20Estate'), 'email subject carries the practice');
  await startBtn.click();
  await waitReply(ep, 0);
  bubble = await tap(ep, 'Continue');
  ok(/Real Estate/.test(await bubble.innerText()), 'contact page enquiry starts with the practice');
  await ep.goto(BASE + '/contact/?area=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E');
  ok(!(await ep.locator('[data-area-note]').isVisible()), 'unknown area value ignored');
  ok(!(await ep.content()).includes('onerror=alert'), 'arbitrary area value never rendered');
  ok((await startBtn.innerText()).trim() === 'Start an enquiry with Alpuche AI', 'unknown area leaves the generic button');
  await chatCtx.close();

  // 4. Mobile flows ---------------------------------------------------------
  section('Mobile (iPhone 13)');
  const m = await browser.newContext({ ...devices['iPhone 13'] });
  const mp = await m.newPage();
  await mp.addInitScript(() => { window.ALPUCHE_TYPING_SCALE = 0.15; });
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
  // Demo script: Alpuche AI → Retiring in Belize → QRP page.
  await mp.waitForTimeout(300);
  await mp.click('.office-assistant > summary', { force: true });
  await waitReply(mp, 0);
  const panel = await mp.locator('.assistant-panel').boundingBox();
  const vp = mp.viewportSize();
  ok(panel.x >= 0 && panel.x + panel.width <= vp.width && panel.y >= 60 && panel.y + panel.height <= vp.height, 'chat panel fits the screen below the header');
  const inputBox = await mp.locator('#chat-text').boundingBox();
  ok(inputBox && inputBox.y + inputBox.height <= vp.height, 'message box visible on the phone');
  ok(await mp.locator('#chat-text').evaluate((el) => parseFloat(getComputedStyle(el).fontSize) >= 16), 'message box text is 16px (no iPhone zoom)');
  await say(mp, 'Can you help me retire in Belize?');
  await lastBot(mp).locator('a.msg-link').first().click();
  await mp.waitForLoadState('load');
  ok(mp.url() === BASE + '/practice-areas/qualified-retired-persons/', 'retirement answer leads to the QRP page');
  // Demo script: Real Estate → guide → consultation opens the enquiry with the practice.
  await mp.goto(BASE + '/');
  await mp.click('.practice-card a[href*="real-estate"]');
  ok(mp.url().endsWith('/practice-areas/real-estate/'), 'home practice card opens Real Estate');
  await mp.click('.contact-band a[href*="buying-property-in-belize"]');
  ok(mp.url().endsWith('/insights/buying-property-in-belize/'), 'Real Estate links to the property guide');
  await mp.click('.contact-band a.button[href*="area=real-estate"]');
  await waitReply(mp, 0);
  const b2 = await tap(mp, 'Continue');
  ok(/Real Estate/.test(await b2.innerText()), 'guide consultation button opens the enquiry for Real Estate');
  await mp.goto(BASE + '/');
  await mp.click('.mobile-nav > summary');
  await mp.click('.mobile-nav nav a.button[data-intake]');
  await waitReply(mp, 0);
  ok(await mp.locator('.office-assistant').evaluate((d) => d.open) && await mp.locator('.mobile-nav nav').isHidden(), 'menu’s consultation button closes the menu and opens the enquiry');
  await m.close();

  // 5. Layout: overflow and assistant collisions at three widths -----------
  section('Layout at desktop, tablet and mobile widths');
  for (const [name, opts] of [['desktop', { viewport: { width: 1366, height: 900 } }], ['tablet', { viewport: { width: 820, height: 1180 } }], ['mobile', devices['iPhone 13']], ['small', { viewport: { width: 320, height: 568 } }]]) {
    const c = await browser.newContext(opts);
    const p = await c.newPage();
    for (const route of ROUTES) {
      await p.goto(BASE + route, { waitUntil: 'load' });
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      ok(overflow <= 0, `${name} ${route}: no horizontal overflow (${overflow}px)`);
      // Alpuche AI stays in view, unmoved, at every scroll position.
      const hidden = await p.evaluate(async () => {
        const misses = [];
        const max = document.documentElement.scrollHeight - innerHeight;
        for (const f of [0, 0.25, 0.5, 0.75, 1]) {
          window.scrollTo({ top: max * f, behavior: 'instant' });
          await new Promise((r) => setTimeout(r, 120));
          const el = document.querySelector('.office-assistant > summary');
          const r = el.getBoundingClientRect();
          const cs = getComputedStyle(el);
          if (!(r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth) || cs.transform !== 'none' || cs.opacity !== '1' || cs.visibility !== 'visible') misses.push(f);
        }
        return misses;
      });
      ok(hidden.length === 0, `${name} ${route}: Alpuche AI stays visible while scrolling (${hidden.join(', ')})`);
      const headerGone = await p.evaluate(async () => {
        const misses = [];
        for (const f of [0.3, 0.6, 1]) {
          window.scrollTo({ top: (document.documentElement.scrollHeight - innerHeight) * f, behavior: 'instant' });
          await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          const r = document.querySelector('.site-header').getBoundingClientRect();
          if (Math.abs(r.top) > 1 || r.height < 40) misses.push(f);
        }
        return misses;
      });
      ok(headerGone.length === 0, `${name} ${route}: header and menu stay at the top while scrolling (${headerGone.join(', ')})`);
      if (['/practice-areas/', '/about/', '/working-with-us/'].includes(route)) {
        const plaque = await p.evaluate(async () => {
          window.scrollTo({ top: 0, behavior: 'instant' });
          const img = document.querySelector('.page-head.has-plaque .head-bg img');
          if (!img) return null;
          if (!img.complete) await new Promise((r) => { img.onload = img.onerror = r; });
          const ir = img.getBoundingClientRect();
          const h1 = document.querySelector('.page-head h1').getBoundingClientRect();
          return { src: img.currentSrc, ok: img.naturalWidth > 0, alt: img.getAttribute('alt'), plateBottom: ir.top + ((642 + 410) / 1670) * ir.height, h1Top: h1.top, vw: innerWidth };
        });
        ok(plaque && plaque.ok && plaque.alt === '', `${name} ${route}: nameplate background loads (decorative)`);
        if (plaque) {
          ok(plaque.vw <= 780 ? /plaque-mobile/.test(plaque.src) : /plaque-desktop/.test(plaque.src), `${name} ${route}: ${plaque.vw <= 780 ? 'mobile' : 'desktop'} nameplate used (${plaque.src.split('/').pop()})`);
          if (plaque.vw <= 780) ok(plaque.h1Top >= plaque.plateBottom - 1, `${name} ${route}: heading sits below the nameplate on phones`);
        }
      }
      if (route === '/contact/') ok(await p.locator('.page-head.has-plaque, .page-head .head-bg').count() === 0, `${name} ${route}: no nameplate on the contact page`);
    }
    // Hero: portrait, CTA and photographer credit visible in the first screens.
    await p.goto(BASE + '/');
    const hero = await p.evaluate(() => {
      const cta = document.querySelector('.hero .button-gold').getBoundingClientRect();
      const img = document.querySelector('.hero-portrait img').getBoundingClientRect();
      const h1 = document.querySelector('.hero h1').getBoundingClientRect();
      const header = document.querySelector('.site-header').getBoundingClientRect();
      return { ctaTop: cta.top, imgW: img.width, imgH: img.height, imgTop: img.top, imgBottom: img.bottom, h1Top: h1.top, headerBottom: header.bottom, vh: innerHeight, vw: innerWidth };
    });
    if (hero.vw <= 780) {
      // Phones: the portrait comes first, right below the header, with the words underneath.
      ok(hero.imgTop <= hero.headerBottom + 2 && hero.imgBottom <= hero.vh, `${name}: portrait first, fully in the first screen (top ${Math.round(hero.imgTop)}, bottom ${Math.round(hero.imgBottom)} of ${hero.vh})`);
      ok(hero.h1Top >= hero.imgBottom, `${name}: heading sits below the portrait`);
    } else {
      ok(hero.ctaTop + 47 <= hero.vh, `${name}: consultation CTA in first screen (top ${Math.round(hero.ctaTop)} of ${hero.vh})`);
      ok(hero.h1Top < hero.imgBottom && hero.imgTop < hero.vh, `${name}: words and portrait side by side`);
    }
    ok(Math.abs(hero.imgW / hero.imgH - 710 / 1066) < 0.01, `${name}: portrait keeps full photographed area (credit included)`);
    await c.close();
  }

  await browser.close();
  console.log(`\n${passes} passed, ${failures} failed`);
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
