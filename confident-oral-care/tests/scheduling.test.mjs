import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatTime, zonedToUtc } from '../src/scheduling/time.mjs';
import { makeScheduling, MONDAY_8AM, TEST_CONTACT } from './helpers.mjs';

const S1 = 'session-one';
const S2 = 'session-two';

test('Belize wall-clock conversion (UTC-6, no DST)', () => {
  assert.equal(zonedToUtc('2026-11-17', '09:00', 'America/Belize').toISOString(), '2026-11-17T15:00:00.000Z');
  assert.equal(zonedToUtc('2026-06-17', '09:00', 'America/Belize').toISOString(), '2026-06-17T15:00:00.000Z');
  assert.equal(formatTime(new Date('2026-11-17T18:30:00Z'), 'America/Belize'), '12:30 p.m.');
});

test('availability follows bookable windows, notice, lunch, cutoff and the busy block', async () => {
  const { service } = await makeScheduling();
  const result = await service.findAvailability({
    sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-16', toDate: '2026-11-21', limit: 200,
  });
  const byDay = {};
  for (const s of result.slots) (byDay[s.date] ??= []).push(s.timeLabel);

  // Monday: 2 hours' notice from 08:00 -> first start 10:00; no lunch slots; last start 4:30 p.m.
  assert.deepEqual(byDay['2026-11-16'], [
    '10:00 a.m.', '10:30 a.m.', '11:00 a.m.', '11:30 a.m.',
    '2:00 p.m.', '2:30 p.m.', '3:00 p.m.', '3:30 p.m.', '4:00 p.m.', '4:30 p.m.',
  ]);
  // Wednesday: the 10:00-11:00 test busy block removes two starts.
  assert.ok(!byDay['2026-11-18'].includes('10:00 a.m.'));
  assert.ok(!byDay['2026-11-18'].includes('10:30 a.m.'));
  assert.ok(byDay['2026-11-18'].includes('11:00 a.m.'));
  // Saturday: 9 a.m.-1 p.m. window, last start 12:30 p.m.
  assert.equal(byDay['2026-11-21'].at(-1), '12:30 p.m.');
  assert.equal(byDay['2026-11-21'].length, 8);
  // Sunday is never bookable; no 5 p.m. or lunch starts at all.
  const all = result.slots.map((s) => s.timeLabel);
  assert.ok(!all.includes('5:00 p.m.'));
  assert.ok(!all.includes('12:00 p.m.') || byDay['2026-11-21'].includes('12:00 p.m.'));
  for (const s of result.slots) assert.match(s.slotRef, /^[\w-]+\.[\w-]+$/);
});

test('past dates and far-future ranges are clamped to the admissible window', async () => {
  const { service } = await makeScheduling();
  const past = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-01', toDate: '2026-11-02' });
  assert.equal(past.fromDate, '2026-11-16');
  const far = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2027-06-01', toDate: '2027-06-05' });
  assert.equal(far.slots.length, 0);
});

test('a confirmed booking writes exactly one observable event in Belize time', async () => {
  const { service, adapter, recordsStore } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  const nine = slots.find((s) => s.timeLabel === '9:00 a.m.');
  const review = await service.prepareBooking({ sessionId: S1, slotRef: nine.slotRef });
  assert.equal(review.slot.dateLabel, 'Tuesday, 17 November 2026');
  const result = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-aaaaaaaa', contact: TEST_CONTACT });
  assert.equal(result.status, 'confirmed');
  assert.match(result.bookingRef, /^CD-[A-Z2-9]{6}$/);
  assert.equal(result.message, `Your appointment is confirmed for Tuesday, 17 November 2026, at 9:00 a.m. Belize time. Your booking reference is ${result.bookingRef}. We’re at The Boardwalk Belize in Belize City.`);
  const events = await adapter.listEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].start, '2026-11-17T15:00:00.000Z');
  assert.ok(!JSON.stringify(events[0]).includes('Test Patient'), 'calendar event must not carry patient details');
  assert.equal((await recordsStore.all())[0].contact.name, 'Test Patient');

  // Identical retry returns the same reference and writes nothing new.
  const retry = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-aaaaaaaa', contact: TEST_CONTACT });
  assert.equal(retry.bookingRef, result.bookingRef);
  assert.equal((await adapter.listEvents()).length, 1);

  // The booked time is no longer offered.
  const again = await service.findAvailability({ sessionId: S2, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  assert.ok(!again.slots.some((s) => s.timeLabel === '9:00 a.m.'));
});

test('two sessions competing for one slot: only one is confirmed, the other gets real alternatives', async () => {
  const { service, adapter } = await makeScheduling();
  const pick = async (sid) => {
    const { slots } = await service.findAvailability({ sessionId: sid, visitTypeId: 'general-consultation', fromDate: '2026-11-19', toDate: '2026-11-19' });
    return service.prepareBooking({ sessionId: sid, slotRef: slots.find((s) => s.timeLabel === '2:00 p.m.').slotRef });
  };
  const [r1, r2] = await Promise.all([pick(S1), pick(S2)]);
  const [a, b] = await Promise.all([
    service.completeReview({ sessionId: S1, reviewId: r1.reviewId, idempotencyKey: 'key-11111111', contact: TEST_CONTACT }),
    service.completeReview({ sessionId: S2, reviewId: r2.reviewId, idempotencyKey: 'key-22222222', contact: TEST_CONTACT }),
  ]);
  const statuses = [a.status, b.status].sort();
  assert.deepEqual(statuses, ['confirmed', 'slot_taken']);
  const loser = a.status === 'slot_taken' ? a : b;
  assert.equal(loser.message, 'That time has just become unavailable. Here are the next available options.');
  assert.ok(loser.alternatives.length > 0);
  assert.ok(!loser.alternatives.some((s) => s.date === '2026-11-19' && s.timeLabel === '2:00 p.m.'));
  assert.equal((await adapter.listEvents()).length, 1);
});

