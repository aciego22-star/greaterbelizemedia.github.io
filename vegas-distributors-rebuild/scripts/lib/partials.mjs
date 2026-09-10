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
      `<div class="tile tile--product">${picture(images.divisions['blanca-max-1-litre'], { alt: 'Aqua Max bleach, 1 litre bottle', sizes: '(max-width: 62rem) 45vw, 260px' })}</div>` +
      `<div class="tile tile--product">${picture(images.divisions['blanca-max-half-litre'], { alt: 'Aqua Max bleach, half litre bottle', sizes: '(max-width: 62rem) 45vw, 260px' })}</div>`;
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

/* ------------------------------------------------------------------ *
 * Social channels
 * ------------------------------------------------------------------ */

const ICONS = {
  whatsapp:
    '<path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.83 2.42a8.19 8.19 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.17c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.19-.53.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.47c-.17 0-.43.06-.66.31-.22.25-.87.85-.87 2.07 0 1.22.89 2.4 1.02 2.56.12.17 1.75 2.67 4.24 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.68-1.18.2-.58.2-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z"/>',
  facebook:
    '<path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.49-3.92 3.77-3.92 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.9h2.78l-.45 2.91h-2.33V22c4.78-.76 8.44-4.92 8.44-9.94Z"/>',
  // Drawn with strokes rather than a compound path, so the cut-outs cannot
  // fill solid under the default fill rule.
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/>' +
    '<circle cx="17.1" cy="6.9" r="1.15" fill="currentColor"/>',
};

/** The company's public channels, as an icon row. */
export function socialLinks({ company, i18n, className = '' }) {
  const entries = [
    company.generalWhatsappUrl ? ['whatsapp', company.generalWhatsappUrl, i18n.social.whatsapp] : null,
    company.facebook ? ['facebook', company.facebook, i18n.social.facebook] : null,
    company.instagram ? ['instagram', company.instagram, i18n.social.instagram] : null,
  ].filter(Boolean);

  if (!entries.length) return '';

  return (
    `<ul class="social ${className}">` +
    entries
      .map(
        ([id, href, label]) =>
          // These lead off the site, so they open alongside it rather than
          // taking the visitor away from the page they were reading.
          `<li><a class="social__link social__link--${id}" href="${esc(href)}"` +
          ` target="_blank" rel="noopener noreferrer">` +
          `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor">${ICONS[id]}</svg>` +
          `<span class="visually-hidden">${esc(label)}</span></a></li>`
      )
      .join('') +
    `</ul>`
  );
}
