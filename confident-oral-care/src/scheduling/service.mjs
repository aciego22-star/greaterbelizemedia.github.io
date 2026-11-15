import { randomBytes } from 'node:crypto';
import { CalendarTimeoutError } from './adapters/local.mjs';
import { statusMessages } from './messages.mjs';
import {
  addDays, compareDates, formatDateLong, formatDateShort, formatTime, isValidDateString,
  minutesOf, partsInZone, timeOfMinutes, weekdayOf, zonedToUtc,
} from './time.mjs';

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class SchedulingError extends Error {
  constructor(code, message, extra = {}) {
    super(message);
    this.code = code;
    Object.assign(this, extra);
  }
}

function randomRef(length = 6) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => REF_ALPHABET[b % REF_ALPHABET.length]).join('');
}

function opaqueId(prefix) {
  return `${prefix}_${randomBytes(18).toString('base64url')}`;
}

/** Serializes async work per key (one staff resource at a time). */
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
  /** Acquire several keys in a fixed order (deadlock-free). */
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

export function validateContact(input = {}, { requireService = false, services = [] } = {}) {
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
  if (requireService && !contact.service) errors.service = 'Choose a service.';
  return { contact, errors, ok: Object.keys(errors).length === 0 };
}

/**
 * One scheduling service shared by the standard booking form and confident AI.
 *
 * Flow: findAvailability -> prepareBooking | prepareStaffReview -> completeReview.
 * Claude may call the first two steps through tools; only the patient's submission of the
 * structured review screen calls completeReview, which performs the calendar write.
 */
