/* Brands in Motion: entry animation, pointer tilt and lightbox.
 *
 * The grid is readable without this file. Arming happens here, so a script
 * that fails to load leaves every card visible.
 */
(function () {
  'use strict';

  var gallery = document.querySelector('[data-gallery]');
  if (!gallery) return;

  var cards = Array.prototype.slice.call(gallery.querySelectorAll('.g-card'));
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');

  /* ---------------------------------------------------------------- *
   * Entry
   * ---------------------------------------------------------------- */

  if (!reduced.matches && 'IntersectionObserver' in window) {
    gallery.classList.add('is-armed');

    var seen = 0;
    var observer = new IntersectionObserver(
      function (entries) {
        seen++;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var card = entry.target;
          // Cards arrive in small groups rather than all at once.
          card.style.transitionDelay = (card.getAttribute('data-delay') || 0) + 'ms';
          card.classList.add('is-in');
          observer.unobserve(card);
          // The delay is one-shot: it must not slow later hover transitions.
          window.setTimeout(function () { card.style.transitionDelay = ''; }, 1200);
        });
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 }
    );

    cards.forEach(function (card) { observer.observe(card); });

    // If the observer never reports, show everything rather than leave a gap.
    window.setTimeout(function () {
      if (seen) return;
      observer.disconnect();
      cards.forEach(function (card) { card.classList.add('is-in'); });
    }, 3000);
  } else {
    cards.forEach(function (card) { card.classList.add('is-in'); });
  }

  /* ---------------------------------------------------------------- *
   * Pointer tilt, desktop only
   * ---------------------------------------------------------------- */

  if (fine.matches && !reduced.matches) {
    cards.forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--tilt-y', (px * 7).toFixed(2) + 'deg');
        card.style.setProperty('--tilt-x', (-py * 7).toFixed(2) + 'deg');
        card.classList.add('has-tilt');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('has-tilt');
        card.style.removeProperty('--tilt-x');
        card.style.removeProperty('--tilt-y');
      });
    });
  }

  /* ---------------------------------------------------------------- *
   * Lightbox
   * ---------------------------------------------------------------- */

  var box = document.querySelector('[data-lightbox]');
  var dataNode = document.querySelector('[data-gallery-data]');
  if (!box || !dataNode) return;

  var items = [];
  try { items = JSON.parse(dataNode.textContent); } catch (e) { return; }

  var image = box.querySelector('[data-lightbox-image]');
  var caption = box.querySelector('[data-lightbox-caption]');
  var brandLink = box.querySelector('[data-lightbox-brand]');
  var panel = box.querySelector('.lightbox__panel');
  var current = 0;
  var opener = null;

  function paint(i) {
    current = (i + items.length) % items.length;
    var item = items[current];
    image.src = item.src;
    image.width = item.w;
    image.height = item.h;
    image.alt = item.alt;
    caption.textContent = item.brand ? item.brand + ': ' + item.alt : item.alt;
    if (item.href) {
      brandLink.href = item.href;
      brandLink.hidden = false;
    } else {
      brandLink.hidden = true;
    }
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
    // Focus goes back where the visitor left it.
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); paint(current - 1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); paint(current + 1); }
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog while it is open.
      var focusable = panel.querySelectorAll('a[href]:not([hidden]), button:not([hidden])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  }

  gallery.addEventListener('click', function (e) {
    var button = e.target.closest('.g-card__button');
    if (!button) return;
    open(Number(button.getAttribute('data-index')), button);
  });

  Array.prototype.forEach.call(box.querySelectorAll('[data-lightbox-close]'), function (el) {
    el.addEventListener('click', close);
  });
  box.querySelector('[data-lightbox-prev]').addEventListener('click', function () { paint(current - 1); });
  box.querySelector('[data-lightbox-next]').addEventListener('click', function () { paint(current + 1); });
})();
