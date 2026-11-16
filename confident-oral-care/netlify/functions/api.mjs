// Netlify Function: the booking API, confident AI and the preview test calendar.
// Bundled into a single file by `npm run export` (scripts/export-static.mjs), so the deployed
// zip needs no build step or npm install. Data lives in Netlify Blobs (store "confident-oral-care").

import { getStore } from '@netlify/blobs';
import { createCore } from '../../src/app.mjs';
import { createClaudeClient } from '../../src/assistant/assistant.mjs';
import { BlobsKV } from '../../src/kv.mjs';
import { sessionCookie, sessionFromCookie } from '../../src/session.mjs';

let corePromise = null;
function getCore() {
  if (!corePromise) {
    const store = getStore({ name: 'confident-oral-care', consistency: 'strong' });
    corePromise = createCore({ kv: new BlobsKV(store), client: createClaudeClient() }).catch((err) => {
      corePromise = null;
      throw err;
    });
  }
  return corePromise;
}

const UNAVAILABLE = 'I can’t confirm a time right now. Please call +501 628-8233 or send the practice a message on WhatsApp.';

export default async (req) => {
  const url = new URL(req.url);
  const headers = new Headers({
    'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
    'x-robots-tag': 'noindex, nofollow',
  });
  const reply = (status, data) => {
    headers.set('content-type', 'application/json; charset=utf-8');
    return new Response(JSON.stringify(data), { status, headers });
  };

  let core;
  try {
    core = await getCore();
  } catch (err) {
    console.error('[function] startup failed:', err.name, err.message);
    return reply(503, { status: 'unavailable', available: false, message: UNAVAILABLE, reply: UNAVAILABLE, actions: [] });
  }

  const session = sessionFromCookie(req.headers.get('cookie'));
  if (session.isNew) headers.append('set-cookie', sessionCookie(session.id, url.protocol === 'https:'));

  try {
    if (url.pathname === '/preview/test-calendar') {
      const page = await core.previewCalendar({ token: url.searchParams.get('token') });
      headers.set('content-type', page.status === 200 ? 'text/html; charset=utf-8' : 'text/plain; charset=utf-8');
      return new Response(page.html, { status: page.status, headers });
    }

    let body = {};
    if (req.method === 'POST') {
      const origin = req.headers.get('origin');
      if (origin && new URL(origin).host !== url.host) return reply(403, { status: 'forbidden' });
      if (!(req.headers.get('content-type') || '').startsWith('application/json')) return reply(415, { status: 'bad_request' });
      const text = await req.text();
      if (text.length > 16 * 1024) return reply(413, { status: 'bad_request' });
      try { body = JSON.parse(text || '{}'); } catch { return reply(400, { status: 'bad_request' }); }
    }

    const result = await core.handleApi({
      method: req.method, pathname: url.pathname, searchParams: url.searchParams, body, sessionId: session.id,
    });
    return reply(result.status, result.json);
  } catch (err) {
    console.error('[function] error:', err.name, err.message);
    return reply(500, { status: 'unavailable', message: UNAVAILABLE, reply: UNAVAILABLE, actions: [] });
  }
};

export const config = { path: ['/api/*', '/preview/test-calendar'] };
