/* ============================================================================
   ICB.DATA.news — What's New at ICB.

   SOURCE: the three entries ICB supplied through the client on 7 Nov
   2026, each as a bilingual copy pack with its own heroes, card excerpt,
   SEO title and description, photo caption and alt text. Every sentence
   below is ICB's approved copy or a direct translation of it from the
   same pack. Nothing here is written for the site.

   WHAT AN ENTRY CARRIES
     id        the slug, used for /news/<id> in both languages. Spanish
               keeps the English slug, the same rule the product pages
               follow. The packs suggest Spanish slugs too; adopting them
               would mean two addresses per article and a second set of
               canonicals, and that is a decision for ICB rather than a
               default. Recorded in OPEN-QUESTIONS.md.
     published the date the article goes up on this site. It is NOT the
               date of the thing it describes.
     dated     the date of the thing itself, with its own label, shown
               separately from published because a conference in February
               written up in November is two different dates and a reader
               should be able to tell which is which. An entry with
               nothing to date leaves it out.
     body      blocks in order. "h" is a subheading, "p" a paragraph,
               "actions" a row of links. Plain text throughout; the views
               escape all of it.
     sources   where each claim comes from, printed at the foot of the
               article. An insurance company's news page that states
               figures and legal requirements should show its working.

   DRAFT, AND IT MATTERS
   benque-viejo-border-kiosk is marked draft: true. ICB has not confirmed
   what is sold at the kiosk, its hours, the documents it asks for or
   whether the Border Branch numbers are the right contacts for it. It is
   published here so Mr Sal can read it in place on a site that is still
   noindexed and still under review. It must not go to launch unanswered:
   DEPLOY.md's launch checklist carries the line, and the questions are
   in OPEN-QUESTIONS.md.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.news = {

  /* Shown wherever the section names itself. */
  section: { en: "What's New at ICB", es: "Novedades de ICB" },

  entries: [
    {
      id: "icb-claimsvault-belize",
      published: "2026-11-07",
      dated: {
        label: { en: "Launched", es: "Lanzamiento" },
        text: { en: "July 3, 2026", es: "3 de julio de 2026" },
        iso: "2026-07-03"
      },
      category: { en: "Corporate News", es: "Noticias corporativas" },
      title: {
        en: "ICB joins the ClaimsVAULT Belize initiative",
        es: "ICB se suma a la iniciativa ClaimsVAULT Belize"
      },
      seoTitle: {
        en: "ICB and ClaimsVAULT Belize, shared motor claims",
        es: "ICB y ClaimsVAULT Belize, reclamaciones de vehículos"
      },
      seoDescription: {
        en: "Learn how ICB is taking part in ClaimsVAULT Belize, ORINCO's shared system for reviewing motor insurance claims history and identifying potential fraud.",
        es: "Conozca la participación de ICB en ClaimsVAULT Belize, el sistema compartido de ORINCO para revisar reclamaciones de vehículos y detectar posibles fraudes."
      },
      excerpt: {
        en: "ICB is among the insurers taking part in ClaimsVAULT Belize, a shared system that helps authorized staff review motor claims history and identify patterns that need a closer look.",
        es: "ICB es una de las aseguradoras que participan en ClaimsVAULT Belize, un sistema compartido que permite al personal autorizado consultar el historial de reclamaciones de vehículos."
      },
      hero: {
        wide: "assets/img/news/claimsvault-wide.webp",
        wideW: 1600, wideH: 800,
        tall: "assets/img/news/claimsvault-tall.webp",
        tallW: 900, tallH: 450,
        alt: {
          en: "ClaimsVAULT Belize partner logos for Atlantic Insurance, Guardian Group, ICB, Blue Creek Insurance, Home Protector and RF&G Insurance.",
          es: "Logotipos de las aseguradoras colaboradoras de ClaimsVAULT Belize: Atlantic Insurance, Guardian Group, ICB, Blue Creek Insurance, Home Protector y RF&G Insurance."
        },
        caption: {
          en: "Six insurers shown in the ClaimsVAULT Belize partner artwork. Artwork published by RF&G Insurance.",
          es: "Seis aseguradoras que figuran en la imagen de colaboradores de ClaimsVAULT Belize. Material publicado por RF&G Insurance."
        }
      },
      body: [
        { type: "p", text: {
          en: "On July 3, 2026, Belize's insurance industry launched ClaimsVAULT Belize, the country's first shared system for motor insurance claims information. The Organization of Insurance Companies of Belize (ORINCO) developed the initiative with Jamaica's EPIC Technologies. Insurance Corporation of Belize (ICB) is one of the six insurers shown in the launch artwork.",
          es: "El 3 de julio de 2026, el sector asegurador de Belice lanzó ClaimsVAULT Belize, el primer sistema compartido del país para consultar información sobre reclamaciones de seguros de vehículos. La Organización de Compañías de Seguros de Belice (ORINCO) desarrolló la iniciativa con EPIC Technologies, de Jamaica. Insurance Corporation of Belize (ICB) es una de las seis aseguradoras que figuran en el material gráfico del lanzamiento."
        } },
        { type: "h", text: {
          en: "How shared claims history helps",
          es: "Cómo ayuda el historial compartido de reclamaciones"
        } },
        { type: "p", text: {
          en: "When a participating insurer receives a motor insurance application or claim, authorized staff can check whether a vehicle or claimant appears in previous claims and examine unusual patterns that warrant a closer look. Having relevant records in one place gives staff better information when assessing an application or investigating a claim. Access to the system is limited to authorized staff at participating insurers for insurance purposes.",
          es: "Cuando una aseguradora participante recibe una solicitud de seguro de vehículos o una reclamación, su personal autorizado puede comprobar si un vehículo o un reclamante figura en reclamaciones anteriores y examinar patrones inusuales que requieran una revisión más detallada. Tener los registros pertinentes en un solo lugar ayuda al personal a evaluar solicitudes e investigar reclamaciones. El acceso se limita al personal autorizado de las aseguradoras participantes para fines relacionados con el seguro."
        } },
        { type: "p", text: {
          en: "At the launch, Belize's Supervisor of Insurance reported $5.3 million in motor vehicle claims paid in the first quarter of 2026 and $5.5 million in outstanding motor claims brought forward. The figures show the scale of motor claims activity in Belize.",
          es: "En el lanzamiento, la supervisora de seguros de Belice informó que las aseguradoras pagaron 5,3 millones de dólares en reclamaciones de vehículos durante el primer trimestre de 2026 y registraron 5,5 millones de dólares en reclamaciones pendientes de períodos anteriores. Estas cifras reflejan la magnitud de la actividad de reclamaciones de vehículos en Belice."
        } },
        { type: "h", text: {
          en: "What it means for ICB policyholders",
          es: "Qué significa para los asegurados de ICB"
        } },
        { type: "p", text: {
          en: "The aim is to help insurers identify possible fraud earlier and assess legitimate claims with better information. At the industry level, ORINCO can also use the combined data to track collision and vehicle theft trends. ICB's participation supports a coordinated approach to fraud prevention and fairer claims reviews across Belize.",
          es: "La iniciativa busca ayudar a las aseguradoras a detectar posibles fraudes más pronto y a evaluar las reclamaciones legítimas con mejor información. A nivel del sector, ORINCO también puede utilizar los datos combinados para identificar tendencias de colisiones y robos de vehículos. Con su participación, ICB apoya la prevención coordinada del fraude y una evaluación más justa de las reclamaciones en Belice."
        } },
        { type: "p", text: {
          en: "For help with a motor insurance claim, contact your ICB branch or agency.",
          es: "Si necesita ayuda con una reclamación de seguro de vehículos, comuníquese con su sucursal o agencia de ICB."
        } },
        { type: "actions", items: [
          { label: { en: "How claims work", es: "Cómo funcionan los reclamos" }, href: "#/claims" },
          { label: { en: "Find your branch", es: "Buscar su sucursal" }, href: "#/locations" }
        ] }
      ],
      sources: [
        { label: { en: "RF&G Insurance on ClaimsVAULT Belize", es: "RF&G Insurance sobre ClaimsVAULT Belize" },
          note: { en: "ORINCO-supplied information on authorized access, uses of claims history and reporting across the industry.",
                  es: "Información de ORINCO sobre el acceso autorizado, los usos del historial de reclamaciones y los informes del sector." },
          href: "https://rfginsurancebelize.com/belize-claims-vault/" },
        { label: { en: "News 5 Belize on the ORINCO launch", es: "News 5 Belize sobre el lanzamiento de ORINCO" },
          note: { en: "Launch date, the EPIC Technologies partnership, and the motor claims figures reported by the Supervisor of Insurance.",
                  es: "Fecha de lanzamiento, la colaboración con EPIC Technologies y las cifras de reclamaciones informadas por la supervisora de seguros." },
          href: "https://www.greaterbelize.com/orinco-launches-claimsvault-to-tackle-insurance-fraud-in-belize/" },
        { label: { en: "Love FM on the Claims Vault launch", es: "Love FM sobre el lanzamiento de Claims Vault" },
          note: { en: "Launch coverage and ORINCO's stated goals for the platform.",
                  es: "Cobertura del lanzamiento y los objetivos declarados por ORINCO." },
          href: "https://lovefm.com/belize-insurers-launch-claims-vault-to-combat-fraud/" }
      ]
    },

    {
      id: "icb-aml-cft-conference-2026",
      published: "2026-11-07",
      dated: {
        label: { en: "Event", es: "Evento" },
        text: { en: "February 23 to 25, 2026", es: "Del 23 al 25 de febrero de 2026" },
        iso: "2026-02-23"
      },
      category: { en: "Corporate News", es: "Noticias corporativas" },
      title: {
        en: "ICB at Belize's 3rd Annual AML/CFT Conference",
        es: "ICB en la 3.ª Conferencia Anual de AML/CFT de Belice"
      },
      seoTitle: {
        en: "ICB at Belize's 3rd Annual AML/CFT Conference 2026",
        es: "ICB en la 3.ª Conferencia Anual de AML/CFT de Belice"
      },
      seoDescription: {
        en: "ICB's AML team attended Belize's 3rd Annual AML/CFT Conference in February 2026, reflecting its commitment to compliance and responsible risk management.",
        es: "El equipo de ICB participó en la Conferencia Anual de AML/CFT de Belice en febrero de 2026, reafirmando su compromiso con el cumplimiento."
      },
      excerpt: {
        en: "ICB's anti-money laundering team joined Belize's 3rd Annual AML/CFT Conference to stay informed about evolving compliance practices and financial crime risks.",
        es: "El equipo de prevención del lavado de activos de ICB participó en la 3.ª Conferencia Anual de AML/CFT de Belice, dedicada al cumplimiento y la prevención de delitos financieros."
      },
      hero: {
        wide: "assets/img/news/aml-cft-conference-wide.webp",
        wideW: 1600, wideH: 900,
        tall: "assets/img/news/aml-cft-conference-tall.webp",
        tallW: 900, tallH: 1125,
        alt: {
          en: "ICB representatives stand beside the 3rd Annual AML/CFT Conference banner.",
          es: "Representantes de ICB posan junto al cartel de la 3.ª Conferencia Anual de AML/CFT."
        },
        caption: {
          en: "ICB's AML team at the 3rd Annual AML/CFT Conference at the Belize Civic Center. Photo courtesy of ICB.",
          es: "El equipo de ICB en la 3.ª Conferencia Anual de AML/CFT en el Belize Civic Center. Foto cortesía de ICB."
        }
      },
      venue: {
        label: { en: "Venue", es: "Lugar" },
        text: { en: "Belize Civic Center, Belize City", es: "Belize Civic Center, Ciudad de Belice" }
      },
      body: [
        { type: "p", text: {
          en: "The Insurance Corporation of Belize (ICB) took part in Belize's 3rd Annual AML/CFT Conference, held February 23 to 25, 2026, at the Belize Civic Center in Belize City. Our anti-money laundering team represented ICB at the three-day event, which focused on strengthening efforts to prevent financial crime and improve compliance practices.",
          es: "Insurance Corporation of Belize (ICB) participó en la 3.ª Conferencia Anual de AML/CFT de Belice, celebrada del 23 al 25 de febrero de 2026 en el Belize Civic Center, en la Ciudad de Belice. Nuestro equipo de prevención del lavado de activos representó a ICB en el encuentro de tres días, centrado en reforzar la prevención de delitos financieros y mejorar las prácticas de cumplimiento."
        } },
        { type: "p", text: {
          en: "The Financial Intelligence Unit, the National Anti-Money Laundering Committee, the University of Belize and the U.S. Embassy hosted the conference. Finance Belize's recap highlighted panel discussions on changing compliance requirements and opportunities for professionals to exchange ideas across Belize's financial services sector.",
          es: "La conferencia fue organizada por la Unidad de Inteligencia Financiera, el Comité Nacional contra el Lavado de Activos, la Universidad de Belice y la Embajada de Estados Unidos. En su reseña, Finance Belize destacó los paneles sobre cambios en los requisitos de cumplimiento y las oportunidades para que los profesionales del sector de servicios financieros intercambiaran ideas."
        } },
        { type: "h", text: {
          en: "What this means for our clients",
          es: "Qué significa para nuestros clientes"
        } },
        { type: "p", text: {
          en: "AML/CFT stands for anti-money laundering and countering the financing of terrorism. For an insurer, managing these risks goes hand in hand with clear communication about the information clients may be asked to provide and why.",
          es: "AML/CFT son las siglas en inglés de la prevención del lavado de activos y la lucha contra la financiación del terrorismo. En el sector asegurador, gestionar estos riesgos también implica explicar con claridad qué información se puede solicitar a los clientes y por qué."
        } },
        { type: "p", text: {
          en: "Taking part in the conference reflects ICB's commitment to strong compliance and effective risk management. As financial crime risks evolve, we aim to stay informed and make our processes clear and straightforward for the people and businesses we serve.",
          es: "Nuestra participación refleja el compromiso de ICB con el cumplimiento y la gestión responsable de riesgos. A medida que evolucionan los riesgos de delitos financieros, procuramos mantenernos informados y ofrecer procesos claros y sencillos a las personas y empresas que atendemos."
        } },
        { type: "actions", items: [
          { label: { en: "Read the Finance Belize conference recap", es: "Leer la reseña de la conferencia (en inglés)" },
            href: "https://financebelize.bz/3rd-annual-aml-cft-conference-2026/" }
        ] }
      ],
      sources: [
        { label: { en: "Finance Belize conference recap", es: "Reseña de la conferencia en Finance Belize" },
          note: { en: "The hosts, the three-day programme and the sector discussions.",
                  es: "Los organizadores, el programa de tres días y los paneles del sector." },
          href: "https://financebelize.bz/3rd-annual-aml-cft-conference-2026/" },
        { label: { en: "ICB's own update of February 26, 2026", es: "Publicación de ICB del 26 de febrero de 2026" },
          note: { en: "The team's participation and ICB's message on compliance, risk governance and keeping processes straightforward for clients.",
                  es: "La participación del equipo y el mensaje de ICB sobre cumplimiento, gobernanza de riesgos y procesos claros para los clientes." } },
        { label: { en: "ICB's event photograph", es: "Fotografía del evento, de ICB" },
          note: { en: "The event dates, the venue and the photo credit.",
                  es: "Las fechas del evento, el lugar y el crédito de la fotografía." } }
      ]
    },

    {
      /* Draft. See the note at the head of this file, and the questions
         in OPEN-QUESTIONS.md. It renders like any other entry so that
         Mr Sal can read it in place; the flag is what the launch
         checklist in DEPLOY.md looks for.

         Narrowed on 7 Nov 2026 by reading ICB's own sites. The
         icbcovernote.com link is safe: that site titles itself "ICB
         Kiosk Landing", is signed "Insurance Corporation of Belize"
         and carries ICB's own telephone, email and website. It also
         publishes the coverage periods, which are now in the article
         below, and the documents a driver needs, which the article
         already had right. What is still unconfirmed is the physical
         kiosk rather than the product: its hours, what payment it
         takes, and whether the Border Branch numbers are the right
         contacts for it. */
      id: "benque-viejo-border-kiosk",
      draft: true,
      published: "2026-11-07",
      category: { en: "Customer Services", es: "Servicios al cliente" },
      title: {
        en: "Motor insurance at ICB's Benque Viejo border kiosk",
        es: "Seguro de vehículos en el quiosco de ICB en la frontera de Benque Viejo"
      },
      seoTitle: {
        en: "ICB Benque Viejo border kiosk, motor insurance in Belize",
        es: "Quiosco de ICB en Benque Viejo, seguro vehicular"
      },
      seoDescription: {
        en: "Driving into Belize from Guatemala? Learn about ICB's Benque Viejo border kiosk and what to have ready for short-term motor insurance.",
        es: "¿Entra a Belice desde Guatemala en vehículo? Conozca el quiosco de ICB en Benque Viejo y qué datos preparar para contratar un seguro de corta duración."
      },
      excerpt: {
        en: "Entering Belize from Guatemala by car? Visiting drivers can arrange motor insurance at ICB's Benque Viejo border kiosk before continuing their trip.",
        es: "¿Viaja a Belice desde Guatemala en vehículo? Puede gestionar su seguro en el quiosco fronterizo de ICB en Benque Viejo antes de continuar su viaje."
      },
      hero: {
        wide: "assets/img/news/benque-kiosk-wide.webp",
        wideW: 1600, wideH: 900,
        tall: "assets/img/news/benque-kiosk-tall.webp",
        tallW: 900, tallH: 1125,
        alt: {
          en: "Yellow and blue Insurance Corporation of Belize kiosk at the Benque Viejo border.",
          es: "Quiosco amarillo y azul de Insurance Corporation of Belize en la frontera de Benque Viejo."
        },
        caption: {
          en: "ICB's motor insurance kiosk at the Benque Viejo border crossing.",
          es: "Quiosco de seguros de vehículos de ICB en el paso fronterizo de Benque Viejo."
        }
      },
      venue: {
        label: { en: "Where", es: "Dónde" },
        text: { en: "Benque Viejo del Carmen, Cayo District, at the Belize and Guatemala border",
                es: "Benque Viejo del Carmen, distrito de Cayo, en la frontera entre Belice y Guatemala" }
      },
      body: [
        { type: "p", text: {
          en: "Driving into Belize from Guatemala with a foreign-registered vehicle? At the Benque Viejo border, the Insurance Corporation of Belize (ICB) operates a kiosk where visiting drivers can purchase motor vehicle insurance for their time in Belize. It gives you a place to arrange cover at the crossing before continuing into the Cayo District and beyond.",
          es: "¿Va a entrar a Belice desde Guatemala con un vehículo matriculado en el extranjero? En la frontera de Benque Viejo, Insurance Corporation of Belize (ICB) cuenta con un quiosco donde los conductores visitantes pueden contratar un seguro de vehículos para su estancia en Belice. Allí puede gestionar la cobertura antes de continuar su viaje hacia el distrito de Cayo y otras partes del país."
        } },
        { type: "h", text: {
          en: "Why arrange cover before driving onward?",
          es: "Por qué gestionar la cobertura antes de continuar el viaje"
        } },
        { type: "p", text: {
          en: "Belize law generally requires motor vehicles used on public roads to have third-party insurance that meets local requirements. Third-party cover can respond to certain claims for injury or property damage suffered by other people, subject to the policy terms. ICB offers short-term third-party motor insurance for visitors bringing a vehicle into Belize.",
          es: "La legislación de Belice exige, por regla general, que los vehículos que circulen por vías públicas cuenten con un seguro de responsabilidad civil frente a terceros que cumpla los requisitos locales. Esta cobertura puede responder a determinadas reclamaciones por lesiones o daños a bienes de otras personas, según las condiciones de la póliza. ICB ofrece seguro de responsabilidad civil vehicular de corta duración para quienes visitan Belice con su vehículo."
        } },
        { type: "h", text: {
          en: "What to have ready",
          es: "Qué debe tener a mano"
        } },
        { type: "p", text: {
          en: "Keep your vehicle registration, passport and valid driver's licence handy. ICB's published short-term insurance process asks for vehicle, passport and driver's licence details. Know how long you plan to drive in Belize so you can check which coverage period fits your visit.",
          es: "Tenga a mano el documento de matrícula de su vehículo, su pasaporte y su licencia de conducir vigente. El proceso publicado por ICB para el seguro de corta duración solicita datos del vehículo, del pasaporte y de la licencia. Tenga presente cuánto tiempo planea conducir en Belice para poder elegir el período de cobertura adecuado."
        } },
        /* The five periods ICB publishes on its own short-term motor
           insurance site. Verbatim from that page, 7 Nov 2026. */
        { type: "p", text: {
          en: "ICB publishes five coverage periods for this cover: one day, three days, one week, two weeks, or one month.",
          es: "ICB publica cinco períodos de cobertura para este seguro: un día, tres días, una semana, dos semanas o un mes."
        } },
        { type: "p", text: {
          en: "Before you drive onward, check the vehicle details on your insurance documents, confirm when cover begins and ends, and keep your proof of insurance accessible during your trip.",
          es: "Antes de continuar su viaje, compruebe los datos del vehículo en los documentos del seguro, confirme cuándo empieza y termina la cobertura y mantenga el comprobante del seguro a mano."
        } },
        { type: "h", text: {
          en: "Questions before you travel",
          es: "Preguntas antes de viajar"
        } },
        { type: "p", text: {
          en: "If you have questions about the kiosk or your vehicle before you travel, contact ICB's Benque Viejo Border Branch.",
          es: "Si tiene preguntas sobre el quiosco o su vehículo antes de viajar, comuníquese con la sucursal fronteriza de ICB en Benque Viejo."
        } },
        { type: "actions", items: [
          { label: { en: "Call +501 823-2319", es: "Llamar al +501 823-2319" }, href: "tel:+5018232319" },
          { label: { en: "WhatsApp +501 613-0548", es: "WhatsApp +501 613-0548" }, wa: "5016130548" },
          { label: { en: "ICB's short-term motor insurance guide", es: "Guía de ICB sobre el seguro de corta duración" },
            href: "https://www.icbcovernote.com/" }
        ] }
      ],
      sources: [
        { label: { en: "ICB's short-term motor insurance guide", es: "Guía de ICB sobre el seguro de corta duración" },
          note: { en: "ICB's visitor product, its third-party cover and the information its published purchase process asks for. That page describes the online process; the kiosk may differ.",
                  es: "El producto de ICB para visitantes, su cobertura frente a terceros y la información que solicita el proceso publicado. Esa página describe el proceso en línea; el quiosco puede ser distinto." },
          href: "https://www.icbcovernote.com/" },
        { label: { en: "Motor Vehicle Insurance (Third Party Risks) Act, Chapter 231",
                   es: "Ley de Seguro de Vehículos (Riesgos frente a Terceros), capítulo 231" },
          note: { en: "Section 3 sets out the general third-party insurance requirement for vehicles used on public roads.",
                  es: "El artículo 3 establece el requisito general de seguro frente a terceros para los vehículos que circulan por vías públicas." },
          href: "https://osipp.gov.bz/wp-content/uploads/2023/03/Cap_231_Motor_Vehicle_Insurance__Third_Party_Risks__Act.pdf" },
        { label: { en: "ICB's branch directory", es: "Directorio de sucursales de ICB" },
          note: { en: "The Benque Viejo Border Branch location and its contact details.",
                  es: "La ubicación de la sucursal fronteriza de Benque Viejo y sus datos de contacto." },
          href: "#/locations" }
      ]
    }
  ]
};

/* Entries in reading order: the most recent thing first, and anything
   with no date of its own after the dated ones rather than guessing a
   position for it. */
ICB.DATA.newsEntries = function () {
  return ICB.DATA.news.entries.slice().sort(function (a, b) {
    var ai = (a.dated && a.dated.iso) || "";
    var bi = (b.dated && b.dated.iso) || "";
    if (ai && bi) return ai < bi ? 1 : ai > bi ? -1 : 0;
    if (ai) return -1;
    if (bi) return 1;
    return 0;
  });
};

ICB.DATA.newsById = function (id) {
  var all = ICB.DATA.news.entries;
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
};
