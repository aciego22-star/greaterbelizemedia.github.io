/** Immersive full-bleed campaign hero. */
import { esc, picture, t } from './html.mjs';
import { ROUTES, link } from './layout.mjs';

/**
 * Full-bleed background. The first slide is the LCP candidate and loads
 * eagerly; the rest are lazy. Sizes is always 100vw because the image bleeds
 * to every edge.
 */
function background(entry, { eager }) {
  const set = (list) => list.map((s) => `{{BASE}}assets/heroes/${s.file} ${s.width}w`).join(', ');
  const largest = entry.fallback[entry.fallback.length - 1];

  return (
    `<picture class="hero-bg">` +
    `<source type="image/avif" srcset="${set(entry.avif)}" sizes="100vw">` +
    `<source type="image/webp" srcset="${set(entry.webp)}" sizes="100vw">` +
    `<img src="{{BASE}}assets/heroes/${largest.file}" srcset="${set(entry.fallback)}" sizes="100vw"` +
    ` width="${entry.width}" height="${entry.height}" alt=""` +
    ` loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"` +
    (eager ? ' fetchpriority="high"' : '') +
    `>` +
    `</picture>`
  );
}

/**
 * Exact product artwork, layered as its own element over the stage pedestal.
 * Nothing is redrawn and no packaging text is baked into a bitmap.
 */
function productLayer(slide, { images, heroes, copy }) {
  const p = slide.product;
  if (!p) return '';

  const entry =
    p.source === 'campaign' ? heroes[p.key]
    : p.source === 'brand' ? images.brands[p.key]?.photos?.[0]
    : images.divisions[p.key];
  if (!entry) return '';

  const mark = p.mark ? images.divisions[p.mark] : null;
  const widest = entry.fallback[entry.fallback.length - 1].width;

  // The stage position is a per-slide placement over the pedestal in the
  // artwork; below the breakpoint the layer becomes a normal block instead.
  const style =
    `--stage-left:${p.stage.left};--stage-top:${p.stage.top};` +
    `--stage-width:${p.stage.width};--stage-max:${Math.min(p.stage.max, widest)}px`;

  return (
    `<div class="hero-stage" style="${esc(style)}">` +
    (mark ? `<span class="hero-stage__mark">${picture(mark, { alt: '', sizes: '150px' })}</span>` : '') +
    `<div class="hero-stage__art">` +
    picture(entry, { alt: copy.productAlt ?? '', sizes: `(max-width: 60rem) 40vw, ${p.stage.width}` }) +
    `</div>` +
    `</div>`
  );
}

export function heroCarousel({ i18n, locale, images, heroes, campaign, catalog }) {
  const c = i18n.hero;

  const destination = (target) => {
    if (target.route === 'brand') return link(locale, `${ROUTES.products}/${target.slug}`);
    return link(locale, ROUTES[target.route]);
  };

  const slides = campaign.slides
    .map((slide, i) => {
      const copy = c.slides[slide.id];
      const entry = heroes[slide.background];
      const first = i === 0;

      return (
        `<div class="hero-slide hero-slide--${esc(slide.tone)}" id="hero-slide-${esc(slide.id)}"` +
        ` role="group" aria-roledescription="slide"` +
        ` aria-label="${i + 1} / ${campaign.slides.length}: ${esc(copy.eyebrow)}"` +
        ` style="--pos-wide:${esc(slide.objectPosition.wide)};--pos-narrow:${esc(slide.objectPosition.narrow)}"` +
        `${first ? '' : ' data-inert="true"'}>` +
        `<div class="hero-slide__media" data-parallax>` + background(entry, { eager: first }) + `</div>` +
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
        `<span class="hero-dot__bar" aria-hidden="true"></span>` +
        `</button>`
    )
    .join('');

  return (
    `<section class="hero" aria-roledescription="carousel" aria-label="${esc(c.label)}" data-hero>` +
    `<div class="hero-track">${slides}</div>` +
    `<div class="hero-controls">` +
    `<div class="shell hero-controls__inner">` +
    `<div class="hero-nav">` +
    `<button type="button" class="hero-arrow" data-hero-prev aria-label="${esc(c.prev)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `<button type="button" class="hero-arrow" data-hero-next aria-label="${esc(c.next)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 4l8 8-8 8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `</div>` +
    `<div class="hero-dots" role="group" aria-label="${esc(c.label)}">${dots}</div>` +
    `</div></div>` +
    `</section>`
  );
}
