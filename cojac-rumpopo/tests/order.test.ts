import { describe, expect, it } from 'vitest';
import {
  buildOrderMessage,
  buildWhatsAppUrl,
  clampQuantity,
  computeTotals,
  normaliseWhatsAppNumber,
  resolveDestination,
  resolveLines,
  subtotalLabel,
  lineKey,
} from '../src/lib/order';
import { getSeasonState, isAcceptingOrders, belizeDateString } from '../src/lib/season';
import type { CartLine, FulfilmentOption, Product } from '../src/types';

const base: Omit<Product, 'id' | 'slug' | 'name' | 'variants'> = {
  subtitle: '',
  description: '',
  images: [],
  seasonalCollection: 'classic',
  active: true,
  highlighted: false,
  confirmedThisSeason: true,
  containsAlcohol: true,
  alcoholInformation: null,
  allergens: null,
  ingredientsDisclosure: null,
  dietaryLabel: null,
  leadTime: null,
  collectionOrDeliveryOptions: null,
  palette: { cream: '#fff', deep: '#eee', accent: '#000' },
};
// Test fixtures only — not real Cojac's prices.
const catalogue: Product[] = [
  { ...base, id: 'a', slug: 'a', name: 'Flavour A', variants: [{ variantId: 'big', bottleSize: 'Test 1L', priceBZD: 10, availability: 'available', quantityLimit: 5 }] },
  { ...base, id: 'b', slug: 'b', name: 'Flavour B', variants: [] },
  { ...base, id: 'c', slug: 'c', name: 'Flavour C', variants: [{ variantId: 'v', bottleSize: 'Test 500ml', priceBZD: null, availability: 'ask' }] },
];
const line = (productId: string, variantId: string | null, quantity: number, note = ''): CartLine => ({
  key: lineKey(productId, variantId),
  productId,
  variantId,
  quantity,
  note,
});
const delivery: FulfilmentOption = { id: 'delivery', label: 'Delivery in Belize City', description: '', enabled: true, asksForArea: true, feeBZD: null };
const details = { name: '', fulfilment: 'delivery' as const, area: '', preferredDate: '', notes: '' };

describe('totals', () => {
  it('sums priced lines', () => {
    const r = resolveLines([line('a', 'big', 3)], catalogue);
    const t = computeTotals(r);
    expect(t.pricedSubtotal).toBe(30);
    expect(t.allPriced).toBe(true);
    expect(subtotalLabel(t)).toBe('BZD $30.00');
  });
  it('never invents a total when any price is unknown', () => {
    const t = computeTotals(resolveLines([line('a', 'big', 1), line('b', null, 2)], catalogue));
    expect(t.allPriced).toBe(false);
    expect(subtotalLabel(t)).toContain('to be confirmed');
    expect(subtotalLabel(computeTotals(resolveLines([line('b', null, 2)], catalogue)))).toBe('To be confirmed by Cojac’s');
  });
  it('drops lines whose product or variant no longer exists', () => {
    const r = resolveLines([line('zzz', null, 1), line('a', 'gone', 1), line('b', null, 1)], catalogue);
    expect(r.map((x) => x.product.id)).toEqual(['b']);
  });
  it('counts items', () => {
    expect(computeTotals(resolveLines([line('a', 'big', 2), line('b', null, 4)], catalogue)).itemCount).toBe(6);
  });
});

describe('quantity limits', () => {
  it('clamps to 1..99 and variant limits', () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-4)).toBe(1);
    expect(clampQuantity(5000)).toBe(99);
    expect(clampQuantity(NaN)).toBe(1);
    expect(clampQuantity(2.7)).toBe(2);
    expect(clampQuantity(9, catalogue[0].variants[0])).toBe(5);
  });
});

