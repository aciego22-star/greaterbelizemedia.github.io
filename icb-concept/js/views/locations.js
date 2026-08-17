/* ============================================================================
   Locations view — Find ICB Near You.
   District filters, location cards and the Belize map stay in sync.
   Only verified contact details render; gaps degrade honestly.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  ICB.views.locations = {
    title: { en: "Locations | ICB", es: "Ubicaciones | ICB" },
    render: function () {
      var R = ICB.render;
      /* The chip's value stays "All" whatever the language: it is what the
         filter compares against. Only the label is translated, and the
         district names are place names, so they read the same either way. */
      var chips = ["All"].concat(ICB.DATA.districts).map(function (d, i) {
        var label = d === "All" ? ICB.s("allDistricts") : d;
        return '<button type="button" class="chip" data-district-chip="' + R.esc(d) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + R.esc(label) + "</button>";
      }).join("");

      var cards = ICB.DATA.activeLocations().map(R.locationCard).join("");

      var seenTowns = {};
      var markers = ICB.DATA.activeLocations().map(function (l) {
        var town = l.town.split(",")[0];
        var label = seenTowns[town] ? null : town;
        seenTowns[town] = true;
        return { id: l.id, x: l.map.x, y: l.map.y, label: label, labelSide: (l.map.x > 150 ? "left" : "right") };
      });

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="loc-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="locations-hero" aria-hidden="true">' + ICB.art.panel("hero-nation") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Locations", es: "Ubicaciones" }) +
            '<span class="eyebrow">' + T("Nationwide", "En todo el país") + '</span>' +
            '<h1 id="loc-title">' + T("Find ICB near you.", "Encuentre ICB cerca de usted.") + '</h1>' +
            '<p class="hero-lead">' + R.esc(ICB.DATA.site.org.serviceQuote) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="loc-browse-title">' +
          '<div class="shell">' +
            '<h2 id="loc-browse-title" class="visually-hidden">' + ICB.s("browseLocations") + '</h2>' +
            '<div class="loc-tools rv">' +
              '<div class="chip-row" role="group" aria-label="' + ICB.s("filterByDistrict") + '">' + chips + "</div>" +
              '<div class="loc-tools-row">' +
                '<p class="loc-count" aria-live="polite" data-loc-count></p>' +
                '<div class="btn-row">' +
                  '<button type="button" class="btn btn-sm btn-outline" data-call-directory>' + ICB.art.glyph("phone") + "<span>" + ICB.s("callABranch") + "</span></button>" +
                  '<button type="button" class="btn btn-sm btn-outline" data-wa-directory>' + ICB.art.waIcon() + "<span>" + ICB.s("chatOnWhatsApp") + "</span></button>" +
                "</div>" +
              "</div>" +
            "</div>" +
            '<div class="loc-layout">' +
              '<div class="loc-list" data-loc-list>' + cards + "</div>" +
              '<aside class="loc-map-panel rv">' +
                "<h2>" + ICB.s("belizeAtAGlance") + "</h2>" +
                ICB.art.belizeMap({ markers: markers, ariaLabel: ICB.s("mapLabel") }) +
              "</aside>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + ICB.s("contactICB") + '">' +
          '<div class="shell">' +
            ICB.render.band({
              eyebrow: { en: "Prefer to talk?", es: "¿Prefiere hablar?" },
              title: { en: "Our corporate office can point you anywhere.", es: "Nuestra oficina corporativa le orienta a donde necesite." },
              body: T("16 Daly Street, Belize City. Call " + ICB.DATA.site.corporate.phoneDisplay + " or email " + ICB.DATA.site.corporate.email + ".",
                       "16 Daly Street, Ciudad de Belice. Llame al " + ICB.DATA.site.corporate.phoneDisplay + " o escriba a " + ICB.DATA.site.corporate.email + "."),
              motif: "heritage",
              actions: [
                { label: ICB.s("callN", { n: ICB.DATA.site.corporate.phoneDisplay }), href: "tel:" + ICB.DATA.site.corporate.phoneTel },
                { label: ICB.s("emailICB"), href: "mailto:" + ICB.DATA.site.corporate.email }
              ]
            }) +
          "</div>" +
        "</section>";
    },
    mounted: function (mount) {
      var chips = mount.querySelectorAll("[data-district-chip]");
      var cards = mount.querySelectorAll("[data-loc-card]");
      var count = mount.querySelector("[data-loc-count]");
      var markers = mount.querySelectorAll(".bm-marker");

      function apply(district) {
        var shown = 0;
        Array.prototype.forEach.call(cards, function (card) {
          var show = district === "All" || card.getAttribute("data-district") === district;
          card.hidden = !show;
          if (show) shown += 1;
        });
        Array.prototype.forEach.call(markers, function (m) {
          var loc = ICB.DATA.locationById(m.getAttribute("data-map-id"));
          var active = district !== "All" && loc && loc.district === district;
          var dim = district !== "All" && !active;
          m.classList.toggle("is-active", active);
          m.classList.toggle("is-dim", dim);
        });
        var n = ICB.s(shown === 1 ? "locationCountOne" : "locationCount", { n: shown });
        count.textContent = n + " " + (district === "All"
          ? ICB.s("acrossBelize")
          : ICB.s("inDistrict", { district: district }));
      }

      Array.prototype.forEach.call(chips, function (chip) {
        chip.addEventListener("click", function () {
          Array.prototype.forEach.call(chips, function (c) {
            c.setAttribute("aria-pressed", String(c === chip));
          });
          apply(chip.getAttribute("data-district-chip"));
        });
      });

      // Map markers focus their card.
      Array.prototype.forEach.call(markers, function (m) {
        m.addEventListener("click", function () {
          var id = m.getAttribute("data-map-id");
          var card = mount.querySelector('[data-loc-card="' + id + '"]');
          if (card && !card.hidden) {
            card.scrollIntoView({ behavior: "smooth", block: "center" });
            card.classList.add("is-highlight");
            setTimeout(function () { card.classList.remove("is-highlight"); }, 2200);
          }
        });
      });

      apply("All");
    }
  };
})();
