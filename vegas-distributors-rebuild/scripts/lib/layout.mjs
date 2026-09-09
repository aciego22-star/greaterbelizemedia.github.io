/** Document shell: head metadata, masthead, footer and page assembly. */
import { esc, cx, attrs, picture, jsonLd } from './html.mjs';

/** Route table. Paths are locale-independent; Spanish pages sit under /es/. */
export const ROUTES = {
  home: '',
  about: 'about',
  divisions: 'divisions',
  industries: 'divisions/vegas-industries',
  lubricants: 'divisions/international-lubricants-belize',
  products: 'products',
  network: 'sales-network',
  contact: 'contact',
};

/** Output path for a route in a locale, e.g. ('es','products') -> 'es/products'. */
export const routePath = (locale, path) =>
  [locale === 'en' ? '' : locale, path].filter(Boolean).join('/');

/** Absolute URL for canonicals, sitemap and structured data. */
export const absoluteUrl = (site, locale, path) => {
  const p = routePath(locale, path);
  return `${site.siteUrl}/${p ? `${p}/` : ''}`;
};

/**
 * Relative prefix from a page back to the site root.
 * Every asset and internal link is emitted relative, so the build works from a
 * domain root, a subdirectory, or straight off the filesystem.
 */
export const baseFor = (outPath) => {
  const depth = outPath ? outPath.split('/').filter(Boolean).length : 0;
  return depth ? '../'.repeat(depth) : './';
};

/** Internal link helper: link('products') -> '{{BASE}}products/'. */
export const link = (locale, path) => {
  const p = routePath(locale, path);
  return `{{BASE}}${p ? `${p}/` : ''}`;
};

/* ------------------------------------------------------------------ */

function head({ site, i18n, locale, title, description, outPath, path, og, extraHead = '', structuredData = [], switchPath }) {
  const fullTitle = path === ROUTES.home
    ? `${i18n.site.name} — ${title}`
    : `${title} — ${i18n.site.name}`;

  const canonical = absoluteUrl(site, locale, path);
  const alternates = ['en', 'es']
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(absoluteUrl(site, l, path))}">`)
    .join('') + `<link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(site, 'en', path))}">`;

  // Only the two Latin subsets actually used are preloaded; the rest load on demand.
  const preload = ['inter-400-latin.woff2', 'inter-600-latin.woff2', 'archivo-700-latin.woff2']
    .map((f) => `<link rel="preload" href="{{BASE}}assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`)
    .join('');

  // Browser-language detection, inlined so it runs before first paint.
  // English is the fallback, an explicit choice always wins, and the script
  // only exists on English pages so it can never loop.
  const esHref = `{{BASE}}${routePath('es', switchPath ?? path)}/`;
  const detect =
    locale === 'en'
      ? `<script>(function(){try{var c=localStorage.getItem('vegas-lang');if(c==='en')return;` +
        `var w=c==='es';if(!c){var l=navigator.languages||[navigator.language||''];` +
        `for(var i=0;i<l.length;i++){if(String(l[i]).toLowerCase().split('-')[0]==='es'){w=true;break;}}}` +
        `if(w)location.replace('${esHref}');}catch(e){}})();</script>`
      : '';

  return (
    `<meta charset="utf-8">` +
    detect +
    `<meta name="viewport" content="width=device-width, initial-scale=1">` +
    `<title>${esc(fullTitle)}</title>` +
    `<meta name="description" content="${esc(description)}">` +
    (site.noindex ? `<meta name="robots" content="noindex, nofollow">` : `<meta name="robots" content="index, follow">`) +
    `<link rel="canonical" href="${esc(canonical)}">` +
    alternates +
    `<meta name="theme-color" content="${esc(site.themeColor)}">` +
    `<meta property="og:type" content="website">` +
    `<meta property="og:site_name" content="${esc(i18n.site.name)}">` +
    `<meta property="og:locale" content="${locale === 'es' ? 'es_BZ' : 'en_BZ'}">` +
    `<meta property="og:title" content="${esc(fullTitle)}">` +
    `<meta property="og:description" content="${esc(description)}">` +
    `<meta property="og:url" content="${esc(canonical)}">` +
    (og?.image ? `<meta property="og:image" content="${esc(og.image)}"><meta property="og:image:alt" content="${esc(og.imageAlt ?? '')}">` : '') +
    `<meta name="twitter:card" content="${esc(site.twitterCard)}">` +
    `<link rel="icon" href="{{BASE}}assets/images/company/vegas-mark-360.png" type="image/png">` +
    `<link rel="apple-touch-icon" href="{{BASE}}assets/images/company/vegas-mark-360.png">` +
    preload +
    `<link rel="stylesheet" href="{{BASE}}assets/styles/fonts.css">` +
    `<link rel="stylesheet" href="{{BASE}}assets/styles/site.css">` +
    structuredData.map(jsonLd).join('') +
    extraHead
  );
}

