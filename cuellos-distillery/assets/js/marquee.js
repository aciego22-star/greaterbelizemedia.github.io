/* ============================================================
   CUELLOS DISTILLERY — Nine-product marquee (home)
   The nine cards exist as static HTML (usable without JS as a
   scrollable rail). This script:
   - duplicates the track once for a seamless infinite loop
     (the clone is aria-hidden + untabbable, so keyboard and
      screen readers meet each product exactly once);
   - animates right-to-left over ~55 s, pausing on hover,
     focus-within, the pause/play control and hidden tabs;
   - hands control back to manual scrolling on first touch;
   - stays a static scrollable rail under prefers-reduced-motion.
   No <marquee> element is used.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var shell = document.querySelector("[data-marquee]");
  if (!shell) return;
  var track = shell.querySelector(".marquee__track");
  var group = shell.querySelector(".marquee__group");
  var toggleBtn = document.querySelector("[data-marquee-toggle]");

  function t(key, fallback) {
    return (window.CuellosI18N && window.CuellosI18N.t(key)) || fallback;
  }

  var animated = false;
  var userPaused = false;

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

  function enableAnimation() {
    if (animated || reducedMotion || !group) return;
    /* clone the product group once for the seamless -50% loop */
    var clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.setAttribute("data-marquee-clone", "");
    /* the clone must create no duplicate keyboard stops */
    var focusables = clone.querySelectorAll("a, button, [tabindex]");
    for (var i = 0; i < focusables.length; i++) focusables[i].setAttribute("tabindex", "-1");
    track.appendChild(clone);
    shell.classList.add("is-animated");
    animated = true;
  }

  function disableAnimation() {
    if (!animated) return;
    var clone = track.querySelector("[data-marquee-clone]");
    if (clone) clone.remove();
    shell.classList.remove("is-animated");
    track.style.transform = "";
    animated = false;
  }

  function boot() {
    syncAlts();
    if (!reducedMotion) enableAnimation();
    setToggleState();

    if (toggleBtn) toggleBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      shell.classList.toggle("is-paused", userPaused);
      setToggleState();
    });

    /* hidden tab: pause via class (CSS also pauses on hover/focus) */
    document.addEventListener("visibilitychange", function () {
      shell.classList.toggle("is-paused", userPaused || document.hidden);
    });

    /* first touch returns full manual control */
    shell.addEventListener("touchstart", function () {
      disableAnimation();
      if (toggleBtn) toggleBtn.closest(".marquee-controls").style.display = "none";
    }, { once: true, passive: true });

    document.addEventListener("cuellos:langchange", function () {
      syncAlts();
      /* re-sync the clone with retranslated cards */
      if (animated) {
        var clone = track.querySelector("[data-marquee-clone]");
        if (clone) {
          clone.remove();
          animated = false;
          enableAnimation();
        }
      }
      setToggleState();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
