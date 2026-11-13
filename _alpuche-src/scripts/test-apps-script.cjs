// Runs integrations/google-apps-script/Code.gs in Node with Google's services mocked.
//   node _alpuche-src/scripts/test-apps-script.cjs
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const code = fs.readFileSync(path.join(__dirname, '..', 'integrations', 'google-apps-script', 'Code.gs'), 'utf8');

function sandbox({ quota = 100 } = {}) {
  const sent = [];
  const props = new Map();
  const cache = new Map();
  const ctx = {
    sent,
    MailApp: { sendEmail: (m) => sent.push(m), getRemainingDailyQuota: () => quota - sent.length },
    ContentService: { MimeType: { JSON: 'json' }, createTextOutput: (s) => ({ text: s, setMimeType() { return this; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: (k) => props.get(k) || null, setProperty: (k, v) => props.set(k, v) }) },
    CacheService: { getScriptCache: () => ({ get: (k) => cache.get(k) || null, put: (k, v) => cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
    Utilities: { formatDate: () => '2026-11-13', getUuid: () => crypto.randomUUID() },
    Logger: { log() {} },
    JSON, String, Number, Math, Date, Error,
  };
  vm.createContext(ctx);
  vm.runInContext(code, ctx);
  ctx.CONFIG.LEAD_INBOX = 'agency@example.com';
  ctx.post = (body) => JSON.parse(ctx.doPost({ postData: { contents: JSON.stringify(body) } }).text);
  return ctx;
}

let pass = 0;
let fail = 0;
const check = (c, m, d) => { if (c) pass++; else { fail++; console.log('  ✗ ' + m + (d ? '\n      ' + d : '')); } };
const lead = (o = {}) => Object.assign({
  ref: 'JMA-AB2CD', name: 'Jane Doe', channel: 'email', email: 'jane@example.com', phone: '', area: 'real-estate',
  upcomingDate: 'no', description: 'Buying land near Placencia <script>alert(1)</script>', page: '/practice-areas/real-estate/', website: '',
}, o);

{
  const s = sandbox();
  const r = s.post(lead());
  check(r.ok && r.ref === 'JMA-AB2CD', 'valid enquiry accepted with its reference', JSON.stringify(r));
  check(s.sent.length === 2, 'two emails sent (office + confirmation)');
  const [office, conf] = s.sent;
  check(office.to === 'agency@example.com' && office.replyTo === 'jane@example.com', 'office email goes to LEAD_INBOX, reply-to visitor');
  check(/^\[Demo\] New enquiry: Real Estate \(JMA-AB2CD\)$/.test(office.subject), 'office subject', office.subject);
  check(office.body.includes('Buying land near Placencia') && office.body.includes('Jane Doe'), 'office email has the details');
  check(!office.htmlBody.includes('<script>') && office.htmlBody.includes('&lt;script&gt;'), 'HTML escaped in office email');
  check(conf.to === 'jane@example.com' && conf.replyTo === 'agency@example.com', 'confirmation to visitor, replies go to the inbox');
  check(!conf.body.includes('Placencia') && !conf.htmlBody.includes('Placencia'), 'confirmation never repeats the visitor’s message');
  check(/does not create an attorney–client relationship/.test(conf.body) && conf.body.includes('+501 223-1194'), 'confirmation has disclaimer and phone');
  const again = s.post(lead({ ref: 'JMA-ZZ9ZZ' }));
  check(!again.ok && again.error === 'cooldown' && s.sent.length === 2, 'same address within cooldown is refused');
}
{
  const s = sandbox();
  const r = s.post(lead({ channel: 'phone', email: '', phone: '+1 (416) 555-0199' }));
  check(r.ok && s.sent.length === 1 && !s.sent[0].replyTo, 'phone-only enquiry: one email, no confirmation');
  check(s.sent[0].body.includes('+14165550199'), 'phone normalised');
}
{
  const s = sandbox();
  check(s.post(lead({ website: 'http://spam' })).ok && s.sent.length === 0, 'honeypot: reports success, sends nothing');
  check(!s.post(lead({ email: 'not-an-email' })).ok, 'invalid email refused');
  check(!s.post(lead({ name: 'x' })).ok, 'too-short name refused');
  check(!s.post(lead({ description: 'x'.repeat(501) })).ok, 'over-long message refused');
  check(!s.post(lead({ channel: 'fax' })).ok, 'unknown channel refused');
  const odd = s.post(lead({ area: 'hacking', ref: '<b>', page: 'javascript:alert(1)', email: 'other@example.com' }));
  check(odd.ok && /^JMA-[A-Z0-9]{5}$/.test(odd.ref), 'unknown area/ref/page replaced with safe values', JSON.stringify(odd));
  check(s.sent[0].subject.includes('Not sure / other') && s.sent[0].body.includes('Sent from page: /'), 'safe values used in email');
  check(s.sent[0].body.includes('Name: Jane Doe'), 'name kept');
  const s2 = sandbox();
  s2.post(lead({ name: 'Visit www.spam.com now' }));
  check(!/www\.spam\.com/.test(s2.sent[1].body), 'dots/links stripped from names in the confirmation', s2.sent[1].body.slice(0, 60));
}
{
  const s = sandbox();
  s.CONFIG.DAILY_LIMIT = 2;
  s.post(lead({ email: 'a@example.com' }));
  s.post(lead({ email: 'b@example.com' }));
  const r = s.post(lead({ email: 'c@example.com' }));
  check(!r.ok && r.error === 'daily-limit', 'daily limit enforced');
}
{
  const s = sandbox({ quota: 1 });
  const r = s.post(lead());
  check(!r.ok && r.error === 'quota' && s.sent.length === 0, 'stops cleanly when Gmail quota is low');
}
{
  const s = sandbox();
  check(JSON.parse(s.doGet().text).ok, 'doGet reports the endpoint is alive');
  s.testSend();
  check(s.sent.length === 2 && s.sent[0].to === 'agency@example.com', 'testSend sends a sample to LEAD_INBOX');
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
