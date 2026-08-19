/* ============================================================
   CUELLO'S DISTILLERY — Cocktails & Recipes
   Concept serve cards with spirit filter.
   Official recipes (with measures) slot into data.js once
   confirmed by Cuello's — layout is ready.
   ============================================================ */

(function () {
  "use strict";

  var D = window.CuellosData;
  var I = window.CuellosI18N;
  var currentSpirit = "all";

  function $(sel, root) { return (root || document).querySelector(sel); }

  function renderChips() {
    var host = $("#cocktail-filters");
    if (!host) return;
    var spirits = [];
    D.cocktails.forEach(function (c) {
      if (spirits.indexOf(c.spirit) === -1) spirits.push(c.spirit);
    });
    var html = '<button type="button" class="chip" data-spirit-filter="all" aria-pressed="' +
      (currentSpirit === "all" ? "true" : "false") + '">' + I.t("cocktails.filterAll") + '</button>';
    html += spirits.map(function (id) {
      var p = D.byId(id);
      return '<button type="button" class="chip" data-spirit-filter="' + id + '" aria-pressed="' +
        (currentSpirit === id ? "true" : "false") + '">' + (p ? p.name : id) + '</button>';
    }).join("");
    host.innerHTML = html;
  }

  function renderGrid() {
    var host = $("#recipe-grid");
    if (!host) return;
    var lang = I.lang;
    var items = D.cocktails.filter(function (c) {
      return currentSpirit === "all" || c.spirit === currentSpirit;
    });
    host.innerHTML = items.map(function (c) {
      var p = D.byId(c.spirit);
      return '<article class="recipe-card" id="' + c.id + '" style="--accent:' + c.accent + '">' +
        '<div class="recipe-card__body">' +
          '<p class="recipe-card__tag">' + I.t("cocktails.spirit") + ": " + (p ? p.name : "") +
            ' <span class="concept-badge">' + I.t("cocktails.conceptBadge") + '</span></p>' +
          '<h3>' + c.name[lang] + '</h3>' +
          '<p class="recipe-card__desc">' + c.desc[lang] + '</p>' +
          '<div class="recipe-card__meta">' +
            '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M5 3h14l-6 8v7l3 2H8l3-2v-7L5 3z" stroke-linejoin="round"/></svg>' + I.t("cocktails.glass") + ": " + c.glass[lang] + '</span>' +
            '<span><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke-linecap="round"/></svg>' + I.t("cocktails.garnish") + ": " + c.garnish[lang] + '</span>' +
          '</div>' +
          '<a class="text-link" href="our-spirits.html#' + c.spirit + '">' + I.t("cocktails.useSpirit") + ' →</a>' +
        '</div>' +
      '</article>';
    }).join("");
  }

  document.addEventListener("click", function (e) {
    var chip = e.target.closest ? e.target.closest("[data-spirit-filter]") : null;
    if (chip) {
      currentSpirit = chip.getAttribute("data-spirit-filter");
      renderChips();
      renderGrid();
    }
  });

  document.addEventListener("cuellos:langchange", function () {
    renderChips();
    renderGrid();
  });

  function boot() {
    if (!$("#recipe-grid")) return;
    renderChips();
    renderGrid();
    /* deep-link: cocktails.html#id scrolls to the card */
    var hash = window.location.hash.replace("#", "");
    if (hash) {
      var el = document.getElementById(hash);
      if (el) setTimeout(function () { el.scrollIntoView({ block: "center" }); }, 200);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
