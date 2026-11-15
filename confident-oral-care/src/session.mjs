import { randomId } from './scheduling/tokens.mjs';

const SESSION_COOKIE = 'cd_session';

/** Returns the visitor's session ID from the cookie, issuing one if needed. */
export function sessionFromCookie(cookieHeader) {
  const cookies = Object.fromEntries((cookieHeader || '').split(';').map((c) => c.trim().split('=')).filter((p) => p.length === 2));
  const existing = cookies[SESSION_COOKIE];
  if (existing && /^[A-Za-z0-9_-]{20,64}$/.test(existing)) return { id: existing, isNew: false };
  return { id: randomId(24), isNew: true };
}

export function sessionCookie(id, secure) {
  return `${SESSION_COOKIE}=${id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=7200${secure ? '; Secure' : ''}`;
}
