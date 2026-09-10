/**
 * Generates the static site into dist/.
 *
 * Every route is a real directory with its own index.html, so there is no
 * client-side router and no redirect rules are needed for direct visits or
 * refreshes. All asset and link references are relative, so the output works
 * from a domain root, a subdirectory, or the filesystem.
 *
 * Usage: node scripts/build.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { ROUTES, routeIn, routeAll, routePath, absoluteUrl, page } from './lib/layout.mjs';
import * as core from './lib/pages.mjs';
import * as cat from './lib/pages-catalog.mjs';
import { galleryPage } from './lib/gallery.mjs';
import { whatsNewPage } from './lib/pages-whats-new.mjs';
import { winesPage } from './lib/pages-wines.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const read = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));

const site = read('data/site.json');
const company = read('data/company.json');
const catalog = read('data/catalog.json');
const images = read('data/images.json');
const productArt = read('data/product-art.json');
const campaign = read('data/campaign.json');
const campaignImages = read('data/campaign-images.json');
const divisionArt = read('data/division-images.json');
const video = read('data/video.json');
const whatsNew = read('data/whats-new.json');
const whatsNewImages = read('data/whats-new-images.json');
const wines = read('data/wines-and-spirits.json');
const featured = read('data/featured.json');
const gallery = read('data/gallery.json');
const galleryImages = read('data/gallery-images.json');
const locales = { en: read('i18n/en.json'), es: read('i18n/es.json') };

const LOCALES = ['en', 'es'];

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

const written = [];

function writePage(outPath, html) {
  const dir = outPath ? join(DIST, outPath) : DIST;
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
  written.push(outPath ? `${outPath}/index.html` : 'index.html');
}

/* ------------------------------------------------------------------ *
 * Structured data — verified fields only.
 * No Product schema: the source carries no price, SKU, rating or availability,
 * and inventing those is explicitly out of bounds.
 * ------------------------------------------------------------------ */

const organizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: company.legalName,
  url: site.siteUrl,
  logo: `${site.siteUrl}/assets/images/company/vegas-logo-318.png`,
  slogan: company.tagline,
  foundingDate: String(company.foundedYear),
  founder: { '@type': 'Person', name: company.founder },
  address: {
    '@type': 'PostalAddress',
    streetAddress: company.address.street,
    addressLocality: company.address.town,
    addressRegion: company.address.district,
    addressCountry: 'BZ',
  },
  email: company.email,
  telephone: company.phones,
  sameAs: [company.facebook],
  subOrganization: company.divisions.map((d) => ({ '@type': 'Organization', name: d.name })),
});

const breadcrumbSchema = (locale, trail) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: trail.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: absoluteUrl(site, locale, item.path),
  })),
});

/* ------------------------------------------------------------------ *
 * Route rendering
 * ------------------------------------------------------------------ */

