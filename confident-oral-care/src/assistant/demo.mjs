// confident AI demo mode: scripted, rule-based replies for client previews without an API key.
// It answers from the same approved clinic records and drives the REAL scheduling service
// (availability, booking form, staff review), so the booking experience is genuine. It is
// labelled as a demo in the UI; with ANTHROPIC_API_KEY set, the Claude assistant is used instead.

import { SchedulingError } from '../scheduling/service.mjs';
import { addDays, partsInZone, WEEKDAYS } from '../scheduling/time.mjs';

const has = (text, re) => re.test(text);

const RE = {
  emergency: /\b(can'?t breathe|cannot breathe|difficulty breathing|trouble breathing|hard to breathe|can'?t swallow|difficulty swallowing|trouble swallowing|emergency|swelling (is )?spreading|bleeding (won'?t|will not|doesn'?t) stop|unconscious)\b/,
  manageBooking: /\b(cancel|reschedul|change (my|the|an)? ?appointment|move (my|the) appointment|my appointment|someone else'?s|another person'?s|my (husband|wife|son|daughter|mom|mother|dad|father|friend)'?s appointment)\b/,
  price: /\b(price|prices|cost|costs|how much|fee|fees|charge|insurance|insured|payment|pay|card|cash|financ)\w*/,
  braces: /\b(braces|aligner|aligners|invisalign|clear aligner)\b/,
  ortho: /\b(orthodont\w*|retainer\w*|braces|aligner\w*|invisalign|bite|crooked)\b/,
  clinical: /\b(pain|painful|hurts?|hurting|ache|aching|toothache|swollen|swelling|infect\w*|abscess|bleed\w*|antibiotic\w*|medicat\w*|ibuprofen|should i (take|use)|is it normal|diagnos\w*)\b/,
  booking: /\b(book|booking|appointment|appointments|schedule|reserve|availability|available|slot|slots|consultation|consult|come in|come by|see (the )?(dentist|doctor)|times?)\b/,
  hours: /\b(hours|open|opening|close|closing|closed|when are you|what time)\b/,
  location: /\b(where|location|located|address|directions?|find you|get there|parking|boardwalk|map)\b/,
  doctor: /\b(dr\.?|doctor|dentist|haylock|who (is|are))\b/,
  greeting: /^(hi|hello|hey|good (morning|afternoon|evening)|hola)\b/,
  thanks: /\b(thanks|thank you|thx|great|perfect|awesome)\b/,
  request: /\b(request|team (arrange|contact)|send (a )?request)\b/,
};

const ORDINALS = { first: 0, '1st': 0, second: 1, '2nd': 1, third: 2, '3rd': 2, fourth: 3, '4th': 3, fifth: 4, '5th': 4, sixth: 5, '6th': 5, last: -1 };

function parseTime(text) {
  if (/\bnoon\b|\bmidday\b/.test(text)) return { minutes: 12 * 60 };
  if (/\blunch\b/.test(text)) return { minutes: 12 * 60, lunch: true };
  const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?\s?m\.?|p\.?\s?m\.?)?(?=\W|$)/);
  if (!m) return null;
  let hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  const mer = m[3] ? m[3].replace(/[\s.]/g, '') : null;
  if (!mer && !m[2] && (hour > 12 || hour === 0)) return null;
  if (!mer && !m[2] && !/\bat\b|o'?clock/.test(text)) return null; // a bare number is likely an option
  if (hour > 23 || minute > 59) return null;
  if (mer === 'pm' && hour < 12) hour += 12;
  if (mer === 'am' && hour === 12) hour = 0;
  if (!mer && hour >= 1 && hour <= 6) hour += 12; // "at 3" means 3 p.m. in clinic hours
  return { minutes: hour * 60 + minute };
}

