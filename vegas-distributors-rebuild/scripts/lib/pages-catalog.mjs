/** Brands directory, brand detail, sales network, contact and error routes. */
import { esc, picture, telLink, mailLink, t } from './html.mjs';
import { ROUTES, link, absoluteUrl } from './layout.mjs';
import { sectionHead, crumbs, brandCard, categoryCard, repCard, plate, socialLinks } from './partials.mjs';
import { belizeMap } from './sales-map.mjs';

const categoryLabel = (catalog, id, locale) => {
  const c = catalog.categories.find((x) => x.id === id);
  return c ? c[locale] ?? c.en : id;
};

const divisionLabel = (company, slug) => company.divisions.find((x) => x.slug === slug)?.name ?? slug;

/** A direct email action carrying a useful subject line. */
const mailto = (email, subject) =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}`.replace(/&/g, '&amp;');

/* ------------------------------------------------------------------ *
 * Brands directory
 * ------------------------------------------------------------------ */

export function brands(ctx) {
  const { i18n, locale, catalog, company, images, gallery, galleryImages } = ctx;
  const c = i18n.brands;

  const categoryOptions = catalog.categories
    .map((cat) => {
      const n = catalog.brands.filter((b) => b.categories.includes(cat.id)).length;
      return n ? `<option value="${esc(cat.id)}">${esc(cat[locale] ?? cat.en)} (${n})</option>` : '';
    })
    .join('');

  // Featured is limited to brands that have approved artwork behind them.
  const featuredSlugs = ['bop', 'kelloggs', 'zafari', 'kerns', 'pringles', 'nutella'];
  const featured = featuredSlugs
    .map((slug) => catalog.brands.find((b) => b.slug === slug))
    .filter(Boolean);

  const featuredRow =
    `<ul class="feature-row">` +
    featured
      .map((b) => {
        const shot = gallery.items.find((g) => g.brand === b.slug);
        const img = shot ? galleryImages[shot.id] : images.brands[b.slug]?.photos?.[0];
        return (
          `<li class="feature-card">` +
          `<div class="feature-card__media">${picture(img, { alt: '', sizes: '(max-width: 60rem) 45vw, 260px' })}</div>` +
          `<div class="feature-card__body">` +
          `<h3><a class="stretch" href="${link(locale, `${ROUTES.products}/${b.slug}`)}">${esc(b.name)}</a></h3>` +
          `<p>${esc(categoryLabel(catalog, b.category, locale))}</p>` +
          `</div></li>`
        );
      })
      .join('') +
    `</ul>`;

  // Ids are scoped per locale so both language directories can coexist in one
  // document, which the review preview needs and the site never breaks on.
  const uid = locale === 'en' ? '' : `-${locale}`;

  const filters =
    `<div class="filters" role="search" aria-labelledby="filters-heading${uid}">` +
    `<h3 class="visually-hidden" id="filters-heading${uid}">${esc(c.searchLabel)}</h3>` +
    `<div class="filter-row filter-row--two">` +
    `<div class="field">` +
    `<label for="brand-search${uid}">${esc(c.searchLabel)}</label>` +
    `<input type="search" id="brand-search${uid}" name="q" placeholder="${esc(c.searchPlaceholder)}" autocomplete="off" spellcheck="false">` +
    `</div>` +
    `<div class="field">` +
    `<label for="brand-category${uid}">${esc(c.categoryLabel)}</label>` +
    `<select id="brand-category${uid}" name="category"><option value="">${esc(c.allCategories)}</option>${categoryOptions}</select>` +
    `</div>` +
    `</div>` +
    `<div class="filter-meta">` +
    `<p data-result-count role="status" data-template="${esc(c.resultsCount)}" data-template-one="${esc(c.resultsCountOne)}">` +
    `${esc(t(c.resultsCount, { count: catalog.brands.length }))}</p>` +
    `<button class="btn btn--ghost btn--sm" type="button" data-clear-filters>${esc(c.clearFilters)}</button>` +
    `</div>` +
    `</div>`;

  const grid =
    `<ul class="brand-grid" data-brand-grid>` +
    catalog.brands
      .map((brand) =>
        brandCard({ brand, images, i18n, locale, category: categoryLabel(catalog, brand.category, locale) })
      )
      .join('') +
    `</ul>` +
    `<div class="empty-state" data-no-results hidden>` +
    `<h3>${esc(c.noResultsHeading)}</h3>` +
    `<p>${esc(c.noResultsBody)}</p>` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.contact)}">${esc(i18n.actions.contactSales)}</a>` +
    `</div>`;

  const body =
    `<section class="page-hero">` +
    `<div class="shell">` +
    `<p class="eyebrow">${esc(i18n.nav.brands)}</p>` +
    `<h1>${esc(c.heading)}</h1>` +
    `<p class="lead">${esc(c.lead)}</p>` +
    `<p class="page-hero__note">${esc(t(i18n.brands.productCount, { count: catalog.totals.products }))} &middot; ` +
    `${esc(t(c.resultsCount, { count: catalog.totals.brands }))}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<h2>${esc(c.featuredHeading)}</h2><p>${esc(c.featuredLead)}</p>` +
    `</div></div>` +
    featuredRow +
    `</div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text"><h2>${esc(c.directoryHeading)}</h2></div></div>` +
    `<div data-brand-directory>` + filters + grid + `</div>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell cta-inline">` +
    `<div><h2>${esc(c.inquiryHeading)}</h2><p class="lead">${esc(c.inquiryBody)}</p></div>` +
    `<div class="actions">` +
    `<a class="btn btn--primary btn--lg" href="${mailto(company.email, i18n.contact.emailSubject)}">${esc(i18n.actions.emailUs)}</a>` +
    `<a class="btn btn--outline btn--lg" href="${link(locale, ROUTES.network)}">${esc(i18n.actions.findYourRep)}</a>` +
    `</div></div></section>`;

  return { body, pageScripts: ['catalog.js'] };
}

