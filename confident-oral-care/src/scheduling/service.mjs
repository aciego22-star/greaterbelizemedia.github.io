import { readAll } from '../kv.mjs';
import { CalendarTimeoutError, SlotConflictError } from './errors.mjs';
import { statusMessages } from './messages.mjs';
import {
  addDays, compareDates, formatDateLong, formatDateShort, formatTime, isValidDateString,
  minutesOf, partsInZone, timeOfMinutes, weekdayOf, zonedToUtc,
} from './time.mjs';
import { createTokens } from './tokens.mjs';

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const FINAL = new Set(['confirmed', 'staff_review_recorded']);

export class SchedulingError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    Object.assign(this, extra);
  }
}

function randomRef(length = 6) {
  return Array.from(globalThis.crypto.getRandomValues(new Uint8Array(length)), (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
}

/** Serializes async work per key within one process (the slot claim covers multiple instances). */
class KeyedLock {
  constructor() { this.tails = new Map(); }
  async run(key, fn) {
    const previous = this.tails.get(key) ?? Promise.resolve();
    let release;
    const current = new Promise((resolve) => { release = resolve; });
    const tail = previous.then(() => current);
    this.tails.set(key, tail);
    await previous;
    try {
      return await fn();
    } finally {
      release();
      if (this.tails.get(key) === tail) this.tails.delete(key);
    }
  }
  runMany(keys, fn) {
    const sorted = [...new Set(keys)].sort();
    const step = (i) => (i === sorted.length ? fn() : this.run(sorted[i], () => step(i + 1)));
    return step(0);
  }
}

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_, reject) => { timer = setTimeout(() => reject(new CalendarTimeoutError()), ms); }),
  ]).finally(() => clearTimeout(timer));
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(input = {}, { services = [] } = {}) {
  const errors = {};
  const clean = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
  const contact = {
    name: clean(input.name, 100),
    phone: clean(input.phone, 30),
    email: clean(input.email, 120),
    isMinor: input.isMinor === true || input.isMinor === 'true' || input.isMinor === 'on',
    patientName: clean(input.patientName, 100),
    preferredTimes: clean(input.preferredTimes, 200),
    service: clean(input.service, 80),
  };
  if (contact.name.length < 2) errors.name = 'Enter a name.';
  if (!contact.phone && !contact.email) errors.contact = 'Enter a phone number or an email address.';
  if (contact.phone && !/^[+()\d\s-]{7,30}$/.test(contact.phone)) errors.phone = 'Enter a valid phone number.';
  if (contact.email && !EMAIL_RE.test(contact.email)) errors.email = 'Enter a valid email address.';
  if (contact.isMinor && contact.patientName.length < 2) errors.patientName = 'Enter the patient’s name.';
  if (contact.service && !services.includes(contact.service)) errors.service = 'Choose a service from the list.';
  return { contact, errors, ok: Object.keys(errors).length === 0 };
}

/**
 * One scheduling service shared by the standard booking form and confident AI.
 *
 * Flow: findAvailability -> prepareBooking | prepareStaffReview -> completeReview.
 * Claude may call the first two steps through tools; only the patient's submission of the
 * structured review screen calls completeReview, which performs the calendar write.
 *
 * Slot references and review steps are signed tokens bound to the visitor's session, so the
 * service keeps no in-memory state and runs unchanged on a single server or serverless functions.
 * The booking reference inside the review token is the idempotency key for retries.
 */
