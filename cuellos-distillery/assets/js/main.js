/* ============================================================
   CUELLO'S DISTILLERY — Shared behaviour
   Header, mobile menu, reveals, spirit rail, news rendering,
   hero media control, footer utilities.
   ============================================================ */

(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- Focus trap helper (shared with modals) ---------- */

  function trapFocus(container, e) {
    var focusables = $$(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      container
    ).filter(function (el) { return el.offsetParent !== null || el === document.activeElement; });
    if (!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  }
  window.CuellosTrapFocus = trapFocus;

  /* ---------- Header scroll state ---------- */

  var header = $(".site-header");
  function onScroll() {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */

  var menuToggle = $(".menu-toggle");
  var mobileMenu = $("#mobile-menu");
  var lastFocused = null;

  function menuLabel(open) {
    if (!window.CuellosI18N) return;
    menuToggle.setAttribute("data-i18n-aria", open ? "nav.menuClose" : "nav.menuOpen");
    menuToggle.setAttribute("aria-label", window.CuellosI18N.t(open ? "nav.menuClose" : "nav.menuOpen"));
  }
  function openMenu() {
    lastFocused = document.activeElement;
    mobileMenu.classList.add("is-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuLabel(true);
    document.body.classList.add("no-scroll");
    var firstLink = $("a", mobileMenu);
    if (firstLink) firstLink.focus();
  }
  function closeMenu() {
    mobileMenu.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuLabel(false);
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", function () {
      if (mobileMenu.classList.contains("is-open")) closeMenu(); else openMenu();
    });
    mobileMenu.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeMenu(); return; }
      if (e.key === "Tab") {
        // include the toggle button in the cycle via wrap-around inside the panel
        trapFocus(mobileMenu, e);
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100 && mobileMenu.classList.contains("is-open")) closeMenu();
    });
  }

  /* ---------- Scroll reveals ---------- */

  function initReveals() {
    var items = $$(".reveal");
    if (!items.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Spirit rail (home) ---------- */

  function productCard(p, opts) {
    opts = opts || {};
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    var href = "our-spirits.html#" + p.id;
    var catLabel = window.CuellosData.categoryLabel[p.category][lang];
    var hint = window.CuellosI18N ? window.CuellosI18N.t("home.viewSpirit") : "View details";
    var imgBase = "assets/img/products/" + p.id;
    return '' +
      '<a class="product-card" href="' + href + '" style="--accent:' + p.accent + '">' +
        '<span class="product-card__media">' +
          '<img src="' + imgBase + '-450.webp" srcset="' + imgBase + '-450.webp 450w, ' + imgBase + '.webp 900w" ' +
            'sizes="(max-width: 560px) 66vw, 300px" width="450" height="675" ' +
            (opts.eager ? '' : 'loading="lazy" ') + 'alt="' + p.alt[lang] + '">' +
          '<span class="product-card__accent" aria-hidden="true"></span>' +
        '</span>' +
        '<span class="product-card__body">' +
          '<span class="product-card__cat">' + catLabel + '</span>' +
          '<span class="product-card__name">' + p.name + '</span>' +
          '<span class="product-card__hint">' + hint + ' →</span>' +
        '</span>' +
      '</a>';
  }
  window.CuellosProductCard = productCard;

  function renderRail() {
    var rail = $("#spirit-rail");
    if (!rail || !window.CuellosData) return;
    rail.innerHTML = window.CuellosData.featured.map(function (id) {
      return productCard(window.CuellosData.byId(id));
    }).join("");
    updateRailButtons();
  }

  function updateRailButtons() {
    var rail = $("#spirit-rail");
    if (!rail) return;
    var prev = $("[data-rail-prev]");
    var next = $("[data-rail-next]");
    if (!prev || !next) return;
    var max = rail.scrollWidth - rail.clientWidth - 4;
    prev.disabled = rail.scrollLeft <= 4;
    next.disabled = rail.scrollLeft >= max;
  }

  function initRail() {
    var rail = $("#spirit-rail");
    if (!rail) return;
    renderRail();
    rail.addEventListener("scroll", updateRailButtons, { passive: true });
    window.addEventListener("resize", updateRailButtons);
    var step = function () { return Math.min(rail.clientWidth * 0.8, 340); };
    var prev = $("[data-rail-prev]");
    var next = $("[data-rail-next]");
    if (prev) prev.addEventListener("click", function () {
      rail.scrollBy({ left: -step(), behavior: reducedMotion ? "auto" : "smooth" });
    });
    if (next) next.addEventListener("click", function () {
      rail.scrollBy({ left: step(), behavior: reducedMotion ? "auto" : "smooth" });
    });
    document.addEventListener("cuellos:langchange", renderRail);
  }

  /* ---------- News rendering (home preview + news page) ---------- */

  function newsCard(item) {
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    var t = window.CuellosI18N.t;
    return '' +
      '<article class="news-card reveal">' +
        '<div class="news-card__media"><img src="' + item.img + '-640.webp" ' +
          'srcset="' + item.img + '-640.webp 640w, ' + item.img + '.webp ' + item.w + 'w" ' +
          'sizes="(max-width: 700px) 92vw, 380px" width="' + item.w + '" height="' + item.h + '" ' +
          'loading="lazy" alt="' + item.alt[lang] + '"></div>' +
        '<div class="news-card__body">' +
          '<div class="news-card__meta"><span>' + t(item.category) + '</span>' +
            '<span class="date">' + t("news.dateTBA") + '</span></div>' +
          '<h3>' + item.title[lang] + '</h3>' +
          '<p>' + item.excerpt[lang] + '</p>' +
          '<button type="button" class="text-link" data-news-open="' + item.id + '">' +
            t("common.readMore") + ' <span class="concept-badge">' + t("news.sampleBadge") + '</span></button>' +
        '</div>' +
      '</article>';
  }

  function renderNews() {
    if (!window.CuellosData) return;
    $$("[data-news-grid]").forEach(function (grid) {
      var limit = parseInt(grid.getAttribute("data-limit") || "99", 10);
      var items = window.CuellosData.news.filter(function (n) { return !n.featured; }).slice(0, limit);
      grid.innerHTML = items.map(newsCard).join("");
      $$(".reveal", grid).forEach(function (el) { el.classList.add("is-in"); });
    });
    /* featured story (news page) follows the active language too */
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    var featured = window.CuellosData.news.filter(function (n) { return n.featured; })[0];
    if (featured) {
      var ft = $("[data-news-featured-title]");
      var fe = $("[data-news-featured-excerpt]");
      if (ft) ft.textContent = featured.title[lang];
      if (fe) fe.textContent = featured.excerpt[lang];
    }
  }
  window.CuellosRenderNews = renderNews;

  /* Simple accessible modal for sample-article preview */
  var newsModal = null;
  function openNewsModal(id) {
    var item = null;
    window.CuellosData.news.forEach(function (n) { if (n.id === id) item = n; });
    if (!item) return;
    var lang = window.CuellosI18N.lang;
    var t = window.CuellosI18N.t;
    closeNewsModal();
    lastFocused = document.activeElement;
    newsModal = document.createElement("div");
    newsModal.className = "lightbox is-open";
    newsModal.setAttribute("role", "dialog");
    newsModal.setAttribute("aria-modal", "true");
    newsModal.setAttribute("aria-label", item.title[lang]);
    newsModal.innerHTML =
      '<button type="button" class="lightbox__btn lightbox__close" data-news-close aria-label="' + t("common.close") + '">' +
        '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="lightbox__stage"><div style="max-width:640px;background:var(--cream);color:var(--ink);border-radius:16px;padding:2rem;max-height:100%;overflow-y:auto;">' +
        '<p class="news-card__meta" style="margin-bottom:.5rem"><span style="color:var(--copper);font-weight:800;text-transform:uppercase;font-size:.72rem;letter-spacing:.12em">' + t(item.category) + '</span></p>' +
        '<h3 style="font-family:var(--font-display);font-size:1.6rem;margin:0 0 .8rem">' + item.title[lang] + '</h3>' +
        '<p style="color:var(--ink-muted)">' + item.excerpt[lang] + '</p>' +
        '<p style="font-size:.85rem;border-left:3px solid var(--gold);padding-left:.8rem;color:var(--ink-muted)">' + t("news.modalNote") + '</p>' +
      '</div></div>';
    document.body.appendChild(newsModal);
    document.body.classList.add("no-scroll");
    newsModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNewsModal();
      if (e.key === "Tab") trapFocus(newsModal, e);
    });
    newsModal.addEventListener("click", function (e) {
      if (e.target === newsModal || e.target.closest("[data-news-close]")) closeNewsModal();
    });
    $(".lightbox__close", newsModal).focus();
  }
  function closeNewsModal() {
    if (!newsModal) return;
    newsModal.remove();
    newsModal = null;
    document.body.classList.remove("no-scroll");
    if (lastFocused) lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest ? e.target.closest("[data-news-open]") : null;
    if (opener) openNewsModal(opener.getAttribute("data-news-open"));
  });

  /* ---------- Hero media pause control ---------- */

  function initHeroMedia() {
    var btn = $("[data-media-toggle]");
    var video = $("#hero-video");
    if (!btn) return;
    if (!video) { btn.parentElement.style.display = "none"; return; }
    if (reducedMotion) video.removeAttribute("autoplay");
    btn.addEventListener("click", function () {
      if (video.paused) { video.play(); btn.setAttribute("data-state", "playing"); }
      else { video.pause(); btn.setAttribute("data-state", "paused"); }
    });
  }

  /* ---------- Footer year + age reset ---------- */

  function initFooter() {
    var year = $("#footer-year");
    if (year) year.textContent = String(new Date().getFullYear());
    var reset = $("[data-age-reset]");
    if (reset) {
      reset.addEventListener("click", function (e) {
        e.preventDefault();
        if (window.CuellosAgeGate) window.CuellosAgeGate.reset();
      });
    }
  }

  /* ---------- Re-render data-driven sections on language change ---------- */

  document.addEventListener("cuellos:langchange", function () {
    renderNews();
  });

  /* ---------- Boot ---------- */

  function boot() {
    initReveals();
    initRail();
    renderNews();
    initHeroMedia();
    initFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
