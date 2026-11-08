/* ============================================================================
   ICB.DATA.resources — the Resource Centre.

   CONTENT RULE: this section routes people to material ICB actually
   publishes. It does NOT present newly written insurance education as ICB
   guidance. Every card is a signpost to an official ICB destination or to
   a page of this site that only restates published ICB information.

   INTERNAL TODO (not client-facing):
   - Hurricane Safety, the tracking map and Fire Prevention no longer
     point at the old site. The material was read off ICB's consumer
     resources page and out of their two PDFs on 8 Nov 2026 and now
     lives in js/data/guides.js, rendered at #/resources/<id>, with
     ICB's original PDFs served from assets/docs beside it.
   - The ANA Seguros resource URLs were read off ICB's own Mexican
     Insurance page on 7 Nov 2026 and are on the product's anaPathways.
   - The seven consumer-education articles written for the first draft of
     this concept were removed here. They are not ICB material. If ICB
     wants consumer guides, they can be written and approved, then dropped
     into the "More consumer guides" slot below.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.resources = {
  /* Official ICB destinations. hrefKey resolves against site.external;
     route is an internal hash route. */
  official: [
    {
      label: { en: "Claims forms", es: "Formularios de reclamo" },
      description: { en: "The Insured Motor Accident, Claimant Motor Accident, Property, Marine and Hurricane forms published by ICB.", es: "Los formularios Insured Motor Accident, Claimant Motor Accident, Property, Marine y Hurricane publicados por ICB." },
      route: "#/claims@forms",
      glyph: "document"
    },
    {
      label: { en: "Bank payment information", es: "Información de pago bancario" },
      description: { en: "ICB's bank accounts, and how to send your payment confirmation to your branch.", es: "Las cuentas bancarias de ICB, y cómo enviar su comprobante de pago a su sucursal." },
      route: "#/payments",
      glyph: "card"
    },
    {
      label: { en: "Mexican Insurance quote", es: "Cotización de Mexican Insurance" },
      description: { en: "ANA Seguros' quote tool for driving into Mexico, with ICB as your agent.", es: "La herramienta de cotización de ANA Seguros para viajar en auto a México, con ICB como su agente." },
      route: "#/insurance/mexican/quote",
      glyph: "border"
    },
    {
      label: { en: "Mexican Insurance through ANA Seguros", es: "Mexican Insurance a través de ANA Seguros" },
      description: { en: "Buy Now, View Coverage, Claims and FAQs, as published by ICB.", es: "Buy Now, View Coverage, Claims y FAQs, tal como los publica ICB." },
      hrefKey: "mexicanInsurance",
      glyph: "border"
    }
  ],

  /* Safety material ICB publishes. It used to be a pair of cards that
     sent a visitor back to the old site, because all ICB offered was a
     four megabyte PDF and a page of loose bullets. The content was
     brought across on 8 Nov 2026 and now lives at #/resources/<id>, in
     both languages, with ICB's original PDFs offered beside it. See
     js/data/guides.js.

     Two cards, and only two. ICB's consumer resources page lists a
     third, and it is deliberately absent: on 28 Oct 2026 ICB instructed
     that the product it concerns come off this site entirely. See
     js/data/guides.js and OPEN-QUESTIONS.md before adding anything to
     this array to make it match the old page. */
  safety: [
    {
      label: { en: "Hurricane guide", es: "Guía de huracanes" },
      description: { en: "The emergency numbers, the warning phases, the supplies checklist, and what to do before, during and after a storm.", es: "Los números de emergencia, las fases de aviso, la lista de suministros, y qué hacer antes, durante y después de una tormenta." },
      route: "#/resources/hurricane",
      glyph: "storm"
    },
    {
      label: { en: "Fire prevention", es: "Prevención de incendios" },
      description: { en: "ICB's fire prevention advice for the home, the kitchen and the yard.", es: "Los consejos de prevención de incendios de ICB para la casa, la cocina y el patio." },
      route: "#/resources/fire-safety",
      glyph: "shield"
    }
  ],

  /* Pages of this site that restate published ICB information. */
  onSite: [
    {
      label: { en: "How claims work", es: "Cómo funcionan los reclamos" },
      description: { en: "Your claim type, the official ICB form, and how to reach the claims team.", es: "Su tipo de reclamo, el formulario oficial de ICB, y cómo contactar al equipo de reclamos." },
      route: "#/claims",
      glyph: "document"
    },
    {
      label: { en: "Find a branch", es: "Encuentre una sucursal" },
      description: { en: "Every ICB branch and agency, from Corozal to Punta Gorda.", es: "Todas las sucursales y agencias de ICB, de Corozal a Punta Gorda." },
      route: "#/locations",
      glyph: "marker"
    }
  ],

  /* INTERNAL, NOT RENDERED. A reserved slot in the safety grid for
     consumer guides ICB writes and approves. It used to paint an empty
     card describing itself, which is a note to the build team rather than
     something a visitor should read, so views/resources.js no longer
     renders it. Approved guides can be appended to safety[] directly. */
  placeholder: {
    label: "More consumer guides can be added here",
    description: "This space is ready for consumer guides once ICB writes and approves them."
  }
};
