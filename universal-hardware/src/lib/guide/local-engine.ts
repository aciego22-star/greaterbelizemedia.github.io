/**
 * LocalGuideEngine — "Product Guide (Interactive Concept)".
 *
 * A deterministic, rule-based guide. It is NOT generative AI and says so.
 * Knowledge is limited to Universal Hardware's public website as summarised
 * in this project's data files. It never claims stock, prices, quotes,
 * warranties or that staff were notified, and it performs no network I/O.
 */
import type { GuideEngine, GuideReply, GuideState, Lang } from './types';
import { CATEGORIES, CATEGORY_BY_SLUG } from '../../data/categories';
import { BRANCH_BY_ID, type BranchId } from '../../data/branches';

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s/+&-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const has = (t: string, ...words: (string | RegExp)[]) =>
  words.some((w) => (typeof w === 'string' ? new RegExp(`(^|\\s)${w}(\\s|$)`).test(t) : w.test(t)));

const L = (lang: Lang, en: string, es: string) => (lang === 'es' ? es : en);

const listBrands = (slug: string) => CATEGORY_BY_SLUG[slug].listedBrands;

function branchText(id: BranchId, lang: Lang): string {
  const b = BRANCH_BY_ID[id];
  const hours = b.hours.map((h) => `${h.days} ${h.time}`).join(' · ');
  const days = lang === 'es' ? hours.replace('Monday – Friday', 'Lunes a viernes').replace('Saturday', 'Sábado') : hours;
  return L(
    lang,
    `**${b.name}${b.tag ? ' (main branch)' : ''}**: ${b.addressLines.join(', ')}.\nListed hours: ${days}.\nPhone ${b.phones[0].display} · Sales WhatsApp ${b.whatsapp[0].display} · Service Center WhatsApp ${b.whatsapp[1].display}.`,
    `**${b.name}${b.tag ? ' (sucursal principal)' : ''}**: ${b.addressLines.join(', ')}.\nHorario publicado: ${days}.\nTeléfono ${b.phones[0].display} · WhatsApp de ventas ${b.whatsapp[0].display} · WhatsApp del centro de servicio ${b.whatsapp[1].display}.`,
  );
}

const VERIFY = (lang: Lang) =>
  L(
    lang,
    "These details are listed on Universal Hardware's current website. Please confirm hours with the branch before visiting, especially around public holidays.",
    'Estos datos aparecen en el sitio web actual de Universal Hardware. Confirme el horario con la sucursal antes de visitar, sobre todo en días feriados.',
  );

const catLink = (slug: string, lang: Lang) => ({
  label: L(lang, `View ${CATEGORY_BY_SLUG[slug].name}`, `Ver ${CATEGORY_BY_SLUG[slug].name}`),
  href: `/products/${slug}/`,
});

const addAction = (slug: string, context: string | undefined, lang: Lang) => ({
  type: 'add-enquiry' as const,
  slug,
  context,
  label: L(lang, `Add ${CATEGORY_BY_SLUG[slug].shortName} to Enquiry Summary`, `Agregar ${CATEGORY_BY_SLUG[slug].shortName} al resumen`),
});

/* -------------------------------------------------------------------------- */
/* Intent detection                                                            */
/* -------------------------------------------------------------------------- */

type IntentId =
  | 'greeting'
  | 'identity'
  | 'quote'
  | 'stock'
  | 'branch'
  | 'hours'
  | 'generator'
  | 'drill'
  | 'pump'
  | 'motorcycle'
  | 'service'
  | 'policy'
  | 'thanks'
  | 'spanish'
  | 'english'
  | 'category';

interface Detected {
  intent: IntentId | null;
  category?: string;
  branch?: BranchId;
}

const CATEGORY_HINTS: { slug: string; words: (string | RegExp)[] }[] = [
  { slug: 'welding-supplies', words: [/weld/, /soldad/, /soldar/, 'mig', 'tig', 'plasma', 'electrode', 'electrodes', /electrodo/, 'torch', 'lincoln'] },
  { slug: 'lawn-and-garden', words: [/mower/, /mow/, /trimmer/, /chainsaw/, /chain saw/, 'weed', 'grass', 'lawn', 'garden', /jardin/, /podadora/, /motosierra/, 'hose', 'sprayer', 'wheelbarrow', 'echo', 'shindaiwa', 'homelite'] },
  { slug: 'household', words: [/fridge/, /refrigerat/, /freezer/, /washer/, /washing/, /dryer/, /aircon/, 'ac', 'a/c', /air condition/, /aire acondicionado/, /lavadora/, /refrigeradora/, 'bbq', 'grill', /vacuum/, 'chair', 'chairs', 'table', 'tables', /water heater/, /hot water/, /detergent/, /appliance/, /electrodomestic/, 'sankey'] },
  { slug: 'lighting-and-fans', words: [/light/, /bulb/, /lamp/, /fan/, /abanico/, /ventilador/, /solar/, /flashlight/, /luz/, /luces/, 'westinghouse', 'lasko', 'hunter'] },
  { slug: 'agriculture', words: [/fenc/, /barb/, /cattle/, /gate/, /bushhog/, /bush hog/, /rotary cutter/, /trailer/, /alambre/, /ganado/, /cerca/, 'farm', 'ranch', /finca/, 'bekaert'] },
  { slug: 'shop-tools', words: [/compressor/, /compresor/, /hoist/, /hydraulic/, /jack/, /ladder/, /escalera/, /electric motor/, 'chain', 'chains', 'leeson'] },
  { slug: 'woodworking', words: [/table saw/, /planer/, /jointer/, /band saw/, /bandsaw/, /drill press/, /shaper/, /woodwork/, /carpint/, 'grizzly'] },
  { slug: 'hand-tools', words: [/hammer(?! drill)/, /wrench/, /socket/, /plier/, /screwdriver/, /chisel/, /tape measure/, /measuring tape/, /extension cord/, /hand tool/, /martillo/, /llave/, /desarmador/, 'leatherman'] },
  { slug: 'power-tools', words: [/grinder/, /sander/, /router/, /circular saw/, /jig ?saw/, /reciprocating/, /miter/, /mitre/, /jack ?hammer/, /power tool/, /cordless/, 'makita', /esmeril/] },
];

