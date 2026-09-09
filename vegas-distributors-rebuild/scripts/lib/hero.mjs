/**
 * Campaign hero.
 *
 * Each slide is a finished composition supplied by the client, in a landscape
 * cut for wide screens and a portrait cut for phones. They are art direction
 * rather than one picture at two sizes, so the two cuts are offered as separate
 * <source> elements keyed on a media query, and the portrait file is never
 * produced by cropping the landscape one.
 *
 * The headline and the branding are already inside the artwork, so nothing is
 * drawn on top of it except one call to action. The slide as a whole is a link
 * to the same destination, with the visible control as the accessible name, so
 * a pointer can hit anywhere while a keyboard still meets one stop per slide.
 */
import { esc, t } from './html.mjs';
import { ROUTES, routeIn, link } from './layout.mjs';

/** One art-directed picture: portrait below the breakpoint, landscape above. */
function campaignPicture(art, { campaignImages, alt, eager }) {
  const desktop = campaignImages[art.desktop];
  const mobile = campaignImages[art.mobile];
  if (!desktop || !mobile) return '';

  const set = (entry, list) =>
    entry[list].map((s) => `{{BASE}}assets/campaign/${s.file} ${s.width}w`).join(', ');

  // Below 48rem the slide is a tall portrait, so the portrait cut is asked for
  // at the full viewport width; above it the landscape cut bleeds edge to edge.
  const portraitMedia = '(max-width: 47.999rem)';
  const largest = desktop.fallback[desktop.fallback.length - 1];

  return (
    `<picture class="campaign-art">` +
    `<source media="${portraitMedia}" type="image/avif" srcset="${set(mobile, 'avif')}" sizes="100vw">` +
    `<source media="${portraitMedia}" type="image/webp" srcset="${set(mobile, 'webp')}" sizes="100vw">` +
    `<source media="${portraitMedia}" type="image/jpeg" srcset="${set(mobile, 'fallback')}" sizes="100vw">` +
    `<source type="image/avif" srcset="${set(desktop, 'avif')}" sizes="100vw">` +
    `<source type="image/webp" srcset="${set(desktop, 'webp')}" sizes="100vw">` +
    `<img src="{{BASE}}assets/campaign/${largest.file}" srcset="${set(desktop, 'fallback')}" sizes="100vw"` +
    ` width="${desktop.width}" height="${desktop.height}" alt="${esc(alt)}"` +
    ` loading="${eager ? 'eager' : 'lazy'}" decoding="${eager ? 'sync' : 'async'}"` +
    (eager ? ' fetchpriority="high"' : '') +
    `>` +
    `</picture>`
  );
}

/**
 * The video slide.
 *
 * The film is portrait and the wide hero is landscape, so on a wide screen it
 * is shown whole at its own proportions against a blurred copy of its poster
 * rather than being cropped or stretched to fill. On a phone the slide is
 * already portrait and the film fills it.
 *
 * The poster is a real picture element: it stands in while the file loads and
 * it replaces the film entirely for a visitor who has asked for reduced motion.
 */
