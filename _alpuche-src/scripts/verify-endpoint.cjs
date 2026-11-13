// End-to-end check of enquiry delivery against a mock endpoint that behaves like the Apps Script
// web app. Builds a Netlify bundle pointed at the mock, serves it with Netlify's headers (CSP),
// and runs the enquiry in a browser.
//   node _alpuche-src/scripts/verify-endpoint.cjs
const http = require('http');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { execFileSync, spawn } = require('child_process');
const { chromium } = require('playwright');

const SRC = path.join(__dirname, '..');
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'alpuche-endpoint-'));
const MOCK_PORT = 8091;
const SITE_PORT = 8092;
const ENDPOINT = `http://localhost:${MOCK_PORT}/exec`;

let pass = 0;
let fail = 0;
const ok = (c, m, d) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m + (d ? '\n      ' + d : '')); } };

(async () => {
  execFileSync(process.execPath, [path.join(SRC, 'build.mjs'), '--netlify', `--lead-endpoint=${ENDPOINT}`, `--out=${OUT}`], { stdio: 'ignore' });
  const headers = fs.readFileSync(path.join(OUT, '_headers'), 'utf8');
  ok(headers.includes(`connect-src http://localhost:${MOCK_PORT};`), 'CSP allows only the configured endpoint', headers.split('\n')[2]);

  const received = [];
  let mode = 'ok';
  const mock = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      received.push({ method: req.method, type: req.headers['content-type'], body });
      if (mode === 'fail') { res.writeHead(500, { 'Access-Control-Allow-Origin': '*' }); return res.end('error'); }
      const data = JSON.parse(body || '{}');
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ ok: true, ref: data.ref }));
    });
  }).listen(MOCK_PORT);
  const site = spawn(process.execPath, [path.join(__dirname, 'serve-netlify.cjs'), OUT, String(SITE_PORT)], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 600));

  const browser = await chromium.launch();
  const page = await browser.newPage();
  const csp = [];
  page.on('console', (m) => { if (/Content Security Policy|Refused to connect/i.test(m.text())) csp.push(m.text()); });
  await page.addInitScript(() => { window.ALPUCHE_TYPING_SCALE = 0.1; });
  const botCount = () => page.locator('.chat-log .msg-bot:not(.is-typing)').count();
  const wait = (n) => page.waitForFunction((k) => document.querySelectorAll('.chat-log .msg-bot:not(.is-typing)').length > k && !document.querySelector('.chat-log .is-typing'), n, { timeout: 20000 });
  const tap = async (label) => { const n = await botCount(); await page.locator('.chat-chips button', { hasText: label }).first().click(); await wait(n); };
  const say = async (t) => { const n = await botCount(); await page.fill('#chat-text', t); await page.click('.chat-send'); await wait(n); };
  const last = () => page.locator('.chat-log .msg-bot:not(.is-typing)').last().innerText();

  async function enquiry(email) {
    await page.goto(`http://localhost:${SITE_PORT}/practice-areas/family-law/`, { waitUntil: 'networkidle' });
    await page.click('.contact-band a.button[data-intake]');
    await wait(0);
    ok(!/demo/i.test(await page.locator('.assistant-label').innerText()), 'live build is not labelled demo');
    await tap('Continue');
    await tap('Yes');
    await say('Ana Pérez');
    await tap('Email');
    await say(email);
    await tap('Not sure');
    await say('Questions about an adoption involving family in Canada');
    ok(!/Demo: nothing will actually be sent/.test(await last()), 'review has no demo note');
    await tap('Send to the office');
  }

  await enquiry('ana@example.com');
  let text = await last();
  ok(/has been sent to the office \(reference JMA-[A-Z0-9]{5}\)/.test(text), 'success message with reference', text);
  ok(/confirmation is on its way to ana@example\.com/.test(text), 'mentions the confirmation email');
  ok(received.length === 1 && received[0].method === 'POST', 'exactly one POST, no preflight', JSON.stringify(received.map((r) => r.method)));
  ok(/^text\/plain/.test(received[0].type || ''), 'sent as text/plain (accepted by Apps Script without preflight)', received[0].type);
  const p = JSON.parse(received[0].body);
  ok(p.name === 'Ana Pérez' && p.email === 'ana@example.com' && p.area === 'family-law' && p.channel === 'email' && p.upcomingDate === 'unsure' && p.page === '/practice-areas/family-law/' && p.website === '' && /adoption/.test(p.description), 'payload has exactly the reviewed details', JSON.stringify(p));
  ok(Object.keys(p).sort().join(',') === 'area,areaLabel,channel,description,email,name,page,phone,ref,source,upcomingDate,website', 'no extra fields (no transcript, no tracking)', Object.keys(p).join(','));

  mode = 'fail';
  await enquiry('ana.two@example.com');
  text = await last();
  ok(/couldn’t send that just now/.test(text) && /\+501 223-1194/.test(text), 'failure tells the visitor to call or email', text);
  const failedRef = JSON.parse(received[received.length - 1].body).ref;
  mode = 'ok';
  await tap('Try again');
  text = await last();
  ok(/has been sent/.test(text) && text.includes(failedRef), 'retry succeeds with the same reference', text);
  ok(csp.length === 0, 'no CSP violations', csp.join(' | '));

  await browser.close();
  site.kill();
  mock.close();
  fs.rmSync(OUT, { recursive: true, force: true });
  console.log(`${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
