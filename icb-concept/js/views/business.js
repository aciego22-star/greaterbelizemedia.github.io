/* ============================================================================
   Business view — protection for Belizean businesses, mapped strictly to
   ICB's published categories.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Every item listed here is one of ICB's published products. Nothing on
     this page describes a package, bundle or term that ICB does not
     publish itself. */
  var SEGMENTS = [
    {
      title: "Premises and property",
      body: "For shops, offices, warehouses and commercial buildings.",
      items: ["Small Business", "Commercial"],
      glyph: "house",
      links: [{ label: "Property Insurance", href: "#/insurance/property" }]
    },
    {
      title: "Vehicles and fleets",
      body: "Motor cover is available for the vehicles a business runs.",
      items: ["Commercial Vehicles", "Taxis & Buses", "Heavy Duty Vehicles"],
      glyph: "car",
      links: [{ label: "Motor Insurance", href: "#/insurance/motor" }]
    },
    {
      title: "Goods in transit",
      body: "Cargo Insurance covers goods in transit from warehouse to warehouse.",
      items: ["Air Transit", "Land Transit", "Marine Transit", "Domestic Transit", "Overseas Transit"],
      glyph: "container",
      links: [{ label: "Cargo Insurance", href: "#/insurance/cargo" }]
    },
    {
      title: "Vessels",
      body: "Marine Hull Insurance can be customized to cover third party and passenger liability.",
      items: ["Barges", "Tug Boats", "Dredgers", "Water Taxis", "Fishing Vessels"],
      glyph: "boat",
      links: [{ label: "Marine Hull Insurance", href: "#/insurance/marine" }]
    },
    {
      title: "Liability and specialty",
      body: "Liability and miscellaneous products for businesses and contractors.",
      items: ["General Liability", "Tour Operators Liability", "Contractors All Risk", "Money Insurance", "Personal Accident"],
      glyph: "scales",
      links: [{ label: "Liability & Miscellaneous", href: "#/insurance/liability" }]
    }
  ];

  /* Administrative pathway to an ICB representative. It does not describe
     underwriting, terms or what any product will cost. */
  var PROCESS = [
    { n: 1, title: "Tell ICB about the business", body: "A sentence or two about what you do and what you want protected is enough to start." },
    { n: 2, title: "Meet an ICB representative", body: "At a branch or over the phone, whichever suits you." },
    { n: 3, title: "Review the options together", body: "Your representative walks you through the categories that apply." },
    { n: 4, title: "Keep your branch close", body: "Branches across the country stay available as the business changes." }
  ];

  ICB.views.business = {
    title: "Business Insurance | ICB",
    render: function () {
      var R = ICB.render;

      var segs = SEGMENTS.map(function (s) {
        var items = (s.items || []).map(function (it) {
          return '<li>' + R.esc(it) + "</li>";
        }).join("");
        return '<article class="card rv"><div class="card-body" style="padding-top: var(--sp-5);">' +
          '<div class="card-glyph" style="margin-top: 0;">' + ICB.art.glyph(s.glyph) + "</div>" +
          "<h3>" + R.esc(s.title) + "</h3>" +
          '<p class="card-desc">' + R.esc(s.body) + "</p>" +
          (items ? '<ul class="biz-items">' + items + "</ul>" : "") +
          '<div class="card-links">' +
            s.links.map(function (l) { return '<a href="' + R.esc(l.href) + '">' + R.esc(l.label) + "</a>"; }).join("") +
          "</div>" +
        "</div></article>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="biz-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="business-band" aria-hidden="true">' + ICB.art.panel("business") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome("Business") +
            '<span class="eyebrow">Business insurance</span>' +
            '<h1 id="biz-title">Protection for the business you have built.</h1>' +
            '<p class="hero-lead">ICB offers insurance options for Belizean businesses across property, vehicles, cargo, marine and liability needs. Tell us what you do and an ICB representative will take it from there.</p>' +
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
              sub: "These are ICB's published categories. Your ICB representative helps you see which ones apply.",
              id: "seg-title"
            }) +
            '<div class="card-grid">' + segs + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="process-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: "How it starts", title: "Four steps to a conversation.", id: "process-title" }) +
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
