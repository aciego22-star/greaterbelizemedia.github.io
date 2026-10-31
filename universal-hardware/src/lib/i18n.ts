/**
 * English / Spanish switch.
 *
 * Pages are built in English. When Spanish is chosen, the Spanish dictionary
 * (src/i18n/es.ts, loaded on demand) is applied in place: text nodes, the
 * alt / aria-label / placeholder / title attributes and the document title.
 * A MutationObserver translates whatever the islands render later, so the
 * cart, checkout, finder and search follow along. Switching back restores the
 * original English. The choice lives in tab storage; on a first visit a
 * Spanish browser language selects Spanish.
 *
 * Anything inside [data-i18n-skip] is left alone (the language button itself,
 * and Product Guide replies, which the Guide writes in the chosen language).
 */
import { tabGet, tabSet } from './tab-storage';

export type SiteLang = 'en' | 'es';
export const LANG_KEY = 'uhc.lang.v1';
export { LANG_EVENT } from './site-state';
import { LANG_EVENT } from './site-state';

const ATTRS = ['alt', 'aria-label', 'placeholder', 'title'] as const;
const SKIP = 'script, style, noscript, template, [data-i18n-skip]';
const html = () => document.documentElement;

export function getLang(): SiteLang {
  const stored = tabGet(LANG_KEY);
  if (stored === 'en' || stored === 'es') return stored;
  return (navigator.language || '').toLowerCase().startsWith('es') ? 'es' : 'en';
}

type Translate = (text: string) => string | null;
let translate: Translate | null = null;
let current: SiteLang = 'en';
let observer: MutationObserver | null = null;

// Originals and our own last output, so islands' later English updates are
// told apart from the translations we wrote.
const origText = new WeakMap<Text, string>();
const lastText = new WeakMap<Text, string>();
const origAttr = new WeakMap<Element, Record<string, string>>();
const touched = new Set<Text | Element>();
let origTitle = '';

const skipped = (el: Element | null) => !el || !!el.closest(SKIP);

function doText(n: Text) {
  if (!translate || skipped(n.parentElement)) return;
  if (lastText.get(n) === n.data) return; // our own write
  const out = translate(n.data);
  if (out === null) return;
  const m = n.data.match(/^(\s*)[\s\S]*?(\s*)$/)!;
  const next = m[1] + out + m[2];
  origText.set(n, n.data);
  lastText.set(n, next);
  touched.add(n);
  if (n.data !== next) n.data = next;
}

function doAttrs(el: Element) {
  if (!translate || skipped(el)) return;
  for (const a of ATTRS) {
    const v = el.getAttribute(a);
    if (!v) continue;
    const saved = origAttr.get(el) ?? {};
    if (saved[`~${a}`] === v) continue; // our own write
    const out = translate(v);
    if (out === null) continue;
    saved[a] = v;
    saved[`~${a}`] = out;
    origAttr.set(el, saved);
    touched.add(el);
    if (out !== v) el.setAttribute(a, out);
  }
}

function walk(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) return doText(node as Text);
  if (node.nodeType !== Node.ELEMENT_NODE) return;
  const el = node as Element;
  if (skipped(el)) return;
  doAttrs(el);
  const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    if (n.nodeType === Node.TEXT_NODE) doText(n as Text);
    else doAttrs(n as Element);
  }
}

function translateTitle() {
  if (!translate) return;
  const t = translate(document.title);
  if (t !== null && t !== document.title) {
    origTitle = document.title;
    document.title = t;
  }
}

function restore() {
  observer?.disconnect();
  observer = null;
  for (const n of touched) {
    if (n.nodeType === Node.TEXT_NODE) {
      const t = n as Text;
      const o = origText.get(t);
      if (o !== undefined && t.data === lastText.get(t)) t.data = o;
      lastText.delete(t);
    } else {
      const el = n as Element;
      const saved = origAttr.get(el);
      if (!saved) continue;
      for (const a of ATTRS) if (saved[a] !== undefined && el.getAttribute(a) === saved[`~${a}`]) el.setAttribute(a, saved[a]);
      origAttr.delete(el);
    }
  }
  touched.clear();
  if (origTitle) document.title = origTitle;
  origTitle = '';
}

async function loadSpanish(): Promise<Translate> {
  const { translateEs } = await import('../i18n/es');
  return translateEs;
}

function markDone() {
  html().classList.add('i18n-done');
  html().classList.remove('i18n-pending');
}

export async function applyLang(lang: SiteLang) {
  current = lang;
  html().lang = lang;
  html().dataset.lang = lang;
  if (lang === 'es') {
    html().classList.remove('i18n-done');
    translate ??= await loadSpanish();
    if (current !== 'es') return; // switched back while loading
    walk(document.body);
    translateTitle();
    observer ??= new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === 'characterData') doText(r.target as Text);
        else if (r.type === 'attributes') doAttrs(r.target as Element);
        else r.addedNodes.forEach(walk);
      }
    });
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...ATTRS] });
  } else {
    restore();
  }
  renderToggles();
  markDone();
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: lang }));
}

export function setLang(lang: SiteLang) {
  tabSet(LANG_KEY, lang);
  void applyLang(lang);
}

export const currentLang = () => current;

function renderToggles() {
  document.querySelectorAll<HTMLButtonElement>('[data-lang-toggle]').forEach((b) => {
    const es = current === 'es';
    b.dataset.active = current;
    b.setAttribute('lang', es ? 'en' : 'es');
    b.setAttribute('aria-label', es ? 'View the site in English' : 'Ver el sitio en español');
  });
}

/** Wire the header buttons and apply the stored or detected language. */
export function initLang() {
  document.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('[data-lang-toggle]');
    if (b) setLang(current === 'es' ? 'en' : 'es');
  });
  const lang = getLang();
  current = lang;
  renderToggles();
  if (lang === 'es') void applyLang('es');
  else markDone();
}
