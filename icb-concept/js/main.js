/* ============================================================================
   ICB main — boot and chrome behaviors.
   Renders the footer and mobile quick bar from data, wires the header and
   mobile menu, sets up reveal-on-scroll, and starts the router.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var R;

  /* -------------------- Reveal on scroll -------------------- */

  var observer = null;
  ICB.reveal = function (root) {
    var nodes = (root || document).querySelectorAll(".rv:not(.is-in)");
    if (!("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(nodes, function (n) { n.classList.add("is-in"); });
      return;
    }
    if (!observer) {
      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    }
    Array.prototype.forEach.call(nodes, function (n) { observer.observe(n); });
  };

  /* -------------------- Header -------------------- */

  function initHeader() {
    var header = document.getElementById("site-header");
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* -------------------- Mobile menu -------------------- */

  /* The desktop bar. Rendered from data rather than sitting in the HTML,
     so it can restate itself in the other language. */
  function renderNav() {
    var nav = document.getElementById("site-nav");
    if (!nav) return;
    var site = ICB.DATA.site;
    nav.innerHTML = "<ul>" + site.nav
      .filter(function (n) { return n.id !== "home"; })   // the logo is Home up here
      .map(function (n) {
        return '<li><a href="' + R.esc(n.href) + '" data-nav="' + R.esc(n.id) + '">' +
          R.esc(ICB.t(n.label)) + "</a></li>";
      }).join("") + "</ul>";

    var cta = document.querySelector(".header-actions .btn-cover");
    if (cta) cta.textContent = ICB.s("exploreInsurance");
  }

  function renderMenu() {
    var sheet = document.getElementById("mobile-menu");
    if (!sheet) return;
    var site = ICB.DATA.site;

    var tiles = site.taskRoutes.slice(0, 4).map(function (t) {
      var external = !!t.external;
      return '<a class="mm-task" href="' + R.esc(t.href) + '"' + (external ? R.extAttrs() : "") + ">" +
        ICB.art.glyph(t.glyph) + "<span>" + R.esc(ICB.t(t.short)) + (external ? R.extNote(R.hostOf(t.href)) : "") + "</span></a>";
    }).join("");

    var navItems = site.nav.map(function (n) {
      return '<li><a href="' + R.esc(n.href) + '" data-nav="' + R.esc(n.id) + '">' + R.esc(ICB.t(n.label)) + "</a></li>";
    }).join("");

    sheet.innerHTML =
      '<nav aria-label="' + R.esc(ICB.s("mobileNav")) + '">' +
        '<div class="mm-tasks">' + tiles + "</div>" +
        '<div class="mm-nav"><ul>' + navItems + "</ul></div>" +
        '<div class="mm-contact">' +
          '<a class="btn btn-outline" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + ICB.art.glyph("phone") +
            "<span>" + R.esc(ICB.s("callN", { n: site.corporate.phoneDisplay })) + "</span></a>" +
          '<a class="btn btn-outline" href="mailto:' + R.esc(site.corporate.email) + '">' + ICB.art.glyph("mail") +
            "<span>" + R.esc(ICB.s("emailICB")) + "</span></a>" +
        "</div>" +
      "</nav>";
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var sheet = document.getElementById("mobile-menu");

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      sheet.hidden = !open;
      document.body.classList.toggle("sheet-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var first = sheet.querySelector("a");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    sheet.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener("icb:navigated", function () { setOpen(false); });
  }

  /* -------------------- Footer -------------------- */

  function renderFooter() {
    var site = ICB.DATA.site;
    var f = site.footer;
    var cols = f.columns.map(function (col) {
      return '<div class="footer-col"><h3>' + R.esc(ICB.t(col.heading)) + "</h3><ul>" +
        col.links.map(function (l) {
          var external = !!l.external;
          return "<li><a href=\"" + R.esc(l.href) + '"' + (external ? R.extAttrs() : "") + ">" +
            R.esc(ICB.t(l.label)) + (external ? R.extNote(R.hostOf(l.href)) : "") + "</a></li>";
        }).join("") + "</ul></div>";
    }).join("");

    document.getElementById("site-footer").innerHTML =
      '<div class="shell">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<span class="footer-logo-plate"><img data-asset="assets/img/icb-logo.png" alt="Insurance Corporation of Belize Ltd. logo"></span>' +
            '<span class="brand-lines" aria-hidden="true"><span>Insurance Corporation</span><span>of Belize Ltd.</span></span>' +
            "<p>" + R.esc(ICB.t(f.tagline)) + "</p>" +
            '<div class="footer-col"><address>' +
              R.esc(site.corporate.address) + ", " + R.esc(site.corporate.poBox) + "<br>" +
              R.esc(site.corporate.city) + ", " + R.esc(ICB.s('belize')) + "<br>" +
              '<a href="tel:' + R.esc(site.corporate.phoneTel) + '">' + R.esc(site.corporate.phoneDisplay) + "</a><br>" +
              '<a href="mailto:' + R.esc(site.corporate.email) + '">' + R.esc(site.corporate.email) + "</a>" +
            "</address></div>" +
          "</div>" + cols +
        "</div>" +
        '<div class="footer-base">' +
          /* The build-status note that used to sit here ("content pending
             ICB review") was a message to us, not to a visitor. The
             concept is still attributed, in the note beside this line. */
          "<span>&copy; " + new Date().getFullYear() + " " + R.esc(f.legal) + "</span>" +
          /* Only the studio name is the link, and it carries the same
             new-tab treatment and screen-reader note as every other
             outbound link on the site. */
          '<span class="footer-note">' + R.esc(ICB.t(f.conceptNote)) +
            '<a class="footer-credit" href="' + R.esc(f.conceptHref) + '"' + R.extAttrs() + ">" +
              R.esc(f.conceptLead) + R.extNote(R.hostOf(f.conceptHref)) +
            "</a>" +
          "</span>" +
        "</div>" +
      "</div>";
  }

  /* -------------------- Mobile quick bar -------------------- */

  function renderQuickBar() {
    var site = ICB.DATA.site;
    document.getElementById("quick-bar-mount").innerHTML =
      '<nav class="quick-bar" aria-label="' + R.esc(ICB.s("quickActions")) + '"><ul>' +
        '<li><button type="button" data-call-directory>' + ICB.art.glyph("phone") + "<span>" + R.esc(ICB.s("qbCall")) + "</span></button></li>" +
        '<li><button type="button" data-wa-directory>' + ICB.art.waIcon() + "<span>WhatsApp</span></button></li>" +
        '<li><a href="#/locations">' + ICB.art.glyph("marker") + "<span>" + R.esc(ICB.s("qbBranches")) + "</span></a></li>" +
        '<li><a href="#/contact">' + ICB.art.glyph("mail") + "<span>" + R.esc(ICB.s("qbEnquire")) + "</span></a></li>" +
      "</ul></nav>";
  }

  /* -------------------- Back to top -------------------- */

  /* Appears once the reader is well past the fold. Sits above the mobile
     quick bar so it never covers a call or WhatsApp action. */
  function initBackToTop() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "to-top";
    btn.setAttribute("aria-label", ICB.s("backToTop"));
    /* Restated when the language changes, since it is created once and
       never re-rendered. */
    document.addEventListener("icb:lang", function () {
      btn.setAttribute("aria-label", ICB.s("backToTop"));
    });
    btn.innerHTML = ICB.art.glyph("arrow-up");
    document.body.appendChild(btn);

    var shown = false;
    var ticking = false;
    function update() {
      var should = window.scrollY > window.innerHeight * 0.9;
      if (should !== shown) {
        shown = should;
        btn.classList.toggle("is-visible", shown);
      }
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    btn.addEventListener("click", function () {
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      // Send focus somewhere sensible for keyboard and screen reader users.
      var main = document.getElementById("main");
      if (main) main.focus({ preventScroll: true });
    });

    update();
  }

  /* -------------------- Language switch -------------------- */

  /* Small, beside the logo, on every screen size. It shows the language
     you are reading in and offers the other one; two languages need a
     toggle, not a menu. The caret is decorative, so the whole control is
     one button with an honest label rather than a fake select. */
  function renderLangSwitch() {
    var mount = document.getElementById("lang-switch");
    if (!mount) return;
    var i18n = ICB.i18n;
    var here = i18n.get();
    var there = i18n.other();

    mount.innerHTML =
      '<button type="button" class="lang-btn" data-lang-toggle' +
        ' aria-label="' + R.esc(i18n.s("langSwitchTo", { lang: i18n.label(there) })) + '">' +
        '<span class="lang-now">' + R.esc(i18n.label(here)) + "</span>" +
        '<span class="lang-caret" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"' +
          ' stroke-linecap="round" stroke-linejoin="round"><path d="M6 9.5l6 6 6-6"/></svg>' +
        "</span>" +
      "</button>" +
      '<span class="visually-hidden" aria-live="polite" data-lang-live></span>';
  }

  function initLangSwitch() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-lang-toggle]")) return;
      var next = ICB.i18n.other();
      ICB.i18n.set(next);
      var live = document.querySelector("[data-lang-live]");
      if (live) live.textContent = ICB.i18n.s("langNow", { lang: ICB.i18n.label(next) });
      /* Keep focus on the control: the page around it has just been
         rebuilt, and a keyboard user should not be dropped at the top. */
      var btn = document.querySelector("[data-lang-toggle]");
      if (btn) btn.focus();
    });
  }

  /* -------------------- Boot -------------------- */

  /* Everything outside the routed view. Re-run on a language change, so
     the header, menu, footer and quick bar restate themselves without a
     reload. */
  /* The two labels that live in index.html rather than in a renderer.
     They are the first and last things a keyboard or screen reader user
     meets, so they restate themselves with everything else. */
  function renderStaticLabels() {
    var skip = document.querySelector(".skip-link");
    if (skip) skip.textContent = ICB.s("skipToContent");
    var menu = document.querySelector("[data-menu-toggle] .visually-hidden");
    if (menu) menu.textContent = ICB.s("menu");
  }

  ICB.renderChrome = function () {
    renderStaticLabels();
    renderLangSwitch();
    renderNav();
    renderMenu();
    renderFooter();
    renderQuickBar();
    ICB.hydrateAssets(document);
  };

  function boot() {
    R = ICB.render;
    ICB.i18n.init();
    initHeader();
    initMenu();
    initLangSwitch();
    ICB.renderChrome();
    initBackToTop();
    ICB.router.init();
    ICB.reveal(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
