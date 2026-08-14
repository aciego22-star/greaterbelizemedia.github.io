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

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var sheet = document.getElementById("mobile-menu");
    var site = ICB.DATA.site;

    var tiles = site.taskRoutes.slice(0, 4).map(function (t) {
      var external = !!t.external;
      return '<a class="mm-task" href="' + R.esc(t.href) + '"' + (external ? R.extAttrs() : "") + ">" +
        ICB.art.glyph(t.glyph) + "<span>" + R.esc(t.short) + (external ? R.extNote(R.hostOf(t.href)) : "") + "</span></a>";
    }).join("");

    var navItems = site.nav.map(function (n) {
      return '<li><a href="' + R.esc(n.href) + '" data-nav="' + R.esc(n.id) + '">' + R.esc(n.label) + "</a></li>";
    }).join("");

    sheet.innerHTML =
      '<nav aria-label="Mobile">' +
        '<div class="mm-tasks">' + tiles + "</div>" +
        '<div class="mm-nav"><ul>' + navItems + "</ul></div>" +
        '<div class="mm-contact">' +
          '<a class="btn btn-outline" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + ICB.art.glyph("phone") + "<span>Call " + R.esc(site.corporate.phoneDisplay) + "</span></a>" +
          '<a class="btn btn-outline" href="mailto:' + R.esc(site.corporate.email) + '">' + ICB.art.glyph("mail") + "<span>Email ICB</span></a>" +
        "</div>" +
      "</nav>";

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
      return '<div class="footer-col"><h3>' + R.esc(col.heading) + "</h3><ul>" +
        col.links.map(function (l) {
          var external = !!l.external;
          return "<li><a href=\"" + R.esc(l.href) + '"' + (external ? R.extAttrs() : "") + ">" +
            R.esc(l.label) + (external ? R.extNote(R.hostOf(l.href)) : "") + "</a></li>";
        }).join("") + "</ul></div>";
    }).join("");

    document.getElementById("site-footer").innerHTML =
      '<div class="shell">' +
        '<div class="footer-grid">' +
          '<div class="footer-brand">' +
            '<span class="brand-text"><span class="brand-name">' + R.esc(site.org.fullName) + '</span>' +
            '<span class="brand-sub">' + R.esc(site.org.heritageLine) + "</span></span>" +
            "<p>" + R.esc(f.tagline) + "</p>" +
            '<div class="footer-col"><address>' +
              R.esc(site.corporate.address) + ", " + R.esc(site.corporate.poBox) + "<br>" +
              R.esc(site.corporate.city) + ", Belize<br>" +
              '<a href="tel:' + R.esc(site.corporate.phoneTel) + '">' + R.esc(site.corporate.phoneDisplay) + "</a><br>" +
              '<a href="mailto:' + R.esc(site.corporate.email) + '">' + R.esc(site.corporate.email) + "</a>" +
            "</address></div>" +
          "</div>" + cols +
        "</div>" +
        '<div class="footer-base">' +
          "<span>&copy; " + new Date().getFullYear() + " " + R.esc(f.legal) + " Concept draft; content pending ICB review.</span>" +
          '<span class="footer-note">' + R.esc(f.conceptNote) + "</span>" +
        "</div>" +
      "</div>";
  }

  /* -------------------- Mobile quick bar -------------------- */

  function renderQuickBar() {
    var site = ICB.DATA.site;
    document.getElementById("quick-bar-mount").innerHTML =
      '<nav class="quick-bar" aria-label="Quick actions"><ul>' +
        '<li><a href="tel:' + R.esc(site.corporate.phoneTel) + '">' + ICB.art.glyph("phone") + "<span>Call</span></a></li>" +
        '<li><button type="button" data-wa-chooser>' + ICB.art.glyph("whatsapp") + "<span>WhatsApp</span></button></li>" +
        '<li><a href="#/locations">' + ICB.art.glyph("marker") + "<span>Branches</span></a></li>" +
        '<li><button type="button" data-ask-launcher>' + ICB.art.glyph("chat") + "<span>Ask ICB</span></button></li>" +
      "</ul></nav>";
  }

  /* WhatsApp chooser: only the published WhatsApp lines. */
  function openWaChooser(returnFocusTo) {
    var lines = ICB.DATA.whatsappLines();
    var overlay = document.createElement("div");
    overlay.className = "mini-dialog-overlay";
    overlay.innerHTML =
      '<div class="mini-dialog" role="dialog" aria-modal="true" aria-labelledby="wa-title">' +
        '<h2 id="wa-title">WhatsApp chat with ICB</h2>' +
        '<p class="loc-note">These branches currently publish WhatsApp lines.</p>' +
        '<div class="msg-actions">' +
          lines.map(function (l) {
            return '<a class="msg-action" href="https://wa.me/' + R.esc(l.whatsapp.wa) + '"' + R.extAttrs() + ">" +
              ICB.art.glyph("whatsapp") + "<span>" + R.esc(l.name) + ", " + R.esc(l.whatsapp.display) + "</span>" + R.extNote("wa.me") + "</a>";
          }).join("") +
          '<button type="button" class="msg-action" data-wa-close>' + ICB.art.glyph("close") + "<span>Close</span></button>" +
        "</div>" +
      "</div>";
    document.body.appendChild(overlay);

    function close() {
      overlay.remove();
      document.removeEventListener("keydown", onKey);
      if (returnFocusTo) returnFocusTo.focus();
    }
    function onKey(e) { if (e.key === "Escape") close(); }
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-wa-close]")) close();
      else if (e.target.closest("a")) close();
    });
    document.addEventListener("keydown", onKey);
    var first = overlay.querySelector("a, button");
    if (first) first.focus();
  }

  /* -------------------- Boot -------------------- */

  document.addEventListener("click", function (e) {
    var wa = e.target.closest("[data-wa-chooser]");
    if (wa) openWaChooser(wa);
  });

  function boot() {
    R = ICB.render;
    initHeader();
    initMenu();
    renderFooter();
    renderQuickBar();
    if (ICB.ask && ICB.ask.init) ICB.ask.init();
    ICB.router.init();
    ICB.reveal(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
