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
const delivery: FulfilmentOption = { id: 'delivery', label: 'Delivery', messageLabel: 'Delivery (Belize City)', description: '', enabled: true, asksForArea: true, chargeLabel: 'Delivery', feeBZD: 5 };
const pickup: FulfilmentOption = { id: 'pickup', label: 'Pickup', messageLabel: 'Pickup', description: '', enabled: true, asksForArea: false, chargeLabel: 'Pickup', feeBZD: 0 };
const shipping: FulfilmentOption = { id: 'shipping', label: 'Shipping', messageLabel: 'Shipping (out of district)', description: '', enabled: true, asksForArea: true, chargeLabel: 'Shipping', feeBZD: null };
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
    expect(subtotalLabel(t)).toContain('plus items priced by Cojac’s');
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
  const full = () =>
    buildOrderMessage({
      brandName: "Cojac's",
      resolved: resolveLines([line('a', 'big', 2, 'gift'), line('c', 'v', 1)], catalogue),
      details: { ...details, name: 'Ana Smith', area: '12 Cleghorn St, blue house', notes: 'Call after 5', preferredDate: '2026-12-20' },
      fulfilment: delivery,
    });

  it('is short: items, delivery, total, name, address', () => {
    const msg = full();
    expect(msg).toContain("Hi Cojac's! *Order request:*");
    expect(msg).toContain('2 × Flavour A (Test 1L): BZD $20.00');
    expect(msg).toContain('Note: gift');
    expect(msg).toContain('1 × Flavour C (Test 500ml): price TBC');
    expect(msg).toContain('Delivery (Belize City): BZD $5.00');
    expect(msg).toContain('Name: Ana Smith');
    expect(msg).toContain('Address: 12 Cleghorn St, blue house');
    expect(msg).toContain('Date: Sun, 20 December 2026');
    expect(msg).toContain('Notes: Call after 5');
    expect(msg).toContain('Please confirm availability and payment. Thank you!');
    expect(msg.split('\n').length).toBeLessThanOrEqual(15);
  });
  it('contains no dashes and never claims the order is confirmed', () => {
    const msg = full();
    expect(msg).not.toMatch(/[—–]/);
    expect(msg).not.toMatch(/^- /m);
    expect(msg).not.toMatch(/order confirmed|order placed|payment received/i);
  });
  it('omits empty optional fields', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved: resolveLines([line('a', 'big', 1)], catalogue), details, fulfilment: delivery });
    expect(msg).not.toContain('Name:');
    expect(msg).not.toContain('Address:');
    expect(msg).not.toContain('Date:');
    expect(msg).not.toContain('Notes:');
  });
  it('delivery at BZD $5 gives a total when every price is approved', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved: resolveLines([line('a', 'big', 2)], catalogue), details, fulfilment: delivery });
    expect(msg).toContain('*Total: BZD $25.00*');
  });
  it('never invents a total when a price or the charge is unknown', () => {
    const unpriced = buildOrderMessage({ brandName: 'X', resolved: resolveLines([line('a', 'big', 1), line('b', null, 1)], catalogue), details, fulfilment: delivery });
    expect(unpriced).not.toContain('Total:');
    expect(unpriced).toContain('*Subtotal: BZD $10.00 plus items priced by Cojac’s*');
  });
  it('pickup is free with no address; shipping lists the address and an unconfirmed charge', () => {
    const r = resolveLines([line('a', 'big', 2)], catalogue);
    const p = buildOrderMessage({ brandName: 'X', resolved: r, details: { ...details, fulfilment: 'pickup', area: 'ignored' }, fulfilment: pickup });
    expect(p).toContain('Pickup: free');
    expect(p).not.toContain('ignored');
    expect(p).toContain('*Total: BZD $20.00*');
    const sh = buildOrderMessage({ brandName: 'X', resolved: r, details: { ...details, fulfilment: 'shipping', area: 'Main St, Orange Walk Town, Orange Walk' }, fulfilment: shipping });
    expect(sh).toContain('Shipping (out of district): charge TBC');
    expect(sh).toContain('Address: Main St, Orange Walk Town, Orange Walk');
    expect(sh).toContain('*Subtotal: BZD $20.00*');
    expect(sh).not.toContain('Total: BZD');
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
