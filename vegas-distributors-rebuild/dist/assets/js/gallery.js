/* Brands in Motion.
 *
 * Two independent pieces: the scroll-driven showcase and the lightbox. The
 * page is complete without either of them, so each one only enhances what is
 * already rendered.
 *
 * Each piece is initialised per element rather than once per document, so a
 * page that happens to carry more than one gallery gets working controls on
 * all of them. On the built site there is only ever one of each.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var each = function (selector, fn) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), fn);
  };

  // The built page keeps everything inside one main element. Pair a grid with
  // its lightbox inside the nearest .view when one is present, so galleries
  // never reach across into each other.
  var scopeOf = function (el) {
    return (el.closest && el.closest('.view')) || document;
  };

  /* ---------------------------------------------------------------- *
   * Showcase
   *
   * The section is tall; its stage is sticky. Scroll position picks a
   * floating index, and each item is placed in depth by its distance from
   * that index. Scrolling itself is never intercepted.
   * ---------------------------------------------------------------- */

  function initShowcase(showcase) {
    var items = Array.prototype.slice.call(showcase.querySelectorAll('.showcase__item'));
    var hud = showcase.querySelector('[data-showcase-hud]');
    var currentEl = showcase.querySelector('[data-showcase-current]');
    var statusEl = showcase.querySelector('[data-showcase-status]');
    var bar = showcase.querySelector('[data-showcase-bar]');
    var total = items.length;

    if (total < 2) return;

    showcase.setAttribute('data-ready', '');
    if (hud) hud.hidden = false;

    var shown = -1;
    var frame = null;

    var place = function () {
      frame = null;
      var rect = showcase.getBoundingClientRect();
      var travel = showcase.offsetHeight - window.innerHeight;
      if (travel <= 0) return;

      var progress = Math.min(1, Math.max(0, -rect.top / travel));
      var pos = progress * (total - 1);

      items.forEach(function (item, i) {
        var d = i - pos;
        var far = Math.abs(d);
        if (far > 2.2) {
          item.classList.remove('is-live');
          return;
        }
        item.classList.add('is-live');
        // Behind and below as it approaches, forward and out as it leaves.
        var z = -Math.abs(d) * 300;
        var y = d * -14;
        var rx = d * 5;
        var ry = d * -7;
        var scale = Math.max(0.6, 1 - Math.abs(d) * 0.1);
        // The card nearest the front stays fully opaque right through the
        // handover from one card to the next, so the one behind it never
        // shows through the white.
        var opacity = Math.max(0, 1 - Math.max(0, Math.abs(d) - 0.5) * 1.05);
        item.style.transform =
          'translate3d(-50%, calc(-50% + ' + y.toFixed(1) + 'vh), ' + z.toFixed(0) + 'px)' +
          ' rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)' +
          ' scale(' + scale.toFixed(3) + ')';
        item.style.opacity = opacity.toFixed(3);
        item.style.zIndex = String(100 - Math.round(Math.abs(d) * 10));
      });

      var index = Math.round(pos) + 1;
      if (index !== shown) {
        shown = index;
        if (currentEl) currentEl.textContent = String(index);
        if (statusEl) statusEl.textContent = index + ' / ' + total;
      }
      if (bar) bar.style.width = (progress * 100).toFixed(1) + '%';
    };

    var onScroll = function () {
      if (frame === null) frame = window.requestAnimationFrame(place);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    place();

    // The skip control lands on the grid and moves focus with it.
    var skip = showcase.querySelector('.showcase__skip');
    if (skip) {
      skip.addEventListener('click', function (e) {
        var target = scopeOf(showcase).querySelector(skip.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth' });
        target.focus({ preventScroll: true });
      });
    }
  }

  /* ---------------------------------------------------------------- *
   * Lightbox
   * ---------------------------------------------------------------- */

  function initLightbox(grid) {
    var root = scopeOf(grid);
    var box = root.querySelector('[data-lightbox]');
    var dataNode = root.querySelector('[data-gallery-data]');
    if (!box || !dataNode) return;

    var data = [];
    try { data = JSON.parse(dataNode.textContent); } catch (e) { return; }
    if (!data.length) return;

    var image = box.querySelector('[data-lightbox-image]');
    var caption = box.querySelector('[data-lightbox-caption]');
    var brandLink = box.querySelector('[data-lightbox-brand]');
    var panel = box.querySelector('.lightbox__panel');
    var current = 0;
    var opener = null;

    function paint(i) {
      current = (i + data.length) % data.length;
      var item = data[current];
      image.src = item.src;
      image.width = item.w;
      image.height = item.h;
      image.alt = item.alt;
      caption.textContent = item.brand ? item.brand + ': ' + item.alt : item.alt;
      if (item.href) { brandLink.href = item.href; brandLink.hidden = false; }
      else brandLink.hidden = true;
    }

    function open(i, source) {
      opener = source || null;
      paint(i);
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      var first = box.querySelector('[data-lightbox-next]');
      if (first) first.focus();
      document.addEventListener('keydown', onKey);
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      if (opener && document.contains(opener)) opener.focus();
      opener = null;
    }

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); paint(current - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); paint(current + 1); }
      else if (e.key === 'Tab') {
        var focusable = panel.querySelectorAll('a[href]:not([hidden]), button:not([hidden])');
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }

    grid.addEventListener('click', function (e) {
      var button = e.target.closest('.tile-card__button');
      if (!button) return;
      open(Number(button.getAttribute('data-index')), button);
    });

    Array.prototype.forEach.call(box.querySelectorAll('[data-lightbox-close]'), function (el) {
      el.addEventListener('click', close);
    });
    box.querySelector('[data-lightbox-prev]').addEventListener('click', function () { paint(current - 1); });
    box.querySelector('[data-lightbox-next]').addEventListener('click', function () { paint(current + 1); });
  }

  if (!reduced.matches) each('[data-showcase]', initShowcase);
  each('[data-gallery]', initLightbox);
})();
