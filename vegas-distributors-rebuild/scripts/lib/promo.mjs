/**
 * Promoted products on the homepage.
 *
 * A queue of products waits along the foot of the stage. One at a time the next
 * in line rises into the light, turns on its own axis for a few seconds, then
 * sinks away and joins the back of the queue. Its description and its call to
 * action travel with it.
 *
 * The artwork is a flat render, so turning it in real three dimensions would
 * leave it edge on and invisible twice a revolution. It is turned instead the
 * way a photographer turns a product on a turntable: the face narrows and
 * widens and darkens as it goes round, and never thins to nothing.
 *
 * Everything is rendered up front and every panel is in the markup, so a
 * visitor without JavaScript, and a visitor who has asked for less motion, sees
 * the first product complete and standing still. The other two are listed
 * immediately below, so nothing is out of reach either way.
 */
import { esc, picture } from './html.mjs';
import { ROUTES, routeIn, link } from './layout.mjs';

export function promoShowcase({ i18n, locale, productArt, featured, company }) {
  const c = i18n.home;
  const p = c.promo;

  const destination = (item) =>
    item.route.type === 'brand'
      ? link(locale, `${ROUTES.products}/${item.route.slug}`)
      : link(locale, routeIn(locale, ROUTES[item.route.key]));

  // Position in the queue is a class, not a place in the source order, so the
  // whole line can move up one without anything being moved in the document.
  const place = (i) => (i === 0 ? ' is-current' : i === 1 ? ' is-next' : ' is-queued');

  const stage = featured.items
    .map((item, i) => {
      const copy = p.items[item.id];
      return (
        `<div class="promo__slot${place(i)}" data-promo-slot="${esc(item.id)}"` +
        `${i === 0 ? '' : ' aria-hidden="true"'}>` +
        `<div class="promo__turn">` +
        picture(productArt[item.image], {
          alt: copy.alt,
          sizes: '(max-width: 60rem) 60vw, 260px',
          loading: 'lazy',
        }) +
        `</div>` +
        `</div>`
      );
    })
    .join('');

  const panels = featured.items
    .map((item, i) => {
      const copy = p.items[item.id];
      return (
        `<div class="promo__panel${i === 0 ? ' is-current' : ''}" data-promo-panel="${esc(item.id)}"` +
        `${i === 0 ? '' : ' aria-hidden="true"'}>` +
        `<h3>${esc(copy.name)}</h3>` +
        `<p>${esc(copy.body)}</p>` +
        `<div class="actions">` +
        `<a class="btn btn--primary" href="${destination(item)}">${esc(copy.action)}</a>` +
        `<a class="btn btn--onDark" href="mailto:${esc(company.email)}?subject=` +
        `${encodeURIComponent(`${copy.name} enquiry`)}">${esc(i18n.actions.enquire)}</a>` +
        `</div>` +
        `</div>`
      );
    })
    .join('');

  return (
    `<article class="featured__lead promo" data-promo data-promo-interval="${featured.intervalMs}"` +
    ` aria-label="${esc(p.label)}">` +
    `<figure class="promo__stage">${stage}</figure>` +
    `<div class="featured__lead-body promo__body">` +
    `<p class="eyebrow" style="color:var(--yellow)">${esc(c.featuredLeadNote)}</p>` +
    `<div class="promo__panels">${panels}</div>` +
    `</div>` +
    `</article>`
  );
}
