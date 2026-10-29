/**
 * Shopping cart — browser-only, tab-scoped.
 *
 * Holds product ids, colours and quantities only (no personal details), in
 * tab storage (see tab-storage.ts). Nothing here makes a network request.
 * Prices are always looked up from src/data/shop.ts, never stored.
 */
import { PRODUCT_BY_ID, type ShopProduct } from '../data/shop';
import { tabGet, tabSet } from './tab-storage';

export interface CartLine {
  id: string;
  colour?: string;
  qty: number;
}

export const MAX_QTY = 9;
const KEY = 'uhc.cart.v1';
export const CART_EVENT = 'uhc:cart-change';

let memory: CartLine[] | null = null;

const lineKey = (l: { id: string; colour?: string }) => `${l.id}|${l.colour ?? ''}`;

function valid(l: unknown): l is CartLine {
  if (!l || typeof l !== 'object') return false;
  const { id, colour, qty } = l as CartLine;
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
      if (Array.isArray(p)) lines = p.filter(valid).map(({ id, colour, qty }) => ({ id, colour, qty }));
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
  const line: CartLine = { id, colour: colour ?? defaultColour(p), qty: Math.max(1, Math.min(MAX_QTY, Math.round(qty))) };
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

export const lineTotal = (l: CartLine) => (PRODUCT_BY_ID[l.id]?.price ?? 0) * l.qty;

export const cartTotal = (lines: CartLine[]) => lines.reduce((n, l) => n + lineTotal(l), 0);
