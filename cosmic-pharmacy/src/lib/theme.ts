import { useEffect, useState } from 'react';

export type ThemeName = 'sunrise' | 'day' | 'sunset' | 'night';

/**
 * Belize sits at about 17 degrees north and keeps UTC-6 all year with no
 * daylight saving, so sunrise only drifts between roughly 05:25 and 06:25 and
 * sunset between 17:25 and 18:35. Fixed windows stay accurate year-round there,
 * which they would not in a temperate country.
 *
 * Boundaries are the hour each theme begins. Keep this in step with the inline
 * script in index.html, which runs the same schedule before first paint.
 */
export const SCHEDULE: ReadonlyArray<{ from: number; theme: ThemeName }> = [
  { from: 5, theme: 'sunrise' },
  { from: 8, theme: 'day' },
  { from: 17, theme: 'sunset' },
  { from: 20, theme: 'night' }
];

/** The theme for a given hour of the visitor's local clock. */
export function themeForHour(hour: number): ThemeName {
  let current: ThemeName = 'night';
  for (const slot of SCHEDULE) {
    if (hour >= slot.from) current = slot.theme;
  }
  // Before the first boundary the night sky is still up.
  return hour < SCHEDULE[0].from ? 'night' : current;
}

export function themeForDate(date: Date): ThemeName {
  return themeForHour(date.getHours());
}

/** Milliseconds until the theme next changes, so we wake exactly on the boundary. */
export function msUntilNextChange(date: Date): number {
  const hour = date.getHours();
  const next = SCHEDULE.find((s) => s.from > hour)?.from ?? 24 + SCHEDULE[0].from;
  const boundary = new Date(date);
  boundary.setHours(next, 0, 0, 0);
  return Math.max(1000, boundary.getTime() - date.getTime());
}

function apply(theme: ThemeName) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  // Match the browser's own chrome to the sky, read back from the stylesheet so
  // the colour is defined in exactly one place. Without this the address bar
  // stays on whatever the first paint was, so a night visitor gets a white bar
  // above a near-black page.
  const meta = document.querySelector('meta[name="theme-color"]');
  const sky = getComputedStyle(root).getPropertyValue('--sky').trim();
  if (meta && sky) meta.setAttribute('content', sky);
}

/**
 * Keeps <html data-theme> current for as long as the tab is open.
 *
 * A timer alone is not enough: background tabs throttle timers heavily and a
 * phone that sleeps through 20:00 would wake still showing sunset. Re-checking
 * whenever the page becomes visible again covers that.
 */
export function useTimeOfDayTheme(): ThemeName {
  const [theme, setTheme] = useState<ThemeName>(() => themeForDate(new Date()));

  useEffect(() => {
    let timer: number | undefined;

    const tick = () => {
      const now = new Date();
      const next = themeForDate(now);
      setTheme(next);
      apply(next);
      timer = window.setTimeout(tick, msUntilNextChange(now));
    };

    tick();

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        window.clearTimeout(timer);
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return theme;
}
