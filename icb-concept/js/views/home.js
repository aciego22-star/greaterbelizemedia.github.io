/* ============================================================================
   Home view — the first 30 seconds of the demo.
   Hero, task-first action bar, categories, claims, nationwide, business,
   The ICB Story (video placeholder), gallery, resources.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  function hero() {
    var org = ICB.DATA.site.org;
    return '' +
      '<section class="hero" aria-labelledby="home-title">' +
        '<div class="hero-art art-panel" data-img-slot="home-hero" aria-hidden="true">' + ICB.art.panel("hero") + "</div>" +
        '<div class="shell"><div class="hero-inner">' +
          '<span class="eyebrow">' + ICB.render.esc(ICB.DATA.site.org.legalName) + "</span>" +
          '<h1 id="home-title">Protecting Belize since 1981.</h1>' +
          '<p class="hero-lead">Insurance for the things you’ve built, the people you care about, and the road ahead. ' +
            "For more than four decades, Belizean families and businesses have trusted ICB.</p>" +
          '<div class="btn-row">' +
            '<a class="btn btn-gold btn-lg" href="#/insurance">Get covered</a>' +
            '<a class="btn btn-light btn-lg" href="#/claims">Make a claim</a>' +
          "</div>" +
          '<div class="hero-secondary">' +
            '<a href="#/locations">Find a branch</a>' +
            '<a href="#ask" data-ask-launcher role="button">Ask ICB</a>' +
          "</div>" +
        "</div></div>" +
      "</section>";
  }

  function actionBar() {
    var tiles = ICB.DATA.site.taskRoutes.map(ICB.render.actionTile).join("");
    return '' +
      '<section class="action-bar" aria-labelledby="action-title">' +
        '<div class="shell"><div class="action-panel rv">' +
          '<h2 id="action-title">What can we help you with?</h2>' +
          '<div class="action-grid">' + tiles + "</div>" +
        "</div></div>" +
      "</section>";
  }

  function categories() {
    var cards = ICB.DATA.products.map(ICB.render.productCard).join("");
    return '' +
      '<section class="section" aria-labelledby="cat-title">' +
        '<div class="shell">' +
          ICB.render.sectionHead({
            eyebrow: "Insurance",
            title: "Cover for the life you have built.",
            sub: "Seven lines of insurance for homes, vehicles, vessels, cargo, business and travel. Start where you are.",
            id: "cat-title"
          }) +
          '<div class="card-grid">' + cards + "</div>" +
          '<div class="btn-row" style="margin-top: var(--sp-7);">' +
            '<a class="btn btn-outline" href="#/insurance">Not sure where to start? Try guided discovery</a>' +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function claimsTeaser() {
    var values = ICB.DATA.claims.valuesList.map(function (v) {
      return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + ICB.render.esc(v) + "</span></li>";
    }).join("");
    return '' +
      '<section class="section section--tint" aria-labelledby="claims-teaser-title">' +
        '<div class="shell home-claims">' +
          '<div>' +
            ICB.render.sectionHead({
              eyebrow: "Claims",
              title: "When something happens, we answer.",
              sub: "Clear pathways, official forms and a team that keeps you informed, so you always know what to do next."
            }) +
            '<div class="btn-row rv">' +
              '<a class="btn btn-primary" href="#/claims">How claims work</a>' +
              '<a class="btn btn-ghost" href="#/claims">Find your claim form</a>' +
            "</div>" +
          "</div>" +
          '<div class="values-panel rv">' +
            '<h3>The ICB claims service is built on</h3>' +
            '<ul class="values-list">' + values + "</ul>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function nationwide() {
    var markers = ICB.DATA.locations.map(function (l) {
      return { id: l.id, x: l.map.x, y: l.map.y };
    });
    return '' +
      '<section class="section section--dark on-dark" aria-labelledby="nation-title">' +
        '<div class="shell home-nation">' +
          '<div class="home-nation-copy">' +
            ICB.render.sectionHead({
              eyebrow: "Nationwide",
              title: "From Corozal to Punta Gorda.",
              sub: ICB.DATA.site.org.serviceQuote
            }) +
            '<div class="btn-row rv">' +
              '<a class="btn btn-gold" href="#/locations">Find ICB near you</a>' +
              '<a class="btn btn-light" href="#/contact?topic=branch-info">Branch information</a>' +
            "</div>" +
          "</div>" +
          '<div class="home-nation-map rv" aria-hidden="true">' +
            ICB.art.belizeMap({ markers: markers, labels: false, mini: true, ariaLabel: "Map of Belize with ICB branch locations marked" }) +
          "</div>" +
        "</div>" +
      "</section>";
  }

  function businessBand() {
    return '' +
      '<section class="section" aria-label="Business insurance">' +
        '<div class="shell">' +
          ICB.render.band({
            eyebrow: "For business",
            title: "Cover that works as hard as your business.",
            body: "Premises, fleets, cargo and liability, arranged around the way Belizean businesses actually run.",
            motif: "business",
            slot: "business-band",
            actions: [
              { label: "Business insurance", href: "#/business" },
              { label: "Talk to ICB about business cover", href: "#/contact?topic=business" }
            ]
          }) +
        "</div>" +
      "</section>";
  }

  function story() {
    return '' +
      '<section class="section section--flush-top" aria-labelledby="story-title">' +
        '<div class="shell">' +
          ICB.render.sectionHead({
            eyebrow: "The ICB Story",
            title: "Four decades of standing with Belize.",
            sub: "More than four decades of protecting Belizean homes, businesses, vehicles and livelihoods."
          }) +
          '<figure class="video-frame art-panel rv" data-img-slot="story-poster">' +
            ICB.art.panel("poster") +
            '<figcaption class="video-caption">' +
              '<span class="eyebrow">Founded in 1981</span>' +
              '<span class="video-line">' + ICB.render.esc(ICB.DATA.site.org.story) + "</span>" +
            "</figcaption>" +
            '<button type="button" class="play-btn" data-story-play aria-label="About the ICB story film placement">' +
              ICB.art.glyph("play") +
            "</button>" +
            '<p class="video-note" data-story-note hidden>Film placement. Final footage to be supplied by ICB.</p>' +
          "</figure>" +
        "</div>" +
      "</section>";
  }

  function gallery() {
    var panels = [
      { key: "corozal", label: "Corozal District" },
      { key: "orange-walk", label: "Orange Walk District" },
      { key: "belize", label: "Belize District" },
      { key: "cayo", label: "Cayo District" },
      { key: "stann-creek", label: "Stann Creek District" },
      { key: "toledo", label: "Toledo District" }
    ].map(function (d, i) {
      return '<figure class="gallery-item art-panel rv" data-img-slot="gallery-' + d.key + '">' +
        ICB.art.panel(d.key) +
        '<figcaption><span class="eyebrow">' + ICB.render.esc(d.label) + "</span></figcaption>" +
        "</figure>";
    }).join("");
    return '' +
      '<section class="section section--tint" aria-labelledby="gallery-title">' +
        '<div class="shell">' +
          ICB.render.sectionHead({
            eyebrow: "ICB Across Belize",
            title: "Protecting what matters, across every district.",
            sub: "Homes, vehicles, businesses and vessels, served through a nationwide network of branches and agency partners. Imagery placements shown as concept artwork, ready for approved ICB photography.",
            center: true
          }) +
          '<div class="gallery">' + panels + "</div>" +
        "</div>" +
      "</section>";
  }

  function resourcesTeaser() {
    return '' +
      '<section class="section" aria-labelledby="res-teaser-title">' +
        '<div class="shell home-resources rv">' +
          '<div>' +
            ICB.render.sectionHead({
              eyebrow: "Resource Centre",
              title: "Know your cover.",
              sub: "Plain answers to common questions about insurance in Belize, plus the official forms and documents.",
              rule: false
            }) +
          "</div>" +
          '<div class="btn-row">' +
            '<a class="btn btn-primary" href="#/resources">Visit the Resource Centre</a>' +
          "</div>" +
        "</div>" +
      "</section>";
  }

  ICB.views.home = {
    title: "ICB | Protecting Belize since 1981",
    render: function () {
      return hero() + actionBar() + categories() + claimsTeaser() + nationwide() +
        businessBand() + story() + gallery() + resourcesTeaser();
    },
    mounted: function (mount) {
      var play = mount.querySelector("[data-story-play]");
      var note = mount.querySelector("[data-story-note]");
      if (play && note) {
        play.addEventListener("click", function () {
          note.hidden = false;
          play.hidden = true;
          note.setAttribute("tabindex", "-1");
          note.focus();
        });
      }
    }
  };
})();
