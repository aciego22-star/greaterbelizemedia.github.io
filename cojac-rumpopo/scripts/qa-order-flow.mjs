/**
 * End-to-end test of the WhatsApp order-request flow (no messages are sent:
 * wa.me requests are intercepted and blocked).
 *
 *   QA_MODE=official production build with the business number (default) — full hand-off;
 *                    wa.me requests are intercepted and blocked, so nothing is ever sent
 *   QA_MODE=qa       build with VITE_QA_WHATSAPP=<fake number> and no official number
 *   QA_MODE=nonumber build with the official number cleared — send button safely disabled
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium, devices } = require('playwright');

const BASE = process.env.QA_BASE || 'http://localhost:4173';
const MODE = process.env.QA_MODE || 'official';
const EXPECT_NUMBER = process.env.QA_EXPECT_NUMBER || (MODE === 'qa' ? '5010000000' : '5016218372');
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
  // Fly to basket: a small photo with a ×2 badge floats to the header basket, which then bounces.
  const flyer = page.locator('.fly-to-cart');
  check('fly to basket: photo floats toward the basket', await flyer.first().waitFor({ state: 'attached', timeout: 1000 }).then(() => true, () => false));
  check('fly to basket: shows ×2 badge', (await flyer.first().locator('.fly-to-cart__qty').innerText().catch(() => '')) === '×2');
  check('fly to basket: flyer is hidden from screen readers', (await flyer.first().getAttribute('aria-hidden').catch(() => null)) === 'true');
  check('fly to basket: basket bounces on landing', await page.waitForSelector('.site-header .cart-btn.is-bumping', { timeout: 2500 }).then(() => true, () => false));
  check('fly to basket: flyer removed after landing', await flyer.first().waitFor({ state: 'detached', timeout: 1500 }).then(() => true, () => false));
  await card('Peanut Delight').locator('.size-option', { has: page.locator('input[value="liter"]') }).click();
  check('size picker shows Liter price BZD $38.00', (await card('Peanut Delight').locator('.flavour-card__price strong').innerText()) === 'BZD $38.00');
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
  // Classic Vanilla half liter 5 × $17 = $85 + Peanut Delight liter 2 × $38 = $76 → $161
  check('subtotal uses approved prices (BZD $161.00)', (await page.locator('.summary-totals').innerText()).includes('BZD $161.00'));

  // Large quantity clamps to 99
  const big = page.getByRole('spinbutton', { name: 'Quantity of Peanut Delight' });
  await big.fill('5000');
  await big.blur();
  await page.waitForTimeout(200);
  check('quantity clamps at 99', (await big.inputValue()) === '99', await big.inputValue());
  await big.fill('2');
  await big.blur();

  const send = page.getByRole('button', { name: /send order request on whatsapp/i }).or(page.getByRole('link', { name: /send order request on whatsapp/i }));
  if (MODE === 'qa' || MODE === 'official') {
    // Validation: fulfilment required
    await page.evaluate(() => localStorage.removeItem('x'));
    await send.click();
    check('validation blocks send without fulfilment', (await page.getByText('Please choose delivery, pickup or shipping.').count()) === 1 && waUrls.length === 0);
    // Pickup: free, no address
    await page.locator('.option-card', { hasText: 'Pickup' }).click();
    check('pickup shows "Free"', (await page.locator('.summary-totals').innerText()).includes('Free'));
    check('pickup asks for no address', (await page.getByLabel(/exact (delivery|shipping) address/i).count()) === 0);
    check('pickup shows a total (BZD $161.00)', (await page.locator('.summary-totals__total').innerText()).includes('BZD $161.00'));
    // Shipping: out of district, address + unconfirmed charge
    await page.locator('.option-card', { hasText: 'Out of district' }).click();
    check('shipping asks for the exact shipping address', (await page.getByLabel(/exact shipping address/i).count()) === 1);
    check('shipping charge shown as confirmed by Cojac’s', (await page.locator('.summary-totals').innerText()).includes('Charge confirmed by Cojac’s'));
    check('shipping shows no invented total', (await page.locator('.summary-totals__total').count()) === 0);
    check('shipping is paid by bank transfer only', (await page.locator('#payment-group .option-card').count()) === 1 && (await page.locator('#payment-group input[value="transfer"]').isChecked()));
    // Delivery: BZD $5 within Belize City
    await page.locator('.option-card', { hasText: 'Anywhere in and within Belize City' }).click();
    check('delivery is BZD $5.00', (await page.locator('.summary-totals').innerText()).includes('BZD $5.00'));
    check('delivery total is BZD $166.00', (await page.locator('.summary-totals__total').innerText()).includes('BZD $166.00'));
    // Name and exact address are required
    await send.click();
    check('send blocked without a name', (await page.getByText('Please enter your name.').count()) === 1 && waUrls.length === 0);
    check('send blocked without an address', (await page.getByText('Please enter your exact address.').count()) === 1 && waUrls.length === 0);
    await page.getByLabel(/your name/i).fill('QA Tester');
    await page.getByLabel(/exact delivery address/i).fill('12 Cleghorn St, blue house beside the church');
    // Payment: required; delivery offers cash on delivery or bank transfer
    await send.click();
    check('send blocked without a payment method', (await page.getByText('Please choose how you will pay.').count()) === 1 && waUrls.length === 0);
    const payLabels = await page.locator('#payment-group .option-card__title').allInnerTexts();
    check('delivery offers Cash on delivery and Bank transfer', JSON.stringify(payLabels) === JSON.stringify(['Cash on delivery', 'Bank transfer']), JSON.stringify(payLabels));
    await page.locator('#payment-group .option-card', { hasText: 'Cash on delivery' }).click();
    check('cash on delivery shows no bank step', (await page.locator('#bank-group').count()) === 0 && (await page.locator('.summary-totals').innerText()).includes('Cash on delivery'));
    await page.locator('#payment-group .option-card', { hasText: 'Bank transfer' }).click();
    const bankNames = await page.locator('.bank-option__name').allInnerTexts();
    check('bank transfer shows Heritage Bank, Belize Bank and Atlantic Bank', JSON.stringify(bankNames) === JSON.stringify(['Heritage Bank', 'Belize Bank', 'Atlantic Bank']), JSON.stringify(bankNames));
    check('bank app icons load', (await page.locator('.bank-option img').evaluateAll((imgs) => imgs.filter((i) => i.complete && i.naturalWidth > 0).length)) === 3);
    await send.click();
    check('send blocked until a bank is chosen', (await page.getByText('Please choose your bank.').count()) === 1 && waUrls.length === 0);
    await page.locator('.bank-option', { hasText: 'Belize Bank' }).click();
    const openHref = await page.locator('.transfer-panel__open').getAttribute('href');
    const expectHref = label === 'desktop' ? 'https://www.belizebank.com/' : label.startsWith('iPhone') ? 'https://apps.apple.com/bz/app/belize-bank-mobile-banking/id1361907333' : 'intent:';
    check(`"Open Belize Bank" goes to the ${label === 'desktop' ? 'website' : label.startsWith('iPhone') ? 'App Store app page' : 'installed app (Play Store fallback)'}`, (openHref || '').startsWith(expectHref) && (expectHref !== 'intent:' || (openHref || '').includes('package=com.belizebank.mobile')), (openHref || '').slice(0, 70));
    const panel = await page.locator('.transfer-panel').innerText();
    check('transfer panel shows the amount (BZD $166.00)', panel.includes('BZD $166.00'));
    check('transfer panel asks for the screenshot before the order is placed', /screenshot of your completed transfer/i.test(panel) && /order is placed once Cojac’s receives your transfer screenshot/i.test(panel));
    check('shows Cojac’s Atlantic Bank account 212001055, recipient Cojac Smith', panel.includes('Atlantic Bank Limited') && panel.includes('212001055') && panel.includes('Cojac Smith'));
    check('Belize Bank payers are told to send to another bank in Belize', /another bank in Belize/.test(panel));
    check('with a known total, transfer comes first', /send BZD \$166\.00 to the account above/.test(panel));
    if (label === 'desktop') {
      await page.getByRole('button', { name: 'Copy account number' }).click();
      const clipAcct = await page.evaluate(() => navigator.clipboard.readText().catch(() => ''));
      check('account number copies to the clipboard', clipAcct === '212001055', clipAcct);
    }
    check('summary shows Bank transfer (Belize Bank)', (await page.locator('.summary-totals').innerText()).includes('Bank transfer (Belize Bank)'));
    await page.getByLabel(/preferred date/i).fill('2026-12-20');
    await page.getByLabel(/notes for cojac/i).fill('QA test, please ignore. Special chars: & # ? "quotes" 🎄');
    const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), send.click()]);
    await page.waitForTimeout(800);
    const url = waUrls[0] || popup?.url() || '';
    check('WhatsApp opened in a new tab via wa.me', url.startsWith('https://wa.me/'), url.slice(0, 40));
    check(`destination number is ${EXPECT_NUMBER}`, url.startsWith(`https://wa.me/${EXPECT_NUMBER}?text=`));
    const text = decodeURIComponent((url.split('text=')[1] || '').replace(/\+/g, ' '));
    for (const expect of [
      "Hi Cojac's Sumptuous Rumpopo! *Order request:*",
      '5 × Classic Vanilla Rumpopo (Half liter): BZD $85.00',
      'Note: One bottle wrapped as a gift',
      '2 × Peanut Delight Rumpopo (Liter): BZD $76.00',
      'Delivery (Belize City): BZD $5.00',
      '*Total: BZD $166.00*',
      'Name: QA Tester',
      'Address: 12 Cleghorn St, blue house beside the church',
      'Date: Sun, 20 December 2026',
      '"quotes" 🎄',
      'Payment: Bank transfer (Belize Bank)',
      'I will send the transfer screenshot in this chat.',
      'Please confirm availability and payment. Thank you!',
    ])
      check(`message contains: ${expect.slice(0, 50)}`, text.includes(expect));
    check('message is short (≤ 17 lines)', text.split('\n').length <= 17, `${text.split('\n').length} lines`);
    check('message has no em/en dashes', !/[—–]/.test(text));
    check('message has no Pumpkin Spice (removed)', !text.includes('Pumpkin'));
    check('honest feedback shown (no "order confirmed")', (await page.getByText('WhatsApp will open with your order request.').count()) === 1 && (await page.getByText(/order confirmed|order placed|payment received/i).count()) === 0);
    if (MODE === 'qa') check('QA line is flagged', (await page.getByText('QA test line').count()) === 1);
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
    check('clipboard holds the order message', clip.includes('*Order request:*'));
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
