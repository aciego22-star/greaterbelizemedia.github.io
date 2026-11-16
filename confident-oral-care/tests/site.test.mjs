import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, before, test } from 'node:test';
import { createApp } from '../src/server.mjs';
import { loadJson, silentLogger } from './helpers.mjs';

let server;
let base;
let clinic;
const pages = new Map();

const ROUTES = [
  '/', '/about', '/services', '/first-visit', '/gallery', '/blog', '/contact', '/appointments',
  '/services/consultations-diagnostics', '/services/general-preventive-dentistry', '/services/orthodontics-protective-appliances',
  '/services/crowns-recementation', '/services/root-canal-treatments', '/services/extractions-oral-surgery', '/services/dentures-prosthodontics',
  '/blog/getting-ready-for-your-first-dental-visit', '/blog/what-to-ask-about-retainers', '/blog/preparing-for-a-denture-consultation',
];

const ES_ROUTES = ROUTES.map((r) => (r === '/' ? '/es' : `/es${r}`));

before(async () => {
  clinic = await loadJson('config/clinic-data.json');
  const dataDir = await mkdtemp(join(tmpdir(), 'confident-site-'));
  const app = await createApp({ client: null, logger: silentLogger, dataDir });
  server = createServer(app.handler);
  await new Promise((r) => server.listen(0, r));
  base = `http://localhost:${server.address().port}`;
  for (const route of [...ROUTES, ...ES_ROUTES]) {
    const res = await fetch(base + route);
    assert.equal(res.status, 200, route);
    pages.set(route, await res.text());
  }
});
after(() => server.close());

