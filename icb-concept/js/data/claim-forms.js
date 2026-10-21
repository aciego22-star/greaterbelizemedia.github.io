/* ============================================================================
   ICB.DATA.claimForms — ICB's five claim forms, as structured fields.

   SOURCE: the five PDFs ICB supplied on 21 Oct 2026, which are also
   served for download from assets/forms. Every question below is taken
   from them. Nothing is added, reworded into a different question, or
   left out, because the thing a claimant signs here has to be the thing
   ICB's form asks.

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
   - Several forms ask for a stamp beside the signature. A stamp cannot
     be drawn on a phone. Today the completed PDF leaves the space and
     notes it; confirm what ICB wants instead.
   - The Spanish wording needs a read by a Belizean Spanish speaker.

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
      "CONTENTS: It is essential to give a full list of the articles destroyed or damaged, with the particulars set out below. In the case of Stock the \"estimated value immediately before the damage\" (column 5) must not exceed the value before sale, i.e. it must not be based on the selling price."
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

    /* What a claimant may attach. Named rather than left open, because a
       claimant who is told what is wanted sends it the first time. */
    attachmentHint: {
      motor: { en: "Photographs of the damage, the police report, and an estimate of repairs.", es: "Fotografías de los daños, el informe policial y un estimado de la reparación." },
      property: { en: "Photographs of the damage, a tradesman's estimate, and the police report where one was made.", es: "Fotografías de los daños, un estimado de un contratista y el informe policial si se hizo uno." },
      marine: { en: "Photographs of the vessel showing damaged areas, the police report, the report from the Belize Port Authority, and invoices or estimates for repairs and parts.", es: "Fotografías de la embarcación mostrando las áreas dañadas, el informe policial, el informe de la Autoridad Portuaria de Belice, y facturas o estimados de reparación y repuestos." }
    },

    forms: [
      /* ================================================================
         1. INSURED MOTOR ACCIDENT REPORT FORM
         ================================================================ */
      {
        id: "motor",
        pathway: "motor",
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
      }

    ]
  };
})();
