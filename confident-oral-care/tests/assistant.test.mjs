import assert from 'node:assert/strict';
import { test } from 'node:test';
import Anthropic from '@anthropic-ai/sdk';
import { createAssistant } from '../src/assistant/assistant.mjs';
import { loadSite } from '../src/site.mjs';
import { makeScheduling, ROOT, silentLogger, TEST_CONTACT } from './helpers.mjs';

/** A scripted stand-in for the Anthropic client: each step receives the request params. */
function fakeClient(steps) {
  const calls = [];
  const create = async (params) => {
    calls.push(structuredClone(params));
    const step = steps.shift();
    if (!step) throw new Error('No scripted response left');
    return step(params);
  };
  return { calls, beta: { messages: { create } }, messages: { create } };
}

const msg = (content, stop_reason = 'end_turn') => ({ id: 'msg_test', type: 'message', role: 'assistant', content, stop_reason });
const toolUse = (id, name, input) => ({ type: 'tool_use', id, name, input });
const lastToolResult = (params) => {
  const last = params.messages.at(-1);
  return JSON.parse(last.content.find((b) => b.type === 'tool_result').content);
};

async function setup(steps) {
  const site = await loadSite(ROOT);
  const sched = await makeScheduling({ now: new Date() });
  const client = steps ? fakeClient(steps) : null;
  const assistant = createAssistant({ site, scheduling: sched.service, client, logger: silentLogger });
  return { site, ...sched, client, assistant, session: { id: 'sess-ai' } };
}

test('system prompt carries the approved clinic records and no volatile values', async () => {
  const { site, assistant } = await setup([]);
  const prompt = assistant.systemPrompt;
  for (const group of site.clinic.serviceGroups) {
    for (const s of group.services) assert.ok(prompt.includes(s.name), `missing ${s.name}`);
  }
  assert.ok(prompt.includes('Monday–Friday: 9 a.m.–noon and 2–5 p.m.'));
  assert.ok(prompt.includes('Saturday: 9 a.m.–1 p.m.'));
  assert.ok(prompt.includes('The Boardwalk Belize, Belize City, Belize'));
  assert.ok(prompt.includes('+501 628-8233'));
  assert.ok(prompt.includes('Prices and fees: NOT CONFIRMED'));
  assert.ok(prompt.includes('Braces and clear aligners: NOT CONFIRMED'));
  assert.ok(prompt.includes('/services/crowns-recementation#zirconia-crowns'));
  assert.ok(prompt.includes('/services/dentures-prosthodontics#immediate-dentures'));
  assert.ok(!/\b20\d\d-\d\d-\d\d\b/.test(prompt), 'prompt must not contain dates (cache stability)');
});

test('tools are strict, narrow and enumerate configured visit types', async () => {
  const { assistant } = await setup([]);
  const names = assistant.tools.map((t) => t.name);
  assert.deepEqual(names, ['find_available_times', 'open_booking_form', 'open_staff_review_form']);
  for (const t of assistant.tools) {
    assert.equal(t.strict, true);
    assert.equal(t.input_schema.additionalProperties, false);
  }
  assert.deepEqual(assistant.tools[0].input_schema.properties.visit_type.enum, ['general-consultation']);
  assert.deepEqual(assistant.tools[2].input_schema.properties.visit_type.enum, ['orthodontic-consultation', 'other-visit']);
  const serialized = JSON.stringify(assistant.tools);
  assert.ok(!/name|phone|email/i.test(serialized.replace(/"name":"[a-z_]+"/g, '')), 'no tool accepts contact details');
});

test('consultation request: availability -> structured form; booking only happens on form submit', async () => {
  let offered;
  const ctx = await setup([
    (params) => {
      assert.equal(params.model, 'claude-opus-5-5');
      assert.deepEqual(params.output_config, { effort: 'low' });
      assert.deepEqual(params.betas, ['server-side-fallback-2026-07-01']);
      assert.equal(params.fallbacks, 'default');
      const userBlocks = params.messages[0].content;
      assert.match(userBlocks[0].text, /^\[Website context\] Current date and time in Belize: /);
      assert.equal(userBlocks.at(-1).text, 'I’d like to book a consultation next week');
      return msg([
        { type: 'text', text: 'Let me check.' },
        toolUse('tu_1', 'find_available_times', { visit_type: 'general-consultation', from_date: '2020-01-01', to_date: '2020-01-07' }),
      ], 'tool_use');
    },
    (params) => {
      const result = lastToolResult(params);
      assert.equal(result.time_zone, 'Belize time');
      assert.ok(result.available.length > 0);
      assert.ok(result.available.length <= 12);
      offered = result.available[0];
      assert.match(offered.slot_ref, /^slot_/);
      assert.match(offered.when, / at \d{1,2}:\d{2} [ap]\.m\.$/);
      return msg([toolUse('tu_2', 'open_booking_form', { slot_ref: offered.slot_ref })], 'tool_use');
    },
    (params) => {
      const result = lastToolResult(params);
      assert.equal(result.status, 'form_shown');
      return msg([{ type: 'text', text: 'Please check the details and add your name and one contact method in the form below.' }]);
    },
  ]);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'I’d like to book a consultation next week', page: '/appointments' });
  assert.equal(out.degraded, undefined);
  assert.match(out.reply, /Let me check\./);
  assert.equal(out.actions.length, 1);
  assert.equal(out.actions[0].type, 'review');
  assert.equal(out.actions[0].review.kind, 'booking');
  assert.equal(`${out.actions[0].review.slot.dateLabel} at ${out.actions[0].review.slot.timeLabel}`, offered.when);
  assert.equal((await ctx.adapter.listEvents()).length, 0, 'opening the form must not write to the calendar');

  // The patient submits the structured form (not Claude).
  const result = await ctx.service.completeReview({ sessionId: ctx.session.id, reviewId: out.actions[0].review.reviewId, idempotencyKey: 'key-ai-0001', contact: TEST_CONTACT });
  assert.equal(result.status, 'confirmed');
  assert.equal((await ctx.adapter.listEvents()).length, 1);

  // Conversation history: user, assistant(tool_use), user(tool_result), assistant(tool_use), user(tool_result), assistant(text).
  assert.deepEqual(ctx.session.assistant.messages.map((m) => m.role), ['user', 'assistant', 'user', 'assistant', 'user', 'assistant']);
  assert.ok(!JSON.stringify(ctx.client.calls).includes('Test Patient'), 'contact details never reach Claude');
});

