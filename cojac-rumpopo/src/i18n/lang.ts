/**
 * Site language (English / Spanish).
 *
 * English pages live at /, /flavours, … and Spanish pages at /es/, /es/flavours, …
 * The language is fixed for a page load: it is read once from the URL (or, at
 * build time, from the pre-renderer), and switching language loads the other
 * version of the page. That keeps every content file a simple constant.
 *
 * Writing bilingual text: t('English text', 'Texto en español').
 */
export type Lang = 'en' | 'es';

declare global {
  // Set by scripts/prerender-routes.mjs before it loads the Spanish renderer.
  var __COJAC_LANG__: Lang | undefined;
}

export const LANG_STORAGE_KEY = 'cojac-lang';
export const isArtifactBuild = import.meta.env.VITE_ARTIFACT === 'true';

/** Spanish URLs start with this prefix (after the site base path). */
export const ES_PREFIX = '/es';

function browserPrefersSpanish(): boolean {
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  return /^es\b/i.test(list[0] || '');
}

function detect(): Lang {
  if (typeof window === 'undefined') return globalThis.__COJAC_LANG__ === 'es' ? 'es' : 'en';
  if (isArtifactBuild) {
    // The artifact preview has no real URLs: remember the choice, else follow the browser.
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'es' || saved === 'en') return saved;
    } catch {
      /* storage blocked */
    }
    return browserPrefersSpanish() ? 'es' : 'en';
  }
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const path = location.pathname.slice(base.length);
  return /^\/es(\/|$)/.test(path) ? 'es' : 'en';
}

export const lang: Lang = detect();
export const isEs = lang === 'es';

/** Pick the text for the current language. */
export function t(en: string, es: string): string {
  return isEs ? es : en;
}

/** Pick any value for the current language. */
export function pick<T>(en: T, es: T): T {
  return isEs ? es : en;
}

/** Locale for dates and numbers. */
export const dateLocale = isEs ? 'es-BZ' : 'en-GB';

/** Router basename for this language (BrowserRouter / StaticRouter). */
export function routerBasename(): string | undefined {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const b = isEs ? `${base}${ES_PREFIX}` : base;
  return b || undefined;
}

/** Path of a page (as used by the router, e.g. "/flavours") in a given language, without the site base. */
export function pathIn(target: Lang, routerPath: string): string {
  const p = routerPath === '' ? '/' : routerPath;
  if (target === 'en') return p;
  return p === '/' ? `${ES_PREFIX}/` : `${ES_PREFIX}${p}`;
}

/** Remember the visitor's choice (read by the redirect script in every page's <head>). */
export function rememberLang(l: Lang) {
  try {
    localStorage.setItem(LANG_STORAGE_KEY, l);
  } catch {
    /* storage blocked: the choice still applies to this visit */
  }
}

/**
 * Runs first in every pre-rendered page's <head> (inserted by the pre-renderer),
 * before anything is drawn:
 *  - a visitor who chose a language before is sent to that version of the page;
 *  - a first-time visitor whose browser is set to Spanish is sent from an English
 *    page to the Spanish one.
 * A Spanish page is never redirected because of browser settings alone, so shared
 * /es/ links and search engines always see the Spanish page.
 */
export const LANG_REDIRECT_SCRIPT = `(function(){try{var k='${LANG_STORAGE_KEY}',s=localStorage.getItem(k),l=location,p=l.pathname,es=/^\\/es(\\/|$)/.test(p);if(!s){var n=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(/^es\\b/i.test(n))s='es';}if(s==='es'&&!es){l.replace('/es'+(p==='/'?'/':p)+l.search+l.hash);}else if(s==='en'&&es&&localStorage.getItem(k)==='en'){l.replace((p.replace(/^\\/es/,'')||'/')+l.search+l.hash);}}catch(e){}})();`;

/** A router path ("/flavours") as a site-relative URL path in the current language ("/es/flavours"). */
export function localPath(routerPath: string): string {
  return pathIn(lang, routerPath);
}
