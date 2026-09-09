/** Catalogue, sales-network, contact and error routes. */
import { esc, picture, telLink, mailLink, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';
import { sectionHead, crumbs, notice, brandCard, categoryCard, repCard } from './partials.mjs';

const categoryLabel = (catalog, id, locale) => {
  const c = catalog.categories.find((x) => x.id === id);
  return c ? c[locale] ?? c.en : id;
};

const divisionLabel = (company, slug, locale) => {
  const d = company.divisions.find((x) => x.slug === slug);
  if (!d) return slug;
  return d.name;
};

/* ------------------------------------------------------------------ *
 * Products index
 * ------------------------------------------------------------------ */

export function products(ctx) {
  const { i18n, locale, catalog, company, images } = ctx;
  const c = i18n.products;

  const byCategory = catalog.categories.map((cat) => ({
    cat,
    brands: catalog.brands.filter((b) => b.categories.includes(cat.id)),
  }));

  const categoryOptions = catalog.categories
    .map((cat) => {
      const n = catalog.brands.filter((b) => b.categories.includes(cat.id)).length;
      return `<option value="${esc(cat.id)}">${esc(cat[locale] ?? cat.en)}${n ? ` (${n})` : ''}</option>`;
    })
    .join('');

  const divisionOptions = company.divisions
    .map((d) => {
      const n = catalog.brands.filter((b) => b.division === d.slug).length;
      return n ? `<option value="${esc(d.slug)}">${esc(d.name)} (${n})</option>` : '';
    })
    .join('');

  const filters =
    `<form class="filters" id="brand-filters" role="search" aria-labelledby="filters-heading">` +
    `<h2 class="visually-hidden" id="filters-heading">${esc(c.searchLabel)}</h2>` +
    `<div class="filter-row">` +
    `<div class="field">` +
    `<label for="brand-search">${esc(c.searchLabel)}</label>` +
    `<input type="search" id="brand-search" name="q" placeholder="${esc(c.searchPlaceholder)}" autocomplete="off" spellcheck="false">` +
    `</div>` +
    `<div class="field">` +
    `<label for="brand-category">${esc(c.categoryLabel)}</label>` +
    `<select id="brand-category" name="category"><option value="">${esc(c.allCategories)}</option>${categoryOptions}</select>` +
    `</div>` +
    `<div class="field">` +
    `<label for="brand-division">${esc(c.divisionLabel)}</label>` +
    `<select id="brand-division" name="division"><option value="">${esc(c.allDivisions)}</option>${divisionOptions}</select>` +
    `</div>` +
    `</div>` +
    `<div class="filter-meta">` +
    `<p id="result-count" role="status" data-template="${esc(c.resultsCount)}" data-template-one="${esc(c.resultsCountOne)}">${esc(t(c.resultsCount, { count: catalog.brands.length }))}</p>` +
    `<button class="btn btn--ghost btn--sm" type="reset" id="clear-filters">${esc(c.clearFilters)}</button>` +
    `</div>` +
    `</form>`;

  const grid =
    `<ul class="brand-grid" id="brand-grid">` +
    catalog.brands
      .map((brand) =>
        brandCard({ brand, images, i18n, locale, category: categoryLabel(catalog, brand.category, locale) })
      )
      .join('') +
    `</ul>` +
    `<div class="empty-state" id="no-results" hidden>` +
    `<h3>${esc(c.noResultsHeading)}</h3>` +
    `<p>${esc(c.noResultsBody)}</p>` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.contact)}?type=availability">${esc(i18n.actions.enquire)}</a>` +
    `</div>`;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.products }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `<div style="margin-top:1.5rem">${notice(`<span><strong>${esc(i18n.misc.provisional)}.</strong> ${esc(c.verificationNotice)}</span>`)}</div>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">` +
    `<h2 id="categories-heading">${esc(c.categoriesHeading)}</h2>` +
    `<ul class="categories" style="margin-top:1.5rem">` +
    byCategory
      .map(({ cat, brands }) => categoryCard({ category: cat, count: brands.length, brands, images, i18n, locale }))
      .join('') +
    `</ul></div></section>` +
    `<section class="band band--sunken"><div class="shell">` +
    `<h2 id="brands-heading">${esc(c.brandsHeading)}</h2>` +
    `<p class="lead" style="margin:0.75rem 0 1.5rem">${esc(t(c.listingCount, { count: catalog.totals.products }))} · ${esc(t(c.brandCount, { count: catalog.totals.brands }))}</p>` +
    filters + grid +
    `</div></section>`;

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
        `<div class="table-wrap" style="margin-top:1.25rem"><table class="products">` +
        `<caption>${esc(caption)}</caption>` +
        `<thead><tr><th scope="col">${esc(c.productName)}</th><th scope="col">${esc(c.productSize)}</th></tr></thead>` +
        `<tbody>` +
        section.products
          .map((p) => `<tr><td>${esc(p.name)}</td><td class="size">${esc(p.size)}</td></tr>`)
          .join('') +
        `</tbody></table></div>`
      );
    })
    .join('');

  // Published artwork is low resolution, so a gallery item is never displayed
  // wider than the largest derivative that exists for it: a stretched packshot
  // reads as a broken label. The cap and the sizes hint are kept in step.
  const gallery = (img?.photos ?? [])
    .slice(0, 4)
    .map((p) => {
      const widest = p.fallback[p.fallback.length - 1].width;
      return (
        `<div class="tile" style="max-width:${widest}px">${picture(p, {
          alt: p.alt ? `${b.name}: ${p.alt}` : `${b.name} product imagery published by Vega's Distributors`,
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

  const body =
    crumbs({
      i18n, locale,
      trail: [
        { label: i18n.nav.home, href: link(locale, ROUTES.home) },
        { label: i18n.nav.products, href: link(locale, ROUTES.products) },
        { label: b.name },
      ],
    }) +
    `<section class="page-head"><div class="shell brand-hero">` +
    `<div>` +
    (img?.logo ? `<span class="brand-hero__mark">${picture(img.logo, { alt: b.name, sizes: '180px', loading: 'eager' })}</span>` : '') +
    `<h1>${esc(b.name)}</h1>` +
    `<ul class="chips" style="margin-top:1rem">` +
    `<li class="chip">${esc(c.categoryLabel)}: ${esc(categoryLabel(catalog, b.category, locale))}</li>` +
    `<li class="chip">${esc(c.divisionLabel)}: ${esc(divisionLabel(company, b.division, locale))}</li>` +
    `<li class="chip">${esc(c.listingsLabel)}: ${b.productCount}</li>` +
    `</ul>` +
    `<div class="actions" style="margin-top:1.5rem">` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.contact)}?type=availability&amp;brand=${encodeURIComponent(b.slug)}">${esc(i18n.actions.requestAvailability)}</a>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.products)}">${esc(i18n.actions.backToProducts)}</a>` +
    `</div>` +
    `</div>` +
    `<div class="brand-gallery">${gallery}</div>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell">` +
    notice(`<span><strong>${esc(i18n.misc.provisional)}.</strong> ${esc(c.provisionalNotice)}</span>`) +
    (b.sourceNote ? `<div style="margin-top:1rem">${notice(`<span><strong>${esc(c.sourceNote)}.</strong> ${esc(b.sourceNote)}</span>`, 'info')}</div>` : '') +
    `<h2 style="margin-top:2rem">${esc(c.productsHeading)}</h2>` +
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
    `<li><a class="cta-option" href="${link(locale, ROUTES.network)}"><span><strong>${esc(i18n.actions.findYourRep)}</strong><span>${esc(t(i18n.network.territoryCount, { count: company.territories.length }))}</span></span></a></li>` +
    `<li><a class="cta-option" href="${link(locale, ROUTES.contact)}?type=quote&amp;brand=${encodeURIComponent(b.slug)}"><span><strong>${esc(i18n.actions.requestQuote)}</strong><span>${esc(b.name)}</span></span></a></li>` +
    `</ul></div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * Sales network
 * ------------------------------------------------------------------ */

export function network(ctx) {
  const { i18n, locale, company } = ctx;
  const c = i18n.network;

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
    regions +
    `</div></section>`;

  return { body };
}

/* ------------------------------------------------------------------ *
 * Contact
 * ------------------------------------------------------------------ */

export function contact(ctx) {
  const { i18n, locale, company, catalog, site } = ctx;
  const c = i18n.contact;
  const f = c.fields;

  const types = c.enquiryTypes
    .map(
      (x, i) =>
        `<li><label class="enquiry-type">` +
        `<input type="radio" name="enquiryType" value="${esc(x.id)}"${i === 0 ? ' checked' : ''}>` +
        `<span><strong>${esc(x.title)}</strong><span>${esc(x.body)}</span></span>` +
        `</label></li>`
    )
    .join('');

  const territoryOptions = company.territories
    .map((tt) => `<option value="${esc(tt.id)}">${esc(tt[locale] ?? tt.en)}</option>`)
    .join('');

  const categoryOptions = catalog.categories
    .map((cat) => `<option value="${esc(cat.id)}">${esc(cat[locale] ?? cat.en)}</option>`)
    .join('');

  const field = ({ id, label, type = 'text', required, hint, autocomplete, wide }) =>
    `<div class="field${wide ? ' field--wide' : ''}" data-field="${esc(id)}">` +
    `<label for="${esc(id)}">${esc(label)}${required ? '' : ` <span class="field__hint">(${esc(f.optional)})</span>`}</label>` +
    `<input type="${esc(type)}" id="${esc(id)}" name="${esc(id)}"${required ? ' required aria-required="true"' : ''}` +
    (autocomplete ? ` autocomplete="${esc(autocomplete)}"` : '') +
    (hint ? ` aria-describedby="${esc(id)}-hint"` : '') +
    `>` +
    (hint ? `<p class="field__hint" id="${esc(id)}-hint">${esc(hint)}</p>` : '') +
    `<p class="field__error" id="${esc(id)}-error" hidden></p>` +
    `</div>`;

  const form =
    `<form class="form-card" id="enquiry-form" novalidate` +
    (site.forms.endpoint ? ` data-endpoint="${esc(site.forms.endpoint)}"` : '') +
    ` data-messages="${esc(JSON.stringify({
      name: c.errors.name,
      email: c.errors.email,
      message: c.errors.message,
      enquiryType: c.errors.enquiryType,
      summary: c.errors.summary,
      devHeading: c.devResultHeading,
      devBody: c.devResultBody,
      sent: c.devResultHeading,
      failed: c.errors.summary,
    }))}">` +
    `<fieldset style="border:0;padding:0;margin:0 0 1.75rem">` +
    `<legend><h2 style="font-size:1.3rem">${esc(c.enquiryTypeHeading)}</h2></legend>` +
    `<ul class="enquiry-types" style="margin-top:1rem">${types}</ul>` +
    `</fieldset>` +
    `<h2 style="font-size:1.3rem;margin-bottom:1.1rem">${esc(c.formHeading)}</h2>` +
    `<div class="form-grid">` +
    field({ id: 'name', label: f.name, required: true, autocomplete: 'name' }) +
    field({ id: 'business', label: f.business, hint: f.businessHint, autocomplete: 'organization' }) +
    field({ id: 'email', label: f.email, type: 'email', required: true, autocomplete: 'email' }) +
    field({ id: 'phone', label: f.phone, type: 'tel', hint: f.phoneHint, autocomplete: 'tel' }) +
    `<div class="field" data-field="territory">` +
    `<label for="territory">${esc(f.territory)} <span class="field__hint">(${esc(f.optional)})</span></label>` +
    `<select id="territory" name="territory" aria-describedby="territory-hint">` +
    `<option value="">${esc(f.selectPlaceholder)}</option>${territoryOptions}</select>` +
    `<p class="field__hint" id="territory-hint">${esc(f.territoryHint)}</p></div>` +
    `<div class="field" data-field="category">` +
    `<label for="category">${esc(f.category)} <span class="field__hint">(${esc(f.optional)})</span></label>` +
    `<select id="category" name="category"><option value="">${esc(f.selectPlaceholder)}</option>${categoryOptions}</select></div>` +
    field({ id: 'product', label: f.product }) +
    field({ id: 'quantity', label: f.quantity, hint: f.quantityHint }) +
    `<div class="field field--wide" data-field="message">` +
    `<label for="message">${esc(f.message)}</label>` +
    `<textarea id="message" name="message" required aria-required="true"></textarea>` +
    `<p class="field__error" id="message-error" hidden></p></div>` +
    `<fieldset class="field field--wide" style="border:0;padding:0;margin:0">` +
    `<legend>${esc(f.preferredContact)}</legend>` +
    `<ul class="enquiry-types" style="margin-top:0.6rem">` +
    c.preferredContactOptions
      .map(
        (o, i) =>
          `<li><label class="enquiry-type"><input type="radio" name="preferredContact" value="${esc(o.id)}"${i === 0 ? ' checked' : ''}>` +
          `<span><strong>${esc(o.label)}</strong></span></label></li>`
      )
      .join('') +
    `</ul></fieldset>` +
    `</div>` +
    `<div class="actions" style="margin-top:1.75rem">` +
    `<button class="btn btn--primary" type="submit">${esc(c.submit)}</button>` +
    `</div>` +
    `<div class="form-status" id="form-status" role="status" hidden></div>` +
    `</form>`;

  const office =
    `<div class="stack" style="--stack-gap:1.5rem">` +
    `<div class="form-card">` +
    `<h2 style="font-size:1.15rem">${esc(c.officeHeading)}</h2>` +
    `<h3 style="font-size:0.85rem;margin-top:1rem;color:var(--slate)">${esc(c.addressHeading)}</h3>` +
    `<p>${esc(company.address.street)}<br>${esc(company.address.town)}<br>${esc(company.address.district)}, ${esc(company.address.country)}</p>` +
    `<h3 style="font-size:0.85rem;color:var(--slate)">${esc(c.phoneHeading)}</h3>` +
    `<p class="rep__actions" style="align-items:flex-start">${company.phones.map((p) => telLink(p, p)).join('')}</p>` +
    `<h3 style="font-size:0.85rem;margin-top:1rem;color:var(--slate)">${esc(c.emailHeading)}</h3>` +
    `<p>${mailLink(company.email)}</p>` +
    `<h3 style="font-size:0.85rem;margin-top:1rem;color:var(--slate)">${esc(c.socialHeading)}</h3>` +
    `<p><a class="action-link" href="${esc(company.facebook)}" rel="noopener noreferrer">${esc(i18n.footer.followUs)}</a></p>` +
    `</div>` +
    `<div class="form-card">` +
    `<h2 style="font-size:1.15rem">${esc(c.ilbHeading)}</h2>` +
    (() => {
      const d = company.divisions.find((x) => x.slug === 'international-lubricants-belize');
      return `<p class="rep__actions" style="align-items:flex-start;margin-top:0.85rem">${d.contact.phones.map((p) => telLink(p, p)).join('')}${mailLink(d.contact.email)}</p>`;
    })() +
    `</div>` +
    `<p class="placeholder-note">${esc(c.mapNote)}</p>` +
    `</div>`;

  const body =
    crumbs({ i18n, locale, trail: [{ label: i18n.nav.home, href: link(locale, ROUTES.home) }, { label: i18n.nav.contact }] }) +
    `<section class="page-head"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `<div style="margin-top:1.5rem">${notice(`<span><strong>${esc(c.devResultHeading)}.</strong> ${esc(c.devNotice)}</span>`, 'info')}</div>` +
    `</div></section>` +
    `<section class="band band--tight"><div class="shell split split--wide-first">` +
    form + office +
    `</div></section>`;

  return { body, pageScripts: ['enquiry.js'] };
}

/* ------------------------------------------------------------------ *
 * 404
 * ------------------------------------------------------------------ */

export function notFound(ctx) {
  const { i18n, locale } = ctx;
  const c = i18n.notFound;

  const body =
    `<section class="band"><div class="shell">` +
    `<hr class="rule"><h1>${esc(c.heading)}</h1><p class="lead">${esc(c.lead)}</p>` +
    `<div class="actions" style="margin-top:1.75rem">` +
    `<a class="btn btn--primary" href="${link(locale, ROUTES.products)}">${esc(i18n.nav.products)}</a>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.network)}">${esc(i18n.nav.salesNetwork)}</a>` +
    `<a class="btn btn--ghost" href="${link(locale, ROUTES.home)}">${esc(i18n.nav.home)}</a>` +
    `</div></div></section>`;

  return { body };
}
