/** "Brands in Motion": a dimensional gallery of official product artwork. */
import { esc, picture, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';

/** Six entry paths so cards arrive from different directions and depths. */
const VARIANTS = 6;

export function brandGallery({ i18n, locale, gallery, galleryImages, catalog }) {
  const c = i18n.gallery;

  const cards = gallery.items
    .map((item, i) => {
      const entry = galleryImages[item.id];
      if (!entry) return '';

      const brand = catalog.brands.find((b) => b.slug === item.brand);
      const alt = item[locale] ?? item.en;
      const variant = (i % VARIANTS) + 1;
      // Cards arrive in small groups rather than one long queue.
      const delay = (i % 4) * 90;

      return (
        `<li class="g-card g-card--${esc(item.span)}" data-variant="${variant}" data-delay="${delay}">` +
        `<button type="button" class="g-card__button" data-index="${i}"` +
        ` aria-label="${esc(t(c.openLabel, { name: alt }))}">` +
        picture(entry, { alt, sizes: '(max-width: 48rem) 46vw, (max-width: 75rem) 30vw, 22vw' }) +
        `</button>` +
        (brand
          ? `<a class="g-card__link" href="${link(locale, `${ROUTES.products}/${brand.slug}`)}">${esc(brand.name)}</a>`
          : '') +
        `</li>`
      );
    })
    .join('');

  // Lightbox data travels as JSON so the script needs no second fetch.
  const payload = gallery.items
    .map((item) => {
      const entry = galleryImages[item.id];
      const brand = catalog.brands.find((b) => b.slug === item.brand);
      const largest = entry.fallback[entry.fallback.length - 1];
      return {
        src: `{{BASE}}assets/gallery/${largest.file}`,
        w: largest.width,
        h: largest.height,
        alt: item[locale] ?? item.en,
        brand: brand ? brand.name : null,
        href: brand ? link(locale, `${ROUTES.products}/${brand.slug}`) : null,
      };
    });

  return (
    `<section class="band gallery-band"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<p class="eyebrow">${esc(i18n.nav.brands)}</p>` +
    `<h2>${esc(c.heading)}</h2><p>${esc(c.lead)}</p>` +
    `</div>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.brands)}">${esc(i18n.nav.brands)}</a>` +
    `</div>` +
    `<ul class="gallery" data-gallery aria-label="${esc(c.label)}">${cards}</ul>` +
    `</div>` +
    `<div class="lightbox" data-lightbox hidden>` +
    `<div class="lightbox__backdrop" data-lightbox-close></div>` +
    `<div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="${esc(c.lightboxLabel)}">` +
    `<figure class="lightbox__figure">` +
    `<img src="${payload[0].src}" width="${payload[0].w}" height="${payload[0].h}" alt="${esc(payload[0].alt)}" loading="lazy" decoding="async" data-lightbox-image>` +
    `<figcaption data-lightbox-caption>${esc(payload[0].alt)}</figcaption></figure>` +
    `<div class="lightbox__bar">` +
    `<a class="btn btn--onDark btn--sm" data-lightbox-brand href="${payload[0].href ?? link(locale, ROUTES.brands)}">${esc(c.viewBrand)}</a>` +
    `<div class="lightbox__nav">` +
    `<button type="button" class="hero-arrow" data-lightbox-prev aria-label="${esc(c.prev)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` +
    `<button type="button" class="hero-arrow" data-lightbox-next aria-label="${esc(c.next)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>` +
    `<button type="button" class="hero-arrow" data-lightbox-close aria-label="${esc(c.close)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg></button>` +
    `</div></div></div></div>` +
    `<script type="application/json" data-gallery-data>${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>` +
    `</section>`
  );
}
