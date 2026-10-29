import { createDemoProvider } from './demo';
import type { PaymentProvider } from './types';

export type { PaymentProvider, PaymentRequest, PaymentResult } from './types';

/**
 * The card processor the checkout uses. The concept only ships the demo
 * provider; a live provider is added here once Universal Hardware's own
 * merchant account and processor are in place (see PAYMENTS.md).
 */
export function getPaymentProvider(): PaymentProvider {
  return createDemoProvider();
}

/** Order reference shown to the customer, e.g. "DEMO-7K2Q9X". */
export function newOrderReference(provider: PaymentProvider): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const code = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  return `${provider.live ? 'UH' : 'DEMO'}-${code}`;
}