function detect(t: string): Detected {
  // Specific journeys first.
  const branch: BranchId | undefined = has(t, /belize city/, /belama/, /chetumal/, /ciudad de belice/, /belice/)
    ? 'belize-city'
    : has(t, /spanish lookout/, /center road/, /cayo/)
      ? 'spanish-lookout'
      : undefined;
  if (has(t, /espanol/, /spanish please/, /en espanol/, /habla espanol/, /hablas espanol/)) return { intent: 'spanish' };
  if (has(t, /in english/, /english please/, /en ingles/)) return { intent: 'english' };
  if (has(t, /(are|r) (you|u) (a )?(real|human|person|bot|ai|robot)/, /who are you/, /what are you/, /is this (ai|a bot|real)/, /chatgpt/, /artificial/, /quien eres/, /eres (un )?(robot|humano|ia)/)) return { intent: 'identity' };
  if (has(t, /quot/, /cotiza/, /presupuesto/, /send (me|my|it|this|a)/, /\border\b/, /pedido/, /reserve/, /buy online/, /checkout/)) return { intent: 'quote', branch };
  if (has(t, /price/, /\bcost/, /how much/, /precio/, /cuanto/, /cuesta/, /cheap/, /discount/, /\bsale\b/, /oferta/)) return { intent: 'quote', branch };
  if (has(t, /in stock/, /stock/, /available/, /availability/, /disponib/, /do you have/, /tienen/, /hay /)) {
    const c = detectCategory(t);
    return { intent: 'stock', category: c ?? undefined, branch };
  }
  if (has(t, /warrant/, /garantia/, /return/, /refund/, /devolu/, /deliver/, /entrega/, /shipping/, /financ/, /credit/, /credito/, /payment/, /pago/, /installment/)) return { intent: 'policy' };
  if (has(t, /open (now|today|on)/, /hours/, /horario/, /what time/, /closing/, /abren/, /cierran/, /sunday/, /domingo/, /holiday/, /feriado/)) return { intent: 'hours', branch };
  if (has(t, /where/, /location/, /address/, /direccion/, /donde/, /store/, /branch/, /sucursal/, /tienda/, /phone/, /telefono/, /whatsapp/, /contact/, /call/)) return { intent: 'branch', branch };
  if (branch && t.split(' ').length <= 4) return { intent: 'branch', branch };
  if (has(t, /generator/, /generador/, /backup power/, /back up power/, /power outage/, /blackout/, /outage/, /apagon/, /planta/, /genset/, /no power/, /sin luz/)) return { intent: 'generator' };
  if (has(t, /pump/, /bomba/, /water supply/, /well/, /pozo/, /cistern/, /cisterna/, /water pressure/, /presion de agua/, /irrigat/, /riego/)) return { intent: 'pump' };
  if (has(t, /motorbike/, /motorcycle/, /motor bike/, /scooter/, /moto/, /lifan/, /meilun/, /hisun/, /atv/, /utv/, /dirt bike/, /trail bike/)) return { intent: 'motorcycle' };
  if (has(t, /drill/, /taladro/, /rotomartillo/, /concrete/, /masonry/, /concreto/, /cemento/)) return { intent: 'drill' };
  if (has(t, /repair/, /service/, /servicio/, /reparac/, /parts/, /repuesto/, /spare/, /fix/, /maintenance/, /mantenimiento/)) return { intent: 'service', branch };
  const cat = detectCategory(t);
  if (cat) return { intent: 'category', category: cat };
  if (has(t, /^(hi|hello|hey|hola|buenas|good (morning|afternoon|evening)|buenos dias)/)) return { intent: 'greeting' };
  if (has(t, /thank/, /gracias/, /^ok/, /great/, /perfect/, /perfecto/)) return { intent: 'thanks' };
  if (branch) return { intent: 'branch', branch };
  return { intent: null };
}

function detectCategory(t: string): string | null {
  let best: { slug: string; score: number } | null = null;
  for (const h of CATEGORY_HINTS) {
    const score = h.words.filter((w) => has(t, w)).length;
    if (score > 0 && (!best || score > best.score)) best = { slug: h.slug, score };
  }
  if (best) return best.slug;
  if (has(t, /generator/, /generador/, /planta/)) return 'generators';
  if (has(t, /pump/, /bomba/)) return 'water-pumps';
  if (has(t, /drill/, /taladro/, /saw/, /sierra/)) return 'power-tools';
  if (has(t, /moto/, /motorcycle/, /scooter/)) return 'motorcycles';
  return null;
}

/* -------------------------------------------------------------------------- */
/* Topic handlers                                                              */
/* -------------------------------------------------------------------------- */

