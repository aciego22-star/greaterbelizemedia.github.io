/* ============================================================
   CUELLOS DISTILLERY — Home hero carousel
   Four slides: lineup, Trafalgar Gin, CZAR Vodka, brand video.
   - Auto-advance every 7 s; pauses on hover, focus-within and
     hidden browser tabs; manual interaction restarts the timer.
   - Arrow keys, touch swipe, small prev/next controls, dots,
     pause/play toggle. All controls are 44 px touch targets.
   - The video slide plays only while active (muted, playsinline),
     resets when left, and advances the carousel when it ends.
     If the video file is missing, its slide removes itself.
   - Never runs behind the age gate; respects reduced motion.
   - Slide 1 is visible without JavaScript.
   ============================================================ */

(function () {
  "use strict";

  var INTERVAL = 7000;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var root = document.querySelector("[data-carousel]");
  if (!root) return;

  var slides = Array.prototype.slice.call(root.querySelectorAll(".carousel__slide"));
  var dotsHost = root.querySelector(".carousel__dots");
  var toggleBtn = root.querySelector("[data-carousel-toggle]");
  var prevBtn = root.querySelector("[data-carousel-prev]");
  var nextBtn = root.querySelector("[data-carousel-next]");

  var index = 0;
  var timer = null;
  var userPaused = false;
  var hoverPaused = false;
  var video = null;

  function t(key, fallback) {
    return (window.CuellosI18N && window.CuellosI18N.t(key)) || fallback;
  }

  /* Remove the video slide if its file is unavailable */
  function initVideoSlide() {
    var vSlide = root.querySelector('[data-slide-video]');
    if (!vSlide) return;
    video = vSlide.querySelector("video");
    if (!video) return;
    video.addEventListener("error", dropVideoSlide, true);
    var src = video.querySelector("source");
    if (src) src.addEventListener("error", dropVideoSlide);
    video.addEventListener("ended", function () { next(true); });
    /* probe for the file with a metadata-only load so a missing
       video removes its slide instead of stalling the rotation */
    video.preload = "metadata";
    try { video.load(); } catch (e) { dropVideoSlide(); }
    function dropVideoSlide() {
      if (!vSlide.parentNode) return;
      var i = slides.indexOf(vSlide);
      if (i > -1) slides.splice(i, 1);
      vSlide.remove();
      video = null;
      buildDots();
      if (index >= slides.length) show(0);
      armTimer();
    }
  }

  function buildDots() {
    if (!dotsHost) return;
    dotsHost.innerHTML = "";
    slides.forEach(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", t("carousel.goto", "Go to slide") + " " + (i + 1));
      b.setAttribute("aria-current", i === index ? "true" : "false");
      b.addEventListener("click", function () { show(i); restart(); });
      dotsHost.appendChild(b);
    });
  }

  function syncVideo() {
    if (!video) return;
    var vSlide = root.querySelector("[data-slide-video]");
    var active = vSlide && !vSlide.hidden && vSlide.classList.contains("is-active");
    var gateOpen = document.getElementById("age-gate");
    if (active && !gateOpen && !userPaused && !document.hidden) {
      video.play().catch(function () {});
    } else {
      video.pause();
      if (!active) { try { video.currentTime = 0; } catch (e) {} }
    }
  }

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      var on = n === index;
      s.classList.toggle("is-active", on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
    });
    if (dotsHost) {
      var dots = dotsHost.querySelectorAll("button");
      for (var d = 0; d < dots.length; d++) dots[d].setAttribute("aria-current", d === index ? "true" : "false");
    }
    syncVideo();
  }

  function next(fromVideo) { show(index + 1); if (!fromVideo) restart(); else armTimer(); }
  function prev() { show(index - 1); restart(); }

  function armTimer() {
    clearTimeout(timer);
    if (userPaused || hoverPaused || reducedMotion || document.hidden) return;
    var gateOpen = document.getElementById("age-gate");
    if (gateOpen) return;
    /* while the video slide is active, its 'ended' event advances instead */
    var activeIsVideo = video && slides[index] && slides[index].hasAttribute("data-slide-video");
    if (activeIsVideo) return;
    timer = setTimeout(function () { show(index + 1); armTimer(); }, INTERVAL);
  }
  function restart() { armTimer(); }

  function setToggleState() {
    if (!toggleBtn) return;
    toggleBtn.setAttribute("aria-pressed", userPaused ? "true" : "false");
    toggleBtn.setAttribute("data-i18n-aria", userPaused ? "carousel.play" : "carousel.pause");
    toggleBtn.setAttribute("aria-label", t(userPaused ? "carousel.play" : "carousel.pause", userPaused ? "Play slideshow" : "Pause slideshow"));
    var play = toggleBtn.querySelector("[data-icon-play]");
    var pause = toggleBtn.querySelector("[data-icon-pause]");
    if (play) play.style.display = userPaused ? "" : "none";
    if (pause) pause.style.display = userPaused ? "none" : "";
  }

  function boot() {
    initVideoSlide();
    buildDots();
    show(0);
    setToggleState();

    if (prevBtn) prevBtn.addEventListener("click", prev);
    if (nextBtn) nextBtn.addEventListener("click", next);
    if (toggleBtn) toggleBtn.addEventListener("click", function () {
      userPaused = !userPaused;
      setToggleState();
      if (userPaused) clearTimeout(timer); else armTimer();
      syncVideo();
    });

    /* keyboard */
    root.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { prev(); }
      if (e.key === "ArrowRight") { next(); }
    });

    /* hover + focus pause */
    root.addEventListener("mouseenter", function () { hoverPaused = true; clearTimeout(timer); });
    root.addEventListener("mouseleave", function () { hoverPaused = false; armTimer(); });
    root.addEventListener("focusin", function () { hoverPaused = true; clearTimeout(timer); });
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) { hoverPaused = false; armTimer(); }
    });

    /* tab visibility */
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { clearTimeout(timer); if (video) video.pause(); }
      else { armTimer(); syncVideo(); }
    });

    /* touch swipe */
    var startX = null, startY = null;
    root.addEventListener("touchstart", function (e) {
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    }, { passive: true });
    root.addEventListener("touchend", function (e) {
      if (startX === null) return;
      var dx = e.changedTouches[0].clientX - startX;
      var dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) next(); else prev();
      }
      startX = startY = null;
    }, { passive: true });

    /* wait for the age gate before any motion */
    if (document.getElementById("age-gate")) {
      var watch = new MutationObserver(function () {
        if (!document.getElementById("age-gate")) { watch.disconnect(); armTimer(); syncVideo(); }
      });
      watch.observe(document.body, { childList: true });
    } else {
      armTimer();
    }
    document.addEventListener("cuellos:langchange", function () { buildDots(); setToggleState(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
