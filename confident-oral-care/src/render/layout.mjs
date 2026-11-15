import { esc, icon } from './util.mjs';

export function logo(className = 'brand-logo', width = 132) {
  const height = Math.round(width * 233 / 590);
  return `<img class="${className}" src="/img/web/confident-logo-240.png" srcset="/img/web/confident-logo-240.webp 240w, /img/web/confident-logo-480.webp 480w" sizes="${width}px" width="${width}" height="${height}" alt="ConfiDent Oral Care">`;
}

function navLink(path, current, label) {
  const active = current === path || (path !== '/' && current.startsWith(`${path}/`));
  return `<a href="${path}"${active ? ' aria-current="page"' : ''}>${label}</a>`;
}

function header(site, path) {
  const sub = site.categories.map((c) => `<li><a href="${c.path}"${path === c.path ? ' aria-current="page"' : ''}>${esc(c.title)}</a></li>`).join('');
  return `
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="/">${logo()}</a>
    <nav class="main-nav" id="main-nav" aria-label="Main">
      <ul class="nav-list">
        <li>${navLink('/about', path, 'About')}</li>
        <li class="has-sub">
          ${navLink('/services', path, 'Services')}
          <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-services">
            <span class="visually-hidden">Show treatment categories</span>${icon('chevron')}
          </button>
          <ul class="sub-menu" id="sub-services">
            <li><a href="/services">All services</a></li>
            ${sub}
          </ul>
        </li>
        <li>${navLink('/first-visit', path, 'Your First Visit')}</li>
        <li>${navLink('/gallery', path, 'Gallery')}</li>
        <li>${navLink('/blog', path, 'Dental Blog')}</li>
        <li>${navLink('/contact', path, 'Contact Us')}</li>
      </ul>
      <div class="nav-contact">
        <a href="${site.clinic.phone.href}">${icon('phone')} ${esc(site.clinic.phone.label)}</a>
        <a href="${site.clinic.socialLinks.instagram}" rel="noopener">${icon('instagram')} Instagram DM</a>
      </div>
    </nav>
    <a class="btn btn-primary header-cta" href="/appointments"${path === '/appointments' ? ' aria-current="page"' : ''}>Request an appointment</a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
      <span class="menu-bars" aria-hidden="true"></span><span class="visually-hidden">Menu</span>
    </button>
  </div>
</header>`;
}

function footer(site) {
  const { clinic } = site;
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="/" class="footer-logo">${logo('brand-logo', 168)}</a>
      <p>Dental and orthodontic care at The Boardwalk Belize, Belize City.</p>
      <p class="footer-contact">
        <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a> · <a href="${clinic.email.href}">${esc(clinic.email.label)}</a>
      </p>
      <p>${esc(clinic.address)}</p>
    </div>
    <nav class="footer-nav" aria-label="Footer">
      <h2 class="footer-heading">Explore</h2>
      <ul>
        <li><a href="/services">Services</a></li>
        <li><a href="/first-visit">Your First Visit</a></li>
        <li><a href="/gallery">Gallery</a></li>
        <li><a href="/blog">Dental Blog</a></li>
        <li><a href="/contact">Contact Us</a></li>
        <li><a href="/appointments">Request an Appointment</a></li>
      </ul>
    </nav>
    <div class="footer-hours">
      <h2 class="footer-heading">Posted hours</h2>
      <dl class="hours-list">
        ${site.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}
      </dl>
    </div>
    <div class="footer-social">
      <h2 class="footer-heading">Follow us</h2>
      <ul>
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} Instagram</a></li>
        <li><a href="${esc(clinic.socialLinks.facebook)}" rel="noopener">${icon('facebook')} Facebook</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-base">
    <p>© ${new Date().getFullYear()} ConfiDent Oral Care</p>
    ${site.siteConfig.preview ? '<p>Client preview. Not for public release.</p>' : ''}
  </div>
