/* ============================================================
   CUELLOS DISTILLERY — Our Spirits page
   Category grids + accessible product drawer.
   Deep links: our-spirits.html#product-id opens the drawer.
   Drawer shows only confirmed information: name, category,
   photograph, Rums of Belize identity, origin, and direct
   contact actions. Sizes/strengths await client confirmation.
   ============================================================ */

(function () {
  "use strict";

  var D = window.CuellosData;
  var I = window.CuellosI18N;

  var backdrop = null;
  var drawer = null;
  var lastFocused = null;
  var currentId = null;

  function $(sel, root) { return (root || document).querySelector(sel); }

  /* ---------- Render category grids ---------- */

  function render() {
    var host = $("#spirits-catalogue");
    if (!host) return;
    var lang = I.lang;
    var html = D.categories.map(function (cat) {
      var items = D.products.filter(function (p) { return p.category === cat.id; });
      return '' +
        '<section class="category-block" aria-labelledby="cat-' + cat.id + '">' +
          '<div class="category-block__head">' +
            '<h2 id="cat-' + cat.id + '" data-i18n="' + cat.labelKey + '">' + I.t(cat.labelKey) + '</h2>' +
            '<p data-i18n="' + cat.copyKey + '">' + I.t(cat.copyKey) + '</p>' +
          '</div>' +
          '<div class="product-grid">' +
            items.map(function (p) {
              var imgBase = "assets/img/products/" + p.id;
              return '<button type="button" class="product-card" data-spirit="' + p.id + '" style="--accent:' + p.accent + '" ' +
                'aria-haspopup="dialog" aria-label="' + I.t("spirits.openDetails") + ' ' + p.name + '">' +
                '<span class="product-card__media">' +
                  '<img src="' + imgBase + '-450.webp" srcset="' + imgBase + '-450.webp 450w, ' + imgBase + '.webp 900w" ' +
                    'sizes="(max-width: 560px) 45vw, 280px" width="450" height="675" loading="lazy" alt="' + p.alt[lang] + '">' +
                  '<span class="product-card__accent" aria-hidden="true"></span>' +
                '</span>' +
                '<span class="product-card__body">' +
                  '<span class="product-card__cat">' + D.categoryLabel[p.category][lang] + '</span>' +
                  '<span class="product-card__name">' + p.name + '</span>' +
                  '<span class="product-card__hint">' + I.t("home.viewSpirit") + ' →</span>' +
                '</span>' +
              '</button>';
            }).join("") +
          '</div>' +
        '</section>';
    }).join("");
    host.innerHTML = html;
  }

  /* ---------- Drawer ---------- */

  function openDrawer(id, pushHash) {
    var p = D.byId(id);
    if (!p) return;
    closeDrawer(false);
    currentId = id;
    lastFocused = document.activeElement;

    var lang = I.lang;
    var cfg = window.CuellosConfig || {};
    var waHref = cfg.whatsappNumber
      ? "https://wa.me/" + cfg.whatsappNumber + "?text=" + encodeURIComponent(I.t("contact.waMessage") + " " + p.name)
      : null;
    var related = D.products.filter(function (x) {
      return x.category === p.category && x.id !== p.id;
    }).slice(0, 3);

    backdrop = document.createElement("div");
    backdrop.className = "drawer-backdrop is-open";

    drawer = document.createElement("aside");
    drawer.className = "drawer";
    drawer.setAttribute("role", "dialog");
    drawer.setAttribute("aria-modal", "true");
    drawer.setAttribute("aria-label", p.name);
    drawer.style.setProperty("--accent", p.accent);

    var imgBase = "assets/img/products/" + p.id;
    drawer.innerHTML =
      '<button type="button" class="drawer__close" data-drawer-close aria-label="' + I.t("common.close") + '">' +
        '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
      '</button>' +
      '<div class="drawer__scroll">' +
        '<div class="drawer__media">' +
          '<img src="' + imgBase + '.webp" width="900" height="1350" alt="' + p.alt[lang] + '">' +
        '</div>' +
        '<div class="drawer__body">' +
          '<p class="drawer__cat">' + D.categoryLabel[p.category][lang] + '</p>' +
          '<h2 class="drawer__name">' + p.name + '</h2>' +
          '<p class="drawer__desc">' + p.desc[lang] + '</p>' +
          '<ul class="spec-list">' +
            '<li><span class="k">' + I.t("spirits.specCategory") + '</span><span class="v">' + D.categoryLabel[p.category][lang] + '</span></li>' +
            '<li><span class="k">' + I.t("spirits.specMark") + '</span><span class="v">' + I.t("spirits.markValue") + '</span></li>' +
            '<li><span class="k">' + I.t("spirits.specOrigin") + '</span><span class="v">' + I.t("spirits.originValue") + '</span></li>' +
          '</ul>' +
          '<h4 style="margin-bottom:.3rem">' + I.t("spirits.whereFind") + '</h4>' +
          '<p style="color:var(--ink-muted);font-size:.94rem">' + I.t("spirits.whereFindCopy") + '</p>' +
          '<div class="drawer__actions">' +
            (waHref ? '<a class="btn btn--whatsapp btn--small" href="' + waHref + '" target="_blank" rel="noopener noreferrer">' + I.t("contact.waBtn") + '</a>' : '') +
            '<a class="btn btn--dark btn--small" href="locations.html">' + I.t("nav.locations") + '</a>' +
            '<a class="btn btn--ghost btn--small" href="trade.html">' + I.t("spirits.tradeCta") + '</a>' +
          '</div>' +
          (related.length ?
            '<div class="drawer__related"><h4>' + I.t("spirits.related") + '</h4><div class="related-row">' +
              related.map(function (r) {
                return '<button type="button" data-spirit="' + r.id + '" aria-label="' + I.t("spirits.openDetails") + ' ' + r.name + '">' +
                  '<span class="product-card__media"><img src="assets/img/products/' + r.id + '-450.webp" width="88" height="132" loading="lazy" alt="' + r.alt[lang] + '"></span>' +
                '</button>';
              }).join("") +
            '</div></div>' : '') +
          '<p class="fine-note">' + I.t("spirits.drawerNote") + '</p>' +
          '<p class="fine-note" style="border-color:var(--cane)">' + I.t("common.responsible") + '</p>' +
        '</div>' +
      '</div>';

    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);
    document.body.classList.add("no-scroll");

    requestAnimationFrame(function () { drawer.classList.add("is-open"); });

    backdrop.addEventListener("click", function () { closeDrawer(true); });
    drawer.addEventListener("click", function (e) {
      if (e.target.closest("[data-drawer-close]")) closeDrawer(true);
      var sp = e.target.closest("[data-spirit]");
      if (sp) openDrawer(sp.getAttribute("data-spirit"), true);
    });
    drawer.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeDrawer(true);
      if (e.key === "Tab" && window.CuellosTrapFocus) window.CuellosTrapFocus(drawer, e);
    });

    if (pushHash !== false) {
      try { history.replaceState(null, "", "#" + id); } catch (e) {}
    }
    $(".drawer__close", drawer).focus();
  }

  function closeDrawer(clearHash) {
    if (drawer) { drawer.remove(); drawer = null; }
    if (backdrop) { backdrop.remove(); backdrop = null; }
    document.body.classList.remove("no-scroll");
    currentId = null;
    if (clearHash) {
      try { history.replaceState(null, "", window.location.pathname); } catch (e) {}
    }
    if (lastFocused && document.contains(lastFocused)) lastFocused.focus();
  }

  /* ---------- Events ---------- */

  document.addEventListener("click", function (e) {
    if (drawer && e.target.closest && e.target.closest(".drawer")) return;
    var card = e.target.closest ? e.target.closest("[data-spirit]") : null;
    if (card && !drawer) openDrawer(card.getAttribute("data-spirit"));
  });

  document.addEventListener("cuellos:langchange", function () {
    render();
    if (currentId) openDrawer(currentId, false);
  });

  function openFromHash() {
    var hash = window.location.hash.replace("#", "");
    if (hash && D.byId(hash)) {
      setTimeout(function () { openDrawer(hash, false); }, 150);
    }
  }

  function boot() {
    render();
    openFromHash();
    window.addEventListener("hashchange", openFromHash);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
