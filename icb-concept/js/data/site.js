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
    heritageLine: { en: "Protecting Belize since 1981.", es: "Protegiendo a Belice desde 1981." },
    // Verbatim from the current ICB website:
    serviceQuote: { en: "We are always here for you, from Corozal to Punta Gorda. Contact our friendly staff and let us take care of you.", es: "Siempre estamos aquí para usted, desde Corozal hasta Punta Gorda. Comuníquese con nuestro personal y con gusto le atenderemos." },
    story: { en: "Founded in 1981 by Mr. Erdulfo 'Dufy' Nunez, ICB has grown from a small two-person operation into one of the largest and most trusted insurance providers in Belize.", es: "Fundada en 1981 por el Sr. Erdulfo 'Dufy' Nunez, ICB pasó de ser una operación de dos personas a una de las aseguradoras más grandes y de mayor confianza de Belice." },
    /* Established ICB brand lines. Used sparingly, never stacked. */
    /* ICB's own slogan, on their signage in English. Left in English in
       both languages: translating a company's slogan without approval
       puts words in their mouth, and this one is painted on a wall. */
    positiveDifference: "Making a positive difference in a changing Belize.",
    journeyLine: { en: "At every step of your life's journey, ICB is there for you.", es: "En cada paso de su vida, ICB está con usted." },
    homeLine: { en: "Belize is our home.", es: "Belice es nuestro hogar." }
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
    /* NO PAYMENT PORTAL. ICB does not take payments through its own
       website. Earlier drafts linked an external billing host and a
       kiosk service; both were wrong and are gone. Payment is by bank
       transfer, explained on the internal #/payments page. */
    /* ICB's Mexican Insurance page, which carries the ANA Seguros
       pathways. INTERNAL TODO: swap in the direct ANA Seguros links
       (Buy Now, View Coverage, Claims, FAQs) once ICB supplies them. */
    mexicanInsurance: "https://www.icbinsurance.com/micro-insurance",
    website: "https://www.icbinsurance.com"
  },

  /* Read by the mobile menu. The desktop bar in index.html mirrors this
     list minus Home: up there the logo sits inches away and is always
     visible, so the word would be redundant. In the menu it is not, since
     someone scanning a list of destinations should find one that says
     where the front door is. */
  nav: [
    { id: "home", label: { en: "Home", es: "Inicio" }, href: "#/" },
    { id: "insurance", label: { en: "Insurance", es: "Seguros" }, href: "#/insurance" },
    { id: "claims", label: { en: "Claims", es: "Reclamos" }, href: "#/claims" },
    { id: "locations", label: { en: "Locations", es: "Ubicaciones" }, href: "#/locations" },
    { id: "gallery", label: { en: "Gallery", es: "Galería" }, href: "#/gallery" },
    { id: "business", label: { en: "Business", es: "Empresas" }, href: "#/business" },
    { id: "about", label: { en: "About", es: "Nosotros" }, href: "#/about" },
    { id: "resources", label: { en: "Resources", es: "Recursos" }, href: "#/resources" },
    { id: "contact", label: { en: "Contact", es: "Contacto" }, href: "#/contact" }
  ],

  taskRoutes: [
    { id: "cover", label: { en: "I need insurance", es: "Necesito un seguro" }, short: { en: "Insurance", es: "Seguros" }, href: "#/insurance", glyph: "shield" },
    { id: "claim", label: { en: "I need to file a claim", es: "Necesito presentar un reclamo" }, short: { en: "File a claim", es: "Presentar un reclamo" }, href: "#/claims", glyph: "document" },
    /* Internal route. ICB does not take payments on its website, so this
       goes to the bank-transfer instructions rather than off-site. */
    { id: "payment", label: { en: "I need to make a payment", es: "Necesito hacer un pago" }, short: { en: "Make a payment", es: "Hacer un pago" }, href: "#/payments", note: { en: "Bank transfer instructions", es: "Instrucciones de transferencia bancaria" }, glyph: "card" },
    { id: "branch", label: { en: "I need a branch", es: "Necesito una sucursal" }, short: { en: "Find a branch", es: "Buscar una sucursal" }, href: "#/locations", glyph: "marker" },
    { id: "business", label: { en: "I'm looking for business coverage", es: "Busco cobertura para mi empresa" }, short: { en: "Business insurance", es: "Seguros para empresas" }, href: "#/business", glyph: "briefcase" },
    { id: "question", label: { en: "I have a question", es: "Tengo una pregunta" }, short: { en: "Talk to ICB", es: "Hablar con ICB" }, href: "#/contact", glyph: "chat" }
  ],

  footer: {
    tagline: { en: "Insurance for the things you've built, the people you care about, and the road ahead.", es: "Seguros para lo que ha construido, para quienes le importan y para el camino por delante." },
    columns: [
      {
        heading: { en: "Insurance", es: "Seguros" },
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
        heading: { en: "Company", es: "La empresa" },
        links: [
          { label: { en: "About ICB", es: "Sobre ICB" }, href: "#/about" },
          { label: { en: "Business Insurance", es: "Seguros para empresas" }, href: "#/business" },
          { label: { en: "Locations", es: "Ubicaciones" }, href: "#/locations" },
          { label: { en: "Gallery", es: "Galería" }, href: "#/gallery" },
          { label: { en: "Resource Centre", es: "Centro de recursos" }, href: "#/resources" },
          { label: { en: "Contact", es: "Contacto" }, href: "#/contact" }
        ]
      },
      {
        heading: { en: "Claims & Support", es: "Reclamos y ayuda" },
        links: [
          { label: { en: "How claims work", es: "Cómo funcionan los reclamos" }, href: "#/claims" },
          { label: { en: "Official claims forms", es: "Formularios oficiales de reclamo" }, href: "https://www.icbinsurance.com/claims", external: true },
          { label: { en: "How to pay ICB", es: "Cómo pagarle a ICB" }, href: "#/payments" },
          { label: { en: "Consumer resources", es: "Recursos para el cliente" }, href: "#/resources" }
        ]
      }
    ],
    legal: "Insurance Corporation of Belize Ltd.",
    /* The agency credit. conceptLead names the studio and is the linked
       part; the rest of the sentence stays plain text, so the line reads
       as attribution rather than as an advert. */
    conceptNote: { en: "Concept experience by ", es: "Concepto creado por " },
    conceptLead: "Austere Automations",
    conceptHref: "https://austereautomations.com/website-development-belize"
  }
};