export function createSchedulingService({ config, clinic, adapter, kv, secret, now = () => new Date(), logger = console }) {
  const tz = config.timeZone;
  const messages = statusMessages(clinic);
  const tokens = createTokens(secret);
  const lock = new KeyedLock();
  const serviceNames = clinic.serviceGroups.flatMap((g) => g.services.map((s) => s.name));
  const visitTypes = new Map(config.visitTypes.map((v) => [v.id, v]));
  const resourceLabel = new Map(config.resources.map((r) => [r.id, r.label]));
  const previewLabel = config.mode === 'test' ? config.previewLabel : null;

  function publicVisitType(v) {
    return {
      id: v.id, label: v.label, description: v.description, booking: v.booking,
      durationMinutes: v.durationMinutes, servicePage: v.servicePage,
    };
  }

  function slotView(start, end) {
    return {
      start: start.toISOString(),
      end: end.toISOString(),
      date: partsInZone(start, tz).date,
      dateLabel: formatDateLong(start, tz),
      shortDateLabel: formatDateShort(start, tz),
      timeLabel: formatTime(start, tz),
    };
  }

  /** Candidate starts for one day from the bookable windows (whole visit must fit in a window). */
  function candidatesForDay(day, duration) {
    if (config.closedDates.includes(day)) return [];
    const windows = config.bookableWindows[weekdayOf(day)] ?? [];
    const out = [];
    for (const w of windows) {
      for (let m = minutesOf(w.start); m + duration <= minutesOf(w.end); m += config.slotStepMinutes) {
        const start = zonedToUtc(day, timeOfMinutes(m), tz);
        out.push({ start, end: new Date(start.getTime() + duration * 60_000) });
      }
    }
    return out;
  }

  function overlaps(busy, resource, start, end, ignoreRef = null) {
    return busy.some((b) => b.resource === resource && b.start < end && b.end > start && (!ignoreRef || b.bookingRef !== ignoreRef));
  }

  function admissibleRange(fromDate, toDate) {
    const today = partsInZone(now(), tz).date;
    const lastBookable = addDays(today, config.bookingHorizonDays);
    let from = isValidDateString(fromDate) ? fromDate : today;
    if (compareDates(from, today) < 0) from = today;
    let to = isValidDateString(toDate) ? toDate : addDays(from, 6);
    if (compareDates(to, from) < 0) to = addDays(from, 6);
    if (compareDates(to, addDays(from, config.maxRangeDays - 1)) > 0) to = addDays(from, config.maxRangeDays - 1);
    if (compareDates(to, lastBookable) > 0) to = lastBookable;
    return { from, to, today, lastBookable, empty: compareDates(from, lastBookable) > 0 };
  }

  const earliestStart = () => new Date(now().getTime() + config.minimumNoticeMinutes * 60_000);

  /** Returns only available times. */
  async function computeSlots(visitType, from, to) {
    const earliest = earliestStart();
    const candidates = [];
    for (let day = from; compareDates(day, to) <= 0; day = addDays(day, 1)) {
      candidates.push(...candidatesForDay(day, visitType.durationMinutes).filter((c) => c.start >= earliest));
    }
    if (!candidates.length) return [];
    const busy = await adapter.getBusy({
      resourceIds: visitType.resources,
      from: candidates[0].start,
      to: candidates[candidates.length - 1].end,
    });
    return candidates
      .map((c) => ({ ...c, freeResources: visitType.resources.filter((r) => !overlaps(busy, r, c.start, c.end)) }))
      .filter((c) => c.freeResources.length > 0);
  }

  function issueSlotRef(sessionId, visitType, slot) {
    const slotRef = tokens.sign({
      t: 'slot', sid: sessionId, v: visitType.id, s: slot.start.toISOString(), e: slot.end.toISOString(),
      r: slot.freeResources, exp: now().getTime() + config.slotReferenceTtlMinutes * 60_000,
    });
    return { slotRef, ...slotView(slot.start, slot.end) };
  }

  async function findAvailability({ sessionId, visitTypeId, fromDate, toDate, limit = 40 }) {
    const visitType = visitTypes.get(visitTypeId);
    if (!visitType) throw new SchedulingError('unknown_visit_type', 'Unknown visit type.');
    if (visitType.booking !== 'direct') {
      return { visitType: publicVisitType(visitType), staffReview: true, slots: [], timeZone: tz };
    }
    const range = admissibleRange(fromDate, toDate);
    if (range.empty) {
      return { visitType: publicVisitType(visitType), slots: [], timeZone: tz, fromDate: range.from, toDate: range.to, lastBookableDate: range.lastBookable };
    }
    const slots = await computeSlots(visitType, range.from, range.to);
    return {
      visitType: publicVisitType(visitType),
      timeZone: tz,
      fromDate: range.from,
      toDate: range.to,
      lastBookableDate: range.lastBookable,
      truncated: slots.length > limit,
      slots: slots.slice(0, limit).map((s) => issueSlotRef(sessionId, visitType, s)),
    };
  }

  /** Real alternatives after a slot is lost: the next available times after it. */
  async function alternativesAfter(sessionId, visitType, start, count = 5) {
    const day = partsInZone(start, tz).date;
    const range = admissibleRange(day, addDays(day, config.maxRangeDays - 1));
    if (range.empty) return [];
    const slots = await computeSlots(visitType, range.from, range.to);
    const later = slots.filter((s) => s.start > start);
    return (later.length ? later : slots).slice(0, count).map((s) => issueSlotRef(sessionId, visitType, s));
  }

  function reviewView(token, payload) {
    const visitType = visitTypes.get(payload.v);
    return {
      reviewId: token,
      kind: payload.k,
      visitType: publicVisitType(visitType),
      ...(payload.k === 'booking' ? { slot: slotView(new Date(payload.s), new Date(payload.e)) } : {}),
      previewLabel,
      services: payload.k === 'staff-review' && visitType.id === 'other-visit' ? serviceNames : undefined,
      expiresAt: new Date(payload.exp).toISOString(),
    };
  }

  function readToken(token, type, sessionId) {
    const p = tokens.verify(token);
    if (!p || p.t !== type || p.sid !== sessionId) return null;
    return p;
  }

  async function prepareBooking({ sessionId, slotRef }) {
    const slot = readToken(slotRef, 'slot', sessionId);
    if (!slot || slot.exp < now().getTime() || !visitTypes.has(slot.v)) {
      throw new SchedulingError('invalid_slot', 'That time is no longer held. Please choose a time again.');
    }
    const visitType = visitTypes.get(slot.v);
    const start = new Date(slot.s);
    const end = new Date(slot.e);
    // Non-binding freshness check so the patient doesn't fill the form for a slot that is already gone.
    const busy = await adapter.getBusy({ resourceIds: slot.r, from: start, to: end });
    if (!slot.r.some((r) => !overlaps(busy, r, start, end)) || start < earliestStart()) {
      throw new SchedulingError('slot_taken', messages.slotTaken, { alternatives: await alternativesAfter(sessionId, visitType, start) });
    }
    const payload = {
      t: 'rev', k: 'booking', sid: sessionId, v: visitType.id, s: slot.s, e: slot.e, r: slot.r,
      ref: `CD-${randomRef()}`, exp: now().getTime() + config.slotReferenceTtlMinutes * 60_000,
    };
    return reviewView(tokens.sign(payload), payload);
  }

  async function prepareStaffReview({ sessionId, visitTypeId }) {
    const visitType = visitTypes.get(visitTypeId);
    if (!visitType) throw new SchedulingError('unknown_visit_type', 'Unknown visit type.');
    if (visitType.booking !== 'staff-review') throw new SchedulingError('not_staff_review', 'This visit type can be booked directly.');
    const payload = { t: 'rev', k: 'staff-review', sid: sessionId, v: visitTypeId, ref: `REQ-${randomRef()}`, exp: now().getTime() + 60 * 60_000 };
    return reviewView(tokens.sign(payload), payload);
  }

  function confirmedResult(review, eventId, resource) {
    const view = slotView(new Date(review.s), new Date(review.e));
    return {
      status: 'confirmed',
      bookingRef: review.ref,
      eventId,
      slot: view,
      visitType: publicVisitType(visitTypes.get(review.v)),
      message: messages.confirmed({ dateLabel: view.dateLabel, timeLabel: view.timeLabel, bookingRef: review.ref }),
      previewLabel,
      resourceLabel: resourceLabel.get(resource),
    };
  }

  async function record(review, eventId, resource, contact, extra = {}) {
    try {
      await kv.createJSON(`booking-records/${review.ref}`, {
        bookingRef: review.ref, eventId, visitTypeId: review.v, resource, start: review.s, end: review.e,
        contact, mode: config.mode, createdAt: now().toISOString(), ...extra,
      });
    } catch (err) {
      // The calendar event (with its booking reference) is the source of truth; don't un-confirm it.
      logger.error('[scheduling] booking record write failed for', review.ref, err.name);
    }
  }

  async function writeBooking(review, contact) {
    const visitType = visitTypes.get(review.v);
    const start = new Date(review.s);
    const end = new Date(review.e);

    // An earlier attempt with this booking reference may already have saved the event (retry,
    // double submit or a timed-out write): reconcile before writing anything.
    const existing = await adapter.findEventByBookingRef(review.ref);
    if (existing) {
      await record(review, existing.id, existing.resource, contact, { reconciled: true });
      return confirmedResult(review, existing.id, existing.resource);
    }

    const slotTaken = async () => ({
      status: 'slot_taken', message: messages.slotTaken, alternatives: await alternativesAfter(review.sid, visitType, start),
    });

    // Authoritative availability recheck.
    const busy = await adapter.getBusy({ resourceIds: review.r, from: start, to: end });
    const resource = review.r.find((r) => !overlaps(busy, r, start, end, review.ref));
    if (!resource) return slotTaken();

    try {
      const { eventId } = await withTimeout(adapter.createEvent({
        bookingRef: review.ref,
        resource,
        start,
        end,
        title: `ConfiDent appointment ${review.ref}${config.mode === 'test' ? ' (TEST)' : ''}`,
        visitTypeId: visitType.id,
      }), config.calendarWriteTimeoutMs);
      await record(review, eventId, resource, contact);
      return confirmedResult(review, eventId, resource);
    } catch (err) {
      if (err instanceof SlotConflictError) return slotTaken();
      if (!(err instanceof CalendarTimeoutError)) throw err;
      // Timed out: the write may or may not have landed. Reconcile with the original reference.
      let landed = null;
      try { landed = await adapter.findEventByBookingRef(review.ref); } catch { /* still unresolved */ }
      if (landed) {
        await record(review, landed.id, resource, contact, { reconciled: true });
        return confirmedResult(review, landed.id, resource);
      }
      return { status: 'unconfirmed', retryable: true, message: messages.unavailable };
    }
  }

  async function completeReview({ sessionId, reviewId, contact: contactInput }) {
    const review = readToken(reviewId, 'rev', sessionId);
    if (!review || !visitTypes.has(review.v)) {
      return { status: 'invalid_review', message: 'This request has expired. Please start again.' };
    }
    const visitType = visitTypes.get(review.v);
    const { contact, errors, ok } = validateContact(contactInput, { services: serviceNames });

    if (review.k === 'staff-review') {
      try {
        // Identical retries return the recorded request.
        const recorded = await kv.getJSON(`staff-requests/${review.ref}`);
        if (!recorded) {
          if (!ok) return { status: 'invalid', errors };
          if (review.exp < now().getTime()) return { status: 'expired', message: 'This request has expired. Please start again.' };
          await kv.createJSON(`staff-requests/${review.ref}`, {
            requestRef: review.ref, visitTypeId: visitType.id, status: 'pending-staff-review',
            contact, mode: config.mode, createdAt: now().toISOString(),
          });
        }
      } catch (err) {
        logger.error('[scheduling] staff review store failed:', err.name);
        return { status: 'unavailable', message: messages.unavailable };
      }
      return {
        status: 'staff_review_recorded',
        requestRef: review.ref,
        visitType: publicVisitType(visitType),
        message: messages.staffReviewRecorded,
        previewLabel,
      };
    }

    try {
      // A retry after success must still say "confirmed", even once the review step has expired.
      const existing = await adapter.findEventByBookingRef(review.ref);
      if (existing) return confirmedResult(review, existing.id, existing.resource);
      if (!ok) return { status: 'invalid', errors };
      if (review.exp < now().getTime()) return { status: 'expired', message: 'This time is no longer held. Please choose a time again.' };
      return await lock.runMany(review.r, () => writeBooking(review, contact));
    } catch (err) {
      logger.error('[scheduling] calendar error:', err.name);
      return { status: 'unavailable', message: messages.unavailable };
    }
  }

  return {
    timeZone: tz,
    mode: config.mode,
    previewLabel: config.previewLabel,
    messages,
    isFinal: (status) => FINAL.has(status),
    listVisitTypes: () => config.visitTypes.map(publicVisitType),
    findAvailability,
    prepareBooking,
    prepareStaffReview,
    completeReview,
    serviceNames,
    adapter,
    listStaffRequests: () => readAll(kv, 'staff-requests/'),
  };
}
