/* Global behaviour: mobile navigation and the reveal effect.
   The site is fully usable if this file fails to load. */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- *
   * Mobile navigation
   * ---------------------------------------------------------------- */

  /* Wired up per header rather than once per document. A page normally carries
     one header, but where more than one is present, picking only the first
     match left the others' menu buttons doing nothing at all. Each header also
     finds its own panel by walking down from itself, so a repeated id cannot
     cross the wires. */
  var eachMasthead = function (fn) {
    Array.prototype.forEach.call(document.querySelectorAll('.masthead'), fn);
  };

  /* Whether the bar is folded away is the stylesheet's decision, and asking
     the menu button whether it is on screen is how this file finds out. It
     used to carry a width of its own, which drifted from the stylesheet's:
     between the two the button was on screen while this file still believed
     it was on a wide window, so it held the panel open and left a header six
     hundred pixels tall with a button that could not shut it. Reading the
     button means the two cannot disagree again. */
  var folded = function (button) {
    return window.getComputedStyle(button).display !== 'none';
  };

  eachMasthead(function (header) {
    var toggle = header.querySelector('.nav-toggle');
    var nav = header.querySelector('.masthead__panel');
    if (!toggle || !nav) return;

    // An open panel gives the header a solid surface, so the top row is never
    // white-on-white against the panel behind it.
    var markOpen = function () {
      header.classList.toggle(
        'is-open',
        folded(toggle) && toggle.getAttribute('aria-expanded') === 'true'
      );
    };

    var apply = function () {
      if (folded(toggle)) {
        var open = toggle.getAttribute('aria-expanded') === 'true';
        nav.hidden = !open;
      } else {
        // Unfolded, the nav is always on show and the button is not there.
        nav.hidden = false;
        toggle.setAttribute('aria-expanded', 'false');
      }
    };

    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      apply();
      markOpen();
      if (!open) {
        var first = nav.querySelector('a');
        if (first) first.focus();
      }
    });

    var close = function () {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      toggle.setAttribute('aria-expanded', 'false');
      apply();
      markOpen();
    };

    // Choosing somewhere to go closes the menu behind you.
    nav.addEventListener('click', function (e) {
      var link = e.target.closest && e.target.closest('a[href]');
      if (link && folded(toggle)) close();
    });

    // Escape closes the menu and returns focus to the control that opened it.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        close();
        toggle.focus();
      }
    });

    // A window that changes width can cross the fold in either direction.
    window.addEventListener('resize', function () { apply(); markOpen(); }, { passive: true });
    apply();
    markOpen();
  });

  /* ---------------------------------------------------------------- *
   * Header
   *
   * On the homepage the header floats over the hero and takes a solid
   * surface once the visitor scrolls. Its measured height is published as a
   * custom property so the hero can sit beneath it exactly.
   * ---------------------------------------------------------------- */

  var masthead = document.querySelector('.masthead');

  if (masthead) {
    var publishHeight = function () {
      document.documentElement.style.setProperty(
        '--masthead-height',
        Math.round(masthead.getBoundingClientRect().height) + 'px'
      );
    };

    publishHeight();
    if ('ResizeObserver' in window) {
      // The header grows when the mobile panel opens; the hero must not shift.
      new ResizeObserver(function () {
        if (masthead.querySelector('.masthead__panel').hidden !== false || window.innerWidth > 832) publishHeight();
      }).observe(masthead);
    } else {
      window.addEventListener('resize', publishHeight);
    }
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

  /* ---------------------------------------------------------------- *
   * Back to top
   * ---------------------------------------------------------------- */

  /* The control is written into every page but starts hidden, so a page too
     short to scroll never shows a button with nothing to do. It appears once
     the masthead is a screen or so behind, and a visitor who has asked for
     less motion is taken straight there rather than swept. */
  Array.prototype.forEach.call(document.querySelectorAll('[data-to-top]'), function (toTop) {
    var lessMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var sync = function () {
      toTop.hidden = window.scrollY < window.innerHeight * 0.9;
    };

    window.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync, { passive: true });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: lessMotion.matches ? 'auto' : 'smooth' });
      // The reading position goes back with the view, so a visitor stepping
      // through with a keyboard carries on from the masthead rather than from
      // the foot of the page where the button sits. Focus lands on the first
      // real control rather than the skip link, which would otherwise flash
      // its bar open on the way past.
      var first = document.querySelector('.masthead .brand');
      if (first) first.focus({ preventScroll: true });
    });

    sync();
  });
})();
