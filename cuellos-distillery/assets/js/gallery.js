/* ============================================================
   CUELLO'S DISTILLERY - Gallery
   Filterable masonry + accessible lightbox for images & video.
   - Videos play only on intentional tap (poster first).
   - Video stops when the lightbox closes.
   - Lazy loading; per-item focal points from the manifest.
   ============================================================ */

(function () {
  "use strict";

  var D = window.CuellosData;
  var I = window.CuellosI18N;

  var currentFilter = "all";
  var visibleItems = [];
  var lightbox = null;
  var lastFocused = null;
  var currentIndex = 0;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  var CATS = [
    { id: "all", key: "gallery.catAll" },
    { id: "products", key: "gallery.catProducts" },
    { id: "distillery", key: "gallery.catDistillery" },
    { id: "events", key: "gallery.catEvents" },
    { id: "community", key: "gallery.catCommunity" },
    { id: "videos", key: "gallery.catVideos" }
  ];

  function hasVideos() {
    return D.gallery.some(function (g) { return g.type === "video"; });
  }

  function renderChips() {
    var host = $("#gallery-filters");
    if (!host) return;
    host.innerHTML = CATS.filter(function (c) {
      if (c.id === "videos" && !hasVideos()) return false; /* chip appears automatically once a video is added */
      return true;
    }).map(function (c) {
      return '<button type="button" class="chip" data-filter="' + c.id + '" aria-pressed="' +
        (currentFilter === c.id ? "true" : "false") + '">' + I.t(c.key) + '</button>';
    }).join("");
  }

  function itemMatches(g) {
    if (currentFilter === "all") return true;
    if (currentFilter === "videos") return g.type === "video";
    return g.category === currentFilter;
  }

  function renderGrid() {
    var host = $("#gallery-grid");
    if (!host) return;
    var lang = I.lang;
    visibleItems = D.gallery.filter(itemMatches);
    host.innerHTML = visibleItems.map(function (g, idx) {
      var isVideo = g.type === "video";
      var thumb = isVideo ? g.poster : g.img;
      var label = (isVideo ? I.t("gallery.playVideo") : I.t("gallery.openImage")) + ": " + g.caption[lang];
      return '<button type="button" class="masonry__item" data-gallery-index="' + idx + '" aria-label="' + label + '">' +
        '<img src="' + thumb + '-640.webp" srcset="' + thumb + '-640.webp 640w, ' + thumb + '.webp ' + (g.w || 1280) + 'w" ' +
          'sizes="(max-width: 560px) 46vw, (max-width: 900px) 44vw, 30vw" ' +
          'width="' + (g.w || 1280) + '" height="' + (g.h || 720) + '" loading="lazy" ' +
          'style="object-position:' + (g.focal || "50% 50%") + '" alt="' + g.alt[lang] + '">' +
        (isVideo
          ? '<span class="play-badge" aria-hidden="true"><span><svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M6 4l10 6-10 6V4z"/></svg></span></span>'
          : '') +
        '<span class="cap" aria-hidden="true">' + g.caption[lang] + '</span>' +
      '</button>';
    }).join("");
  }

  /* ---------- Lightbox ---------- */

  function stageContent(g) {
    var lang = I.lang;
    if (g.type === "video") {
      return '<video controls playsinline preload="none" poster="' + g.poster + '.webp" style="max-height:100%">' +
        '<source src="' + g.src + '" type="video/mp4"></video>';
    }
    return '<img src="' + g.img + '.webp" width="' + (g.w || 1280) + '" height="' + (g.h || 720) + '" alt="' + g.alt[lang] + '">';
  }

  function showIndex(idx) {
    if (!lightbox || !visibleItems.length) return;
    currentIndex = (idx + visibleItems.length) % visibleItems.length;
    var g = visibleItems[currentIndex];
    /* stop any playing video before swapping content */
    var oldVideo = $("video", lightbox);
    if (oldVideo) { oldVideo.pause(); }
    $(".lightbox__stage", lightbox).innerHTML = stageContent(g);
    $(".lightbox__caption", lightbox).textContent = g.caption[I.lang];
  }

  function openLightbox(idx) {
    lastFocused = document.activeElement;
    lightbox = document.createElement("div");
    lightbox.className = "lightbox is-open";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", I.t("gallery.lightboxLabel"));
    lightbox.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" data-lb-close aria-label="' + I.t("common.close") + '">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
      '<button type="button" class="lightbox__btn lightbox__prev" data-lb-prev aria-label="' + I.t("common.previous") + '">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10 2L4 8l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<button type="button" class="lightbox__btn lightbox__next" data-lb-next aria-label="' + I.t("common.next") + '">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 2l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>' +
      '<div class="lightbox__stage"></div>' +
      '<p class="lightbox__caption"></p>';
    document.body.appendChild(lightbox);
    document.body.classList.add("no-scroll");
    showIndex(idx);

    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest("[data-lb-close]")) { closeLightbox(); return; }
      if (e.target.closest("[data-lb-prev]")) showIndex(currentIndex - 1);
      if (e.target.closest("[data-lb-next]")) showIndex(currentIndex + 1);
    });
    lightbox.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showIndex(currentIndex - 1);
      if (e.key === "ArrowRight") showIndex(currentIndex + 1);
      if (e.key === "Tab" && window.CuellosTrapFocus) window.CuellosTrapFocus(lightbox, e);
    });
    $(".lightbox__close", lightbox).focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    var video = $("video", lightbox);
    if (video) video.pause(); /* stop playback on close */
    lightbox.remove();
    lightbox = null;
    document.body.classList.remove("no-scroll");
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  /* ---------- Events ---------- */

  document.addEventListener("click", function (e) {
    var chip = e.target.closest ? e.target.closest("[data-filter]") : null;
    if (chip) {
      currentFilter = chip.getAttribute("data-filter");
      renderChips();
      renderGrid();
      return;
    }
    var item = e.target.closest ? e.target.closest("[data-gallery-index]") : null;
    if (item) openLightbox(parseInt(item.getAttribute("data-gallery-index"), 10));
  });

  document.addEventListener("cuellos:langchange", function () {
    renderChips();
    renderGrid();
    if (lightbox) showIndex(currentIndex);
  });

  function boot() {
    if (!$("#gallery-grid")) return;
    renderChips();
    renderGrid();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
