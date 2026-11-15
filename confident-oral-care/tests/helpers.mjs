import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MemoryKV, readAll } from '../src/kv.mjs';
import { TestCalendarAdapter } from '../src/scheduling/adapters/test-calendar.mjs';
import { createSchedulingService } from '../src/scheduling/service.mjs';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export async function loadJson(rel) {
  return JSON.parse(await readFile(join(ROOT, rel), 'utf8'));
}

export const silentLogger = { error() {}, log() {}, warn() {} };

/** Monday 16 November 2026, 08:00 in Belize (UTC-6). */
export const MONDAY_8AM = new Date('2026-11-16T14:00:00Z');

export const TEST_SECRET = 'test-secret-0123456789abcdef';

/** A scheduling service on in-memory storage. Pass `kv` to share storage between instances. */
export async function makeScheduling({ now = MONDAY_8AM, fault = null, kv = new MemoryKV() } = {}) {
  const config = await loadJson('config/scheduling.json');
  const clinic = await loadJson('config/clinic-data.json');
  const adapter = new TestCalendarAdapter({ kv, timeZone: config.timeZone, busyBlocks: config.testBusyBlocks, fault });
  let current = now;
  const service = createSchedulingService({
    config, clinic, adapter, kv, secret: TEST_SECRET, now: () => current, logger: silentLogger,
  });
  return {
    service, adapter, kv, config, clinic,
    staffStore: { all: () => readAll(kv, 'staff-requests/') },
    recordsStore: { all: () => readAll(kv, 'booking-records/') },
    setNow: (d) => { current = d; },
  };
}

export const TEST_CONTACT = { name: 'Test Patient', phone: '+501 600-0000', email: '' };
