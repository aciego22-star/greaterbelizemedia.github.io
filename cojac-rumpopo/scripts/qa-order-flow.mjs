/**
 * End-to-end test of the WhatsApp order-request flow (no messages are sent:
 * wa.me requests are intercepted and blocked).
 *
 *   QA_MODE=qa       build with VITE_QA_WHATSAPP=<fake number> — checks the full hand-off
 *   QA_MODE=nonumber production-like build — checks the send button is safely disabled
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const MODE = process.env.QA_MODE || 'qa';
const results = [];
const check = (name, ok, extra = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ' — ' + extra : ''}`);
};

const browser = await chromium.launch();
for (const [label, opts] of [
  ['desktop', { viewport: { width: 1366, height: 900 } }],
  ['iPhone 13', devices['iPhone 13']],
  ['Pixel 7', devices['Pixel 7']],
]) {
  console.log(`\n== ${label} (${MODE}) ==`);
  const ctx = await browser.newContext({ ...opts, permissions: label === 'desktop' ? ['clipboard-read', 'clipboard-write'] : [] });
  const waUrls = [];
  await ctx.route(/wa\.me|whatsapp\.com/, (route) => {
    waUrls.push(route.request().url());
    route.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && !m.text().includes('ERR_FAILED') && errors.push(m.text()));

  // Age notice appears on first visit
  await page.goto(BASE + '/flavours');
  const gate = page.getByRole('dialog', { name: /welcome to rumpopo season/i });
  check('age notice shown on first visit', await gate.waitFor({ timeout: 4000 }).then(() => true, () => false));
  await page.getByRole('button', { name: /or older/i }).click();
  check('age notice dismissed', !(await gate.isVisible()));

  // Add items: 2 x Classic Vanilla with a note, 1 x Peanut Delight, then 3 more Classic Vanilla (merges)
  const card = (name) => page.locator('article.flavour-card', { has: page.getByRole('heading', { name }) });
  await card('Classic Vanilla').getByRole('button', { name: /increase/i }).click();
  await card('Classic Vanilla').getByRole('button', { name: '+ Add a note' }).click();
  await card('Classic Vanilla').getByPlaceholder(/gift/).fill('One bottle wrapped as a gift');
  await card('Classic Vanilla').getByRole('button', { name: /add to order/i }).click();
  await card('Peanut Delight').getByRole('button', { name: /add to order/i }).click();
  await card('Pumpkin Spice').getByRole('button', { name: /add to order/i }).click();
  const qty = card('Classic Vanilla').getByRole('spinbutton');
  await qty.fill('3');
  await qty.press('Enter');
  await card('Classic Vanilla').getByRole('button', { name: /add to order/i }).click();
  await page.waitForTimeout(300);

  // Drawer: edit and remove
  await page.getByRole('button', { name: /your order request,/i }).click();
  const drawer = page.getByRole('dialog', { name: /your order request/i });
  check('cart drawer opens', await drawer.isVisible());
  check('items merge per flavour (2 + 3 = 5)', (await drawer.getByRole('spinbutton', { name: 'Quantity of Classic Vanilla' }).inputValue()) === '5');
  await drawer.getByRole('button', { name: /remove pumpkin spice/i }).click();
  check('remove line', (await drawer.locator('.cart-line').count()) === 2);
  await drawer.getByRole('button', { name: 'Increase Quantity of Peanut Delight' }).click();
  await drawer.getByRole('link', { name: /review & send/i }).click();

  // Order page
  await page.waitForURL('**/order');
  const cartLabel = await page.locator('.cart-btn').getAttribute('aria-label');
  check('header count = 7 bottles', /7 bottles/.test(cartLabel || ''), cartLabel);
  check('no fictional total shown', (await page.locator('.summary-totals').innerText()).includes('To be confirmed by Cojac’s'));

  // Large quantity clamps to 99
  const big = page.getByRole('spinbutton', { name: 'Quantity of Peanut Delight' });
  await big.fill('5000');
  await big.blur();
  await page.waitForTimeout(200);
  check('quantity clamps at 99', (await big.inputValue()) === '99', await big.inputValue());
  await big.fill('2');
  await big.blur();

  const send = page.getByRole('button', { name: /send order request on whatsapp/i }).or(page.getByRole('link', { name: /send order request on whatsapp/i }));
  if (MODE === 'qa') {
    // Validation: fulfilment required
    await page.evaluate(() => localStorage.removeItem('x'));
    await send.click();
    check('validation blocks send without fulfilment', (await page.getByText('Please choose how you’d like to receive your order.').count()) === 1 && waUrls.length === 0);
    await page.getByText('Delivery in Belize City', { exact: true }).click();
    await page.getByLabel(/area \/ neighbourhood/i).fill('Kings Park');
    await page.getByLabel(/preferred date/i).fill('2026-12-20');
    await page.getByLabel(/your name/i).fill('QA Tester');
    await page.getByLabel(/notes for cojac/i).fill('QA test — please ignore. Special chars: & # ? "quotes" 🎄');
    const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), send.click()]);
    await page.waitForTimeout(800);
    const url = waUrls[0] || popup?.url() || '';
    check('WhatsApp opened in a new tab via wa.me', url.startsWith('https://wa.me/'), url.slice(0, 40));
    const text = decodeURIComponent((url.split('text=')[1] || '').replace(/\+/g, ' '));
    for (const expect of [
      "Hello Cojac's Sumptuous Rumpopo! I'd like to request an order.",
      '- Classic Vanilla — Size to be confirmed × 5 — price to be confirmed',
      'Note: One bottle wrapped as a gift',
      '- Peanut Delight — Size to be confirmed × 2',
      '*SUBTOTAL:* To be confirmed by Cojac’s',
      '*FULFILMENT:* Delivery in Belize City',
      '*AREA:* Kings Park',
      '*PREFERRED DATE:* Sun, 20 December 2026',
      '*NAME:* QA Tester',
      '"quotes" 🎄',
      'Please confirm availability, final price, payment arrangements and fulfilment details.',
    ])
      check(`message contains: ${expect.slice(0, 50)}`, text.includes(expect));
    check('message has no Pumpkin Spice (removed)', !text.includes('Pumpkin'));
    check('honest feedback shown (no "order confirmed")', (await page.getByText('WhatsApp will open with your order request.').count()) === 1 && (await page.getByText(/order confirmed|order placed|payment received/i).count()) === 0);
    check('QA line is flagged', (await page.getByText('QA test line').count()) === 1);
    if (popup) await popup.close();
  } else {
    check('send button disabled without an approved number', await send.isDisabled());
    check('missing-number explanation shown', (await page.getByText(/order line is being set up/i).count()) === 1);
    check('no wa.me link anywhere on page', (await page.locator('a[href*="wa.me/"]').count()) === 0);
  }

  // Copy fallback
  await page.getByRole('button', { name: /copy order details/i }).click();
  await page.waitForTimeout(300);
  check('copy order details gives feedback', (await page.locator('.send-status').innerText()).length > 10);
  if (label === 'desktop') {
    const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
    check('clipboard holds the order message', clip.includes("I'd like to request an order"));
  }

  // Persistence across refresh, then clear
  await page.reload();
  await page.locator('.order-main .cart-line').first().waitFor({ timeout: 5000 }).catch(() => {});
  check('order request survives refresh', (await page.locator('.order-main .cart-line').count()) === 2);
  await page.getByRole('button', { name: 'Clear order request' }).click();
  check('clear empties the order', (await page.getByText('Your order request is empty').count()) >= 1);

  // Mobile menu reaches every section
  if (label !== 'desktop') {
    await page.getByRole('button', { name: 'Open menu' }).click();
    const links = await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link').allInnerTexts();
    check('mobile menu lists all 9 sitemap sections', links.length >= 9, links.length + ' links');
    await page.getByRole('dialog', { name: 'Site menu' }).getByRole('link', { name: 'The Cojac’s Guarantee' }).click();
    await page.waitForURL('**/our-guarantee');
    check('mobile menu navigation works', await page.getByRole('heading', { level: 1, name: /what you can expect/i }).waitFor({ timeout: 4000 }).then(() => true, () => false));
  }
  check('no page errors', errors.length === 0, errors.join(' | '));
  await ctx.close();
}
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