test('every page has a unique title and a description, and the preview is not indexable', async () => {
  const titles = new Set();
  for (const [route, html] of pages) {
    const title = html.match(/<title>([^<]+)<\/title>/)[1];
    assert.ok(!titles.has(title), `duplicate title on ${route}`);
    titles.add(title);
    assert.match(html, /<meta name="description" content="[^"]{50,}">/, route);
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/, route);
  }
  const res = await fetch(`${base}/robots.txt`);
  assert.equal(await res.text(), 'User-agent: *\nDisallow: /\n');
  assert.equal((await fetch(`${base}/`)).headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('Instagram and Facebook links use the exact clinic URLs in the footer and on Contact Us', () => {
  const ig = `href="${clinic.socialLinks.instagram}"`;
  const fb = `href="${clinic.socialLinks.facebook.replace(/&/g, '&amp;')}"`;
  for (const [route, html] of pages) {
    const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
    assert.ok(footer.includes(ig) && footer.includes('Instagram</a>'), `footer Instagram on ${route}`);
    assert.ok(footer.includes(fb) && footer.includes('Facebook</a>'), `footer Facebook on ${route}`);
    assert.ok(html.includes('href="tel:+5016288233"'), `tap-to-call on ${route}`);
  }
  const main = pages.get('/contact').slice(pages.get('/contact').indexOf('<main'), pages.get('/contact').indexOf('</main>'));
  assert.ok(main.includes(ig) && main.includes(fb));
  assert.ok(main.includes('href="mailto:info@confidentoc.com"'));
  assert.ok(main.includes('https://www.google.com/maps/search/?api=1&amp;query=The%20Boardwalk%20Belize%2C%20Belize%20City%2C%20Belize'));
  assert.ok(main.includes('9 a.m.–noon and 2–5 p.m.'));
  assert.ok(main.includes('9 a.m.–1 p.m.'));
});

test('all 22 advertised services have an anchored section and appear in the services index', () => {
  let count = 0;
  for (const group of clinic.serviceGroups) {
    const html = pages.get(`/services/${group.slug}`);
    for (const s of group.services) {
      count += 1;
      assert.ok(html.includes(`id="${s.slug}"`), `${s.slug} anchor`);
      assert.ok(pages.get('/services').includes(`href="/services/${group.slug}#${s.slug}"`), `${s.slug} in index`);
    }
  }
  assert.equal(count, 22);
});

test('every internal link and in-page anchor resolves', async () => {
  const checked = new Map();
  for (const [route, html] of pages) {
    for (const [, href] of html.matchAll(/href="(\/[^"#?]*)(?:\?[^"#]*)?(#[^"]*)?"/g)) {
      if (!checked.has(href)) {
        const res = await fetch(base + href);
        checked.set(href, res.status === 200 ? await res.text() : null);
      }
      assert.ok(checked.get(href) !== null, `${route} links to ${href}, which is not 200`);
    }
    for (const [, path, hash] of html.matchAll(/href="(\/[^"#?]*)?(?:\?[^"#]*)?#([^"]+)"/g)) {
      const target = path ? (checked.get(path) ?? pages.get(path)) : html;
      assert.ok(target?.includes(`id="${hash}"`), `${route} links to ${path ?? ''}#${hash}, which has no target`);
    }
  }
  assert.ok(checked.size > 20);
});

test('the home page sections appear in the briefed order with a first-screen appointment CTA', () => {
  const html = pages.get('/');
  const order = ['hero-title', 'meet-title', 'services-title', 'first-title', 'inside-title', 'blog-title', 'visit-heading', '<footer'].map((k) => html.indexOf(k));
  assert.deepEqual([...order].sort((a, b) => a - b), order);
  const hero = html.slice(html.indexOf('data-hero'), html.indexOf('meet-title'));
  assert.ok(hero.includes('href="/appointments">Request an appointment</a>'));
  assert.ok(!html.includes('header-cta'), 'the appointment button is no longer in the header');
  assert.match(html, /<nav class="lang-switch"[^>]*>\s*<a href="\/" hreflang="en"[^>]*aria-current="true"/);
  assert.ok(hero.includes('fetchpriority="high"'), 'hero poster loads eagerly');
});

test('home hero: reception photo, opening-day photo, then the video, with small controls', () => {
  const html = pages.get('/');
  const hero = html.slice(html.indexOf('data-hero'), html.indexOf('meet-title'));
  const labels = [...hero.matchAll(/aria-roledescription="slide" aria-label="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(labels, ['1 of 4: Our reception', '2 of 4: Opening day at The Boardwalk', '3 of 4: Our treatment room', '4 of 4: The route to ConfiDent']);
  assert.match(hero, /data-interval="6"/);
  assert.match(hero, /<video class="hero-video" playsinline preload="none" poster="\/img\/web\/route-to-confident-poster\.jpg"/);
  assert.ok(!/<video[^>]*\smuted/.test(hero), 'hero video is not forced muted (sound where the browser allows)');
  for (const ctl of ['data-hero-prev', 'data-hero-next', 'data-hero-pause', 'data-hero-sound']) assert.ok(hero.includes(ctl), ctl);
  assert.equal((hero.match(/data-hero-dot=/g) || []).length, 4);
});

test('no eyebrow labels anywhere on the site', () => {
  for (const [route, html] of pages) assert.ok(!html.includes('class="eyebrow"'), route);
});

test('gallery has all six photos and a distinct #videos section', () => {
  const html = pages.get('/gallery');
  assert.ok(html.includes('id="videos"'));
  for (const id of ['reception', 'opening-day', 'treatment-room', 'celebration', 'reception-desk', 'waiting-area']) assert.ok(html.includes(`id="${id}"`), id);
  assert.ok(html.includes('/img/web/team-celebration-640.webp'));
  assert.ok(html.includes(`href="${clinic.socialLinks.instagram}"`));
});

test('the route video plays only on request, with a poster, in the gallery and beside the directions', async () => {
  for (const route of ['/gallery', '/contact']) {
    const html = pages.get(route);
    const video = html.slice(html.indexOf('<main')).match(/<video[^>]*>/)[0];
    assert.match(video, /controls/);
    assert.match(video, /preload="metadata"/);
    assert.match(video, /poster="\/img\/web\/route-to-confident-poster\.jpg"/);
    assert.ok(!/autoplay/.test(video), `${route} gallery clip must not autoplay`);
    assert.ok(html.includes('src="/media/route-to-confident.mp4"'));
  }
  assert.ok(pages.get('/contact').includes('id="find-your-way"'));
  const res = await fetch(`${base}/media/route-to-confident.mp4`, { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('content-type'), 'video/mp4');
  assert.equal(res.headers.get('accept-ranges'), 'bytes');
  const part = await fetch(`${base}/media/route-to-confident.mp4`, { headers: { range: 'bytes=0-1023' } });
  assert.equal(part.status, 206);
  assert.equal((await part.arrayBuffer()).byteLength, 1024);
  assert.match(part.headers.get('content-range'), /^bytes 0-1023\/\d+$/);
  const tail = await fetch(`${base}/media/route-to-confident.mp4`, { headers: { range: 'bytes=-500' } });
  assert.equal(tail.status, 206);
  assert.equal((await tail.arrayBuffer()).byteLength, 500);
  const bad = await fetch(`${base}/media/route-to-confident.mp4`, { headers: { range: 'bytes=999999999-' } });
  assert.equal(bad.status, 416);
});

test('booking API: availability, prepare and complete over HTTP with a session cookie', async () => {
  const res = await fetch(`${base}/api/availability?visitType=general-consultation`);
  const cookie = res.headers.get('set-cookie').split(';')[0];
  const avail = await res.json();
  assert.equal(avail.status, 'ok');
  const headers = { 'content-type': 'application/json', cookie };
  const prep = await (await fetch(`${base}/api/booking/prepare`, { method: 'POST', headers, body: JSON.stringify({ slotRef: avail.slots[0].slotRef }) })).json();
  assert.equal(prep.status, 'ok');
  // Another session cannot use this review.
  const other = await (await fetch(`${base}/api/booking/complete`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reviewId: prep.review.reviewId, contact: { name: 'Test', phone: '6000000' } }) })).json();
  assert.equal(other.status, 'invalid_review');
  const done = await (await fetch(`${base}/api/booking/complete`, { method: 'POST', headers, body: JSON.stringify({ reviewId: prep.review.reviewId, contact: { name: 'Test Patient', phone: '+501 600-0000' } }) })).json();
  assert.equal(done.status, 'confirmed');
  assert.equal(done.eventId, undefined, 'internal calendar IDs are not exposed');
  const cal = await (await fetch(`${base}/preview/test-calendar`)).text();
  assert.ok(cal.includes(done.bookingRef));
  assert.ok(!cal.includes('Test Patient'));
  // Cross-origin POSTs are refused.
  const xo = await fetch(`${base}/api/booking/prepare`, { method: 'POST', headers: { ...headers, origin: 'https://evil.example' }, body: '{}' });
  assert.equal(xo.status, 403);
});

test('every Spanish page renders in Spanish with matching English alternates', () => {
  for (const route of ES_ROUTES) {
    const html = pages.get(route);
    assert.match(html, /<html lang="es">/, route);
    const enPath = route === '/es' ? '/' : route.slice(3);
    assert.ok(html.includes(`hreflang="en" href="${enPath}"`), `${route} alternate`);
    assert.ok(html.includes(`<a href="${enPath}" hreflang="en" lang="en"`), `${route} language switch`);
  }
  assert.ok(pages.get('/es').includes('Donde comienza la confianza'));
  assert.ok(pages.get('/es/services/crowns-recementation').includes('Coronas de zirconia'));
  assert.ok(pages.get('/es/blog/what-to-ask-about-retainers').includes('¿Qué debo preguntar sobre los retenedores?'));
  assert.ok(pages.get('/es/contact').includes('Lunes a viernes'));
  assert.ok(pages.get('/es/services').includes('href="/es/services/dentures-prosthodontics#immediate-dentures"'));
  const titles = new Set(ES_ROUTES.map((r) => pages.get(r).match(/<title>([^<]+)<\/title>/)[1]));
  assert.equal(titles.size, ES_ROUTES.length, 'unique Spanish titles');
});

test('WhatsApp replaces Instagram DM, and the menu has Home, WhatsApp, Instagram and Facebook', () => {
  for (const [route, html] of pages) {
    const head = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
    assert.ok(head.includes('href="https://wa.me/5016288233"'), `menu WhatsApp on ${route}`);
    assert.ok(head.includes(`href="${clinic.socialLinks.facebook.replace(/&/g, '&amp;')}"`), `menu Facebook on ${route}`);
    assert.ok(head.includes(`href="${clinic.socialLinks.instagram.replace(/&/g, '&amp;')}"`), `menu Instagram on ${route}`);
    assert.ok(head.includes('<span class="nav-social-label">WhatsApp</span>'), `menu WhatsApp label has no number on ${route}`);
    assert.match(head, route.startsWith('/es') ? /<a href="\/es"[^>]*>Inicio<\/a>/ : /<a href="\/"[^>]*>Home<\/a>/, `Home link on ${route}`);
    const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
    assert.ok(footer.includes('href="https://wa.me/5016288233"'), `footer WhatsApp on ${route}`);
    assert.ok(!/Instagram DM|message us on Instagram|Message us on Instagram/.test(html), `no Instagram DM wording on ${route}`);
    assert.ok(html.includes('data-back-to-top'), `back to top on ${route}`);
  }
});

test('nothing served to visitors names the assistant technology', async () => {
  const assets = await Promise.all(['/js/site.js', '/js/assistant.js', '/js/booking.js', '/css/site.css'].map(async (a) => (await fetch(base + a)).text()));
  for (const text of [...pages.values(), ...assets]) assert.ok(!/claude|anthropic/i.test(text));
  const status = await (await fetch(`${base}/api/assistant/status`)).text();
  assert.ok(!/claude|anthropic/i.test(status));
});

test('the assistant panel has two quick actions, a new-chat button and the logo launcher', () => {
  const html = pages.get('/');
  const panel = html.slice(html.indexOf('id="ai-panel"'));
  assert.deepEqual([...panel.matchAll(/data-ai-action="([^"]+)"/g)].map((m) => m[1]), ['request-appointment', 'find-service']);
  assert.ok(panel.includes('data-ai-new'));
  assert.match(html, /<button class="ai-launcher"[^>]*>\s*<img class="ai-launcher-logo"/);
});

test('booking API answers in Spanish for the Spanish site', async () => {
  const res = await fetch(`${base}/api/availability?visitType=general-consultation&lang=es`);
  const cookie = res.headers.get('set-cookie').split(';')[0];
  const avail = await res.json();
  assert.equal(avail.visitType.label, 'Consulta general');
  assert.match(avail.slots[0].dateLabel, /^(lunes|martes|miércoles|jueves|viernes|sábado), \d+ de \w+ de \d{4}$/);
  assert.match(avail.slots[0].timeLabel, /[ap]\. m\.$/);
  const headers = { 'content-type': 'application/json', cookie };
  const prep = await (await fetch(`${base}/api/booking/prepare`, { method: 'POST', headers, body: JSON.stringify({ slotRef: avail.slots[1].slotRef, lang: 'es' }) })).json();
  const bad = await (await fetch(`${base}/api/booking/complete`, { method: 'POST', headers, body: JSON.stringify({ reviewId: prep.review.reviewId, contact: { name: 'A' }, lang: 'es' }) })).json();
  assert.equal(bad.errors.name, 'Escriba un nombre.');
  const done = await (await fetch(`${base}/api/booking/complete`, { method: 'POST', headers, body: JSON.stringify({ reviewId: prep.review.reviewId, contact: { name: 'Paciente de prueba', phone: '+501 600-0000' }, lang: 'es' }) })).json();
  assert.match(done.message, /^Su cita está confirmada para el /);
  const types = await (await fetch(`${base}/api/visit-types?lang=es`)).json();
  assert.ok(types.services.some((o) => o.value === 'Zirconia crowns' && o.label === 'Coronas de zirconia'));
});

test('the footer credits Austere Automations in both languages', () => {
  for (const [route, html] of pages) {
    const footer = html.slice(html.indexOf('<footer'), html.indexOf('</footer>'));
    const label = route.startsWith('/es') ? 'Sitio web y concepto de IA por' : 'Website &amp; AI concept by';
    assert.match(footer, new RegExp(`class="footer-credit">${label} (<a [^>]+>)?Austere Automations`), `credit on ${route}`);
  }
});
