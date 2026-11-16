import Anthropic from '@anthropic-ai/sdk';
import { formatDateLong, formatTime } from '../scheduling/time.mjs';
import { SchedulingError } from '../scheduling/service.mjs';
import { buildSystemPrompt } from './prompt.mjs';

const MAX_TOOL_ROUNDS = 6;
const MAX_TURNS_PER_SESSION = 40;
const MAX_SLOTS_FOR_MODEL = 12;

/** Narrow, schema-validated scheduling tools. Claude never sees or submits patient details. */
export function buildTools(scheduling) {
  const visitTypes = scheduling.listVisitTypes();
  const direct = visitTypes.filter((v) => v.booking === 'direct').map((v) => v.id);
  const staff = visitTypes.filter((v) => v.booking === 'staff-review').map((v) => v.id);
  return [
    {
      name: 'find_available_times',
      description: 'Look up available appointment start times for a directly bookable visit type between two dates (inclusive, Belize calendar dates, at most 14 days apart). Returns only times that are actually free, each with a slot_ref. Call this before mentioning any time.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          visit_type: { type: 'string', enum: direct, description: 'Visit type ID.' },
          from_date: { type: 'string', description: 'First date to search, YYYY-MM-DD (Belize).' },
          to_date: { type: 'string', description: 'Last date to search, YYYY-MM-DD (Belize).' },
        },
        required: ['visit_type', 'from_date', 'to_date'],
        additionalProperties: false,
      },
    },
    {
      name: 'open_booking_form',
      description: 'After the visitor chooses one of the returned times, show them the structured booking form for that time. The visitor enters their own contact details and confirms in the form; the website then saves the booking and shows the outcome. This tool does not book anything by itself.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          slot_ref: { type: 'string', description: 'The slot_ref of the chosen time, exactly as returned by find_available_times.' },
        },
        required: ['slot_ref'],
        additionalProperties: false,
      },
    },
    {
      name: 'open_staff_review_form',
      description: 'Show the visitor a request form for a visit type that the team reviews and schedules by contacting the visitor. No appointment time is set.',
      strict: true,
      input_schema: {
        type: 'object',
        properties: {
          visit_type: { type: 'string', enum: staff, description: 'Visit type ID.' },
        },
        required: ['visit_type'],
        additionalProperties: false,
      },
    },
  ];
}

function textOf(content) {
  return content.filter((b) => b.type === 'text').map((b) => b.text).join('\n\n').trim();
}

/**
 * confident AI: a manual tool-use loop over the Claude Messages API.
 * Conversation history lives server-side in the visitor's session and is only ever appended to.
 */
