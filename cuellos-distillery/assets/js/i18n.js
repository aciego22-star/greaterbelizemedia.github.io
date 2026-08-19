/* ============================================================
   CUELLO'S DISTILLERY — Centralized EN/ES content system
   Every translatable interface string lives here.
   Copy policy (V1.1): only client-supplied lines, the slogan,
   label-visible facts and neutral descriptions of what the
   photography shows. Unverified claims live in
   CLIENT-CONFIRMATION-CHECKLIST.md, not on the site.
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
    "common.brandSub": { en: "Orange Walk · Belize", es: "Orange Walk · Belice" },
    "common.exploreSpirits": { en: "Explore Our Spirits", es: "Descubre Nuestros Licores" },
    "common.discoverStory": { en: "Discover Our Story", es: "Conoce Nuestra Historia" },
    "common.findNearYou": { en: "Find Cuello's Near You", es: "Encuentra Cuello's Cerca de Ti" },
    "common.viewAll": { en: "View all", es: "Ver todo" },
    "common.close": { en: "Close", es: "Cerrar" },
    "common.previous": { en: "Previous", es: "Anterior" },
    "common.next": { en: "Next", es: "Siguiente" },
    "common.getDirections": { en: "Get directions", es: "Cómo llegar" },
    "common.emailUs": { en: "Email us", es: "Escríbenos" },
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

    /* ---------- Category labels ---------- */
    "cat.rum": { en: "Caribbean Rum Collection", es: "Colección Caribbean Rum" },
    "cat.clear": { en: "Vodka, Gin & Brandy", es: "Vodka, Ginebra y Brandy" },
    "cat.specialty": { en: "Liqueurs & Specialty", es: "Licores y Especialidades" },

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
      en: "A Belizean tradition in rum and spirits — distilled, blended and bottled in Orange Walk Town.",
      es: "Una tradición beliceña en rones y licores — destilados, mezclados y embotellados en Orange Walk Town."
    },
    "footer.explore": { en: "Explore", es: "Explorar" },
    "footer.offices": { en: "Our Offices", es: "Nuestras Oficinas" },
    "footer.mainOffice": { en: "Main Office — Orange Walk", es: "Oficina Principal — Orange Walk" },
    "footer.belizeCity": { en: "Belize City Office", es: "Oficina de Belize City" },
    "footer.sanPedro": { en: "San Pedro Office", es: "Oficina de San Pedro" },
    "footer.privacy": { en: "Privacy", es: "Privacidad" },
    "footer.accessibility": { en: "Accessibility", es: "Accesibilidad" },
    "footer.ageReset": { en: "Reset age verification", es: "Restablecer verificación de edad" },
    "footer.rights": { en: "All rights reserved.", es: "Todos los derechos reservados." },
    "footer.whatsapp": { en: "WhatsApp Cuello's", es: "WhatsApp Cuello's" },

    /* ---------- Home: hero + carousel ---------- */
    "home.eyebrow": { en: "Cuello's Distillery Ltd. · Orange Walk, Belize", es: "Cuello's Distillery Ltd. · Orange Walk, Belice" },
    "home.heroTitle": { en: "The Spirit of Orange Walk", es: "El Espíritu de Orange Walk" },
    "home.heroCopy": {
      en: "A Belizean family tradition in rum and spirits, made with character and shared across generations.",
      es: "Una tradición familiar beliceña en rones y licores, elaborada con carácter y compartida entre generaciones."
    },
    "carousel.label": { en: "Cuello's highlights", es: "Destacados de Cuello's" },
    "carousel.pause": { en: "Pause slideshow", es: "Pausar presentación" },
    "carousel.play": { en: "Play slideshow", es: "Reproducir presentación" },
    "carousel.goto": { en: "Go to slide", es: "Ir a la diapositiva" },
    "carousel.soundOn": { en: "Turn sound on", es: "Activar sonido" },
    "carousel.soundOff": { en: "Turn sound off", es: "Silenciar" },
    "carousel.slide1Alt": {
      en: "The full Cuello's product range with the slogan: Where the roads of tradition and quality meet",
      es: "La gama completa de productos Cuello's con el lema: Donde se encuentran los caminos de la tradición y la calidad"
    },
    "carousel.slide2Alt": {
      en: "Trafalgar Gin bottles displayed in a decorative garden cart",
      es: "Botellas de Trafalgar Gin exhibidas en un carrito decorativo de jardín"
    },
    "carousel.slide3Alt": {
      en: "CZAR Vodka bottle photographed on the beach",
      es: "Botella de CZAR Vodka fotografiada en la playa"
    },
    "carousel.videoAlt": {
      en: "Cuello's brand video",
      es: "Video de la marca Cuello's"
    },

    /* ---------- Home: sections ---------- */
    "home.introEyebrow": { en: "An Orange Walk Original", es: "Original de Orange Walk" },
    "home.introTitle": { en: "Made in Orange Walk, Belize", es: "Hecho en Orange Walk, Belice" },
    "home.introCopy": {
      en: "Cuello's Distillery Ltd. is a longstanding Belizean distillery on Main Street, Orange Walk Town — where its rums and spirits are distilled, blended and bottled under the Rums of Belize trademark.",
      es: "Cuello's Distillery Ltd. es una destilería beliceña de larga trayectoria en Main Street, Orange Walk Town — donde sus rones y licores se destilan, mezclan y embotellan bajo la marca Rums of Belize."
    },
    "home.introPoint1Title": { en: "A longstanding distillery", es: "Una destilería de larga trayectoria" },
    "home.introPoint1Copy": {
      en: "An established name in Belizean rum and spirits, based in Orange Walk Town.",
      es: "Un nombre establecido en rones y licores beliceños, con sede en Orange Walk Town."
    },
    "home.introPoint2Title": { en: "Product of Belize", es: "Producto de Belice" },
    "home.introPoint2Copy": {
      en: "Every bottle carries the Rums of Belize trademark — the mark of the ocellated turkey.",
      es: "Cada botella lleva la marca registrada Rums of Belize — el sello del pavo ocelado."
    },
    "home.introPoint3Title": { en: "Across the country", es: "En todo el país" },
    "home.introPoint3Copy": {
      en: "With offices in Orange Walk, Belize City and San Pedro, Cuello's is never far away.",
      es: "Con oficinas en Orange Walk, Belize City y San Pedro, Cuello's siempre está cerca."
    },

    "home.spiritsEyebrow": { en: "The Cabinet", es: "La Vitrina" },
    "home.spiritsTitle": { en: "Nine spirits. One tradition.", es: "Nueve licores. Una tradición." },
    "home.spiritsCopy": {
      en: "Rums, vodka, gin, brandy and traditional specialties — the full Cuello's range, bottled in Orange Walk Town.",
      es: "Rones, vodka, ginebra, brandy y especialidades tradicionales — la gama completa de Cuello's, embotellada en Orange Walk Town."
    },
    "home.spiritsCta": { en: "Explore the full collection", es: "Explora la colección completa" },
    "home.viewSpirit": { en: "View details", es: "Ver detalles" },
    "marquee.label": { en: "All nine Cuello's spirits", es: "Los nueve licores de Cuello's" },
    "marquee.pause": { en: "Pause product showcase", es: "Pausar la vitrina de productos" },
    "marquee.play": { en: "Play product showcase", es: "Reproducir la vitrina de productos" },

    "home.heritageEyebrow": { en: "Our Story", es: "Nuestra Historia" },
    "home.heritageTitle": { en: "Tradition you can see", es: "Tradición a la vista" },
    "home.heritageCopy": {
      en: "Barrels, bottles and a trademark with deep roots in Orange Walk. Discover the road Cuello's has travelled.",
      es: "Barriles, botellas y una marca con raíces profundas en Orange Walk. Descubre el camino que Cuello's ha recorrido."
    },
    "home.heritageAlt": {
      en: "Wooden barrel branded Rums of Belize beside miniature Cuello's bottles in warm light",
      es: "Barril de madera con el sello Rums of Belize junto a botellas miniatura de Cuello's en luz cálida"
    },

    "home.cultureEyebrow": { en: "Culture in Motion", es: "Cultura en Movimiento" },
    "home.cultureTitle": { en: "Part of the celebration", es: "Parte de la celebración" },
    "home.cultureCopy": {
      en: "Colour, music and national pride — scenes from Cuello's brand activations around Belize.",
      es: "Color, música y orgullo nacional — escenas de las activaciones de la marca Cuello's en Belice."
    },
    "home.cultureAlt": {
      en: "Carnival dancers in vibrant costumes at a Cuello's brand activation",
      es: "Bailarines de carnaval con trajes vibrantes en una activación de la marca Cuello's"
    },
    "home.cultureCta": { en: "See news & events", es: "Ver noticias y eventos" },

    "home.serveEyebrow": { en: "The Serve", es: "Para Servir" },
    "home.serveTitle": { en: "Made to be shared", es: "Hecho para compartir" },
    "home.serveCopy": {
      en: "Cuello's spirits photographed in bars and kitchens around Belize — with official serving inspiration on the way.",
      es: "Los licores Cuello's fotografiados en bares y cocinas de Belice — con inspiración oficial para servir muy pronto."
    },
    "home.serveAlt": {
      en: "Cocktail with lime and ice photographed beside a bottle of Cuello's Caribbean White Rum",
      es: "Cóctel con limón y hielo fotografiado junto a una botella de Caribbean White Rum de Cuello's"
    },
    "home.serveCta": { en: "Cocktails & serving inspiration", es: "Cócteles e inspiración" },

    "home.locationsEyebrow": { en: "Where to Find Us", es: "Dónde Encontrarnos" },
    "home.locationsTitle": { en: "Three offices across Belize", es: "Tres oficinas en Belice" },
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
      en: "Hotels, restaurants, retailers and distributors — start a conversation with Cuello's.",
      es: "Hoteles, restaurantes, minoristas y distribuidores — inicia una conversación con Cuello's."
    },
    "home.tradeCta": { en: "Trade & distribution", es: "Comercio y distribución" },
    "home.newsEyebrow": { en: "Latest", es: "Lo Último" },
    "home.newsTitle": { en: "News & events", es: "Noticias y eventos" },

    /* ---------- Our Story ---------- */
    "story.metaTitle": { en: "Our Story — Cuello's Distillery Ltd.", es: "Nuestra Historia — Cuello's Distillery Ltd." },
    "story.eyebrow": { en: "Our Story", es: "Nuestra Historia" },
    "story.title": { en: "From Orange Walk, with character", es: "Desde Orange Walk, con carácter" },
    "story.lede": {
      en: "Cuello's Distillery Ltd. is a longstanding Belizean distillery — a name built on Main Street, Orange Walk Town, and carried across the country one bottle at a time.",
      es: "Cuello's Distillery Ltd. es una destilería beliceña de larga trayectoria — un nombre construido en Main Street, Orange Walk Town, y llevado por todo el país botella a botella."
    },
    "story.heroAlt": {
      en: "Rums of Belize branded barrel with miniature Cuello's bottles",
      es: "Barril con el sello Rums of Belize y botellas miniatura de Cuello's"
    },

    "story.rootsEyebrow": { en: "Roots", es: "Raíces" },
    "story.rootsTitle": { en: "A town, a trade", es: "Un pueblo, un oficio" },
    "story.rootsCopy1": {
      en: "Orange Walk is sugarcane country — the heartland of Belize's sugar industry. It is here that the Cuello's name became tied to the craft of rum and spirits.",
      es: "Orange Walk es tierra de caña de azúcar — el corazón de la industria azucarera de Belice. Es aquí donde el nombre Cuello's quedó ligado al oficio del ron y los licores."
    },
    "story.rootsCopy2": {
      en: "The distillery on Main Street distils, blends and bottles its spirits at home in Orange Walk Town — the same address printed on every label.",
      es: "La destilería de Main Street destila, mezcla y embotella sus licores en casa, en Orange Walk Town — la misma dirección impresa en cada etiqueta."
    },

    "story.markEyebrow": { en: "The Trademark", es: "La Marca" },
    "story.markTitle": { en: "The mark of the ocellated turkey", es: "El sello del pavo ocelado" },
    "story.markCopy": {
      en: "Every genuine Cuello's bottle carries the Rums of Belize trademark — the ocellated turkey, a bird found in the forests of northern Belize. It is a promise on the label: a product of Belize.",
      es: "Cada botella genuina de Cuello's lleva la marca registrada Rums of Belize — el pavo ocelado, un ave de los bosques del norte de Belice. Es una promesa en la etiqueta: un producto de Belice."
    },
    "story.markAlt": { en: "Rums of Belize circular trademark with ocellated turkey emblem", es: "Marca registrada circular Rums of Belize con el emblema del pavo ocelado" },

    "story.craftEyebrow": { en: "The Craft", es: "El Oficio" },
    "story.craftTitle": { en: "Distilled, blended & bottled at home", es: "Destilado, mezclado y embotellado en casa" },
    "story.craftCopy": {
      en: "From still to bottling line — production reference imagery from the distillery in Orange Walk Town.",
      es: "Del alambique a la línea de embotellado — imágenes de referencia de la producción en Orange Walk Town."
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
      en: "Exact dates and milestones are being confirmed with Cuello's for the final version of this page. The road, however, is easy to trace.",
      es: "Las fechas y los hitos exactos se están confirmando con Cuello's para la versión final de esta página. El camino, sin embargo, es fácil de trazar."
    },
    "story.t1Label": { en: "The beginning", es: "El inicio" },
    "story.t1Title": { en: "A distillery takes root in Orange Walk", es: "Una destilería echa raíces en Orange Walk" },
    "story.t1Copy": {
      en: "In the heart of sugarcane country, distilling and bottling begins on Main Street.",
      es: "En el corazón de la tierra de la caña, comienza la destilación y el embotellado en Main Street."
    },
    "story.t2Label": { en: "The range", es: "La gama" },
    "story.t2Title": { en: "A cabinet Belize comes to know", es: "Una vitrina que Belice llega a conocer" },
    "story.t2Copy": {
      en: "Caribbean Rum, CZAR Vodka, Trafalgar Gin and more — the range grows to nine spirits under the Rums of Belize trademark.",
      es: "Caribbean Rum, CZAR Vodka, Trafalgar Gin y más — la gama crece hasta nueve licores bajo la marca Rums of Belize."
    },
    "story.t3Label": { en: "Across Belize", es: "Por Todo Belice" },
    "story.t3Title": { en: "Orange Walk, Belize City, San Pedro", es: "Orange Walk, Belize City, San Pedro" },
    "story.t3Copy": {
      en: "Offices open beyond Orange Walk, bringing Cuello's closer to the coast and the cayes.",
      es: "Se abren oficinas más allá de Orange Walk, acercando Cuello's a la costa y los cayos."
    },
    "story.t4Label": { en: "Today", es: "Hoy" },
    "story.t4Title": { en: "Tradition meets a new generation", es: "La tradición encuentra una nueva generación" },
    "story.t4Copy": {
      en: "The same labels, the same town — and a brand stepping confidently into its next chapter.",
      es: "Las mismas etiquetas, el mismo pueblo — y una marca que avanza con confianza hacia su próximo capítulo."
    },

    "story.forwardEyebrow": { en: "Tradition & Progress", es: "Tradición y Progreso" },
    "story.forwardTitle": { en: "Old roads, new travellers", es: "Caminos antiguos, nuevos viajeros" },
    "story.forwardCopy": {
      en: "Tradition is not standing still — it is knowing what to keep. Cuello's keeps its labels, its town and its standards, while embracing new ways to meet the people who enjoy its spirits.",
      es: "La tradición no es quedarse quieto — es saber qué conservar. Cuello's conserva sus etiquetas, su pueblo y sus estándares, mientras adopta nuevas formas de llegar a quienes disfrutan sus licores."
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
    "spirits.catRumCopy": { en: "The rums on the Cuello's label — white, gold, coconut and extra strong.", es: "Los rones de la etiqueta Cuello's — blanco, dorado, coco y extra fuerte." },
    "spirits.catWhite": { en: "Vodka, Gin & Brandy", es: "Vodka, Ginebra y Brandy" },
    "spirits.catWhiteCopy": { en: "The clear spirits and the brandy of the range.", es: "Los licores claros y el brandy de la gama." },
    "spirits.catSpecial": { en: "Liqueurs & Specialty Spirits", es: "Licores y Especialidades" },
    "spirits.catSpecialCopy": { en: "Traditional names from the Cuello's cabinet.", es: "Nombres tradicionales de la vitrina Cuello's." },
    "spirits.specCategory": { en: "Category", es: "Categoría" },
    "spirits.specOrigin": { en: "Origin", es: "Origen" },
    "spirits.originValue": { en: "Orange Walk Town, Belize", es: "Orange Walk Town, Belice" },
    "spirits.specMark": { en: "Trademark", es: "Marca registrada" },
    "spirits.markValue": { en: "Rums of Belize", es: "Rums of Belize" },
    "spirits.whereFind": { en: "Where to find it", es: "Dónde encontrarlo" },
    "spirits.whereFindCopy": {
      en: "Contact any Cuello's office for current product information and availability near you.",
      es: "Contacta cualquier oficina de Cuello's para información de productos y disponibilidad cerca de ti."
    },
    "spirits.tradeCta": { en: "Trade enquiry", es: "Consulta comercial" },
    "spirits.related": { en: "More from the cabinet", es: "Más de la vitrina" },
    "spirits.drawerNote": {
      en: "Bottle imagery is an enhanced V1 product visual. Sizes, strengths and further product details are pending confirmation by Cuello's Distillery Ltd.",
      es: "Las imágenes de botellas son visuales de producto V1 mejorados. Presentaciones, graduación y demás detalles están pendientes de confirmación por Cuello's Distillery Ltd."
    },
    "spirits.openDetails": { en: "View details for", es: "Ver detalles de" },
    "spirits.groupNote": {
      en: "The range, together — as photographed around Belize.",
      es: "La gama completa — como se ha fotografiado en Belice."
    },
    "spirits.groupAlt": { en: "Vintage lineup of the full Cuello's product range", es: "Alineación clásica de la gama completa de productos Cuello's" },

    /* ---------- Cocktails & Serving Inspiration ---------- */
    "cocktails.metaTitle": { en: "Cocktails & Recipes — Cuello's Distillery Ltd.", es: "Cócteles y Recetas — Cuello's Distillery Ltd." },
    "cocktails.eyebrow": { en: "Cocktails & Recipes", es: "Cócteles y Recetas" },
    "cocktails.title": { en: "Serving inspiration", es: "Inspiración para servir" },
    "cocktails.lede": {
      en: "How Cuello's spirits look in the glass — photographed in bars and kitchens around Belize. Official Cuello's recipes are on their way.",
      es: "Así lucen los licores Cuello's en el vaso — fotografiados en bares y cocinas de Belice. Las recetas oficiales de Cuello's están en camino."
    },
    "cocktails.soonTitle": { en: "Official Cuello's recipes coming soon", es: "Recetas oficiales de Cuello's muy pronto" },
    "cocktails.soonCopy": {
      en: "This page is built and ready for the official Cuello's serves — names, ingredients and methods straight from the distillery. Until then, explore the range and ask us anything about the products.",
      es: "Esta página está lista para las recetas oficiales de Cuello's — nombres, ingredientes y preparación directamente de la destilería. Mientras tanto, explora la gama y pregúntanos lo que quieras sobre los productos."
    },
    "cocktails.soonCta1": { en: "Explore Our Spirits", es: "Descubre Nuestros Licores" },
    "cocktails.soonCta2": { en: "Ask about a product", es: "Pregunta por un producto" },
    "cocktails.heroAlt": {
      en: "Cocktail with lime and ice photographed beside Cuello's Caribbean White Rum",
      es: "Cóctel con limón y hielo fotografiado junto al Caribbean White Rum de Cuello's"
    },
    "cocktails.flambeEyebrow": { en: "With Fire & Flavour", es: "Con Fuego y Sabor" },
    "cocktails.flambeTitle": { en: "Beyond the glass", es: "Más allá del vaso" },
    "cocktails.flambeCopy": {
      en: "Belizean bars and kitchens have their own ways with Cuello's — captured here in a flambé moment with Caribbean White Rum.",
      es: "Los bares y cocinas beliceños tienen sus propias maneras con Cuello's — capturadas aquí en un momento flambeado con Caribbean White Rum."
    },
    "cocktails.flambeAlt": {
      en: "Flambé preparation photographed with Cuello's Caribbean White Rum",
      es: "Preparación flambeada fotografiada con Caribbean White Rum de Cuello's"
    },

    /* ---------- News ---------- */
    "news.metaTitle": { en: "News & Events — Cuello's Distillery Ltd.", es: "Noticias y Eventos — Cuello's Distillery Ltd." },
    "news.eyebrow": { en: "News & Events", es: "Noticias y Eventos" },
    "news.title": { en: "Out and about with Cuello's", es: "De paseo con Cuello's" },
    "news.lede": {
      en: "Scenes from Cuello's presence around Belize. Verified announcements and event coverage will be published here.",
      es: "Escenas de la presencia de Cuello's en Belice. Los anuncios verificados y la cobertura de eventos se publicarán aquí."
    },
    "news.featured": { en: "Featured", es: "Destacado" },
    "news.captionNote": {
      en: "Captions describe what the photographs show. Verified headlines, dates and stories from Cuello's will appear here.",
      es: "Los pies de foto describen lo que muestran las fotografías. Aquí aparecerán titulares, fechas e historias verificadas de Cuello's."
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
    "locations.hoursTBC": { en: "Opening hours to be confirmed", es: "Horario por confirmar" },
    "locations.retailTitle": { en: "Looking for Cuello's near you?", es: "¿Buscas Cuello's cerca de ti?" },
    "locations.retailCopy": {
      en: "Any Cuello's office can point you to product information and availability in your area. A verified list of retail partners is being prepared.",
      es: "Cualquier oficina de Cuello's puede orientarte sobre productos y disponibilidad en tu zona. Se está preparando una lista verificada de puntos de venta."
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
      en: "This page connects hotels, bars, restaurants, retailers, event organizers and prospective distributors directly with Cuello's Distillery Ltd.",
      es: "Esta página conecta hoteles, bares, restaurantes, minoristas, organizadores de eventos y posibles distribuidores directamente con Cuello's Distillery Ltd."
    },
    "trade.p1Title": { en: "Retail stock", es: "Venta minorista" },
    "trade.p1Copy": { en: "Shops and supermarkets interested in the Cuello's range.", es: "Tiendas y supermercados interesados en la gama Cuello's." },
    "trade.p2Title": { en: "Hotels & restaurants", es: "Hoteles y restaurantes" },
    "trade.p2Copy": { en: "Supply enquiries for kitchens, minibars and dining programmes.", es: "Consultas de suministro para cocinas, minibares y programas gastronómicos." },
    "trade.p3Title": { en: "Bars & cocktail programmes", es: "Bares y coctelería" },
    "trade.p3Copy": { en: "Build a Belizean back bar around nine spirits.", es: "Crea una barra beliceña con nueve licores." },
    "trade.p4Title": { en: "Events", es: "Eventos" },
    "trade.p4Copy": { en: "Festivals, weddings and private celebrations.", es: "Festivales, bodas y celebraciones privadas." },
    "trade.p5Title": { en: "Distribution", es: "Distribución" },
    "trade.p5Copy": { en: "Conversations with prospective distribution partners.", es: "Conversaciones con posibles socios de distribución." },
    "trade.p6Title": { en: "Partnerships", es: "Alianzas" },
    "trade.p6Copy": { en: "General commercial partnerships and sponsorship enquiries.", es: "Alianzas comerciales generales y consultas de patrocinio." },
    "trade.actionsTitle": { en: "Start a trade conversation", es: "Inicia una conversación comercial" },
    "trade.actionsIntro": {
      en: "Message us directly — include your business or organization, your location, the products you are interested in, and your question. The right person at Cuello's will follow up.",
      es: "Escríbenos directamente — incluye tu empresa u organización, tu ubicación, los productos que te interesan y tu consulta. La persona indicada en Cuello's dará seguimiento."
    },
    "trade.waBtn": { en: "WhatsApp Cuello's", es: "WhatsApp Cuello's" },
    "trade.emailBtn": { en: "Email a trade enquiry", es: "Enviar consulta por correo" },
    "trade.callBtn": { en: "Call Main Office", es: "Llamar a la Oficina Principal" },
    "trade.waMessage": {
      en: "Hello Cuello's Distillery. I am interested in a trade or distribution enquiry.\n\nBusiness or organisation:\nLocation:\nProducts of interest:\nMessage:",
      es: "Hola Cuello's Distillery. Me interesa una consulta comercial o de distribución.\n\nEmpresa u organización:\nUbicación:\nProductos de interés:\nMensaje:"
    },
    "trade.emailSubject": { en: "Trade or Distribution Enquiry", es: "Consulta Comercial o de Distribución" },
    "trade.emailBody": {
      en: "Hello Cuello's Distillery,\n\nBusiness or organisation:\nLocation:\nProducts of interest:\nMessage:\n\nThank you.",
      es: "Hola Cuello's Distillery:\n\nEmpresa u organización:\nUbicación:\nProductos de interés:\nMensaje:\n\nGracias."
    },
    "trade.whyTitle": { en: "Why partners choose Cuello's", es: "Por qué los socios eligen Cuello's" },
    "trade.why1Title": { en: "An established name", es: "Un nombre establecido" },
    "trade.why1Copy": { en: "A longstanding Belizean distillery under the Rums of Belize trademark.", es: "Una destilería beliceña de larga trayectoria bajo la marca Rums of Belize." },
    "trade.why2Title": { en: "A full cabinet", es: "Una vitrina completa" },
    "trade.why2Copy": { en: "Nine spirits spanning rum, vodka, gin, brandy and specialties.", es: "Nueve licores entre ron, vodka, ginebra, brandy y especialidades." },
    "trade.why3Title": { en: "Direct contact", es: "Contacto directo" },
    "trade.why3Copy": { en: "Reach the distillery directly by WhatsApp, email or phone.", es: "Contacta a la destilería directamente por WhatsApp, correo o teléfono." },
    "trade.lineupAlt": { en: "Cuello's product lineup displayed outdoors", es: "Gama de productos Cuello's exhibida al aire libre" },
    "trade.heroAlt": { en: "Cuello's booth at an outdoor event with branded products", es: "Stand de Cuello's en un evento al aire libre con productos de la marca" },

    /* ---------- Contact ---------- */
    "contact.metaTitle": { en: "Contact — Cuello's Distillery Ltd.", es: "Contacto — Cuello's Distillery Ltd." },
    "contact.eyebrow": { en: "Contact", es: "Contacto" },
    "contact.title": { en: "Talk to Cuello's", es: "Habla con Cuello's" },
    "contact.lede": {
      en: "Questions, availability, feedback — reach the team directly. No forms, no waiting.",
      es: "Preguntas, disponibilidad, comentarios — contacta al equipo directamente. Sin formularios, sin esperas."
    },
    "contact.directTitle": { en: "Reach us directly", es: "Contáctanos directamente" },
    "contact.actionsTitle": { en: "Message us in seconds", es: "Escríbenos en segundos" },
    "contact.actionsIntro": {
      en: "To help us answer quickly, include:",
      es: "Para ayudarnos a responder rápido, incluye:"
    },
    "contact.include1": { en: "Your name", es: "Tu nombre" },
    "contact.include2": { en: "Your location", es: "Tu ubicación" },
    "contact.include3": { en: "The product or service you are asking about", es: "El producto o servicio de tu consulta" },
    "contact.include4": { en: "Your question, availability request or feedback", es: "Tu pregunta, solicitud de disponibilidad o comentario" },
    "contact.waBtn": { en: "WhatsApp Cuello's", es: "WhatsApp Cuello's" },
    "contact.emailBtn": { en: "Email Cuello's", es: "Escribir a Cuello's" },
    "contact.callBtn": { en: "Call Main Office", es: "Llamar a la Oficina Principal" },
    "contact.locationsBtn": { en: "View All Locations", es: "Ver Todas las Ubicaciones" },
    "contact.waMessage": {
      en: "Hello Cuello's Distillery. I am contacting you through your website and would like assistance with:",
      es: "Hola Cuello's Distillery. Los contacto desde su sitio web y quisiera ayuda con:"
    },
    "contact.emailSubject": { en: "Website Enquiry for Cuello's Distillery", es: "Consulta desde el sitio web de Cuello's Distillery" },
    "contact.emailBody": {
      en: "Hello Cuello's Distillery,\n\nName:\nLocation:\nProduct or service:\nMessage:\n\nThank you.",
      es: "Hola Cuello's Distillery:\n\nNombre:\nUbicación:\nProducto o servicio:\nMensaje:\n\nGracias."
    },
    "contact.tradeNote": {
      en: "Business enquiry? Hotels, retailers and distributors have a dedicated trade page.",
      es: "¿Consulta de negocios? Hoteles, minoristas y distribuidores tienen una página comercial dedicada."
    },
    "contact.tradeCta": { en: "Go to Trade & Distribution", es: "Ir a Comercio y Distribución" },

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
