/* ============================================================================
   One What's New article, at /news/<id>.

   The hero is art direction rather than a responsive size: ICB composed
   a wide frame and a tall one separately, and a phone is given the one
   that was made for a phone instead of a crop of the other. Neither is
   cropped by the page. The picture keeps its own shape and the box is
   whatever shape the picture is, which is why there is no aspect-ratio
   box here and why both files carry their width and height, so the
   space is reserved before the bytes arrive and nothing jumps.

   The caption is a caption and the alt text is alt text; they say
   different things on purpose. The alt describes the picture for
   someone who cannot see it, the caption credits it and says where it
   was taken, and a screen reader is given both exactly once.

   Every article ends with its sources. ICB's news page states figures,
   dates and a legal requirement, and a reader should be able to see
   where each came from without taking our word for it.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  function hero(e) {
    var R = ICB.render, esc = R.esc;
    var alt = esc(ICB.t(e.hero.alt));
    return '' +
      '<figure class="news-hero">' +
        "<picture>" +
          '<source media="(min-width: 769px)" data-asset-srcset="' + esc(e.hero.wide) + '"' +
            ' width="' + e.hero.wideW + '" height="' + e.hero.wideH + '">' +
          '<img data-asset="' + esc(e.hero.tall) + '" alt="' + alt + '"' +
            ' width="' + e.hero.tallW + '" height="' + e.hero.tallH + '">' +
        "</picture>" +
        '<figcaption>' + esc(ICB.t(e.hero.caption)) + "</figcaption>" +
      "</figure>";
  }

  function block(b) {
    var R = ICB.render, esc = R.esc;
    if (b.type === "h") return "<h2>" + esc(ICB.t(b.text)) + "</h2>";
    if (b.type === "p") return "<p>" + esc(ICB.t(b.text)) + "</p>";
    if (b.type === "actions") {
      return '<p class="btn-row news-actions">' + b.items.map(function (a, i) {
        var item = a.wa ? { label: a.label, href: R.waHref(a.wa), external: true } : a;
        return R.action(item, "btn btn-sm " + (i === 0 ? "btn-primary" : "btn-outline"));
      }).join("") + "</p>";
    }
    return "";
  }

  /* Where each claim came from. An internal route is shown as an
     ordinary site link rather than dressed up as a citation. */
  function sources(e) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    if (!e.sources || !e.sources.length) return "";
    return '' +
      '<section class="news-sources" aria-labelledby="news-sources-title">' +
        '<h2 id="news-sources-title">' + esc(T("Sources", "Fuentes")) + "</h2>" +
        "<ul>" + e.sources.map(function (s) {
          var label = esc(ICB.t(s.label));
          var head = s.href
            ? R.action({ label: ICB.t(s.label), href: s.href }, "news-source-link")
            : "<span>" + label + "</span>";
          return "<li>" + head +
            (s.note ? '<span class="news-source-note">' + esc(ICB.t(s.note)) + "</span>" : "") +
            "</li>";
        }).join("") + "</ul>" +
      "</section>";
  }

  function alsoRead(current) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    var rest = ICB.DATA.newsEntries().filter(function (x) { return x.id !== current.id; });
    if (!rest.length) return "";
    return '' +
      '<section class="section section--tint" aria-labelledby="news-more-title">' +
        '<div class="shell shell--narrow">' +
          R.sectionHead({
            eyebrow: ICB.DATA.news.section,
            title: { en: "More from ICB.", es: "Más de ICB." },
            id: "news-more-title"
          }) +
          '<div class="news-list news-list--compact">' +
            rest.map(ICB.newsUI.card).join("") +
          "</div>" +
          '<p class="faq-more"><a class="btn btn-outline btn-sm" href="#/news">' +
            esc(T("See everything", "Ver todo")) + "</a></p>" +
        "</div>" +
      "</section>";
  }

  ICB.views.newsEntry = {
    title: function (ctx) {
      var e = ICB.DATA.newsById(ctx.newsId);
      if (!e) return ICB.views.news.title;
      var t = ICB.t(e.seoTitle || e.title);
      return t + " | Insurance Corporation of Belize";
    },
    render: function (ctx) {
      var R = ICB.render, T = ICB.T, esc = R.esc;
      var e = ICB.DATA.newsById(ctx.newsId);
      if (!e) return ICB.views.notfound.render(ctx);

      var meta = [ICB.newsUI.metaLine(e, "news-meta", "news-meta--article")];
      if (e.venue) {
        meta.push('<p class="news-venue"><span class="news-venue-label">' +
          esc(ICB.t(e.venue.label)) + "</span> " + esc(ICB.t(e.venue.text)) + "</p>");
      }

      return '' +
        '<section class="page-hero page-hero--article on-dark" aria-labelledby="news-article-title"' +
          ' data-seo-description="' + esc(ICB.t(e.seoDescription)) + '">' +
          '<div class="shell shell--narrow">' +
            R.crumbs([
              { label: ICB.s("home"), href: "#/" },
              { label: ICB.t(ICB.DATA.news.section), href: "#/news" },
              { label: ICB.t(e.title) }
            ]) +
            '<div class="page-hero-inner">' +
              '<h1 id="news-article-title">' + esc(ICB.t(e.title)) + "</h1>" +
              meta.join("") +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' +
          esc(T("Article", "Artículo")) + '">' +
          '<div class="shell shell--narrow">' +
            hero(e) +
            '<div class="news-body">' + e.body.map(block).join("") + "</div>" +
            sources(e) +
            /* The publication line exists to keep two different dates
               apart: the day of the thing, at the top, and the day the
               article went up, here. Where they are the same date the
               line says nothing the dateline has not already said, so
               it is left off rather than printed twice. */
            (e.dated && e.dated.iso === e.published ? "" :
              '<p class="news-published">' +
                esc(T("Published on this site on ", "Publicado en este sitio el ")) +
                '<time datetime="' + esc(e.published) + '">' + esc(R.longDate(e.published)) + "</time>" +
              "</p>") +
          "</div>" +
        "</section>" +

        alsoRead(e);
    }
  };
})();
