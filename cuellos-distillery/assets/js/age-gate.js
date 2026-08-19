/* ============================================================
   CUELLO'S DISTILLERY - 18+ Age Gateway
   Reliable, accessible, mobile-first.
   - Confirmation stored in localStorage ("remember me") or
     sessionStorage (default); in-memory fallback if neither
     is available.
   - Scroll lock, focus trap, focus return, safe-area aware.
   - No date-of-birth dropdowns, no query-string redirects.
   - Public page content stays in the HTML (SEO unaffected).
   ============================================================ */

(function () {
  "use strict";

  var KEY = "cuellos_age_ok";
  var EXIT_URL = "https://www.google.com";
  var memoryOk = false;
  var lastFocused = null;
  var gateEl = null;

  function storageGet(storage) {
    try { return storage.getItem(KEY) === "1"; } catch (e) { return false; }
  }
  function storageSet(storage) {
    try { storage.setItem(KEY, "1"); return true; } catch (e) { return false; }
  }
  function storageClear() {
    try { window.localStorage.removeItem(KEY); } catch (e) {}
    try { window.sessionStorage.removeItem(KEY); } catch (e) {}
    memoryOk = false;
  }

  function isVerified() {
    return memoryOk || storageGet(window.localStorage) || storageGet(window.sessionStorage);
  }

  function t(key) {
    return (window.CuellosI18N && window.CuellosI18N.t(key)) || {
      "gate.brand": "Cuello's Distillery Ltd. · Orange Walk, Belize",
      "gate.title": "Welcome to Cuello's",
      "gate.copy": "You must be 18 years or older to enter this website.",
      "gate.confirm": "I Am 18 or Older",
      "gate.exit": "Exit",
      "gate.remember": "Remember me on this device",
      "gate.fine": "Cuello's supports responsible enjoyment. Please do not share this website with anyone under the legal drinking age."
    }[key] || key;
  }

  function build() {
    var el = document.createElement("div");
    el.className = "age-gate";
    el.id = "age-gate";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-labelledby", "age-gate-title");
    el.setAttribute("aria-describedby", "age-gate-copy");
    /* Brand artwork backdrop: landscape from 768px up, portrait below.
       The compact glass panel sits over the artwork's darker central
       band, leaving the company name (top) and the bottle lineup
       (bottom) visible. */
    el.innerHTML =
      '<picture class="age-gate__bg" aria-hidden="true">' +
        '<source media="(min-width: 768px)" srcset="assets/img/brand/age-gate-bg-desktop.webp">' +
        '<img src="assets/img/brand/age-gate-bg-mobile.webp" alt="">' +
      '</picture>' +
      '<div class="age-gate__panel">' +
        '<h2 id="age-gate-title" data-i18n="gate.title">' + t("gate.title") + '</h2>' +
        '<p id="age-gate-copy" class="age-gate__copy" data-i18n="gate.copy">' + t("gate.copy") + '</p>' +
        '<div class="age-gate__actions">' +
          '<button type="button" class="btn btn--primary" data-gate-confirm data-i18n="gate.confirm">' + t("gate.confirm") + '</button>' +
          '<button type="button" class="btn btn--ghost-light" data-gate-exit data-i18n="gate.exit">' + t("gate.exit") + '</button>' +
        '</div>' +
        '<label class="age-gate__remember">' +
          '<input type="checkbox" data-gate-remember checked>' +
          '<span data-i18n="gate.remember">' + t("gate.remember") + '</span>' +
        '</label>' +
        '<p class="age-gate__fine" data-i18n="gate.fine">' + t("gate.fine") + '</p>' +
      '</div>';
    return el;
  }

  function open() {
    if (gateEl) return;
    lastFocused = document.activeElement;
    gateEl = build();
    document.body.appendChild(gateEl);
    if (window.CuellosI18N) window.CuellosI18N.apply(gateEl);
    gateEl.classList.add("is-open");
    document.body.classList.add("no-scroll");

    var confirmBtn = gateEl.querySelector("[data-gate-confirm]");
    var exitBtn = gateEl.querySelector("[data-gate-exit]");
    var remember = gateEl.querySelector("[data-gate-remember]");

    confirmBtn.addEventListener("click", function () {
      var stored = remember.checked
        ? storageSet(window.localStorage) || storageSet(window.sessionStorage)
        : storageSet(window.sessionStorage);
      if (!stored) memoryOk = true; /* graceful fallback: allow for this page session */
      close();
    });

    exitBtn.addEventListener("click", function () {
      window.location.href = EXIT_URL;
    });

    gateEl.addEventListener("keydown", function (e) {
      /* Escape must NOT close the gate - a choice is required. Trap Tab. */
      if (e.key === "Escape") e.preventDefault();
      if (e.key === "Tab" && window.CuellosTrapFocus) window.CuellosTrapFocus(gateEl, e);
    });

    confirmBtn.focus();
  }

  function close() {
    if (!gateEl) return;
    gateEl.remove();
    gateEl = null;
    document.body.classList.remove("no-scroll");
    var target = lastFocused && document.contains(lastFocused) ? lastFocused : document.querySelector(".skip-link");
    if (target) target.focus();
  }

  function reset() {
    storageClear();
    open();
    window.scrollTo(0, 0);
  }

  window.CuellosAgeGate = { open: open, reset: reset, isVerified: isVerified };

  function boot() {
    if (!isVerified()) open();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
