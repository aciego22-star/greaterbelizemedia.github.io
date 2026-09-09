/** Page bodies. One function per route; each returns { body, ... } for layout.page(). */
import { esc, picture, telLink, mailLink, t, cx } from './html.mjs';
import { ROUTES, link, absoluteUrl } from './layout.mjs';
import {
  sectionHead, crumbs, notice, brandCard, categoryCard, divisionPanel, repCard, placeholderNote, plate,
} from './partials.mjs';
import { heroCarousel } from './hero.mjs';
import { promoShowcase } from './promo.mjs';

const localeCopy = (obj, locale) => obj[locale] ?? obj.en;

/* ------------------------------------------------------------------ *
 * Home
 * ------------------------------------------------------------------ */

export function home(ctx) {
  const { i18n, locale, company, catalog, images, productArt, campaign, campaignImages, video, featured } = ctx;
  const c = i18n.home;

  // The document heading is stable; the carousel headlines are section-level,
  // so rotating slides never change the page's heading structure.
  const hero =
    `<h1 class="visually-hidden">${esc(c.pageHeading)}</h1>` +
    heroCarousel({ i18n, locale, campaign, campaignImages, video });

  /* Trust band: one horizontal row of published facts, no cards. */
  const trust =
    `<section class="trust-band"><div class="shell">` +
    `<ul class="trust-band__list">` +
    c.trust
      .map(
        (f) =>
          `<li><span class="trust-band__value">${esc(f.value)}</span>` +
          `<span class="trust-band__label">${esc(f.label)}</span></li>`
      )
      .join('') +
    `</ul></div></section>`;

  /* Featured: the promoted line as an editorial lead, two supporting entries. */
  const bop = catalog.brands.find((b) => b.slug === 'bop');
  const supporting = ['kelloggs', 'blanca'].map((key) =>
    key === 'blanca' ? null : catalog.brands.find((b) => b.slug === key)
  );

  const featuredItem = (brand, imageEntry, title, body, href) =>
    `<article class="featured__item">` +
    `<figure>${picture(imageEntry, { alt: '', sizes: '120px' })}</figure>` +
    `<div><h3><a class="stretch" href="${href}">${esc(title)}</a></h3><p>${esc(body)}</p></div>` +
    `</article>`;

  const kelloggs = catalog.brands.find((b) => b.slug === 'kelloggs');
  const industriesDivision = company.divisions.find((d) => d.slug === 'vegas-industries');

  const featuredBand =
    `<section class="band"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<p class="eyebrow">${esc(c.featuredEyebrow)}</p>` +
    `<h2>${esc(c.featuredHeading)}</h2>` +
    `<p>${esc(c.featuredLead)}</p>` +
    `</div>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.brands)}">${esc(c.categoriesAction)}</a>` +
    `</div>` +
    `<div class="featured reveal">` +
    promoShowcase({ i18n, locale, productArt, featured, company }) +
    featuredItem(
      kelloggs,
      images.brands.kelloggs?.photos?.[0],
      kelloggs.name,
      t(i18n.products.listingCount, { count: kelloggs.productCount }),
      link(locale, `${ROUTES.products}/kelloggs`)
    ) +
    featuredItem(
      null,
      images.divisions['blanca-max-1-litre'],
      industriesDivision.name,
      localeCopy(industriesDivision, locale).role,
      link(locale, ROUTES.industries)
    ) +
    `</div></div></section>`;

  /* Divisions as three visually distinct editorial bands. */
  const divisionBand = (division, variant, media, flip) => {
    const copy = localeCopy(division, locale);
    const routeKey =
      division.slug === 'vegas-industries' ? 'industries'
      : division.slug === 'international-lubricants-belize' ? 'lubricants'
      : 'products';
    const lines =
      division.productLines
        ? `<ul class="dband__lines">${division.productLines.map((l) => `<li>${esc(l[locale] ?? l.en)}</li>`).join('')}</ul>`
        : division.products
          ? `<ul class="dband__lines">${division.products.map((p) => `<li>${esc(p.name)} ${esc(locale === 'es' ? p.sizeEs : p.size)}</li>`).join('')}</ul>`
          : '';

    return (
      `<section class="dband dband--${variant}${flip ? ' dband--flip' : ''} reveal">` +
      `<div class="shell dband__inner">` +
      `<div class="dband__content">` +
      (division.logo && images.divisions[division.logo.replace(/\.[a-z]+$/, '')]
        ? `<span class="dband__mark plate" style="padding:0.5rem 0.7rem">${picture(images.divisions[division.logo.replace(/\.[a-z]+$/, '')], { alt: division.name, sizes: '150px' })}</span>`
        : '') +
      `<p class="dband__label">${esc(copy.role)}</p>` +
      `<h3>${esc(division.name)}</h3>` +
      `<div class="dband__body"><p>${esc(copy.summary)}</p></div>` +
      lines +
      `<div class="actions"><a class="btn ${variant === 'industries' ? 'btn--dark' : 'btn--onDark'}" href="${link(locale, ROUTES[routeKey])}">${esc(routeKey === 'products' ? i18n.actions.viewProducts : i18n.actions.readMore)}</a></div>` +
      `</div>` +
      `<div class="dband__media">${media}</div>` +
      `</div></section>`
    );
  };

  const parent = company.divisions.find((d) => d.slug === 'vegas-distributors');
  const industries = company.divisions.find((d) => d.slug === 'vegas-industries');
  const lubricants = company.divisions.find((d) => d.slug === 'international-lubricants-belize');

  const divisions =
    `<section class="band band--tight"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<p class="eyebrow">${esc(c.divisionsEyebrow)}</p>` +
    `<h2>${esc(c.divisionsHeading)}</h2>` +
    `<p>${esc(c.divisionsLead)}</p>` +
    `</div>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.divisions)}">${esc(c.divisionsCta)}</a>` +
    `</div></div>` +
    divisionBand(
      parent, 'parent',
      `<div class="dband__products">` +
      plate(images.brands.pringles?.photos?.[0], { sizes: '(max-width: 60rem) 45vw, 210px' }) +
      plate(images.brands.oreo?.photos?.[0], { sizes: '(max-width: 60rem) 45vw, 210px' }) +
      `</div>`,
      false
    ) +
    divisionBand(
      industries, 'industries',
      `<div class="dband__products">` +
      plate(images.divisions['blanca-max-1-litre'], { alt: 'Blanca Max bleach, 1 litre bottle', sizes: '(max-width: 60rem) 42vw, 200px' }) +
      plate(images.divisions['blanca-max-half-litre'], { alt: 'Blanca Max bleach, half litre bottle', sizes: '(max-width: 60rem) 42vw, 200px' }) +
      `</div>`,
      true
    ) +
    divisionBand(
      lubricants, 'lubricants',
      plate(images.divisions['international-lubricants-chevron-artwork'], { alt: 'Chevron lubricants artwork published by International Lubricants of Belize' }),
      false
    );

  /* Product discovery: four visual categories, then a compact enquiry band. */
  const withCounts = catalog.categories.map((cat) => ({
    cat,
    brands: catalog.brands.filter((b) => b.categories.includes(cat.id)),
  }));
  const visual = withCounts.filter((x) => x.brands.length);
  const enquiryOnly = withCounts.filter((x) => !x.brands.length);

  const categories =
    `<section class="band band--sunken"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<p class="eyebrow">${esc(c.categoriesEyebrow)}</p>` +
    `<h2>${esc(c.categoriesHeading)}</h2>` +
    `<p>${esc(c.categoriesLead)}</p>` +
    `</div></div>` +
    `<ul class="categories reveal">` +
    visual
      .map(({ cat, brands }) => categoryCard({ category: cat, count: brands.length, brands, images, i18n, locale }))
      .join('') +
    `</ul>` +
    `<div class="enquiry-band">` +
    `<div><h3>${esc(c.categoriesEnquiryHeading)}</h3><p>${esc(c.categoriesEnquiryBody)}</p></div>` +
    `<ul class="enquiry-band__links">` +
    enquiryOnly
      .map(
        ({ cat }) =>
          `<li><a href="${link(locale, ROUTES.contact)}">${esc(cat[locale] ?? cat.en)}</a></li>`
      )
      .join('') +
    `</ul>` +
    `</div>` +
    `</div></section>`;

  /* Sales gateway: coverage at a glance, detail lives on its own page. */
  const gateway =
    `<section class="band"><div class="shell gateway reveal">` +
    `<div>` +
    `<p class="eyebrow">${esc(c.gatewayEyebrow)}</p>` +
    `<h2>${esc(c.gatewayHeading)}</h2>` +
    `<p class="lead" style="margin-top:1rem">${esc(c.gatewayLead)}</p>` +
    `<div class="actions" style="margin-top:1.75rem">` +
    `<a class="btn btn--primary btn--lg" href="${link(locale, ROUTES.network)}">${esc(c.gatewayAction)}</a>` +
    `</div></div>` +
    `<ul class="region-list">` +
    company.regions
      .map((region) => {
        const n = company.territories.filter((tt) => tt.region === region.id).length;
        if (!n) return '';
        return (
          `<li><span class="region-list__name">${esc(region[locale] ?? region.en)}</span>` +
          `<span class="region-list__count">${esc(n === 1 ? i18n.network.territoryCountOne : t(i18n.network.territoryCount, { count: n }))}</span></li>`
        );
      })
      .join('') +
    `</ul>` +
    `</div></section>`;

  const cta =
    `<section class="band cta-band"><div class="shell cta-grid">` +
    `<div>` +
    `<p class="eyebrow">${esc(i18n.nav.contact)}</p>` +
    `<h2>${esc(c.ctaHeading)}</h2>` +
    `<p class="lead">${esc(c.ctaLead)}</p>` +
    `</div>` +
    `<ul class="cta-options">` +
    c.ctaOptions
      .map((o) => {
        const key = o.href === '/products' ? ROUTES.brands : o.href === '/sales-network' ? ROUTES.network : ROUTES.contact;
        return `<li><a class="cta-option" href="${link(locale, key)}"><span><strong>${esc(o.title)}</strong><span>${esc(o.body)}</span></span></a></li>`;
      })
      .join('') +
    `</ul>` +
    `</div></section>`;

  // Only the first slide is preloaded, and only the cut this viewport will
  // actually use, so a phone never fetches the landscape artwork to throw it
  // away. Slides two to four stay lazy.
  const firstArt = campaign.slides[0].art;
  const preloadFor = (id) =>
    campaignImages[id].avif.map((s) => `{{BASE}}assets/campaign/${s.file} ${s.width}w`).join(', ');
  const preload = [
    ['(max-width: 47.999rem)', preloadFor(firstArt.mobile)],
    ['(min-width: 48rem)', preloadFor(firstArt.desktop)],
  ]
    .map(
      ([media, srcset]) =>
        `<link rel="preload" as="image" type="image/avif" media="${media}"` +
        ` imagesrcset="${srcset}" imagesizes="100vw" fetchpriority="high">`
    )
    .join('');

  return {
    body: hero + trust + featuredBand + divisions + categories + gateway + cta,
    bodyClass: 'home',
    pageStyles: ['hero.css'],
    extraHead: preload,
    pageScripts: ['hero.js', 'promo.js'],
  };
}

