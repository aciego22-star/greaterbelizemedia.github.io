/* Brand directory search and filtering.
 *
 * Scoped to each [data-brand-directory] block, so more than one directory can
 * live in a single document. The full list is server-rendered, so every brand
 * is present and crawlable before this file runs.
 */
(function () {
  'use strict';

  var normalise = function (value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  Array.prototype.forEach.call(document.querySelectorAll('[data-brand-directory]'), function (root) {
    var grid = root.querySelector('[data-brand-grid]');
    var count = root.querySelector('[data-result-count]');
    if (!grid || !count) return;

    var empty = root.querySelector('[data-no-results]');
    var search = root.querySelector('input[type="search"]');
    var category = root.querySelector('select[name="category"]');
    var clear = root.querySelector('[data-clear-filters]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.brand-card'));

    // English and Spanish both inflect the noun, so the singular is its own
    // string rather than a trimmed plural.
    var TEMPLATE = count.getAttribute('data-template') || '{count}';
    var TEMPLATE_ONE = count.getAttribute('data-template-one') || TEMPLATE;

    var apply = function () {
      var q = normalise(search && search.value);
      var cat = (category && category.value) || '';
      var shown = 0;

      cards.forEach(function (card) {
        var matchesText =
          !q ||
          normalise(card.getAttribute('data-name')).indexOf(q) > -1 ||
          normalise(card.getAttribute('data-products')).indexOf(q) > -1;
        var matchesCategory =
          !cat || (card.getAttribute('data-categories') || '').split(' ').indexOf(cat) > -1;
        var visible = matchesText && matchesCategory;

        card.hidden = !visible;
        if (visible) shown++;
      });

      count.textContent = shown === 1 ? TEMPLATE_ONE : TEMPLATE.replace('{count}', String(shown));
      if (empty) empty.hidden = shown !== 0;
      grid.hidden = shown === 0;
    };

    // Category tiles elsewhere on the site deep-link into this directory.
    var params = new URLSearchParams(window.location.search);
    if (params.get('category') && category) category.value = params.get('category');
    if (params.get('q') && search) search.value = params.get('q');

    var debounce = function (fn, wait) {
      var timer;
      return function () {
        clearTimeout(timer);
        timer = setTimeout(fn, wait);
      };
    };

    if (search) search.addEventListener('input', debounce(apply, 120));
    if (category) category.addEventListener('change', apply);
    if (clear) {
      clear.addEventListener('click', function () {
        if (search) search.value = '';
        if (category) category.value = '';
        apply();
        if (search) search.focus();
      });
    }

    apply();
  });
})();
