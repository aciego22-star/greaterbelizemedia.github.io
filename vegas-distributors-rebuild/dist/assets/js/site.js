/* Global behaviour: mobile navigation and the reveal effect.
   The site is fully usable if this file fails to load. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- *
   * Mobile navigation
   * ---------------------------------------------------------------- */

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('masthead-panel');

  if (toggle && nav) {
    var mobile = window.matchMedia('(max-width: 52rem)');

    var apply = function () {
      if (mobile.matches) {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        nav.hidden = !open;
      } else {
        // Above the breakpoint the nav is always visible and the button is hidden.
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      apply();
      if (!open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      }
    });

    // Escape closes the menu and returns focus to the control that opened it.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        toggle.setAttribute('aria-expanded', 'false');
        apply();
        toggle.focus();
      }
    });

    if (mobile.addEventListener) mobile.addEventListener('change', apply);
    apply();
  }

  /* ---------------------------------------------------------------- *
   * Language choice
   *
   * Recording the visitor's explicit pick stops the detection script in the
   * head from overriding it on the next English page they open.
   * ---------------------------------------------------------------- */

  var langLinks = document.querySelectorAll('.lang a[lang]');
  Array.prototype.forEach.call(langLinks, function (a) {
    a.addEventListener('click', function () {
      try {
        localStorage.setItem('vegas-lang', a.getAttribute('lang'));
      } catch (e) {
        /* Private browsing or blocked storage: detection simply keeps running. */
      }
    });
  });

  /* ---------------------------------------------------------------- *
   * Reveal on scroll
   *
   * Sections are visible by default; the effect is armed here so that a
   * blocked or failed script never leaves the page blank.
   * ---------------------------------------------------------------- */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  if ('IntersectionObserver' in window && !reduced.matches) {
    var targets = document.querySelectorAll('.reveal');
    if (targets.length) {
      var armed = [];
      var fired = false;

      var observer = new IntersectionObserver(
        function (entries) {
          fired = true;
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
      );

      Array.prototype.forEach.call(targets, function (el) {
        var box = el.getBoundingClientRect();
        // Anything already on screen at load stays put rather than fading in.
        if (box.top < window.innerHeight) {
          el.classList.add('is-armed', 'is-visible');
          return;
        }
        el.classList.add('is-armed');
        armed.push(el);
        observer.observe(el);
      });

      // Safety net: if the observer never reports at all, the effect is broken.
      // Reveal everything rather than leave sections invisible.
      if (armed.length) {
        window.setTimeout(function () {
          if (fired) return;
          observer.disconnect();
          armed.forEach(function (el) {
            el.classList.add('is-visible');
          });
        }, 3000);
      }
    }
  }
})();
