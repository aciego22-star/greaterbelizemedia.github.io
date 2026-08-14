/* ============================================================================
   Insurance hub — guided discovery plus the full category grid.
   The quiz routes people toward published ICB categories. It never
   recommends binding coverage; it is navigation, not underwriting.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.insurance = {
    title: "Insurance | ICB",
    render: function () {
      var R = ICB.render;
      var cards = ICB.DATA.products.map(R.productCard).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="ins-title">' +
          '<div class="page-hero-art art-panel" aria-hidden="true">' + ICB.art.panel("hero-breadth") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">Insurance</span>' +
            '<h1 id="ins-title">Find the right cover.</h1>' +
            '<p class="hero-lead">Start with what you want to protect and we will point you in the right direction. An ICB representative takes it from there.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="quiz-title">' +
          '<div class="shell">' + R.quiz("quiz-title") + "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="all-cat-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: "All categories", title: "Seven lines of cover, one team.", id: "all-cat-title" }) +
            '<div class="card-grid">' + cards + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Start an enquiry">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Here to help",
              title: "Not sure where to start? Our team will guide you.",
              body: ICB.DATA.site.org.serviceQuote,
              motif: "heritage",
              actions: [
                { label: "Start an enquiry", href: "#/contact?topic=new-cover" },
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel }
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
