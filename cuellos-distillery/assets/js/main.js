/* ============================================================
   CUELLOS DISTILLERY - Shared behaviour
   Header, mobile menu, reveals, news cards, WhatsApp/email
   actions, footer utilities.
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
      if (e.key === "Tab") trapFocus(mobileMenu, e);
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

  /* ---------- WhatsApp / email actions ----------
     One central number lives in assets/js/config.js. Elements:
     [data-action="wa-contact"] [data-action="wa-trade"]
     [data-action="mail-contact"] [data-action="mail-trade"]
     hrefs are rebuilt in the active language.               */

  function buildActionLinks() {
    var cfg = window.CuellosConfig;
    var I = window.CuellosI18N;
    if (!cfg || !I) return;
    var map = {
      "wa-contact": function () {
        return "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(I.t("contact.waMessage"));
      },
      "wa-trade": function () {
        return "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(I.t("trade.waMessage"));
      },
      "mail-contact": function () {
        return "mailto:" + cfg.email + "?subject=" + encodeURIComponent(I.t("contact.emailSubject")) +
          "&body=" + encodeURIComponent(I.t("contact.emailBody"));
      },
      "mail-trade": function () {
        return "mailto:" + cfg.email + "?subject=" + encodeURIComponent(I.t("trade.emailSubject")) +
          "&body=" + encodeURIComponent(I.t("trade.emailBody"));
      }
    };
    $$("[data-action]").forEach(function (a) {
      var kind = a.getAttribute("data-action");
      if (map[kind]) a.setAttribute("href", map[kind]());
    });
  }

  /* ---------- News rendering (neutral photo cards) ---------- */

  function newsCard(item) {
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    return '' +
      '<article class="news-card reveal">' +
        '<div class="news-card__media"><img src="' + item.img + '-640.webp" ' +
          'srcset="' + item.img + '-640.webp 640w, ' + item.img + '.webp ' + item.w + 'w" ' +
          'sizes="(max-width: 700px) 92vw, 380px" width="' + item.w + '" height="' + item.h + '" ' +
          'loading="lazy" alt="' + item.alt[lang] + '"></div>' +
        '<div class="news-card__body">' +
          '<h3>' + item.title[lang] + '</h3>' +
          '<p>' + item.caption[lang] + '</p>' +
        '</div>' +
      '</article>';
  }

  function renderNews() {
    if (!window.CuellosData) return;
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    $$("[data-news-grid]").forEach(function (grid) {
      var limit = parseInt(grid.getAttribute("data-limit") || "99", 10);
      var items = window.CuellosData.news.filter(function (n) { return !n.featured; }).slice(0, limit);
      grid.innerHTML = items.map(newsCard).join("");
      $$(".reveal", grid).forEach(function (el) { el.classList.add("is-in"); });
    });
    var featured = window.CuellosData.news.filter(function (n) { return n.featured; })[0];
    if (featured) {
      var ft = $("[data-news-featured-title]");
      var fe = $("[data-news-featured-excerpt]");
      if (ft) ft.textContent = featured.title[lang];
      if (fe) fe.textContent = featured.caption[lang];
    }
  }
  window.CuellosRenderNews = renderNews;

  /* ---------- Approved recipes (cocktails page) ----------
     Renders CuellosData.cocktails into #recipe-grid. The list is
     empty until Cuello's supplies official recipes, so nothing
     shows in the concept - add recipes to data.js to publish. */

  function renderRecipes() {
    var host = $("#recipe-grid");
    if (!host || !window.CuellosData) return;
    var lang = window.CuellosI18N ? window.CuellosI18N.lang : "en";
    host.innerHTML = window.CuellosData.cocktails.map(function (c) {
      var p = window.CuellosData.byId(c.spirit);
      return '<article class="recipe-card" id="' + c.id + '" style="--accent:' + (c.accent || "#C47828") + '">' +
        '<div class="recipe-card__body">' +
          (p ? '<p class="recipe-card__tag">' + p.name + '</p>' : '') +
          '<h3>' + c.name[lang] + '</h3>' +
          (c.ingredients ? '<p class="recipe-card__desc">' + c.ingredients[lang] + '</p>' : '') +
          (c.method ? '<p class="recipe-card__desc">' + c.method[lang] + '</p>' : '') +
          (p ? '<a class="text-link" href="our-spirits.html#' + p.id + '">' + p.name + ' →</a>' : '') +
        '</div>' +
      '</article>';
    }).join("");
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

  /* ---------- Re-render data-driven bits on language change ---------- */

  document.addEventListener("cuellos:langchange", function () {
    renderNews();
    renderRecipes();
    buildActionLinks();
  });

  /* ---------- Boot ---------- */

  function boot() {
    initReveals();
    renderNews();
    renderRecipes();
    buildActionLinks();
    initFooter();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
