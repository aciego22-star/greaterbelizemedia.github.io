/**
 * End-to-end checks for the Holiday Blog (run against a served build).
 *   QA_BASE=http://localhost:4181 node scripts/qa-blog.mjs
 * No external requests are made: Facebook and WhatsApp links are only inspected.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:4181';
const POST = '/holiday-blog/rumpopo-season-2026-secret-flavour';
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

const browser = await chromium.launch();
for (const [label, opts] of [
  ['desktop 1280', { viewport: { width: 1280, height: 900 } }],
  ['desktop 1920', { viewport: { width: 1920, height: 1080 } }],
  ['iPhone 13', devices['iPhone 13']],
  ['360 wide', { viewport: { width: 360, height: 740 }, isMobile: true, hasTouch: true }],
]) {
  console.log(`\n== ${label} ==`);
  const ctx = await browser.newContext(opts);
  await ctx.addInitScript(() => localStorage.setItem('cojac-age-confirmed-v1', 'yes'));
  await ctx.route(/facebook\.com|wa\.me|whatsapp\.com|youtube/, (r) => r.abort());
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const mobile = (opts.viewport?.width ?? 400) < 1000;

  // Navigation: Holiday Blog reachable from the header / mobile menu
  await page.goto(BASE + '/');
  if (mobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'Holiday Blog' }).click();
  } else {
    await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Holiday Blog' }).click();
  }
  await page.waitForURL('**/holiday-blog');
  check('Holiday Blog opens from the navigation', (await page.getByRole('heading', { level: 1, name: /Holiday Blog/ }).count()) === 1);
  check('footer links to the Holiday Blog', (await page.locator('.site-footer a[href="/holiday-blog"]').count()) === 1);
  check('index shows the featured story', (await page.locator('.post-card--featured').count()) === 1);
  check('index shows six topic tiles', (await page.locator('.blog-topic').count()) === 6);
  check('empty topics say "Stories coming soon" (no fake posts)', (await page.getByText('Stories coming soon').count()) === 4);
  check('no pagination on the index', (await page.locator('[aria-label*="agination"], .pagination').count()) === 0);

  // Open the post from the card
  await page.locator('.post-card__title a').click();
  await page.waitForURL('**' + POST);
  check('post has exactly one H1', (await page.locator('h1').count()) === 1);
  check('post has section H2s', (await page.locator('.blog-article__body h2').count()) >= 6);
  check('breadcrumb Home › Holiday Blog › post', (await page.locator('.breadcrumb li a').allInnerTexts()).join('|') === 'Home|Holiday Blog');
  check('author, date and reading time shown', /By Cojac’s Sumptuous Rumpopo.*7 November 2026.*min read/s.test(await page.locator('.blog-article__header .post-meta').innerText()));
  check('official hint shown as a pull quote', (await page.locator('.blog-quote').innerText()).includes('popular in Belizean cooking'));

  // Artwork: the right file, natural aspect ratio, not cropped
  const img = await page.locator('.blog-article__figure img').evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { src: (el.currentSrc || '').split('/').pop(), ratio: r.width / r.height, fit: getComputedStyle(el).objectFit, loading: el.getAttribute('loading') };
  });
  const expectRatio = mobile && (opts.viewport?.width ?? 400) <= 767 ? 0.8 : 16 / 9;
  check(`artwork is the ${expectRatio === 0.8 ? 'mobile 4:5' : 'desktop 16:9'} file at its natural ratio`, Math.abs(img.ratio - expectRatio) < 0.02 && (expectRatio === 0.8 ? /MOBILE/ : /DESKTOP/).test(img.src), `${img.src} ${img.ratio.toFixed(3)}`);
  check('artwork is not cropped (no object-fit: cover)', img.fit !== 'cover');
  check('main artwork is not lazy-loaded (LCP)', img.loading === 'eager');
  check('artwork appears once on the post', (await page.locator('.blog-article img[src*="Secret_Flavour"]').count()) === 1);

  // Competition: entries on Facebook only; no placeholder links; no entry form
  const panel = page.locator('.contest-panel');
  check('competition panel present', (await panel.count()) === 1);
  const panelLinks = await panel.locator('a').evaluateAll((as) => as.map((a) => [a.textContent.trim(), a.getAttribute('href')]));
  check('panel links only to the verified Facebook page (no contest permalink supplied yet)', panelLinks.length === 1 && panelLinks[0][1] === 'https://www.facebook.com/share/1EJbfQLwDq/' && /Visit Cojac’s Official Facebook Page/.test(panelLinks[0][0]), JSON.stringify(panelLinks));
  check('no "enter here" wording while the post link is missing', (await page.getByText(/enter the contest here/i).count()) === 0);
  check('no forms or text inputs in the article', (await page.locator('.blog-article form, .blog-article input, .blog-article textarea').count()) === 0);
  const html = await page.content();
  check('no placeholder hrefs', !/TO_BE_SUPPLIED|href="#"/.test(html));
  check('no long dashes in the page', !/[—–]/.test(await page.locator('main').innerText()));
  check('no countdown / entry counter', (await page.getByText(/days left|entries so far|countdown/i).count()) === 0);

  // Ordering CTAs use the existing site flow
  const order = await page.locator('.blog-order a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check('CTAs go to Find Your Flavour and the existing order flow', JSON.stringify(order) === JSON.stringify(['/flavours', '/order']), JSON.stringify(order));
  const internal = await page.locator('.blog-article__body a[href^="/"]').evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
  for (const href of ['/our-story', '/our-guarantee', '/videos-features', '/flavours', '/order']) check(`internal link to ${href}`, internal.includes(href));

  // Share links use the real article URL
  const share = await page.locator('.blog-share a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
  check('share links carry the canonical article URL', share.every((h) => decodeURIComponent(h).includes('https://cojacs-rumpopo.netlify.app' + POST)), share.length + ' links');

  await page.locator('.blog-order a', { hasText: 'Order Through WhatsApp' }).click();
  await page.waitForURL('**/order');
  check('Order Through WhatsApp opens the site order page (cart flow kept)', (await page.getByRole('heading', { level: 1, name: /Your Order Request/ }).count()) === 1);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  check('no horizontal overflow', !overflow);
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// Unknown post slug → branded 404 content. Netlify answers unknown paths with
// dist/404.html (status 404); emulate that here because a plain static server does not.
const { readFileSync } = await import('node:fs');
const ctx = await browser.newContext();
await ctx.route(BASE + '/holiday-blog/does-not-exist', (r) =>
  r.fulfill({ status: 404, contentType: 'text/html', body: readFileSync(new URL('../dist/404.html', import.meta.url), 'utf8') }),
);
const p = await ctx.newPage();
await p.goto(BASE + '/holiday-blog/does-not-exist');
await p.waitForTimeout(800);
check('unknown post shows the not-found page', (await p.getByText('This bottle seems to be empty').count()) >= 1);
await browser.close();

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
