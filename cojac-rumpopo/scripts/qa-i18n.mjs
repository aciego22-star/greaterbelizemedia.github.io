/**
 * End-to-end checks for the English / Spanish site and one-tap interactions
 * (run against a served production build; no WhatsApp messages are sent):
 *   QA_BASE=http://localhost:4173 node scripts/qa-i18n.mjs
 */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';

const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:4173';
let pass = 0;
let fail = 0;
const check = (name, ok, extra = '') => {
  ok ? pass++ : fail++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' :: ' + extra : ''}`);
};
const h1 = (page) => page.locator('h1').first().innerText();
const htmlLang = (page) => page.evaluate(() => document.documentElement.lang);

const browser = await chromium.launch();

async function context(opts) {
  const ctx = await browser.newContext(opts);
  await ctx.route(/wa\.me|whatsapp\.com|facebook\.com|youtube|google\.com\/maps/, (r) => r.abort());
  // Emulate Netlify's 404 rule for unknown Spanish paths.
  await ctx.route(BASE + '/es/no-such-page', (r) =>
    r.fulfill({ status: 404, contentType: 'text/html', body: readFileSync(new URL('../dist/es/404.html', import.meta.url), 'utf8') }),
  );
  await ctx.addInitScript(() => localStorage.setItem('cojac-age-confirmed-v1', 'yes'));
  return ctx;
}

// ── 1. Language detection ────────────────────────────────────────────────
console.log('\n== Language detection ==');
{
  const ctx = await context({ locale: 'en-US', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  check('English browser opens the English homepage', page.url() === BASE + '/' && (await htmlLang(page)) === 'en-BZ');
  check('English homepage heading', /Nothing Quite Like/.test(await h1(page)));
  await page.goto(BASE + '/es/flavours');
  check('a Spanish link stays Spanish for an English browser (shared links, search engines)', page.url().endsWith('/es/flavours') && (await htmlLang(page)) === 'es-BZ');
  await ctx.close();
}
for (const [label, opts] of [
  ['iPhone 13, es-MX', { ...devices['iPhone 13'], locale: 'es-MX' }],
  ['Pixel 7, es-ES', { ...devices['Pixel 7'], locale: 'es-ES' }],
]) {
  const ctx = await context(opts);
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  await page.waitForURL('**/es/');
  check(`${label}: Spanish browser lands on the Spanish homepage`, (await htmlLang(page)) === 'es-BZ' && /temporada de rumpopo/i.test(await h1(page)));
  await page.goto(BASE + '/flavours');
  await page.waitForURL('**/es/flavours');
  check(`${label}: deep link /flavours opens /es/flavours`, (await h1(page)).includes('Mucho más que'));
  await ctx.close();
}

// ── 2. The toggle: one tap, same page, remembered ───────────────────────
console.log('\n== Language toggle ==');
for (const [label, opts] of [
  ['desktop', { locale: 'es-ES', viewport: { width: 1366, height: 900 } }],
  ['iPhone 13', { ...devices['iPhone 13'], locale: 'es-ES' }],
]) {
  const ctx = await context(opts);
  const page = await ctx.newPage();
  const tap = (loc) => (opts.hasTouch ? loc.tap() : loc.click());
  await page.goto(BASE + '/es/our-story');
  const bar = page.locator('.site-header .lang-toggle');
  const [tb, cb] = [await bar.boundingBox(), await page.locator('.site-header .cart-btn').boundingBox()];
  check(`${label}: EN / ESP switch sits right beside the basket`, Math.abs(tb.y + tb.height / 2 - (cb.y + cb.height / 2)) < 4 && cb.x - (tb.x + tb.width) < 20 && cb.x > tb.x);
  check(`${label}: switch reads EN and ESP, current one marked`, (await bar.innerText()).replace(/\s+/g, ' ').trim() === 'EN ESP' && (await bar.locator('[aria-current="true"]').innerText()) === 'ESP');
  check(`${label}: no language switch in the footer`, (await page.locator('.site-footer .lang-toggle').count()) === 0);
  await tap(bar.getByRole('link', { name: 'English' }));
  await page.waitForURL(new RegExp(`^${BASE}/our-story/?$`));
  check(`${label}: one tap on English opens the same page in English`, (await htmlLang(page)) === 'en-BZ' && /Behind the/.test(await h1(page)));
  await page.goto(BASE + '/');
  check(`${label}: the English choice is remembered even with a Spanish browser`, page.url() === BASE + '/' && (await htmlLang(page)) === 'en-BZ');
  await tap(page.locator('.site-header').getByRole('link', { name: 'Español' }));
  await page.waitForURL(BASE + '/es/');
  check(`${label}: one tap on Español switches back`, (await htmlLang(page)) === 'es-BZ');
  // Cart survives a language switch
  await page.goto(BASE + '/es/flavours');
  await tap(page.locator('article.flavour-card').first().locator('.flavour-card__add'));
  await tap(page.locator('.site-header').getByRole('link', { name: 'English' }));
  await page.waitForURL(new RegExp(`^${BASE}/flavours/?$`));
  await page.waitForTimeout(300);
  check(`${label}: the order request is kept when switching language`, (await page.locator('.site-header .cart-btn__count').innerText()) === '1');
  await ctx.close();
}

// ── 3. A Spanish order, tap by tap ──────────────────────────────────────
console.log('\n== Spanish order (iPhone 13, taps only) ==');
{
  const ctx = await context({ ...devices['iPhone 13'], locale: 'es-MX' });
  const waUrls = [];
  await ctx.route(/wa\.me/, (r) => {
    waUrls.push(r.request().url());
    r.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/es/flavours');
  const card = page.locator('article.flavour-card', { has: page.getByRole('heading', { name: 'Peanut Delight Rumpopo' }) });
  await card.scrollIntoViewIfNeeded();
  await card.locator('.size-option', { has: page.locator('input[value="liter"]') }).tap();
  check('one tap selects the Litro size', await card.locator('input[value="liter"]').isChecked());
  check('price shown for Litro', (await card.locator('.flavour-card__price strong').innerText()) === 'BZD $38.00');
  await card.getByRole('button', { name: /Aumentar/ }).tap();
  await card.getByRole('button', { name: 'Añadir al pedido' }).tap();
  check('one tap adds to the order (flying photo appears)', await page.locator('.fly-to-cart').first().waitFor({ state: 'attached', timeout: 1000 }).then(() => true, () => false));
  check('Spanish toast', await page.getByText('Peanut Delight Rumpopo añadido a tu pedido').waitFor({ timeout: 2000 }).then(() => true, () => false));
  await page.waitForTimeout(1800);
  await page.locator('.site-header .cart-btn').tap();
  const drawer = page.getByRole('dialog', { name: 'Tu pedido' });
  check('one tap opens the order drawer (Spanish)', await drawer.isVisible());
  await drawer.getByRole('link', { name: 'Revisar y enviar pedido' }).tap();
  await page.waitForURL('**/es/order');
  check('one tap goes to the Spanish order page', (await h1(page)) === 'Tu pedido');
  await page.locator('.option-card', { hasText: 'Entrega' }).first().tap();
  await page.getByLabel('Tu nombre *').fill('Ana Pérez');
  await page.getByLabel(/Dirección exacta de entrega/).fill('12 Cleghorn St, casa azul');
  await page.locator('#payment-group .option-card', { hasText: 'Efectivo contra entrega' }).tap();
  check('one tap picks cash on delivery', await page.locator('#payment-group input[value="cash"]').isChecked());
  check('total shown: BZD $83.00', (await page.locator('.summary-totals').innerText()).includes('BZD $83.00'));
  await page.locator('#age-confirm').tap();
  check('18+ box ticked with one tap', await page.locator('#age-confirm').isChecked());
  const send = page.getByRole('link', { name: 'Enviar pedido por WhatsApp' });
  const href = await send.getAttribute('href');
  const msg = decodeURIComponent(href.split('?text=')[1]);
  check('WhatsApp goes to the business number', href.startsWith('https://wa.me/5016218372?text='));
  for (const line of ['*Solicitud de pedido:*', '2 × Peanut Delight Rumpopo (Litro): BZD $76.00', 'Entrega (Ciudad de Belice): BZD $7.00', '*Total: BZD $83.00*', 'Pago: Efectivo contra entrega', 'Nombre: Ana Pérez', 'Dirección: 12 Cleghorn St, casa azul']) {
    check(`message line: ${line}`, msg.includes(line), msg.includes(line) ? '' : msg);
  }
  check('message has no long dashes', !/[—–]/.test(msg));
  await send.tap();
  await page.waitForTimeout(400);
  check('one tap on Send opens WhatsApp (intercepted, nothing sent)', waUrls.length >= 1 || (await page.getByText('WhatsApp se abrirá con tu pedido').isVisible()));
  check('Spanish confirmation wording shown', await page.getByText('WhatsApp se abrirá con tu pedido').isVisible());
  // Mobile menu: one tap to open, one tap to go
  await page.locator('.menu-btn').tap();
  const menu = page.getByRole('dialog', { name: 'Menú del sitio' });
  check('one tap opens the Spanish menu', await menu.isVisible());
  check('menu includes the language switch', await menu.locator('.lang-toggle').isVisible());
  await menu.getByRole('link', { name: 'Preguntas frecuentes' }).tap();
  await page.waitForURL('**/es/faqs');
  check('one tap on a menu item opens the page', (await h1(page)) === 'Preguntas frecuentes');
  await page.goto(BASE + '/es/no-such-page');
  check('unknown Spanish address shows the Spanish 404 page', (await h1(page)) === 'Esta botella parece estar vacía');
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}

// ── 3b. Season banner rides with the header ─────────────────────────────
console.log('\n== Season banner ==');
for (const [label, opts] of [
  ['iPhone 13', { ...devices['iPhone 13'] }],
  ['desktop', { viewport: { width: 1366, height: 900 } }],
]) {
  const ctx = await context(opts);
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const banner = page.locator('.season-banner');
  const visible = async () => {
    const b = await banner.boundingBox();
    return b && b.y + b.height > 1;
  };
  check(`${label}: banner shows when the page opens`, await visible());
  await page.mouse.wheel(0, 1600);
  await page.waitForTimeout(700);
  check(`${label}: banner tucks away while scrolling down`, !(await visible()));
  check(`${label}: header stays on screen`, (await page.locator('.site-header').boundingBox()).y >= -1);
  await page.mouse.wheel(0, -300);
  await page.waitForTimeout(700);
  check(`${label}: banner slides back down when scrolling up (mid-page)`, await visible());
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);
  check(`${label}: banner fully visible back at the top`, (await banner.boundingBox()).y >= 0);
  await ctx.close();
}

// ── 3c. Homepage on phones ──────────────────────────────────────────────
console.log('\n== Homepage length on phones ==');
{
  const ctx = await context({ ...devices['iPhone 13'] });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  check('phone: the large flavour photo cards are left out', !(await page.locator('.featured').isVisible()));
  check('phone: “See all flavours” still leads to the flavours', await page.getByRole('link', { name: 'See all flavours' }).isVisible());
  await ctx.close();
  const d = await context({ viewport: { width: 1366, height: 900 } });
  const dp = await d.newPage();
  await dp.goto(BASE + '/');
  check('desktop: flavour photo cards still shown', await dp.locator('.featured').isVisible());
  await d.close();
}

// ── 3d. This season's menu (Nov 12 update) ──────────────────────────────
console.log('\n== Menu ==');
for (const [lang, path] of [['en', '/flavours'], ['es', '/es/flavours']]) {
  const ctx = await context({ viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + path);
  const names = await page.locator('article.flavour-card h3').allInnerTexts();
  check(`${lang}: seven flavours on the menu`, names.length === 7, names.join(', '));
  check(`${lang}: Dark Chocolate Peppermint removed`, !(await page.content()).includes('Peppermint'));
  const coquito = page.locator('article.flavour-card', { has: page.getByRole('heading', { name: 'Coquito Rumpopo' }) });
  const prices = (await coquito.locator('.size-option__price').allInnerTexts()).join(' / ');
  check(`${lang}: Coquito at BZD $25.00 / $45.00`, prices === 'BZD $25.00 / BZD $45.00', prices);
  check(`${lang}: Coquito photo loads`, await coquito.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0));
  check(`${lang}: no age pop-up`, (await page.getByRole('dialog').count()) === 0);
  const small = (await page.locator('.site-footer__age').innerText()).trim();
  check(`${lang}: under-18 small print in the footer`, small === (lang === 'es' ? 'No se venden bebidas alcohólicas a menores de 18 años.' : 'Alcoholic beverages will not be sold to anyone under 18.'), small);
  await ctx.close();
}

// ── 4. Footer credit ────────────────────────────────────────────────────
console.log('\n== Footer credit ==');
for (const [lang, path, text] of [
  ['en', '/', 'Website developed by Austere Automations'],
  ['es', '/es/', 'Sitio web desarrollado por Austere Automations'],
]) {
  const ctx = await context({ locale: lang === 'es' ? 'es-ES' : 'en-US', viewport: { width: 1366, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + path);
  const credit = page.locator('.site-footer__credit');
  check(`${lang}: credit reads “${text}”`, (await credit.innerText()) === text);
  check(`${lang}: the whole phrase is one link to Austere Automations`, (await credit.evaluate((a) => a.tagName)) === 'A' && (await credit.getAttribute('href')) === 'https://austereautomations.com/website-development-belize');
  const colours = await credit.evaluate((el) => {
    const anim = el.getAnimations()[0];
    const out = [];
    for (const ms of [1000, 9000, 17000, 25000]) {
      anim.currentTime = ms;
      out.push(getComputedStyle(el).color);
    }
    return { out, duration: anim.effect.getTiming().duration };
  });
  check(`${lang}: colour changes every 8 s through red, yellow and blue, then repeats`, colours.duration === 24000 && new Set(colours.out.slice(0, 3)).size === 3 && colours.out[3] === colours.out[0], JSON.stringify(colours.out));
  await ctx.close();
}

// ── 5. Hover never needs a second tap ───────────────────────────────────
console.log('\n== One tap: hover styles ==');
{
  const ctx = await context({ ...devices['Pixel 7'] });
  const page = await ctx.newPage();
  await page.goto(BASE + '/');
  const loose = await page.evaluate(() => {
    const out = [];
    const walk = (rules, inHover) => {
      for (const r of rules) {
        if (r.media) walk(r.cssRules, inHover || /hover/.test(r.media.mediaText));
        else if (r.selectorText && r.selectorText.includes(':hover') && !inHover) out.push(r.selectorText);
      }
    };
    for (const s of document.styleSheets) {
      try {
        walk(s.cssRules, false);
      } catch {
        /* cross-origin */
      }
    }
    return out;
  });
  check('every hover style is limited to mouse/trackpad devices', loose.length === 0, loose.join(', '));
  await ctx.close();
}

await browser.close();
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