test('staff-review visit opens a request form with no time', async () => {
  const ctx = await setup([
    () => msg([toolUse('tu_1', 'open_staff_review_form', { visit_type: 'orthodontic-consultation' })], 'tool_use'),
    () => msg([{ type: 'text', text: 'The team will review your request.' }]),
  ]);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'Orthodontic consultation please' });
  assert.equal(out.actions[0].review.kind, 'staff-review');
  assert.equal(out.actions[0].review.slot, undefined);
});

test('a made-up slot reference is rejected back to Claude as a tool error', async () => {
  const ctx = await setup([
    () => msg([toolUse('tu_1', 'open_booking_form', { slot_ref: 'slot_invented' })], 'tool_use'),
    (params) => {
      const last = params.messages.at(-1).content[0];
      assert.equal(last.is_error, true);
      assert.equal(JSON.parse(last.content).error, 'invalid_slot');
      return msg([{ type: 'text', text: 'Let me look up times again.' }]);
    },
  ]);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'Book 9am Monday' });
  assert.equal(out.actions.length, 0);
});

test('calendar outage inside a tool returns the contact fallback to Claude', async () => {
  const ctx = await setup([
    () => msg([toolUse('tu_1', 'find_available_times', { visit_type: 'general-consultation', from_date: '2026-11-16', to_date: '2026-11-20' })], 'tool_use'),
    (params) => {
      const r = lastToolResult(params);
      assert.equal(r.error, 'availability_temporarily_unavailable');
      assert.equal(r.message_for_visitor, 'I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on Instagram.');
      return msg([{ type: 'text', text: r.message_for_visitor }]);
    },
  ]);
  ctx.adapter.fault = 'unavailable';
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'Any times?' });
  assert.match(out.reply, /can’t confirm a time right now/);
});

test('API failure: visitor sees the phone/Instagram fallback and history is rolled back', async () => {
  const ctx = await setup([
    () => { throw new Anthropic.APIError(529, { type: 'error', error: { type: 'overloaded_error', message: 'Overloaded' } }, 'Overloaded', new Headers()); },
  ]);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'Hello' });
  assert.equal(out.degraded, true);
  assert.equal(out.reply, 'I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on Instagram.');
  assert.equal(ctx.session.assistant.messages.length, 0);
});

test('refusal stop reason is handled without exposing a partial answer as final', async () => {
  const ctx = await setup([() => msg([], 'refusal')]);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: '...' });
  assert.match(out.reply, /contact the team at \+501 628-8233/);
});

test('without an API key the assistant degrades to the contact message', async () => {
  const ctx = await setup(null);
  assert.equal(ctx.assistant.available, false);
  const out = await ctx.assistant.handleMessage({ session: ctx.session, text: 'Hi' });
  assert.equal(out.degraded, true);
  assert.match(out.reply, /\+501 628-8233/);
});

test('booking outcomes are passed to Claude as website notes on the next turn, without contact details', async () => {
  const ctx = await setup([
    (params) => {
      const texts = params.messages[0].content.map((b) => b.text);
      assert.ok(texts.some((t) => t.startsWith('[Website note] The visitor\'s booking was confirmed by the calendar')));
      assert.ok(!texts.join(' ').includes('Test Patient'));
      return msg([{ type: 'text', text: 'You’re all set.' }]);
    },
  ]);
  ctx.assistant.noteOutcome(ctx.session, { status: 'confirmed', bookingRef: 'CD-TEST01', slot: { dateLabel: 'Tuesday, 17 November 2026', timeLabel: '9:00 a.m.' } });
  await ctx.assistant.handleMessage({ session: ctx.session, text: 'Thanks!' });
});
