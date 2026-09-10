/* Campaign hero.
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

  var SOUND_KEY = 'vegas-hero-sound';

  Array.prototype.forEach.call(heroes, setup);

  function setup(hero) {
    var track = hero.querySelector('.hero-track');
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (slides.length < 2) return;

    var HOLD = 7000;
    var index = 0;
    var timer = null;
    var started = false;
    var onScreen = true;

    slides.forEach(function (s) { s.removeAttribute('data-inert'); });
    hero.setAttribute('data-ready', '');

    /* Changing slide is announced rather than focused, so a visitor stepping
       through with the arrow buttons keeps their place on the control. */
    var live = document.createElement('p');
    live.className = 'visually-hidden';
    live.setAttribute('aria-live', 'polite');
    hero.appendChild(live);

    var film = buildFilm(hero, slides);

    function render() {
      slides.forEach(function (slide, i) {
        var current = i === index;
        slide.classList.toggle('is-current', current);
        slide.setAttribute('aria-hidden', String(!current));
        // Off-screen slides leave the tab order, so focus is never trapped in
        // something the visitor cannot see.
        Array.prototype.forEach.call(slide.querySelectorAll('a, button'), function (el) {
          if (el.hasAttribute('aria-hidden')) return;
          if (current) el.removeAttribute('tabindex');
          else el.setAttribute('tabindex', '-1');
        });
      });
      dots.forEach(function (dot, i) {
        if (i === index) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
      if (film) film.sync(slides[index] === film.slide && onScreen && !document.hidden);
    }

    function announce() {
      var label = slides[index].getAttribute('aria-label') || '';
      if (label) live.textContent = label;
    }

    function go(to, opts) {
      index = (to + slides.length) % slides.length;
      render();
      if (opts && opts.announce) announce();
      restart();
    }

    function stop() { if (timer) { window.clearTimeout(timer); timer = null; } }

    /* The film runs longer than a still slide is worth looking at, so its slide
       holds for as long as the film does instead of the standard beat. */
    function holdFor() {
      if (film && slides[index] === film.slide) return film.hold();
      return HOLD;
    }

    function start() {
      // Autoplay is motion, so a visitor asking for less never gets it.
      if (reduced.matches || timer || !started || !onScreen) return;
      timer = window.setTimeout(function () {
        timer = null;
        go(index + 1);
        start();
      }, holdFor());
    }

    function restart() { stop(); start(); }

    if (prev) prev.addEventListener('click', function () { go(index - 1, { announce: true }); });
    if (next) next.addEventListener('click', function () { go(index + 1, { announce: true }); });
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        go(Number(dot.getAttribute('data-index')), { announce: true });
      });
    });

    // Only where there is a pointer that can be moved away again: a touch
    // screen sends mouseenter when a finger lands and never the mouseleave
    // that would start it again, which stopped the hero on whichever slide was
    // showing the moment anyone touched it.
    if (window.matchMedia('(hover: hover)').matches) {
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
    }
    hero.addEventListener('focusin', stop);
    hero.addEventListener('focusout', function (e) {
      if (!hero.contains(e.relatedTarget)) start();
    });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); if (film) film.sync(false); }
      else { start(); render(); }
    });

    hero.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index - 1, { announce: true }); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index + 1, { announce: true }); }
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
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        go(dx < 0 ? index + 1 : index - 1, { announce: true });
      } else start();
    }, { passive: true });

    if (reduced.addEventListener) {
      reduced.addEventListener('change', function () {
        if (reduced.matches) stop(); else start();
        render();
      });
    }

    /* Nothing plays and nothing rotates while the hero is off screen. */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        onScreen = entries[0].isIntersecting;
        if (onScreen) { start(); render(); }
        else { stop(); if (film) film.sync(false); }
      }, { threshold: 0.15 }).observe(hero);
    }

    render();

    // Autoplay waits for the first meaningful paint so it never competes with
    // the initial render.
    var begin = function () { started = true; start(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(begin, { timeout: 2500 });
    else window.setTimeout(begin, 1200);
  }

  /* ------------------------------------------------------------------ *
   * The film
   *
   * The campaign is meant to be heard, so playback is attempted with sound.
   * Browsers refuse to start an unmuted video on their own, so a refusal is
   * expected rather than exceptional: it falls back to a muted start and the
   * sound control turns audio on with one press. A visitor's choice is
   * remembered for the rest of the session.
   * ------------------------------------------------------------------ */

  function buildFilm(hero, slides) {
    var video = hero.querySelector('[data-hero-video]');
    if (!video) return null;

    var slide = video.closest('.hero-slide');
    var stage = hero.querySelector('[data-video-stage]');
    var bar = hero.querySelector('[data-video-controls]');
    var toggle = hero.querySelector('[data-video-toggle]');
    var soundBtn = hero.querySelector('[data-video-sound]');
    var labels = {
      play: toggle && toggle.getAttribute('data-label-play'),
      pause: toggle && toggle.getAttribute('data-label-pause'),
      sound: soundBtn && soundBtn.getAttribute('data-label-sound'),
      mute: soundBtn && soundBtn.getAttribute('data-label-mute'),
    };

    if (bar) bar.hidden = false;

    // Sound on unless the visitor turned it off earlier.
    var wanted = true;
    try { wanted = window.sessionStorage.getItem(SOUND_KEY) !== 'off'; } catch (e) {}
    video.muted = !wanted;
    video.volume = 1;

    var active = false;
    var paused = false;   // set only by the visitor pressing pause

    function icons() {
      if (toggle) {
        var playing = !video.paused && !video.ended;
        var p = toggle.querySelector('[data-icon="pause"]');
        var q = toggle.querySelector('[data-icon="play"]');
        if (p) p.hidden = !playing;
        if (q) q.hidden = playing;
        toggle.setAttribute('aria-label', playing ? labels.pause : labels.play);
      }
      if (soundBtn) {
        var on = !video.muted;
        var s1 = soundBtn.querySelector('[data-icon="sound-on"]');
        var s2 = soundBtn.querySelector('[data-icon="sound-off"]');
        if (s1) s1.hidden = !on;
        if (s2) s2.hidden = on;
        soundBtn.setAttribute('aria-label', on ? labels.mute : labels.sound);
        soundBtn.classList.toggle('is-attention', !on && wanted);
      }
      if (stage) stage.classList.toggle('is-playing', !video.paused && !video.ended);
    }

    /* A play request is a promise, and a pause issued before it settles is
       otherwise undone the moment it does. Every resolution therefore checks
       whether the film is still wanted before leaving it running. */
    function settle() {
      if ((!active || paused) && !video.paused) video.pause();
      icons();
    }

    function attempt() {
      if (video.preload === 'none') video.preload = 'auto';
      var p = video.play();
      if (!p || !p.catch) { settle(); return; }
      p.then(settle).catch(function () {
        // Refused with sound, which is the browser's call to make. Fall back to
        // a muted start and leave the sound control asking to be pressed.
        if (!video.muted && active && !paused) {
          video.muted = true;
          var again = video.play();
          if (again && again.catch) again.then(settle).catch(settle);
          else settle();
        } else settle();
      });
    }

    function sync(shouldRun) {
      active = shouldRun;
      if (!shouldRun) {
        if (!video.paused) video.pause();
        icons();
        return;
      }

      // A visitor who has asked for less motion gets the poster and a control,
      // never a film that starts itself.
      if (reduced.matches || paused) { icons(); return; }
      attempt();
    }

    if (toggle) {
      toggle.addEventListener('click', function () {
        if (video.paused || video.ended) { paused = false; attempt(); }
        else { paused = true; video.pause(); }
        icons();
      });
    }

    if (soundBtn) {
      soundBtn.addEventListener('click', function () {
        video.muted = !video.muted;
        wanted = !video.muted;
        try { window.sessionStorage.setItem(SOUND_KEY, wanted ? 'on' : 'off'); } catch (e) {}
        // Turning sound on counts as the interaction browsers wait for, so a
        // film that was refused earlier can start now.
        if (wanted && active && !paused && video.paused) attempt();
        icons();
      });
    }

    video.addEventListener('play', icons);
    video.addEventListener('pause', icons);
    icons();

    return {
      slide: slide,
      sync: sync,
      hold: function () {
        // Give the film its full run before the carousel moves on, within
        // reason, and fall back to the standard beat if the length is unknown.
        var d = video.duration;
        if (!d || !isFinite(d)) return 12000;
        return Math.min(Math.round(d * 1000) + 600, 32000);
      },
    };
  }
})();
