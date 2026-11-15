import { randomBytes } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAssistant, createClaudeClient } from './assistant/assistant.mjs';
import * as pages from './render/pages.mjs';
import { pageRoutes } from './render/routes.mjs';
import { createScheduling } from './scheduling/index.mjs';
import { SchedulingError } from './scheduling/service.mjs';
import { formatDateLong, formatTime } from './scheduling/time.mjs';
import { loadSite } from './site.mjs';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const PUBLIC = join(ROOT, 'public');

const TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.vtt': 'text/vtt; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
};

/* ------------------------------------------------------------ Sessions */

const SESSION_COOKIE = 'cd_session';
const SESSION_IDLE_MS = 2 * 60 * 60 * 1000;

function createSessionStore() {
  const sessions = new Map();
  setInterval(() => {
    const cutoff = Date.now() - SESSION_IDLE_MS;
    for (const [id, s] of sessions) if (s.lastSeen < cutoff) sessions.delete(id);
  }, 10 * 60 * 1000).unref();
  return {
    get(req, res, secure) {
      const cookie = Object.fromEntries((req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2));
      let session = sessions.get(cookie[SESSION_COOKIE]);
      if (!session) {
        const id = randomBytes(24).toString('base64url');
        session = { id, created: Date.now(), hits: [] };
        sessions.set(id, session);
        res.setHeader('Set-Cookie', `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${secure ? '; Secure' : ''}`);
      }
      session.lastSeen = Date.now();
      return session;
    },
  };
}

/** Sliding-window limit per session and bucket. */
function allow(session, bucket, max, windowMs) {
  const now = Date.now();
  session.rate ??= {};
  const hits = (session.rate[bucket] ?? []).filter((t) => t > now - windowMs);
  if (hits.length >= max) { session.rate[bucket] = hits; return false; }
  hits.push(now);
  session.rate[bucket] = hits;
  return true;
}

/* ------------------------------------------------------------- Helpers */

function securityHeaders(res, preview) {
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; media-src 'self' https:; script-src 'self'; style-src 'self'; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (preview) res.setHeader('X-Robots-Tag', 'noindex, nofollow');
}

function send(res, status, body, type = 'text/html; charset=utf-8', extra = {}) {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store', ...extra });
  res.end(body);
}

function json(res, status, data) {
  send(res, status, JSON.stringify(data), 'application/json; charset=utf-8');
}

async function readJson(req, limit = 16 * 1024) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw Object.assign(new Error('Expected JSON'), { status: 415 });
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error('Body too large'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');
  } catch {
    throw Object.assign(new Error('Invalid JSON'), { status: 400 });
  }
}

async function serveStatic(req, res, pathname) {
  const file = normalize(join(PUBLIC, decodeURIComponent(pathname)));
  if (!file.startsWith(PUBLIC + '/') || file.includes('/original/')) return false;
  let info;
  try { info = await stat(file); } catch { return false; }
  if (!info.isFile()) return false;
  const type = TYPES[extname(file)] ?? 'application/octet-stream';
  const longCache = /\.(woff2|webp|jpg|png|svg|mp4|webm)$/.test(file);
  const headers = {
    'Content-Type': type,
    'Accept-Ranges': 'bytes',
    'Cache-Control': longCache ? 'public, max-age=604800' : 'public, max-age=300',
  };
  // Byte ranges: required for video playback (iOS Safari will not play media without 206 responses).
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  if (range && (range[1] || range[2])) {
    let start = range[1] ? Number(range[1]) : info.size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : info.size - 1;
    start = Math.max(0, start);
    end = Math.min(end, info.size - 1);
    if (start > end || start >= info.size) {
      res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
      return res.end(), true;
    }
    res.writeHead(206, { ...headers, 'Content-Length': end - start + 1, 'Content-Range': `bytes ${start}-${end}/${info.size}` });
    if (req.method === 'HEAD') return res.end(), true;
    createReadStream(file, { start, end }).pipe(res);
    return true;
  }
  res.writeHead(200, { ...headers, 'Content-Length': info.size });
  if (req.method === 'HEAD') return res.end(), true;
  createReadStream(file).pipe(res);
  return true;
}

