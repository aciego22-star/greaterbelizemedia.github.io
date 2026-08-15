/* ============================================================================
   Gallery view — ICB Across Belize.

   Branches come first: this page exists to show ICB's real physical
   presence across the country. Campaign stills from ICB's own film sit in
   their own section below, and the film itself has a dedicated media area.

   Content and slots live in js/data/gallery.js. Adding an official branch
   photograph there lights up its tile with no layout change.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.gallery = {
    title: "Gallery | ICB Across Belize",
    render: function () {
      var R = ICB.render;

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="gal-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="gallery-hero" aria-hidden="true">' + ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">ICB Across Belize</span>' +
            '<h1 id="gal-title">Protecting what matters, across the country.</h1>' +
            '<p class="hero-lead">From Corozal to Punta Gorda, ICB serves communities across Belize through a nationwide network of branches and agencies.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="gal-branches-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "The network",
              title: "Branches and agencies.",
              id: "gal-branches-title"
            }) +
            '<div class="gallery gallery--branches">' + R.branchGallery() + "</div>" +
            '<div class="btn-row" style="margin-top: var(--sp-6);">' +
              '<a class="btn btn-outline" href="#/locations">See every location</a>' +
            "</div>" +
          "</div>" +
        "</section>" +

        R.motionSection({
          tint: true,
          title: "Life Happens Fast.",
          sub: "ICB's campaign film, shot in Belize."
        }) +

        '<section class="section" aria-labelledby="gal-campaign-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "From the campaign",
              title: "Scenes from the ICB film.",
              id: "gal-campaign-title"
            }) +
            '<div class="gallery">' + R.campaignGallery() + "</div>" +
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
      ICB.initFeaturedVideo(mount);
    }
  };
})();
