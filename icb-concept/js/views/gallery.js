/* ============================================================================
   Gallery view — ICB Across Belize.
   Real ICB imagery: the headquarters photograph and scenes from ICB's own
   Life Happens Fast campaign film. Built so approved branch, staff and
   institutional photographs can be added to ICB.GALLERY_ITEMS without any
   layout change.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.gallery = {
    title: "Gallery | ICB Across Belize",
    render: function () {
      var R = ICB.render;
      var items = ICB.GALLERY_ITEMS.map(function (g, i) {
        return '<figure class="gallery-item rv' + (g.light ? " gallery-item--light" : "") + '">' +
          '<button type="button" class="g-open" data-lightbox="' + i + '" aria-label="View larger: ' + R.esc(g.caption) + '">' +
            '<img src="' + R.esc(g.src) + '" alt="' + R.esc(g.alt) + '" loading="lazy">' +
          "</button>" +
          "<figcaption>" +
            '<span class="g-index" aria-hidden="true">' + (i < 9 ? "0" : "") + (i + 1) + "</span>" +
            '<span class="g-name">' + R.esc(g.caption) + "</span>" +
          "</figcaption>" +
          "</figure>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="gal-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="gallery-hero" aria-hidden="true">' + ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">ICB Across Belize</span>' +
            '<h1 id="gal-title">Protecting what matters, across the country.</h1>' +
            '<p class="hero-lead">From Corozal to Punta Gorda, ICB serves communities across Belize through a nationwide network of branches and agencies.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="gal-grid-title">' +
          '<div class="shell">' +
            '<h2 id="gal-grid-title" class="visually-hidden">Photographs</h2>' +
            '<div class="gallery">' + items + "</div>" +
            '<p class="concept-flag" style="margin-top: var(--sp-6);">Imagery from ICB’s headquarters and the Life Happens Fast campaign film. Approved branch, staff and event photography can be added here.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Visit ICB">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Nationwide",
              title: "Find the ICB location closest to you.",
              body: ICB.DATA.site.org.serviceQuote,
              motif: "heritage",
              actions: [
                { label: "Find a branch", href: "#/locations" },
                { label: "Contact ICB", href: "#/contact" }
              ]
            }) +
          "</div>" +
        "</section>";
    },
    mounted: function (mount) {
      ICB.initLightbox(mount);
    }
  };
})();
