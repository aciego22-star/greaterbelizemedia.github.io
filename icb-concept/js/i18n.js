/* ============================================================================
   ICB.i18n — English and Spanish, switched in place.

   ICB serves a large Spanish-speaking community, so the site is bilingual
   rather than English with a translation bolted on.

   TWO WAYS COPY IS TRANSLATED, and the split is deliberate:

     t(value)   For content that lives in the data files. A value is
                either a plain string, which is returned as is, or an
                { en, es } pair, which resolves to the active language.
                Content stays beside the structure it belongs to, and a
                file can be converted a field at a time without breaking.

     s(key, …)  For the words the views themselves put on screen:
                headings, buttons, labels. These live in one dictionary,
                js/data/strings.js, because they are shared and because a
                translator wants them in one place. Templates take named
                values, so "Call {n}" stays one string in both languages
                instead of being concatenated from fragments.

   WHAT IS NOT TRANSLATED, and this matters. ICB's published product and
   form names stay in English in both languages: Third-Party Act,
   Householder's All-Risk Protection, Insured Motor Accident Form, Home
   Owners. They are the names of things ICB actually sells and documents
   a customer actually downloads. Inventing Spanish equivalents would put
   words in ICB's mouth and would send someone into a branch asking for a
   product by a name nobody there uses. The explanation around the name is
   translated; the name is not.

   CHOOSING THE LANGUAGE, in order:
     1. ?lang= in the URL, so a shared link opens in the language it was
        shared in.
     2. What the visitor chose last time.
     3. What their browser asks for.
     4. Spanish.

   INTERNAL TODO (not client-facing): the Spanish here is written for this
   concept and has NOT been reviewed by ICB. Insurance copy is exact by
   nature, and the qualifiers matter most: a limit is a ceiling and not a
   payment, "all risk" is not everything, travel sales are suspended,
   payment is verified before documents are issued. Run
   scratchpad/check/strings-export.js to produce every Spanish string for
   a Belizean Spanish speaker at ICB to check in one pass.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var SUPPORTED = ["es", "en"];
  var FALLBACK = "es";
  var STORE = "icb-lang";

  var current = FALLBACK;

  function normalise(tag) {
    if (!tag) return null;
    var base = String(tag).toLowerCase().split("-")[0];
    return SUPPORTED.indexOf(base) >= 0 ? base : null;
  }

  function fromQuery() {
    /* The router owns the hash, so a language in the query string can sit
       either before the hash (?lang=es#/claims) or inside it
       (#/claims?lang=es). Read both rather than caring which. */
    var m = /[?&]lang=([A-Za-z-]+)/.exec(location.search) ||
            /[?&]lang=([A-Za-z-]+)/.exec(location.hash);
    return m ? normalise(m[1]) : null;
  }

  function fromStore() {
    try { return normalise(window.localStorage.getItem(STORE)); }
    catch (e) { return null; }   // private mode, or storage disabled
  }

  function fromBrowser() {
    var list = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || navigator.userLanguage];
    for (var i = 0; i < list.length; i++) {
      var hit = normalise(list[i]);
      if (hit) return hit;
    }
    return null;
  }

  function resolve() {
    return fromQuery() || fromStore() || fromBrowser() || FALLBACK;
  }

  function remember(lang) {
    try { window.localStorage.setItem(STORE, lang); } catch (e) { /* fine */ }
  }

  /* Resolve a data value. Plain strings pass straight through, so a field
     that has not been translated yet still renders rather than vanishing.
     A pair missing the active language falls back to the other one for
     the same reason: a visitor should never meet a blank. */
  function t(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value[current] != null) return value[current];
      for (var i = 0; i < SUPPORTED.length; i++) {
        if (value[SUPPORTED[i]] != null) return value[SUPPORTED[i]];
      }
    }
    return "";
  }

  /* Resolve a UI string by key, filling {named} slots. An unknown key
     returns the key itself, which is ugly on purpose: a missing string
     should be obvious in testing rather than silently empty. */
  function s(key, vars) {
    var table = (ICB.STRINGS && ICB.STRINGS[current]) || {};
    var fallbackTable = (ICB.STRINGS && ICB.STRINGS[FALLBACK]) || {};
    var out = table[key];
    if (out == null) out = fallbackTable[key];
    if (out == null) {
      var other = ICB.STRINGS && ICB.STRINGS[current === "es" ? "en" : "es"];
      out = (other && other[key]) != null ? other[key] : key;
    }
    if (vars) {
      out = String(out).replace(/\{(\w+)\}/g, function (whole, name) {
        return vars[name] != null ? vars[name] : whole;
      });
    }
    return out;
  }

  /* Map an array of data values in one go. */
  function list(values) {
    return (values || []).map(t);
  }

  function apply(lang) {
    current = lang;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-lang", lang);
  }

  function set(lang, opts) {
    var next = normalise(lang) || FALLBACK;
    if (next === current) return;
    apply(next);
    remember(next);
    document.dispatchEvent(new CustomEvent("icb:lang", { detail: { lang: next } }));
    if (!opts || opts.rerender !== false) {
      if (ICB.renderChrome) ICB.renderChrome();
      if (ICB.router && ICB.router.refresh) ICB.router.refresh();
    }
  }

  ICB.i18n = {
    supported: SUPPORTED,
    fallback: FALLBACK,
    get: function () { return current; },
    is: function (lang) { return current === lang; },
    set: set,
    t: t,
    s: s,
    list: list,
    /* Called once at boot, before the first render. */
    init: function () { apply(resolve()); return current; },
    /* The other language, for a two-way switch. */
    other: function () { return current === "es" ? "en" : "es"; },
    label: function (lang) { return lang === "es" ? "Español" : "English"; },
    /* Add ?lang= to an internal link so a shared URL keeps its language. */
    tag: function (href) {
      if (!href || href.charAt(0) !== "#") return href;
      return href + (href.indexOf("?") >= 0 ? "&" : "?") + "lang=" + current;
    }
  };

  /* Short aliases. Views call these constantly, and t("...") reads better
     in a template than ICB.i18n.t("..."). */
  ICB.t = t;
  ICB.s = s;
})();
