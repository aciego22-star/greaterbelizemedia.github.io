/* ============================================================================
   Short-Term Insurance, at /insurance/motor/visitors.

   WHAT THIS IS. ICB sells short-term third-party motor cover to drivers
   bringing a foreign-registered vehicle into Belize. They sell it two
   ways: online, through their own system at kiosk.icbinsurance.com, and
   in person at the kiosk ICB operates at the Benque Viejo border
   crossing with Guatemala. Until 8 Nov 2026 this site carried it only as
   a What's New article, which is a poor home for a product someone is
   trying to buy at a border post on a phone. ICB asked for it to be put
   at the front of the site, so it is now a page of its own, linked from
   the footer, from Motor Insurance and from the home carousel.

   WHERE THE CONTENT CAME FROM. Every figure, period, vehicle type and
   step below was read off ICB's own two sites on 8 Nov 2026:

     www.icbcovernote.com              what the cover is and what it pays
     www.icbcovernote.com/copy-of-home the six steps and Schedule 1
     kiosk.icbinsurance.com            the system that sells it

   The three BZD limits are reproduced exactly as ICB publishes them,
   with the same "up to" they use. The branch details, the opening hours
   and the border location are from ICB.DATA.locations, not from those
   sites, which never mention Benque Viejo at all.

   NO PRICE IS STATED ANYWHERE, because ICB publishes none. Not on either
   of their sites, not in the brochure, nowhere. A premium appears only
   once ICB's own system has been told the vehicle and the period, so
   this page says who sells it and what it covers, and sends people to
   ICB to be quoted. Nothing here quotes, binds or prices.

   THE PURCHASE IS NOT EMBEDDED, and should not be. ICB's kiosk system
   takes card details, and an iframe on another origin is the wrong place
   for somebody to type a card number: it hides whose site they are
   really on and whose certificate is protecting it. The ANA Seguros tool
   is embedded because it is a widget ANA publish for that purpose and
   ICB's old site already embedded it. This one is a hosted application
   with its own address, so the honest thing is a link that says plainly
   where it goes. See OPEN-QUESTIONS.md.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var T = ICB.T;

  /* ICB's own two addresses for this product. Held here rather than
     inline so there is one place to change them. */
  var BUY = "https://kiosk.icbinsurance.com";
  var GUIDE = "https://www.icbcovernote.com";
  var GUIDE_STEPS = "https://www.icbcovernote.com/copy-of-home";

  /* The branch that runs the border kiosk. Read from the location
     record so the number, the email and the hours can never drift from
     the rest of the site. */
  function borderBranch() {
    return (ICB.DATA.locationById && ICB.DATA.locationById("benque-viejo-border")) || null;
  }

  ICB.views.visitorMotor = {
    title: {
      en: "Short-Term Insurance for visiting drivers | Insurance Corporation of Belize",
      es: "Short-Term Insurance para conductores visitantes | Insurance Corporation of Belize"
    },
    render: function () {
      var R = ICB.render, esc = R.esc;
      var b = borderBranch();

      /* ---- ICB's published cover limits, exactly as they state them ---- */
      var limits = [
        { label: { en: "Injury or death of a third party", es: "Lesiones o muerte de un tercero" },
          value: { en: "Up to $50,000 BZD", es: "Hasta $50,000 BZD" } },
        { label: { en: "Maximum payout per incident", es: "Pago máximo por incidente" },
          value: { en: "Up to $200,000 BZD", es: "Hasta $200,000 BZD" } },
        { label: { en: "Damage to property", es: "Daños a la propiedad" },
          value: { en: "Up to $20,000 BZD", es: "Hasta $20,000 BZD" } }
      ];

      /* ICB offers five. Their names, in their order. */
      var periods = [
        { en: "1 Day", es: "1 Day" },
        { en: "3 Days", es: "3 Days" },
        { en: "1 Week", es: "1 Week" },
        { en: "2 Weeks", es: "2 Weeks" },
        { en: "1 Month", es: "1 Month" }
      ];

      var vehicles = [
        { en: "Private vehicle", es: "Vehículo particular" },
        { en: "Commercial vehicle", es: "Vehículo comercial" },
        { en: "Heavy duty vehicle", es: "Vehículo de carga pesada" },
        { en: "Passenger bus", es: "Autobús de pasajeros" }
      ];

      var ready = [
        { en: "Your passport", es: "Su pasaporte" },
        { en: "Your driver's licence", es: "Su licencia de conducir" },
        { en: "The vehicle registration", es: "El documento de matrícula del vehículo" },
        { en: "A credit card", es: "Una tarjeta de crédito" }
      ];

      /* ICB's six steps. Each one is their step, with the detail they
         publish under it. */
      var steps = [
        { h: { en: "Choose your language", es: "Elija el idioma" },
          p: { en: "ICB's system runs in English and Spanish.",
               es: "El sistema de ICB funciona en inglés y español." } },
        { h: { en: "Choose the type of vehicle", es: "Elija el tipo de vehículo" },
          p: { en: "Private, commercial, heavy duty or passenger bus.",
               es: "Particular, comercial, de carga pesada o autobús de pasajeros." } },
        { h: { en: "Pick how long you need", es: "Elija cuánto tiempo lo necesita" },
          p: { en: "The period that matches your stay in Belize, from one day to one month.",
               es: "El período que corresponda a su estancia en Belice, de un día a un mes." } },
        { h: { en: "Enter the driver's details", es: "Ingrese los datos del conductor" },
          p: { en: "Name, telephone and email; the licence number, issuing country and expiry; and the same three from the passport.",
               es: "Nombre, teléfono y correo electrónico; el número de la licencia, el país de emisión y su vencimiento; y los mismos tres datos del pasaporte." } },
        { h: { en: "Enter the vehicle's details", es: "Ingrese los datos del vehículo" },
          p: { en: "Make, model and year, the VIN and the licence plate number, and the owner's details.",
               es: "Marca, modelo y año, el VIN y el número de matrícula, y los datos del propietario." } },
        { h: { en: "Pay and submit", es: "Pague y envíe" },
          p: { en: "Enter the payment details and confirm. The policy and your Schedule 1 arrive by email.",
               es: "Ingrese los datos de pago y confirme. La póliza y su Schedule 1 llegan por correo electrónico." } }
      ];

      function extBtn(href, label, cls) {
        return '<a class="' + cls + '" href="' + esc(href) + '"' + R.extAttrs() + ">" +
          esc(label) + R.extNote(R.hostOf(href)) + "</a>";
      }

      return '' +
        /* A photographic hero rather than the plain dark band the
           other service page uses. ICB asked for this product to be at
           the front of the site, and the kiosk is what a visiting
           driver is looking for at the crossing: showing it is how
           they know they are in the right place. Same frame as the
           home carousel slide that brings them here. */
        '<section class="page-hero on-dark" aria-labelledby="stm-title"' +
          ' data-seo-description="' + esc(T(
            "Short-term third-party motor insurance from ICB for drivers bringing a vehicle into Belize. Cover from one day to one month, bought online or at ICB's kiosk at the Benque Viejo border crossing.",
            "Seguro de responsabilidad civil vehicular de corta duración de ICB para quienes entran a Belice con su vehículo. Cobertura de un día a un mes, en línea o en el quiosco de ICB en el paso fronterizo de Benque Viejo.")) + '">' +
          '<div class="page-hero-art art-panel" data-img-slot="visitor-motor-hero" aria-hidden="true">' +
            ICB.art.panel("hero") + "</div>" +
          '<div class="shell shell--narrow">' +
            /* Crumbs inside page-hero-inner, not beside it. The art
               panel is absolutely positioned across the whole hero,
               and page-hero-inner is the element that sits above it;
               a sibling of that element paints underneath the
               photograph and is simply not there. The sibling form is
               fine on the quote page next door only because that hero
               hides its art. */
            '<div class="page-hero-inner">' +
              R.crumbs([
                { label: ICB.s("home"), href: "#/" },
                { label: { en: "Insurance", es: "Seguros" }, href: "#/insurance" },
                { label: "Motor Insurance", href: "#/insurance/motor" },
                { label: "Short-Term Insurance" }
              ]) +
              '<span class="eyebrow">Short-Term Insurance</span>' +
              '<h1 id="stm-title">' + T("Driving into Belize? Get insured at the border.",
                                        "¿Entra a Belice conduciendo? Asegúrese en la frontera.") + "</h1>" +
              '<p class="hero-lead">' + T(
                "Belize law requires third-party cover on any vehicle using a public road. ICB sells it to visiting drivers by the day, the week or the month, online or in person at the kiosk at the Benque Viejo border crossing.",
                "La ley de Belice exige cobertura ante terceros para todo vehículo que circule por vías públicas. ICB la vende a conductores visitantes por día, por semana o por mes, en línea o en persona en el quiosco del paso fronterizo de Benque Viejo.") + "</p>" +
              '<p class="btn-row">' +
                extBtn(BUY, T("Buy cover online", "Comprar cobertura en línea"), "btn btn-gold") +
                '<a class="btn btn-light" href="#stm-how">' +
                  esc(T("How it works", "Cómo funciona")) + "</a>" +
              "</p>" +
            "</div>" +
          "</div>" +
        "</section>" +

        '<section class="section section--flush-top" aria-labelledby="stm-what">' +
          '<div class="shell shell--narrow">' +

            '<h2 id="stm-what">' + T("What this cover is.", "Qué es esta cobertura.") + "</h2>" +
            "<p>" + T(
              "It is basic third-party motor insurance, written for a short visit. Third-party cover can respond to certain claims for injury or damage suffered by other people, subject to the policy terms. It does not cover damage to your own vehicle.",
              "Es un seguro básico de responsabilidad civil vehicular ante terceros, pensado para una estancia corta. Esta cobertura puede responder a determinadas reclamaciones por lesiones o daños sufridos por otras personas, según las condiciones de la póliza. No cubre los daños a su propio vehículo.") + "</p>" +
            "<p>" + T(
              "ICB states that under Belize's Motor Vehicle Third Party Risk Act, every vehicle using the public road must carry at least this much cover. If you have driven in with a foreign-registered vehicle, that applies to you from the moment you leave the crossing.",
              "ICB indica que, conforme a la Motor Vehicle Third Party Risk Act de Belice, todo vehículo que circule por la vía pública debe contar al menos con esta cobertura. Si ha entrado con un vehículo matriculado en el extranjero, eso le aplica desde que sale del paso fronterizo.") + "</p>" +

            '<h2>' + T("What it covers.", "Qué cubre.") + "</h2>" +
            "<p>" + T(
              "These are the protection levels ICB publishes for this cover. A limit is the most a policy may respond with, not an amount paid on every claim.",
              "Estos son los niveles de protección que ICB publica para esta cobertura. Un límite es lo máximo que puede responder una póliza, no un monto que se pague en cada reclamo.") + "</p>" +
            '<div class="guide-table-wrap"><table class="guide-table"><tbody>' +
              limits.map(function (l) {
                return '<tr><th scope="row">' + esc(l.label) + "</th><td>" + esc(l.value) + "</td></tr>";
              }).join("") +
            "</tbody></table></div>" +
            '<p class="note-line">' + T(
              "ICB publishes no price for this cover. What it costs depends on the vehicle and the period, and ICB's own system works it out once you have chosen both.",
              "ICB no publica un precio para esta cobertura. Lo que cuesta depende del vehículo y del período, y el sistema de ICB lo calcula una vez que usted elige ambos.") + "</p>" +

            '<div class="stm-pair">' +
              "<div>" +
                "<h2>" + T("How long you can cover.", "Por cuánto tiempo puede asegurarse.") + "</h2>" +
                '<ul class="chip-list">' + periods.map(function (p) {
                  return '<li class="chip">' + esc(p) + "</li>";
                }).join("") + "</ul>" +
              "</div>" +
              "<div>" +
                "<h2>" + T("What you can cover.", "Qué puede asegurar.") + "</h2>" +
                '<ul class="guide-list">' + vehicles.map(function (v) {
                  return "<li>" + esc(v) + "</li>";
                }).join("") + "</ul>" +
              "</div>" +
            "</div>" +

            '<h2 id="stm-how">' + T("Buying it online.", "Comprarla en línea.") + "</h2>" +
            "<p>" + T(
              "ICB sells this through a system of their own. Have these four things with you before you start:",
              "ICB la vende a través de un sistema propio. Tenga estas cuatro cosas a mano antes de empezar:") + "</p>" +
            '<ul class="guide-list">' + ready.map(function (r) {
              return "<li>" + esc(r) + "</li>";
            }).join("") + "</ul>" +

            '<ol class="stm-steps">' + steps.map(function (s, i) {
              return "<li>" +
                '<span class="stm-step-n" aria-hidden="true">' + ("0" + (i + 1)) + "</span>" +
                "<h3>" + esc(s.h) + "</h3>" +
                "<p>" + esc(s.p) + "</p>" +
              "</li>";
            }).join("") + "</ol>" +

            '<div class="stm-cta">' +
              "<p>" + T(
                "Buying and paying happen on ICB's own system, at a web address of theirs rather than on this page. Check that the address in your browser is ICB's before you enter a card.",
                "La compra y el pago ocurren en el sistema propio de ICB, en una dirección web suya y no en esta página. Compruebe que la dirección en su navegador sea la de ICB antes de ingresar una tarjeta.") + "</p>" +
              '<p class="btn-row">' +
                extBtn(BUY, T("Buy cover online", "Comprar cobertura en línea"), "btn btn-primary") +
                extBtn(GUIDE_STEPS, T("ICB's step-by-step guide", "Guía paso a paso de ICB"), "btn btn-outline") +
              "</p>" +
            "</div>" +

            /* The step people miss, and the one that gets a driver
               stopped at a checkpoint while insured. It gets its own
               block for that reason. */
            '<div class="stm-alert" role="note">' +
              "<h2>" + T("Print Schedule 1 and put it on the windscreen.",
                         "Imprima el Schedule 1 y colóquelo en el parabrisas.") + "</h2>" +
              "<p>" + T(
                "ICB states that under the Motor Vehicle Insurance (Third Party Risks) Act, Chapter 231, Revised Edition 2020, you are required to print the Schedule 1 that arrives by email and display it on the windscreen of the insured vehicle in order to comply with the law.",
                "ICB indica que, conforme a la Motor Vehicle Insurance (Third Party Risks) Act, capítulo 231, edición revisada de 2020, usted debe imprimir el Schedule 1 que recibe por correo electrónico y exhibirlo en el parabrisas del vehículo asegurado para cumplir con la ley.") + "</p>" +
              "<p>" + T(
                "Being insured is not enough on its own. The document has to be showing.",
                "No basta con estar asegurado. El documento tiene que estar a la vista.") + "</p>" +
            "</div>" +

            '<h2>' + T("Or buy it at the border.", "O cómprela en la frontera.") + "</h2>" +
            "<p>" + T(
              "ICB operates a kiosk at the Belize and Guatemala border crossing at Benque Viejo del Carmen, in the Cayo District. Visiting drivers can arrange cover there at the crossing, before driving on.",
              "ICB opera un quiosco en el paso fronterizo entre Belice y Guatemala en Benque Viejo del Carmen, distrito de Cayo. Los conductores visitantes pueden gestionar allí su cobertura antes de continuar el viaje.") + "</p>" +
            (b
              ? '<div class="stm-branch">' +
                  "<h3>" + esc(b.name) + "</h3>" +
                  "<p>" + esc(b.address) + "</p>" +
                  (b.hours && b.hours.lines
                    ? '<p class="stm-hours">' + b.hours.lines.map(function (l) { return esc(l); }).join("<br>") + "</p>"
                    : "") +
                  '<p class="btn-row">' +
                    (b.phones && b.phones[0]
                      ? '<a class="btn btn-outline btn-sm" href="tel:' + esc(b.phones[0].tel) + '">' +
                          esc(ICB.s("callN", { n: b.phones[0].display })) + "</a>"
                      : "") +
                    (b.whatsapps && b.whatsapps[0]
                      ? '<a class="btn btn-outline btn-sm" href="' + esc(R.waHref(b.whatsapps[0].wa)) + '"' + R.extAttrs() + ">" +
                          "WhatsApp " + esc(b.whatsapps[0].display) + R.extNote("wa.me") + "</a>"
                      : "") +
                    '<a class="btn btn-outline btn-sm" href="#/locations">' +
                      esc(T("All ICB branches", "Todas las sucursales de ICB")) + "</a>" +
                  "</p>" +
                "</div>"
              : "") +

            '<h2>' + T("If you need to claim.", "Si necesita presentar un reclamo.") + "</h2>" +
            "<p>" + T(
              "ICB publishes a separate set of contacts for claims on this cover. Use these rather than the general claims line.",
              "ICB publica un conjunto aparte de contactos para los reclamos de esta cobertura. Use estos en lugar de la línea general de reclamos.") + "</p>" +
            '<ul class="guide-list">' +
              '<li><a href="mailto:icb_claims1@icbinsurance.com">icb_claims1@icbinsurance.com</a></li>' +
              '<li><a href="tel:+5012245328">+501 224-5328/9</a></li>' +
              '<li><a href="' + esc(R.waHref("5016130579")) + '"' + R.extAttrs() + ">WhatsApp +501 613-0579" +
                R.extNote("wa.me") + "</a></li>" +
            "</ul>" +

            '<div class="stm-cta stm-cta--quiet">' +
              "<p>" + T(
                "Living in Belize and insuring a vehicle for the year? That is ordinary Motor Insurance, and it is a different page.",
                "¿Vive en Belice y quiere asegurar un vehículo por el año? Eso es Motor Insurance, y es otra página.") + "</p>" +
              '<p class="btn-row">' +
                '<a class="btn btn-outline btn-sm" href="#/insurance/motor">' +
                  esc(T("Motor Insurance", "Motor Insurance")) + "</a>" +
                extBtn(GUIDE, T("ICB's Short-Term Insurance site", "Sitio de Short-Term Insurance de ICB"),
                       "btn btn-outline btn-sm") +
              "</p>" +
            "</div>" +

          "</div>" +
        "</section>";
    }
  };
})();
