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
  values: { en: "Clear and consistent communication. Empathy to claimants. Excellent follow through and follow up. Fair and accurate settlements. Prompt and final resolutions.", es: "Comunicación clara y constante. Empatía con los reclamantes. Excelente seguimiento. Liquidaciones justas y exactas. Resoluciones rápidas y definitivas." },
  valuesList: [
    { en: "Clear and consistent communication", es: "Comunicación clara y constante" },
    { en: "Empathy to claimants", es: "Empatía con los reclamantes" },
    { en: "Excellent follow through and follow up", es: "Excelente seguimiento" },
    { en: "Fair and accurate settlements", es: "Liquidaciones justas y exactas" },
    { en: "Prompt and final resolutions", es: "Resoluciones rápidas y definitivas" }
  ],

  pathways: [
    {
      id: "motor",
      anchor: "motor",
      name: { en: "Motor claim", es: "Reclamo de vehículo" },
      formLabel: "Insured Motor Accident Form",
      lead: { en: "For an ICB policyholder reporting an accident involving an insured vehicle.", es: "Para un asegurado de ICB que reporta un accidente con un vehículo asegurado." },
      glyph: "car"
    },
    {
      id: "motor-third-party",
      anchor: "third-party",
      name: { en: "Motor claim as a third party", es: "Reclamo de vehículo como tercero" },
      formLabel: "Claimant Motor Accident Form",
      lead: { en: "For a claimant involved in an accident with a vehicle insured by ICB.", es: "Para un reclamante involucrado en un accidente con un vehículo asegurado por ICB." },
      glyph: "people"
    },
    {
      id: "property",
      anchor: "property",
      name: { en: "Property claim", es: "Reclamo de propiedad" },
      formLabel: "Property Claim Form",
      lead: { en: "For loss or damage at a property insured with ICB.", es: "Por pérdida o daño en una propiedad asegurada con ICB." },
      glyph: "house"
    },
    {
      id: "marine",
      anchor: "marine",
      name: { en: "Marine claim", es: "Reclamo marítimo" },
      formLabel: "Marine Claim Form",
      lead: { en: "For loss or damage involving a vessel insured with ICB.", es: "Por pérdida o daño de una embarcación asegurada con ICB." },
      glyph: "boat"
    },
    {
      id: "hurricane",
      anchor: "hurricane",
      name: { en: "Hurricane claim", es: "Reclamo por huracán" },
      formLabel: "Hurricane Claim Form",
      lead: { en: "For property loss or damage following a hurricane.", es: "Por pérdida o daño a la propiedad después de un huracán." },
      glyph: "storm"
    }
  ],

  /* Administrative pathway only. It describes how to reach ICB's claims
     team, not what a claim requires or how it is settled. */
  steps: [
    {
      n: 1,
      title: { en: "Identify your claim type", es: "Identifique su tipo de reclamo" },
      body: { en: "Choose the pathway that matches your situation.", es: "Elija la vía que corresponda a su situación." }
    },
    {
      n: 2,
      title: { en: "Access the relevant official ICB claim form", es: "Acceda al formulario oficial de reclamo de ICB" },
      body: { en: "Each pathway links to the claim forms published by ICB.", es: "Cada vía enlaza a los formularios de reclamo publicados por ICB." }
    },
    {
      n: 3,
      title: { en: "Contact ICB or your preferred branch", es: "Comuníquese con ICB o con su sucursal preferida" },
      body: { en: "Reach the Corporate Office or the branch closest to you.", es: "Contacte la Oficina Corporativa o la sucursal más cercana a usted." }
    },
    {
      n: 4,
      title: { en: "The claims team will guide you through the applicable next steps", es: "El equipo de reclamos le guiará en los pasos que correspondan" },
      body: { en: "An ICB claims representative explains what happens from there.", es: "Un representante de reclamos de ICB le explica qué sigue a partir de ahí." }
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