/* ------------------------------------------------------------------ *
 * About
 * ------------------------------------------------------------------ */

export function about(ctx) {
  const { i18n, locale, company, images } = ctx;
  const c = i18n.about;

  const history = company.history
    .map(
      (h) =>
        `<li><span class="timeline__year">${esc(h.year)}</span>` +
        `<div class="timeline__body"><p>${esc(localeCopy(h, locale))}</p>` +
        `</div></li>`
    )
    .join('');

  const values = company.values
    .map(
      (v) =>
        `<li><strong>${esc(v[locale] ?? v.en)}</strong><span>${esc(c.valueDetail[v.id])}</span></li>`
    )
    .join('');

  const management =
    `<div class="table-wrap"><table class="products table--people">` +
    `<thead><tr><th scope="col">${esc(c.tableArea)}</th><th scope="col">${esc(c.tableName)}</th><th scope="col">${esc(c.tableEmail)}</th></tr></thead>` +
    `<tbody>` +
    company.management
      .map(
        (m) =>
          `<tr><td>${esc(m.area[locale] ?? m.area.en)}</td><td>${esc(m.name)}</td>` +
          `<td><a href="mailto:${esc(m.email)}">${esc(m.email)}</a></td></tr>`
      )
      .join('') +
    `</tbody></table></div>`;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.about }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell split split--wide-first">` +
    `<div><h2>${esc(c.historyHeading)}</h2><ul class="timeline" style="margin-top:1.5rem">${history}</ul></div>` +
    `<div class="stack" style="--stack-gap:1.25rem">` +
    `<div class="panel"><h3>${esc(c.visionHeading)}</h3><p>${esc(localeCopy(company.vision, locale))}</p></div>` +
    `<div class="panel"><h3>${esc(c.missionHeading)}</h3><p>${esc(localeCopy(company.mission, locale))}</p>` +
    `</div>` +
    `</div></div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    sectionHead({ heading: c.valuesHeading, lead: c.valuesLead }) +
    `<ul class="value-list reveal" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr))">${values}</ul>` +
    `</div></section>` +
    `<section class="band"><div class="shell split">` +
    `<div><h2>${esc(c.sourcingHeading)}</h2><p class="lead" style="margin-top:1rem">${esc(c.sourcingLead)}</p>` +
    `<h3 style="margin-top:1.75rem;font-size:1rem">${esc(c.importList)}</h3>` +
    `<ul class="chips" style="margin-top:0.75rem">` +
    company.publishedCatalogueCategories.map((k) => `<li class="chip">${esc(k)}</li>`).join('') +
    `</ul></div>` +
    `<div>${placeholderNote({ heading: c.managementHeading, body: c.managementLead })}</div>` +
    `</div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    sectionHead({ heading: c.managementHeading, lead: c.managementLead }) +
    management +
    `</div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * Divisions overview
 * ------------------------------------------------------------------ */

