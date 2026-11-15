import { GoogleCalendarAdapter } from './adapters/google.mjs';
import { TestCalendarAdapter } from './adapters/test-calendar.mjs';
import { createSchedulingService } from './service.mjs';

export function createAdapter(config, kv, { fault = process.env.CALENDAR_FAULT || null } = {}) {
  if (config.adapter === 'google') {
    return new GoogleCalendarAdapter({
      serviceAccountKeyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || config.google.serviceAccountKeyFile,
      calendars: config.google.calendars,
      timeZone: config.timeZone,
      timeoutMs: config.calendarWriteTimeoutMs,
    });
  }
  return new TestCalendarAdapter({ kv, timeZone: config.timeZone, busyBlocks: config.testBusyBlocks, fault });
}

export function createScheduling({ config, clinic, kv, secret, adapter, now, logger, fault }) {
  return createSchedulingService({
    config,
    clinic,
    kv,
    secret,
    adapter: adapter ?? createAdapter(config, kv, fault === undefined ? {} : { fault }),
    now,
    logger,
  });
}
