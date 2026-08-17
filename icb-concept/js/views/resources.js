/* ============================================================================
   Resource Centre view — official ICB material only.
   Nothing here presents newly written insurance education as ICB guidance.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  function externalCard(o, R, ext) {
    var href = ext[o.hrefKey];
    return '<a class="official-card rv" href="' + R.esc(href) + '"' + R.extAttrs() + ">" +
      '<span class="official-glyph">' + ICB.art.glyph(o.glyph) + "</span>" +
      "<strong>" + R.esc(o.label) + " " + R.extIcon() + "</strong>" +
      "<span>" + R.esc(o.description) + "</span>" + R.extNote(R.hostOf(href)) +
    "</a>";
  }

  function siteCard(o, R) {
    return '<a class="official-card rv" href="' + R.esc(o.route) + '">' +
      '<span class="official-glyph">' + ICB.art.glyph(o.glyph) + "</span>" +
      "<strong>" + R.esc(o.label) + "</strong>" +
      "<span>" + R.esc(o.description) + "</span>" +
    "</a>";
  }

  ICB.views.resources = {
    title: { en: "Resource Centre | ICB", es: "Centro de recursos | ICB" },
    render: function () {
      var R = ICB.render;
      var data = ICB.DATA.resources;
      var ext = ICB.DATA.site.external;

      /* An entry may point off-site (hrefKey) or at a page of this site
         (route). Payment instructions are internal now, so the card type
         follows the destination rather than the section it sits in. */
      var official = data.official.map(function (o) {
        return o.route ? siteCard(o, R) : externalCard(o, R, ext);
      }).join("");
      var safety = data.safety.map(function (o) { return externalCard(o, R, ext); }).join("");
      var onSite = data.onSite.map(function (o) { return siteCard(o, R); }).join("");

      /* The reserved slot for future consumer guides is no longer painted.
         An empty card describing what could go there is a note to the
         build team, and a visitor should not be reading those. The slot
         is documented in ICB.DATA.resources.placeholder instead. */

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="res-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="resources-hero" aria-hidden="true">' + ICB.art.panel("poster") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Resources", es: "Recursos" }) +
            '<span class="eyebrow">' + T("ICB Resource Centre", "Centro de recursos de ICB") + '</span>' +
            '<h1 id="res-title">' + T("Consumer Resources.", "Recursos para el consumidor.") + '</h1>' +
            '<p class="hero-lead">' + T("The forms, portals and safety material ICB publishes, gathered in one place.", "Los formularios, portales y material de seguridad que publica ICB, reunidos en un solo lugar.") + '</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="official-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Official ICB documents", es: "Documentos oficiales de ICB" },
              title: { en: "Forms and portals, straight from ICB.", es: "Formularios y portales, directamente de ICB." },
              id: "official-title"
            }) +
            '<div class="official-grid">' + official + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="safety-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Safety material", es: "Material de seguridad" },
              title: { en: "Preparation ICB publishes.", es: "Preparación que publica ICB." },
              sub: { en: "Hurricane season and fire prevention information from icbinsurance.com.", es: "Información sobre temporada de huracanes y prevención de incendios, de icbinsurance.com." },
              id: "safety-title"
            }) +
            '<div class="official-grid official-grid--pair">' + safety + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="onsite-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "On this site", es: "En este sitio" },
              title: { en: "Where to go next.", es: "Adónde ir después." },
              id: "onsite-title"
            }) +
            '<div class="official-grid">' + onSite + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + T("Ask a question", "Hacer una pregunta") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Still curious?", es: "¿Le queda una duda?" },
              title: { en: "A question deserves a person.", es: "Una pregunta merece una persona." },
              body: { en: "For anything about your own cover, the ICB team is a call, a message or a branch visit away.", es: "Para cualquier cosa sobre su propia cobertura, el equipo de ICB está a una llamada, un mensaje o una visita de distancia." },
              motif: "heritage",
              actions: [
                { label: { en: "Contact ICB", es: "Comunicarse con ICB" }, href: "#/contact" },
                { label: ICB.s("callN", { n: ICB.DATA.site.corporate.phoneDisplay }), href: "tel:" + ICB.DATA.site.corporate.phoneTel }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
