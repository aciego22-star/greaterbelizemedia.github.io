/* ============================================================================
   Call ICB — the nationwide telephone directory.
   Built from ICB.DATA.locations (single source of truth). Every location
   with a published landline is listed with its number as a tel: link;
   locations that publish only a WhatsApp line are offered the WhatsApp
   directory instead. Open with any element carrying [data-call-directory].
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var overlay = null, opener = null;

  function rowsFor(location) {
    var R = ICB.render;
    return location.phones.map(function (ph, i) {
      var name = location.name + (location.phones.length > 1 ? " (Line " + (i + 1) + ")" : "");
      return '<a class="call-row" href="tel:' + R.esc(ph.tel) + '">' +
        '<span class="call-row-main">' +
          '<span class="call-row-name">' + R.esc(name) + "</span>" +
          '<span class="call-row-num">' + R.esc(ph.display) + "</span>" +
        "</span>" +
        '<span class="call-row-icon">' + ICB.art.glyph("phone") + "</span>" +
      "</a>";
    }).join("");
  }

  function directoryHtml() {
    var R = ICB.render;
    var withPhones = ICB.DATA.locations.filter(function (l) { return l.phones && l.phones.length; });
    /* Every location ICB does not publish a direct line for. They are still
       reachable: some on WhatsApp, all through the Corporate Office. */
    var noLine = ICB.DATA.locations.filter(function (l) { return !l.phones || !l.phones.length; });
    var anyWa = noLine.some(function (l) { return l.whatsapps && l.whatsapps.length; });

    var groups = ICB.DATA.districts.map(function (d) {
      var locs = withPhones.filter(function (l) { return l.district === d; });
      if (!locs.length) return "";
      return '<section class="call-group" aria-label="' + R.esc(d) + ' District">' +
        "<h3>" + R.esc(d) + "</h3>" +
        locs.map(rowsFor).join("") +
      "</section>";
    }).join("");

    var co = ICB.DATA.site.corporate;
    var waNote = noLine.length
      ? '<div class="call-note">' +
          "<h3>Other locations</h3>" +
          "<p>" + R.esc(noLine.map(function (l) { return l.name; }).join(", ")) +
          ". The Corporate Office can connect you with any of these.</p>" +
          '<div class="call-note-actions">' +
            '<a class="btn btn-sm btn-primary" href="tel:' + R.esc(co.phoneTel) + '">' +
              ICB.art.glyph("phone") + "<span>Call " + R.esc(co.phoneDisplay) + "</span></a>" +
            (anyWa
              ? '<button type="button" class="btn btn-sm btn-outline" data-wa-directory>' +
                  ICB.art.waIcon() + "<span>WhatsApp directory</span></button>"
              : "") +
          "</div>" +
        "</div>"
      : "";

    return '' +
      '<div class="call-dialog" role="dialog" aria-modal="true" aria-labelledby="call-dir-title">' +
        '<header class="call-head">' +
          '<span class="call-head-icon">' + ICB.art.glyph("phone") + "</span>" +
          '<div class="call-head-text">' +
            '<strong id="call-dir-title">Call ICB</strong>' +
            "<span>Choose a location to call.</span>" +
          "</div>" +
          '<button type="button" class="wa-close" data-call-close aria-label="Close the call directory">' +
            ICB.art.glyph("close") +
          "</button>" +
        "</header>" +
        '<div class="call-body">' + groups + waNote + "</div>" +
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
    overlay.className = "wa-overlay call-overlay";
    overlay.innerHTML = directoryHtml();
    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.closest("[data-call-close]")) close();
      else if (e.target.closest("a.call-row")) close();
      else if (e.target.closest("[data-wa-directory]")) close();
    });
    document.addEventListener("keydown", onKey);
    var closeBtn = overlay.querySelector("[data-call-close]");
    if (closeBtn) closeBtn.focus();
  }

  document.addEventListener("icb:navigated", function () { close(); });

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest("[data-call-directory]");
    if (trigger) { e.preventDefault(); open(trigger); }
  });

  ICB.callDirectory = { open: open, close: close };
})();
