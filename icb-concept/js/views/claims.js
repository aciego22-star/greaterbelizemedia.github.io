/* ============================================================================
   Claims view — pathways, official forms, and the route to ICB's claims
   team. Administrative guidance only: no liability assessment, no claim
   requirements, no promises.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  ICB.views.claims = {
    title: "Claims | ICB",
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
            R.crumbsHome("Claims") +
            '<span class="eyebrow">Claims</span>' +
            '<h1 id="claims-title">When something happens, know what to do next.</h1>' +
            '<p class="hero-lead">Choose your claim type, open the official ICB claim form, and reach the ICB claims team. They will guide you through the applicable next steps.</p>' +
            '<ul class="values-strip" aria-label="ICB claims service values">' + values + "</ul>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="pathways-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "Claim pathways",
              title: "Start with your claim type.",
              sub: "Each pathway uses the official ICB claim form published on icbinsurance.com.",
              id: "pathways-title"
            }) +
            '<div class="pathway-grid">' + cards + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="steps-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: "How to begin",
              title: "Four steps to reach the claims team.",
              sub: "ICB's claims team explains what a specific claim requires.",
              id: "steps-title"
            }) +
            R.steps(data.steps) +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="Contact the claims team">' +
          '<div class="shell">' +
            R.band({
              eyebrow: "Here for you",
              title: "Not sure which pathway fits?",
              body: "Call, visit a branch, or send an enquiry and the ICB team will point you to the right form and next step.",
              motif: "heritage",
              actions: [
                { label: "Call " + ICB.DATA.site.corporate.phoneDisplay, href: "tel:" + ICB.DATA.site.corporate.phoneTel },
                { label: "Start a claim enquiry", href: "#/contact?topic=claim" },
                { label: "Find a branch", href: "#/locations" }
              ]
            }) +
          "</div>" +
        "</section>";
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
