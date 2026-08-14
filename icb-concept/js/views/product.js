/* ============================================================================
   Product detail view — one renderer for all seven published categories.
   Copy is descriptive; next steps route to enquiry, phone or branches.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.product = {
    title: function (ctx) {
      var p = ICB.DATA.productById(ctx.productId);
      return (p ? p.name : "Insurance") + " | ICB";
    },
    render: function (ctx) {
      var R = ICB.render;
      var p = ICB.DATA.productById(ctx.productId);
      if (!p) return ICB.views.notfound.render();

      var covers = p.covers.map(function (c) {
        return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + R.esc(c) + "</span></li>";
      }).join("");

      var gtk = p.goodToKnow.map(function (g) {
        return '<li class="rv"><p>' + R.esc(g) + "</p></li>";
      }).join("");

      var claims = "";
      if (p.claimPathways.length) {
        claims = p.claimPathways.map(function (cid) {
          var c = ICB.DATA.claimById(cid);
          return c ? '<a class="msg-action" href="#/claims@' + R.esc(c.anchor) + '">' + ICB.art.glyph(c.glyph) +
            "<span>" + R.esc(c.name) + "</span></a>" : "";
        }).join("");
        claims = '<div class="prod-claims rv"><h3>If something happens</h3>' +
          "<p>Clear pathways and official forms are ready when you need them.</p>" +
          '<div class="msg-actions">' + claims + "</div></div>";
      }

      var related = p.related.map(function (rid) {
        var rp = ICB.DATA.productById(rid);
        return rp ? R.productCard(rp) : "";
      }).join("");

      var statusNote = p.status
        ? '<div class="notice rv"><p><strong>Please note.</strong> ' + R.esc(p.status.text) + "</p></div>"
        : "";

      var coversNote = p.coversNote
        ? '<p class="concept-flag">' + R.esc(p.coversNote) + "</p>"
        : "";

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="prod-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="product-' + R.esc(p.id) + '" aria-hidden="true">' + ICB.art.panel(p.artMotif) + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<nav class="crumbs crumbs--dark" aria-label="Breadcrumb"><ol>' +
              '<li><a href="#/insurance">Insurance</a></li><li aria-current="page">' + R.esc(p.name) + "</li>" +
            "</ol></nav>" +
            '<span class="eyebrow">' + R.esc(p.kicker) + "</span>" +
            '<h1 id="prod-title">' + R.esc(p.name) + "</h1>" +
            '<p class="hero-lead">' + R.esc(p.standfirst) + "</p>" +
            '<div class="btn-row">' +
              '<a class="btn btn-gold" href="#/contact?topic=new-cover&category=' + R.esc(p.id) + '">Start an enquiry</a>' +
              '<button type="button" class="btn btn-light" data-ask-launcher data-ask-prefill="Tell me about ' + R.esc(p.name) + '.">Ask about this coverage</button>' +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="who-title">' +
          '<div class="shell prod-grid">' +
            "<div>" +
              (statusNote ? statusNote : "") +
              '<h2 id="who-title">Who this is for</h2>' +
              '<p>' + R.esc(p.audience) + "</p>" +
              '<ul class="values-list prod-covers">' + covers + "</ul>" + coversNote +
            "</div>" +
            '<aside class="prod-side rv">' +
              '<h3>Good to know</h3>' +
              '<ul class="gtk-list">' + gtk + "</ul>" +
              claims +
            "</aside>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Next steps">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Take the next step",
              title: "Talk to ICB about " + p.name.toLowerCase() + ".",
              body: "No forms to fight with. Start an enquiry, call, or walk into any branch and our team will guide you.",
              motif: "heritage",
              actions: [
                { label: "Start an enquiry", href: "#/contact?topic=new-cover&category=" + p.id },
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel },
                { label: "Visit a branch", href: "#/locations" }
              ]
            }) +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="rel-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: "Related", title: "People often look at these together.", id: "rel-title" }) +
            '<div class="card-grid card-grid--pair">' + related + "</div>" +
          "</div>" +
        "</section>";
    }
  };
})();