</footer>`;
}

function clinicFacts(site) {
  const { clinic } = site;
  const facts = {
    phone: clinic.phone.label,
    phoneHref: clinic.phone.href,
    instagram: clinic.socialLinks.instagram,
    address: clinic.address,
    directionsUrl: site.directionsUrl,
    hours: site.hours,
    hoursNote: site.pages.contact.hoursNote,
    categories: site.categories.map((c) => ({ title: c.title, path: c.path, card: c.card })),
    messages: { unavailable: site.statusMessages.unavailable },
    staticPreview: Boolean(site.staticPreview),
  };
  return `<script type="application/json" id="clinic-facts">${JSON.stringify(facts).replace(/</g, '\\u003c')}</script>`;
}

function assistantPanel(site) {
  const { clinic } = site;
  return `${clinicFacts(site)}
<button class="ai-launcher" type="button" aria-controls="ai-panel" aria-expanded="false" data-ai-open>
  ${icon('chat')}<span>Ask confident AI</span>
</button>
<section class="ai-panel" id="ai-panel" role="dialog" aria-modal="false" aria-labelledby="ai-title" hidden>
  <div class="ai-panel-inner">
    <header class="ai-head">
      <div>
        <h2 id="ai-title" class="ai-title">confident AI</h2>
        <p class="ai-subtitle">ConfiDent Oral Care’s AI assistant</p>
      </div>
      <button class="icon-btn" type="button" data-ai-close>${icon('close')}<span class="visually-hidden">Close confident AI</span></button>
    </header>
    ${site.staticPreview ? `<p class="ai-static-note">Static preview: confident AI’s conversation and online booking run on the clinic’s server and are switched off here. The suggestions below still work.</p>` : ''}
    <div class="ai-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="Conversation with confident AI"></div>
    <div class="ai-suggestions" aria-label="Suggested actions" role="group">
      <button type="button" class="chip" data-ai-action="find-service">Find a service</button>
      <button type="button" class="chip" data-ai-action="request-appointment">Request an appointment</button>
      <button type="button" class="chip" data-ai-action="hours">Check opening hours</button>
      <a class="chip" href="${esc(site.directionsUrl)}" rel="noopener" data-ai-action="directions">Get directions</a>
    </div>
    <form class="ai-form" data-ai-form>
      <label class="visually-hidden" for="ai-input">Message confident AI</label>
      <textarea id="ai-input" name="message" rows="1" maxlength="800" placeholder="Type your question" autocomplete="off" enterkeyhint="send"></textarea>
      <button class="btn btn-primary btn-send" type="submit">Send</button>
    </form>
    <p class="ai-foot">
      confident AI can make mistakes and doesn’t give clinical advice. Prefer a person?
      <a href="${clinic.phone.href}">Call ${esc(clinic.phone.label)}</a> or
      <a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">message us on Instagram</a>.
    </p>
  </div>
</section>`;
}

export function layout(site, { title, description, path, body, jsonLd = null, bodyClass = '' }) {
  const { siteConfig } = site;
  const fullTitle = path === '/' ? `ConfiDent Oral Care | Dentist & Orthodontist at The Boardwalk Belize` : `${title} | ConfiDent Oral Care`;
  const canonical = siteConfig.canonicalOrigin ? `${siteConfig.canonicalOrigin.replace(/\/$/, '')}${path}` : null;
  const image = siteConfig.canonicalOrigin ? `${siteConfig.canonicalOrigin.replace(/\/$/, '')}${siteConfig.socialImage}` : siteConfig.socialImage;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${siteConfig.preview ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}
<meta property="og:type" content="website">
<meta property="og:site_name" content="ConfiDent Oral Care">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta name="theme-color" content="#FBF8F3">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/fonts/cormorant-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/red-hat-display-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css">
${jsonLd ? `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>` : ''}
<script type="module" src="/js/site.js"></script>
</head>
<body class="${esc(bodyClass)}">
<a class="skip-link" href="#main">Skip to content</a>
${header(site, path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(site)}
${assistantPanel(site)}
</body>
</html>`;
}
