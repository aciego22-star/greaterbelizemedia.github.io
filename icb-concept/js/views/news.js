/* ============================================================================
   What's New at ICB — the listing.

   One card per entry, newest first, built from ICB.DATA.news. The card
   carries the thing a reader decides on: what it is, when it happened
   and the approved one-sentence excerpt. Nothing on a card is written
   here; every string comes from the copy ICB supplied.

   The article itself lives at /news/<id>, a real page with its own
   title, its own canonical and its own hreflang pair, the same as every
   other page on this site. A section whose articles were only panels
   that opened on this page would be one URL pretending to be four, and
   nothing in it could be linked to, shared or found.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* The meta line over a card or an article: category, then the date of
     the thing itself where there is one. An entry with no date of its
     own shows its category alone rather than a date invented for it. */
  /* cls is the BASE class and the prefix its children are named from,
     so it stays a single word. A caller that wants a variant passes it
     as extra, which goes on the paragraph alone: putting it in cls
     would rename every child along with it. */
  function metaLine(e, cls, extra) {
    var R = ICB.render, esc = R.esc;
    var bits = ['<span class="' + cls + '-cat">' + esc(ICB.t(e.category)) + "</span>"];
    if (e.dated) {
      bits.push('<span class="' + cls + '-when"><span class="' + cls + '-when-label">' +
        esc(ICB.t(e.dated.label)) + "</span> " +
        '<time datetime="' + esc(e.dated.iso) + '">' + esc(ICB.t(e.dated.text)) + "</time></span>");
    }
    return '<p class="' + cls + (extra ? " " + extra : "") + '">' + bits.join("") + "</p>";
  }

  function card(e) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    var href = "#/news/" + e.id;
    return '' +
      '<article class="news-card rv">' +
        '<a class="news-card-shot" href="' + esc(href) + '" tabindex="-1" aria-hidden="true">' +
          '<img data-asset="' + esc(e.hero.wide) + '" alt=""' +
            ' width="' + e.hero.wideW + '" height="' + e.hero.wideH + '" loading="lazy">' +
        "</a>" +
        '<div class="news-card-body">' +
          metaLine(e, "news-meta") +
          '<h2 class="news-card-title"><a href="' + esc(href) + '">' + esc(ICB.t(e.title)) + "</a></h2>" +
          "<p>" + esc(ICB.t(e.excerpt)) + "</p>" +
          '<p class="news-card-more" aria-hidden="true">' + esc(T("Read more", "Leer más")) + "</p>" +
        "</div>" +
      "</article>";
  }

  ICB.views.news = {
    title: {
      en: "What's New at ICB | Insurance Corporation of Belize",
      es: "Novedades de ICB | Insurance Corporation of Belize"
    },
    render: function () {
      var R = ICB.render, T = ICB.T, esc = R.esc;
      var entries = ICB.DATA.newsEntries();
      var lead = T(
        "News from the Insurance Corporation of Belize, and the changes to our service that are worth knowing about.",
        "Noticias de Insurance Corporation of Belize y los cambios en nuestro servicio que conviene conocer."
      );

      return '' +
        /* data-seo-description hands the build the description ICB
           wrote for this page, in place of the opening line it would
           otherwise trim to length. */
        '<section class="page-hero on-dark" aria-labelledby="news-title"' +
          ' data-seo-description="' + esc(lead) + '">' +
          /* ICB's signage, supplied 8 Nov 2026 for this hero. */
          '<div class="page-hero-art art-panel" data-img-slot="news-hero" aria-hidden="true">' +
            ICB.art.panel("heritage") + "</div>" +
          '<div class="shell">' +
            /* Crumbs inside page-hero-inner, not beside it: the art
               panel covers the whole hero and page-hero-inner is the
               element that sits above it, so a sibling of it paints
               underneath the photograph and is simply not there. */
            '<div class="page-hero-inner">' +
              R.crumbsHome(ICB.DATA.news.section) +
              '<span class="eyebrow">' + esc(ICB.t(ICB.DATA.news.section)) + "</span>" +
              '<h1 id="news-title">' + esc(T("What's new at ICB.", "Novedades de ICB.")) + "</h1>" +
              '<p class="hero-lead">' + esc(lead) + "</p>" +
            "</div>" +
          "</div>" +
        "</section>" +

        /* Not flush-top. The first card's picture is full width on a
           narrow screen, and with the padding removed it butted
           straight into the black hero with no air at all. */
        '<section class="section" aria-label="' +
          esc(T("Latest from ICB", "Lo más reciente de ICB")) + '">' +
          '<div class="shell shell--narrow">' +
            '<div class="news-list">' + entries.map(card).join("") + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + esc(T("Visit ICB", "Visite ICB")) + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Talk to ICB", es: "Hable con ICB" },
              title: { en: "Questions about any of this?", es: "¿Preguntas sobre algo de esto?" },
              body: {
                en: "Your branch can answer them, and so can the team at the Corporate Office.",
                es: "Su sucursal puede responderlas, y también el equipo de la Oficina Corporativa."
              },
              actions: [
                { label: { en: "Find your branch", es: "Buscar su sucursal" }, href: "#/locations" },
                { label: { en: "Contact ICB", es: "Contactar a ICB" }, href: "#/contact" }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };

  /* Shared with the article page, which draws the same meta line and
     the same cards under "More from ICB". Kept off ICB.views so the
     view object stays a view and nothing else, and so the build's route
     enumeration, which reads the keys of ICB.views, sees only views. */
  ICB.newsUI = { metaLine: metaLine, card: card };
})();
