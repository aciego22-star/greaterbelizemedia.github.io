/* ============================================================================
   One consumer resource, at /resources/<id>.

   ICB publishes this material as two PDF downloads and a page of loose
   bullets. A four megabyte brochure is a poor way to tell somebody what
   to do while a storm is coming: it has to be downloaded first, it does
   not reflow on a phone, it cannot be searched, a screen reader makes
   hard work of it, and none of it is in Spanish. So the content is set
   out as pages here, and ICB's original PDFs are offered beside them,
   unmodified, for anyone who wants the printable brochure.

   The blocks come from ICB.DATA.guides. The vocabulary is deliberately
   small, because this is reference material rather than a layout
   exercise: headings, paragraphs, two kinds of list, a two-column table
   for the figures, and a question with its answer.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  function block(b) {
    var R = ICB.render, esc = R.esc, t = ICB.t;
    if (b.type === "h") return "<h2>" + esc(t(b.text)) + "</h2>";
    if (b.type === "p") return "<p>" + esc(t(b.text)) + "</p>";
    if (b.type === "note") return '<p class="guide-note">' + esc(t(b.text)) + "</p>";
    if (b.type === "list" || b.type === "steps") {
      var tag = b.type === "steps" ? "ol" : "ul";
      return "<" + tag + ' class="guide-list">' + b.items.map(function (i) {
        return "<li>" + esc(t(i)) + "</li>";
      }).join("") + "</" + tag + ">";
    }
    if (b.type === "pairs") {
      /* A real table, because these are pairs of fact and figure and a
         screen reader should be able to say which is which. */
      return '<div class="guide-table-wrap"><table class="guide-table"><tbody>' +
        b.rows.map(function (r) {
          return '<tr><th scope="row">' + esc(t(r.k)) + "</th><td>" + esc(t(r.v)) + "</td></tr>";
        }).join("") + "</tbody></table></div>";
    }
    if (b.type === "qa") {
      return '<div class="guide-qa"><h3>' + esc(t(b.q)) + "</h3><p>" + esc(t(b.a)) + "</p></div>";
    }
    return "";
  }

  /* ICB's own file, downloaded rather than opened: somebody reaching for
     the hurricane brochure wants it on the device before the power goes.
     data-asset-href so the single-file preview hands over its bundled
     copy instead of asking the network for one. */
  function download(g) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    if (!g.doc) return "";
    return '' +
      '<div class="guide-doc">' +
        '<a class="btn btn-primary btn-sm" data-asset-href="' + esc(g.doc.file) + '"' +
          ' href="' + esc(g.doc.file) + '" download>' +
          ICB.art.glyph("download") + "<span>" +
          esc(T("Download ", "Descargar ") + ICB.t(g.doc.label)) + "</span></a>" +
        '<span class="guide-doc-meta">' + esc(ICB.t(g.doc.meta)) + "</span>" +
      "</div>";
  }

  function alsoRead(current) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    var rest = ICB.DATA.guides.entries.filter(function (x) { return x.id !== current.id; });
    if (!rest.length) return "";
    return '' +
      '<section class="section section--tint" aria-labelledby="guide-more-title">' +
        '<div class="shell shell--narrow">' +
          R.sectionHead({
            eyebrow: ICB.DATA.guides.section,
            title: { en: "More from ICB.", es: "Más de ICB." },
            id: "guide-more-title"
          }) +
          '<div class="official-grid">' +
            rest.map(function (g) {
              return '<a class="official-card rv" href="#/resources/' + esc(g.id) + '">' +
                '<span class="official-glyph">' + ICB.art.glyph(g.glyph) + "</span>" +
                "<strong>" + esc(ICB.t(g.nav)) + "</strong>" +
                "<span>" + esc(ICB.t(g.lead)) + "</span>" +
              "</a>";
            }).join("") +
          "</div>" +
          '<p class="faq-more"><a class="btn btn-outline btn-sm" href="#/resources">' +
            esc(T("All resources", "Todos los recursos")) + "</a></p>" +
        "</div>" +
      "</section>";
  }

  ICB.views.guide = {
    title: function (ctx) {
      var g = ICB.DATA.guideById(ctx.guideId);
      if (!g) return ICB.views.resources.title;
      return ICB.t(g.nav) + " | Insurance Corporation of Belize";
    },
    render: function (ctx) {
      var R = ICB.render, esc = R.esc, T = ICB.T;
      var g = ICB.DATA.guideById(ctx.guideId);
      if (!g) return ICB.views.notfound.render(ctx);

      return '' +
        '<section class="page-hero page-hero--article on-dark" aria-labelledby="guide-title"' +
          ' data-seo-description="' + esc(ICB.t(g.seoDescription)) + '">' +
          '<div class="shell shell--narrow">' +
            R.crumbs([
              { label: ICB.s("home"), href: "#/" },
              { label: ICB.t(ICB.DATA.guides.section), href: "#/resources" },
              { label: ICB.t(g.nav) }
            ]) +
            '<div class="page-hero-inner">' +
              '<h1 id="guide-title">' + esc(ICB.t(g.title)) + "</h1>" +
              '<p class="hero-lead">' + esc(ICB.t(g.lead)) + "</p>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' +
          esc(T("Guide", "Guía")) + '">' +
          '<div class="shell shell--narrow">' +
            download(g) +
            (g.intro ? '<p class="guide-intro">' + esc(ICB.t(g.intro)) + "</p>" : "") +
            '<div class="guide-body">' + g.blocks.map(block).join("") + "</div>" +
            '<p class="guide-source">' +
              esc(T("This is ICB's own published material, set out for the web.",
                    "Este es el material publicado por ICB, presentado para la web.")) +
            "</p>" +
          "</div>" +
        "</section>" +

        alsoRead(g);
    }
  };
})();
