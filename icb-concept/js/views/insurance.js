/* ============================================================================
   Insurance hub — guided discovery plus the full category grid.
   The quiz routes people toward published ICB categories. It never
   recommends binding coverage; it is navigation, not underwriting.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var OPTIONS = [
    { id: "home", label: "My home", glyph: "house", productId: "property",
      blurb: "Homeowners and renters are both part of ICB's published property categories." },
    { id: "vehicle", label: "My vehicle", glyph: "car", productId: "motor",
      blurb: "From personal vehicles to taxis, buses and heavy-duty equipment." },
    { id: "business", label: "My business", glyph: "briefcase", special: "business",
      blurb: "Business protection usually combines property, motor, cargo and liability cover." },
    { id: "boat", label: "A boat or vessel", glyph: "boat", productId: "marine",
      blurb: "Marine Hull Insurance, customizable to third party and passenger liability." },
    { id: "goods", label: "Goods being shipped", glyph: "container", productId: "cargo",
      blurb: "Warehouse-to-warehouse protection for goods in transit." },
    { id: "trip", label: "My next trip", glyph: "plane", productId: "travel",
      blurb: "Travel cover designed around journeys abroad." },
    { id: "mexico", label: "A drive into Mexico", glyph: "border", productId: "mexican",
      blurb: "Mexican law requires liability insurance from a Mexico-authorized insurer." },
    { id: "unsure", label: "I'm not sure", glyph: "question", special: "unsure",
      blurb: "No problem. The ICB team will point you in the right direction." }
  ];

  function quizResult(opt) {
    var R = ICB.render;
    var out = '<span class="eyebrow">A good place to start</span>';
    if (opt.special === "business") {
      out += "<h3>Business insurance</h3><p>" + R.esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/business">Explore business insurance</a>' +
        '<a class="btn btn-ghost" href="#/contact?topic=business">Start a business enquiry</a>' +
        "</div>";
    } else if (opt.special === "unsure") {
      out += "<h3>Talk it through with ICB</h3><p>" + R.esc(opt.blurb) +
        " Liability & Miscellaneous also covers needs that do not fit a single box.</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/contact?topic=new-cover">Start an enquiry</a>' +
        '<button type="button" class="btn btn-ghost" data-ask-launcher>Ask ICB</button>' +
        '<a class="btn btn-ghost" href="#/insurance/liability">Liability &amp; Miscellaneous</a>' +
        "</div>";
    } else {
      var p = ICB.DATA.productById(opt.productId);
      out += "<h3>" + R.esc(p.name) + "</h3><p>" + R.esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="' + R.esc(p.route) + '">Learn about ' + R.esc(p.name) + "</a>" +
        '<a class="btn btn-ghost" href="#/contact?topic=new-cover&category=' + R.esc(p.id) + '">Start an enquiry</a>' +
        "</div>";
    }
    return out;
  }

  ICB.views.insurance = {
    title: "Insurance | ICB",
    render: function () {
      var R = ICB.render;
      var opts = OPTIONS.map(function (o) {
        return '<button type="button" class="quiz-option" data-quiz-option="' + o.id + '" aria-pressed="false">' +
          ICB.art.glyph(o.glyph) + "<span>" + R.esc(o.label) + "</span></button>";
      }).join("");
      var cards = ICB.DATA.products.map(R.productCard).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="ins-title">' +
          '<div class="page-hero-art art-panel" aria-hidden="true">' + ICB.art.panel("hero") + "</div>" +
          '<div class="shell page-hero-inner">' +
            '<span class="eyebrow">Insurance</span>' +
            '<h1 id="ins-title">Find the right cover.</h1>' +
            '<p class="hero-lead">Start with what you want to protect and we will point you in the right direction. An ICB representative takes it from there.</p>' +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="quiz-title">' +
          '<div class="shell">' +
            '<div class="quiz-panel rv">' +
              '<h2 id="quiz-title">What are you looking to protect?</h2>' +
              '<div class="quiz-grid" role="group" aria-label="Choose what you want to protect">' + opts + "</div>" +
              '<div class="quiz-result" data-quiz-result aria-live="polite"></div>' +
            "</div>" +
          "</div>" +
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
      var result = mount.querySelector("[data-quiz-result]");
      var buttons = mount.querySelectorAll("[data-quiz-option]");
      Array.prototype.forEach.call(buttons, function (btn) {
        btn.addEventListener("click", function () {
          Array.prototype.forEach.call(buttons, function (b) {
            b.setAttribute("aria-pressed", String(b === btn));
          });
          var opt = null;
          for (var i = 0; i < OPTIONS.length; i++) {
            if (OPTIONS[i].id === btn.getAttribute("data-quiz-option")) opt = OPTIONS[i];
          }
          result.innerHTML = '<div class="quiz-result-inner">' + quizResult(opt) + "</div>";
          result.classList.add("has-result");
        });
      });
    }
  };
})();
