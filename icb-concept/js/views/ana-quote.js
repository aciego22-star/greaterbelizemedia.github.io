/* ============================================================================
   Mexican Insurance quote, at /insurance/mexican/quote.

   ICB sells ANA Seguros' tourist auto cover as ANA's agent, and the
   quoting, the policy and the payment all happen on ANA's own system.
   This page carries that system over from ICB's old site and puts ICB's
   own explanation around it. See assets/ana/quote.html for what the tool
   actually is and why it is embedded rather than rebuilt.

   NOTHING LOADS UNTIL ASKED. The rest of this site makes no requests
   outside ICB's domain, and a visitor who never wants a quote should not
   be made to fetch a 2013 copy of jQuery from Mexico to read a page. So
   the frame is created on the button, the same bargain the Talk to Bee
   panel strikes, and the page says plainly what pressing it does.

   THE PAGE DOES NOT QUOTE. Every number a visitor sees comes back from
   ANA. This site states no premium, holds no rate table and makes no
   representation about what cover will cost: it says who is quoting and
   gets out of the way.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var FRAME = "assets/ana/quote.html";
  /* The same tool in a tab of its own, for anyone whose browser will not
     run it in a frame. It is this site's own copy rather than an address
     at ANA, because ANA publish no landing page for it: the quoter exists
     only as the embeddable widget, and auto-insurance-ana.com itself
     answers with a default server page. Checked 8 Nov 2026. */
  var DIRECT = FRAME;
  var GIVE_UP = 12000;

  /* The single-file preview refuses every outside request, so the tool
     cannot run there. Same test the assistant uses. */
  function isSandboxedPreview() {
    return Object.keys(ICB.ASSETS || {}).length > 0;
  }

  function note(text, showLink) {
    var R = ICB.render, esc = R.esc, T = ICB.T;
    return '' +
      '<div class="ana-note">' +
        "<p>" + esc(text) + "</p>" +
        (showLink
          ? '<p class="btn-row">' +
              '<a class="btn btn-primary btn-sm" data-asset-href="' + esc(DIRECT) + '"' +
                ' href="' + esc(DIRECT) + '" target="_blank" rel="noopener noreferrer">' +
                esc(T("Open the quote tool in a new tab", "Abrir la herramienta en una pestaña nueva")) +
              "</a>" +
              '<a class="btn btn-outline btn-sm" href="#/locations">' +
                esc(T("Find a branch", "Encuentre una sucursal")) +
              "</a>" +
            "</p>"
          : "") +
      "</div>";
  }

  /* ---- behaviour -------------------------------------------------- */

  function wire(root) {
    var box = root.querySelector("[data-ana-box]");
    var btn = root.querySelector("[data-ana-open]");
    if (!box || !btn) return;
    var opened = false;

    function fail(msg) {
      box.innerHTML = note(msg, true);
    }

    btn.addEventListener("click", function () {
      if (opened) return;
      opened = true;
      btn.disabled = true;
      btn.setAttribute("aria-expanded", "true");

      if (isSandboxedPreview()) {
        fail(ICB.s("anaPreviewNote"));
        return;
      }

      box.innerHTML = '<p class="ana-loading">' + ICB.render.esc(ICB.s("anaLoading")) + "</p>";
      var frame = document.createElement("iframe");
      frame.className = "ana-frame";
      frame.title = ICB.s("anaFrameTitle");
      frame.setAttribute("loading", "lazy");
      frame.src = ICB.assetUrl ? ICB.assetUrl(FRAME) : FRAME;

      var settled = false;
      var timer = setTimeout(function () {
        if (!settled) { settled = true; fail(ICB.s("anaOfflineNote")); }
      }, GIVE_UP);

      /* The frame tells us when ANA's tool is up, and how tall it has
         become, so the form is not trapped in a short scrolling box. */
      function onMessage(e) {
        var d = e.data;
        if (!d || typeof d !== "object" || !d.icbAna) return;
        if (d.icbAna === "ready" && !settled) {
          settled = true; clearTimeout(timer);
        }
        if (d.icbAna === "failed" && !settled) {
          settled = true; clearTimeout(timer); fail(ICB.s("anaOfflineNote"));
          window.removeEventListener("message", onMessage);
        }
        if (d.icbAna === "height" && typeof d.height === "number") {
          var h = Math.max(520, Math.min(d.height + 24, 6000));
          frame.style.height = h + "px";
          if (!settled) { settled = true; clearTimeout(timer); }
        }
      }
      window.addEventListener("message", onMessage);

      frame.addEventListener("error", function () {
        if (!settled) { settled = true; clearTimeout(timer); fail(ICB.s("anaOfflineNote")); }
      });

      box.innerHTML = "";
      box.appendChild(frame);
    });
  }

  /* ---- the page --------------------------------------------------- */

  ICB.views.anaQuote = {
    title: {
      en: "Mexican Insurance Quote | Insurance Corporation of Belize",
      es: "Cotización de Mexican Insurance | Insurance Corporation of Belize"
    },
    render: function () {
      var R = ICB.render, esc = R.esc, T = ICB.T;

      var steps = [
        { en: "How many days you are going for, and where you are going.", es: "Cuántos días va y a dónde va." },
        { en: "The year, make and model of your vehicle, and its actual cash value in US dollars.", es: "El año, la marca y el modelo de su vehículo, y su valor actual en dólares estadounidenses." },
        { en: "A trailer, or an ATV, UTV or boat you are towing, if there is one.", es: "Un remolque, o una ATV, UTV o bote que lleve remolcando, si lo hay." },
        { en: "The limits you want on property damage, bodily injury, medical expenses for occupants, and catastrophic liability.", es: "Los límites que desea en daños a bienes, daños a personas, gastos médicos a ocupantes, y responsabilidad catastrófica." }
      ];

      return '' +
        '<section class="page-hero page-hero--article on-dark" aria-labelledby="ana-title"' +
          ' data-seo-description="' + esc(T(
            "Get a Mexican auto insurance quote through ICB. ANA Seguros' own quote tool, with ICB as your agent: enter your trip, your vehicle and the cover you want, and ANA prices it.",
            "Obtenga una cotización de seguro de auto mexicano a través de ICB. La herramienta de cotización de ANA Seguros, con ICB como su agente: indique su viaje, su vehículo y la cobertura que desea, y ANA la cotiza.")) + '">' +
          '<div class="shell shell--narrow">' +
            R.crumbs([
              { label: ICB.s("home"), href: "#/" },
              { label: { en: "Insurance", es: "Seguros" }, href: "#/insurance" },
              { label: "Mexican Insurance", href: "#/insurance/mexican" },
              { label: T("Quote", "Cotización") }
            ]) +
            '<div class="page-hero-inner">' +
              '<span class="eyebrow">Mexican Insurance</span>' +
              '<h1 id="ana-title">' + T("Get a quote for driving into Mexico.", "Cotice su viaje en auto a México.") + "</h1>" +
              '<p class="hero-lead">' + T(
                "ICB arranges this cover as an agent for ANA Seguros, and ANA's own quote tool is below. It is the same tool ICB has always used, with ICB named on it as your agent.",
                "ICB gestiona esta cobertura como agente de ANA Seguros, y abajo está la herramienta de cotización de ANA. Es la misma herramienta que ICB siempre ha usado, con ICB registrado en ella como su agente.") + "</p>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="ana-what">' +
          '<div class="shell shell--narrow">' +
            '<h2 id="ana-what">' + T("What you will be asked.", "Lo que le van a preguntar.") + "</h2>" +
            '<ul class="guide-list">' + steps.map(function (s) {
              return "<li>" + esc(ICB.t(s)) + "</li>";
            }).join("") + "</ul>" +
            '<p>' + T(
              "ANA suggests using the Kelley Blue Book or the NADA Guide to work out what your vehicle is worth. The tool is in English and Spanish, side by side.",
              "ANA sugiere usar el Kelley Blue Book o la NADA Guide para determinar el valor de su vehículo. La herramienta está en inglés y español, uno junto al otro.") + "</p>" +

            '<div class="ana-open">' +
              '<p class="ana-open-note">' + T(
                "The quote tool is run by ANA Seguros, so opening it connects you to their system. Nothing else on this site does that, which is why it waits for you to ask.",
                "La herramienta de cotización la opera ANA Seguros, así que abrirla lo conecta con su sistema. Nada más en este sitio hace eso, por eso espera a que usted lo pida.") + "</p>" +
              '<p class="btn-row">' +
                '<button type="button" class="btn btn-primary" data-ana-open aria-expanded="false" aria-controls="ana-box">' +
                  esc(T("Open the quote tool", "Abrir la herramienta de cotización")) +
                "</button>" +
              "</p>" +
            "</div>" +

            '<div class="ana-box" id="ana-box" data-ana-box></div>' +

            '<div class="ana-small" id="cover">' +
              "<h2>" + T("What the cover includes.", "Qué incluye la cobertura.") + "</h2>" +
              "<p>" + T(
                "ANA's tool offers four liability covers, and you choose a limit for each one before it prices the policy. The ranges below are the choices ANA was offering when this page was built; the tool itself always shows the current ones.",
                "La herramienta de ANA ofrece cuatro coberturas de responsabilidad, y usted elige un límite para cada una antes de que se calcule la póliza. Los rangos a continuación son las opciones que ofrecía ANA cuando se construyó esta página; la herramienta siempre muestra las vigentes.") + "</p>" +
              '<div class="guide-table-wrap"><table class="guide-table"><tbody>' +
                [
                  ["Liability for Property Damage USD",
                   { en: "50,000 to 100,000", es: "50,000 a 100,000" }],
                  ["Bodily Injury Liability USD",
                   { en: "15,000 / 30,000 up to 100,000 / 200,000", es: "15,000 / 30,000 hasta 100,000 / 200,000" }],
                  ["Medical Expenses to Occupants USD",
                   { en: "2,000 / 10,000 up to 5,000 / 25,000", es: "2,000 / 10,000 hasta 5,000 / 25,000" }],
                  ["Catastrophic Liability USD",
                   { en: "None, or 150,000 to 300,000", es: "Ninguna, o 150,000 a 300,000" }]
                ].map(function (r) {
                  return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(ICB.t(r[1])) + "</td></tr>";
                }).join("") +
              "</tbody></table></div>" +
              "<p>" + T(
                "ANA's own claims information and their answers to common questions are on their site, linked from the Mexican Insurance page.",
                "La información de reclamos de ANA y sus respuestas a preguntas comunes están en su sitio, enlazadas desde la página de Mexican Insurance.") + "</p>" +
            "</div>" +

            '<div class="ana-small">' +
              "<h2>" + T("Who quotes, and who insures.", "Quién cotiza, y quién asegura.") + "</h2>" +
              "<p>" + T(
                "The price, the cover and the policy are ANA Seguros'. ICB arranges the cover as their agent and is who you deal with in Belize. ICB does not set these rates and the figures you see come back from ANA as you fill the form in.",
                "El precio, la cobertura y la póliza son de ANA Seguros. ICB gestiona la cobertura como su agente y es con quien usted trata en Belice. ICB no fija estas tarifas y las cifras que vea provienen de ANA a medida que llena el formulario.") + "</p>" +
              "<p>" + T(
                "If you would rather do this with a person, any ICB branch can arrange it, and the branch at the Mexican border at Corozal does it every day.",
                "Si prefiere hacerlo con una persona, cualquier sucursal de ICB puede gestionarlo, y la sucursal en la frontera con México en Corozal lo hace a diario.") + "</p>" +
              '<p class="btn-row">' +
                '<a class="btn btn-outline btn-sm" href="#/insurance/mexican">' +
                  esc(T("About this cover", "Sobre esta cobertura")) + "</a>" +
                '<a class="btn btn-outline btn-sm" href="#/locations">' +
                  esc(T("Find a branch", "Encuentre una sucursal")) + "</a>" +
              "</p>" +
            "</div>" +
          "</div>" +
        "</section>";
    },
    mounted: function (root) { wire(root || document); }
  };
})();
