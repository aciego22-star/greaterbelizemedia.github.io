/* ============================================================================
   Claims view — pathways, official forms, and the route to ICB's claims
   team. Administrative guidance only: no liability assessment, no claim
   requirements, no promises.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;


  /* The Claims Department's own line, from ICB.DATA.site.departments. */
  function deptRow(R) {
    var d = (ICB.DATA.site.departments || []).filter(function (x) { return x.id === "claims"; })[0];
    if (!d || !d.whatsapp) return "";
    /* The heading already says what this is for, so the note is not
       repeated under it, and the number is not printed: the button
       opens the chat, and a number nobody has to dial is clutter. */
    return '<aside class="claims-dept rv">' +
      ICB.art.waIcon("roundel", "wa-roundel") +
      '<div class="claims-dept-text">' +
        "<strong>" + R.esc(ICB.s("claimsDeptTitle")) + "</strong>" +
      "</div>" +
      '<a class="btn btn-outline btn-sm" href="' + R.esc(R.waHref(d.whatsapp.wa)) + '"' +
        R.extAttrs() + ">" + R.esc(ICB.s("messageDept", { d: ICB.t(d.name) })) +
        R.extIcon() + "</a>" +
      "</aside>";
  }

  ICB.views.claims = {
    title: { en: "Claims | ICB", es: "Reclamos | ICB" },
    render: function () {
      var R = ICB.render;
      var data = ICB.DATA.claims;

      var values = data.valuesList.map(function (v) {
        return "<li>" + ICB.art.glyph("check") + "<span>" + R.esc(v) + "</span></li>";
      }).join("");

      var cards = data.pathways.map(R.claimCard).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="claims-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="claims-hero" aria-hidden="true">' + ICB.art.panel("claims") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Claims", es: "Reclamos" }) +
            '<span class="eyebrow">' + T("Claims", "Reclamos") + '</span>' +
            '<h1 id="claims-title">' + T("When something happens, know what to do next.", "Cuando algo pasa, sepa qué hacer.") + '</h1>' +
            '<p class="hero-lead">' + T("Choose your claim type, open the official ICB claim form, and reach the ICB claims team. They will guide you through the applicable next steps.", "Elija su tipo de reclamo, abra el formulario oficial de reclamo de ICB y comuníquese con el equipo de reclamos. Ellos le guiarán en los pasos que correspondan.") + '</p>' +
            '<ul class="values-strip" aria-label="' + T("ICB claims service values", "Valores del servicio de reclamos de ICB") + '">' + values + "</ul>" +
          "</div>" +
        "</section>" +

        /* data-anchor so "#/claims@forms" lands on the forms rather than
           at the top of the page. The footer and the resources page both
           send a claimant straight here. */
        '<section class="section" data-anchor="forms" aria-labelledby="pathways-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Claim pathways", es: "Vías de reclamo" },
              title: { en: "Start with your claim type.", es: "Empiece por su tipo de reclamo." },
              sub: { en: "Each pathway carries ICB's own claim form, ready to download.", es: "Cada vía incluye el formulario de reclamo propio de ICB, listo para descargar." },
              id: "pathways-title"
            }) +
            '<div class="pathway-grid">' + cards + "</div>" +
            /* A claim already reported is a different errand from
               starting one, and the pathways above do not serve it.
               ICB gives the Claims Department its own WhatsApp line, so
               it gets its own row rather than being buried in the
               contact band at the foot of the page. */
            deptRow(R) +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="steps-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "How to begin", es: "Cómo empezar" },
              title: { en: "Four steps to reach the claims team.", es: "Cuatro pasos para llegar al equipo de reclamos." },
              sub: { en: "ICB's claims team explains what a specific claim requires.", es: "El equipo de reclamos de ICB explica lo que requiere cada reclamo." },
              id: "steps-title"
            }) +
            R.steps(data.steps) +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="' + T("Contact the claims team", "Comunicarse con el equipo de reclamos") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Here for you", es: "Estamos con usted" },
              title: { en: "Not sure which pathway fits?", es: "¿No sabe cuál vía le corresponde?" },
              body: { en: "Call, visit a branch, or send an enquiry and the ICB team will point you to the right form and next step.", es: "Llame, visite una sucursal o envíe una consulta y el equipo de ICB le indicará el formulario correcto y el siguiente paso." },
              motif: "heritage",
              actions: [
                { label: ICB.s("callN", { n: ICB.DATA.site.corporate.phoneDisplay }), href: "tel:" + ICB.DATA.site.corporate.phoneTel },
                { label: { en: "Start a claim enquiry", es: "Iniciar una consulta de reclamo" }, href: "#/contact?topic=claim" },
                { label: { en: "Find a branch", es: "Encontrar una sucursal" }, href: "#/locations" }
              ]
            }) +
          "</div>" +
        "</section>" +
        /* ICB's own answers to the questions this page raises.
           A handful here, all of them on the FAQ page. */
        R.faqBlock("claims", { tint: true, section: "claims" });
    },
    mounted: function (mount, ctx) {
      if (ctx.anchor) {
        var target = mount.querySelector('[data-anchor="' + ctx.anchor + '"]');
        if (target) {
          target.classList.add("is-highlight");
          setTimeout(function () { target.classList.remove("is-highlight"); }, 2600);
        }
      }
    }
  };
})();