export function createAssistant({ site, scheduling, client, kv = null, config = {}, logger = console }) {
  // Conversation state per visitor session: in the key-value store when given (serverless), else in memory.
  const memory = new Map();
  const freshState = () => ({ messages: [], turns: 0, notes: [] });
  const chatKey = (sessionId) => `chats/${sessionId}`;
  async function loadState(sessionId) {
    if (!kv) return memory.get(sessionId) ?? freshState();
    return (await kv.getJSON(chatKey(sessionId))) ?? freshState();
  }
  async function saveState(sessionId, state) {
    if (!kv) return void memory.set(sessionId, state);
    await kv.setJSON(chatKey(sessionId), { ...state, updatedAt: new Date().toISOString() });
  }
  const deadlineMs = config.deadlineMs ?? 45_000; // stay inside a 60 s serverless execution limit
  const model = config.model || 'claude-opus-5-5';
  const effort = config.effort || 'low';
  const fallbacks = config.fallbacks ?? 'default';
  const systemPrompt = buildSystemPrompt(site);
  const tools = buildTools(scheduling);
  const unavailable = site.statusMessages.unavailable;
  const tz = scheduling.timeZone;

  async function callClaude(messages) {
    const params = {
      model,
      max_tokens: 16000,
      system: systemPrompt,
      tools,
      messages,
      output_config: { effort },
      cache_control: { type: 'ephemeral' },
    };
    if (fallbacks && fallbacks !== 'off') {
      // Server-side refusal fallback: a declined request is retried on a fallback model in the same call.
      return client.beta.messages.create({ ...params, betas: ['server-side-fallback-2026-07-01'], fallbacks });
    }
    return client.messages.create(params);
  }

  async function runTool(session, block, actions) {
    const input = block.input ?? {};
    try {
      if (block.name === 'find_available_times') {
        const result = await scheduling.findAvailability({
          sessionId: session.id, visitTypeId: input.visit_type, fromDate: input.from_date, toDate: input.to_date, locale: session.locale,
        });
        return {
          time_zone: 'Belize time',
          searched_from: result.fromDate,
          searched_to: result.toDate,
          last_bookable_date: result.lastBookableDate,
          available: result.slots.slice(0, MAX_SLOTS_FOR_MODEL).map((s) => ({ slot_ref: s.slotRef, when: `${s.dateLabel} at ${s.timeLabel}` })),
          more_available: result.slots.length > MAX_SLOTS_FOR_MODEL || Boolean(result.truncated),
        };
      }
      if (block.name === 'open_booking_form') {
        const review = await scheduling.prepareBooking({ sessionId: session.id, slotRef: input.slot_ref, locale: session.locale });
        actions.push({ type: 'review', review });
        return {
          status: 'form_shown',
          summary: `${review.visitType.label}, ${review.slot.dateLabel} at ${review.slot.timeLabel} Belize time`,
          note: 'The visitor now sees the booking form. It is NOT booked until they submit it and the website confirms.',
        };
      }
      if (block.name === 'open_staff_review_form') {
        const review = await scheduling.prepareStaffReview({ sessionId: session.id, visitTypeId: input.visit_type, locale: session.locale });
        actions.push({ type: 'review', review });
        return { status: 'form_shown', note: 'The visitor now sees a staff-review request form. No appointment time is set.' };
      }
      return { error: `Unknown tool ${block.name}` };
    } catch (err) {
      if (err instanceof SchedulingError && err.code === 'slot_taken') {
        return {
          status: 'slot_taken',
          message_for_visitor: err.message,
          next_available: (err.alternatives ?? []).map((s) => ({ slot_ref: s.slotRef, when: `${s.dateLabel} at ${s.timeLabel}` })),
        };
      }
      if (err instanceof SchedulingError) return { error: err.code, message: err.message };
      logger.error('[assistant] scheduling tool failed:', err.name);
      return { error: 'availability_temporarily_unavailable', message_for_visitor: unavailable };
    }
  }

  async function handleMessage({ sessionId, text, page, locale = 'en' }) {
    const message = String(text ?? '').trim().slice(0, 800);
    if (!message) return { reply: '', actions: [] };
    if (!client) return { reply: unavailable, actions: [], degraded: true };
    const session = { id: sessionId, locale };
    const started = Date.now();
    let state;
    try {
      state = await loadState(sessionId);
    } catch (err) {
      logger.error('[assistant] could not load conversation', err.name);
      return { reply: unavailable, actions: [], degraded: true };
    }
    if (state.turns >= MAX_TURNS_PER_SESSION) {
      return { reply: `We’ve reached the limit for this conversation. Please call ${site.clinic.phone.label} or message the practice on WhatsApp.`, actions: [], degraded: true };
    }

    const nowDate = new Date();
    const context = `[Website context] Current date and time in Belize: ${formatDateLong(nowDate, tz)}, ${formatTime(nowDate, tz)}.${page ? ` Visitor is on ${page}.` : ''}${locale === 'es' ? ' The visitor is using the Spanish site: reply in Spanish and use /es links.' : ''}`;
    const content = [{ type: 'text', text: context }];
    for (const note of state.notes.splice(0)) content.push({ type: 'text', text: `[Website note] ${note}` });
    content.push({ type: 'text', text: message });

    const checkpoint = state.messages.length;
    state.messages.push({ role: 'user', content });
    const actions = [];
    const replyParts = [];

    try {
      for (let round = 0; round <= MAX_TOOL_ROUNDS; round += 1) {
        if (Date.now() - started > deadlineMs) throw new Error('Assistant deadline reached');
        const response = await callClaude(state.messages);
        state.messages.push({ role: 'assistant', content: response.content });
        const said = textOf(response.content);
        if (said) replyParts.push(said);

        if (response.stop_reason === 'refusal') {
          replyParts.push(`I can’t help with that here. Please contact the team at ${site.clinic.phone.label} or on WhatsApp.`);
          break;
        }
        if (response.stop_reason !== 'tool_use') break;
        if (round === MAX_TOOL_ROUNDS) throw new Error('Too many tool rounds');

        const toolUses = response.content.filter((b) => b.type === 'tool_use');
        const results = [];
        for (const block of toolUses) {
          const result = await runTool(session, block, actions);
          results.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result), ...(result.error ? { is_error: true } : {}) });
        }
        state.messages.push({ role: 'user', content: results });
      }
      state.turns += 1;
      await saveState(sessionId, state);
      return { reply: replyParts.join('\n\n') || unavailable, actions };
    } catch (err) {
      // Drop the incomplete turn so the stored conversation stays valid for the next request.
      state.messages.length = checkpoint;
      await saveState(sessionId, state).catch(() => {});
      if (err instanceof Anthropic.RateLimitError) logger.error('[assistant] rate limited');
      else if (err instanceof Anthropic.APIError) logger.error('[assistant] API error', err.status);
      else logger.error('[assistant] error', err.name, err.message);
      return { reply: unavailable, actions: [], degraded: true };
    }
  }

  /** Website outcomes (never contact details) are passed to the assistant with the next message. */
  async function noteOutcome(sessionId, result) {
    const label = {
      confirmed: `The visitor's booking was confirmed by the calendar: ${result.slot?.dateLabel} at ${result.slot?.timeLabel} Belize time, reference ${result.bookingRef}.`,
      staff_review_recorded: `The visitor's staff-review request was recorded (reference ${result.requestRef}). No time is set yet.`,
      slot_taken: 'The chosen time became unavailable before it could be saved; the visitor was shown alternatives.',
      unconfirmed: 'The booking could not be confirmed (calendar did not respond). Nothing is confirmed.',
      unavailable: 'The booking could not be completed because the calendar was unavailable. Nothing is confirmed.',
    }[result.status];
    if (!label) return;
    try {
      const state = await loadState(sessionId);
      state.notes.push(label);
      await saveState(sessionId, state);
    } catch (err) {
      logger.error('[assistant] could not save outcome note', err.name);
    }
  }

  async function reset(sessionId) {
    await saveState(sessionId, freshState());
  }

  return { available: Boolean(client), model, handleMessage, noteOutcome, reset, systemPrompt, tools };
}

export function createClaudeClient() {
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) return null;
  // Per-request timeout and a single retry keep the whole tool loop inside a 60 s function limit.
  return new Anthropic({ timeout: 25_000, maxRetries: 1 });
}
