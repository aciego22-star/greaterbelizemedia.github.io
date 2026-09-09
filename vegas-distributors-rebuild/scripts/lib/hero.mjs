/** Campaign hero carousel. */
import { esc, picture, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';

/**
 * Responsive <picture> for a campaign background.
 * The first slide loads eagerly and is the LCP candidate; the rest are lazy.
 */
function background(entry, { alt, eager }) {
  const srcset = (list, dir) => list.map((s) => `{{BASE}}assets/heroes/${s.file} ${s.width}w`).join(', ');
  // The hero is full-bleed, so the image is always viewport-width.
  const sizes = '100vw';
  const largest = entry.fallback[entry.fallback.length - 1];

  return (
    `<picture class="hero-slide__bg">` +
    `<source type="image/avif" srcset="${srcset(entry.avif)}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${srcset(entry.webp)}" sizes="${sizes}">` +
    `<img src="{{BASE}}assets/heroes/${largest.file}" srcset="${srcset(entry.fallback)}" sizes="${sizes}"` +
    ` width="${entry.width}" height="${entry.height}" alt="${esc(alt)}"` +
    ` loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"` +
    (eager ? ' fetchpriority="high"' : '') +
    `>` +
    `</picture>`
  );
}

/**
 * Product artwork layered over the background.
 * Sources have white backgrounds, so each sits on a brand plate rather than
 * being machine-cut, which would chew into the labels.
 */
function productLayer(slide, { images, heroes, copy }) {
  const items = slide.products
    .map((p) => {
      const entry =
        p.source === 'brand' ? images.brands[p.slug]?.photos?.[p.photo ?? 0]
        : p.source === 'campaign' ? heroes[p.key]
        : images.divisions[p.key];
      if (!entry) return '';
      const sizes =
        slide.productLayout === 'stack' ? '(max-width: 60rem) 44vw, 300px'
        : slide.productLayout === 'pair' ? '(max-width: 60rem) 38vw, 210px'
        : '(max-width: 60rem) 62vw, 420px';
      // Never display a source above its intrinsic width: the ILB artwork in
      // particular is only 336px wide and would visibly soften if stretched.
      const cap = slide.productLayout === 'single' ? Math.min(420, entry.width) : null;
      return (
        `<div class="hero-product${p.plate ? ' hero-product--plate' : ''}"` +
        (cap ? ` style="max-width:${cap + 24}px"` : '') +
        `>${picture(entry, { alt: '', sizes })}</div>`
      );
    })
    .join('');

  if (!items) return '';
  return (
    `<div class="hero-slide__products hero-slide__products--${esc(slide.productLayout)}" role="img" aria-label="${esc(copy.productAlt)}">` +
    items +
    `</div>`
  );
}

export function heroCarousel({ i18n, locale, images, heroes, campaign }) {
  const c = i18n.hero;

  const destination = (target) => {
    const route = ROUTES[target.route];
    return `${link(locale, route)}${target.query ?? ''}`.replace(/&/g, '&amp;');
  };

  const slides = campaign.slides
    .map((slide, i) => {
      const copy = c.slides[slide.id];
      const entry = heroes[slide.background];
      const first = i === 0;

      return (
        `<div class="hero-slide hero-slide--${esc(slide.tone)}" id="hero-slide-${esc(slide.id)}"` +
        ` role="group" aria-roledescription="slide" aria-label="${i + 1} / ${campaign.slides.length}: ${esc(copy.eyebrow)}"` +
        `${first ? '' : ' data-inert="true"'}>` +
        background(entry, { alt: '', eager: first }) +
        `<div class="hero-slide__scrim"></div>` +
        `<div class="shell hero-slide__inner">` +
        `<div class="hero-slide__copy">` +
        `<p class="hero-eyebrow">${esc(copy.eyebrow)}</p>` +
        `<h2 class="hero-headline">${esc(copy.headline)}</h2>` +
        `<p class="hero-body">${esc(copy.body)}</p>` +
        `<div class="hero-actions">` +
        `<a class="btn btn--primary btn--lg" href="${destination(slide.primary)}">${esc(copy.primary)}</a>` +
        `<a class="btn btn--onDark btn--lg" href="${destination(slide.secondary)}">${esc(copy.secondary)}</a>` +
        `</div>` +
        `</div>` +
        productLayer(slide, { images, heroes, copy }) +
        `</div>` +
        `</div>`
      );
    })
    .join('');

  const dots = campaign.slides
    .map(
      (slide, i) =>
        `<button type="button" class="hero-dot" data-index="${i}"` +
        ` aria-label="${esc(t(c.goTo, { n: i + 1 }))}" aria-controls="hero-slide-${esc(slide.id)}"` +
        `${i === 0 ? ' aria-current="true"' : ''}>` +
        `<span class="hero-dot__label" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>` +
        `</button>`
    )
    .join('');

  return (
    `<section class="hero" aria-roledescription="carousel" aria-label="${esc(c.label)}" data-hero>` +
    `<div class="hero-track">${slides}</div>` +
    `<div class="hero-controls shell">` +
    `<div class="hero-nav">` +
    `<button type="button" class="hero-arrow" data-hero-prev aria-label="${esc(c.prev)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `<button type="button" class="hero-arrow" data-hero-next aria-label="${esc(c.next)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `</div>` +
    `<div class="hero-dots" role="group" aria-label="${esc(c.label)}">${dots}</div>` +
    `<p class="hero-disclosure">${esc(c.conceptNote)}</p>` +
    `</div>` +
    `</section>`
  );
}
