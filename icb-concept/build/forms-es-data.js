/* ============================================================================
   The nine forms, in Spanish. Read build/forms-es.js first: it explains
   why these exist and the four rules they follow.

   Each entry is:
     file        what is written to assets/forms/
     name        ICB's published English name, kept in the header
     nameEs      the Spanish name, under it
     title       the PDF's /Title, which is what a browser tab shows
     addr        the address line, where ICB's form uses a shorter one
     standfirst  the italic instruction under the title, if the form has one
     body(h)     the form itself, built from the helpers in forms-es.js

   Where ICB's English has a slip, the Spanish asks the question
   correctly and a comment records the slip. Where ICB's wording is a
   term of art, it is left alone and the Spanish explains it.
   ========================================================================== */
"use strict";

module.exports = function (h) {
  const { band, rows, ask, inline, yesno, para, small, declare, sign, table, box, pagebreak } = h;

  /* Blocks ICB repeats word for word across several forms. Held once
     here so the Spanish cannot drift between them, which is exactly
     how two versions of a declaration end up saying different things. */

  const RECORDING = () => declare(
    "Le informamos que Insurance Corporation of Belize se reserva el derecho de grabar entrevistas y conversaciones relacionadas con cualquier reclamo, y que cualquier conversación así grabada puede usarse como prueba en procesos civiles o penales.",
    "Please be advised that the Insurance Corporation of Belize reserves the right to record interviews and conversations pertaining to any claim and any such recorded conversation may be used as evidence in civil or criminal proceedings.");

  const PROPERTY_DECL = () => declare(
    "Yo/Nosotros declaramos por la presente que lo anterior es una declaración completa, verdadera y exacta, y declaramos además que los bienes mencionados al reverso, que me/nos pertenecen y que están asegurados bajo la póliza o las pólizas antes indicadas, fueron destruidos o dañados según se ha expresado, conforme a la magnitud y los valores declarados, por lo que reclamo/reclamamos la suma correspondiente. Acepto que si he hecho alguna declaración falsa u ocultado algún hecho importante, el reclamo quedará absolutamente anulado.",
    "I/We do hereby declare that the above is a full, true and accurate statement, and I/we further declare that the property mentioned on the reverse hereof which belongs to me/us and which is insured under the above-named Policy or Policies, was destroyed or damaged as aforesaid according to the extent and values stated; wherefore I/we claim the sum of the amount thereof. I agree that if I have made any false statement or concealed any material fact the claim shall be absolutely forfeited.");

  const PROPERTY_AUTH = () => declare(
    "El abajo firmante presenta por la presente un reclamo de beneficios y autoriza a cualquier empresa u otra persona a divulgar y proporcionar a INSURANCE CORPORATION OF BELIZE LTD. o a sus representantes toda la información relativa a cualquier daño a la propiedad, incluidos todos los estimados, peritajes y documentos relacionados, para que se incluyan como parte de las pruebas del reclamo presentadas a la Corporación.",
    "The undersigned hereby makes claim for benefits and authorizes any Company or other person to release and furnish INSURANCE CORPORATION OF BELIZE LTD. or its representatives any and all information concerning any damage to property including all estimates, surveys, related documents that same may be included as a part of the proofs of claim submitted to the Corporation.");

  /* The motor authorisation reaches further than the property one: it
     names Social Security and medical records. Translated in full and
     kept beside ICB's English, because this is the sentence that gives
     ICB access to a claimant's medical history. */
  const MOTOR_AUTH = () => declare(
    "El abajo firmante presenta por la presente un reclamo de beneficios y autoriza a cualquier médico u hospital, al Seguro Social o a cualquier otra persona a divulgar y proporcionar a INSURANCE CORPORATION OF BELIZE LTD. o a sus representantes toda la información relativa a cualquier lesión, fallecimiento o daño a la propiedad, incluidos todos los estimados, peritajes, consultas o tratamientos, y copias de todos los expedientes hospitalarios o médicos, para que se incluyan como parte de las pruebas del reclamo presentadas a la Corporación.",
    "The undersigned hereby makes claim for benefits and authorizes any physician or hospital, Social Security or other person to release and furnish INSURANCE CORPORATION OF BELIZE LTD. or its representatives any and all information concerning any injury, death, or damage to property including all estimates, surveys, consultations, or treatments and copies of all hospital or medical records that same may be included as a part of the proofs of claim submitted to the Corporation.");

  const TRUE_COMPLETE = () => declare(
    "DECLARO que estos datos son verdaderos y completos. Acepto que si he hecho alguna declaración falsa u ocultado algún hecho importante, el reclamo quedará absolutamente anulado.",
    "I DECLARE that these particulars are true and complete. I agree that if I have made any false statement or concealed any material fact the claim shall be absolutely forfeited.");

  /* The seven-column schedule on the two property forms, identical on
     both. Column 5 carries ICB's "allowing for wear and tear" and
     column 7 its definition of the amount claimed. */
  const SCHEDULE = () =>
    table([
      "Cantidad de artículos",
      "Descripción del bien o de los artículos destruidos o dañados",
      "Fecha aproximada de compra",
      "Precio de compra original",
      "Valor estimado inmediatamente antes del daño, considerando el desgaste",
      "Valor estimado después del daño",
      "Monto reclamado, es decir la diferencia entre las dos últimas columnas"
    ], 10) + small("Si hace falta, adjunte una hoja aparte.");

  const BUILDING_CONTENTS = () =>
    para("EDIFICIO: El reclamo debe acompañarse de un estimado de un maestro de obra, obtenido por cuenta del asegurado, del costo de dejar el edificio en el mismo estado en que se encontraba inmediatamente antes del daño. Las mejoras no deben incluirse en ese estimado.") +
    para("CONTENIDO: Es indispensable dar una lista completa de los artículos destruidos o dañados, con los datos que se indican abajo. En el caso de la mercancía, el valor estimado inmediatamente antes del daño (columna 5) no debe exceder el valor antes de la venta, es decir, no debe basarse en el precio de venta.");

  return [

  /* ======================================================= 1. WINDSCREEN */
  {
    file: "icb-windscreen-claim-form-es.pdf",
    name: "Windscreen Claim Form",
    nameEs: "Formulario de Reclamo de Parabrisas",
    title: "ICB Formulario de Reclamo de Parabrisas",
    addr: "#16 Daly Street, Belize City, Belize",
    standfirst: "ESCRIBA EN LETRA DE MOLDE Y RESPONDA TODAS LAS PREGUNTAS",
    body: () =>
      band("Nombre y dirección del asegurado") +
      rows([
        ["Nombre:", "Ocupación:"],
        ["Dirección de residencia:", "Teléfono:"],
        ["Dirección del negocio:", "Teléfono:"],
        ["Número de póliza:", "Celular:"],
        ["Nombre del conductor:", "Tipo y número de licencia:"]
      ]) +
      band("Datos del vehículo") +
      rows([
        ["Marca y modelo:", "Año:"],
        ["Número de registro:", "Chasis / VIN:"]
      ]) +
      band("Datos del reclamo") +
      rows([
        ["Fecha del incidente:", "Hora:"],
        ["¿Dónde ocurrió el daño?"],
        ["¿Hubo algún otro daño al vehículo?"],
        ["Estimado de la reparación:"],
        ["Nombre y dirección del taller:"]
      ]) +
      /* ICB's paper reads "TO THE IS FORM", a slip for "TO THIS FORM".
         The Spanish asks it correctly; the English PDF keeps the slip. */
      small("(FAVOR ADJUNTAR LA FACTURA PROFORMA O EL ESTIMADO A ESTE FORMULARIO)") +
      band("Detalle del daño") +
      ask("Describa cómo ocurrió el daño:", 3) +
      declare(
        "Yo/Nosotros declaramos que los datos anteriores son verdaderos en todos sus aspectos.",
        "I/We do declare that the foregoing particulars are true in all aspects.") +
      sign(["Firma del asegurado", "Fecha"]) +
      sign(["Firma del conductor", "Fecha"]) +
      band("Solo para uso oficial") +
      rows([["Daño inspeccionado por:", "Fecha:"]])
  },

  /* ================================================ 2. PUBLIC LIABILITY */
  {
    file: "icb-public-liability-claim-form-es.pdf",
    name: "Public Liability Insurance Claim Form",
    nameEs: "Formulario de Reclamo de Public Liability Insurance",
    title: "ICB Formulario de Reclamo de Public Liability Insurance",
    addr: "#16 Daly Street, Belize City, Belize",
    body: () =>
      /* Bilingual: it is a statement about liability, which is exactly
         the kind of sentence that must not exist only in translation. */
      declare(
        "(La Compañía no admite responsabilidad alguna por el hecho de emitir este formulario.)",
        "(The Company does not admit liability by the issue of this form.)") +
      rows([
        ["Número de póliza:", "Fecha del último pago de prima:"],
        ["Nombre del asegurado:", "Ocupación:"],
        ["Dirección:"],
        ["Fecha del accidente:", "Hora:"]
      ]) +
      /* ICB's paper reads "Where did the accident occurred". Asked
         correctly here. */
      ask("¿Dónde ocurrió el accidente?", 1) +
      ask("Causa del accidente y circunstancias en que se produjo:", 3) +
      band("Testigos") +
      ask("Nombres y direcciones de los testigos: (1)", 1) +
      ask("(2)", 1) +
      band("Personas lesionadas o propiedad dañada") +
      ask("Nombres y direcciones de las personas lesionadas o cuya propiedad resultó dañada: (1)", 1) +
      ask("(2)", 1) +
      ask("Detalle completo de las lesiones o los daños sufridos. (a) Lesiones corporales:", 2) +
      ask("(b) Daños a la propiedad:", 2) +
      declare(
        "POR LA PRESENTE DECLARO QUE LO ANTERIOR ES UNA DECLARACIÓN COMPLETA, VERDADERA Y EXACTA.",
        "I HEREBY DECLARE THAT THE ABOVE IS A FULL, TRUE AND ACCURATE STATEMENT.") +
      sign(["Firma del asegurado", "Fecha"]) +
      small("(Si firma en nombre de una empresa, favor estampar el sello oficial.)")
  },

  /* ==================================================== 3. INLAND CARGO */
  {
    file: "icb-inland-cargo-claim-form-es.pdf",
    name: "Inland Cargo Claim Form",
    nameEs: "Formulario de Reclamo de Inland Cargo",
    title: "ICB Formulario de Reclamo de Inland Cargo",
    addr: "#16 Daly Street, Belize City, Belize",
    body: () =>
      band("1. El asegurado") +
      rows([
        ["Número de póliza:", "Nombre:"],
        ["Dirección:", "Número de contacto:"],
        ["Carga (en contenedor) y equipo pesado:"]
      ]) +
      band("2. El traslado") +
      rows([
        ["Desde / Hasta:", "Fecha del traslado:"],
        ["Fecha en que se recibió la entrega:", "Fecha de llegada:"]
      ]) +
      band("3. La pérdida") +
      rows([
        ["Fecha en que se descubrió la pérdida o el daño:", "Lugar de la pérdida:"]
      ]) +
      band("4. El consignatario") +
      rows([
        ["Nombre del consignatario:", "Números de contacto:"],
        ["Dirección:"],
        ["Descripción de la carga (en contenedor) y del equipo pesado:"]
      ]) +
      band("5. Detalle de la pérdida o el daño") +
      ask("Detalle de la pérdida o el daño:", 5) +
      inline("Estimado del daño o de la reparación ($):", 45) +
      declare(
        "Por la presente declaro que los datos anteriores son verdaderos y correctos según mi leal saber y entender.",
        "I hereby declare that the foregoing particulars are true and correct to the best of my knowledge and belief.") +
      sign(["Firma y sello del asegurado", "Fecha"]) +
      band("Documentos que debe adjuntar") +
      para("Debe adjuntar al formulario completado:") +
      small("1. Copia de la póliza de seguro.") +
      small("2. Copia del contrato de transporte.") +
      small("3. Prueba documental que demuestre el alcance de la pérdida o el daño.")
  },

  /* ================================================== 4. MARINE CLAIMANT */
  {
    file: "icb-marine-claimant-form-es.pdf",
    name: "Marine Claimant Form",
    nameEs: "Formulario de Reclamo para Embarcaciones",
    title: "ICB Formulario de Reclamo para Embarcaciones",
    addr: "P.O. Box 519, #16 Daly Street, Belize City, Belize   Tel: 224-5328/5329   Fax: 223-2786",
    body: () =>
      band("Aviso al reclamante") +
      para("Para tramitar un reclamo por daños a la propiedad se necesitará lo siguiente:") +
      small("1. Fotografías de la embarcación donde se vean las zonas dañadas.") +
      small("2. Informe policial.") +
      small("3. Informe de la Belize Port Authority.") +
      small("4. Factura o estimado de las reparaciones.") +
      small("5. Factura o estimado que detalle las piezas necesarias para la reparación, con sus precios.") +
      band("A completar por el reclamante") +
      rows([
        ["Nombre:", "Edad:"],
        ["Dirección:", "Teléfono:"],
        ["Fecha del accidente:", "Nombre de la embarcación:"],
        ["Punto de embarque:", "Punto de desembarque:"]
      ]) +
      band("Declaración de pérdida del propietario u operador de la embarcación") +
      rows([
        ["Fecha de hoy:", "Hora (am/pm):"],
        ["Yo, (nombre):", "soy propietario u operador de la embarcación:"],
        ["Número de registro o documentación del casco:"],
        ["Mi dirección es:"]
      ]) +
      ask("El día ____ de ____________ de 20____, aproximadamente a las ______, estando en (lugar) ______________, la embarcación antes mencionada y/o alguna persona sufrió un accidente o una lesión, cuyas circunstancias son las siguientes:", 6) +
      inline("Al momento del accidente, quien operaba la embarcación era:", 50) +
      ask("El daño causado directamente a dicha embarcación por este accidente es el siguiente. Describa en detalle todas las partes dañadas y la magnitud del daño, o adjunte el peritaje si lo tiene:", 5) +
      ask("La embarcación dañada puede verse en:", 1) +
      inline("El costo de la reparación se ha estimado en $ (adjunte el estimado por escrito):", 40) +
      band("Otros daños o lesiones") +
      para("Como resultado de este accidente se causaron daños a otras embarcaciones o bienes, o lesiones a personas, según se indica. Dé el nombre y la dirección completos de quien sufrió el daño o la lesión. Si no hubo daños ni lesiones, escriba N/A.") +
      table(["Nombre y dirección", "Tipo de daño o lesión", "Monto estimado"], 4) +
      para("Nombres y dirección permanente de los testigos, incluidos pasajeros y tripulación. Adjunte sus declaraciones.") +
      table(["Testigo", "Dirección y número de teléfono"], 4) +
      ask("Al momento de la pérdida, la embarcación era propiedad de ____________________, libre de gravámenes (embargos o hipotecas), y no existía otro seguro además de la póliza número ____________________ emitida por ____________________, salvo lo siguiente. Enumere los gravámenes (embargos o hipotecas) y las demás pólizas de seguro:", 3) +
      declare(
        "TODOS LOS HECHOS IMPORTANTES PARA DETERMINAR LA RESPONSABILIDAD DEL SEGURO ESTÁN DECLARADOS ARRIBA O ADJUNTOS, Y NINGUNO SE HA OMITIDO. (NOTA: EN CASO DE COLISIÓN DEBE ADJUNTARSE UN DIAGRAMA QUE MUESTRE CÓMO OCURRIÓ.) NI LA ENTREGA DE ESTE FORMULARIO NI LA ACEPTACIÓN DE LAS DECLARACIONES COMPLETADAS POR PARTE DE INSURANCE CORPORATION OF BELIZE CONSTITUYEN UNA ADMISIÓN DE RESPONSABILIDAD POR PARTE DE DICHA CORPORACIÓN.",
        "ALL FACTS MATERIAL TO THE QUESTION OF INSURANCE LIABILITY ARE STATED ABOVE OR ATTACHED HERETO AND NO SUCH FACT IS WITHHELD. (NOTE IN CASE OF COLLISION, A DIAGRAM SHOWING HOW IT HAPPENED SHOULD BE ATTACHED) NEITHER THE FURNISHINGS OF THE FORM NOR ACCEPTANCE OF THE COMPLETED STATEMENTS BY THE INSURANCE CORPORATION CONSTITUTES ADMISSION OF LIABILITY BY SAID CORPORATION.") +
      sign(["Firma", "Indique si es propietario, operador, etc."])
  },

  /* ================================================= 5. PERSONAL ACCIDENT */
  {
    file: "icb-personal-accident-claim-form-es.pdf",
    name: "Personal Accident Claim Form",
    nameEs: "Formulario de Reclamo de Personal Accident",
    title: "ICB Formulario de Reclamo de Personal Accident",
    body: () =>
      /* ICB's form opens with the physician's half. Kept in that order,
         with its instruction, because the claimant has to hand the form
         over with that section still blank. */
      band("Declaración del médico tratante") +
      small("A completar por el médico tratante. Complete esta sección o adjunte una factura detallada.") +
      rows([
        ["Número de reclamo:", "Nombre del paciente:"],
        ["1. Consulta:", "2. Medicamentos suministrados:"],
        ["3. Ultrasonido:", "Radiografía:"],
        ["4. Sala de emergencias:", "5. Otros:"],
        ["TOTAL A PAGAR:"]
      ]) +
      ask("Diagnóstico (describa las complicaciones, si las hubo):", 3) +
      rows([
        ["Fecha en que ocurrió el accidente:", "Fecha de la primera consulta:"]
      ]) +
      yesno("¿El paciente necesita tratamiento adicional?") +
      ask("Indique las fechas del tratamiento adicional:", 1) +
      yesno("¿Ha habido accidentes anteriores?") +
      ask("Si la respuesta es sí, describa las lesiones:", 2) +
      yesno("¿El paciente estuvo internado en un hospital por esta condición?") +
      ask("Tipo de procedimiento quirúrgico realizado, si lo hubo:", 1) +
      rows([
        ["Fecha de la cirugía:", "Honorarios cobrados por la cirugía: $"],
        ["Nombre del médico (en letra de molde):", "Título:"],
        ["Dirección:"],
        ["Firma:", "Fecha:"]
      ]) +
      pagebreak() +
      band("Declaración del titular de la póliza") +
      small("A completar por el asegurado.") +
      rows([
        ["Número de póliza:", "Prima:"],
        ["Fecha de la póliza:", "Fecha del último pago (D.L.P.):"],
        ["Nombre (como aparece en la póliza):", "Edad:"],
        ["Dirección:", "Número de contacto:"],
        ["Ocupación:", "Quién paga la prima:"]
      ]) +
      ask("¿Cómo y dónde ocurrió el accidente?", 4) +
      yesno("¿Hubo testigos?") +
      ask("Si la respuesta es sí, indique nombres y direcciones:", 2) +
      para("Enumere abajo todos los médicos que ha consultado por esta condición.") +
      table(["Nombre", "Dirección", "Fecha"], 4) +
      para("Enumere abajo todas las demás lesiones por accidente por las que haya recibido tratamiento médico en los últimos 5 años. Si necesita más espacio, adjunte una hoja aparte.") +
      table(["Lesión", "Fecha", "Tratamiento recibido"], 4) +
      declare(
        "El abajo firmante presenta por la presente un reclamo de beneficios y autoriza a cualquier médico, hospital u otra persona a divulgar y proporcionar a INSURANCE CORP. OF BELIZE LTD. o a sus representantes toda la información relativa a cualquier lesión, incluidos el historial médico, las consultas o los tratamientos, y copias de todos los expedientes hospitalarios o médicos, para que se incluyan como parte de las pruebas del reclamo presentadas a la Corporación. Queda entendido que la entrega de este formulario no constituye ni se considerará una admisión por parte de la Corporación de que existiera seguro alguno en vigor, ni una renuncia a ninguno de los derechos de la Corporación a defenderse.",
        "The undersigned hereby makes claim for benefits and authorizes any physician or hospital or other person to release and furnish INSURANCE CORP. OF BELIZE LTD. or its representatives any and all information concerning any injury, including medical history, consultations, or treatments and copies of all hospital or medical records that same may be included as a part of the proofs of claim submitted to the Corporation. It is understood that the furnishings of this form shall not constitute nor be considered an admission by the Corporation that there was any insurance in force, nor constitute a waiver of any of the Corporations's rights to defend.") +
      sign(["Firma del titular de la póliza", "Fecha"]) +
      band("Cesión del beneficio médico") +
      declare(
        "En consideración de los servicios prestados desde ____________ hasta ____________, por la presente autorizo el pago de los beneficios médicos pagaderos bajo la póliza número ____________ directamente a ____________________, sin exceder los cargos médicos por dichos servicios. Entiendo que soy responsable económicamente ante ____________________ por los cargos no cubiertos por esta cesión.",
        "In consideration of the services rendered from ____ to ____ I hereby authorize payment of the medical benefits payable on Policy No. ____ directly to ____ but not to exceed the medical charges for these services. I understand I am financially responsible to ____ for charges not covered by this assignment.") +
      sign(["Firma del titular de la póliza", "Fecha"]) +
      band("Solo para uso de la oficina") +
      rows([
        ["Agente:", "Número de débito:"],
        ["Fecha (mes/día/año):", "Aprobado por:"],
        ["Fecha de pago (mes/día/año):", "Número de cheque:"]
      ])
  },

  /* ========================================================= 6. PROPERTY */
  {
    file: "icb-property-claim-form-es.pdf",
    name: "Property Claim Form",
    nameEs: "Formulario de Reclamo de Propiedad",
    title: "ICB Formulario de Reclamo de Propiedad",
    body: () =>
      rows([
        ["Número de póliza:", "Nombre del asegurado:"],
        ["Suma asegurada:", "Número de contacto:"]
      ]) +
      band("El daño o la pérdida") +
      rows([["1. ¿Cuándo ocurrió el daño o la pérdida? Fecha:", "Hora (a.m. / p.m.):"]]) +
      ask("2. Dirección del inmueble donde ocurrió el daño o la pérdida:", 2) +
      /* ICB's paper reads "at the state of the damage/loss", a slip for
         "at the date of". Asked correctly here. */
      ask("3. (a) ¿Para qué se usaba el inmueble en la fecha del daño o la pérdida? Por ejemplo vivienda particular, tienda, fábrica.", 2) +
      ask("(b) Si hubo algún cambio en el riesgo desde que se emitió la póliza o desde su último endoso, dé los detalles.", 2) +
      ask("4. ¿Cuál fue la causa del daño o la pérdida, y cómo ocurrió?", 5) +
      band("La propiedad y otros seguros") +
      inline("5. (a) ¿El bien por el que se reclama le pertenece únicamente a usted?", 35) +
      ask("(b) Si no, dé el nombre completo de cualquier otra parte con interés en él.", 2) +
      inline("6. (a) ¿Existen otros seguros sobre el bien, contratados por usted o por un tercero?", 24) +
      ask("(b) Si los hay, indique el nombre de la compañía, el número de póliza y el monto asegurado, si lo conoce.", 2) +
      inline("7. (a) ¿Ha sufrido antes una pérdida por una causa similar, en este u otro inmueble?", 25) +
      ask("(b) Si es así, dé los detalles.", 2) +
      band("Medidas tomadas") +
      para("Yo/Nosotros hemos tomado todas las medidas prácticas respecto del bien perdido, dañado o destruido:") +
      ask("(a) para evitar más pérdidas, daños o destrucción:", 1) +
      ask("(b) para localizar o recuperar el bien perdido o robado:", 1) +
      ask("(c) para lograr la detención y/o la condena de la persona o las personas responsables de la pérdida, el daño o la destrucción:", 1) +
      small("Toda pérdida, daño o destrucción que involucre un acto delictivo o se deba a uno debe reportarse a la policía.") +
      ask("Dirección de la estación y número del policía que tomó el informe:", 1) +
      PROPERTY_DECL() +
      PROPERTY_AUTH() +
      RECORDING() +
      sign(["Firma del asegurado (y sello)", "Fecha"]) +
      sign(["Firma del testigo", "Fecha"]) +
      pagebreak() +
      band("Lista de bienes destruidos o dañados") +
      BUILDING_CONTENTS() +
      SCHEDULE()
  },

  /* ============================================ 7. PROPERTY CATASTROPHE */
  {
    file: "icb-property-catastrophe-claim-form-es.pdf",
    name: "Property Catastrophe Claim Form",
    nameEs: "Formulario de Reclamo de Catástrofe de Propiedad",
    /* ICB's published listing calls this the Hurricane Claim Form and
       the title page calls it Property Catastrophe. The header keeps
       the title page's name, as the English PDF does; the claims page
       button says Hurricane, which is the name a claimant was told. */
    title: "ICB Formulario de Reclamo de Catástrofe de Propiedad",
    body: () =>
      rows([["Número de reclamo:", ""]]) +
      band("Información general") +
      rows([
        ["Nombre del asegurado:", "Persona de contacto:"],
        ["Dirección del asegurado:", "Contacto (casa):"],
        ["Lugar de la pérdida:", "Teléfono:"],
        ["Cómo llegar al lugar:"]
      ]) +
      para("Datos de la póliza:") +
      table(["Número de póliza", "Descripción", "Suma asegurada"], 3) +
      ask("Nombre y dirección de cualquier banco o empresa con interés económico en el bien:", 2) +
      rows([
        ["Fecha y hora en que ocurrió (a.m. / p.m.):", "Causa de la pérdida:"]
      ]) +
      band("El daño") +
      para("Daño en: techo, contenido, pared u otro. Marque lo que corresponda.") +
      rows([
        ["Techo:", "Contenido:"],
        ["Pared:", "Otro:"],
        ["Si marcó otro, indique cuál:"]
      ]) +
      yesno("¿Existen otros seguros sobre el bien, contratados por usted o por un tercero?") +
      ask("Si los hay, indique el nombre de la compañía, el número de póliza y el monto asegurado, si lo conoce:", 2) +
      ask("¿Cuál fue la causa del daño o la pérdida, y cómo ocurrió?", 7) +
      pagebreak() +
      rows([["Número de reclamo:", ""]]) +
      band("Medidas tomadas") +
      yesno("Yo/Nosotros hemos tomado todas las medidas prácticas respecto del bien perdido, dañado o destruido para evitar más pérdidas, daños o destrucción.") +
      ask("Detalle:", 2) +
      PROPERTY_DECL() +
      PROPERTY_AUTH() +
      RECORDING() +
      sign(["Firma del asegurado (y sello)", "Fecha"]) +
      sign(["Firma del testigo", "Fecha"]) +
      pagebreak() +
      rows([["Número de reclamo:", ""]]) +
      band("Lista de bienes destruidos o dañados") +
      BUILDING_CONTENTS() +
      yesno("¿Se adjunta el estimado del costo de reparación o reposición?") +
      SCHEDULE()
  },

  /* ============================================= 8. INSURED MOTOR REPORT */
  {
    file: "icb-insured-motor-accident-report-form-es.pdf",
    name: "Insured Motor Accident Report Form",
    nameEs: "Formulario de Informe de Accidente de Vehículo, para el Asegurado",
    title: "ICB Formulario de Informe de Accidente de Vehículo (Asegurado)",
    body: () =>
      band("Nombre y dirección del asegurado") +
      rows([
        ["Nombre:", "Fecha de nacimiento:"],
        ["Dirección de residencia:", "Teléfono:"],
        ["Negocio u ocupación:", "Empleador:"],
        ["Dirección del negocio:", "Teléfono:"]
      ]) +
      band("Datos del seguro") +
      rows([
        ["Número de póliza:", "Fecha de renovación:"],
        ["Vigencia de la cobertura:", "Tipo de cobertura:"],
        ["¿Hay alguna otra póliza vigente que cubra este vehículo?"]
      ]) +
      ask("Indique si se hizo o no una valuación o inspección al contratar o al renovar. Si se hizo, ¿quién la hizo?", 2) +
      band("Datos del vehículo") +
      rows([
        ["Año:", "Marca:"],
        ["Modelo o tipo:", "Número de registro:"],
        ["Color:", "Kilometraje actual:"],
        ["¿Había algún daño sin reparar?", "Si lo había, dé los detalles:"],
        ["Tipo de licencia de circulación (particular, taxi, remolque, motocicleta, carga, etc.):"]
      ]) +
      ask("Nombre y dirección de cualquier banco o empresa con interés económico en el vehículo:", 2) +
      band("Uso del vehículo") +
      ask("Indique con precisión para qué se estaba usando el vehículo al momento del accidente:", 2) +
      rows([
        ["¿Se transportaba mercancía?", "Si así fue, naturaleza y peso de la carga:"],
        ["¿Cuántas personas iban en el vehículo, incluido el conductor?", "¿Se les cobró una tarifa por transportarlas?"],
        ["¿Qué relación tiene el conductor con el titular de la póliza?", "¿El titular de la póliza iba en el vehículo cuando ocurrió el accidente?"]
      ]) +
      ask("Si el vehículo lo conducía una persona distinta del asegurado, ¿con la autorización de quién se usaba?", 2) +
      band("Datos de la persona que conducía") +
      rows([
        ["Nombre del conductor:", "Fecha de nacimiento:"],
        ["Dirección:", "Teléfono:"],
        ["Ocupación (especifique):", "Empleador o negocio:"],
        ["Número de licencia de conducir:", "Fecha de emisión:"],
        ["Tipo de licencia:", "Clases de vehículos que indica la licencia:"],
        ["¿Está empleado por usted?", "¿Alguna vez ha sido condenado por una infracción de tránsito?"]
      ]) +
      ask("Si así fue, dé todos los detalles:", 2) +
      yesno("¿Cree usted que tuvo la culpa en este accidente?") +
      yesno("¿Llevaba puesto el cinturón de seguridad?") +
      ask("¿Ha padecido diabetes, convulsiones o alguna afección cardíaca, o algún defecto o incapacidad física o mental? Si así es, dé todos los detalles:", 2) +
      ask("¿Alguna compañía de seguros o asegurador le ha rechazado o se ha negado a continuar un seguro de vehículo?", 1) +
      band("Datos del accidente") +
      rows([
        ["Fecha del accidente:", "Hora (a.m. / p.m.):"],
        ["Lugar donde ocurrió el accidente:"],
        ["¿Se reportó el accidente a la policía?", "Si así fue, indique dónde:"],
        ["Fecha en que se reportó:", "Hora (a.m. / p.m.):"],
        ["(a) ¿Acudieron al lugar?", "(b) Dirección de la estación de policía:"],
        ["(c) Nombre y número del oficial a cargo:", "(d) ¿Le advirtieron que sería procesado?"],
        ["(e) ¿Le advirtieron al otro conductor que sería procesado?", "Velocidad aproximada del vehículo al momento del accidente (M.P.H.):"],
        ["¿Qué luces del vehículo estaban encendidas?", "¿La visibilidad era buena?"],
        ["¿El pavimento estaba mojado?"]
      ]) +
      band("Daños al vehículo propio") +
      rows([
        ["¿El vehículo sufrió daños?", "(a) Naturaleza del daño:"],
        ["(b) ¿Cuál es el costo aproximado de la reparación? $", "(c) ¿Dónde está el vehículo ahora?"],
        ["(d) ¿Quiénes son los reparadores?"]
      ]) +
      small("(EN TODOS LOS CASOS EN QUE SU VEHÍCULO SUFRA DAÑOS Y USTED TENGA DERECHO A RECLAMAR BAJO LA PÓLIZA, ENVÍE DE INMEDIATO A LA COMPAÑÍA UN ESTIMADO DE LA REPARACIÓN.)") +
      band("Pasajeros en el vehículo del asegurado") +
      table(["Nombre", "Dirección", "Ocupación", "Relación con el asegurado"], 4) +
      band("Datos de terceros") +
      para("Si hubo un peatón, un ciclista o un bien involucrado, indique:") +
      rows([
        ["(a) Nombre y dirección:", "(b) Naturaleza de la lesión, si la hubo:"],
        ["(c) Daño a la bicicleta:", "(d) Daño a la propiedad:"]
      ]) +
      para("Si hubo otros vehículos involucrados, indique:") +
      band("Vehículo 1") +
      rows([
        ["Número de registro:", "Tipo de vehículo:"],
        ["Nombre y dirección del propietario:", "Nombre y dirección del conductor:"],
        ["Compañía de seguros:", "Naturaleza del daño:"],
        ["Costo aproximado de la reparación: $", "¿Cuántos pasajeros iban en el vehículo?"],
        ["¿Las personas que iban en el vehículo resultaron lesionadas?"]
      ]) +
      band("Vehículo 2") +
      rows([
        ["Número de registro:", "Tipo de vehículo:"],
        ["Nombre y dirección del propietario:", "Nombre y dirección del conductor:"],
        ["Compañía de seguros:", "Naturaleza del daño:"],
        ["Costo aproximado de la reparación: $", "¿Cuántos pasajeros iban en el vehículo?"],
        ["¿Las personas que iban en el vehículo resultaron lesionadas?"]
      ]) +
      band("Testigos") +
      para("Dé el nombre y la dirección de las personas, distintas de los pasajeros, que presenciaron el accidente, e indique dónde se encontraban cuando ocurrió.") +
      table(["Nombre y dirección", "Dónde se encontraba"], 4) +
      yesno("¿El conductor o el propietario firmó una admisión de responsabilidad por escrito?") +
      pagebreak() +
      band("Relato del accidente. A completar únicamente por el conductor") +
      para("Explique con detalle lo que ocurrió y muestre con un croquis la posición de los vehículos al momento del accidente.") +
      ask("", 14) +
      sign(["Nombre del conductor", "Firma del conductor"]) +
      inline("Fecha:", 40) +
      band("Reclamos") +
      ask("¿Se ha presentado algún reclamo en su contra?", 1) +
      small("Cualquier comunicación que reciba sobre el accidente no debe contestarse, sino enviarse de inmediato a la Compañía.") +
      MOTOR_AUTH() +
      TRUE_COMPLETE() +
      RECORDING() +
      sign(["Nombre del asegurado (y sello)", "Fecha"]) +
      sign(["Firma del asegurado", "Firma del testigo"]) +
      pagebreak() +
      band("Croquis") +
      para("Dibuje la posición de los vehículos después de la colisión.") +
      box("", 150)
  },

  /* =========================================== 9. CLAIMANT MOTOR REPORT */
  {
    file: "icb-claimant-motor-accident-report-form-es.pdf",
    name: "Claimant Motor Accident Report Form",
    nameEs: "Formulario de Informe de Accidente de Vehículo, para el Reclamante",
    title: "ICB Formulario de Informe de Accidente de Vehículo (Reclamante)",
    body: () =>
      band("Datos del accidente") +
      rows([
        ["Fecha del accidente:", "Hora (a.m. / p.m.):"],
        ["Lugar donde ocurrió el accidente:"],
        ["¿Se reportó el accidente a la policía?", "Si así fue, indique dónde:"],
        ["Fecha en que se reportó:", "Hora (a.m. / p.m.):"],
        ["(a) ¿Acudieron al lugar?", "(b) Dirección de la estación de policía:"],
        ["(c) Nombre y número del oficial a cargo:", "(d) ¿Le advirtieron que sería procesado?"],
        ["(e) ¿Le advirtieron al otro conductor que sería procesado?", "Velocidad aproximada del vehículo al momento del accidente (M.P.H.):"],
        ["¿Qué luces del vehículo estaban encendidas?", "¿La visibilidad era buena?"],
        ["¿El pavimento estaba mojado?"]
      ]) +
      yesno("¿Cree usted que tuvo la culpa en este accidente?") +
      yesno("¿Llevaba puesto el cinturón de seguridad?") +
      band("Daños o lesiones del reclamante") +
      rows([
        ["Nombre:", "Fecha de nacimiento:"],
        ["Dirección de residencia:", "Teléfono:"],
        ["Negocio u ocupación:", "Empleador:"],
        ["Dirección del negocio:", "Teléfono:"]
      ]) +
      para("Si hubo un peatón, un ciclista o un bien involucrado, indique:") +
      rows([
        ["(a) Nombre y dirección:", "(b) Naturaleza de la lesión, si la hubo:"],
        ["(c) Daño a la bicicleta:", "(d) Daño a la propiedad:"]
      ]) +
      band("Si hubo un vehículo involucrado") +
      rows([
        ["Número de registro:", "Tipo de vehículo:"],
        ["Nombre y dirección del propietario:", "Nombre y dirección del conductor:"],
        ["Compañía de seguros:", "Naturaleza del daño:"],
        ["Costo aproximado de la reparación: $", "¿Dónde está el vehículo ahora?"],
        ["¿Quiénes son los reparadores?", "¿Cuántos pasajeros iban en el vehículo?"],
        ["¿Las personas que iban en el vehículo resultaron lesionadas?"]
      ]) +
      ask("Nombre y dirección de cualquier banco o empresa con interés económico en el vehículo:", 2) +
      small("(EN TODOS LOS CASOS EN QUE SU PROPIEDAD SUFRA DAÑOS O HAYA LESIONES PERSONALES Y USTED TENGA DERECHO A PRESENTAR UN RECLAMO BAJO LA PÓLIZA, ENVÍE DE INMEDIATO A LA COMPAÑÍA UN ESTIMADO DE LA REPARACIÓN, LOS INFORMES MÉDICOS Y LOS GASTOS MÉDICOS.)") +
      band("Pasajeros en el vehículo del reclamante") +
      table(["Nombre", "Dirección", "Ocupación", "Naturaleza de la lesión, si la hubo, y hospital donde fue atendido", "Relación con el asegurado"], 4) +
      band("Datos de terceros") +
      para("Si hubo un peatón, un ciclista o un bien involucrado, indique:") +
      rows([
        ["(a) Nombre y dirección:", "(b) Naturaleza de la lesión, si la hubo:"],
        ["(c) Daño a la bicicleta:", "(d) Daño a la propiedad:"]
      ]) +
      band("Vehículo 1") +
      rows([
        ["Número de registro:", "Tipo de vehículo:"],
        ["Nombre y dirección del propietario:", "Nombre y dirección del conductor:"],
        ["Compañía de seguros:", "Naturaleza del daño:"],
        ["¿Cuántos pasajeros iban en el vehículo?", "¿Las personas que iban en el vehículo resultaron lesionadas?"]
      ]) +
      band("Vehículo 2") +
      rows([
        ["Número de registro:", "Tipo de vehículo:"],
        ["Nombre y dirección del propietario:", "Nombre y dirección del conductor:"],
        ["Compañía de seguros:", "Naturaleza del daño:"],
        ["¿Cuántos pasajeros iban en el vehículo?", "¿Las personas que iban en el vehículo resultaron lesionadas?"]
      ]) +
      band("Testigos") +
      para("Dé el nombre y la dirección de las personas, distintas de los pasajeros, que presenciaron el accidente, e indique dónde se encontraban cuando ocurrió.") +
      table(["Nombre y dirección", "Dónde se encontraba"], 4) +
      pagebreak() +
      band("Relato del accidente. A completar únicamente por el conductor") +
      para("Explique con detalle lo que ocurrió y muestre con un croquis la posición de los vehículos al momento del accidente.") +
      ask("", 12) +
      MOTOR_AUTH() +
      RECORDING() +
      TRUE_COMPLETE() +
      sign(["Firma del reclamante (y sello)", "Fecha"]) +
      /* ICB's paper provides for this, so the Spanish does too. */
      small("(El padre, la madre o el tutor puede firmar el formulario en nombre de un menor.)") +
      sign(["Firma del conductor", "Firma del testigo"]) +
      pagebreak() +
      band("Croquis") +
      para("Dibuje la posición de los vehículos después de la colisión.") +
      box("", 150)
  }

  ];
};
