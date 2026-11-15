// Time-zone helpers. All day and time rules are derived in the clinic's zone (America/Belize).

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const partFormatters = new Map();
function partFormatter(timeZone) {
  if (!partFormatters.has(timeZone)) {
    partFormatters.set(timeZone, new Intl.DateTimeFormat('en-US', {
      timeZone,
      hourCycle: 'h23',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }));
  }
  return partFormatters.get(timeZone);
}

/** Wall-clock parts of an instant in a zone. */
export function partsInZone(date, timeZone) {
  const parts = {};
  for (const { type, value } of partFormatter(timeZone).formatToParts(date)) parts[type] = value;
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  return {
    year, month, day,
    hour: Number(parts.hour), minute: Number(parts.minute), second: Number(parts.second),
    date: `${parts.year}-${parts.month}-${parts.day}`,
    weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, day)).getUTCDay()],
  };
}

function offsetMs(date, timeZone) {
  const p = partsInZone(date, timeZone);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - date.getTime();
}

/** Convert a wall-clock date ('YYYY-MM-DD') and time ('HH:MM') in a zone to a UTC Date. */
export function zonedToUtc(dateStr, timeStr, timeZone) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const first = offsetMs(new Date(guess), timeZone);
  let t = guess - first;
  const second = offsetMs(new Date(t), timeZone);
  if (second !== first) t = guess - second;
  return new Date(t);
}

export function isValidDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function addDays(dateStr, days) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function weekdayOf(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

export function compareDates(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** "Tuesday, 17 November 2026" */
export function formatDateLong(date, timeZone) {
  const p = partsInZone(date, timeZone);
  return `${p.weekday}, ${p.day} ${MONTHS[p.month - 1]} ${p.year}`;
}

/** "Tue 17 Nov" */
export function formatDateShort(date, timeZone) {
  const p = partsInZone(date, timeZone);
  return `${p.weekday.slice(0, 3)} ${p.day} ${MONTHS[p.month - 1].slice(0, 3)}`;
}

/** "9:00 a.m." / "12:30 p.m." */
export function formatTime(date, timeZone) {
  const p = partsInZone(date, timeZone);
  const suffix = p.hour < 12 ? 'a.m.' : 'p.m.';
  const hour12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  return `${hour12}:${String(p.minute).padStart(2, '0')} ${suffix}`;
}

export function minutesOf(timeStr) {
  const [hh, mm] = timeStr.split(':').map(Number);
  return hh * 60 + mm;
}

export function timeOfMinutes(total) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
