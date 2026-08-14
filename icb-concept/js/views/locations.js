/* ============================================================================
   Locations view — Find ICB Near You.
   District filters, location cards and the Belize map stay in sync.
   Only verified contact details render; gaps degrade honestly.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.locations = {
    title: "Locations | ICB",
    render: function () {
      var R = ICB.render;
      var chips = ["All"].concat(ICB.DATA.districts).map(function (d, i) {
        return '<button type="button" class="chip" data-district-chip="' + R.esc(d) + '" aria-pressed="' + (i === 0 ? "true" : "false") + '">' + R.esc(d) + "</button>";
      }).join("");

      var cards = ICB.DATA.locations.map(R.locationCard).join("");

      var seenTowns = {};
      var markers = ICB.DATA.locations.map(function (l) {
        var town = l.town.split(",")[0];
        var label = seenTowns[town] ? null : town;
        seenTowns[town] = true;
        return { id: l.id, x: l.map.x, y: l.map.y, label: label, labelSide: (l.map.x > 200 ? "left" : "right") };
      });

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="loc-title">' +
          '<div class="page-hero-art art-panel" aria-hidden="true">' + ICB.art.panel("belize") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">Nationwide</span>' +
            '<h1 id="loc-title">Find ICB near you.</h1>' +
            '<p class="hero-lead">' + R.esc(ICB.DATA.site.org.serviceQuote) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="loc-browse-title">' +
          '<div class="shell">' +
            '<h2 id="loc-browse-title" class="visually-hidden">Browse locations</h2>' +
            '<div class="loc-tools rv">' +
              '<div class="chip-row" role="group" aria-label="Filter by district">' + chips + "</div>" +
              '<p class="loc-count" aria-live="polite" data-loc-count></p>' +
            "</div>" +
            '<div class="loc-layout">' +
              '<div class="loc-list" data-loc-list>' + cards + "</div>" +
              '<aside class="loc-map-panel rv">' +
                "<h2>Belize at a glance</h2>" +
                ICB.art.belizeMap({ markers: markers, ariaLabel: "Map of Belize with ICB branch and agency locations" }) +
              "</aside>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Contact ICB">' +
          '<div class="shell">' +
            ICB.render.band({
              eyebrow: "Prefer to talk?",
              title: "Our corporate office can point you anywhere.",
              body: "16 Daly Street, Belize City. Call " + ICB.DATA.site.corporate.phoneDisplay + " or email " + ICB.DATA.site.corporate.email + ".",
              motif: "heritage",
              actions: [
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel },
                { label: "Email ICB", href: "mailto:" + ICB.DATA.site.corporate.email }
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
        count.textContent = shown + (shown === 1 ? " location" : " locations") +
          (district === "All" ? " across Belize" : " in " + district + " District");
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
