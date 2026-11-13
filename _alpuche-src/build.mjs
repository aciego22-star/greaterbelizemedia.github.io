#!/usr/bin/env node
// Static site builder for the José M. Alpuche website demo.
// Zero dependencies. Reads content/*.md (frontmatter + Markdown) and ai/knowledge-base.md,
// writes a complete static site.
//
//   node _alpuche-src/build.mjs                      → private preview (noindex, no sitemap)
//   node _alpuche-src/build.mjs --production --site-url=https://example.bz
//                                                    → indexable build with canonicals + sitemap
//   --out=<dir>  output directory (default: demos/jose-m-alpuche at the repo root)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const PRODUCTION = !!args.production;
// --netlify: site served from a domain root; adds _headers, _redirects and 404.html.
const NETLIFY = !!args.netlify;
// --local: opens straight from disk (file://): links point at index.html files and fonts are inlined.
const LOCAL = !!args.local;
const OUT = path.resolve(args.out || (NETLIFY ? path.join(SRC, 'dist-netlify') : LOCAL ? path.join(SRC, 'dist-local', 'jose-m-alpuche-preview') : path.join(SRC, '..', 'demos', 'jose-m-alpuche')));
// Absolute base used for Open Graph URLs. Production canonicals need the confirmed domain.
// Netlify preview without a known URL: og:url is omitted and og:image is root-relative.
const SITE_URL = String(args['site-url'] || (NETLIFY ? '' : 'https://greaterbelizemedia.github.io/demos/jose-m-alpuche')).replace(/\/$/, '');
// Lead delivery for Alpuche AI. Without an endpoint the assistant runs in demo mode (nothing is sent).
const LEAD_ENDPOINT = typeof args['lead-endpoint'] === 'string' ? args['lead-endpoint'] : '';
// Optional click-to-chat WhatsApp number (digits with country code). Off unless the firm confirms a number.
if (LEAD_ENDPOINT && !/^https:\/\/|^http:\/\/localhost[:/]/.test(LEAD_ENDPOINT)) {
  console.error('--lead-endpoint must be an https:// URL.');
  process.exit(1);
}
if (PRODUCTION && !args['site-url']) {
  console.error('Production builds need --site-url=<confirmed domain>.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Firm data (single source for header, footer, contact page and assistant)
// ---------------------------------------------------------------------------
const OFFICE = {
  name: 'José M. Alpuche',
  role: 'Attorney-at-Law',
  address: ['The Northern Shops, Suite 19', '1½ Miles Philip Goldson Highway', 'Belize City, Belize'],
  phones: [{ label: '+501 223-1194', tel: '+5012231194' }, { label: '+501 223-1195', tel: '+5012231195' }],
  email: 'contact@alpuchelaw.com',
  // WhatsApp and Facebook supplied by the agency on 13 Nov 2026; confirm with the firm before launch.
  whatsapp: { label: '+501 625-3032', href: 'https://wa.me/5016253032' },
  facebook: 'https://www.facebook.com/alpuchelaw',
  hours: 'Monday to Friday, 8:00 a.m. to 5:00 p.m. Belize time',
  directions: 'https://www.google.com/maps/search/?api=1&query=Northern+Shops+1.5+Miles+Philip+Goldson+Highway+Belize+City',
};
// Click-to-chat WhatsApp for Alpuche AI: the firm's number by default; --whatsapp=off disables it.
const WHATSAPP = args.whatsapp === 'off' ? '' : (typeof args.whatsapp === 'string' ? args.whatsapp : OFFICE.whatsapp.href).replace(/\D/g, '');

// Brand icons from Simple Icons (CC0 1.0), shown in each brand's colour beside its link.
const ICON_PATHS = {
  whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
  facebook: 'M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z',
};
const ICONS = Object.fromEntries(Object.entries(ICON_PATHS).map(([k, d]) =>
  [k, `<svg class="icon icon-${k}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="${d}"/></svg>`]));

const PRACTICES = [
  { key: 'real-estate', label: 'Real Estate', route: '/practice-areas/real-estate/' },
  { key: 'corporate-commercial', label: 'Corporate & Commercial', route: '/practice-areas/corporate-commercial/' },
  { key: 'banking-finance-tax-regulatory', label: 'Banking, Finance, Tax & Regulatory', route: '/practice-areas/banking-finance-tax-regulatory/' },
  { key: 'dispute-resolution', label: 'Dispute Resolution', route: '/practice-areas/dispute-resolution/' },
  { key: 'intellectual-property', label: 'Intellectual Property', route: '/practice-areas/intellectual-property/' },
  { key: 'family-law', label: 'Family Law', route: '/practice-areas/family-law/' },
  { key: 'qualified-retired-persons', label: 'Qualified Retired Persons Programme', route: '/practice-areas/qualified-retired-persons/' },
];
const PRACTICE_BY_ROUTE = Object.fromEntries(PRACTICES.map((p) => [p.route, p]));

const GUIDES = [
  { label: 'Buying property in Belize', route: '/insights/buying-property-in-belize/' },
  { label: 'Starting a business in Belize', route: '/insights/starting-a-business-in-belize/' },
  { label: 'Planning retirement in Belize', route: '/insights/planning-retirement-in-belize/' },
];

const NAV = [
  { label: 'Practice Areas', route: '/practice-areas/' },
  { label: 'Our Team', route: '/about/' },
  { label: 'What to Expect', route: '/working-with-us/' },
  { label: 'Belize Legal Guides', route: '/insights/' },
  { label: 'Contact', route: '/contact/' },
];

// Belize photography: credits from assets/IMAGE-CREDITS.md. Widths match scripts/make-images.sh output.
const PHOTOS = {
  'belize-city-harbour': {
    w: 1712, h: 1155, widths: [640, 1024, 1600], position: '50% 60%',
    alt: 'Buildings along the waterfront in Belize City.', caption: 'Belize City harbour',
    title: 'Belize City harbour, Belize', author: 'Jasmine Halki',
    source: 'https://commons.wikimedia.org/wiki/File:Belize_City_harbour,_Belize.jpg',
    license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  'belize-city-courthouse': {
    w: 5370, h: 3648, widths: [640, 1024, 1600], position: '50% 58%',
    alt: 'The historic courthouse building in Belize City.', caption: 'Belize City Courthouse',
    title: 'Belize City Courthouse', author: 'Haakon S. Krohn',
    source: 'https://commons.wikimedia.org/wiki/File:Belize_City_Courthouse.jpg',
    license: 'CC BY-SA 3.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
  },
  'macal-river-san-ignacio': {
    w: 3000, h: 2000, widths: [640, 1024, 1600], position: '50% 55%',
    alt: 'The Macal River at San Ignacio, Belize.', caption: 'Macal River at San Ignacio',
    title: 'Macal River at San Ignacio', author: 'Kaldari',
    source: 'https://commons.wikimedia.org/wiki/File:Macal_River_at_San_Ignacio.jpg',
    license: 'CC0 1.0', licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  },
  'placencia-beach': {
    w: 1280, h: 852, widths: [640, 1024, 1280], position: '50% 62%',
    alt: 'Palm trees along the beach in Placencia, Belize.', caption: 'Beach front at Placencia',
    title: 'Beach front at Placencia, Belize', author: 'Dave ten Broek',
    source: 'https://commons.wikimedia.org/wiki/File:Beach_front_at_Placencia,_Belize.jpg',
    license: 'CC BY 2.0', licenseUrl: 'https://creativecommons.org/licenses/by/2.0/',
  },
  'baron-bliss-lighthouse': {
    w: 1544, h: 1024, widths: [640, 1024, 1544], position: '30% 30%',
    alt: 'The Baron Bliss Lighthouse at the Belize City waterfront.', caption: 'Baron Bliss Lighthouse, Belize City',
    title: 'Baron Bliss Lighthouse in Belize City, Belize', author: 'Didier Moïse',
    source: 'https://commons.wikimedia.org/wiki/File:Baron_Bliss_Lighthouse_in_Belize_City,_Belize.jpg',
    license: 'CC BY-SA 4.0', licenseUrl: 'https://creativecommons.org/licenses/by-sa/4.0/',
  },
};

// ---------------------------------------------------------------------------
// Minimal Markdown → block list (covers exactly what the content files use)
// ---------------------------------------------------------------------------
function parseFile(file) {
  const raw = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
  const m = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const meta = {};
  if (m) {
    for (const line of m[1].split('\n')) {
      const i = line.indexOf(':');
      if (i < 0) continue;
      meta[line.slice(0, i).trim()] = JSON.parse(line.slice(i + 1).trim());
    }
  }
  return { meta, blocks: parseBlocks(m ? raw.slice(m[0].length) : raw) };
}

function parseBlocks(md) {
  const blocks = [];
  const lines = md.split('\n');
  let para = null;
  let list = null;
  const flush = () => {
    if (para) blocks.push({ type: 'p', lines: para });
    if (list) blocks.push({ type: 'ul', items: list });
    para = null; list = null;
  };
  for (const line of lines) {
    let mm;
    if (!line.trim()) { flush(); continue; }
    if ((mm = line.match(/^(#{1,6})\s+(.*)$/))) { flush(); blocks.push({ type: 'h', level: mm[1].length, text: mm[2].trim() }); continue; }
    if ((mm = line.match(/^-\s+(.*)$/))) { if (para) flush(); (list ||= []).push(mm[1]); continue; }
    if (list) flush();
    (para ||= []).push(line);
  }
  flush();
  for (const b of blocks) if (b.type === 'p') b.text = b.lines.map((l) => l.replace(/\s+$/, '')).join(' ');
  return blocks;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Resolve a site route (e.g. "/contact/?area=x") relative to the current page route.
function rel(from, to) {
  if (!to.startsWith('/')) return to; // external, tel:, mailto:, #hash
  const qi = to.search(/[?#]/);
  const p = qi < 0 ? to : to.slice(0, qi);
  const rest = qi < 0 ? '' : to.slice(qi);
  const depth = from.split('/').filter(Boolean).length;
  const r = '../'.repeat(depth) + p.replace(/^\//, '');
  const out = r || './';
  if (LOCAL && out.endsWith('/')) return (out === './' ? '' : out) + 'index.html' + rest;
  return out + rest;
}

// Inline Markdown: links, bold, italic. `ctx.route` is the current page route.
function inline(text, ctx) {
  const tokens = [];
  let s = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, label, href) => {
    tokens.push(link(href, inline(label, ctx), ctx));
    return `\u0000${tokens.length - 1}\u0000`;
  });
  s = esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => tokens[+i]);
}

function link(href, html, ctx, attrs = '') {
  const external = /^https?:/.test(href);
  const url = rel(ctx.route, href);
  const extra = external ? ' rel="noopener"' : '';
  return `<a href="${esc(url)}"${extra}${attrs}>${html}</a>`;
}

// Inline with Markdown line breaks (two trailing spaces) preserved.
function inlineLines(block, ctx) {
  return block.lines.map((l, i) => inline(l.replace(/\s+$/, ''), ctx) + (i < block.lines.length - 1 && /\s{2,}$/.test(l) ? '<br>' : '')).join(' ');
}

// Extract [label](href) pairs from a paragraph.
const linksIn = (text) => [...text.matchAll(/\[([^\]]+)\]\(([^)\s]+)\)/g)].map((m) => ({ label: m[1], href: m[2] }));
// A paragraph that is nothing but links separated by " · ".
const isLinkRow = (b) => b && b.type === 'p' && b.text.replace(/\[[^\]]+\]\([^)\s]+\)/g, '').replace(/[·\s]/g, '') === '';
const isItalicOnly = (b) => b && b.type === 'p' && /^\*[^*].*\*$/.test(b.text);
const stripItalic = (t) => t.replace(/^\*|\*$/g, '');

// Split blocks into intro (before first h2) and h2 sections.
function sections(blocks) {
  const out = { intro: [], sections: [] };
  let cur = null;
  for (const b of blocks) {
    if (b.type === 'h' && b.level === 2) { cur = { title: b.text, id: slug(b.text), blocks: [] }; out.sections.push(cur); continue; }
    (cur ? cur.blocks : out.intro).push(b);
  }
  return out;
}

// Generic prose renderer.
function prose(blocks, ctx, opts = {}) {
  return blocks.map((b, i) => {
    if (b.type === 'h') {
      const tag = `h${Math.min(6, b.level + (opts.shift || 0))}`;
      return `<${tag} id="${slug(b.text)}">${inline(b.text, ctx)}</${tag}>`;
    }
    if (b.type === 'ul') return `<ul>${b.items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}</ul>`;
    if (isLinkRow(b)) return actionRow(linksIn(b.text), ctx, 'page-actions');
    const cls = opts.ledeFirst && i === 0 ? ' class="lede"' : '';
    return `<p${cls}>${inlineLines(b, ctx)}</p>`;
  }).join('\n');
}

// Consultation buttons keep their /contact/ link (works without JavaScript) and open the
// Alpuche AI enquiry, carrying the practice from ?area=, when JavaScript is available.
function intakeAttrs(href) {
  if (!/^\/contact\//.test(href)) return '';
  const m = href.match(/[?&]area=([a-z-]+)/);
  const area = m && PRACTICES.some((p) => p.key === m[1]) ? m[1] : '';
  return ` data-intake${area ? ` data-area="${area}"` : ''}`;
}

// Render a list of links as actions: contact/consultation links become the primary button.
function actionRow(links, ctx, cls = 'actions', { dark = false } = {}) {
  let primaryUsed = false;
  const items = links.map((l) => {
    const isPrimary = !primaryUsed && /^\/contact\//.test(l.href);
    if (isPrimary) primaryUsed = true;
    const label = inline(l.label, ctx);
    if (isPrimary) return link(l.href, label, ctx, ` class="button button-gold"${intakeAttrs(l.href)}`);
    return link(l.href, `${label}<span class="arrow" aria-hidden="true">→</span>`, ctx, ' class="text-link"');
  });
  return `<div class="${cls}">${items.join('')}</div>`;
}

// ---------------------------------------------------------------------------
// Images
// ---------------------------------------------------------------------------
const imgPath = (ctx, file) => `${ctx.assets}img/${file}`;

function photo(name, ctx, { sizes = '100vw', eager = false } = {}) {
  const p = PHOTOS[name];
  const max = p.widths[p.widths.length - 1];
  const h = Math.round((max * p.h) / p.w);
  const set = (ext) => p.widths.map((w) => `${imgPath(ctx, `${name}-${w}.${ext}`)} ${w}w`).join(', ');
  return `<picture><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}">` +
    `<img src="${imgPath(ctx, `${name}-1024.jpg`)}" srcset="${set('jpg')}" sizes="${sizes}" width="${max}" height="${h}" alt="${esc(p.alt)}" ` +
    `style="object-position:${p.position}"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>`;
}

function photoCredit(name) {
  const p = PHOTOS[name];
  return `<figcaption class="credit">${esc(p.caption)} · Photo by <a href="${esc(p.source)}" rel="noopener">${esc(p.author)}</a> · <a href="${esc(p.licenseUrl)}" rel="noopener">${esc(p.license)}</a></figcaption>`;
}

function josePortrait(ctx, { eager = false, sizes = '(max-width: 780px) 400px, 435px' } = {}) {
  return `<picture><source type="image/webp" srcset="${imgPath(ctx, 'jose-480.webp')} 480w, ${imgPath(ctx, 'jose-710.webp')} 710w" sizes="${sizes}">` +
    `<img src="${imgPath(ctx, 'jose-710.jpg')}" srcset="${imgPath(ctx, 'jose-480.jpg')} 480w, ${imgPath(ctx, 'jose-710.jpg')} 710w" sizes="${sizes}" width="710" height="1066" alt="José M. Alpuche, Attorney-at-Law"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async"></picture>`;
}

function janinePortrait(ctx, { sizes = '(max-width: 780px) 100vw, 50vw' } = {}) {
  return `<picture><source type="image/webp" srcset="${imgPath(ctx, 'janine-640.webp')} 640w, ${imgPath(ctx, 'janine-984.webp')} 984w" sizes="${sizes}">` +
    `<img src="${imgPath(ctx, 'janine-984.jpg')}" srcset="${imgPath(ctx, 'janine-640.jpg')} 640w, ${imgPath(ctx, 'janine-984.jpg')} 984w" sizes="${sizes}" width="984" height="731" alt="Janine Ebanks-Alpuche, Practice Manager" loading="lazy" decoding="async"></picture>`;
}

const photoName = (heroImage) => (heroImage && heroImage.includes('/belize/') ? path.basename(heroImage, path.extname(heroImage)) : null);

// ---------------------------------------------------------------------------
// Shared layout
// ---------------------------------------------------------------------------
function brand(ctx, { tag = 'a' } = {}) {
  return `<a class="brand" href="${rel(ctx.route, '/')}"><span class="mark"><img src="${imgPath(ctx, 'jma-mark-160.jpg')}" width="160" height="126" alt=""></span>` +
    `<span class="brand-text"><strong>${OFFICE.name}</strong><span>${OFFICE.role}</span></span></a>`;
}

function isCurrent(ctx, route) {
  return route === '/' ? ctx.route === '/' : ctx.route.startsWith(route);
}

function header(ctx) {
  const nav = (cls) => NAV.map((n) => `<a href="${rel(ctx.route, n.route)}"${isCurrent(ctx, n.route) ? ' aria-current="page"' : ''}>${n.label}</a>`).join('');
  return `<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="shell header-inner">
    ${brand(ctx)}
    <nav class="desktop-nav" aria-label="Main navigation">${nav()}</nav>
    <div class="header-actions">
      <a class="header-cta" href="${rel(ctx.route, '/contact/')}" data-intake>Request a consultation</a>
      <a class="header-call" href="tel:${OFFICE.phones[0].tel}" aria-label="Call the office on ${OFFICE.phones[0].label}">Call</a>
      <details class="mobile-nav">
        <summary aria-label="Menu">Menu</summary>
        <nav aria-label="Mobile navigation">${nav()}<a class="button button-gold" href="${rel(ctx.route, '/contact/')}" data-intake>Request a consultation</a></nav>
      </details>
    </div>
  </div>
</header>`;
}

function officeBlock() {
  return `<address class="office">
  <p>${OFFICE.address.join('<br>')}</p>
  <p>${OFFICE.hours.replace(', ', '<br>')}</p>
  <p><a href="tel:${OFFICE.phones[0].tel}">${OFFICE.phones[0].label}</a> · <a href="tel:${OFFICE.phones[1].tel}">${OFFICE.phones[1].label}</a><br><a href="mailto:${OFFICE.email}">${OFFICE.email}</a></p>
</address>`;
}

// Closing dark band. `title`/`body`/`links` come from the page Markdown when available.
function contactBand(ctx, { title, bodyHtml, links, related = [] }) {
  const relatedHtml = related.length
    ? `<div class="related"><p>Related</p><ul>${related.map((l) => `<li>${link(l.href, `${inline(l.label, ctx)}<span class="arrow" aria-hidden="true">→</span>`, ctx)}</li>`).join('')}</ul></div>`
    : '';
  return `<section class="dark contact-band" aria-labelledby="closing-title">
  <div class="shell section contact-band-inner">
    <div>
      <h2 id="closing-title">${inline(title, ctx)}</h2>
      ${bodyHtml ? `<p>${bodyHtml}</p>` : ''}
      ${actionRow(links, ctx)}
      ${relatedHtml}
    </div>
    ${officeBlock()}
  </div>
</section>`;
}

// Generic closing band, reusing the homepage "Tell us how we can help" copy.
let HOME_CLOSING = null;
function genericBand(ctx) {
  return contactBand(ctx, HOME_CLOSING);
}

function footer(ctx) {
  return `<footer class="site-footer">
  <div class="shell footer-grid">
    <div class="footer-brand">${brand(ctx)}<address>${OFFICE.address.join('<br>')}</address></div>
    <nav aria-labelledby="f-practice"><h2 id="f-practice">Practice areas</h2><ul>${PRACTICES.map((p) => `<li><a href="${rel(ctx.route, p.route)}">${esc(p.label)}</a></li>`).join('')}</ul></nav>
    <nav aria-labelledby="f-firm"><h2 id="f-firm">The firm</h2><ul>
      <li><a href="${rel(ctx.route, '/about/')}">Our Team</a></li>
      <li><a href="${rel(ctx.route, '/working-with-us/')}">What to Expect</a></li>
      <li><a href="${rel(ctx.route, '/insights/')}">Belize Legal Guides</a></li>
      <li><a href="${rel(ctx.route, '/contact/')}">Contact</a></li>
      <li><a href="${rel(ctx.route, '/website-notice/')}">Website notice</a></li>
      <li><a href="${rel(ctx.route, '/website-notice/')}#photo-credits">Photo credits</a></li>
    </ul></nav>
    <div><h2>Contact the office</h2><ul>
      <li><a href="tel:${OFFICE.phones[0].tel}">${OFFICE.phones[0].label}</a></li>
      <li><a href="tel:${OFFICE.phones[1].tel}">${OFFICE.phones[1].label}</a></li>
      <li><a href="mailto:${OFFICE.email}">${OFFICE.email}</a></li>
      <li><a class="with-icon" href="${OFFICE.whatsapp.href}" target="_blank" rel="noopener">${ICONS.whatsapp}WhatsApp ${OFFICE.whatsapp.label}</a></li>
      <li><a class="with-icon" href="${OFFICE.facebook}" target="_blank" rel="noopener">${ICONS.facebook}Facebook</a></li>
      <li>${OFFICE.hours}</li>
    </ul></div>
  </div>
  <div class="shell footer-bottom">
    <span>${OFFICE.name} · ${OFFICE.role} · Belize City</span>
    ${PRODUCTION ? '' : '<span class="preview-flag">Private preview for firm review. Draft content, not yet approved for publication.</span>'}
  </div>
</footer>`;
}

// ---------------------------------------------------------------------------
// Office assistant (prepared answers from ai/knowledge-base.md)
// ---------------------------------------------------------------------------
function parseKnowledgeBase() {
  const md = fs.readFileSync(path.join(SRC, 'ai', 'knowledge-base.md'), 'utf8');
  const entries = {};
  for (const chunk of md.split(/\n(?=### )/)) {
    const head = chunk.match(/^### ([A-Z]+-\d+) · (.+)$/m);
    if (!head) continue;
    const field = (name) => (chunk.match(new RegExp(`^${name} — (.+?)\\s*$`, 'm')) || [])[1];
    entries[head[1]] = { id: head[1], title: head[2], answer: field('Answer'), next: field('Next'), sources: field('Sources'), examples: (field('Examples') || '').split(/(?<=[?.])\s+/).map((x) => x.trim()).filter(Boolean) };
  }
  return entries;
}

const NEXT_LABELS = {
  '/about/': 'Meet José and Janine',
  '/contact/': 'View office contact details',
  '/practice-areas/': 'Browse practice areas',
  '/working-with-us/': 'See what to expect',
  '/website-notice/': 'Read the website notice',
  '/insights/buying-property-in-belize/': 'Read the property purchase guide',
  '/insights/starting-a-business-in-belize/': 'Read the business start-up guide',
  '/insights/planning-retirement-in-belize/': 'Read the retirement planning guide',
  '/practice-areas/qualified-retired-persons/': 'Explore the retirement programme',
  'https://www.belizetourismboard.org/programs-events/retirement-program/': 'Belize Tourism Board QRP guidance',
  'https://www.belizepolice.bz/about-911/': 'Belize Police 911 information',
};

function nextLabel(href) {
  const base = href.replace(/[?#].*$/, '');
  if (NEXT_LABELS[href]) return NEXT_LABELS[href];
  if (base === '/contact/') return 'Contact the office';
  if (PRACTICE_BY_ROUTE[base]) return `Explore ${PRACTICE_BY_ROUTE[base].label}`;
  return NEXT_LABELS[base] || 'Learn more';
}

let KB = null;
function assistant(ctx) {
  const demo = !LEAD_ENDPOINT;
  return `<details class="office-assistant" id="alpuche-ai">
  <summary>Alpuche AI</summary>
  <div class="assistant-panel" role="group" aria-labelledby="assistant-title">
    <div class="assistant-top">
      <div><p class="assistant-label">Automated assistant${demo ? ' · demo' : ''}</p><h2 id="assistant-title">Alpuche AI</h2></div>
      <button type="button" class="assistant-close">Close</button>
    </div>
    <div class="chat-log" role="log" aria-live="polite" aria-label="Conversation with Alpuche AI" tabindex="0">
      <p class="chat-nojs">Alpuche AI needs JavaScript. You can call the office on ${OFFICE.phones[0].label} or email ${OFFICE.email}.</p>
    </div>
    <div class="chat-chips" role="group" aria-label="Suggested replies"></div>
    <div class="chat-input">
      <label for="chat-text" class="visually-hidden">Message Alpuche AI</label>
      <input id="chat-text" type="text" maxlength="500" placeholder="Type your question…" autocomplete="off" enterkeyhint="send" disabled>
      <button type="button" class="chat-send" disabled>Send</button>
    </div>
    <p class="assistant-foot">Automated assistant, not an attorney. It can’t give legal advice. Please don’t share confidential details. <a href="${rel(ctx.route, '/website-notice/')}">Website notice</a></p>
  </div>
</details>`;
}

// Everything published on the site, split into sections, services and FAQs, for Alpuche AI.
const plain = (t) => String(t).replace(/\[([^\]]+)\]\([^)\s]+\)/g, '$1').replace(/\*\*|\*/g, '').replace(/\s+/g, ' ').trim();
const PAGE_NAMES = {
  '/': 'Home', '/about/': 'Our Team', '/practice-areas/': 'Practice Areas', '/working-with-us/': 'What to Expect',
  '/contact/': 'Contact', '/insights/': 'Belize Legal Guides', '/website-notice/': 'Website notice',
};
function pageName(page) {
  const r = page.meta.route;
  if (PAGE_NAMES[r]) return PAGE_NAMES[r];
  if (PRACTICE_BY_ROUTE[r]) return PRACTICE_BY_ROUTE[r].label;
  const h1 = page.blocks.find((b) => b.type === 'h' && b.level === 1);
  return h1 ? plain(h1.text) : r;
}

function assistantDocs(pages) {
  const docs = [];
  const add = (page, kind, title, blocks, anchor) => {
    const text = blocks.filter((b) => !isLinkRow(b) && !isItalicOnly(b))
      .map((b) => (b.type === 'ul' ? b.items.map(plain).join('. ') : plain(b.text || ''))).join(' ').trim();
    if (text.length < 40) return;
    docs.push({ kind, id: `${page.meta.route}#${anchor || ''}:${slug(title)}`, route: page.meta.route, anchor: anchor || '', page: pageName(page), title: plain(title), text });
  };
  for (const page of pages) {
    // Home and the two hub pages summarise the full pages, which answer better.
    if (['/', '/practice-areas/', '/insights/'].includes(page.meta.route)) continue;
    const { intro, sections: secs } = sections(page.blocks);
    const h1 = intro.find((b) => b.type === 'h' && b.level === 1);
    add(page, 'intro', h1 ? h1.text : pageName(page), intro.filter((b) => b.type !== 'h'), '');
    for (const sec of secs) {
      if (/frequently asked questions/i.test(sec.title)) {
        let q = null; let a = [];
        const flush = () => { if (q) add(page, 'faq', q, a, slug(q)); };
        for (const b of sec.blocks) {
          if (b.type === 'h' && b.level === 3) { flush(); q = b.text; a = []; } else a.push(b);
        }
        flush();
        continue;
      }
      let head = []; let sub = null; const subs = [];
      for (const b of sec.blocks) {
        const m = b.type === 'p' && b.text.match(/^\*\*(.+?)\.\*\*\s+(.*)$/);
        if (m) { add(page, 'service', `${m[1]} (${pageName(page)})`, [{ type: 'p', text: m[2] }], sec.id); continue; }
        if (b.type === 'h' && b.level === 3) { sub = { title: b.text, blocks: [] }; subs.push(sub); continue; }
        (sub ? sub.blocks : head).push(b);
      }
      add(page, 'section', sec.title, head, sec.id);
      for (const ss of subs) add(page, 'section', ss.title, ss.blocks, page.meta.route === '/contact/' ? slug(ss.title) : sec.id);
    }
  }
  return docs;
}

function writeAssistantData(pages) {
  const pagesMap = Object.fromEntries(pages.map((p) => [p.meta.route, pageName(p)]));
  const data = {
    built: new Date().toISOString().slice(0, 10),
    office: { phones: OFFICE.phones, email: OFFICE.email, address: OFFICE.address, hours: OFFICE.hours, whatsapp: WHATSAPP ? OFFICE.whatsapp : null, facebook: OFFICE.facebook },
    practices: PRACTICES,
    kb: Object.fromEntries(Object.entries(KB).map(([id, e]) => [id, { title: e.title, answer: e.answer, next: e.next || null, examples: e.examples }])),
    docs: assistantDocs(pages),
    pages: pagesMap,
    nextLabels: NEXT_LABELS,
    icons: ICONS,
    transport: { mode: LEAD_ENDPOINT ? 'endpoint' : 'demo', endpoint: LEAD_ENDPOINT, whatsapp: WHATSAPP, firmWhatsApp: !!WHATSAPP },
  };
  const js = `/* Generated by build.mjs from content/*.md and ai/knowledge-base.md. Do not edit. */\n(function (r) { r.ALPUCHE_AI_DATA = ${JSON.stringify(data).replace(/</g, '\\u003c')}; })(typeof self !== 'undefined' ? self : this);\n`;
  fs.writeFileSync(path.join(OUT, 'assets', 'js', 'alpuche-ai-data.js'), js);
  return data;
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
function ogImageFor(page) {
  const name = photoName(page.meta.hero_image);
  if (name) return `img/og-${name}.jpg`;
  if (page.meta.hero_image && page.meta.hero_image.includes('jose')) return 'img/og-portrait.jpg';
  return 'img/og-brand.jpg';
}

function absUrl(route) { return SITE_URL + route; }

function breadcrumbJsonLd(crumbs) {
  return `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.label, item: absUrl(c.route) })),
  })}</script>`;
}

function layout(page, ctx, mainHtml, { crumbs, base } = {}) {
  const { meta } = page;
  const ogImage = `${SITE_URL}/assets/${ogImageFor(page)}`; // root-relative when SITE_URL is empty
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
${base ? `<base href="${base}">\n` : ''}<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(meta.title)}</title>
<meta name="description" content="${esc(meta.description)}">
${PRODUCTION ? `<link rel="canonical" href="${absUrl(meta.route)}">` : '<meta name="robots" content="noindex, nofollow, noarchive">'}
<meta property="og:type" content="website">
<meta property="og:site_name" content="José M. Alpuche, Attorney-at-Law">
<meta property="og:title" content="${esc(meta.title)}">
<meta property="og:description" content="${esc(meta.description)}">
${SITE_URL ? `<meta property="og:url" content="${absUrl(meta.route)}">\n` : ''}<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:locale" content="en_BZ">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#11171b">
<meta name="x-source-ids" content="${esc((meta.source_ids || []).join(', '))}">
<meta name="alpuche-route" content="${esc(meta.route)}">
<meta name="alpuche-root" content="${ctx.assets.replace(/assets\/$/, '')}">
<meta name="alpuche-links" content="${LOCAL ? 'file' : 'dir'}">
<link rel="icon" href="${imgPath(ctx, 'jma-mark-160.jpg')}">
${LOCAL ? '' : `<link rel="preload" href="${ctx.assets}fonts/cormorant-garamond-latin.woff2" as="font" type="font/woff2" crossorigin>\n`}<link rel="stylesheet" href="${ctx.assets}css/site.css">
${PRODUCTION && crumbs ? breadcrumbJsonLd(crumbs) : ''}
</head>
<body>
${header(ctx)}
<main id="main" tabindex="-1">
${mainHtml}
</main>
${footer(ctx)}
${assistant(ctx)}
<!-- scripts -->
<script src="${ctx.assets}js/alpuche-ai-data.js" defer></script>
<script src="${ctx.assets}js/alpuche-ai.js" defer></script>
<script src="${ctx.assets}js/site.js" defer></script>
</body>
</html>
`;
}

function breadcrumb(crumbs, ctx) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs.map((c, i) => i === crumbs.length - 1
    ? `<li><span aria-current="page">${esc(c.label)}</span></li>`
    : `<li><a href="${rel(ctx.route, c.route)}">${esc(c.label)}</a></li>`).join('')}</ol></nav>`;
}

// Interior page head: breadcrumb, eyebrow, H1, standfirst, optional photo.
function pageHead(page, ctx, { crumbs, eyebrow, h1, standfirst, photoName: pn }) {
  const typographic = !pn;
  return `<section class="page-head${typographic ? ' typographic' : ' has-figure'}">
  <div class="shell page-head-inner">
    ${breadcrumb(crumbs, ctx)}
    ${eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : ''}
    <h1>${inline(h1, ctx)}</h1>
    ${standfirst ? `<p class="standfirst">${standfirst}</p>` : ''}
    ${typographic ? '<div class="head-rule" aria-hidden="true"></div>' : ''}
  </div>
</section>
${pn ? `<figure class="shell head-figure"><div class="frame">${photo(pn, ctx, { sizes: '(max-width: 1388px) calc(100vw - 68px), 1280px', eager: true })}</div>${photoCredit(pn)}</figure>` : ''}`;
}

// Pull eyebrow, h1 and leading paragraphs out of the intro block list.
function splitIntro(intro) {
  const out = { eyebrow: null, h1: null, paras: [], rest: [] };
  for (const b of intro) {
    if (isItalicOnly(b) && !out.h1) out.eyebrow = stripItalic(b.text);
    else if (b.type === 'h' && b.level === 1) out.h1 = b.text;
    else out.paras.push(b);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Section renderers
// ---------------------------------------------------------------------------
function renderServices(sec, ctx) {
  const items = [];
  const other = [];
  for (const b of sec.blocks) {
    const m = b.type === 'p' && b.text.match(/^\*\*(.+?)\.\*\*\s+(.*)$/);
    if (m) items.push(`<div class="service"><h3>${inline(m[1], ctx)}</h3><p>${inline(m[2], ctx)}</p></div>`);
    else other.push(b);
  }
  return `<h2 id="${sec.id}">${inline(sec.title, ctx)}</h2>${prose(other, ctx)}<div class="services">${items.join('')}</div>`;
}

function renderFaq(sec, ctx) {
  const items = [];
  let cur = null;
  for (const b of sec.blocks) {
    if (b.type === 'h' && b.level === 3) { cur = { q: b.text, a: [] }; items.push(cur); }
    else if (cur) cur.a.push(b);
  }
  return `<h2 id="${sec.id}">${inline(sec.title, ctx)}</h2><div class="faq">${items.map((it) => `<div class="faq-item"><h3 id="${slug(it.q)}">${inline(it.q, ctx)}</h3>${prose(it.a, ctx)}</div>`).join('')}</div>`;
}

function renderSection(sec, ctx) {
  if (/^How we can help$/i.test(sec.title) && sec.blocks.some((b) => b.type === 'p' && /^\*\*/.test(b.text))) return renderServices(sec, ctx);
  if (/frequently asked questions/i.test(sec.title)) return renderFaq(sec, ctx);
  return `<h2 id="${sec.id}">${inline(sec.title, ctx)}</h2>\n${prose(sec.blocks, ctx)}`;
}

function toc(secs, ctx, label = 'On this page') {
  return `<nav class="toc" aria-label="${label}"><p>${label}</p><ol>${secs.map((s) => `<li><a href="#${s.id}">${inline(s.title, ctx)}</a></li>`).join('')}</ol></nav>`;
}

function asideCard(ctx, { area, label }) {
  const href = area ? `/contact/?area=${area}` : '/contact/';
  return `<div class="aside-card"><p class="aside-label">${label ? esc(label) : 'Consultation'}</p><h2>Speak with the office</h2>
<p>Share the general topic and any important date. Janine can explain how to arrange an initial consultation.</p>
<a class="button button-gold" href="${rel(ctx.route, href)}"${intakeAttrs(href)}>Request a consultation</a>
<a class="aside-call" href="tel:${OFFICE.phones[0].tel}">Call ${OFFICE.phones[0].label}</a></div>`;
}

// Split a closing link row into contact actions and related links.
function splitClosing(links) {
  const actions = links.filter((l) => /^\/contact\/|^tel:/.test(l.href));
  const related = links.filter((l) => !/^\/contact\/|^tel:/.test(l.href));
  return { actions, related };
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------
function renderHome(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const [introPara, ctaRow, credRow] = I.paras;
  const byTitle = (re) => secs.find((s) => re.test(s.title));
  const practice = byTitle(/^Counsel/);
  const team = byTitle(/^Meet/);
  const abroad = byTitle(/^Planning from outside/);
  const closing = byTitle(/^Tell us/);

  // Practice cards: h3 + paragraph + link paragraph.
  const cards = [];
  let cur = null;
  for (const b of practice.blocks) {
    if (b.type === 'h' && b.level === 3) { cur = { title: b.text, paras: [] }; cards.push(cur); }
    else if (cur && isLinkRow(b)) cur.link = linksIn(b.text)[0];
    else if (cur) cur.paras.push(b);
  }
  const cardHtml = cards.map((c) => {
    const p = PRACTICE_BY_ROUTE[c.link.href];
    return `<article class="practice-card"><p class="card-label">${esc(p.label)}</p><h3>${inline(c.title, ctx)}</h3>${c.paras.map((b) => `<p>${inline(b.text, ctx)}</p>`).join('')}` +
      `${link(c.link.href, `${inline(c.link.label, ctx)}<span class="arrow" aria-hidden="true">↗</span>`, ctx, ' class="card-link"')}</article>`;
  }).join('\n');

  const creds = credRow.text.split(' · ').map((t) => `<li>${inline(t.replace(/\*\*/g, ''), ctx)}</li>`).join('');
  const teamParas = team.blocks.filter((b) => !isLinkRow(b));
  const teamLink = linksIn(team.blocks.find(isLinkRow).text)[0];
  const abroadParas = abroad.blocks.filter((b) => !isLinkRow(b));
  const abroadLink = linksIn(abroad.blocks.find(isLinkRow).text)[0];
  const closingParas = closing.blocks.filter((b) => !isLinkRow(b));

  HOME_CLOSING = {
    title: closing.title,
    bodyHtml: closingParas.map((b) => inline(b.text, { route: '/' })).join(' '),
    links: linksIn(closing.blocks.find(isLinkRow).text),
  };

  const main = `<section class="hero">
  <div class="shell hero-grid">
    <div class="hero-copy">
      <p class="eyebrow">${esc(I.eyebrow)}</p>
      <h1>Legal counsel for<br class="desktop-break"> life and business<br class="desktop-break"> in Belize</h1>
      <p class="intro">${inline(introPara.text, ctx)}</p>
      ${actionRow(linksIn(ctaRow.text).map((l, i) => (i === 1 ? { ...l, href: '#practice' } : l)), ctx)}
    </div>
    <figure class="hero-portrait"><div class="portrait-frame">${josePortrait(ctx, { eager: true })}</div></figure>
  </div>
</section>
<section class="credentials" aria-label="Credentials"><ul class="shell credentials-inner">${creds}</ul></section>

<section id="practice" class="shell section" aria-labelledby="practice-title">
  <div class="section-heading">
    <h2 id="practice-title">Counsel for the decisions<br class="desktop-break"> you are facing</h2>
    <p>Each practice area has its own page with examples, Belize context and common questions. <a href="${rel(ctx.route, '/practice-areas/')}">See all practice areas</a>.</p>
  </div>
  <div class="practice-grid">
${cardHtml}
  </div>
</section>

<section id="team" class="sand" aria-labelledby="team-title">
  <div class="shell section split">
    <div>
      <h2 id="team-title">${inline(team.title, ctx)}</h2>
      ${teamParas.map((b) => `<p>${inline(b.text, ctx)}</p>`).join('')}
      ${link(teamLink.href, `${inline(teamLink.label, ctx)}<span class="arrow" aria-hidden="true">↗</span>`, ctx, ' class="text-link"')}
    </div>
    <figure>
      <div class="photo-frame janine-frame">${janinePortrait(ctx)}</div>
      <figcaption class="person-caption"><strong>Janine Ebanks-Alpuche</strong><span>Practice Manager</span></figcaption>
    </figure>
  </div>
</section>

<section id="guides" class="shell section split" aria-labelledby="guides-title">
  <figure class="harbour">${photo('belize-city-harbour', ctx, { sizes: '(max-width: 780px) 100vw, 50vw' })}${photoCredit('belize-city-harbour')}</figure>
  <div>
    <h2 id="guides-title">${inline(abroad.title, ctx)}</h2>
    ${abroadParas.map((b) => `<p>${inline(b.text, ctx)}</p>`).join('')}
    <ul class="guide-links">${GUIDES.map((g) => `<li><a href="${rel(ctx.route, g.route)}">${esc(g.label)}<span class="arrow" aria-hidden="true">↗</span></a></li>`).join('')}</ul>
    ${link(abroadLink.href, `${inline(abroadLink.label, ctx)}<span class="arrow" aria-hidden="true">→</span>`, ctx, ' class="text-link"')}
  </div>
</section>

${contactBand(ctx, HOME_CLOSING).replace('class="dark contact-band"', 'id="contact" class="dark contact-band"')}`;
  return layout(page, ctx, main);
}

function renderPractice(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const practice = PRACTICE_BY_ROUTE[page.meta.route];
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Practice Areas', route: '/practice-areas/' }, { label: practice.label, route: page.meta.route }];
  const closing = secs[secs.length - 1];
  const bodySecs = secs.slice(0, -1);
  const pn = photoName(page.meta.hero_image);
  const [standfirst, ...introRest] = I.paras;
  const closingLinks = linksIn(closing.blocks.find(isLinkRow).text);
  const { actions, related } = splitClosing(closingLinks);

  const main = `${pageHead(page, ctx, { crumbs, eyebrow: I.eyebrow, h1: I.h1, standfirst: inline(standfirst.text, ctx), photoName: pn })}
<div class="shell article-layout">
  <article class="prose">
    ${prose(introRest, ctx, { ledeFirst: true })}
    ${bodySecs.map((s) => renderSection(s, ctx)).join('\n')}
  </article>
  <aside class="aside" aria-label="Page tools">${toc(bodySecs, ctx)}${asideCard(ctx, { area: practice.key, label: practice.label })}</aside>
</div>
${contactBand(ctx, {
    title: closing.title,
    bodyHtml: 'Start with the general subject and any important date. Contacting the office does not mean the firm has accepted the matter.',
    links: actions, related,
  })}`;
  return layout(page, ctx, main, { crumbs });
}

function renderGuide(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Belize Legal Guides', route: '/insights/' }, { label: I.h1, route: page.meta.route }];
  const pn = photoName(page.meta.hero_image);
  const [standfirst, ...introRest] = I.paras;
  // The final section ends with a general-information note and a link row.
  const last = secs[secs.length - 1];
  const linkRow = last.blocks.find(isLinkRow);
  const noteIdx = last.blocks.findIndex((b) => b.type === 'p' && /^For general/.test(b.text));
  const note = noteIdx >= 0 ? last.blocks[noteIdx] : null;
  last.blocks = last.blocks.filter((b) => b !== linkRow && b !== note);
  const { actions, related } = splitClosing(linksIn(linkRow.text));
  const practiceLink = related.find((l) => PRACTICE_BY_ROUTE[l.href]);
  const area = practiceLink ? PRACTICE_BY_ROUTE[practiceLink.href].key : null;

  const main = `${pageHead(page, ctx, { crumbs, eyebrow: 'Belize legal guide', h1: I.h1, standfirst: inline(standfirst.text, ctx), photoName: pn })}
<div class="shell article-layout">
  <article class="prose">
    ${prose(introRest, ctx)}
    ${secs.map((s) => renderSection(s, ctx)).join('\n')}
    ${note ? `<p class="note">${inline(note.text, ctx)}</p>` : ''}
  </article>
  <aside class="aside" aria-label="Guide tools">${toc(secs, ctx, 'In this guide')}${asideCard(ctx, { area, label: 'Next step' })}</aside>
</div>
${contactBand(ctx, {
    title: 'Discuss your plans with the office',
    bodyHtml: 'This guide gives general information. For your own matter, contact the office with the general subject and any important date.',
    links: actions, related,
  })}`;
  return layout(page, ctx, main, { crumbs });
}

function cardsFromSection(blocks, ctx) {
  const cards = [];
  let cur = null;
  for (const b of blocks) {
    if (b.type === 'h' && b.level === 3) { cur = { title: b.text, paras: [] }; cards.push(cur); }
    else if (cur && isLinkRow(b)) cur.link = linksIn(b.text)[0];
    else if (cur) cur.paras.push(b);
  }
  return cards.map((c) => `<article class="practice-card"><h3>${inline(c.title, ctx)}</h3>${c.paras.map((b) => `<p>${inline(b.text, ctx)}</p>`).join('')}` +
    `${link(c.link.href, `Explore ${inline(c.title, ctx)}<span class="arrow" aria-hidden="true">↗</span>`, ctx, ' class="card-link"')}</article>`).join('\n');
}

function renderPracticeHub(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Practice Areas', route: '/practice-areas/' }];
  const groups = secs.filter((s) => s.blocks.some((b) => b.type === 'h' && b.level === 3));
  const closing = secs.find((s) => !groups.includes(s));
  const closingParas = closing.blocks.filter((b) => !isLinkRow(b));
  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: null })}
<div class="shell section">
  ${groups.map((g) => `<section class="card-group" aria-labelledby="${g.id}"><h2 id="${g.id}">${inline(g.title, ctx)}</h2><div class="card-grid">${cardsFromSection(g.blocks, ctx)}</div></section>`).join('\n')}
</div>
${contactBand(ctx, { title: closing.title, bodyHtml: closingParas.map((b) => inline(b.text, ctx)).join(' '), links: linksIn(closing.blocks.find(isLinkRow).text) })}`;
  return layout(page, ctx, main, { crumbs });
}

function renderInsightsHub(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Belize Legal Guides', route: '/insights/' }];
  const pn = photoName(page.meta.hero_image);
  const last = secs[secs.length - 1];
  const linkRow = last.blocks.find(isLinkRow);
  const note = last.blocks.find((b) => b.type === 'p' && /general information/.test(b.text) && !isLinkRow(b));
  const cards = secs.map((s) => {
    const paras = s.blocks.filter((b) => !isLinkRow(b) && b !== note);
    const l = linksIn(s.blocks.find(isLinkRow).text)[0];
    return `<article class="practice-card"><p class="card-label">Guide</p><h3 id="${s.id}">${inline(s.title, ctx)}</h3>${paras.map((b) => `<p>${inline(b.text, ctx)}</p>`).join('')}` +
      `${link(l.href, `${inline(l.label, ctx)}<span class="arrow" aria-hidden="true">↗</span>`, ctx, ' class="card-link"')}</article>`;
  }).join('\n');
  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: pn })}
<div class="shell section-tight">
  <h2 class="visually-hidden">Guides</h2>
  <div class="card-grid three">${cards}</div>
  ${note ? `<div class="prose" style="margin-top:32px"><p class="note">${inline(note.text, ctx)}</p></div>` : ''}
</div>
${contactBand(ctx, { ...HOME_CLOSING, related: splitClosing(linksIn(linkRow.text)).related })}`;
  return layout(page, ctx, main, { crumbs });
}

function renderAbout(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Our Team', route: '/about/' }];
  const bioSecs = secs.filter((s) => isItalicOnly(s.blocks[0]));
  const principles = secs.find((s) => s.blocks.some((b) => b.type === 'ul'));
  const bio = (s, i) => {
    const role = stripItalic(s.blocks[0].text);
    const body = s.blocks.slice(1);
    const isJose = /José/.test(s.title);
    const figure = isJose
      ? `<figure><div class="photo-frame jose-frame">${josePortrait(ctx, { sizes: '(max-width: 780px) 400px, 40vw' })}</div></figure>`
      : `<figure><div class="photo-frame janine-frame">${janinePortrait(ctx, { sizes: '(max-width: 780px) 100vw, 40vw' })}</div></figure>`;
    return `<section class="bio" aria-labelledby="${s.id}">${figure}<div><h2 id="${s.id}">${inline(s.title, ctx)}</h2><p class="role">${esc(role)}</p><div class="prose">${prose(body, ctx)}</div></div></section>`;
  };
  const items = principles.blocks.find((b) => b.type === 'ul').items.map((it) => {
    const m = it.match(/^\*\*(.+?)\*\*\s*(.*)$/);
    return `<li><strong>${inline(m[1], ctx)}</strong><span>${inline(m[2], ctx)}</span></li>`;
  }).join('');
  const closingRow = principles.blocks.find(isLinkRow);
  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: null })}
<div class="shell section">${bioSecs.map(bio).join('\n')}</div>
<section class="sand" aria-labelledby="${principles.id}"><div class="shell section">
  <h2 id="${principles.id}" style="max-width:20ch;margin-bottom:32px">${inline(principles.title, ctx)}</h2>
  <ul class="principles">${items}</ul>
  ${closingRow ? actionRow(linksIn(closingRow.text), ctx, 'page-actions') : ''}
</div></section>`;
  return layout(page, ctx, main, { crumbs });
}

function renderWorking(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'What to Expect', route: '/working-with-us/' }];
  const steps = secs.filter((s) => /^\d+\.\s/.test(s.title));
  const rest = secs.filter((s) => !steps.includes(s));
  const stepHtml = steps.map((s) => {
    const [, n, t] = s.title.match(/^(\d+)\.\s+(.*)$/);
    return `<li class="step"><span class="step-number" aria-hidden="true">${n}</span><div><h2 id="${s.id}"><span class="visually-hidden">Step ${n}: </span>${inline(t, ctx)}</h2>${prose(s.blocks, ctx)}</div></li>`;
  }).join('');
  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: null })}
<div class="shell article-layout">
  <div>
    <ol class="steps">${stepHtml}</ol>
    <div class="prose" style="margin-top:56px">${rest.map((s) => renderSection(s, ctx)).join('\n')}</div>
  </div>
  <aside class="aside" aria-label="Contact">${asideCard(ctx, { label: 'First step' })}</aside>
</div>
${genericBand(ctx)}`;
  return layout(page, ctx, main, { crumbs });
}

function renderContact(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Contact', route: '/contact/' }];
  const request = secs.find((s) => /^Request/.test(s.title));
  const subs = sections(request.blocks.map((b) => (b.type === 'h' && b.level === 3 ? { ...b, level: 2 } : b)));
  const requestText = subs.intro.filter((b) => !isLinkRow(b));
  const notices = subs.sections;
  const footerRow = notices[notices.length - 1].blocks.find(isLinkRow);
  notices[notices.length - 1].blocks = notices[notices.length - 1].blocks.filter((b) => b !== footerRow);
  const areaMap = Object.fromEntries(PRACTICES.map((p) => [p.key, p.label]));

  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: null })}
<div class="shell contact-grid">
  <section class="office-card dark" aria-labelledby="office-title">
    <h2 id="office-title">Belize City office</h2>
    <dl>
      <div><dt>Telephone</dt><dd class="big"><a href="tel:${OFFICE.phones[0].tel}">${OFFICE.phones[0].label}</a><br><a href="tel:${OFFICE.phones[1].tel}">${OFFICE.phones[1].label}</a></dd></div>
      <div><dt>WhatsApp</dt><dd><a class="with-icon" href="${OFFICE.whatsapp.href}" target="_blank" rel="noopener" data-whatsapp>${ICONS.whatsapp}${OFFICE.whatsapp.label}</a></dd></div>
      <div><dt>Email</dt><dd><a href="mailto:${OFFICE.email}?subject=Consultation%20enquiry" data-mail-subject>${OFFICE.email}</a></dd></div>
      <div><dt>Address</dt><dd>${OFFICE.address.join('<br>')}</dd></div>
      <div><dt>Office hours</dt><dd>${OFFICE.hours}.</dd></div>
      <div><dt>Facebook</dt><dd><a class="with-icon" href="${OFFICE.facebook}" target="_blank" rel="noopener">${ICONS.facebook}Follow the firm on Facebook</a></dd></div>
    </dl>
    <a class="button button-gold" href="${esc(OFFICE.directions)}" rel="noopener">Get directions</a>
  </section>
  <div>
    <section aria-labelledby="${request.id}" class="prose">
      <h2 id="${request.id}" style="margin-top:0">${inline(request.title, ctx)}</h2>
      ${prose(requestText, ctx)}
      <p class="area-note" data-area-note role="status">Your enquiry is about: <strong data-area-label></strong>. Mention it when you call or email.</p>
      <div class="actions" style="margin-top:22px">
        <a class="button button-gold" href="mailto:${OFFICE.email}?subject=Consultation%20enquiry" data-mail-subject>Email the office</a>
        <a class="text-link" href="tel:${OFFICE.phones[0].tel}">Call the office<span class="arrow" aria-hidden="true">→</span></a>
        <a class="text-link with-icon" href="${OFFICE.whatsapp.href}" target="_blank" rel="noopener">${ICONS.whatsapp}Message on WhatsApp<span class="arrow" aria-hidden="true">→</span></a>
      </div>
    </section>
    <section class="ai-intake" aria-labelledby="ai-intake-title">
      <p class="ai-intake-label">Alpuche AI</p>
      <h2 id="ai-intake-title">Prefer to send a message?</h2>
      <p>Alpuche AI, the firm’s automated assistant, takes a short enquiry and passes it to the office. It asks for your name, how you’d like to be contacted and a sentence or two about the matter${LEAD_ENDPOINT ? ', then emails you a confirmation' : ''}. Keep it general: no names of other people, ID numbers or documents.</p>
      <button type="button" class="button button-gold" data-intake data-contact-intake hidden>Start an enquiry with Alpuche AI</button>
      ${LEAD_ENDPOINT ? '' : '<p class="ai-intake-demo">Demo: enquiries are not sent anywhere yet.</p>'}
    </section>
  </div>
</div>
<div class="shell section-tight" style="padding-top:0">
  <div class="notice-pair">${notices.map((n) => `<section aria-labelledby="${n.id}"><h2 id="${n.id}">${inline(n.title, ctx)}</h2>${prose(n.blocks, ctx)}</section>`).join('')}</div>
  ${footerRow ? actionRow(linksIn(footerRow.text), ctx, 'page-actions') : ''}
</div>
<script type="application/json" id="contact-areas">${JSON.stringify(areaMap)}</script>`;
  return layout(page, ctx, main, { crumbs });
}

function renderNotice(page, ctx) {
  const { intro, sections: secs } = sections(page.blocks);
  const I = splitIntro(intro);
  const crumbs = [{ label: 'Home', route: '/' }, { label: 'Website notice', route: '/website-notice/' }];
  const body = secs.map((s) => {
    if (/^Photo credits$/i.test(s.title)) {
      const list = s.blocks.find((b) => b.type === 'ul');
      return `<h2 id="photo-credits">${inline(s.title, ctx)}</h2>
<ul class="credits-list">${list.items.map((it) => `<li>${inline(it, ctx)}</li>`).join('')}
<li>Portrait of José M. Alpuche by Knight &amp; Day Photography; the credit appears on the photograph.</li></ul>
<p>The Belize photographs are resized for the web and cropped for layout on some pages. No other changes have been made.</p>`;
    }
    return renderSection(s, ctx);
  }).join('\n');
  const main = `${pageHead(page, ctx, { crumbs, h1: I.h1, standfirst: inline(I.paras[0].text, ctx), photoName: null })}
<div class="shell article-layout no-aside"><article class="prose">${body}</article></div>`;
  return layout(page, ctx, main, { crumbs });
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
function template(route) {
  if (route === '/') return renderHome;
  if (route === '/practice-areas/') return renderPracticeHub;
  if (route.startsWith('/practice-areas/')) return renderPractice;
  if (route === '/insights/') return renderInsightsHub;
  if (route.startsWith('/insights/')) return renderGuide;
  return { '/about/': renderAbout, '/working-with-us/': renderWorking, '/contact/': renderContact, '/website-notice/': renderNotice }[route];
}

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const a = path.join(from, e.name);
    const b = path.join(to, e.name);
    if (e.isDirectory()) copyDir(a, b); else fs.copyFileSync(a, b);
  }
}

function build() {
  KB = parseKnowledgeBase();
  const files = fs.readdirSync(path.join(SRC, 'content')).filter((f) => f.endsWith('.md')).sort();
  const pages = files.map((f) => ({ file: f, ...parseFile(path.join(SRC, 'content', f)) }));

  fs.rmSync(OUT, { recursive: true, force: true });
  copyDir(path.join(SRC, 'static'), path.join(OUT, 'assets'));
  const aiData = writeAssistantData(pages);

  // Home first: its closing copy is reused by other pages.
  pages.sort((a, b) => (a.meta.route === '/' ? -1 : b.meta.route === '/' ? 1 : 0));
  for (const page of pages) {
    const route = page.meta.route;
    const depth = route.split('/').filter(Boolean).length;
    const ctx = { route, assets: `${'../'.repeat(depth)}assets/` };
    const render = template(route);
    if (!render) throw new Error(`No template for ${route}`);
    const html = render(page, ctx);
    const dir = path.join(OUT, ...route.split('/').filter(Boolean));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    console.log(`  ${route.padEnd(52)} ← ${page.file}`);
  }

  if (NETLIFY) writeNetlifyFiles();
  if (LOCAL) {
    // Browsers restrict web fonts loaded from file:// URLs, so embed them in the stylesheet.
    const cssFile = path.join(OUT, 'assets', 'css', 'site.css');
    const css = fs.readFileSync(cssFile, 'utf8').replace(/url\("\.\.\/fonts\/([^"]+\.woff2)"\)/g, (_, f) =>
      `url("data:font/woff2;base64,${fs.readFileSync(path.join(SRC, 'static', 'fonts', f)).toString('base64')}")`);
    fs.writeFileSync(cssFile, css);
  }
  if (PRODUCTION) {
    const urls = pages.map((p) => `  <url><loc>${absUrl(p.meta.route)}</loc></url>`).join('\n');
    fs.writeFileSync(path.join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
    fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`);
  }
  console.log(`Built ${pages.length} pages, Alpuche AI: ${Object.keys(aiData.kb).length} curated answers + ${aiData.docs.length} site passages (${aiData.transport.mode}) → ${path.relative(process.cwd(), OUT) || OUT} (${PRODUCTION ? 'production' : 'private preview, noindex'})`);
}

