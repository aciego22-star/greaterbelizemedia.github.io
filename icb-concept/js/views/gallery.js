/* ============================================================================
   Gallery view — ICB Across Belize.

   Branches only: this page exists to show ICB's real physical presence
   across the country. The campaign films have their own media area.

   Content and slots live in js/data/gallery.js. Adding an official branch
   photograph there lights up its tile with no layout change.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  ICB.views.gallery = {
    title: { en: "Gallery | ICB Across Belize", es: "Galería | ICB en todo Belice" },
    render: function () {
      var R = ICB.render;

      return '' +
        /* A banner rather than a background: the box takes the shape of
           the photograph at each breakpoint. See .page-hero--banner.

           Not aria-hidden. The panel used to hold only generated
           decoration; it now carries two named ICB buildings with alt
           text of their own, and the generated panel inside it hides
           itself. */
        '<section class="page-hero page-hero--banner on-dark" aria-labelledby="gal-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="gallery-hero">' + ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Gallery", es: "Galería" }) +
            '<span class="eyebrow">' + T("ICB Across Belize", "ICB en todo Belice") + '</span>' +
            '<h1 id="gal-title">' + T("Protecting what matters, across the country.", "Protegiendo lo que importa, en todo el país.") + '</h1>' +
            '<p class="hero-lead">' + T("From Corozal to Punta Gorda, ICB serves communities across Belize through a nationwide network of branches and agencies.", "De Corozal a Punta Gorda, ICB atiende a las comunidades de Belice a través de una red nacional de sucursales y agencias.") + '</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="gal-branches-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "The network", es: "La red" },
              title: { en: "Branches and agencies.", es: "Sucursales y agencias." },
              id: "gal-branches-title"
            }) +
            '<div class="gallery gallery--branches">' + R.branchGallery() + "</div>" +
            '<div class="btn-row" style="margin-top: var(--sp-6);">' +
              '<a class="btn btn-outline" href="#/locations">' + T("See every location", "Ver todas las ubicaciones") + '</a>' +
            "</div>" +
          "</div>" +
        "</section>" +

        R.motionSection({
          tint: true,
          title: { en: "The ICB films.", es: "Los videos de ICB." },
          sub: { en: "ICB's campaign film, in English and Spanish.", es: "El video de campaña de ICB, en inglés y en español." }
        }) +

        '<section class="section section--flush-top" aria-label="' + T("Visit ICB", "Visite ICB") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Nationwide", es: "En todo el país" },
              title: { en: "Find the ICB location closest to you.", es: "Encuentre la oficina de ICB más cercana." },
              body: ICB.DATA.site.org.serviceQuote,
              motif: "heritage",
              actions: [
                { label: { en: "Find a branch", es: "Encontrar una sucursal" }, href: "#/locations" },
                { label: { en: "Contact ICB", es: "Comunicarse con ICB" }, href: "#/contact" }
              ]
            }) +
          "</div>" +
        "</section>";
    },
    mounted: function (mount) {
      ICB.initLightbox(mount);
      ICB.initFilms(mount);
    }
  };
})();
