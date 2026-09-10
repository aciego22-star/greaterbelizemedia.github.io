/** Document shell: head metadata, masthead, footer and page assembly. */
import { esc, cx, attrs, picture, jsonLd } from './html.mjs';
import { socialLinks } from './partials.mjs';

/**
 * Route table. Most paths are the same in both languages and Spanish pages sit
 * under /es/. Where a route reads badly in translation it carries a path per
 * locale instead, written as { en, es }.
 */
export const ROUTES = {
  home: '',
  about: 'about',
  divisions: 'divisions',
  industries: 'divisions/vegas-industries',
  lubricants: 'divisions/international-lubricants-belize',
  brands: 'brands',
  wines: { en: 'wines-and-spirits', es: 'vinos-y-licores' },
  whatsNew: { en: 'whats-new', es: 'novedades' },
  gallery: 'gallery',
  products: 'products',
  network: 'sales-network',
  contact: 'contact',
};

/** Resolves a route entry, which may be one path or one path per locale. */
export const routeIn = (locale, entry) => (typeof entry === 'string' ? entry : entry[locale]);

/** The same route in every locale, for canonicals, alternates and the switch. */
export const routeAll = (entry) => ({ en: routeIn('en', entry), es: routeIn('es', entry) });

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

function head({ site, i18n, locale, title, description, outPath, path, og, extraHead = '', structuredData = [], switchPath, pageStyles, canonicalPath, forceNoindex, localePaths }) {
  const pathIn = (l) => localePaths?.[l] ?? path;
  const fullTitle = path === ROUTES.home
    ? `${i18n.site.name} | ${title}`
    : `${title} | ${i18n.site.name}`;

  // An alias page points its canonical at the page it stands in for.
  const canonical = absoluteUrl(site, locale, canonicalPath ?? pathIn(locale));
  const alternates = ['en', 'es']
    .map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(absoluteUrl(site, l, pathIn(l)))}">`)
    .join('') + `<link rel="alternate" hreflang="x-default" href="${esc(absoluteUrl(site, 'en', pathIn('en')))}">`;

  // Only the two Latin subsets actually used are preloaded; the rest load on demand.
  const preload = ['inter-400-latin.woff2', 'inter-600-latin.woff2', 'archivo-700-latin.woff2']
    .map((f) => `<link rel="preload" href="{{BASE}}assets/fonts/${f}" as="font" type="font/woff2" crossorigin>`)
    .join('');

  // Browser-language detection, inlined so it runs before first paint.
  // English is the fallback, an explicit choice always wins, and the script
  // only exists on English pages so it can never loop.
  const esHref = `{{BASE}}${routePath('es', localePaths?.es ?? switchPath ?? path)}/`;
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
    (site.noindex || forceNoindex ? `<meta name="robots" content="noindex, nofollow">` : `<meta name="robots" content="index, follow">`) +
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
    (pageStyles ?? []).map((f) => `<link rel="stylesheet" href="{{BASE}}assets/styles/${f}">`).join('') +
    structuredData.map(jsonLd).join('') +
    extraHead
  );
}

