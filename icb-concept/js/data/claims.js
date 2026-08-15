/* ============================================================================
   ICB.DATA.claims — claim forms and the administrative pathway to them.

   CONTENT RULE: the claim types below mirror the claim forms ICB publishes
   on its own website, and the service values are ICB's own published
   claims values. Nothing here states what documents, evidence, reports or
   settlement steps a claim requires. Those instructions belong to ICB and
   are given by an ICB claims representative.

   INTERNAL TODO (not client-facing):
   - Replace formUrl with direct PDF links per claim type once ICB supplies
     them; today every button opens ICB's published claims forms page.
   - Confirm the published form titles read exactly as listed here.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.claims = {
  /* Verbatim service values published by ICB: */
  values: "Clear and consistent communication. Empathy to claimants. Excellent follow through and follow up. Fair and accurate settlements. Prompt and final resolutions.",
  valuesList: [
    "Clear and consistent communication",
    "Empathy to claimants",
    "Excellent follow through and follow up",
    "Fair and accurate settlements",
    "Prompt and final resolutions"
  ],

  pathways: [
    {
      id: "motor",
      anchor: "motor",
      name: "Motor claim",
      formLabel: "Insured Motor Accident Form",
      lead: "For an ICB policyholder reporting an accident involving an insured vehicle.",
      glyph: "car"
    },
    {
      id: "motor-third-party",
      anchor: "third-party",
      name: "Motor claim as a third party",
      formLabel: "Claimant Motor Accident Form",
      lead: "For a claimant involved in an accident with a vehicle insured by ICB.",
      glyph: "people"
    },
    {
      id: "property",
      anchor: "property",
      name: "Property claim",
      formLabel: "Property Claim Form",
      lead: "For loss or damage at a property insured with ICB.",
      glyph: "house"
    },
    {
      id: "marine",
      anchor: "marine",
      name: "Marine claim",
      formLabel: "Marine Claim Form",
      lead: "For loss or damage involving a vessel insured with ICB.",
      glyph: "boat"
    },
    {
      id: "hurricane",
      anchor: "hurricane",
      name: "Hurricane claim",
      formLabel: "Hurricane Claim Form",
      lead: "For property loss or damage following a hurricane.",
      glyph: "storm"
    }
  ],

  /* Administrative pathway only. It describes how to reach ICB's claims
     team, not what a claim requires or how it is settled. */
  steps: [
    {
      n: 1,
      title: "Identify your claim type",
      body: "Choose the pathway that matches your situation."
    },
    {
      n: 2,
      title: "Access the relevant official ICB claim form",
      body: "Each pathway links to the claim forms published by ICB."
    },
    {
      n: 3,
      title: "Contact ICB or your preferred branch",
      body: "Reach the Corporate Office or the branch closest to you."
    },
    {
      n: 4,
      title: "The claims team will guide you through the applicable next steps",
      body: "An ICB claims representative explains what happens from there."
    }
  ]
};

ICB.DATA.claimById = function (id) {
  var list = ICB.DATA.claims.pathways;
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
};
