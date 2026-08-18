/* ==========================================================================
   Seafood Seasons status
   ==========================================================================

   Compares today's date with the STANDARD REGULATORY PERIOD only. The wording
   below is the complete permitted set: it describes regulation, never stock.
   Nothing here may say "in stock", "available now" or "order now".
   ========================================================================== */
(function () {
  "use strict";

  var OPEN = "Within the standard regulatory season";
  var CLOSED = "Standard closed period";
  var QUOTA = "Subject to national quota and current Fisheries notices";

  var t = function (s) {
    return window.NATFISH && window.NATFISH.t ? window.NATFISH.t(s) : s;
  };

  function toDay(monthDay) {
    var parts = monthDay.split("-");
    return parseInt(parts[0], 10) * 100 + parseInt(parts[1], 10);
  }

  function isOpen(card, today) {
    var from = toDay(card.getAttribute("data-open-from"));
    var to = toDay(card.getAttribute("data-open-to"));
    /* A period whose start falls later in the year than its end wraps across
       the new year, as the lobster and conch seasons do. */
    return from <= to
      ? today >= from && today <= to
      : today >= from || today <= to;
  }

  function render() {
    var now = new Date();
    var today = (now.getMonth() + 1) * 100 + now.getDate();

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-season]"),
      function (card) {
        var el = card.querySelector("[data-season-status]");
        if (!el) return;

        var open = isOpen(card, today);
        var text = t(open ? OPEN : CLOSED);

        /* Conch carries the quota caveat even inside the open period, because
           the season can close early once the national quota is reached. */
        if (card.hasAttribute("data-season-quota")) {
          text += " · " + t(QUOTA);
        }

        el.textContent = text;
        el.classList.remove("season-status--open", "season-status--closed");
        el.classList.add(open ? "season-status--open" : "season-status--closed");
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  /* Re-render so the status follows the chosen language. */
  document.addEventListener("natfish:languagechange", render);
})();
