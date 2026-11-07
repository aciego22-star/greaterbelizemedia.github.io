/* ============================================================================
   ICB.DATA.claimForms — ICB's five claim forms, as structured fields.

   SOURCE: the five PDFs ICB supplied on 21 Oct 2026 and the four more
   supplied on 7 Nov 2026 (windscreen, inland cargo, public liability,
   personal accident), all of which are also served for download from
   assets/forms. Every question below is taken from them. Nothing is
   added, reworded into a different question, or left out, because the
   thing a claimant signs here has to be the thing ICB's form asks.

   ONE EXCEPTION, AND ONLY FOR LABELS. Where ICB's printed form has a
   plain grammatical slip in a QUESTION, the question is written here
   in correct English: the public liability form asks "Where did the
   accident occurred", and the windscreen form says "ATTACH PROFORMA
   INVOICE/ ESTIMATE TO THE IS FORM". It is the same question either
   way, and a visitor reading a slip on a polished page reads it as
   ours. Declarations, releases and anything a claimant signs under are
   NEVER touched: those are reproduced exactly, slips included. Both
   slips are listed in OPEN-QUESTIONS.md so ICB can correct the
   printed forms if it wants to.

   WHY THE ENGLISH LABEL IS THE ONE IN THE PDF. The site is read in two
   languages, so every question is written here in both. The completed
   PDF that reaches ICB is always in English, against ICB's own wording,
   because that is the form their claims team works from. A Spanish
   speaker fills it in Spanish and ICB receives the form they know.

   NOT LEGAL ADVICE AND NOT A CHANGE TO THE FORM. The declarations are
   reproduced verbatim. Where ICB's form asks an open question, this asks
   the same open question rather than narrowing it into options, so no
   answer is put into a claimant's mouth.

   INTERNAL TODO (not client-facing), all for ICB rather than for us:
   - ICB's claims team must confirm they accept a signature drawn on a
     screen on these forms. Nothing here should go live until they do.
   - The stamp is settled; see stampNote below. Six of the nine forms
     print a stamp line; marine, windscreen and personal accident do
     not. It is a company's rubber stamp rather than anything a
     claimant signing for themselves has to produce.
   - The personal accident form has a section only a doctor can
     complete. ICB's own form says it may be left blank if an itemized
     bill is attached, so that is what the online form says too.
     Confirm the claims team is happy to receive it that way.
   - The Spanish wording needs a read by a Belizean Spanish speaker.
     This now covers 376 fields across nine forms.

   FIELD SHAPE
     k    key, unique inside its form, and the column name in the PDF
     t    text | long | date | time | tel | email | money | number
          | yesno | select | table | sketch | signature | attachments
          | note  (static guidance, never collected)
     l    label, { en, es }
     h    hint under the field, { en, es }, optional
     req  true where ICB's form cannot be read without it. Kept to the
          few that identify the claim: a form half filled at the roadside
          is more use to ICB than a form abandoned because it demanded
          something the claimant did not have on them.
     w    "full" (default) | "half"
     opts for select, [{ v, l }]
     cols for table, [{ k, l, w }]
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

(function () {
  "use strict";

  /* Verbatim from ICB's forms. Reproduced, never paraphrased. */
  var LEGAL = {
    medicalRelease:
      "The undersigned hereby makes claim for benefits and authorizes any physician or hospital, Social Security or other person to release and furnish INSURANCE CORPORATION OF BELIZE LTD. or its representatives any and all information concerning any injury, death, or damage to property including all estimates, surveys, consultations, or treatments and copies of all hospital or medical records that same may be included as a part of the proofs of claim submitted to the Corporation.",
    propertyRelease:
      "The undersigned hereby makes claim for benefits and authorizes any Company or other person to release and furnish INSURANCE CORPORATION OF BELIZE LTD. or its representatives any and all information concerning any damage to property including all estimates, surveys, related documents that same may be included as a part of the proofs of claim submitted to the Corporation.",
    declaration:
      "I DECLARE that these particulars are true and complete. I agree that if I have made any false statement or concealed any material fact the claim shall be absolutely forfeited.",
    propertyDeclaration:
      "I/We do hereby declare that the above is a full, true and accurate statement, and I/we further declare that the property mentioned on the reverse hereof which belongs to me/us and which is insured under the above-named Policy or Policies, was destroyed or damaged as aforesaid according to the extent and values stated; wherefore I/we claim the sum of the amount thereof. I agree that if I have made any false statement or concealed any material fact the claim shall be absolutely forfeited.",
    recording:
      "Please be advised that the Insurance Corporation of Belize reserves the right to record interviews and conversations pertaining to any claim and any such recorded conversation may be used as evidence in civil or criminal proceedings.",
    marineFacts:
      "ALL FACTS MATERIAL TO THE QUESTION OF INSURANCE LIABILITY ARE STATED ABOVE OR ATTACHED HERETO AND NO SUCH FACT IS WITHHELD. (NOTE IN CASE OF COLLISION, A DIAGRAM SHOWING HOW IT HAPPENED SHOULD BE ATTACHED) NEITHER THE FURNISHINGS OF THE FORM NOR ACCEPTANCE OF THE COMPLETED STATEMENTS BY THE INSURANCE CORPORATION CONSTITUTES ADMISSION OF LIABILITY BY SAID CORPORATION.",
    motorEstimate:
      "IN ALL CASES WHERE YOUR VEHICLE IS DAMAGED AND YOU ARE ENTITLED TO CLAIM UNDER THE POLICY, PLEASE SEND AT ONCE TO THE COMPANY AN ESTIMATE OF REPAIRS.",
    claimantEstimate:
      "IN ALL CASES WHERE YOUR PROPERTY IS DAMAGED OR PERSONAL INJURY AND YOU ARE ENTITLED TO PURSUE A CLAIM UNDER THE POLICY, PLEASE SEND AT ONCE TO THE COMPANY AN ESTIMATE OF REPAIRS, MEDICAL REPORTS AND MEDICAL EXPENSES.",
    claimsNote:
      "Any communications that you receive about the accident should not be answered but sent to the Company immediately.",
    policeNote:
      "Any loss, damage or destruction is involving or due to a criminal act must be reported to the Police.",
    buildingNote:
      "BUILDING: The Claim should be accompanied by a Tradesman's Estimate, obtained at Insured's expense, of the cost of putting the Building into the same state as it was immediately before the damage; Improvements should not be included in such estimate.",
    contentsNote:
      "CONTENTS: It is essential to give a full list of the articles destroyed or damaged, with the particulars set out below. In the case of Stock the \"estimated value immediately before the damage\" (column 5) must not exceed the value before sale, i.e. it must not be based on the selling price.",

    /* The four forms ICB supplied on 7 Nov 2026. Same rule: verbatim. */
    windscreenDeclaration:
      "I/We do declare that the foregoing particulars are true in all aspects.",
    cargoDeclaration:
      "I hereby declare that the foregoing particulars are true and correct to the best of my knowledge and belief.",
    cargoAttachments:
      "The following documents are to be attached to the completed form: 1. Copy Policy of Insurance. 2. Copy of contract of carriage. 3. Documentary evidence to show the extent of the loss or damage.",
    liabilityNoAdmission:
      "The Company does not admit liability by the issue of this form.",
    liabilityDeclaration:
      "I HEREBY DECLARE THAT THE ABOVE IS A FULL, TRUE AND ACCURATE STATEMENT.",
    liabilityStamp:
      "Where signing on behalf of a Company please affix official stamp.",
    personalAccidentRelease:
      "The undersigned hereby makes claim for benefits and authorizes any physician or hospital or other person to release and furnish INSURANCE CORP. OF BELIZE LTD. or its representatives any and all information concerning any injury, including medical history, consultations, or treatments and copies of all hospital or medical records that same may be included as a part of the proofs of claim submitted to the Corporation. It is understood that the furnishings of this form shall not constitute nor be considered an admission by the Corporation that there was any insurance in force, nor constitute a waiver of any of the Corporations's rights to defend.",
    physicianNote:
      "To be completed by attending physician. Complete this Section or attach an itemized bill."
  };

  /* Short helpers, so a hundred and seventy field objects stay readable
     and a label is never accidentally written in one language only. */
  function f(k, t, en, es, o) {
    var out = { k: k, t: t, l: { en: en, es: es } };
    if (o) for (var key in o) if (Object.prototype.hasOwnProperty.call(o, key)) out[key] = o[key];
    return out;
  }
  function half(k, t, en, es, o) {
    o = o || {}; o.w = "half";
    return f(k, t, en, es, o);
  }
  function note(en, es) { return { t: "note", l: { en: en, es: es } }; }

  /* The passenger and third-party tables repeat across the motor forms. */
  var PASSENGER_COLS = [
    { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
    { k: "address", l: { en: "Address", es: "Dirección" }, w: 4 },
    { k: "occupation", l: { en: "Occupation", es: "Ocupación" }, w: 2 },
    { k: "relationship", l: { en: "Relationship to Insured", es: "Parentesco con el asegurado" }, w: 3 }
  ];
  /* The itemised contents table, identical on the property and the
     catastrophe forms. ICB numbers the columns on the printed form and
     the numbers are kept, because a claimant reading the note about
     "column 5" has to be able to find column 5. */
  var CONTENTS_COLS = [
    { k: "number", l: { en: "(1) Number of Articles", es: "(1) Número de artículos" }, w: 2 },
    { k: "description", l: { en: "(2) Description of Property or Articles Destroyed or Damaged", es: "(2) Descripción de la propiedad o artículos destruidos o dañados" }, w: 5 },
    { k: "purchased", l: { en: "(3) Approx. Date of Purchase", es: "(3) Fecha aproximada de compra" }, w: 2 },
    { k: "cost", l: { en: "(4) Original Cost Price", es: "(4) Precio de costo original" }, w: 2 },
    { k: "before", l: { en: "(5) Estimated value immediately before the damage, allowing for wear and tear", es: "(5) Valor estimado inmediatamente antes del daño, considerando el desgaste" }, w: 3 },
    { k: "after", l: { en: "(6) Estimated value after the damage", es: "(6) Valor estimado después del daño" }, w: 2 },
    { k: "claimed", l: { en: "(7) Amount claimed, i.e. the difference between the last two columns", es: "(7) Monto reclamado, es decir la diferencia entre las dos últimas columnas" }, w: 3 }
  ];

  var WITNESS_COLS = [
    { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
    { k: "address", l: { en: "Address and telephone", es: "Dirección y teléfono" }, w: 4 },
    { k: "where", l: { en: "Where they were when the accident occurred", es: "Dónde estaban cuando ocurrió el accidente" }, w: 4 }
  ];

  /* A third vehicle block. ICB's form asks for two; the same questions
     twice, so they are generated rather than typed twice. */
  function otherVehicle(n) {
    var p = "ov" + n + "_";
    var suffix = { en: " (vehicle " + n + ")", es: " (vehículo " + n + ")" };
    return [
      half(p + "reg", "text", "Registration No." + suffix.en, "Número de matrícula" + suffix.es),
      half(p + "type", "text", "Type of vehicle" + suffix.en, "Tipo de vehículo" + suffix.es),
      f(p + "owner", "long", "Owner's name and address" + suffix.en, "Nombre y dirección del propietario" + suffix.es),
      f(p + "driver", "long", "Driver's name and address" + suffix.en, "Nombre y dirección del conductor" + suffix.es),
      half(p + "insurer", "text", "Insurance Company" + suffix.en, "Compañía de seguros" + suffix.es),
      half(p + "damage", "text", "Nature of damage" + suffix.en, "Naturaleza del daño" + suffix.es),
      half(p + "cost", "money", "Approximate cost of repair" + suffix.en, "Costo aproximado de la reparación" + suffix.es),
      half(p + "passengers", "text", "How many passengers were in the vehicle?" + suffix.en, "¿Cuántos pasajeros había en el vehículo?" + suffix.es),
      f(p + "injured", "text", "Were the persons in the vehicle injured?" + suffix.en, "¿Resultaron heridas las personas del vehículo?" + suffix.es)
    ];
  }

  ICB.DATA.claimForms = {
    legal: LEGAL,

    /* THE STAMP, AND WHY IT IS NOT A PROBLEM.

       Six of the nine forms print "(& Stamp)" or similar beside the
       signature line, and an earlier draft of this build treated that
       as a blocker: a rubber stamp cannot be drawn on a phone, so the
       completed PDF apologised for not having one.

       That was the wrong reading. The public liability form spells out
       what the others abbreviate: "Where signing on behalf of a
       Company please affix official stamp". It is a business's rubber
       stamp, asked for only when someone signs for a company. An
       individual signs their name and that is the whole of it. Put to
       ICB on 7 Nov 2026, Mr Sal's reaction was to wonder why a claim
       form would want a postage stamp at all, which is a fair reading
       of the question as it was asked and tells you how small a thing
       this is.

       So the form no longer apologises. It says what the stamp is, and
       a business that stamps its paperwork is told it can print the
       page and stamp it. The marine, windscreen and personal accident
       forms carry no stamp line at all and say nothing.

       This text is ours, not ICB's, which is why it is here and not in
       LEGAL. */
    stampNote: {
      en: "ICB's printed form has a space for a stamp beside the signature. That is a business's rubber stamp, for a claimant signing on behalf of a company. If you are signing for yourself, your signature is all that is needed. A business that stamps its paperwork can print the completed form and stamp it.",
      es: "El formulario impreso de ICB tiene un espacio para un sello junto a la firma. Se trata del sello de goma de una empresa, para quien firma en nombre de una compañía. Si firma por su cuenta, basta con su firma. Una empresa que sella sus documentos puede imprimir el formulario completado y sellarlo."
    },
    stampLine: {
      en: "ICB's printed form has a space for a company stamp beside the signature, for a claimant signing on behalf of a business. This form was signed on a device. A business that stamps its paperwork can print this page and stamp it.",
      es: "El formulario impreso de ICB tiene un espacio para el sello de la empresa junto a la firma, para quien firma en nombre de un negocio. Este formulario se firmó en un dispositivo. Una empresa que sella sus documentos puede imprimir esta página y sellarla."
    },

    /* What a claimant may attach. Named rather than left open, because a
       claimant who is told what is wanted sends it the first time. */
    attachmentHint: {
      motor: { en: "Photographs of the damage, the police report, and an estimate of repairs.", es: "Fotografías de los daños, el informe policial y un estimado de la reparación." },
      property: { en: "Photographs of the damage, a tradesman's estimate, and the police report where one was made.", es: "Fotografías de los daños, un estimado de un contratista y el informe policial si se hizo uno." },
      marine: { en: "Photographs of the vessel showing damaged areas, the police report, the report from the Belize Port Authority, and invoices or estimates for repairs and parts.", es: "Fotografías de la embarcación mostrando las áreas dañadas, el informe policial, el informe de la Autoridad Portuaria de Belice, y facturas o estimados de reparación y repuestos." },
      windscreen: { en: "Photographs of the damaged glass, and the proforma invoice or estimate, which ICB's form asks to be attached.", es: "Fotografías del cristal dañado y la factura proforma o el estimado, que el formulario de ICB pide adjuntar." },
      cargo: { en: "A copy of the policy of insurance, a copy of the contract of carriage, and documentary evidence showing the extent of the loss or damage. Photographs of the damage help too.", es: "Copia de la póliza de seguro, copia del contrato de transporte y pruebas documentales que muestren la magnitud de la pérdida o el daño. Las fotografías del daño también ayudan." },
      liability: { en: "Photographs of the damage or injury, any police report, and estimates or invoices for the damage claimed.", es: "Fotografías del daño o la lesión, cualquier informe policial, y estimados o facturas por los daños reclamados." },
      accident: { en: "The itemized medical bill, medical reports, and receipts for anything you have already paid. ICB's form says the physician's section may be left blank if an itemized bill is attached.", es: "La factura médica detallada, los informes médicos y los recibos de lo que ya haya pagado. El formulario de ICB indica que la sección del médico puede dejarse en blanco si se adjunta una factura detallada." }
    },

    forms: [
      /* ================================================================
         1. INSURED MOTOR ACCIDENT REPORT FORM
         ================================================================ */
      {
        id: "motor",
        pathway: "motor",
        stamp: true,
        pdfTitle: "INSURED MOTOR ACCIDENT REPORT FORM",
        title: { en: "Insured Motor Accident Report Form", es: "Formulario de reporte de accidente, asegurado" },
        lead: { en: "For an ICB policyholder reporting an accident involving an insured vehicle.", es: "Para un asegurado de ICB que reporta un accidente con un vehículo asegurado." },
        release: "medicalRelease",
        declaration: "declaration",
        steps: [
          {
            id: "insured",
            title: { en: "Insured's name and address", es: "Nombre y dirección del asegurado" },
            fields: [
              f("insuredName", "text", "Name", "Nombre", { req: true }),
              half("insuredDob", "date", "Date of birth", "Fecha de nacimiento"),
              half("insuredPhone", "tel", "Phone", "Teléfono", { req: true }),
              f("insuredAddress", "long", "Home Address", "Dirección residencial", { req: true }),
              half("insuredOccupation", "text", "Business / Occupation", "Negocio / Ocupación"),
              half("insuredEmployer", "text", "Employer", "Empleador"),
              f("insuredBusinessAddress", "long", "Business Address", "Dirección del negocio"),
              half("insuredBusinessPhone", "tel", "Business phone", "Teléfono del negocio"),
              half("insuredEmail", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } })
            ]
          },
          {
            id: "insurance",
            title: { en: "Particulars of insurance", es: "Datos del seguro" },
            fields: [
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("renewalDate", "date", "Renewal Date", "Fecha de renovación"),
              half("periodOfCover", "text", "Period of Cover", "Período de cobertura"),
              half("typeOfCover", "text", "Type of Cover", "Tipo de cobertura"),
              f("otherPolicy", "text", "Is there any other policy in force covering this vehicle?", "¿Hay alguna otra póliza vigente que cubra este vehículo?"),
              f("valuation", "long", "State whether or not a Valuation / Inspection was done at renewal or inception. If yes, by whom?", "Indique si se hizo una valuación o inspección en la renovación o al inicio. Si fue así, ¿por quién?")
            ]
          },
          {
            id: "vehicle",
            title: { en: "Particulars of vehicle", es: "Datos del vehículo" },
            fields: [
              half("vehYear", "text", "Year", "Año"),
              half("vehMake", "text", "Make", "Marca"),
              half("vehModel", "text", "Model / Type", "Modelo / Tipo"),
              half("vehReg", "text", "Registration No.", "Número de matrícula", { req: true }),
              half("vehColour", "text", "Colour", "Color"),
              half("vehMileage", "text", "Current Mileage", "Millaje actual"),
              f("vehUnrepaired", "text", "Was there any unrepaired damage?", "¿Había algún daño sin reparar?"),
              f("vehUnrepairedDetails", "long", "If so, give details", "Si fue así, dé los detalles"),
              f("vehLicenceType", "text", "Type of Road License, i.e. whether Private, Taxi, Trailer, Motor Cycle, Goods, etc.", "Tipo de licencia vial, por ejemplo privada, taxi, remolque, motocicleta, carga, etc."),
              f("vehFinance", "long", "Name and Address of any Bank or Company financially interested in the vehicle", "Nombre y dirección de cualquier banco o empresa con interés financiero en el vehículo")
            ]
          },
          {
            id: "use",
            title: { en: "Particulars of use", es: "Datos del uso" },
            fields: [
              f("usePurpose", "long", "State specifically the purpose for which the vehicle was being used at the time of the accident. (Be specific)", "Indique específicamente para qué se usaba el vehículo al momento del accidente. (Sea específico)"),
              half("useGoods", "text", "Were goods being carried?", "¿Se transportaba mercancía?"),
              f("useGoodsDetail", "text", "If so, state the nature of the goods and weight of the load", "Si fue así, indique la naturaleza de la mercancía y el peso de la carga"),
              half("useOccupants", "number", "How many persons including the driver were in the vehicle?", "¿Cuántas personas, incluido el conductor, había en el vehículo?"),
              half("useFee", "text", "Were they charged a fee to be transported?", "¿Se les cobró una tarifa por el transporte?"),
              f("useAuthority", "long", "If the vehicle was being driven by a person other than the Insured, with whose authority was it being used?", "Si el vehículo era conducido por alguien que no es el asegurado, ¿con la autorización de quién se usaba?"),
              f("useRelationship", "text", "What is the relationship of the driver with the Policyholder?", "¿Cuál es la relación del conductor con el titular de la póliza?"),
              f("usePolicyholderPresent", "text", "Was the Policyholder in the vehicle when the accident took place?", "¿Estaba el titular de la póliza en el vehículo cuando ocurrió el accidente?")
            ]
          },
          {
            id: "driver",
            title: { en: "Particulars of person driving", es: "Datos de la persona que conducía" },
            fields: [
              f("driverName", "text", "Driver's Name", "Nombre del conductor", { req: true }),
              half("driverDob", "date", "Date of birth", "Fecha de nacimiento"),
              half("driverPhone", "tel", "Phone", "Teléfono"),
              f("driverAddress", "long", "Address", "Dirección"),
              half("driverOccupation", "text", "Occupation (Specify)", "Ocupación (especifique)"),
              half("driverEmployer", "text", "Employer / Business", "Empleador / Negocio"),
              half("driverLicenceNo", "text", "Driver's License No.", "Número de licencia de conducir"),
              half("driverLicenceIssued", "date", "Date issued", "Fecha de emisión"),
              half("driverLicenceType", "text", "Type of License", "Tipo de licencia"),
              f("driverLicenceClasses", "text", "Classes of vehicles specified in the license", "Clases de vehículos especificadas en la licencia"),
              f("driverEmployed", "text", "Is he employed by you?", "¿Está empleado por usted?"),
              f("driverConvicted", "text", "Have you ever been convicted of any motor vehicle offence?", "¿Ha sido condenado alguna vez por una infracción de tránsito?"),
              f("driverConvictedDetail", "long", "If so, give full particulars", "Si fue así, dé todos los detalles"),
              half("driverAtFault", "yesno", "Do you think you were at fault in this accident?", "¿Cree que usted tuvo la culpa en este accidente?"),
              half("driverSeatbelt", "yesno", "Were you wearing your seatbelt?", "¿Llevaba puesto el cinturón de seguridad?"),
              f("driverHealth", "text", "Have you suffered from Diabetes, Fits or any Heart complaint or any physical or mental defect or infirmity?", "¿Ha padecido de diabetes, convulsiones, alguna afección cardíaca o cualquier defecto o enfermedad física o mental?"),
              f("driverHealthDetail", "long", "If so, give full particulars", "Si fue así, dé todos los detalles"),
              f("driverRefused", "text", "Has any Insurance Company or Underwriter refused or declined to continue any motor insurance for you?", "¿Alguna compañía de seguros o asegurador le ha rechazado o se ha negado a continuar un seguro de vehículo?")
            ]
          },
          {
            id: "accident",
            title: { en: "Particulars of accident", es: "Datos del accidente" },
            fields: [
              half("accDate", "date", "Date of accident", "Fecha del accidente", { req: true }),
              half("accTime", "time", "Time", "Hora", { req: true }),
              f("accPlace", "long", "Place where the accident occurred", "Lugar donde ocurrió el accidente", { req: true }),
              f("accReported", "text", "Was the accident reported to the Police? If so, please state", "¿Se reportó el accidente a la policía? Si fue así, indique"),
              half("accReportedDate", "date", "Date reported", "Fecha del reporte"),
              half("accReportedTime", "time", "Time reported", "Hora del reporte"),
              f("accAttended", "text", "Whether they attended the scene", "Si acudieron al lugar"),
              f("accStation", "text", "Address of Police Station", "Dirección de la estación de policía"),
              f("accOfficer", "text", "Name and Number of Investigating Officer", "Nombre y número del oficial investigador"),
              half("accWarnedYou", "text", "Were you warned for prosecution?", "¿Se le advirtió de un proceso judicial?"),
              half("accWarnedOther", "text", "Was the other Driver warned for prosecution?", "¿Se le advirtió al otro conductor de un proceso judicial?"),
              half("accSpeed", "text", "Approximate speed of vehicle at time of accident (M.P.H.)", "Velocidad aproximada del vehículo al momento del accidente (M.P.H.)"),
              half("accLamps", "text", "What Lamps were lit on the vehicle?", "¿Qué luces del vehículo estaban encendidas?"),
              half("accVisibility", "text", "Was the visibility good?", "¿Había buena visibilidad?"),
              half("accWet", "text", "Was the pavement wet?", "¿Estaba mojado el pavimento?")
            ]
          },
          {
            id: "own-damage",
            title: { en: "Damage to own vehicle", es: "Daños al propio vehículo" },
            fields: [
              f("ownDamaged", "text", "Was the vehicle damaged?", "¿Sufrió daños el vehículo?"),
              f("ownDamageNature", "long", "Nature of damage", "Naturaleza del daño"),
              half("ownRepairCost", "money", "What is the approximate cost of the repairs?", "¿Cuál es el costo aproximado de las reparaciones?"),
              half("ownWhere", "text", "Where is the vehicle now?", "¿Dónde está el vehículo ahora?"),
              f("ownRepairers", "text", "Who are the repairers?", "¿Quiénes son los reparadores?"),
              note(LEGAL.motorEstimate, "EN TODOS LOS CASOS EN QUE SU VEHÍCULO SUFRA DAÑOS Y USTED TENGA DERECHO A RECLAMAR BAJO LA PÓLIZA, ENVÍE DE INMEDIATO A LA COMPAÑÍA UN ESTIMADO DE LAS REPARACIONES.")
            ]
          },
          {
            id: "passengers",
            title: { en: "Passengers in the insured's vehicle", es: "Pasajeros en el vehículo del asegurado" },
            fields: [
              f("passengers", "table", "Particulars of passengers in Insured's vehicle", "Datos de los pasajeros en el vehículo del asegurado",
                { cols: PASSENGER_COLS, rows: 5 })
            ]
          },
          {
            id: "third-parties",
            title: { en: "Third parties", es: "Terceros" },
            fields: [
              note({ en: "If any pedestrian, cyclist or property was involved, state:", es: "Si hubo algún peatón, ciclista o propiedad involucrada, indique:" }.en,
                   "Si hubo algún peatón, ciclista o propiedad involucrada, indique:"),
              f("tpName", "long", "Name and address", "Nombre y dirección"),
              f("tpInjury", "text", "Nature of injury, if any", "Naturaleza de la lesión, si la hubo"),
              f("tpCycle", "text", "Damage to cycle", "Daño a la bicicleta"),
              f("tpProperty", "long", "Damage to property", "Daño a la propiedad")
            ].concat(otherVehicle(1)).concat(otherVehicle(2))
          },
          {
            id: "witnesses",
            title: { en: "Witnesses", es: "Testigos" },
            fields: [
              f("witnesses", "table", "Give names and addresses of persons (other than passengers) who witnessed the accident, and state where they were when the accident occurred", "Dé nombres y direcciones de personas (que no sean pasajeros) que presenciaron el accidente, e indique dónde estaban cuando ocurrió",
                { cols: WITNESS_COLS, rows: 4 }),
              f("admission", "yesno", "Did the driver or owner sign a written admission of liability?", "¿Firmó el conductor o el propietario una admisión escrita de responsabilidad?")
            ]
          },
          {
            id: "statement",
            title: { en: "What happened", es: "Qué sucedió" },
            fields: [
              note("STATE FULLY WHAT HAPPENED AND SHOW BY SKETCH POSITIONS OF VEHICLES AT TIME OF ACCIDENT. STATEMENT TO BE COMPLETED BY DRIVER ONLY.",
                   "DESCRIBA COMPLETAMENTE LO QUE SUCEDIÓ Y MUESTRE CON UN DIBUJO LA POSICIÓN DE LOS VEHÍCULOS AL MOMENTO DEL ACCIDENTE. LA DECLARACIÓN DEBE SER COMPLETADA SOLO POR EL CONDUCTOR."),
              f("statement", "long", "State fully what happened", "Describa completamente lo que sucedió", { req: true, rows: 10 }),
              f("sketch", "sketch", "Sketch of the post collision position of the vehicles", "Dibujo de la posición de los vehículos después de la colisión",
                { h: { en: "Draw with your finger, or with the mouse on a computer.", es: "Dibuje con el dedo, o con el ratón en una computadora." } }),
              f("claimMade", "text", "Has any claim been made upon you?", "¿Se ha presentado algún reclamo en su contra?"),
              note(LEGAL.claimsNote, "No responda ninguna comunicación que reciba sobre el accidente; envíela de inmediato a la Compañía.")
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos",
                { hintKey: "motor" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signatures", es: "Declaración y firmas" },
            fields: [
              half("driverSignName", "text", "Name of Driver", "Nombre del conductor"),
              f("sigDriver", "signature", "Signature of Driver", "Firma del conductor"),
              half("insuredSignName", "text", "Name of Insured(s)", "Nombre del asegurado o asegurados"),
              f("sigInsured", "signature", "Signature of Insured(s)", "Firma del asegurado o asegurados", { req: true }),
              f("sigWitness", "signature", "Signature of Witness", "Firma del testigo")
            ]
          }
        ]
      },

      /* ================================================================
         2. CLAIMANT MOTOR ACCIDENT REPORT FORM
         ================================================================ */
      {
        id: "motor-third-party",
        pathway: "motor-third-party",
        stamp: true,
        pdfTitle: "CLAIMANT MOTOR ACCIDENT REPORT FORM",
        title: { en: "Claimant Motor Accident Report Form", es: "Formulario de reporte de accidente, reclamante" },
        lead: { en: "For a claimant involved in an accident with a vehicle insured by ICB.", es: "Para un reclamante involucrado en un accidente con un vehículo asegurado por ICB." },
        release: "medicalRelease",
        declaration: "declaration",
        steps: [
          {
            id: "accident",
            title: { en: "Particulars of accident", es: "Datos del accidente" },
            fields: [
              half("accDate", "date", "Date of accident", "Fecha del accidente", { req: true }),
              half("accTime", "time", "Time", "Hora", { req: true }),
              f("accPlace", "long", "Place where the accident occurred", "Lugar donde ocurrió el accidente", { req: true }),
              f("accReported", "text", "Was the accident reported to the Police? If so, please state", "¿Se reportó el accidente a la policía? Si fue así, indique"),
              half("accReportedDate", "date", "Date reported", "Fecha del reporte"),
              half("accReportedTime", "time", "Time reported", "Hora del reporte"),
              f("accAttended", "text", "Whether they attended the scene", "Si acudieron al lugar"),
              f("accStation", "text", "Address of Police Station", "Dirección de la estación de policía"),
              f("accOfficer", "text", "Name and Number of Investigating Officer", "Nombre y número del oficial investigador"),
              half("accWarnedYou", "text", "Were you warned for prosecution?", "¿Se le advirtió de un proceso judicial?"),
              half("accWarnedOther", "text", "Was the other Driver warned for prosecution?", "¿Se le advirtió al otro conductor de un proceso judicial?"),
              half("accSpeed", "text", "Approximate speed of vehicle at time of accident (M.P.H.)", "Velocidad aproximada del vehículo al momento del accidente (M.P.H.)"),
              half("accLamps", "text", "What Lamps were lit on the vehicle?", "¿Qué luces del vehículo estaban encendidas?"),
              half("accVisibility", "text", "Was the visibility good?", "¿Había buena visibilidad?"),
              half("accWet", "text", "Was the pavement wet?", "¿Estaba mojado el pavimento?"),
              half("atFault", "yesno", "Do you think you were at fault in this accident?", "¿Cree que usted tuvo la culpa en este accidente?"),
              half("seatbelt", "yesno", "Were you wearing your seatbelt?", "¿Llevaba puesto el cinturón de seguridad?")
            ]
          },
          {
            id: "claimant",
            title: { en: "Your details", es: "Sus datos" },
            fields: [
              f("claimantName", "text", "Name", "Nombre", { req: true }),
              half("claimantDob", "date", "Date of birth", "Fecha de nacimiento"),
              half("claimantPhone", "tel", "Phone", "Teléfono", { req: true }),
              f("claimantAddress", "long", "Home Address", "Dirección residencial", { req: true }),
              half("claimantOccupation", "text", "Business / Occupation", "Negocio / Ocupación"),
              half("claimantEmployer", "text", "Employer", "Empleador"),
              f("claimantBusinessAddress", "long", "Business Address", "Dirección del negocio"),
              half("claimantBusinessPhone", "tel", "Business phone", "Teléfono del negocio"),
              half("claimantEmail", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } })
            ]
          },
          {
            id: "your-damage",
            title: { en: "Damage or injury to you", es: "Daños o lesiones a usted" },
            fields: [
              note("If any pedestrian, cyclist or property involved state:", "Si hubo algún peatón, ciclista o propiedad involucrada, indique:"),
              f("invName", "long", "Name and address", "Nombre y dirección"),
              f("invInjury", "text", "Nature of injury, if any", "Naturaleza de la lesión, si la hubo"),
              f("invCycle", "text", "Damage to cycle", "Daño a la bicicleta"),
              f("invProperty", "long", "Damage to property", "Daño a la propiedad"),
              note("If a vehicle was involved state:", "Si hubo un vehículo involucrado, indique:"),
              half("myReg", "text", "Registration No.", "Número de matrícula"),
              half("myType", "text", "Type of vehicle", "Tipo de vehículo"),
              f("myOwner", "long", "Owner's name and address", "Nombre y dirección del propietario"),
              f("myFinance", "long", "Name and Address of any Bank or Company financially interested in the vehicle", "Nombre y dirección de cualquier banco o empresa con interés financiero en el vehículo"),
              f("myDriver", "long", "Driver's name and address", "Nombre y dirección del conductor"),
              half("myInsurer", "text", "Insurance Company", "Compañía de seguros"),
              half("myDamage", "text", "Nature of damage", "Naturaleza del daño"),
              half("myRepairCost", "money", "Approximate cost of repair", "Costo aproximado de la reparación"),
              half("myWhere", "text", "Where is the vehicle now?", "¿Dónde está el vehículo ahora?"),
              half("myRepairers", "text", "Who are the repairers?", "¿Quiénes son los reparadores?"),
              half("myPassengers", "number", "How many passengers were in the vehicle?", "¿Cuántos pasajeros había en el vehículo?"),
              f("myInjured", "text", "Were the persons in the vehicle injured?", "¿Resultaron heridas las personas del vehículo?"),
              note(LEGAL.claimantEstimate, "EN TODOS LOS CASOS EN QUE SU PROPIEDAD SUFRA DAÑOS O HAYA LESIONES PERSONALES Y USTED TENGA DERECHO A PRESENTAR UN RECLAMO BAJO LA PÓLIZA, ENVÍE DE INMEDIATO A LA COMPAÑÍA UN ESTIMADO DE REPARACIONES, INFORMES MÉDICOS Y GASTOS MÉDICOS.")
            ]
          },
          {
            id: "passengers",
            title: { en: "Passengers in the claimant's vehicle", es: "Pasajeros en el vehículo del reclamante" },
            fields: [
              f("passengers", "table", "Particulars of passengers in claimant's vehicle", "Datos de los pasajeros en el vehículo del reclamante",
                { cols: [
                  { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
                  { k: "address", l: { en: "Address", es: "Dirección" }, w: 3 },
                  { k: "occupation", l: { en: "Occupation", es: "Ocupación" }, w: 2 },
                  { k: "relationship", l: { en: "Relationship with the Insured", es: "Parentesco con el asegurado" }, w: 2 },
                  { k: "injury", l: { en: "Nature of injury, if any, and hospital attended", es: "Naturaleza de la lesión, si la hubo, y hospital donde se atendió" }, w: 4 }
                ], rows: 5 })
            ]
          },
          {
            id: "third-parties",
            title: { en: "Third parties", es: "Terceros" },
            fields: [
              note("If any pedestrian, cyclist or property involved state:", "Si hubo algún peatón, ciclista o propiedad involucrada, indique:"),
              f("tpName", "long", "Name and address", "Nombre y dirección"),
              f("tpInjury", "text", "Nature of injury, if any", "Naturaleza de la lesión, si la hubo"),
              f("tpCycle", "text", "Damage to cycle", "Daño a la bicicleta"),
              f("tpProperty", "long", "Damage to property", "Daño a la propiedad")
            ].concat(otherVehicle(1)).concat(otherVehicle(2))
          },
          {
            id: "witnesses",
            title: { en: "Witnesses", es: "Testigos" },
            fields: [
              f("witnesses", "table", "Give names and addresses of persons (other than passengers) who witnessed the accident, and state where they were when the accident occurred", "Dé nombres y direcciones de personas (que no sean pasajeros) que presenciaron el accidente, e indique dónde estaban cuando ocurrió",
                { cols: WITNESS_COLS, rows: 4 })
            ]
          },
          {
            id: "statement",
            title: { en: "What happened", es: "Qué sucedió" },
            fields: [
              note("STATE FULLY WHAT HAPPENED AND SHOW BY SKETCH POSITIONS OF VEHICLES AT TIME OF ACCIDENT. STATEMENT TO BE COMPLETED BY DRIVER ONLY.",
                   "DESCRIBA COMPLETAMENTE LO QUE SUCEDIÓ Y MUESTRE CON UN DIBUJO LA POSICIÓN DE LOS VEHÍCULOS AL MOMENTO DEL ACCIDENTE. LA DECLARACIÓN DEBE SER COMPLETADA SOLO POR EL CONDUCTOR."),
              f("statement", "long", "State fully what happened", "Describa completamente lo que sucedió", { req: true, rows: 10 }),
              f("sketch", "sketch", "Sketch of the post collision position of the vehicles", "Dibujo de la posición de los vehículos después de la colisión",
                { h: { en: "Draw with your finger, or with the mouse on a computer.", es: "Dibuje con el dedo, o con el ratón en una computadora." } })
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "motor" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signatures", es: "Declaración y firmas" },
            fields: [
              note("A parent or guardian may execute this form on behalf of a minor.", "Un padre, madre o tutor puede firmar este formulario en nombre de un menor."),
              half("claimantSignName", "text", "Name of Claimant(s)", "Nombre del reclamante o reclamantes"),
              f("sigClaimant", "signature", "Signature of Claimant(s)", "Firma del reclamante o reclamantes", { req: true }),
              f("sigDriver", "signature", "Signature of Driver", "Firma del conductor"),
              f("sigWitness", "signature", "Signature of Witness", "Firma del testigo")
            ]
          }
        ]
      }
,

      /* ================================================================
         3. "PROPERTY" CLAIM FORM
         ================================================================ */
      {
        id: "property",
        pathway: "property",
        stamp: true,
        pdfTitle: "“PROPERTY” CLAIM FORM",
        title: { en: "Property Claim Form", es: "Formulario de reclamo de propiedad" },
        lead: { en: "For loss or damage at a property insured with ICB.", es: "Por pérdida o daño en una propiedad asegurada con ICB." },
        release: "propertyRelease",
        declaration: "propertyDeclaration",
        steps: [
          {
            id: "policy",
            title: { en: "Policy and insured", es: "Póliza y asegurado" },
            fields: [
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("sumInsured", "money", "Sum Insured", "Suma asegurada"),
              half("insuredName", "text", "Name of Insured", "Nombre del asegurado", { req: true }),
              half("contactNumber", "tel", "Contact Number", "Número de contacto", { req: true }),
              half("insuredEmail", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } })
            ]
          },
          {
            id: "loss",
            title: { en: "The loss", es: "La pérdida" },
            fields: [
              half("lossDate", "date", "When did the damage or loss take place? Date", "¿Cuándo ocurrió el daño o la pérdida? Fecha", { req: true }),
              half("lossTime", "time", "Time", "Hora"),
              f("premisesAddress", "long", "Address of the premises where the damage or loss occurred", "Dirección del local donde ocurrió el daño o la pérdida", { req: true }),
              f("occupancy", "long", "For what purpose (e.g. Private dwelling, Shop, Factory, etc.) were the premises occupied at the time of the damage or loss?", "¿Con qué fin (por ejemplo vivienda particular, tienda, fábrica, etc.) se ocupaba el local al momento del daño o la pérdida?"),
              f("alteration", "long", "If any alteration in risk had taken place since the policy was issued or last endorsed, please give details", "Si hubo algún cambio en el riesgo desde que se emitió o endosó la póliza por última vez, dé los detalles"),
              f("cause", "long", "What was the cause of the damage or loss, and how did it occur?", "¿Cuál fue la causa del daño o la pérdida, y cómo ocurrió?", { req: true, rows: 8 })
            ]
          },
          {
            id: "ownership",
            title: { en: "Ownership and other insurance", es: "Propiedad y otros seguros" },
            fields: [
              f("soleOwner", "text", "Does the property in respect of which the claim is being made belong solely to you?", "¿La propiedad por la que se hace este reclamo le pertenece únicamente a usted?"),
              f("otherParty", "long", "If not, please give full name of any other party interested therein", "Si no, dé el nombre completo de cualquier otra parte con interés en ella"),
              f("otherInsurance", "text", "Are there any other insurances on the property, whether effected by you or any other party?", "¿Existen otros seguros sobre la propiedad, contratados por usted o por cualquier otra parte?"),
              f("otherInsuranceDetail", "long", "If so, please give name of Company, Policy No. and amount insured, if known", "Si es así, dé el nombre de la compañía, el número de póliza y el monto asegurado, si lo conoce"),
              f("priorLoss", "text", "Have you previously suffered loss from a similar cause in these or other premises?", "¿Ha sufrido antes una pérdida por una causa similar en este u otro local?"),
              f("priorLossDetail", "long", "If so, please give details", "Si es así, dé los detalles")
            ]
          },
          {
            id: "steps-taken",
            title: { en: "Steps taken", es: "Medidas tomadas" },
            fields: [
              note("I/We have taken all practical steps concerning the property lost, damaged or destroyed:",
                   "Yo/Nosotros hemos tomado todas las medidas prácticas respecto a la propiedad perdida, dañada o destruida:"),
              f("stepsPrevent", "long", "To prevent further loss, damage or destruction", "Para evitar más pérdidas, daños o destrucción"),
              f("stepsRecover", "long", "To trace or recover lost or stolen property", "Para localizar o recuperar la propiedad perdida o robada"),
              f("stepsApprehend", "long", "To secure the apprehension and/or conviction of any person(s) responsible for such loss, damage or destruction", "Para lograr la detención y/o condena de la persona o personas responsables de dicha pérdida, daño o destrucción"),
              note(LEGAL.policeNote, "Toda pérdida, daño o destrucción que involucre o se deba a un acto delictivo debe reportarse a la policía."),
              f("policeStation", "long", "Address of Station and No. of Police taking report", "Dirección de la estación y número del policía que tomó el reporte")
            ]
          },
          {
            id: "contents",
            title: { en: "Building and contents", es: "Edificio y contenido" },
            fields: [
              note(LEGAL.buildingNote, "EDIFICIO: El reclamo debe ir acompañado de un estimado de un contratista, obtenido a costa del asegurado, del costo de dejar el edificio en el mismo estado en que estaba inmediatamente antes del daño. No deben incluirse mejoras en ese estimado."),
              note(LEGAL.contentsNote, "CONTENIDO: Es esencial dar una lista completa de los artículos destruidos o dañados, con los datos indicados abajo. En el caso de mercancía, el \"valor estimado inmediatamente antes del daño\" (columna 5) no debe exceder el valor antes de la venta, es decir, no debe basarse en el precio de venta."),
              f("estimateAttached", "yesno", "Estimate attached (cost of repairs or replacement)", "Estimado adjunto (costo de reparación o reemplazo)"),
              f("contents", "table", "Articles destroyed or damaged", "Artículos destruidos o dañados",
                { cols: CONTENTS_COLS, rows: 8 })
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "property" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signatures", es: "Declaración y firmas" },
            fields: [
              f("sigInsured", "signature", "Signature of Insured(s)", "Firma del asegurado o asegurados", { req: true }),
              f("sigWitness", "signature", "Signature of Witness", "Firma del testigo")
            ]
          }
        ]
      },

      /* ================================================================
         4. PROPERTY CATASTROPHE CLAIM FORM (the hurricane form)
         ================================================================ */
      {
        id: "hurricane",
        pathway: "hurricane",
        stamp: true,
        pdfTitle: "PROPERTY CATASTROPHE CLAIM FORM",
        title: { en: "Hurricane Claim Form", es: "Formulario de reclamo por huracán" },
        lead: { en: "For property loss or damage following a hurricane.", es: "Por pérdida o daño a la propiedad después de un huracán." },
        release: "propertyRelease",
        declaration: "propertyDeclaration",
        steps: [
          {
            id: "general",
            title: { en: "General information", es: "Información general" },
            fields: [
              f("insuredName", "text", "Name of Insured", "Nombre del asegurado", { req: true }),
              f("insuredAddress", "long", "Address of Insured", "Dirección del asegurado", { req: true }),
              f("lossLocation", "long", "Loss Location", "Lugar de la pérdida", { req: true }),
              f("directions", "long", "Direction to above", "Cómo llegar al lugar anterior"),
              f("policyDetails", "table", "Policy details", "Datos de la póliza",
                { cols: [
                  { k: "policy", l: { en: "Policy Number", es: "Número de póliza" }, w: 3 },
                  { k: "description", l: { en: "Description", es: "Descripción" }, w: 5 },
                  { k: "sum", l: { en: "Sum Insured", es: "Suma asegurada" }, w: 3 }
                ], rows: 3 }),
              half("contactPerson", "text", "Contact person", "Persona de contacto"),
              half("contactHome", "tel", "Contact number, home", "Número de contacto, casa"),
              half("contactPhone", "tel", "Telephone", "Teléfono", { req: true }),
              half("contactEmail", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } }),
              f("financialInterest", "long", "Name and Address of any Bank or Company financially interested in the property", "Nombre y dirección de cualquier banco o empresa con interés financiero en la propiedad")
            ]
          },
          {
            id: "occurrence",
            title: { en: "The occurrence", es: "El suceso" },
            fields: [
              half("lossDate", "date", "Date of occurrence", "Fecha del suceso", { req: true }),
              half("lossTime", "time", "Time of occurrence", "Hora del suceso"),
              f("causeOfLoss", "text", "Cause of Loss", "Causa de la pérdida", { req: true }),
              f("damageAreas", "checks", "Damage", "Daños",
                { opts: [
                  { v: "Roof", l: { en: "Roof", es: "Techo" } },
                  { v: "Contents", l: { en: "Contents", es: "Contenido" } },
                  { v: "Wall", l: { en: "Wall", es: "Pared" } },
                  { v: "Other", l: { en: "Other", es: "Otro" } }
                ] }),
              f("damageOther", "text", "If other, please state", "Si es otro, indique cuál"),
              f("otherInsurance", "yesno", "Are there any other insurances on the property, whether effected by you or any other party?", "¿Existen otros seguros sobre la propiedad, contratados por usted o por cualquier otra parte?"),
              f("otherInsuranceDetail", "long", "If so, please give name of Company, Policy No. and amount insured, if known", "Si es así, dé el nombre de la compañía, el número de póliza y el monto asegurado, si lo conoce"),
              f("cause", "long", "What was the cause of the damage or loss, and how did it occur?", "¿Cuál fue la causa del daño o la pérdida, y cómo ocurrió?", { req: true, rows: 8 }),
              f("stepsPrevent", "yesno", "I/We have taken all practical steps concerning the property lost, damaged or destroyed to prevent further loss, damage or destruction", "Yo/Nosotros hemos tomado todas las medidas prácticas respecto a la propiedad perdida, dañada o destruida para evitar más pérdidas, daños o destrucción"),
              f("stepsPreventDetail", "long", "Details", "Detalles")
            ]
          },
          {
            id: "contents",
            title: { en: "Building and contents", es: "Edificio y contenido" },
            fields: [
              note(LEGAL.buildingNote, "EDIFICIO: El reclamo debe ir acompañado de un estimado de un contratista, obtenido a costa del asegurado, del costo de dejar el edificio en el mismo estado en que estaba inmediatamente antes del daño. No deben incluirse mejoras en ese estimado."),
              note(LEGAL.contentsNote, "CONTENIDO: Es esencial dar una lista completa de los artículos destruidos o dañados, con los datos indicados abajo. En el caso de mercancía, el \"valor estimado inmediatamente antes del daño\" (columna 5) no debe exceder el valor antes de la venta, es decir, no debe basarse en el precio de venta."),
              f("estimateAttached", "yesno", "Estimate attached (cost of repairs or replacement)", "Estimado adjunto (costo de reparación o reemplazo)"),
              f("contents", "table", "Articles destroyed or damaged", "Artículos destruidos o dañados",
                { cols: CONTENTS_COLS, rows: 8 })
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "property" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signatures", es: "Declaración y firmas" },
            fields: [
              f("sigInsured", "signature", "Signature of Insured(s)", "Firma del asegurado o asegurados", { req: true }),
              f("sigWitness", "signature", "Signature of Witness", "Firma del testigo")
            ]
          }
        ]
      },

      /* ================================================================
         5. MARINE CLAIMANT FORM
         ================================================================ */
      {
        id: "marine",
        pathway: "marine",
        pdfTitle: "Marine Claimant Form",
        title: { en: "Marine Claimant Form", es: "Formulario de reclamante marítimo" },
        lead: { en: "For loss or damage involving a vessel insured with ICB.", es: "Por pérdida o daño de una embarcación asegurada con ICB." },
        release: "propertyRelease",
        declaration: null,
        closing: "marineFacts",
        steps: [
          {
            id: "notice",
            title: { en: "Before you start", es: "Antes de empezar" },
            fields: [
              note("NOTICE TO CLAIMANT: For the processing of a claim the following will be needed in the event of Property Damage: 1. Photographs of the vessel showing damaged areas. 2. Police Report. 3. Report from Belize Port Authority. 4. Invoice or estimate for repairs. 5. Invoice or estimate detailing parts needed for repairs showing prices.",
                   "AVISO AL RECLAMANTE: Para procesar un reclamo se necesitará lo siguiente en caso de daño a la propiedad: 1. Fotografías de la embarcación mostrando las áreas dañadas. 2. Informe policial. 3. Informe de la Autoridad Portuaria de Belice. 4. Factura o estimado de la reparación. 5. Factura o estimado que detalle los repuestos necesarios con sus precios.")
            ]
          },
          {
            id: "claimant",
            title: { en: "To be completed by claimant", es: "A completar por el reclamante" },
            fields: [
              f("claimantName", "text", "Name", "Nombre", { req: true }),
              f("claimantAddress", "long", "Address", "Dirección", { req: true }),
              half("claimantPhone", "tel", "Telephone No.", "Número de teléfono", { req: true }),
              half("claimantAge", "text", "Age", "Edad"),
              half("claimantEmail", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } }),
              half("accidentDate", "date", "Date of Accident", "Fecha del accidente", { req: true }),
              half("vesselName", "text", "Vessel Name", "Nombre de la embarcación", { req: true }),
              half("embarkation", "text", "Point of Embarkation", "Punto de embarque"),
              half("disembarkation", "text", "Point of Disembarkation", "Punto de desembarque")
            ]
          },
          {
            id: "statement",
            title: { en: "Owner's or operator's statement of loss", es: "Declaración de pérdida del propietario u operador" },
            fields: [
              half("todayDate", "date", "Today's date", "Fecha de hoy"),
              half("todayTime", "time", "At", "A las"),
              f("declarantName", "text", "I, (name)", "Yo, (nombre)", { req: true }),
              f("ownerOrOperator", "select", "am the", "soy el",
                { opts: [
                  { v: "Owner", l: { en: "Owner of the vessel", es: "Propietario de la embarcación" } },
                  { v: "Operator", l: { en: "Operator of the vessel", es: "Operador de la embarcación" } },
                  { v: "Owner and operator", l: { en: "Owner and operator", es: "Propietario y operador" } }
                ] }),
              f("hullReg", "text", "Hull Registration / Documentation No.", "Número de registro o documentación del casco"),
              f("declarantAddress", "long", "My address is", "Mi dirección es"),
              half("incidentDate", "date", "On the (date)", "El día (fecha)", { req: true }),
              half("incidentTime", "time", "At approximately", "Aproximadamente a las"),
              f("incidentPlace", "long", "While located at", "Encontrándose en"),
              f("circumstances", "long", "The above vessel and/or person(s) met with an accident, or injury, the circumstances of which are in detail as follows", "La embarcación y/o la persona o personas sufrieron un accidente o lesión, cuyas circunstancias en detalle son las siguientes", { req: true, rows: 8 }),
              f("operatingPerson", "text", "At the time of the accident, who was operating the vessel?", "Al momento del accidente, ¿quién operaba la embarcación?"),
              f("vesselDamage", "long", "The damage directly caused to said vessel by this accident is as follows. Describe in detail all parts of the vessel which were damaged and the extent of the damage, or attach survey if available", "El daño causado directamente a dicha embarcación por este accidente es el siguiente. Describa en detalle todas las partes dañadas y la magnitud del daño, o adjunte el peritaje si lo tiene", { rows: 6 }),
              f("damageSeenAt", "long", "The damage to said vessel may be seen at", "El daño a dicha embarcación puede verse en"),
              half("repairEstimate", "money", "Cost of repairs has been estimated at (attach written estimate)", "El costo de las reparaciones se ha estimado en (adjunte el estimado por escrito)")
            ]
          },
          {
            id: "others",
            title: { en: "Damage to others", es: "Daños a terceros" },
            fields: [
              f("others", "table", "As a result of this accident, damage was caused to other vessels or property, or injury to persons, as follows. If no damage or injuries, indicate by N/A", "Como resultado de este accidente se causaron daños a otras embarcaciones o propiedades, o lesiones a personas, como sigue. Si no hubo daños ni lesiones, indique N/A",
                { cols: [
                  { k: "name", l: { en: "Name and Address", es: "Nombre y dirección" }, w: 4 },
                  { k: "type", l: { en: "Type of damage or injury", es: "Tipo de daño o lesión" }, w: 4 },
                  { k: "amount", l: { en: "Estimated Amount", es: "Monto estimado" }, w: 2 }
                ], rows: 4 }),
              f("witnesses", "table", "List the names and permanent address of witnesses, including passengers and crew (attach statements)", "Liste los nombres y la dirección permanente de los testigos, incluidos pasajeros y tripulación (adjunte las declaraciones)",
                { cols: [
                  { k: "name", l: { en: "Witness", es: "Testigo" }, w: 3 },
                  { k: "address", l: { en: "Address / Phone Number", es: "Dirección / Número de teléfono" }, w: 6 }
                ], rows: 4 })
            ]
          },
          {
            id: "encumbrances",
            title: { en: "Ownership and other insurance", es: "Propiedad y otros seguros" },
            fields: [
              f("ownerAtLoss", "text", "At the time of loss the vessel was owned by", "Al momento de la pérdida la embarcación era propiedad de"),
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("issuedBy", "text", "Issued by", "Emitida por"),
              f("encumbrances", "long", "List any encumbrances (liens or mortgages) and other insurance policies, or state that there are none", "Liste cualquier gravamen (embargo o hipoteca) y otras pólizas de seguro, o indique que no hay ninguno")
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "marine" })
            ]
          },
          {
            id: "sign",
            title: { en: "Signature", es: "Firma" },
            fields: [
              note(LEGAL.marineFacts, "TODOS LOS HECHOS IMPORTANTES PARA LA CUESTIÓN DE LA RESPONSABILIDAD DEL SEGURO ESTÁN INDICADOS ARRIBA O ADJUNTOS, Y NINGÚN HECHO SE HA OMITIDO. (NOTA: EN CASO DE COLISIÓN DEBE ADJUNTARSE UN DIAGRAMA QUE MUESTRE CÓMO OCURRIÓ.) NI LA ENTREGA DE ESTE FORMULARIO NI LA ACEPTACIÓN DE LAS DECLARACIONES COMPLETADAS POR PARTE DE LA CORPORACIÓN DE SEGUROS CONSTITUYE UNA ADMISIÓN DE RESPONSABILIDAD POR PARTE DE DICHA CORPORACIÓN."),
              f("sigCapacity", "text", "State whether owner, operator, etc.", "Indique si es propietario, operador, etc."),
              f("sigClaimant", "signature", "Signed", "Firmado", { req: true }),
              f("collisionDiagram", "sketch", "In case of collision, a diagram showing how it happened", "En caso de colisión, un diagrama que muestre cómo ocurrió",
                { h: { en: "Draw with your finger, or with the mouse on a computer.", es: "Dibuje con el dedo, o con el ratón en una computadora." } })
            ]
          }
        ]
      },

      /* ================================================================
         6. WINDSCREEN CLAIM FORM
         ================================================================ */
      {
        id: "windscreen",
        pathway: "windscreen",
        pdfTitle: "WINDSCREEN CLAIM FORM",
        title: { en: "Windscreen Claim Form", es: "Formulario de reclamo de parabrisas" },
        lead: { en: "For damage to the glass of a vehicle insured with ICB.", es: "Por daños al cristal de un vehículo asegurado con ICB." },
        release: null,
        declaration: "windscreenDeclaration",
        steps: [
          {
            id: "insured",
            title: { en: "Insured's name and address", es: "Nombre y dirección del asegurado" },
            fields: [
              half("name", "text", "Name", "Nombre", { req: true }),
              half("occupation", "text", "Occupation", "Ocupación"),
              f("homeAddress", "long", "Home Address", "Dirección de residencia"),
              half("homePhone", "tel", "Telephone No.", "Número de teléfono", { req: true }),
              half("cellular", "tel", "Cellular No.", "Número de celular"),
              f("businessAddress", "long", "Business Address", "Dirección del trabajo"),
              half("businessPhone", "tel", "Telephone No. (business)", "Número de teléfono (trabajo)"),
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("email", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } }),
              half("driverName", "text", "Driver's Name", "Nombre del conductor"),
              half("licence", "text", "Licence Type / No.", "Tipo y número de licencia")
            ]
          },
          {
            id: "vehicle",
            title: { en: "Vehicle details", es: "Datos del vehículo" },
            fields: [
              half("makeModel", "text", "Make & Model", "Marca y modelo", { req: true }),
              half("year", "text", "Year", "Año"),
              half("registration", "text", "Registration #", "Número de matrícula", { req: true }),
              half("chassis", "text", "Chassis / VIN #", "Número de chasis o VIN")
            ]
          },
          {
            id: "claim",
            title: { en: "Claim details", es: "Datos del reclamo" },
            fields: [
              half("incidentDate", "date", "Date of incident", "Fecha del incidente", { req: true }),
              half("incidentTime", "time", "Time", "Hora"),
              f("where", "long", "Where did damage occur?", "¿Dónde ocurrió el daño?", { req: true }),
              f("otherDamage", "long", "Was there any other damage to the vehicle?", "¿Hubo algún otro daño al vehículo?"),
              half("estimate", "money", "Estimate of Repairs", "Estimado de la reparación"),
              f("repairer", "long", "Repairer's name & address", "Nombre y dirección del taller"),
              note("PLEASE ATTACH PROFORMA INVOICE / ESTIMATE TO THIS FORM.",
                   "POR FAVOR ADJUNTE LA FACTURA PROFORMA O EL ESTIMADO A ESTE FORMULARIO.")
            ]
          },
          {
            id: "damage",
            title: { en: "Damage details", es: "Detalles del daño" },
            fields: [
              f("howOccurred", "long", "Describe how damage occurred", "Describa cómo ocurrió el daño", { req: true, rows: 6 })
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "windscreen" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signatures", es: "Declaración y firmas" },
            fields: [
              note(LEGAL.windscreenDeclaration,
                   "Yo/Nosotros declaramos que los datos anteriores son verdaderos en todos sus aspectos."),
              f("sigInsured", "signature", "Insured's signature", "Firma del asegurado", { req: true }),
              half("insuredDate", "date", "Date", "Fecha"),
              /* ICB's form has a second signature line for the driver,
                 who is often not the policyholder. Left optional: a
                 policyholder who was driving signs once. */
              f("sigDriver", "signature", "Driver's signature", "Firma del conductor",
                { h: { en: "Only if the driver was someone other than the insured.", es: "Solo si el conductor fue una persona distinta del asegurado." } }),
              half("driverDate", "date", "Date", "Fecha")
            ]
          }
        ]
      },

      /* ================================================================
         7. INLAND CARGO CLAIM FORM
         ================================================================ */
      {
        id: "inland-cargo",
        pathway: "inland-cargo",
        stamp: true,
        pdfTitle: "INLAND CARGO CLAIM FORM",
        title: { en: "Inland Cargo Claim Form", es: "Formulario de reclamo de carga terrestre" },
        lead: { en: "For loss or damage to cargo or heavy equipment in transit within Belize.", es: "Por pérdida o daño a carga o equipo pesado en tránsito dentro de Belice." },
        release: null,
        declaration: "cargoDeclaration",
        steps: [
          {
            id: "insured",
            title: { en: "The insured", es: "El asegurado" },
            fields: [
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("name", "text", "Name", "Nombre", { req: true }),
              f("address", "long", "Address", "Dirección"),
              half("contact", "tel", "Contact No.", "Número de contacto", { req: true }),
              half("email", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } })
            ]
          },
          {
            id: "transit",
            title: { en: "Cargo (containerize) and heavy equipment", es: "Carga (contenedorizada) y equipo pesado" },
            fields: [
              f("fromTo", "text", "From / To", "Desde / Hasta", { req: true }),
              half("transportDate", "date", "Transport Date", "Fecha del transporte"),
              half("deliveryTaken", "date", "Date Delivery Taken", "Fecha en que se recibió la entrega"),
              half("arrivalDate", "date", "Date of Arrival", "Fecha de llegada")
            ]
          },
          {
            id: "loss",
            title: { en: "The loss", es: "La pérdida" },
            fields: [
              half("discoveredDate", "date", "Date loss / damage discovered", "Fecha en que se descubrió la pérdida o el daño", { req: true }),
              f("lossLocation", "text", "Location of Loss", "Lugar de la pérdida", { req: true })
            ]
          },
          {
            id: "consignee",
            title: { en: "Consignee and cargo", es: "Consignatario y carga" },
            fields: [
              f("consigneeName", "text", "Consignee's Name", "Nombre del consignatario"),
              f("consigneeAddress", "long", "Address", "Dirección"),
              f("consigneeContact", "tel", "Contact Numbers", "Números de contacto"),
              f("cargoDescription", "long", "Description of Cargo (containerize) & Heavy Equipment", "Descripción de la carga (contenedorizada) y el equipo pesado", { req: true, rows: 5 })
            ]
          },
          {
            id: "details",
            title: { en: "Details of loss or damage", es: "Detalles de la pérdida o el daño" },
            fields: [
              f("lossDetails", "long", "Details of loss / damage", "Detalles de la pérdida o el daño", { req: true, rows: 7 }),
              half("repairEstimate", "money", "Damage / Repair Estimate", "Estimado del daño o la reparación")
            ]
          },
          {
            id: "attachments",
            title: { en: "Documents to attach", es: "Documentos para adjuntar" },
            fields: [
              note(LEGAL.cargoAttachments,
                   "Los siguientes documentos deben adjuntarse al formulario completado: 1. Copia de la póliza de seguro. 2. Copia del contrato de transporte. 3. Pruebas documentales que muestren la magnitud de la pérdida o el daño."),
              f("attachments", "attachments", "Attach documents and photographs", "Adjunte documentos y fotografías", { hintKey: "cargo" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signature", es: "Declaración y firma" },
            fields: [
              note(LEGAL.cargoDeclaration,
                   "Por la presente declaro que los datos anteriores son verdaderos y correctos según mi leal saber y entender."),
              half("signDate", "date", "Date", "Fecha"),
              f("sigInsured", "signature", "Insured's Signature", "Firma del asegurado", { req: true })
            ]
          }
        ]
      },

      /* ================================================================
         8. PUBLIC LIABILITY INSURANCE CLAIM FORM
         ================================================================ */
      {
        id: "public-liability",
        pathway: "public-liability",
        stamp: true,
        pdfTitle: "PUBLIC LIABILITY INSURANCE CLAIM FORM",
        title: { en: "Public Liability Claim Form", es: "Formulario de reclamo de responsabilidad civil" },
        lead: { en: "For an accident where someone else was injured or their property damaged.", es: "Por un accidente en el que otra persona resultó lesionada o su propiedad dañada." },
        release: null,
        declaration: "liabilityDeclaration",
        steps: [
          {
            id: "notice",
            title: { en: "Before you start", es: "Antes de empezar" },
            fields: [
              note(LEGAL.liabilityNoAdmission,
                   "La Compañía no admite responsabilidad por el hecho de emitir este formulario.")
            ]
          },
          {
            id: "policy",
            title: { en: "The policy", es: "La póliza" },
            fields: [
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("lastPremiumDate", "date", "Date of payment of last premium", "Fecha de pago de la última prima"),
              f("insuredName", "text", "Name of Insured", "Nombre del asegurado", { req: true }),
              f("address", "long", "Address", "Dirección"),
              half("occupation", "text", "Occupation", "Ocupación"),
              half("contact", "tel", "Contact number for ICB to reply to", "Número de contacto para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } }),
              half("email", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form either.", es: "Tampoco aparece en el formulario impreso de ICB." } })
            ]
          },
          {
            id: "accident",
            title: { en: "The accident", es: "El accidente" },
            fields: [
              half("accidentDate", "date", "Date of Accident", "Fecha del accidente", { req: true }),
              half("accidentTime", "time", "Time", "Hora"),
              f("accidentPlace", "long", "Where did the accident occur?", "¿Dónde ocurrió el accidente?", { req: true }),
              f("accidentCause", "long", "Cause of Accident and the circumstances under which it arose", "Causa del accidente y las circunstancias en que se produjo", { req: true, rows: 7 })
            ]
          },
          {
            id: "witnesses",
            title: { en: "Witnesses", es: "Testigos" },
            fields: [
              f("witnesses", "table", "Names and Addresses of Witnesses", "Nombres y direcciones de los testigos",
                { cols: [
                  { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
                  { k: "address", l: { en: "Address", es: "Dirección" }, w: 6 }
                ], rows: 3 })
            ]
          },
          {
            id: "others",
            title: { en: "Who was hurt, and what was damaged", es: "Quién resultó herido y qué se dañó" },
            fields: [
              f("injuredParties", "table", "Names & Addresses of persons injured or whose property was damaged", "Nombres y direcciones de las personas lesionadas o cuya propiedad resultó dañada",
                { cols: [
                  { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
                  { k: "address", l: { en: "Address", es: "Dirección" }, w: 6 }
                ], rows: 3 }),
              f("bodilyInjuries", "long", "Full details of injuries sustained (bodily injuries)", "Detalles completos de las lesiones sufridas (lesiones corporales)", { rows: 5 }),
              f("propertyDamage", "long", "Full details of damage sustained (damage of property)", "Detalles completos de los daños sufridos (daños a la propiedad)", { rows: 5 })
            ]
          },
          {
            id: "attachments",
            title: { en: "Photographs and documents", es: "Fotografías y documentos" },
            fields: [
              f("attachments", "attachments", "Attach photographs and documents", "Adjunte fotografías y documentos", { hintKey: "liability" })
            ]
          },
          {
            id: "sign",
            title: { en: "Declaration and signature", es: "Declaración y firma" },
            fields: [
              note(LEGAL.liabilityDeclaration,
                   "POR LA PRESENTE DECLARO QUE LO ANTERIOR ES UNA DECLARACIÓN COMPLETA, VERDADERA Y EXACTA."),
              note(LEGAL.liabilityStamp,
                   "Si firma en nombre de una empresa, por favor estampe el sello oficial."),
              half("signDate", "date", "Date", "Fecha"),
              f("sigInsured", "signature", "Insured's signature", "Firma del asegurado", { req: true })
            ]
          }
        ]
      },

      /* ================================================================
         9. PERSONAL ACCIDENT CLAIM FORM

         Two statements on one form: the attending physician's and the
         policyholder's. ICB's own form says the physician's section may
         be completed OR an itemized bill attached, so it is asked here
         and plainly marked as the doctor's to fill, rather than left
         out or demanded of a claimant who cannot answer it.
         ================================================================ */
      {
        id: "personal-accident",
        pathway: "personal-accident",
        pdfTitle: "PERSONAL ACCIDENT CLAIM FORM",
        title: { en: "Personal Accident Claim Form", es: "Formulario de reclamo de accidente personal" },
        lead: { en: "For medical costs after an accident, under a personal accident policy.", es: "Por gastos médicos tras un accidente, bajo una póliza de accidentes personales." },
        release: "personalAccidentRelease",
        declaration: null,
        steps: [
          {
            id: "policyholder",
            title: { en: "Policyholder's statement", es: "Declaración del titular de la póliza" },
            fields: [
              half("policyNo", "text", "Policy No.", "Número de póliza", { req: true }),
              half("premium", "money", "Premium", "Prima"),
              half("policyDate", "date", "Policy Date", "Fecha de la póliza"),
              half("dlp", "text", "D.L.P.", "D.L.P."),
              f("name", "text", "Name (as appears on Policy)", "Nombre (tal como aparece en la póliza)", { req: true }),
              half("age", "text", "Age", "Edad"),
              half("contact", "tel", "Contact Number", "Número de contacto", { req: true }),
              f("address", "long", "Address", "Dirección"),
              half("occupation", "text", "Occupation", "Ocupación"),
              half("premiumPayer", "text", "Premium Payer", "Quien paga la prima"),
              half("email", "email", "Email for ICB to reply to", "Correo para que ICB responda",
                   { h: { en: "Not on ICB's printed form. Used only so the claims team can reach you.", es: "No aparece en el formulario impreso de ICB. Solo para que el equipo de reclamos pueda contactarle." } })
            ]
          },
          {
            id: "accident",
            title: { en: "The accident", es: "El accidente" },
            fields: [
              f("howAndWhere", "long", "How and where did the accident happen", "Cómo y dónde ocurrió el accidente", { req: true, rows: 6 }),
              f("witnessesAny", "yesno", "Were there any witnesses?", "¿Hubo testigos?"),
              f("witnesses", "long", "If yes, give names and addresses", "Si los hubo, indique nombres y direcciones", { rows: 4 })
            ]
          },
          {
            id: "doctors",
            title: { en: "Doctors and past injuries", es: "Médicos y lesiones anteriores" },
            fields: [
              f("doctors", "table", "List below all the doctors you have seen for this condition", "Liste a continuación todos los médicos que ha consultado por esta condición",
                { cols: [
                  { k: "name", l: { en: "Name", es: "Nombre" }, w: 3 },
                  { k: "address", l: { en: "Address", es: "Dirección" }, w: 4 },
                  { k: "date", l: { en: "Date", es: "Fecha" }, w: 2 }
                ], rows: 4 }),
              f("pastInjuries", "long", "List below all other injuries as a result of an accident for which you have received medical treatment in the past 5 years", "Liste a continuación todas las demás lesiones por accidente por las que ha recibido tratamiento médico en los últimos 5 años", { rows: 5 })
            ]
          },
          {
            id: "physician",
            title: { en: "Attending physician's statement", es: "Declaración del médico tratante" },
            fields: [
              note("To be completed by your attending physician. This section may be left blank if an itemized bill is attached instead, which is what ICB's own form says.",
                   "A completar por su médico tratante. Esta sección puede dejarse en blanco si en su lugar se adjunta una factura detallada, que es lo que indica el propio formulario de ICB."),
              f("patientName", "text", "Patient's Name", "Nombre del paciente"),
              half("costConsultation", "money", "Consultation", "Consulta"),
              half("costMedicines", "money", "Medicines Supplied", "Medicamentos suministrados"),
              half("costUltrasound", "money", "Ultra Sound", "Ultrasonido"),
              half("costXray", "money", "X-ray", "Radiografía"),
              half("costEmergency", "money", "Emergency Room", "Sala de emergencias"),
              half("costOther", "money", "Other", "Otros"),
              half("costTotal", "money", "Total due", "Total adeudado"),
              f("diagnosis", "long", "Diagnosis (describe complications, if any)", "Diagnóstico (describa las complicaciones, si las hubo)", { rows: 5 }),
              half("accidentDate", "date", "Date Accident Occurred", "Fecha en que ocurrió el accidente"),
              half("firstConsultation", "date", "First consultation date", "Fecha de la primera consulta"),
              f("moreTreatment", "yesno", "Does the patient require additional treatment?", "¿El paciente requiere tratamiento adicional?"),
              f("moreTreatmentDates", "long", "If yes, give dates of additional treatment", "Si es así, indique las fechas del tratamiento adicional", { rows: 3 }),
              f("previousAccidents", "yesno", "Has there been any previous accidents?", "¿Ha habido accidentes anteriores?"),
              f("previousInjuries", "long", "If yes, describe injuries", "Si los hubo, describa las lesiones", { rows: 3 }),
              f("inpatient", "yesno", "Was patient confined as an inpatient in a hospital for this condition?", "¿El paciente estuvo internado en un hospital por esta condición?"),
              f("surgery", "text", "Type of surgical procedure performed, if any", "Tipo de procedimiento quirúrgico realizado, si lo hubo"),
              half("surgeryDate", "date", "Date of Surgery", "Fecha de la cirugía"),
              half("surgeryFee", "money", "Fee charged for surgery", "Honorarios cobrados por la cirugía"),
              f("physicianName", "text", "Physician's name", "Nombre del médico"),
              half("physicianDegree", "text", "Degree", "Título"),
              f("physicianAddress", "long", "Address", "Dirección"),
              f("sigPhysician", "signature", "Physician's signature", "Firma del médico"),
              half("physicianDate", "date", "Date", "Fecha")
            ]
          },
          {
            id: "attachments",
            title: { en: "Bills and medical documents", es: "Facturas y documentos médicos" },
            fields: [
              f("attachments", "attachments", "Attach the itemized bill and any medical documents", "Adjunte la factura detallada y cualquier documento médico", { hintKey: "accident" })
            ]
          },
          {
            id: "sign",
            title: { en: "Claim and authorization", es: "Reclamo y autorización" },
            fields: [
              note(LEGAL.personalAccidentRelease,
                   "El abajo firmante presenta el reclamo de beneficios y autoriza a cualquier médico, hospital u otra persona a divulgar y proporcionar a INSURANCE CORP. OF BELIZE LTD. o a sus representantes toda la información relativa a cualquier lesión, incluidos antecedentes médicos, consultas o tratamientos, y copias de todos los expedientes hospitalarios o médicos, para que se incluyan como parte de las pruebas del reclamo presentado a la Corporación. Queda entendido que la entrega de este formulario no constituye ni se considerará una admisión por parte de la Corporación de que existía seguro vigente, ni una renuncia a ninguno de los derechos de la Corporación a defenderse."),
              half("signDate", "date", "Date", "Fecha"),
              f("sigPolicyholder", "signature", "Policyholder's signature", "Firma del titular de la póliza", { req: true })
            ]
          },
          {
            id: "assignment",
            title: { en: "Assignment of medical benefit", es: "Cesión del beneficio médico" },
            fields: [
              note("Optional. Complete this only if you want ICB to pay the medical benefit directly to the provider who treated you, rather than to you.",
                   "Opcional. Complete esta sección solo si desea que ICB pague el beneficio médico directamente al proveedor que le atendió, en lugar de a usted."),
              half("servicesFrom", "date", "In consideration of the services rendered from", "En consideración de los servicios prestados desde"),
              half("servicesTo", "date", "to", "hasta"),
              half("assignPolicyNo", "text", "I hereby authorize payment of the medical benefits payable on Policy No.", "Por la presente autorizo el pago de los beneficios médicos pagaderos bajo la póliza n.º"),
              half("assignPayee", "text", "directly to", "directamente a"),
              note("but not to exceed the medical charges for these services. I understand I am financially responsible to the above for charges not covered by this assignment.",
                   "pero sin exceder los cargos médicos por dichos servicios. Entiendo que soy responsable financieramente ante dicho proveedor por los cargos no cubiertos por esta cesión."),
              half("assignDate", "date", "Date", "Fecha"),
              f("sigAssignment", "signature", "Policyholder's signature", "Firma del titular de la póliza")
            ]
          }
        ]
      }

    ]
  };
})();
