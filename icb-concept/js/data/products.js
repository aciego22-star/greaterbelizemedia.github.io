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
    kicker: { en: "Homes, businesses and the places that matter", es: "Hogares, negocios y los lugares que importan" },
    short: { en: "Cover for homes, rented homes, small business premises and commercial property.", es: "Cobertura para viviendas, viviendas alquiladas, locales de pequeños negocios y propiedad comercial." },
    standfirst: { en: "Protecting the property you have built, bought or depend on.", es: "Protegiendo la propiedad que ha construido, comprado o de la que depende." },
    quote: true,

    intro: {
      title: { en: "What Property Insurance is for.", es: "Para qué sirve Property Insurance." },
      body: [
        { en: "Property can represent one of the most significant investments a person or business makes. ICB's Property Insurance options are designed to help protect against insured loss or damage, whether the property is a home, rental residence, small business or commercial operation.", es: "Una propiedad puede ser una de las inversiones más importantes que hace una persona o una empresa. Las opciones de Property Insurance de ICB están diseñadas para ayudar a proteger contra pérdidas o daños asegurados, ya se trate de una vivienda, una residencia de alquiler, un pequeño negocio o una operación comercial." },
        { en: "ICB provides Property Insurance options for Home Owners, Small Business, Commercial properties and Renters, with additional protection available depending on the policy selected.", es: "ICB ofrece opciones de Property Insurance para Home Owners, Small Business, Commercial y Renters, con protección adicional disponible según la póliza que se elija." }
      ]
    },

    /* From ICB's Homeowners Insurance graphic. The three named options are
       ICB's; the one-line explanations are plain-language paraphrase and
       claim nothing beyond the name. */
    coverageOptions: {
      title: { en: "Homeowners Insurance.", es: "Homeowners Insurance." },
      sub: { en: "Owning a home is one of life's biggest investments. ICB's Homeowners Insurance is designed to help protect against unexpected setbacks, including insured damage to the property or loss of belongings caused by covered events.", es: "Tener casa propia es una de las mayores inversiones de la vida. Homeowners Insurance de ICB está diseñado para ayudar a protegerle ante imprevistos, incluidos los daños asegurados a la propiedad o la pérdida de pertenencias por eventos cubiertos." },
      items: [
        {
          name: "Fire, Lightning & Explosion Coverage",
          blurb: { en: "Protection centred on specified fire, lightning and explosion risks.", es: "Protección centrada en riesgos especificados de incendio, rayo y explosión." }
        },
        {
          name: "Fire & Perils Including Major Catastrophic Events",
          blurb: { en: "Broader property protection incorporating additional insured perils and major catastrophic events, subject to the selected policy.", es: "Protección más amplia que incorpora riesgos asegurados adicionales y eventos catastróficos mayores, según la póliza que se elija." }
        },
        {
          name: "Householder's All-Risk Protection",
          blurb: { en: "Broader protection for eligible household contents and belongings, subject to policy terms.", es: "Protección más amplia para el contenido del hogar y las pertenencias elegibles, según los términos de la póliza." },
          /* "All risk" is a product name, not a promise. Saying so plainly
             is the honest reading of it. */
          note: { en: "The name describes the breadth of the option, not cover for every possible event.", es: "El nombre describe la amplitud de la opción, no cobertura para todo evento posible." }
        }
      ],
      after: [
        { en: "Depending on the protection selected, homeowners may also be able to include liability protection where accidental injury or property damage occurs on the premises, as well as additional protection such as burglary cover.", es: "Según la protección que se elija, también puede ser posible incluir protección de responsabilidad civil por lesiones accidentales o daños a la propiedad ocurridos en el inmueble, así como protección adicional como cobertura contra robo." },
        { en: "Homeowners protection can also extend to household contents such as furniture, appliances and electronics, subject to the policy selected.", es: "La protección de Homeowners también puede extenderse al contenido del hogar, como muebles, electrodomésticos y equipos electrónicos, según la póliza que se elija." }
      ]
    },

    /* ICB's published Property categories, unchanged. */
    covers: ["Home Owners", "Small Business", "Commercial", "Renters"],
    coversLabel: { en: "Property categories ICB publishes", es: "Categorías de propiedad que publica ICB" },
    categoryNotes: [
      { name: "Home Owners", note: { en: "Protection options for the home you own and live in.", es: "Opciones de protección para la vivienda que usted posee y habita." } },
      { name: "Small Business", note: { en: "Property protection for eligible small-business premises and assets.", es: "Protección de propiedad para locales y activos elegibles de pequeños negocios." } },
      { name: "Commercial", note: { en: "Property protection designed around commercial premises and related exposures.", es: "Protección de propiedad diseñada para locales comerciales y exposiciones relacionadas." } },
      { name: "Renters", note: { en: "Protection options for renters seeking cover for eligible personal belongings and related risks.", es: "Opciones de protección para inquilinos que buscan cubrir pertenencias personales elegibles y riesgos relacionados." } }
    ],

    /* Named in ICB's material as available additions. Framed as available,
       never as included, which is the distinction that matters here. */
    extensions: {
      title: { en: "Additional protection ICB identifies", es: "Protección adicional que identifica ICB" },
      sub: { en: "Availability depends on the policy selected. None of these is automatically included.", es: "La disponibilidad depende de la póliza que se elija. Ninguna se incluye de forma automática." },
      items: [
        { en: "Liability to the Public", es: "Liability to the Public (responsabilidad ante terceros)" },
        { en: "Compensation for death of the Insured", es: "Compensation for death of the Insured (compensación por fallecimiento del asegurado)" },
        { en: "Business Interruption", es: "Business Interruption (interrupción del negocio)" },
        { en: "Additional expenses for accommodation", es: "Gastos adicionales de alojamiento" },
        { en: "Loss of rent", es: "Pérdida de alquiler" }
      ]
    },

    forWho: {
      title: { en: "Who may find it relevant?", es: "¿A quién le puede servir?" },
      items: [
        { en: "Homeowners protecting the place they live and what is in it.", es: "Propietarios que protegen su vivienda y lo que hay en ella." },
        { en: "Renters looking to cover eligible personal belongings.", es: "Inquilinos que buscan cubrir sus pertenencias elegibles." },
        { en: "Small businesses protecting premises, stock and equipment.", es: "Pequeños negocios que protegen local, inventario y equipo." },
        { en: "Commercial property owners with larger or multi-site exposures.", es: "Propietarios de inmuebles comerciales con exposiciones mayores o en varias sedes." }
      ]
    },

    useful: {
      title: { en: "Know the value of your property.", es: "Conozca el valor de su propiedad." },
      body: [
        { en: "ICB recommends obtaining a current property appraisal so that the level of coverage can reflect the value of the home.", es: "ICB recomienda obtener un avalúo actualizado de la propiedad para que el nivel de cobertura refleje el valor de la vivienda." },
        { en: "When considering the property's value, remember permanent or external features such as patios, pools, fences, docks and other structures that may form part of the property.", es: "Al considerar el valor de la propiedad, recuerde los elementos permanentes o exteriores como patios, piscinas, cercas, muelles y otras estructuras que puedan formar parte de la propiedad." }
      ]
    },

    audience: { en: "For homeowners, renters, small businesses and commercial property owners across Belize.", es: "Para propietarios, inquilinos, pequeños negocios y dueños de propiedad comercial en todo Belice." },
    goodToKnow: [
      { en: "An ICB representative reviews your needs with you before any cover is arranged.", es: "Un representante de ICB revisa sus necesidades con usted antes de contratar cualquier cobertura." },
      { en: "Hurricane and fire preparation information is available in the Resource Centre.", es: "En el Centro de recursos hay información sobre preparación ante huracanes e incendios." },
      { en: "Branch teams across the country can look at your property needs in person.", es: "Los equipos de las sucursales de todo el país pueden ver sus necesidades en persona." }
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
    kicker: { en: "For every vehicle on Belizean roads", es: "Para cada vehículo en las carreteras de Belice" },
    short: { en: "Liability Only, Collision and Upsets, and Comprehensive cover for personal and commercial vehicles.", es: "Cobertura Liability Only, Collision and Upsets y Comprehensive para vehículos personales y comerciales." },
    standfirst: { en: "Protection for the road ahead.", es: "Protección para el camino por delante." },
    quote: true,

    intro: {
      title: { en: "What Motor Insurance is for.", es: "Para qué sirve Motor Insurance." },
      body: [
        { en: "Driving a motor vehicle in Belize requires valid insurance under the law. ICB offers Motor Insurance options designed to help protect motorists from the financial consequences of accidents and other insured events.", es: "Conducir un vehículo en Belice requiere un seguro válido conforme a la ley. ICB ofrece opciones de Motor Insurance diseñadas para ayudar a proteger a los conductores de las consecuencias económicas de accidentes y otros eventos asegurados." },
        { en: "Depending on the protection selected, coverage may address third-party injury, third-party property damage and damage to the insured vehicle.", es: "Según la protección que se elija, la cobertura puede abarcar lesiones a terceros, daños a la propiedad de terceros y daños al vehículo asegurado." }
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
      title: { en: "Motor coverage options highlighted by ICB.", es: "Opciones de cobertura de Motor que destaca ICB." },
      sub: { en: "Figures below are the protection levels ICB publishes. A limit is the most a policy may respond with, not an amount paid on every claim.", es: "Las cifras siguientes son los niveles de protección que publica ICB. Un límite es lo máximo que puede responder una póliza, no un monto que se pague en cada reclamo." },
      items: [
        {
          name: "Third-Party Act",
          tag: { en: "Basic third-party protection", es: "Protección básica ante terceros" },
          blurb: { en: "Can cover repairs where the insured damages another person's vehicle, home or belongings.", es: "Puede cubrir reparaciones cuando el asegurado daña el vehículo, la vivienda o las pertenencias de otra persona." },
          limits: [{ label: { en: "Property damage", es: "Daños a la propiedad" }, value: { en: "Up to BZD $20,000 per claim", es: "Hasta BZD $20,000 por reclamo" } },
                   { label: "Bodily Injury", value: { en: "As described by ICB", es: "Según lo describe ICB" } }]
        },
        {
          name: "Third-Party Act Plus",
          tag: { en: "Additional third-party protection", es: "Protección adicional ante terceros" },
          blurb: { en: "The same underlying protection as Third-Party Act, at a higher protection level.", es: "La misma protección de base que Third-Party Act, con un nivel de protección más alto." },
          limits: [{ label: { en: "Protection level", es: "Nivel de protección" }, value: { en: "Up to BZD $1,000,000", es: "Hasta BZD $1,000,000" } }]
        },
        {
          name: "Third-Party Liability, Levels 1 to 4",
          tag: { en: "Four protection levels", es: "Cuatro niveles de protección" },
          blurb: { en: "Third-party property damage and Bodily Injury, with the benefits ICB lists below. Choose the protection level that suits you.", es: "Daños a la propiedad de terceros y Bodily Injury, con los beneficios que ICB indica abajo. Elija el nivel de protección que le convenga." },
          limits: [{ label: { en: "Medical expenses", es: "Gastos médicos" }, value: { en: "Up to BZD $2,500", es: "Hasta BZD $2,500" } },
                   { label: { en: "Ambulance fee", es: "Servicio de ambulancia" }, value: { en: "Up to BZD $250", es: "Hasta BZD $250" } },
                   { label: "Death Benefit", value: "BZD $10,000" }],
          levels: [
            { name: { en: "Level 1", es: "Nivel 1" }, value: "BZD $300,000" },
            { name: { en: "Level 2", es: "Nivel 2" }, value: "BZD $400,000" },
            { name: { en: "Level 3", es: "Nivel 3" }, value: "BZD $500,000" },
            { name: { en: "Level 4", es: "Nivel 4" }, value: "BZD $1,000,000" }
          ]
        },
        {
          name: "Comprehensive",
          tag: { en: "Broader protection", es: "Protección más amplia" },
          blurb: { en: "May address third-party injury and property damage, insured vehicle damage arising from accidents, fire, theft, broken windshield, and accidental injury benefits.", es: "Puede abarcar lesiones y daños a terceros, daños al vehículo asegurado por accidente, incendio, robo, parabrisas roto y beneficios por lesiones accidentales." },
          flag: { en: "Vehicle inspection required", es: "Se requiere inspección del vehículo" }
        }
      ]
    },

    /* ICB's published website classification, kept exactly as it is. */
    covers: ["Liability Only", "Collision and Upsets", "Comprehensive"],
    coversLabel: { en: "Types of cover", es: "Tipos de cobertura" },
    availableFor: ["Personal Vehicles", "Commercial Vehicles", "Taxis & Buses", "Heavy Duty Vehicles"],

    forWho: {
      title: { en: "Who may find it relevant?", es: "¿A quién le puede servir?" },
      body: { en: "ICB provides Motor Insurance options for personal and commercial motorists, including taxis, buses and heavy-duty vehicles.", es: "ICB ofrece opciones de Motor Insurance para conductores particulares y comerciales, incluidos taxis, autobuses y vehículos de carga pesada." },
      items: [
        { en: "Private drivers insuring a personal vehicle.", es: "Conductores particulares que aseguran un vehículo personal." },
        { en: "Businesses running commercial vehicles or a fleet.", es: "Empresas con vehículos comerciales o una flota." },
        { en: "Taxi and bus operators carrying passengers.", es: "Operadores de taxis y autobuses que transportan pasajeros." },
        { en: "Owners of heavy duty vehicles and equipment.", es: "Propietarios de vehículos y equipo de carga pesada." }
      ]
    },

    audience: { en: "For private drivers, commercial operators, taxi and bus operators, and heavy duty vehicle owners.", es: "Para conductores particulares, operadores comerciales, operadores de taxis y autobuses, y propietarios de vehículos de carga pesada." },
    goodToKnow: [
      { en: "Tell ICB how the vehicle is used. Personal, commercial and passenger use are looked at differently.", es: "Indique a ICB cómo se usa el vehículo. El uso personal, comercial y de pasajeros se evalúa de forma distinta." },
      { en: "Driving into Mexico? ICB offers Mexican Insurance through ANA Seguros.", es: "¿Va a manejar a México? ICB ofrece Mexican Insurance a través de ANA Seguros." },
      { en: "If you are ever in an accident, the Claims section links to the official form.", es: "Si alguna vez tiene un accidente, la sección de Reclamos enlaza al formulario oficial." }
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
    kicker: { en: "For the vessels that work and play on our waters", es: "Para las embarcaciones que trabajan y navegan en nuestras aguas" },
    short: { en: "Protects against physical loss or damage to the insured property, and can be customized to cover third party and passenger liability.", es: "Protege contra la pérdida o el daño físico de la propiedad asegurada, y puede personalizarse para cubrir la responsabilidad ante terceros y pasajeros." },
    standfirst: { en: "Protection for vessels on Belize's waters and beyond.", es: "Protección para embarcaciones en aguas de Belice y más allá." },
    quote: true,

    intro: {
      title: { en: "What Marine Hull Insurance is for.", es: "Para qué sirve Marine Hull Insurance." },
      body: [
        { en: "Marine vessels represent significant working and personal assets. ICB's Marine Hull Insurance is designed to protect insured vessels against physical loss or damage, with options that may also be customized to include third-party and passenger liability.", es: "Las embarcaciones representan activos de trabajo y personales de gran valor. Marine Hull Insurance de ICB está diseñado para proteger las embarcaciones aseguradas contra pérdida o daño físico, con opciones que también pueden personalizarse para incluir responsabilidad ante terceros y pasajeros." }
      ]
    },

    covers: [{ en: "Barges", es: "Barcazas" }, { en: "Tug Boats", es: "Remolcadores" }, { en: "Dredgers", es: "Dragas" }, { en: "Water Taxis", es: "Taxis acuáticos" }, { en: "Fishing Vessels", es: "Embarcaciones de pesca" }, { en: "Yachts", es: "Yates" }, { en: "Personal Vessels", es: "Embarcaciones particulares" }],
    coversLabel: { en: "Vessels ICB publishes cover for", es: "Embarcaciones para las que ICB publica cobertura" },

    forWho: {
      title: { en: "Who may find it relevant?", es: "¿A quién le puede servir?" },
      body: { en: "Marine Hull Insurance may be relevant to vessel owners and operators using boats for commercial, passenger, fishing or personal purposes.", es: "Marine Hull Insurance puede servirle a dueños y operadores de embarcaciones que las usan con fines comerciales, de pasajeros, de pesca o particulares." },
      items: [
        { en: "Commercial operators running barges, tugs or dredgers.", es: "Operadores comerciales con barcazas, remolcadores o dragas." },
        { en: "Water taxi operators carrying passengers.", es: "Operadores de taxis acuáticos que llevan pasajeros." },
        { en: "Fishing vessel owners.", es: "Dueños de embarcaciones de pesca." },
        { en: "Private owners of yachts and personal vessels.", es: "Dueños particulares de yates y embarcaciones personales." }
      ]
    },

    audience: { en: "For vessel owners and operators across Belize.", es: "Para dueños y operadores de embarcaciones en todo Belice." },
    /* No branch-specialty claims here. Which branches handle which line of
       cover is not published by ICB, so the copy says "any ICB location". */
    goodToKnow: [
      { en: "Cover can be customized to include third party and passenger liability.", es: "La cobertura puede personalizarse para incluir responsabilidad ante terceros y pasajeros." },
      { en: "Tell ICB how the vessel is used when you enquire.", es: "Al consultar, dígale a ICB cómo se usa la embarcación." },
      { en: "Any ICB location can put you in touch about Marine Hull Insurance.", es: "Cualquier oficina de ICB puede ponerle en contacto sobre Marine Hull Insurance." }
    ],
    status: null,
    /* The hero photograph is a boat seen side on: bow, canopy, stern and
       the black lower hull all have to stay in frame, and no single crop
       does that at every shape of hero. "whole" tells the hero to shape
       itself around the photograph. */
    heroPhoto: "whole",
    glyph: "boat",
    artMotif: "marine",
    related: ["cargo", "liability"],
    claimPathways: ["marine"]
  },

  {
    id: "cargo",
    route: "#/insurance/cargo",
    name: "Cargo Insurance",
    kicker: { en: "For goods on the move", es: "Para la mercancía en movimiento" },
    short: { en: "Protects against physical loss or damages to the insured property while in transit from warehouse to warehouse.", es: "Protege contra la pérdida o los daños físicos de la propiedad asegurada mientras está en tránsito de bodega a bodega." },
    standfirst: { en: "Protection while your goods are on the move.", es: "Protección mientras su mercancía está en camino." },
    quote: true,

    intro: {
      title: { en: "What Cargo Insurance is for.", es: "Para qué sirve Cargo Insurance." },
      body: [
        { en: "Businesses depend on goods reaching their destination safely. ICB's Cargo Insurance is designed to protect insured property against physical loss or damage while in transit from warehouse to warehouse.", es: "Los negocios dependen de que la mercancía llegue a su destino sin contratiempos. Cargo Insurance de ICB está diseñado para proteger la propiedad asegurada contra pérdida o daño físico mientras está en tránsito de bodega a bodega." }
      ]
    },

    whyInsure: {
      title: { en: "Why Cargo Insurance?", es: "¿Por qué Cargo Insurance?" },
      body: [
        { en: "Whether goods are moving within Belize or across international routes, transit introduces risks that may not exist while products remain at a fixed location. Cargo Insurance provides a way to protect eligible goods during that movement, subject to the selected policy.", es: "Ya sea que la mercancía se mueva dentro de Belice o por rutas internacionales, el tránsito trae riesgos que no existen mientras los productos permanecen en un solo lugar. Cargo Insurance ofrece una manera de proteger la mercancía elegible durante ese movimiento, según la póliza que se elija." }
      ]
    },

    covers: [{ en: "Air Transit", es: "Tránsito aéreo" }, { en: "Land Transit", es: "Tránsito terrestre" }, { en: "Marine Transit", es: "Tránsito marítimo" }, { en: "Domestic Transit", es: "Tránsito nacional" }, { en: "Overseas Transit", es: "Tránsito al extranjero" }],
    coversLabel: { en: "Transit ICB publishes cover for", es: "Tránsitos para los que ICB publica cobertura" },

    forWho: {
      title: { en: "Who may find it relevant?", es: "¿A quién le puede servir?" },
      items: [
        { en: "Importers and exporters moving goods across borders.", es: "Importadores y exportadores que mueven mercancía a través de fronteras." },
        { en: "Distributors and wholesalers moving stock within Belize.", es: "Distribuidores y mayoristas que mueven inventario dentro de Belice." },
        { en: "Businesses shipping equipment or materials between sites.", es: "Negocios que envían equipo o materiales entre sedes." },
        { en: "Anyone responsible for goods while they are in transit.", es: "Cualquier persona responsable de la mercancía mientras está en tránsito." }
      ]
    },

    audience: { en: "For importers, exporters, distributors and businesses that move goods.", es: "Para importadores, exportadores, distribuidores y negocios que mueven mercancía." },
    goodToKnow: [
      { en: "Cover follows the goods from warehouse to warehouse.", es: "La cobertura acompaña la mercancía de bodega a bodega." },
      { en: "Describe the route and the goods when you enquire.", es: "Al consultar, describa la ruta y la mercancía." },
      { en: "An ICB representative can go through the details with you.", es: "Un representante de ICB puede repasar los detalles con usted." }
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
    kicker: { en: "Specialty cover for wider responsibilities", es: "Cobertura especializada para responsabilidades más amplias" },
    short: { en: "Money Insurance, Personal Accident, Tour Operators Liability, General Liability and Contractors All Risk.", es: "Money Insurance, Personal Accident, Tour Operators Liability, General Liability y Contractors All Risk." },
    standfirst: { en: "Protection for risks that do not always fit into a standard property, motor or marine policy.", es: "Protección para riesgos que no siempre encajan en una póliza estándar de propiedad, vehículo o embarcación." },
    quote: true,

    intro: {
      title: { en: "A group of products, not a single policy.", es: "Un grupo de productos, no una sola póliza." },
      body: [
        { en: "Businesses and individuals can face risks beyond physical property damage. ICB offers a range of Liability & Miscellaneous insurance options designed around specific personal and commercial exposures.", es: "Los negocios y las personas pueden enfrentar riesgos más allá del daño físico a la propiedad. ICB ofrece una gama de opciones de Liability & Miscellaneous diseñadas en torno a exposiciones personales y comerciales específicas." },
        { en: "Each is arranged individually around what you actually do, so the natural first step is a conversation with an ICB representative.", es: "Cada una se arma de forma individual según lo que usted realmente hace, por eso el primer paso natural es conversar con un representante de ICB." }
      ]
    },

    /* Introductory descriptions only. No limits, exclusions, occupations,
       project sizes or eligibility rules, none of which ICB publishes. */
    coverageOptions: {
      title: { en: "What ICB publishes under Liability & Miscellaneous.", es: "Lo que ICB publica bajo Liability & Miscellaneous." },
      sub: { en: "Short introductions only. An ICB representative can explain how any of them would apply to your situation.", es: "Solo introducciones breves. Un representante de ICB puede explicarle cómo aplicaría cualquiera de ellas a su situación." },
      items: [
        { name: "Money Insurance",
          blurb: { en: "An option for businesses seeking protection around eligible money-related risks.", es: "Una opción para negocios que buscan protección frente a riesgos elegibles relacionados con el manejo de dinero." } },
        { name: "Personal Accident",
          blurb: { en: "Protection designed around eligible accidental-injury risks.", es: "Protección diseñada en torno a riesgos elegibles de lesión accidental." } },
        { name: "Tour Operators Liability",
          blurb: { en: "Liability protection intended for eligible tour-operator activities.", es: "Protección de responsabilidad civil pensada para actividades elegibles de operadores turísticos." } },
        { name: "General Liability",
          blurb: { en: "Protection intended for eligible third-party liability exposures arising from business operations.", es: "Protección pensada para exposiciones elegibles de responsabilidad ante terceros derivadas de la operación del negocio." } },
        { name: "Contractors All Risk",
          blurb: { en: "Insurance designed around eligible risks associated with construction and contracting projects.", es: "Seguro diseñado en torno a riesgos elegibles asociados con proyectos de construcción y contratación." } }
      ]
    },

    covers: ["Money Insurance", "Personal Accident", "Tour Operators Liability", "General Liability", "Contractors All Risk"],

    forWho: {
      title: { en: "Who may find it relevant?", es: "¿A quién le puede servir?" },
      items: [
        { en: "Businesses handling or moving money.", es: "Negocios que manejan o trasladan dinero." },
        { en: "Tour operators running guided activities.", es: "Operadores turísticos que realizan actividades guiadas." },
        { en: "Contractors and construction firms.", es: "Contratistas y empresas de construcción." },
        { en: "Employers and operators with third-party exposures.", es: "Empleadores y operadores con exposiciones ante terceros." },
        { en: "Individuals looking at personal accident protection.", es: "Personas que consideran protección por accidentes personales." }
      ]
    },

    audience: { en: "For businesses, contractors, tour operators and individuals.", es: "Para negocios, contratistas, operadores turísticos y personas particulares." },
    goodToKnow: [
      { en: "These products are arranged individually, so a conversation with ICB is the natural first step.", es: "Estos productos se arman de forma individual, por eso conversar con ICB es el primer paso natural." },
      { en: "Tell ICB about the work you do when you enquire.", es: "Al consultar, cuéntele a ICB a qué se dedica." },
      { en: "An ICB representative will guide you through the options that apply.", es: "Un representante de ICB le guiará por las opciones que apliquen." }
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
    kicker: { en: "Current product information", es: "Información actual del producto" },
    short: { en: "Sales of ICB Travel Insurance are currently temporarily suspended.", es: "La venta de Travel Insurance de ICB está temporalmente suspendida." },
    standfirst: { en: "ICB has temporarily suspended sales of its Travel Insurance product.", es: "ICB ha suspendido temporalmente la venta de su producto Travel Insurance." },
    /* Sales suspended: no quote path anywhere, on this page or off it. */
    suspended: true,
    quote: false,

    intro: {
      title: { en: "Current status.", es: "Estado actual." },
      body: [
        { en: "ICB has temporarily suspended sales of its Travel Insurance product.", es: "ICB ha suspendido temporalmente la venta de su producto Travel Insurance." },
        { en: "Existing customers who require assistance or need to file a Travel Insurance claim can continue to access the published support channels.", es: "Los clientes actuales que necesiten ayuda o deban presentar un reclamo de Travel Insurance pueden seguir usando los canales de atención publicados." }
      ]
    },

    covers: [],
    audience: null,
    goodToKnow: [
      { en: "The Corporate Office and every ICB branch can share the current Travel Insurance information.", es: "La Oficina Corporativa y todas las sucursales de ICB pueden darle la información vigente sobre Travel Insurance." },
      { en: "Travel Insurance is also listed in the Resource Centre alongside ICB's other published material.", es: "Travel Insurance también aparece en el Centro de recursos junto con el demás material publicado por ICB." }
    ],
    status: {
      tone: "notice",
      text: { en: "Existing customers who require support with a Travel Insurance claim can contact ICB for the published support information. ICB will publish current information when there is an update.", es: "Los clientes actuales que necesiten apoyo con un reclamo de Travel Insurance pueden comunicarse con ICB para obtener la información de atención publicada. ICB publicará información actualizada cuando haya novedades." }
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
    kicker: { en: "Driving into Mexico?", es: "¿Va manejando hacia México?" },
    short: { en: "Access ICB's Mexican Insurance options through ANA Seguros.", es: "Acceda a las opciones de Mexican Insurance de ICB a través de ANA Seguros." },
    standfirst: { en: "Coverage options for motorists travelling into Mexico.", es: "Opciones de cobertura para conductores que viajan a México." },
    /* ICB presents this line entirely through ANA Seguros, so the page
       leads with those pathways. A secondary ICB enquiry may follow, but
       nothing here binds ANA cover. */
    quote: false,

    intro: {
      title: { en: "How ICB provides this cover.", es: "Cómo ofrece ICB esta cobertura." },
      body: [
        { en: "ICB provides access to Mexican auto-insurance options through ANA Seguros, a Mexican company specializing in auto insurance.", es: "ICB da acceso a opciones de seguro de auto mexicano a través de ANA Seguros, una empresa mexicana especializada en seguros de auto." }
      ]
    },

    /* Attributed, because it is ANA's description of itself as ICB
       currently presents it, not an ICB or Austere assertion. */
    partner: {
      title: { en: "About ANA Seguros", es: "Sobre ANA Seguros" },
      attribution: { en: "As described in ICB's current Mexican Insurance presentation:", es: "Según lo describe la presentación actual de Mexican Insurance de ICB:" },
      items: [
        { en: "A 100% Mexican company specializing in auto insurance.", es: "Una empresa 100% mexicana especializada en seguros de auto." },
        { en: "Offices nationwide in Mexico.", es: "Oficinas en todo México." },
        { en: "Claims service available 24 hours a day, 365 days a year.", es: "Servicio de reclamos disponible 24 horas al día, los 365 días del año." },
        { en: "Identified by ICB as being among the top 15 insurance companies in Mexico.", es: "Identificada por ICB como una de las 15 principales aseguradoras de México." }
      ]
    },

    covers: [],
    audience: { en: "For drivers travelling from Belize into Mexico.", es: "Para conductores que viajan de Belice a México." },
    goodToKnow: [
      { en: "ICB's Mexican Insurance is provided through ANA Seguros.", es: "Mexican Insurance de ICB se ofrece a través de ANA Seguros." },
      { en: "The pathways below are the ones ICB publishes: Buy Now, View Coverage, Claims and FAQs.", es: "Las rutas de abajo son las que publica ICB: Buy Now, View Coverage, Claims y FAQs." }
    ],
    /* ANA Seguros pathways published on ICB's Mexican Insurance page.
       INTERNAL TODO: confirm the direct URLs with ICB; these route to the
       ICB page that carries them today. */
    anaPathways: [
      { label: { en: "Buy Now", es: "Comprar ahora" }, key: "mexican" },
      { label: { en: "View Coverage", es: "Ver cobertura" }, key: "mexican" },
      { label: { en: "Claims", es: "Reclamos" }, key: "mexican" },
      { label: { en: "FAQs", es: "Preguntas frecuentes" }, key: "mexican" }
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
ICB.DATA.quoteNote = { en: "Tell us what you need and an ICB representative can follow up regarding available options.", es: "Cuéntenos qué necesita y un representante de ICB puede darle seguimiento sobre las opciones disponibles." };
