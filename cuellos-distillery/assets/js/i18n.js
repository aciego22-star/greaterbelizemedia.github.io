/* ============================================================
   CUELLO'S DISTILLERY — Centralized EN/ES content system
   Every translatable interface string lives here.
   Spanish copy is concept-level and listed for client review
   in CLIENT-CONFIRMATION-CHECKLIST.md before launch.
   ============================================================ */

(function () {
  "use strict";

  var DICT = {
    /* ---------- Global: navigation ---------- */
    "nav.home": { en: "Home", es: "Inicio" },
    "nav.story": { en: "Our Story", es: "Nuestra Historia" },
    "nav.spirits": { en: "Our Spirits", es: "Nuestros Licores" },
    "nav.cocktails": { en: "Cocktails & Recipes", es: "Cócteles y Recetas" },
    "nav.news": { en: "News & Events", es: "Noticias y Eventos" },
    "nav.gallery": { en: "Gallery", es: "Galería" },
    "nav.locations": { en: "Where to Find Us", es: "Dónde Encontrarnos" },
    "nav.trade": { en: "Trade & Distribution", es: "Comercio y Distribución" },
    "nav.contact": { en: "Contact", es: "Contacto" },
    "nav.menuOpen": { en: "Open menu", es: "Abrir menú" },
    "nav.menuClose": { en: "Close menu", es: "Cerrar menú" },
    "nav.mainLabel": { en: "Primary navigation", es: "Navegación principal" },

    /* ---------- Global: common ---------- */
    "common.brand": { en: "Cuello's Distillery Ltd.", es: "Cuello's Distillery Ltd." },
    "common.brandSub": { en: "Orange Walk · Belize", es: "Orange Walk · Belice" },
    "common.findUs": { en: "Find Us", es: "Encuéntranos" },
    "common.exploreSpirits": { en: "Explore Our Spirits", es: "Descubre Nuestros Licores" },
    "common.discoverStory": { en: "Discover Our Story", es: "Conoce Nuestra Historia" },
    "common.findNearYou": { en: "Find Cuello's Near You", es: "Encuentra Cuello's Cerca de Ti" },
    "common.viewAll": { en: "View all", es: "Ver todo" },
    "common.readMore": { en: "Read more", es: "Leer más" },
    "common.learnMore": { en: "Learn more", es: "Saber más" },
    "common.close": { en: "Close", es: "Cerrar" },
    "common.previous": { en: "Previous", es: "Anterior" },
    "common.next": { en: "Next", es: "Siguiente" },
    "common.callUs": { en: "Call us", es: "Llámanos" },
    "common.emailUs": { en: "Email us", es: "Escríbenos" },
    "common.getDirections": { en: "Get directions", es: "Cómo llegar" },
    "common.tbc": { en: "To be confirmed", es: "Por confirmar" },
    "common.langLabel": { en: "Language", es: "Idioma" },
    "common.skip": { en: "Skip to content", es: "Ir al contenido" },
    "common.slogan": {
      en: "Where the roads of tradition and quality meet.",
      es: "Donde se encuentran los caminos de la tradición y la calidad."
    },
    "common.responsible": {
      en: "Please enjoy Cuello's responsibly. For adults 18 years and older.",
      es: "Disfruta Cuello's con responsabilidad. Solo para adultos mayores de 18 años."
    },
    "common.pausePlay": { en: "Pause or play background media", es: "Pausar o reproducir el video de fondo" },

    /* ---------- Age gate ---------- */
    "gate.brand": { en: "Cuello's Distillery Ltd. · Orange Walk, Belize", es: "Cuello's Distillery Ltd. · Orange Walk, Belice" },
    "gate.title": { en: "Welcome to Cuello's", es: "Bienvenido a Cuello's" },
    "gate.copy": {
      en: "You must be 18 years or older to enter this website.",
      es: "Debes tener 18 años o más para ingresar a este sitio web."
    },
    "gate.confirm": { en: "I Am 18 or Older", es: "Tengo 18 Años o Más" },
    "gate.exit": { en: "Exit", es: "Salir" },
    "gate.remember": { en: "Remember me on this device", es: "Recordarme en este dispositivo" },
    "gate.fine": {
      en: "Cuello's supports responsible enjoyment. Please do not share this website with anyone under the legal drinking age.",
      es: "Cuello's promueve el consumo responsable. Por favor no compartas este sitio con menores de edad."
    },

    /* ---------- Footer ---------- */
    "footer.blurb": {
      en: "A Belizean family tradition in rum and spirits — made in Orange Walk Town and shared across Belize.",
      es: "Una tradición familiar beliceña en rones y licores — elaborados en Orange Walk Town y compartidos en todo Belice."
    },
    "footer.explore": { en: "Explore", es: "Explorar" },
    "footer.visit": { en: "Visit & Contact", es: "Visítanos" },
    "footer.offices": { en: "Our Offices", es: "Nuestras Oficinas" },
    "footer.mainOffice": { en: "Main Office — Orange Walk", es: "Oficina Principal — Orange Walk" },
    "footer.belizeCity": { en: "Belize City Office", es: "Oficina de Belize City" },
    "footer.sanPedro": { en: "San Pedro Office", es: "Oficina de San Pedro" },
    "footer.social": { en: "Social channels — links coming soon", es: "Redes sociales — enlaces próximamente" },
    "footer.privacy": { en: "Privacy", es: "Privacidad" },
    "footer.accessibility": { en: "Accessibility", es: "Accesibilidad" },
    "footer.ageReset": { en: "Reset age verification", es: "Restablecer verificación de edad" },
    "footer.rights": { en: "All rights reserved.", es: "Todos los derechos reservados." },

    /* ---------- Home ---------- */
    "home.eyebrow": { en: "Cuello's Distillery Ltd. · Orange Walk, Belize", es: "Cuello's Distillery Ltd. · Orange Walk, Belice" },
    "home.heroTitle": { en: "The Spirit of Orange Walk", es: "El Espíritu de Orange Walk" },
    "home.heroCopy": {
      en: "A Belizean family tradition in rum and spirits, made with character and shared across generations.",
      es: "Una tradición familiar beliceña en rones y licores, elaborada con carácter y compartida entre generaciones."
    },
    "home.heroAlt": {
      en: "Colourful BELIZE letter installation on the seafront, topped with Cuello's bottles and miniature barrels",
      es: "Instalación de letras BELIZE de colores frente al mar, con botellas de Cuello's y barriles en miniatura"
    },

    "home.introEyebrow": { en: "An Orange Walk Original", es: "Original de Orange Walk" },
    "home.introTitle": { en: "Made in Belize, for generations", es: "Hecho en Belice, por generaciones" },
    "home.introCopy": {
      en: "From Main Street in Orange Walk Town, Cuello's Distillery has grown into one of Belize's most recognized names in rum and spirits. Distilled, blended and bottled at home — and enjoyed across the country, from family tables to beachfront bars.",
      es: "Desde Main Street en Orange Walk Town, Cuello's Distillery se ha convertido en uno de los nombres más reconocidos de Belice en rones y licores. Destilados, mezclados y embotellados en casa — y disfrutados en todo el país, de la mesa familiar a los bares frente al mar."
    },
    "home.introPoint1Title": { en: "Family tradition", es: "Tradición familiar" },
    "home.introPoint1Copy": {
      en: "A longstanding Belizean family company, shaped by experience and an enduring commitment to quality.",
      es: "Una empresa familiar beliceña de larga trayectoria, formada por la experiencia y un compromiso duradero con la calidad."
    },
    "home.introPoint2Title": { en: "Product of Belize", es: "Producto de Belice" },
    "home.introPoint2Copy": {
      en: "Every bottle carries the Rums of Belize trademark — a mark Belizeans have trusted for generations.",
      es: "Cada botella lleva la marca registrada Rums of Belize — un sello en el que los beliceños confían desde hace generaciones."
    },
    "home.introPoint3Title": { en: "Across the country", es: "En todo el país" },
    "home.introPoint3Copy": {
      en: "With offices in Orange Walk, Belize City and San Pedro, Cuello's is never far away.",
      es: "Con oficinas en Orange Walk, Belize City y San Pedro, Cuello's siempre está cerca."
    },

    "home.spiritsEyebrow": { en: "The Cabinet", es: "La Vitrina" },
    "home.spiritsTitle": { en: "Nine spirits. One tradition.", es: "Nueve licores. Una tradición." },
    "home.spiritsCopy": {
      en: "Rums, vodka, gin, brandy and traditional specialties — the range that made Cuello's a household name in Belize.",
      es: "Rones, vodka, ginebra, brandy y especialidades tradicionales — la gama que hizo de Cuello's un nombre conocido en todo Belice."
    },
    "home.spiritsCta": { en: "Explore the full collection", es: "Explora la colección completa" },
    "home.railLabel": { en: "Featured spirits", es: "Licores destacados" },
    "home.viewSpirit": { en: "View details", es: "Ver detalles" },

    "home.heritageEyebrow": { en: "Our Story", es: "Nuestra Historia" },
    "home.heritageTitle": { en: "Tradition you can taste", es: "Tradición que se saborea" },
    "home.heritageCopy": {
      en: "Barrels, bottles and a trademark that has travelled generations. Discover how a family operation in Orange Walk became part of Belizean life.",
      es: "Barriles, botellas y una marca que ha viajado por generaciones. Descubre cómo una operación familiar en Orange Walk se volvió parte de la vida beliceña."
    },
    "home.heritageAlt": {
      en: "Wooden barrel branded Rums of Belize beside miniature Cuello's bottles in warm light",
      es: "Barril de madera con el sello Rums of Belize junto a botellas miniatura de Cuello's en luz cálida"
    },

    "home.cultureEyebrow": { en: "Culture in Motion", es: "Cultura en Movimiento" },
    "home.cultureTitle": { en: "Part of the celebration", es: "Parte de la celebración" },
    "home.cultureCopy": {
      en: "From carnival routes to community events, Cuello's shows up where Belize celebrates — with colour, music and national pride.",
      es: "De las rutas de carnaval a los eventos comunitarios, Cuello's está presente donde Belice celebra — con color, música y orgullo nacional."
    },
    "home.cultureAlt": {
      en: "Carnival dancers in vibrant costumes at a Cuello's brand activation",
      es: "Bailarines de carnaval con trajes vibrantes en una activación de marca de Cuello's"
    },
    "home.cultureCta": { en: "See news & events", es: "Ver noticias y eventos" },

    "home.serveEyebrow": { en: "The Serve", es: "Para Servir" },
    "home.serveTitle": { en: "Made to be mixed", es: "Hecho para mezclar" },
    "home.serveCopy": {
      en: "White rum over ice, fresh citrus, a Belizean afternoon. Explore serving ideas built around the Cuello's range.",
      es: "Ron blanco con hielo, cítricos frescos, una tarde beliceña. Explora ideas para servir creadas alrededor de la gama Cuello's."
    },
    "home.serveAlt": {
      en: "Cocktail with lime and ice beside a bottle of Cuello's Caribbean White Rum",
      es: "Cóctel con limón y hielo junto a una botella de Caribbean White Rum de Cuello's"
    },
    "home.serveCta": { en: "Browse cocktails & recipes", es: "Ver cócteles y recetas" },

    "home.locationsEyebrow": { en: "Where to Find Us", es: "Dónde Encontrarnos" },
    "home.locationsTitle": { en: "Three offices. One family.", es: "Tres oficinas. Una familia." },
    "home.locationsCopy": {
      en: "Orange Walk Town, Belize City and San Pedro — call ahead or stop by.",
      es: "Orange Walk Town, Belize City y San Pedro — llama o visítanos."
    },
    "home.locationsCta": { en: "All locations & directions", es: "Todas las ubicaciones y direcciones" },

    "home.galleryEyebrow": { en: "The Gallery", es: "La Galería" },
    "home.galleryTitle": { en: "Cuello's, out in the world", es: "Cuello's por el mundo" },
    "home.galleryCopy": {
      en: "Beaches, bars, murals and milestones — a look at the brand in its element.",
      es: "Playas, bares, murales y momentos — una mirada a la marca en su elemento."
    },
    "home.galleryCta": { en: "Open the gallery", es: "Abrir la galería" },

    "home.tradeTitle": { en: "Bring Cuello's to your shelves, bar or table", es: "Lleva Cuello's a tus estantes, bar o mesa" },
    "home.tradeCopy": {
      en: "Hotels, restaurants, retailers and distributors — start a conversation with our trade team.",
      es: "Hoteles, restaurantes, minoristas y distribuidores — inicia una conversación con nuestro equipo comercial."
    },
    "home.tradeCta": { en: "Trade & distribution", es: "Comercio y distribución" },
    "home.newsEyebrow": { en: "Latest", es: "Lo Último" },
    "home.newsTitle": { en: "News & events", es: "Noticias y eventos" },

    /* ---------- Our Story ---------- */
    "story.metaTitle": { en: "Our Story — Cuello's Distillery Ltd.", es: "Nuestra Historia — Cuello's Distillery Ltd." },
    "story.eyebrow": { en: "Our Story", es: "Nuestra Historia" },
    "story.title": { en: "From Orange Walk, with character", es: "Desde Orange Walk, con carácter" },
    "story.lede": {
      en: "Cuello's Distillery Ltd. is a longstanding Belizean family company — a name built over generations on Main Street, Orange Walk Town, and carried across the country one bottle at a time.",
      es: "Cuello's Distillery Ltd. es una empresa familiar beliceña de larga trayectoria — un nombre construido por generaciones en Main Street, Orange Walk Town, y llevado por todo el país botella a botella."
    },
    "story.heroAlt": {
      en: "Rums of Belize branded barrel with miniature Cuello's bottles",
      es: "Barril con el sello Rums of Belize y botellas miniatura de Cuello's"
    },

    "story.rootsEyebrow": { en: "Roots", es: "Raíces" },
    "story.rootsTitle": { en: "A family, a town, a trade", es: "Una familia, un pueblo, un oficio" },
    "story.rootsCopy1": {
      en: "Orange Walk is sugarcane country — the heartland of Belize's sugar industry. It is here, among cane fields and family businesses, that the Cuello name became tied to the craft of rum and spirits.",
      es: "Orange Walk es tierra de caña de azúcar — el corazón de la industria azucarera de Belice. Es aquí, entre cañaverales y negocios familiares, donde el nombre Cuello quedó ligado al oficio del ron y los licores."
    },
    "story.rootsCopy2": {
      en: "For generations, the distillery on Main Street has distilled, blended and bottled its spirits at home in Orange Walk Town — a tradition shaped by family, experience and an enduring commitment to quality.",
      es: "Por generaciones, la destilería de Main Street ha destilado, mezclado y embotellado sus licores en casa, en Orange Walk Town — una tradición formada por la familia, la experiencia y un compromiso duradero con la calidad."
    },

    "story.markEyebrow": { en: "The Trademark", es: "La Marca" },
    "story.markTitle": { en: "The mark of the ocellated turkey", es: "El sello del pavo ocelado" },
    "story.markCopy": {
      en: "Every genuine Cuello's bottle carries the Rums of Belize trademark — the ocellated turkey, a bird found in the forests of northern Belize. It is a promise on the label: a product of Belize, from a Belizean family.",
      es: "Cada botella genuina de Cuello's lleva la marca registrada Rums of Belize — el pavo ocelado, un ave de los bosques del norte de Belice. Es una promesa en la etiqueta: un producto de Belice, de una familia beliceña."
    },
    "story.markAlt": { en: "Rums of Belize circular trademark with ocellated turkey emblem", es: "Marca registrada circular Rums of Belize con el emblema del pavo ocelado" },

    "story.craftEyebrow": { en: "The Craft", es: "El Oficio" },
    "story.craftTitle": { en: "Distilled, blended & bottled at home", es: "Destilado, mezclado y embotellado en casa" },
    "story.craftCopy": {
      en: "From still to bottling line, Cuello's production happens in Orange Walk Town — the same address printed on every label.",
      es: "Del alambique a la línea de embotellado, la producción de Cuello's ocurre en Orange Walk Town — la misma dirección impresa en cada etiqueta."
    },
    "story.craftAlt1": { en: "Exterior of the Cuello's distillery facility", es: "Exterior de las instalaciones de la destilería Cuello's" },
    "story.craftAlt2": { en: "Bottles moving along the Cuello's bottling line", es: "Botellas avanzando por la línea de embotellado de Cuello's" },
    "story.craftAlt3": { en: "Close-up of bottles being filled at the distillery", es: "Primer plano de botellas llenándose en la destilería" },
    "story.craftAlt4": { en: "Production machinery inside the distillery", es: "Maquinaria de producción dentro de la destilería" },
    "story.craftNote": {
      en: "Production imagery shown for general reference.",
      es: "Imágenes de producción mostradas como referencia general."
    },

    "story.timelineEyebrow": { en: "The Road So Far", es: "El Camino Recorrido" },
    "story.timelineTitle": { en: "Milestones in the making", es: "Hitos en construcción" },
    "story.timelineIntro": {
      en: "Exact dates and milestones are being confirmed with the Cuello family for the final version of this page. The road, however, is easy to trace.",
      es: "Las fechas y los hitos exactos se están confirmando con la familia Cuello para la versión final de esta página. El camino, sin embargo, es fácil de trazar."
    },
    "story.t1Label": { en: "The beginning", es: "El inicio" },
    "story.t1Title": { en: "A distillery takes root in Orange Walk", es: "Una destilería echa raíces en Orange Walk" },
    "story.t1Copy": {
      en: "In the heart of sugarcane country, the Cuello family begins distilling and bottling spirits on Main Street.",
      es: "En el corazón de la tierra de la caña, la familia Cuello comienza a destilar y embotellar licores en Main Street."
    },
    "story.t2Label": { en: "Growth", es: "Crecimiento" },
    "story.t2Title": { en: "A range Belize comes to know by name", es: "Una gama que Belice llega a conocer por nombre" },
    "story.t2Copy": {
      en: "Caribbean Rum, CZAR Vodka, Trafalgar Gin and more — the cabinet grows to nine spirits under the Rums of Belize trademark.",
      es: "Caribbean Rum, CZAR Vodka, Trafalgar Gin y más — la vitrina crece hasta nueve licores bajo la marca Rums of Belize."
    },
    "story.t3Label": { en: "Across Belize", es: "Por Todo Belice" },
    "story.t3Title": { en: "Orange Walk, Belize City, San Pedro", es: "Orange Walk, Belize City, San Pedro" },
    "story.t3Copy": {
      en: "Offices open beyond Orange Walk, bringing Cuello's closer to customers on the coast and the cayes.",
      es: "Se abren oficinas más allá de Orange Walk, acercando Cuello's a los clientes de la costa y los cayos."
    },
    "story.t4Label": { en: "Today", es: "Hoy" },
    "story.t4Title": { en: "Tradition meets a new generation", es: "La tradición encuentra una nueva generación" },
    "story.t4Copy": {
      en: "The same labels, the same town, a growing community — and a brand stepping confidently into its next chapter.",
      es: "Las mismas etiquetas, el mismo pueblo, una comunidad que crece — y una marca que avanza con confianza hacia su próximo capítulo."
    },

    "story.forwardEyebrow": { en: "Tradition & Progress", es: "Tradición y Progreso" },
    "story.forwardTitle": { en: "Old roads, new travellers", es: "Caminos antiguos, nuevos viajeros" },
    "story.forwardCopy": {
      en: "Tradition is not standing still — it is knowing what to keep. Cuello's keeps its labels, its town and its standards, while embracing new ways to meet the people who enjoy its spirits: online, at events, and wherever Belize gathers.",
      es: "La tradición no es quedarse quieto — es saber qué conservar. Cuello's conserva sus etiquetas, su pueblo y sus estándares, mientras adopta nuevas formas de llegar a quienes disfrutan sus licores: en línea, en eventos y dondequiera que Belice se reúna."
    },
    "story.closingSlogan": { en: "Where the roads of tradition and quality meet.", es: "Donde se encuentran los caminos de la tradición y la calidad." },
    "story.closingCta": { en: "Meet the spirits this story made", es: "Conoce los licores que esta historia creó" },

    /* ---------- Our Spirits ---------- */
    "spirits.metaTitle": { en: "Our Spirits — Cuello's Distillery Ltd.", es: "Nuestros Licores — Cuello's Distillery Ltd." },
    "spirits.eyebrow": { en: "Our Spirits", es: "Nuestros Licores" },
    "spirits.title": { en: "The Cuello's cabinet", es: "La vitrina de Cuello's" },
    "spirits.lede": {
      en: "Nine spirits, distilled, blended and bottled in Orange Walk Town under the Rums of Belize trademark. Select any bottle for details.",
      es: "Nueve licores, destilados, mezclados y embotellados en Orange Walk Town bajo la marca Rums of Belize. Selecciona cualquier botella para ver detalles."
    },
    "spirits.catRum": { en: "Caribbean Rum Collection", es: "Colección Caribbean Rum" },
    "spirits.catRumCopy": { en: "The rums that made the name — white, gold, coconut and extra strong.", es: "Los rones que hicieron el nombre — blanco, dorado, coco y extra fuerte." },
    "spirits.catWhite": { en: "Vodka, Gin & Brandy", es: "Vodka, Ginebra y Brandy" },
    "spirits.catWhiteCopy": { en: "Clear classics and an amber brandy, the versatile side of the cabinet.", es: "Clásicos claros y un brandy ámbar, el lado versátil de la vitrina." },
    "spirits.catSpecial": { en: "Liqueurs & Specialty Spirits", es: "Licores y Especialidades" },
    "spirits.catSpecialCopy": { en: "Traditional favourites with deep roots in Belizean homes.", es: "Favoritos tradicionales con raíces profundas en los hogares beliceños." },
    "spirits.specSizes": { en: "Available sizes", es: "Presentaciones" },
    "spirits.specAbv": { en: "Alcohol content", es: "Contenido de alcohol" },
    "spirits.specCategory": { en: "Category", es: "Categoría" },
    "spirits.specOrigin": { en: "Origin", es: "Origen" },
    "spirits.originValue": { en: "Orange Walk Town, Belize", es: "Orange Walk Town, Belice" },
    "spirits.serveIdea": { en: "Suggested serve", es: "Sugerencia para servir" },
    "spirits.whereFind": { en: "Where to find it", es: "Dónde encontrarlo" },
    "spirits.whereFindCopy": {
      en: "Contact any Cuello's office for current availability near you.",
      es: "Contacta cualquier oficina de Cuello's para conocer la disponibilidad cerca de ti."
    },
    "spirits.tradeCta": { en: "Trade enquiry", es: "Consulta comercial" },
    "spirits.related": { en: "You may also like", es: "También te puede gustar" },
    "spirits.drawerNote": {
      en: "Product specifications shown are pending final confirmation by Cuello's Distillery Ltd. Bottle imagery is an enhanced V1 product visual.",
      es: "Las especificaciones mostradas están pendientes de confirmación final por Cuello's Distillery Ltd. Las imágenes de botellas son visuales de producto V1 mejorados."
    },
    "spirits.openDetails": { en: "View details for", es: "Ver detalles de" },
    "spirits.groupNote": {
      en: "The range, together — as seen around Belize for generations.",
      es: "La gama completa — como se ha visto en Belice por generaciones."
    },
    "spirits.groupAlt": { en: "Vintage lineup of the full Cuello's product range", es: "Alineación clásica de la gama completa de productos Cuello's" },

    /* ---------- Cocktails ---------- */
    "cocktails.metaTitle": { en: "Cocktails & Recipes — Cuello's Distillery Ltd.", es: "Cócteles y Recetas — Cuello's Distillery Ltd." },
    "cocktails.eyebrow": { en: "Cocktails & Recipes", es: "Cócteles y Recetas" },
    "cocktails.title": { en: "Serve it the Belizean way", es: "Sírvelo al estilo beliceño" },
    "cocktails.lede": {
      en: "Serving ideas built around the Cuello's cabinet — fresh citrus, coconut, cane and character. Official Cuello's recipes are being finalized; these concept serves show what is possible.",
      es: "Ideas para servir creadas alrededor de la vitrina Cuello's — cítricos frescos, coco, caña y carácter. Las recetas oficiales de Cuello's se están finalizando; estas propuestas muestran lo que es posible."
    },
    "cocktails.heroAlt": {
      en: "Cocktail with lime and ice served beside Cuello's Caribbean White Rum",
      es: "Cóctel con limón y hielo servido junto al Caribbean White Rum de Cuello's"
    },
    "cocktails.filterLabel": { en: "Filter by spirit", es: "Filtrar por licor" },
    "cocktails.filterAll": { en: "All spirits", es: "Todos los licores" },
    "cocktails.conceptBadge": { en: "Concept serve", es: "Propuesta" },
    "cocktails.glass": { en: "Glass", es: "Vaso" },
    "cocktails.garnish": { en: "Garnish", es: "Decoración" },
    "cocktails.spirit": { en: "Featured spirit", es: "Licor destacado" },
    "cocktails.useSpirit": { en: "Use this spirit", es: "Usa este licor" },
    "cocktails.flambeEyebrow": { en: "With Fire & Flavour", es: "Con Fuego y Sabor" },
    "cocktails.flambeTitle": { en: "Beyond the glass", es: "Más allá del vaso" },
    "cocktails.flambeCopy": {
      en: "Belizean kitchens and bars have their own ways with Cuello's — from flambé moments to family recipes. Official serves and measures will be published once confirmed by the distillery.",
      es: "Las cocinas y los bares beliceños tienen sus propias maneras con Cuello's — de momentos flambeados a recetas familiares. Las medidas y recetas oficiales se publicarán una vez confirmadas por la destilería."
    },
    "cocktails.flambeAlt": {
      en: "Flambé preparation with Cuello's Caribbean White Rum",
      es: "Preparación flambeada con Caribbean White Rum de Cuello's"
    },
    "cocktails.note": {
      en: "Concept serves are shown without measures. Always follow local guidance on responsible service of alcohol.",
      es: "Las propuestas se muestran sin medidas. Sigue siempre las pautas locales sobre el servicio responsable de alcohol."
    },

    /* ---------- News ---------- */
    "news.metaTitle": { en: "News & Events — Cuello's Distillery Ltd.", es: "Noticias y Eventos — Cuello's Distillery Ltd." },
    "news.eyebrow": { en: "News & Events", es: "Noticias y Eventos" },
    "news.title": { en: "Out and about with Cuello's", es: "De paseo con Cuello's" },
    "news.lede": {
      en: "Announcements, community activity and appearances across Belize. This section is structured for easy updates — sample stories below show the format.",
      es: "Anuncios, actividad comunitaria y presencia en todo Belice. Esta sección está estructurada para actualizarse fácilmente — las historias de muestra ilustran el formato."
    },
    "news.featured": { en: "Featured", es: "Destacado" },
    "news.sampleBadge": { en: "Sample story", es: "Historia de muestra" },
    "news.catCommunity": { en: "Community", es: "Comunidad" },
    "news.catEvents": { en: "Events", es: "Eventos" },
    "news.catProduct": { en: "Product News", es: "Noticias de Producto" },
    "news.catTrade": { en: "Trade", es: "Comercio" },
    "news.dateTBA": { en: "Date to be announced", es: "Fecha por anunciar" },
    "news.emptyNote": {
      en: "Real Cuello's announcements will replace these sample stories before launch. The layout, categories and reading experience are final.",
      es: "Los anuncios reales de Cuello's reemplazarán estas historias de muestra antes del lanzamiento. El diseño, las categorías y la experiencia de lectura son definitivos."
    },
    "news.modalNote": {
      en: "This is a sample article demonstrating the reading layout. Confirmed Cuello's news will appear here.",
      es: "Este es un artículo de muestra que demuestra el diseño de lectura. Las noticias confirmadas de Cuello's aparecerán aquí."
    },

    /* ---------- Gallery ---------- */
    "gallery.metaTitle": { en: "Gallery — Cuello's Distillery Ltd.", es: "Galería — Cuello's Distillery Ltd." },
    "gallery.eyebrow": { en: "Gallery", es: "Galería" },
    "gallery.title": { en: "The living brand", es: "La marca viva" },
    "gallery.lede": {
      en: "Products, places and moments — Cuello's photographed in its element across Belize.",
      es: "Productos, lugares y momentos — Cuello's fotografiado en su elemento por todo Belice."
    },
    "gallery.filterLabel": { en: "Filter gallery", es: "Filtrar galería" },
    "gallery.catAll": { en: "All", es: "Todo" },
    "gallery.catProducts": { en: "Products", es: "Productos" },
    "gallery.catDistillery": { en: "Distillery", es: "Destilería" },
    "gallery.catEvents": { en: "Events", es: "Eventos" },
    "gallery.catCommunity": { en: "Community", es: "Comunidad" },
    "gallery.catVideos": { en: "Videos", es: "Videos" },
    "gallery.openImage": { en: "Open image", es: "Abrir imagen" },
    "gallery.playVideo": { en: "Play video", es: "Reproducir video" },
    "gallery.lightboxLabel": { en: "Image viewer", es: "Visor de imágenes" },

    /* ---------- Locations ---------- */
    "locations.metaTitle": { en: "Where to Find Us — Cuello's Distillery Ltd.", es: "Dónde Encontrarnos — Cuello's Distillery Ltd." },
    "locations.eyebrow": { en: "Where to Find Us", es: "Dónde Encontrarnos" },
    "locations.title": { en: "From Orange Walk to the cayes", es: "De Orange Walk a los cayos" },
    "locations.lede": {
      en: "Three Cuello's offices serve customers and partners across Belize. Call ahead, write to us, or get directions below.",
      es: "Tres oficinas de Cuello's atienden a clientes y socios en todo Belice. Llama, escríbenos o consulta cómo llegar."
    },
    "locations.heroAlt": {
      en: "Cuello's branded storefront in San Pedro with product displays",
      es: "Fachada de tienda con la marca Cuello's en San Pedro con exhibición de productos"
    },
    "locations.hqTag": { en: "Main Office & Distillery", es: "Oficina Principal y Destilería" },
    "locations.officeTag": { en: "Office", es: "Oficina" },
    "locations.orangeWalk": { en: "Orange Walk Town", es: "Orange Walk Town" },
    "locations.belizeCity": { en: "Belize City", es: "Belize City" },
    "locations.sanPedro": { en: "San Pedro", es: "San Pedro" },
    "locations.hoursLabel": { en: "Opening hours", es: "Horario" },
    "locations.hoursTBC": { en: "Opening hours to be confirmed", es: "Horario por confirmar" },
    "locations.retailTitle": { en: "Looking for Cuello's near you?", es: "¿Buscas Cuello's cerca de ti?" },
    "locations.retailCopy": {
      en: "Cuello's spirits are enjoyed at shops, bars and restaurants across Belize. A verified list of retail partners is being prepared — in the meantime, any office above can point you to the nearest place to find your bottle.",
      es: "Los licores Cuello's se disfrutan en tiendas, bares y restaurantes de todo Belice. Se está preparando una lista verificada de puntos de venta — mientras tanto, cualquier oficina puede indicarte el lugar más cercano para encontrar tu botella."
    },
    "locations.retailCta": { en: "Ask about availability", es: "Pregunta por disponibilidad" },
    "locations.stockistNote": {
      en: "The offices listed above are Cuello's own locations. Retail availability varies by area.",
      es: "Las oficinas listadas arriba son ubicaciones propias de Cuello's. La disponibilidad en tiendas varía según la zona."
    },

    /* ---------- Trade ---------- */
    "trade.metaTitle": { en: "Trade & Distribution — Cuello's Distillery Ltd.", es: "Comercio y Distribución — Cuello's Distillery Ltd." },
    "trade.eyebrow": { en: "Trade & Distribution", es: "Comercio y Distribución" },
    "trade.title": { en: "Bring Cuello's to your shelves, bar or table", es: "Lleva Cuello's a tus estantes, bar o mesa" },
    "trade.lede": {
      en: "This page connects hotels, bars, restaurants, retailers, event organizers and prospective distributors directly with Cuello's Distillery Ltd. Tell us what you need — our team follows up personally.",
      es: "Esta página conecta hoteles, bares, restaurantes, minoristas, organizadores de eventos y posibles distribuidores directamente con Cuello's Distillery Ltd. Cuéntanos qué necesitas — nuestro equipo da seguimiento personal."
    },
    "trade.heroAlt": {
      en: "Cuello's trade booth at a community event with branded products",
      es: "Stand comercial de Cuello's en un evento comunitario con productos de la marca"
    },
    "trade.p1Title": { en: "Retail stock", es: "Venta minorista" },
    "trade.p1Copy": { en: "Shops and supermarkets stocking the Cuello's range.", es: "Tiendas y supermercados que ofrecen la gama Cuello's." },
    "trade.p2Title": { en: "Hotels & restaurants", es: "Hoteles y restaurantes" },
    "trade.p2Copy": { en: "Supply for kitchens, minibars and dining programmes.", es: "Suministro para cocinas, minibares y programas gastronómicos." },
    "trade.p3Title": { en: "Bars & cocktail programmes", es: "Bares y coctelería" },
    "trade.p3Copy": { en: "Build a Belizean back bar around nine spirits.", es: "Crea una barra beliceña con nueve licores." },
    "trade.p4Title": { en: "Events", es: "Eventos" },
    "trade.p4Copy": { en: "Festivals, weddings and private celebrations.", es: "Festivales, bodas y celebraciones privadas." },
    "trade.p5Title": { en: "Distribution", es: "Distribución" },
    "trade.p5Copy": { en: "Conversations with prospective distribution partners.", es: "Conversaciones con posibles socios de distribución." },
    "trade.p6Title": { en: "Partnerships", es: "Alianzas" },
    "trade.p6Copy": { en: "General commercial partnerships and sponsorship enquiries.", es: "Alianzas comerciales generales y consultas de patrocinio." },
    "trade.formTitle": { en: "Start a trade conversation", es: "Inicia una conversación comercial" },
    "trade.formCopy": {
      en: "A few details and the right person at Cuello's will get back to you.",
      es: "Unos pocos datos y la persona indicada en Cuello's te responderá."
    },
    "trade.whyTitle": { en: "Why partners choose Cuello's", es: "Por qué los socios eligen Cuello's" },
    "trade.why1Title": { en: "An established name", es: "Un nombre establecido" },
    "trade.why1Copy": { en: "Generations of brand recognition across Belize.", es: "Generaciones de reconocimiento de marca en todo Belice." },
    "trade.why2Title": { en: "A full cabinet", es: "Una vitrina completa" },
    "trade.why2Copy": { en: "Nine spirits spanning rum, vodka, gin, brandy and specialties.", es: "Nueve licores entre ron, vodka, ginebra, brandy y especialidades." },
    "trade.why3Title": { en: "Direct relationships", es: "Relaciones directas" },
    "trade.why3Copy": { en: "Deal directly with the family company behind the label.", es: "Trata directamente con la empresa familiar detrás de la etiqueta." },
    "trade.lineupAlt": { en: "Cuello's product lineup displayed outdoors", es: "Gama de productos Cuello's exhibida al aire libre" },

    /* ---------- Contact ---------- */
    "contact.metaTitle": { en: "Contact — Cuello's Distillery Ltd.", es: "Contacto — Cuello's Distillery Ltd." },
    "contact.eyebrow": { en: "Contact", es: "Contacto" },
    "contact.title": { en: "Talk to Cuello's", es: "Habla con Cuello's" },
    "contact.lede": {
      en: "Questions, availability, feedback — reach the team directly by phone, email or the form below.",
      es: "Preguntas, disponibilidad, comentarios — contacta al equipo directamente por teléfono, correo o el formulario."
    },
    "contact.directTitle": { en: "Reach us directly", es: "Contáctanos directamente" },
    "contact.formTitle": { en: "Send a message", es: "Envía un mensaje" },
    "contact.tradeNote": {
      en: "Business enquiry? Hotels, retailers and distributors get a faster answer through our dedicated trade page.",
      es: "¿Consulta de negocios? Hoteles, minoristas y distribuidores reciben una respuesta más rápida en nuestra página comercial."
    },
    "contact.tradeCta": { en: "Go to Trade & Distribution", es: "Ir a Comercio y Distribución" },
    "contact.socialNote": { en: "Social channels will be linked here once verified.", es: "Las redes sociales se enlazarán aquí una vez verificadas." },

    /* ---------- Forms (shared) ---------- */
    "form.name": { en: "Name", es: "Nombre" },
    "form.business": { en: "Business or organization", es: "Empresa u organización" },
    "form.email": { en: "Email", es: "Correo electrónico" },
    "form.phone": { en: "Telephone", es: "Teléfono" },
    "form.location": { en: "Location", es: "Ubicación" },
    "form.enquiryType": { en: "Type of enquiry", es: "Tipo de consulta" },
    "form.message": { en: "Message", es: "Mensaje" },
    "form.select": { en: "Select an option", es: "Selecciona una opción" },
    "form.optRetail": { en: "Retail stock enquiry", es: "Consulta de venta minorista" },
    "form.optHotel": { en: "Hotel & restaurant supply", es: "Suministro para hotel y restaurante" },
    "form.optBar": { en: "Bar & cocktail programme", es: "Bar y coctelería" },
    "form.optEvents": { en: "Events", es: "Eventos" },
    "form.optDistribution": { en: "Distribution", es: "Distribución" },
    "form.optPartnership": { en: "General commercial partnership", es: "Alianza comercial general" },
    "form.optGeneral": { en: "General enquiry", es: "Consulta general" },
    "form.optFeedback": { en: "Product feedback", es: "Comentarios sobre productos" },
    "form.send": { en: "Send message", es: "Enviar mensaje" },
    "form.sendTrade": { en: "Send trade enquiry", es: "Enviar consulta comercial" },
    "form.required": { en: "This field is required.", es: "Este campo es obligatorio." },
    "form.invalidEmail": { en: "Please enter a valid email address.", es: "Por favor ingresa un correo electrónico válido." },
    "form.success": {
      en: "Thank you — your message has been submitted. The Cuello's team will be in touch.",
      es: "Gracias — tu mensaje ha sido enviado. El equipo de Cuello's se pondrá en contacto."
    },
    "form.error": {
      en: "Something went wrong and the form could not be submitted. Please email us directly at",
      es: "Algo salió mal y el formulario no pudo enviarse. Por favor escríbenos directamente a"
    },
    "form.emailFallback": { en: "Or email us directly:", es: "O escríbenos directamente:" },

    /* ---------- 404 ---------- */
    "nf.title": { en: "This road doesn't lead anywhere", es: "Este camino no lleva a ningún lado" },
    "nf.copy": {
      en: "The page you're looking for doesn't exist. Let's get you back to familiar ground.",
      es: "La página que buscas no existe. Volvamos a terreno conocido."
    },
    "nf.cta": { en: "Back to home", es: "Volver al inicio" }
  };

  /* ---------- Engine ---------- */

  var LANG_KEY = "cuellos_lang";
  var current = "en";

  function safeGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(storage, key, val) {
    try { storage.setItem(key, val); } catch (e) { /* storage unavailable */ }
  }

  function t(key) {
    var entry = DICT[key];
    if (!entry) return null;
    return entry[current] || entry.en;
  }

  function apply(root) {
    root = root || document;
    var nodes = root.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      var val = t(nodes[i].getAttribute("data-i18n"));
      if (val !== null) nodes[i].textContent = val;
    }
    var attrMap = {
      "data-i18n-aria": "aria-label",
      "data-i18n-placeholder": "placeholder",
      "data-i18n-alt": "alt",
      "data-i18n-title": "title"
    };
    Object.keys(attrMap).forEach(function (dataAttr) {
      var els = root.querySelectorAll("[" + dataAttr + "]");
      for (var j = 0; j < els.length; j++) {
        var v = t(els[j].getAttribute(dataAttr));
        if (v !== null) els[j].setAttribute(attrMap[dataAttr], v);
      }
    });
    /* document title */
    var titleKey = document.body ? document.body.getAttribute("data-title-key") : null;
    if (titleKey && t(titleKey)) document.title = t(titleKey);
  }

  function setLang(lang, persist) {
    current = (lang === "es") ? "es" : "en";
    document.documentElement.setAttribute("lang", current);
    if (persist !== false) safeSet(window.localStorage, LANG_KEY, current);
    apply();
    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < buttons.length; i++) {
      var isActive = buttons[i].getAttribute("data-lang-btn") === current;
      buttons[i].setAttribute("aria-pressed", isActive ? "true" : "false");
    }
    document.dispatchEvent(new CustomEvent("cuellos:langchange", { detail: { lang: current } }));
  }

  function init() {
    var saved = safeGet(window.localStorage, LANG_KEY);
    current = (saved === "es") ? "es" : "en";
    document.documentElement.setAttribute("lang", current);
    document.addEventListener("click", function (e) {
      var btn = e.target.closest ? e.target.closest("[data-lang-btn]") : null;
      if (btn) setLang(btn.getAttribute("data-lang-btn"));
    });
    apply();
    var buttons = document.querySelectorAll("[data-lang-btn]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute("aria-pressed",
        buttons[i].getAttribute("data-lang-btn") === current ? "true" : "false");
    }
  }

  window.CuellosI18N = { t: t, apply: apply, setLang: setLang, init: init, get lang() { return current; }, dict: DICT };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
