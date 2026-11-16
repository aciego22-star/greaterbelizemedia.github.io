// Platform-neutral application core: the JSON API and the preview calendar page.
// Used by the Node server (src/server.mjs) and the Netlify Function (netlify/functions/api.mjs).

import { createAssistant } from './assistant/assistant.mjs';
import { createDemoAssistant } from './assistant/demo.mjs';
import { testCalendarPage } from './render/pages.mjs';
import { createScheduling } from './scheduling/index.mjs';
import { SchedulingError } from './scheduling/service.mjs';
import { formatDateLong, formatTime } from './scheduling/time.mjs';
import { resolveSecret } from './scheduling/tokens.mjs';
import { loadSites } from './site.mjs';

export async function createCore({ kv, client = null, logger = console, now, fault, env = globalThis.process?.env ?? {} }) {
  const sites = await loadSites();
  const site = sites.en;
  const secret = await resolveSecret(kv, env.SESSION_SECRET);
  const scheduling = createScheduling({ config: site.scheduling, clinic: site.clinic, kv, secret, now, logger, fault });
  // Claude when an API key is configured; otherwise, on preview sites, the scripted demo assistant
  // (ASSISTANT_DEMO=on|off overrides). A live site without a key shows the phone/WhatsApp fallback.
  const demo = !client && (env.ASSISTANT_DEMO ? env.ASSISTANT_DEMO !== 'off' : Boolean(site.siteConfig.preview));
  const assistant = demo
    ? createDemoAssistant({ site, sites, scheduling, kv, now, logger })
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
  // Sessions with a reply in progress. Entries expire, so a request the platform cut off can't block a visitor.
  const busy = new Map();
  const BUSY_MS = 50_000;
  const ok = (json, status = 200) => ({ status, json });

  /** Handles /api/* requests. `body` is the parsed JSON body for POSTs. */
  async function handleApi({ method, pathname, searchParams, body = {}, sessionId }) {
    const locale = (method === 'GET' ? searchParams.get('lang') : body.lang) === 'es' ? 'es' : 'en';
    const unavailable = sites[locale].statusMessages.unavailable;
    if (method === 'GET' && pathname === '/api/assistant/status') {
      return ok({ available: assistant.available, mode: assistant.mode ?? (assistant.available ? 'claude' : 'off'), previewLabel });
    }
    if (method === 'GET' && pathname === '/api/visit-types') {
      return ok({ visitTypes: scheduling.listVisitTypes(locale), services: scheduling.serviceOptions(locale), previewLabel: locale === 'es' && previewLabel ? 'Cita de prueba. Use datos de ejemplo para esta demostración.' : previewLabel });
    }
    if (method === 'GET' && pathname === '/api/availability') {
      if (!allow(sessionId, 'availability', 60, 60_000)) return ok({ status: 'rate_limited' }, 429);
      try {
        const result = await scheduling.findAvailability({
          sessionId,
          visitTypeId: searchParams.get('visitType'),
          fromDate: searchParams.get('from'),
          toDate: searchParams.get('to'),
          locale,
        });
        return ok({ status: 'ok', ...result });
      } catch (err) {
        if (err instanceof SchedulingError) return ok({ status: err.code, message: err.message }, 400);
        logger.error('[api] availability failed:', err.name);
        return ok({ status: 'unavailable', message: unavailable }, 503);
      }
    }
    if (method !== 'POST') return ok({ status: 'not_found' }, 404);

    if (pathname === '/api/booking/prepare') {
      if (!allow(sessionId, 'prepare', 30, 60_000)) return ok({ status: 'rate_limited' }, 429);
      try {
        const review = body.slotRef
          ? await scheduling.prepareBooking({ sessionId, slotRef: String(body.slotRef), locale })
          : await scheduling.prepareStaffReview({ sessionId, visitTypeId: String(body.visitType || ''), locale });
        return ok({ status: 'ok', review });
      } catch (err) {
        if (err instanceof SchedulingError) {
          return ok({ status: err.code, message: err.message, alternatives: err.alternatives }, err.code === 'slot_taken' ? 409 : 400);
        }
        logger.error('[api] prepare failed:', err.name);
        return ok({ status: 'unavailable', message: unavailable }, 503);
      }
    }
    if (pathname === '/api/booking/complete') {
      if (!allow(sessionId, 'complete', 12, 60_000)) return ok({ status: 'rate_limited' }, 429);
      const result = await scheduling.completeReview({ sessionId, reviewId: String(body.reviewId || ''), contact: body.contact, locale });
      if (body.source === 'assistant') await assistant.noteOutcome(sessionId, result);
      // Log the outcome without personal data.
      logger.log(`[booking] ${result.status}${result.bookingRef ? ` ${result.bookingRef}` : ''}${result.requestRef ? ` ${result.requestRef}` : ''}`);
      const { eventId, ...publicResult } = result;
      return ok(publicResult);
    }
    if (pathname === '/api/assistant/reset') {
      await assistant.reset?.(sessionId);
      return ok({ status: 'ok' });
    }
    if (pathname === '/api/assistant') {
      const es = locale === 'es';
      if (busy.has(sessionId) && Date.now() - busy.get(sessionId) < BUSY_MS) {
        return ok({ reply: es ? 'Un momento, todavía estoy respondiendo su último mensaje.' : 'One moment, I’m still answering your last message.', actions: [] }, 429);
      }
      if (!allow(sessionId, 'assistant', 15, 60_000)) {
        return ok({ reply: es ? 'Por favor espere un momento antes de enviar otro mensaje.' : 'Please wait a moment before sending another message.', actions: [] }, 429);
      }
      busy.set(sessionId, Date.now());
      try {
        return ok(await assistant.handleMessage({ sessionId, text: body.message, page: typeof body.page === 'string' ? body.page.slice(0, 120) : null, locale }));
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

  return { site, sites, scheduling, assistant, handleApi, previewCalendar };
}
