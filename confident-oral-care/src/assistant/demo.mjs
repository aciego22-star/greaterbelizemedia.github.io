// confident AI demo mode: rule-based replies for client previews without an API key, in English
// and Spanish. It answers from the same approved clinic records and drives the REAL scheduling
// service (availability, booking form, staff review), so booking works exactly as on the live site.
// With an API key configured, the language-model assistant is used instead.

import { SchedulingError } from '../scheduling/service.mjs';
import { addDays, minutesOf, partsInZone, WEEKDAYS } from '../scheduling/time.mjs';

/** Lowercase and strip accents so "¿Cuánto cuesta?" matches "cuanto cuesta". */
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, "'");

const RE = {
  emergency: /\b(can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|hard to breathe|can'?t swallow|difficulty swallowing|trouble swallowing|emergency|swelling (is )?spreading|bleeding (won'?t|will not|doesn'?t) stop|unconscious|no puedo respirar|me cuesta respirar|dificultad para respirar|no puedo tragar|dificultad para tragar|emergencia|no para de sangrar|sangrado que no para)\b/,
  manageBooking: /\b(cancel|reschedul|change (my|the|an)? ?appointment|move (my|the) appointment|my appointment|someone else'?s|another person'?s|my (husband|wife|son|daughter|mom|mother|dad|father|friend)'?s appointment|cancelar|reprogramar|cambiar (mi|la) cita|mover (mi|la) cita|mi cita|cita de (mi|otra))/,
  payOnline: /\b(pay (online|here|now|through|with)|online payment|pay by card|card payment|pagar (en linea|aqui|ahora|con tarjeta|por internet)|pago en linea|pago con tarjeta)\b/,
  price: /\b(price|prices|cost|costs|how much|fee|fees|charge|insurance|insured|payment|pay|card|cash|financ\w*|precio|precios|costo|costos|cuesta|cuanto|tarifa|seguro|aseguradora|pago|pagar|tarjeta|efectivo)\b/,
  braces: /\b(braces|aligners?|invisalign|clear aligners?|frenos|brackets|alineador(es)?)\b/,
  ortho: /\b(orthodont\w*|retainer\w*|braces|aligner\w*|invisalign|bite|crooked|ortodonci\w*|retenedor\w*|frenos|brackets|alineador\w*|mordida|chuecos|torcidos)\b/,
  clinical: /\b(pain|painful|hurts?|hurting|ache|aching|toothache|swollen|swelling|infect\w*|abscess|bleed\w*|antibiotic\w*|medicat\w*|ibuprofen|should i (take|use)|is it normal|diagnos\w*|dolor|duele|duelen|hinchad\w*|infeccion|absceso|sangra\w*|antibiotico\w*|medicamento\w*|pastilla\w*|debo tomar|es normal)\b/,
  booking: /\b(book|booking|appointment|appointments|schedule|reserve|availability|available|openings?|slot|slots|consultation|consult|come in|come by|see (the )?(dentist|doctor)|times?|cita|citas|reservar|reserva|agendar|programar|turno|consulta|disponible|disponibilidad|puedo ir|quiero ir)\b/,
  hours: /\b(hours|open|opening|close|closing|closed|when are you|what time|horario|horarios|abren|abierto|abiertos|cierran|cerrado|a que hora)\b/,
  location: /\b(where|location|located|address|directions?|find you|get there|parking|boardwalk|map|donde|ubicacion|ubicados|direccion|como llego|como llegar|llegar|estacionamiento|parqueo|mapa)\b/,
  doctor: /\b(dr\.?|doctor|dentist|haylock|who (is|are)|doctora|dra|dentista|quien es)\b/,
  greeting: /^(hi|hello|hey|good (morning|afternoon|evening)|hola|buenos dias|buenas tardes|buenas noches|buenas)\b/,
  thanks: /\b(thanks|thank you|thx|great|perfect|awesome|gracias|perfecto|excelente|genial)\b/,
  request: /\b(request|team (arrange|contact)|send (a )?request|solicitud|solicitar|enviar|pedir)\b/,
  yes: /^(yes|yeah|yep|sure|ok|okay|please|si|claro|dale|por favor)\b/,
  spanish: /\b(hola|quiero|quisiera|necesito|cita|tienen|horario|donde|gracias|cuanto|cuesta|puedo|para|una|por favor|buenos|buenas|manana|lunes|martes|miercoles|jueves|viernes|sabado|domingo|dolor|limpieza|corona|dentadura|consulta|si|el|la|los|las|de|que|con|me|mi|usted|ustedes)\b/g,
  english: /\b(the|i|want|would|like|do|does|you|your|what|where|when|can|is|are|appointment|book|have|hours|how|much|please|my|hi|hello|thanks)\b/g,
};

const ORDINALS = {
  first: 0, '1st': 0, second: 1, '2nd': 1, third: 2, '3rd': 2, fourth: 3, '4th': 3, fifth: 4, '5th': 4, sixth: 5, '6th': 5, last: -1,
  primero: 0, primera: 0, segundo: 1, segunda: 1, tercero: 2, tercera: 2, cuarto: 3, cuarta: 3, quinto: 4, quinta: 4, sexto: 5, sexta: 5, ultimo: -1, ultima: -1,
};
const ES_DAYS = { lunes: 'Monday', martes: 'Tuesday', miercoles: 'Wednesday', jueves: 'Thursday', viernes: 'Friday', sabado: 'Saturday', domingo: 'Sunday' };

function parseTime(text) {
  if (/\b(noon|midday|mediodia|medio dia)\b/.test(text)) return { minutes: 12 * 60 };
  if (/\b(lunch|almuerzo|hora de comer)\b/.test(text)) return { minutes: 12 * 60, lunch: true };
  const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?=\W|$)/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const mer = m[3] ? m[3].replace(/[\s.]/g, '') : null;
  if (!mer && !m[2] && (hour > 12 || hour === 0)) return null;
  if (!mer && !m[2] && !/\b(at|a las|a la)\b|o'?clock/.test(text)) return null; // a bare number is likely an option
  if (hour > 23 || minute > 59) return null;
  if (mer === 'pm' && hour < 12) hour += 12;
  if (mer === 'am' && hour === 12) hour = 0;
  if (!mer && hour >= 1 && hour <= 6) hour += 12; // "at 3" means 3 p.m. in clinic hours
  return { minutes: hour * 60 + minute };
}

const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** Reply text in English and Spanish. */
function phrases(site) {
  const { clinic } = site;
  const phone = `[${clinic.phone.label}](${clinic.phone.href})`;
  const wa = (label) => `[${label}](${clinic.whatsapp.href})`;
  const hours = (s) => s.hours.map((h) => `- **${h.days}:** ${h.time}`).join('\n');
  return {
    en: {
      contact: `call ${phone} or ${wa('message us on WhatsApp')}`,
      emergency: (c) => `That sounds serious. If you or someone else is having trouble breathing or swallowing, please **get emergency medical care right now**. For urgent dental questions, you can also ${c}.`,
      manage: (c) => `I’m not able to see, change or cancel appointments, and I can’t share anyone’s booking details. That keeps everyone’s information private. The team can sort it out for you, though: just ${c}.`,
      payOnline: (c) => `Payments aren’t taken through the website or through me. The team will go over payment with you at the clinic. If you have questions about fees or payment options, ${c}.`,
      price: (c) => `${pick(['Good question!', 'I get asked that a lot!'])} Fees and insurance haven’t been confirmed for the website yet, so I’d rather not guess. The team can give you the details: ${c}. Just so you know, payments aren’t taken through the website or through me. Would you like me to find you a time for a consultation in the meantime?`,
      braces: (c) => `Whether braces or clear aligners are offered hasn’t been confirmed yet, so it’s best to check with the team: ${c}. What I can tell you is that we offer [orthodontic consultations](${site.u('/services/consultations-diagnostics')}#orthodontic-consultations), [mouthguards](${site.u('/services/orthodontics-protective-appliances')}#mouthguards), and [fixed](${site.u('/services/orthodontics-protective-appliances')}#fixed-retainers) and [removable retainers](${site.u('/services/orthodontics-protective-appliances')}#removable-retainers). Would you like to request an orthodontic consultation?`,
      clinical: (c) => `I’m sorry you’re dealing with that. I can’t give dental advice, but the team can. Please ${c} so they can advise you. If you’d like to be seen, I can find you a time for a [general consultation](${site.u('/services/consultations-diagnostics')}#general-consultations); just say “book a consultation”.`,
      offer: (lines, label) => `${pick(['Sure!', 'Of course!', 'Happy to help!'])} Here are the next openings for a 30-minute **general consultation**${label ? ` ${label}` : ''} (Belize time):\n\n${lines}\n\nJust reply with the number you’d like, or tell me another day, for example “Saturday morning”.`,
      offerOn: (day) => `on ${day}`,
      noneThen: (lines, label) => `There aren’t any online openings ${label ? `on ${label}` : 'then'}, I’m afraid. The next available general consultations (Belize time) are:\n\n${lines}\n\nReply with a number to choose one.`,
      none: (c) => `I couldn’t find an online opening in that range. The team can help you find a time: ${c}.`,
      notAvailable: (when, why, lines) => `Sorry, ${when} isn’t available${why}. The closest openings (Belize time) are:\n\n${lines}\n\nReply with a number to choose one.`,
      why: { booked: ': someone has already booked it', lunch: ' because the clinic is closed for lunch then', closed: ' because it’s outside the hours we can book online', soon: ' because it’s a little too soon to book online' },
      available: 'Good news, that time is open!',
      form: (visit, date, time) => `${pick(['Great choice!', 'Perfect!', 'Lovely!'])} I’ve pulled up the booking form for a **${visit}** on **${date} at ${time}** (Belize time). Pop in your name and a phone number or email, then tap **Confirm booking**. As soon as you do, it’s blocked on the clinic’s calendar for you.`,
      slotGone: (msg, lines) => `${msg}\n\n${lines}\n\nReply with a number to choose one.`,
      ortho: (note) => `Orthodontic consultations are arranged personally by the team.${note} I’ve opened a short request form below. Once you send it, they’ll reach out to set up a time.`,
      bracesNote: ' Whether braces or clear aligners are offered hasn’t been confirmed yet, so the team can tell you more.',
      requestService: (name) => `Happy to help with that. I’ll pass a request about **${name}** to the team. Fill in the short form below and they’ll contact you to arrange the right appointment.`,
      consultFor: (name) => `A general consultation is the usual first step for ${name.toLowerCase()}. If you’d prefer, say “request” and the team will arrange a visit for it.\n\n`,
      hours: (s) => `Here are our posted hours:\n\n${hours(s)}\n\n${s.pages.contact.hoursNote} You’ll find us at The Boardwalk Belize in Belize City. [Contact Us](${s.u('/contact')}) has all the details. Would you like me to find you an appointment?`,
      location: (route) => `We’re at **${clinic.address}**. Here are [directions](${site.directionsUrl})${route ? `, and there’s a short [video of the drive](${site.u('/contact')}#find-your-way) if that helps` : ''}. Would you like me to find you an appointment?`,
      service: (s, c) => `Yes, we do! **${s.name}** is part of our [${c.title}](${s.path}) care. ${s.body.split('. ')[0]}. Would you like me to find a time for a consultation?`,
      category: (c) => `Our **${c.title}** care includes ${c.services.map((x) => `[${x.name.toLowerCase()}](${x.path})`).join(', ')}. Would you like me to find a time for a consultation?`,
      doctor: () => `Your dentist is **${clinic.clinician.name}, ${clinic.clinician.designation}**. You can [read more about her here](${site.u('/about')}). Would you like to book a visit?`,
      thanks: () => pick(['You’re very welcome! Is there anything else I can help with?', 'My pleasure! Anything else I can do for you?']),
      greeting: () => pick(['Hi there! How can I help you today? I can find a service, answer questions about the clinic, or book you in.', 'Hello! What can I help you with today? I can find a service, check our hours, or book an appointment.']),
      fallback: (c) => `I’m not sure I caught that. I can help you find a [service](${site.u('/services')}), check our hours or location, or book an appointment. For anything else, the team is happy to help: ${c}.`,
    },
    es: {
      contact: `llame al ${phone} o ${wa('escríbanos por WhatsApp')}`,
      emergency: (c) => `Eso suena serio. Si usted u otra persona tiene dificultad para respirar o tragar, **busque atención médica de emergencia ahora mismo**. Para preguntas dentales urgentes, también puede ${c}.`,
      manage: (c) => `No puedo ver, cambiar ni cancelar citas, y no puedo compartir los datos de la cita de nadie. Así protegemos la información de todos. El equipo le puede ayudar enseguida: ${c}.`,
      payOnline: (c) => `No se aceptan pagos por el sitio web ni a través de mí. El equipo le explicará el pago en la clínica. Si tiene preguntas sobre costos u opciones de pago, ${c}.`,
      price: (c) => `${pick(['¡Buena pregunta!', '¡Me lo preguntan mucho!'])} Los costos y los seguros todavía no están confirmados para el sitio web, así que prefiero no adivinar. El equipo le puede dar los detalles: ${c}. Para que lo sepa, no se aceptan pagos por el sitio web ni a través de mí. ¿Quiere que le busque una hora para una consulta mientras tanto?`,
      braces: (c) => `Todavía no está confirmado si se ofrecen frenos o alineadores transparentes, así que lo mejor es consultarlo con el equipo: ${c}. Lo que sí le puedo decir es que ofrecemos [consultas de ortodoncia](${site.u('/services/consultations-diagnostics')}#orthodontic-consultations), [protectores bucales](${site.u('/services/orthodontics-protective-appliances')}#mouthguards) y [retenedores fijos](${site.u('/services/orthodontics-protective-appliances')}#fixed-retainers) y [removibles](${site.u('/services/orthodontics-protective-appliances')}#removable-retainers). ¿Le gustaría solicitar una consulta de ortodoncia?`,
      clinical: (c) => `Lamento que esté pasando por eso. No puedo dar consejos dentales, pero el equipo sí. Por favor, ${c} para que le orienten. Si quiere que le atiendan, le puedo buscar una hora para una [consulta general](${site.u('/services/consultations-diagnostics')}#general-consultations); solo diga “quiero una cita”.`,
      offer: (lines, label) => `${pick(['¡Claro!', '¡Con gusto!', '¡Por supuesto!'])} Estos son los próximos horarios para una **consulta general** de 30 minutos${label ? ` ${label}` : ''} (hora de Belice):\n\n${lines}\n\nResponda con el número que prefiera o dígame otro día, por ejemplo “el sábado por la mañana”.`,
      offerOn: (day) => `el ${day}`,
      noneThen: (lines, label) => `Lo siento, no hay horarios en línea ${label ? `el ${label}` : 'en esas fechas'}. Las próximas consultas generales disponibles (hora de Belice) son:\n\n${lines}\n\nResponda con un número para elegir.`,
      none: (c) => `No encontré horarios en línea en esas fechas. El equipo le puede ayudar a encontrar una hora: ${c}.`,
      notAvailable: (when, why, lines) => `Lo siento, ${when} no está disponible${why}. Los horarios más cercanos (hora de Belice) son:\n\n${lines}\n\nResponda con un número para elegir.`,
      why: { booked: ': alguien ya lo reservó', lunch: ' porque la clínica cierra para almorzar a esa hora', closed: ' porque está fuera del horario que se puede reservar en línea', soon: ' porque es demasiado pronto para reservar en línea' },
      available: '¡Buenas noticias, ese horario está libre!',
      form: (visit, date, time) => `${pick(['¡Excelente elección!', '¡Perfecto!', '¡Muy bien!'])} Abrí el formulario de reserva para una **${visit.toLowerCase()}** el **${date} a las ${time}** (hora de Belice). Escriba su nombre y un teléfono o correo, y toque **Confirmar cita**. En cuanto lo haga, quedará reservada para usted en el calendario de la clínica.`,
      slotGone: (msg, lines) => `${msg}\n\n${lines}\n\nResponda con un número para elegir.`,
      ortho: (note) => `Las consultas de ortodoncia las programa el equipo personalmente.${note} Abrí un breve formulario de solicitud aquí abajo. Cuando lo envíe, le contactarán para fijar la hora.`,
      bracesNote: ' Todavía no está confirmado si se ofrecen frenos o alineadores transparentes; el equipo le dará más información.',
      requestService: (name) => `Con gusto le ayudo. Le enviaré al equipo una solicitud sobre **${name.toLowerCase()}**. Complete el breve formulario de abajo y le contactarán para programar la cita adecuada.`,
      consultFor: (name) => `Una consulta general suele ser el primer paso para ${name.toLowerCase()}. Si prefiere, diga “solicitud” y el equipo le programará una visita para eso.\n\n`,
      hours: (s) => `Este es nuestro horario publicado:\n\n${hours(s)}\n\n${s.pages.contact.hoursNote} Nos encuentra en The Boardwalk Belize, Belize City. En [Contacto](${s.u('/contact')}) están todos los detalles. ¿Quiere que le busque una cita?`,
      location: (route) => `Estamos en **${clinic.address}**. Aquí tiene [cómo llegar](${site.directionsUrl})${route ? ` y un breve [video del camino](${site.u('/contact')}#find-your-way) por si le ayuda` : ''}. ¿Quiere que le busque una cita?`,
      service: (s, c) => `¡Sí, lo ofrecemos! **${s.name}** forma parte de nuestra atención de [${c.title.toLowerCase()}](${s.path}). ${s.body.split('. ')[0]}. ¿Quiere que le busque una hora para una consulta?`,
      category: (c) => `Nuestra atención de **${c.title.toLowerCase()}** incluye ${c.services.map((x) => `[${x.name.toLowerCase()}](${x.path})`).join(', ')}. ¿Quiere que le busque una hora para una consulta?`,
      doctor: () => `Su dentista es la **${clinic.clinician.name.replace('Dr.', 'Dra.')}, DDS y ortodoncista**. Puede [conocerla aquí](${site.u('/about')}). ¿Le gustaría reservar una visita?`,
      thanks: () => pick(['¡Con mucho gusto! ¿Hay algo más en lo que le pueda ayudar?', '¡Un placer! ¿Le ayudo con algo más?']),
      greeting: () => pick(['¡Hola! ¿En qué le puedo ayudar hoy? Puedo buscar un servicio, responder preguntas sobre la clínica o reservarle una cita.', '¡Hola! ¿Qué necesita hoy? Puedo buscar un servicio, darle nuestro horario o reservar una cita.']),
      fallback: (c) => `No estoy segura de haber entendido. Le puedo ayudar a encontrar un [servicio](${site.u('/services')}), darle nuestro horario o ubicación, o reservar una cita. Para cualquier otra cosa, el equipo le ayuda con gusto: ${c}.`,
    },
  };
}

export function createDemoAssistant({ site, sites = { en: site, es: site }, scheduling, kv = null, now = () => new Date(), logger = console }) {
  const tz = scheduling.timeZone;
  const config = site.scheduling;
  const routeVideo = site.siteConfig.media.galleryVideos.some((v) => v.id === 'route-to-confident' && v.src);
  const P = { en: phrases(sites.en).en, es: phrases(sites.es).es };

  // Service lookup: names and aliases in both languages, mapped to the service/category slug.
  const terms = [];
  for (const loc of ['en', 'es']) {
    for (const c of sites[loc].categories) {
      terms.push({ term: norm(c.title).replace(/&/g, 'and'), cat: c.slug });
      for (const s of c.services) {
        for (const t of [s.name, ...s.aliases]) terms.push({ term: norm(t), cat: c.slug, svc: s.slug });
      }
    }
  }
  terms.sort((a, b) => b.term.length - a.term.length);
  const findService = (text) => {
    const t = text.replace(/&/g, 'and');
    for (const entry of terms) {
      const singular = entry.term.replace(/e?s$/, '');
      if (t.includes(entry.term) || (singular.length > 4 && t.includes(singular))) return entry;
    }
    return null;
  };
  const lookup = (loc, entry) => {
    const c = sites[loc].categories.find((x) => x.slug === entry.cat);
    return { c, s: entry.svc ? c.services.find((x) => x.slug === entry.svc) : null };
  };

  const memory = new Map();
  const fresh = () => ({ offer: null, lastService: null, lastPrompt: null });
  const load = async (sid) => (kv ? (await kv.getJSON(`chats/${sid}`)) : memory.get(sid)) ?? fresh();
  const save = async (sid, state) => (kv ? kv.setJSON(`chats/${sid}`, { ...state, updatedAt: now().toISOString() }) : memory.set(sid, state));

  function detectLanguage(text, pageLocale) {
    const es = (text.match(RE.spanish) || []).length;
    const en = (text.match(RE.english) || []).length;
    if (es > en && es >= 1) return 'es';
    if (en > es && en >= 2) return 'en';
    return pageLocale === 'es' ? 'es' : 'en';
  }

  function dateRange(text, loc) {
    const today = partsInZone(now(), tz).date;
    const tomorrow = /\btomorrow\b/.test(text) || (/\bmanana\b/.test(text) && !/\b(la|por la|en la) manana\b/.test(text));
    if (/\b(today|hoy)\b/.test(text)) return { from: today, to: today, label: loc === 'es' ? 'hoy' : 'today' };
    if (tomorrow) return { from: addDays(today, 1), to: addDays(today, 1), label: loc === 'es' ? 'mañana' : 'tomorrow' };
    let weekday = WEEKDAYS.find((d) => new RegExp(`\\b${d.toLowerCase()}`).test(text));
    if (!weekday) { const es = Object.keys(ES_DAYS).find((d) => new RegExp(`\\b${d}\\b`).test(text)); if (es) weekday = ES_DAYS[es]; }
    if (weekday) {
      let day = today;
      for (let i = 0; i < 7; i += 1) {
        const d = addDays(today, i);
        if (WEEKDAYS[new Date(`${d}T12:00:00Z`).getUTCDay()] === weekday) { day = d; break; }
      }
      if (/\b(next|proximo|proxima)\b/.test(text) && day === today) day = addDays(day, 7);
      const esName = Object.entries(ES_DAYS).find(([, v]) => v === weekday)[0].replace('miercoles', 'miércoles').replace('sabado', 'sábado');
      return { from: day, to: day, label: loc === 'es' ? esName : weekday, weekday };
    }
    if (/\b(next week|proxima semana|semana que viene)\b/.test(text)) {
      const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
      const monday = addDays(today, ((8 - dow) % 7) || 7);
      return { from: monday, to: addDays(monday, 5), label: loc === 'es' ? 'la próxima semana' : 'next week', week: true };
    }
    return { from: today, to: addDays(today, 6), label: null };
  }

  const slotLine = (s, i) => `${i + 1}. ${s.shortDateLabel}, ${s.timeLabel}`;
  const toMinutes = (s) => { const p = partsInZone(new Date(s.start), tz); return p.hour * 60 + p.minute; };
  const morning = (text) => /\b(morning|por la manana|en la manana)\b/.test(text);
  const afternoon = (text) => /\b(afternoon|por la tarde|en la tarde)\b/.test(text);

  /** Why a requested day/time isn't offered: lunch, outside hours, too soon, or already booked. */
  function reasonFor(day, minutes) {
    const windows = config.bookableWindows[WEEKDAYS[new Date(`${day}T12:00:00Z`).getUTCDay()]] ?? [];
    const inWindow = windows.some((w) => minutes >= minutesOf(w.start) && minutes + 30 <= minutesOf(w.end));
    if (!inWindow) {
      const lunch = windows.length > 1 && minutes >= minutesOf(windows[0].end) && minutes < minutesOf(windows[1].start);
      return lunch ? 'lunch' : 'closed';
    }
    const today = partsInZone(now(), tz).date;
    const p = partsInZone(now(), tz);
    if (day === today && minutes < p.hour * 60 + p.minute + config.minimumNoticeMinutes) return 'soon';
    return 'booked';
  }

  async function openForm(sessionId, state, slot, loc, prefix = '') {
    const T = P[loc];
    try {
      const review = await scheduling.prepareBooking({ sessionId, slotRef: slot.slotRef, locale: loc });
      state.offer = null;
      return { reply: `${prefix ? `${prefix} ` : ''}${T.form(review.visitType.label, review.slot.dateLabel, review.slot.timeLabel)}`, actions: [{ type: 'review', review }] };
    } catch (err) {
      if (err instanceof SchedulingError && err.code === 'slot_taken' && err.alternatives?.length) {
        state.offer = { slots: err.alternatives.slice(0, 6) };
        return { reply: T.slotGone(err.message, state.offer.slots.map(slotLine).join('\n')), actions: [] };
      }
      if (err instanceof SchedulingError && err.code === 'invalid_slot') return offerTimes(sessionId, state, '', loc);
      throw err;
    }
  }

  async function offerTimes(sessionId, state, text, loc, intro = '') {
    const T = P[loc];
    const range = dateRange(text, loc);
    const wanted = parseTime(text);
    const result = await scheduling.findAvailability({ sessionId, visitTypeId: 'general-consultation', fromDate: range.from, toDate: range.to, limit: 60, locale: loc });
    let slots = result.slots;
    if (morning(text)) slots = slots.filter((s) => toMinutes(s) < 12 * 60);
    if (afternoon(text)) slots = slots.filter((s) => toMinutes(s) >= 12 * 60);

    if (wanted) {
      const exact = slots.find((s) => toMinutes(s) === wanted.minutes);
      if (exact && !wanted.lunch) return openForm(sessionId, state, exact, loc, T.available);
    }
    if (!slots.length) {
      const later = await scheduling.findAvailability({ sessionId, visitTypeId: 'general-consultation', fromDate: addDays(range.to, 1), toDate: addDays(range.to, 7), limit: 6, locale: loc });
      if (!later.slots.length) return { reply: T.none(T.contact), actions: [] };
      state.offer = { slots: later.slots.slice(0, 6) };
      return { reply: `${intro}${T.noneThen(state.offer.slots.map(slotLine).join('\n'), range.label)}`, actions: [] };
    }
    if (wanted) {
      const day = range.weekday || range.label ? range.from : slots[0].date;
      const nearest = [...slots].sort((a, b) => {
        const d = (s) => (s.date === day ? 0 : 1);
        return d(a) - d(b) || Math.abs(toMinutes(a) - wanted.minutes) - Math.abs(toMinutes(b) - wanted.minutes);
      }).slice(0, 4).sort((a, b) => a.start.localeCompare(b.start));
      state.offer = { slots: nearest };
      const why = wanted.lunch ? 'lunch' : reasonFor(day, wanted.minutes);
      const hh = Math.floor(wanted.minutes / 60); const mm = wanted.minutes % 60;
      const timeText = `${hh % 12 || 12}:${String(mm).padStart(2, '0')} ${loc === 'es' ? (hh < 12 ? 'a. m.' : 'p. m.') : (hh < 12 ? 'a.m.' : 'p.m.')}`;
      const when = range.label ? (loc === 'es' ? `el ${range.label} a las ${timeText}` : `${timeText} on ${range.label}`) : (loc === 'es' ? `las ${timeText}` : timeText);
      return { reply: `${intro}${T.notAvailable(when, T.why[why], nearest.map(slotLine).join('\n'))}`, actions: [] };
    }
    state.offer = { slots: slots.slice(0, 6) };
    return { reply: `${intro}${T.offer(state.offer.slots.map(slotLine).join('\n'), range.label && !range.week ? T.offerOn(range.label) : range.week ? range.label : '')}`, actions: [] };
  }

  async function staffForm(sessionId, state, visitTypeId, reply, loc) {
    const review = await scheduling.prepareStaffReview({ sessionId, visitTypeId, locale: loc });
    state.offer = null;
    return { reply, actions: [{ type: 'review', review }] };
  }

  function pickFromOffer(text, offer) {
    const n = text.match(/^\s*(?:option\s*|number\s*|opcion\s*|numero\s*|la\s*|el\s*|#)?(\d)\s*[.)]?\s*(?:por favor|please)?\s*$/) || text.match(/\b(?:option|number|opcion|numero)\s*(\d)\b/);
    if (n) return offer.slots[Number(n[1]) - 1] ?? null;
    for (const [word, idx] of Object.entries(ORDINALS)) {
      if (new RegExp(`\\b${word}\\b`).test(text)) return idx === -1 ? offer.slots.at(-1) : offer.slots[idx] ?? null;
    }
    const wanted = parseTime(text) ?? (() => { const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\b/); return m ? parseTime(`at ${m[0]}`) : null; })();
    if (wanted) {
      let weekday = WEEKDAYS.find((d) => new RegExp(`\\b${d.toLowerCase()}`).test(text));
      if (!weekday) { const es = Object.keys(ES_DAYS).find((d) => new RegExp(`\\b${d}\\b`).test(text)); if (es) weekday = ES_DAYS[es]; }
      return offer.slots.find((s) => toMinutes(s) === wanted.minutes && (!weekday || WEEKDAYS[new Date(`${s.date}T12:00:00Z`).getUTCDay()] === weekday)) ?? null;
    }
    return null;
  }

  async function respond(sessionId, state, raw, loc) {
    const text = norm(raw);
    const T = P[loc];
    const c = T.contact;

    if (RE.emergency.test(text)) return { reply: T.emergency(c), actions: [] };

    if (state.offer) {
      const chosen = pickFromOffer(text, state.offer);
      if (chosen) return openForm(sessionId, state, chosen, loc);
    }

    if (RE.manageBooking.test(text)) return { reply: T.manage(c), actions: [] };
    if (RE.payOnline.test(text)) return { reply: T.payOnline(c), actions: [] };
    if (RE.price.test(text)) { state.lastPrompt = 'consultation'; return { reply: T.price(c), actions: [] }; }

    const found = findService(text);
    if (found?.svc) state.lastService = found.svc;
    const mentionsDay = /\b(today|tomorrow|next week|hoy|manana|proxima semana|monday|tuesday|wednesday|thursday|friday|saturday|sunday|lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b/.test(text);
    const bookingIntent = RE.booking.test(text) || /\b(can i come|puedo ir)\b/.test(text) || (mentionsDay && parseTime(text) !== null);
    const yes = RE.yes.test(text);

    if (RE.braces.test(text) && !bookingIntent) { state.lastPrompt = 'orthodontic'; return { reply: T.braces(c), actions: [] }; }
    if (RE.clinical.test(text) && !bookingIntent) return { reply: T.clinical(c), actions: [] };

    if ((bookingIntent && RE.ortho.test(text)) || (yes && state.lastPrompt === 'orthodontic')) {
      return staffForm(sessionId, state, 'orthodontic-consultation', T.ortho(RE.braces.test(text) ? T.bracesNote : ''), loc);
    }
    if (RE.request.test(text) && state.lastService) {
      const svc = sites[loc].categories.flatMap((x) => x.services).find((x) => x.slug === state.lastService);
      return staffForm(sessionId, state, 'other-visit', T.requestService(svc.name), loc);
    }
    if (bookingIntent || (yes && state.lastPrompt === 'consultation')) {
      const svc = found?.svc ? lookup(loc, found).s : null;
      const intro = svc && !/consult/.test(found.svc) ? T.consultFor(svc.name) : '';
      return offerTimes(sessionId, state, text, loc, intro);
    }
    if (RE.hours.test(text)) { state.lastPrompt = 'consultation'; return { reply: T.hours(sites[loc]), actions: [] }; }
    if (RE.location.test(text)) { state.lastPrompt = 'consultation'; return { reply: T.location(routeVideo), actions: [] }; }
    if (found) {
      const { c: cat, s: svc } = lookup(loc, found);
      state.lastPrompt = 'consultation';
      return { reply: svc ? T.service(svc, cat) : T.category(cat), actions: [] };
    }
    if (RE.doctor.test(text)) { state.lastPrompt = 'consultation'; return { reply: T.doctor(), actions: [] }; }
    if (RE.thanks.test(text)) return { reply: T.thanks(), actions: [] };
    if (RE.greeting.test(text)) return { reply: T.greeting(), actions: [] };
    return { reply: T.fallback(c), actions: [] };
  }

  async function handleMessage({ sessionId, text, locale = 'en' }) {
    const message = String(text ?? '').trim().slice(0, 800);
    if (!message) return { reply: '', actions: [] };
    const state = await load(sessionId);
    const loc = detectLanguage(norm(message), locale);
    try {
      const before = state.lastPrompt;
      const out = await respond(sessionId, state, message, loc);
      if (state.lastPrompt === before && !/\?$/.test(out.reply)) state.lastPrompt = null;
      await save(sessionId, state);
      return { ...out, mode: 'demo' };
    } catch (err) {
      logger.error('[demo assistant] error', err.name);
      return { reply: sites[loc].statusMessages.unavailable, actions: [], degraded: true };
    }
  }

  return {
    available: true,
    mode: 'demo',
    model: 'demo',
    handleMessage,
    noteOutcome: async () => {},
    reset: async (sessionId) => save(sessionId, fresh()),
    systemPrompt: '',
    tools: [],
  };
}