function videoSlide({ video, copy, eager }) {
  const posterSet = (list) =>
    video.poster[list].map((s) => `{{BASE}}assets/video/${s.file} ${s.width}w`).join(', ');
  const posterLargest = video.poster.fallback[video.poster.fallback.length - 1];
  const sizes = '(max-width: 47.999rem) 100vw, 42vh';

  const poster =
    `<picture class="hero-video__poster">` +
    `<source type="image/avif" srcset="${posterSet('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${posterSet('webp')}" sizes="${sizes}">` +
    `<img src="{{BASE}}assets/video/${posterLargest.file}" srcset="${posterSet('fallback')}" sizes="${sizes}"` +
    ` width="${video.poster.width}" height="${video.poster.height}" alt="${esc(copy.alt)}"` +
    ` loading="${eager ? 'eager' : 'lazy'}" decoding="async">` +
    `</picture>`;

  const sources = video.sources
    .map((s) => `<source src="{{BASE}}assets/video/${esc(s.file)}" type="${esc(s.type)}">`)
    .join('');

  // preload="none" keeps the film off the wire until its slide is reached.
  // The element carries no controls attribute: the two buttons below are the
  // controls, so they stay inside the site's own design and focus order.
  const film =
    `<video class="hero-video__film" data-hero-video` +
    ` width="${video.width}" height="${video.height}"` +
    ` playsinline loop preload="none"` +
    ` poster="{{BASE}}assets/video/${posterLargest.file}"` +
    ` aria-label="${esc(copy.description)}">` +
    sources +
    `</video>`;

  return (
    `<div class="hero-video" data-video-stage>` +
    `<div class="hero-video__backdrop" aria-hidden="true">` +
    `<img src="{{BASE}}assets/video/${video.poster.fallback[0].file}" alt="" width="${video.poster.fallback[0].width}"` +
    ` height="${video.poster.fallback[0].height}" loading="lazy" decoding="async">` +
    `</div>` +
    `<div class="hero-video__frame">` +
    poster +
    film +
    `</div>` +
    `</div>`
  );
}

/** The two media controls that ride with the video slide. */
function videoControls(copy) {
  return (
    `<div class="hero-media" data-video-controls hidden>` +
    `<button type="button" class="hero-media__btn" data-video-toggle aria-label="${esc(copy.pause)}"` +
    ` data-label-play="${esc(copy.play)}" data-label-pause="${esc(copy.pause)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="pause"><path d="M8 5h3v14H8zM13 5h3v14h-3z" fill="currentColor"/></svg>` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="play" hidden><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>` +
    `</button>` +
    `<button type="button" class="hero-media__btn" data-video-sound aria-label="${esc(copy.mute)}"` +
    ` data-label-sound="${esc(copy.sound)}" data-label-mute="${esc(copy.mute)}">` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="sound-on"><path d="M4 9v6h4l5 4V5L8 9zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" data-icon="sound-off" hidden><path d="M4 9v6h4l5 4V5L8 9zM17 9.5l4 5M21 9.5l-4 5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>` +
    `</button>` +
    `</div>`
  );
}

export function heroCarousel({ i18n, locale, campaign, campaignImages, video }) {
  const c = i18n.hero;
  const total = campaign.slides.length;

  const destination = (target) =>
    target.route === 'brand'
      ? link(locale, `${ROUTES.products}/${target.slug}`)
      : link(locale, routeIn(locale, ROUTES[target.route]));

  const slides = campaign.slides
    .map((slide, i) => {
      const copy = c.slides[slide.id];
      const first = i === 0;
      const href = destination(slide.cta);

      const media =
        slide.kind === 'video'
          ? videoSlide({ video, copy, eager: first })
          : campaignPicture(slide.art, { campaignImages, alt: copy.alt, eager: first });

      return (
        `<div class="hero-slide hero-slide--${esc(slide.tone)}" id="hero-slide-${esc(slide.id)}"` +
        ` data-slide="${esc(slide.id)}"${slide.kind === 'video' ? ' data-kind="video"' : ''}` +
        ` role="group" aria-roledescription="slide"` +
        ` aria-label="${i + 1} / ${total}: ${esc(copy.name)}"` +
        `${first ? '' : ' data-inert="true"'}>` +
        // One link covers the artwork so a pointer can press anywhere. It is
        // hidden from assistive technology because the visible control below
        // carries the same destination and a real label.
        `<a class="hero-slide__hit" href="${href}" tabindex="-1" aria-hidden="true"></a>` +
        `<div class="hero-slide__media">${media}</div>` +
        `<div class="hero-slide__foot"><div class="shell hero-slide__foot-inner">` +
        `<a class="btn btn--primary btn--lg hero-slide__cta" href="${href}">${esc(copy.cta)}</a>` +
        (slide.kind === 'video' ? videoControls(copy) : '') +
        `</div></div>` +
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
