/* ============================================================================
   ICB.DATA.guides — the safety and information material ICB publishes.

   WHERE THIS CAME FROM. Every word below is ICB's own, read off
   icbinsurance.com/consumer-resourses on 8 Nov 2026 and out of the two
   PDFs that page links: ICB's Hurricane Guide (a four-page brochure) and
   their Travel Emergency Insurance frequently asked questions. The old
   page offered the hurricane material only as a four megabyte download
   and the fire advice only as a wall of bullets. It is set out properly
   here and the original PDFs are still offered, unmodified, beside it.

   CONTENT RULE, UNCHANGED. Nothing here is newly written insurance
   guidance. Figures, limits, wind speeds, telephone numbers and policy
   terms are ICB's, reproduced; the only liberties taken are of the
   ordering and heading kind. Where ICB's own copy had a plain
   typographical slip it is set right silently rather than reprinted.

   SPANISH. ICB publishes this material in English only. The Spanish is
   a translation made here so that half of ICB's customers can read
   their own insurer's safety advice. It needs the same review by a
   Belizean Spanish speaker that the claim forms are waiting on, and it
   is listed in OPEN-QUESTIONS.md for that. Product and policy names
   that ICB publishes in English stay in English in both languages.

   Block vocabulary, rendered by js/views/guide.js:
     { type: "h",     text }                       a heading
     { type: "p",     text }                       a paragraph
     { type: "list",  items: [...] }               a plain list
     { type: "steps", items: [...] }               a numbered list
     { type: "pairs", rows: [{ k, v }] }           a two-column table
     { type: "qa",    q, a }                       one question answered
     { type: "note",  text }                       a quiet aside
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.DATA = ICB.DATA || {};

(function () {
  "use strict";

  /* ---- ICB's Hurricane Guide ------------------------------------- */

  var hurricane = {
    id: "hurricane",
    glyph: "storm",
    nav: { en: "Hurricane guide", es: "Guía de huracanes" },
    title: { en: "Hurricane guide.", es: "Guía de huracanes." },
    lead: {
      en: "What to put aside, what the warnings mean, and what to do before, during and after a storm. This is ICB's own hurricane brochure, set out so you can read it on a phone.",
      es: "Qué guardar, qué significan los avisos, y qué hacer antes, durante y después de una tormenta. Este es el folleto de huracanes de ICB, presentado para que pueda leerlo en el teléfono."
    },
    seoDescription: {
      en: "ICB's hurricane guide for Belize: the emergency numbers, the warning phases, the hurricane scale, a supplies checklist, and what to do before, during and after a storm.",
      es: "La guía de huracanes de ICB para Belice: los números de emergencia, las fases de aviso, la escala de huracanes, una lista de suministros, y qué hacer antes, durante y después de una tormenta."
    },
    doc: {
      file: "assets/docs/icb-hurricane-guide.pdf",
      label: { en: "ICB Hurricane Guide", es: "Guía de huracanes de ICB" },
      meta: { en: "PDF, 4 pages, includes the storm tracking chart", es: "PDF, 4 páginas, incluye el mapa de seguimiento de tormentas" }
    },
    intro: {
      en: "ICB has been insuring Belizeans since 1982, and being ready for a storm is part of what we are here for. The advice below is the brochure our branches hand out. The tracking chart, which you plot a storm's position on by latitude and longitude, is in the download.",
      es: "ICB asegura a los beliceños desde 1982, y estar preparados para una tormenta es parte de lo que hacemos. Los consejos a continuación son los del folleto que reparten nuestras sucursales. El mapa de seguimiento, donde se marca la posición de una tormenta por latitud y longitud, está en la descarga."
    },
    blocks: [
      { type: "h", text: { en: "Emergency numbers", es: "Números de emergencia" } },
      { type: "pairs", rows: [
        { k: { en: "Police", es: "Policía" }, v: "911" },
        { k: { en: "Fire", es: "Bomberos" }, v: "911" },
        { k: "B.E.R.T.", v: "223-3292 / 223-0078" },
        { k: "B.E.L.", v: "227-0954" },
        { k: "N.E.M.O.", v: "936" },
        { k: { en: "Coast Guard", es: "Guardia Costera" }, v: "222-5262" },
        { k: { en: "Marine radio", es: "Radio marina" }, v: { en: "Channel 16", es: "Canal 16" } }
      ] },

      { type: "h", text: { en: "The two official warnings", es: "Los dos avisos oficiales" } },
      { type: "p", text: {
        en: "A hurricane watch means a hurricane may strike the area within 36 hours. A hurricane warning means one is expected to strike in 24 hours or less.",
        es: "Un hurricane watch significa que un huracán podría golpear la zona dentro de 36 horas. Un hurricane warning significa que se espera que golpee en 24 horas o menos."
      } },
      { type: "p", text: {
        en: "Pay close attention to official announcements on television and radio from the National Emergency Management Organization (N.E.M.O.). Do not pay attention to rumours.",
        es: "Preste atención a los anuncios oficiales de la National Emergency Management Organization (N.E.M.O.) en televisión y radio. No haga caso de rumores."
      } },

      { type: "h", text: { en: "The flag phases", es: "Las fases de bandera" } },
      { type: "pairs", rows: [
        { k: { en: "Alert, first phase", es: "Alert, primera fase" }, v: { en: "May threaten within 72 hours", es: "Puede amenazar dentro de 72 horas" } },
        { k: { en: "Watch, second phase", es: "Watch, segunda fase" }, v: { en: "May threaten within 36 hours", es: "Puede amenazar dentro de 36 horas" } },
        { k: { en: "Warning, third phase", es: "Warning, tercera fase" }, v: { en: "Likely to strike within 24 hours", es: "Probable que golpee dentro de 24 horas" } },
        { k: { en: "All clear, fourth phase", es: "All clear, cuarta fase" }, v: { en: "The hurricane has passed", es: "El huracán ha pasado" } }
      ] },

      { type: "h", text: { en: "The hurricane scale", es: "La escala de huracanes" } },
      { type: "pairs", rows: [
        { k: { en: "Tropical storm", es: "Tormenta tropical" }, v: { en: "Winds 39 to 73 mph", es: "Vientos de 39 a 73 mph" } },
        { k: { en: "Category 1 hurricane", es: "Huracán categoría 1" }, v: { en: "Winds 74 to 95 mph", es: "Vientos de 74 a 95 mph" } },
        { k: { en: "Category 2 hurricane", es: "Huracán categoría 2" }, v: { en: "Winds 96 to 110 mph", es: "Vientos de 96 a 110 mph" } },
        { k: { en: "Category 3 hurricane", es: "Huracán categoría 3" }, v: { en: "Winds 111 to 130 mph", es: "Vientos de 111 a 130 mph" } },
        { k: { en: "Category 4 hurricane", es: "Huracán categoría 4" }, v: { en: "Winds 131 to 155 mph", es: "Vientos de 131 a 155 mph" } }
      ] },

      { type: "h", text: { en: "Six things to stock", es: "Seis cosas que debe tener" } },
      { type: "p", text: {
        en: "There are six basics to keep in a disaster supplies kit: water, food, clothing and bedding, tools and emergency supplies, hygiene supplies, and special items for anyone in the household who needs them.",
        es: "Hay seis elementos básicos para un kit de suministros ante desastres: agua, comida, ropa y ropa de cama, herramientas y suministros de emergencia, artículos de higiene, y artículos especiales para quien en la casa los necesite."
      } },

      { type: "h", text: { en: "Water", es: "Agua" } },
      { type: "p", text: {
        en: "A normally active person needs at least one quart of drinking water a day. Heat and hard physical work can double that, and children, nursing mothers and anyone unwell will need more. Store one gallon per person per day, in covered plastic containers, and keep at least a three day supply for each person in the household.",
        es: "Una persona normalmente activa necesita al menos un cuarto de galón de agua potable al día. El calor y el esfuerzo físico pueden duplicar esa cantidad, y los niños, las madres lactantes y cualquier persona enferma necesitarán más. Guarde un galón por persona por día, en recipientes plásticos con tapa, y tenga al menos tres días de reserva para cada persona de la casa."
      } },

      { type: "h", text: { en: "Food", es: "Comida" } },
      { type: "p", text: {
        en: "Keep at least a three day supply of food that needs no refrigeration, no cooking and little or no water. Choose things that are compact and light: tinned meat, fruit and vegetables; tinned juice, milk and soup; tortillas, journey cake and bread; high energy food such as peanut butter, jelly, crackers, cereal and vitamins; and some comfort food, biscuits, sweets, coffee, tea and baby food.",
        es: "Tenga al menos tres días de comida que no requiera refrigeración, cocción ni apenas agua. Elija cosas compactas y ligeras: carne, frutas y verduras enlatadas; jugo, leche y sopa enlatados; tortillas, journey cake y pan; alimentos de alta energía como mantequilla de maní, jalea, galletas saladas, cereal y vitaminas; y algo de comida reconfortante, galletas, dulces, café, té y comida para bebé."
      } },

      { type: "h", text: { en: "Tools and emergency supplies", es: "Herramientas y suministros de emergencia" } },
      { type: "list", items: [
        { en: "A battery operated radio, and spare batteries for everything", es: "Un radio de pilas, y pilas de repuesto para todo" },
        { en: "A flashlight", es: "Una linterna" },
        { en: "Matches in a waterproof container or a lighter, a tin opener and a utility knife", es: "Fósforos en recipiente impermeable o un encendedor, un abrelatas y una navaja multiusos" },
        { en: "Paper and a pen or pencil", es: "Papel y bolígrafo o lápiz" },
        { en: "Needles, thread and scissors", es: "Agujas, hilo y tijeras" },
        { en: "A wrench, pliers, hammer, nails, a saw and screwdrivers, both flathead and Phillips", es: "Llave inglesa, alicates, martillo, clavos, serrucho y destornilladores, planos y de cruz" },
        { en: "Rope, nylon for preference", es: "Cuerda, de nylon preferiblemente" },
        { en: "Plastic sheeting and duct tape", es: "Plástico en lámina y cinta adhesiva de tela" },
        { en: "A whistle", es: "Un silbato" },
        { en: "Plastic bags in various sizes that seal, and plastic plates, cups and utensils", es: "Bolsas plásticas de varios tamaños que cierren, y platos, vasos y cubiertos plásticos" }
      ] },

      { type: "h", text: { en: "Hygiene supplies", es: "Artículos de higiene" } },
      { type: "list", items: [
        { en: "Toilet paper and personal hygiene items", es: "Papel higiénico y artículos de higiene personal" },
        { en: "Feminine hygiene products", es: "Productos de higiene femenina" },
        { en: "Plastic bags and ties, and plastic storage containers", es: "Bolsas plásticas con amarres, y recipientes plásticos de almacenamiento" },
        { en: "Disinfectant, soap and detergent", es: "Desinfectante, jabón y detergente" },
        { en: "Household bleach", es: "Cloro de uso doméstico" }
      ] },

      { type: "h", text: { en: "Clothing and bedding", es: "Ropa y ropa de cama" } },
      { type: "list", items: [
        { en: "At least one complete change of clothes and footwear per person", es: "Al menos una muda completa de ropa y calzado por persona" },
        { en: "Sturdy shoes or rubber boots", es: "Zapatos resistentes o botas de hule" },
        { en: "Hats and raincoats", es: "Sombreros e impermeables" },
        { en: "Blankets, sleeping bags, cots, foam, mosquito nets, small pillows and cushions", es: "Cobijas, sacos de dormir, catres, colchonetas, mosquiteros, almohadas pequeñas y cojines" }
      ] },

      { type: "h", text: { en: "Special items", es: "Artículos especiales" } },
      { type: "p", text: {
        en: "Remember anyone in the household with particular needs, an infant, an older person, anyone disabled.",
        es: "Recuerde a quien en la casa tenga necesidades particulares, un bebé, una persona mayor, alguien con discapacidad."
      } },
      { type: "list", items: [
        { en: "For babies: bottled water, formula or powdered milk, bottles, nappies, baby wipes and skin oil", es: "Para bebés: agua embotellada, fórmula o leche en polvo, biberones, pañales, toallitas y aceite para la piel" },
        { en: "For adults and older people: medication, spare clothing, spectacles or contact lenses, hearing aids and their batteries, dentures, prescription medicines, wheelchairs and walking aids", es: "Para adultos y personas mayores: medicamentos, ropa adicional, lentes o lentes de contacto, audífonos y sus pilas, dentaduras, medicamentos recetados, sillas de ruedas y andaderas" },
        { en: "For pregnant women: a small kit for mother and child in case of an emergency delivery", es: "Para mujeres embarazadas: un pequeño kit para madre e hijo por si hay un parto de emergencia" }
      ] },

      { type: "h", text: { en: "When a hurricane threatens", es: "Cuando amenaza un huracán" } },
      { type: "p", text: {
        en: "Food and water. Turn the refrigerator and freezer to their coldest setting and open them only when you must. Freeze water in plastic jugs and use them to fill the empty space in the freezer, which keeps the food cold longer. Prepare the emergency water supply before the storm arrives, planning one quart of drinking water per person per day. Sterilise the bathtub, jugs, bottles, cooking utensils and other containers by scrubbing them thoroughly, swabbing with bleach and rinsing. Let them dry, then fill them. That water is for washing, not drinking.",
        es: "Comida y agua. Ponga el refrigerador y el congelador en el ajuste más frío y ábralos solo cuando sea necesario. Congele agua en jarras plásticas y úselas para llenar el espacio vacío del congelador, lo que mantiene la comida fría por más tiempo. Prepare la reserva de agua de emergencia antes de que llegue la tormenta, calculando un cuarto de galón de agua potable por persona por día. Esterilice la bañera, jarras, botellas, utensilios de cocina y otros recipientes restregándolos bien, pasándoles cloro y enjuagándolos. Déjelos secar y luego llénelos. Esa agua es para limpieza, no para beber."
      } },
      { type: "p", text: {
        en: "Property. Latch the shutters or fit the pre-cut plywood over windows and doors. Taping a window will not stop it shattering, though it may reduce flying glass. Unplug appliances you do not need. Bring in anything that can be blown away, bins, garden tools, furniture, plants, and anchor whatever cannot come inside.",
        es: "Propiedad. Asegure los postigos o coloque la madera contrachapada ya cortada sobre ventanas y puertas. Poner cinta en una ventana no evita que se rompa, aunque puede reducir los vidrios que salgan volando. Desconecte los aparatos que no necesite. Meta todo lo que el viento pueda llevarse, botes de basura, herramientas de jardín, muebles, plantas, y ancle lo que no pueda entrar."
      } },
      { type: "p", text: {
        en: "Your vehicle. Fill the tank early. Fuel may not be available for days after the storm.",
        es: "Su vehículo. Llene el tanque con anticipación. Puede que no haya combustible durante días después de la tormenta."
      } },
      { type: "p", text: {
        en: "Valuables and documents. Put valuables and personal papers in waterproof containers and store them as high as you can. Plastic bags will do for larger items. Make sure you have enough cash.",
        es: "Objetos de valor y documentos. Coloque los objetos de valor y los papeles personales en recipientes impermeables y guárdelos lo más alto posible. Para los artículos grandes sirven bolsas plásticas. Asegúrese de tener suficiente efectivo."
      } },
      { type: "p", text: {
        en: "Boat owners. A small boat on a trailer should go inside a garage or warehouse. If it has to stay outside, attach the trailer tongue to something firm in the ground, let the air out of the tyres and make sure the boat is tied to the trailer. If the boat is in a marina, read the contract carefully: some marinas require you to remove it once a hurricane watch is announced. The safekeeping of your boat is your responsibility.",
        es: "Dueños de embarcaciones. Un bote pequeño sobre remolque debe guardarse en un garaje o bodega. Si tiene que quedarse afuera, amarre la lanza del remolque a algo firme en el suelo, baje el aire de las llantas y asegúrese de que el bote esté amarrado al remolque. Si el bote está en una marina, lea bien el contrato: algunas marinas exigen que lo retire en cuanto se anuncie un hurricane watch. El resguardo de su bote es su responsabilidad."
      } },

      { type: "h", text: { en: "During a hurricane", es: "Durante un huracán" } },
      { type: "p", text: {
        en: "Conditions can turn bad hours before the hurricane itself arrives. Stay indoors. An interior room, or a room with no windows, is usually safest.",
        es: "Las condiciones pueden empeorar horas antes de que llegue el huracán. Quédese adentro. Un cuarto interior, o un cuarto sin ventanas, suele ser el más seguro."
      } },
      { type: "p", text: {
        en: "If the eye passes over you, stay indoors unless a repair absolutely cannot wait. The wind and rain may stop for a few minutes or for more than an hour, and then the wind returns suddenly from the opposite direction, possibly harder than before.",
        es: "Si el ojo pasa sobre usted, quédese adentro a menos que una reparación realmente no pueda esperar. El viento y la lluvia pueden parar por unos minutos o por más de una hora, y luego el viento vuelve de repente desde la dirección contraria, posiblemente con más fuerza que antes."
      } },
      { type: "p", text: { en: "If the wind becomes strong:", es: "Si el viento se vuelve fuerte:" } },
      { type: "list", items: [
        { en: "Keep away from windows and doors even where they are covered. Take refuge in a small interior room, a closet or a hallway, and take a battery powered radio or television and a flashlight with you.", es: "Manténgase lejos de ventanas y puertas aunque estén cubiertas. Refúgiese en un cuarto interior pequeño, un clóset o un pasillo, y lleve consigo un radio o televisor de pilas y una linterna." },
        { en: "Close all interior doors. Secure and brace the external ones, particularly double inward opening doors and garage doors.", es: "Cierre todas las puertas interiores. Asegure y refuerce las exteriores, en especial las puertas dobles que abren hacia adentro y las de garaje." },
        { en: "In a two storey house, go to an interior room on the ground floor, a bathroom, a closet or under the stairs.", es: "En una casa de dos pisos, vaya a un cuarto interior de la planta baja, un baño, un clóset o debajo de la escalera." },
        { en: "In a taller building away from the water, go to the first or second floor and take refuge in a hallway or another interior room away from windows. Interior stairwells and the areas around lift shafts are usually the strongest part of a building.", es: "En un edificio más alto y alejado del agua, vaya al primer o segundo piso y refúgiese en un pasillo u otro cuarto interior lejos de las ventanas. Las escaleras interiores y las zonas alrededor de los ductos de ascensor suelen ser la parte más resistente del edificio." },
        { en: "Lie on the floor under a table or another sturdy object.", es: "Acuéstese en el piso debajo de una mesa u otro objeto resistente." }
      ] },

      { type: "h", text: { en: "After a hurricane", es: "Después de un huracán" } },
      { type: "p", text: {
        en: "Stay indoors until the official all clear is given, and keep listening to the battery radio or television. If you evacuated, do not go home until officials say your area is ready. Carry proof of residence, a driver's licence will do.",
        es: "Quédese adentro hasta que se dé el all clear oficial, y siga escuchando el radio o televisor de pilas. Si evacuó, no regrese a casa hasta que las autoridades digan que su zona está lista. Lleve prueba de residencia, una licencia de conducir sirve."
      } },
      { type: "list", items: [
        { en: "The telephone. Use it only for an emergency, and call emergency services only where life is threatened. Do not report a single household losing electricity, water or telephone service: those companies have plans to restore service. Do call the police or the utility to report a downed power line or a broken water main.", es: "El teléfono. Úselo solo para una emergencia, y llame a los servicios de emergencia solo cuando haya vidas en peligro. No reporte que una sola casa se quedó sin electricidad, agua o teléfono: esas empresas tienen planes para restablecer el servicio. Sí llame a la policía o a la empresa para reportar un cable caído o una tubería principal rota." },
        { en: "Water. Supplies may be contaminated during a hurricane. Use only your pre-stored water for drinking and cooking.", es: "El agua. El suministro puede contaminarse durante un huracán. Use solo el agua que guardó para beber y cocinar." },
        { en: "Food. Check anything from the refrigerator for spoilage before you use it.", es: "La comida. Revise si lo que saque del refrigerador se echó a perder antes de usarlo." },
        { en: "Injuries. Careless use of equipment causes most injuries after a storm. Be careful with open flames, and run a kerosene stove outside the house, never inside. Cutting up a fallen tree is dangerous work, especially with a chain saw, which can snap back or break its chain.", es: "Lesiones. El uso descuidado de equipo causa la mayoría de las lesiones después de una tormenta. Tenga cuidado con las llamas abiertas, y use una estufa de kerosene afuera de la casa, nunca adentro. Cortar un árbol caído es trabajo peligroso, sobre todo con motosierra, que puede rebotar o romper la cadena." },
        { en: "Generators. Connecting a portable generator to the house wiring is dangerous. Turn the electricity off at the main breaker or fuse box first, disconnect the generator before restoring power to the house, and run the generator outside only, feeding a heavy duty, properly earthed extension lead indoors.", es: "Generadores. Conectar un generador portátil al cableado de la casa es peligroso. Apague primero la electricidad en el breaker principal o la caja de fusibles, desconecte el generador antes de restablecer la corriente en la casa, y opere el generador solo afuera, llevando hacia adentro una extensión de uso rudo debidamente aterrizada." },
        { en: "Electricity. Never touch a fallen or low hanging wire of any kind. A wire that looks harmless may be crossed with a live one, so treat every line you see as deadly, on the ground, hanging loose or caught on something. Stay away from puddles with a wire in them, and call B.E.L. straight away to report a downed line.", es: "Electricidad. Nunca toque un cable caído o colgando bajo, de ningún tipo. Un cable que parece inofensivo puede estar cruzado con uno vivo, así que trate cada línea que vea como mortal, en el suelo, colgando o enganchada en algo. Aléjese de los charcos con un cable adentro, y llame de inmediato a B.E.L. para reportar una línea caída." }
      ] },

      { type: "h", text: { en: "Your pets", es: "Sus mascotas" } },
      { type: "list", items: [
        { en: "Think ahead. Talk to a friend or relative who lives somewhere secure, and ask whether their home would be open to you and your animal if a storm threatens.", es: "Piense con anticipación. Hable con un amigo o familiar que viva en un lugar seguro, y pregunte si su casa estaría abierta para usted y su animal si amenaza una tormenta." },
        { en: "Plan ahead. Keep identification, vaccinations and a proper collar ready, and stock up on pet food. Do not leave a pet at home during a hurricane: a secure room and a few days of food and water do not necessarily mean safety.", es: "Planee con anticipación. Tenga lista la identificación, las vacunas y un collar adecuado, y abastézcase de comida para mascotas. No deje una mascota en casa durante un huracán: un cuarto seguro y unos días de comida y agua no significan necesariamente seguridad." },
        { en: "After the storm. Be careful letting a pet outdoors. Familiar smells and landmarks may have changed and an animal can easily get lost, downed power lines are a danger, and food and water outside may be contaminated.", es: "Después de la tormenta. Tenga cuidado al dejar salir a una mascota. Los olores y puntos de referencia conocidos pueden haber cambiado y un animal se pierde con facilidad, los cables caídos son un peligro, y la comida y el agua de afuera pueden estar contaminadas." }
      ] },

      { type: "h", text: { en: "Terms to know", es: "Términos que conviene conocer" } },
      { type: "pairs", rows: [
        { k: { en: "Tropical wave or disturbance", es: "Onda o perturbación tropical" }, v: { en: "A cluster of cloud or thunderstorms with no organised circulation, moving through the tropics.", es: "Un grupo de nubes o tormentas eléctricas sin circulación organizada, que se desplaza por los trópicos." } },
        { k: { en: "Tropical depression", es: "Depresión tropical" }, v: { en: "An organised system of cloud and thunderstorms with a defined circulation and top winds under 39 mph.", es: "Un sistema organizado de nubes y tormentas con circulación definida y vientos máximos menores a 39 mph." } },
        { k: { en: "Tropical storm", es: "Tormenta tropical" }, v: { en: "An organised system of strong thunderstorms with a defined circulation and top winds of 39 to 73 mph. A storm is given a name at this strength, and can become a hurricane quickly.", es: "Un sistema organizado de tormentas fuertes con circulación definida y vientos máximos de 39 a 73 mph. A esta fuerza la tormenta recibe nombre, y puede volverse huracán rápidamente." } },
        { k: { en: "Tropical storm warning", es: "Tropical storm warning" }, v: { en: "Tropical storm conditions are expected in the named area within 24 hours.", es: "Se esperan condiciones de tormenta tropical en la zona indicada dentro de 24 horas." } },
        { k: { en: "Hurricane", es: "Huracán" }, v: { en: "An intense tropical weather system with a well defined circulation and sustained winds of 74 mph or more.", es: "Un sistema tropical intenso con circulación bien definida y vientos sostenidos de 74 mph o más." } },
        { k: { en: "Storm surge", es: "Marejada ciclónica" }, v: { en: "A dome of sea water up to 20 feet high that arrives with a hurricane and can affect as much as 100 miles of coastline. It is responsible for most hurricane deaths, and evacuation zones are drawn by how likely they are to be flooded by it.", es: "Una masa de agua de mar de hasta 20 pies de alto que llega con un huracán y puede afectar hasta 100 millas de costa. Es responsable de la mayoría de las muertes por huracán, y las zonas de evacuación se trazan según la probabilidad de que la inunde." } },
        { k: { en: "Hurricane watch", es: "Hurricane watch" }, v: { en: "Hurricane conditions are possible in the named area, usually within 36 hours. Act now to protect your family and your property in case a warning follows.", es: "Son posibles condiciones de huracán en la zona indicada, normalmente dentro de 36 horas. Actúe ya para proteger a su familia y su propiedad por si sigue un warning." } },
        { k: { en: "Hurricane warning", es: "Hurricane warning" }, v: { en: "Hurricane conditions are expected in the named area within 24 hours. Finish every preparation and leave a dangerous or low lying place as soon as you can.", es: "Se esperan condiciones de huracán en la zona indicada dentro de 24 horas. Termine todos los preparativos y salga cuanto antes de un lugar peligroso o bajo." } }
      ] },
      { type: "note", text: {
        en: "If a storm has damaged your property, start your claim with the Property Claim Form, or the Property Catastrophe Claim Form where ICB has told you to use it. Both can be filled in on this site.",
        es: "Si una tormenta dañó su propiedad, inicie su reclamo con el Property Claim Form, o el Property Catastrophe Claim Form donde ICB le haya indicado usarlo. Ambos se pueden llenar en este sitio."
      } }
    ]
  };

  /* ---- ICB's fire prevention advice ------------------------------- */

  var fire = {
    id: "fire-safety",
    glyph: "shield",
    nav: { en: "Fire prevention", es: "Prevención de incendios" },
    title: { en: "Fire prevention.", es: "Prevención de incendios." },
    lead: {
      en: "ICB's fire prevention advice for the home, as published on icbinsurance.com.",
      es: "Los consejos de prevención de incendios de ICB para el hogar, tal como los publica en icbinsurance.com."
    },
    seoDescription: {
      en: "ICB's fire prevention advice for Belizean homes: wiring, electrical outlets, cooking, butane tanks, clearing dry weeds, and the equipment a building should carry.",
      es: "Los consejos de prevención de incendios de ICB para hogares beliceños: cableado, tomacorrientes, cocina, tanques de butano, limpieza de maleza seca, y el equipo que debe tener un edificio."
    },
    blocks: [
      { type: "h", text: { en: "Around the house", es: "En la casa" } },
      { type: "list", items: [
        { en: "Check appliance cords and light switches to be sure there is no faulty wiring.", es: "Revise los cables de los aparatos y los interruptores de luz para asegurarse de que no haya cableado defectuoso." },
        { en: "Never overload an electrical outlet.", es: "Nunca sobrecargue un tomacorriente." },
        { en: "Turn appliances off when they are not in use.", es: "Apague los aparatos cuando no estén en uso." },
        { en: "Leave space for ventilation around televisions, stereos, computers and other entertainment equipment.", es: "Deje espacio de ventilación alrededor de televisores, equipos de sonido, computadoras y otros equipos de entretenimiento." },
        { en: "Store lighters and matches out of the reach of children.", es: "Guarde encendedores y fósforos fuera del alcance de los niños." },
        { en: "Do not smoke in bed.", es: "No fume en la cama." }
      ] },
      { type: "h", text: { en: "In the kitchen", es: "En la cocina" } },
      { type: "list", items: [
        { en: "Do not wear long sleeves, baggy clothes, a necktie or loose hair when cooking over an open flame.", es: "No use mangas largas, ropa holgada, corbata ni el cabello suelto al cocinar con llama abierta." },
        { en: "Turn the handles of your pots inward so they cannot be knocked over.", es: "Voltee los mangos de las ollas hacia adentro para que no puedan volcarse." },
        { en: "Never put metal, aluminium included, in a microwave oven.", es: "Nunca meta metal, incluido el aluminio, en un horno de microondas." },
        { en: "Keep butane tanks in an open area and check them often for leaks.", es: "Mantenga los tanques de butano en un área abierta y revíselos con frecuencia por fugas." }
      ] },
      { type: "h", text: { en: "Outside, and what the building should carry", es: "Afuera, y qué debe tener el edificio" } },
      { type: "list", items: [
        { en: "Keep the property clear of dry weeds, tree branches and litter, especially through the dry season.", es: "Mantenga la propiedad libre de maleza seca, ramas y basura, sobre todo durante la temporada seca." },
        { en: "A building should be fitted with fire extinguishers, sprinkler systems and smoke detectors.", es: "Un edificio debe contar con extintores, sistemas de rociadores y detectores de humo." }
      ] },
      { type: "note", text: {
        en: "If fire has damaged your property, start your claim with the Property Claim Form, which can be filled in on this site.",
        es: "Si un incendio dañó su propiedad, inicie su reclamo con el Property Claim Form, que se puede llenar en este sitio."
      } }
    ]
  };

  /* ---- ICB's travel emergency insurance questions ------------------ */

  var travel = {
    id: "travel-faqs",
    glyph: "compass",
    nav: { en: "Travel insurance FAQs", es: "Preguntas sobre Travel Insurance" },
    title: { en: "Travel insurance questions.", es: "Preguntas sobre travel insurance." },
    lead: {
      en: "The questions ICB answers most often about the travel emergency policy for visitors to Belize, and what the policy pays.",
      es: "Las preguntas que ICB responde con más frecuencia sobre la póliza de emergencia de viaje para visitantes a Belice, y lo que la póliza paga."
    },
    seoDescription: {
      en: "ICB's answers on travel emergency insurance for visitors to Belize: what it costs, how long it covers, COVID-19 cover, pre-existing conditions, and the full schedule of benefits.",
      es: "Las respuestas de ICB sobre travel emergency insurance para visitantes a Belice: cuánto cuesta, cuánto tiempo cubre, cobertura de COVID-19, condiciones preexistentes, y el cuadro completo de beneficios."
    },
    doc: {
      file: "assets/docs/icb-travel-insurance-faqs.pdf",
      label: { en: "Travel Emergency Insurance FAQs", es: "Travel Emergency Insurance FAQs" },
      meta: { en: "PDF, as published by ICB", es: "PDF, tal como lo publica ICB" }
    },
    blocks: [
      { type: "h", text: { en: "Buying the cover", es: "Comprar la cobertura" } },
      { type: "qa",
        q: { en: "How can I purchase coverage?", es: "¿Cómo puedo comprar la cobertura?" },
        a: { en: "Through ICB's travel insurance site, belizetravelinsurance.com.", es: "A través del sitio de travel insurance de ICB, belizetravelinsurance.com." } },
      { type: "qa",
        q: { en: "What does the policy cost?", es: "¿Cuánto cuesta la póliza?" },
        a: { en: "US$18.00 per visitor.", es: "US$18.00 por visitante." } },
      { type: "qa",
        q: { en: "Is there a family plan?", es: "¿Hay un plan familiar?" },
        a: { en: "No. Each member of the family needs a separate policy.", es: "No. Cada miembro de la familia necesita una póliza aparte." } },
      { type: "qa",
        q: { en: "Can I buy more than one plan to increase my benefits?", es: "¿Puedo comprar más de un plan para aumentar mis beneficios?" },
        a: { en: "No. One policy per visitor per trip.", es: "No. Una póliza por visitante por viaje." } },
      { type: "qa",
        q: { en: "How long does the cover last?", es: "¿Cuánto dura la cobertura?" },
        a: { en: "Twenty one days, starting on your arrival into Belize. Twenty one days is also the maximum the policy will provide.", es: "Veintiún días, a partir de su llegada a Belice. Veintiún días es también el máximo que ofrece la póliza." } },

      { type: "h", text: { en: "Proving you have it", es: "Comprobar que la tiene" } },
      { type: "qa",
        q: { en: "How do I prove I have purchased the cover?", es: "¿Cómo compruebo que compré la cobertura?" },
        a: { en: "Once you have paid online you receive confirmation of payment, and the system generates an electronic certificate you can print or save. That certificate is your proof of purchase.", es: "Una vez que pague en línea recibe la confirmación del pago, y el sistema genera un certificado electrónico que puede imprimir o guardar. Ese certificado es su comprobante de compra." } },
      { type: "qa",
        q: { en: "How do I get another copy of my certificate?", es: "¿Cómo obtengo otra copia de mi certificado?" },
        a: { en: "Log in at belizetravelinsurance.com, select the policy and print it. You can also ask for help at info@icbinsurance.com.", es: "Inicie sesión en belizetravelinsurance.com, seleccione la póliza e imprímala. También puede pedir ayuda en info@icbinsurance.com." } },
      { type: "qa",
        q: { en: "Would an international insurance policy be accepted instead?", es: "¿Se aceptaría una póliza de seguro internacional en su lugar?" },
        a: { en: "No. The policy must be issued by an insurance company registered in Belize and must have been approved by the Supervisor of Insurance in Belize.", es: "No. La póliza debe ser emitida por una compañía de seguros registrada en Belice y debe haber sido aprobada por el Supervisor of Insurance de Belice." } },

      { type: "h", text: { en: "COVID-19", es: "COVID-19" } },
      { type: "qa",
        q: { en: "Does the policy cover the COVID-19 test required before entry into Belize?", es: "¿La póliza cubre la prueba de COVID-19 requerida antes de entrar a Belice?" },
        a: { en: "No.", es: "No." } },
      { type: "qa",
        q: { en: "Does the policy include COVID-19 coverage?", es: "¿La póliza incluye cobertura de COVID-19?" },
        a: { en: "Yes. Medical emergency treatment or services that become necessary because of COVID-19 are covered, up to the policy limit.", es: "Sí. El tratamiento o los servicios de emergencia médica que se vuelvan necesarios por COVID-19 están cubiertos, hasta el límite de la póliza." } },
      { type: "qa",
        q: { en: "Does it cover mandatory quarantine costs?", es: "¿Cubre los costos de cuarentena obligatoria?" },
        a: { en: "Yes. The benefits include the cost of mandatory quarantine lodging or accommodation after a positive COVID-19 diagnosis.", es: "Sí. Los beneficios incluyen el costo de hospedaje o alojamiento por cuarentena obligatoria tras un diagnóstico positivo de COVID-19." } },

      { type: "h", text: { en: "Conditions, deductibles and waiting", es: "Condiciones, deducibles y espera" } },
      { type: "qa",
        q: { en: "Does the policy cover pre-existing conditions?", es: "¿La póliza cubre condiciones preexistentes?" },
        a: { en: "Yes. Medical emergency services, treatment or supplies relating to a pre-existing condition are covered, up to the limit shown in the schedule of benefits.", es: "Sí. Los servicios, tratamientos o suministros de emergencia médica relacionados con una condición preexistente están cubiertos, hasta el límite que muestra el cuadro de beneficios." } },
      { type: "qa",
        q: { en: "Is there a deductible or a copayment?", es: "¿Hay deducible o copago?" },
        a: { en: "No. The policy pays 100% of the costs up to the limits in the schedule of benefits.", es: "No. La póliza paga el 100% de los costos hasta los límites del cuadro de beneficios." } },
      { type: "qa",
        q: { en: "Is there a waiting period before the cover is active?", es: "¿Hay un período de espera antes de que la cobertura esté activa?" },
        a: { en: "No. The cover is effective on your arrival into Belize.", es: "No. La cobertura entra en vigor a su llegada a Belice." } },

      { type: "h", text: { en: "Schedule of benefits", es: "Cuadro de beneficios" } },
      { type: "pairs", rows: [
        { k: { en: "Maximum policy limit", es: "Límite máximo de la póliza" }, v: "US$50,000.00" },
        { k: { en: "Medical emergency services, including hospital services, in-hospital miscellaneous charges, out-patient charges, emergency room, emergency surgery, local ambulance and prescription drugs", es: "Servicios de emergencia médica, incluidos servicios hospitalarios, cargos varios intrahospitalarios, cargos ambulatorios, sala de emergencia, cirugía de emergencia, ambulancia local y medicamentos recetados" }, v: { en: "100% of eligible expenses, up to the policy limit", es: "100% de los gastos elegibles, hasta el límite de la póliza" } },
        { k: { en: "Repatriation of mortal remains", es: "Repatriación de restos mortales" }, v: { en: "Up to US$5,000", es: "Hasta US$5,000" } },
        { k: { en: "Emergency air evacuation, and transportation of a close relative", es: "Evacuación aérea de emergencia, y transporte de un familiar cercano" }, v: { en: "Up to a combined maximum of US$20,000", es: "Hasta un máximo combinado de US$20,000" } },
        { k: { en: "Emergency expenses relating to a pre-existing condition", es: "Gastos de emergencia relacionados con una condición preexistente" }, v: { en: "Up to a combined maximum of US$25,000", es: "Hasta un máximo combinado de US$25,000" } },
        { k: { en: "Quarantine, lodging or accommodation due to COVID-19", es: "Cuarentena, hospedaje o alojamiento por COVID-19" }, v: { en: "Up to US$2,000.00, maximum US$300.00 per day", es: "Hasta US$2,000.00, máximo US$300.00 por día" } },
        { k: { en: "Reimbursement of hotel expense due to inability to travel", es: "Reembolso de gastos de hotel por imposibilidad de viajar" }, v: { en: "Up to US$3,000.00", es: "Hasta US$3,000.00" } }
      ] }
    ]
  };

  ICB.DATA.guides = {
    section: { en: "Consumer resources", es: "Recursos para el consumidor" },
    entries: [hurricane, fire, travel]
  };

  ICB.DATA.guideById = function (id) {
    var all = ICB.DATA.guides.entries;
    for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
    return null;
  };
})();
