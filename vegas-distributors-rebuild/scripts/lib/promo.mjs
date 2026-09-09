/**
 * Promoted products on the homepage.
 *
 * One product at a time turns slowly on its own axis and, every few seconds,
 * sinks out of view while the next rises to take its place. Its description and
 * its call to action travel with it.
 *
 * The artwork is a flat render, so a turn past ninety degrees would show the
 * label back to front. The picture is flipped at exactly the two moments it is
 * edge on to the viewer, which is the moment it cannot be seen, so the label
 * reads the right way round all the way through.
 *
 * Everything is rendered up front and every panel is in the markup, so a
 * visitor without JavaScript sees the first product complete, and a visitor who
 * has asked for less motion sees it standing still.
 */
import { esc, picture, t } from './html.mjs';
import { ROUTES, routeIn, link } from './layout.mjs';

export function promoShowcase({ i18n, locale, productArt, featured, company }) {
  const c = i18n.home;
  const p = c.promo;

  const destination = (item) =>
    item.route.type === 'brand'
      ? link(locale, `${ROUTES.products}/${item.route.slug}`)
      : link(locale, routeIn(locale, ROUTES[item.route.key]));

  const stage = featured.items
    .map((item, i) => {
      const copy = p.items[item.id];
      return (
        `<div class="promo__slot${i === 0 ? ' is-current' : ''}" data-promo-slot="${esc(item.id)}"` +
        `${i === 0 ? '' : ' aria-hidden="true"'}>` +
        `<div class="promo__turn">` +
        picture(productArt[item.image], {
          alt: copy.alt,
          sizes: '(max-width: 60rem) 70vw, 320px',
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

  const dots = featured.items
    .map(
      (item, i) =>
        `<button type="button" class="promo__dot" data-promo-dot="${esc(item.id)}"` +
        ` aria-label="${esc(t(p.goTo, { name: p.items[item.id].name }))}"` +
        `${i === 0 ? ' aria-current="true"' : ''}>` +
        `<span class="promo__dot-bar" aria-hidden="true"></span>` +
        `</button>`
    )
    .join('');

  return (
    `<article class="featured__lead promo" data-promo data-promo-interval="${featured.intervalMs}"` +
    ` aria-roledescription="carousel" aria-label="${esc(p.label)}">` +
    `<figure class="promo__stage">${stage}</figure>` +
    `<div class="featured__lead-body promo__body">` +
    `<p class="eyebrow" style="color:var(--yellow)">${esc(c.featuredLeadNote)}</p>` +
    `<div class="promo__panels">${panels}</div>` +
    `<div class="promo__dots" role="group" aria-label="${esc(p.label)}">${dots}</div>` +
    `<p class="visually-hidden" aria-live="polite" data-promo-status></p>` +
    `</div>` +
    `</article>`
  );
}
