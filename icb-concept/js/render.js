/* ============================================================================
   ICB.render — shared HTML renderers used across views.
   All dynamic text passes through esc(); data files are trusted but this
   keeps the habit safe if content ever comes from elsewhere.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function extAttrs() {
    return ' target="_blank" rel="noopener noreferrer"';
  }

  /* Canonical WhatsApp chat link: digits-only wa.me URL with a short,
     neutral prefilled greeting the visitor is free to replace. */
  var WA_PREFILL = encodeURIComponent("Hello ICB, I am contacting you through your website.");
  function waHref(waDigits) {
    return "https://wa.me/" + String(waDigits).replace(/\D/g, "") + "?text=" + WA_PREFILL;
  }

  function extNote(host) {
    return '<span class="visually-hidden"> (opens in a new tab, ' + esc(host || "external site") + ")</span>";
  }

  function extIcon() {
    return '<svg viewBox="0 0 24 24" class="ext-mark" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.5H5.5v13h13V14"/><path d="M13.5 4.5h6v6M19 5l-7.5 7.5"/></svg>';
  }

  function hostOf(href) {
    var m = /^https?:\/\/([^/]+)/.exec(href);
    return m ? m[1].replace(/^www\./, "") : "external site";
  }

  /* Generic link/button that understands external targets. */
  function action(a, cls) {
    var external = a.external || /^https?:/.test(a.href || "");
    var href = a.href || "#/";
    var out = '<a class="' + cls + '" href="' + esc(href) + '"' + (external ? extAttrs() : "") + ">";
    out += esc(a.label);
    if (external) out += extIcon() + extNote(hostOf(href));
    return out + "</a>";
  }

  /* Product category card. */
  function productCard(p) {
    return '' +
      '<article class="card rv" data-product-card="' + esc(p.id) + '">' +
        '<div class="card-art art-panel" data-img-slot="product-' + esc(p.id) + '">' + ICB.art.panel(p.artMotif) + "</div>" +
        '<div class="card-body">' +
          '<div class="card-glyph">' + ICB.art.glyph(p.glyph) + "</div>" +
          "<h3><a href=\"" + esc(p.route) + '">' + esc(p.name) + "</a></h3>" +
          '<p class="card-desc">' + esc(p.short) + "</p>" +
          '<div class="card-links">' +
            '<a href="' + esc(p.route) + '">Learn more</a>' +
            '<a href="#/contact?topic=new-cover&category=' + esc(p.id) + '">Start an enquiry</a>' +
          "</div>" +
        "</div>" +
      "</article>";
  }

  /* Task tile (home action bar + mobile menu). */
  function actionTile(t) {
    var external = !!t.external;
    var href = esc(t.href);
    var accent = t.id === "claim" ? " action-tile--accent" : "";
    var out = '<a class="action-tile' + accent + '" href="' + href + '"' + (external ? extAttrs() : "") + ">";
    out += ICB.art.glyph(t.glyph);
    out += "<span>" + esc(t.label) + (external ? extNote(hostOf(t.href)) : "") + "</span>";
    if (t.note) out += '<span class="tile-note">' + esc(t.note) + (external ? ' <span aria-hidden="true">&#8599;</span>' : "") + "</span>";
    return out + "</a>";
  }

  /* Claim pathway card. */
  function claimCard(c) {
    var site = ICB.DATA.site;
    return '' +
      '<article class="pathway rv" id="claim-' + esc(c.anchor) + '" data-anchor="' + esc(c.anchor) + '">' +
        '<div class="pathway-head">' +
          '<span class="pathway-glyph">' + ICB.art.glyph(c.glyph) + "</span>" +
          "<h3>" + esc(c.name) + "</h3>" +
        "</div>" +
        '<p class="pathway-lead">' + esc(c.lead) + "</p>" +
        '<div class="pathway-helpful"><h4>Commonly helpful to have</h4><ul>' +
          c.helpful.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") +
        "</ul></div>" +
        '<div class="pathway-actions">' +
          '<a class="btn btn-primary btn-sm" href="' + esc(site.external.claimsForms) + '"' + extAttrs() + ">" +
            ICB.art.glyph("download") + "<span>" + esc(c.formLabel) + "</span>" + extNote("icbinsurance.com") + "</a>" +
          '<a class="btn btn-ghost btn-sm" href="#/contact?topic=claim">Contact ICB</a>' +
        "</div>" +
        '<p class="pathway-note">Opens the official form page on icbinsurance.com.</p>' +
      "</article>";
  }

  /* Location card. */
  function locationCard(l) {
    var out = '<article class="loc-card rv" data-loc-card="' + esc(l.id) + '" data-district="' + esc(l.district) + '">';
    out += '<div class="loc-head"><h3>' + esc(l.name) + "</h3>" +
      '<span class="badge' + (l.type === "Agency" ? " badge--gold" : "") + '">' + esc(l.type) + "</span></div>";
    out += '<p class="loc-addr">' + esc(l.address) + "</p>";
    if (l.note) out += '<p class="loc-note">' + esc(l.note) + "</p>";
    out += '<div class="loc-actions">';
    for (var i = 0; i < l.phones.length; i++) {
      out += '<a class="msg-action" href="tel:' + esc(l.phones[i].tel) + '">' + ICB.art.glyph("phone") +
        "<span>Call " + esc(l.phones[i].display) + "</span></a>";
    }
    (l.whatsapps || []).forEach(function (w) {
      out += '<a class="msg-action msg-action--wa" href="' + esc(waHref(w.wa)) + '"' + extAttrs() + ">" + ICB.art.waIcon() +
        "<span>WhatsApp " + (w.label ? esc(w.label) + " " : "") + esc(w.display) + "</span>" + extNote("wa.me") + "</a>";
    });
    if (l.email) {
      out += '<a class="msg-action" href="mailto:' + esc(l.email) + '">' + ICB.art.glyph("mail") +
        "<span>" + esc(l.email) + "</span></a>";
    }
    out += '<a class="msg-action" href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(l.mapQuery) + '"' + extAttrs() + ">" +
      ICB.art.glyph("marker") + "<span>Directions</span>" + extNote("google.com/maps") + "</a>";
    out += "</div></article>";
    return out;
  }

  /* Numbered steps list. */
  function steps(list) {
    return '<ol class="steps">' + list.map(function (s) {
      return '<li class="step rv"><span class="step-num" aria-hidden="true">' + s.n + "</span>" +
        "<div><h3>" + esc(s.title) + "</h3><p>" + esc(s.body) + "</p></div></li>";
    }).join("") + "</ol>";
  }

  /* Section heading block. */
  function sectionHead(opts) {
    var out = '<div class="section-head' + (opts.center ? " section-head--center" : "") + (opts.rv === false ? "" : " rv") + '">';
    if (opts.eyebrow) out += '<span class="eyebrow">' + esc(opts.eyebrow) + "</span>";
    out += "<h2>" + esc(opts.title) + "</h2>";
    if (opts.sub) out += "<p>" + esc(opts.sub) + "</p>";
    if (opts.rule !== false) out += '<hr class="brand-rule" aria-hidden="true">';
    return out + "</div>";
  }

  /* Full-width dark CTA band. */
  function band(opts) {
    var out = '<div class="band on-dark rv"' + (opts.slot ? ' data-img-slot="' + esc(opts.slot) + '"' : "") + ">";
    out += '<div class="band-art art-panel" aria-hidden="true">' + ICB.art.panel(opts.motif || "heritage") + "</div>";
    out += '<div class="band-inner">';
    if (opts.eyebrow) out += '<span class="eyebrow">' + esc(opts.eyebrow) + "</span>";
    out += "<" + (opts.hTag || "h2") + ">" + esc(opts.title) + "</" + (opts.hTag || "h2") + ">";
    if (opts.body) out += "<p>" + esc(opts.body) + "</p>";
    if (opts.actions && opts.actions.length) {
      out += '<div class="btn-row">';
      for (var i = 0; i < opts.actions.length; i++) {
        var a = opts.actions[i];
        out += action(a, "btn " + (i === 0 ? "btn-gold" : "btn-light"));
      }
      out += "</div>";
    }
    return out + "</div></div>";
  }

  /* ------------------------------------------------------------------ */
  /* Guided discovery quiz (shared by home + insurance hub)              */
  /* ------------------------------------------------------------------ */

  var QUIZ_OPTIONS = [
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
    var out = '<span class="eyebrow">A good place to start</span>';
    if (opt.special === "business") {
      out += "<h3>Business insurance</h3><p>" + esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/business">Explore business insurance</a>' +
        '<a class="btn btn-ghost" href="#/contact?topic=business">Start a business enquiry</a>' +
        "</div>";
    } else if (opt.special === "unsure") {
      out += "<h3>Talk it through with ICB</h3><p>" + esc(opt.blurb) +
        " Liability & Miscellaneous also covers needs that do not fit a single box.</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/contact?topic=new-cover">Start an enquiry</a>' +
        '<a class="btn btn-ghost" href="#/insurance/liability">Liability &amp; Miscellaneous</a>' +
        "</div>";
    } else {
      var p = ICB.DATA.productById(opt.productId);
      out += "<h3>" + esc(p.name) + "</h3><p>" + esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="' + esc(p.route) + '">Learn about ' + esc(p.name) + "</a>" +
        '<a class="btn btn-ghost" href="#/contact?topic=new-cover&category=' + esc(p.id) + '">Start an enquiry</a>' +
        "</div>";
    }
    return out;
  }

  function quiz(headingId) {
    var opts = QUIZ_OPTIONS.map(function (o) {
      return '<button type="button" class="quiz-option" data-quiz-option="' + o.id + '" aria-pressed="false">' +
        ICB.art.glyph(o.glyph) + "<span>" + esc(o.label) + "</span></button>";
    }).join("");
    return '<div class="quiz-panel rv">' +
      '<h2 id="' + esc(headingId || "quiz-title") + '">What are you looking to protect?</h2>' +
      '<div class="quiz-grid" role="group" aria-label="Choose what you want to protect">' + opts + "</div>" +
      '<div class="quiz-result" data-quiz-result aria-live="polite"></div>' +
      "</div>";
  }

  function initQuiz(mount) {
    var result = mount.querySelector("[data-quiz-result]");
    var buttons = mount.querySelectorAll("[data-quiz-option]");
    Array.prototype.forEach.call(buttons, function (btn) {
      btn.addEventListener("click", function () {
        Array.prototype.forEach.call(buttons, function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        var opt = null;
        for (var i = 0; i < QUIZ_OPTIONS.length; i++) {
          if (QUIZ_OPTIONS[i].id === btn.getAttribute("data-quiz-option")) opt = QUIZ_OPTIONS[i];
        }
        result.innerHTML = '<div class="quiz-result-inner">' + quizResult(opt) + "</div>";
        result.classList.add("has-result");
      });
    });
  }

  /* Future digital assistance placeholder: a note, not a chat interface. */
  function assistBadge(light) {
    return '<p class="assist-badge' + (light ? " assist-badge--light" : "") + '">' +
      '<span class="dot" aria-hidden="true"></span>' +
      '<span>Future digital assistance: this concept is ready for an ICB digital assistant.</span>' +
      "</p>";
  }

  ICB.render = {
    esc: esc,
    waHref: waHref,
    extAttrs: extAttrs,
    extNote: extNote,
    extIcon: extIcon,
    hostOf: hostOf,
    action: action,
    productCard: productCard,
    actionTile: actionTile,
    claimCard: claimCard,
    locationCard: locationCard,
    steps: steps,
    sectionHead: sectionHead,
    band: band,
    quiz: quiz,
    initQuiz: initQuiz,
    assistBadge: assistBadge
  };
})();
