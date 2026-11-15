import { readAll } from '../../kv.mjs';
import { CalendarTimeoutError, CalendarUnavailableError, SlotConflictError } from '../errors.mjs';
import { addDays, partsInZone, weekdayOf, zonedToUtc } from '../time.mjs';

/**
 * Isolated, persistent TEST calendar on top of the key-value store (files locally, Netlify Blobs
 * when deployed).
 *
 * Adapter contract (shared with the Google adapter):
 *   getBusy({ resourceIds, from, to }) -> [{ resource, start, end, bookingRef? }]
 *   createEvent({ bookingRef, resource, start, end, title, visitTypeId }) -> { eventId }
 *   findEventByBookingRef(bookingRef) -> event | null
 *
 * createEvent first claims "slots/<resource>/<start>" with an atomic create-if-absent write, so
 * two bookings can never hold the same start time, even from different server instances.
 *
 * `fault` simulates provider problems for tests and the walkthrough:
 *   'unavailable'          every call fails
 *   'timeout'              createEvent times out without writing
 *   'timeout-after-write'  createEvent writes the event, then times out (exercises reconciliation)
 */
export class TestCalendarAdapter {
  constructor({ kv, timeZone, busyBlocks = [], fault = null }) {
    this.name = 'test-calendar';
    this.kv = kv;
    this.timeZone = timeZone;
    this.busyBlocks = busyBlocks;
    this.fault = fault;
  }

  checkAvailable() {
    if (this.fault === 'unavailable') throw new CalendarUnavailableError();
  }

  async listEvents() {
    return readAll(this.kv, 'events/');
  }

  async getBusy({ resourceIds, from, to }) {
    this.checkAvailable();
    const busy = [];
    for (const event of await this.listEvents()) {
      if (!resourceIds.includes(event.resource)) continue;
      const start = new Date(event.start);
      const end = new Date(event.end);
      if (start < to && end > from) busy.push({ resource: event.resource, start, end, bookingRef: event.bookingRef });
    }
    // Expand the recurring test busy blocks across the requested range.
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
    const existing = await this.findEventByBookingRef(bookingRef);
    if (existing) return { eventId: existing.id };

    const slotKey = `slots/${resource}/${start.getTime()}`;
    await this.kv.createJSON(slotKey, { bookingRef, createdAt: new Date().toISOString() });
    // Read the claim back: whether our create won or an earlier attempt of ours already holds the
    // slot, only the booking reference stored there may proceed (defence in depth if a store's
    // conditional write is not serialized).
    const holder = await this.kv.getJSON(slotKey);
    if (holder?.bookingRef !== bookingRef) throw new SlotConflictError();
    const event = {
      id: `evt_${bookingRef}`, // deterministic: a retried write produces the same event
      bookingRef,
      title,
      visitTypeId,
      resource,
      start: start.toISOString(),
      end: end.toISOString(),
      createdAt: new Date().toISOString(),
      calendar: 'ConfiDent TEST calendar',
    };
    await this.kv.setJSON(`events/${bookingRef}`, event);
    if (this.fault === 'timeout-after-write') throw new CalendarTimeoutError();
    return { eventId: event.id };
  }

  async findEventByBookingRef(bookingRef) {
    this.checkAvailable();
    return this.kv.getJSON(`events/${bookingRef}`);
  }
}
