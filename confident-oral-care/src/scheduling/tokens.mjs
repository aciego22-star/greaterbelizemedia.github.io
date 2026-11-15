import { createHmac } from 'node:crypto';

// Base64url helpers that work in Node and browsers (no Buffer).
const enc = new TextEncoder();
const dec = new TextDecoder();
function toB64url(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}
function safeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export function randomId(bytes = 24) {
  return toB64url(globalThis.crypto.getRandomValues(new Uint8Array(bytes)));
}

/**
 * Opaque, tamper-proof references (slot holds and review steps). They carry their own data and
 * expiry and are bound to the visitor's session, so they work across serverless instances
 * without shared memory.
 */
export function createTokens(secret) {
  const mac = (data) => createHmac('sha256', secret).update(data).digest('base64url');
  return {
    sign(payload) {
      const data = toB64url(enc.encode(JSON.stringify(payload)));
      return `${data}.${mac(data)}`;
    },
    /** Returns the payload, or null if the token is malformed or has been altered. */
    verify(token) {
      if (typeof token !== 'string' || token.length > 4096) return null;
      const [data, sig] = token.split('.');
      if (!data || !sig || !safeEqual(mac(data), sig)) return null;
      try { return JSON.parse(dec.decode(fromB64url(data))); } catch { return null; }
    },
  };
}

/** A per-installation signing secret: SESSION_SECRET if set, otherwise generated once and stored. */
export async function resolveSecret(kv, envSecret) {
  if (envSecret && envSecret.length >= 16) return envSecret;
  const existing = await kv.getJSON('config/signing-secret');
  if (existing?.secret) return existing.secret;
  const secret = randomId(32);
  if (await kv.createJSON('config/signing-secret', { secret })) return secret;
  return (await kv.getJSON('config/signing-secret')).secret;
}
