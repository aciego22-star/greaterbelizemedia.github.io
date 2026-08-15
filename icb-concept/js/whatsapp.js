/* ============================================================================
   WhatsApp ICB — the nationwide WhatsApp directory.
   A district-grouped modal built from ICB.DATA.locations (single source of
   truth). Every row links to the verified wa.me number for that location;
   locations without a verified WhatsApp line simply do not appear.
   Open with any element carrying [data-wa-directory].
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var overlay = null, opener = null;

  function rowsFor(location) {
    var R = ICB.render;
    return location.whatsapps.map(function (w) {
      var name = location.name + (w.label ? " (" + w.label + ")" : "");
      return '<a class="wa-row" href="' + R.esc(R.waHref(w.wa)) + '"' + R.extAttrs() + ">" +
        ICB.art.waIcon("roundel") +
        '<span class="wa-row-main">' +
          '<span class="wa-row-name">' + R.esc(name) + "</span>" +
        "</span>" +
        '<span class="wa-row-cta">Chat on WhatsApp</span>' +
        R.extNote("wa.me") +
      "</a>";
    }).join("");
  }

  function directoryHtml() {
    var R = ICB.render;
    var groups = ICB.DATA.districts.map(function (d) {
      var locs = ICB.DATA.whatsappLines().filter(function (l) { return l.district === d; });
      if (!locs.length) return "";
      return '<section class="wa-group" aria-label="' + R.esc(d) + ' District">' +
        '<h3>' + R.esc(d) + "</h3>" +
        locs.map(rowsFor).join("") +
      "</section>";
    }).join("");

    return '' +
      '<div class="wa-dialog" role="dialog" aria-modal="true" aria-labelledby="wa-dir-title">' +
        '<header class="wa-head">' +
          ICB.art.waIcon("roundel", "wa-roundel wa-head-icon") +
          '<div class="wa-head-text">' +
            '<strong id="wa-dir-title">WhatsApp ICB</strong>' +
            /* Not every ICB location publishes a WhatsApp line, and the
               wording must not suggest otherwise. */
            "<span>Choose a WhatsApp-enabled ICB location.</span>" +
          "</div>" +
          '<button type="button" class="wa-close" data-wa-close aria-label="Close WhatsApp directory">' +
            ICB.art.glyph("close") +
          "</button>" +
        "</header>" +
        '<div class="wa-body">' + groups + "</div>" +
      "</div>";
  }

  function close() {
    if (!overlay) return;
    overlay.remove();
    overlay = null;
    document.body.style.overflow = "";
    document.removeEventListener("keydown", onKey);
    if (opener && opener.focus) opener.focus();
    opener = null;
  }

  function onKey(e) {
    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab" || !overlay) return;
    var focusables = overlay.querySelectorAll("a[href], button");
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function open(fromEl) {
    if (overlay) return;
    opener = fromEl || null;
    overlay = document.createElement("div");
    overlay.className = "wa-overlay";
    overlay.innerHTML = directoryHtml();
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-wa-close]")) close();
      else if (e.target.closest("a.wa-row")) close();
    });
    document.addEventListener("keydown", onKey);
    var closeBtn = overlay.querySelector("[data-wa-close]");
    if (closeBtn) closeBtn.focus();
  }

  document.addEventListener("icb:navigated", function () { close(); });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-wa-directory]");
    if (trigger) { e.preventDefault(); open(trigger); }
  });

  ICB.waDirectory = { open: open, close: close };
})();
