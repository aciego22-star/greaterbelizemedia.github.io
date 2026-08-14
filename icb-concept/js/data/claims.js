/* ============================================================================
   ICB.DATA.claims — claim pathways and process guide.
   The five claim types mirror the downloadable forms published on ICB's
   current website. formUrl points at the official ICB claims page; replace
   with direct PDF links when supplied by ICB.
   Copy never assesses liability, promises approval or estimates settlement.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.claims = {
  // Verbatim service values from the current ICB website:
  values: "Clear and consistent communication. Empathy to claimants. Excellent follow through and follow up. Fair and accurate settlements.",
  valuesList: [
    "Clear and consistent communication",
    "Empathy to claimants",
    "Excellent follow through and follow up",
    "Fair and accurate settlements"
  ],

  pathways: [
    {
      id: "motor",
      anchor: "motor",
      name: "Motor claim",
      formLabel: "Motor Accident Form",
      lead: "For damage or loss involving a vehicle insured with ICB.",
      helpful: [
        "Your policy details",
        "The date, time and place of the incident",
        "Photos of the scene and damage, if safe to take",
        "A police report, where applicable",
        "Details of any other vehicles or people involved"
      ],
      glyph: "car"
    },
    {
      id: "motor-third-party",
      anchor: "third-party",
      name: "Motor claim as a third party",
      formLabel: "Claimant Motor Accident Form",
      lead: "For claimants involved in an accident with a vehicle insured by ICB.",
      helpful: [
        "The date, time and place of the accident",
        "Details of the ICB-insured vehicle, if known",
        "Photos of the scene and damage, if safe to take",
        "A police report, where applicable"
      ],
      glyph: "people"
    },
    {
      id: "property",
      anchor: "property",
      name: "Property claim",
      formLabel: "Property Claim Form",
      lead: "For damage or loss at an insured home or business property.",
      helpful: [
        "Your policy details",
        "When the damage or loss was discovered",
        "Photos of the affected areas, if safe to take",
        "A list of damaged or missing items, as best you can"
      ],
      glyph: "house"
    },
    {
      id: "marine",
      anchor: "marine",
      name: "Marine claim",
      formLabel: "Marine Claim Form",
      lead: "For loss or damage involving an insured vessel.",
      helpful: [
        "Your policy details",
        "The date, place and circumstances of the incident",
        "Photos of the vessel and damage, if safe to take",
        "Details of any other vessels or people involved"
      ],
      glyph: "boat"
    },
    {
      id: "hurricane",
      anchor: "hurricane",
      name: "Hurricane claim",
      formLabel: "Hurricane Claim Form",
      lead: "For property damage caused by a hurricane or named storm.",
      helpful: [
        "Your policy details",
        "Photos of the damage, once it is safe to move around",
        "Reasonable steps taken to prevent further damage",
        "A list of affected areas and items, as best you can"
      ],
      glyph: "storm"
    }
  ],

  steps: [
    {
      n: 1,
      title: "Make sure everyone is safe",
      body: "People come first. If anyone is injured or in danger, contact emergency services before anything else."
    },
    {
      n: 2,
      title: "Tell ICB as soon as you can",
      body: "Call, visit a branch or send a message. Early contact helps the claims team guide you from the start."
    },
    {
      n: 3,
      title: "Complete the official claim form",
      body: "Download the form for your claim type and fill it in carefully. Your branch can help if anything is unclear."
    },
    {
      n: 4,
      title: "ICB reviews and keeps you informed",
      body: "The claims team works with clear and consistent communication and follows up with you throughout."
    },
    {
      n: 5,
      title: "Continue according to ICB's process",
      body: "Your claims representative will explain each next step until the claim is resolved fairly and accurately."
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
