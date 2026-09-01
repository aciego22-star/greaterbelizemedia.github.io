/*
  Orange Walk Multicare Hospital, proposal preview
  Language engine. English is the default on every fresh visit.
  Spanish text lives beside the English text in data-es attributes,
  so the two languages can never drift apart.
*/
(function () {
  "use strict";

  var STORAGE_KEY = "owm-lang";

  function safeGet() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function safeSet(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  var ATTR_MAP = [
    { attr: "data-es-placeholder", target: "placeholder", store: "enPlaceholder" },
    { attr: "data-es-aria", target: "aria-label", store: "enAria" },
    { attr: "data-es-alt", target: "alt", store: "enAlt" },
    { attr: "data-es-content", target: "content", store: "enContent" },
    { attr: "data-es-value", target: "value", store: "enValue" }
  ];

  var activeLang = null;

  function applyLanguage(lang) {
    var toSpanish = lang === "es";
    activeLang = toSpanish ? "es" : "en";

    document.querySelectorAll("[data-es]").forEach(function (el) {
      if (el.dataset.enText === undefined) {
        el.dataset.enText = el.textContent;
      }
      el.textContent = toSpanish ? el.getAttribute("data-es") : el.dataset.enText;
    });

    ATTR_MAP.forEach(function (map) {
      document.querySelectorAll("[" + map.attr + "]").forEach(function (el) {
        if (el.dataset[map.store] === undefined) {
          el.dataset[map.store] = el.getAttribute(map.target) || "";
        }
        el.setAttribute(map.target, toSpanish ? el.getAttribute(map.attr) : el.dataset[map.store]);
      });
    });

    document.documentElement.setAttribute("lang", toSpanish ? "es" : "en");

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.setAttribute("aria-pressed", btn.getAttribute("data-lang") === lang ? "true" : "false");
    });

    document.dispatchEvent(new CustomEvent("owm:langchange", { detail: { lang: lang } }));
  }

  function currentLanguage() {
    if (activeLang) { return activeLang; }
    /* A ?lang=es URL parameter previews Spanish without storing a preference. */
    try {
      var param = new URLSearchParams(window.location.search).get("lang");
      if (param === "es" || param === "en") { return param; }
    } catch (e) { /* older browsers */ }
    var saved = safeGet();
    return saved === "es" ? "es" : "en";
  }

  window.OWMI18N = {
    current: currentLanguage,
    set: function (lang) {
      var value = lang === "es" ? "es" : "en";
      safeSet(value);
      applyLanguage(value);
    },
    /* Small helper for scripts that need a string in the active language. */
    pick: function (en, es) {
      return currentLanguage() === "es" ? es : en;
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var lang = currentLanguage();
    if (lang === "es") { applyLanguage("es"); }

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.OWMI18N.set(btn.getAttribute("data-lang"));
      });
    });
  });
})();
