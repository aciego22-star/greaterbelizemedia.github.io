import { describe, expect, it } from 'vitest';
// ?raw keeps this working without Node types in the app's tsconfig.
import indexHtml from '../../../index.html?raw';
import { SCHEDULE, msUntilNextChange, themeForDate, themeForHour, type ThemeName } from '../theme';

describe('time-of-day schedule', () => {
  it('covers all 24 hours with no gap', () => {
    const hours = Array.from({ length: 24 }, (_, h) => themeForHour(h));
    expect(hours.every(Boolean)).toBe(true);
    expect(new Set(hours).size).toBe(4);
  });

  it('maps each window to the right sky', () => {
    const expected: Array<[number, ThemeName]> = [
      [0, 'night'], [4, 'night'],
      [5, 'sunrise'], [7, 'sunrise'],
      [8, 'day'], [16, 'day'],
      [17, 'sunset'], [19, 'sunset'],
      [20, 'night'], [23, 'night']
    ];
    for (const [hour, theme] of expected) expect(themeForHour(hour), `hour ${hour}`).toBe(theme);
  });

  it('changes exactly on the boundary hours and nowhere else', () => {
    const changes: number[] = [];
    for (let h = 1; h < 24; h++) if (themeForHour(h) !== themeForHour(h - 1)) changes.push(h);
    expect(changes).toEqual(SCHEDULE.map((s) => s.from));
  });

  it('reads the visitor local clock', () => {
    const d = new Date();
    d.setHours(21, 30, 0, 0);
    expect(themeForDate(d)).toBe('night');
  });

  it('wakes at the next boundary, not on a fixed poll', () => {
    const d = new Date();
    d.setHours(16, 30, 0, 0);
    // 30 minutes to the 17:00 sunset boundary
    expect(msUntilNextChange(d)).toBe(30 * 60 * 1000);
  });

  it('carries the last boundary of the day over to tomorrow morning', () => {
    const d = new Date();
    d.setHours(23, 0, 0, 0);
    // 23:00 -> 05:00 sunrise is six hours away
    expect(msUntilNextChange(d)).toBe(6 * 60 * 60 * 1000);
  });
});

describe('pre-paint script in index.html', () => {
  it('duplicates the same boundary hours as SCHEDULE', () => {
    const line = indexHtml.split('\n').find((l: string) => l.includes("var t = h <"))!;
    expect(line, 'inline theme script not found in index.html').toBeTruthy();
    const hours = [...line.matchAll(/h < (\d+)/g)].map((m) => Number(m[1]));
    // The chain reads: below the first boundary it is still night, then each
    // boundary in order. Dropping the leading 5 leaves the theme start hours.
    expect(hours).toEqual([SCHEDULE[0].from, ...SCHEDULE.slice(1).map((s) => s.from)]);
  });

  it('names every theme, and no theme the app does not have', () => {
    const line = indexHtml.split('\n').find((l: string) => l.includes("var t = h <"))!;
    const named = new Set([...line.matchAll(/'(\w+)'/g)].map((m) => m[1]));
    const known = new Set<string>(SCHEDULE.map((s) => s.theme));
    expect([...named].sort()).toEqual([...known].sort());
  });

});
