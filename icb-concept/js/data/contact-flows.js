/* ============================================================================
   ICB.DATA.contactFlows — the guided contact journey.
   First-stage routing only: no sensitive information is requested, and the
   demo form does not transmit anything (see demoNotice).
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

ICB.DATA.contactFlows = {
  intro: "Tell us what you need and we will point you to the right ICB team.",

  demoNotice: {
    title: "Thanks. Here is where this would go next.",
    body: "This concept form does not send messages yet. In the full experience, your enquiry would reach the right ICB team for follow-up. To reach ICB today, call +501 224-5328 or email icb@icbinsurance.com.",
    actions: [
      { label: "Call +501 224-5328", href: "tel:+5012245328", kind: "tel" },
      { label: "Email icb@icbinsurance.com", href: "mailto:icb@icbinsurance.com", kind: "mail" }
    ]
  },

  commonFields: [
    { id: "name", label: "Full name", type: "text", autocomplete: "name", required: true },
    { id: "phone", label: "Phone or WhatsApp", type: "tel", autocomplete: "tel", required: true },
    { id: "email", label: "Email", type: "email", autocomplete: "email", required: false },
    {
      id: "branch", label: "Preferred ICB branch", type: "select", required: false,
      optionsFrom: "locations",
      help: "Optional. Choose the branch that is most convenient for you."
    }
  ],

  topics: [
    {
      id: "new-cover",
      label: "New insurance enquiry",
      description: "I want to explore cover for something new.",
      fields: [
        {
          id: "category", label: "What would you like to protect?", type: "select", required: true,
          optionsFrom: "products"
        },
        { id: "message", label: "Tell us a little about it", type: "textarea", required: false,
          help: "A sentence or two is plenty. An ICB representative will take it from there." }
      ]
    },
    {
      id: "existing-policy",
      label: "Existing policy",
      description: "I already have a policy with ICB.",
      fields: [
        { id: "message", label: "How can we help with your policy?", type: "textarea", required: true,
          help: "Please do not include policy numbers or payment details in this concept form." }
      ],
      /* Points at the portal without describing what can be done there. */
      sideNote: "ICB publishes a payment portal online.",
      sideAction: { label: "Open payment portal", hrefKey: "payments", external: true }
    },
    {
      id: "claim",
      label: "A claim",
      description: "Something happened and I need to start or follow up on a claim.",
      safetyNote: "If anyone is injured or in immediate danger, contact emergency services first.",
      fields: [
        {
          id: "claimType", label: "Type of claim", type: "select", required: true,
          optionsFrom: "claims"
        },
        { id: "message", label: "Briefly, what happened?", type: "textarea", required: false }
      ],
      sideNote: "The Claims section explains each pathway and links to the official forms.",
      sideAction: { label: "View claims pathways", href: "#/claims" }
    },
    {
      id: "business",
      label: "Business insurance",
      description: "I am looking at cover for a business.",
      fields: [
        { id: "businessName", label: "Business name", type: "text", required: false },
        { id: "message", label: "What does the business need?", type: "textarea", required: true,
          help: "Property, vehicles, cargo, liability, or a mix. A rough picture is enough to start." }
      ]
    },
    {
      id: "branch-info",
      label: "Branch information",
      description: "I need to find or reach a branch.",
      shortCircuit: {
        text: "Branch and agency details for the whole country are on the Locations page, with call, WhatsApp and directions links.",
        actions: [
          { label: "Find ICB near you", href: "#/locations" },
          { label: "Call the Corporate Office", href: "tel:+5012245328", kind: "tel" }
        ]
      }
    },
    {
      id: "other",
      label: "Something else",
      description: "My question does not fit the boxes above.",
      fields: [
        { id: "message", label: "What can we help you with?", type: "textarea", required: true }
      ]
    }
  ]
};
