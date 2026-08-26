import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BasketLine } from '../data/types';
import { productById } from '../lib/catalog';
import { summarizeBasket, type BasketSummary } from '../lib/basket';

const STORAGE_KEY = 'cosmic-pharmacy-basket-v1';

interface BasketContextValue {
  lines: BasketLine[];
  summary: BasketSummary;
  isOpen: boolean;
  openBasket: () => void;
  closeBasket: () => void;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const BasketContext = createContext<BasketContextValue | null>(null);

function loadStoredLines(): BasketLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BasketLine[];
    if (!Array.isArray(parsed)) return [];
    // Drop lines for products that no longer exist in the catalogue.
    return parsed.filter(
      (l) => l && typeof l.productId === 'string' && productById.has(l.productId) && Number.isInteger(l.quantity) && l.quantity > 0
    );
  } catch {
    return [];
  }
}

export function BasketProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<BasketLine[]>(loadStoredLines);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Private-mode or blocked storage: the basket still works for this visit.
    }
  }, [lines]);

  const add = useCallback((productId: string, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === productId);
      if (existing) {
        return prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(l.quantity + quantity, 99) } : l));
      }
      return [...prev, { productId, quantity: Math.min(quantity, 99) }];
    });
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity: Math.min(quantity, 99) } : l))
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openBasket = useCallback(() => setIsOpen(true), []);
  const closeBasket = useCallback(() => setIsOpen(false), []);

  const summary = useMemo(() => summarizeBasket(lines, (id) => productById.get(id)), [lines]);

  const value = useMemo(
    () => ({ lines, summary, isOpen, openBasket, closeBasket, add, setQuantity, remove, clear }),
    [lines, summary, isOpen, openBasket, closeBasket, add, setQuantity, remove, clear]
  );

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>;
}

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext);
  if (!ctx) throw new Error('useBasket must be used inside BasketProvider');
  return ctx;
}
