/* ============================================================
   CUELLOS DISTILLERY - Central content data
   Products, cocktails, news and gallery manifests.
   Update this file to change site content; layouts adapt.
   Bilingual fields use { en, es } objects.

   COPY POLICY (V1.1): descriptions state only what is visible
   on the label or photograph, plus origin. Tasting notes,
   flavour claims, sizes, strengths, recipes and news stories
   are intentionally absent until confirmed by Cuello's
   (see CLIENT-CONFIRMATION-CHECKLIST.md).
   ============================================================ */

window.CuellosData = (function () {
  "use strict";

  /* ---------- Products (9) ----------
     Names follow the publicly listed range. The display name of
     the amber rum ("Caribbean Gold Rum" vs the label's
     "Caribbean Rum") requires client confirmation.
     Accent colours are drawn from each label.
     Marquee/lineup order is defined by MARQUEE_ORDER below. */

  var PRODUCTS = [
    {
      id: "caribbean-extra-strong-rum",
      name: "Caribbean Extra Strong Rum",
      category: "rum",
      accent: "#B9954B",
      desc: {
        en: "Part of the Caribbean Rum Collection: distilled, blended and bottled by Cuello's Distillery Ltd. in Orange Walk Town, Belize.",
        es: "Parte de la Colección Caribbean Rum: destilado, mezclado y embotellado por Cuello's Distillery Ltd. en Orange Walk Town, Belice."
      },
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
        en: "Cuello's vodka in the blue diamond label: produced in Orange Walk Town, Belize.",
        es: "El vodka de Cuello's con la etiqueta azul de diamantes: producido en Orange Walk Town, Belice."
      },
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
        en: "The white presentation of the Caribbean Rum Collection, a product of Belize from Cuello's Distillery Ltd.",
        es: "La presentación blanca de la Colección Caribbean Rum, un producto de Belice de Cuello's Distillery Ltd."
      },
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
        en: "Cuello's gin, labelled London Dry, with a Belizean scene on the label: produced in Orange Walk Town.",
        es: "La ginebra de Cuello's, etiquetada London Dry, con un paisaje beliceño en la etiqueta: producida en Orange Walk Town."
      },
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
        en: "A traditional name in the Cuello's cabinet, in its cream and yellow label: produced in Orange Walk Town, Belize.",
        es: "Un nombre tradicional de la vitrina Cuello's, con su etiqueta crema y amarilla: producido en Orange Walk Town, Belice."
      },
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
        en: "The coconut presentation of the Caribbean Rum Collection, in its blue tropical label, a product of Belize.",
        es: "La presentación de coco de la Colección Caribbean Rum, con su etiqueta azul tropical, un producto de Belice."
      },
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
        en: "Cuello's brandy in the black and gold three-star label: produced in Orange Walk Town, Belize.",
        es: "El brandy de Cuello's con la etiqueta negra y dorada de tres estrellas: producido en Orange Walk Town, Belice."
      },
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
        en: "A longstanding label in the Cuello's range, in its green-striped bottle: produced in Orange Walk Town, Belize.",
        es: "Una etiqueta de larga trayectoria en la gama Cuello's, con su botella de franja verde: producida en Orange Walk Town, Belice."
      },
      alt: {
        en: "Green Stripe bottle with diagonal green and white label",
        es: "Botella Green Stripe con etiqueta diagonal verde y blanca"
      }
    },
    {
      id: "caribbean-gold-rum",
      name: "Caribbean Gold Rum",
      /* Label reads "Caribbean Rum" (gold presentation). Public-facing
         name pending client confirmation - see checklist. */
      name_pending_confirmation: true,
      category: "rum",
      accent: "#C47828",
      desc: {
        en: "The amber presentation of the Caribbean Rum Collection, in the classic black and gold label, a product of Belize.",
        es: "La presentación ámbar de la Colección Caribbean Rum, con la clásica etiqueta negra y dorada, un producto de Belice."
      },
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

  /* Marquee order (home) - the established lineup */
  var MARQUEE_ORDER = [
    "caribbean-coconut-rum",
    "imperial-brandy",
    "czar-vodka",
    "anise",
    "caribbean-gold-rum",
    "caribbean-white-rum",
    "trafalgar-gin",
    "caribbean-extra-strong-rum",
    "green-stripe"
  ];

  /* ---------- Cocktails ----------
     Empty until Cuello's supplies official recipes. The Cocktails
     page shows a "recipes coming soon" presentation while this
     list is empty. To publish an approved recipe, add:
     { id, name:{en,es}, spirit:"product-id", accent:"#hex",
       ingredients:{en,es}, method:{en,es}, glass:{en,es},
       garnish:{en,es} }                                        */

  var COCKTAILS = [];

  /* ---------- News ----------
     Neutral photo cards only - titles and captions describe what
     the photographs visibly show. Replace with verified stories
     (add date:{en,es} and excerpt fields) once confirmed.       */

  var NEWS = [
    {
      id: "across-belize",
      featured: true,
      img: "assets/img/editorial/carnival-brand-activation",
      w: 1284, h: 943,
      title: { en: "Cuello's Across Belize", es: "Cuello's por Todo Belice" },
      caption: {
        en: "Carnival dancers in costume at a Cuello's brand activation.",
        es: "Bailarines de carnaval con trajes en una activación de la marca Cuello's."
      },
      alt: {
        en: "Carnival dancers in vibrant costumes at a Cuello's activation",
        es: "Bailarines de carnaval con trajes vibrantes en una activación de Cuello's"
      }
    },
    {
      id: "community-booth",
      img: "assets/img/editorial/community-trade-booth",
      w: 1284, h: 1672,
      title: { en: "Cuello's in the Community", es: "Cuello's en la Comunidad" },
      caption: {
        en: "A Cuello's booth with branded products at an outdoor gathering.",
        es: "Un stand de Cuello's con productos de la marca en un evento al aire libre."
      },
      alt: {
        en: "Cuello's branded booth at an outdoor community gathering",
        es: "Stand de la marca Cuello's en un encuentro comunitario al aire libre"
      }
    },
    {
      id: "court-showcase",
      img: "assets/img/gallery/basketball-court-activation",
      w: 1194, h: 945,
      title: { en: "Product Showcase", es: "Vitrina de Productos" },
      caption: {
        en: "The Cuello's range displayed courtside at a community venue.",
        es: "La gama Cuello's exhibida junto a una cancha comunitaria."
      },
      alt: {
        en: "Cuello's bottles displayed at a basketball court",
        es: "Botellas de Cuello's exhibidas en una cancha de baloncesto"
      }
    },
    {
      id: "beach-flags",
      img: "assets/img/gallery/belizes-best-beach-flags",
      w: 1284, h: 1690,
      title: { en: "Cuello's on the Coast", es: "Cuello's en la Costa" },
      caption: {
        en: "Branded flags flying at a beachside display.",
        es: "Banderas de la marca ondeando en una exhibición junto a la playa."
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
     To add a video: { id, type:"video", src:"assets/video/file.mp4",
       poster:"assets/img/gallery/poster-name", w, h, category:"videos"
       or another category, caption:{en,es}, alt:{en,es} } - the
       Videos filter chip appears automatically. Videos never
       autoplay and stop when the lightbox closes.               */

  var GALLERY = [
    {
      id: "video-beach-bar", type: "video",
      src: "assets/video/cuello-hero-video.mp4",
      poster: "assets/img/gallery/cuello-hero-video-poster",
      w: 1280, h: 622, category: "videos",
      caption: { en: "At the beach bar with Cuello's", es: "En el bar de playa con Cuello's" },
      alt: { en: "Video of friends enjoying Cuello's drinks at an outdoor beach bar", es: "Video de amigos disfrutando bebidas Cuello's en un bar de playa al aire libre" }
    },
    {
      id: "video-beach-moments", type: "video",
      src: "assets/video/cuello-beach-moments.mp4",
      poster: "assets/img/gallery/cuello-beach-moments-poster",
      w: 720, h: 1262, category: "videos",
      caption: { en: "Beach moments with Cuello's", es: "Momentos de playa con Cuello's" },
      alt: { en: "Video of a beach day with Cuello's drinks under the palms", es: "Video de un día de playa con bebidas Cuello's bajo las palmeras" }
    },
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
      caption: { en: "Community court display", es: "Exhibición en cancha comunitaria" },
      alt: { en: "Cuello's display at a basketball court", es: "Exhibición de Cuello's en una cancha de baloncesto" }
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
    marqueeOrder: MARQUEE_ORDER,
    cocktails: COCKTAILS,
    news: NEWS,
    gallery: GALLERY,
    byId: function (id) {
      for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
      return null;
    }
  };
})();
