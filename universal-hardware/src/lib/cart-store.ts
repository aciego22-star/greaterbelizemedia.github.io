/**
 * Shopping cart — browser-only, tab-scoped.
 *
 * Holds product ids, colours and quantities, plus "requested" items a
 * customer could not find on the site (just the name they typed, up to 80
 * characters, priced later by the branch). No personal details. Kept in tab
 * storage (see tab-storage.ts); nothing here makes a network request.
 * Prices are always looked up from src/data/shop.ts, never stored.
 */
import { PRODUCT_BY_ID, type ShopProduct } from '../data/shop';
import { tabGet, tabSet } from './tab-storage';

export interface ProductLine {
  kind?: undefined;
  id: string;
  colour?: string;
  qty: number;
}
/** An item the customer searched for but the site does not list: the branch confirms price and availability. */
export interface RequestLine {
  kind: 'request';
  text: string;
  qty: number;
}
export type CartLine = ProductLine | RequestLine;
export const isRequest = (l: CartLine): l is RequestLine => l.kind === 'request';
export const MAX_REQUEST_LEN = 80;
const cleanRequest = (t: string) => t.replace(/\s+/g, ' ').trim().slice(0, MAX_REQUEST_LEN);

export const MAX_QTY = 9;
const KEY = 'uhc.cart.v1';
export const CART_EVENT = 'uhc:cart-change';

let memory: CartLine[] | null = null;

export const lineKey = (l: CartLine) => (isRequest(l) ? `request|${l.text.toLowerCase()}` : `${l.id}|${l.colour ?? ''}`);

function valid(l: unknown): l is CartLine {
  if (!l || typeof l !== 'object') return false;
  if ((l as CartLine).kind === 'request') {
    const { text, qty } = l as RequestLine;
    return typeof text === 'string' && cleanRequest(text).length >= 2 && Number.isInteger(qty) && qty >= 1 && qty <= MAX_QTY;
  }
  const { id, colour, qty } = l as ProductLine;
  const p = PRODUCT_BY_ID[id];
  if (!p || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) return false;
  if (colour === undefined) return !p.colours || p.colours.length < 2;
  return !!p.colours?.includes(colour);
}

export function getCart(): CartLine[] {
  if (memory) return memory;
  let lines: CartLine[] = [];
  const raw = tabGet(KEY);
  if (raw) {
    try {
      const p = JSON.parse(raw);
      if (Array.isArray(p))
        lines = p.filter(valid).map((l: CartLine) => (isRequest(l) ? { kind: 'request' as const, text: cleanRequest(l.text), qty: l.qty } : { id: l.id, colour: l.colour, qty: l.qty }));
    } catch {
      lines = [];
    }
  }
  memory = lines;
  return lines;
}

function commit(next: CartLine[]) {
  memory = next;
  tabSet(KEY, next.length ? JSON.stringify(next) : null);
  window.dispatchEvent(new CustomEvent(CART_EVENT, { detail: next }));
}

export function subscribeCart(fn: (lines: CartLine[]) => void): () => void {
  const h = () => fn(getCart());
  window.addEventListener(CART_EVENT, h);
  return () => window.removeEventListener(CART_EVENT, h);
}

/** Colour to use when none was picked: the only one listed, if there is just one. */
export function defaultColour(p: ShopProduct): string | undefined {
  return p.colours?.length === 1 ? p.colours[0] : undefined;
}

export function addToCart(id: string, qty = 1, colour?: string): boolean {
  const p = PRODUCT_BY_ID[id];
  if (!p) return false;
  const line: ProductLine = { id, colour: colour ?? defaultColour(p), qty: Math.max(1, Math.min(MAX_QTY, Math.round(qty))) };
  if (p.colours && p.colours.length > 1 && !line.colour) return false;
  if (!valid(line)) return false;
  const lines = getCart();
  const k = lineKey(line);
  const existing = lines.find((l) => lineKey(l) === k);
  commit(
    existing
      ? lines.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l))
      : [...lines, line],
  );
  return true;
}

/** Add an item the site does not list, as typed by the customer. Returns false if the text is too short. */
export function addRequest(text: string, qty = 1): boolean {
  const line: RequestLine = { kind: 'request', text: cleanRequest(text), qty: Math.max(1, Math.min(MAX_QTY, Math.round(qty))) };
  if (!valid(line)) return false;
  const lines = getCart();
  const k = lineKey(line);
  const existing = lines.find((l) => lineKey(l) === k);
  commit(existing ? lines.map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(MAX_QTY, l.qty + line.qty) } : l)) : [...lines, line]);
  return true;
}

export function setQty(line: CartLine, qty: number) {
  const k = lineKey(line);
  if (qty < 1) return removeLine(line);
  commit(getCart().map((l) => (lineKey(l) === k ? { ...l, qty: Math.min(MAX_QTY, Math.round(qty)) } : l)));
}

export function removeLine(line: CartLine) {
  const k = lineKey(line);
  commit(getCart().filter((l) => lineKey(l) !== k));
}

export function clearCart() {
  commit([]);
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.qty, 0);

/** Requested items have no price until the branch confirms one, so they count as 0 here. */
export const lineTotal = (l: CartLine) => (isRequest(l) ? 0 : (PRODUCT_BY_ID[l.id]?.price ?? 0) * l.qty);

export const hasPriced = (lines: CartLine[]) => lines.some((l) => !isRequest(l));
export const hasRequests = (lines: CartLine[]) => lines.some(isRequest);

export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + lineTotal(l), 0);
