/* Campaign hero carousel.
 *
 * Progressive enhancement: the markup shows a complete first slide on its own.
 * This script marks the hero ready, which is what hides the other slides and
 * reveals the controls, so a failure to load leaves a working static hero.
 */
(function () {
  'use strict';

  var heroes = document.querySelectorAll('[data-hero]');
  if (!heroes.length) return;
  Array.prototype.forEach.call(heroes, setup);

  function setup(hero) {
  var track = hero.querySelector('.hero-track');
  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
  var prev = hero.querySelector('[data-hero-prev]');
  var next = hero.querySelector('[data-hero-next]');
  if (slides.length < 2) return;

  var INTERVAL = 8000;
  var index = 0;
  var timer = null;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  slides.forEach(function (s) { s.removeAttribute('data-inert'); });
  hero.setAttribute('data-ready', '');

  function render() {
    slides.forEach(function (slide, i) {
      var current = i === index;
      slide.classList.toggle('is-current', current);
      // Off-screen slides are removed from the tab order and the a11y tree.
      slide.setAttribute('aria-hidden', String(!current));
      Array.prototype.forEach.call(slide.querySelectorAll('a, button'), function (el) {
        if (current) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', '-1');
      });
    });
    dots.forEach(function (dot, i) {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  }

  function go(to, opts) {
    index = (to + slides.length) % slides.length;
    render();
    if (opts && opts.focus) {
      var heading = slides[index].querySelector('.hero-headline');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    }
    restart();
  }

  function stop() {
    if (timer) { window.clearInterval(timer); timer = null; }
  }

  function start() {
    // Autoplay is motion; visitors who ask for less never get it.
    if (reduced.matches || timer) return;
    timer = window.setInterval(function () { go(index + 1); }, INTERVAL);
  }

  function restart() { stop(); start(); }

  if (prev) prev.addEventListener('click', function () { go(index - 1, { focus: true }); });
  if (next) next.addEventListener('click', function () { go(index + 1, { focus: true }); });

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      go(Number(dot.getAttribute('data-index')), { focus: true });
    });
  });

  // Pause whenever someone is looking at or interacting with the hero.
  hero.addEventListener('mouseenter', stop);
  hero.addEventListener('mouseleave', start);
  hero.addEventListener('focusin', stop);
  hero.addEventListener('focusout', function (e) {
    if (!hero.contains(e.relatedTarget)) start();
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  hero.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, { focus: true }); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, { focus: true }); }
  });

  /* Touch swipe. Only a mostly-horizontal drag counts, so vertical scrolling
     through the hero is never hijacked. */
  var startX = 0;
  var startY = 0;
  var tracking = false;

  track.addEventListener('touchstart', function (e) {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
    stop();
  }, { passive: true });

  track.addEventListener('touchend', function (e) {
    if (!tracking) return;
    tracking = false;
    var touch = e.changedTouches[0];
    var dx = touch.clientX - startX;
    var dy = touch.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      go(dx < 0 ? index + 1 : index - 1);
    } else {
      start();
    }
  }, { passive: true });

  if (reduced.addEventListener) {
    reduced.addEventListener('change', function () {
      if (reduced.matches) stop(); else start();
    });
  }

    render();
    start();
  }
})();
