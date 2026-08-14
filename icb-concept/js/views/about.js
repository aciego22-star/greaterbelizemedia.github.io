/* ============================================================================
   About view — verified institutional story only.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var MILESTONES = [
    {
      year: "1981",
      title: "Founded in Belize",
      body: "Insurance Corporation of Belize is founded by Mr. Erdulfo 'Dufy' Nunez, built on hard work and sound business practices."
    },
    {
      year: "Growth",
      title: "From a small operation to a national name",
      body: "Over the decades, ICB grows into one of the largest and most trusted insurance providers in Belize."
    },
    {
      year: "Today",
      title: "From Corozal to Punta Gorda",
      body: "A nationwide network of branches and agency partners keeps friendly, personal service close to every policyholder."
    }
  ];

  ICB.views.about = {
    title: "About ICB | Insurance Corporation of Belize",
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
            '<span class="eyebrow">About ICB</span>' +
            '<h1 id="about-title">Belize is our home.</h1>' +
            '<p class="hero-lead">' + R.esc(site.org.story) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="story-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Our story",
              title: "Serving Belize since 1981.",
              id: "story-title"
            }) +
            '<ol class="milestones">' + ms + "</ol>" +
            '<p class="concept-flag" style="margin-top: var(--sp-6);">Additional milestones to be provided by ICB.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="values-title">' +
          '<div class="shell home-claims">' +
            "<div>" +
              R.sectionHead({
                eyebrow: "How we work",
                title: "Service you can hold us to.",
                sub: site.org.serviceQuote,
                id: "values-title"
              }) +
              '<div class="btn-row rv">' +
                '<a class="btn btn-primary" href="#/locations">Meet us at a branch</a>' +
                '<a class="btn btn-ghost" href="#/contact">Contact ICB</a>' +
              "</div>" +
            "</div>" +
            '<div class="values-panel rv">' +
              "<h3>Our claims service commitments</h3>" +
              '<ul class="values-list">' + values + "</ul>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="Explore insurance">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Four decades strong",
              title: "The next chapter includes you.",
              body: "Explore the cover ICB offers today, or walk into any branch and say hello.",
              motif: "heritage",
              actions: [
                { label: "Explore insurance", href: "#/insurance" },
                { label: "Find ICB near you", href: "#/locations" }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
