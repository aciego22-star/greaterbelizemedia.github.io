/**
 * Small browser-only state shared across the page: the preferred branch and
 * the UI event bus (Product Guide, toasts). Nothing here makes a network
 * request; the branch lives in tab storage (see tab-storage.ts).
 */
import type { BranchId } from '../data/branches';
import { tabGet, tabSet } from './tab-storage';

const BRANCH_KEY = 'uhc.branch.v1';
export const BRANCH_EVENT = 'uhc:branch-change';

const isBranch = (v: unknown): v is BranchId => v === 'spanish-lookout' || v === 'belize-city';

/* ---- Preferred branch ---- */
let memoryBranch: BranchId | '' | null = null;

export function getBranch(): BranchId | '' {
  if (memoryBranch !== null) return memoryBranch;
  const raw = tabGet(BRANCH_KEY);
  memoryBranch = isBranch(raw) ? raw : '';
  return memoryBranch;
}

export function setBranch(id: BranchId | '') {
  memoryBranch = id;
  tabSet(BRANCH_KEY, id || null);
  window.dispatchEvent(new CustomEvent(BRANCH_EVENT, { detail: id }));
}

export function subscribeBranch(fn: (id: BranchId | '') => void): () => void {
  const h = () => fn(getBranch());
  window.addEventListener(BRANCH_EVENT, h);
  return () => window.removeEventListener(BRANCH_EVENT, h);
}

/* ---- UI events used across islands ---- */
export const OPEN_GUIDE = 'uhc:open-guide';
export const LANG_EVENT = 'uhc:lang-change';
export const TOAST = 'uhc:toast';
export type ToastAction = 'open-cart';

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

export function openGuide(prompt?: string) {
  send(OPEN_GUIDE, { prompt });
}
export function toast(message: string, action?: ToastAction) {
  send(TOAST, { message, action });
}