for (const locale of LOCALES) {
  const i18n = locales[locale];
  const base = { site, i18n, locale, company, catalog, images, productArt, campaign, campaignImages,
    divisionArt, video, whatsNew, whatsNewImages, wines, featured, gallery, galleryImages };

  const render = (key, route, meta, result, structuredData = []) => {
    // A route is either one path shared by both languages or one path per
    // language; the alternates and the language switch need to know which.
    const path = routeIn(locale, route);
    const localePaths = typeof route === 'string' ? undefined : routeAll(route);
    const outPath = routePath(locale, path);
    writePage(
      outPath,
      page({
        ...base,
        current: key,
        path,
        localePaths,
        outPath,
        title: meta.title,
        description: meta.description,
        canonicalPath: result.canonicalPath,
        forceNoindex: result.noindex,
        structuredData,
        body: result.body,
        bodyClass: result.bodyClass,
        pageStyles: result.pageStyles,
        extraHead: result.extraHead,
        pageScripts: result.pageScripts,
      })
    );
  };

  const crumbTrail = (...parts) => [{ name: i18n.nav.home, path: ROUTES.home }, ...parts];

  render('home', ROUTES.home, i18n.home, core.home(base), [organizationSchema()]);

  render('about', ROUTES.about, i18n.about, core.about(base), [
    breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.about, path: ROUTES.about })),
  ]);

  render('divisions', ROUTES.divisions, i18n.divisions, core.divisions(base), [
    breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.divisions, path: ROUTES.divisions })),
  ]);

  render(
    'industries', ROUTES.industries,
    { title: i18n.divisions.industriesTitle, description: i18n.divisions.industriesDescription },
    core.industries(base),
    [breadcrumbSchema(locale, crumbTrail(
      { name: i18n.nav.divisions, path: ROUTES.divisions },
      { name: i18n.divisions.industriesTitle, path: ROUTES.industries }
    ))]
  );

  render(
    'lubricants', ROUTES.lubricants,
    { title: i18n.divisions.lubricantsTitle, description: i18n.divisions.lubricantsDescription },
    core.lubricants(base),
    [breadcrumbSchema(locale, crumbTrail(
      { name: i18n.nav.divisions, path: ROUTES.divisions },
      { name: i18n.divisions.lubricantsTitle, path: ROUTES.lubricants }
    ))]
  );

  render('brands', ROUTES.brands, i18n.brands, cat.brands(base), [
    breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.brands, path: ROUTES.brands })),
  ]);

  render('wines', ROUTES.wines,
    { title: i18n.wines.title, description: i18n.wines.description },
    winesPage(base),
    [breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.wines, path: routeIn(locale, ROUTES.wines) }))]);

  render('whatsNew', ROUTES.whatsNew,
    { title: i18n.whatsNew.title, description: i18n.whatsNew.description },
    whatsNewPage(base),
    [breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.whatsNewFull, path: routeIn(locale, ROUTES.whatsNew) }))]);

  render('gallery', ROUTES.gallery,
    { title: i18n.gallery.title, description: i18n.gallery.description },
    galleryPage(base),
    [breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.gallery, path: ROUTES.gallery }))]);

  // Anyone holding the old address still lands on the brand directory.
  render('brands', ROUTES.products,
    { title: i18n.brands.aliasTitle, description: i18n.brands.aliasDescription },
    cat.productsAlias(base));

  for (const b of catalog.brands) {
    const path = `${ROUTES.products}/${b.slug}`;
    const categoryName =
      catalog.categories.find((x) => x.id === b.category)?.[locale] ?? b.category;
    const description =
      locale === 'es'
        ? `${b.name} en Belice: ${b.productCount} productos en la categoría ${categoryName}, distribuidos por Vega's Distributors.`
        : `${b.name} in Belize: ${b.productCount} products in ${categoryName}, distributed nationwide by Vega's Distributors.`;

    render('brands', path, { title: b.name, description }, cat.brand({ ...base, brand: b }), [
      breadcrumbSchema(locale, crumbTrail(
        { name: i18n.nav.brands, path: ROUTES.brands },
        { name: b.name, path }
      )),
    ]);
  }

  render('network', ROUTES.network, i18n.network, cat.network(base), [
    breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.salesNetwork, path: ROUTES.network })),
  ]);

  render('contact', ROUTES.contact, i18n.contact, cat.contact(base), [
    breadcrumbSchema(locale, crumbTrail({ name: i18n.nav.contact, path: ROUTES.contact })),
  ]);
}

/* ------------------------------------------------------------------ *
 * Error page — Netlify serves /404.html for unmatched paths.
 * ------------------------------------------------------------------ */
{
  const locale = 'en';
  const i18n = locales[locale];
  const result = cat.notFound({ site, i18n, locale, company, catalog, images, productArt, campaign, gallery, galleryImages });
  const html = page({
    site, i18n, locale, company, catalog, images,
    current: null,
    path: '404',
    // Rendered as if it sits at the root so its relative asset paths resolve
    // from any URL depth the visitor happened to mistype.
    outPath: '',
    title: i18n.notFound.title,
    description: i18n.notFound.description,
    body: result.body,
  });
  writeFileSync(join(DIST, '404.html'), html);
  written.push('404.html');
}

/* ------------------------------------------------------------------ *
 * Assets
 * ------------------------------------------------------------------ */

