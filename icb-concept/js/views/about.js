/* ============================================================================
   About view — verified institutional story only.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  /* Verified institutional story only. No invented milestones.
     INTERNAL TODO (not client-facing): this timeline is built to take more
     entries. Ask ICB for dated milestones after engagement and add them
     here; the layout does not change. */
  var MILESTONES = [
    {
      year: "1981",
      title: { en: "Founded in Belize", es: "Fundada en Belice" },
      body: { en: "Insurance Corporation of Belize is founded by Mr. Erdulfo 'Dufy' Nunez.", es: "Insurance Corporation of Belize es fundada por el Sr. Erdulfo 'Dufy' Nunez." }
    },
    {
      year: { en: "Growth", es: "Crecimiento" },
      title: { en: "From two people to a national name", es: "De dos personas a un nombre nacional" },
      body: { en: "ICB grows from a small two-person operation into one of the largest and most trusted insurance providers in Belize.", es: "ICB pasa de ser una pequeña operación de dos personas a una de las aseguradoras más grandes y de mayor confianza de Belice." }
    },
    {
      year: { en: "Today", es: "Hoy" },
      title: { en: "From Corozal to Punta Gorda", es: "De Corozal a Punta Gorda" },
      body: { en: "A nationwide network of branches and agencies keeps ICB close to its customers.", es: "Una red nacional de sucursales y agencias mantiene a ICB cerca de sus clientes." }
    }
  ];

  ICB.views.about = {
    title: { en: "About ICB | Insurance Corporation of Belize", es: "Acerca de ICB | Insurance Corporation of Belize" },
    render: function () {
      var R = ICB.render;
      var site = ICB.DATA.site;

      var ms = MILESTONES.map(function (m) {
        return '<li class="milestone rv"><span class="milestone-year" aria-hidden="true">' + R.esc(m.year) + "</span>" +
          '<div class="milestone-body"><h3>' + R.esc(m.title) + "</h3><p>" + R.esc(m.body) + "</p></div></li>";
      }).join("");

      var values = ICB.DATA.claims.valuesList.map(function (v) {
        return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + R.esc(v) + "</span></li>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="about-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="about-band" aria-hidden="true">' + ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "About", es: "Acerca de" }) +
            '<span class="eyebrow">' + T("About ICB", "Acerca de ICB") + '</span>' +
            '<h1 id="about-title">' + R.esc(site.org.homeLine) + "</h1>" +
            '<p class="hero-lead">' + R.esc(site.org.story) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="story-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Our story", es: "Nuestra historia" },
              title: { en: "Serving Belize since 1981.", es: "Al servicio de Belice desde 1981." },
              id: "story-title"
            }) +
            '<ol class="milestones">' + ms + "</ol>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="values-title">' +
          '<div class="shell home-claims">' +
            "<div>" +
              R.sectionHead({
                eyebrow: { en: "How we work", es: "Cómo trabajamos" },
                title: { en: "Service you can hold us to.", es: "Un servicio del que puede responsabilizarnos." },
                sub: site.org.serviceQuote,
                id: "values-title"
              }) +
              '<div class="btn-row rv">' +
                '<a class="btn btn-primary" href="#/locations">' + T("Meet us at a branch", "Visítenos en una sucursal") + '</a>' +
                '<a class="btn btn-ghost" href="#/contact">' + T("Contact ICB", "Comunicarse con ICB") + '</a>' +
              "</div>" +
            "</div>" +
            '<div class="values-panel rv">' +
              "<h3>" + T("Our claims service commitments", "Nuestros compromisos de servicio de reclamos") + "</h3>" +
              '<ul class="values-list">' + values + "</ul>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="' + T("Explore insurance", "Ver seguros") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Since 1981", es: "Desde 1981" },
              title: site.org.positiveDifference,
              body: { en: "Explore the cover ICB offers today, or walk into any branch and say hello.", es: "Conozca la cobertura que ICB ofrece hoy, o pase por cualquier sucursal a saludar." },
              motif: "heritage",
              actions: [
                { label: { en: "Explore insurance", es: "Ver seguros" }, href: "#/insurance" },
                { label: { en: "Find ICB near you", es: "Encontrar ICB cerca de usted" }, href: "#/locations" }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
