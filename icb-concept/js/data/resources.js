/* ============================================================================
   ICB.DATA.resources — the Resource Centre.

   CONTENT RULE: this section routes people to material ICB actually
   publishes. It does NOT present newly written insurance education as ICB
   guidance. Every card is a signpost to an official ICB destination or to
   a page of this site that only restates published ICB information.

   INTERNAL TODO (not client-facing):
   - Swap the shared consumerResources link for direct URLs once ICB
     supplies them for Hurricane Safety, the hurricane tracking map and
     Fire Prevention.
   - Confirm the current Travel Insurance information page and the
     Travel Insurance FAQs URL.
   - Confirm the ANA Seguros resource URLs for Mexican Insurance.
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
      hrefKey: "claimsForms",
      glyph: "document"
    },
    {
      label: { en: "Bank payment information", es: "Información de pago bancario" },
      description: { en: "ICB's bank accounts, and how to send your payment confirmation to your branch.", es: "Las cuentas bancarias de ICB, y cómo enviar su comprobante de pago a su sucursal." },
      route: "#/payments",
      glyph: "card"
    },
    {
      label: { en: "Consumer resources on icbinsurance.com", es: "Recursos para el consumidor en icbinsurance.com" },
      description: { en: "ICB's published consumer information, including hurricane and fire preparation material.", es: "La información para el consumidor publicada por ICB, incluido material de preparación ante huracanes e incendios." },
      hrefKey: "consumerResources",
      glyph: "shield"
    },
    {
      label: { en: "Mexican Insurance through ANA Seguros", es: "Mexican Insurance a través de ANA Seguros" },
      description: { en: "Buy Now, View Coverage, Claims and FAQs, as published by ICB.", es: "Buy Now, View Coverage, Claims y FAQs, tal como los publica ICB." },
      hrefKey: "mexicanInsurance",
      glyph: "border"
    }
  ],

  /* Safety material ICB publishes. These point at ICB's consumer
     resources page until direct URLs are supplied. */
  safety: [
    {
      label: { en: "Hurricane safety", es: "Seguridad ante huracanes" },
      description: { en: "ICB's hurricane preparation material and the hurricane tracking map.", es: "El material de preparación ante huracanes de ICB y el mapa de seguimiento de huracanes." },
      hrefKey: "consumerResources",
      glyph: "storm"
    },
    {
      label: { en: "Fire prevention", es: "Prevención de incendios" },
      description: { en: "ICB's fire prevention material.", es: "El material de prevención de incendios de ICB." },
      hrefKey: "consumerResources",
      glyph: "shield"
    }
  ],

  /* Pages of this site that restate published ICB information. */
  onSite: [
    {
      label: { en: "Travel Insurance: current status", es: "Travel Insurance: estado actual" },
      description: { en: "Sales are currently temporarily suspended. Support information for existing customers.", es: "La venta está temporalmente suspendida. Información de apoyo para clientes actuales." },
      route: "#/insurance/travel",
      glyph: "plane"
    },
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
