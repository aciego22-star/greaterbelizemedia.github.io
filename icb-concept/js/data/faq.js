/* ============================================================================
   ICB.DATA.faq — ICB's own questions and answers.

   SOURCE: "ICB FAQ Web Site 26.10.26 v2", supplied by the client on 27
   Oct 2026. Eight sections, eighty-five questions. Every answer below
   is ICB's, carried across rather than rewritten, except where the
   source was written in the first person for the assistant and had to
   be put into the site's voice. Those are marked VOICE in a comment
   beside them so the change is visible and reversible.

   WHAT WAS LEFT OUT, and why:
   - The "Fallback and handoff scripts" section. Those are the
     assistant's lines for when it does not understand a question
     ("I am not sure I understood"). They belong to Bee and would be
     nonsense on a page.
   - Nothing else. No question has been dropped, merged or softened.

   WHERE EACH ONE APPEARS. `on` lists the pages that carry a question in
   context, as a short block beside the thing it is about. Every
   question appears in full on the FAQ page regardless; `on` only adds
   it elsewhere. A question with no `on` lives on the FAQ page alone.

   The FAQ page is the one that carries the FAQPage structured data, so
   the same question is never described to a search engine twice.

   ANSWER SHAPE
     q      the question, { en, es }
     a      the answer, { en, es }. A blank line starts a new paragraph.
     list   optional bullets, [{ en, es }]
     steps  optional numbered steps, [{ en, es }]
     table  optional { cols: [{ en, es }], rows: [[{ en, es }, ...]] }
     link   optional { label: { en, es }, href }
     on     optional array of page keys

   Page keys: about, contact, locations, insurance, claims, payments,
   resources, business, and product:<id> for a single product page.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

(function () {
  "use strict";

  function T(en, es) { return { en: en, es: es }; }

  ICB.DATA.faq = {
    sections: [

      /* ============================== 1 ============================== */
      {
        id: "company",
        title: T("About ICB", "Sobre ICB"),
        lead: T("Who ICB is, where to find them and how to get in touch.",
                "Quién es ICB, dónde encontrarlos y cómo comunicarse."),
        qa: [
          {
            q: T("What is ICB? What kind of company is it?",
                 "¿Qué es ICB? ¿Qué tipo de empresa es?"),
            a: T("The Insurance Corporation of Belize (ICB) is a general insurance company serving customers in Belize. General insurance helps protect against certain losses, such as damage to property, vehicles, boats, cargo and liabilities, depending on the policy.",
                 "Insurance Corporation of Belize (ICB) es una compañía de seguros generales que atiende a clientes en Belice. El seguro general ayuda a proteger contra ciertas pérdidas, como daños a propiedades, vehículos, embarcaciones, carga y responsabilidades, según la póliza."),
            on: ["about"]
          },
          {
            q: T("Is ICB licensed? Who regulates it?",
                 "¿Está ICB autorizada? ¿Quién la regula?"),
            a: T("ICB is a licensed general insurance company. We are regulated by the Office of Supervisor of Insurance & Private Pensions (OSIPP) which is a Department of the Ministry of Finance.",
                 "ICB es una compañía de seguros generales autorizada. Estamos regulados por la Office of Supervisor of Insurance & Private Pensions (OSIPP), que es un departamento del Ministerio de Finanzas."),
            on: ["about"]
          },
          {
            /* VOICE: the source answers this as the assistant, asking the
               reader for their district. On a page the branch finder is
               the answer, so it points there. */
            q: T("Where is the nearest ICB branch to me?",
                 "¿Dónde está la sucursal de ICB más cercana?"),
            a: T("ICB has 22 branches and agencies across all six districts. The branch finder lists every one with its address, telephone, WhatsApp, email and opening hours, and a map with directions.",
                 "ICB tiene 22 sucursales y agencias en los seis distritos. El buscador de sucursales muestra cada una con su dirección, teléfono, WhatsApp, correo y horario, y un mapa con indicaciones."),
            link: { label: T("Find your branch", "Encuentre su sucursal"), href: "#/locations" },
            on: ["locations", "contact"]
          },
          {
            q: T("What are my branch's opening hours?",
                 "¿Cuál es el horario de mi sucursal?"),
            a: T("Most branches:", "La mayoría de las sucursales:"),
            list: [
              T("Monday to Friday, 8:00 AM to 11:45 AM and 1:00 PM to 5:00 PM", "Lunes a viernes, 8:00 AM a 11:45 AM y 1:00 PM a 5:00 PM"),
              T("Saturday, 8:00 AM to 12:00 PM", "Sábado, 8:00 AM a 12:00 PM"),
              T("Corozal Border: Monday to Saturday, 6:00 AM to 7:00 PM. Sunday, 7:00 AM to 6:00 PM", "Corozal Border: lunes a sábado, 6:00 AM a 7:00 PM. Domingo, 7:00 AM a 6:00 PM"),
              T("Benque Viejo Border: every day, 7:00 AM to 6:00 PM", "Benque Viejo Border: todos los días, 7:00 AM a 6:00 PM")
            ],
            on: ["locations"]
          },
          {
            q: T("How can I contact ICB?", "¿Cómo puedo comunicarme con ICB?"),
            a: T("You can visit your nearest office, email icb@icbinsurance.com or call 224-5328/9.",
                 "Puede visitar la oficina más cercana, escribir a icb@icbinsurance.com o llamar al 224-5328/9."),
            on: ["contact"]
          },
          {
            q: T("Can another ICB branch, other than the one that sold me the policy, help with my policy?",
                 "¿Puede ayudarme con mi póliza otra sucursal de ICB, además de la que me la vendió?"),
            a: T("Yes. Customers can receive service at any Branch or Agency.",
                 "Sí. Los clientes pueden recibir servicio en cualquier sucursal o agencia."),
            on: ["locations", "contact"]
          },
          {
            q: T("Do I need an appointment to visit a branch?",
                 "¿Necesito cita para visitar una sucursal?"),
            a: T("No.", "No."),
            on: ["locations"]
          },
          {
            /* VOICE: the source answers as the assistant and ends with a
               note to itself, "Refer back to Products". */
            q: T("What insurance products do you offer?",
                 "¿Qué productos de seguro ofrecen?"),
            a: T("ICB covers motor, property, marine, cargo, liability, travel and Mexican insurance. Each product page sets out what that cover is for. Tell a representative what you want to protect and they will point you to the cover you need.",
                 "ICB ofrece seguros de vehículo, propiedad, marítimo, carga, responsabilidad, viaje y seguro mexicano. Cada página de producto explica para qué sirve esa cobertura. Dígale a un representante qué quiere proteger y le indicará la cobertura que necesita."),
            link: { label: T("See all insurance", "Ver todos los seguros"), href: "#/insurance" },
            on: ["insurance"]
          },
          {
            q: T("How can I contact ICB from outside of Belize?",
                 "¿Cómo puedo comunicarme con ICB desde fuera de Belice?"),
            a: T("Please email icb@icbinsurance.com or call 224-5328/9. You may also send a WhatsApp message to your branch.",
                 "Escriba a icb@icbinsurance.com o llame al 224-5328/9. También puede enviar un mensaje de WhatsApp a su sucursal."),
            link: { label: T("Branch contact listing", "Directorio de sucursales"), href: "#/locations" },
            on: ["contact"]
          }
        ]
      },

      /* ============================== 2 ============================== */
      {
        id: "servicing",
        title: T("Your policy", "Su póliza"),
        lead: T("Changing, updating and understanding cover you already hold.",
                "Cambiar, actualizar y entender la cobertura que ya tiene."),
        qa: [
          {
            q: T("How can I change something on my policy?", "¿Cómo puedo cambiar algo en mi póliza?"),
            a: T("Contact your nearest branch to request a change. A policy change may need to be reviewed and may change the cost or terms.",
                 "Comuníquese con su sucursal más cercana para solicitar un cambio. Un cambio de póliza puede requerir revisión y puede modificar el costo o las condiciones."),
            on: ["contact"]
          },
          {
            q: T("How can I update my phone number, email or mailing address?",
                 "¿Cómo actualizo mi número de teléfono, correo o dirección postal?"),
            a: T("Contact your nearest branch to update your information.",
                 "Comuníquese con su sucursal más cercana para actualizar su información."),
            on: ["contact"]
          },
          {
            q: T("How do I add or remove a driver?", "¿Cómo agrego o quito un conductor?"),
            a: T("Contact your nearest branch to request a change. They may ask you for a copy of the person's driver's license and driving history.",
                 "Comuníquese con su sucursal más cercana para solicitar el cambio. Pueden pedirle una copia de la licencia de conducir de esa persona y su historial de manejo."),
            on: ["product:motor"]
          },
          {
            q: T("Can I increase or reduce the amount I insure for?",
                 "¿Puedo aumentar o reducir la suma asegurada?"),
            a: T("In some cases, you may be able to do so. Note that we may need to review the value and the basis used to insure it. Insuring for too little can affect a claim under some policies. A valuation or other evidence may be needed before a change is confirmed. Contact your nearest branch to request specific information.",
                 "En algunos casos sí es posible. Tenga en cuenta que puede que debamos revisar el valor y la base utilizada para asegurarlo. Asegurar por una suma demasiado baja puede afectar un reclamo bajo algunas pólizas. Puede requerirse una valuación u otra evidencia antes de confirmar un cambio. Comuníquese con su sucursal más cercana para información específica.")
          },
          {
            q: T("How do I add or remove an assignee or other interested party?",
                 "¿Cómo agrego o quito a un cesionario u otra parte interesada?"),
            a: T("Contact your nearest branch to request a change. The team will check whether a lender's consent or release is needed and explain any document requirements.",
                 "Comuníquese con su sucursal más cercana para solicitar el cambio. El equipo verificará si se necesita el consentimiento o la liberación de un acreedor y le explicará los documentos requeridos.")
          },
          {
            q: T("How do I get copies of lost insurance documents?",
                 "¿Cómo obtengo copias de documentos de seguro extraviados?"),
            a: T("Contact your nearest branch to request copies.",
                 "Comuníquese con su sucursal más cercana para solicitar copias."),
            on: ["contact"]
          },
          {
            q: T("What is the difference between third-party and comprehensive motor insurance?",
                 "¿Cuál es la diferencia entre el seguro de vehículo de terceros y el comprensivo?"),
            a: T("Third-party insurance generally covers certain liabilities for injury to others or damage to their property. In addition to this, Comprehensive insurance may also cover specified loss or damage to your own vehicle, subject to the policy terms.",
                 "El seguro de terceros generalmente cubre ciertas responsabilidades por lesiones a otras personas o daños a su propiedad. Además de eso, el seguro comprensivo puede cubrir también pérdidas o daños especificados a su propio vehículo, sujeto a las condiciones de la póliza."),
            on: ["product:motor"]
          },
          {
            q: T("Does comprehensive insurance cover everything?",
                 "¿El seguro comprensivo lo cubre todo?"),
            a: T("Comprehensive insurance still has limits and exclusions. Wear and tear, mechanical problems and some uses may be excluded.",
                 "El seguro comprensivo también tiene límites y exclusiones. El desgaste, los problemas mecánicos y algunos usos pueden quedar excluidos."),
            on: ["product:motor"]
          },
          {
            q: T("What does home or property insurance cover?",
                 "¿Qué cubre el seguro de vivienda o propiedad?"),
            a: T("Property insurance may cover buildings, contents or both against the events listed in the policy. Damage caused by fire, hurricane, flood and earthquake are generally covered.",
                 "El seguro de propiedad puede cubrir edificios, contenido o ambos contra los eventos indicados en la póliza. Los daños por incendio, huracán, inundación y terremoto generalmente están cubiertos."),
            on: ["product:property"]
          },
          {
            q: T("What does renters or content insurance cover?",
                 "¿Qué cubre el seguro de inquilino o de contenido?"),
            a: T("Renters or Content insurance covers the contents (appliances, furniture, etc.) of your home against the events listed in the policy. Damage caused by fire, hurricane, flood and earthquake are generally covered.",
                 "El seguro de inquilino o de contenido cubre el contenido de su casa (electrodomésticos, muebles, etc.) contra los eventos indicados en la póliza. Los daños por incendio, huracán, inundación y terremoto generalmente están cubiertos."),
            on: ["product:property"]
          },
          {
            q: T("What is the difference between boat or marine insurance and cargo insurance?",
                 "¿Cuál es la diferencia entre el seguro marítimo o de embarcación y el seguro de carga?"),
            a: T("Boat or hull insurance concerns the vessel, liability to passengers and third parties. Cargo insurance concerns goods in transit. Equipment and routes may need separate cover or conditions. Contact your nearest branch to request more information.",
                 "El seguro de embarcación o de casco se refiere a la embarcación y a la responsabilidad ante pasajeros y terceros. El seguro de carga se refiere a mercancía en tránsito. El equipo y las rutas pueden requerir cobertura o condiciones aparte. Comuníquese con su sucursal más cercana para más información."),
            on: ["product:marine", "product:cargo"]
          },
          {
            q: T("What liability insurance might my business need?",
                 "¿Qué seguro de responsabilidad podría necesitar mi negocio?"),
            a: T("Liability insurance can help with specified legal liabilities to other people. Different covers may apply to customers, products, employees or professional services. Contact your nearest branch to request more information.",
                 "El seguro de responsabilidad puede ayudar con responsabilidades legales determinadas frente a otras personas. Pueden aplicarse coberturas distintas para clientes, productos, empleados o servicios profesionales. Comuníquese con su sucursal más cercana para más información."),
            on: ["product:liability", "business"]
          },
          {
            q: T("What does personal accident insurance cover?",
                 "¿Qué cubre el seguro de accidentes personales?"),
            a: T("Personal accident insurance may provide stated benefits for qualifying accidental injury, disability or death. It is different from health or medical insurance, and benefits depend on the policy definitions and limits. Contact your nearest branch to request more information.",
                 "El seguro de accidentes personales puede otorgar beneficios establecidos por lesión accidental, discapacidad o fallecimiento que califiquen. Es distinto del seguro de salud o médico, y los beneficios dependen de las definiciones y los límites de la póliza. Comuníquese con su sucursal más cercana para más información.")
          },
          {
            q: T("Does ICB offer bonds?", "¿ICB ofrece fianzas?"),
            a: T("Yes, we do. A bond supports a stated obligation and works differently from ordinary insurance. The applicant may have to provide collateral security. Contact your nearest branch to request more information.",
                 "Sí. Una fianza respalda una obligación determinada y funciona distinto a un seguro común. El solicitante puede tener que dar una garantía. Comuníquese con su sucursal más cercana para más información."),
            on: ["business"]
          },
          {
            q: T("Can I add extra benefits to my policy?", "¿Puedo agregar beneficios adicionales a mi póliza?"),
            a: T("Available extra benefits may be available for some coverages. They may have their own price, limits and conditions. Contact your nearest branch to request more information.",
                 "Puede haber beneficios adicionales disponibles para algunas coberturas. Pueden tener su propio precio, límites y condiciones. Comuníquese con su sucursal más cercana para más información.")
          },
          {
            q: T("What is a policy limit or sublimit?", "¿Qué es un límite o sublímite de póliza?"),
            a: T("A limit is the maximum amount payable for a stated type of covered loss, subject to the policy. A sublimit is a smaller limit within that cover, and limits may apply per claim, event or policy period. A representative can explain how your own limits work.",
                 "Un límite es el monto máximo pagadero por un tipo determinado de pérdida cubierta, sujeto a la póliza. Un sublímite es un límite menor dentro de esa cobertura, y los límites pueden aplicarse por reclamo, por evento o por período de póliza. Un representante puede explicarle cómo funcionan sus propios límites.")
          }
        ]
      }
