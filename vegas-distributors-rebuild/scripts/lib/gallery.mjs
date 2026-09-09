/** Brands in Motion: a scroll-driven showcase above a plain browsing grid. */
import { esc, picture, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';

export function galleryPage({ i18n, locale, gallery, galleryImages, catalog }) {
  const c = i18n.gallery;
  const items = gallery.items.filter((item) => galleryImages[item.id]);
  const total = items.length;

  const brandOf = (item) => catalog.brands.find((b) => b.slug === item.brand);

  /* The showcase. Without script it is an ordinary stack of figures; the
     script turns it into a sticky, depth-sorted sequence. */
  const showcase =
    `<section class="showcase" data-showcase style="--count:${total}" aria-label="${esc(c.showcaseLabel)}">` +
    `<div class="showcase__stage">` +
    `<ol class="showcase__list">` +
    items
      .map((item, i) => {
        const entry = galleryImages[item.id];
        const brand = brandOf(item);
        const alt = item[locale] ?? item.en;
        return (
          `<li class="showcase__item" data-index="${i}">` +
          `<figure>` +
          picture(entry, {
            alt,
            sizes: '(max-width: 60rem) 92vw, 60vw',
            loading: i === 0 ? 'eager' : 'lazy',
            fetchpriority: i === 0 ? 'high' : undefined,
          }) +
          `<figcaption>` +
          (brand ? `<span class="showcase__brand">${esc(brand.name)}</span>` : '') +
          `<span class="showcase__caption">${esc(alt)}</span>` +
          `</figcaption>` +
          `</figure>` +
          `</li>`
        );
      })
      .join('') +
    `</ol>` +
    `<div class="showcase__hud" data-showcase-hud hidden>` +
    `<p class="showcase__counter"><span data-showcase-current>1</span> <span aria-hidden="true">/</span> ${total}` +
    `<span class="visually-hidden" data-showcase-status role="status"></span></p>` +
    `<div class="showcase__progress"><span data-showcase-bar></span></div>` +
    `<a class="btn btn--onDark btn--sm showcase__skip" href="#gallery-grid">${esc(c.skip)}</a>` +
    `</div>` +
    `</div>` +
    `</section>`;

  /* The grid. Uniform tiles, laid out to browse rather than to perform. */
  const grid =
    `<section class="band band--sunken" id="gallery-grid" tabindex="-1">` +
    `<div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<h2>${esc(c.gridHeading)}</h2><p>${esc(c.gridLead)}</p>` +
    `</div>` +
    `<a class="btn btn--outline" href="${link(locale, ROUTES.brands)}">${esc(i18n.nav.brands)}</a>` +
    `</div>` +
    `<ul class="tile-grid" data-gallery aria-label="${esc(c.label)}">` +
    items
      .map((item, i) => {
        const entry = galleryImages[item.id];
        const brand = brandOf(item);
        const alt = item[locale] ?? item.en;
        return (
          `<li class="tile-card">` +
          `<button type="button" class="tile-card__button" data-index="${i}"` +
          ` aria-label="${esc(t(c.openLabel, { name: alt }))}">` +
          picture(entry, { alt, sizes: '(max-width: 48rem) 46vw, (max-width: 75rem) 30vw, 22vw' }) +
          `</button>` +
          (brand
            ? `<a class="tile-card__link" href="${link(locale, `${ROUTES.products}/${brand.slug}`)}">${esc(brand.name)}</a>`
            : '') +
          `</li>`
        );
      })
      .join('') +
    `</ul>` +
    `</div></section>`;

  const payload = items.map((item) => {
    const entry = galleryImages[item.id];
    const brand = brandOf(item);
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

  const lightbox =
    `<div class="lightbox" data-lightbox hidden>` +
    `<div class="lightbox__backdrop" data-lightbox-close></div>` +
    `<div class="lightbox__panel" role="dialog" aria-modal="true" aria-label="${esc(c.lightboxLabel)}">` +
    `<figure class="lightbox__figure">` +
    `<img src="${payload[0].src}" width="${payload[0].w}" height="${payload[0].h}" alt="${esc(payload[0].alt)}"` +
    ` loading="lazy" decoding="async" data-lightbox-image>` +
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
    `</div></div></div></div>`;

  const body =
    `<section class="page-hero page-hero--gallery"><div class="shell">` +
    `<p class="eyebrow">${esc(i18n.nav.gallery)}</p>` +
    `<h1>${esc(c.heading)}</h1>` +
    `<p class="lead">${esc(c.lead)}</p>` +
    `</div></section>` +
    showcase +
    grid +
    lightbox +
    `<button type="button" class="to-top" data-to-top hidden aria-label="${esc(c.top)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 19V6M6 12l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<span>${esc(c.top)}</span></button>` +
    `<script type="application/json" data-gallery-data>${JSON.stringify(payload).replace(/</g, '\\u003c')}</script>`;

  return { body, pageStyles: ['gallery.css'], pageScripts: ['gallery.js'] };
}
