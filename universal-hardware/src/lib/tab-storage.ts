/**
 * Tab-scoped storage: sessionStorage, falling back to window.name where
 * sessionStorage is unavailable (private modes, sandboxed preview frames).
 * Both are cleared when the tab closes and never leave the browser.
 */
const PREFIX = 'uhc-tab:';

function nameStore(): Record<string, string> {
  try {
    return window.name.startsWith(PREFIX) ? JSON.parse(window.name.slice(PREFIX.length)) : {};
  } catch {
    return {};
  }
}

export function tabGet(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const v = window.sessionStorage.getItem(key);
    if (v !== null) return v;
  } catch {
    /* fall through */
  }
  return nameStore()[key] ?? null;
}

export function tabSet(key: string, value: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
    return;
  } catch {
    /* fall through */
  }
  try {
    const s = nameStore();
    if (value === null) delete s[key];
    else s[key] = value;
    window.name = Object.keys(s).length ? PREFIX + JSON.stringify(s) : '';
  } catch {
    /* state stays in memory */
  }
}
