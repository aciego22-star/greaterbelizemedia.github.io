import { basename, join, resolve } from 'node:path';
import { GoogleCalendarAdapter } from './adapters/google.mjs';
import { LocalCalendarAdapter } from './adapters/local.mjs';
import { createSchedulingService } from './service.mjs';
import { JsonStore } from './store.mjs';

export function createAdapter(config, root, { fault = process.env.CALENDAR_FAULT || null, dataDir = null } = {}) {
  if (config.adapter === 'google') {
    return new GoogleCalendarAdapter({
      serviceAccountKeyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || config.google.serviceAccountKeyFile,
      calendars: config.google.calendars,
      timeZone: config.timeZone,
      timeoutMs: config.calendarWriteTimeoutMs,
    });
  }
  return new LocalCalendarAdapter({
    file: dataDir ? join(dataDir, basename(config.local.calendarFile)) : resolve(root, process.env.TEST_CALENDAR_FILE || config.local.calendarFile),
    timeZone: config.timeZone,
    busyBlocks: config.testBusyBlocks,
    fault,
  });
}

export function createScheduling({ config, clinic, root, adapter, now, logger, dataDir = null }) {
  const file = (rel) => (dataDir ? join(dataDir, basename(rel)) : resolve(root, rel));
  return createSchedulingService({
    config,
    clinic,
    adapter: adapter ?? createAdapter(config, root, { dataDir }),
    staffStore: new JsonStore(file(config.staffReviewFile)),
    recordsStore: new JsonStore(file(config.bookingRecordsFile)),
    now,
    logger,
  });
}
