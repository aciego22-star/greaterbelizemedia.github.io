import { createHash, createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CalendarTimeoutError, CalendarUnavailableError } from '../errors.mjs';

/**
 * Google Calendar adapter (service account). NOT exercised in the preview build: it needs a
 * Google Cloud service account with access to a dedicated TEST calendar. Verify against a test
 * calendar before relying on it.
 *
 * Uses the official REST endpoints:
 *   POST /calendar/v3/freeBusy                  (availability)
 *   POST /calendar/v3/calendars/{id}/events     (create, with a deterministic event ID)
 *   GET  /calendar/v3/calendars/{id}/events/{e} (reconciliation by booking reference)
 *
 * Config (scheduling.json -> google):
 *   { "serviceAccountKeyFile": "/secrets/sa.json", "calendars": { "test-chair-1": "<calendar id>" } }
 */
export class GoogleCalendarAdapter {
  constructor({ serviceAccountKeyFile, calendars, timeZone, timeoutMs = 8000 }) {
    if (!serviceAccountKeyFile || !calendars) throw new Error('Google adapter needs serviceAccountKeyFile and calendars');
    this.name = 'google-calendar';
    this.keyFile = serviceAccountKeyFile;
    this.calendars = calendars;
    this.timeZone = timeZone;
    this.timeoutMs = timeoutMs;
    this.token = null;
  }

  async accessToken() {
    if (this.token && this.token.expires > Date.now() + 60_000) return this.token.value;
    const key = JSON.parse(await readFile(this.keyFile, 'utf8'));
    const now = Math.floor(Date.now() / 1000);
    const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
    const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
      iss: key.client_email,
      scope: 'https://www.googleapis.com/auth/calendar',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })}`;
    const signature = createSign('RSA-SHA256').update(unsigned).sign(key.private_key, 'base64url');
    const res = await this.fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: `${unsigned}.${signature}`,
      }),
    }, false);
    const json = await res.json();
    this.token = { value: json.access_token, expires: Date.now() + json.expires_in * 1000 };
    return this.token.value;
  }

  async fetch(url, init, auth = true) {
    const headers = { ...(init.headers || {}) };
    if (auth) headers.authorization = `Bearer ${await this.accessToken()}`;
    let res;
    try {
      res = await fetch(url, { ...init, headers, signal: AbortSignal.timeout(this.timeoutMs) });
    } catch (err) {
      if (err.name === 'TimeoutError') throw new CalendarTimeoutError();
      throw new CalendarUnavailableError(err.message);
    }
    if (res.status >= 500 || res.status === 401 || res.status === 403) throw new CalendarUnavailableError(`Google Calendar ${res.status}`);
    return res;
  }

  calendarFor(resource) {
    const id = this.calendars[resource];
    if (!id) throw new CalendarUnavailableError(`No calendar mapped for ${resource}`);
    return id;
  }

  /** Deterministic event ID (base32hex alphabet) so a retried insert cannot create a duplicate. */
  static eventIdFor(bookingRef) {
    return `cd${createHash('sha256').update(bookingRef).digest('hex').slice(0, 30)}`;
  }

  async getBusy({ resourceIds, from, to }) {
    const items = resourceIds.map((r) => ({ id: this.calendarFor(r) }));
    const res = await this.fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), timeZone: this.timeZone, items }),
    });
    if (!res.ok) throw new CalendarUnavailableError(`freeBusy ${res.status}`);
    const json = await res.json();
    const busy = [];
    for (const resource of resourceIds) {
      const cal = json.calendars?.[this.calendarFor(resource)];
      if (!cal || cal.errors?.length) throw new CalendarUnavailableError('freeBusy calendar error');
      for (const b of cal.busy) busy.push({ resource, start: new Date(b.start), end: new Date(b.end) });
    }
    return busy;
  }

  async createEvent({ bookingRef, resource, start, end, title, visitTypeId }) {
    const calendarId = encodeURIComponent(this.calendarFor(resource));
    const id = GoogleCalendarAdapter.eventIdFor(bookingRef);
    const res = await this.fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id,
        summary: title,
        start: { dateTime: start.toISOString(), timeZone: this.timeZone },
        end: { dateTime: end.toISOString(), timeZone: this.timeZone },
        extendedProperties: { private: { bookingRef, visitTypeId } },
      }),
    });
    if (res.status === 409) return { eventId: id }; // already created by an earlier attempt
    if (!res.ok) throw new CalendarUnavailableError(`events.insert ${res.status}`);
    return { eventId: (await res.json()).id };
  }

  async findEventByBookingRef(bookingRef, resource) {
    const resources = resource ? [resource] : Object.keys(this.calendars);
    for (const r of resources) {
      const calendarId = encodeURIComponent(this.calendarFor(r));
      const res = await this.fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events/${GoogleCalendarAdapter.eventIdFor(bookingRef)}`,
        { method: 'GET' },
      );
      if (res.status === 404 || res.status === 410) continue;
      if (!res.ok) throw new CalendarUnavailableError(`events.get ${res.status}`);
      const event = await res.json();
      if (event.status !== 'cancelled') return event;
    }
    return null;
  }
}
