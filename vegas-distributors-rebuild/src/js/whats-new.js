/* What's New filters.
 *
 * The page is complete without this: every card is already rendered and the
 * chips are ordinary buttons. All this adds is hiding the cards that do not
 * match, so a script that never loads leaves the full list behind.
 */
(function () {
  'use strict';

  var bar = document.querySelector('[data-wn-filters]');
  if (!bar) return;

  var chips = Array.prototype.slice.call(bar.querySelectorAll('.wn-chip'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('[data-wn-section]'));
  if (!chips.length || !sections.length) return;

  function apply(filter) {
    chips.forEach(function (chip) {
      chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter') === filter));
    });

    sections.forEach(function (section) {
      var cards = Array.prototype.slice.call(section.querySelectorAll('.wn-card'));
      var shown = 0;
      cards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.hidden = !match;
        if (match) shown++;
      });

      // A whole band disappears when nothing in it matches, rather than
      // leaving a heading over an empty space.
      var empty = section.querySelector('[data-wn-empty]');
      if (empty) empty.hidden = shown !== 0;
      section.hidden = shown === 0 && sections.length > 1 && filter !== 'all';
    });
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      apply(chip.getAttribute('data-filter'));
    });
  });

  // A category can be linked to directly, so a campaign can point at exactly
  // the part of the page it is about.
  var wanted = 'all';
  try {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('category');
    if (q && chips.some(function (chip) { return chip.getAttribute('data-filter') === q; })) wanted = q;
  } catch (e) {}

  apply(wanted);

  /* ------------------------------------------------------------------ *
   * Arrival
   *
   * Cards settle into place as their grid comes into view. Arming is done
   * here rather than in the stylesheet, so a page whose script fails shows
   * every card outright instead of a grid of invisible ones.
   * ------------------------------------------------------------------ */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduced.matches || !('IntersectionObserver' in window)) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

  Array.prototype.forEach.call(document.querySelectorAll('[data-wn-grid]'), function (grid) {
    grid.classList.add('is-armed');
    Array.prototype.forEach.call(grid.querySelectorAll('.wn-card'), function (card, i) {
      // The stagger repeats every few cards so a long list never ends up
      // waiting a noticeable amount of time for its last item.
      card.style.setProperty('--wn-delay', (i % 4) * 70 + 'ms');
      observer.observe(card);
    });
  });
})();
