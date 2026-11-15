import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LocalCalendarAdapter } from '../src/scheduling/adapters/local.mjs';
import { createSchedulingService } from '../src/scheduling/service.mjs';
import { JsonStore } from '../src/scheduling/store.mjs';

export const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

export async function loadJson(rel) {
  return JSON.parse(await readFile(join(ROOT, rel), 'utf8'));
}

export const silentLogger = { error() {}, log() {}, warn() {} };

/** Monday 16 November 2026, 08:00 in Belize (UTC-6). */
export const MONDAY_8AM = new Date('2026-11-16T14:00:00Z');

export async function makeScheduling({ now = MONDAY_8AM, fault = null } = {}) {
  const dir = await mkdtemp(join(tmpdir(), 'confident-test-'));
  const config = await loadJson('config/scheduling.json');
  const clinic = await loadJson('config/clinic-data.json');
  const adapter = new LocalCalendarAdapter({
    file: join(dir, 'calendar.json'),
    timeZone: config.timeZone,
    busyBlocks: config.testBusyBlocks,
    fault,
  });
  const staffStore = new JsonStore(join(dir, 'staff.json'));
  const recordsStore = new JsonStore(join(dir, 'records.json'));
  let current = now;
  const service = createSchedulingService({
    config, clinic, adapter, staffStore, recordsStore, now: () => current, logger: silentLogger,
  });
  return { service, adapter, staffStore, recordsStore, dir, config, clinic, setNow: (d) => { current = d; } };
}

export const TEST_CONTACT = { name: 'Test Patient', phone: '+501 600-0000', email: '' };
