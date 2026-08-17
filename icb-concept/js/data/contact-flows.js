/* ============================================================================
   ICB.DATA.contactFlows — the guided contact journey.
   First-stage routing only: no sensitive information is requested, and the
   demo form does not transmit anything (see demoNotice).
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.contactFlows = {
  intro: { en: "Tell us what you need and we will point you to the right ICB team.", es: "Cuéntenos qué necesita y le indicaremos el equipo de ICB indicado." },

  demoNotice: {
    title: { en: "Thanks. Here is where this would go next.", es: "Gracias. Aquí es donde esto seguiría." },
    body: { en: "This concept form does not send messages yet. In the full experience, your enquiry would reach the right ICB team for follow-up. To reach ICB today, call +501 224-5328 or email icb@icbinsurance.com.", es: "Este formulario de concepto todavía no envía mensajes. En la experiencia completa, su consulta llegaría al equipo de ICB indicado para darle seguimiento. Para contactar a ICB hoy, llame al +501 224-5328 o escriba a icb@icbinsurance.com." },
    actions: [
      { label: { en: "Call +501 224-5328", es: "Llamar al +501 224-5328" }, href: "tel:+5012245328", kind: "tel" },
      { label: { en: "Email icb@icbinsurance.com", es: "Escribir a icb@icbinsurance.com" }, href: "mailto:icb@icbinsurance.com", kind: "mail" }
    ]
  },

  commonFields: [
    { id: "name", label: { en: "Full name", es: "Nombre completo" }, type: "text", autocomplete: "name", required: true },
    { id: "phone", label: { en: "Phone or WhatsApp", es: "Teléfono o WhatsApp" }, type: "tel", autocomplete: "tel", required: true },
    { id: "email", label: { en: "Email", es: "Correo electrónico" }, type: "email", autocomplete: "email", required: false },
    {
      id: "branch", label: { en: "Preferred ICB branch", es: "Sucursal de ICB preferida" }, type: "select", required: false,
      optionsFrom: "locations",
      help: { en: "Optional. Choose the branch that is most convenient for you.", es: "Opcional. Elija la sucursal que más le convenga." }
    }
  ],

  topics: [
    {
      id: "new-cover",
      label: { en: "New insurance enquiry", es: "Consulta de seguro nuevo" },
      description: { en: "I want to explore cover for something new.", es: "Quiero explorar cobertura para algo nuevo." },
      fields: [
        {
          id: "category", label: { en: "What would you like to protect?", es: "¿Qué le gustaría proteger?" }, type: "select", required: true,
          optionsFrom: "products"
        },
        { id: "message", label: { en: "Tell us a little about it", es: "Cuéntenos un poco al respecto" }, type: "textarea", required: false,
          help: { en: "A sentence or two is plenty. An ICB representative will take it from there.", es: "Con una o dos frases basta. Un representante de ICB sigue desde ahí." } }
      ]
    },
    {
      id: "existing-policy",
      label: { en: "Existing policy", es: "Póliza existente" },
      description: { en: "I already have a policy with ICB.", es: "Ya tengo una póliza con ICB." },
      fields: [
        { id: "message", label: { en: "How can we help with your policy?", es: "¿Cómo podemos ayudarle con su póliza?" }, type: "textarea", required: true,
          help: { en: "Please do not include policy numbers or payment details in this concept form.", es: "Por favor no incluya números de póliza ni datos de pago en este formulario de concepto." } }
      ],
      /* Payment is by bank transfer, not through this website. */
      sideNote: { en: "Paying a premium? ICB is paid by bank transfer.", es: "¿Va a pagar una prima? A ICB se le paga por transferencia bancaria." },
      sideAction: { label: { en: "View payment instructions", es: "Ver instrucciones de pago" }, href: "#/payments" }
    },
    {
      id: "claim",
      label: { en: "A claim", es: "Un reclamo" },
      description: { en: "Something happened and I need to start or follow up on a claim.", es: "Pasó algo y necesito iniciar o dar seguimiento a un reclamo." },
      safetyNote: { en: "If anyone is injured or in immediate danger, contact emergency services first.", es: "Si hay personas lesionadas o en peligro inmediato, llame primero a los servicios de emergencia." },
      fields: [
        {
          id: "claimType", label: { en: "Type of claim", es: "Tipo de reclamo" }, type: "select", required: true,
          optionsFrom: "claims"
        },
        { id: "message", label: { en: "Briefly, what happened?", es: "¿Qué pasó, en breve?" }, type: "textarea", required: false }
      ],
      sideNote: { en: "The Claims section explains each pathway and links to the official forms.", es: "La sección de Reclamos explica cada vía y enlaza a los formularios oficiales." },
      sideAction: { label: { en: "View claims pathways", es: "Ver las vías de reclamo" }, href: "#/claims" }
    },
    {
      id: "business",
      label: { en: "Business insurance", es: "Seguro para negocios" },
      description: { en: "I am looking at cover for a business.", es: "Estoy viendo cobertura para un negocio." },
      fields: [
        { id: "businessName", label: { en: "Business name", es: "Nombre del negocio" }, type: "text", required: false },
        { id: "message", label: { en: "What does the business need?", es: "¿Qué necesita el negocio?" }, type: "textarea", required: true,
          help: { en: "Property, vehicles, cargo, liability, or a mix. A rough picture is enough to start.", es: "Propiedad, vehículos, carga, responsabilidad civil, o una mezcla. Con una idea general basta para empezar." } }
      ]
    },
    {
      id: "branch-info",
      label: { en: "Branch information", es: "Información de sucursales" },
      description: { en: "I need to find or reach a branch.", es: "Necesito encontrar o contactar una sucursal." },
      shortCircuit: {
        text: { en: "Branch and agency details for the whole country are on the Locations page, with call, WhatsApp and directions links.", es: "Los datos de sucursales y agencias de todo el país están en la página de Ubicaciones, con enlaces para llamar, escribir por WhatsApp y obtener indicaciones." },
        actions: [
          { label: { en: "Find ICB near you", es: "Encuentre ICB cerca de usted" }, href: "#/locations" },
          { label: { en: "Call the Corporate Office", es: "Llamar a la Oficina Corporativa" }, href: "tel:+5012245328", kind: "tel" }
        ]
      }
    },
    {
      id: "other",
      label: { en: "Something else", es: "Otra cosa" },
      description: { en: "My question does not fit the boxes above.", es: "Mi pregunta no encaja en las opciones de arriba." },
      fields: [
        { id: "message", label: { en: "What can we help you with?", es: "¿En qué le podemos ayudar?" }, type: "textarea", required: true }
      ]
    }
  ]
};
