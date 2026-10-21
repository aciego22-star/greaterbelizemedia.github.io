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
    pageLoaded: "{title} loaded",
    page: "Page",
    menu: "Menu",
    mobileNav: "Mobile",
    quickActions: "Quick actions",
    exploreInsurance: "Explore Insurance",
    backToTop: "Back to top",

    /* The assistant. Bee is a name, so it stays put; the words around it
       move like every other label on the site. */
    assistantOpen: "Talk to Bee",
    assistantClose: "Close",
    assistantTitle: "ICB Assist",
    assistantNewTab: "Open in a new tab",
    assistantLoading: "Connecting you to ICB Assist.",
    assistantPreviewNote: "This preview cannot reach outside services, so the assistant does not load here. It runs normally on the published site.",
    assistantOfflineNote: "The assistant could not be reached just now. You can open it in a new tab, or call ICB on +501 224-5328.",
    belize: "Belize",
    qbCall: "Call",
    qbBranches: "Branches",
    qbEnquire: "Enquire",
    callN: "Call {n}",
    emailICB: "Email ICB",
    emailN: "Email {n}",
    contactICB: "Contact ICB",
    /* The online claim form. "Fill it out online" rather than "Contact
       ICB" on a claim pathway: the button now opens the form itself, and
       a label that does not say so leaves a claimant tapping to find
       out. Contact ICB stays the label everywhere it still means that. */
    cfFillOnline: "Fill it out online",
    cfIntro: "This is ICB's own {title}, filled in and signed on your own phone or computer. It runs to {steps} short sections, and nothing is sent to ICB until you have read it back and pressed send.",
    cfFillOnlineNote: "Fill in, sign and send from this device.",
    cfAnswered: "{done} of {total} answered.",
    cfStillBlank: "{n} still to answer before this reaches ICB:",
    cfFileLimit: "Up to {n} files, {mb} MB each.",
    cfTooMany: "Only {n} files can be attached.",
    cfTooBig: "{name} is larger than {mb} MB and was not attached.",
    cfPrivacy: "Everything you type stays on this device until you send it. Your answers are saved here so you can come back to them, and cleared when the form is sent. Nothing is sent to ICB, or to anyone else, until you choose to send it.",
    cfShareText: "{form}, completed and signed online. Reference {ref}.",
    cfSent: "Sent. Your reference is {ref}. Keep it for when you speak to ICB.",
    cfDownloaded: "Saved to this device. Your reference is {ref}.",
    cfSavedAttach: "Saved to this device as {name}. Your reference is {ref}. Attach that file to the email that is opening.",
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
    claimsFormNote: "ICB's own form, downloaded to your device.",

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
    openingHours: "Open",
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
    icbOnYouTube: "ICB on YouTube",
    icbVideoN: "ICB video {n}",
    youtubeNote: "These play from ICB's YouTube channel. Nothing is requested from YouTube until you press play.",
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
    pageLoaded: "{title} cargada",
    page: "Página",
    menu: "Menú",
    mobileNav: "Móvil",
    quickActions: "Acciones rápidas",
    exploreInsurance: "Ver seguros",
    backToTop: "Volver arriba",

    assistantOpen: "Hable con Bee",
    assistantClose: "Cerrar",
    assistantTitle: "ICB Assist",
    assistantNewTab: "Abrir en una pestaña nueva",
    assistantLoading: "Conectándole con ICB Assist.",
    assistantPreviewNote: "Esta vista previa no puede conectarse con servicios externos, así que el asistente no carga aquí. Funciona con normalidad en el sitio publicado.",
    assistantOfflineNote: "No se pudo conectar con el asistente en este momento. Puede abrirlo en una pestaña nueva o llamar a ICB al +501 224-5328.",
    belize: "Belice",
    qbCall: "Llamar",
    qbBranches: "Sucursales",
    qbEnquire: "Consultar",
    callN: "Llamar al {n}",
    emailICB: "Escribir a ICB",
    emailN: "Escribir a {n}",
    contactICB: "Comunicarse con ICB",
    cfFillOnline: "Llenarlo en línea",
    cfIntro: "Este es el {title} propio de ICB, llenado y firmado en su teléfono o computadora. Tiene {steps} secciones cortas, y nada se envía a ICB hasta que usted lo haya revisado y presionado enviar.",
    cfFillOnlineNote: "Llene, firme y envíe desde este dispositivo.",
    cfAnswered: "{done} de {total} respondidas.",
    cfStillBlank: "Faltan {n} por responder antes de que esto llegue a ICB:",
    cfFileLimit: "Hasta {n} archivos, {mb} MB cada uno.",
    cfTooMany: "Solo se pueden adjuntar {n} archivos.",
    cfTooBig: "{name} pesa más de {mb} MB y no se adjuntó.",
    cfPrivacy: "Todo lo que escribe queda en este dispositivo hasta que usted lo envíe. Sus respuestas se guardan aquí para que pueda volver a ellas, y se borran cuando se envía el formulario. Nada se envía a ICB, ni a nadie más, hasta que usted decida enviarlo.",
    cfShareText: "{form}, completado y firmado en línea. Referencia {ref}.",
    cfSent: "Enviado. Su referencia es {ref}. Guárdela para cuando hable con ICB.",
    cfDownloaded: "Guardado en este dispositivo. Su referencia es {ref}.",
    cfSavedAttach: "Guardado en este dispositivo como {name}. Su referencia es {ref}. Adjunte ese archivo al correo que se está abriendo.",
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
    claimsFormNote: "El formulario propio de ICB, descargado a su dispositivo.",

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
    openingHours: "Abierto",
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
    icbOnYouTube: "ICB en YouTube",
    icbVideoN: "Video de ICB {n}",
    youtubeNote: "Estos videos se reproducen desde el canal de YouTube de ICB. No se solicita nada a YouTube hasta que usted presiona reproducir.",
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
