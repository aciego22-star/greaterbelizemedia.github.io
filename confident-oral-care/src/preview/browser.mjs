// Single-file preview runtime: runs the real application core (scheduling service, test calendar,
// confident AI demo mode) inside the page and answers the site's /api/* requests locally.
// Test data is kept in this browser's localStorage.

import { createCore } from '../app.mjs';
import { MemoryKV } from '../kv.mjs';

const STORE = 'confident-preview-data';

class LocalStorageKV extends MemoryKV {
  constructor() {
    super();
    try { this.map = new Map(JSON.parse(localStorage.getItem(STORE) || '[]')); } catch { this.map = new Map(); }
  }
  persist() { try { localStorage.setItem(STORE, JSON.stringify([...this.map])); } catch { /* storage full or blocked */ } }
  async setJSON(key, value) { await super.setJSON(key, value); this.persist(); }
  async createJSON(key, value) { const created = await super.createJSON(key, value); if (created) this.persist(); return created; }
}

function sessionId() {
  let id = null;
  try { id = sessionStorage.getItem('confident-preview-session'); } catch { /* ignore */ }
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(18)), (b) => b.toString(16).padStart(2, '0')).join('');
    try { sessionStorage.setItem('confident-preview-session', id); } catch { /* ignore */ }
  }
  return id;
}

const sid = sessionId();
const logger = { log() {}, warn: console.warn.bind(console), error: console.error.bind(console) };
const ready = createCore({ kv: new LocalStorageKV(), client: null, env: { ASSISTANT_DEMO: 'on' }, logger });

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const path = typeof input === 'string' ? input : null;
  if (!path || !path.startsWith('/api/')) return realFetch(input, init);
  const url = new URL(path, 'https://preview.local');
  const core = await ready;
  let body = {};
  try { body = init.body ? JSON.parse(init.body) : {}; } catch { body = {}; }
  // A short pause so loading states look as they would over a network.
  await new Promise((r) => setTimeout(r, 250));
  const result = await core.handleApi({
    method: (init.method || 'GET').toUpperCase(), pathname: url.pathname, searchParams: url.searchParams, body, sessionId: sid,
  });
  return new Response(JSON.stringify(result.json), { status: result.status, headers: { 'content-type': 'application/json' } });
};

window.__confidentPreview = {
  ready,
  async calendarMain() {
    const page = await (await ready).previewCalendar({});
    const html = page.html;
    return html.slice(html.indexOf('<main id="main" tabindex="-1">') + '<main id="main" tabindex="-1">'.length, html.indexOf('</main>'));
  },
  reset() {
    try { localStorage.removeItem(STORE); sessionStorage.removeItem('confident-preview-session'); sessionStorage.removeItem('confident-ai-log'); } catch { /* ignore */ }
    location.hash = '';
    location.reload();
  },
};
