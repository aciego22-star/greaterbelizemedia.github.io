/* ============================================================================
   ICB.DATA.askIcb — scripted demonstration content for the Ask ICB interface.
   DATA ONLY. The matching engine lives in js/ask-engine.js and the UI in
   js/ask-icb.js. When the live assistant is connected later, this file and
   the scripted engine are simply not used (see ask-engine.js).

   Guardrails: no response quotes prices, confirms coverage, interprets
   policy language or assesses liability. Responses navigate and inform.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.askIcb = {
  title: "Ask ICB",
  subtitle: "Your digital ICB guide",

  greeting: {
    blocks: [
      { t: "p", text: "Hello. I can help you find the right ICB resource: insurance categories, claims guidance, branches and more." },
      { t: "p", text: "Choose a question below or type your own." }
    ]
  },

  disclaimer: "Ask ICB is a concept preview. It cannot quote, confirm coverage, or assess claims. For policy matters, contact ICB at +501 224-5328.",

  suggestions: [
    "I was just involved in a motor accident. Where do I start?",
    "What's the WhatsApp number for the Belmopan branch?",
    "I own a small business. What types of insurance does ICB offer?",
    "I need insurance for a boat.",
    "Where can I find the property claim form?",
    "How do I pay my premium?"
  ],

  responses: [
    {
      id: "motor-accident",
      match: { groups: [["accident", "crash", "collision", "collided"]], priority: 3 },
      blocks: [
        { t: "p", text: "I'm sorry to hear that. Here is a calm way to start." },
        { t: "p", text: "1. Safety first. If anyone is injured or in danger, contact emergency services immediately." },
        { t: "p", text: "2. When it is safe, note the date, time and place, and take photos of the scene if you can. Report to the police where applicable." },
        { t: "p", text: "3. Then tell ICB as soon as you can, and complete the official Motor Accident Form." },
        { t: "link", label: "Open the motor claim pathway", href: "#/claims@motor" },
        { t: "link", label: "Official claims forms on icbinsurance.com", href: "https://www.icbinsurance.com/claims", external: true },
        { t: "contact", label: "Call ICB, +501 224-5328", href: "tel:+5012245328", kind: "tel" }
      ],
      followups: [4, 1]
    },
    {
      id: "belmopan-branch",
      match: { groups: [["belmopan"]], priority: 4 },
      blocks: [
        { t: "p", text: "The Belmopan Branch is at #6095 South Ring Road, Belmopan City. You can reach it by phone at +501 822-0473." },
        { t: "p", text: "For WhatsApp chat, ICB currently publishes lines at the San Ignacio branch (+501 613-4138) and the Dangriga branch (+501 614-9682)." },
        { t: "contact", label: "Call Belmopan, +501 822-0473", href: "tel:+5018220473", kind: "tel" },
        { t: "contact", label: "WhatsApp San Ignacio", href: "https://wa.me/5016134138", kind: "wa" },
        { t: "link", label: "See every ICB location", href: "#/locations" }
      ],
      followups: [0, 2]
    },
    {
      id: "small-business",
      match: { groups: [["business", "shop", "store", "company", "restaurant", "entrepreneur"]], priority: 3 },
      blocks: [
        { t: "p", text: "ICB works with Belizean businesses of every size. Depending on what your business does, the published categories that most often matter are:" },
        { t: "p", text: "Property Insurance for premises and contents, Motor Insurance for commercial vehicles, Cargo Insurance for goods in transit, Marine Hull for vessels, and Liability & Miscellaneous covers." },
        { t: "link", label: "Explore business insurance", href: "#/business" },
        { t: "link", label: "Start a business enquiry", href: "#/contact?topic=business" }
      ],
      followups: [3, 5]
    },
    {
      id: "boat",
      match: { groups: [["boat", "vessel", "fishing", "skiff", "yacht", "catamaran", "marine", "sailboat"]], priority: 3 },
      blocks: [
        { t: "p", text: "That would be Marine Hull Insurance. It protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability." },
        { t: "p", text: "An ICB representative can look at how your vessel is used and guide you from there." },
        { t: "link", label: "Learn about Marine Hull Insurance", href: "#/insurance/marine" },
        { t: "link", label: "Start an enquiry", href: "#/contact?topic=new-cover&category=marine" }
      ],
      followups: [2, 5]
    },
    {
      id: "property-form",
      match: { groups: [["property", "home", "house", "roof", "building"], ["form", "claim", "claims"]], priority: 3 },
      blocks: [
        { t: "p", text: "The official Property Claim Form is published on ICB's claims page, together with the forms for motor, marine and hurricane claims." },
        { t: "link", label: "Open the property claim pathway", href: "#/claims@property" },
        { t: "link", label: "Official claims forms on icbinsurance.com", href: "https://www.icbinsurance.com/claims", external: true },
        { t: "contact", label: "Call ICB, +501 224-5328", href: "tel:+5012245328", kind: "tel" }
      ],
      followups: [0, 1]
    },
    {
      id: "pay-premium",
      match: { groups: [["pay", "payment", "premium", "bill", "billing"]], priority: 3 },
      blocks: [
        { t: "p", text: "ICB has an online payment portal where policyholders can pay premiums." },
        { t: "link", label: "Open the ICB payment portal", href: "https://billing.icbinsurance.com", external: true },
        { t: "p", text: "You can also pay at any ICB branch. The Locations page lists every branch with contact details." },
        { t: "link", label: "Find ICB near you", href: "#/locations" }
      ],
      followups: [1, 2]
    },
    {
      id: "hurricane",
      match: { groups: [["hurricane", "storm"]], priority: 2 },
      blocks: [
        { t: "p", text: "For storm damage to an insured property, ICB publishes a dedicated Hurricane Claim Form and pathway." },
        { t: "p", text: "Once it is safe, photograph the damage before cleaning up and take reasonable steps to prevent further damage." },
        { t: "link", label: "Open the hurricane claim pathway", href: "#/claims@hurricane" },
        { t: "link", label: "Preparing for hurricane season", href: "#/resources" }
      ],
      followups: [4, 0]
    },
    {
      id: "mexico",
      match: { groups: [["mexico", "mexican", "chetumal", "border"]], priority: 2 },
      blocks: [
        { t: "p", text: "Driving into Mexico? Mexican law requires liability insurance issued by an insurer authorized in Mexico, so it is worth arranging before you travel." },
        { t: "link", label: "Learn about Mexican Insurance", href: "#/insurance/mexican" },
        { t: "link", label: "Start an enquiry", href: "#/contact?topic=new-cover&category=mexican" }
      ],
      followups: [2, 1]
    },
    {
      id: "branches-general",
      match: { groups: [["branch", "branches", "office", "location", "locations", "near", "agency"]], priority: 1 },
      blocks: [
        { t: "p", text: "ICB serves the whole country, from Corozal to Punta Gorda, through branches and agency partners." },
        { t: "link", label: "Find ICB near you", href: "#/locations" },
        { t: "contact", label: "Call the Corporate Office, +501 224-5328", href: "tel:+5012245328", kind: "tel" }
      ],
      followups: [1, 5]
    },
    {
      id: "claims-general",
      match: { groups: [["claim", "claims"]], priority: 1 },
      blocks: [
        { t: "p", text: "ICB publishes a clear pathway and an official form for each claim type: motor, third party motor, property, marine and hurricane." },
        { t: "link", label: "See how claims work", href: "#/claims" },
        { t: "contact", label: "Call ICB, +501 224-5328", href: "tel:+5012245328", kind: "tel" }
      ],
      followups: [0, 4]
    },
    {
      id: "insurance-general",
      match: { groups: [["insurance", "insure", "cover", "coverage", "protect", "policy"]], priority: 0 },
      blocks: [
        { t: "p", text: "ICB offers Property, Motor, Marine Hull, Cargo, Liability & Miscellaneous, Travel and Mexican Insurance." },
        { t: "p", text: "If you tell me what you want to protect, I can point you to the right category. Or explore them all:" },
        { t: "link", label: "Find the right cover", href: "#/insurance" }
      ],
      followups: [3, 2]
    }
  ],

  fallback: {
    blocks: [
      { t: "p", text: "I can help with claims guidance, finding a branch, and learning about ICB's insurance categories. For anything about your own policy, the ICB team is the right place." },
      { t: "contact", label: "Call ICB, +501 224-5328", href: "tel:+5012245328", kind: "tel" },
      { t: "contact", label: "Email icb@icbinsurance.com", href: "mailto:icb@icbinsurance.com", kind: "mail" },
      { t: "link", label: "Start an enquiry", href: "#/contact" }
    ]
  }
};
