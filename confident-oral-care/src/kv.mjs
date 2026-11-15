/**
 * Minimal key-value storage used for the test calendar, staff-review requests, booking records and
 * chat history. Keys look like "events/CD-ABC123". Three backends:
 *   FileKV   - JSON files under data/ (Node server, src/kv-file.mjs)
 *   BlobsKV  - Netlify Blobs (Netlify Functions)
 *   MemoryKV - tests
 * createJSON() is atomic (create-if-absent) on every backend; the scheduler relies on it so two
 * bookings can never claim the same slot, even across server instances.
 */

const SAFE = /^[A-Za-z0-9._-]+$/;
export function checkKey(key) {
  const parts = key.split('/');
  if (!parts.every((p) => SAFE.test(p) && p !== '.' && p !== '..')) throw new Error(`Invalid key: ${key}`);
  return parts;
}

export class MemoryKV {
  constructor() { this.map = new Map(); }
  async getJSON(key) { checkKey(key); return this.map.has(key) ? structuredClone(this.map.get(key)) : null; }
  async setJSON(key, value) { checkKey(key); this.map.set(key, structuredClone(value)); }
  async createJSON(key, value) {
    checkKey(key);
    if (this.map.has(key)) return false;
    this.map.set(key, structuredClone(value));
    return true;
  }
  async list(prefix) { return [...this.map.keys()].filter((k) => k.startsWith(prefix)).sort(); }
}

/** Wraps a Netlify Blobs store (from getStore({ name, consistency: 'strong' })). */
export class BlobsKV {
  constructor(store) { this.store = store; }
  async getJSON(key) { checkKey(key); return (await this.store.get(key, { type: 'json' })) ?? null; }
  async setJSON(key, value) { checkKey(key); await this.store.setJSON(key, value); }
  async createJSON(key, value) {
    checkKey(key);
    const result = await this.store.setJSON(key, value, { onlyIfNew: true });
    return result.modified;
  }
  async list(prefix) {
    const { blobs } = await this.store.list({ prefix });
    return blobs.map((b) => b.key).sort();
  }
}

/** Reads every value under a prefix. */
export async function readAll(kv, prefix) {
  const keys = await kv.list(prefix);
  const values = await Promise.all(keys.map((k) => kv.getJSON(k)));
  return values.filter(Boolean);
}
