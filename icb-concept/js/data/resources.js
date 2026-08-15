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
      label: "Claims forms",
      description: "The Insured Motor Accident, Claimant Motor Accident, Property, Marine and Hurricane forms published by ICB.",
      hrefKey: "claimsForms",
      glyph: "document"
    },
    {
      label: "ICB payment portal",
      description: "Pay your premium online through ICB's billing portal.",
      hrefKey: "payments",
      glyph: "card"
    },
    {
      label: "Consumer resources on icbinsurance.com",
      description: "ICB's published consumer information, including hurricane and fire preparation material.",
      hrefKey: "consumerResources",
      glyph: "shield"
    },
    {
      label: "Mexican Insurance through ANA Seguros",
      description: "Buy Now, View Coverage, Claims and FAQs, as published by ICB.",
      hrefKey: "mexicanInsurance",
      glyph: "border"
    }
  ],

  /* Safety material ICB publishes. These point at ICB's consumer
     resources page until direct URLs are supplied. */
  safety: [
    {
      label: "Hurricane safety",
      description: "ICB's hurricane preparation material and the hurricane tracking map.",
      hrefKey: "consumerResources",
      glyph: "storm"
    },
    {
      label: "Fire prevention",
      description: "ICB's fire prevention material.",
      hrefKey: "consumerResources",
      glyph: "shield"
    }
  ],

  /* Pages of this site that restate published ICB information. */
  onSite: [
    {
      label: "Travel Insurance: current status",
      description: "Sales are currently temporarily suspended. Support information for existing customers.",
      route: "#/insurance/travel",
      glyph: "plane"
    },
    {
      label: "How claims work",
      description: "Your claim type, the official ICB form, and how to reach the claims team.",
      route: "#/claims",
      glyph: "document"
    },
    {
      label: "Find a branch",
      description: "Every ICB branch and agency, from Corozal to Punta Gorda.",
      route: "#/locations",
      glyph: "marker"
    }
  ],

  /* Reserved slot. Nothing is presented as ICB guidance until ICB
     approves it. */
  placeholder: {
    label: "More consumer guides can be added here",
    description: "This space is ready for consumer guides once ICB writes and approves them."
  }
};
