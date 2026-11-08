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

   ONE FLAG, AND IT MATTERS
   launchDay: true marks an entry that is only TRUE once the redesigned
   site is live on ICB's own domain. There is one, the launch
   announcement, and its date must match the day the site actually goes
   up. DEPLOY.md's launch checklist carries the line.

   (benque-viejo-border-kiosk was held as a draft until 8 Nov 2026,
   when ICB's own short-term motor insurance site answered what was
   missing. See the note on that entry.)
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.news = {

  /* Shown wherever the section names itself. */
  section: { en: "What's New at ICB", es: "Novedades de ICB" },

  entries: [
    {
      /* The launch announcement. It is true the moment the redesigned
         site is live on ICB's own domain and not a day before, which is
         why DEPLOY.md's launch checklist asks whoever ships it to check
         this date against the day they actually go live. Nothing hides
         it in the meantime: the whole site is noindexed until launch,
         so the only people who can read it are the people reviewing it.

         The claims paragraph names nine forms rather than the five in
         the supplied copy. The copy was written before ICB sent the
         other four on 7 Nov; the site carries all nine, so the article
         says nine. */
      id: "icb-belize-new-website-launch",
      launchDay: true,
      published: "2026-11-23",
      dated: {
        label: { en: "Published", es: "Publicado" },
        text: { en: "Monday, November 23, 2026", es: "Lunes 23 de noviembre de 2026" },
        iso: "2026-11-23"
      },
      category: { en: "Company News", es: "Noticias corporativas" },
      title: {
        en: "ICB launches a new website with Bee, online claim forms and branch WhatsApp",
        es: "ICB estrena su sitio web con Bee, formularios de reclamo en línea y WhatsApp por sucursal"
      },
      seoTitle: {
        en: "New ICB Belize website, Bee, claims and branch WhatsApp",
        es: "Nuevo sitio de ICB Belice, Bee, reclamos y WhatsApp"
      },
      seoDescription: {
        en: "Explore ICB Belize's redesigned bilingual website. Ask Bee, complete and sign official claim forms online, and find an ICB branch on WhatsApp.",
        es: "Explore el nuevo sitio bilingüe de ICB Belice. Consulte a Bee, complete y firme formularios de reclamo y contacte a su sucursal por WhatsApp."
      },
      excerpt: {
        en: "Meet Bee, fill in and sign official ICB claim forms on your device, and reach a participating branch directly on WhatsApp.",
        es: "Conozca a Bee, complete y firme los formularios oficiales de ICB en su dispositivo y contacte a una sucursal por WhatsApp."
      },
      hero: {
        wide: "assets/img/news/website-launch-wide.webp",
        wideW: 1600, wideH: 900,
        tall: "assets/img/news/website-launch-tall.webp",
        tallW: 900, tallH: 1125,
        alt: {
          en: "Redesigned ICB homepage and mobile gallery showing ICB's headquarters and the Talk to Bee button.",
          es: "Nueva página de inicio y galería móvil de ICB, con una vista de su sede y el botón para hablar con Bee."
        },
        caption: {
          en: "The redesigned ICB website on desktop and mobile, featuring the Talk to Bee entry point.",
          es: "El nuevo sitio web de ICB en computadora y teléfono, con acceso al asistente Bee."
        }
      },
      body: [
        { type: "p", text: {
          en: "The Insurance Corporation of Belize (ICB) has redesigned icbinsurance.com to make it easier to get help, explore insurance and take the next step on a claim. The site is available in English and Spanish and is designed for both phones and computers. The web address is the same. The biggest changes are what you can do once you get there.",
          es: "Insurance Corporation of Belize (ICB) ha renovado icbinsurance.com para que sea más fácil pedir ayuda, explorar opciones de seguro y dar el siguiente paso en un reclamo. El sitio está disponible en inglés y español y se puede usar desde un teléfono o una computadora. La dirección web es la misma. Los cambios principales están en lo que ahora puede hacer desde el sitio."
        } },

        { type: "h", text: {
          en: "Meet Bee, ICB's bilingual AI Employee",
          es: "Conozca a Bee, el asistente bilingüe con IA de ICB"
        } },
        { type: "p", text: {
          en: "Talk to Bee when you need a starting point. Ask in English or Spanish about ICB's insurance options, how to begin a claim, or which branch to contact. Bee can point you to the appropriate official claim form, explain ICB's published bank-transfer instructions and find an office's contact information. You can ask a general question at any hour, including when the offices are closed.",
          es: "Converse con Bee en inglés o español para informarse sobre los seguros de ICB, saber cómo iniciar un reclamo o localizar una sucursal. Bee puede indicarle cuál es el formulario oficial que corresponde, explicarle las instrucciones de ICB para transferencias bancarias y ayudarle a encontrar los datos de contacto de una oficina. Puede hacer preguntas generales a cualquier hora, incluso cuando las oficinas están cerradas."
        } },
        { type: "p", text: {
          en: "If you would like to speak with someone, ask Bee for the office's phone number, WhatsApp or email. ICB representatives handle coverage decisions, quotations and claims.",
          es: "Si prefiere hablar con una persona, pídale a Bee el teléfono, WhatsApp o correo de la oficina correspondiente. El personal de ICB se encarga de las decisiones sobre cobertura, las cotizaciones y los reclamos."
        } },
        { type: "actions", items: [
          { label: { en: "Talk to Bee", es: "Converse con Bee" }, href: "#/bee" }
        ] },

        { type: "h", text: {
          en: "Fill in, sign and send official ICB claim forms from your device",
          es: "Complete, firme y envíe los formularios oficiales de ICB desde su dispositivo"
        } },
        { type: "p", text: {
          en: "The Claims Centre guides you to the appropriate form: an insured motor accident, a third-party motor claim, a windscreen claim, a property claim, hurricane damage, a marine claim, an inland cargo claim, a public liability claim or a personal accident claim. You can download a blank copy, or select Fill it out online to work through the form on a phone or computer.",
          es: "En la sección de reclamos puede encontrar el formulario que corresponde: accidente de un vehículo asegurado, reclamo vehicular de terceros, parabrisas, daños a la propiedad, daños por huracán, reclamo marítimo, carga terrestre, responsabilidad civil o accidente personal. Puede descargar un formulario en blanco o completarlo en línea desde un teléfono o una computadora."
        } },
        { type: "p", text: {
          en: "The online form lets you enter details, sign on screen, add supporting photos or files, and review your information before preparing the completed PDF. On a supported device, the Send option opens your sharing menu so you can choose the appropriate channel and finish sending it to ICB. If your device uses the email fallback, attach the saved PDF and any supporting files to the email and send it. You can also download a copy for your records.",
          es: "El formulario en línea le permite ingresar sus datos, firmar en pantalla, agregar fotos o archivos de respaldo y revisar la información antes de preparar el PDF. En dispositivos compatibles, la opción de envío abre el menú para compartir, donde puede elegir el canal correspondiente y completar el envío a ICB. Si su dispositivo abre el correo electrónico, adjunte el PDF guardado y los archivos de respaldo antes de enviarlo. También puede descargar una copia para sus archivos."
        } },
        { type: "actions", items: [
          { label: { en: "Find your claim form", es: "Encuentre su formulario" }, href: "#/claims" }
        ] },

        { type: "h", text: {
          en: "Choose an ICB branch and open WhatsApp directly",
          es: "Elija una sucursal y abra WhatsApp directamente"
        } },
        { type: "p", text: {
          en: "Use Locations to find a branch or agency by district, check its contact details and hours, and get directions. Select WhatsApp ICB, choose a district and pick a WhatsApp-enabled office to open a conversation with that location. Phone and email details are also listed where available.",
          es: "En Sucursales puede buscar una oficina por distrito, consultar sus horarios y datos de contacto, y ver cómo llegar. Seleccione WhatsApp ICB, elija un distrito y seleccione una oficina con WhatsApp para iniciar la conversación. También se muestran los datos de teléfono y correo cuando están disponibles."
        } },
        { type: "actions", items: [
          { label: { en: "Find a branch", es: "Buscar una sucursal" }, href: "#/locations" }
        ] },

        { type: "h", text: {
          en: "Explore insurance, payment instructions and customer resources",
          es: "Explore los seguros, las instrucciones de pago y los recursos"
        } },
        { type: "p", text: {
          en: "Explore insurance options for motor vehicles, property, marine hull, cargo, liability and Mexican insurance. Use the guided insurance finder to narrow your options, or send a quote enquiry. Business insurance has its own starting point for commercial customers.",
          es: "Consulte las opciones de seguro para vehículos, propiedades, embarcaciones, carga, responsabilidad civil y México. Use el buscador guiado de seguros o envíe una solicitud de cotización. Los clientes comerciales tienen su propia sección de seguros para empresas."
        } },
        { type: "p", text: {
          en: "The payments page has ICB's bank-transfer instructions and how to send proof of payment to your branch afterwards. The Resource Centre brings together useful forms and information, and the questions and answers cover policies, renewals, payments and claims.",
          es: "La página de pagos tiene las instrucciones de ICB para transferencias bancarias y cómo enviar el comprobante a su sucursal después. El Centro de recursos reúne formularios e información útil, y las preguntas frecuentes abarcan pólizas, renovaciones, pagos y reclamos."
        } },
        { type: "p", text: {
          en: "The gallery has photographs of every ICB branch and agency and ICB's campaign films in English and Spanish. On a phone, the quick links put Call, WhatsApp, Branches and Enquire within easy reach.",
          es: "La galería tiene fotografías de todas las sucursales y agencias de ICB y los videos de campaña en inglés y español. En el teléfono, los accesos rápidos ponen a mano las opciones de llamada, WhatsApp, sucursales y consultas."
        } },
        { type: "actions", items: [
          { label: { en: "Explore insurance", es: "Ver seguros" }, href: "#/insurance" },
          { label: { en: "How to pay ICB", es: "Cómo pagarle a ICB" }, href: "#/payments" },
          { label: { en: "Questions and answers", es: "Preguntas y respuestas" }, href: "#/faq" }
        ] }
      ],
      sources: [
        { label: { en: "ICB's redesigned website", es: "El nuevo sitio web de ICB" },
          note: { en: "Everything described here is on the site itself.", es: "Todo lo descrito aquí está en el propio sitio." },
          href: "https://www.icbinsurance.com/" }
      ]
    },

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
      /* No longer a draft, cleared 8 Nov 2026.

         It was held back because nobody had confirmed what is sold at
         this kiosk, what a driver has to bring or how the cover works.
         ICB's own short-term motor insurance site answers all of that
         in its own words, and the client pointed us at it: the vehicle
         types, the five coverage periods, the exact details the
         process asks for, that payment is by card, and the Schedule 1
         a driver must print and display. Everything below now comes
         from that page or from the Act it cites.

         One thing is still not published anywhere: the kiosk's own
         opening hours. The article does not state them.

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
        /* Everything in this section is ICB's own published process,
           read off their short-term motor insurance site. */
        { type: "p", text: {
          en: "Four things: your passport, your valid driver's licence, the vehicle registration, and a credit card. ICB's published process asks for the number, issuing country and expiry from both the passport and the licence, your name, telephone and email, and the vehicle's make, model, year, VIN and licence plate number, along with the owner's details.",
          es: "Cuatro cosas: su pasaporte, su licencia de conducir vigente, el documento de matrícula del vehículo y una tarjeta de crédito. El proceso publicado por ICB solicita el número, el país de emisión y la fecha de vencimiento tanto del pasaporte como de la licencia, su nombre, teléfono y correo electrónico, y la marca, el modelo, el año, el VIN y la matrícula del vehículo, junto con los datos del propietario."
        } },
        { type: "p", text: {
          en: "Cover is written for private vehicles, commercial vehicles, heavy duty vehicles and passenger buses, over five periods: one day, three days, one week, two weeks, or one month. Know roughly how long you plan to drive in Belize and you can pick the one that fits.",
          es: "La cobertura se emite para vehículos particulares, vehículos comerciales, vehículos de carga pesada y autobuses de pasajeros, en cinco períodos: un día, tres días, una semana, dos semanas o un mes. Si sabe aproximadamente cuánto tiempo conducirá en Belice, podrá elegir el que le convenga."
        } },
        { type: "h", text: {
          en: "Print Schedule 1 and put it on the windscreen",
          es: "Imprima el Schedule 1 y colóquelo en el parabrisas"
        } },
        { type: "p", text: {
          en: "This is the step people miss. ICB states that under the Motor Vehicle Insurance (Third Party Risks) Act, Chapter 231, Revised Edition 2020, you are required to print the Schedule 1 that arrives by email and display it on the windscreen of the insured vehicle in order to comply with the law. Being insured is not enough on its own; the document has to be showing.",
          es: "Este es el paso que más se pasa por alto. ICB indica que, conforme a la Ley de Seguro de Vehículos (Riesgos frente a Terceros), capítulo 231, edición revisada de 2020, usted debe imprimir el Schedule 1 que recibe por correo y exhibirlo en el parabrisas del vehículo asegurado para cumplir con la ley. No basta con estar asegurado: el documento tiene que estar a la vista."
        } },
        { type: "p", text: {
          en: "Before you drive onward, check the vehicle details on your insurance documents and confirm when cover begins and ends.",
          es: "Antes de continuar su viaje, compruebe los datos del vehículo en los documentos del seguro y confirme cuándo empieza y termina la cobertura."
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
        { label: { en: "ICB's short-term motor insurance site", es: "Sitio de ICB sobre el seguro de corta duración" },
          note: { en: "ICB's visitor product, its third-party cover, the vehicle types and coverage periods, and everything its published process asks for.",
                  es: "El producto de ICB para visitantes, su cobertura frente a terceros, los tipos de vehículo y los períodos de cobertura, y todo lo que solicita el proceso publicado." },
          href: "https://www.icbcovernote.com/" },
        { label: { en: "ICB's step-by-step purchase guide", es: "Guía paso a paso de compra de ICB" },
          note: { en: "The six steps, the documents to have ready, and the Schedule 1 that must be printed and displayed on the windscreen.",
                  es: "Los seis pasos, los documentos que debe tener a mano y el Schedule 1 que debe imprimirse y exhibirse en el parabrisas." },
          href: "https://www.icbcovernote.com/copy-of-home" },
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