function masthead({ i18n, locale, images, current, switchPath }) {
  const items = [
    ['home', i18n.nav.home],
    ['about', i18n.nav.about],
    ['divisions', i18n.nav.divisions],
    ['products', i18n.nav.products],
    ['network', i18n.nav.salesNetwork],
    ['contact', i18n.nav.contact],
  ];

  const nav = items
    .map(([id, label]) => {
      const isCurrent = id === current || (current?.startsWith(id) && id !== 'home');
      return `<li><a href="${link(locale, ROUTES[id])}"${isCurrent ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;
    })
    .join('');

  // Routes are locale-independent, so the switch lands on the same page in the
  // other language — including deep routes such as /products/<brand>/.
  const langSwitch = ['en', 'es']
    .map((l) => {
      const target = switchPath ?? '';
      const href = l === locale ? '#' : `{{BASE}}${routePath(l, target)}${routePath(l, target) ? '/' : ''}`;
      const label = l === 'es' ? 'ES' : 'EN';
      const full = l === 'es' ? 'Español' : 'English';
      return l === locale
        ? `<a href="${esc(href)}" aria-current="true" lang="${l}" hreflang="${l}"><span aria-hidden="true">${label}</span><span class="visually-hidden">${esc(full)}</span></a>`
        : `<a href="${esc(href)}" lang="${l}" hreflang="${l}"><span aria-hidden="true">${label}</span><span class="visually-hidden">${esc(full)}</span></a>`;
    })
    .join('');

  return (
    // A complementary landmark, so the status note is reachable by landmark
    // navigation rather than floating outside the page structure.
    `<aside class="concept-bar" aria-label="${esc(i18n.site.conceptBar)}"><div class="shell"><strong>${esc(i18n.site.conceptBar)}</strong><span>${esc(i18n.site.conceptBarText)}</span></div></aside>` +
    `<header class="masthead">` +
    `<div class="shell masthead__bar">` +
    `<a class="brand" href="${link(locale, ROUTES.home)}">` +
    picture(images.company.logo, {
      alt: i18n.site.name,
      className: 'brand__logo',
      loading: 'eager',
      fetchpriority: 'high',
      sizes: '122px',
    }) +
    `</a>` +
    // The language control stays on the top row at every width; the rest of the
    // header collapses behind the menu button on small screens.
    `<div class="lang" role="group" aria-label="${esc(i18n.nav.languageLabel)}">${langSwitch}</div>` +
    `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="masthead-panel">` +
    `<span class="nav-toggle__bars" aria-hidden="true"><i></i><i></i><i></i></span>${esc(i18n.nav.menu)}` +
    `</button>` +
    `<div class="masthead__panel" id="masthead-panel">` +
    `<nav aria-label="${esc(i18n.nav.primaryLabel)}"><ul class="nav-list">${nav}</ul></nav>` +
    `<div class="masthead__cta">` +
    `<a class="btn btn--outline btn--sm" href="${link(locale, ROUTES.network)}">${esc(i18n.actions.findRep)}</a>` +
    `<a class="btn btn--primary btn--sm" href="${link(locale, ROUTES.contact)}?type=quote">${esc(i18n.actions.requestQuote)}</a>` +
    `</div>` +
    `</div>` +
    `</div></header>`
  );
}

function footer({ site, i18n, locale, company, images }) {
  const explore = [
    ['about', i18n.nav.about],
    ['divisions', i18n.nav.divisions],
    ['products', i18n.nav.products],
    ['network', i18n.nav.salesNetwork],
    ['contact', i18n.nav.contact],
  ]
    .map(([id, label]) => `<li><a href="${link(locale, ROUTES[id])}">${esc(label)}</a></li>`)
    .join('');

  const divisions = company.divisions
    .map((d) => {
      const routeKey = d.slug === 'vegas-industries' ? 'industries' : d.slug === 'international-lubricants-belize' ? 'lubricants' : 'divisions';
      return `<li><a href="${link(locale, ROUTES[routeKey])}">${esc(d.name)}</a></li>`;
    })
    .join('');

  const phones = company.phones
    .map((p) => `<li><a href="tel:${esc(p.replace(/[^\d+]/g, ''))}" class="phone">${esc(p)}</a></li>`)
    .join('');

  const year = new Date().getFullYear();

  return (
    `<footer class="site-footer"><div class="shell">` +
    `<div class="footer-grid">` +
    `<div class="footer-brand">` +
    `<span class="footer-brand__plate">` +
    picture(images.company.logo, { alt: i18n.site.name, sizes: '138px' }) +
    `</span>` +
    `<p>${esc(i18n.footer.tagline)}</p>` +
    `<p>${esc(company.address.street)}, ${esc(company.address.town)}, ${esc(company.address.district)}, ${esc(company.address.country)}</p>` +
    `</div>` +
    `<div><h2>${esc(i18n.footer.exploreHeading)}</h2><ul class="footer-list">${explore}</ul></div>` +
    `<div><h2>${esc(i18n.footer.divisionsHeading)}</h2><ul class="footer-list">${divisions}</ul></div>` +
    `<div><h2>${esc(i18n.footer.contactHeading)}</h2><ul class="footer-list">${phones}` +
    `<li><a href="mailto:${esc(company.email)}">${esc(company.email)}</a></li>` +
    `<li><a href="${esc(company.facebook)}" rel="noopener noreferrer">${esc(i18n.footer.followUs)}</a></li>` +
    `</ul></div>` +
    `</div>` +
    `<div class="footer-note">` +
    `<span>&copy; ${year} ${esc(i18n.footer.copyright)}</span>` +
    `<span>${esc(i18n.footer.conceptBody)}</span>` +
    `<span>${esc(i18n.footer.rightsNote)}</span>` +
    `</div>` +
    `</div></footer>`
  );
}

/**
 * Assembles a complete document and resolves {{BASE}} to the relative prefix
 * for this page's depth.
 */
export function page(ctx) {
  const { i18n, locale, outPath, body, bodyClass } = ctx;
  // The error page is reachable from any URL, so its language control points at
  // the site root rather than a mirrored /es/404 that does not exist.
  const switchPath = ctx.switchPath ?? (ctx.path === '404' ? '' : ctx.path);

  const html =
    `<!DOCTYPE html>` +
    `<html lang="${esc(i18n.htmlLang)}" dir="${esc(i18n.dir)}">` +
    `<head>${head({ ...ctx, switchPath })}</head>` +
    `<body${bodyClass ? ` class="${esc(bodyClass)}"` : ''}>` +
    `<a class="skip-link" href="#main">${esc(i18n.site.skipLink)}</a>` +
    masthead({ ...ctx, switchPath }) +
    `<main id="main">${body}</main>` +
    footer(ctx) +
    // Integration point: analytics. Load deferred, after consent, here.
    `<script src="{{BASE}}assets/js/site.js" defer></script>` +
    (ctx.pageScripts ?? []).map((s) => `<script src="{{BASE}}assets/js/${s}" defer></script>`).join('') +
    `</body></html>`;

  return html.replaceAll('{{BASE}}', baseFor(outPath));
}