export function divisions(ctx) {
  const { i18n, locale, company, images } = ctx;
  const c = i18n.divisions;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.divisions }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">` +
    company.divisions
      .map((d, i) => divisionPanel({ division: d, i18n, locale, images, flip: i % 2 === 1, level: 2 }))
      .join('') +
    `</div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * Vega's Industries
 * ------------------------------------------------------------------ */

export function industries(ctx) {
  const { i18n, locale, company, images } = ctx;
  const c = i18n.divisions;
  const d = company.divisions.find((x) => x.slug === 'vegas-industries');
  const copy = localeCopy(d, locale);

  const portfolio = d.products
    .map(
      (p) =>
        `<figure class="tile tile--product tile--captioned">` +
        picture(images.divisions[p.image.replace(/\.[a-z]+$/, '')], {
          alt: `${p.name} ${locale === 'es' ? p.sizeEs : p.size}`,
          sizes: '(max-width: 48rem) 45vw, 280px',
        }) +
        `<figcaption class="tile__caption">${esc(p.name)} · ${esc(locale === 'es' ? p.sizeEs : p.size)}</figcaption>` +
        `</figure>`
    )
    .join('');

  const body =
    crumbs({
      i18n, locale,
      trail: [
        { label: i18n.nav.home, href: link(locale, ROUTES.home) },
        { label: i18n.nav.divisions, href: link(locale, ROUTES.divisions) },
        { label: d.name },
      ],
    }) +
    `<section class="page-head"><div class="shell">` +
    `<span class="division__mark">${picture(images.divisions['blanca-max-logo'], { alt: 'Blanca Max', sizes: '160px' })}</span>` +
    `<hr class="rule"><h1>${esc(d.name)}</h1>` +
    `<p class="lead">${esc(copy.tagline)}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell split">` +
    `<div><h2>${esc(c.portfolioHeading)}</h2>` +
    `<div class="division__media" style="margin-top:1.5rem">${portfolio}</div></div>` +
    `<div class="stack" style="--stack-gap:1.25rem">` +
    `<div><h2>${esc(c.missionHeading)}</h2><p style="margin-top:0.85rem">${esc(copy.mission)}</p></div>` +
    `<div class="panel"><h3>${esc(c.aboutBleachHeading)}</h3><p>${esc(copy.explainer)}</p></div>` +
    `<div class="actions"><a class="btn btn--primary" href="${link(locale, ROUTES.contact)}">${esc(i18n.actions.enquire)}</a></div>` +
    `</div></div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    `<h2>${esc(c.contactDivision)}</h2>` +
    `<ul class="rep-grid" style="margin-top:1.25rem"><li class="rep">` +
    `<p class="rep__territory">${esc(d.name)}</p>` +
    `<div class="rep__actions">` +
    d.contact.phones.map((p) => telLink(p, p)).join('') +
    mailLink(d.contact.email) +
    `</div></li></ul>` +
    `</div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * International Lubricants of Belize
 * ------------------------------------------------------------------ */

