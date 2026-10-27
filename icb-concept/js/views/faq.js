/* ============================================================================
   FAQ view — every question ICB answers, in one place.

   This page is the complete set. The short blocks on the claims,
   payments, product and other pages are a handful of the same questions
   shown beside the thing they are about, and each one links back here.
   Holding one copy of the content and rendering it twice is what keeps
   the two from drifting apart.

   It is also the page that carries the FAQPage structured data, which
   is what lets a question appear directly in a search result or in an
   assistant's answer. Declaring the same question from two pages is
   worse than declaring it from one, so only this page declares it.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  function build() {
    var R = ICB.render, T = ICB.T, esc = R.esc;
    var data = ICB.DATA.faq;
    var total = ICB.DATA.faqAll().length;

    var nav = '<nav class="faq-nav" aria-label="' + esc(T("Sections", "Secciones")) + '">' +
      data.sections.map(function (s) {
        return '<a href="#/faq@' + esc(s.id) + '">' + esc(ICB.t(s.title)) +
          ' <span class="faq-count">' + s.qa.length + "</span></a>";
      }).join("") + "</nav>";

    var body = data.sections.map(function (s) {
      return '<section class="section faq-section" data-anchor="' + esc(s.id) +
          '" aria-labelledby="faq-' + esc(s.id) + '">' +
          '<div class="shell shell--narrow">' +
            R.sectionHead({
              eyebrow: ICB.s("faqEyebrow"),
              title: s.title,
              sub: s.lead,
              id: "faq-" + s.id
            }) +
            '<div class="faq-list">' +
              s.qa.map(function (q) { return R.faqItem(q); }).join("") +
            "</div>" +
          "</div>" +
        "</section>";
    }).join("");

    return '' +
      '<section class="page-hero on-dark" aria-labelledby="faq-title">' +
        '<div class="shell">' +
          R.crumbsHome({ en: "Questions and answers", es: "Preguntas y respuestas" }) +
          '<div class="page-hero-inner">' +
            '<span class="eyebrow">' + esc(ICB.s("faqEyebrow")) + "</span>" +
            '<h1 id="faq-title">' + esc(T("Questions ICB is asked.",
                                          "Preguntas que le hacen a ICB.")) + "</h1>" +
            '<p class="hero-lead">' + esc(ICB.s("faqLead", { n: total })) + "</p>" +
          "</div>" +
        "</div>" +
      "</section>" +
      '<section class="section section--flush-top faq-navwrap" aria-label="' +
        esc(T("Jump to a section", "Ir a una sección")) + '">' +
        '<div class="shell shell--narrow">' + nav + "</div>" +
      "</section>" +
      body +
      '<section class="section section--tint" aria-labelledby="faq-ask">' +
        '<div class="shell shell--narrow">' +
          R.sectionHead({
            eyebrow: { en: "Still looking", es: "¿Sigue buscando?" },
            title: { en: "Not here? Ask a person.", es: "¿No está aquí? Pregunte a una persona." },
            sub: { en: "Every branch answers questions about any policy, not only the ones it sold.",
                   es: "Cada sucursal responde preguntas sobre cualquier póliza, no solo las que vendió." },
            id: "faq-ask"
          }) +
          '<div class="btn-row">' +
            '<a class="btn btn-primary" href="#/contact">' + esc(ICB.s("contactICB")) + "</a>" +
            '<a class="btn btn-outline" href="#/locations">' + esc(ICB.s("findYourBranch")) + "</a>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  ICB.views.faq = {
    title: { en: "Questions and answers | ICB", es: "Preguntas y respuestas | ICB" },
    render: build
  };
})();