// ---------------------------------------------------------------------------
// Netlify extras
// ---------------------------------------------------------------------------
// The only host the site may contact: the configured enquiry endpoint (Apps Script answers
// through script.googleusercontent.com after a redirect). Without one, nothing at all.
function connectSrc() {
  if (!LEAD_ENDPOINT) return "'none'";
  const origin = new URL(LEAD_ENDPOINT).origin;
  return origin === 'https://script.google.com' ? `${origin} https://script.googleusercontent.com` : origin;
}

function writeNetlifyFiles() {
  // 404 page: rendered as if at "/" with <base href="/"> so links work at any missing depth.
  const ctx = { route: '/', assets: 'assets/' };
  const page = { meta: { route: '/404/', title: 'Page not found | José M. Alpuche', description: 'The page you were looking for could not be found.', hero_image: '', source_ids: [] } };
  const main = `${pageHead(page, ctx, {
    crumbs: [{ label: 'Home', route: '/' }, { label: 'Page not found', route: '/404/' }],
    h1: 'Page not found',
    standfirst: 'The page you were looking for is not here. It may have moved, or the address may be mistyped.',
    photoName: null,
  })}
<div class="shell section-tight"><div class="prose">
  <p>Try one of these instead:</p>
  <ul>${[['/', 'Home'], ['/practice-areas/', 'Practice Areas'], ['/insights/', 'Belize Legal Guides'], ['/contact/', 'Contact the office']].map(([r, l]) => `<li><a href="${rel('/', r)}">${l}</a></li>`).join('')}</ul>
</div></div>
${genericBand(ctx)}`;
  let html = layout(page, ctx, main, { base: '/' });
  if (PRODUCTION) html = html.replace(/<link rel="canonical"[^>]*>\n/, '<meta name="robots" content="noindex">\n');
  fs.writeFileSync(path.join(OUT, '404.html'), html);

  // Headers. connect-src allows only the enquiry endpoint (or nothing); form-action 'none' blocks form posts.
  const csp = [
    "default-src 'self'", "script-src 'self'", "style-src 'self' 'unsafe-inline'", "img-src 'self' data:",
    "font-src 'self'", `connect-src ${connectSrc()}`, "form-action 'none'", "frame-ancestors 'none'", "base-uri 'self'", "object-src 'none'",
  ].join('; ');
  const headers = [
    '/*',
    ...(PRODUCTION ? [] : ['  X-Robots-Tag: noindex, nofollow, noarchive']),
    `  Content-Security-Policy: ${csp}`,
    '  X-Content-Type-Options: nosniff',
    '  Referrer-Policy: strict-origin-when-cross-origin',
    '  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()',
    '',
    '/assets/*',
    '  Cache-Control: public, max-age=86400',
    '',
  ];
  fs.writeFileSync(path.join(OUT, '_headers'), headers.join('\n'));
  // Planned redirect from the firm's current Services URL (confirm existing URLs before launch).
  fs.writeFileSync(path.join(OUT, '_redirects'), '/services    /practice-areas/  301\n/services/*  /practice-areas/  301\n');
}

build();
