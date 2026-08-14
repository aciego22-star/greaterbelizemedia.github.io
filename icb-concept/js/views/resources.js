/* ============================================================================
   Resource Centre view — consumer education plus official documents.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.resources = {
    title: "Resource Centre | ICB",
    render: function () {
      var R = ICB.render;
      var data = ICB.DATA.resources;
      var ext = ICB.DATA.site.external;

      var guides = data.guides.map(function (g) {
        return '<details class="acc rv" data-acc="' + R.esc(g.id) + '">' +
          "<summary>" +
            '<svg viewBox="0 0 24 24" class="acc-chevron" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>' +
            "<span>" + R.esc(g.title) + "</span>" +
            '<span class="badge">' + R.esc(g.tag) + "</span>" +
          "</summary>" +
          '<div class="acc-body">' +
            g.body.map(function (p) { return "<p>" + R.esc(p) + "</p>"; }).join("") +
          "</div>" +
        "</details>";
      }).join("");

      var official = data.official.map(function (o) {
        var href = ext[o.hrefKey];
        return '<a class="official-card rv" href="' + R.esc(href) + '"' + R.extAttrs() + ">" +
          "<strong>" + R.esc(o.label) + " " + R.extIcon() + "</strong>" +
          "<span>" + R.esc(o.description) + "</span>" + R.extNote(R.hostOf(href)) +
        "</a>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="res-title">' +
          '<div class="page-hero-art art-panel" aria-hidden="true">' + ICB.art.panel("poster") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">ICB Resource Centre</span>' +
            '<h1 id="res-title">Consumer Resources.</h1>' +
            '<p class="hero-lead">Plain answers to common insurance questions, together with the official forms and documents from icbinsurance.com.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="official-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Official documents",
              title: "Forms and portals, straight from ICB.",
              id: "official-title"
            }) +
            '<div class="official-grid">' + official + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="guides-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Good to know",
              title: "Insurance, in plain language.",
              sub: "General consumer information for Belize. For guidance about your own policy, contact ICB.",
              id: "guides-title"
            }) +
            '<div class="acc-list">' + guides + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="Ask a question">' +
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