/* ------------------------------------------------------------------ *
 * Brand detail
 * ------------------------------------------------------------------ */

export function brand(ctx) {
  const { i18n, locale, catalog, company, images, brand: b } = ctx;
  const c = i18n.brand;
  const img = images.brands[b.slug];

  const tables = b.sections
    .map((section) => {
      const caption = section.label ?? c.sectionUngrouped;
      return (
        `<div class="table-wrap"><table class="products">` +
        `<caption>${esc(caption)}</caption>` +
        `<thead><tr><th scope="col">${esc(c.productName)}</th><th scope="col">${esc(c.productSize)}</th></tr></thead>` +
        `<tbody>` +
        section.products.map((p) => `<tr><td>${esc(p.name)}</td><td class="size">${esc(p.size)}</td></tr>`).join('') +
        `</tbody></table></div>`
      );
    })
    .join('');

  const gallery = (img?.photos ?? [])
    .slice(0, 4)
    .map((p) => {
      const widest = p.fallback[p.fallback.length - 1].width;
      return (
        `<div class="tile" style="max-width:${widest}px">${picture(p, {
          alt: p.alt ? `${b.name}: ${p.alt}` : `${b.name} product artwork`,
          sizes: `(max-width: 48rem) 90vw, ${widest}px`,
        })}</div>`
      );
    })
    .join('');

  const related = b.related
    .map((slug) => catalog.brands.find((x) => x.slug === slug))
    .filter(Boolean)
    .map((r) => `<li><a href="${link(locale, `${ROUTES.products}/${r.slug}`)}">${esc(r.name)}</a></li>`)
    .join('');

  const subject = `${b.name} enquiry`;

  const body =
    crumbs({
      i18n, locale,
      trail: [
        { label: i18n.nav.home, href: link(locale, ROUTES.home) },
        { label: i18n.nav.brands, href: link(locale, ROUTES.brands) },
        { label: b.name },
      ],
    }) +
    `<section class="page-head"><div class="shell brand-hero">` +
    `<div>` +
    (img?.logo ? `<span class="brand-hero__mark">${picture(img.logo, { alt: b.name, sizes: '180px', loading: 'eager' })}</span>` : '') +
    `<h1>${esc(b.name)}</h1>` +
    `<ul class="chips" style="margin-top:1rem">` +
    `<li class="chip">${esc(categoryLabel(catalog, b.category, locale))}</li>` +
    `<li class="chip">${esc(divisionLabel(company, b.division))}</li>` +
    `<li class="chip">${esc(t(i18n.brands.productCount, { count: b.productCount }))}</li>` +
    `</ul>` +
    `<div class="actions" style="margin-top:1.5rem">` +
    `<a class="btn btn--primary" href="${mailto(company.email, subject)}">${esc(i18n.actions.enquire)}</a>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.brands)}">${esc(i18n.actions.backToProducts)}</a>` +
    `</div>` +
    `</div>` +
    `<div class="brand-gallery">${gallery}</div>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<h2>${esc(c.productsHeading)}</h2>` +
    `<p>${esc(c.availability)}</p>` +
    `</div></div>` +
    tables +
    `</div></section>` +
    (related
      ? `<section class="band band--sunken band--tight"><div class="shell">` +
        `<h2>${esc(c.relatedHeading)}</h2><ul class="related" style="margin-top:1.1rem">${related}</ul>` +
        `</div></section>`
      : '') +
    `<section class="band cta-band band--tight"><div class="shell cta-grid">` +
    `<div><h2>${esc(c.ctaHeading)}</h2><p class="lead">${esc(c.ctaBody)}</p></div>` +
    `<ul class="cta-options">` +
    `<li><a class="cta-option" href="${link(locale, ROUTES.network)}"><span><strong>${esc(i18n.actions.findYourRep)}</strong>` +
    `<span>${esc(t(i18n.network.territoryCount, { count: company.territories.length }))}</span></span></a></li>` +
    `<li><a class="cta-option" href="${mailto(company.email, subject)}"><span><strong>${esc(i18n.actions.emailUs)}</strong>` +
    `<span>${esc(company.email)}</span></span></a></li>` +
    `</ul></div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * Sales network
 * ------------------------------------------------------------------ */

export function network(ctx) {
  const { i18n, locale, company } = ctx;
  const c = i18n.network;

  /* Coverage by district.
   *
   * Every representative is written into the page as a complete card, which is
   * what a browser running no script shows: the same nine people, the same
   * telephone numbers and addresses, grouped by region exactly as before. The
   * script marks the section ready, and that is what folds the cards down to
   * one and puts the map in charge of which is showing. Nothing here depends
   * on the script arriving. */

  const place = (territory) => territory.mapPlace?.[locale] ?? territory.mapPlace?.en ?? '';

  const repPanel = (territory, index) =>
    `<li class="sales-map-rep" data-rep="${esc(territory.mapPin)}"` +
    ` data-district="${esc(territory.mapDistrict)}"${index === 0 ? '' : ' hidden'}>` +
    `<p class="sales-map-rep__territory">${esc(territory[locale] ?? territory.en)}</p>` +
    `<h3 class="sales-map-rep__name">${esc(territory.rep)}</h3>` +
    // The nationwide representative is not based anywhere in particular, so
    // his line states the coverage rather than a town.
    (territory.mapDistrict === 'national'
      ? `<p class="sales-map-rep__place">${esc(place(territory))}</p>`
      : `<p class="sales-map-rep__place"><span class="sales-map-rep__place-label">${esc(c.placeLabel)}</span> ${esc(place(territory))}</p>`) +
    `<div class="sales-map-rep__actions">` +
    (territory.phone ? telLink(territory.phone, territory.phone) : '') +
    mailLink(territory.email) +
    `</div>` +
    (territory.phone ? '' : `<p class="sales-map-rep__note">${esc(c.noPhone)}</p>`) +
    `</li>`;

  // The map leads with the north, so the northern representative is the one
  // already showing when the page arrives.
  const ordered = [
    ...company.territories.filter((tt) => tt.mapDistrict === 'corozal'),
    ...company.territories.filter((tt) => tt.mapDistrict !== 'corozal'),
  ];

  const map =
    `<div class="sales-map" data-sales-map` +
    ` data-national-label="${esc(c.nationalAction)}"` +
    ` data-choices-label="${esc(c.choicesLabel)}">` +
    `<div class="sales-map__stage">` +
    `<div class="sales-map__canvas">${belizeMap({ locale, i18n, territories: company.territories })}</div>` +
    `<p class="sales-map__hint" data-sales-map-hint hidden>${esc(c.mapHint)}</p>` +
    `</div>` +
    `<div class="sales-map__panel">` +
    `<ul class="sales-map__reps" data-sales-map-reps>${ordered.map(repPanel).join('')}</ul>` +
    `</div>` +
    `</div>`;

  const regions = company.regions
    .map((region) => {
      const list = company.territories.filter((tt) => tt.region === region.id);
      if (!list.length) return '';
      return (
        `<section class="region">` +
        `<div class="region__head"><h3>${esc(region[locale] ?? region.en)}</h3>` +
        `<span>${esc(list.length === 1 ? c.territoryCountOne : t(c.territoryCount, { count: list.length }))}</span></div>` +
        `<ul class="rep-grid">${list.map((territory) => repCard({ territory, i18n, locale, level: 4 })).join('')}</ul>` +
        `</section>`
      );
    })
    .join('');

  const head =
    `<h2>${esc(c.headOfficeHeading)}</h2>` +
    `<ul class="rep-grid" style="margin-top:1.1rem"><li class="rep">` +
    `<h3 class="rep__name">${esc(company.legalName)}</h3>` +
    `<p>${esc(company.address.street)}, ${esc(company.address.town)}, ${esc(company.address.district)}</p>` +
    `<div class="rep__actions">` +
    company.phones.map((p) => telLink(p, p)).join('') +
    mailLink(company.email) +
    `</div></li></ul>`;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.salesNetwork }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">${head}</div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    sectionHead({ heading: c.coverageHeading, lead: c.coverageLead }) +
    map +
    `<div class="sales-map__list" data-sales-map-list>` +
    `<h3 class="sales-map__list-heading">${esc(c.allRepsHeading)}</h3>` +
    regions +
    `</div>` +
    `</div></section>`;

  return { body, pageStyles: ['sales-map.css'], pageScripts: ['sales-map.js'] };
}

/* ------------------------------------------------------------------ *
 * Contact: direct channels only
 * ------------------------------------------------------------------ */

export function contact(ctx) {
  const { i18n, locale, company } = ctx;
  const c = i18n.contact;
  const ilb = company.divisions.find((x) => x.slug === 'international-lubricants-belize');

  const card = ({ heading, body, actions, wide }) =>
    `<li class="channel${wide ? ' channel--wide' : ''}">` +
    `<h2>${esc(heading)}</h2>` +
    `<p>${esc(body)}</p>` +
    `<div class="channel__actions">${actions}</div>` +
    `</li>`;

  // The WhatsApp action renders only once a destination is configured, so an
  // unset value removes it everywhere rather than shipping a broken link.
  const whatsapp = company.generalWhatsappUrl
    ? card({
        heading: c.whatsappHeading,
        body: c.whatsappBody,
        actions:
          `<a class="btn btn--primary" href="${esc(company.generalWhatsappUrl)}"` +
          ` target="_blank" rel="noopener noreferrer">` +
          `${esc(c.whatsappAction)}</a>`,
      })
    : '';

  const channels =
    `<ul class="channels">` +
    card({
      heading: c.emailHeading,
      body: c.emailBody,
      actions:
        `<a class="btn btn--primary" href="${mailto(company.email, c.emailSubject)}">${esc(c.emailAction)}</a>` +
        `<span class="channel__value">${esc(company.email)}</span>`,
    }) +
    whatsapp +
    card({
      heading: c.phoneHeading,
      body: c.phoneBody,
      actions: company.phones.map((p) => telLink(p, p)).join(''),
    }) +
    card({
      heading: c.networkHeading,
      body: c.networkBody,
      actions: `<a class="btn btn--outline" href="${link(locale, ROUTES.network)}">${esc(c.networkAction)}</a>`,
    }) +
    card({
      heading: c.ilbHeading,
      body: c.ilbBody,
      actions: ilb.contact.phones.map((p) => telLink(p, p)).join('') + mailLink(ilb.contact.email),
    }) +
    card({
      heading: i18n.footer.socialHeading,
      body: c.socialBody,
      actions: socialLinks({ company, i18n, className: 'social--dark' }),
    }) +
    `</ul>`;

  const map =
    `<section class="band band--tight"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<h2>${esc(c.mapHeading)}</h2><p>${esc(c.mapBody)}</p>` +
    `</div>` +
    `<a class="btn btn--outline" href="${esc(company.maps.link)}" target="_blank" rel="noopener noreferrer">${esc(c.openInMaps)}</a>` +
    `</div>` +
    `<div class="map-frame">` +
    `<iframe src="${esc(company.maps.embed)}" title="${esc(c.mapTitle)}" loading="lazy" ` +
    `referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>` +
    `</div></div></section>`;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.contact }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">${channels}</div></section>` +
    map;

  return { body };
}

