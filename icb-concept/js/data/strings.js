/* ============================================================================
   ICB.STRINGS — the words the views put on screen, in both languages.

   Content that belongs to a product, a branch or a page lives in its own
   data file as an { en, es } pair. THIS file is for the shared furniture:
   headings, buttons, labels, the words around the content. One place, so
   a translator can read them together and so the same button says the
   same thing everywhere.

   {named} slots are filled at call time. "Call {n}" stays a single
   sentence in both languages rather than being concatenated from pieces,
   which is what lets Spanish put the words in a different order.

   NOT TRANSLATED, on purpose: ICB's published product names, claim form
   names, branch names, bank names and account numbers. See js/i18n.js for
   why. If a string below contains one of those, the name is left in
   English inside the Spanish sentence.

   INTERNAL TODO: the Spanish is written for this concept and has not been
   reviewed by ICB. scratchpad/check/strings-export.js dumps every Spanish
   string for a Belizean Spanish speaker to check in one pass.
   ========================================================================== */
window.ICB = window.ICB || {};

ICB.STRINGS = {
  en: {
    /* ---- chrome ---- */
    langSwitchTo: "Switch to {lang}",
    langNow: "Site language: {lang}",
    skipToContent: "Skip to content",
    mobileNav: "Mobile",
    quickActions: "Quick actions",
    exploreInsurance: "Explore Insurance",
    backToTop: "Back to top",
    belize: "Belize",
    qbCall: "Call",
    qbBranches: "Branches",
    qbEnquire: "Enquire",
    callN: "Call {n}",
    emailICB: "Email ICB",
    emailN: "Email {n}",
    contactICB: "Contact ICB",
    talkToICB: "Talk to ICB",
    visitABranch: "Visit a branch",
    findYourBranch: "Find your branch",
    learnMore: "Learn more",
    requestQuote: "Request a quote",
    viewCurrentInfo: "View current information",
    openInNewTab: "opens in a new tab, {host}",

    /* ---- breadcrumbs and page furniture ---- */
    home: "Home",
    breadcrumb: "Breadcrumb",
    relatedEyebrow: "Related",
    relatedTitle: "Other ICB insurance categories.",
    nextStepEyebrow: "Take the next step",
    hereToHelp: "Here to help",

    /* ---- product pages ---- */
    coverageOptions: "Coverage options",
    relevance: "Relevance",
    whatICBPublishes: "What ICB publishes",
    currentStatus: "Current status",
    goodToKnow: "Good to know",
    ifSomethingHappens: "If something happens",
    claimFormsNote: "The official ICB claim forms and the route to the claims team are one click away.",
    availableFor: "Available for",
    whatICBOffers: "What ICB offers",
    throughANA: "Through ANA Seguros",
    anaNote: "Opens ICB's Mexican Insurance page on icbinsurance.com.",
    campaignCaption: "From ICB's Protect Your Investment campaign",
    pleaseNote: "Please note.",
    readyToTalk: "Ready to talk about {product}?",
    talkAboutProduct: "Talk to ICB about {product}.",
    contactAboutProduct: "Contact ICB about {product}.",
    suspendedBandBody: "Call, send a message, or walk into any branch and the ICB team will share the current information.",
    plainBandBody: "Call, send a message, or walk into any branch and an ICB representative will take it from there.",
    learnAboutProduct: "Learn about {product}",
    goToANA: "Go to ANA Seguros pathways",
    buyNow: "Buy Now",

    /* ---- guided discovery ---- */
    quizTitle: "What are you looking to protect?",
    quizGroupLabel: "Choose what you want to protect",
    quizStart: "A good place to start",
    quizBusinessTitle: "Business insurance",
    exploreBusiness: "Explore business insurance",
    quizUnsureTitle: "Talk it through with ICB",
    quizUnsureExtra: "Liability & Miscellaneous is ICB's published category for specialty cover.",

    /* ---- claims ---- */
    claimsFormBtn: "{form}",
    claimsFormNote: "Opens the official form page on icbinsurance.com.",

    /* ---- locations ---- */
    filterByDistrict: "Filter by district",
    allDistricts: "All",
    browseLocations: "Browse locations",
    locationCount: "{n} locations",
    locationCountOne: "{n} location",
    acrossBelize: "across Belize",
    inDistrict: "in {district} District",
    locTypeBranch: "Branch",
    locTypeAgency: "Agency",
    locTypeCorporateOffice: "Corporate Office",
    callABranch: "Call a branch",
    chatOnWhatsApp: "Chat on WhatsApp",
    directions: "Directions",
    callDisplay: "Call {n}",
    corporateOfficeN: "Corporate Office {n}",
    belizeAtAGlance: "Belize at a glance",
    mapLabel: "Map of Belize with ICB branch and agency locations",

    /* ---- directories ---- */
    whatsappICB: "WhatsApp ICB",
    whatsappChoose: "Choose a WhatsApp-enabled ICB location.",
    whatsappClose: "Close WhatsApp directory",
    callICB: "Call ICB",
    callChoose: "Choose an ICB location to call.",
    callClose: "Close call directory",
    throughCorporate: "Through the Corporate Office",
    landline: "Landline",
    landlineN: "Landline {n}",
    mobile: "Mobile",
    mobileN: "Mobile {n}",
    district: "{d} District",

    /* ---- payments ---- */
    payments: "Payments",
    makeAPayment: "Make a payment",
    stepByStep: "Step by step",
    sixSteps: "Six steps, start to finish.",
    icbBankAccounts: "ICB bank accounts",
    transferToAccounts: "Transfer to any one of these accounts.",
    accountsHeldAs: "Every account is held in the name {name}.",
    accountName: "Account name",
    accountNumber: "Account number",
    copyAccount: "Copy account number",
    copied: "Copied",
    copyManually: "Press and hold to copy",
    openOrGetApp: "Open or get the app",
    useOnlineBanking: "Use online banking",
    getTheApp: "Get the app:",
    transferElsewhere: "The transfer happens in your bank's app or online banking, not on this page.",
    howPayingWorks: "How paying ICB works.",
    stepFive: "Step 5",
    sendConfirmation: "Send confirmation",

    /* ---- gallery and films ---- */
    icbInMotion: "ICB in Motion",
    theICBFilms: "The ICB films.",
    playFilm: "Play {title}, with sound",
    filmUnavailable: "This film could not be played in this browser.",
    viewLarger: "View larger: {caption}",
    closeImage: "Close image",
    seeOnLocations: "{name}, see it on the Locations page",

    /* ---- hero ---- */
    prevSlide: "Previous slide",
    nextSlide: "Next slide",
    goToSlide: "Go to slide {n}",
    soundOn: "Turn on sound for the ICB film",
    soundOff: "Turn off sound for the ICB film",
    tapForSound: "Tap for sound",
    playICBFilm: "Play the ICB film Life Happens Fast",

    /* ---- contact ---- */
    required: "required",
    optional: "Optional",
    reviewAndSend: "Review and send",
    back: "Back",
    send: "Send",
    change: "Change"
  },

  es: {
    /* ---- chrome ---- */
    langSwitchTo: "Cambiar a {lang}",
    langNow: "Idioma del sitio: {lang}",
    skipToContent: "Ir al contenido",
    mobileNav: "Móvil",
    quickActions: "Acciones rápidas",
    exploreInsurance: "Ver seguros",
    backToTop: "Volver arriba",
    belize: "Belice",
    qbCall: "Llamar",
    qbBranches: "Sucursales",
    qbEnquire: "Consultar",
    callN: "Llamar al {n}",
    emailICB: "Escribir a ICB",
    emailN: "Escribir a {n}",
    contactICB: "Comunicarse con ICB",
    talkToICB: "Hablar con ICB",
    visitABranch: "Visitar una sucursal",
    findYourBranch: "Encontrar su sucursal",
    learnMore: "Más información",
    requestQuote: "Solicitar una cotización",
    viewCurrentInfo: "Ver información actual",
    openInNewTab: "se abre en una pestaña nueva, {host}",

    /* ---- breadcrumbs and page furniture ---- */
    home: "Inicio",
    breadcrumb: "Ruta de navegación",
    relatedEyebrow: "Relacionado",
    relatedTitle: "Otras categorías de seguros de ICB.",
    nextStepEyebrow: "El siguiente paso",
    hereToHelp: "Estamos para ayudarle",

    /* ---- product pages ---- */
    coverageOptions: "Opciones de cobertura",
    relevance: "Para quién",
    whatICBPublishes: "Lo que publica ICB",
    currentStatus: "Situación actual",
    goodToKnow: "Bueno saber",
    ifSomethingHappens: "Si ocurre algo",
    claimFormsNote: "Los formularios oficiales de reclamo de ICB y la vía para comunicarse con el equipo de reclamos están a un clic.",
    availableFor: "Disponible para",
    whatICBOffers: "Lo que ofrece ICB",
    throughANA: "A través de ANA Seguros",
    anaNote: "Abre la página de Mexican Insurance de ICB en icbinsurance.com.",
    campaignCaption: "De la campaña Protect Your Investment de ICB",
    pleaseNote: "Tenga en cuenta.",
    readyToTalk: "¿Listo para hablar sobre {product}?",
    talkAboutProduct: "Hable con ICB sobre {product}.",
    contactAboutProduct: "Comuníquese con ICB sobre {product}.",
    suspendedBandBody: "Llame, envíe un mensaje o visite cualquier sucursal y el equipo de ICB le dará la información actual.",
    plainBandBody: "Llame, envíe un mensaje o visite cualquier sucursal y un representante de ICB le atenderá.",
    learnAboutProduct: "Conocer más sobre {product}",
    goToANA: "Ir a las opciones de ANA Seguros",
    buyNow: "Buy Now",

    /* ---- guided discovery ---- */
    quizTitle: "¿Qué desea proteger?",
    quizGroupLabel: "Elija lo que desea proteger",
    quizStart: "Un buen punto de partida",
    quizBusinessTitle: "Seguros para empresas",
    exploreBusiness: "Ver seguros para empresas",
    quizUnsureTitle: "Conversémoslo con ICB",
    quizUnsureExtra: "Liability & Miscellaneous es la categoría que ICB publica para coberturas especializadas.",

    /* ---- claims ---- */
    claimsFormBtn: "{form}",
    claimsFormNote: "Abre la página del formulario oficial en icbinsurance.com.",

    /* ---- locations ---- */
    filterByDistrict: "Filtrar por distrito",
    allDistricts: "Todos",
    browseLocations: "Ver ubicaciones",
    locationCount: "{n} ubicaciones",
    locationCountOne: "{n} ubicación",
    acrossBelize: "en todo Belice",
    inDistrict: "en el distrito de {district}",
    locTypeBranch: "Sucursal",
    locTypeAgency: "Agencia",
    locTypeCorporateOffice: "Oficina Corporativa",
    callABranch: "Llamar a una sucursal",
    chatOnWhatsApp: "Escribir por WhatsApp",
    directions: "Cómo llegar",
    callDisplay: "Llamar al {n}",
    corporateOfficeN: "Oficina Corporativa {n}",
    belizeAtAGlance: "Belice de un vistazo",
    mapLabel: "Mapa de Belice con las sucursales y agencias de ICB",

    /* ---- directories ---- */
    whatsappICB: "WhatsApp ICB",
    whatsappChoose: "Elija una ubicación de ICB con WhatsApp.",
    whatsappClose: "Cerrar el directorio de WhatsApp",
    callICB: "Llamar a ICB",
    callChoose: "Elija una ubicación de ICB para llamar.",
    callClose: "Cerrar el directorio telefónico",
    throughCorporate: "A través de la Oficina Corporativa",
    landline: "Fijo",
    landlineN: "Fijo {n}",
    mobile: "Celular",
    mobileN: "Celular {n}",
    district: "Distrito de {d}",

    /* ---- payments ---- */
    payments: "Pagos",
    makeAPayment: "Hacer un pago",
    stepByStep: "Paso a paso",
    sixSteps: "Seis pasos, de principio a fin.",
    icbBankAccounts: "Cuentas bancarias de ICB",
    transferToAccounts: "Transfiera a cualquiera de estas cuentas.",
    accountsHeldAs: "Todas las cuentas están a nombre de {name}.",
    accountName: "Nombre de la cuenta",
    accountNumber: "Número de cuenta",
    copyAccount: "Copiar número de cuenta",
    copied: "Copiado",
    copyManually: "Mantenga presionado para copiar",
    openOrGetApp: "Abrir u obtener la app",
    useOnlineBanking: "Usar banca en línea",
    getTheApp: "Obtener la app:",
    transferElsewhere: "La transferencia se hace en la app o la banca en línea de su banco, no en esta página.",
    howPayingWorks: "Cómo se le paga a ICB.",
    stepFive: "Paso 5",
    sendConfirmation: "Enviar comprobante",

    /* ---- gallery and films ---- */
    icbInMotion: "ICB en Movimiento",
    theICBFilms: "Los videos de ICB.",
    playFilm: "Reproducir {title}, con sonido",
    filmUnavailable: "Este video no se pudo reproducir en este navegador.",
    viewLarger: "Ver más grande: {caption}",
    closeImage: "Cerrar imagen",
    seeOnLocations: "{name}, verla en la página de Ubicaciones",

    /* ---- hero ---- */
    prevSlide: "Imagen anterior",
    nextSlide: "Imagen siguiente",
    goToSlide: "Ir a la imagen {n}",
    soundOn: "Activar el sonido del video de ICB",
    soundOff: "Desactivar el sonido del video de ICB",
    tapForSound: "Toque para el sonido",
    playICBFilm: "Reproducir el video de ICB Life Happens Fast",

    /* ---- contact ---- */
    required: "obligatorio",
    optional: "Opcional",
    reviewAndSend: "Revisar y enviar",
    back: "Atrás",
    send: "Enviar",
    change: "Cambiar"
  }
};
