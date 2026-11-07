import { describe, expect, it } from 'vitest';
import { banks, receivingAccount } from '../src/content/payments';
import { bankAppLink, detectPlatform, effectivePayment, findBank, optionsFor, paymentMessageLines } from '../src/lib/payments';
import { buildOrderMessage, lineKey, resolveLines } from '../src/lib/order';
import type { FulfilmentOption, Product } from '../src/types';

describe('payment options', () => {
  it('delivery offers cash on delivery or bank transfer', () => {
    expect(optionsFor('delivery').map((o) => o.label)).toEqual(['Cash on delivery', 'Bank transfer']);
  });
  it('pickup offers cash at pickup or bank transfer', () => {
    expect(optionsFor('pickup').map((o) => o.label)).toEqual(['Cash at pickup', 'Bank transfer']);
  });
  it('shipping is bank transfer only, chosen automatically', () => {
    expect(optionsFor('shipping').map((o) => o.id)).toEqual(['transfer']);
    expect(effectivePayment('shipping', '')).toBe('transfer');
    expect(effectivePayment('shipping', 'cash')).toBe('transfer');
  });
  it('drops a choice that does not apply and needs a choice when there are two', () => {
    expect(effectivePayment('delivery', '')).toBe('');
    expect(effectivePayment('', 'cash')).toBe('');
    expect(effectivePayment('delivery', 'cash')).toBe('cash');
  });
});

describe('banks', () => {
  it('lists Heritage Bank, Belize Bank and Atlantic Bank with verified app links', () => {
    expect(banks.map((b) => b.name)).toEqual(['Heritage Bank', 'Belize Bank', 'Atlantic Bank']);
    for (const b of banks) {
      expect(b.iosAppStore).toMatch(/^https:\/\/apps\.apple\.com\/bz\/app\/.+\/id\d+$/);
      expect(b.androidPackage).toMatch(/^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/);
      expect(b.website).toMatch(/^https:\/\//);
    }
  });
  it('builds the right link for each platform', () => {
    const bb = findBank('belize-bank')!;
    expect(bankAppLink(bb, 'ios')).toBe('https://apps.apple.com/bz/app/belize-bank-mobile-banking/id1361907333');
    expect(bankAppLink(bb, 'desktop')).toBe('https://www.belizebank.com/');
    const a = bankAppLink(bb, 'android');
    expect(a.startsWith('intent:#Intent;')).toBe(true);
    expect(a).toContain('package=com.belizebank.mobile;');
    expect(decodeURIComponent(a)).toContain('https://play.google.com/store/apps/details?id=com.belizebank.mobile');
  });
  it('detects platforms from the user agent', () => {
    expect(detectPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 7)')).toBe('android');
    expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')).toBe('ios');
    expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('desktop');
  });
  it('uses the owner-supplied receiving account', () => {
    expect(receivingAccount).toEqual({ bankId: 'atlantic', bankName: 'Atlantic Bank Limited', accountName: 'Cojac Smith', accountNumber: '212001055', accountType: '' });
    expect(banks.some((b) => b.id === receivingAccount!.bankId)).toBe(true);
  });
});

describe('payment in the WhatsApp message', () => {
  const product: Product = {
    id: 'a', slug: 'a', name: 'Flavour A', subtitle: '', description: '', images: [], seasonalCollection: 'classic', active: true,
    highlighted: false, confirmedThisSeason: true, containsAlcohol: true, alcoholInformation: null, allergens: null,
    ingredientsDisclosure: null, dietaryLabel: null, leadTime: null, collectionOrDeliveryOptions: null,
    palette: { cream: '#fff', deep: '#eee', accent: '#000' },
    variants: [{ variantId: 'h', bottleSize: 'Half liter (500 mL)', priceBZD: 17, availability: 'on-menu' }],
  };
  const resolved = resolveLines([{ key: lineKey('a', 'h'), productId: 'a', variantId: 'h', quantity: 2, note: '' }], [product]);
  const delivery: FulfilmentOption = { id: 'delivery', label: 'Delivery', messageLabel: 'Delivery (Belize City)', description: '', enabled: true, asksForArea: true, chargeLabel: 'Delivery', feeBZD: 5 };
  const shipping: FulfilmentOption = { id: 'shipping', label: 'Shipping', messageLabel: 'Shipping (out of district)', description: '', enabled: true, asksForArea: true, chargeLabel: 'Shipping', feeBZD: null };
  const base = { name: 'Ana', area: '12 Cleghorn St', preferredDate: '', notes: '' };

  it('cash on delivery', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved, fulfilment: delivery, details: { ...base, fulfilment: 'delivery', payment: 'cash', bank: '' } });
    expect(msg).toContain('Payment: Cash on delivery');
    expect(msg).not.toContain('screenshot');
  });
  it('bank transfer names the bank and promises the screenshot', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved, fulfilment: delivery, details: { ...base, fulfilment: 'delivery', payment: 'transfer', bank: 'atlantic' } });
    expect(msg).toContain('Payment: Bank transfer (Atlantic Bank)');
    expect(msg).toContain('I will send the transfer screenshot in this chat.');
    expect(msg).not.toMatch(/[—–]/);
  });
  it('shipping is always bank transfer, even if cash was chosen earlier', () => {
    const msg = buildOrderMessage({ brandName: 'X', resolved, fulfilment: shipping, details: { ...base, fulfilment: 'shipping', payment: 'cash', bank: 'heritage' } });
    expect(msg).toContain('Payment: Bank transfer (Heritage Bank)');
  });
  it('pickup cash wording', () => {
    expect(paymentMessageLines('cash', 'pickup', undefined)).toEqual(['Payment: Cash at pickup']);
  });
});
