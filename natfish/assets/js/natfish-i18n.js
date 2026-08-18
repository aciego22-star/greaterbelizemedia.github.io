/* ==========================================================================
   NATFISH bilingual system
   ==========================================================================

   English and Spanish in one page, swapped in place. There is no translation
   widget and no second copy of the site.

   How it works: translatable text is keyed by its own English string rather
   than by a hand-written id, so nothing can drift out of sync and a missing
   Spanish entry simply leaves the English standing. Originals are cached on
   first run, so switching back to English restores exactly what was authored.

   Detection order: ?lang= in the URL, then the stored choice, then the
   browser's preferred language, then English.

   TRANSLATION NOTE: the Spanish copy in natfish-strings.js is concept-stage.
   It should receive a final review from a Belizean Spanish speaker designated
   by NATFISH before the site goes live.
   ========================================================================== */
(function () {
  "use strict";

  var STORE_KEY = "natfish.language";
  var SUPPORTED = ["en", "es"];
  var NATIVE = { en: "English", es: "Espanol" };

  var STRINGS = window.NATFISH_STRINGS || {};
  var current = "en";

  /* Caches of the authored English, so switching back is lossless. */
  var textCache = new WeakMap();
  var attrCache = new WeakMap();

  var TRANSLATABLE_ATTRS = ["alt", "aria-label", "title", "placeholder"];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };

  function normalise(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  /* A missing entry returns the English, never an empty string. */
  function lookup(english) {
    if (current === "en" || !english) return english;
    var map = STRINGS[current];
    if (!map) return english;
    return Object.prototype.hasOwnProperty.call(map, english)
      ? map[english]
      : english;
  }

  /* Exposed so scripts that build strings at runtime (the season statuses)
     resolve through the same dictionary. */
  window.NATFISH = window.NATFISH || {};
  window.NATFISH.t = lookup;
  window.NATFISH.lang = function () { return current; };

  function translateText(root) {
    var walker = document.createTreeWalker(
      root, NodeFilter.SHOW_TEXT, {
        acceptNode: function (node) {
          if (SKIP_TAGS[node.parentNode.nodeName]) return NodeFilter.FILTER_REJECT;
          return normalise(node.data)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        }
      }
    );

    var node;
    while ((node = walker.nextNode())) {
      var original = textCache.get(node);
      if (original === undefined) {
        original = node.data;
        textCache.set(node, original);
      }
      /* Surrounding whitespace is preserved, or words would run together
         where markup wraps across lines. */
      var lead = original.slice(0, original.length - original.trimStart().length);
      var tail = original.slice(original.trimEnd().length);
      node.data = lead + lookup(normalise(original)) + tail;
    }
  }

  function translateAttributes(root) {
    var selector = TRANSLATABLE_ATTRS.map(function (a) {
      return "[" + a + "]";
    }).join(",");

    Array.prototype.forEach.call(root.querySelectorAll(selector), function (el) {
      var store = attrCache.get(el);
      if (!store) {
        store = {};
        TRANSLATABLE_ATTRS.forEach(function (attr) {
          if (el.hasAttribute(attr)) store[attr] = el.getAttribute(attr);
        });
        attrCache.set(el, store);
      }
      Object.keys(store).forEach(function (attr) {
        var value = normalise(store[attr]);
        if (value) el.setAttribute(attr, lookup(value));
      });
    });
  }

  function updateToggle() {
    var other = current === "en" ? "es" : "en";
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-lang-toggle]"),
      function (btn) {
        var label = btn.querySelector("[data-lang-label]");
        /* The control shows the language you are reading now. */
        if (label) label.textContent = NATIVE[current];
        var aria = btn.getAttribute("data-label-" + current);
        if (aria) btn.setAttribute("aria-label", aria);
        btn.setAttribute("data-current-lang", current);
        btn.setAttribute("lang", other === "es" ? "en" : "en");
      }
    );
  }

  function announce() {
    var region = document.getElementById("lang-status");
    if (!region) return;
    region.textContent =
      current === "es"
        ? "Idioma cambiado a espanol."
        : "Language changed to English.";
  }

  function apply(lang, options) {
    current = SUPPORTED.indexOf(lang) === -1 ? "en" : lang;
    document.documentElement.setAttribute("lang", current);

    translateText(document.body);
    translateAttributes(document.body);
    updateToggle();

    /* Anything drawn at runtime re-renders in the new language. */
    document.dispatchEvent(
      new CustomEvent("natfish:languagechange", { detail: { lang: current } })
    );

    if (options && options.announce) announce();
  }

  function store(lang) {
    try {
      window.localStorage.setItem(STORE_KEY, lang);
    } catch (err) {
      /* Private mode: the choice simply does not persist. */
    }
  }

  function preferred() {
    var param = new URLSearchParams(window.location.search).get("lang");
    if (param && SUPPORTED.indexOf(param.toLowerCase()) !== -1) {
      return param.toLowerCase();
    }
    try {
      var saved = window.localStorage.getItem(STORE_KEY);
      if (saved && SUPPORTED.indexOf(saved) !== -1) return saved;
    } catch (err) { /* ignore */ }

    var nav = (navigator.languages && navigator.languages[0]) ||
      navigator.language || "en";
    return nav.toLowerCase().indexOf("es") === 0 ? "es" : "en";
  }

  function init() {
    var start = preferred();
    if (start !== "en") apply(start);
    else updateToggle();

    Array.prototype.forEach.call(
      document.querySelectorAll("[data-lang-toggle]"),
      function (btn) {
        btn.addEventListener("click", function () {
          var next = current === "en" ? "es" : "en";
          store(next);
          apply(next, { announce: true });
        });
      }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
