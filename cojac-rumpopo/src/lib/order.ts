/**
 * Order request logic — pure functions, unit-tested in tests/order.test.ts.
 * Nothing here sends data anywhere: it only prepares the WhatsApp message text.
 */
import type { CartLine, FulfilmentOption, OrderDetails, Product, ProductVariant } from '../types';
import { formatLongDate } from './season';

export const MAX_QTY_PER_LINE = 99;
export const MAX_NOTE_LENGTH = 200;
export const MAX_ORDER_NOTES_LENGTH = 500;
export const UNKNOWN_PRICE = 'To be confirmed by Cojac’s';
export const SIZE_TBC = 'Size to be confirmed';

export function lineKey(productId: string, variantId: string | null): string {
  return `${productId}::${variantId ?? 'tbc'}`;
}

export function formatBZD(amount: number): string {
  return `BZD $${amount.toFixed(2)}`;
}

export function maxQuantityFor(variant: ProductVariant | null): number {
  return Math.max(1, Math.min(MAX_QTY_PER_LINE, variant?.quantityLimit ?? MAX_QTY_PER_LINE));
}

export function clampQuantity(qty: number, variant: ProductVariant | null = null): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(maxQuantityFor(variant), Math.floor(qty)));
}

/** Variants that may be requested (sold-out and coming-soon are excluded). */
export function isOrderable(availability: ProductVariant['availability']): boolean {
  return availability !== 'sold-out' && availability !== 'coming-soon';
}

export interface ResolvedLine {
  line: CartLine;
  product: Product;
  variant: ProductVariant | null;
  sizeLabel: string;
  unitPrice: number | null;
  lineTotal: number | null;
}

export function resolveLines(lines: CartLine[], catalogue: Product[]): ResolvedLine[] {
  const out: ResolvedLine[] = [];
  for (const line of lines) {
    const product = catalogue.find((p) => p.id === line.productId);
    if (!product) continue;
    const variant = line.variantId ? product.variants.find((v) => v.variantId === line.variantId) ?? null : null;
    if (line.variantId && !variant) continue; // variant was removed from the catalogue
    const unitPrice = variant?.priceBZD ?? null;
    out.push({
      line,
      product,
      variant,
      sizeLabel: variant?.bottleSize ?? SIZE_TBC,
      unitPrice,
      lineTotal: unitPrice === null ? null : round2(unitPrice * line.quantity),
    });
  }
  return out;
}

export interface Totals {
  /** Sum of priced lines. */
  pricedSubtotal: number;
  /** True when every line has an approved price. */
  allPriced: boolean;
  /** True when at least one line has an approved price. */
  anyPriced: boolean;
  itemCount: number;
}

export function computeTotals(resolved: ResolvedLine[]): Totals {
  let pricedSubtotal = 0;
  let priced = 0;
  let itemCount = 0;
  for (const r of resolved) {
    itemCount += r.line.quantity;
    if (r.lineTotal !== null) {
      pricedSubtotal += r.lineTotal;
      priced++;
    }
  }
  return {
    pricedSubtotal: round2(pricedSubtotal),
    allPriced: resolved.length > 0 && priced === resolved.length,
    anyPriced: priced > 0,
    itemCount,
  };
}

export function subtotalLabel(t: Totals): string {
  if (t.allPriced) return formatBZD(t.pricedSubtotal);
  if (t.anyPriced) return `${formatBZD(t.pricedSubtotal)} for priced items — remaining items ${UNKNOWN_PRICE.toLowerCase()}`;
  return UNKNOWN_PRICE;
}

export interface MessageInput {
  brandName: string;
  resolved: ResolvedLine[];
  details: OrderDetails;
  fulfilment: FulfilmentOption | undefined;
}

const clean = (s: string, max: number) => s.replace(/\s+/g, ' ').trim().slice(0, max);

export function buildOrderMessage({ brandName, resolved, details, fulfilment }: MessageInput): string {
  const totals = computeTotals(resolved);
  const out: string[] = [];
  out.push(`Hello ${brandName}! I'd like to request an order.`);
  out.push('');
  out.push('*ITEMS*');
  for (const r of resolved) {
    const price = r.lineTotal === null ? 'price to be confirmed' : formatBZD(r.lineTotal);
    out.push(`- ${r.product.name} — ${r.sizeLabel} × ${r.line.quantity} — ${price}`);
    const note = clean(r.line.note, MAX_NOTE_LENGTH);
    if (note) out.push(`   Note: ${note}`);
  }
  out.push('');
  out.push(`*SUBTOTAL:* ${subtotalLabel(totals)}`);

  if (fulfilment) {
    out.push(`*FULFILMENT:* ${fulfilment.label}`);
    if (fulfilment.id !== 'advise') {
      out.push(`*DELIVERY/SHIPPING FEE:* ${fulfilment.feeBZD === null ? UNKNOWN_PRICE : formatBZD(fulfilment.feeBZD)}`);
    }
  }
  if (totals.allPriced && fulfilment && fulfilment.feeBZD !== null) {
    out.push(`*ESTIMATED TOTAL:* ${formatBZD(totals.pricedSubtotal + fulfilment.feeBZD)} (before confirmation)`);
  }
  const area = clean(details.area, 120);
  if (area && fulfilment?.asksForArea) out.push(`*AREA:* ${area}`);
  out.push(`*PREFERRED DATE:* ${details.preferredDate ? formatLongDate(details.preferredDate) : 'Flexible'}`);
  const name = clean(details.name, 80);
  if (name) out.push(`*NAME:* ${name}`);
  const notes = clean(details.notes, MAX_ORDER_NOTES_LENGTH);
  if (notes) out.push(`*NOTES:* ${notes}`);
  out.push('');
  out.push('Please confirm availability, final price, payment arrangements and fulfilment details. Thank you!');
  return out.join('\n');
}

/** Accepts international-format numbers with or without +, spaces or dashes. */
export function normaliseWhatsAppNumber(raw: string): string | null {
  const digits = (raw || '').replace(/[\s\-().+]/g, '');
  if (!/^\d{8,15}$/.test(digits)) return null;
  if (digits.startsWith('0')) return null; // must include country code (Belize = 501)
  return digits;
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export type DestinationStatus =
  | { ok: true; number: string; source: 'official' | 'qa' }
  | { ok: false; reason: 'missing' | 'invalid' };

/**
 * Official number wins. The QA number is only used when no official number is set,
 * so test builds never message the business and production never uses a test line.
 */
export function resolveDestination(official: string, qa: string): DestinationStatus {
  if (official) {
    const n = normaliseWhatsAppNumber(official);
    return n ? { ok: true, number: n, source: 'official' } : { ok: false, reason: 'invalid' };
  }
  if (qa) {
    const n = normaliseWhatsAppNumber(qa);
    return n ? { ok: true, number: n, source: 'qa' } : { ok: false, reason: 'invalid' };
  }
  return { ok: false, reason: 'missing' };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