,

      /* ============================== 3 ============================== */
      {
        id: "new-business",
        title: T("Getting insured", "Contratar un seguro"),
        lead: T("Quotes, applications and what happens before cover starts.",
                "Cotizaciones, solicitudes y lo que ocurre antes de que empiece la cobertura."),
        qa: [
          {
            q: T("How can I get an insurance quote?", "¿Cómo obtengo una cotización?"),
            a: T("Contact your nearest branch and tell the team what you want to insure. They will explain the information needed for a quote and any review requirements. A quote does not by itself provide coverage.",
                 "Comuníquese con su sucursal más cercana y dígale al equipo qué quiere asegurar. Le explicarán la información necesaria para cotizar y cualquier requisito de revisión. Una cotización por sí sola no otorga cobertura."),
            on: ["insurance", "contact"]
          },
          {
            q: T("What documents do I need to apply?", "¿Qué documentos necesito para solicitar?"),
            a: T("That depends on the type of insurance that you need.",
                 "Depende del tipo de seguro que necesite."),
            table: {
              cols: [T("Type of Insurance", "Tipo de seguro"), T("Documents Needed", "Documentos requeridos")],
              rows: [
                [T("Motor Third Party Liability", "Motor Third Party Liability"),
                 T("Certificate of Registration\nDriver's License", "Certificado de registro\nLicencia de conducir")],
                [T("Motor Comprehensive Insurance", "Motor Comprehensive Insurance"),
                 T("Certificate of Registration\nVehicle Pictures\nVehicle History\nVehicle Valuation Survey",
                   "Certificado de registro\nFotografías del vehículo\nHistorial del vehículo\nPeritaje de valuación del vehículo")],
                [T("Marine Cargo Insurance", "Marine Cargo Insurance"),
                 T("Declaration Form\nAirway Bill / Bill of Lading", "Formulario de declaración\nGuía aérea o conocimiento de embarque")],
                [T("Marine Hull Insurance\nMarine Vessel Third Party and Passenger Liability Insurance",
                   "Marine Hull Insurance\nMarine Vessel Third Party and Passenger Liability Insurance"),
                 T("Vessel Registration Certificate\nSea-Worthiness Certificate\nCaptain License\nValuation / Survey Report",
                   "Certificado de registro de la embarcación\nCertificado de navegabilidad\nLicencia de capitán\nInforme de valuación o peritaje")],
                [T("Property Insurance", "Property Insurance"),
                 T("Pictures of Structures / Risk\nSigned Proposal Form\nDescription of Structures / Risk",
                   "Fotografías de las estructuras o del riesgo\nFormulario de propuesta firmado\nDescripción de las estructuras o del riesgo")],
                [T("Bonds", "Bonds"), T("Contact nearest ICB Office", "Comuníquese con la oficina de ICB más cercana")],
                [T("Contractors All Risk", "Contractors All Risk"), T("Contact nearest ICB Office", "Comuníquese con la oficina de ICB más cercana")],
                [T("Employers Liability", "Employers Liability"), T("Contact nearest ICB Office", "Comuníquese con la oficina de ICB más cercana")],
                [T("Public Liability", "Public Liability"), T("Contact nearest ICB Office", "Comuníquese con la oficina de ICB más cercana")],
                [T("Personal Accident", "Personal Accident"), T("Contact nearest ICB Office", "Comuníquese con la oficina de ICB más cercana")]
              ]
            },
            on: ["insurance"]
          },
          {
            q: T("What affects the price of my insurance?", "¿Qué afecta el precio de mi seguro?"),
            a: T("The price can depend on the cover, insured value, location, use, claims loss history and other risk information.",
                 "El precio puede depender de la cobertura, el valor asegurado, la ubicación, el uso, el historial de siniestros y otra información del riesgo."),
            on: ["insurance"]
          },
          {
            q: T("Will my vehicle need an inspection when I apply for insurance?",
                 "¿Mi vehículo necesitará una inspección al solicitar el seguro?"),
            a: T("Comprehensive motor insurance, as well as other motor policies that cover limited repairs or windshield damage, require an inspection before ICB can confirm terms.",
                 "El seguro comprensivo de vehículo, así como otras pólizas de vehículo que cubren reparaciones limitadas o daño al parabrisas, requieren una inspección antes de que ICB pueda confirmar las condiciones."),
            on: ["product:motor"]
          },
          {
            q: T("Why is ICB asking for an independent survey?", "¿Por qué ICB pide un peritaje independiente?"),
            a: T("A survey helps the team understand the property and its risks. Our representative can explain any effect on the offered terms or start of cover.",
                 "Un peritaje ayuda al equipo a entender la propiedad y sus riesgos. Nuestro representante puede explicarle cualquier efecto sobre las condiciones ofrecidas o el inicio de la cobertura.")
          },
          {
            q: T("How long is my quote valid, and can the price change?",
                 "¿Cuánto tiempo vale mi cotización, y puede cambiar el precio?"),
            a: T("Quotes are generally valid for 15 to 30 days. Changes to the risk, requested cover or start date may require a revised quote.",
                 "Las cotizaciones generalmente tienen validez de 15 a 30 días. Cambios en el riesgo, en la cobertura solicitada o en la fecha de inicio pueden requerir una cotización revisada."),
            on: ["insurance"]
          },
          {
            q: T("When does my insurance actually start?", "¿Cuándo empieza realmente mi seguro?"),
            a: T("Your policy will indicate the start date and in some cases, the start time.",
                 "Su póliza indicará la fecha de inicio y, en algunos casos, la hora de inicio.")
          },
          {
            q: T("Can I insure something that is already damaged?",
                 "¿Puedo asegurar algo que ya está dañado?"),
            a: T("Tell the quoting team about existing damage or a loss that has already happened. They may need an inspection, repair evidence or special terms may apply. Do not assume a new policy will pay for an earlier loss.",
                 "Informe al equipo de cotización sobre daños existentes o una pérdida que ya ocurrió. Pueden requerir una inspección, evidencia de reparación, o aplicar condiciones especiales. No suponga que una póliza nueva pagará una pérdida anterior.")
          },
          {
            q: T("Do I need to disclose earlier claims or cancelled insurance?",
                 "¿Debo declarar reclamos anteriores o seguros cancelados?"),
            a: T("Answer the application questions accurately, including questions about claims, refusals or cancellations. If you are unsure what a question covers, ask before submitting it. Our representatives will explain what information is needed and review the application.",
                 "Responda las preguntas de la solicitud con exactitud, incluidas las preguntas sobre reclamos, rechazos o cancelaciones. Si no está seguro de qué abarca una pregunta, pregunte antes de enviarla. Nuestros representantes le explicarán qué información se necesita y revisarán la solicitud.")
          },
          {
            q: T("What if I do not know an answer or made a mistake on my application?",
                 "¿Y si no sé una respuesta o cometí un error en la solicitud?"),
            a: T("Please do not guess at important information. Contact your representative to explain what is unknown or needs correcting. The team will check whether the quote or terms need to change.",
                 "No adivine información importante. Comuníquese con su representante para explicar qué se desconoce o qué debe corregirse. El equipo verificará si la cotización o las condiciones deben cambiar.")
          },
          {
            q: T("Can I buy or increase cover when a hurricane is approaching?",
                 "¿Puedo contratar o aumentar cobertura cuando se acerca un huracán?"),
            a: T("Restrictions on new or increased cover may apply during severe weather. Contact your nearest branch for more information.",
                 "Pueden aplicarse restricciones a cobertura nueva o aumentada durante condiciones meteorológicas severas. Comuníquese con su sucursal más cercana para más información."),
            on: ["product:property"]
          }
        ]
      },

      /* ============================== 4 ============================== */
      {
        id: "payments",
        title: T("Paying ICB", "Pagar a ICB"),
        lead: T("How to pay a premium, from Belize and from abroad.",
                "Cómo pagar una prima, desde Belice y desde el extranjero."),
        qa: [
          {
            /* ICB's own list, with one item held back.
               ICB's FAQ reads: "Accepted forms of payment include Cash,
               Cheque, Credit Card, ICB Payment Portal, and Premium
               Financing through Nationwide Cash Express."

               ICB confirmed on 27 Oct 2026 that they do NOT take
               payments online. The kiosk on their network is a physical
               insurance terminal near the border, not a web portal, and
               the billing subdomain is unrelated to the public site.
               Publishing "ICB Payment Portal"
               would send a customer looking for something that is not
               there, so it is not in the list and the bank transfer
               route, which is real and is on the payments page, is
               named instead.

               Restoring it is one line. ICB should settle the final
               wording: see OPEN-QUESTIONS.md. */
            q: T("How can I pay my insurance premium?", "¿Cómo puedo pagar mi prima de seguro?"),
            a: T("Accepted forms of payment include cash, cheque and credit card at any branch, bank transfer, and Premium Financing through Nationwide Cash Express. ICB does not take payments through this website; a transfer is made through your own bank and the confirmation goes to your branch.",
                 "Las formas de pago aceptadas incluyen efectivo, cheque y tarjeta de crédito en cualquier sucursal, transferencia bancaria, y financiamiento de prima a través de Nationwide Cash Express. ICB no recibe pagos por este sitio web; la transferencia se hace desde su propio banco y el comprobante se envía a su sucursal."),
            link: { label: T("How to pay ICB", "Cómo pagarle a ICB"), href: "#/payments" },
            on: ["payments"]
          },
          {
            /* The three local accounts here are the same ones the
               payments page publishes, checked digit by digit against
               js/data/payments.js. */
            q: T("Where can I find the correct bank transfer instructions?",
                 "¿Dónde encuentro las instrucciones correctas de transferencia bancaria?"),
            a: T("ICB holds accounts at the three banks below. The payments page carries the same numbers with a copy button beside each one.",
                 "ICB tiene cuentas en los tres bancos que aparecen abajo. La página de pagos muestra los mismos números con un botón para copiar junto a cada uno."),
            table: {
              cols: [T("Bank", "Banco"), T("Account Name", "Nombre de la cuenta"), T("Account #", "Número de cuenta")],
              rows: [
                [T("Atlantic Bank", "Atlantic Bank"), T("INSURANCE CORPORATION OF BELIZE", "INSURANCE CORPORATION OF BELIZE"), T("100021393", "100021393")],
                [T("Heritage Bank", "Heritage Bank"), T("ICB", "ICB"), T("Acct #1560", "Acct #1560")],
                [T("Belize Bank", "Belize Bank"), T("INSURANCE CORPORATION OF BELIZE", "INSURANCE CORPORATION OF BELIZE"), T("129923010120026", "129923010120026")]
              ]
            },
            link: { label: T("Go to the payments page", "Ir a la página de pagos"), href: "#/payments" },
            on: ["payments"]
          },
          {
            q: T("Can I pay in instalments?", "¿Puedo pagar en cuotas?"),
            a: T("Payment plans, called premium financing, are available through our sister company, Nationwide Cash Express. Please contact your nearest ICB branch for more information.",
                 "Los planes de pago, llamados financiamiento de prima, están disponibles a través de nuestra empresa hermana, Nationwide Cash Express. Comuníquese con su sucursal de ICB más cercana para más información."),
            on: ["payments"]
          },
          {
            q: T("How do I get a receipt for my payment?", "¿Cómo obtengo un recibo de mi pago?"),
            a: T("Receipts are automatically issued by our Cashiers for payments made in our branches. For online payments, our representative will either email or WhatsApp your receipt after the confirmation of your payments.",
                 "Nuestros cajeros emiten recibos automáticamente para los pagos hechos en nuestras sucursales. Para pagos en línea, nuestro representante le enviará el recibo por correo o WhatsApp después de confirmar su pago."),
            on: ["payments"]
          },
          {
            q: T("Can someone else pay my renewal premium?", "¿Puede otra persona pagar mi prima de renovación?"),
            a: T("Yes, renewals may be paid by someone else. Paying a premium does not automatically give the payer access to policy records or authority to make changes.",
                 "Sí, las renovaciones pueden ser pagadas por otra persona. Pagar una prima no le da automáticamente a quien paga acceso a los registros de la póliza ni autoridad para hacer cambios."),
            on: ["payments"]
          },
          {
            q: T("Can I pay in US dollars or from overseas?",
                 "¿Puedo pagar en dólares estadounidenses o desde el extranjero?"),
            a: T("Yes. Wire transfers in US dollars, Canadian dollars, euros and pounds sterling all route through Belize Bank. The full instructions for each currency are on the payments page.",
                 "Sí. Las transferencias en dólares estadounidenses, dólares canadienses, euros y libras esterlinas se cursan a través de Belize Bank. Las instrucciones completas para cada moneda están en la página de pagos."),
            link: { label: T("Overseas transfer details", "Datos para transferencias del extranjero"), href: "#/payments@overseas" },
            on: ["payments"]
          }
        ]
      },

      /* ============================== 5 ============================== */
      {
        id: "renewals",
        title: T("Renewals and cancellations", "Renovaciones y cancelaciones"),
        lead: T("Keeping cover going, changing it, or ending it.",
                "Mantener la cobertura, cambiarla o terminarla."),
        qa: [
          {
            q: T("How do I renew my policy?", "¿Cómo renuevo mi póliza?"),
            a: T("Contact your branch before your policy expires. Review the offered cover, price and requirements, and tell the team about any changes to your risk. Ask for confirmation that the renewal is in place and when it starts.",
                 "Comuníquese con su sucursal antes de que venza su póliza. Revise la cobertura ofrecida, el precio y los requisitos, e informe al equipo sobre cualquier cambio en su riesgo. Pida confirmación de que la renovación está vigente y desde cuándo."),
            on: ["contact"]
          },
          {
            q: T("When will I receive my renewal notice?", "¿Cuándo recibiré mi aviso de renovación?"),
            a: T("ICB's renewal notice and early-renewal arrangements are sent via SMS text message one month prior to the policy's end date. Our representatives may also call to remind you. Check that your contact details are up to date so the team can reach you.",
                 "El aviso de renovación de ICB y los arreglos de renovación anticipada se envían por mensaje de texto SMS un mes antes de la fecha de vencimiento de la póliza. Nuestros representantes también pueden llamarle para recordárselo. Verifique que sus datos de contacto estén actualizados para que el equipo pueda comunicarse con usted.")
          },
          {
            q: T("What if I did not receive a renewal reminder?", "¿Y si no recibí un recordatorio de renovación?"),
            a: T("Please contact your branch to verify or update your contact information. Not receiving a reminder does not by itself confirm that cover continues. Ask for confirmation of your current status.",
                 "Comuníquese con su sucursal para verificar o actualizar su información de contacto. No recibir un recordatorio no confirma por sí solo que la cobertura continúa. Pida confirmación de su estado actual.")
          },
          {
            q: T("Does my policy renew automatically?", "¿Mi póliza se renueva automáticamente?"),
            a: T("No, policies do not renew automatically.",
                 "No, las pólizas no se renuevan automáticamente.")
          },
          {
            q: T("Why has my renewal price or cover changed?",
                 "¿Por qué cambió el precio o la cobertura de mi renovación?"),
            a: T("Price or terms may reflect updated risk information, claims or product terms.",
                 "El precio o las condiciones pueden reflejar información de riesgo actualizada, reclamos o condiciones del producto.")
          },
          {
            q: T("Can I change my cover when I renew?", "¿Puedo cambiar mi cobertura al renovar?"),
            a: T("Yes, tell our representative what you want to change before the new period starts. The request may need a revised quote, valuation or inspection.",
                 "Sí. Dígale a nuestro representante qué quiere cambiar antes de que empiece el nuevo período. La solicitud puede requerir una cotización revisada, una valuación o una inspección.")
          },
          {
            q: T("How do I cancel my policy before it expires?",
                 "¿Cómo cancelo mi póliza antes de que venza?"),
            a: T("You can send a cancellation request to your branch. They will then walk you through the process.",
                 "Puede enviar una solicitud de cancelación a su sucursal. Allí le explicarán el proceso.")
          },
          {
            q: T("Will I get money back if I cancel?", "¿Me devuelven dinero si cancelo?"),
            a: T("Refunds are possible but depend on the policy terms, cancellation date, payments and other relevant factors, including claims where applicable.\n\nRefunds can be held on credit with ICB for future use by the customer. If the customer chooses a cash refund: refunds less than $500.00 are paid in cash. Refunds greater than $500.00 are paid by cheque or online transfer.",
                 "Los reembolsos son posibles pero dependen de las condiciones de la póliza, la fecha de cancelación, los pagos y otros factores relevantes, incluidos los reclamos cuando corresponda.\n\nLos reembolsos pueden quedar como crédito con ICB para uso futuro del cliente. Si el cliente elige un reembolso en efectivo: los reembolsos menores de $500.00 se pagan en efectivo. Los mayores de $500.00 se pagan con cheque o transferencia en línea.")
          },
          {
            q: T("Can I restart a policy that has lapsed?", "¿Puedo reactivar una póliza vencida?"),
            a: T("Lapsed policies can be reinstated through a new application process. Updated information, payment or an inspection may be required.",
                 "Las pólizas vencidas pueden restablecerse mediante un nuevo proceso de solicitud. Puede requerirse información actualizada, pago o una inspección.")
          }
        ]
      }

