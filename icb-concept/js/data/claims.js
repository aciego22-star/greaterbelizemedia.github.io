/* ============================================================================
   ICB.DATA.claims — claim forms and the administrative pathway to them.

   CONTENT RULE: the claim types below mirror the claim forms ICB publishes
   on its own website, and the service values are ICB's own published
   claims values. Nothing here states what documents, evidence, reports or
   settlement steps a claim requires. Those instructions belong to ICB and
   are given by an ICB claims representative.

   The forms are ICB's own PDFs, served from this site rather than
   linked away to the site being replaced. formFile is the file each
   pathway hands over. Five arrived on 21 Oct 2026; four more on 7 Nov
   2026 (personal accident, public liability, windscreen, inland
   cargo), which is why there are nine pathways here and not five.

   A pathway's id is also the address of its online form, at
   /claims/form/<id>, so it must match the id of the matching entry in
   ICB.DATA.claimForms.

   INTERNAL TODO (not client-facing):
   - The hurricane form's own title page reads "PROPERTY CATASTROPHE
     CLAIM FORM", while ICB's published claims listing calls it the
     Hurricane Claim Form. The listing name is what the button says,
     because that is the name a claimant was told to look for. Worth
     confirming which ICB wants shown.
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
      formFile: "assets/forms/icb-insured-motor-accident-report-form.pdf",
      lead: { en: "For an ICB policyholder reporting an accident involving an insured vehicle.", es: "Para un asegurado de ICB que reporta un accidente con un vehículo asegurado." },
      glyph: "car"
    },
    {
      id: "motor-third-party",
      anchor: "third-party",
      name: { en: "Motor claim as a third party", es: "Reclamo de vehículo como tercero" },
      formLabel: "Claimant Motor Accident Form",
      formFile: "assets/forms/icb-claimant-motor-accident-report-form.pdf",
      lead: { en: "For a claimant involved in an accident with a vehicle insured by ICB.", es: "Para un reclamante involucrado en un accidente con un vehículo asegurado por ICB." },
      glyph: "people"
    },
    {
      id: "windscreen",
      anchor: "windscreen",
      name: { en: "Windscreen claim", es: "Reclamo de parabrisas" },
      formLabel: "Windscreen Claim Form",
      formFile: "assets/forms/icb-windscreen-claim-form.pdf",
      lead: { en: "For damage to the glass of a vehicle insured with ICB.", es: "Por daños al cristal de un vehículo asegurado con ICB." },
      glyph: "windscreen"
    },
    {
      id: "property",
      anchor: "property",
      name: { en: "Property claim", es: "Reclamo de propiedad" },
      formLabel: "Property Claim Form",
      formFile: "assets/forms/icb-property-claim-form.pdf",
      lead: { en: "For loss or damage at a property insured with ICB.", es: "Por pérdida o daño en una propiedad asegurada con ICB." },
      glyph: "house"
    },
    {
      id: "marine",
      anchor: "marine",
      name: { en: "Marine claim", es: "Reclamo marítimo" },
      formLabel: "Marine Claim Form",
      formFile: "assets/forms/icb-marine-claimant-form.pdf",
      lead: { en: "For loss or damage involving a vessel insured with ICB.", es: "Por pérdida o daño de una embarcación asegurada con ICB." },
      glyph: "boat"
    },
    {
      id: "hurricane",
      anchor: "hurricane",
      name: { en: "Hurricane claim", es: "Reclamo por huracán" },
      formLabel: "Hurricane Claim Form",
      formFile: "assets/forms/icb-property-catastrophe-claim-form.pdf",
      lead: { en: "For property loss or damage following a hurricane.", es: "Por pérdida o daño a la propiedad después de un huracán." },
      glyph: "storm"
    },
    {
      id: "inland-cargo",
      anchor: "inland-cargo",
      name: { en: "Inland cargo claim", es: "Reclamo de carga terrestre" },
      formLabel: "Inland Cargo Claim Form",
      formFile: "assets/forms/icb-inland-cargo-claim-form.pdf",
      lead: { en: "For loss or damage to cargo or heavy equipment in transit within Belize.", es: "Por pérdida o daño a carga o equipo pesado en tránsito dentro de Belice." },
      glyph: "container"
    },
    {
      id: "public-liability",
      anchor: "public-liability",
      name: { en: "Public liability claim", es: "Reclamo de responsabilidad civil" },
      formLabel: "Public Liability Claim Form",
      formFile: "assets/forms/icb-public-liability-claim-form.pdf",
      lead: { en: "For an accident where someone else was injured or their property damaged.", es: "Por un accidente en el que otra persona resultó lesionada o su propiedad dañada." },
      glyph: "scales"
    },
    {
      id: "personal-accident",
      anchor: "personal-accident",
      name: { en: "Personal accident claim", es: "Reclamo de accidente personal" },
      formLabel: "Personal Accident Claim Form",
      formFile: "assets/forms/icb-personal-accident-claim-form.pdf",
      lead: { en: "For medical costs after an accident, under a personal accident policy.", es: "Por gastos médicos tras un accidente, bajo una póliza de accidentes personales." },
      glyph: "shield"
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
