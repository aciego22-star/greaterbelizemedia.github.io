// Platform-neutral application core: the JSON API and the preview calendar page.
// Used by the Node server (src/server.mjs) and the Netlify Function (netlify/functions/api.mjs).

import { createAssistant } from './assistant/assistant.mjs';
import { createDemoAssistant } from './assistant/demo.mjs';
import { testCalendarPage } from './render/pages.mjs';
import { createScheduling } from './scheduling/index.mjs';
import { SchedulingError } from './scheduling/service.mjs';
import { formatDateLong, formatTime } from './scheduling/time.mjs';
import { resolveSecret } from './scheduling/tokens.mjs';
import { loadSite } from './site.mjs';

export async function createCore({ kv, client = null, logger = console, now, fault, env = globalThis.process?.env ?? {} }) {
  const site = await loadSite();
  const secret = await resolveSecret(kv, env.SESSION_SECRET);
  const scheduling = createScheduling({ config: site.scheduling, clinic: site.clinic, kv, secret, now, logger, fault });
  // Claude when an API key is configured; otherwise, on preview sites, the scripted demo assistant
  // (ASSISTANT_DEMO=on|off overrides). A live site without a key shows the phone/Instagram fallback.
  const demo = !client && (env.ASSISTANT_DEMO ? env.ASSISTANT_DEMO !== 'off' : Boolean(site.siteConfig.preview));
  const assistant = demo
    ? createDemoAssistant({ site, scheduling, kv, now, logger })
    : createAssistant({
      site,
      scheduling,
      client,
      kv,
      config: { model: env.ANTHROPIC_MODEL, effort: env.ANTHROPIC_EFFORT, fallbacks: env.ANTHROPIC_FALLBACKS },
      logger,
    });
  const tz = site.scheduling.timeZone;
  const previewLabel = site.scheduling.mode === 'test' ? site.scheduling.previewLabel : null;

  // Best-effort rate limits (per server instance).
  const rate = new Map();
  function allow(sessionId, bucket, max, windowMs) {
    const key = `${sessionId}:${bucket}`;
    const t = Date.now();
    const hits = (rate.get(key) ?? []).filter((h) => h > t - windowMs);
    if (hits.length >= max) { rate.set(key, hits); return false; }
    hits.push(t);
    rate.set(key, hits);
    if (rate.size > 5000) rate.clear();
    return true;
  }
  const busy = new Set();
  const ok = (json, status = 200) => ({ status, json });

  /** Handles /api/* requests. `body` is the parsed JSON body for POSTs. */
  async function handleApi({ method, pathname, searchParams, body = {}, sessionId }) {
    if (method === 'GET' && pathname === '/api/assistant/status') {
      return ok({ available: assistant.available, mode: assistant.mode ?? (assistant.available ? 'claude' : 'off'), previewLabel });
    }
    if (method === 'GET' && pathname === '/api/visit-types') {
      return ok({ visitTypes: scheduling.listVisitTypes(), services: scheduling.serviceNames, previewLabel });
    }
    if (method === 'GET' && pathname === '/api/availability') {
      if (!allow(sessionId, 'availability', 60, 60_000)) return ok({ status: 'rate_limited' }, 429);
      try {
        const result = await scheduling.findAvailability({
          sessionId,
          visitTypeId: searchParams.get('visitType'),
          fromDate: searchParams.get('from'),
          toDate: searchParams.get('to'),
        });
        return ok({ status: 'ok', ...result });
      } catch (err) {
        if (err instanceof SchedulingError) return ok({ status: err.code, message: err.message }, 400);
        logger.error('[api] availability failed:', err.name);
        return ok({ status: 'unavailable', message: site.statusMessages.unavailable }, 503);
      }
    }
    if (method !== 'POST') return ok({ status: 'not_found' }, 404);

    if (pathname === '/api/booking/prepare') {
      if (!allow(sessionId, 'prepare', 30, 60_000)) return ok({ status: 'rate_limited' }, 429);
      try {
        const review = body.slotRef
          ? await scheduling.prepareBooking({ sessionId, slotRef: String(body.slotRef) })
          : await scheduling.prepareStaffReview({ sessionId, visitTypeId: String(body.visitType || '') });
        return ok({ status: 'ok', review });
      } catch (err) {
        if (err instanceof SchedulingError) {
          return ok({ status: err.code, message: err.message, alternatives: err.alternatives }, err.code === 'slot_taken' ? 409 : 400);
        }
        logger.error('[api] prepare failed:', err.name);
        return ok({ status: 'unavailable', message: site.statusMessages.unavailable }, 503);
      }
    }
    if (pathname === '/api/booking/complete') {
      if (!allow(sessionId, 'complete', 12, 60_000)) return ok({ status: 'rate_limited' }, 429);
      const result = await scheduling.completeReview({ sessionId, reviewId: String(body.reviewId || ''), contact: body.contact });
      if (body.source === 'assistant') await assistant.noteOutcome(sessionId, result);
      // Log the outcome without personal data.
      logger.log(`[booking] ${result.status}${result.bookingRef ? ` ${result.bookingRef}` : ''}${result.requestRef ? ` ${result.requestRef}` : ''}`);
      const { eventId, ...publicResult } = result;
      return ok(publicResult);
    }
    if (pathname === '/api/assistant') {
      if (busy.has(sessionId)) return ok({ reply: 'One moment, I’m still answering your last message.', actions: [] }, 429);
      if (!allow(sessionId, 'assistant', 15, 60_000)) return ok({ reply: 'Please wait a moment before sending another message.', actions: [] }, 429);
      busy.add(sessionId);
      try {
        return ok(await assistant.handleMessage({ sessionId, text: body.message, page: typeof body.page === 'string' ? body.page.slice(0, 120) : null }));
      } finally {
        busy.delete(sessionId);
      }
    }
    return ok({ status: 'not_found' }, 404);
  }

  /** The preview test-calendar page (test mode only). */
  async function previewCalendar({ token, expectedToken = env.PREVIEW_TOKEN }) {
    if (site.scheduling.mode !== 'test') return { status: 404, html: 'Not found' };
    if (expectedToken && token !== expectedToken) return { status: 403, html: 'Forbidden' };
    const adapter = scheduling.adapter;
    const events = adapter.listEvents ? await adapter.listEvents() : [];
    const staffRequests = await scheduling.listStaffRequests();
    const formatEvent = (e) => ({
      dateLabel: formatDateLong(new Date(e.start), tz),
      timeLabel: formatTime(new Date(e.start), tz),
      endLabel: formatTime(new Date(e.end), tz),
    });
    return { status: 200, html: testCalendarPage(site, { events, staffRequests, scheduling: { adapter, timeZone: tz }, formatEvent }) };
  }

  return { site, scheduling, assistant, handleApi, previewCalendar };
}
