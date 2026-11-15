import { randomUUID } from 'node:crypto';
import { JsonStore } from '../store.mjs';
import { addDays, partsInZone, weekdayOf, zonedToUtc } from '../time.mjs';

export class CalendarUnavailableError extends Error {
  constructor(message = 'Calendar unavailable') {
    super(message);
    this.name = 'CalendarUnavailableError';
  }
}

export class CalendarTimeoutError extends Error {
  constructor(message = 'Calendar request timed out') {
    super(message);
    this.name = 'CalendarTimeoutError';
  }
}

/**
 * Isolated, persistent test calendar stored as JSON on disk.
 *
 * Adapter contract (shared with the Google adapter):
 *   getBusy({ resourceIds, from, to }) -> [{ resource, start, end }]
 *   createEvent({ bookingRef, resource, start, end, title, visitTypeId }) -> { eventId }
 *   findEventByBookingRef(bookingRef) -> event | null
 *
 * `fault` simulates provider problems for tests and the walkthrough:
 *   'unavailable'          every call fails
 *   'timeout'              createEvent times out without writing
 *   'timeout-after-write'  createEvent writes the event, then times out (exercises reconciliation)
 */
export class LocalCalendarAdapter {
  constructor({ file, timeZone, busyBlocks = [], fault = null }) {
    this.name = 'local-test-calendar';
    this.store = new JsonStore(file);
    this.timeZone = timeZone;
    this.busyBlocks = busyBlocks;
    this.fault = fault;
  }

  checkAvailable() {
    if (this.fault === 'unavailable') throw new CalendarUnavailableError();
  }

  async getBusy({ resourceIds, from, to }) {
    this.checkAvailable();
    const busy = [];
    for (const event of await this.store.all()) {
      if (!resourceIds.includes(event.resource)) continue;
      const start = new Date(event.start);
      const end = new Date(event.end);
      if (start < to && end > from) busy.push({ resource: event.resource, start, end });
    }
    // Expand recurring test busy blocks across the requested range.
    const firstDay = partsInZone(from, this.timeZone).date;
    const lastDay = partsInZone(to, this.timeZone).date;
    for (let day = firstDay; day <= lastDay; day = addDays(day, 1)) {
      for (const block of this.busyBlocks) {
        if (block.weekday !== weekdayOf(day) || !resourceIds.includes(block.resource)) continue;
        const start = zonedToUtc(day, block.start, this.timeZone);
        const end = zonedToUtc(day, block.end, this.timeZone);
        if (start < to && end > from) busy.push({ resource: block.resource, start, end, label: block.label });
      }
    }
    return busy;
  }

  async createEvent({ bookingRef, resource, start, end, title, visitTypeId }) {
    this.checkAvailable();
    if (this.fault === 'timeout') throw new CalendarTimeoutError();
    // Idempotent on bookingRef, like a provider event created with a client-supplied ID.
    const existing = await this.findEventByBookingRef(bookingRef);
    if (existing) return { eventId: existing.id };
    const event = {
      id: `evt_${randomUUID()}`,
      bookingRef,
      title,
      visitTypeId,
      resource,
      start: start.toISOString(),
      end: end.toISOString(),
      createdAt: new Date().toISOString(),
      calendar: 'ConfiDent TEST calendar',
    };
    await this.store.append(event);
    if (this.fault === 'timeout-after-write') throw new CalendarTimeoutError();
    return { eventId: event.id };
  }

  async findEventByBookingRef(bookingRef) {
    this.checkAvailable();
    return this.store.find((e) => e.bookingRef === bookingRef);
  }

  async listEvents() {
    return this.store.all();
  }
}
