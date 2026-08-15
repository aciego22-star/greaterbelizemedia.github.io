/* ============================================================================
   ICB.DATA.products — ICB's published insurance categories.

   CONTENT RULE: category names, subcategories and product descriptions on
   this page come from ICB's own published material. Nothing here states
   policy terms, premiums, limits, exclusions or legal requirements that
   ICB does not publish itself. Supporting copy is UX guidance only and
   routes people to an ICB representative.

   INTERNAL TODO (not client-facing):
   - Confirm the full published vessel and transit lists with ICB.
   - Confirm Travel Insurance status before launch; sales are currently
     suspended on ICB's Travel Insurance site.
   - Confirm the ANA Seguros pathway URLs for Mexican Insurance.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.products = [
  {
    id: "property",
    route: "#/insurance/property",
    name: "Property Insurance",
    kicker: "Homes, businesses and the places that matter",
    short: "Cover for homes, rented homes, small business premises and commercial property.",
    standfirst: "The home you have built, the shop you open every morning, the premises your company depends on. ICB offers property cover for homeowners, renters, small businesses and commercial property.",
    covers: ["Home Owners", "Small Business", "Commercial", "Renters"],
    audience: "For homeowners, renters, small businesses and commercial property owners across Belize.",
    goodToKnow: [
      "An ICB representative reviews your needs with you before any cover is arranged.",
      "Hurricane and fire preparation information is available in the Resource Centre.",
      "Branch teams across the country can look at your property needs in person."
    ],
    status: null,
    campaign: { src: "assets/img/campaign/home.jpg", alt: "Property photography from ICB's Protect Your Investment campaign" },
    glyph: "house",
    artMotif: "property",
    related: ["motor", "liability"],
    claimPathways: ["property", "hurricane"]
  },
  {
    id: "motor",
    route: "#/insurance/motor",
    name: "Motor Insurance",
    kicker: "For every vehicle on Belizean roads",
    short: "Liability Only, Collision and Upsets, and Comprehensive cover for personal and commercial vehicles.",
    standfirst: "ICB offers Liability Only, Collision and Upsets, and Comprehensive motor insurance, available for personal vehicles, commercial vehicles, taxis and buses, and heavy duty vehicles.",
    covers: ["Liability Only", "Collision and Upsets", "Comprehensive"],
    coversLabel: "Types of cover",
    availableFor: ["Personal Vehicles", "Commercial Vehicles", "Taxis & Buses", "Heavy Duty Vehicles"],
    audience: "For private drivers, commercial operators, taxi and bus operators, and heavy duty vehicle owners.",
    goodToKnow: [
      "Tell ICB how the vehicle is used. Personal, commercial and passenger use are looked at differently.",
      "Driving into Mexico? ICB offers Mexican Insurance through ANA Seguros.",
      "If you are ever in an accident, the Claims section links to the official form."
    ],
    status: null,
    campaign: { src: "assets/img/campaign/motor-car.jpg", alt: "Vehicle photography from ICB's Protect Your Investment campaign" },
    glyph: "car",
    artMotif: "motor",
    related: ["mexican", "liability"],
    claimPathways: ["motor", "motor-third-party"]
  },
  {
    id: "marine",
    route: "#/insurance/marine",
    name: "Marine Hull Insurance",
    kicker: "For the vessels that work and play on our waters",
    /* Verbatim description from ICB's published material: */
    short: "Protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.",
    standfirst: "Marine Hull Insurance protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.",
    covers: ["Barges", "Tug Boats", "Dredgers", "Water Taxis", "Fishing Vessels", "Yachts", "Personal Vessels"],
    coversLabel: "Vessels covered",
    audience: "For vessel owners and operators across Belize.",
    /* No branch-specialty claims here. Which branches handle which line of
       cover is not published by ICB, so the copy says "any ICB location". */
    goodToKnow: [
      "Cover can be customized to include third party and passenger liability.",
      "Tell ICB how the vessel is used when you enquire.",
      "Any ICB location can put you in touch about Marine Hull Insurance."
    ],
    status: null,
    glyph: "boat",
    artMotif: "marine",
    related: ["cargo", "liability"],
    claimPathways: ["marine"]
  },
  {
    id: "cargo",
    route: "#/insurance/cargo",
    name: "Cargo Insurance",
    kicker: "For goods on the move",
    /* Verbatim description from ICB's published material: */
    short: "Protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.",
    standfirst: "Cargo Insurance protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.",
    covers: ["Air Transit", "Land Transit", "Marine Transit", "Domestic Transit", "Overseas Transit"],
    coversLabel: "Transit covered",
    audience: "For importers, exporters, distributors and businesses that move goods.",
    goodToKnow: [
      "Cover follows the goods from warehouse to warehouse.",
      "Describe the route and the goods when you enquire.",
      "An ICB representative can go through the details with you."
    ],
    status: null,
    glyph: "container",
    artMotif: "cargo",
    related: ["marine", "motor"],
    claimPathways: []
  },
  {
    id: "liability",
    route: "#/insurance/liability",
    name: "Liability & Miscellaneous",
    kicker: "Specialty cover for wider responsibilities",
    short: "Money Insurance, Personal Accident, Tour Operators Liability, General Liability and Contractors All Risk.",
    standfirst: "Some risks are about responsibility rather than property. ICB offers a range of liability and miscellaneous products for businesses, contractors and individuals.",
    covers: ["Money Insurance", "Personal Accident", "Tour Operators Liability", "General Liability", "Contractors All Risk"],
    audience: "For businesses, contractors, tour operators and individuals.",
    goodToKnow: [
      "These products are arranged individually, so a conversation with ICB is the natural first step.",
      "Tell ICB about the work you do when you enquire.",
      "Request information and an ICB representative will guide you."
    ],
    status: null,
    campaign: { src: "assets/img/campaign/family.jpg", alt: "Family photography from ICB's Protect Your Investment campaign" },
    glyph: "scales",
    artMotif: "liability",
    related: ["property", "cargo"],
    claimPathways: []
  },
  {
    id: "travel",
    route: "#/insurance/travel",
    name: "Travel Insurance",
    kicker: "Current status",
    short: "Sales of ICB Travel Insurance are currently temporarily suspended.",
    standfirst: "Sales of ICB Travel Insurance are currently temporarily suspended.",
    covers: [],
    audience: null,
    goodToKnow: [
      "The Corporate Office and every ICB branch can share the current Travel Insurance information.",
      "Travel Insurance is also listed in the Resource Centre alongside ICB's other published material."
    ],
    /* Sales suspended: no enquiry CTA that implies cover can be arranged. */
    suspended: true,
    status: {
      tone: "notice",
      text: "Existing customers who require support with a Travel Insurance claim can contact ICB for the published support information. ICB will publish current information when there is an update."
    },
    glyph: "plane",
    artMotif: "travel",
    related: ["property", "motor"],
    claimPathways: []
  },
  {
    id: "mexican",
    route: "#/insurance/mexican",
    name: "Mexican Insurance",
    kicker: "Driving into Mexico?",
    short: "Access ICB's Mexican Insurance options through ANA Seguros.",
    standfirst: "Driving into Mexico? Access ICB's Mexican Insurance options through ANA Seguros.",
    covers: [],
    audience: "For drivers travelling from Belize into Mexico.",
    /* ICB presents this line entirely through ANA Seguros, so the page
       makes no independent statements about it. */
    goodToKnow: [
      "ICB's Mexican Insurance is provided through ANA Seguros.",
      "The pathways below are the ones ICB publishes: Buy Now, View Coverage, Claims and FAQs."
    ],
    /* ANA Seguros pathways published on ICB's Mexican Insurance page.
       INTERNAL TODO: confirm the direct URLs with ICB; these route to the
       ICB page that carries them today. */
    anaPathways: [
      { label: "Buy Now", key: "mexican" },
      { label: "View Coverage", key: "mexican" },
      { label: "Claims", key: "mexican" },
      { label: "FAQs", key: "mexican" }
    ],
    status: null,
    glyph: "border",
    artMotif: "mexican",
    related: ["motor", "liability"],
    claimPathways: []
  }
];

ICB.DATA.productById = function (id) {
  for (var i = 0; i < ICB.DATA.products.length; i++) {
    if (ICB.DATA.products[i].id === id) return ICB.DATA.products[i];
  }
  return null;
};