/* -------------------------------------------------------------- Server */

export async function createApp({ root = ROOT, client = createClaudeClient(), logger = console, now, dataDir = null } = {}) {
  const site = await loadSite(root);
  const scheduling = createScheduling({ config: site.scheduling, clinic: site.clinic, root, now, logger, dataDir });
  const assistant = createAssistant({
    site,
    scheduling,
    client,
    config: {
      model: process.env.ANTHROPIC_MODEL,
      effort: process.env.ANTHROPIC_EFFORT,
      fallbacks: process.env.ANTHROPIC_FALLBACKS,
    },
    logger,
  });
  const sessions = createSessionStore();
  const preview = Boolean(site.siteConfig.preview);
  const tz = site.scheduling.timeZone;

  const routes = pageRoutes(site);

  async function api(req, res, url, session) {
    const p = url.pathname;
    if (req.method === 'GET' && p === '/api/assistant/status') {
      return json(res, 200, { available: assistant.available, previewLabel: site.scheduling.mode === 'test' ? site.scheduling.previewLabel : null });
    }
    if (req.method === 'GET' && p === '/api/visit-types') {
      return json(res, 200, { visitTypes: scheduling.listVisitTypes(), services: scheduling.serviceNames, previewLabel: site.scheduling.mode === 'test' ? site.scheduling.previewLabel : null });
    }
    if (req.method === 'GET' && p === '/api/availability') {
      if (!allow(session, 'availability', 60, 60_000)) return json(res, 429, { status: 'rate_limited' });
      try {
        const result = await scheduling.findAvailability({
          sessionId: session.id,
          visitTypeId: url.searchParams.get('visitType'),
          fromDate: url.searchParams.get('from'),
          toDate: url.searchParams.get('to'),
        });
        return json(res, 200, { status: 'ok', ...result });
      } catch (err) {
        if (err instanceof SchedulingError) return json(res, 400, { status: err.code, message: err.message });
        logger.error('[api] availability failed:', err.name);
        return json(res, 503, { status: 'unavailable', message: site.statusMessages.unavailable });
      }
    }
    if (req.method !== 'POST') return json(res, 405, { status: 'method_not_allowed' });
    const body = await readJson(req);

    if (p === '/api/booking/prepare') {
      if (!allow(session, 'prepare', 30, 60_000)) return json(res, 429, { status: 'rate_limited' });
      try {
        const review = body.slotRef
          ? await scheduling.prepareBooking({ sessionId: session.id, slotRef: String(body.slotRef) })
          : await scheduling.prepareStaffReview({ sessionId: session.id, visitTypeId: String(body.visitType || '') });
        return json(res, 200, { status: 'ok', review });
      } catch (err) {
        if (err instanceof SchedulingError) {
          return json(res, err.code === 'slot_taken' ? 409 : 400, { status: err.code, message: err.message, alternatives: err.alternatives });
        }
        logger.error('[api] prepare failed:', err.name);
        return json(res, 503, { status: 'unavailable', message: site.statusMessages.unavailable });
      }
    }
    if (p === '/api/booking/complete') {
      if (!allow(session, 'complete', 12, 60_000)) return json(res, 429, { status: 'rate_limited' });
      const result = await scheduling.completeReview({
        sessionId: session.id,
        reviewId: String(body.reviewId || ''),
        idempotencyKey: body.idempotencyKey,
        contact: body.contact,
      });
      if (body.source === 'assistant') assistant.noteOutcome(session, result);
      // Log the outcome without personal data.
      logger.log(`[booking] ${result.status}${result.bookingRef ? ` ${result.bookingRef}` : ''}${result.requestRef ? ` ${result.requestRef}` : ''}`);
      const { eventId, ...publicResult } = result;
      return json(res, 200, publicResult);
    }
    if (p === '/api/assistant') {
      if (session.assistantBusy) return json(res, 429, { reply: 'One moment, I’m still answering your last message.', actions: [] });
      if (!allow(session, 'assistant', 15, 60_000)) return json(res, 429, { reply: 'Please wait a moment before sending another message.', actions: [] });
      session.assistantBusy = true;
      try {
        const result = await assistant.handleMessage({ session, text: body.message, page: typeof body.page === 'string' ? body.page.slice(0, 120) : null });
        return json(res, 200, result);
      } finally {
        session.assistantBusy = false;
      }
    }
    return json(res, 404, { status: 'not_found' });
  }

  async function handler(req, res) {
    const started = Date.now();
    const url = new URL(req.url, 'http://localhost');
    const secure = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted);
    securityHeaders(res, preview);
    res.on('finish', () => logger.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`));

    try {
      let path = url.pathname;
      if (path.length > 1 && path.endsWith('/')) {
        return send(res, 301, '', 'text/plain', { Location: path.replace(/\/+$/, '') + url.search });
      }
      if (path.startsWith('/api/')) {
        if (req.method === 'POST' && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
          return json(res, 403, { status: 'forbidden' });
        }
        const session = sessions.get(req, res, secure);
        return await api(req, res, url, session);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');

      if (path === '/robots.txt') {
        const origin = site.siteConfig.canonicalOrigin;
        return send(res, 200, preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin.replace(/\/$/, '')}/sitemap.xml\n` : ''}`, 'text/plain; charset=utf-8');
      }
      if (path === '/sitemap.xml' && site.siteConfig.canonicalOrigin && !preview) {
        const origin = site.siteConfig.canonicalOrigin.replace(/\/$/, '');
        const urls = [...routes.keys()].map((r) => `<url><loc>${origin}${r === '/' ? '/' : r}</loc></url>`).join('');
        return send(res, 200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, 'application/xml');
      }
      if (path === '/preview/test-calendar' && site.scheduling.mode === 'test') {
        const token = process.env.PREVIEW_TOKEN;
        if (token && url.searchParams.get('token') !== token) return send(res, 403, 'Forbidden', 'text/plain');
        const adapter = scheduling.adapter;
        const events = adapter.listEvents ? await adapter.listEvents() : [];
        const staff = await scheduling.listStaffRequests();
        const formatEvent = (e) => ({
          dateLabel: formatDateLong(new Date(e.start), tz),
          timeLabel: formatTime(new Date(e.start), tz),
          endLabel: formatTime(new Date(e.end), tz),
        });
        return send(res, 200, pages.testCalendarPage(site, { events, staffRequests: staff, scheduling: { adapter, timeZone: tz }, formatEvent }));
      }
      const page = routes.get(path);
      if (page) {
        sessions.get(req, res, secure);
        return send(res, 200, page());
      }
      if (await serveStatic(req, res, path)) return;
      return send(res, 404, pages.notFoundPage(site));
    } catch (err) {
      if (err.status) return json(res, err.status, { status: 'bad_request', message: err.message });
      logger.error('[server] unhandled error:', err);
      if (!res.headersSent) send(res, 500, 'Something went wrong.', 'text/plain');
    }
  }

  return { handler, site, scheduling, assistant };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const app = await createApp();
  createServer(app.handler).listen(port, () => {
    console.log(`ConfiDent preview on http://localhost:${port}`);
    console.log(`confident AI: ${app.assistant.available ? `enabled (${app.assistant.model})` : 'disabled (set ANTHROPIC_API_KEY)'}; calendar adapter: ${app.scheduling.adapter.name}${process.env.CALENDAR_FAULT ? ` (fault: ${process.env.CALENDAR_FAULT})` : ''}`);
  });
}