export function createDemoAssistant({ site, scheduling, kv = null, now = () => new Date(), logger = console }) {
  const { clinic } = site;
  const tz = scheduling.timeZone;
  const phone = `[${clinic.phone.label}](${clinic.phone.href})`;
  const instagram = `[Instagram](${clinic.socialLinks.instagram})`;
  const contactLine = `call ${phone} or send the practice a message on ${instagram}`;
  const hoursText = site.hours.map((h) => `- **${h.days}:** ${h.time}`).join('\n');
  const routeVideo = site.siteConfig.media.galleryVideos.some((v) => v.id === 'route-to-confident' && v.src);

  // Service lookup from names, aliases and category titles in clinic-data.json.
  const terms = [];
  for (const c of site.categories) {
    terms.push({ term: c.title.toLowerCase().replace(/&/g, 'and'), category: c });
    for (const s of c.services) {
      for (const t of [s.name, ...s.aliases]) terms.push({ term: t.toLowerCase(), service: s, category: c });
    }
  }
  terms.sort((a, b) => b.term.length - a.term.length);
  const findService = (text) => {
    const t = text.replace(/&/g, 'and');
    for (const entry of terms) {
      const singular = entry.term.replace(/s$/, '');
      if (t.includes(entry.term) || (singular.length > 4 && t.includes(singular))) return entry;
    }
    return null;
  };

  const memory = new Map();
  const load = async (sid) => (kv ? (await kv.getJSON(`chats/${sid}`)) : memory.get(sid)) ?? { offer: null, lastService: null };
  const save = async (sid, state) => (kv ? kv.setJSON(`chats/${sid}`, { ...state, updatedAt: now().toISOString() }) : memory.set(sid, state));

  function dateRange(text) {
    const today = partsInZone(now(), tz).date;
    if (/\btoday\b/.test(text)) return { from: today, to: today, label: 'today' };
    if (/\btomorrow\b/.test(text)) return { from: addDays(today, 1), to: addDays(today, 1), label: 'tomorrow' };
    const weekday = WEEKDAYS.find((d) => new RegExp(`\\b${d.toLowerCase()}`).test(text));
    if (weekday) {
      let day = today;
      for (let i = 0; i < 7; i += 1) {
        const d = addDays(today, i);
        if (WEEKDAYS[new Date(`${d}T12:00:00Z`).getUTCDay()] === weekday) { day = d; break; }
      }
      if (/\bnext\b/.test(text) && day === today) day = addDays(day, 7);
      return { from: day, to: day, label: weekday };
    }
    if (/\bnext week\b/.test(text)) {
      const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
      const monday = addDays(today, ((8 - dow) % 7) || 7);
      return { from: monday, to: addDays(monday, 5), label: 'next week' };
    }
    return { from: today, to: addDays(today, 6), label: null };
  }

  const slotLine = (s, i) => `${i + 1}. ${s.shortDateLabel} at ${s.timeLabel}`;
  const toMinutes = (s) => { const p = partsInZone(new Date(s.start), tz); return p.hour * 60 + p.minute; };

  async function openForm(sessionId, state, slot) {
    try {
      const review = await scheduling.prepareBooking({ sessionId, slotRef: slot.slotRef });
      state.offer = null;
      return {
        reply: `Here’s the booking form for a **${review.visitType.label}** on **${review.slot.dateLabel} at ${review.slot.timeLabel}** Belize time. Enter your name and one contact method, then confirm. It isn’t booked until the form says it’s confirmed.`,
        actions: [{ type: 'review', review }],
      };
    } catch (err) {
      if (err instanceof SchedulingError && err.code === 'slot_taken' && err.alternatives?.length) {
        state.offer = { visitTypeId: 'general-consultation', slots: err.alternatives.slice(0, 6) };
        return { reply: `${err.message}\n\n${state.offer.slots.map(slotLine).join('\n')}\n\nReply with a number to choose one.`, actions: [] };
      }
      if (err instanceof SchedulingError && err.code === 'invalid_slot') return offerTimes(sessionId, state, '');
      throw err;
    }
  }

  async function offerTimes(sessionId, state, text, intro = '') {
    const range = dateRange(text);
    const wanted = parseTime(text);
    const result = await scheduling.findAvailability({ sessionId, visitTypeId: 'general-consultation', fromDate: range.from, toDate: range.to, limit: 60 });
    let slots = result.slots;
    if (/\bmorning\b/.test(text)) slots = slots.filter((s) => toMinutes(s) < 12 * 60);
    if (/\bafternoon\b/.test(text)) slots = slots.filter((s) => toMinutes(s) >= 12 * 60);

    if (!slots.length) {
      const later = await scheduling.findAvailability({ sessionId, visitTypeId: 'general-consultation', fromDate: addDays(range.to, 1), toDate: addDays(range.to, 7), limit: 6 });
      if (!later.slots.length) return { reply: `I couldn’t find an online time in that range. Please ${contactLine}.`, actions: [] };
      state.offer = { visitTypeId: 'general-consultation', slots: later.slots.slice(0, 6) };
      return { reply: `${intro}There are no online times ${range.label ? `on ${range.label}` : 'in that range'}. The next available general consultations (Belize time) are:\n\n${state.offer.slots.map(slotLine).join('\n')}\n\nReply with a number to choose one.`, actions: [] };
    }

    if (wanted) {
      const exact = slots.find((s) => toMinutes(s) === wanted.minutes);
      if (exact && !wanted.lunch) return openForm(sessionId, state, exact);
      const nearest = [...slots].sort((a, b) => {
        const day = (s) => (s.date === slots[0].date ? 0 : 1);
        return day(a) - day(b) || Math.abs(toMinutes(a) - wanted.minutes) - Math.abs(toMinutes(b) - wanted.minutes);
      }).slice(0, 4).sort((a, b) => a.start.localeCompare(b.start));
      state.offer = { visitTypeId: 'general-consultation', slots: nearest };
      const why = wanted.lunch || (wanted.minutes >= 12 * 60 && wanted.minutes < 14 * 60) ? ' (the clinic is closed for lunch)'
        : wanted.minutes >= 17 * 60 || wanted.minutes < 9 * 60 ? ' (it’s outside the bookable hours)' : '';
      return { reply: `${intro}That time isn’t available online${why}. The nearest available times (Belize time) are:\n\n${nearest.map(slotLine).join('\n')}\n\nReply with a number to choose one.`, actions: [] };
    }

    state.offer = { visitTypeId: 'general-consultation', slots: slots.slice(0, 6) };
    return {
      reply: `${intro}Here are the next available times for a 30-minute **general consultation** (Belize time):\n\n${state.offer.slots.map(slotLine).join('\n')}\n\nReply with a number or a time, or ask for another day (for example “Saturday morning”).`,
      actions: [],
    };
  }

  async function staffForm(sessionId, state, visitTypeId, intro) {
    const review = await scheduling.prepareStaffReview({ sessionId, visitTypeId });
    state.offer = null;
    return { reply: `${intro} I’ve opened a short request form below. The team will contact you to arrange a time; no appointment time is set until they do.`, actions: [{ type: 'review', review }] };
  }

  function pickFromOffer(text, offer) {
    const n = text.match(/^\s*(?:option\s*|number\s*|#)?(\d)\s*[.)]?\s*$/) || text.match(/\b(?:option|number)\s*(\d)\b/);
    if (n) return offer.slots[Number(n[1]) - 1] ?? null;
    for (const [word, idx] of Object.entries(ORDINALS)) {
      if (new RegExp(`\\b${word}\\b`).test(text)) return idx === -1 ? offer.slots.at(-1) : offer.slots[idx] ?? null;
    }
    const wanted = parseTime(text) ?? (() => { const m = text.match(/\b(\d{1,2})(?::(\d{2}))?\b/); return m ? parseTime(`at ${m[0]}`) : null; })();
    if (wanted) {
      const weekday = WEEKDAYS.find((d) => new RegExp(`\\b${d.toLowerCase()}`).test(text));
      return offer.slots.find((s) => toMinutes(s) === wanted.minutes && (!weekday || s.dateLabel.startsWith(weekday))) ?? null;
    }
    return null;
  }

  async function respond(sessionId, state, raw) {
    const text = raw.toLowerCase().replace(/[’']/g, "'");

    if (has(text, RE.emergency)) {
      return { reply: `If you or someone else has difficulty breathing or swallowing, or this is an emergency, **seek emergency medical care now**. For urgent dental questions, ${contactLine}.`, actions: [] };
    }

    if (state.offer) {
      const pick = pickFromOffer(text, state.offer);
      if (pick) return openForm(sessionId, state, pick);
    }

    if (has(text, RE.manageBooking)) {
      return { reply: `I can’t see, change or cancel appointments, and I can’t share anyone’s appointment details. To change or cancel a booking, please ${contactLine}.`, actions: [] };
    }

    if (has(text, RE.price)) {
      return { reply: `Fees, insurance and payment options haven’t been confirmed for the website yet, so I don’t want to guess. The team can tell you: ${contactLine}. If you’d like, I can find a time for a consultation.`, actions: [] };
    }

    const service = findService(text);
    if (service?.service) state.lastService = service.service.name;
    const mentionsDay = /\b(today|tomorrow|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/.test(text);
    const bookingIntent = has(text, RE.booking) || /\bcan i come\b/.test(text) || (mentionsDay && parseTime(text) !== null);

    if (has(text, RE.braces) && !bookingIntent) {
      return { reply: `Whether braces or clear aligners are offered hasn’t been confirmed yet, so please ask the team: ${contactLine}. The confirmed orthodontic services are [orthodontic consultations](/services/consultations-diagnostics#orthodontic-consultations), [mouthguards](/services/orthodontics-protective-appliances#mouthguards), and [fixed](/services/orthodontics-protective-appliances#fixed-retainers) and [removable retainers](/services/orthodontics-protective-appliances#removable-retainers). Would you like to request an orthodontic consultation?`, actions: [] };
    }

    if (has(text, RE.clinical) && !bookingIntent) {
      return { reply: `I can’t give clinical advice, but the dental team can. Please ${contactLine} to describe what’s happening. If you’d like to be seen, I can find a time for a [general consultation](/services/consultations-diagnostics#general-consultations); just say “book a consultation”.`, actions: [] };
    }

    if ((bookingIntent && has(text, RE.ortho)) || (has(text, /\byes\b/) && /orthodontic/.test(state.lastPrompt ?? ''))) {
      const note = has(text, RE.braces) ? ' Whether braces or clear aligners are offered hasn’t been confirmed yet; the team can tell you.' : '';
      return staffForm(sessionId, state, 'orthodontic-consultation', `Orthodontic consultations are arranged by the team.${note}`);
    }

    if (has(text, RE.request) && state.lastService) {
      return staffForm(sessionId, state, 'other-visit', `I’ll send a request about **${state.lastService}** to the team.`);
    }

    if (bookingIntent || has(text, /\byes\b/) && /consultation/.test(state.lastPrompt ?? '')) {
      const intro = service?.service && !/consultation/i.test(service.service.name)
        ? `A general consultation is the usual starting point for ${service.service.name.toLowerCase()}. You can also say “request” and the team will arrange a visit for it.\n\n`
        : '';
      return offerTimes(sessionId, state, text, intro);
    }

    if (has(text, RE.hours)) {
      return { reply: `Our posted hours are:\n\n${hoursText}\n\n${site.pages.contact.hoursNote} You can find us at The Boardwalk Belize, Belize City. See [Contact Us](/contact).`, actions: [] };
    }

    if (has(text, RE.location)) {
      return { reply: `We’re at **${clinic.address}**. [Get directions](${site.directionsUrl})${routeVideo ? ', or watch the short [route to ConfiDent](/contact#find-your-way) video' : ''}. To arrange a visit, ${contactLine}, or ask me to find a time.`, actions: [] };
    }

    if (service) {
      const s = service.service;
      const c = service.category;
      const reply = s
        ? `Yes, we offer **${s.name}** as part of [${c.title}](${s.path}). ${s.body.split('. ')[0]}. Would you like me to find a time for a consultation?`
        : `Our **${c.title}** services include ${c.services.map((x) => `[${x.name.toLowerCase()}](${x.path})`).join(', ')}. Would you like me to find a time for a consultation?`;
      state.lastPrompt = 'consultation';
      return { reply, actions: [] };
    }

    if (has(text, RE.doctor)) {
      return { reply: `Your dentist is **${clinic.clinician.name}, ${clinic.clinician.designation}**. [Meet Dr. Haylock](/about), or ask me to find a time for a consultation.`, actions: [] };
    }

    if (has(text, RE.thanks)) return { reply: `You’re welcome! Is there anything else I can help with?`, actions: [] };
    if (has(text, RE.greeting)) return { reply: `Hello! I can help you find a service, check our hours and location, or find an appointment time. What would you like to do?`, actions: [] };

    return { reply: `I can help with our [services](/services), hours, location, or finding an appointment time. For anything else, please ${contactLine}.`, actions: [] };
  }

  async function handleMessage({ sessionId, text }) {
    const message = String(text ?? '').trim().slice(0, 800);
    if (!message) return { reply: '', actions: [] };
    const state = await load(sessionId);
    try {
      const out = await respond(sessionId, state, message);
      if (!/orthodontic consultation\?$|find a time for a consultation\?$/.test(out.reply)) state.lastPrompt = null;
      if (/request an orthodontic consultation\?$/.test(out.reply)) state.lastPrompt = 'orthodontic';
      if (/find a time for a consultation\?$/.test(out.reply)) state.lastPrompt = 'consultation';
      await save(sessionId, state);
      return { ...out, mode: 'demo' };
    } catch (err) {
      logger.error('[demo assistant] error', err.name);
      return { reply: site.statusMessages.unavailable, actions: [], degraded: true };
    }
  }

  return { available: true, mode: 'demo', model: 'demo', handleMessage, noteOutcome: async () => {}, systemPrompt: '', tools: [] };
}
