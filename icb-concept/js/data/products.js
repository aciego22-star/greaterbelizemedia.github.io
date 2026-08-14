/* ============================================================================
   ICB.DATA.products — the seven published ICB insurance categories.
   Category names and subcategories reflect ICB's current public website.
   No policy terms, premiums, limits or exclusions are stated anywhere;
   copy stays descriptive and routes people to ICB representatives.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.products = [
  {
    id: "property",
    route: "#/insurance/property",
    name: "Property Insurance",
    kicker: "Homes, businesses and the places that matter",
    short: "Cover for the buildings and contents you have worked for, from family homes to commercial premises.",
    standfirst: "The home you have built, the shop you open every morning, the premises your company depends on. Property cover is arranged around the way you live and work.",
    covers: ["Homeowners", "Renters", "Small business", "Commercial property"],
    audience: "For homeowners, renters, entrepreneurs and established businesses across Belize.",
    goodToKnow: [
      "An ICB representative reviews your needs with you before any cover is arranged.",
      "Belize's hurricane season makes preparation part of protection. Practical guidance is available in the Resource Centre.",
      "Branch teams across the country can look at your property needs in person."
    ],
    status: null,
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
    short: "From the family car to taxis, buses and heavy-duty equipment, cover arranged around how you drive.",
    standfirst: "Whether you drive to work, drive for work, or keep a fleet moving, motor cover is arranged around the vehicle and the way it is used.",
    covers: ["Personal vehicles", "Commercial vehicles", "Taxis and buses", "Heavy-duty vehicles"],
    audience: "For private drivers, commercial operators, taxi and bus operators, and heavy equipment owners.",
    goodToKnow: [
      "Tell ICB how the vehicle is used. Private, commercial and passenger use are looked at differently.",
      "If you are planning to drive into Mexico, ask about Mexican Insurance before you travel.",
      "If you are ever in an accident, the Claims section explains exactly what to do next."
    ],
    status: null,
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
    // Verbatim description from the current ICB website:
    short: "Protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.",
    standfirst: "Marine Hull Insurance protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.",
    covers: ["Fishing vessels", "Passenger and tour vessels", "Pleasure craft", "Working vessels"],
    coversNote: "Vessel categories to be finalized with ICB from the published list.",
    audience: "For fishermen, tour operators, water taxi operators and private boat owners.",
    goodToKnow: [
      "Cover can be tailored to how the vessel is used, including third party and passenger liability.",
      "Vessels used commercially are looked at differently from pleasure craft, so mention how yours works.",
      "Coastal and island branches, including San Pedro and Dangriga, know marine customers well."
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
    // Verbatim description from the current ICB website:
    short: "Protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.",
    standfirst: "Cargo Insurance protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.",
    covers: ["Goods moved by road", "Goods moved by sea", "Goods moved by air", "Import and export shipments"],
    coversNote: "Transit modes to be finalized with ICB from the published list.",
    audience: "For importers, exporters, distributors and any business that moves goods.",
    goodToKnow: [
      "Cover follows the goods from warehouse to warehouse, not just one leg of the journey.",
      "Describe the route and the goods when you enquire. It helps ICB point you to the right arrangement.",
      "Businesses that also own vehicles or vessels can look at motor and marine cover alongside cargo."
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
    kicker: "Specialty protection, arranged to fit",
    short: "Liability and specialty covers for responsibilities that do not fit a single box.",
    standfirst: "Some risks are about responsibility rather than property. Liability and miscellaneous covers are arranged around the situations your life or business creates.",
    covers: ["Commercial liability", "Contractors all risk", "Other specialty covers on request"],
    coversNote: "Product list to be finalized with ICB from the published categories.",
    audience: "For businesses, contractors and individuals with responsibilities to protect.",
    goodToKnow: [
      "These covers are individually arranged, so a conversation with ICB is the natural first step.",
      "Contractors and event operators often combine liability cover with property or motor cover.",
      "Start an enquiry and an ICB representative will guide you to the right product."
    ],
    status: null,
    glyph: "scales",
    artMotif: "liability",
    related: ["property", "cargo"],
    claimPathways: []
  },
  {
    id: "travel",
    route: "#/insurance/travel",
    name: "Travel Insurance",
    kicker: "Support for the journeys you take",
    short: "Cover designed around trips abroad, for the moments away from home.",
    standfirst: "Trips abroad go better with support behind them. Travel cover is designed around your journey.",
    covers: ["Individual travellers", "Families travelling together"],
    coversNote: "Traveller categories to be confirmed with ICB.",
    audience: "For Belizeans travelling abroad for work, study or holiday.",
    goodToKnow: [
      "Contact ICB before your trip so cover can be arranged in good time.",
      "Bring your travel dates and destinations when you enquire."
    ],
    status: {
      tone: "notice",
      text: "Availability note: travel insurance sales are currently suspended. Contact ICB for the latest information."
    },
    glyph: "plane",
    artMotif: "travel",
    related: ["mexican", "property"],
    claimPathways: []
  },
  {
    id: "mexican",
    route: "#/insurance/mexican",
    name: "Mexican Insurance",
    kicker: "For the drive across the northern border",
    short: "Mexican law requires liability insurance issued by a Mexico-authorized insurer. Arrange it before you travel.",
    standfirst: "Driving into Mexico? Mexican law requires liability insurance issued by an insurer authorized in Mexico. ICB can help you arrange it before you travel.",
    covers: ["Private vehicles entering Mexico", "Trips of different durations"],
    coversNote: "Coverage options to be confirmed with ICB.",
    audience: "For Belizean drivers crossing into Mexico for shopping, family visits, business or holiday.",
    goodToKnow: [
      "A policy issued outside Mexico is not accepted as proof of financial responsibility on Mexican roads.",
      "Northern branches, including Corozal and Orange Walk, are on the route to the border.",
      "Bring your vehicle details and travel dates when you enquire."
    ],
    status: null,
    glyph: "border",
    artMotif: "mexican",
    related: ["motor", "travel"],
    claimPathways: []
  }
];

ICB.DATA.productById = function (id) {
  for (var i = 0; i < ICB.DATA.products.length; i++) {
    if (ICB.DATA.products[i].id === id) return ICB.DATA.products[i];
  }
  return null;
};
