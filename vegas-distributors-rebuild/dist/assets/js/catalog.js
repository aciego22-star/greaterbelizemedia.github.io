/* Brand directory search and filtering.
   Runs entirely on the pre-rendered list, so every brand is present and
   crawlable before this file executes. */
(function () {
  'use strict';

  var form = document.getElementById('brand-filters');
  var grid = document.getElementById('brand-grid');
  var empty = document.getElementById('no-results');
  var count = document.getElementById('result-count');
  if (!form || !grid || !count) return;

  var search = document.getElementById('brand-search');
  var category = document.getElementById('brand-category');
  var division = document.getElementById('brand-division');
  var clear = document.getElementById('clear-filters');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.brand-card'));

  // Templates carry {count}; the singular form is a separate string because
  // English and Spanish both inflect the noun.
  var TEMPLATE = count.getAttribute('data-template') || count.textContent.replace(/\d+/, '{count}');
  var TEMPLATE_ONE = count.getAttribute('data-template-one') || TEMPLATE;

  var normalise = function (value) {
    return (value || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  };

  var apply = function () {
    var q = normalise(search && search.value);
    var cat = (category && category.value) || '';
    var div = (division && division.value) || '';
    var shown = 0;

    cards.forEach(function (card) {
      var matchesText =
        !q ||
        normalise(card.getAttribute('data-name')).indexOf(q) > -1 ||
        normalise(card.getAttribute('data-products')).indexOf(q) > -1;

      var matchesCategory = !cat || (card.getAttribute('data-categories') || '').split(' ').indexOf(cat) > -1;
      var matchesDivision = !div || card.getAttribute('data-division') === div;
      var visible = matchesText && matchesCategory && matchesDivision;

      card.hidden = !visible;
      if (visible) shown++;
    });

    count.textContent = shown === 1 ? TEMPLATE_ONE : TEMPLATE.replace('{count}', String(shown));
    if (empty) empty.hidden = shown !== 0;
    grid.hidden = shown === 0;
  };

  // Deep links from the category tiles and the homepage arrive as ?category=.
  var params = new URLSearchParams(window.location.search);
  if (params.get('category') && category) category.value = params.get('category');
  if (params.get('division') && division) division.value = params.get('division');
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
  if (division) division.addEventListener('change', apply);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    apply();
  });

  if (clear) {
    clear.addEventListener('click', function () {
      // Reset fires after this handler, so clear the values directly.
      if (search) search.value = '';
      if (category) category.value = '';
      if (division) division.value = '';
      apply();
      if (search) search.focus();
    });
  }

  apply();
})();
