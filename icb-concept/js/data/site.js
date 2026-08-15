/* ============================================================================
   ICB.DATA.site — institutional facts, contacts, navigation model.
   SINGLE SOURCE OF TRUTH for operational information.
   Every value here was taken from ICB's current public website. Values marked
   [TBC] could not be verified from here and must be confirmed with ICB
   before this concept is presented as final.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.site = {
  org: {
    name: "ICB",
    fullName: "Insurance Corporation of Belize",
    legalName: "Insurance Corporation of Belize Ltd.",
    founded: 1981,
    founder: "Mr. Erdulfo 'Dufy' Nunez",
    heritageLine: "Protecting Belize since 1981.",
    // Verbatim from the current ICB website:
    serviceQuote: "We are always here for you, from Corozal to Punta Gorda. Contact our friendly staff and let us take care of you.",
    story: "Founded in 1981 by Mr. Erdulfo 'Dufy' Nunez, ICB has grown from a small two-person operation into one of the largest and most trusted insurance providers in Belize.",
    /* Established ICB brand lines. Used sparingly, never stacked. */
    positiveDifference: "Making a positive difference in a changing Belize.",
    journeyLine: "At every step of your life's journey, ICB is there for you.",
    homeLine: "Belize is our home."
  },

  corporate: {
    label: "Corporate Office",
    address: "16 Daly Street",
    poBox: "P.O. Box 519",
    city: "Belize City",
    phoneDisplay: "+501 224-5328",
    phoneAltDisplay: "+501 224-5329",
    phoneTel: "+5012245328",
    email: "icb@icbinsurance.com"
  },

  /* The hero's third slide plays the English campaign film muted and
     looped as ambient motion. The films themselves, with sound and
     controls, live in ICB.DATA.gallery.video. */
  media: {
    heroVideoAvailable: true,
    heroVideoSrc: "assets/video/icb-life-happens-fast.mp4",
    heroVideoPoster: "assets/img/video/life-happens-fast.jpg"
  },

  external: {
    // Official ICB claims page. Replace with direct PDF links when supplied by ICB.
    claimsForms: "https://www.icbinsurance.com/claims",
    consumerResources: "https://www.icbinsurance.com/consumer-resourses",
    payments: "https://billing.icbinsurance.com",
    /* ICB's Mexican Insurance page, which carries the ANA Seguros
       pathways. INTERNAL TODO: swap in the direct ANA Seguros links
       (Buy Now, View Coverage, Claims, FAQs) once ICB supplies them. */
    mexicanInsurance: "https://www.icbinsurance.com/mexican-insurance",
    website: "https://www.icbinsurance.com"
  },

  nav: [
    { id: "insurance", label: "Insurance", href: "#/insurance" },
    { id: "claims", label: "Claims", href: "#/claims" },
    { id: "locations", label: "Locations", href: "#/locations" },
    { id: "gallery", label: "Gallery", href: "#/gallery" },
    { id: "business", label: "Business", href: "#/business" },
    { id: "about", label: "About", href: "#/about" },
    { id: "resources", label: "Resources", href: "#/resources" },
    { id: "contact", label: "Contact", href: "#/contact" }
  ],

  taskRoutes: [
    { id: "cover", label: "I need insurance", short: "Insurance", href: "#/insurance", glyph: "shield" },
    { id: "claim", label: "I need to file a claim", short: "File a claim", href: "#/claims", glyph: "document" },
    { id: "policyholder", label: "I'm an existing policyholder", short: "Pay my premium", href: "https://billing.icbinsurance.com", external: true, note: "Opens ICB's payment portal", glyph: "card" },
    { id: "branch", label: "I need a branch", short: "Find a branch", href: "#/locations", glyph: "marker" },
    { id: "business", label: "I'm looking for business coverage", short: "Business insurance", href: "#/business", glyph: "briefcase" },
    { id: "question", label: "I have a question", short: "Talk to ICB", href: "#/contact", glyph: "chat" }
  ],

  footer: {
    tagline: "Insurance for the things you've built, the people you care about, and the road ahead.",
    columns: [
      {
        heading: "Insurance",
        links: [
          { label: "Property Insurance", href: "#/insurance/property" },
          { label: "Motor Insurance", href: "#/insurance/motor" },
          { label: "Marine Hull Insurance", href: "#/insurance/marine" },
          { label: "Cargo Insurance", href: "#/insurance/cargo" },
          { label: "Liability & Miscellaneous", href: "#/insurance/liability" },
          { label: "Travel Insurance", href: "#/insurance/travel" },
          { label: "Mexican Insurance", href: "#/insurance/mexican" }
        ]
      },
      {
        heading: "Company",
        links: [
          { label: "About ICB", href: "#/about" },
          { label: "Business Insurance", href: "#/business" },
          { label: "Locations", href: "#/locations" },
          { label: "Gallery", href: "#/gallery" },
          { label: "Resource Centre", href: "#/resources" },
          { label: "Contact", href: "#/contact" }
        ]
      },
      {
        heading: "Claims & Support",
        links: [
          { label: "How claims work", href: "#/claims" },
          { label: "Official claims forms", href: "https://www.icbinsurance.com/claims", external: true },
          { label: "Pay my premium", href: "https://billing.icbinsurance.com", external: true },
          { label: "Consumer resources", href: "#/resources" }
        ]
      }
    ],
    legal: "Insurance Corporation of Belize Ltd.",
    conceptNote: "Concept experience by Austere Automations"
  }
};
