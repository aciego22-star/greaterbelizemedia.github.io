/*
  Orange Walk Multicare Hospital, proposal preview
  Shared behaviour: navigation, hero carousel, gallery, forms, video.
  Every form on this site is a front-end demonstration and transmits nothing.
*/
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  document.addEventListener("DOMContentLoaded", function () {
    setupNav();
    setupCarousel();
    setupVideo();
    setupReveal();
    setupGallery();
    setupDemoForms();
  });

  /* ---------- Mobile navigation ---------- */
  function setupNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (!toggle || !nav) { return; }

    function openMenu() {
      nav.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var first = nav.querySelector("a, button");
      if (first) { first.focus(); }
    }

    function closeMenu(returnFocus) {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
      if (returnFocus) { toggle.focus(); }
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("open")) { closeMenu(false); } else { openMenu(); }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(true); }
    });

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("open") && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu(false);
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });
  }

  /* ---------- Hero carousel ---------- */
  function setupCarousel() {
    var hero = document.querySelector(".hero");
    if (!hero) { return; }

    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    if (slides.length < 2) { return; }

    var dotsWrap = hero.querySelector(".hero-dots");
    var prevBtn = hero.querySelector(".hero-prev");
    var nextBtn = hero.querySelector(".hero-next");
    var pauseBtn = hero.querySelector(".hero-pause");
    var ui = hero.querySelector(".hero-ui");
    var current = 0;
    var timer = null;
    var userPaused = false;
    var hovered = false;
    var offscreen = false;
    var INTERVAL = 9000;

    var dots = slides.map(function (slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      var label = slide.getAttribute("data-label") || ("Slide " + (i + 1));
      var labelEs = slide.getAttribute("data-label-es") || label;
      dot.setAttribute("aria-label", label);
      dot.setAttribute("data-es-aria", labelEs);
      dot.addEventListener("click", function () { go(i); restart(); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function go(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
        slide.setAttribute("aria-hidden", i === current ? "false" : "true");
      });
      dots.forEach(function (dot, i) {
        dot.setAttribute("aria-current", i === current ? "true" : "false");
      });
      if (ui) {
        ui.classList.toggle("hero-light-ui", slides[current].classList.contains("slide-nhi"));
      }
      hero.dispatchEvent(new CustomEvent("owm:slide", { detail: { index: current } }));
    }

    function shouldRun() {
      return !userPaused && !hovered && !offscreen && !reducedMotion.matches && !document.hidden;
    }

    function tick() {
      timer = null;
      if (shouldRun()) { go(current + 1); }
      schedule();
    }

    function schedule() {
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(tick, INTERVAL);
    }

    function restart() { schedule(); }

    function syncPauseButton() {
      if (!pauseBtn) { return; }
      var playing = !userPaused;
      pauseBtn.querySelector(".ic-pause").style.display = playing ? "" : "none";
      pauseBtn.querySelector(".ic-play").style.display = playing ? "none" : "";
      var en = playing ? "Pause slideshow" : "Play slideshow";
      var es = playing ? "Pausar presentacion" : "Reproducir presentacion";
      pauseBtn.setAttribute("aria-label", window.OWMI18N ? window.OWMI18N.pick(en, es) : en);
      pauseBtn.setAttribute("data-es-aria", es);
      pauseBtn.dataset.enAria = en;
    }

    if (prevBtn) { prevBtn.addEventListener("click", function () { go(current - 1); restart(); }); }
    if (nextBtn) { nextBtn.addEventListener("click", function () { go(current + 1); restart(); }); }
    if (pauseBtn) {
      pauseBtn.addEventListener("click", function () {
        userPaused = !userPaused;
        syncPauseButton();
      });
    }

    hero.addEventListener("mouseenter", function () { hovered = true; });
    hero.addEventListener("mouseleave", function () { hovered = false; });
    hero.addEventListener("focusin", function () { hovered = true; });
    hero.addEventListener("focusout", function () { hovered = false; });

    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") { go(current - 1); restart(); }
      if (e.key === "ArrowRight") { go(current + 1); restart(); }
    });

    var touchX = null;
    hero.addEventListener("touchstart", function (e) {
      touchX = e.touches[0].clientX;
    }, { passive: true });
    hero.addEventListener("touchend", function (e) {
      if (touchX === null) { return; }
      var dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 48) {
        go(dx < 0 ? current + 1 : current - 1);
        restart();
      }
      touchX = null;
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        offscreen = !entries[0].isIntersecting;
      }, { threshold: 0.15 }).observe(hero);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) { restart(); }
    });

    go(0);
    syncPauseButton();
    if (!reducedMotion.matches) { schedule(); }
  }

  /* ---------- Hero video ---------- */
  function setupVideo() {
    var frame = document.querySelector(".video-frame");
    if (!frame) { return; }
    var video = frame.querySelector("video");
    var playBtn = frame.querySelector(".vc-play");
    var muteBtn = frame.querySelector(".vc-mute");
    if (!video) { return; }

    video.muted = true;

    function markMissing() { frame.classList.add("no-source"); }
    video.addEventListener("error", markMissing, true);
    var source = video.querySelector("source");
    if (source) { source.addEventListener("error", markMissing); }

    function syncPlay() {
      var playing = !video.paused && !video.ended;
      playBtn.querySelector(".ic-pause").style.display = playing ? "" : "none";
      playBtn.querySelector(".ic-play").style.display = playing ? "none" : "";
      var en = playing ? "Pause video" : "Play video";
      var es = playing ? "Pausar video" : "Reproducir video";
      playBtn.setAttribute("aria-label", window.OWMI18N ? window.OWMI18N.pick(en, es) : en);
      playBtn.setAttribute("data-es-aria", es);
      playBtn.dataset.enAria = en;
    }

    function syncMute() {
      muteBtn.querySelector(".ic-muted").style.display = video.muted ? "" : "none";
      muteBtn.querySelector(".ic-sound").style.display = video.muted ? "none" : "";
      var en = video.muted ? "Unmute video" : "Mute video";
      var es = video.muted ? "Activar sonido" : "Silenciar video";
      muteBtn.setAttribute("aria-label", window.OWMI18N ? window.OWMI18N.pick(en, es) : en);
      muteBtn.setAttribute("data-es-aria", es);
      muteBtn.dataset.enAria = en;
    }

    playBtn.addEventListener("click", function () {
      if (video.paused) { video.play().catch(markMissing); } else { video.pause(); }
    });
    muteBtn.addEventListener("click", function () {
      video.muted = !video.muted;
      syncMute();
    });
    video.addEventListener("play", syncPlay);
    video.addEventListener("pause", syncPlay);

    /* Pause when its slide is not active or the hero leaves the screen. */
    var hero = document.querySelector(".hero");
    if (hero) {
      hero.addEventListener("owm:slide", function () {
        var slide = frame.closest(".hero-slide");
        if (slide && !slide.classList.contains("is-active") && !video.paused) { video.pause(); }
      });
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting && !video.paused) { video.pause(); }
      }, { threshold: 0.1 }).observe(frame);
    }

    syncPlay();
    syncMute();
  }

  /* ---------- Scroll reveal ---------- */
  function setupReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) { return; }
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Gallery filters and lightbox ---------- */
  function setupGallery() {
    var grid = document.querySelector(".gallery-grid");
    if (!grid) { return; }

    var buttons = document.querySelectorAll(".filter-btn");
    var items = Array.prototype.slice.call(grid.querySelectorAll(".gallery-item"));

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        var cat = btn.getAttribute("data-filter");
        items.forEach(function (item) {
          var match = cat === "all" || item.getAttribute("data-cat") === cat;
          item.classList.toggle("is-hidden", !match);
        });
      });
    });

    var lightbox = document.querySelector(".lightbox");
    if (!lightbox) { return; }
    var lbImg = lightbox.querySelector("img");
    var lbCap = lightbox.querySelector("figcaption");
    var closeBtn = lightbox.querySelector(".lb-close");
    var prevBtn = lightbox.querySelector(".lb-prev");
    var nextBtn = lightbox.querySelector(".lb-next");
    var openIndex = -1;
    var lastFocus = null;

    function visibleItems() {
      return items.filter(function (item) { return !item.classList.contains("is-hidden"); });
    }

    function show(index) {
      var list = visibleItems();
      if (!list.length) { return; }
      openIndex = (index + list.length) % list.length;
      var item = list[openIndex];
      var img = item.querySelector("img");
      lbImg.src = item.getAttribute("data-full") || img.src;
      lbImg.alt = img.alt;
      var capEn = item.getAttribute("data-cap") || "";
      var capEs = item.getAttribute("data-cap-es") || capEn;
      lbCap.textContent = window.OWMI18N ? window.OWMI18N.pick(capEn, capEs) : capEn;
    }

    function open(item) {
      lastFocus = document.activeElement;
      lightbox.classList.add("open");
      document.body.style.overflow = "hidden";
      show(visibleItems().indexOf(item));
      closeBtn.focus();
    }

    function close() {
      lightbox.classList.remove("open");
      document.body.style.overflow = "";
      openIndex = -1;
      if (lastFocus) { lastFocus.focus(); }
    }

    items.forEach(function (item) {
      item.addEventListener("click", function () { open(item); });
    });

    closeBtn.addEventListener("click", close);
    prevBtn.addEventListener("click", function () { show(openIndex - 1); });
    nextBtn.addEventListener("click", function () { show(openIndex + 1); });

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) { close(); }
    });

    document.addEventListener("keydown", function (e) {
      if (!lightbox.classList.contains("open")) { return; }
      if (e.key === "Escape") { close(); }
      if (e.key === "ArrowLeft") { show(openIndex - 1); }
      if (e.key === "ArrowRight") { show(openIndex + 1); }
    });

    var lbTouchX = null;
    lightbox.addEventListener("touchstart", function (e) {
      lbTouchX = e.touches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener("touchend", function (e) {
      if (lbTouchX === null) { return; }
      var dx = e.changedTouches[0].clientX - lbTouchX;
      if (Math.abs(dx) > 48) { show(dx < 0 ? openIndex + 1 : openIndex - 1); }
      lbTouchX = null;
    }, { passive: true });
  }

  /* ---------- Demonstration forms: nothing is transmitted ---------- */
  function setupDemoForms() {
    document.querySelectorAll("form[data-demo]").forEach(function (form) {
      form.setAttribute("novalidate", "novalidate");

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        var valid = true;
        var firstInvalid = null;

        form.querySelectorAll("[required]").forEach(function (input) {
          var field = input.closest(".field") || input.closest(".consent-wrap");
          var ok = input.type === "checkbox" ? input.checked : input.value.trim() !== "";
          if (ok && input.type === "email") {
            ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
          }
          if (field) { field.classList.toggle("invalid", !ok); }
          if (!ok) {
            valid = false;
            if (!firstInvalid) { firstInvalid = input; }
          }
        });

        var status = form.querySelector(".form-status");
        if (!valid) {
          if (status) { status.classList.remove("show"); }
          if (firstInvalid) { firstInvalid.focus(); }
          return;
        }

        if (status) {
          var en = form.getAttribute("data-msg-en") || "Demo complete. Nothing was transmitted.";
          var es = form.getAttribute("data-msg-es") || en;
          status.textContent = window.OWMI18N ? window.OWMI18N.pick(en, es) : en;
          status.classList.add("show");
          status.focus();
        }
        form.reset();
      });

      form.querySelectorAll("input, select, textarea").forEach(function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field") || input.closest(".consent-wrap");
          if (field) { field.classList.remove("invalid"); }
        });
      });
    });

    /* Refresh visible status messages when the language changes. */
    document.addEventListener("owm:langchange", function () {
      document.querySelectorAll("form[data-demo] .form-status.show").forEach(function (status) {
        var form = status.closest("form");
        var en = form.getAttribute("data-msg-en") || "";
        var es = form.getAttribute("data-msg-es") || en;
        status.textContent = window.OWMI18N.pick(en, es);
      });
    });
  }
})();
