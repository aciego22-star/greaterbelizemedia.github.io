/* ============================================================================
   Product detail view — one renderer for every published category.

   Someone who clicks "Learn more" has asked to understand the product, so
   the page answers five questions in order before it asks for anything:

     1 what is this insurance?          intro
     2 what can it help protect?        whyInsure / coverageOptions
     3 what options does ICB publish?   coverageOptions, covers, availableFor
     4 who may find it relevant?        forWho
     5 what should I do next?           the quote band

   Sections are driven entirely by what a product carries in
   js/data/products.js, so a sparse category renders a short page rather
   than a page full of empty headings.

   Three categories behave differently, and the renderer respects that:
   - suspended (Travel): no quote action anywhere on the page.
   - anaPathways (Mexican): ICB directs people to ANA Seguros, so the page
     leads with those pathways rather than an ICB quote.
   - quote: true: calls to action read "Request a quote" and carry the
     category into the enquiry flow. It is a request, not a quotation:
     nothing is priced, approved or bound here, and the note under every
     such action says so.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  function labelledList(label, items, R) {
    if (!items || !items.length) return "";
    var li = items.map(function (c) {
      return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + R.esc(c) + "</span></li>";
    }).join("");
    return '<h3 class="prod-list-label">' + R.esc(label) + "</h3>" +
      '<ul class="values-list prod-covers">' + li + "</ul>";
  }

  /* Short lead-in block: a heading and a paragraph or two at a readable
     measure. Used for intro and whyInsure. */
  function proseBlock(block, R, opts) {
    if (!block) return "";
    opts = opts || {};
    var paras = (block.body || []).map(function (p) {
      return "<p>" + R.esc(p) + "</p>";
    }).join("");
    return '<section class="section' + (opts.tint ? " section--tint" : "") +
        (opts.flush ? " section--flush-top" : "") + '" aria-labelledby="' + R.esc(opts.id) + '">' +
      '<div class="shell">' +
        '<div class="prod-prose rv">' +
          "<h2 id=\"" + R.esc(opts.id) + '">' + R.esc(block.title) + "</h2>" +
          paras +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* One coverage option. Carries whatever ICB publishes for it and nothing
     else: a blurb, a set of limits, a set of protection levels, a flag. */
  function coverageCard(item, R) {
    var out = '<article class="cov-card rv">';
    out += '<div class="cov-head">';
    out += "<h3>" + R.esc(item.name) + "</h3>";
    if (item.tag) out += '<span class="cov-tag">' + R.esc(item.tag) + "</span>";
    out += "</div>";
    if (item.blurb) out += '<p class="cov-blurb">' + R.esc(item.blurb) + "</p>";

    if (item.limits && item.limits.length) {
      out += '<dl class="cov-limits">' + item.limits.map(function (l) {
        return "<div><dt>" + R.esc(l.label) + "</dt><dd>" + R.esc(l.value) + "</dd></div>";
      }).join("") + "</dl>";
    }

    if (item.levels && item.levels.length) {
      out += '<ul class="cov-levels">' + item.levels.map(function (l) {
        return "<li><span>" + R.esc(l.name) + "</span><strong>" + R.esc(l.value) + "</strong></li>";
      }).join("") + "</ul>";
    }

    if (item.flag) {
      out += '<p class="cov-flag">' + ICB.art.glyph("check") + "<span>" + R.esc(item.flag) + "</span></p>";
    }
    if (item.note) out += '<p class="cov-note">' + R.esc(item.note) + "</p>";
    return out + "</article>";
  }

  function coverageSection(block, R) {
    if (!block || !block.items || !block.items.length) return "";
    var after = (block.after || []).map(function (p) {
      return "<p>" + R.esc(p) + "</p>";
    }).join("");
    return '<section class="section section--tint" aria-labelledby="cov-title">' +
      '<div class="shell">' +
        R.sectionHead({ eyebrow: ICB.s("coverageOptions"), title: block.title, sub: block.sub || null, id: "cov-title" }) +
        '<div class="cov-grid">' + block.items.map(function (i) { return coverageCard(i, R); }).join("") + "</div>" +
        (after ? '<div class="prod-prose prod-prose--after rv">' + after + "</div>" : "") +
      "</div>" +
    "</section>";
  }

  /* Who is this for. A short line plus a checked list reads faster than a
     paragraph, and stacks well on a phone. */
  function forWhoSection(block, R) {
    if (!block) return "";
    var items = (block.items || []).map(function (t) {
      return '<li class="rv">' + ICB.art.glyph("check") + "<span>" + R.esc(t) + "</span></li>";
    }).join("");
    return '<section class="section section--flush-top" aria-labelledby="who-for-title">' +
      '<div class="shell">' +
        '<div class="prod-who">' +
          '<div class="rv">' +
            '<span class="eyebrow">' + ICB.s("relevance") + "</span>" +
            '<h2 id="who-for-title">' + R.esc(block.title) + "</h2>" +
            (block.body ? "<p>" + R.esc(block.body) + "</p>" : "") +
          "</div>" +
          (items ? '<ul class="values-list prod-who-list">' + items + "</ul>" : "") +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* Named extensions, or partner facts. Same shape: a titled panel with a
     qualifying sub-line and a plain list. */
  function panelSection(block, R, id, glyph) {
    if (!block || !block.items || !block.items.length) return "";
    return '<section class="section section--flush-top" aria-labelledby="' + id + '">' +
      '<div class="shell">' +
        '<div class="prod-panel rv">' +
          '<div class="prod-panel-head">' +
            '<span class="prod-panel-mark">' + ICB.art.glyph(glyph) + "</span>" +
            "<div><h2 id=\"" + id + '">' + R.esc(block.title) + "</h2>" +
            (block.sub ? "<p>" + R.esc(block.sub) + "</p>" : "") +
            (block.attribution ? '<p class="prod-panel-attr">' + R.esc(block.attribution) + "</p>" : "") +
            "</div>" +
          "</div>" +
          '<ul class="prod-panel-list">' + block.items.map(function (t) {
            return "<li>" + ICB.art.glyph("check") + "<span>" + R.esc(t) + "</span></li>";
          }).join("") + "</ul>" +
        "</div>" +
      "</div>" +
    "</section>";
  }

  /* A short useful-to-know block, e.g. property valuation. */
  function usefulSection(block, R) {
    if (!block) return "";
    return '<section class="section section--flush-top" aria-labelledby="useful-title">' +
      '<div class="shell">' +
        '<div class="prod-useful rv">' +
          '<span class="prod-useful-mark">' + ICB.art.glyph("shield") + "</span>" +
          "<div>" +
            '<h2 id="useful-title">' + R.esc(block.title) + "</h2>" +
            (block.body || []).map(function (p) { return "<p>" + R.esc(p) + "</p>"; }).join("") +
          "</div>" +
        "</div>" +
      "</div>" +
    "</section>";
  }

  ICB.views.product = {
    title: function (ctx) {
      var p = ICB.DATA.productById(ctx.productId);
      return (p ? p.name : ICB.t({ en: "Insurance", es: "Seguros" })) + " | ICB";
    },
    render: function (ctx) {
      var R = ICB.render;
      var site = ICB.DATA.site;
      var p = ICB.DATA.productById(ctx.productId);
      if (!p) return ICB.views.notfound.render();

      var suspended = !!p.suspended;
      var quotable = p.quote === true;
      var anaUrl = site.external.mexicanInsurance;
      var quoteHref = ICB.DATA.quoteHref(p.id);

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
        claims = '<div class="prod-claims rv"><h3>' + R.esc(ICB.s("ifSomethingHappens")) + "</h3>" +
          "<p>" + R.esc(ICB.s("claimFormsNote")) + "</p>" +
          '<div class="msg-actions">' + claims + "</div></div>";
      }

      var related = p.related.map(function (rid) {
        var rp = ICB.DATA.productById(rid);
        return rp ? R.productCard(rp) : "";
      }).join("");

      var statusNote = p.status
        ? '<div class="notice rv"><p><strong>' + R.esc(ICB.s("pleaseNote")) + "</strong> " + R.esc(p.status.text) + "</p></div>"
        : "";

      /* ANA Seguros pathways, exactly as ICB presents them. */
      var ana = "";
      if (p.anaPathways && p.anaPathways.length) {
        var btns = p.anaPathways.map(function (a, i) {
          return '<a class="btn btn-sm ' + (i === 0 ? "btn-primary" : "btn-ghost") + '" href="' +
            R.esc(anaUrl) + '" target="_blank" rel="noopener noreferrer">' + R.esc(a.label) + "</a>";
        }).join("");
        ana = '<div class="ana-block rv">' +
          "<h3>" + R.esc(ICB.s("throughANA")) + "</h3>" +
          '<div class="btn-row">' + btns + "</div>" +
          '<p class="pathway-note">' + R.esc(ICB.s("anaNote")) + "</p>" +
        "</div>";
      }

      /* Hero actions. */
      var heroActions;
      if (suspended) {
        heroActions =
          '<a class="btn btn-gold" href="#/contact?topic=other&category=' + R.esc(p.id) + '">' + R.esc(ICB.s("contactICB")) + "</a>" +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + R.esc(ICB.s("callN", { n: site.corporate.phoneDisplay })) + "</a>";
      } else if (ana) {
        heroActions =
          '<a class="btn btn-gold" href="' + R.esc(anaUrl) + '" target="_blank" rel="noopener noreferrer">' + R.esc(ICB.s("buyNow")) + "</a>" +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + R.esc(ICB.s("callN", { n: site.corporate.phoneDisplay })) + "</a>";
      } else {
        heroActions =
          '<a class="btn btn-gold" href="' + R.esc(quoteHref) + '">' + R.esc(ICB.s("requestQuote")) + "</a>" +
          '<a class="btn btn-light" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + R.esc(ICB.s("callN", { n: site.corporate.phoneDisplay })) + "</a>";
      }

      /* Next-step band. */
      var bandActions = [];
      if (quotable) bandActions.push({ label: ICB.s("requestQuote"), href: quoteHref });
      if (ana) bandActions.push({ label: ICB.s("goToANA"), href: anaUrl, external: true });
      if (suspended) bandActions.push({ label: ICB.s("contactICB"), href: "#/contact?topic=other&category=" + p.id });
      if (!quotable && !ana && !suspended) bandActions.push({ label: ICB.s("contactICB"), href: "#/contact?topic=other&category=" + p.id });
      bandActions.push({ label: ICB.s("callN", { n: site.corporate.phoneDisplay }), href: "tel:" + site.corporate.phoneTel });
      bandActions.push({ label: ICB.s("visitABranch"), href: "#/locations" });

      /* ICB's product names stay in English inside a Spanish sentence,
         so the sentence is a slotted string rather than a translation of
         the whole line. */
      var bandTitle = suspended
        ? ICB.s("contactAboutProduct", { product: p.name })
        : quotable
          ? ICB.s("readyToTalk", { product: p.name })
          : ICB.s("talkAboutProduct", { product: p.name });
      var bandBody = suspended
        ? ICB.s("suspendedBandBody")
        : quotable
          ? ICB.DATA.quoteNote
          : ICB.s("plainBandBody");

      var whoHeading = ICB.s(suspended ? "currentStatus" : "whatICBPublishes");
      /* Nothing to list means no reason for a two-column grid. */
      var single = !p.covers.length && !p.availableFor && !ana;

      /* The published-lists block only earns its section if it has lists,
         a status note, or something in the aside worth showing. */
      var hasLists = !!(p.covers.length || p.availableFor || ana || p.audience || statusNote);

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="prod-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="product-' + R.esc(p.id) + '" aria-hidden="true">' + ICB.art.panel(p.artMotif) + "</div>" +
          '<div class="shell page-hero-inner">' +
            /* Two levels down, so the trail carries both rungs. */
            R.crumbs([
              { label: ICB.s("home"), href: "#/" },
              { label: { en: "Insurance", es: "Seguros" }, href: "#/insurance" },
              { label: p.name }
            ]) +
            '<span class="eyebrow">' + R.esc(p.kicker) + "</span>" +
            '<h1 id="prod-title">' + R.esc(p.name) + "</h1>" +
            '<p class="hero-lead">' + R.esc(p.standfirst) + "</p>" +
            '<div class="btn-row">' + heroActions + "</div>" +
            (quotable ? '<p class="hero-note">' + R.esc(ICB.DATA.quoteNote) + "</p>" : "") +
          "</div>" +
        "</section>" +

        proseBlock(p.intro, R, { id: "intro-title" }) +
        proseBlock(p.whyInsure, R, { id: "why-title", flush: true }) +
        coverageSection(p.coverageOptions, R) +
        panelSection(p.extensions, R, "ext-title", "shield") +
        panelSection(p.partner, R, "partner-title", "border") +

        (hasLists
          ? '<section class="section section--flush-top" aria-labelledby="who-title">' +
            '<div class="shell prod-grid' + (single ? " prod-grid--single" : "") + '">' +
              "<div>" +
                '<h2 id="who-title">' + R.esc(whoHeading) + "</h2>" +
                statusNote +
                (p.audience ? "<p>" + R.esc(p.audience) + "</p>" : "") +
                labelledList(p.coversLabel || ICB.s("whatICBOffers"), p.covers, R) +
                labelledList(ICB.s("availableFor"), p.availableFor, R) +
                ana +
              "</div>" +
              '<aside class="prod-side rv">' +
                "<h3>" + R.esc(ICB.s("goodToKnow")) + "</h3>" +
                '<ul class="gtk-list">' + gtk + "</ul>" +
                claims +
                (p.campaign
                  ? '<figure class="campaign-inset"><img data-asset="' + R.esc(p.campaign.src) + '" alt="' + R.esc(p.campaign.alt) + '" loading="lazy">' +
                    '<figcaption>' + R.esc(ICB.s("campaignCaption")) + "</figcaption></figure>"
                  : "") +
              "</aside>" +
            "</div>" +
          "</section>"
          : "") +

        forWhoSection(p.forWho, R) +
        usefulSection(p.useful, R) +

        '<section class="section section--flush-top" aria-label="' + T("Next steps", "Siguientes pasos") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: ICB.s("nextStepEyebrow"),
              title: bandTitle,
              body: bandBody,
              motif: "heritage",
              actions: bandActions
            }) +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="rel-title">' +
          '<div class="shell">' +
            /* A neutral signpost. ICB does not publish guidance on which
               categories are bought together, so the concept does not
               suggest combinations. */
            R.sectionHead({ eyebrow: ICB.s("relatedEyebrow"), title: ICB.s("relatedTitle"), id: "rel-title" }) +
            '<div class="card-grid card-grid--pair">' + related + "</div>" +
          "</div>" +
        "</section>";
    }
  };
})();
