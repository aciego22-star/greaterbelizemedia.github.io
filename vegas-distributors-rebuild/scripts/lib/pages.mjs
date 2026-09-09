/** Page bodies. One function per route; each returns { body, ... } for layout.page(). */
import { esc, picture, telLink, mailLink, t, cx } from './html.mjs';
import { ROUTES, link, absoluteUrl } from './layout.mjs';
import {
  sectionHead, crumbs, notice, brandCard, categoryCard, divisionPanel, repCard, placeholderNote,
} from './partials.mjs';

const localeCopy = (obj, locale) => obj[locale] ?? obj.en;

/* ------------------------------------------------------------------ *
 * Home
 * ------------------------------------------------------------------ */

export function home(ctx) {
  const { i18n, locale, company, catalog, images } = ctx;
  const c = i18n.home;

  // Hero composition, built from real brand imagery plus the company mark.
  // Every tile matches its source aspect ratio, so nothing is cropped or stretched.
  const composition =
    `<div class="hero__composition" role="img" aria-label="${esc(c.compositionAlt)}">` +
    `<div class="tile tile--wide">${picture(images.brands.olmeca?.photos?.[0], { alt: '', sizes: '(max-width: 62rem) 92vw, 520px', loading: 'eager', fetchpriority: 'high' })}</div>` +
    `<div class="tile tile--wide">${picture(images.brands.kerns?.photos?.[0], { alt: '', sizes: '(max-width: 62rem) 92vw, 520px', loading: 'eager' })}</div>` +
    `<div class="tile tile--third tile--product">${picture(images.divisions['blanca-max-1-litre'], { alt: '', sizes: '(max-width: 62rem) 30vw, 165px' })}</div>` +
    `<div class="tile tile--third tile--mark">${picture(images.company['vegas-mark'], { alt: '', sizes: '(max-width: 62rem) 30vw, 165px', loading: 'eager' })}</div>` +
    `<div class="tile tile--third tile--accent"><span>1980</span><small>${esc(locale === 'es' ? 'Desde' : 'Since')}</small></div>` +
    `</div>`;

  const hero =
    `<section class="hero"><div class="shell hero__grid">` +
    `<div class="hero__copy">` +
    `<p class="eyebrow">${esc(c.heroEyebrow)}</p>` +
    `<h1>${esc(c.heroHeadline)}</h1>` +
    `<p class="lead">${esc(c.heroLead)}</p>` +
    `<div class="actions">` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.products)}">${esc(i18n.actions.exploreProducts)}</a>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.network)}">${esc(i18n.actions.findYourRep)}</a>` +
    `</div>` +
    `<ul class="hero__proof">${c.heroProof.map((p) => `<li>${esc(p)}</li>`).join('')}</ul>` +
    `</div>` +
    composition +
    `</div></section>`;

  const facts =
    `<section class="band band--tight"><div class="shell">` +
    sectionHead({ eyebrow: c.factsEyebrow, heading: c.factsHeading }) +
    `<dl class="facts reveal">` +
    c.facts
      .map((f) => `<div class="fact"><dt>${esc(f.term)}</dt><dd><strong>${esc(f.value)}</strong>${esc(f.detail)}</dd></div>`)
      .join('') +
    `</dl>` +
    `</div></section>`;

  const divisions =
    `<section class="band band--sunken"><div class="shell">` +
    sectionHead({ eyebrow: c.divisionsEyebrow, heading: c.divisionsHeading, lead: c.divisionsLead }) +
    company.divisions
      .map((d, i) => divisionPanel({ division: d, i18n, locale, images, flip: i % 2 === 1, reveal: true }))
      .join('') +
    `</div></section>`;

  const byCategory = catalog.categories.map((cat) => {
    const brands = catalog.brands.filter((b) => b.categories.includes(cat.id));
    return { cat, brands };
  });

  const categories =
    `<section class="band"><div class="shell">` +
    sectionHead({ eyebrow: c.categoriesEyebrow, heading: c.categoriesHeading, lead: c.categoriesLead }) +
    `<ul class="categories reveal">` +
    byCategory
      .map(({ cat, brands }) => categoryCard({ category: cat, count: brands.length, brands, images, i18n, locale }))
      .join('') +
    `</ul>` +
    `<div class="actions" style="margin-top:1.75rem"><a class="btn btn--dark" href="${link(locale, ROUTES.products)}">${esc(c.categoriesAction)}</a></div>` +
    `</div></section>`;

  const regionsWithCounts = company.regions
    .map((r) => ({ r, n: company.territories.filter((tt) => tt.region === r.id).length }))
    .filter((x) => x.n);

  const network =
    `<section class="band band--sunken"><div class="shell">` +
    sectionHead({ eyebrow: c.networkEyebrow, heading: c.networkHeading, lead: c.networkLead }) +
    `<ul class="rep-grid reveal">` +
    company.territories.slice(0, 4).map((territory) => repCard({ territory, i18n, locale })).join('') +
    `</ul>` +
    `<div class="actions" style="margin-top:1.5rem">` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.network)}">${esc(c.networkAction)}</a>` +
    `<span class="chip">${esc(t(i18n.network.territoryCount, { count: company.territories.length }))}</span>` +
    `</div>` +
    `</div></section>`;

  const why =
    `<section class="band"><div class="shell">` +
    sectionHead({ eyebrow: c.whyEyebrow, heading: c.whyHeading }) +
    `<ul class="value-list reveal" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,17rem),1fr));display:grid">` +
    c.why.map((w) => `<li><strong>${esc(w.title)}</strong><span>${esc(w.body)}</span></li>`).join('') +
    `</ul></div></section>`;

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
        const key = o.href === '/products' ? ROUTES.products : o.href === '/sales-network' ? ROUTES.network : ROUTES.contact;
        return `<li><a class="cta-option" href="${link(locale, key)}"><span><strong>${esc(o.title)}</strong><span>${esc(o.body)}</span></span></a></li>`;
      })
      .join('') +
    `</ul>` +
    `</div></section>`;

  return { body: hero + facts + divisions + categories + network + why + cta };
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
        (h.note ? `<p class="field__hint">${esc(h.note)}</p>` : '') +
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
    `<div class="table-wrap"><table class="products">` +
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
    `<div class="form-card"><h3>${esc(c.visionHeading)}</h3><p>${esc(localeCopy(company.vision, locale))}</p></div>` +
    `<div class="form-card"><h3>${esc(c.missionHeading)}</h3><p>${esc(localeCopy(company.mission, locale))}</p>` +
    `<p class="field__hint">${esc(company.mission.note)}</p></div>` +
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
    `<div>${placeholderNote({ heading: c.photographyHeading, body: c.photographyBody, items: c.photographyItems })}</div>` +
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
        `<figure class="tile tile--product" style="aspect-ratio:auto">` +
        picture(images.divisions[p.image.replace(/\.[a-z]+$/, '')], {
          alt: `${p.name} ${locale === 'es' ? p.sizeEs : p.size}`,
          sizes: '(max-width: 48rem) 45vw, 280px',
        }) +
        `<figcaption style="padding:0.85rem 1rem;font-weight:600">${esc(p.name)} · ${esc(locale === 'es' ? p.sizeEs : p.size)}</figcaption>` +
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
    `<div class="form-card"><h3>${esc(c.aboutBleachHeading)}</h3><p>${esc(copy.explainer)}</p></div>` +
    `<div class="actions"><a class="btn btn--primary" href="${link(locale, ROUTES.contact)}?type=availability&amp;division=vegas-industries">${esc(i18n.actions.requestAvailability)}</a></div>` +
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
    `<div class="actions"><a class="btn btn--primary" href="${link(locale, ROUTES.contact)}?type=quote&amp;division=international-lubricants-belize">${esc(i18n.actions.requestQuote)}</a></div>` +
    `</div>` +
    `<div class="stack" style="--stack-gap:1.25rem">` +
    `<div class="tile">${picture(images.divisions['international-lubricants-chevron-artwork'], { alt: 'Chevron lubricants artwork published by International Lubricants of Belize', sizes: '(max-width: 62rem) 92vw, 540px' })}</div>` +
    `<div class="form-card"><h3>${esc(c.chevronHeading)}</h3><p>${esc(copy.chevronNote)}</p></div>` +
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