function generatorReply(t: string, s: GuideState, fresh: boolean): GuideReply {
  const lang = s.lang;
  if (has(t, /fridge/, /refri/, /nevera/, /light/, /luz/, /luces/, /fan/, /abanico/, /essential/, /basico/, /tv/, /phone/)) s.slots.load = s.slots.load ?? 'essentials';
  if (has(t, /\bac\b/, /a\/c/, /air con/, /aire/, /whole/, /entire/, /toda la casa/, /everything/, /most of/, /casi toda/)) s.slots.load = 'whole';
  if (has(t, /tool/, /job ?site/, /construction/, /obra/, /herramienta/)) s.slots.load = 'tools';
  if (has(t, /business/, /shop/, /negocio/, /industrial/, /factory/, /store/)) s.slots.load = 'business';
  if (has(t, /occasion/, /sometimes/, /outage/, /blackout/, /apagon/, /emergenc/, /a veces/)) s.slots.freq = s.slots.freq ?? 'occasional';
  if (has(t, /regular/, /daily/, /every day/, /diario/, /all the time/, /constant/, /continu/, /ongoing/, /prime/)) s.slots.freq = 'regular';

  if (fresh && !(s.slots.load && s.slots.freq)) {
    return {
      text: L(
        lang,
        `Universal Hardware's website lists generators for a wide range of applications, from small portable units up to industrial use. Brands named include ${listBrands('generators').join(', ')}.\n\nI can't size a generator or confirm stock in this demo, but two questions will narrow down which type to ask the branch about:\n• Which appliances do you want to keep running? For example lights, fridge and fans, or air conditioning too?\n• Is it for occasional outages, or will it run regularly?`,
        `El sitio web de Universal Hardware ofrece generadores para muchas aplicaciones, desde unidades portátiles hasta uso industrial. Marcas mencionadas: ${listBrands('generators').join(', ')}.\n\nEn esta demostración no puedo dimensionar un generador ni confirmar existencias, pero dos preguntas ayudan a saber qué tipo consultar en la sucursal:\n• ¿Qué aparatos quiere mantener funcionando? Por ejemplo luces, refrigeradora y abanicos, o también aire acondicionado.\n• ¿Es para apagones ocasionales o para uso regular?`,
      ),
      chips: L(lang, 'Lights, fridge and fans|Most of the house, including AC|Occasional outages|Regular use', 'Luces, refrigeradora y abanicos|Casi toda la casa, con aire acondicionado|Apagones ocasionales|Uso regular').split('|'),
      links: [catLink('generators', lang)],
    };
  }
  if (!s.slots.load) {
    return {
      text: L(lang, 'Got it. And which appliances or equipment do you want it to run? Just the essentials (lights, fridge, fans), most of the house including AC, or tools on a job site?', 'Entendido. ¿Y qué aparatos o equipos quiere que funcionen? ¿Solo lo básico (luces, refrigeradora, abanicos), casi toda la casa con aire acondicionado, o herramientas en una obra?'),
      chips: L(lang, 'Just the essentials|Most of the house, including AC|Tools on a job site', 'Solo lo básico|Casi toda la casa, con aire acondicionado|Herramientas en una obra').split('|'),
    };
  }
  if (!s.slots.freq) {
    return {
      text: L(lang, 'Thanks. Will it be for occasional outages, or will it run regularly? Duty cycle makes a real difference to the right type.', 'Gracias. ¿Será para apagones ocasionales o funcionará con regularidad? Eso influye mucho en el tipo adecuado.'),
      chips: L(lang, 'Occasional outages|Regular or daily use', 'Apagones ocasionales|Uso regular o diario').split('|'),
    };
  }
  const loadText: Record<string, [string, string]> = {
    essentials: ['keeping essentials like lights, a fridge and fans running', 'mantener lo básico como luces, refrigeradora y abanicos'],
    whole: ['running most of the home, including air conditioning', 'alimentar casi toda la casa, incluido el aire acondicionado'],
    tools: ['powering tools on a job site', 'alimentar herramientas en una obra'],
    business: ['powering business or industrial equipment', 'alimentar equipos de negocio o industriales'],
  };
  const [en, es] = loadText[s.slots.load] ?? loadText.essentials;
  const freqEn = s.slots.freq === 'regular' ? 'regular use' : 'occasional outages';
  const freqEs = s.slots.freq === 'regular' ? 'uso regular' : 'apagones ocasionales';
  const bigger = s.slots.load === 'whole' || s.slots.load === 'business' || s.slots.freq === 'regular';
  const ctx = `${en}; ${freqEn}`;
  s.topic = undefined;
  return {
    text: L(
      lang,
      `For ${en} during ${freqEn}, here's how I'd frame it for the branch:\n\n• ${bigger ? 'This is at the larger end of home needs, so ask about larger or standby-type generators rather than small portable units.' : 'Portable or home-backup generators are the usual starting point for essentials.'}\n• Bring a list of what must run at the same time; that drives the size.\n• Ask about fuel type, running time, noise and where it can be placed safely.\n\n**A qualified electrician should evaluate the load and any connection to your home's wiring.** I can't give electrical sizing in this demo.\n\nWould you like me to add Generators to your Enquiry Summary, or show branch contact details?`,
      `Para ${es} durante ${freqEs}, así lo plantearía en la sucursal:\n\n• ${bigger ? 'Es una necesidad grande para un hogar, así que pregunte por generadores de mayor capacidad o de respaldo, no solo portátiles pequeños.' : 'Los generadores portátiles o de respaldo doméstico son el punto de partida habitual para lo básico.'}\n• Lleve una lista de lo que debe funcionar al mismo tiempo; eso define la capacidad.\n• Pregunte por tipo de combustible, autonomía, ruido y dónde puede colocarse de forma segura.\n\n**Un electricista calificado debe evaluar la carga y cualquier conexión al cableado de su casa.** En esta demostración no puedo calcular capacidades eléctricas.\n\n¿Quiere que agregue Generadores a su resumen de consulta o que le muestre los contactos de las sucursales?`,
    ),
    actions: [addAction('generators', ctx, lang), { type: 'open-enquiry', label: L(lang, 'Open Enquiry Summary', 'Abrir resumen') }],
    links: [catLink('generators', lang)],
    chips: L(lang, 'Show branch contacts|What about water pumps?', 'Ver contactos de sucursales|¿Y bombas de agua?').split('|'),
  };
}

