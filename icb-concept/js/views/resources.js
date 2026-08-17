/* ============================================================================
   Resource Centre view — official ICB material only.
   Nothing here presents newly written insurance education as ICB guidance.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

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
    title: "Resource Centre | ICB",
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
            R.crumbsHome("Resources") +
            '<span class="eyebrow">ICB Resource Centre</span>' +
            '<h1 id="res-title">Consumer Resources.</h1>' +
            '<p class="hero-lead">The forms, portals and safety material ICB publishes, gathered in one place.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="official-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Official ICB documents",
              title: "Forms and portals, straight from ICB.",
              id: "official-title"
            }) +
            '<div class="official-grid">' + official + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="safety-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Safety material",
              title: "Preparation ICB publishes.",
              sub: "Hurricane season and fire prevention information from icbinsurance.com.",
              id: "safety-title"
            }) +
            '<div class="official-grid official-grid--pair">' + safety + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="onsite-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "On this site",
              title: "Where to go next.",
              id: "onsite-title"
            }) +
            '<div class="official-grid">' + onSite + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Ask a question">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Still curious?",
              title: "A question deserves a person.",
              body: "For anything about your own cover, the ICB team is a call, a message or a branch visit away.",
              motif: "heritage",
              actions: [
                { label: "Contact ICB", href: "#/contact" },
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
