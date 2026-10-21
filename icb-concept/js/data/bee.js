/* ============================================================================
   ICB.DATA.bee — the content of the Bee page.

   WHAT BEE IS ALLOWED TO BE SAID TO DO

   Every capability listed here is something the assistant can actually
   do with what is on this site: explain ICB's published products, point
   to one of the twenty-two offices with its real contact details, name
   the official claim form, explain that ICB is paid by bank transfer,
   and hand the visitor to a person. Nothing is promised that would need
   a system ICB has not got.

   The "will not do" list is not a disclaimer bolted on at the end. It is
   the same rule the whole site is built on: no quoting, no binding
   cover, no deciding claims, no taking payment. Saying so plainly on the
   assistant's own page is what stops a visitor believing a chat window
   has put a policy in place.

   ---------------------------------------------------------------------
   PRIVACY SECTION: NEEDS ICB'S SIGN-OFF BEFORE IT GOES LIVE.

   Everything under privacy is a representation about how ICB handles
   personal information. It is drafted from what the client asked for and
   it is written to be defensible, but it is a promise made in ICB's
   name, not a description of a system anyone here has audited. ICB, and
   ideally whoever advises them on the Data Protection Act, should read
   it and confirm every line before this page is published.

   Two things in particular were written carefully rather than simply:

   1. The assistant is run by a third party. Saying "your information
      never leaves ICB" would be untrue, because messages pass through
      the provider that operates the assistant in order to be answered.
      That is disclosed, in plain words, without naming a vendor. A
      privacy promise that is quietly false is worse than no promise.

   2. Nothing is claimed about retention periods, lawful bases, deletion
      requests or who in ICB can see a conversation, because nobody here
      knows. Those belong in a privacy policy ICB writes, which is a
      separate document from this page.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.bee = {

  /* What Bee can help with. Each one is grounded in information this
     site already holds. */
  canDo: [
    {
      glyph: "shield",
      title: { en: "Explain ICB's insurance", es: "Explicar los seguros de ICB" },
      body: {
        en: "Ask what a type of ICB cover is for and Bee explains it in plain language, using ICB's own descriptions. Product names stay as ICB publishes them.",
        es: "Pregunte para qué sirve un tipo de cobertura de ICB y Bee lo explica en lenguaje sencillo, usando las descripciones de ICB. Los nombres de los productos se mantienen como ICB los publica."
      }
    },
    {
      glyph: "marker",
      title: { en: "Find your nearest office", es: "Encontrar su oficina más cercana" },
      body: {
        en: "Twenty-two branches and agencies, from Corozal to Punta Gorda. Bee can give you the address, telephone, WhatsApp and email for the one you need, and its opening hours.",
        es: "Veintidós sucursales y agencias, desde Corozal hasta Punta Gorda. Bee le da la dirección, el teléfono, el WhatsApp y el correo de la que necesita, y su horario."
      }
    },
    {
      glyph: "document",
      title: { en: "Point you to the right claim form", es: "Indicarle el formulario de reclamo correcto" },
      body: {
        en: "Bee can tell you which official ICB claim form applies to your type of claim, and how to reach the claims team who handle it.",
        es: "Bee le dice cuál formulario oficial de reclamo de ICB corresponde a su tipo de reclamo, y cómo comunicarse con el equipo que lo atiende."
      }
    },
    {
      glyph: "card",
      title: { en: "Explain how ICB is paid", es: "Explicar cómo se le paga a ICB" },
      body: {
        en: "ICB does not take payments through this website. Payment is by bank transfer, and Bee can walk you through the steps.",
        es: "ICB no recibe pagos por este sitio web. El pago es por transferencia bancaria, y Bee le explica los pasos."
      }
    },
    {
      glyph: "chat",
      title: { en: "Answer in English or Spanish", es: "Responder en inglés o en español" },
      body: {
        en: "Write in either language. Bee answers in the one you wrote in.",
        es: "Escriba en cualquiera de los dos idiomas. Bee responde en el que usted escribió."
      }
    },
    {
      glyph: "people",
      title: { en: "Hand you to a person", es: "Pasarle con una persona" },
      body: {
        en: "Ask for a human at any point and Bee gives you the telephone, WhatsApp line or email for the office you need.",
        es: "Pida hablar con una persona en cualquier momento y Bee le da el teléfono, la línea de WhatsApp o el correo de la oficina que necesita."
      }
    }
  ],

  /* The boundaries. These are the same rules the rest of the site
     follows, said out loud on the assistant's own page. */
  willNot: [
    {
      en: "It does not give prices or quotations. A quotation comes from ICB staff who can see what you actually need.",
      es: "No da precios ni cotizaciones. Una cotización la da el personal de ICB, que puede ver lo que usted realmente necesita."
    },
    {
      en: "It does not approve, confirm or put cover in place. Nothing said in a chat makes you insured.",
      es: "No aprueba, no confirma ni activa una cobertura. Nada de lo que se diga en un chat lo deja asegurado."
    },
    {
      en: "It does not decide claims or judge who is at fault. The ICB claims team does that.",
      es: "No decide reclamos ni determina quién tiene la culpa. Eso lo hace el equipo de reclamos de ICB."
    },
    {
      en: "It does not take payments, and it will never ask you for card details.",
      es: "No recibe pagos, y nunca le pedirá datos de tarjeta."
    },
    {
      en: "It can be wrong. Bee is an assistant, not an adviser. Anything that matters should be confirmed with ICB before you act on it.",
      es: "Puede equivocarse. Bee es un asistente, no un asesor. Confirme con ICB cualquier cosa importante antes de actuar."
    }
  ],

  /* Why it is worth using. Written against the real alternative, which
     is a telephone call during office hours. */
  benefits: [
    {
      glyph: "storm",
      title: { en: "There at three in the morning", es: "Está a las tres de la mañana" },
      body: {
        /* Deliberately does not restate the times. They are on every
            location card, they have changed once already, and a figure
            repeated in prose is the one that gets left behind. */
        en: "ICB's offices keep office hours, Monday to Saturday. Things happen outside those hours. Bee does not close.",
        es: "Las oficinas de ICB atienden en horario de oficina, de lunes a sábado. Las cosas pasan fuera de ese horario. Bee no cierra."
      }
    },
    {
      glyph: "check",
      title: { en: "No queue, no hold", es: "Sin fila y sin esperas" },
      body: {
        en: "A straight answer to a straight question, without waiting for a line to be free.",
        es: "Una respuesta directa a una pregunta directa, sin esperar a que se desocupe una línea."
      }
    },
    {
      glyph: "people",
      title: { en: "The same help in Spanish", es: "La misma ayuda en español" },
      body: {
        en: "Not a shorter version. The same answers, in the language you asked in.",
        es: "No una versión más corta. Las mismas respuestas, en el idioma en que preguntó."
      }
    },
    {
      glyph: "compass",
      title: { en: "It knows the whole network", es: "Conoce toda la red" },
      body: {
        en: "You do not have to work out which of twenty-two offices to call. Say where you are and Bee tells you.",
        es: "No tiene que adivinar a cuál de veintidós oficinas llamar. Diga dónde está y Bee se lo dice."
      }
    },
    {
      glyph: "road",
      title: { en: "A head start on the real conversation", es: "Ventaja antes de la conversación real" },
      body: {
        en: "By the time you call ICB you already know which cover you are asking about, which form applies and which branch to ask.",
        es: "Para cuando llame a ICB ya sabrá por cuál cobertura pregunta, cuál formulario corresponde y a cuál sucursal acudir."
      }
    },
    {
      glyph: "phone",
      title: { en: "You are never stuck with it", es: "Nunca se queda atrapado con el chat" },
      body: {
        en: "A person is always one request away. Bee is a way in to ICB, not a wall around it.",
        es: "Una persona está siempre a una petición de distancia. Bee es una entrada a ICB, no un muro."
      }
    }
  ],

  /* DRAFT. See the file header: every line here is a promise in ICB's
     name and needs their sign-off before publication. */
  privacy: [
    {
      glyph: "shield",
      title: { en: "ICB does not sell your information", es: "ICB no vende su información" },
      body: {
        en: "Not to advertisers, not to data brokers, not to anyone. It is not rented out, traded or swapped either.",
        es: "Ni a anunciantes, ni a corredores de datos, ni a nadie. Tampoco se alquila, se intercambia ni se cede."
      }
    },
    {
      glyph: "mail",
      title: { en: "No marketing lists", es: "Sin listas de mercadeo" },
      body: {
        en: "Your name, telephone number and email are not added to a mailing list because you spoke to Bee, and they are not passed to anyone who would do that.",
        es: "Su nombre, su teléfono y su correo no se agregan a una lista de correos por haber escrito a Bee, ni se pasan a nadie que lo haría."
      }
    },
    {
      glyph: "check",
      title: { en: "Used to answer you, and nothing else", es: "Se usa para responderle, nada más" },
      body: {
        en: "If you leave contact details, they are there so ICB can get back to you about what you asked. That is the whole purpose.",
        es: "Si deja sus datos de contacto, es para que ICB pueda responderle sobre lo que preguntó. Ese es todo el propósito."
      }
    },
    {
      glyph: "question",
      title: { en: "You do not have to say who you are", es: "No tiene que decir quién es" },
      body: {
        en: "A general question needs no name, no number and no email. Those are only worth giving when you want ICB to come back to you.",
        es: "Una pregunta general no necesita nombre, ni número, ni correo. Solo vale la pena darlos cuando quiere que ICB le responda."
      }
    },
    {
      glyph: "container",
      title: { en: "How Bee works behind the scenes", es: "Cómo funciona Bee por dentro" },
      body: {
        en: "Bee is operated for ICB by a specialist assistant service, in the way a telephone line is operated by a telephone company. Your messages pass through that service so that an answer can be produced. ICB would rather tell you that than let you assume otherwise.",
        es: "Bee lo opera para ICB un servicio especializado de asistentes, igual que una línea telefónica la opera una compañía telefónica. Sus mensajes pasan por ese servicio para poder generar una respuesta. ICB prefiere decírselo a que usted suponga otra cosa."
      }
    },
    {
      glyph: "border",
      title: { en: "Please keep sensitive details out of the chat", es: "Por favor no escriba datos sensibles en el chat" },
      body: {
        en: "Social security or identity numbers, bank account or card numbers, and medical details do not belong in a chat window. If something needs them, ask for a person and ICB will take it from there.",
        es: "Los números de seguro social o de identidad, los números de cuenta o de tarjeta, y los datos médicos no van en una ventana de chat. Si algo los requiere, pida una persona y ICB lo atenderá por otra vía."
      }
    }
  ]
};
