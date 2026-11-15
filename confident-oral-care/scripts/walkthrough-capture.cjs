// Captures every page and the booking / confident AI flows for the PDF walkthrough.
// Usage: start the server (npm start), then: node scripts/walkthrough-capture.cjs http://localhost:3000 <output-dir>
// Requires Playwright with Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const [,, base, out] = process.argv;
const items = [];
let n = 0;
const shot = async (p, label, opts = {}) => {
  const file = `${out}/${String(++n).padStart(2, '0')}.png`;
  await p.screenshot({ path: file, ...opts });
  items.push({ file, label, kind: opts.kind || 'phone' });
};
async function settle(p) {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    window.scrollTo(0, 0);
  });
  await p.waitForLoadState('networkidle'); await p.waitForTimeout(400);
}
const ask = async (p, text) => {
  const before = await p.locator('.msg-ai:not(:has(.typing))').count();
  await p.locator('#ai-input').fill(text); await p.locator('.btn-send').click();
  await p.waitForFunction((b) => document.querySelectorAll('.msg-ai:not(:has(.typing))').length > b && !document.querySelector('.typing'), before, { timeout: 10000 });
  await p.waitForTimeout(300);
};
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const pages = [
    ['/', 'Home'], ['/about', 'About: Meet Dr. Brittni Haylock'], ['/services', 'Services'],
    ['/services/consultations-diagnostics', 'Consultations & Diagnostics'], ['/services/general-preventive-dentistry', 'General & Preventive Dentistry'],
    ['/services/orthodontics-protective-appliances', 'Orthodontics & Protective Appliances'], ['/services/crowns-recementation', 'Crowns & Recementation'],
    ['/services/root-canal-treatments', 'Root Canal Treatments'], ['/services/extractions-oral-surgery', 'Extractions & Oral Surgery'],
    ['/services/dentures-prosthodontics', 'Dentures & Prosthodontics'], ['/first-visit', 'Your First Visit'], ['/gallery', 'Gallery (with Videos)'],
    ['/blog', 'Dental Blog'], ['/blog/getting-ready-for-your-first-dental-visit', 'Blog: Getting ready for your first dental visit'],
    ['/blog/what-to-ask-about-retainers', 'Blog: What should I ask about retainers?'], ['/blog/preparing-for-a-denture-consultation', 'Blog: Preparing for a denture consultation'],
    ['/contact', 'Contact Us'], ['/appointments', 'Appointments'],
  ];
  for (const [path, label] of pages) {
    await p.goto(base + path, { waitUntil: 'networkidle' }); await settle(p);
    await p.evaluate(() => { const l = document.querySelector('.ai-launcher'); if (l) l.style.visibility = 'hidden'; });
    await shot(p, `${label} (phone, full page)`, { fullPage: true, kind: 'phone-full' });
  }
  // Menu
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.locator('.menu-toggle').click(); await p.waitForTimeout(300);
  await p.locator('.sub-toggle').click(); await p.waitForTimeout(300);
  await shot(p, 'Mobile menu with the Services list open');
  await p.keyboard.press('Escape');
  // confident AI (demo mode) conversation and booking
  await p.goto(base + '/', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Ask confident AI' }).click(); await p.waitForTimeout(600);
  await shot(p, 'confident AI: greeting, demo-mode note and suggested actions');
  await ask(p, 'Do you do zirconia crowns?');
  await shot(p, 'confident AI: "Do you do zirconia crowns?"');
  await ask(p, 'How much is a cleaning?');
  await shot(p, 'confident AI: "How much is a cleaning?" (fees not yet confirmed, so it refers to the team)');
  await ask(p, 'Can I come Tuesday at 12:30?');
  await shot(p, 'confident AI: asking for a lunch-hour time gets real alternatives');
  await ask(p, 'Book a consultation Saturday morning');
  await shot(p, 'confident AI: real available times from the scheduler');
  await ask(p, '2');
  await p.locator('.msg-widget form').waitFor();
  const w = p.locator('.msg-widget');
  await w.getByLabel('Your name').fill('Test Patient (demo)'); await w.getByLabel('Phone').fill('+501 600-0001');
  await w.locator('form').evaluate((el) => el.scrollIntoView({ block: 'end' })); await p.waitForTimeout(300);
  await shot(p, 'confident AI: the booking form opens in the chat (patient enters their own details)');
  await w.getByRole('button', { name: 'Confirm booking' }).click();
  await w.locator('.result-confirmed').waitFor(); await p.waitForTimeout(300);
  await shot(p, 'confident AI: booking confirmed after the calendar saves it');
  await p.locator('[data-ai-close]').click();
  // Standard booking form
  await p.goto(base + '/appointments#booking', { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  await p.locator('#booking').evaluate((el) => el.scrollIntoView()); await p.waitForTimeout(300);
  await shot(p, 'Booking form, step 1: choose a visit type');
  await p.locator('[data-booking]').getByRole('button', { name: 'Continue' }).click();
  await p.locator('.slot-btn').first().waitFor(); await p.waitForTimeout(300);
  await shot(p, 'Booking form, step 2: available times (Belize time)');
  await p.locator('.slot-btn').nth(4).click();
  await p.locator('[data-booking]').getByRole('button', { name: 'Continue' }).click();
  await p.getByLabel('Your name').fill('Test Form Patient'); await p.getByLabel('Email').fill('test@example.com');
  await p.locator('[data-booking] h3').evaluate((el) => { el.scrollIntoView({ block: 'start' }); window.scrollBy(0, -80); });
  await p.waitForTimeout(300);
  await shot(p, 'Booking form, step 3: review and enter details');
  await p.getByRole('button', { name: 'Confirm booking' }).click();
  await p.locator('.result-confirmed').waitFor(); await p.waitForTimeout(300);
  await shot(p, 'Booking form, step 4: confirmed, with booking reference');
  // Staff review
  await p.goto(base + '/appointments?r=1#booking', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  await p.locator('label.visit-option', { hasText: 'Orthodontic consultation' }).click();
  await p.locator('[data-booking]').getByRole('button', { name: 'Continue' }).click();
  await p.getByLabel('Your name').fill('Test Parent'); await p.getByLabel('Phone').fill('+501 600-0003');
  await p.getByRole('button', { name: 'Send request' }).click();
  await p.locator('.result-review').waitFor(); await p.waitForTimeout(300);
  await shot(p, 'Orthodontic consultation: request recorded for the team (no time set)');
  // Gallery lightbox
  await p.goto(base + '/gallery', { waitUntil: 'networkidle' });
  await p.locator('.gallery-open').first().click(); await p.waitForTimeout(600);
  await shot(p, 'Gallery: photo viewer');
  await p.keyboard.press('Escape');
  // Test calendar
  await p.goto(base + '/preview/test-calendar', { waitUntil: 'networkidle' }); await settle(p);
  await shot(p, 'Test calendar (preview only): saved bookings in Belize time', { fullPage: true, kind: 'phone-full' });
  // Desktop
  const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
  for (const [path, label] of [['/', 'Home'], ['/services', 'Services'], ['/services/crowns-recementation', 'Treatment page'], ['/contact', 'Contact Us'], ['/appointments', 'Appointments']]) {
    await d.goto(base + path, { waitUntil: 'networkidle' }); await d.waitForTimeout(400);
    await shot(d, `${label} (desktop, first screen)`, { kind: 'desktop' });
  }
  await d.goto(base + '/', { waitUntil: 'networkidle' });
  await d.getByRole('button', { name: 'Ask confident AI' }).click(); await d.waitForTimeout(500);
  await ask(d, 'What are your hours?');
  await shot(d, 'confident AI on desktop', { kind: 'desktop' });
  fs.writeFileSync(`${out}/items.json`, JSON.stringify(items, null, 1));
  console.log('captured', items.length);
  await b.close();
})();