function drillReply(t: string, s: GuideState, fresh: boolean): GuideReply {
  const lang = s.lang;
  const concrete = has(t, /concrete/, /concreto/, /masonry/, /block/, /bloque/, /brick/, /ladrillo/, /cement/, /cemento/);
  const steel = has(t, /steel/, /metal/, /acero/, /iron/, /hierro/);
  const wood = has(t, /wood/, /madera/);
  if (concrete) s.slots.material = s.slots.material && s.slots.material !== 'concrete' ? 'mixed' : 'concrete';
  if (steel) s.slots.material = concrete || s.slots.material === 'concrete' ? 'mixed' : s.slots.material === 'mixed' ? 'mixed' : 'steel';
  if (wood && !s.slots.material) s.slots.material = 'wood';
  if (has(t, /cordless/, /battery/, /inalambric/, /bateria/)) s.slots.power = 'cordless';
  if (has(t, /corded/, /cable/, /plug/)) s.slots.power = 'corded';
  if (has(t, /daily/, /trade/, /work/, /job/, /contractor/, /professional/, /diario/, /trabajo/, /profesional/)) s.slots.use = 'trade';
  if (has(t, /home/, /occasional/, /diy/, /casa/, /ocasional/, /sometimes/)) s.slots.use = 'home';

  if (fresh) {
    const mixed = s.slots.material === 'mixed';
    return {
      text: L(
        lang,
        `${mixed ? 'Concrete and steel is a common combination to plan for. ' : ''}Universal Hardware's website lists hammer drills, speed drills and cordless tools in its Power Tools range, naming ${listBrands('power-tools').join(', ')}.\n\n• **Hammer drill:** adds a hammering action to the rotation, used with masonry bits for concrete and block.\n• **Standard drilling:** hammer action off, with metal bits, for steel.\n• **Impact driver:** a different tool, built for driving screws and bolts rather than drilling concrete.\n\nHammer drills commonly offer a standard drilling mode too, so one tool may cover both jobs. The branch can confirm which current models do.\n\nWhat will you drill most: solid concrete, concrete block or steel? And is it for occasional home jobs or daily trade work?`,
        `${mixed ? 'Concreto y acero es una combinación común. ' : ''}El sitio web de Universal Hardware incluye rotomartillos (hammer drills), taladros y herramientas inalámbricas en su gama de herramientas eléctricas, con marcas como ${listBrands('power-tools').join(', ')}.\n\n• **Rotomartillo:** agrega percusión al giro; se usa con brocas para concreto y bloque.\n• **Taladrado normal:** sin percusión y con brocas para metal, para acero.\n• **Atornillador de impacto:** es otra herramienta, para tornillos y pernos, no para perforar concreto.\n\nMuchos rotomartillos también tienen modo de taladro normal, así que una sola herramienta puede servir para ambos trabajos. La sucursal puede confirmar qué modelos actuales lo hacen.\n\n¿Qué perforará más: concreto sólido, bloque o acero? ¿Es para trabajos ocasionales en casa o para trabajo diario?`,
      ),
      chips: L(lang, 'Mostly concrete block|Mostly steel|Daily trade work|Occasional home use', 'Mayormente bloque|Mayormente acero|Trabajo diario|Uso ocasional en casa').split('|'),
      links: [catLink('power-tools', lang)],
    };
  }
  if (!s.slots.use) {
    return {
      text: L(lang, 'Thanks. How often will you use it: occasional home jobs, or daily trade work? That changes which lines and batteries are worth asking about.', 'Gracias. ¿Con qué frecuencia la usará: trabajos ocasionales en casa o trabajo diario? Eso cambia qué líneas y baterías conviene consultar.'),
      chips: L(lang, 'Occasional home use|Daily trade work', 'Uso ocasional en casa|Trabajo diario').split('|'),
    };
  }
  const material = s.slots.material ?? 'mixed';
  const focus =
    material === 'steel' ? 'Speed drills, Cordless tools' : material === 'wood' ? 'Speed drills, Cordless tools' : 'Hammer drills, Cordless tools';
  const ctx = `Cordless drilling — ${material === 'mixed' ? 'concrete and steel' : material}; ${s.slots.use === 'trade' ? 'daily trade use' : 'occasional home use'}`;
  s.topic = undefined;
  return {
    text: L(
      lang,
      `Here's what to ask the branch about: **${focus}** in the Power Tools range.\n\n• Mention the materials (${material === 'mixed' ? 'concrete and steel' : material}) and typical hole sizes.\n• Ask whether the tool and battery are sold together, and which battery platform it uses.\n• ${s.slots.use === 'trade' ? 'For daily trade work, ask about professional-grade lines, spare batteries and service support.' : 'For occasional use, ask which option gives the best balance for home projects.'}\n• Don't forget the right bits: masonry bits for concrete, metal bits for steel.\n\nShall I add Power Tools to your Enquiry Summary?`,
      `Esto es lo que conviene consultar en la sucursal: **${focus}** en la gama de herramientas eléctricas.\n\n• Mencione los materiales (${material === 'mixed' ? 'concreto y acero' : material === 'steel' ? 'acero' : material === 'wood' ? 'madera' : 'concreto'}) y los diámetros habituales.\n• Pregunte si la herramienta incluye batería y qué plataforma de batería usa.\n• ${s.slots.use === 'trade' ? 'Para trabajo diario, pregunte por líneas profesionales, baterías de repuesto y servicio.' : 'Para uso ocasional, pregunte qué opción ofrece el mejor equilibrio para proyectos en casa.'}\n• No olvide las brocas adecuadas: para concreto y para metal.\n\n¿Agrego Herramientas eléctricas a su resumen de consulta?`,
    ),
    actions: [addAction('power-tools', ctx, lang)],
    links: [catLink('power-tools', lang)],
    chips: L(lang, 'Show branch contacts|Can you send me a quote?', 'Ver contactos de sucursales|¿Me pueden enviar una cotización?').split('|'),
  };
}

