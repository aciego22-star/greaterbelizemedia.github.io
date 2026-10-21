/* ============================================================================
   Bee view — the page about ICB's online assistant.

   Four jobs, in order: say what Bee is, say what it can and cannot do,
   say why it is worth using, and settle the privacy question honestly.

   The "cannot do" list sits high on the page rather than in small print
   at the bottom. A visitor who believes a chat window can quote them,
   insure them or settle their claim has been misled by the page, not by
   the assistant, and the fix belongs here.

   The privacy copy is a draft awaiting ICB's sign-off. See the header of
   js/data/bee.js.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  function card(item, R) {
    return '' +
      '<article class="bee-card rv">' +
        '<span class="bee-card-icon" aria-hidden="true">' + ICB.art.glyph(item.glyph) + "</span>" +
        "<h3>" + R.esc(item.title) + "</h3>" +
        "<p>" + R.esc(item.body) + "</p>" +
      "</article>";
  }

  ICB.views.bee = {
    title: {
      en: "Bee, the ICB assistant | ICB",
      es: "Bee, el asistente de ICB | ICB"
    },
    render: function () {
      var R = ICB.render;
      var data = ICB.DATA.bee;

      var canDo = data.canDo.map(function (i) { return card(i, R); }).join("");
      var benefits = data.benefits.map(function (i) { return card(i, R); }).join("");
      var privacy = data.privacy.map(function (i) { return card(i, R); }).join("");
      var willNot = data.willNot.map(function (line) {
        return '<li class="bee-not-item">' + ICB.art.glyph("close") +
          "<span>" + R.esc(line) + "</span></li>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="bee-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="bee-hero" aria-hidden="true">' +
            ICB.art.panel("heritage") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Bee", es: "Bee" }) +
            '<span class="eyebrow">' + T("The ICB assistant", "El asistente de ICB") + "</span>" +
            '<h1 id="bee-title">' +
              T("Meet Bee, ICB's online assistant.",
                "Le presentamos a Bee, el asistente en línea de ICB.") + "</h1>" +
            '<p class="hero-lead">' +
              T("Bee answers questions about ICB's insurance, its twenty-two offices and how a claim starts. In English or Spanish, at any hour, with a person always one request away.",
                "Bee responde preguntas sobre los seguros de ICB, sus veintidós oficinas y cómo se inicia un reclamo. En inglés o en español, a cualquier hora, y siempre con una persona a una petición de distancia.") +
            "</p>" +
            '<div class="btn-row">' +
              '<button type="button" class="btn btn-primary" data-bee-open>' +
                "<span>" + T("Talk to Bee", "Hablar con Bee") + "</span>" +
              "</button>" +
              '<a class="btn btn-light" href="#/contact">' +
                T("Rather talk to a person", "Prefiero hablar con una persona") + "</a>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="bee-can-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "What Bee does", es: "Lo que hace Bee" },
              title: { en: "Six things Bee can help with.", es: "Seis cosas en las que Bee puede ayudar." },
              sub: { en: "Everything Bee knows comes from what ICB publishes.", es: "Todo lo que Bee sabe viene de lo que ICB publica." },
              id: "bee-can-title"
            }) +
            '<div class="bee-grid">' + canDo + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="bee-not-title">' +
          '<div class="shell bee-not">' +
            R.sectionHead({
              eyebrow: { en: "Where Bee stops", es: "Dónde se detiene Bee" },
              title: { en: "And five things it will not do.", es: "Y cinco cosas que no hará." },
              sub: { en: "Said plainly, because knowing the edges is what makes the rest useful.", es: "Dicho con claridad, porque conocer los límites es lo que hace útil al resto." },
              id: "bee-not-title"
            }) +
            '<ul class="bee-not-list">' + willNot + "</ul>" +
            '<p class="bee-not-foot">' +
              T("All five are handled by ICB staff. Bee will give you the right person to ask.",
                "Las cinco las atiende el personal de ICB. Bee le indicará a quién preguntar.") + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="bee-why-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Why use it", es: "Por qué usarlo" },
              title: { en: "What Bee saves you.", es: "Lo que Bee le ahorra." },
              id: "bee-why-title"
            }) +
            '<div class="bee-grid">' + benefits + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="bee-privacy-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Your privacy", es: "Su privacidad" },
              title: { en: "Your information stays yours.", es: "Su información sigue siendo suya." },
              sub: { en: "The short version: ICB does not sell it, does not trade it, and does not put you on a marketing list.", es: "En resumen: ICB no la vende, no la intercambia y no lo pone en una lista de mercadeo." },
              id: "bee-privacy-title"
            }) +
            '<div class="bee-grid">' + privacy + "</div>" +
            '<p class="bee-privacy-foot">' +
              T("Questions about how ICB handles your information? Call the Corporate Office on " +
                ICB.DATA.site.corporate.phoneDisplay + " or email " + ICB.DATA.site.corporate.email + ".",
                "¿Preguntas sobre cómo ICB maneja su información? Llame a la Oficina Corporativa al " +
                ICB.DATA.site.corporate.phoneDisplay + " o escriba a " + ICB.DATA.site.corporate.email + ".") +
            "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-label="' + T("Talk to Bee", "Hablar con Bee") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Ready when you are", es: "Listo cuando usted quiera" },
              title: { en: "Ask Bee anything about ICB.", es: "Pregúntele a Bee lo que sea sobre ICB." },
              body: { en: "The launcher sits in the corner of every page on this site.", es: "El botón está en la esquina de todas las páginas de este sitio." },
              motif: "heritage",
              actions: [
                { label: { en: "Find a branch", es: "Encontrar una sucursal" }, href: "#/locations" },
                { label: { en: "Contact ICB", es: "Comunicarse con ICB" }, href: "#/contact" }
              ]
            }) +
          "</div>" +
        "</section>";
    },

    mounted: function (mount) {
      /* The page's own button opens the launcher that is already on
         screen, rather than being a second assistant. */
      var open = mount.querySelector("[data-bee-open]");
      if (open && ICB.assistant && ICB.assistant.open) {
        open.addEventListener("click", function () { ICB.assistant.open(); });
      } else if (open) {
        /* The build that ships without the assistant has no launcher to
           open, so the button would do nothing. Better to not be there. */
        open.hidden = true;
      }
    }
  };
})();
