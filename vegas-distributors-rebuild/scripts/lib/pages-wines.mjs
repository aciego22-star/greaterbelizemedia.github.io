/**
 * Vega's Wines & Spirits.
 *
 * The page states only what the client's own materials state. The brand names
 * and their variants are read off the supplied campaign artwork and the
 * September raffle flyer; the venue list is read off the on-screen titles in
 * the supplied campaign film. Nothing here claims availability, sizes, prices,
 * strengths, distribution rights or that any campaign is currently running.
 */
import { esc, picture } from './html.mjs';
import { ROUTES, routeIn, link } from './layout.mjs';
import { socialLinks } from './partials.mjs';

export function winesPage(ctx) {
  const { i18n, locale, wines, campaignImages, video, company, winesArt } = ctx;
  const c = i18n.wines;

  const desktop = campaignImages['wines-and-spirits-desktop'];
  const mobile = campaignImages['wines-and-spirits-mobile'];
  const set = (entry, list) =>
    entry[list].map((s) => `{{BASE}}assets/campaign/${s.file} ${s.width}w`).join(', ');
  const portraitMedia = '(max-width: 47.999rem)';
  const largest = desktop.fallback[desktop.fallback.length - 1];

  const hero =
    `<section class="ws-hero">` +
    `<picture class="ws-hero__art">` +
    `<source media="${portraitMedia}" type="image/avif" srcset="${set(mobile, 'avif')}" sizes="100vw">` +
    `<source media="${portraitMedia}" type="image/webp" srcset="${set(mobile, 'webp')}" sizes="100vw">` +
    `<source media="${portraitMedia}" type="image/jpeg" srcset="${set(mobile, 'fallback')}" sizes="100vw">` +
    `<source type="image/avif" srcset="${set(desktop, 'avif')}" sizes="100vw">` +
    `<source type="image/webp" srcset="${set(desktop, 'webp')}" sizes="100vw">` +
    `<img src="{{BASE}}assets/campaign/${largest.file}" srcset="${set(desktop, 'fallback')}" sizes="100vw"` +
    ` width="${desktop.width}" height="${desktop.height}" alt="${esc(c.heroAlt)}"` +
    ` loading="eager" decoding="sync" fetchpriority="high">` +
    `</picture>` +
    `</section>`;

  const intro =
    `<section class="band band--tight"><div class="shell ws-intro">` +
    `<p class="ws-tagline">${esc(c.tagline)}</p>` +
    `<h1>${esc(c.heading)}</h1>` +
    `<p class="lead">${esc(c.intro)}</p>` +
    `</div></section>`;

  const brandCards = wines.brands
    .map((b) => {
      // One studio photograph at the head of the card, shown whole.
      const art = winesArt?.[`${b.id}-display`];
      const shot = art
        ? picture(art, {
            alt: c.displayAlt?.[b.id] ?? b.name,
            className: 'ws-brand__media',
            sizes: '(max-width: 47.999rem) 92vw, (max-width: 75rem) 44vw, 25vw',
          })
        : '';
      return (
        `<li class="ws-brand">` +
        shot +
        `<div class="ws-brand__body">` +
        `<p class="ws-brand__kind">${esc(c.kinds[b.kind] ?? b.kind)}</p>` +
        `<h3>${esc(b.name)}</h3>` +
        `<p class="ws-brand__label">${esc(c.variantsLabel)}</p>` +
        `<ul class="ws-brand__variants">` +
        b.variants.map((v) => `<li>${esc(v)}</li>`).join('') +
        `</ul>` +
        `</div>` +
        `</li>`
      );
    })
    .join('');

  const brands =
    `<section class="band"><div class="shell">` +
    `<div class="band-head"><div class="band-head__text">` +
    `<h2>${esc(c.brandsHeading)}</h2>` +
    `<p>${esc(c.brandsNote)}</p>` +
    `</div></div>` +
    `<ul class="ws-brands">${brandCards}</ul>` +
    `</div></section>`;

  /* The film again, this time as a plain figure rather than a hero: a poster
     and a control, with nothing starting on its own. */
  const posterSet = (list) =>
    video.poster[list].map((s) => `{{BASE}}assets/video/${s.file} ${s.width}w`).join(', ');
  const posterLargest = video.poster.fallback[video.poster.fallback.length - 1];
  const sizes = '(max-width: 47.999rem) 88vw, 30rem';

  const venues = wines.campaign.venues
    .map((v) => `<li><strong>${esc(v.name)}</strong><span>${esc(v.town)}</span></li>`)
    .join('');

  const campaign =
    `<section class="band band--sunken"><div class="shell ws-campaign">` +
    `<div class="ws-campaign__text">` +
    `<h2>${esc(c.campaignHeading)}</h2>` +
    `<p class="lead">${esc(c.campaignBody)}</p>` +
    `<h3 class="ws-campaign__sub">${esc(c.venuesHeading)}</h3>` +
    `<ul class="ws-venues">${venues}</ul>` +
    socialLinks({ company, i18n, className: 'social social--inline' }) +
    `</div>` +
    `<figure class="ws-film">` +
    `<div class="ws-film__frame">` +
    `<picture class="ws-film__poster">` +
    `<source type="image/avif" srcset="${posterSet('avif')}" sizes="${sizes}">` +
    `<source type="image/webp" srcset="${posterSet('webp')}" sizes="${sizes}">` +
    `<img src="{{BASE}}assets/video/${posterLargest.file}" srcset="${posterSet('fallback')}" sizes="${sizes}"` +
    ` width="${video.poster.width}" height="${video.poster.height}" alt="${esc(i18n.hero.slides.jarana.alt)}"` +
    ` loading="lazy" decoding="async">` +
    `</picture>` +
    `<video class="ws-film__video" data-page-video controls playsinline preload="none"` +
    ` width="${video.width}" height="${video.height}"` +
    ` poster="{{BASE}}assets/video/${posterLargest.file}"` +
    ` aria-label="${esc(i18n.hero.slides.jarana.description)}">` +
    video.sources
      .map((s) => `<source src="{{BASE}}assets/video/${esc(s.file)}" type="${esc(s.type)}">`)
      .join('') +
    `</video>` +
    `<button type="button" class="ws-film__play" data-page-video-play>` +
    `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5l11 7-11 7z" fill="currentColor"/></svg>` +
    `<span>${esc(i18n.hero.slides.jarana.play)}</span>` +
    `</button>` +
    `</div>` +
    `<figcaption>${esc(i18n.hero.slides.jarana.description)}</figcaption>` +
    `</figure>` +
    `</div></section>`;

  const cta =
    `<section class="band cta-band"><div class="shell ws-cta">` +
    `<div>` +
    `<h2>${esc(c.contactHeading)}</h2>` +
    `<p class="lead">${esc(c.contactBody)}</p>` +
    `</div>` +
    `<div class="ws-cta__actions">` +
    `<a class="btn btn--primary btn--lg" href="${link(locale, routeIn(locale, ROUTES.network))}">${esc(c.findRep)}</a>` +
    `<a class="btn btn--onDark btn--lg" href="${link(locale, routeIn(locale, ROUTES.contact))}">${esc(c.contactSales)}</a>` +
    `</div>` +
    `</div></section>`;

  return {
    bodyClass: 'wines',
    pageStyles: ['wines.css'],
    pageScripts: ['wines.js'],
    body: hero + intro + brands + campaign + cta,
  };
}
