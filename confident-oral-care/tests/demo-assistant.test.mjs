import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createCore } from '../src/app.mjs';
import { MemoryKV } from '../src/kv.mjs';
import { MONDAY_8AM, silentLogger, TEST_CONTACT } from './helpers.mjs';

async function setup(env = {}) {
  const core = await createCore({ kv: new MemoryKV(), client: null, env, logger: silentLogger, now: () => MONDAY_8AM });
  let n = 0;
  const sid = () => `demo-session-${n}-abcdefghijklmnop`;
  const ask = async (message, session = sid()) => (await core.handleApi({ method: 'POST', pathname: '/api/assistant', searchParams: new URLSearchParams(), body: { message }, sessionId: session })).json;
  return { core, ask, next: () => { n += 1; return sid(); } };
}

test('demo mode is on for previews without a key, and off when disabled', async () => {
  const { core } = await setup();
  const status = (await core.handleApi({ method: 'GET', pathname: '/api/assistant/status', searchParams: new URLSearchParams(), sessionId: 'x' })).json;
  assert.deepEqual([status.available, status.mode], [true, 'demo']);
  const off = await setup({ ASSISTANT_DEMO: 'off' });
  const s2 = (await off.core.handleApi({ method: 'GET', pathname: '/api/assistant/status', searchParams: new URLSearchParams(), sessionId: 'x' })).json;
  assert.deepEqual([s2.available, s2.mode], [false, 'off']);
});

test('demo answers come from the approved clinic records', async () => {
  const { ask, next } = await setup();
  assert.match((await ask('What are your hours?', next())).reply, /Monday–Friday:\*\* 9 a\.m\.–noon and 2–5 p\.m\./);
  assert.match((await ask('Where are you?', next())).reply, /The Boardwalk Belize, Belize City, Belize/);
  assert.match((await ask('Do you do zirconia crowns?', next())).reply, /\/services\/crowns-recementation#zirconia-crowns/);
  assert.match((await ask('I need an immediate denture', next())).reply, /\/services\/dentures-prosthodontics#immediate-dentures/);
  assert.match((await ask('How much is a cleaning?', next())).reply, /haven’t been confirmed.*payments aren’t taken through the website or through me/s);
  assert.match((await ask('Can I pay online with my card?', next())).reply, /Payments aren’t taken through the website or through me/);
  assert.match((await ask('Do you offer braces?', next())).reply, /hasn’t been confirmed/);
  assert.match((await ask('I can’t breathe', next())).reply, /emergency medical care right now/);
  assert.match((await ask('Cancel my wife’s appointment', next())).reply, /not able to see, change or cancel appointments/);
  assert.match((await ask('My tooth hurts', next())).reply, /can’t give dental advice/);
});

test('demo booking uses the real scheduler: offer, pick, form, confirm', async () => {
  const { core, ask, next } = await setup();
  const s = next();
  const offer = await ask('I would like to book a consultation', s);
  assert.match(offer.reply, /1\. Mon 16 Nov, 10:00 a\.m\./); // 2 hours' notice from 8:00
  const picked = await ask('2', s);
  assert.equal(picked.actions[0].review.slot.timeLabel, '10:30 a.m.');
  const done = await core.handleApi({ method: 'POST', pathname: '/api/booking/complete', searchParams: new URLSearchParams(), body: { reviewId: picked.actions[0].review.reviewId, contact: TEST_CONTACT, source: 'assistant' }, sessionId: s });
  assert.equal(done.json.status, 'confirmed');
  const lunch = await ask('Can I come Tuesday at 12:30?', next());
  assert.match(lunch.reply, /closed for lunch/);
  // The time booked above is now taken: asking for it explains it's booked and offers real alternatives.
  const taken = await ask('Is Monday at 10:30 available?', next());
  assert.match(taken.reply, /10:30 a\.m\. on Monday isn’t available: someone has already booked it/);
  assert.ok(!/10:30 a\.m\./.test(taken.reply.split('openings')[1]), 'the booked time is not offered');
  const open = await ask('Is Tuesday at 9:00 available?', next());
  assert.equal(open.actions[0].review.slot.timeLabel, '9:00 a.m.');
  assert.equal(lunch.actions.length, 0);
  const ortho = await ask('Book an orthodontic consultation', next());
  assert.equal(ortho.actions[0].review.kind, 'staff-review');
});

test('demo assistant speaks Spanish on the Spanish site or when the visitor writes in Spanish', async () => {
  const { core } = await setup();
  const askEs = async (message, sessionId = 'demo-es-session-abcdefghijklmnop', lang = 'es') => (await core.handleApi({ method: 'POST', pathname: '/api/assistant', searchParams: new URLSearchParams(), body: { message, lang }, sessionId })).json;
  assert.match((await askEs('¿Cuál es su horario?')).reply, /Lunes a viernes:\*\* 9 a\. m\.–mediodía y 2–5 p\. m\./);
  assert.match((await askEs('¿Hacen coronas de zirconia?')).reply, /Coronas de zirconia.*\/es\/services\/crowns-recementation#zirconia-crowns/s);
  assert.match((await askEs('¿Cuánto cuesta una limpieza?')).reply, /no se aceptan pagos por el sitio web ni a través de mí/);
  const offer = await askEs('Quiero una cita el sábado por la mañana');
  assert.match(offer.reply, /1\. sáb 21 nov, 9:00 a\. m\./);
  const form = await askEs('2');
  assert.equal(form.actions[0].review.visitType.label, 'Consulta general');
  assert.match(form.reply, /sábado, 21 de noviembre de 2026 a las 9:30 a\. m\./);
  // Spanish typed on the English site is answered in Spanish.
  assert.match((await askEs('Hola, ¿dónde están ubicados?', 'demo-es-session-2-abcdefghijklm', 'en')).reply, /^Estamos en/);
});

test('start new chat clears the conversation state', async () => {
  const { core, ask } = await setup();
  const s = 'demo-reset-session-abcdefghijklmn';
  await ask('Book a consultation', s);
  await core.handleApi({ method: 'POST', pathname: '/api/assistant/reset', searchParams: new URLSearchParams(), body: {}, sessionId: s });
  const after = await ask('2', s);
  assert.equal(after.actions.length, 0, 'no pending offer after a new chat');
});