test('separate server instances sharing storage cannot double-book a slot', async () => {
  const { MemoryKV } = await import('../src/kv.mjs');
  const kv = new MemoryKV();
  const a = await makeScheduling({ kv });
  const b = await makeScheduling({ kv }); // a second instance: own lock, same storage
  const pick = async (inst, sid) => {
    const { slots } = await inst.service.findAvailability({ sessionId: sid, visitTypeId: 'general-consultation', fromDate: '2026-11-20', toDate: '2026-11-20' });
    return inst.service.prepareBooking({ sessionId: sid, slotRef: slots.find((s) => s.timeLabel === '3:00 p.m.').slotRef });
  };
  const [ra, rb] = await Promise.all([pick(a, S1), pick(b, S2)]);
  const results = await Promise.all([
    a.service.completeReview({ sessionId: S1, reviewId: ra.reviewId, contact: TEST_CONTACT }),
    b.service.completeReview({ sessionId: S2, reviewId: rb.reviewId, contact: TEST_CONTACT }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), ['confirmed', 'slot_taken']);
  assert.equal((await a.adapter.listEvents()).length, 1);
});

test('tampered or expired references are rejected', async () => {
  const { service, setNow } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  const [data, sig] = slots[0].slotRef.split('.');
  const forged = `${Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(data, 'base64url')), s: '2026-11-17T23:00:00.000Z' })).toString('base64url')}.${sig}`;
  await assert.rejects(service.prepareBooking({ sessionId: S1, slotRef: forged }), { code: 'invalid_slot' });
  setNow(new Date(MONDAY_8AM.getTime() + 31 * 60_000));
  await assert.rejects(service.prepareBooking({ sessionId: S1, slotRef: slots[0].slotRef }), { code: 'invalid_slot' });
});

test('slot references are scoped to the session that received them', async () => {
  const { service } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  await assert.rejects(service.prepareBooking({ sessionId: S2, slotRef: slots[0].slotRef }), { code: 'invalid_slot' });
  await assert.rejects(service.prepareBooking({ sessionId: S1, slotRef: 'slot_made_up' }), { code: 'invalid_slot' });
});

test('staff-review visit types record a request without a time', async () => {
  const { service, staffStore, adapter } = await makeScheduling();
  const avail = await service.findAvailability({ sessionId: S1, visitTypeId: 'orthodontic-consultation' });
  assert.equal(avail.staffReview, true);
  assert.equal(avail.slots.length, 0);
  const review = await service.prepareStaffReview({ sessionId: S1, visitTypeId: 'orthodontic-consultation' });
  const result = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-33333333', contact: { ...TEST_CONTACT, preferredTimes: 'Weekday mornings' } });
  assert.equal(result.status, 'staff_review_recorded');
  assert.equal(result.message, 'We received your request. The team will contact you to arrange a time.');
  assert.equal(result.slot, undefined);
  assert.equal((await staffStore.all()).length, 1);
  assert.equal((await adapter.listEvents()).length, 0);
});

test('validation requires a name and one contact method; minors need the patient name', async () => {
  const { service } = await makeScheduling();
  const review = await service.prepareStaffReview({ sessionId: S1, visitTypeId: 'other-visit' });
  const bad = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-44444444', contact: { name: 'A' } });
  assert.equal(bad.status, 'invalid');
  assert.ok(bad.errors.name && bad.errors.contact);
  const minor = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-44444445', contact: { ...TEST_CONTACT, isMinor: true } });
  assert.ok(minor.errors.patientName);
  const ok = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-44444446', contact: { ...TEST_CONTACT, isMinor: true, patientName: 'Test Child', service: 'Cleanings' } });
  assert.equal(ok.status, 'staff_review_recorded');
});

test('calendar outage: availability errors and bookings are never shown as confirmed', async () => {
  const { service, adapter } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  const review = await service.prepareBooking({ sessionId: S1, slotRef: slots[0].slotRef });
  adapter.fault = 'unavailable';
  const result = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-55555555', contact: TEST_CONTACT });
  assert.equal(result.status, 'unavailable');
  assert.equal(result.message, 'I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on WhatsApp.');
  await assert.rejects(service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation' }));
});

test('a timed-out write that actually landed is reconciled by booking reference', async () => {
  const { service, adapter } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  const review = await service.prepareBooking({ sessionId: S1, slotRef: slots[0].slotRef });
  adapter.fault = 'timeout-after-write';
  const result = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-66666666', contact: TEST_CONTACT });
  assert.equal(result.status, 'confirmed');
  assert.equal((await adapter.listEvents()).length, 1);
});

test('a timed-out write that did not land stays unconfirmed, and a retry reuses the same reference', async () => {
  const { service, adapter } = await makeScheduling();
  const { slots } = await service.findAvailability({ sessionId: S1, visitTypeId: 'general-consultation', fromDate: '2026-11-17', toDate: '2026-11-17' });
  const review = await service.prepareBooking({ sessionId: S1, slotRef: slots[0].slotRef });
  adapter.fault = 'timeout';
  const first = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-77777777', contact: TEST_CONTACT });
  assert.equal(first.status, 'unconfirmed');
  assert.equal((await adapter.listEvents()).length, 0);
  adapter.fault = null;
  const second = await service.completeReview({ sessionId: S1, reviewId: review.reviewId, idempotencyKey: 'key-77777777', contact: TEST_CONTACT });
  assert.equal(second.status, 'confirmed');
  const events = await adapter.listEvents();
  assert.equal(events.length, 1);
  assert.equal(events[0].bookingRef, second.bookingRef);
});
