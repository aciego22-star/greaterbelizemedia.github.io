/**
 * What's New at Vega's Distributors.
 *
 * Every fact on this page comes from data/whats-new.json, which was filled in
 * from the client's own flyers. Nothing here infers a closing date, a prize, a
 * salary or an eligibility rule that a flyer does not state.
 *
 * Dated promotions move themselves into the archive once the date the flyer
 * announced has passed. Nothing is ever deleted.
 */
import { esc, picture, t } from './html.mjs';

const HR_EMAIL = 'hr@vegasdistributors.bz';

/** Formats a plain ISO date in the page's own language. */
const formatDate = (iso, locale) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString(locale === 'es' ? 'es-BZ' : 'en-BZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });

/** An item is archived once the date its own flyer announced has passed. */
const isArchived = (item, today) => Boolean(item.endsOn) && item.endsOn < today;

function statusFor(item, { c, locale, today }) {
  if (item.kind === 'job') return { label: c.statusOpen, tone: 'open' };
  if (isArchived(item, today)) {
    return { label: c.statusEnded, tone: 'ended', note: t(c.endedOn, { date: formatDate(item.endsOn, locale) }) };
  }
  return {
    label: c.statusRunning,
    tone: 'running',
    note: item.endsOn ? t(c.endsOn, { date: formatDate(item.endsOn, locale) }) : '',
  };
}

function detailList(heading, entries) {
  if (!entries || !entries.length) return '';
  return (
    `<div class="wn-card__block">` +
    `<h4>${esc(heading)}</h4>` +
    `<ul>${entries.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` +
    `</div>`
  );
}

function card(item, { c, locale, whatsNewImages, today, categories }) {
  const copy = item[locale];
  const status = statusFor(item, { c, locale, today });
  const image = whatsNewImages[item.image];
  const category = categories.find((x) => x.id === item.category);

  const action =
    item.kind === 'job'
      ? `<a class="btn btn--primary btn--sm" href="mailto:${HR_EMAIL}?subject=${encodeURIComponent(
          t(c.applySubject, { role: copy.title })
        )}">${esc(copy.cta)}</a>`
      : '';

  const body =
    item.kind === 'job'
      ? detailList(c.requirements, copy.requirements) +
        detailList(c.benefits, copy.benefits) +
        detailList(c.documents, copy.documents) +
        (copy.note ? `<p class="wn-card__note">${esc(copy.note)}</p>` : '')
      : detailList(c.howToEnter, copy.detail);

  return (
    `<li class="wn-card${status.tone === 'ended' ? ' is-ended' : ''}" data-category="${esc(item.category)}"` +
    ` data-state="${isArchived(item, today) ? 'archived' : 'current'}">` +
    `<article>` +
    `<div class="wn-card__media">` +
    picture(image, {
      alt: copy.imageAlt,
      sizes: '(max-width: 47.999rem) 92vw, (max-width: 74rem) 44vw, 30vw',
      className: 'wn-card__image',
    }) +
    `<p class="wn-card__badge wn-card__badge--${esc(status.tone)}">${esc(status.label)}</p>` +
    `</div>` +
    `<div class="wn-card__body">` +
    `<p class="wn-card__kicker">${esc(category ? category[locale] : copy.kicker)}</p>` +
    `<h3>${esc(copy.title)}</h3>` +
    (status.note ? `<p class="wn-card__when">${esc(status.note)}</p>` : '') +
    (item.location ? `<p class="wn-card__when">${esc(item.location)}</p>` : '') +
    `<p class="wn-card__summary">${esc(copy.summary)}</p>` +
    `<details class="wn-card__more">` +
    `<summary>${esc(c.moreLabel)}</summary>` +
    `<div class="wn-card__detail">${body}</div>` +
    `</details>` +
    (action ? `<div class="wn-card__actions">${action}</div>` : '') +
    `</div>` +
    `</article>` +
    `</li>`
  );
}

export function whatsNewPage(ctx) {
  const { i18n, locale, whatsNew, whatsNewImages, campaignImages } = ctx;
  const c = i18n.whatsNew;

  // A single date for the whole build, so the two languages never disagree
  // about which campaigns are still running.
  const today = new Date().toISOString().slice(0, 10);

  const current = whatsNew.items.filter((x) => !isArchived(x, today));
  const archived = whatsNew.items.filter((x) => isArchived(x, today));

  const desktop = campaignImages['whats-new-desktop'];
  const mobile = campaignImages['whats-new-mobile'];
  const set = (entry, list) =>
    entry[list].map((s) => `{{BASE}}assets/campaign/${s.file} ${s.width}w`).join(', ');
  const portraitMedia = '(max-width: 47.999rem)';
  const largest = desktop.fallback[desktop.fallback.length - 1];

  const hero =
    `<section class="wn-hero">` +
    `<picture class="wn-hero__art">` +
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
    `<section class="band band--tight"><div class="shell wn-intro">` +
    `<h1>${esc(c.heading)}</h1>` +
    `<p class="lead">${esc(c.caption)}</p>` +
    `</div></section>`;

  const filters =
    `<div class="wn-filters" role="group" aria-label="${esc(c.filtersLabel)}" data-wn-filters>` +
    whatsNew.categories
      .map(
        (cat, i) =>
          `<button type="button" class="wn-chip" data-filter="${esc(cat.id)}"` +
          `${i === 0 ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${esc(cat[locale])}</button>`
      )
      .join('') +
    `</div>`;

  const grid = (items, heading, note, id) =>
    items.length
      ? `<section class="band${id === 'archive' ? ' band--sunken' : ''}" data-wn-section="${esc(id)}">` +
        `<div class="shell">` +
        `<div class="band-head"><div class="band-head__text"><h2>${esc(heading)}</h2>` +
        (note ? `<p>${esc(note)}</p>` : '') +
        `</div></div>` +
        `<ul class="wn-grid" data-wn-grid>` +
        items.map((item) => card(item, { c, locale, whatsNewImages, today, categories: whatsNew.categories })).join('') +
        `</ul>` +
        `<p class="wn-empty" data-wn-empty hidden>${esc(c.empty)}</p>` +
        `</div></section>`
      : '';

  return {
    bodyClass: 'whats-new',
    pageStyles: ['whats-new.css'],
    pageScripts: ['whats-new.js'],
    body:
      hero +
      intro +
      `<section class="band wn-filter-band"><div class="shell">${filters}</div></section>` +
      grid(current, c.currentHeading, '', 'current') +
      grid(archived, c.archiveHeading, c.archiveNote, 'archive'),
  };
}

/*
 * No JobPosting structured data is emitted.
 *
 * The schema requires datePosted, and the supplied flyers carry no publication
 * date; the handoff's own manifest lists exact publication dates as a fact
 * still to be confirmed by the client. Emitting the type with a guessed date
 * would be manufacturing a required field, so the vacancies are published as
 * ordinary content until those dates are supplied.
 */
