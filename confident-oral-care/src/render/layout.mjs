import { localePath } from '../site.mjs';
import { esc, icon } from './util.mjs';

export function logo(className = 'brand-logo', width = 132) {
  const height = Math.round(width * 233 / 590);
  return `<img class="${className}" src="/img/web/confident-logo-240.png" srcset="/img/web/confident-logo-240.webp 240w, /img/web/confident-logo-480.webp 480w" sizes="${width}px" width="${width}" height="${height}" alt="ConfiDent Oral Care">`;
}

function navLink(site, path, current, label) {
  const href = site.u(path);
  const active = current === href || (path !== '/' && current.startsWith(`${href}/`));
  return `<a href="${href}"${active ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
}

function header(site, current, path) {
  const { t, clinic } = site;
  const sub = site.categories.map((c) => `<li><a href="${c.path}"${current === c.path ? ' aria-current="page"' : ''}>${esc(c.title)}</a></li>`).join('');
  const switchPath = path === '/404' || path.startsWith('/preview') ? '/' : path;
  const enHref = localePath(switchPath, 'en');
  const esHref = localePath(switchPath, 'es');
  return `
<header class="site-header">
  <div class="header-inner">
    <a class="brand" href="${site.u('/')}">${logo()}</a>
    <nav class="main-nav" id="main-nav" aria-label="${esc(t.nav.main)}">
      <ul class="nav-list">
        <li>${navLink(site, '/', current, t.nav.home)}</li>
        <li>${navLink(site, '/about', current, t.nav.about)}</li>
        <li class="has-sub">
          ${navLink(site, '/services', current, t.nav.services)}
          <button class="sub-toggle" type="button" aria-expanded="false" aria-controls="sub-services">
            <span class="visually-hidden">${esc(t.nav.showCategories)}</span>${icon('chevron')}
          </button>
          <ul class="sub-menu" id="sub-services">
            <li><a href="${site.u('/services')}">${esc(t.nav.allServices)}</a></li>
            ${sub}
          </ul>
        </li>
        <li>${navLink(site, '/first-visit', current, t.nav.firstVisit)}</li>
        <li>${navLink(site, '/gallery', current, t.nav.gallery)}</li>
        <li>${navLink(site, '/blog', current, t.nav.blog)}</li>
        <li>${navLink(site, '/contact', current, t.nav.contact)}</li>
      </ul>
      <ul class="nav-social" aria-label="${esc(t.nav.social)}">
        <li><a href="${esc(clinic.whatsapp.href)}" rel="noopener" target="_blank">${icon('whatsapp')}<span class="nav-social-label">WhatsApp</span></a></li>
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener" target="_blank">${icon('instagram')}<span class="nav-social-label">Instagram</span></a></li>
        <li><a href="${esc(clinic.socialLinks.facebook)}" rel="noopener" target="_blank">${icon('facebook')}<span class="nav-social-label">Facebook</span></a></li>
        <li class="nav-phone"><a href="${clinic.phone.href}">${icon('phone')}<span class="nav-social-label">${esc(clinic.phone.label)}</span></a></li>
      </ul>
    </nav>
    <nav class="lang-switch" aria-label="${esc(t.nav.language)}">
      <a href="${enHref}" hreflang="en" lang="en"${site.locale === 'en' ? ' aria-current="true"' : ''}><span class="visually-hidden">English</span><span aria-hidden="true">EN</span></a>
      <a href="${esHref}" hreflang="es" lang="es"${site.locale === 'es' ? ' aria-current="true"' : ''}><span class="visually-hidden">Español</span><span aria-hidden="true">ES</span></a>
    </nav>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">
      <span class="menu-bars" aria-hidden="true"></span><span class="visually-hidden">${esc(t.nav.menu)}</span>
    </button>
  </div>
</header>`;
}

function credit(site) {
  const c = site.siteConfig.credit;
  if (!c?.name) return '';
  const name = c.url ? `<a href="${esc(c.url)}" rel="noopener" target="_blank">${esc(c.name)}</a>` : esc(c.name);
  return `<p class="footer-credit">${esc(site.t.footer.creditBefore)} ${name}</p>`;
}

function footer(site) {
  const { clinic, t, u } = site;
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <a href="${u('/')}" class="footer-logo">${logo('brand-logo', 168)}</a>
      <p>${esc(t.footer.tagline)}</p>
      <p class="footer-contact">
        <a href="${clinic.phone.href}">${esc(clinic.phone.label)}</a> · <a href="${clinic.email.href}">${esc(clinic.email.label)}</a>
      </p>
      <p>${esc(clinic.address)}</p>
    </div>
    <nav class="footer-nav" aria-label="${esc(t.footer.footerNav)}">
      <h2 class="footer-heading">${esc(t.footer.explore)}</h2>
      <ul>
        <li><a href="${u('/services')}">${esc(t.nav.services)}</a></li>
        <li><a href="${u('/first-visit')}">${esc(t.nav.firstVisit)}</a></li>
        <li><a href="${u('/gallery')}">${esc(t.nav.gallery)}</a></li>
        <li><a href="${u('/blog')}">${esc(t.nav.blog)}</a></li>
        <li><a href="${u('/contact')}">${esc(t.nav.contact)}</a></li>
        <li><a href="${u('/appointments')}">${esc(t.footer.requestAppointment)}</a></li>
      </ul>
    </nav>
    <div class="footer-hours">
      <h2 class="footer-heading">${esc(t.footer.hours)}</h2>
      <dl class="hours-list">
        ${site.hours.map((h) => `<div><dt>${esc(h.days)}</dt><dd>${esc(h.time)}</dd></div>`).join('')}
      </dl>
    </div>
    <div class="footer-social">
      <h2 class="footer-heading">${esc(t.footer.follow)}</h2>
      <ul>
        <li><a href="${esc(clinic.whatsapp.href)}" rel="noopener">${icon('whatsapp')} WhatsApp</a></li>
        <li><a href="${esc(clinic.socialLinks.instagram)}" rel="noopener">${icon('instagram')} Instagram</a></li>
        <li><a href="${esc(clinic.socialLinks.facebook)}" rel="noopener">${icon('facebook')} Facebook</a></li>
      </ul>
    </div>
  </div>
  <div class="container footer-base">
    <p>© ${new Date().getFullYear()} ConfiDent Oral Care</p>
    ${site.siteConfig.preview ? `<p>${esc(t.footer.preview)}</p>` : ''}
    ${credit(site)}
  </div>
</footer>`;
}