describe('WhatsApp message', () => {
  it('contains business name, items, sizes, quantities and the confirmation notice', () => {
    const msg = buildOrderMessage({
      brandName: "Cojac's Sumptuous Rumpopo",
      resolved: resolveLines([line('a', 'big', 2, 'gift'), line('b', null, 1)], catalogue),
      details: { ...details, name: 'Ana', area: 'Kings Park', notes: 'Call after 5', preferredDate: '2026-12-20' },
      fulfilment: delivery,
    });
    expect(msg).toContain("Hello Cojac's Sumptuous Rumpopo!");
    expect(msg).toContain('- Flavour A — Test 1L × 2 — BZD $20.00');
    expect(msg).toContain('Note: gift');
    expect(msg).toContain('- Flavour B — Size to be confirmed × 1 — price to be confirmed');
    expect(msg).toContain('*FULFILMENT:* Delivery in Belize City');
    expect(msg).toContain('*DELIVERY/SHIPPING FEE:* To be confirmed by Cojac’s');
    expect(msg).toContain('*AREA:* Kings Park');
    expect(msg).toContain('*PREFERRED DATE:* Sun, 20 December 2026');
    expect(msg).toContain('*NAME:* Ana');
    expect(msg).toContain('*NOTES:* Call after 5');
    expect(msg).toContain('Please confirm availability, final price, payment arrangements and fulfilment details.');
    expect(msg).not.toMatch(/ESTIMATED TOTAL/);
    expect(msg).not.toMatch(/confirmed order|order placed|payment received/i);
  });
  it('omits optional fields and says Flexible when no date', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved: resolveLines([line('b', null, 1)], catalogue), details, fulfilment: delivery });
    expect(msg).toContain('*PREFERRED DATE:* Flexible');
    expect(msg).not.toContain('*NAME:*');
    expect(msg).not.toContain('*AREA:*');
  });
  it('shows an estimated total only when every price and the fee are approved', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved: resolveLines([line('a', 'big', 2)], catalogue), details, fulfilment: { ...delivery, feeBZD: 5 } });
    expect(msg).toContain('*ESTIMATED TOTAL:* BZD $25.00 (before confirmation)');
  });
  it('encodes safely into a wa.me link, including long messages and special characters', () => {
    const lines = Array.from({ length: 3 }, (_, i) => line(['a', 'b', 'c'][i], ['big', null, 'v'][i], 99, 'Note & "quotes" #hash ? ünïcødé 🎄'));
    const msg = buildOrderMessage({ brandName: "Cojac's", resolved: resolveLines(lines, catalogue), details: { ...details, notes: 'x'.repeat(800) }, fulfilment: delivery });
    const url = buildWhatsAppUrl('5016000000', msg);
    expect(url.startsWith('https://wa.me/5016000000?text=')).toBe(true);
    expect(decodeURIComponent(url.split('?text=')[1])).toBe(msg);
    expect(url.split('?text=')[1]).not.toMatch(/[ #&"\n?]/);
    expect(msg).toContain('x'.repeat(500));
    expect(msg).not.toContain('x'.repeat(501));
  });
});

describe('destination number', () => {
  it('rejects empty, short or local-format numbers', () => {
    expect(normaliseWhatsAppNumber('')).toBeNull();
    expect(normaliseWhatsAppNumber('12345')).toBeNull();
    expect(normaliseWhatsAppNumber('0601234567')).toBeNull();
    expect(normaliseWhatsAppNumber('+501 600-0000')).toBe('5016000000');
  });
  it('never falls back to a guessed number', () => {
    expect(resolveDestination('', '')).toEqual({ ok: false, reason: 'missing' });
    expect(resolveDestination('abc', '5011112222')).toEqual({ ok: false, reason: 'invalid' });
  });
  it('prefers the official number over a QA number', () => {
    expect(resolveDestination('5016000000', '5011112222')).toEqual({ ok: true, number: '5016000000', source: 'official' });
    expect(resolveDestination('', '5011112222')).toEqual({ ok: true, number: '5011112222', source: 'qa' });
  });
});

describe('season', () => {
  const cfg = { isSeasonOpen: true, acceptOrderRequests: true, seasonOpensOn: '2026-11-01', seasonClosesOn: '2027-01-03' };
  it('uses Belize time (UTC-6)', () => {
    expect(belizeDateString(new Date('2027-01-04T05:59:00Z'))).toBe('2027-01-03');
    expect(belizeDateString(new Date('2027-01-04T06:00:00Z'))).toBe('2027-01-04');
  });
  it('is open through the last day and closed after', () => {
    expect(getSeasonState(cfg, new Date('2026-12-15T12:00:00Z'))).toBe('open');
    expect(getSeasonState(cfg, new Date('2027-01-04T05:00:00Z'))).toBe('open');
    expect(getSeasonState(cfg, new Date('2027-01-04T07:00:00Z'))).toBe('closed');
    expect(getSeasonState(cfg, new Date('2026-10-20T12:00:00Z'))).toBe('upcoming');
  });
  it('respects the manual switches', () => {
    expect(getSeasonState({ ...cfg, isSeasonOpen: false }, new Date('2026-12-15T12:00:00Z'))).toBe('closed');
    expect(isAcceptingOrders({ ...cfg, acceptOrderRequests: false }, new Date('2026-12-15T12:00:00Z'))).toBe(false);
    expect(isAcceptingOrders(cfg, new Date('2026-12-15T12:00:00Z'))).toBe(true);
  });
});
