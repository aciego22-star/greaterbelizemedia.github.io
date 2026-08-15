/* ============================================================================
   Product detail view — one renderer for all seven published categories.
   Copy is descriptive; next steps route to enquiry, phone or branches.

   Two categories behave differently, and the renderer respects that:
   - suspended (Travel): no enquiry action anywhere on the page.
   - anaPathways (Mexican): ICB directs people to ANA Seguros, so the page
     leads with those pathways rather than an ICB enquiry.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  function labelledList(label, items, R) {
    if (!items || !items.length) return "";
    var li = items.map(function (c) {
      return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + R.esc(c) + "</span></li>";
    }).join("");
    return '<h3 class="prod-list-label">' + R.esc(label) + "</h3>" +
      '<ul class="values-list prod-covers">' + li + "</ul>";
  }

  ICB.views.product = {
    title: function (ctx) {
      var p = ICB.DATA.productById(ctx.productId);
      return (p ? p.name : "Insurance") + " | ICB";
    },
    render: function (ctx) {
      var R = ICB.render;
      var site = ICB.DATA.site;
      var p = ICB.DATA.productById(ctx.productId);
      if (!p) return ICB.views.notfound.render();

      var suspended = !!p.suspended;
      var anaUrl = site.external.mexicanInsurance;

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
          "<p>The official ICB claim forms and the route to the claims team are one click away.</p>" +
          '<div class="msg-actions">' + claims + "</div></div>";
      }

      var related = p.related.map(function (rid) {
        var rp = ICB.DATA.productById(rid);
        return rp ? R.productCard(rp) : "";
      }).join("");

      var statusNote = p.status
        ? '<div class="notice rv"><p><strong>Please note.</strong> ' + R.esc(p.status.text) + "</p></div>"
        : "";

      /* ANA Seguros pathways, exactly as ICB presents them. */
      var ana = "";
      if (p.anaPathways && p.anaPathways.length) {
        var btns = p.anaPathways.map(function (a, i) {
          return '<a class="btn btn-sm ' + (i === 0 ? "btn-primary" : "btn-ghost") + '" href="' +
            R.esc(anaUrl) + '" target="_blank" rel="noopener noreferrer">' + R.esc(a.label) + "</a>";
        }).join("");
        ana = '<div class="ana-block rv">' +
          "<h3>Through ANA Seguros</h3>" +
          '<div class="btn-row">' + btns + "</div>" +
          '<p class="pathway-note">Opens ICB&#39;s Mexican Insurance page on icbinsurance.com.</p>' +
        "</div>";
      }

      /* Hero actions. */
      var heroActions;
      if (suspended) {
        heroActions =
          '<a class="btn btn-gold" href="#/contact?topic=other&category=' + R.esc(p.id) + '">Contact ICB</a>' +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">Call ' + R.esc(site.corporate.phoneDisplay) + "</a>";
      } else if (ana) {
        heroActions =
          '<a class="btn btn-gold" href="' + R.esc(anaUrl) + '" target="_blank" rel="noopener noreferrer">Buy Now</a>' +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">Call ' + R.esc(site.corporate.phoneDisplay) + "</a>";
      } else {
        heroActions =
          '<a class="btn btn-gold" href="#/contact?topic=new-cover&category=' + R.esc(p.id) + '">Request information</a>' +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">Call ' + R.esc(site.corporate.phoneDisplay) + "</a>";
      }

      /* Next-step band. */
      var bandActions = [];
      if (!suspended && !ana) bandActions.push({ label: "Request information", href: "#/contact?topic=new-cover&category=" + p.id });
      if (ana) bandActions.push({ label: "Go to ANA Seguros pathways", href: anaUrl, external: true });
      if (suspended) bandActions.push({ label: "Contact ICB", href: "#/contact?topic=other&category=" + p.id });
      bandActions.push({ label: "Call " + site.corporate.phoneDisplay, href: "tel:" + site.corporate.phoneTel });
      bandActions.push({ label: "Visit a branch", href: "#/locations" });

      var bandTitle = suspended
        ? "Contact ICB about " + p.name + "."
        : "Talk to ICB about " + p.name + ".";
      var bandBody = suspended
        ? "Call, send a message, or walk into any branch and the ICB team will share the current information."
        : "Call, send a message, or walk into any branch and an ICB representative will take it from there.";

      var whoHeading = suspended ? "Current status" : "Who this is for";
      /* Nothing to list means no reason for a two-column grid. */
      var single = !p.covers.length && !p.availableFor && !ana;

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
            '<div class="btn-row">' + heroActions + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="who-title">' +
          '<div class="shell prod-grid' + (single ? " prod-grid--single" : "") + '">' +
            "<div>" +
              '<h2 id="who-title">' + R.esc(whoHeading) + "</h2>" +
              statusNote +
              (p.audience ? "<p>" + R.esc(p.audience) + "</p>" : "") +
              labelledList(p.coversLabel || "What ICB offers", p.covers, R) +
              labelledList("Available for", p.availableFor, R) +
              ana +
            "</div>" +
            '<aside class="prod-side rv">' +
              "<h3>Good to know</h3>" +
              '<ul class="gtk-list">' + gtk + "</ul>" +
              claims +
              (p.campaign
                ? '<figure class="campaign-inset"><img data-asset="' + R.esc(p.campaign.src) + '" alt="' + R.esc(p.campaign.alt) + '" loading="lazy">' +
                  '<figcaption>From ICB&#39;s Protect Your Investment campaign</figcaption></figure>'
                : "") +
            "</aside>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="Next steps">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Take the next step",
              title: bandTitle,
              body: bandBody,
              motif: "heritage",
              actions: bandActions
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
