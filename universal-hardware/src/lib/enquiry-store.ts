/**
 * Enquiry Summary store — browser-only, session-scoped.
 *
 * Privacy model for the concept demo:
 *  - Nothing in this module performs any network request.
 *  - State lives in sessionStorage, which the browser clears when the tab
 *    or window is closed. No personal details are requested.
 *  - The only way information leaves the page is the visitor copying the
 *    summary text to their own clipboard.
 */
import { CATEGORY_BY_SLUG } from '../data/categories';
import { BRANCH_BY_ID, type BranchId } from '../data/branches';

export interface EnquiryItem {
  slug: string;
  /** Optional context, e.g. "Home backup power" from the product finder. */
  context?: string;
}

export interface EnquiryDraft {
  items: EnquiryItem[];
  intendedUse: string;
  preferredBranch: BranchId | '';
  notes: string;
}

const KEY = 'uhc.enquiry.v1';
const BRANCH_KEY = 'uhc.branch.v1';
export const CHANGE_EVENT = 'uhc:enquiry-change';
export const BRANCH_EVENT = 'uhc:branch-change';

const empty = (): EnquiryDraft => ({ items: [], intendedUse: '', preferredBranch: '', notes: '' });

function safeGet(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function safeSet(key: string, value: string | null) {
  try {
    if (value === null) window.sessionStorage.removeItem(key);
    else window.sessionStorage.setItem(key, value);
  } catch {
    /* storage unavailable (private mode) — state stays in memory */
  }
}

let memory: EnquiryDraft | null = null;
let memoryBranch: BranchId | '' | null = null;

function isBranch(v: unknown): v is BranchId {
  return v === 'spanish-lookout' || v === 'belize-city';
}

export function getDraft(): EnquiryDraft {
  if (memory) return memory;
  const raw = typeof window === 'undefined' ? null : safeGet(KEY);
  let d = empty();
  if (raw) {
    try {
      const p = JSON.parse(raw);
      d = {
        items: Array.isArray(p.items)
          ? p.items
              .filter((i: EnquiryItem) => i && typeof i.slug === 'string' && CATEGORY_BY_SLUG[i.slug])
              .map((i: EnquiryItem) => ({ slug: i.slug, context: typeof i.context === 'string' ? i.context.slice(0, 120) : undefined }))
          : [],
        intendedUse: typeof p.intendedUse === 'string' ? p.intendedUse.slice(0, 200) : '',
        preferredBranch: isBranch(p.preferredBranch) ? p.preferredBranch : '',
        notes: typeof p.notes === 'string' ? p.notes.slice(0, 600) : '',
      };
    } catch {
      d = empty();
    }
  }
  if (!d.preferredBranch) {
    const b = getBranch();
    if (b) d.preferredBranch = b;
  }
  memory = d;
  return d;
}

function commit(next: EnquiryDraft) {
  memory = next;
  safeSet(KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: next }));
}

export function subscribe(fn: (d: EnquiryDraft) => void): () => void {
  const h = () => fn(getDraft());
  window.addEventListener(CHANGE_EVENT, h);
  return () => window.removeEventListener(CHANGE_EVENT, h);
}

export function hasCategory(slug: string): boolean {
  return getDraft().items.some((i) => i.slug === slug);
}

export function addCategory(slug: string, context?: string) {
  if (!CATEGORY_BY_SLUG[slug]) return;
  const d = getDraft();
  const existing = d.items.find((i) => i.slug === slug);
  let items: EnquiryItem[];
  if (existing) {
    items = d.items.map((i) => (i.slug === slug && context ? { ...i, context } : i));
  } else {
    items = [...d.items, { slug, context }];
  }
  commit({ ...d, items });
}

export function removeCategory(slug: string) {
  const d = getDraft();
  commit({ ...d, items: d.items.filter((i) => i.slug !== slug) });
}

export function toggleCategory(slug: string, context?: string): boolean {
  if (hasCategory(slug)) {
    removeCategory(slug);
    return false;
  }
  addCategory(slug, context);
  return true;
}

