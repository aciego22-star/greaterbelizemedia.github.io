/* Promoted products.
 *
 * The markup already carries every product and every description, and the
 * stylesheet shows only the first until this file marks the showcase ready. So
 * a page whose script never arrives, and a visitor who has asked for less
 * motion, sees one complete, still product rather than a stack of three.
 *
 * There are no controls on the showcase. Tabbing into it holds it where it is,
 * it stands still while it is off screen or the tab is in the background, and
 * asking for less motion stops it entirely.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  Array.prototype.forEach.call(document.querySelectorAll('[data-promo]'), setup);

  function setup(promo) {
    var slots = Array.prototype.slice.call(promo.querySelectorAll('[data-promo-slot]'));
    var panels = Array.prototype.slice.call(promo.querySelectorAll('[data-promo-panel]'));
    if (slots.length < 2 || slots.length !== panels.length) return;

    var interval = Number(promo.getAttribute('data-promo-interval')) || 5000;
    // Long enough for the product to reach the back of the queue before it is
    // faded back in there.
    var travel = 720;
    var index = 0;
    var timer = null;
    var settle = null;
    var held = false;
    var onScreen = true;

    // The turn takes exactly as long as a product is shown, so each one comes
    // to rest facing forward at the moment it hands over.
    promo.style.setProperty('--promo-turn', interval + 'ms');

    function render(from) {
      var count = slots.length;
      slots.forEach(function (slot, i) {
        // How far down the queue this product now stands: nought is in the
        // light, one is next up, the rest are waiting behind it.
        var place = (i - index + count) % count;
        var current = place === 0;
        // Where along the queue this one stands, counted out from the middle,
        // so the line stays centred however many products there are.
        slot.style.setProperty('--lane', current ? 0 : place - 1 - (count - 2) / 2);
        slot.classList.toggle('is-current', current);
        slot.classList.toggle('is-next', place === 1);
        slot.classList.toggle('is-queued', place > 1);
        // The one handing over sinks away and is dimmed out on the way, so it
        // is not seen crossing the one rising past it.
        slot.classList.toggle('is-leaving', i === from && !current);
        if (current) slot.removeAttribute('aria-hidden');
        else slot.setAttribute('aria-hidden', 'true');
      });

      if (settle) window.clearTimeout(settle);
      settle = window.setTimeout(function () {
        settle = null;
        slots.forEach(function (slot) { slot.classList.remove('is-leaving'); });
      }, travel);

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
    }

    function go(to) {
      var from = index;
      index = (to + slots.length) % slots.length;
      render(from);
      restart();
    }

    function stop() { if (timer) { window.clearTimeout(timer); timer = null; } }

    function start() {
      if (reduced.matches || held || !onScreen || timer) return;
      timer = window.setTimeout(function () {
        timer = null;
        go(index + 1);
      }, interval);
    }

    function restart() { stop(); start(); }

    // Tabbing into the panel holds it, so a link is never pulled out from
    // under someone reaching for it.
    //
    // Pointing at it deliberately does not. A cursor left resting anywhere
    // over the showcase is no signal that anyone is reading, and holding on
    // that signal stopped the queue outright for as long as the cursor sat
    // there. Keyboard focus is a real statement of intent; an idle mouse is
    // not, so only focus holds now.
    var hold = function () { held = true; stop(); };
    var release = function () { held = false; start(); };
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

    function arm() {
      if (reduced.matches) {
        // Back to the plain, still first product, which is what the stylesheet
        // shows on its own.
        stop();
        promo.removeAttribute('data-ready');
        index = 0;
        render(-1);
        return;
      }
      promo.setAttribute('data-ready', '');
      render(-1);
      start();
    }

    if (reduced.addEventListener) reduced.addEventListener('change', arm);
    arm();
  }
})();