function pumpReply(t: string, s: GuideState, fresh: boolean): GuideReply {
  const lang = s.lang;
  if (has(t, /deep/, /borehole/, /profund/, /drilled well/)) s.slots.source = 'deep';
  else if (has(t, /shallow/, /cistern/, /cisterna/, /vat/, /superficial/)) s.slots.source = 'shallow';
  else if (has(t, /tank/, /tanque/, /river/, /rio/, /pond/, /creek/)) s.slots.source = 'tank';
  else if (has(t, /flood/, /drain/, /inund/, /drenaj/, /sump/)) s.slots.source = 'drain';
  if (has(t, /pressure/, /presion/, /shower/, /ducha/, /tap/, /faucet/, /upstairs/, /low pressure/)) s.slots.use = 'pressure';
  if (has(t, /irrigat/, /riego/, /sprinkler/, /garden/, /field/)) s.slots.use = 'irrigation';
  if (has(t, /no power/, /no electric/, /sin luz/, /gas/, /diesel/, /engine/)) s.slots.power = 'engine';
  if (fresh && !s.slots.source) {
    return {
      text: L(
        lang,
        "Happy to help narrow it down. Universal Hardware's website lists submersible, jet (pressure system), booster, pressure, sump, sprinkler and marine pumps, plus gas- and diesel-powered water pumps. The right type depends mostly on your water source:\n\n• Where does the water come from: a deep well, a shallow well or cistern, or a tank?\n• Roughly how deep is the water, and how high does it need to go (for example to a raised tank or upstairs)?\n• Is it for household pressure, irrigation, or both?",
        'Con gusto le ayudo. El sitio web de Universal Hardware incluye bombas sumergibles, de chorro (sistemas de presión), de refuerzo, de presión, de sumidero, para riego y marinas, además de motobombas a gasolina y diésel. El tipo correcto depende sobre todo de la fuente de agua:\n\n• ¿De dónde viene el agua: un pozo profundo, un pozo poco profundo o cisterna, o un tanque?\n• ¿Qué tan profunda está el agua y a qué altura debe subir (por ejemplo a un tanque elevado o a un segundo piso)?\n• ¿Es para presión en la casa, para riego o ambos?',
      ),
      chips: L(lang, 'Deep well|Shallow well or cistern|From a tank|Low pressure in the house', 'Pozo profundo|Pozo poco profundo o cisterna|Desde un tanque|Poca presión en la casa').split('|'),
      links: [catLink('water-pumps', lang)],
    };
  }
  if (!s.slots.source) {
    return {
      text: L(lang, 'Thanks. Where is the water coming from: a deep well, a shallow well or cistern, or a tank?', 'Gracias. ¿De dónde viene el agua: pozo profundo, pozo poco profundo o cisterna, o un tanque?'),
      chips: L(lang, 'Deep well|Shallow well or cistern|From a tank', 'Pozo profundo|Pozo poco profundo o cisterna|Desde un tanque').split('|'),
    };
  }
  const map: Record<string, { en: string; es: string; focus: string }> = {
    deep: { en: 'Deep wells usually call for a **submersible pump**, which sits down in the water.', es: 'Los pozos profundos normalmente requieren una **bomba sumergible**, que va dentro del agua.', focus: 'Submersible pumps' },
    shallow: { en: 'Shallow wells and cisterns are often served by a **jet pump with a pressure system**.', es: 'Los pozos poco profundos y las cisternas suelen usar una **bomba de chorro con sistema de presión**.', focus: 'Jet pumps (pressure systems)' },
    tank: { en: 'Drawing from a tank for household pressure points to **booster or pressure pumps**.', es: 'Para dar presión desde un tanque, conviene consultar **bombas de refuerzo o de presión**.', focus: 'Booster pumps, Pressure pumps' },
    drain: { en: 'For removing water, ask about **sump pumps**, or engine-driven pumps where there is no power.', es: 'Para sacar agua, consulte **bombas de sumidero** o motobombas donde no hay electricidad.', focus: 'Sump pumps' },
  };
  const m = map[s.slots.source];
  const engine = s.slots.power === 'engine';
  const ctx = `Home water supply — ${s.slots.source} source${s.slots.use ? `; ${s.slots.use}` : ''}`;
  s.topic = undefined;
  return {
    text: L(
      lang,
      `${m.en}${engine ? ' Without power at the pump, gas- or diesel-powered water pumps are also listed.' : ''}\n\nWhen you contact the branch, have ready:\n• The depth to the water and the height or distance to where it's needed.\n• How many taps or fixtures, or the area to irrigate.\n• Pipe sizes or photos of any existing setup.\n\nA pump professional or the branch should confirm the exact pump for your depth and flow. Want me to add Water Pumps to your Enquiry Summary?`,
      `${m.es}${engine ? ' Si no hay electricidad en la bomba, también se ofrecen motobombas a gasolina o diésel.' : ''}\n\nCuando contacte a la sucursal, tenga a mano:\n• La profundidad del agua y la altura o distancia hasta donde se necesita.\n• Cuántos grifos o puntos de agua, o el área a regar.\n• Medidas de tubería o fotos de la instalación actual.\n\nUn técnico en bombas o la sucursal debe confirmar la bomba exacta según profundidad y caudal. ¿Agrego Bombas de agua a su resumen de consulta?`,
    ),
    actions: [addAction('water-pumps', ctx, lang)],
    links: [catLink('water-pumps', lang)],
    chips: L(lang, 'Show branch contacts|What about a generator?', 'Ver contactos de sucursales|¿Y un generador?').split('|'),
  };
}

