/* Immersive campaign hero.
 *
 * Progressive enhancement: the markup already shows a complete first slide.
 * Marking the hero ready is what hides the others and reveals the controls,
 * so a script that never loads leaves a working static hero behind.
 */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
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
    var started = false;

    slides.forEach(function (s) { s.removeAttribute('data-inert'); });
    hero.setAttribute('data-ready', '');

    function render() {
      slides.forEach(function (slide, i) {
        var current = i === index;
        slide.classList.toggle('is-current', current);
        slide.setAttribute('aria-hidden', String(!current));
        // Off-screen slides leave the tab order, so focus is never trapped in
        // something the visitor cannot see.
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

    function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

    function start() {
      // Autoplay is motion, so a visitor asking for less never gets it.
      if (reduced.matches || timer || !started) return;
      timer = window.setInterval(function () { go(index + 1); }, INTERVAL);
    }

    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', function () { go(index - 1, { focus: true }); });
    if (next) next.addEventListener('click', function () { go(index + 1, { focus: true }); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () { go(Number(dot.getAttribute('data-index')), { focus: true }); });
    });

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

    /* Swipe. Only a mostly-horizontal drag counts, so vertical scrolling
       through the hero is never hijacked. */
    var startX = 0, startY = 0, tracking = false;
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
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx < 0 ? index + 1 : index - 1);
      else start();
    }, { passive: true });

    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (reduced.matches) stop(); else start();
      });
    }

    render();

    // Autoplay waits for the first meaningful paint so it never competes with
    // the initial render.
    var begin = function () { started = true; start(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 2500 });
    else window.setTimeout(begin, 1200);

    /* ---------------------------------------------------------------- *
     * Parallax
     *
     * A small translate on the media and stage layers as the hero scrolls
     * past. Copy never moves, and reduced motion skips it entirely.
     * ---------------------------------------------------------------- */

    if (reduced.matches) return;

    var frame = null;
    var apply = function () {
      frame = null;
      var rect = hero.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      var progress = Math.max(-1, Math.min(1, -rect.top / Math.max(rect.height, 1)));

      slides.forEach(function (slide) {
        var media = slide.querySelector('.hero-slide__media');
        if (media) media.style.transform = 'translate3d(0,' + (progress * 44).toFixed(2) + 'px,0)';
        var stage = slide.querySelector('.hero-stage');
        if (stage && window.innerWidth > 960) {
          stage.style.transform =
            'translate(-50%, calc(-50% + ' + (progress * -26).toFixed(2) + 'px))';
        } else if (stage) {
          stage.style.transform = '';
        }
      });
    };

    var onScroll = function () {
      if (frame === null) frame = window.requestAnimationFrame(apply);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
  }
})();