/* ------------------------------------------------------------------ *
 * /products/ keeps working for anyone holding the old address.
 * ------------------------------------------------------------------ */

export function productsAlias(ctx) {
  const { i18n, locale } = ctx;
  const target = link(locale, ROUTES.brands);

  return {
    body:
      `<section class="band"><div class="shell">` +
      `<h1>${esc(i18n.brands.heading)}</h1>` +
      `<p class="lead">${esc(i18n.brands.lead)}</p>` +
      `<div class="actions" style="margin-top:1.5rem">` +
      `<a class="btn btn--primary btn--lg" href="${target}">${esc(i18n.nav.brands)}</a>` +
      `</div></div></section>`,
    extraHead: `<meta http-equiv="refresh" content="0; url=${target}">`,
    canonicalPath: ROUTES.brands,
    noindex: true,
  };
}

/* ------------------------------------------------------------------ */

export function notFound(ctx) {
  const { i18n, locale } = ctx;
  const c = i18n.notFound;

  const body =
    `<section class="band"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `<div class="actions" style="margin-top:1.75rem">` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.brands)}">${esc(i18n.nav.brands)}</a>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.network)}">${esc(i18n.nav.salesNetwork)}</a>` +
    `<a class="btn btn--ghost" href="${link(locale, ROUTES.home)}">${esc(i18n.nav.home)}</a>` +
    `</div></div></section>`;

  return { body };
}
