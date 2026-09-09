/** Reusable page fragments shared across routes. */
import { esc, cx, picture, telLink, mailLink, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';

export const sectionHead = ({ eyebrow, heading, lead, level = 2, id }) =>
  `<div class="section-head">` +
  (eyebrow ? `<p class="eyebrow">${esc(eyebrow)}</p>` : '') +
  `<hr class="rule">` +
  `<h${level}${id ? ` id="${esc(id)}"` : ''}>${esc(heading)}</h${level}>` +
  (lead ? `<p class="lead">${esc(lead)}</p>` : '') +
  `</div>`;

export const crumbs = ({ i18n, locale, trail }) =>
  `<nav class="crumbs shell" aria-label="${esc(i18n.nav.breadcrumbLabel)}"><ol>` +
  trail
    .map((c, i) =>
      i === trail.length - 1
        ? `<li aria-current="page">${esc(c.label)}</li>`
        : `<li><a href="${c.href}">${esc(c.label)}</a></li>`
    )
    .join('') +
  `</ol></nav>`;

export const notice = (text, variant) =>
  `<p class="${cx('notice', variant && `notice--${variant}`)}">${text}</p>`;

/** A brand card for the directory and for category previews. */
export function brandCard({ brand, images, i18n, locale, category }) {
  const img = images.brands[brand.slug];
  return (
    `<li class="brand-card" data-slug="${esc(brand.slug)}"` +
    ` data-name="${esc(brand.name.toLowerCase())}"` +
    ` data-categories="${esc(brand.categories.join(' '))}"` +
    ` data-division="${esc(brand.division)}"` +
    ` data-products="${esc(brand.sections.flatMap((s) => s.products.map((p) => p.name)).join(' ').toLowerCase())}">` +
    `<div class="brand-card__mark">` +
    (img?.logo
      ? picture(img.logo, { alt: `${brand.name}`, sizes: '(max-width: 40rem) 45vw, 180px' })
      : `<span class="tag">${esc(brand.name)}</span>`) +
    `</div>` +
    `<div class="brand-card__body">` +
    `<h3><a class="stretch" href="${link(locale, `${ROUTES.products}/${brand.slug}`)}">${esc(brand.name)}</a></h3>` +
    `<span class="tag tag--${esc(brand.category)}"><span class="tag__dot" aria-hidden="true"></span>${esc(category)}</span>` +
    `<p class="brand-card__meta">${esc(t(i18n.products.listingCount, { count: brand.productCount }))}</p>` +
    `</div></li>`
  );
}

/** Category tile. Categories with no online product data are marked, not faked. */
export function categoryCard({ category, count, brands, images, i18n, locale }) {
  const label = category[locale] ?? category.en;
  const href = `${link(locale, ROUTES.products)}?category=${encodeURIComponent(category.id)}`;

  if (!count) {
    return (
      `<li class="category category--enquiry">` +
      `<div class="category__figure"><span>${esc(i18n.products.enquiryOnly)}</span></div>` +
      `<div class="category__body">` +
      `<h3><a class="stretch" href="${link(locale, ROUTES.contact)}?type=availability&amp;category=${encodeURIComponent(category.id)}">${esc(label)}</a></h3>` +
      `<p class="category__count">${esc(i18n.products.enquiryOnlyBody)}</p>` +
      `</div></li>`
    );
  }

  // Lead image comes from a real brand in the category.
  const lead = brands.find((b) => images.brands[b.slug]?.photos?.length);
  const photo = lead ? images.brands[lead.slug].photos[0] : null;

  return (
    `<li class="category">` +
    `<div class="category__figure">` +
    (photo ? picture(photo, { alt: '', sizes: '(max-width: 48rem) 90vw, 300px' }) : '') +
    `</div>` +
    `<div class="category__body">` +
    `<h3><a class="stretch" href="${href}">${esc(label)}</a></h3>` +
    `<p class="category__count">${esc(t(i18n.products.brandCount, { count }))}</p>` +
    `</div></li>`
  );
}

/** One division panel, used on the homepage and the divisions overview. */
export function divisionPanel({ division, i18n, locale, images, flip, level = 3, reveal = false }) {
  const copy = division[locale] ?? division.en;
  const routeKey =
    division.slug === 'vegas-industries' ? 'industries'
    : division.slug === 'international-lubricants-belize' ? 'lubricants'
    : null;

  const modifier =
    division.slug === 'vegas-industries' ? 'division--industries'
    : division.slug === 'international-lubricants-belize' ? 'division--lubricants'
    : '';

  let media = '';
  if (division.slug === 'vegas-industries') {
    // Portrait product shots are contained on white rather than cropped.
    media =
      `<div class="tile tile--product">${picture(images.divisions['blanca-max-1-litre'], { alt: 'Blanca Max bleach, 1 litre bottle', sizes: '(max-width: 62rem) 45vw, 260px' })}</div>` +
      `<div class="tile tile--product">${picture(images.divisions['blanca-max-half-litre'], { alt: 'Blanca Max bleach, half litre bottle', sizes: '(max-width: 62rem) 45vw, 260px' })}</div>`;
  } else if (division.slug === 'international-lubricants-belize') {
    media = plate(images.divisions['international-lubricants-chevron-artwork'], {
      alt: 'Chevron lubricants artwork published by International Lubricants of Belize',
    });
  } else {
    // The parent brand is represented by its own mark, not invented facilities.
    media = `<div class="tile tile--wide tile--mark">${picture(images.company['vegas-lockup'], { alt: '', sizes: '(max-width: 62rem) 60vw, 320px' })}</div>`;
  }

  const chips =
    division.productLines
      ? `<ul class="chips">${division.productLines.map((l) => `<li class="chip chip--accent">${esc(l[locale] ?? l.en)}</li>`).join('')}</ul>`
      : division.products
        ? `<ul class="chips">${division.products.map((p) => `<li class="chip">${esc(p.name)} · ${esc(locale === 'es' ? p.sizeEs : p.size)}</li>`).join('')}</ul>`
        : '';

  return (
    `<article class="division ${modifier}${flip ? ' division--flip' : ''}${reveal ? ' reveal' : ''}">` +
    `<div class="division__content">` +
    (division.logo && images.divisions[division.logo.replace(/\.[a-z]+$/, '')]
      ? `<span class="division__mark">${picture(images.divisions[division.logo.replace(/\.[a-z]+$/, '')], { alt: division.name, sizes: '160px' })}</span>`
      : '') +
    `<p class="division__tag">${esc(copy.role)}</p>` +
    `<h${level}>${esc(division.name)}</h${level}>` +
    `<div class="division__body"><p>${esc(copy.summary)}</p></div>` +
    chips +
    (routeKey
      ? `<div class="actions"><a class="btn btn--outline" href="${link(locale, ROUTES[routeKey])}">${esc(i18n.actions.readMore)}</a></div>`
      : `<div class="actions"><a class="btn btn--outline" href="${link(locale, ROUTES.products)}">${esc(i18n.actions.viewProducts)}</a></div>`) +
    `</div>` +
    `<div class="division__media${division.slug === 'international-lubricants-belize' ? ' division__media--single' : ''}">${media}</div>` +
    `</article>`
  );
}

/** Representative card. Telephone actions appear only when a number is published. */
export function repCard({ territory, i18n, locale, level = 3 }) {
  return (
    `<li class="rep">` +
    `<p class="rep__territory">${esc(territory[locale] ?? territory.en)}</p>` +
    `<h${level} class="rep__name">${esc(territory.rep)}</h${level}>` +
    `<div class="rep__actions">` +
    (territory.phone
      ? telLink(territory.phone, territory.phone)
      : `<span class="rep__note">${esc(i18n.network.noPhone)}</span>`) +
    mailLink(territory.email) +
    `</div></li>`
  );
}

/**
 * A white plate holding published artwork.
 *
 * Sources are low resolution, so the plate never lets its image render wider
 * than the largest derivative that exists. Without this the ILB artwork (336px)
 * and the BOP can row (375px) visibly soften in wide layouts.
 */
export function plate(entry, { alt = '', sizes, className = '', pad = 24 } = {}) {
  if (!entry) return '';
  const widest = entry.fallback[entry.fallback.length - 1].width;
  return (
    `<div class="plate ${className}" style="max-width:${widest + pad}px">` +
    picture(entry, { alt, sizes: sizes ?? `${widest}px` }) +
    `</div>`
  );
}

export const placeholderNote = ({ heading, body, items }) =>
  `<div class="placeholder-note">` +
  `<strong>${esc(heading)}</strong>` +
  `<p>${esc(body)}</p>` +
  (items?.length ? `<ul class="chips">${items.map((i) => `<li class="chip">${esc(i)}</li>`).join('')}</ul>` : '') +
  `</div>`;