function motorcycleReply(t: string, s: GuideState, fresh: boolean): GuideReply {
  const lang = s.lang;
  if (has(t, /town/, /commut/, /city/, /ciudad/, /street/, /calle/, /scooter/, /work/, /trabajo/)) s.slots.ride = 'street';
  if (has(t, /trail/, /rough/, /dirt/, /off ?road/, /camino/, /monte/)) s.slots.ride = 'trail';
  if (has(t, /cargo/, /carga/, /deliver/, /reparto/)) s.slots.ride = 'cargo';
  if (has(t, /atv/, /utv/, /farm/, /finca/, /side by side/)) s.slots.ride = 'utv';
  if (has(t, /spanish lookout/, /cayo/)) s.slots.branch = 'spanish-lookout';
  if (has(t, /belize city/, /belice/)) s.slots.branch = 'belize-city';
  if (fresh && !s.slots.ride) {
    return {
      text: L(
        lang,
        "Universal Hardware's website has a Meilun & Lifan page covering scooters and cub bikes, street, trail and cargo motorcycles, and it publishes Meilun parts catalogues. There's also a Hisun page listing UTVs and ATVs.\n\nThe model lists and prices on those pages look older, so I can't say which models are available now. The branch can.\n\nWhat kind of riding is it for: town commuting, rough roads and trails, or carrying cargo? And which branch is closer for you?",
        'El sitio web de Universal Hardware tiene una página de Meilun y Lifan con scooters, motos de calle, de montaña y de carga, y publica catálogos de repuestos Meilun. También hay una página de Hisun con UTV y cuatrimotos.\n\nLos modelos y precios de esas páginas parecen antiguos, así que no puedo decir qué modelos hay disponibles ahora. La sucursal sí puede.\n\n¿Para qué tipo de uso es: ciudad, caminos de tierra y montaña, o carga? ¿Y qué sucursal le queda más cerca?',
      ),
      chips: L(lang, 'Town commuting|Trails and rough roads|Carrying cargo|Spanish Lookout|Belize City', 'Ciudad|Caminos y montaña|Carga|Spanish Lookout|Belize City').split('|'),
      links: [catLink('motorcycles', lang)],
    };
  }
  const rideFocus: Record<string, [string, string]> = {
    street: ['scooters, cub bikes and street motorcycles', 'scooters y motos de calle'],
    trail: ['trail motorcycles', 'motos de montaña (trail)'],
    cargo: ['cargo motorcycles', 'motos de carga'],
    utv: ['UTVs and ATVs (Hisun page) and trail motorcycles', 'UTV y cuatrimotos (página Hisun) y motos de montaña'],
  };
  if (!s.slots.ride) {
    return {
      text: L(lang, 'Which kind of riding is it mainly for: town commuting, trails and rough roads, or carrying cargo?', '¿Para qué tipo de uso es principalmente: ciudad, caminos y montaña, o carga?'),
      chips: L(lang, 'Town commuting|Trails and rough roads|Carrying cargo', 'Ciudad|Caminos y montaña|Carga').split('|'),
    };
  }
  const [en, es] = rideFocus[s.slots.ride];
  const b = s.slots.branch as BranchId | undefined;
  s.topic = undefined;
  return {
    text: L(
      lang,
      `For that, ask the branch about **${en}**. Ask which models are in stock now, the current price, and parts and service support for the model you choose.${b ? `\n\nYou mentioned ${BRANCH_BY_ID[b].name}. Its details are below.` : '\n\nWould you like the contact details for Spanish Lookout or Belize City?'}`,
      `Para eso, consulte en la sucursal por **${es}**. Pregunte qué modelos hay disponibles ahora, el precio actual y el soporte de repuestos y servicio para el modelo que elija.${b ? `\n\nMencionó ${BRANCH_BY_ID[b].name}. Sus datos están abajo.` : '\n\n¿Quiere los datos de contacto de Spanish Lookout o de Belize City?'}`,
    ),
    branches: b ? [b] : undefined,
    actions: [addAction('motorcycles', `Motorcycles — ${en}`, lang)],
    links: [catLink('motorcycles', lang), { label: L(lang, 'Meilun parts catalogues (official site)', 'Catálogos de repuestos Meilun (sitio oficial)'), href: 'https://universalhardware.bz/catalogues.html', external: true }],
    chips: b ? undefined : ['Spanish Lookout', 'Belize City'],
  };
}

function categoryReply(slug: string, lang: Lang, t: string): GuideReply {
  const c = CATEGORY_BY_SLUG[slug];
  const matched = c.subcategories.filter((sc) => sc.keywords.some((k) => t.includes(norm(k))) || t.includes(norm(sc.name)));
  const shown = (matched.length ? matched : c.subcategories.slice(0, 6)).map((x) => x.name);
  const brands = listBrands(slug);
  const q = c.prepare[0];
  return {
    text: L(
      lang,
      `Universal Hardware's website lists **${c.name}**${matched.length ? ', including' : ', such as'} ${shown.join(', ')}.${brands.length ? ` Brands named for this category: ${brands.join(', ')}.` : ''}\n\nI can't confirm current stock or prices, but I can help you prepare for the branch. To start: ${q.charAt(0).toLowerCase() + q.slice(1).replace(/\.$/, '')}?`,
      `El sitio web de Universal Hardware incluye **${c.name}**, por ejemplo: ${shown.join(', ')}.${brands.length ? ` Marcas mencionadas: ${brands.join(', ')}.` : ''}\n\nNo puedo confirmar existencias ni precios, pero puedo ayudarle a preparar su consulta para la sucursal. Para empezar, cuénteme un poco más sobre el trabajo o el uso que tiene en mente.`,
    ),
    links: [catLink(slug, lang)],
    actions: [addAction(slug, undefined, lang)],
    chips: L(lang, 'Show branch contacts|Can you send me a quote?', 'Ver contactos de sucursales|¿Me pueden enviar una cotización?').split('|'),
  };
}

/* -------------------------------------------------------------------------- */
/* Engine                                                                      */
/* -------------------------------------------------------------------------- */

const SUGGESTIONS_EN = [
  'I need backup power for my home. What type should I look at?',
  'I need a cordless drill for concrete and steel.',
  'I need a pump for my home water supply.',
  'Do you carry motorbikes?',
  'Where is your Belize City store?',
  'Can you send me a quote?',
];
const SUGGESTIONS_ES = [
  'Necesito un generador para mi casa.',
  'Necesito un taladro inalámbrico para concreto.',
  'Necesito una bomba de agua para la casa.',
  '¿Venden motos?',
  '¿Dónde queda la tienda de Belize City?',
  '¿Me pueden enviar una cotización?',
];

