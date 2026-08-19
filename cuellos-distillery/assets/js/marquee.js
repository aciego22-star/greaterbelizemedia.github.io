/* ============================================================
   CUELLOS DISTILLERY — Nine-product marquee (home)
   The nine cards exist as static HTML (usable without JS as a
   scrollable rail). This script drives a slow right-to-left
   auto-scroll with requestAnimationFrame on scrollLeft, so:
   - native touch swiping and manual scrolling never fight the
     motion — interaction pauses the roll, and it RESUMES a
     moment after the visitor lets go;
   - the track is duplicated once for a seamless infinite wrap
     (the clone is aria-hidden and untabbable, so keyboard and
     screen readers meet each product exactly once);
   - a mouse hover, a held press, the pause/play control and
     hidden browser tabs pause the roll — everything resumes;
   - one full cycle takes ~55 s;
   - prefers-reduced-motion gets a static scrollable rail.
   No <marquee> element is used.
   ============================================================ */

(function () {
  "use strict";

  var CYCLE_SECONDS = 55;
  var RESUME_DELAY = 1500; /* ms after the last user interaction */

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shell = document.querySelector("[data-marquee]");
  if (!shell) return;
  var track = shell.querySelector(".marquee__track");
  var group = shell.querySelector(".marquee__group");
  var toggleBtn = document.querySelector("[data-marquee-toggle]");
  if (!track || !group) return;

  function t(key, fallback) {
    return (window.CuellosI18N && window.CuellosI18N.t(key)) || fallback;
  }

  var userPaused = false;
  var hoverPaused = false; /* mouse pointer only — touch never sets this */
  var held = false;        /* finger/pointer currently down */
  var interactingUntil = 0;
  var lastTick = null;
  var rafId = null;
  /* iOS Safari rounds scrollLeft assignments to whole pixels, so a
     sub-pixel per-frame increment would round back and never move.
     Position is accumulated in this float and assigned each frame. */
  var pos = 0;

  function syncAlts() {
    if (!window.CuellosData || !window.CuellosI18N) return;
    var lang = window.CuellosI18N.lang;
    var items = shell.querySelectorAll(".marquee__item[data-pid]");
    for (var i = 0; i < items.length; i++) {
      var p = window.CuellosData.byId(items[i].getAttribute("data-pid"));
      var img = items[i].querySelector("img");
      if (p && img) img.setAttribute("alt", p.alt[lang]);
    }
  }

  function setToggleState() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
    toggleBtn.setAttribute("data-i18n-aria", userPaused ? "marquee.play" : "marquee.pause");
    toggleBtn.setAttribute("aria-label", t(userPaused ? "marquee.play" : "marquee.pause", userPaused ? "Play product showcase" : "Pause product showcase"));
    var play = toggleBtn.querySelector("[data-icon-play]");
    var pause = toggleBtn.querySelector("[data-icon-pause]");
    if (play) play.style.display = userPaused ? "" : "none";
    if (pause) pause.style.display = userPaused ? "none" : "";
  }

  function makeClone() {
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("data-marquee-clone", "");
    var focusables = clone.querySelectorAll("a, button, [tabindex]");
    for (var i = 0; i < focusables.length; i++) focusables[i].setAttribute("tabindex", "-1");
    track.appendChild(clone);
  }

  function interacting() { return performance.now() < interactingUntil; }
  function markInteraction() { interactingUntil = performance.now() + RESUME_DELAY; }

  function tick(now) {
    rafId = requestAnimationFrame(tick);
    if (lastTick === null) { lastTick = now; return; }
    var dt = Math.min((now - lastTick) / 1000, 0.1);
    lastTick = now;

    var groupW = group.offsetWidth;
    if (!groupW) return;

    var paused = userPaused || hoverPaused || held || document.hidden || interacting();

    if (paused) {
      /* track wherever the visitor scrolled to */
      pos = shell.scrollLeft;
      return;
    }
    var speed = groupW / CYCLE_SECONDS;
    pos += speed * dt;
    /* seamless wrap */
    if (pos >= groupW) pos -= groupW;
    else if (pos < 0) pos += groupW;
    shell.scrollLeft = pos;
  }

  function boot() {
    syncAlts();
    setToggleState();

    if (toggleBtn) toggleBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      setToggleState();
    });

    if (reducedMotion) {
      /* static scrollable rail — no clone, no motion */
      if (toggleBtn) toggleBtn.closest(".marquee-controls").style.display = "none";
      return;
    }

    makeClone();

    /* interaction pauses; the roll ALWAYS resumes RESUME_DELAY after the
       last touch / drag / wheel / momentum-scroll event ends */
    ["touchmove", "wheel"].forEach(function (evt) {
      shell.addEventListener(evt, markInteraction, { passive: true });
    });
    shell.addEventListener("pointerdown", function () { held = true; markInteraction(); }, { passive: true });
    ["pointerup", "pointercancel", "pointerleave"].forEach(function (evt) {
      shell.addEventListener(evt, function () { held = false; markInteraction(); }, { passive: true });
    });
    shell.addEventListener("scroll", function () {
      if (interacting() || held) markInteraction(); /* extend through momentum scrolling */
    }, { passive: true });

    /* hover pause is desktop-mouse only — emulated/touch hover never sticks it */
    shell.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hoverPaused = true; });
    shell.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hoverPaused = false; });

    document.addEventListener("cuellos:langchange", function () {
      syncAlts();
      var clone = track.querySelector("[data-marquee-clone]");
      if (clone) { clone.remove(); makeClone(); }
      setToggleState();
    });

    rafId = requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
