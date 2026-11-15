import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Opaque, tamper-proof references (slot holds and review steps). They carry their own data and
 * expiry and are bound to the visitor's session, so they work across serverless instances
 * without shared memory.
 */
export function createTokens(secret) {
  const key = Buffer.from(secret, 'utf8');
  const mac = (data) => createHmac('sha256', key).update(data).digest('base64url');
  return {
    sign(payload) {
      const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
      return `${data}.${mac(data)}`;
    },
    /** Returns the payload, or null if the token is malformed or has been altered. */
    verify(token) {
      if (typeof token !== 'string' || token.length > 4096) return null;
      const [data, sig] = token.split('.');
      if (!data || !sig) return null;
      const expected = Buffer.from(mac(data));
      const given = Buffer.from(sig);
      if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
      try { return JSON.parse(Buffer.from(data, 'base64url').toString('utf8')); } catch { return null; }
    },
  };
}

/** A per-installation signing secret: SESSION_SECRET if set, otherwise generated once and stored. */
export async function resolveSecret(kv, envSecret = process.env.SESSION_SECRET) {
  if (envSecret && envSecret.length >= 16) return envSecret;
  const existing = await kv.getJSON('config/signing-secret');
  if (existing?.secret) return existing.secret;
  const secret = randomBytes(32).toString('base64url');
  if (await kv.createJSON('config/signing-secret', { secret })) return secret;
  return (await kv.getJSON('config/signing-secret')).secret;
}