function masthead({ i18n, locale, images, current, switchPath, bodyClass, localePaths }) {
  // The What's New label is shortened to fit the bar, so it carries the full
  // wording as its accessible name. The visible text is the start of that name,
  // which is what a visitor speaking the link aloud will say.
  const items = [
    ['home', i18n.nav.home],
    ['about', i18n.nav.about],
    ['divisions', i18n.nav.divisions],
    ['brands', i18n.nav.brands],
    ['wines', i18n.nav.wines],
    ['gallery', i18n.nav.gallery],
    ['whatsNew', i18n.nav.whatsNew, i18n.nav.whatsNewFull],
    ['network', i18n.nav.salesNetwork],
    ['contact', i18n.nav.contact],
  ];

  const nav = items
    .map(([id, label, fullLabel]) => {
      const isCurrent = id === current || (id !== 'home' && current?.startsWith(id));
      return `<li><a href="${link(locale, routeIn(locale, ROUTES[id]))}"` +
        (fullLabel ? ` aria-label="${esc(fullLabel)}"` : '') +
        `${isCurrent ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;
    })
    .join('');

  // Routes are locale-independent, so the switch lands on the same page in the
  // other language — including deep routes such as /products/<brand>/.
  const langSwitch = ['en', 'es']
    .map((l) => {
      const target = localePaths?.[l] ?? switchPath ?? '';
      const label = l === 'es' ? 'ES' : 'EN';
      const full = l === 'es' ? 'Español' : 'English';
      const inner = `<span aria-hidden="true">${label}</span><span class="visually-hidden">${esc(full)}</span>`;
      // The language you are already reading is a marker, not a link: a link
      // that only jumps to the top of the page reads as broken when tapped.
      if (l === locale) return `<span aria-current="true" lang="${l}">${inner}</span>`;
      const href = `{{BASE}}${routePath(l, target)}${routePath(l, target) ? '/' : ''}`;
      return `<a href="${esc(href)}" lang="${l}" hreflang="${l}">${inner}</a>`;
    })
    .join('');

  return (
    // The campaign artwork is finished work with its own branding inside it,
    // so the header sits above the hero rather than over it. Floating the site
    // logo across the artwork's own lockup would cover the very subject the
    // slide is about.
    `<header class="masthead">` +
    `<div class="shell masthead__bar">` +
    `<a class="brand" href="${link(locale, ROUTES.home)}">` +
    picture(images.company.logo, {
      alt: i18n.site.name,
      className: 'brand__logo',
      loading: 'eager',
      fetchpriority: 'high',
      sizes: '128px',
    }) +
    `</a>` +
    // The language control stays on the top row at every width; the rest of the
    // header collapses behind the menu button on small screens.
    `<div class="lang" role="group" aria-label="${esc(i18n.nav.languageLabel)}">${langSwitch}</div>` +
    `<button class="nav-toggle" type="button" aria-expanded="false" aria-controls="masthead-panel">` +
    `<span class="nav-toggle__bars" aria-hidden="true"><i></i><i></i><i></i></span>` +
    `<span class="nav-toggle__label">${esc(i18n.nav.menu)}</span>` +
    `</button>` +
    `<div class="masthead__panel" id="masthead-panel">` +
    `<nav aria-label="${esc(i18n.nav.primaryLabel)}"><ul class="nav-list">${nav}</ul></nav>` +
    `<div class="masthead__cta">` +
    `<a class="btn btn--primary btn--sm" href="${link(locale, ROUTES.contact)}">${esc(i18n.actions.contactSales)}</a>` +
    `</div>` +
    `</div>` +
    `</div></header>`
  );
}

function footer({ site, i18n, locale, company, images }) {
  const explore = [
    ['about', i18n.nav.about],
    ['divisions', i18n.nav.divisions],
    ['brands', i18n.nav.brands],
    ['wines', i18n.nav.wines],
    ['gallery', i18n.nav.gallery],
    ['whatsNew', i18n.nav.whatsNewFull],
    ['network', i18n.nav.salesNetwork],
    ['contact', i18n.nav.contact],
  ]
    .map(([id, label]) => `<li><a href="${link(locale, routeIn(locale, ROUTES[id]))}">${esc(label)}</a></li>`)
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
    `</ul>` +
    `<h2 class="footer-social-heading">${esc(i18n.footer.socialHeading)}</h2>` +
    socialLinks({ company, i18n }) +
    `</div>` +
    `</div>` +
    `<div class="footer-note">` +
    `<span>&copy; ${year} ${esc(i18n.footer.copyright)}</span>` +
    `<a class="colophon" href="${esc(i18n.footer.colophonUrl)}"` +
    ` target="_blank" rel="noopener">${esc(i18n.footer.colophon)}</a>` +
    `</div>` +
    `</div></footer>`
  );
}

/**
 * Assembles a complete document and resolves {{BASE}} to the relative prefix
 * for this page's depth.
 */
/**
 * Back to top.
 *
 * A page long enough to lose the menu off the top gets a way back to it. The
 * control is written into every page but starts hidden, and the script shows it
 * once there is something to come back from, so a short page never carries a
 * button with nothing to do.
 */
function toTop(i18n) {
  const label = esc(i18n.actions.backToTop);
  return (
    `<button type="button" class="to-top" data-to-top hidden aria-label="${label}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path d="M12 19V6M6 12l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2"` +
    ` stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<span>${label}</span></button>`
  );
}

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
    `<main id="main">${body}${toTop(i18n)}</main>` +
    footer(ctx) +
    // Integration point: analytics. Load deferred, after consent, here.
    `<script src="{{BASE}}assets/js/site.js" defer></script>` +
    (ctx.pageScripts ?? []).map((s) => `<script src="{{BASE}}assets/js/${s}" defer></script>`).join('') +
    `</body></html>`;

  return html.replaceAll('{{BASE}}', baseFor(outPath));
}
