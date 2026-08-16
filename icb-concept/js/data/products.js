/* ============================================================================
   ICB.DATA.products — ICB's published insurance categories.

   CONTENT RULE: category names, subcategories, coverage options and the
   figures below come from ICB's own published material, including the
   Property and Motor promotional graphics supplied by the client. Nothing
   here states policy terms, premiums, limits, exclusions or legal
   requirements that ICB does not publish itself. Supporting copy is UX
   guidance only and routes people to an ICB representative.

   HOW LIMITS ARE WORDED. Where ICB publishes a figure it is reproduced
   exactly and always as a ceiling ("up to", "protection level"), never as
   an amount anyone is promised. A limit is the most a policy may respond
   with, not a payment, and the copy must never blur the two.

   QUOTES. quote: true means the category is currently available for
   enquiry, so its calls to action read "Request a quote" and carry the
   category into the New Insurance Enquiry flow. It is not an online
   quotation: no price is calculated, nothing is approved and no cover is
   bound. Travel carries quote: false while sales are suspended.

   SHAPE OF A PRODUCT PAGE. Five questions, in order:
     intro            what is this insurance?
     whyInsure        what can it help protect?
     coverageOptions  what options does ICB publish?
     forWho           who may find it relevant?
     useful           anything else worth knowing before enquiring
   Any of them may be omitted; the view renders what exists.

   INTERNAL TODO (not client-facing):
   - Confirm the full published vessel and transit lists with ICB.
   - Confirm Travel Insurance status before launch; sales are currently
     suspended on ICB's Travel Insurance site.
   - Confirm the ANA Seguros pathway URLs for Mexican Insurance.
   - The Property and Motor promotional graphics were described to us but
     the image files were not supplied. Their CONTENT is reproduced below.
     If ICB wants the artwork itself on the page, drop the files in
     assets/img/campaign/ and add them to js/data/images.js.
   - Confirm how the Motor flyer's options (Third-Party Act, Third-Party
     Act Plus, Liability Levels 1-4, Comprehensive) relate to the website's
     Liability Only / Collision and Upsets / Comprehensive classification.
     Until ICB confirms, the two are presented separately and no
     relationship between them is implied.
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
    standfirst: "Protecting the property you have built, bought or depend on.",
    quote: true,

    intro: {
      title: "What Property Insurance is for.",
      body: [
        "Property can represent one of the most significant investments a person or business makes. ICB's Property Insurance options are designed to help protect against insured loss or damage, whether the property is a home, rental residence, small business or commercial operation.",
        "ICB provides Property Insurance options for Home Owners, Small Business, Commercial properties and Renters, with additional protection available depending on the policy selected."
      ]
    },

    /* From ICB's Homeowners Insurance graphic. The three named options are
       ICB's; the one-line explanations are plain-language paraphrase and
       claim nothing beyond the name. */
    coverageOptions: {
      title: "Homeowners Insurance.",
      sub: "Owning a home is one of life's biggest investments. ICB's Homeowners Insurance is designed to help protect against unexpected setbacks, including insured damage to the property or loss of belongings caused by covered events.",
      items: [
        {
          name: "Fire, Lightning & Explosion Coverage",
          blurb: "Protection centred on specified fire, lightning and explosion risks."
        },
        {
          name: "Fire & Perils Including Major Catastrophic Events",
          blurb: "Broader property protection incorporating additional insured perils and major catastrophic events, subject to the selected policy."
        },
        {
          name: "Householder's All-Risk Protection",
          blurb: "Broader protection for eligible household contents and belongings, subject to policy terms.",
          /* "All risk" is a product name, not a promise. Saying so plainly
             is the honest reading of it. */
          note: "The name describes the breadth of the option, not cover for every possible event."
        }
      ],
      after: [
        "Depending on the protection selected, homeowners may also be able to include liability protection where accidental injury or property damage occurs on the premises, as well as additional protection such as burglary cover.",
        "Homeowners protection can also extend to household contents such as furniture, appliances and electronics, subject to the policy selected."
      ]
    },

    /* ICB's published Property categories, unchanged. */
    covers: ["Home Owners", "Small Business", "Commercial", "Renters"],
    coversLabel: "Property categories ICB publishes",
    categoryNotes: [
      { name: "Home Owners", note: "Protection options for the home you own and live in." },
      { name: "Small Business", note: "Property protection for eligible small-business premises and assets." },
      { name: "Commercial", note: "Property protection designed around commercial premises and related exposures." },
      { name: "Renters", note: "Protection options for renters seeking cover for eligible personal belongings and related risks." }
    ],

    /* Named in ICB's material as available additions. Framed as available,
       never as included, which is the distinction that matters here. */
    extensions: {
      title: "Additional protection ICB identifies",
      sub: "Availability depends on the policy selected. None of these is automatically included.",
      items: [
        "Liability to the Public",
        "Compensation for death of the Insured",
        "Business Interruption",
        "Additional expenses for accommodation",
        "Loss of rent"
      ]
    },

    forWho: {
      title: "Who may find it relevant?",
      items: [
        "Homeowners protecting the place they live and what is in it.",
        "Renters looking to cover eligible personal belongings.",
        "Small businesses protecting premises, stock and equipment.",
        "Commercial property owners with larger or multi-site exposures."
      ]
    },

    useful: {
      title: "Know the value of your property.",
      body: [
        "ICB recommends obtaining a current property appraisal so that the level of coverage can reflect the value of the home.",
        "When considering the property's value, remember permanent or external features such as patios, pools, fences, docks and other structures that may form part of the property."
      ]
    },

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
    standfirst: "Protection for the road ahead.",
    quote: true,

    intro: {
      title: "What Motor Insurance is for.",
      body: [
        "Driving a motor vehicle in Belize requires valid insurance under the law. ICB offers Motor Insurance options designed to help protect motorists from the financial consequences of accidents and other insured events.",
        "Depending on the protection selected, coverage may address third-party injury, third-party property damage and damage to the insured vehicle."
      ]
    },

    /* From ICB's Motor Insurance graphic. Every figure is ICB's own and is
       reproduced exactly. They are presented as the ceiling a policy may
       respond up to, never as an amount that will be paid.

       These options are deliberately NOT mapped onto the website's
       Liability Only / Collision and Upsets / Comprehensive list below:
       how the two relate is not published, and guessing would be an
       invention about what someone is buying. */
    coverageOptions: {
      title: "Motor coverage options highlighted by ICB.",
      sub: "Figures below are the protection levels ICB publishes. A limit is the most a policy may respond with, not an amount paid on every claim.",
      items: [
        {
          name: "Third-Party Act",
          tag: "Basic third-party protection",
          blurb: "Can cover repairs where the insured damages another person's vehicle, home or belongings.",
          limits: [{ label: "Property damage", value: "Up to BZD $20,000 per claim" },
                   { label: "Bodily Injury", value: "As described by ICB" }]
        },
        {
          name: "Third-Party Act Plus",
          tag: "Additional third-party protection",
          blurb: "The same underlying protection as Third-Party Act, at a higher protection level.",
          limits: [{ label: "Protection level", value: "Up to BZD $1,000,000" }]
        },
        {
          name: "Third-Party Liability, Levels 1 to 4",
          tag: "Four protection levels",
          blurb: "Third-party property damage and Bodily Injury, with the benefits ICB lists below. Choose the protection level that suits you.",
          limits: [{ label: "Medical expenses", value: "Up to BZD $2,500" },
                   { label: "Ambulance fee", value: "Up to BZD $250" },
                   { label: "Death Benefit", value: "BZD $10,000" }],
          levels: [
            { name: "Level 1", value: "BZD $300,000" },
            { name: "Level 2", value: "BZD $400,000" },
            { name: "Level 3", value: "BZD $500,000" },
            { name: "Level 4", value: "BZD $1,000,000" }
          ]
        },
        {
          name: "Comprehensive",
          tag: "Broader protection",
          blurb: "May address third-party injury and property damage, insured vehicle damage arising from accidents, fire, theft, broken windshield, and accidental injury benefits.",
          flag: "Vehicle inspection required"
        }
      ]
    },

    /* ICB's published website classification, kept exactly as it is. */
    covers: ["Liability Only", "Collision and Upsets", "Comprehensive"],
    coversLabel: "Types of cover",
    availableFor: ["Personal Vehicles", "Commercial Vehicles", "Taxis & Buses", "Heavy Duty Vehicles"],

    forWho: {
      title: "Who may find it relevant?",
      body: "ICB provides Motor Insurance options for personal and commercial motorists, including taxis, buses and heavy-duty vehicles.",
      items: [
        "Private drivers insuring a personal vehicle.",
        "Businesses running commercial vehicles or a fleet.",
        "Taxi and bus operators carrying passengers.",
        "Owners of heavy duty vehicles and equipment."
      ]
    },

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
    short: "Protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.",
    standfirst: "Protection for vessels on Belize's waters and beyond.",
    quote: true,

    intro: {
      title: "What Marine Hull Insurance is for.",
      body: [
        "Marine vessels represent significant working and personal assets. ICB's Marine Hull Insurance is designed to protect insured vessels against physical loss or damage, with options that may also be customized to include third-party and passenger liability."
      ]
    },

    covers: ["Barges", "Tug Boats", "Dredgers", "Water Taxis", "Fishing Vessels", "Yachts", "Personal Vessels"],
    coversLabel: "Vessels ICB publishes cover for",

    forWho: {
      title: "Who may find it relevant?",
      body: "Marine Hull Insurance may be relevant to vessel owners and operators using boats for commercial, passenger, fishing or personal purposes.",
      items: [
        "Commercial operators running barges, tugs or dredgers.",
        "Water taxi operators carrying passengers.",
        "Fishing vessel owners.",
        "Private owners of yachts and personal vessels."
      ]
    },

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
    short: "Protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.",
    standfirst: "Protection while your goods are on the move.",
    quote: true,

    intro: {
      title: "What Cargo Insurance is for.",
      body: [
        "Businesses depend on goods reaching their destination safely. ICB's Cargo Insurance is designed to protect insured property against physical loss or damage while in transit from warehouse to warehouse."
      ]
    },

    whyInsure: {
      title: "Why Cargo Insurance?",
      body: [
        "Whether goods are moving within Belize or across international routes, transit introduces risks that may not exist while products remain at a fixed location. Cargo Insurance provides a way to protect eligible goods during that movement, subject to the selected policy."
      ]
    },

    covers: ["Air Transit", "Land Transit", "Marine Transit", "Domestic Transit", "Overseas Transit"],
    coversLabel: "Transit ICB publishes cover for",

    forWho: {
      title: "Who may find it relevant?",
      items: [
        "Importers and exporters moving goods across borders.",
        "Distributors and wholesalers moving stock within Belize.",
        "Businesses shipping equipment or materials between sites.",
        "Anyone responsible for goods while they are in transit."
      ]
    },

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
    standfirst: "Protection for risks that do not always fit into a standard property, motor or marine policy.",
    quote: true,

    intro: {
      title: "A group of products, not a single policy.",
      body: [
        "Businesses and individuals can face risks beyond physical property damage. ICB offers a range of Liability & Miscellaneous insurance options designed around specific personal and commercial exposures.",
        "Each is arranged individually around what you actually do, so the natural first step is a conversation with an ICB representative."
      ]
    },

    /* Introductory descriptions only. No limits, exclusions, occupations,
       project sizes or eligibility rules, none of which ICB publishes. */
    coverageOptions: {
      title: "What ICB publishes under Liability & Miscellaneous.",
      sub: "Short introductions only. An ICB representative can explain how any of them would apply to your situation.",
      items: [
        { name: "Money Insurance",
          blurb: "An option for businesses seeking protection around eligible money-related risks." },
        { name: "Personal Accident",
          blurb: "Protection designed around eligible accidental-injury risks." },
        { name: "Tour Operators Liability",
          blurb: "Liability protection intended for eligible tour-operator activities." },
        { name: "General Liability",
          blurb: "Protection intended for eligible third-party liability exposures arising from business operations." },
        { name: "Contractors All Risk",
          blurb: "Insurance designed around eligible risks associated with construction and contracting projects." }
      ]
    },

    covers: ["Money Insurance", "Personal Accident", "Tour Operators Liability", "General Liability", "Contractors All Risk"],

    forWho: {
      title: "Who may find it relevant?",
      items: [
        "Businesses handling or moving money.",
        "Tour operators running guided activities.",
        "Contractors and construction firms.",
        "Employers and operators with third-party exposures.",
        "Individuals looking at personal accident protection."
      ]
    },

    audience: "For businesses, contractors, tour operators and individuals.",
    goodToKnow: [
      "These products are arranged individually, so a conversation with ICB is the natural first step.",
      "Tell ICB about the work you do when you enquire.",
      "An ICB representative will guide you through the options that apply."
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
    kicker: "Current product information",
    short: "Sales of ICB Travel Insurance are currently temporarily suspended.",
    standfirst: "ICB has temporarily suspended sales of its Travel Insurance product.",
    /* Sales suspended: no quote path anywhere, on this page or off it. */
    suspended: true,
    quote: false,

    intro: {
      title: "Current status.",
      body: [
        "ICB has temporarily suspended sales of its Travel Insurance product.",
        "Existing customers who require assistance or need to file a Travel Insurance claim can continue to access the published support channels."
      ]
    },

    covers: [],
    audience: null,
    goodToKnow: [
      "The Corporate Office and every ICB branch can share the current Travel Insurance information.",
      "Travel Insurance is also listed in the Resource Centre alongside ICB's other published material."
    ],
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
    standfirst: "Coverage options for motorists travelling into Mexico.",
    /* ICB presents this line entirely through ANA Seguros, so the page
       leads with those pathways. A secondary ICB enquiry may follow, but
       nothing here binds ANA cover. */
    quote: false,

    intro: {
      title: "How ICB provides this cover.",
      body: [
        "ICB provides access to Mexican auto-insurance options through ANA Seguros, a Mexican company specializing in auto insurance."
      ]
    },

    /* Attributed, because it is ANA's description of itself as ICB
       currently presents it, not an ICB or Austere assertion. */
    partner: {
      title: "About ANA Seguros",
      attribution: "As described in ICB's current Mexican Insurance presentation:",
      items: [
        "A 100% Mexican company specializing in auto insurance.",
        "Offices nationwide in Mexico.",
        "Claims service available 24 hours a day, 365 days a year.",
        "Identified by ICB as being among the top 15 insurance companies in Mexico."
      ]
    },

    covers: [],
    audience: "For drivers travelling from Belize into Mexico.",
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

/* Categories a visitor can ask ICB to quote for today. Everything that
   offers a quote reads from this, so a category coming off sale is one
   flag rather than a hunt through the views. */
ICB.DATA.quotableProducts = function () {
  return ICB.DATA.products.filter(function (p) { return p.quote === true; });
};

/* The canonical route into the enquiry flow with the product already
   chosen, so nobody is asked twice what they just clicked. */
ICB.DATA.quoteHref = function (id) {
  return "#/contact?topic=new-cover" + (id ? "&category=" + encodeURIComponent(id) : "");
};

/* One line, used under every quote action. It sets the expectation the
   button must not: a person follows up, nothing is priced or approved
   here. */
ICB.DATA.quoteNote = "Tell us what you need and an ICB representative can follow up regarding available options.";
