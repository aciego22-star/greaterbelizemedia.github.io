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
    return ' target="_blank" rel="noopener"';
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
            '<button type="button" data-ask-launcher data-ask-prefill="Tell me about ' + esc(p.name) + '.">Ask about this coverage</button>' +
          "</div>" +
        "</div>" +
      "</article>";
  }

  /* Task tile (home action bar + mobile menu). */
  function actionTile(t) {
    var external = !!t.external;
    var href = esc(t.href);
    var out = '<a class="action-tile" href="' + href + '"' + (external ? extAttrs() : "") + ">";
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
          '<button type="button" class="btn btn-ghost btn-sm" data-ask-launcher data-ask-prefill="I need help with a ' + esc(c.name.toLowerCase()) + '.">Ask ICB</button>' +
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
    if (l.whatsapp) {
      out += '<a class="msg-action" href="https://wa.me/' + esc(l.whatsapp.wa) + '"' + extAttrs() + ">" + ICB.art.glyph("whatsapp") +
        "<span>WhatsApp " + esc(l.whatsapp.display) + "</span>" + extNote("wa.me") + "</a>";
    }
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
    if (opts.rule !== false) out += '<hr class="gold-rule" aria-hidden="true">';
    return out + "</div>";
  }

  /* Full-width navy CTA band. */
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

  ICB.render = {
    esc: esc,
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
    band: band
  };
})();
