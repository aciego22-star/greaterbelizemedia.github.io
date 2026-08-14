/* ============================================================================
   Business view — protection for Belizean businesses, mapped strictly to
   ICB's published categories.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var SEGMENTS = [
    {
      title: "Premises and property",
      body: "Shops, offices, warehouses and commercial buildings, with published categories for small business and commercial property.",
      glyph: "house",
      links: [{ label: "Property Insurance", href: "#/insurance/property" }]
    },
    {
      title: "Vehicles and fleets",
      body: "Commercial vehicles, taxis and buses, and heavy-duty equipment, insured around the way they work.",
      glyph: "car",
      links: [{ label: "Motor Insurance", href: "#/insurance/motor" }]
    },
    {
      title: "Goods in transit",
      body: "Warehouse-to-warehouse protection for the goods your business moves, imports or exports.",
      glyph: "container",
      links: [{ label: "Cargo Insurance", href: "#/insurance/cargo" }]
    },
    {
      title: "Vessels and passengers",
      body: "Marine Hull cover for working vessels, customizable to third party and passenger liability.",
      glyph: "boat",
      links: [{ label: "Marine Hull Insurance", href: "#/insurance/marine" }]
    },
    {
      title: "Liability and specialty",
      body: "Commercial liability, contractors all risk and other covers arranged to fit your operation.",
      glyph: "scales",
      links: [{ label: "Liability & Miscellaneous", href: "#/insurance/liability" }]
    }
  ];

  var PROCESS = [
    { n: 1, title: "Tell us about the business", body: "A sentence or two about what you do and what you want protected is enough to start." },
    { n: 2, title: "Meet with our team", body: "An ICB representative reviews your needs with you, at a branch or over the phone." },
    { n: 3, title: "Review your options", body: "You see how the published categories fit together for your operation before any decision." },
    { n: 4, title: "Stay covered as you grow", body: "Branches across the country keep support close as the business changes." }
  ];

  ICB.views.business = {
    title: "Business Insurance | ICB",
    render: function () {
      var R = ICB.render;

      var segs = SEGMENTS.map(function (s) {
        return '<article class="card rv"><div class="card-body" style="padding-top: var(--sp-5);">' +
          '<div class="card-glyph" style="margin-top: 0;">' + ICB.art.glyph(s.glyph) + "</div>" +
          "<h3>" + R.esc(s.title) + "</h3>" +
          '<p class="card-desc">' + R.esc(s.body) + "</p>" +
          '<div class="card-links">' +
            s.links.map(function (l) { return '<a href="' + R.esc(l.href) + '">' + R.esc(l.label) + "</a>"; }).join("") +
          "</div>" +
        "</div></article>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="biz-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="business-band" aria-hidden="true">' + ICB.art.panel("business") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">Business insurance</span>' +
            '<h1 id="biz-title">Protection for the business you have built.</h1>' +
            '<p class="hero-lead">From the corner shop to the commercial fleet, ICB has insured Belizean enterprise since 1981. Tell us what you do and we will help you protect it.</p>' +
            '<div class="btn-row">' +
              '<a class="btn btn-gold btn-lg" href="#/contact?topic=business">Talk to ICB about business insurance</a>' +
              '<a class="btn btn-light btn-lg" href="#/insurance">Explore the categories</a>' +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="seg-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Built around your operation",
              title: "Cover for every side of the business.",
              sub: "Most businesses combine two or three of these. Your ICB representative helps you see how they fit together.",
              id: "seg-title"
            }) +
            '<div class="card-grid">' + segs + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="process-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: "How it starts", title: "Four easy steps.", id: "process-title" }) +
            R.steps(PROCESS) +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="Start a business enquiry">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Ready when you are",
              title: "Start a business enquiry today.",
              body: "Send a few details and the right ICB team follows up. Or call and talk it through directly.",
              motif: "business",
              actions: [
                { label: "Start a business enquiry", href: "#/contact?topic=business" },
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
