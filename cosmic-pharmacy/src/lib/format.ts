import type { Product } from '../data/types';

export function formatBzd(amount: number): string {
  return `BZD ${amount.toFixed(2)}`;
}

/** Price label for cards, detail views and WhatsApp lines. */
export function priceLabel(p: Product): string {
  if (typeof p.priceBzd === 'number' && p.priceStatus !== 'confirm-price') {
    return formatBzd(p.priceBzd);
  }
  return 'Confirm price';
}

export const stockLabels: Record<string, string> = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'confirm-availability': 'Confirm availability',
  'out-of-stock': 'Out of stock'
};

export const productTypeLabels: Record<string, string> = {
  'general-otc': 'OTC',
  'pharmacy-otc': 'Pharmacy OTC',
  prescription: 'Prescription',
  supplement: 'Supplement',
  'personal-care': 'Personal care',
  'medical-device': 'Medical device'
};