export function createSchedulingService({
  config, clinic, adapter, staffStore, recordsStore, now = () => new Date(), logger = console,
}) {
  const tz = config.timeZone;
  const messages = statusMessages(clinic);
  const lock = new KeyedLock();
  const slotRefs = new Map(); // slotRef -> { sessionId, visitTypeId, start, end, resourceIds, expires }
  const reviews = new Map(); // reviewId -> review state
  const idempotency = new Map(); // `${sessionId}:${key}` -> Promise<result>
  const serviceNames = clinic.serviceGroups.flatMap((g) => g.services.map((s) => s.name));

  const visitTypes = new Map(config.visitTypes.map((v) => [v.id, v]));
  const resourceLabel = new Map(config.resources.map((r) => [r.id, r.label]));

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

  function sweepExpired() {
    const t = now().getTime();
    for (const [ref, slot] of slotRefs) if (slot.expires < t) slotRefs.delete(ref);
    for (const [id, review] of reviews) if (review.expires < t && !review.result) reviews.delete(id);
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

  function overlaps(busy, resource, start, end) {
    return busy.some((b) => b.resource === resource && b.start < end && b.end > start);
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

  /** Returns only available times, each with a session-scoped opaque reference. */
  async function computeSlots(visitType, from, to) {
    const earliest = new Date(now().getTime() + config.minimumNoticeMinutes * 60_000);
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
    const slotRef = opaqueId('slot');
    slotRefs.set(slotRef, {
      sessionId,
      visitTypeId: visitType.id,
      start: slot.start,
      end: slot.end,
      resourceIds: slot.freeResources,
      expires: now().getTime() + config.slotReferenceTtlMinutes * 60_000,
    });
    return { slotRef, ...slotView(slot.start, slot.end) };
  }

  async function findAvailability({ sessionId, visitTypeId, fromDate, toDate, limit = 40 }) {
    sweepExpired();
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

  /** Real alternatives after a slot is lost: the next available times from that day onward. */
  async function alternativesAfter(sessionId, visitType, start, count = 5) {
    const day = partsInZone(start, tz).date;
    const range = admissibleRange(day, addDays(day, config.maxRangeDays - 1));
    if (range.empty) return [];
    const slots = await computeSlots(visitType, range.from, range.to);
    const later = slots.filter((s) => s.start > start);
    return (later.length ? later : slots).slice(0, count).map((s) => issueSlotRef(sessionId, visitType, s));
  }

  function reviewView(review) {
    const visitType = visitTypes.get(review.visitTypeId);
    return {
      reviewId: review.reviewId,
      kind: review.kind,
      visitType: publicVisitType(visitType),
      ...(review.kind === 'booking' ? { slot: slotView(review.start, review.end) } : {}),
      previewLabel: config.mode === 'test' ? config.previewLabel : null,
      services: review.kind === 'staff-review' && visitType.id === 'other-visit' ? serviceNames : undefined,
      expiresAt: new Date(review.expires).toISOString(),
    };
  }

  async function prepareBooking({ sessionId, slotRef }) {
    sweepExpired();
    const slot = slotRefs.get(slotRef);
    if (!slot || slot.sessionId !== sessionId) {
      throw new SchedulingError('invalid_slot', 'That time is no longer held. Please choose a time again.');
    }
    const visitType = visitTypes.get(slot.visitTypeId);
    // Non-binding freshness check so the patient doesn't fill the form for a slot that is already gone.
    const busy = await adapter.getBusy({ resourceIds: slot.resourceIds, from: slot.start, to: slot.end });
    const free = slot.resourceIds.filter((r) => !overlaps(busy, r, slot.start, slot.end));
    if (!free.length || slot.start < new Date(now().getTime() + config.minimumNoticeMinutes * 60_000)) {
      slotRefs.delete(slotRef);
      throw new SchedulingError('slot_taken', messages.slotTaken, {
        alternatives: await alternativesAfter(sessionId, visitType, slot.start),
      });
    }
    const review = {
      reviewId: opaqueId('rev'),
      kind: 'booking',
      sessionId,
      visitTypeId: visitType.id,
      start: slot.start,
      end: slot.end,
      resourceIds: slot.resourceIds,
      bookingRef: `CD-${randomRef()}`,
      state: 'open',
      expires: now().getTime() + config.slotReferenceTtlMinutes * 60_000,
    };
    reviews.set(review.reviewId, review);
    return reviewView(review);
  }

  async function prepareStaffReview({ sessionId, visitTypeId }) {
    sweepExpired();
    const visitType = visitTypes.get(visitTypeId);
    if (!visitType) throw new SchedulingError('unknown_visit_type', 'Unknown visit type.');
    if (visitType.booking !== 'staff-review') {
      throw new SchedulingError('not_staff_review', 'This visit type can be booked directly.');
    }
    const review = {
      reviewId: opaqueId('rev'),
      kind: 'staff-review',
      sessionId,
      visitTypeId,
      requestRef: `REQ-${randomRef()}`,
      state: 'open',
      expires: now().getTime() + 60 * 60_000,
    };
    reviews.set(review.reviewId, review);
    return reviewView(review);
  }

  async function writeBooking(review, contact) {
    const visitType = visitTypes.get(review.visitTypeId);
    const view = slotView(review.start, review.end);
    const confirmed = async (eventId, resource, extra = {}) => {
      review.state = 'confirmed';
      review.resource = resource;
      try {
        await recordsStore.append({
          bookingRef: review.bookingRef, eventId, visitTypeId: visitType.id, resource,
          start: review.start.toISOString(), end: review.end.toISOString(),
          contact, mode: config.mode, createdAt: now().toISOString(), ...extra,
        });
      } catch (err) {
        // The calendar event (with its booking reference) is the source of truth; don't un-confirm it.
        logger.error('[scheduling] booking record write failed for', review.bookingRef, err.name);
      }
      return {
        status: 'confirmed',
        bookingRef: review.bookingRef,
        eventId,
        slot: view,
        visitType: publicVisitType(visitType),
        message: messages.confirmed({ dateLabel: view.dateLabel, timeLabel: view.timeLabel, bookingRef: review.bookingRef }),
        previewLabel: config.mode === 'test' ? config.previewLabel : null,
        resourceLabel: resourceLabel.get(resource),
      };
    };

    // A previous attempt may have written the event before timing out: reconcile first.
    if (review.state === 'unresolved') {
      const existing = await adapter.findEventByBookingRef(review.bookingRef);
      if (existing) return confirmed(existing.id, existing.resource ?? review.resource, { reconciled: true });
    }

    // Authoritative availability recheck under the resource lock.
    const busy = await adapter.getBusy({ resourceIds: review.resourceIds, from: review.start, to: review.end });
    const resource = review.resource ?? review.resourceIds.find((r) => !overlaps(busy, r, review.start, review.end));
    if (!resource || (review.resource && overlaps(busy, review.resource, review.start, review.end))) {
      review.state = 'slot_taken';
      return {
        status: 'slot_taken',
        message: messages.slotTaken,
        alternatives: await alternativesAfter(review.sessionId, visitType, review.start),
      };
    }
    review.resource = resource;

    try {
      const { eventId } = await withTimeout(adapter.createEvent({
        bookingRef: review.bookingRef,
        resource,
        start: review.start,
        end: review.end,
        title: `ConfiDent appointment ${review.bookingRef}${config.mode === 'test' ? ' (TEST)' : ''}`,
        visitTypeId: visitType.id,
      }), config.calendarWriteTimeoutMs);
      return await confirmed(eventId, resource);
    } catch (err) {
      if (!(err instanceof CalendarTimeoutError)) throw err;
      // Timed out: the write may or may not have landed. Reconcile with the original reference.
      review.state = 'unresolved';
      let existing = null;
      try { existing = await adapter.findEventByBookingRef(review.bookingRef); } catch { /* still unresolved */ }
      if (existing) return confirmed(existing.id, resource, { reconciled: true });
      return { status: 'unconfirmed', retryable: true, message: messages.unavailable };
    }
  }

  async function runComplete(review, contactInput) {
    const visitType = visitTypes.get(review.visitTypeId);
    const { contact, errors, ok } = validateContact(contactInput, {
      requireService: false,
      services: serviceNames,
    });
    if (!ok) return { status: 'invalid', errors };

    if (review.kind === 'staff-review') {
      try {
        await staffStore.append({
          requestRef: review.requestRef,
          visitTypeId: visitType.id,
          status: 'pending-staff-review',
          contact,
          mode: config.mode,
          createdAt: now().toISOString(),
        });
        review.state = 'recorded';
        return {
          status: 'staff_review_recorded',
          requestRef: review.requestRef,
          visitType: publicVisitType(visitType),
          message: messages.staffReviewRecorded,
          previewLabel: config.mode === 'test' ? config.previewLabel : null,
        };
      } catch (err) {
        logger.error('[scheduling] staff review store failed:', err.message);
        return { status: 'unavailable', message: messages.unavailable };
      }
    }

    if (review.expires < now().getTime() && review.state === 'open') {
      return { status: 'expired', message: 'This time is no longer held. Please choose a time again.' };
    }

    try {
      return await lock.runMany(review.resourceIds, () => writeBooking(review, contact));
    } catch (err) {
      logger.error('[scheduling] calendar error:', err.name);
      return { status: 'unavailable', message: messages.unavailable };
    }
  }

  async function completeReview({ sessionId, reviewId, idempotencyKey, contact }) {
    const review = reviews.get(reviewId);
    if (!review || review.sessionId !== sessionId) {
      return { status: 'invalid_review', message: 'This request has expired. Please start again.' };
    }
    const key = typeof idempotencyKey === 'string' && idempotencyKey.length >= 8 ? `${sessionId}:${idempotencyKey}` : null;
    if (key && idempotency.has(key)) return idempotency.get(key);
    // An identical retry for a finished review returns the same outcome and reference.
    if (review.result && ['confirmed', 'staff_review_recorded', 'slot_taken'].includes(review.result.status)) {
      return review.result;
    }
    if (review.inFlight) return review.inFlight;

    const run = runComplete(review, contact).then((result) => {
      if (['confirmed', 'staff_review_recorded', 'slot_taken'].includes(result.status)) review.result = result;
      return result;
    }).finally(() => { review.inFlight = null; });
    review.inFlight = run;
    if (key) {
      idempotency.set(key, run);
      // Only keep final outcomes; allow a retry after a validation error or an unresolved write.
      run.then((result) => {
        if (!['confirmed', 'staff_review_recorded', 'slot_taken'].includes(result.status)) idempotency.delete(key);
      });
    }
    return run;
  }

  return {
    timeZone: tz,
    mode: config.mode,
    previewLabel: config.previewLabel,
    messages,
    listVisitTypes: () => config.visitTypes.map(publicVisitType),
    findAvailability,
    prepareBooking,
    prepareStaffReview,
    completeReview,
    serviceNames,
    adapter,
    listStaffRequests: () => staffStore.all(),
  };
}
