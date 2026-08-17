/* ============================================================================
   Business view — protection for Belizean businesses, mapped strictly to
   ICB's published categories.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  /* Copy that belongs to this view only, written in both languages
     where it is used. See ICB.T in js/i18n.js. */
  var T = ICB.T;

  /* Every item listed here is one of ICB's published products. Nothing on
     this page describes a package, bundle or term that ICB does not
     publish itself. */
  var SEGMENTS = [
    {
      title: { en: "Premises and property", es: "Local y propiedad" },
      body: { en: "For shops, offices, warehouses and commercial buildings.", es: "Para tiendas, oficinas, bodegas y edificios comerciales." },
      items: ["Small Business", "Commercial"],
      glyph: "house",
      links: [{ label: "Property Insurance", href: "#/insurance/property" }]
    },
    {
      title: { en: "Vehicles and fleets", es: "Vehículos y flotas" },
      body: { en: "Motor cover is available for the vehicles a business runs.", es: "Hay cobertura Motor para los vehículos que opera un negocio." },
      items: [{ en: "Commercial Vehicles", es: "Vehículos comerciales" }, { en: "Taxis & Buses", es: "Taxis y autobuses" }, { en: "Heavy Duty Vehicles", es: "Vehículos de carga pesada" }],
      glyph: "car",
      links: [{ label: "Motor Insurance", href: "#/insurance/motor" }]
    },
    {
      title: { en: "Goods in transit", es: "Mercancía en tránsito" },
      body: { en: "Cargo Insurance covers goods in transit from warehouse to warehouse.", es: "Cargo Insurance cubre la mercancía en tránsito de bodega a bodega." },
      items: [{ en: "Air Transit", es: "Tránsito aéreo" }, { en: "Land Transit", es: "Tránsito terrestre" }, { en: "Marine Transit", es: "Tránsito marítimo" }, { en: "Domestic Transit", es: "Tránsito nacional" }, { en: "Overseas Transit", es: "Tránsito al extranjero" }],
      glyph: "container",
      links: [{ label: "Cargo Insurance", href: "#/insurance/cargo" }]
    },
    {
      title: { en: "Vessels", es: "Embarcaciones" },
      body: { en: "Marine Hull Insurance can be customized to cover third party and passenger liability.", es: "Marine Hull Insurance puede personalizarse para cubrir responsabilidad ante terceros y pasajeros." },
      items: [{ en: "Barges", es: "Barcazas" }, { en: "Tug Boats", es: "Remolcadores" }, { en: "Dredgers", es: "Dragas" }, { en: "Water Taxis", es: "Taxis acuáticos" }, { en: "Fishing Vessels", es: "Embarcaciones de pesca" }],
      glyph: "boat",
      links: [{ label: "Marine Hull Insurance", href: "#/insurance/marine" }]
    },
    {
      title: { en: "Liability and specialty", es: "Responsabilidad civil y especialidades" },
      body: { en: "Liability and miscellaneous products for businesses and contractors.", es: "Productos de responsabilidad civil y otros para negocios y contratistas." },
      items: ["General Liability", "Tour Operators Liability", "Contractors All Risk", "Money Insurance", "Personal Accident"],
      glyph: "scales",
      links: [{ label: "Liability & Miscellaneous", href: "#/insurance/liability" }]
    }
  ];

  /* Administrative pathway to an ICB representative. It does not describe
     underwriting, terms or what any product will cost. */
  var PROCESS = [
    { n: 1, title: { en: "Tell ICB about the business", es: "Cuéntele a ICB sobre el negocio" }, body: { en: "A sentence or two about what you do and what you want protected is enough to start.", es: "Con una o dos frases sobre lo que hace y lo que quiere proteger basta para empezar." } },
    { n: 2, title: { en: "Meet an ICB representative", es: "Reúnase con un representante de ICB" }, body: { en: "At a branch or over the phone, whichever suits you.", es: "En una sucursal o por teléfono, como le convenga." } },
    { n: 3, title: { en: "Review the options together", es: "Revisen juntos las opciones" }, body: { en: "Your representative walks you through the categories that apply.", es: "Su representante le explica las categorías que aplican." } },
    { n: 4, title: { en: "Keep your branch close", es: "Tenga su sucursal cerca" }, body: { en: "Branches across the country stay available as the business changes.", es: "Las sucursales de todo el país siguen disponibles conforme cambia el negocio." } }
  ];

  ICB.views.business = {
    title: { en: "Business Insurance | ICB", es: "Seguros para empresas | ICB" },
    render: function () {
      var R = ICB.render;

      var segs = SEGMENTS.map(function (s) {
        var items = (s.items || []).map(function (it) {
          return '<li>' + R.esc(it) + "</li>";
        }).join("");
        return '<article class="card rv"><div class="card-body" style="padding-top: var(--sp-5);">' +
          '<div class="card-glyph" style="margin-top: 0;">' + ICB.art.glyph(s.glyph) + "</div>" +
          "<h3>" + R.esc(s.title) + "</h3>" +
          '<p class="card-desc">' + R.esc(s.body) + "</p>" +
          (items ? '<ul class="biz-items">' + items + "</ul>" : "") +
          '<div class="card-links">' +
            s.links.map(function (l) { return '<a href="' + R.esc(l.href) + '">' + R.esc(l.label) + "</a>"; }).join("") +
          "</div>" +
        "</div></article>";
      }).join("");

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="biz-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="business-band" aria-hidden="true">' + ICB.art.panel("business") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome({ en: "Business", es: "Empresas" }) +
            '<span class="eyebrow">' + T("Business insurance", "Seguros para empresas") + '</span>' +
            '<h1 id="biz-title">' + T("Protection for the business you have built.", "Protección para el negocio que ha construido.") + '</h1>' +
            '<p class="hero-lead">' + T("ICB offers insurance options for Belizean businesses across property, vehicles, cargo, marine and liability needs. Tell us what you do and an ICB representative will take it from there.", "ICB ofrece opciones de seguro para negocios beliceños en propiedad, vehículos, carga, embarcaciones y responsabilidad civil. Cuéntenos a qué se dedica y un representante de ICB sigue desde ahí.") + '</p>' +
            '<div class="btn-row">' +
              '<a class="btn btn-gold btn-lg" href="#/contact?topic=business">' + T("Request a quote", "Solicitar una cotización") + '</a>' +
              '<a class="btn btn-light btn-lg" href="#/insurance">' + T("Explore the categories", "Ver las categorías") + '</a>' +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="seg-title">' +
          '<div class="shell">' +
            R.sectionHead({
              eyebrow: { en: "Built around your operation", es: "Pensado para su operación" },
              title: { en: "Cover for every side of the business.", es: "Cobertura para cada lado del negocio." },
              sub: { en: "These are ICB's published categories. Your ICB representative helps you see which ones apply.", es: "Estas son las categorías que ICB publica. Su representante de ICB le ayuda a ver cuáles aplican." },
              id: "seg-title"
            }) +
            '<div class="card-grid">' + segs + "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--tint" aria-labelledby="process-title">' +
          '<div class="shell">' +
            R.sectionHead({ eyebrow: { en: "How it starts", es: "Cómo comienza" }, title: { en: "Four steps to a conversation.", es: "Cuatro pasos hacia una conversación." }, id: "process-title" }) +
            R.steps(PROCESS) +
          "</div>" +
        "</section>" +

        '<section class="section" aria-label="' + T("Request a quote", "Solicitar una cotizacion") + '">' +
          '<div class="shell">' +
            R.band({
              eyebrow: { en: "Ready when you are", es: "Cuando usted quiera" },
              title: { en: "Ready to talk about business cover?", es: "¿Listo para hablar de cobertura para su negocio?" },
              body: ICB.DATA.quoteNote,
              motif: "business",
              actions: [
                { label: { en: "Request a quote", es: "Solicitar una cotización" }, href: "#/contact?topic=business" },
                { label: ICB.s("callN", { n: ICB.DATA.site.corporate.phoneDisplay }), href: "tel:" + ICB.DATA.site.corporate.phoneTel }
              ]
            }) +
          "</div>" +
        "</section>";
    }
  };
})();
