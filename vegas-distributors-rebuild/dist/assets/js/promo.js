/* Promoted products.
 *
 * The markup already carries every product and every description, and the
 * stylesheet shows only the first until this file marks the showcase ready. So
 * a page whose script never arrives shows one complete, still product rather
 * than a stack of three.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  Array.prototype.forEach.call(document.querySelectorAll('[data-promo]'), setup);

  function setup(promo) {
    var slots = Array.prototype.slice.call(promo.querySelectorAll('[data-promo-slot]'));
    var panels = Array.prototype.slice.call(promo.querySelectorAll('[data-promo-panel]'));
    var dots = Array.prototype.slice.call(promo.querySelectorAll('[data-promo-dot]'));
    var status = promo.querySelector('[data-promo-status]');
    if (slots.length < 2 || slots.length !== panels.length) return;

    var interval = Number(promo.getAttribute('data-promo-interval')) || 5000;
    var index = 0;
    var timer = null;
    var held = false;
    var onScreen = true;

    promo.setAttribute('data-ready', '');
    // The turn takes exactly as long as a product is shown, so each one comes
    // to rest facing forward at the moment it hands over.
    promo.style.setProperty('--promo-turn', interval + 'ms');

    function render(from) {
      slots.forEach(function (slot, i) {
        var current = i === index;
        slot.classList.toggle('is-current', current);
        // The one being replaced keeps its place for the length of the move,
        // so it can be seen sinking rather than simply vanishing.
        slot.classList.toggle('is-leaving', i === from && !current);
        if (current) slot.removeAttribute('aria-hidden');
        else slot.setAttribute('aria-hidden', 'true');
      });

      panels.forEach(function (panel, i) {
        var current = i === index;
        panel.classList.toggle('is-current', current);
        if (current) panel.removeAttribute('aria-hidden');
        else panel.setAttribute('aria-hidden', 'true');
        // A description that is not showing must not be reachable by keyboard.
        Array.prototype.forEach.call(panel.querySelectorAll('a, button'), function (el) {
          if (current) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });

      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function go(to, announce) {
      var from = index;
      index = (to + slots.length) % slots.length;
      render(from);
      if (announce && status) {
        var heading = panels[index].querySelector('h3');
        if (heading) status.textContent = heading.textContent;
      }
      restart();
    }

    function stop() { if (timer) { window.clearTimeout(timer); timer = null; } }

    function start() {
      if (reduced.matches || held || !onScreen || timer) return;
      timer = window.setTimeout(function () {
        timer = null;
        go(index + 1);
        start();
      }, interval);
    }

    function restart() { stop(); start(); }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { go(i, true); });
    });

    // Reading or pointing at the panel holds it, so nothing changes out from
    // under someone part way through a sentence.
    var hold = function () { held = true; stop(); };
    var release = function () { held = false; start(); };
    promo.addEventListener('mouseenter', hold);
    promo.addEventListener('mouseleave', release);
    promo.addEventListener('focusin', hold);
    promo.addEventListener('focusout', function (e) {
      if (!promo.contains(e.relatedTarget)) release();
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop(); else start();
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) start(); else stop();
      }, { threshold: 0.2 }).observe(promo);
    }

    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (reduced.matches) stop(); else start();
      });
    }

    render(-1);
    start();
  }
})();
