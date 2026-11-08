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

  /* ICB's own accounts.

     WHERE THESE CAME FROM. All four were read on 8 Nov 2026 off the
     social icon row of ICB's own cover note site,
     icbcovernote.com/copy-of-home, the page ICB directed us to as
     authoritative. They were not searched for, guessed or assembled
     from a handle: a wrong social link on an insurer's site points
     customers at somebody else's account, so the only acceptable
     source is ICB publishing it themselves.

     The site this one replaces carries only the LinkedIn one, in a
     corner of the header. Facebook and Instagram were asked for;
     LinkedIn is here so the move does not quietly lose the one link
     ICB already had, and YouTube because it is where ICB's own films
     live and this site already features two of them. Any of the four
     can be dropped by deleting its line.

     The Instagram address is stored without the ?hl=en that ICB's
     copy carries. That parameter forces the page into English, which
     is the wrong thing to do to a reader who has chosen Spanish.

     label is the accessible name, not visible text: these render as
     logos alone, so the name on the link is the only thing a screen
     reader has to go on. */
  social: [
    { id: "facebook", network: "Facebook",
      label: { en: "ICB on Facebook", es: "ICB en Facebook" },
      href: "https://www.facebook.com/ICBinsuranceBelize/" },
    { id: "instagram", network: "Instagram",
      label: { en: "ICB on Instagram", es: "ICB en Instagram" },
      href: "https://www.instagram.com/insurancecorporationofbelize/" },
    { id: "linkedin", network: "LinkedIn",
      label: { en: "ICB on LinkedIn", es: "ICB en LinkedIn" },
      href: "https://www.linkedin.com/company/insurance-corporation-of-belize-limited/" },
    { id: "youtube", network: "YouTube",
      label: { en: "ICB on YouTube", es: "ICB en YouTube" },
      href: "https://www.youtube.com/@InsuranceCorporationofBelize" }
  ],

  /* Departments that take enquiries in their own right, as against the
     22 branches and agencies in ICB.DATA.locations.

     Deliberately NOT a location record. It has no address, no opening
     hours and no district, and putting it in that dataset would put a
     telephone number on the map and in the branch finder as though
     somebody could walk into it. The directory is the branch network
     and should stay that way.

     SOURCE: ICB's FAQ document of 27 Oct 2026, under "How can I check
     the status of my claim?". */
  departments: [
    {
      id: "claims",
      name: { en: "Claims Department", es: "Departamento de Reclamos" },
      note: { en: "For the progress of a claim already reported.",
              es: "Para el avance de un reclamo ya reportado." },
      whatsapp: { display: "+501 613-0579", wa: "5016130579" }
    }
  ],

  /* The standard hours, as revised by ICB on 20 Oct 2026: a midday
     close on weekdays and a Saturday morning. Held once here rather
     than copied twenty-odd times. A location overrides them with its
     own hours, which the two border branches do, or opts out entirely
     with hours: false.

     lines is what a reader sees, spec is what the structured data
     publishes. They sit together on purpose: hours written in two
     places drift apart, and a branch whose page and whose Google
     listing disagree is worse than one that publishes neither.

     Written "to" rather than with a dash, which is how the rest of the
     site writes a range. "(Belize time)" is in the directory and left
     off the cards: every one of these offices is in Belize, and the
     phrase would repeat twenty-two times down one page. */
  hours: {
    lines: [
      { en: "Monday to Friday, 8:00 AM to 11:45 AM and 1:00 PM to 5:00 PM",
        es: "Lunes a viernes, 8:00 AM a 11:45 AM y 1:00 PM a 5:00 PM" },
      { en: "Saturday, 8:00 AM to 12:00 PM",
        es: "Sábado, 8:00 AM a 12:00 PM" }
    ],
    spec: [
      { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00", closes: "11:45" },
      { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "13:00", closes: "17:00" },
      { days: ["Saturday"], opens: "08:00", closes: "12:00" }
    ]
  },

  /* The hero's third slide plays the campaign film muted and looped as
     ambient motion, in the language the site is being read in. Both are
     ICB's own cuts, not one subtitled from the other: the English film
     closes on "Life Happens Fast" and the Spanish on "La Vida Pasa
     Rápido". The films themselves, with sound and controls, live in
     ICB.DATA.gallery.video.

     This matters more than a language toggle makes it look. Spanish is
     the fallback language, so a visitor whose browser is not set to
     English lands on the Spanish site without choosing anything, and
     used to be met by the English film.

     Resolved by esc() on the way into the markup, like any other
     {en, es} pair, and the hero is rebuilt on a language change, so the
     swap needs nothing of its own. */
  media: {
    heroVideoAvailable: true,
    heroVideoSrc: {
      en: "assets/video/icb-life-happens-fast.mp4",
      es: "assets/video/icb-life-happens-fast-es.mp4"
    },
    heroVideoPoster: {
      en: "assets/img/video/life-happens-fast.jpg",
      es: "assets/img/video/life-happens-fast-es.jpg"
    }
  },

  external: {
    /* The claim forms are no longer here. ICB supplied the five PDFs on
       21 Oct 2026 and they are served from this site, listed per claim
       type in ICB.DATA.claims. Nothing should link a claimant to the
       site this one replaces. */
    /* Nothing links here any more. ICB's consumer resources page held an
       intro, two PDF downloads and a page of fire-safety bullets; all of
       it was carried across on 8 Nov 2026 and lives at #/resources, with
       the two PDFs served from assets/docs. Kept as a record of where
       the material came from, and because _redirects points the old
       address at our page. */
    consumerResources: "https://www.icbinsurance.com/consumer-resourses",
    /* NO PAYMENT PORTAL. ICB does not take payments through its own
       website. Earlier drafts linked an external billing host and a
       kiosk service; both were wrong and are gone. Payment is by bank
       transfer, explained on the internal #/payments page. */
    /* ICB's Mexican Insurance page, which carries the ANA Seguros
       pathways. The address was verified against the page list ICB's
       IT department supplied on 27 Oct 2026; an earlier draft had it
       pointing at a different page of theirs.

       The direct ANA Seguros links were read off ICB's own Mexican
       Insurance page on 7 Nov 2026 and are now on the product's
       anaPathways in js/data/products.js. Claims and FAQs go straight
       to ANA. Buy Now and View Coverage no longer come here at all:
       ANA's quote tool was carried over on 8 Nov 2026 and both land on
       #/insurance/mexican/quote. This address is now only a fallback
       for a pathway that names no destination of its own. */
    mexicanInsurance: "https://www.icbinsurance.com/ana-seguros-quote",
    /* Short-Term Insurance for visiting drivers. These two are ICB's
       own: shortTermBuy is the system that sells and takes payment for
       it, shortTermGuide is the page explaining the cover and the six
       steps. Both were read on 8 Nov 2026 and are set out at
       #/insurance/motor/visitors.

       They are the exception to the note above about payments. ICB
       takes no card payment for an ordinary premium, and this site
       takes none at all; this one product is bought and paid for on
       ICB's own kiosk system, which is why it is linked rather than
       embedded. A card field belongs on the origin whose name is in
       the address bar. */
    shortTermBuy: "https://kiosk.icbinsurance.com",
    shortTermGuide: "https://www.icbcovernote.com",
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
    /* "What's New" rather than "What's New at ICB": the bar is already
       nine words long and the longer label is the page's own heading,
       not a nav item. Measured at every width from 1100, where the bar
       appears, to 1920, in both languages: the row stays on one line
       and the cover button stays on screen. */
    { id: "news", label: { en: "What's New", es: "Novedades" }, href: "#/news" },
    /* Named "Bee AI" rather than "Bee": in a row of plain words with no
       mascot beside it, "Bee" tells a first-time visitor nothing. Not
       translated, because it is the assistant's name. Sits beside
       Contact, since both answer the question of how to reach ICB. */
    { id: "bee", label: "Bee AI", href: "#/bee" },
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
          /* ICB asked on 8 Nov 2026 for the short-term cover sold to
             visiting drivers at the border to be reachable from the
             footer. Its name is ICB's, so it stays in English in both
             languages like every other product name here. */
          { label: "Short-Term Insurance", href: "#/insurance/motor/visitors" },
          { label: "Marine Hull Insurance", href: "#/insurance/marine" },
          { label: "Cargo Insurance", href: "#/insurance/cargo" },
          { label: "Liability & Miscellaneous", href: "#/insurance/liability" },
          { label: "Mexican Insurance", href: "#/insurance/mexican" }
        ]
      },
      {
        heading: { en: "Company", es: "La empresa" },
        links: [
          { label: { en: "About ICB", es: "Sobre ICB" }, href: "#/about" },
          { label: { en: "What's New at ICB", es: "Novedades de ICB" }, href: "#/news" },
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
          { label: { en: "Questions and answers", es: "Preguntas y respuestas" }, href: "#/faq" },
          { label: { en: "How claims work", es: "Cómo funcionan los reclamos" }, href: "#/claims" },
          /* The assistant's own page. Filed here rather than in the main
             navigation: someone looking for it is usually asking what it
             is or what happens to what they type into it, and this is
             where a visitor looks for that kind of answer. */
          { label: { en: "Bee, the ICB assistant", es: "Bee, el asistente de ICB" }, href: "#/bee" },
          { label: { en: "Official claims forms", es: "Formularios oficiales de reclamo" }, href: "#/claims@forms" },
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
