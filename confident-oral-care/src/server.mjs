import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCore } from './app.mjs';
import { createClaudeClient } from './assistant/assistant.mjs';
import { FileKV } from './kv.mjs';
import { notFoundPage } from './render/pages.mjs';
import { pageRoutes } from './render/routes.mjs';
import { sessionCookie, sessionFromCookie } from './session.mjs';

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

export async function createApp({ root = ROOT, client = createClaudeClient(), logger = console, now, dataDir = null, fault } = {}) {
  const kv = new FileKV(dataDir ?? join(root, 'data'));
  const core = await createCore({ kv, client, logger, now, fault });
  const { site } = core;
  const preview = Boolean(site.siteConfig.preview);
  const routes = pageRoutes(site);

  async function handler(req, res) {
    const started = Date.now();
    const url = new URL(req.url, 'http://localhost');
    const secure = req.headers['x-forwarded-proto'] === 'https' || Boolean(req.socket.encrypted);
    securityHeaders(res, preview);
    res.on('finish', () => logger.log(`${req.method} ${url.pathname} ${res.statusCode} ${Date.now() - started}ms`));

    try {
      const path = url.pathname;
      if (path.length > 1 && path.endsWith('/')) {
        return send(res, 301, '', 'text/plain', { Location: path.replace(/\/+$/, '') + url.search });
      }
      if (path.startsWith('/api/')) {
        if (req.method === 'POST' && req.headers.origin && new URL(req.headers.origin).host !== req.headers.host) {
          return json(res, 403, { status: 'forbidden' });
        }
        const session = sessionFromCookie(req.headers.cookie);
        if (session.isNew) res.setHeader('Set-Cookie', sessionCookie(session.id, secure));
        const body = req.method === 'POST' ? await readJson(req) : {};
        const result = await core.handleApi({ method: req.method, pathname: path, searchParams: url.searchParams, body, sessionId: session.id });
        return json(res, result.status, result.json);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', 'text/plain');

      if (path === '/robots.txt') {
        const origin = site.siteConfig.canonicalOrigin;
        return send(res, 200, preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\n${origin ? `Sitemap: ${origin.replace(/\/$/, '')}/sitemap.xml\n` : ''}`, 'text/plain; charset=utf-8');
      }
      if (path === '/sitemap.xml' && site.siteConfig.canonicalOrigin && !preview) {
        const origin = site.siteConfig.canonicalOrigin.replace(/\/$/, '');
        const urls = [...routes.keys()].map((r) => `<url><loc>${origin}${r}</loc></url>`).join('');
        return send(res, 200, `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, 'application/xml');
      }
      if (path === '/preview/test-calendar') {
        const page = await core.previewCalendar({ token: url.searchParams.get('token') });
        return send(res, page.status, page.html, page.status === 200 ? 'text/html; charset=utf-8' : 'text/plain');
      }
      const page = routes.get(path);
      if (page) return send(res, 200, page());
      if (await serveStatic(req, res, path)) return;
      return send(res, 404, notFoundPage(site));
    } catch (err) {
      if (err.status) return json(res, err.status, { status: 'bad_request', message: err.message });
      logger.error('[server] unhandled error:', err);
      if (!res.headersSent) send(res, 500, 'Something went wrong.', 'text/plain');
    }
  }

  return { handler, site, scheduling: core.scheduling, assistant: core.assistant, core };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  const app = await createApp();
  createServer(app.handler).listen(port, () => {
    console.log(`ConfiDent preview on http://localhost:${port}`);
    console.log(`confident AI: ${app.assistant.available ? `enabled (${app.assistant.model})` : 'disabled (set ANTHROPIC_API_KEY)'}; calendar adapter: ${app.scheduling.adapter.name}${process.env.CALENDAR_FAULT ? ` (fault: ${process.env.CALENDAR_FAULT})` : ''}`);
  });
}
