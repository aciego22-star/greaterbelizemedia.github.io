/* ============================================================================
   Call ICB — the nationwide telephone directory.
   Built from ICB.DATA.locations (single source of truth).

   A branch's WhatsApp line is usually an ordinary mobile number, so it is
   listed here as a tel: link alongside any landline. Where a location has
   both, the landline and the mobile are labelled so it is obvious which
   is which.

   USUALLY, not always. A line ICB publishes as WhatsApp only carries
   callable: false and is skipped here entirely. Offering a voice call on
   a number that does not take one sends someone to a dead end, so the
   location falls back to the Corporate Office like any other location
   without a callable number, clearly labelled as the Corporate Office.

   Open with any element carrying [data-call-directory].
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var overlay = null, opener = null;

  /* Every callable number a location publishes: landlines first, then the
     WhatsApp lines, which are ordinary mobile numbers and dial normally.
     Digits only for the tel: href, exactly as the wa.me links are built. */
  function numbersFor(location) {
    var out = [];
    var phones = location.phones || [];
    var mobiles = ICB.DATA.callableWhatsapps(location);
    var both = phones.length && mobiles.length;

    phones.forEach(function (ph, i) {
      out.push({
        label: both || phones.length > 1
          ? "Landline" + (phones.length > 1 ? " " + (i + 1) : "")
          : null,
        display: ph.display,
        tel: ph.tel
      });
    });
    mobiles.forEach(function (w, i) {
      out.push({
        label: mobiles.length > 1
          ? "Mobile " + (i + 1)
          : (both ? "Mobile" : null),
        display: w.display,
        tel: "+" + String(w.wa).replace(/\D/g, "")
      });
    });
    return out;
  }

  function rowsFor(location) {
    var R = ICB.render;
    return numbersFor(location).map(function (n) {
      return '<a class="call-row" href="tel:' + R.esc(n.tel) + '">' +
        '<span class="call-row-main">' +
          '<span class="call-row-name">' + R.esc(location.name) +
            (n.label ? ' <span class="call-row-tag">' + R.esc(n.label) + "</span>" : "") +
          "</span>" +
          '<span class="call-row-num">' + R.esc(n.display) + "</span>" +
        "</span>" +
        '<span class="call-row-icon">' + ICB.art.glyph("phone") + "</span>" +
      "</a>";
    }).join("");
  }

  function hasNumber(l) {
    return numbersFor(l).length > 0;
  }

  function directoryHtml() {
    var R = ICB.render;
    var callable = ICB.DATA.activeLocations().filter(hasNumber);
    /* The few locations ICB publishes no number for at all. */
    var noLine = ICB.DATA.activeLocations().filter(function (l) { return !hasNumber(l); });

    var groups = ICB.DATA.districts.map(function (d) {
      var locs = callable.filter(function (l) { return l.district === d; });
      if (!locs.length) return "";
      return '<section class="call-group" aria-label="' + R.esc(d) + ' District">' +
        "<h3>" + R.esc(d) + "</h3>" +
        locs.map(rowsFor).join("") +
      "</section>";
    }).join("");

    var co = ICB.DATA.site.corporate;
    /* These few are listed in the same row style, dialling the Corporate
       Office, so the directory reads as one list rather than a list plus
       a paragraph of names. */
    var waNote = noLine.length
      ? '<section class="call-group call-group--via" aria-label="Locations reached through the Corporate Office">' +
          "<h3>Through the Corporate Office</h3>" +
          noLine.map(function (l) {
            return '<a class="call-row" href="tel:' + R.esc(co.phoneTel) + '">' +
              '<span class="call-row-main">' +
                '<span class="call-row-name">' + R.esc(l.name) +
                  ' <span class="call-row-tag">Corporate Office</span></span>' +
                '<span class="call-row-num">' + R.esc(co.phoneDisplay) + "</span>" +
              "</span>" +
              '<span class="call-row-icon">' + ICB.art.glyph("phone") + "</span>" +
            "</a>";
          }).join("") +
        "</section>"
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