mkdirSync(join(DIST, 'assets'), { recursive: true });
cpSync(join(ROOT, 'src', 'styles'), join(DIST, 'assets', 'styles'), { recursive: true });
cpSync(join(ROOT, 'src', 'js'), join(DIST, 'assets', 'js'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'fonts'), join(DIST, 'assets', 'fonts'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'images'), join(DIST, 'assets', 'images'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'product-art'), join(DIST, 'assets', 'product-art'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'gallery'), join(DIST, 'assets', 'gallery'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'campaign'), join(DIST, 'assets', 'campaign'), { recursive: true });
cpSync(join(ROOT, 'src', 'assets', 'whats-new'), join(DIST, 'assets', 'whats-new'), { recursive: true });
// The owner's original stays in src; only the web derivatives are published.
cpSync(join(ROOT, 'src', 'assets', 'video'), join(DIST, 'assets', 'video'), { recursive: true });

/* ------------------------------------------------------------------ *
 * sitemap.xml, robots.txt, Netlify config
 * ------------------------------------------------------------------ */

// The /products/ alias is deliberately absent: it redirects to /brands/.
// Entries are route definitions, so the two routes whose path differs by
// language carry the right URL and the right alternates in each locale.
const routeList = [
  ROUTES.home, ROUTES.about, ROUTES.divisions, ROUTES.industries, ROUTES.lubricants,
  ROUTES.brands, ROUTES.wines, ROUTES.whatsNew, ROUTES.gallery,
  ...catalog.brands.map((b) => `${ROUTES.products}/${b.slug}`),
  ROUTES.network, ROUTES.contact,
];

const today = new Date().toISOString().slice(0, 10);

const sitemap =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  LOCALES.flatMap((locale) =>
    routeList.map((route) => {
      const path = routeIn(locale, route);
      const alternates = LOCALES.map(
        (l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(site, l, routeIn(l, route))}"/>`
      ).join('\n');
      const priority = path === ROUTES.home ? '1.0' : path.includes('/') ? '0.6' : '0.8';
      return (
        `  <url>\n    <loc>${absoluteUrl(site, locale, path)}</loc>\n` +
        `${alternates}\n` +
        `    <lastmod>${today}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
      );
    })
  ).join('\n') +
  `\n</urlset>\n`;

writeFileSync(join(DIST, 'sitemap.xml'), sitemap);

// robots.txt follows the same flag as the noindex meta tag, so a preview host
// can never be indexed by accident.
const robots = site.noindex
  ? `# Concept build. Indexing is disabled until the business approves a launch.\n` +
    `# Flip "noindex" to false in data/site.json to publish the directives below.\n` +
    `User-agent: *\nDisallow: /\n`
  : `User-agent: *\nAllow: /\n\nSitemap: ${site.siteUrl}/sitemap.xml\n`;

writeFileSync(join(DIST, 'robots.txt'), robots);

writeFileSync(
  join(DIST, '_redirects'),
  `# The brand directory moved to /brands/. The static pages at /products/ and\n` +
    `# /es/products/ carry the same redirect for hosts that ignore this file.\n` +
    `/products/    /brands/       301!\n/es/products/ /es/brands/    301!\n`
);

writeFileSync(
  join(DIST, '_headers'),
  `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n\n` +
    `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n` +
    `  X-Frame-Options: SAMEORIGIN\n`
);

writeFileSync(
  join(DIST, 'netlify.toml'),
  `# Static multi-page output: every route is a real directory with its own\n` +
    `# index.html, so no SPA redirect rule is required. Unmatched paths fall\n` +
    `# through to 404.html, which Netlify serves automatically.\n\n` +
    `[build]\n  publish = "."\n\n` +
    `[[headers]]\n  for = "/assets/*"\n  [headers.values]\n    Cache-Control = "public, max-age=31536000, immutable"\n\n` +
    `[[headers]]\n  for = "/*"\n  [headers.values]\n    X-Content-Type-Options = "nosniff"\n    Referrer-Policy = "strict-origin-when-cross-origin"\n    X-Frame-Options = "SAMEORIGIN"\n`
);

/* ------------------------------------------------------------------ */

const dirSize = (dir) =>
  readdirSync(dir, { withFileTypes: true }).reduce((n, e) => {
    const p = join(dir, e.name);
    return n + (e.isDirectory() ? dirSize(p) : statSync(p).size);
  }, 0);

console.log(`Pages:    ${written.length}`);
console.log(`Locales:  ${LOCALES.join(', ')}`);
console.log(`Brands:   ${catalog.brands.length} x ${LOCALES.length}`);
console.log(`Output:   ${DIST}`);
console.log(`Size:     ${(dirSize(DIST) / 1024 / 1024).toFixed(1)} MB`);
