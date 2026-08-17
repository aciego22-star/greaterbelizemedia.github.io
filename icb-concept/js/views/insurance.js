/* ============================================================================
   Insurance hub — guided discovery plus the full category grid.
   The quiz routes people toward published ICB categories. It never
   recommends binding coverage; it is navigation, not underwriting.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  ICB.views.insurance = {
    title: { en: "Insurance | ICB", es: "Seguros | ICB" },
    render: function () {
      var R = ICB.render;
      var cards = ICB.DATA.products.map(R.productCard).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="ins-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="insurance-hero" aria-hidden="true">' + ICB.art.panel("hero-breadth") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Insurance", es: "Seguros" }) +
            '<span class="eyebrow">' + T("Insurance", "Seguros") + '</span>' +
            '<h1 id="ins-title">' + T("Find the right cover.", "Encuentre la cobertura indicada.") + '</h1>' +
            '<p class="hero-lead">' + T("Start with what you want to protect and we will point you in the right direction. An ICB representative takes it from there.", "Empiece por lo que desea proteger y le indicaremos el camino. Un representante de ICB sigue desde ahí.") + '</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="quiz-title">' +
          '<div class="shell">' + R.quiz("quiz-title") + "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="all-cat-title">' +
          '<div class="shell">' +
            /* No count in the heading: ICB's published category list is what
               it is, and a number in the copy dates the moment it changes. */
            R.sectionHead({ eyebrow: { en: "All categories", es: "Todas las categorías" }, title: { en: "Explore ICB insurance.", es: "Conozca los seguros de ICB." }, sub: { en: "Insurance options for individuals and businesses.", es: "Opciones de seguro para personas y empresas." }, id: "all-cat-title" }) +
            '<div class="card-grid">' + cards + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + T("Request a quote", "Solicitar una cotizacion") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Here to help", es: "Estamos para ayudarle" },
              title: { en: "Not sure where to start? Our team will guide you.", es: "¿No sabe por dónde empezar? Nuestro equipo le orienta." },
              /* The quote note rather than the service quote: this band
                 now carries a quote action, so it should say what that
                 does and does not mean. */
              body: ICB.DATA.quoteNote,
              motif: "heritage",
              actions: [
                { label: { en: "Request a quote", es: "Solicitar una cotización" }, href: ICB.DATA.quoteHref() },
                { label: ICB.s("callN", { n: ICB.DATA.site.corporate.phoneDisplay }), href: "tel:" + ICB.DATA.site.corporate.phoneTel }
              ]
            }) +
          "</div>" +
        "</section>";
    },
    mounted: function (mount) {
      ICB.render.initQuiz(mount);
    }
  };
})();