function clinicFacts(site) {
  const { clinic } = site;
  const facts = {
    locale: site.locale,
    phone: clinic.phone.label,
    phoneHref: clinic.phone.href,
    whatsapp: clinic.whatsapp.href,
    address: clinic.address,
    directionsUrl: site.directionsUrl,
    calendarUrl: site.scheduling.mode === 'test' ? '/preview/test-calendar' : null,
    servicesUrl: site.u('/services'),
    categories: site.categories.map((c) => ({ title: c.title, path: c.path, card: c.card })),
    messages: { unavailable: site.statusMessages.unavailable },
    strings: site.t.js,
  };
  return `<script type="application/json" id="clinic-facts">${JSON.stringify(facts).replace(/</g, '\\u003c')}</script>`;
}

function assistantPanel(site) {
  const { clinic, t } = site;
  return `${clinicFacts(site)}
<button class="back-to-top" type="button" data-back-to-top hidden>${icon('chevron', 'icon icon-up')}<span class="visually-hidden">${esc(t.common.backToTop)}</span></button>
<button class="ai-launcher" type="button" aria-controls="ai-panel" aria-expanded="false" data-ai-open>
  <img class="ai-launcher-logo" src="/img/web/confident-logo-240.webp" width="64" height="25" alt=""><span>${esc(t.ai.launcher)}</span>
</button>
<section class="ai-panel" id="ai-panel" role="dialog" aria-modal="false" aria-labelledby="ai-title" hidden>
  <div class="ai-panel-inner">
    <header class="ai-head">
      <div>
        <h2 id="ai-title" class="ai-title">${esc(t.ai.title)}</h2>
        <p class="ai-subtitle">${esc(t.ai.subtitle)}</p>
      </div>
      <div class="ai-head-actions">
        <button class="ai-new-chat" type="button" data-ai-new>${icon('plus')}<span>${esc(t.ai.newChat)}</span></button>
        <button class="icon-btn" type="button" data-ai-close>${icon('close')}<span class="visually-hidden">${esc(t.ai.close)}</span></button>
      </div>
    </header>
    <div class="ai-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" aria-label="${esc(t.ai.logLabel)}"></div>
    <div class="ai-suggestions" aria-label="${esc(t.ai.suggestions)}" role="group">
      <button type="button" class="chip" data-ai-action="request-appointment">${esc(t.ai.requestAppointment)}</button>
      <button type="button" class="chip" data-ai-action="find-service">${esc(t.ai.findService)}</button>
    </div>
    <form class="ai-form" data-ai-form>
      <label class="visually-hidden" for="ai-input">${esc(t.ai.inputLabel)}</label>
      <textarea id="ai-input" name="message" rows="1" maxlength="800" placeholder="${esc(t.ai.placeholder)}" autocomplete="off" enterkeyhint="send"></textarea>
      <button class="btn btn-primary btn-send" type="submit">${esc(t.ai.send)}</button>
    </form>
    <p class="ai-foot">
      ${esc(t.ai.footBefore)}
      <a href="${clinic.phone.href}">${esc(t.ai.footCall)} ${esc(clinic.phone.label)}</a> ${esc(t.ai.footOr)}
      <a href="${esc(clinic.whatsapp.href)}" rel="noopener" target="_blank">${esc(t.ai.footWa)}</a>.
    </p>
  </div>
</section>`;
}

/**
 * @param path the page's language-neutral path (e.g. "/services"); the layout localizes it.
 */
export function layout(site, { title, description, path, body, jsonLd = null, bodyClass = '' }) {
  const { siteConfig, t } = site;
  const current = site.u(path);
  const fullTitle = path === '/' ? t.siteTitle : `${title} | ConfiDent Oral Care`;
  const origin = siteConfig.canonicalOrigin ? siteConfig.canonicalOrigin.replace(/\/$/, '') : '';
  const canonical = origin ? `${origin}${current}` : null;
  const image = `${origin}${siteConfig.socialImage}`;
  const alternates = path.startsWith('/preview') || path === '/404' ? '' : `
<link rel="alternate" hreflang="en" href="${origin}${localePath(path, 'en')}">
<link rel="alternate" hreflang="es" href="${origin}${localePath(path, 'es')}">
<link rel="alternate" hreflang="x-default" href="${origin}${localePath(path, 'en')}">`;
  return `<!DOCTYPE html>
<html lang="${t.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description)}">
${siteConfig.preview ? '<meta name="robots" content="noindex, nofollow">' : ''}
${canonical ? `<link rel="canonical" href="${esc(canonical)}">` : ''}${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="ConfiDent Oral Care">
<meta property="og:locale" content="${site.locale === 'es' ? 'es_419' : 'en_US'}">
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
<a class="skip-link" href="#main">${esc(t.skip)}</a>
${header(site, current, path)}
<main id="main" tabindex="-1">
${body}
</main>
${footer(site)}
${assistantPanel(site)}
</body>
</html>`;
}
