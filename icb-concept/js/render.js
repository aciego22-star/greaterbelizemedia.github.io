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

  /* Product category card. Categories with suspended sales carry no
     enquiry link and no "learn more" invitation, so nothing on the card
     implies cover can be arranged today. A quotable category asks for a
     quote and carries itself into the enquiry, so the product is never
     chosen twice. */
  function productCard(p) {
    var first = p.suspended
      ? '<a href="' + esc(p.route) + '">View current information</a>'
      : '<a href="' + esc(p.route) + '">Learn more</a>';
    var second;
    if (p.suspended) {
      second = '<a href="#/contact?topic=other&category=' + esc(p.id) + '">Contact ICB</a>';
    } else if (p.quote === true) {
      second = '<a href="' + esc(ICB.DATA.quoteHref(p.id)) + '">Request a quote</a>';
    } else {
      second = '<a href="#/contact?topic=other&category=' + esc(p.id) + '">Contact ICB</a>';
    }
    return '' +
      '<article class="card rv" data-product-card="' + esc(p.id) + '">' +
        '<div class="card-art art-panel" data-img-slot="product-' + esc(p.id) + '">' + ICB.art.panel(p.artMotif) + "</div>" +
        '<div class="card-body">' +
          '<div class="card-glyph">' + ICB.art.glyph(p.glyph) + "</div>" +
          "<h3><a href=\"" + esc(p.route) + '">' + esc(p.name) + "</a></h3>" +
          '<p class="card-desc">' + esc(p.short) + "</p>" +
          '<div class="card-links">' +
            first +
            second +
          "</div>" +
        "</div>" +
      "</article>";
  }

  /* Task tile (home action bar + mobile menu). The glyph sits centred in
     its own chip so a row of tiles reads as one considered set. */
  function actionTile(t) {
    var external = !!t.external;
    var href = esc(t.href);
    var accent = t.id === "claim" ? " action-tile--accent" : "";
    var out = '<a class="action-tile' + accent + '" href="' + href + '"' + (external ? extAttrs() : "") + ">";
    out += '<span class="tile-chip">' + ICB.art.glyph(t.glyph) + "</span>";
    out += '<span class="tile-label">' + esc(t.label) + (external ? extNote(hostOf(t.href)) : "") + "</span>";
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
    /* A WhatsApp line is a mobile number, so it is offered as a call too. */
    (l.whatsapps || []).forEach(function (w) {
      var digits = String(w.wa).replace(/\D/g, "");
      out += '<a class="msg-action" href="tel:+' + esc(digits) + '">' + ICB.art.glyph("phone") +
        "<span>Call " + esc(w.display) + "</span></a>";
    });
    /* Only where ICB publishes no number of any kind does the Corporate
       Office stand in, clearly labelled as such. */
    if (!l.phones.length && !(l.whatsapps || []).length && l.corporateLine) {
      var co = ICB.DATA.site.corporate;
      out += '<a class="msg-action msg-action--corp" href="tel:' + esc(co.phoneTel) + '">' + ICB.art.glyph("phone") +
        "<span>Corporate Office " + esc(co.phoneDisplay) + "</span></a>";
    }
    (l.whatsapps || []).forEach(function (w) {
      out += '<a class="msg-action msg-action--wa" href="' + esc(waHref(w.wa)) + '"' + extAttrs() + ">" + ICB.art.waIcon() +
        "<span>WhatsApp" + (w.label ? " " + esc(w.label) : "") + "</span>" + extNote("wa.me") + "</a>";
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

  /* Breadcrumb. Up-navigation, not back-navigation: it always leads to
     the same place regardless of how the reader arrived, which is the
     more predictable of the two and the reason this concept carries no
     history back button of its own. Every interior page has one, so
     there is always a visible route home even where the browser's own
     chrome is hidden, as it is inside a preview frame.

     The last entry is the current page and is not a link. Lives in the
     dark page hero, hence the --dark variant. */
  function crumbs(trail) {
    var items = trail.map(function (c, i) {
      return i === trail.length - 1
        ? '<li aria-current="page">' + esc(c.label) + "</li>"
        : '<li><a href="' + esc(c.href) + '">' + esc(c.label) + "</a></li>";
    }).join("");
    return '<nav class="crumbs crumbs--dark" aria-label="Breadcrumb"><ol>' + items + "</ol></nav>";
  }

  /* An interior page one level below the homepage. */
  function crumbsHome(label) {
    return crumbs([{ label: "Home", href: "#/" }, { label: label }]);
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

  /* Every blurb here either restates ICB's own published description of a
     category or is plain navigational copy. None of them state policy
     terms, legal requirements or what a visitor should buy. */
  var QUIZ_OPTIONS = [
    { id: "home", label: "My home", glyph: "house", productId: "property",
      blurb: "Homeowners and renters are both part of ICB's published property categories." },
    { id: "vehicle", label: "My vehicle", glyph: "car", productId: "motor",
      blurb: "From personal vehicles to taxis, buses and heavy-duty equipment." },
    { id: "business", label: "My business", glyph: "briefcase", special: "business",
      blurb: "ICB publishes insurance categories for businesses across Belize." },
    { id: "boat", label: "A boat or vessel", glyph: "boat", productId: "marine",
      blurb: "Marine Hull Insurance, customizable to third party and passenger liability." },
    { id: "goods", label: "Goods in transit", glyph: "container", productId: "cargo",
      blurb: "Warehouse-to-warehouse protection for goods in transit." },
    { id: "commercial-liability", label: "Commercial liability", glyph: "scales", productId: "liability",
      blurb: "Liability and miscellaneous products arranged around specific business exposures." },
    /* Sales are suspended, so this result says so rather than presenting
       Travel Insurance as something to arrange. */
    { id: "trip", label: "My next trip", glyph: "plane", productId: "travel",
      blurb: "Sales of ICB Travel Insurance are currently temporarily suspended." },
    /* No legal assertions about driving in Mexico: ICB presents this line
       entirely through ANA Seguros. */
    { id: "mexico", label: "A drive into Mexico", glyph: "border", productId: "mexican",
      blurb: "ICB's Mexican Insurance is provided through ANA Seguros." },
    { id: "unsure", label: "I'm not sure", glyph: "question", special: "unsure",
      blurb: "No problem. The ICB team will point you in the right direction." }
  ];

  /* The note under a quote action, so a result never reads as a price. */
  function quoteNote() {
    return '<p class="quiz-note">' + esc(ICB.DATA.quoteNote) + "</p>";
  }

  function quizResult(opt) {
    var out = '<span class="eyebrow">A good place to start</span>';
    if (opt.special === "business") {
      out += "<h3>Business insurance</h3><p>" + esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/business">Explore business insurance</a>' +
        '<a class="btn btn-ghost" href="#/contact?topic=business">Request a quote</a>' +
        "</div>" + quoteNote();
    } else if (opt.special === "unsure") {
      out += "<h3>Talk it through with ICB</h3><p>" + esc(opt.blurb) +
        " Liability &amp; Miscellaneous is ICB's published category for specialty cover.</p>" +
        '<div class="btn-row">' +
        '<a class="btn btn-primary" href="#/contact?topic=new-cover">Talk to ICB</a>' +
        '<a class="btn btn-ghost" href="#/insurance/liability">Liability &amp; Miscellaneous</a>' +
        "</div>";
    } else {
      var p = ICB.DATA.productById(opt.productId);
      /* A suspended category gets the current-status route only. No
         enquiry CTA, nothing that reads as "arrange this today". */
      if (p.suspended) {
        return '<span class="eyebrow">Current status</span>' +
          "<h3>" + esc(p.name) + "</h3><p>" + esc(opt.blurb) + "</p>" +
          '<div class="btn-row">' +
          '<a class="btn btn-primary" href="' + esc(p.route) + '">View current information</a>' +
          '<a class="btn btn-ghost" href="#/contact?topic=other&category=' + esc(p.id) + '">Contact ICB</a>' +
          "</div>";
      }
      /* A quotable category leads with the quote and carries itself into
         the enquiry. Anything else keeps a plain contact route. */
      var second = p.quote === true
        ? '<a class="btn btn-primary" href="' + esc(ICB.DATA.quoteHref(p.id)) + '">Request a quote</a>'
        : '<a class="btn btn-primary" href="#/contact?topic=other&category=' + esc(p.id) + '">Contact ICB</a>';
      out += "<h3>" + esc(p.name) + "</h3><p>" + esc(opt.blurb) + "</p>" +
        '<div class="btn-row">' +
        second +
        '<a class="btn btn-ghost" href="' + esc(p.route) + '">Learn about ' + esc(p.name) + "</a>" +
        "</div>" +
        (p.quote === true ? quoteNote() : "");
    }
    return out;
  }

  function quiz(headingId) {
    var opts = QUIZ_OPTIONS.map(function (o) {
      return '<button type="button" class="quiz-option" data-quiz-option="' + o.id + '" aria-pressed="false">' +
        '<span class="tile-chip">' + ICB.art.glyph(o.glyph) + "</span>" +
        '<span class="tile-label">' + esc(o.label) + "</span></button>";
    }).join("");
    return '<div class="quiz-panel rv">' +
      '<h2 id="' + esc(headingId || "quiz-title") + '">What are you looking to protect?</h2>' +
      '<div class="quiz-grid" role="group" aria-label="Choose what you want to protect">' + opts + "</div>" +
      '<div class="quiz-result" data-quiz-result aria-live="polite"></div>' +
      "</div>";
  }

  /* The answer renders underneath the tiles. On a phone the tile grid is
     four rows tall, so the answer arrives off screen and a tap reads as
     nothing having happened. Bring it into view: below the sticky header,
     clear of the fixed quick bar, and only when it is not already
     comfortably on screen, so a second tap on a desktop does not yank the
     page around for no reason. */
  function revealResult(el) {
    var header = document.querySelector(".site-header");
    var bar = document.querySelector(".quick-bar");
    var barShown = bar && getComputedStyle(bar).display !== "none";
    var headroom = header ? header.getBoundingClientRect().height : 0;
    var floor = window.innerHeight - (barShown ? bar.getBoundingClientRect().height : 0);
    var box = el.getBoundingClientRect();
    var pad = 16;

    if (box.top >= headroom + pad && box.bottom <= floor - pad) return;

    /* Anchored by its top, so a panel taller than the space left still
       starts where the reader is looking. */
    var top = Math.max(0, (window.pageYOffset || 0) + box.top - headroom - pad);
    var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    try {
      window.scrollTo({ top: top, behavior: still ? "auto" : "smooth" });
    } catch (e) {
      window.scrollTo(0, top);   // older engines: no options object
    }
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
        // One frame, so the new panel is laid out before it is measured.
        requestAnimationFrame(function () { revealResult(result); });
      });
    });
  }

  /* Future digital assistance placeholder: a note, not a chat interface. */
  /* The interface is built to host an ICB digital assistant later. Nothing
     is shown to visitors about it, because ICB has not announced one.
     INTERNAL TODO (not client-facing): when ICB approves an assistant,
     render its entry point here. */
  function assistBadge() { return ""; }

  /* ------------------------------ Gallery ------------------------------ */

  /* One tile in the branch gallery. A tile with a photograph opens the
     lightbox. A tile without one renders a designed location plate built
     from the verified branch record, and links to that branch on the
     Locations page. Nothing is captioned with an unverified identity. */
  function branchTile(b, photoIndex) {
    var cls = "gallery-item rv" + (b.light ? " gallery-item--light" : "");
    var cap = '<figcaption>' +
        '<span class="g-name">' + esc(b.caption) + "</span>" +
        (b.sub ? '<span class="g-sub">' + esc(b.sub) + "</span>" : "") +
      "</figcaption>";

    if (b.src) {
      return '<figure class="' + cls + '">' +
        '<button type="button" class="g-open" data-lightbox="' + photoIndex + '" aria-label="View larger: ' + esc(b.caption) + '">' +
          '<img data-asset="' + esc(b.src) + '" alt="' + esc(b.alt) + '" loading="lazy">' +
        "</button>" + cap +
      "</figure>";
    }

    /* The plate carries the identity itself, so it needs no caption bar. */
    return '<figure class="' + cls + ' gallery-item--plate">' +
      '<a class="g-open g-plate" href="#/locations" aria-label="' + esc(b.caption) + ', see it on the Locations page">' +
        '<span class="g-plate-inner">' +
          '<span class="g-plate-mark">' + ICB.art.glyph("marker") + "</span>" +
          '<span class="g-plate-name">' + esc(b.caption) + "</span>" +
          (b.sub ? '<span class="g-plate-type">' + esc(b.sub) + "</span>" : "") +
        "</span>" +
      "</a>" +
    "</figure>";
  }

  /* Branch gallery grid. limit trims it for the homepage teaser. */
  function branchGallery(limit) {
    var all = ICB.DATA.galleryBranches();
    var list = limit ? all.slice(0, limit) : all;
    var photoIndex = -1;
    return list.map(function (b) {
      if (b.src) photoIndex += 1;
      return branchTile(b, photoIndex);
    }).join("");
  }

  /* ICB in Motion: the ICB films, each a real player with sound.
     Click to play; nothing downloads until the visitor asks for it. */
  function filmCard(f, i) {
    return '' +
      '<figure class="film rv" data-film lang="' + esc(f.lang) + '">' +
        '<div class="film-frame">' +
          '<img class="film-poster" data-asset="' + esc(f.poster) + '" alt="" loading="lazy">' +
          '<video class="film-video" data-asset-defer data-asset="' + esc(f.src) + '" data-asset-poster="' + esc(f.poster) + '"' +
            ' preload="none" playsinline controls hidden' +
            ' aria-label="' + esc(f.altTitle || f.title) + '"></video>' +
          '<button type="button" class="play-btn" data-film-play' +
            ' aria-label="Play ' + esc(f.altTitle || f.title) + ', with sound">' +
            ICB.art.glyph("play") +
          "</button>" +
          '<p class="video-note" data-film-note hidden>This film could not be played in this browser.</p>' +
          '<span class="film-lang" aria-hidden="true">' + esc(f.langLabel) + "</span>" +
        "</div>" +
        '<figcaption class="film-cap">' +
          '<span class="eyebrow">' + esc(f.kicker) + "</span>" +
          "<h3>" + esc(f.title) + "</h3>" +
          "<p>" + esc(f.blurb) + "</p>" +
        "</figcaption>" +
      "</figure>";
  }

  function motionSection(opts) {
    opts = opts || {};
    var films = ICB.DATA.gallery.video.films;
    return '' +
      '<section class="section' + (opts.tint ? " section--tint" : "") + '" aria-labelledby="motion-title">' +
        '<div class="shell">' +
          sectionHead({
            eyebrow: "ICB in Motion",
            title: opts.title || "The ICB films.",
            sub: opts.sub || null,
            id: "motion-title"
          }) +
          '<div class="film-grid">' + films.map(filmCard).join("") + "</div>" +
        "</div>" +
      "</section>";
  }

  ICB.render = {
    esc: esc,
    waHref: waHref,
    branchGallery: branchGallery,
    motionSection: motionSection,
    crumbs: crumbs,
    crumbsHome: crumbsHome,
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
