/* ============================================================
   CUELLOS DISTILLERY - Nine-product marquee (home)
   The nine cards exist as static HTML (usable without JS as a
   scrollable rail). With JS, the roll is a TRANSFORM on the
   track driven by requestAnimationFrame - never scroll
   position, so iOS Safari's scroll rounding, momentum and
   sticky-state quirks cannot stop it:
   - glides right-to-left, one full cycle in ~55 s;
   - visitors can drag it horizontally (pointer capture);
     vertical page scrolling stays native via touch-action:pan-y;
   - dragging or a held press pauses it, and it ALWAYS resumes
     ~1.5 s after the interaction ends;
   - a real mouse hover, the pause/play control and hidden
     browser tabs also pause it - and it resumes;
   - the track is duplicated once for a seamless infinite wrap
     (the clone is aria-hidden and untabbable);
   - a drag longer than 8 px suppresses the accidental card
     click; a tap still opens the product;
   - prefers-reduced-motion gets a static scrollable rail.
   No <marquee> element is used.
   ============================================================ */

(function () {
  "use strict";

  var CYCLE_SECONDS = 55;
  var RESUME_DELAY = 1500; /* ms after the last user interaction */
  var DRAG_THRESHOLD = 8;  /* px of movement that counts as a drag, not a tap */

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
  var hoverPaused = false; /* real mouse only */
  var interactingUntil = 0;
  var lastTick = null;

  /* transform offset in px, kept in [0, groupW) */
  var offset = 0;
  var dragging = false;
  var dragStartX = 0;
  var dragStartOffset = 0;
  var dragMoved = 0;

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

  function wrap(v) {
    var groupW = group.offsetWidth;
    if (!groupW) return 0;
    v = v % groupW;
    return v < 0 ? v + groupW : v;
  }

  function apply() {
    track.style.transform = "translate3d(" + (-offset) + "px, 0, 0)";
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (lastTick === null) { lastTick = now; return; }
    var dt = Math.min((now - lastTick) / 1000, 0.1);
    lastTick = now;

    var groupW = group.offsetWidth;
    if (!groupW) return;

    if (userPaused || hoverPaused || dragging || document.hidden || interacting()) return;

    offset = wrap(offset + (groupW / CYCLE_SECONDS) * dt);
    apply();
  }

  function boot() {
    syncAlts();
    setToggleState();

    if (toggleBtn) toggleBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      setToggleState();
    });

    if (reducedMotion) {
      /* static scrollable rail - no clone, no motion */
      if (toggleBtn) toggleBtn.closest(".marquee-controls").style.display = "none";
      return;
    }

    makeClone();
    shell.classList.add("is-animated");
    shell.scrollLeft = 0;

    /* drag to browse - pointer capture keeps the gesture even when the
       finger wanders; vertical pans stay native via touch-action: pan-y */
    shell.addEventListener("pointerdown", function (e) {
      dragging = true;
      dragStartX = e.clientX;
      dragStartOffset = offset;
      dragMoved = 0;
      markInteraction();
      try { shell.setPointerCapture(e.pointerId); } catch (err) {}
    });
    shell.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var dx = e.clientX - dragStartX;
      dragMoved = Math.max(dragMoved, Math.abs(dx));
      offset = wrap(dragStartOffset - dx);
      apply();
      markInteraction();
    });
    ["pointerup", "pointercancel"].forEach(function (evt) {
      shell.addEventListener(evt, function () {
        dragging = false;
        markInteraction();
      });
    });
    /* a real drag must not fire the card link underneath */
    shell.addEventListener("click", function (e) {
      if (dragMoved > DRAG_THRESHOLD) {
        e.preventDefault();
        e.stopPropagation();
        dragMoved = 0;
      }
    }, true);

    /* horizontal trackpad/wheel browsing */
    shell.addEventListener("wheel", function (e) {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        offset = wrap(offset + e.deltaX);
        apply();
        markInteraction();
      }
    }, { passive: false });

    /* hover pause is desktop-mouse only - touch hover never sticks */
    shell.addEventListener("pointerenter", function (e) { if (e.pointerType === "mouse") hoverPaused = true; });
    shell.addEventListener("pointerleave", function (e) { if (e.pointerType === "mouse") hoverPaused = false; });

    document.addEventListener("cuellos:langchange", function () {
      syncAlts();
      var clone = track.querySelector("[data-marquee-clone]");
      if (clone) { clone.remove(); makeClone(); }
      setToggleState();
    });

    requestAnimationFrame(tick);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