,

      /* ============================== 6 ============================== */
      {
        id: "claims",
        title: T("Claims", "Reclamos"),
        lead: T("Reporting a loss, what to send, and what happens next.",
                "Reportar una pérdida, qué enviar y qué sigue."),
        qa: [
          {
            q: T("How do I report a claim?", "¿Cómo reporto un reclamo?"),
            a: T("We're sorry to hear you've experienced a loss. We're here to help.\n\nReport your claim as soon as possible by completing the appropriate claim form, available on our website or at any ICB branch.\n\nSubmit the completed form along with any available supporting documents to your nearest ICB branch or through an approved claims submission channel.\n\nDon't have all your documents yet? That's okay. Notify us promptly, and our Claims Team will guide you through the outstanding requirements.",
                 "Lamentamos que haya sufrido una pérdida. Estamos para ayudarle.\n\nReporte su reclamo lo antes posible completando el formulario de reclamo correspondiente, disponible en nuestro sitio web o en cualquier sucursal de ICB.\n\nEntregue el formulario completado junto con los documentos de respaldo que tenga a su sucursal de ICB más cercana o por un canal aprobado de presentación de reclamos.\n\n¿Todavía no tiene todos los documentos? No hay problema. Avísenos pronto y nuestro equipo de reclamos le guiará con los requisitos pendientes."),
            link: { label: T("Start a claim", "Iniciar un reclamo"), href: "#/claims" },
            on: ["claims"]
          },
          {
            q: T("What should I do at the scene of a motor vehicle accident?",
                 "¿Qué debo hacer en el lugar de un accidente de tránsito?"),
            a: T("Your safety comes first. Follow these important steps:",
                 "Su seguridad es lo primero. Siga estos pasos importantes:"),
            list: [
              T("Stay safe: check for injuries and seek medical assistance where necessary.", "Manténgase a salvo: revise si hay lesiones y busque asistencia médica si es necesario."),
              T("Contact the police: call 911 or contact the nearest police station to report the accident.", "Contacte a la policía: llame al 911 o acuda a la estación de policía más cercana para reportar el accidente."),
              T("Avoid admitting liability: do not accept responsibility, promise payment, or negotiate a settlement at the scene.", "Evite admitir responsabilidad: no acepte la culpa, no prometa pagos ni negocie un arreglo en el lugar."),
              T("Exchange information: obtain the other driver's name, contact details, licence and vehicle registration information, and insurance details.", "Intercambie información: obtenga el nombre del otro conductor, sus datos de contacto, su licencia, la matrícula del vehículo y los datos del seguro."),
              T("Take photographs: capture vehicle positions, damage, registration plates, road markings, traffic signs, and the surrounding scene, where safe.", "Tome fotografías: capture la posición de los vehículos, los daños, las placas, las marcas viales, las señales de tránsito y el entorno, cuando sea seguro."),
              T("Identify witnesses: obtain their names and contact details.", "Identifique testigos: obtenga sus nombres y datos de contacto."),
              T("Prevent further damage: secure your vehicle and take reasonable safety precautions.", "Evite más daños: asegure su vehículo y tome precauciones razonables."),
              T("Notify ICB as soon as possible, even if you believe you were not responsible for the accident.", "Avise a ICB lo antes posible, incluso si cree que no fue responsable del accidente.")
            ],
            on: ["claims", "product:motor"]
          },
          {
            q: T("What documents do I need to submit a claim?",
                 "¿Qué documentos necesito para presentar un reclamo?"),
            a: T("The documents depend on your policy and the type of loss.",
                 "Los documentos dependen de su póliza y del tipo de pérdida."),
            groups: [
              {
                title: T("For Motor Claims", "Para reclamos de vehículo"),
                list: [
                  T("Completed Motor Claim Form.", "Formulario de reclamo de vehículo completado."),
                  T("Insurance Certificate.", "Certificado de seguro."),
                  T("Driver's valid licence, including the appropriate vehicle class.", "Licencia de conducir vigente, con la clase de vehículo correspondiente."),
                  T("Vehicle registration document.", "Documento de registro del vehículo."),
                  T("Police report or police reference details, where applicable.", "Informe policial o datos de referencia policial, cuando corresponda."),
                  T("Photographs of the accident scene and vehicle damage.", "Fotografías del lugar del accidente y de los daños al vehículo."),
                  T("Repair estimate or quotation, where requested.", "Estimado o cotización de reparación, cuando se solicite."),
                  T("Third-party and witness information, where available.", "Información de terceros y testigos, cuando esté disponible.")
                ]
              },
              {
                title: T("For Property Claims", "Para reclamos de propiedad"),
                list: [
                  T("Completed Property Claim Form.", "Formulario de reclamo de propiedad completado."),
                  T("Photographs of the damage.", "Fotografías de los daños."),
                  T("A written description of the incident, including the date and suspected cause.", "Una descripción escrita del incidente, con la fecha y la causa que se sospecha."),
                  T("Repair or replacement quotations.", "Cotizaciones de reparación o reemplazo."),
                  T("Receipts, invoices, or proof of ownership, where applicable.", "Recibos, facturas o prueba de propiedad, cuando corresponda."),
                  T("Police, fire, or technical reports, depending on the nature of the loss.", "Informes policiales, de bomberos o técnicos, según la naturaleza de la pérdida.")
                ]
              }
            ],
            after: T("Additional documents may be required following our preliminary review. Not sure what applies to you? Our Claims Team will guide you.",
                     "Pueden requerirse documentos adicionales tras nuestra revisión preliminar. ¿No está seguro de qué aplica en su caso? Nuestro equipo de reclamos le orientará."),
            on: ["claims"]
          },
          {
            q: T("How soon must I report a loss?", "¿Qué tan pronto debo reportar una pérdida?"),
            a: T("As soon as possible.\n\nPrompt reporting allows us to investigate the circumstances, inspect the damage, and guide you through the claims process.\n\nYour policy may contain specific notification requirements. If there has been a delay, advise our Claims Team of the circumstances and provide the information available.",
                 "Lo antes posible.\n\nReportar pronto nos permite investigar las circunstancias, inspeccionar los daños y orientarle en el proceso de reclamo.\n\nSu póliza puede tener requisitos específicos de notificación. Si hubo demora, informe a nuestro equipo de reclamos las circunstancias y entregue la información disponible."),
            on: ["claims"]
          },
          {
            q: T("How long does it take to settle a claim?", "¿Cuánto tarda la liquidación de un reclamo?"),
            a: T("Every claim is different.\n\nProcessing time depends on the nature of the loss, the documents submitted, liability investigations, inspections, and any additional assessments required.\n\nOnce the necessary information is available, our Claims Team can explain the next steps and provide updates on the progress of your claim.\n\nWhile we aim to handle claims efficiently, settlement timelines cannot be guaranteed.",
                 "Cada reclamo es distinto.\n\nEl tiempo de procesamiento depende de la naturaleza de la pérdida, los documentos presentados, las investigaciones de responsabilidad, las inspecciones y cualquier evaluación adicional requerida.\n\nUna vez disponible la información necesaria, nuestro equipo de reclamos puede explicarle los siguientes pasos y darle actualizaciones del avance.\n\nAunque procuramos atender los reclamos con eficiencia, los plazos de liquidación no pueden garantizarse."),
            on: ["claims"]
          },
          {
            q: T("How can I check the status of my claim?", "¿Cómo consulto el estado de mi reclamo?"),
            a: T("We're happy to help you stay informed.\n\nContact our Claims Department on 613-0579 via WhatsApp, or your nearest ICB branch, and provide your claim reference number if available.\n\nOur team can assist you with information on the current stage of your claim, any outstanding requirements, and the next steps.\n\nFor your security, we may need to verify your identity before sharing claim-specific information.",
                 "Con gusto le mantenemos informado.\n\nComuníquese con nuestro Departamento de Reclamos al 613-0579 por WhatsApp, o con su sucursal de ICB más cercana, y dé su número de referencia de reclamo si lo tiene.\n\nNuestro equipo puede informarle la etapa actual de su reclamo, los requisitos pendientes y los siguientes pasos.\n\nPor su seguridad, es posible que debamos verificar su identidad antes de compartir información específica del reclamo."),
            on: ["claims"]
          },
          {
            q: T("What does a Claims Adjuster do?", "¿Qué hace un ajustador de reclamos?"),
            a: T("A Claims Adjuster helps assess the damages and extent of your loss.\n\nDepending on the claim, the adjuster may inspect damaged property, examine photographs, review repair estimates, obtain relevant information, and prepare an assessment.\n\nThe assessment assists ICB in determining the reasonable extent and value of the damage, subject to the policy terms and applicable liability considerations.",
                 "Un ajustador de reclamos ayuda a evaluar los daños y el alcance de su pérdida.\n\nSegún el reclamo, el ajustador puede inspeccionar la propiedad dañada, examinar fotografías, revisar estimados de reparación, obtener información relevante y preparar una evaluación.\n\nLa evaluación ayuda a ICB a determinar el alcance y el valor razonable del daño, sujeto a las condiciones de la póliza y a las consideraciones de responsabilidad aplicables.")
          },
          {
            q: T("Can I start repairs before ICB inspects my vehicle or property?",
                 "¿Puedo empezar las reparaciones antes de que ICB inspeccione mi vehículo o propiedad?"),
            a: T("We recommend contacting our Claims Department before authorizing permanent repairs.\n\nThis allows us to review the damage, arrange an inspection where necessary, and advise you on repair procedures.\n\nYou should, however, take reasonable emergency measures to prevent further loss or damage when safe to do so.\n\nKeep photographs, invoices, and receipts for any emergency repairs. Expenses for towing, storage, temporary repairs, or rentals should be discussed with ICB in advance, as reimbursement is not automatic.",
                 "Recomendamos comunicarse con nuestro Departamento de Reclamos antes de autorizar reparaciones permanentes.\n\nEsto nos permite revisar el daño, coordinar una inspección cuando sea necesario y orientarle sobre los procedimientos de reparación.\n\nSin embargo, debe tomar medidas de emergencia razonables para evitar más pérdidas o daños cuando sea seguro hacerlo.\n\nGuarde fotografías, facturas y recibos de cualquier reparación de emergencia. Los gastos de grúa, almacenamiento, reparaciones temporales o alquiler deben conversarse con ICB por anticipado, ya que el reembolso no es automático."),
            on: ["claims"]
          },
          {
            q: T("What happens if my vehicle or property is declared a total loss?",
                 "¿Qué pasa si mi vehículo o propiedad se declara pérdida total?"),
            a: T("A total loss may arise when the damaged property cannot reasonably or economically be repaired, subject to the applicable policy provisions.\n\nOur Claims Team will review the assessment, insured value or applicable valuation basis, policy limits, deductibles, and any other relevant conditions.\n\nWhere applicable, we will also explain the treatment of salvage and the interests of any bank or financial institution.",
                 "Una pérdida total puede darse cuando la propiedad dañada no puede repararse de manera razonable o económica, sujeto a las disposiciones aplicables de la póliza.\n\nNuestro equipo de reclamos revisará la evaluación, el valor asegurado o la base de valuación aplicable, los límites de la póliza, los deducibles y cualquier otra condición relevante.\n\nCuando corresponda, también le explicaremos el tratamiento del salvamento y los intereses de cualquier banco o institución financiera.")
          },
          {
            q: T("How is my claim settlement calculated?", "¿Cómo se calcula la liquidación de mi reclamo?"),
            a: T("Your settlement depends on the type of insurance coverage, the assessed loss, applicable policy conditions, and any established liability.\n\nThe calculation may take into consideration:",
                 "Su liquidación depende del tipo de cobertura, la pérdida evaluada, las condiciones aplicables de la póliza y la responsabilidad establecida.\n\nEl cálculo puede tomar en cuenta:"),
            list: [
              T("Reasonable repair or replacement costs.", "Costos razonables de reparación o reemplazo."),
              T("Policy limits and sums insured.", "Límites de la póliza y sumas aseguradas."),
              T("Applicable deductibles or excesses.", "Deducibles o excesos aplicables."),
              T("Depreciation or other relevant adjustments, where applicable.", "Depreciación u otros ajustes relevantes, cuando corresponda."),
              T("Any liability or contribution attributable to the parties involved.", "Cualquier responsabilidad o contribución atribuible a las partes involucradas.")
            ],
            after: T("Our Claims Team can explain the basis of the proposed settlement.",
                     "Nuestro equipo de reclamos puede explicarle la base de la liquidación propuesta.")
          },
          {
            q: T("What if someone insured by ICB damages my vehicle, property, or causes me injury?",
                 "¿Y si alguien asegurado por ICB daña mi vehículo o mi propiedad, o me causa una lesión?"),
            a: T("You may submit a third-party claim to ICB for consideration.\n\nPlease provide details of the accident, information identifying the ICB insured's vehicle or person, supporting photographs, estimates, medical documentation where applicable, and any relevant police report or NIP.\n\nOur Claims Team will review the evidence, investigate liability, and determine whether the applicable insurance responds.\n\nPlease note that the involvement of an ICB insured vehicle does not automatically establish liability or entitlement to compensation.",
                 "Puede presentar un reclamo como tercero ante ICB para su consideración.\n\nIncluya los detalles del accidente, la información que identifique al vehículo o a la persona asegurada por ICB, fotografías de respaldo, estimados, documentación médica cuando corresponda, y cualquier informe policial o NIP relevante.\n\nNuestro equipo de reclamos revisará la evidencia, investigará la responsabilidad y determinará si el seguro aplicable responde.\n\nTenga en cuenta que la participación de un vehículo asegurado por ICB no establece automáticamente responsabilidad ni derecho a indemnización."),
            on: ["claims"]
          },
          {
            q: T("What should I do if my vehicle or property is stolen?",
                 "¿Qué debo hacer si me roban mi vehículo o mi propiedad?"),
            a: T("If you discover a theft:", "Si descubre un robo:"),
            list: [
              T("Ensure your personal safety and avoid confronting suspected offenders.", "Garantice su seguridad personal y evite enfrentar a los presuntos responsables."),
              T("Report the incident promptly to the police.", "Reporte el incidente a la policía de inmediato."),
              T("Notify ICB as soon as possible.", "Avise a ICB lo antes posible."),
              T("Provide the police reference details and relevant ownership information.", "Entregue los datos de referencia policial y la información de propiedad correspondiente."),
              T("Inform our Claims Team immediately if the stolen property is recovered.", "Informe de inmediato a nuestro equipo de reclamos si se recupera la propiedad robada.")
            ],
            after: T("The availability of theft coverage depends on your policy and its applicable terms and conditions.",
                     "La disponibilidad de cobertura por robo depende de su póliza y de sus términos y condiciones aplicables.")
          },
          {
            q: T("What should I do after a fire?", "¿Qué debo hacer después de un incendio?"),
            a: T("Your safety is our priority.\n\nIf there is an active fire, evacuate immediately and contact emergency services. Do not re-enter the premises until the relevant authorities confirm it is safe.\n\nOnce safe, notify ICB and preserve available evidence, including photographs, incident reports such as the Fire Report and Police report, and details of damaged property.\n\nTake reasonable precautions to prevent further damage, but avoid disposing of damaged items before discussing the matter with our Claims Team, unless required for safety.",
                 "Su seguridad es nuestra prioridad.\n\nSi hay un incendio activo, evacúe de inmediato y contacte a los servicios de emergencia. No vuelva a entrar al inmueble hasta que las autoridades confirmen que es seguro.\n\nUna vez a salvo, avise a ICB y conserve la evidencia disponible, incluidas fotografías, informes del incidente como el informe de bomberos y el informe policial, y detalles de la propiedad dañada.\n\nTome precauciones razonables para evitar más daños, pero evite desechar artículos dañados antes de conversarlo con nuestro equipo de reclamos, salvo que sea necesario por seguridad."),
            on: ["product:property"]
          },
          {
            q: T("How do I claim after a hurricane, flood, or natural disaster?",
                 "¿Cómo reclamo después de un huracán, inundación o desastre natural?"),
            a: T("We understand how difficult these situations can be. Your safety comes first.\n\nFollow official emergency instructions and notify ICB as soon as it is safe and practical.\n\nPhotograph the damage, prepare a list of affected items, and take reasonable measures to prevent further deterioration. Obtain a repair estimate which will include a detailed bill of quantities along with a clear name and contact number of the repairer, contractor or engineer.\n\nKeep receipts for emergency expenses and contact our Claims Department for guidance.\n\nImportant: coverage for hurricanes, floods, and other natural events depends on the insured perils, policy endorsements, exclusions, and applicable conditions.",
                 "Entendemos lo difíciles que son estas situaciones. Su seguridad es lo primero.\n\nSiga las instrucciones oficiales de emergencia y avise a ICB tan pronto sea seguro y práctico.\n\nFotografíe los daños, prepare una lista de los artículos afectados y tome medidas razonables para evitar más deterioro. Obtenga un estimado de reparación que incluya un desglose detallado de cantidades junto con el nombre y número de contacto claros del reparador, contratista o ingeniero.\n\nGuarde los recibos de gastos de emergencia y comuníquese con nuestro Departamento de Reclamos para orientación.\n\nImportante: la cobertura por huracanes, inundaciones y otros eventos naturales depende de los riesgos asegurados, los endosos de la póliza, las exclusiones y las condiciones aplicables."),
            on: ["claims", "product:property"]
          },
          {
            q: T("What if someone asks me to exaggerate damages or provide false information?",
                 "¿Y si alguien me pide exagerar los daños o dar información falsa?"),
            a: T("Always provide accurate and truthful information.\n\nSubmitting false documents, inflating repair estimates, misrepresenting circumstances, or knowingly making fraudulent claims can have serious legal and contractual consequences.\n\nIf anyone encourages you to misrepresent a claim, decline and report the matter to icb@icbinsurance.com.\n\nWe are committed to protecting honest policyholders and maintaining a fair claims process.",
                 "Dé siempre información exacta y veraz.\n\nPresentar documentos falsos, inflar estimados de reparación, tergiversar las circunstancias o hacer reclamos fraudulentos a sabiendas puede tener consecuencias legales y contractuales graves.\n\nSi alguien le anima a tergiversar un reclamo, niéguese y repórtelo a icb@icbinsurance.com.\n\nEstamos comprometidos con proteger a los asegurados honestos y mantener un proceso de reclamos justo.")
          },
          {
            q: T("Should I pay anyone who promises to speed up my claim?",
                 "¿Debo pagarle a alguien que promete acelerar mi reclamo?"),
            a: T("Absolutely not.\n\nDo not offer or make unofficial payments to anyone promising preferential treatment, accelerated approval, or guaranteed claim settlement.\n\nICB does not authorize unofficial payments to influence claim decisions.\n\nIf you receive such a request, report it immediately to icb@icbinsurance.com.\n\nYour claim should be assessed fairly, objectively, and in accordance with the applicable policy and claims procedures.",
                 "De ninguna manera.\n\nNo ofrezca ni haga pagos no oficiales a quien prometa trato preferente, aprobación acelerada o liquidación garantizada de un reclamo.\n\nICB no autoriza pagos no oficiales para influir en las decisiones sobre reclamos.\n\nSi recibe una solicitud así, repórtela de inmediato a icb@icbinsurance.com.\n\nSu reclamo debe evaluarse de forma justa, objetiva y conforme a la póliza y los procedimientos de reclamo aplicables."),
            on: ["claims"]
          }
        ]
      },

      /* ============================== 7 ============================== */
      {
        id: "identification",
        title: T("Identification checks", "Verificación de identidad"),
        lead: T("Why ICB asks for identification, and what counts.",
                "Por qué ICB pide identificación, y qué documentos sirven."),
        qa: [
          {
            q: T("Why does ICB need my identification?", "¿Por qué ICB necesita mi identificación?"),
            a: T("Identity checks help ICB confirm who it is dealing with, protect customers and meet applicable AML and CFT requirements.",
                 "La verificación de identidad ayuda a ICB a confirmar con quién trata, proteger a los clientes y cumplir los requisitos aplicables contra el lavado de dinero y el financiamiento del terrorismo."),
            on: ["resources"]
          },
          {
            q: T("What identification documents are accepted?", "¿Qué documentos de identificación se aceptan?"),
            a: T("The current accepted identification documents include: Passport, Social Security Card, National ID and Driver's License.",
                 "Los documentos de identificación aceptados actualmente incluyen: pasaporte, tarjeta de seguro social, identificación nacional y licencia de conducir."),
            on: ["resources"]
          },
          {
            q: T("What can I use as proof of address?", "¿Qué puedo usar como comprobante de domicilio?"),
            a: T("A current utility bill, dated no later than 3 months in the past, is the most common proof of address.",
                 "Un recibo de servicios vigente, con fecha no mayor a 3 meses, es el comprobante de domicilio más común."),
            on: ["resources"]
          },
          {
            q: T("What if I do not have a bill in my name?", "¿Y si no tengo un recibo a mi nombre?"),
            a: T("A verification letter, accompanied with a copy of their ID, from a person who lives with you and has a utility bill in their name, may be used in place of a utility bill.",
                 "Puede usarse una carta de verificación, acompañada de una copia de su identificación, de una persona que viva con usted y tenga un recibo de servicios a su nombre.")
          },
          {
            q: T("What if my ID is expired, lost or being renewed?",
                 "¿Y si mi identificación está vencida, perdida o en trámite de renovación?"),
            a: T("The current accepted identification documents include: Passport, Social Security Card, National ID and Driver's License. If one of the above is expired, lost or in the renewal process, you can present any of the alternates listed above.",
                 "Los documentos de identificación aceptados actualmente incluyen: pasaporte, tarjeta de seguro social, identificación nacional y licencia de conducir. Si alguno de ellos está vencido, perdido o en trámite de renovación, puede presentar cualquiera de las alternativas mencionadas.")
          },
          {
            q: T("Why do you need details of my company's owners and representatives?",
                 "¿Por qué necesitan datos de los dueños y representantes de mi empresa?"),
            a: T("ICB may need to understand who ultimately owns or controls a business and who may act for it. This helps the team verify the customer and meet applicable legal requirements.",
                 "ICB puede necesitar entender quién es el propietario o controlador final de un negocio y quién puede actuar en su nombre. Esto ayuda al equipo a verificar al cliente y cumplir los requisitos legales aplicables."),
            on: ["business"]
          },
          {
            q: T("Why are you asking for documents when I am already a customer?",
                 "¿Por qué piden documentos si ya soy cliente?"),
            a: T("Customer records sometimes need to be updated because information has changed, documents have expired or a review is due.",
                 "A veces los registros de clientes deben actualizarse porque la información cambió, los documentos vencieron o corresponde una revisión.")
          }
        ]
      },

      /* ============================== 8 ============================== */
      {
        id: "legal",
        title: T("The law and your cover", "La ley y su cobertura"),
        lead: T("What Belize requires, and what insurance does and does not settle.",
                "Lo que exige la ley en Belice, y lo que el seguro resuelve y lo que no."),
        qa: [
          {
            q: T("Do I need motor insurance to drive in Belize?",
                 "¿Necesito seguro de vehículo para conducir en Belice?"),
            a: T("Yes. Belize law requires motorists to obtain third-party motor insurance.",
                 "Sí. La ley de Belice exige a los conductores contratar un seguro de vehículo de responsabilidad civil ante terceros."),
            on: ["product:motor", "resources"]
          },
          {
            q: T("What proof of insurance must I carry or show?",
                 "¿Qué prueba de seguro debo portar o mostrar?"),
            a: T("You must have the certificate of insurance and the windshield sticker.",
                 "Debe tener el certificado de seguro y la calcomanía del parabrisas."),
            on: ["product:motor"]
          },
          {
            q: T("Is insurance the same as a vehicle license or registration?",
                 "¿El seguro es lo mismo que la licencia o el registro del vehículo?"),
            a: T("Insurance, vehicle registration and a driver's license serve different purposes. Having insurance does not by itself satisfy all other driving requirements.",
                 "El seguro, el registro del vehículo y la licencia de conducir cumplen fines distintos. Tener seguro no satisface por sí solo los demás requisitos para conducir.")
          },
          {
            q: T("Which documents explain my cover?", "¿Qué documentos explican mi cobertura?"),
            a: T("Your policy should fully explain coverage including limits, exclusions or conditions.",
                 "Su póliza debe explicar completamente la cobertura, incluidos límites, exclusiones y condiciones.")
          },
          {
            q: T("Do I still need to maintain and protect insured property?",
                 "¿Debo seguir manteniendo y protegiendo la propiedad asegurada?"),
            a: T("Insurance does not replace routine maintenance or reasonable care. Your policy may require particular security measures or other precautions. Ask a representative to explain the conditions and any concern about meeting them.",
                 "El seguro no sustituye el mantenimiento rutinario ni el cuidado razonable. Su póliza puede exigir medidas de seguridad particulares u otras precauciones. Pida a un representante que le explique las condiciones y cualquier duda sobre cómo cumplirlas.")
          },
          {
            q: T("Does making a police report also notify ICB?",
                 "¿Hacer un informe policial también notifica a ICB?"),
            a: T("No, it doesn't. You must report the loss directly to ICB.",
                 "No. Debe reportar la pérdida directamente a ICB."),
            on: ["claims"]
          },
          {
            q: T("Does a police charge decide who is responsible or whether I am covered?",
                 "¿Un cargo policial determina quién es responsable o si estoy cubierto?"),
            a: T("A police charge or report can be relevant evidence, but it does not by itself decide civil responsibility or insurance cover.",
                 "Un cargo o informe policial puede ser evidencia relevante, pero no determina por sí solo la responsabilidad civil ni la cobertura del seguro.")
          },
          {
            q: T("Can my bank require insurance, and can I choose the insurer?",
                 "¿Mi banco puede exigir un seguro, y puedo elegir la aseguradora?"),
            a: T("A lender may set insurance requirements for property securing a loan. It is your right to choose the insurer.",
                 "Un acreedor puede establecer requisitos de seguro para la propiedad que garantiza un préstamo. Usted tiene derecho a elegir la aseguradora."),
            on: ["product:property"]
          },
          {
            q: T("Can I insure something I do not own?", "¿Puedo asegurar algo que no me pertenece?"),
            a: T("No, the insured must have ownership interest in what is being insured.",
                 "No. El asegurado debe tener un interés de propiedad sobre lo que se asegura.")
          }
        ]
      }

    ]
  };

  /* Every question, flat, in document order. */
  ICB.DATA.faqAll = function () {
    var out = [];
    ICB.DATA.faq.sections.forEach(function (sec) {
      sec.qa.forEach(function (q) { out.push({ section: sec, qa: q }); });
    });
    return out;
  };

  /* The questions a given page carries in context, in document order.
     A page shows a handful beside the thing they are about; the FAQ
     page shows all of them. */
  ICB.DATA.faqFor = function (pageKey) {
    return ICB.DATA.faqAll().filter(function (x) {
      return (x.qa.on || []).indexOf(pageKey) >= 0;
    });
  };

  ICB.DATA.faqSection = function (id) {
    var list = ICB.DATA.faq.sections, i;
    for (i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  };
})();