export function lubricants(ctx) {
  const { i18n, locale, company, images } = ctx;
  const c = i18n.divisions;
  const d = company.divisions.find((x) => x.slug === 'international-lubricants-belize');
  const copy = localeCopy(d, locale);
  const ilbRep = company.territories.find((tt) => tt.division === d.slug);

  const list = (items) => `<ul class="chips">${items.map((x) => `<li class="chip chip--accent">${esc(x[locale] ?? x.en)}</li>`).join('')}</ul>`;

  const body =
    crumbs({
      i18n, locale,
      trail: [
        { label: i18n.nav.home, href: link(locale, ROUTES.home) },
        { label: i18n.nav.divisions, href: link(locale, ROUTES.divisions) },
        { label: d.name },
      ],
    }) +
    `<section class="page-head"><div class="shell">` +
    `<span class="division__mark">${picture(images.divisions['international-lubricants-logo'], { alt: d.name, sizes: '160px' })}</span>` +
    `<hr class="rule"><h1>${esc(d.name)}</h1>` +
    `<p class="lead">${esc(copy.tagline)} ${esc(copy.summary)}</p>` +
    `</div></section>` +
    `<section class="band band--tight division division--lubricants" style="border:0"><div class="shell split">` +
    `<div class="stack" style="--stack-gap:1.75rem">` +
    `<div><h2>${esc(c.productLinesHeading)}</h2>${list(d.productLines)}</div>` +
    `<div><h2>${esc(c.applicationsHeading)}</h2>${list(d.applications)}</div>` +
    `<div><h2>${esc(c.orderFormatsHeading)}</h2><p>${esc(c.orderFormatsLead)}</p>${list(d.orderFormats)}</div>` +
    `<div class="actions"><a class="btn btn--primary" href="${link(locale, ROUTES.contact)}">${esc(i18n.actions.contactSales)}</a></div>` +
    `</div>` +
    `<div class="stack" style="--stack-gap:1.25rem">` +
    plate(images.divisions['international-lubricants-chevron-artwork'], { alt: 'Chevron lubricants artwork published by International Lubricants of Belize' }) +
    `<div class="panel"><h3>${esc(c.chevronHeading)}</h3><p>${esc(copy.chevronNote)}</p></div>` +
    `</div>` +
    `</div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    `<h2>${esc(c.contactDivision)}</h2>` +
    `<ul class="rep-grid" style="margin-top:1.25rem">` +
    `<li class="rep"><p class="rep__territory">${esc(d.shortName ?? d.name)}</p>` +
    `<div class="rep__actions">${d.contact.phones.map((p) => telLink(p, p)).join('')}${mailLink(d.contact.email)}</div></li>` +
    (ilbRep ? repCard({ territory: ilbRep, i18n, locale }) : '') +
    `</ul></div></section>`;

  return { body };
}