export const LocalGuideEngine: GuideEngine = {
  id: 'local-rules',
  label: 'Product Guide · Interactive Concept',
  description: 'Rule-based guide using public website information. Not live AI.',
  initialState(lang) {
    return { slots: {}, lang, turns: 0 };
  },
  welcome(s) {
    return {
      text: L(
        s.lang,
        "Hi, I'm the Product Guide for this concept. I can help you find the right product category, prepare questions for a branch and build an enquiry summary, using information from Universal Hardware's public website.\n\nI'm rule-based, not live AI, and I can't check stock, prices or send anything to the store. What are you working on?",
        'Hola, soy la Guía de Productos de este concepto. Puedo ayudarle a encontrar la categoría adecuada, preparar preguntas para la sucursal y armar un resumen de consulta, con información del sitio web público de Universal Hardware.\n\nFunciono con reglas, no soy IA en vivo, y no puedo revisar existencias, precios ni enviar nada a la tienda. ¿En qué está trabajando?',
      ),
      chips: s.lang === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN,
    };
  },
  reply(input, prev, ctx) {
    const s: GuideState = { ...prev, slots: { ...prev.slots }, turns: prev.turns + 1 };
    const t = norm(input);
    const d = detect(t);
    // Auto-detect Spanish phrasing.
    if (s.lang === 'en' && has(t, /^hola/, /necesito/, /donde/, /tienen/, /quiero/, /cuanto/, /venden/, /buenos dias/, /buenas/)) s.lang = 'es';
    const lang = s.lang;

    // Continue the active topic when the input reads like an answer to it.
    const topicIntents: IntentId[] = ['generator', 'drill', 'pump', 'motorcycle'];
    const shortBranchAnswer = s.topic === 'motorcycle' && d.intent === 'branch' && t.split(' ').length <= 4;
    const switching =
      d.intent && d.intent !== s.topic && !['greeting', 'thanks', 'category'].includes(d.intent) && !shortBranchAnswer;
    if (s.topic && !switching) {
      if (s.topic === 'generator') return { reply: generatorReply(t, s, false), state: s };
      if (s.topic === 'drill') return { reply: drillReply(t, s, false), state: s };
      if (s.topic === 'pump') return { reply: pumpReply(t, s, false), state: s };
      if (s.topic === 'motorcycle') return { reply: motorcycleReply(t, s, false), state: s };
    }
    if (d.intent && topicIntents.includes(d.intent)) {
      s.topic = d.intent;
      s.slots = {};
      const fn = { generator: generatorReply, drill: drillReply, pump: pumpReply, motorcycle: motorcycleReply }[d.intent as 'generator'];
      return { reply: fn(t, s, true), state: s };
    }
    s.topic = undefined;

    switch (d.intent) {
      case 'spanish':
        s.lang = 'es';
        return {
          reply: {
            text: 'Claro, continuamos en español. Tenga en cuenta que esta es una demostración independiente: no implica que Universal Hardware ofrezca atención formal en español. ¿En qué le puedo ayudar?',
            chips: SUGGESTIONS_ES,
          },
          state: s,
        };
      case 'english':
        s.lang = 'en';
        return { reply: { text: 'Sure, back to English. What can I help you find?', chips: SUGGESTIONS_EN }, state: s };
      case 'identity':
        return {
          reply: {
            text: L(
              lang,
              "I'm the Product Guide in an independent website concept by Austere Automations, not Universal Hardware's official customer service. I'm a rule-based assistant: I match your questions to the categories and branch details published on Universal Hardware's website. I'm not connected to a live AI model, and nothing you type leaves this page.\n\nIn a production version, an approved AI Employee could take this role, with company-verified knowledge and hand-off to real staff.",
              'Soy la Guía de Productos de un concepto de sitio web independiente de Austere Automations, no el servicio al cliente oficial de Universal Hardware. Funciono con reglas: relaciono sus preguntas con las categorías y datos de sucursales publicados en el sitio de Universal Hardware. No estoy conectada a un modelo de IA en vivo y nada de lo que escribe sale de esta página.\n\nEn una versión de producción, un Empleado de IA aprobado podría cumplir esta función, con información verificada por la empresa y traspaso a personal real.',
            ),
            links: [{ label: L(lang, 'About this concept', 'Sobre este concepto'), href: '/concept/' }],
          },
          state: s,
        };
      case 'quote':
      case 'stock': {
        const cat = d.category;
        const text = L(
          lang,
          `${d.intent === 'stock' ? "I can't check stock: this concept has no live inventory connection" : "I can't send quotes or get prices: this is an independent concept demonstration"}, and it can't send requests to Universal Hardware.\n\nWhat I can do is build an **Enquiry Summary** you can copy and send to the branch yourself.${ctx.enquiryCount ? ` Your summary currently lists ${ctx.enquiryCount} ${ctx.enquiryCount === 1 ? 'category' : 'categories'}.` : ''}\n\nSales WhatsApp lines listed on the website: Spanish Lookout ${BRANCH_BY_ID['spanish-lookout'].whatsapp[0].display} · Belize City ${BRANCH_BY_ID['belize-city'].whatsapp[0].display}.`,
          `${d.intent === 'stock' ? 'No puedo revisar existencias: este concepto no tiene conexión a inventario en vivo' : 'No puedo enviar cotizaciones ni obtener precios: esta es una demostración independiente'}, y no puede enviar solicitudes a Universal Hardware.\n\nLo que sí puedo hacer es armar un **resumen de consulta** que usted puede copiar y enviar a la sucursal.${ctx.enquiryCount ? ` Su resumen tiene ${ctx.enquiryCount} ${ctx.enquiryCount === 1 ? 'categoría' : 'categorías'}.` : ''}\n\nWhatsApp de ventas publicados en el sitio: Spanish Lookout ${BRANCH_BY_ID['spanish-lookout'].whatsapp[0].display} · Belize City ${BRANCH_BY_ID['belize-city'].whatsapp[0].display}.`,
        );
        const actions: GuideReply['actions'] = [];
        if (cat) actions.push(addAction(cat, undefined, lang));
        actions.push({ type: 'open-enquiry', label: L(lang, 'Open Enquiry Summary', 'Abrir resumen') });
        if (ctx.enquiryCount) actions.push({ type: 'copy-summary', label: L(lang, 'Copy summary', 'Copiar resumen') });
        return { reply: { text, actions, branches: d.branch ? [d.branch] : undefined, links: cat ? [catLink(cat, lang)] : undefined }, state: s };
      }
      case 'policy':
        return {
          reply: {
            text: L(
              lang,
              "I don't have warranty, returns, delivery or payment information. Those terms aren't part of the public website content this demo uses, so the branch is the right place to ask. Would you like their contact details?",
              'No tengo información sobre garantías, devoluciones, entregas ni formas de pago; esos términos no forman parte del contenido público que usa esta demostración. Lo mejor es consultarlo en la sucursal. ¿Quiere sus datos de contacto?',
            ),
            chips: ['Spanish Lookout', 'Belize City'],
          },
          state: s,
        };
      case 'hours': {
        const ids: BranchId[] = d.branch ? [d.branch] : ['spanish-lookout', 'belize-city'];
        return {
          reply: {
            text: L(
              lang,
              `I can't tell whether a branch is open right now. Here are the hours listed on the website:\n\n${ids.map((i) => branchText(i, lang)).join('\n\n')}\n\nThe website also says the company is closed on Belize public and bank holidays. ${VERIFY(lang)}`,
              `No puedo saber si una sucursal está abierta en este momento. Este es el horario publicado en el sitio web:\n\n${ids.map((i) => branchText(i, lang)).join('\n\n')}\n\nEl sitio también indica que la empresa cierra en los feriados públicos y bancarios de Belice. ${VERIFY(lang)}`,
            ),
            branches: ids,
          },
          state: s,
        };
      }
      case 'branch': {
        const ids: BranchId[] = d.branch ? [d.branch] : ['spanish-lookout', 'belize-city'];
        return {
          reply: {
            text: L(
              lang,
              `${d.branch ? `Universal Hardware's website lists the ${BRANCH_BY_ID[d.branch].name} branch here:` : 'Universal Hardware lists two branches on its website:'}\n\n${ids.map((i) => branchText(i, lang)).join('\n\n')}\n\n${VERIFY(lang)} (I'm part of an independent concept demo, not the store itself.)\n\nIs there a product you're planning to ask them about? I can help you prepare an enquiry summary.`,
              `${d.branch ? `El sitio web de Universal Hardware indica la sucursal de ${BRANCH_BY_ID[d.branch].name} así:` : 'Universal Hardware publica dos sucursales en su sitio web:'}\n\n${ids.map((i) => branchText(i, lang)).join('\n\n')}\n\n${VERIFY(lang)} (Soy parte de una demostración independiente, no la tienda.)\n\n¿Hay algún producto que piense consultar? Puedo ayudarle a preparar un resumen.`,
            ),
            branches: ids,
            links: [{ label: L(lang, 'All branch details', 'Todos los datos de sucursales'), href: '/locations/' }],
          },
          state: s,
        };
      }
      case 'service':
        return {
          reply: {
            text: L(
              lang,
              "The website lists a Service Center WhatsApp line at each branch: Spanish Lookout +501 668-0311 and Belize City +501 652-9330. It also publishes Meilun parts catalogues for parts orders.\n\nService coverage depends on the brand and product, so it's worth confirming with the Service Center. What is the item, and which branch is closer for you?",
              'El sitio web publica una línea de WhatsApp del centro de servicio en cada sucursal: Spanish Lookout +501 668-0311 y Belize City +501 652-9330. También publica catálogos de repuestos Meilun.\n\nLa cobertura de servicio depende de la marca y el producto, así que conviene confirmarlo con el centro de servicio. ¿Qué artículo es y qué sucursal le queda más cerca?',
            ),
            links: [
              { label: L(lang, 'Service contacts', 'Contactos de servicio'), href: '/locations/#service' },
              { label: L(lang, 'Meilun parts catalogues (official site)', 'Catálogos Meilun (sitio oficial)'), href: 'https://universalhardware.bz/catalogues.html', external: true },
            ],
            chips: ['Spanish Lookout', 'Belize City'],
          },
          state: s,
        };
      case 'category':
        return { reply: categoryReply(d.category!, lang, t), state: s };
      case 'greeting':
        return { reply: { ...LocalGuideEngine.welcome(s) }, state: s };
      case 'thanks':
        return {
          reply: {
            text: L(lang, "You're welcome. Anything else you'd like to find? You can also open your Enquiry Summary to copy everything you've gathered.", 'Con gusto. ¿Algo más que quiera encontrar? También puede abrir su resumen de consulta para copiar todo lo que ha reunido.'),
            actions: [{ type: 'open-enquiry', label: L(lang, 'Open Enquiry Summary', 'Abrir resumen') }],
          },
          state: s,
        };
      default: {
        const sample = CATEGORIES.slice(0, 8).map((c) => c.shortName).join(', ');
        return {
          reply: {
            text: L(
              lang,
              `I'm not sure I followed that. I'm a simple rule-based guide, so short descriptions work best: the job, the product type or a branch name.\n\nThe website's categories include ${sample} and more. You can also try the search on the Products page.`,
              `No estoy segura de haber entendido. Soy una guía sencilla basada en reglas; funcionan mejor las descripciones cortas: el trabajo, el tipo de producto o el nombre de una sucursal.\n\nLas categorías del sitio incluyen ${sample} y más. También puede usar el buscador en la página de Productos.`,
            ),
            links: [{ label: L(lang, 'Search products', 'Buscar productos'), href: '/products/' }],
            chips: (lang === 'es' ? SUGGESTIONS_ES : SUGGESTIONS_EN).slice(0, 4),
          },
          state: s,
        };
      }
    }
  },
};