export function setField<K extends 'intendedUse' | 'notes' | 'preferredBranch'>(key: K, value: EnquiryDraft[K]) {
  const d = getDraft();
  commit({ ...d, [key]: value });
  if (key === 'preferredBranch' && (isBranch(value) || value === '')) setBranch(value as BranchId | '', false);
}

export function resetDraft() {
  commit(empty());
}

/* ---- Preferred branch (session only) ---- */
export function getBranch(): BranchId | '' {
  if (memoryBranch !== null) return memoryBranch;
  const raw = typeof window === 'undefined' ? null : safeGet(BRANCH_KEY);
  memoryBranch = isBranch(raw) ? raw : '';
  return memoryBranch;
}

export function setBranch(id: BranchId | '', syncDraft = true) {
  memoryBranch = id;
  safeSet(BRANCH_KEY, id || null);
  window.dispatchEvent(new CustomEvent(BRANCH_EVENT, { detail: id }));
  if (syncDraft) {
    const d = getDraft();
    if (d.preferredBranch !== id) commit({ ...d, preferredBranch: id });
  }
}

export function subscribeBranch(fn: (id: BranchId | '') => void): () => void {
  const h = () => fn(getBranch());
  window.addEventListener(BRANCH_EVENT, h);
  return () => window.removeEventListener(BRANCH_EVENT, h);
}

/* ---- Plain-text summary ---- */
export function buildSummary(d: EnquiryDraft): string {
  const lines: string[] = [];
  lines.push('PRODUCT ENQUIRY SUMMARY');
  lines.push('Prepared with an independent Universal Hardware website concept (Austere Automations).');
  lines.push('Concept demonstration only. Nothing has been sent or submitted.');
  lines.push('');
  if (d.items.length) {
    lines.push('Categories of interest:');
    for (const i of d.items) {
      const c = CATEGORY_BY_SLUG[i.slug];
      if (!c) continue;
      lines.push(`  • ${c.name}${i.context ? ` — ${i.context}` : ''}`);
    }
  } else {
    lines.push('Categories of interest: (none selected yet)');
  }
  if (d.intendedUse.trim()) lines.push(`Intended use: ${d.intendedUse.trim()}`);
  if (d.preferredBranch) {
    const b = BRANCH_BY_ID[d.preferredBranch];
    lines.push(`Preferred branch: ${b.name} — ${b.addressLines.join(', ')}`);
  } else {
    lines.push('Preferred branch: not chosen');
  }
  if (d.notes.trim()) lines.push(`Notes: ${d.notes.trim()}`);
  lines.push('');
  lines.push('Questions to ask the branch:');
  lines.push('  • Which options suit this use, and what is currently available?');
  lines.push('  • Current pricing, and any parts, service or installation considerations.');
  lines.push('');
  lines.push("Contact details are listed on Universal Hardware's official website: https://universalhardware.bz/");
  return lines.join('\n');
}

/** Copy text to clipboard with a fallback for older browsers. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/* ---- UI events used across islands ---- */
export const OPEN_ENQUIRY = 'uhc:open-enquiry';
export const OPEN_GUIDE = 'uhc:open-guide';
export const TOAST = 'uhc:toast';

// Requests made before the global UI island has hydrated are queued and
// replayed by GlobalUI on mount, so an early tap is never lost.
type Queued = { type: string; detail?: unknown };
const UI_QUEUE = '__uhcUiQueue';
function send(type: string, detail?: unknown) {
  if (!document.documentElement.classList.contains('ui-ready')) {
    const w = window as unknown as Record<string, Queued[]>;
    (w[UI_QUEUE] ||= []).push({ type, detail });
    return;
  }
  window.dispatchEvent(new CustomEvent(type, { detail }));
}
export function flushUiQueue() {
  const w = window as unknown as Record<string, Queued[] | undefined>;
  const q = w[UI_QUEUE];
  w[UI_QUEUE] = [];
  q?.forEach((e) => window.dispatchEvent(new CustomEvent(e.type, { detail: e.detail })));
}

export function openEnquiry() {
  send(OPEN_ENQUIRY);
}
export function openGuide(prompt?: string) {
  send(OPEN_GUIDE, { prompt });
}
export function toast(message: string, action?: 'open-enquiry') {
  send(TOAST, { message, action });
}
