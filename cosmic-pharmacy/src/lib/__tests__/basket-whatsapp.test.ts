import { describe, expect, it } from 'vitest';
import { summarizeBasket } from '../basket';
import { buildBasketMessage, buildPrescriptionMessage, whatsappUrl } from '../whatsapp';
import { productById, productBySlug } from '../catalog';
import type { BasketLine } from '../../data/types';

const centrum = productBySlug.get('centrum-women-multivitamin')!;
const strips = productBySlug.get('easytouch-glucose-test-strips')!;
const lookup = (id: string) => productById.get(id);

const lines: BasketLine[] = [
  { productId: centrum.id, quantity: 2 },
  { productId: strips.id, quantity: 1 }
];

describe('summarizeBasket', () => {
  it('sums only priced lines and counts confirm-price lines separately', () => {
    const s = summarizeBasket(lines, lookup);
    expect(s.subtotalBzd).toBe(40);
    expect(s.pricedLineCount).toBe(1);
    expect(s.confirmPriceLineCount).toBe(1);
    expect(s.itemCount).toBe(3);
  });

  it('ignores unknown product ids without corrupting totals', () => {
    const s = summarizeBasket([...lines, { productId: 'ghost', quantity: 5 }], lookup);
    expect(s.subtotalBzd).toBe(40);
    expect(s.itemCount).toBe(3);
  });
});

describe('buildBasketMessage', () => {
  const msg = buildBasketMessage(lines, lookup, 'out-district-shipping', 'Call before shipping');

  it('lists every line with quantity and price state', () => {
    expect(msg).toContain('1. Centrum Women Multivitamin - Qty 2 - BZD 20.00 each');
    expect(msg).toContain('Qty 1 - Confirm price');
  });

  it('includes estimated subtotal, fulfilment and notes', () => {
    expect(msg).toContain('Estimated subtotal for priced items: BZD 40.00');
    expect(msg).toContain('Fulfilment preference: Out-district shipping');
    expect(msg).toContain('Notes: Call before shipping');
  });

  it('closes with the confirmation request', () => {
    expect(msg).toContain('Please confirm availability, final prices');
  });

  it('omits the subtotal line when no line is priced', () => {
    const unpricedOnly = buildBasketMessage([{ productId: strips.id, quantity: 1 }], lookup, 'pickup', '');
    expect(unpricedOnly).not.toContain('Estimated subtotal');
  });
});

describe('whatsappUrl', () => {
  it('targets 5016118080 and URL-encodes the message', () => {
    const url = whatsappUrl('Hello & welcome\nLine two');
    expect(url.startsWith('https://wa.me/5016118080?text=')).toBe(true);
    expect(url).toContain('Hello%20%26%20welcome%0ALine%20two');
  });
});

describe('buildPrescriptionMessage', () => {
  it('is neutral and contains no product or medical details', () => {
    const msg = buildPrescriptionMessage();
    expect(msg).toContain('prescription or refill request');
    expect(msg).not.toMatch(/\bBZD\b/);
  });
});
