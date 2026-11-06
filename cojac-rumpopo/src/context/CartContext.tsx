import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import type { CartLine, OrderDetails } from '../types';
import { getCatalogue } from '../content/catalogue';
import { clampQuantity, lineKey, MAX_NOTE_LENGTH, resolveLines, computeTotals, type ResolvedLine, type Totals } from '../lib/order';

const STORAGE_KEY = 'cojac-order-request-v1';

type Action =
  | { type: 'add'; productId: string; variantId: string | null; quantity: number; note?: string }
  | { type: 'setQty'; key: string; quantity: number }
  | { type: 'setNote'; key: string; note: string }
  | { type: 'remove'; key: string }
  | { type: 'clear' };

function variantOf(productId: string, variantId: string | null) {
  const p = getCatalogue().find((x) => x.id === productId);
  return p?.variants.find((v) => v.variantId === variantId) ?? null;
}

function reducer(state: CartLine[], a: Action): CartLine[] {
  switch (a.type) {
    case 'add': {
      const key = lineKey(a.productId, a.variantId);
      const v = variantOf(a.productId, a.variantId);
      const existing = state.find((l) => l.key === key);
      const note = (a.note ?? '').slice(0, MAX_NOTE_LENGTH);
      if (existing) {
        return state.map((l) =>
          l.key === key ? { ...l, quantity: clampQuantity(l.quantity + a.quantity, v), note: note || l.note } : l,
        );
      }
      return [...state, { key, productId: a.productId, variantId: a.variantId, quantity: clampQuantity(a.quantity, v), note }];
    }
    case 'setQty':
      return state.map((l) =>
        l.key === a.key ? { ...l, quantity: clampQuantity(a.quantity, variantOf(l.productId, l.variantId)) } : l,
      );
    case 'setNote':
      return state.map((l) => (l.key === a.key ? { ...l, note: a.note.slice(0, MAX_NOTE_LENGTH) } : l));
    case 'remove':
      return state.filter((l) => l.key !== a.key);
    case 'clear':
      return [];
  }
}

const emptyDetails: OrderDetails = { name: '', fulfilment: '', area: '', preferredDate: '', notes: '' };

function load(): { lines: CartLine[]; details: OrderDetails } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lines: [], details: emptyDetails };
    const parsed = JSON.parse(raw);
    const lines: CartLine[] = Array.isArray(parsed.lines) ? parsed.lines : [];
    // Drop anything no longer in the catalogue (e.g. a flavour switched off next season).
    const valid = resolveLines(lines, getCatalogue()).map((r) => r.line);
    return { lines: valid, details: { ...emptyDetails, ...(parsed.details ?? {}) } };
  } catch {
    return { lines: [], details: emptyDetails };
  }
}

interface CartCtx {
  lines: CartLine[];
  resolved: ResolvedLine[];
  totals: Totals;
  details: OrderDetails;
  setDetails: (patch: Partial<OrderDetails>) => void;
  add: (productId: string, variantId: string | null, quantity: number, note?: string) => void;
  setQty: (key: string, quantity: number) => void;
  setNote: (key: string, note: string) => void;
  remove: (key: string) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Short-lived announcement for screen readers / toast. */
  toast: string;
}

const Ctx = createContext<CartCtx | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const initial = useRef(load());
  const [lines, dispatch] = useReducer(reducer, initial.current.lines);
  const [details, setDetailsState] = useState<OrderDetails>(initial.current.details);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef<number>();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, details }));
    } catch {
      /* private mode — cart still works for this visit */
    }
  }, [lines, details]);

  const announce = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(''), 3200);
  }, []);

  const value = useMemo<CartCtx>(() => {
    const resolved = resolveLines(lines, getCatalogue());
    return {
      lines,
      resolved,
      totals: computeTotals(resolved),
      details,
      setDetails: (patch) => setDetailsState((d) => ({ ...d, ...patch })),
      add: (productId, variantId, quantity, note) => {
        dispatch({ type: 'add', productId, variantId, quantity, note });
        const p = getCatalogue().find((x) => x.id === productId);
        announce(`${p?.name ?? 'Item'} added to your order`);
      },
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      setNote: (key, note) => dispatch({ type: 'setNote', key, note }),
      remove: (key) => {
        dispatch({ type: 'remove', key });
        announce('Item removed from your order');
      },
      clear: () => {
        dispatch({ type: 'clear' });
        announce('Your order request was cleared');
      },
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      toast,
    };
  }, [lines, details, drawerOpen, toast, announce]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}
