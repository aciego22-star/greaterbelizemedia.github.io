/* ============================================================
   CUELLO'S DISTILLERY — Central content data
   Products, cocktails, news and gallery manifests.
   Update this file to change site content; layouts adapt.
   Bilingual fields use { en, es } objects.
   NOTE: sizes / ABV / recipes intentionally read "to be
   confirmed" until verified by Cuello's (see README.md).
   ============================================================ */

window.CuellosData = (function () {
  "use strict";

  /* ---------- Products (9) ----------
     Names follow the publicly listed range. Accent colours are
     drawn from each label. img paths point to assets/img/products/. */

  var PRODUCTS = [
    {
      id: "caribbean-extra-strong-rum",
      name: "Caribbean Extra Strong Rum",
      category: "rum",
      accent: "#B9954B",
      desc: {
        en: "The bold end of the cabinet — Cuello's high-strength white rum, distilled, blended and bottled in Orange Walk Town.",
        es: "El lado audaz de la vitrina — el ron blanco de alta graduación de Cuello's, destilado, mezclado y embotellado en Orange Walk Town."
      },
      serve: {
        en: "Traditionally enjoyed with a generous squeeze of lime.",
        es: "Tradicionalmente se disfruta con un buen toque de limón."
      },
      cocktail: "cane-cutter",
      alt: {
        en: "Bottle of Cuello's Caribbean Extra Strong Rum with black and gold label",
        es: "Botella de Caribbean Extra Strong Rum de Cuello's con etiqueta negra y dorada"
      }
    },
    {
      id: "czar-vodka",
      name: "CZAR Vodka",
      category: "clear",
      accent: "#31518F",
      desc: {
        en: "A crisp, clear vodka in the recognizable blue diamond label — Belize's own take on a world classic.",
        es: "Un vodka claro y fresco con la reconocible etiqueta azul de diamantes — la versión beliceña de un clásico mundial."
      },
      serve: {
        en: "Serve well chilled, neat or with soda and lime.",
        es: "Sírvelo bien frío, solo o con soda y limón."
      },
      cocktail: "czar-press",
      alt: {
        en: "Bottle of CZAR Vodka with blue diamond-grid label",
        es: "Botella de CZAR Vodka con etiqueta azul de cuadrícula de diamantes"
      }
    },
    {
      id: "caribbean-white-rum",
      name: "Caribbean White Rum",
      category: "rum",
      accent: "#3E7A4E",
      desc: {
        en: "The everyday classic — a clear Belizean white rum made for mixing, from beach bars to family gatherings.",
        es: "El clásico de todos los días — un ron blanco beliceño hecho para mezclar, de los bares de playa a las reuniones familiares."
      },
      serve: {
        en: "The heart of a Belizean mojito-style serve with mint and lime.",
        es: "El corazón de un estilo mojito beliceño con hierbabuena y limón."
      },
      cocktail: "cane-cutter",
      alt: {
        en: "Bottle of Cuello's Caribbean White Rum with black, gold and green label",
        es: "Botella de Caribbean White Rum de Cuello's con etiqueta negra, dorada y verde"
      }
    },
    {
      id: "trafalgar-gin",
      name: "Trafalgar Gin",
      category: "clear",
      accent: "#2E5E8F",
      desc: {
        en: "A London Dry style gin with a Belizean postcard on the label — bright, juniper-led and ready for tonic.",
        es: "Una ginebra estilo London Dry con una postal beliceña en la etiqueta — brillante, con enebro y lista para la tónica."
      },
      serve: {
        en: "Gin and tonic with cucumber or local citrus.",
        es: "Gin tonic con pepino o cítricos locales."
      },
      cocktail: "trafalgar-tonic",
      alt: {
        en: "Bottle of Trafalgar Gin with blue Belize-scene label",
        es: "Botella de Trafalgar Gin con etiqueta azul de paisaje beliceño"
      }
    },
    {
      id: "anise",
      name: "Anise",
      category: "specialty",
      accent: "#C9A227",
      desc: {
        en: "A traditional anise-flavoured spirit with deep roots in Belizean homes — a taste passed down through generations.",
        es: "Un licor tradicional con sabor a anís y raíces profundas en los hogares beliceños — un sabor transmitido por generaciones."
      },
      serve: {
        en: "Traditionally sipped neat, or alongside strong coffee.",
        es: "Tradicionalmente se toma solo, o acompañando un café fuerte."
      },
      cocktail: "anise-cafe",
      alt: {
        en: "Bottle of Cuello's Anise with cream and yellow label",
        es: "Botella de Anise de Cuello's con etiqueta crema y amarilla"
      }
    },
    {
      id: "caribbean-coconut-rum",
      name: "Caribbean Coconut Rum",
      category: "rum",
      accent: "#4FA3C4",
      desc: {
        en: "Tropical and easy-going — coconut rum made for sunset serves on the cayes.",
        es: "Tropical y relajado — ron de coco hecho para servirse al atardecer en los cayos."
      },
      serve: {
        en: "Over ice with pineapple — a Belizean beach in a glass.",
        es: "Con hielo y piña — una playa beliceña en un vaso."
      },
      cocktail: "coco-breeze",
      alt: {
        en: "Bottle of Cuello's Caribbean Coconut Rum with blue tropical label",
        es: "Botella de Caribbean Coconut Rum de Cuello's con etiqueta azul tropical"
      }
    },
    {
      id: "imperial-brandy",
      name: "Imperial Brandy",
      category: "clear",
      accent: "#8A6A2F",
      desc: {
        en: "Amber, warming and dressed in black and gold with three stars — the cabinet's after-dinner statement.",
        es: "Ámbar, cálido y vestido de negro y dorado con tres estrellas — la declaración de sobremesa de la vitrina."
      },
      serve: {
        en: "Neat in a warm glass, after a good meal.",
        es: "Solo en copa tibia, después de una buena comida."
      },
      cocktail: "orange-walk-old-fashioned",
      alt: {
        en: "Bottle of Imperial Brandy with black and gold three-star label",
        es: "Botella de Imperial Brandy con etiqueta negra y dorada de tres estrellas"
      }
    },
    {
      id: "green-stripe",
      name: "Green Stripe",
      category: "specialty",
      accent: "#3E7A4E",
      desc: {
        en: "One of the most recognizable labels in the Cuello's family — the green-striped bottle Belizeans know on sight.",
        es: "Una de las etiquetas más reconocibles de la familia Cuello's — la botella de franja verde que los beliceños reconocen a primera vista."
      },
      serve: {
        en: "A traditional favourite, served the way your family always has.",
        es: "Un favorito tradicional, servido como siempre lo ha hecho tu familia."
      },
      cocktail: "cane-cutter",
      alt: {
        en: "Green Stripe bottle with diagonal green and white label",
        es: "Botella Green Stripe con etiqueta diagonal verde y blanca"
      }
    },
    {
      id: "caribbean-gold-rum",
      name: "Caribbean Gold Rum",
      category: "rum",
      accent: "#C47828",
      desc: {
        en: "The amber presentation of the Caribbean Rum line — golden colour, classic black and gold label.",
        es: "La presentación ámbar de la línea Caribbean Rum — color dorado y la clásica etiqueta negra y dorada."
      },
      serve: {
        en: "Over ice, or stirred slowly with bitters and orange.",
        es: "Con hielo, o mezclado lentamente con amargos y naranja."
      },
      cocktail: "orange-walk-old-fashioned",
      alt: {
        en: "Bottle of Cuello's Caribbean Gold Rum with amber liquid and black and gold label",
        es: "Botella de Caribbean Gold Rum de Cuello's con líquido ámbar y etiqueta negra y dorada"
      }
    }
  ];

  var CATEGORIES = [
    { id: "rum", labelKey: "spirits.catRum", copyKey: "spirits.catRumCopy" },
    { id: "clear", labelKey: "spirits.catWhite", copyKey: "spirits.catWhiteCopy" },
    { id: "specialty", labelKey: "spirits.catSpecial", copyKey: "spirits.catSpecialCopy" }
  ];

  var CATEGORY_LABEL = {
    rum: { en: "Caribbean Rum Collection", es: "Colección Caribbean Rum" },
    clear: { en: "Vodka, Gin & Brandy", es: "Vodka, Ginebra y Brandy" },
    specialty: { en: "Liqueurs & Specialty", es: "Licores y Especialidades" }
  };

  /* Featured on the home rail (4, per revised direction) */
  var FEATURED = ["caribbean-gold-rum", "caribbean-white-rum", "czar-vodka", "caribbean-coconut-rum"];

  /* ---------- Cocktails (concept serves — no invented measures) ---------- */

  var COCKTAILS = [
    {
      id: "orange-walk-old-fashioned",
      name: { en: "Orange Walk Old Fashioned", es: "Old Fashioned de Orange Walk" },
      spirit: "caribbean-gold-rum",
      accent: "#C47828",
      desc: {
        en: "Caribbean Gold Rum stirred slow with cane sugar, bitters and orange — the heritage serve.",
        es: "Caribbean Gold Rum mezclado lentamente con azúcar de caña, amargos y naranja — el trago con herencia."
      },
      glass: { en: "Rocks glass", es: "Vaso corto" },
      garnish: { en: "Orange peel", es: "Cáscara de naranja" }
    },
    {
      id: "coco-breeze",
      name: { en: "Belizean Coco Breeze", es: "Brisa de Coco Beliceña" },
      spirit: "caribbean-coconut-rum",
      accent: "#4FA3C4",
      desc: {
        en: "Coconut Rum, pineapple and lime over crushed ice — sunset on the cayes, in a glass.",
        es: "Ron de coco, piña y limón sobre hielo picado — el atardecer de los cayos en un vaso."
      },
      glass: { en: "Highball", es: "Vaso alto" },
      garnish: { en: "Pineapple wedge", es: "Trozo de piña" }
    },
    {
      id: "cane-cutter",
      name: { en: "Cane Cutter", es: "El Cañero" },
      spirit: "caribbean-white-rum",
      accent: "#3E7A4E",
      desc: {
        en: "White Rum with mint, lime and cane sugar — a mojito-style tribute to Orange Walk's cane fields.",
        es: "Ron blanco con hierbabuena, limón y azúcar de caña — un homenaje estilo mojito a los cañaverales de Orange Walk."
      },
      glass: { en: "Highball", es: "Vaso alto" },
      garnish: { en: "Fresh mint", es: "Hierbabuena fresca" }
    },
    {
      id: "czar-press",
      name: { en: "CZAR Citrus Press", es: "CZAR Citrus Press" },
      spirit: "czar-vodka",
      accent: "#31518F",
      desc: {
        en: "CZAR Vodka, fresh lime and soda — clean, cold and endlessly repeatable.",
        es: "CZAR Vodka, limón fresco y soda — limpio, frío e infinitamente repetible."
      },
      glass: { en: "Highball", es: "Vaso alto" },
      garnish: { en: "Lime wheel", es: "Rodaja de limón" }
    },
    {
      id: "trafalgar-tonic",
      name: { en: "Trafalgar Garden Tonic", es: "Trafalgar Garden Tonic" },
      spirit: "trafalgar-gin",
      accent: "#2E5E8F",
      desc: {
        en: "Trafalgar Gin lengthened with tonic, cucumber and herbs — bright and botanical.",
        es: "Trafalgar Gin con tónica, pepino y hierbas — brillante y botánico."
      },
      glass: { en: "Copa glass", es: "Copa balón" },
      garnish: { en: "Cucumber ribbon", es: "Tira de pepino" }
    },
    {
      id: "anise-cafe",
      name: { en: "Anise Café", es: "Café con Anís" },
      spirit: "anise",
      accent: "#C9A227",
      desc: {
        en: "Cuello's Anise alongside strong Belizean coffee — a traditional after-dinner pairing.",
        es: "Anise de Cuello's junto a un café beliceño fuerte — un maridaje tradicional de sobremesa."
      },
      glass: { en: "Demitasse & sipper", es: "Taza y copita" },
      garnish: { en: "Star anise", es: "Anís estrella" }
    }
  ];

  /* ---------- News (sample stories — clearly badged in UI) ---------- */

  var NEWS = [
    {
      id: "carnival-season",
      featured: true,
      img: "assets/img/editorial/carnival-brand-activation",
      w: 1284, h: 943,
      category: "news.catCommunity",
      title: {
        en: "Colour, music and Cuello's: the brand on the carnival route",
        es: "Color, música y Cuello's: la marca en la ruta del carnaval"
      },
      excerpt: {
        en: "When Belize celebrates, Cuello's celebrates with it. A look at how the distillery shows up at the country's most vibrant moments — and what's coming next season.",
        es: "Cuando Belice celebra, Cuello's celebra con él. Una mirada a cómo la destilería se hace presente en los momentos más vibrantes del país — y lo que viene la próxima temporada."
      },
      alt: {
        en: "Carnival dancers in vibrant costumes at a Cuello's activation",
        es: "Bailarines de carnaval con trajes vibrantes en una activación de Cuello's"
      }
    },
    {
      id: "trade-booth",
      img: "assets/img/editorial/community-trade-booth",
      w: 1284, h: 1672,
      category: "news.catTrade",
      title: {
        en: "Meet the team: Cuello's on the event circuit",
        es: "Conoce al equipo: Cuello's en el circuito de eventos"
      },
      excerpt: {
        en: "From trade fairs to community gatherings, the Cuello's booth is where partners and customers meet the family behind the label.",
        es: "De ferias comerciales a encuentros comunitarios, el stand de Cuello's es donde socios y clientes conocen a la familia detrás de la etiqueta."
      },
      alt: {
        en: "Cuello's branded booth at a community event",
        es: "Stand de la marca Cuello's en un evento comunitario"
      }
    },
    {
      id: "basketball-community",
      img: "assets/img/gallery/basketball-court-activation",
      w: 1194, h: 945,
      category: "news.catCommunity",
      title: {
        en: "Backing the home game: community activations in Orange Walk",
        es: "Apoyando el juego local: activaciones comunitarias en Orange Walk"
      },
      excerpt: {
        en: "Sport, neighbourhood pride and a hometown brand — how Cuello's stays close to the communities that built it.",
        es: "Deporte, orgullo de barrio y una marca local — así se mantiene Cuello's cerca de las comunidades que la construyeron."
      },
      alt: {
        en: "Cuello's brand activation at a basketball court",
        es: "Activación de la marca Cuello's en una cancha de baloncesto"
      }
    },
    {
      id: "beach-flags",
      img: "assets/img/gallery/belizes-best-beach-flags",
      w: 1284, h: 1690,
      category: "news.catEvents",
      title: {
        en: "Belize's best, flying high on the beach",
        es: "Lo mejor de Belice, ondeando en la playa"
      },
      excerpt: {
        en: "Flags up, bottles out — scenes from Cuello's beachside presence on the coast and the cayes.",
        es: "Banderas arriba, botellas listas — escenas de la presencia de Cuello's en la costa y los cayos."
      },
      alt: {
        en: "Cuello's flags on a beach display",
        es: "Banderas de Cuello's en una exhibición de playa"
      }
    }
  ];

  /* ---------- Gallery manifest ----------
     focal: CSS object-position to protect the subject.
     Categories: products | distillery | events | community | videos
     To add a video: { type:"video", src:"assets/video/file.mp4",
       poster:"assets/img/gallery/poster-name", ... } — the Videos
       filter appears automatically. */

  var GALLERY = [
    {
      id: "belize-letters", img: "assets/img/editorial/belize-letters-installation",
      w: 1284, h: 450, category: "events", focal: "50% 60%",
      caption: { en: "The BELIZE letters, dressed by Cuello's", es: "Las letras BELIZE, vestidas por Cuello's" },
      alt: { en: "Colourful BELIZE letters topped with Cuello's bottles and barrels by the sea", es: "Letras BELIZE de colores con botellas y barriles de Cuello's junto al mar" }
    },
    {
      id: "trafalgar-garden", img: "assets/img/gallery/trafalgar-gin-garden-display",
      w: 1284, h: 1001, category: "products", focal: "50% 45%",
      caption: { en: "Trafalgar Gin, garden display", es: "Trafalgar Gin, exhibición en jardín" },
      alt: { en: "Trafalgar Gin bottles displayed among green plants", es: "Botellas de Trafalgar Gin exhibidas entre plantas verdes" }
    },
    {
      id: "vintage-lineup", img: "assets/img/gallery/vintage-product-lineup",
      w: 1284, h: 623, category: "products", focal: "50% 55%",
      caption: { en: "The full range, classic lineup", es: "La gama completa, alineación clásica" },
      alt: { en: "Vintage photograph of the full Cuello's product range", es: "Fotografía clásica de la gama completa de productos Cuello's" }
    },
    {
      id: "flambe", img: "assets/img/gallery/white-rum-flambe",
      w: 1284, h: 1016, category: "events", focal: "50% 40%",
      caption: { en: "White Rum, with fire", es: "Ron blanco, con fuego" },
      alt: { en: "Flambé preparation using Cuello's Caribbean White Rum", es: "Preparación flambeada con Caribbean White Rum de Cuello's" }
    },
    {
      id: "outdoor-lineup", img: "assets/img/gallery/outdoor-product-lineup",
      w: 1014, h: 350, category: "products", focal: "50% 50%",
      caption: { en: "The cabinet, outdoors", es: "La vitrina, al aire libre" },
      alt: { en: "Cuello's bottles lined up outdoors", es: "Botellas de Cuello's alineadas al aire libre" }
    },
    {
      id: "secret-beach", img: "assets/img/gallery/secret-beach-brand-display",
      w: 1284, h: 956, category: "community", focal: "50% 45%",
      caption: { en: "Secret Beach, Cuello's style", es: "Secret Beach, al estilo Cuello's" },
      alt: { en: "Cuello's brand display at Secret Beach", es: "Exhibición de la marca Cuello's en Secret Beach" }
    },
    {
      id: "bar-lineup", img: "assets/img/gallery/bar-product-lineup",
      w: 1005, h: 493, category: "products", focal: "50% 50%",
      caption: { en: "Behind the bar", es: "Detrás de la barra" },
      alt: { en: "Cuello's bottles lined up on a bar", es: "Botellas de Cuello's alineadas en una barra" }
    },
    {
      id: "basketball", img: "assets/img/gallery/basketball-court-activation",
      w: 1194, h: 945, category: "community", focal: "50% 45%",
      caption: { en: "Community court activation", es: "Activación en cancha comunitaria" },
      alt: { en: "Cuello's activation at a basketball court", es: "Activación de Cuello's en una cancha de baloncesto" }
    },
    {
      id: "beach-lineup", img: "assets/img/gallery/beach-product-lineup",
      w: 1284, h: 1690, category: "products", focal: "50% 55%",
      caption: { en: "The range at the beach", es: "La gama en la playa" },
      alt: { en: "Cuello's product lineup photographed on the beach", es: "Gama de productos Cuello's fotografiada en la playa" }
    },
    {
      id: "beach-flags", img: "assets/img/gallery/belizes-best-beach-flags",
      w: 1284, h: 1690, category: "events", focal: "50% 40%",
      caption: { en: "Flags on the sand", es: "Banderas en la arena" },
      alt: { en: "Cuello's flags flying at a beach display", es: "Banderas de Cuello's ondeando en la playa" }
    },
    {
      id: "mural", img: "assets/img/gallery/orange-walk-mural-lineup",
      w: 1284, h: 936, category: "community", focal: "50% 50%",
      caption: { en: "Orange Walk mural, product lineup", es: "Mural de Orange Walk, gama de productos" },
      alt: { en: "Cuello's bottles in front of an Orange Walk mural", es: "Botellas de Cuello's frente a un mural de Orange Walk" }
    },
    {
      id: "czar-beach", img: "assets/img/gallery/czar-vodka-beach-portrait",
      w: 1284, h: 1896, category: "products", focal: "50% 40%",
      caption: { en: "CZAR Vodka, seaside", es: "CZAR Vodka, junto al mar" },
      alt: { en: "CZAR Vodka bottle photographed at the beach", es: "Botella de CZAR Vodka fotografiada en la playa" }
    },
    {
      id: "storefront", img: "assets/img/editorial/san-pedro-storefront",
      w: 1182, h: 1698, category: "community", focal: "50% 45%",
      caption: { en: "San Pedro storefront", es: "Fachada en San Pedro" },
      alt: { en: "Cuello's branded storefront in San Pedro", es: "Fachada con la marca Cuello's en San Pedro" }
    },
    {
      id: "distillery-exterior", img: "assets/img/story/distillery-exterior",
      w: 1280, h: 720, category: "distillery", focal: "50% 50%",
      caption: { en: "The distillery, Orange Walk Town", es: "La destilería, Orange Walk Town" },
      alt: { en: "Exterior view of the Cuello's distillery", es: "Vista exterior de la destilería Cuello's" }
    },
    {
      id: "bottling-line", img: "assets/img/story/production-line",
      w: 1280, h: 720, category: "distillery", focal: "50% 50%",
      caption: { en: "On the production line", es: "En la línea de producción" },
      alt: { en: "Bottles on the Cuello's production line", es: "Botellas en la línea de producción de Cuello's" }
    },
    {
      id: "bottling-closeup", img: "assets/img/story/bottling-closeup",
      w: 1280, h: 720, category: "distillery", focal: "50% 50%",
      caption: { en: "Bottling, up close", es: "Embotellado, de cerca" },
      alt: { en: "Close-up of bottles being filled", es: "Primer plano de botellas llenándose" }
    }
  ];

  return {
    products: PRODUCTS,
    categories: CATEGORIES,
    categoryLabel: CATEGORY_LABEL,
    featured: FEATURED,
    cocktails: COCKTAILS,
    news: NEWS,
    gallery: GALLERY,
    byId: function (id) {
      for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
      return null;
    }
  };
})();
