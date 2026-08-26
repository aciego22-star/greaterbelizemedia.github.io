import type { BasketLine, FulfilmentOption, Product } from '../data/types';
import { business } from '../data/business';
import { hasNumericPrice } from './catalog';
import { formatBzd } from './format';
import { summarizeBasket } from './basket';

export const fulfilmentLabels: Record<FulfilmentOption, string> = {
  pickup: 'Pick up at Cosmic Pharmacy',
  'belize-city-delivery': 'Belize City delivery',
  'out-district-shipping': 'Out-district shipping',
  'island-shipping': 'Main-island shipping'
};

export function whatsappUrl(message: string): string {
  return `https://wa.me/${business.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds the structured basket-request message the pharmacy receives.
 * The site sends a product request, never a completed purchase.
 */
export function buildBasketMessage(
  lines: BasketLine[],
  lookup: (id: string) => Product | undefined,
  fulfilment: FulfilmentOption,
  notes: string
): string {
  const rows: string[] = [];
  let n = 1;
  for (const line of lines) {
    const product = lookup(line.productId);
    if (!product) continue;
    const priced = hasNumericPrice(product)
      ? `${formatBzd(product.priceBzd as number)} each`
      : 'Confirm price';
    const brandName =
      product.brand && !product.name.toLowerCase().startsWith(product.brand.toLowerCase())
        ? `${product.brand} ${product.name}`
        : product.name;
    rows.push(`${n}. ${brandName} — Qty ${line.quantity} — ${priced}`);
    n += 1;
  }

  const summary = summarizeBasket(lines, lookup);
  const parts: string[] = [
    'Hello Cosmic Pharmacy! I would like to request the following items:',
    '',
    ...rows,
    ''
  ];
  if (summary.pricedLineCount > 0) {
    parts.push(`Estimated subtotal for priced items: ${formatBzd(summary.subtotalBzd)}`);
  }
  parts.push(`Fulfilment preference: ${fulfilmentLabels[fulfilment]}`);
  if (notes.trim()) {
    parts.push(`Notes: ${notes.trim()}`);
  }
  parts.push(
    '',
    'Please confirm availability, final prices, any prescription or pharmacist-review requirements, and the next steps. Thank you.'
  );
  return parts.join('\n');
}

/** Neutral prescription-pathway opener — never carries medical details from the site. */
export function buildPrescriptionMessage(): string {
  return 'Hello Cosmic Pharmacy. I would like assistance with a prescription or refill request. Please let me know what information you require.';
}

/** Product-question shortcut used on detail pages and the guidance card. */
export function buildQuestionMessage(productName?: string): string {
  if (productName) {
    return `Hello Cosmic Pharmacy! I have a question about ${productName}. Could a pharmacist advise me?`;
  }
  return 'Hello Cosmic Pharmacy! I have a question about a product. Could a pharmacist advise me?';
}

/** PMOS collection CTA — invites a conversation, never a diagnosis. */
export function buildPmosMessage(kitName?: string): string {
  if (kitName) {
    return `Hello Cosmic Pharmacy! I would like to ask ${business.pharmacist} about the ${kitName} and whether it could suit me.`;
  }
  return `Hello Cosmic Pharmacy! I would like to ask ${business.pharmacist} which Cosmic PMOS kit would be worth discussing for me.`;
}
