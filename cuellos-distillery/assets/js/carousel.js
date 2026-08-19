/* ============================================================
   CUELLOS DISTILLERY - Home hero carousel
   Four slides: lineup, Trafalgar Gin, CZAR Vodka, brand video.
   - Auto-advance every 5 s; keeps moving through the lineup and
     pauses only while pressed/held, via the pause control, or on
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

  var INTERVAL = 5000;
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
  var heldPaused = false; /* pressed-and-held */
  var video = null;
  var soundOn = true; /* try sound first; browsers may force a muted fallback */
  var soundBtn = null;

  function t(key, fallback) {
    return (window.CuellosI18N && window.CuellosI18N.t(key)) || fallback;
  }

  /* Remove the video slide if its file is unavailable.
     Existence is probed with a HEAD request (media-element error
     events also fire on harmless range-request aborts, so they
     cannot be trusted for this). A stall guard advances the
     carousel if the video ever fails to start. */
  function initVideoSlide() {
    var vSlide = root.querySelector('[data-slide-video]');
    if (!vSlide) return;
    video = vSlide.querySelector("video");
    if (!video) return;
    /* phones get the native-resolution portrait crop (full-bleed without
       upscaling blur); tablet/desktop keep the landscape master */
    var cfg = window.CuellosConfig && window.CuellosConfig.heroVideo;
    var srcSwap = video.querySelector("source");
    if (cfg && cfg.srcMobile && srcSwap && window.matchMedia("(max-width: 767px)").matches &&
        srcSwap.getAttribute("src").indexOf("data:") !== 0) {
      srcSwap.setAttribute("src", cfg.srcMobile);
    }
    video.addEventListener("ended", function () { next(true); });

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

    var srcEl = video.querySelector("source");
    var srcUrl = srcEl ? srcEl.getAttribute("src") : video.getAttribute("src");
    if (!srcUrl || typeof fetch === "undefined") return;
    if (srcUrl.indexOf("data:") === 0) return; /* inlined video (preview build) - always present */
    fetch(srcUrl, { method: "HEAD" }).then(function (res) {
      if (!res.ok) dropVideoSlide();
    }).catch(dropVideoSlide);
  }

  /* ---- Sound: the brand video carries audio. Unmuted autoplay is
     attempted first (the age-gate click usually counts as the user
     gesture browsers require); if the browser refuses, playback falls
     back to muted and the on-slide sound toggle lights up. ---- */
  function updateSoundBtn() {
    soundBtn = soundBtn || root.querySelector("[data-carousel-sound]");
    if (!soundBtn) return;
    soundBtn.setAttribute("aria-pressed", soundOn ? "true" : "false");
    soundBtn.setAttribute("data-i18n-aria", soundOn ? "carousel.soundOff" : "carousel.soundOn");
    soundBtn.setAttribute("aria-label", t(soundOn ? "carousel.soundOff" : "carousel.soundOn", soundOn ? "Turn sound off" : "Turn sound on"));
    var on = soundBtn.querySelector("[data-icon-sound-on]");
    var off = soundBtn.querySelector("[data-icon-sound-off]");
    if (on) on.style.display = soundOn ? "" : "none";
    if (off) off.style.display = soundOn ? "none" : "";
  }

  function playVideo() {
    if (!video) return;
    video.muted = !soundOn;
    var p = video.play();
    if (p && p.catch) {
      p.catch(function () {
        if (!soundOn) return;
        /* unmuted autoplay refused - fall back to muted playback */
        soundOn = false;
        updateSoundBtn();
        video.muted = true;
        video.play().catch(function () {});
      });
    }
  }

  var stallTimer = null;
  function armStallGuard() {
    clearTimeout(stallTimer);
    if (!video) return;
    stallTimer = setTimeout(function () {
      var vSlide = root.querySelector("[data-slide-video]");
      var stillActive = vSlide && vSlide.classList.contains("is-active");
      if (stillActive && video && video.readyState < 2) next(true);
    }, 6000);
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
      playVideo();
      armStallGuard();
    } else {
      clearTimeout(stallTimer);
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
    if (userPaused || heldPaused || reducedMotion || document.hidden) return;
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

    soundBtn = root.querySelector("[data-carousel-sound]");
    if (soundBtn) soundBtn.addEventListener("click", function () {
      soundOn = !soundOn;
      updateSoundBtn();
      if (video) {
        video.muted = !soundOn;
        var vSlide = root.querySelector("[data-slide-video]");
        if (soundOn && vSlide && vSlide.classList.contains("is-active") && video.paused) playVideo();
      }
    });
    updateSoundBtn();

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

    /* keep rotating unless pressed and held (or explicitly paused) */
    root.addEventListener("pointerdown", function () { heldPaused = true; clearTimeout(timer); });
    ["pointerup", "pointercancel"].forEach(function (evt) {
      root.addEventListener(evt, function () { heldPaused = false; armTimer(); });
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
    document.addEventListener("cuellos:langchange", function () { buildDots(); setToggleState(); updateSoundBtn(); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
