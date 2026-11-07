/** Payment helpers: pure functions, unit-tested in tests/payments.test.ts. */
import { banks, paymentOptions, type Bank, type BankId, type PaymentMethodId } from '../content/payments';
import type { FulfilmentId } from '../types';

export function optionsFor(fulfilment: FulfilmentId | ''): { id: PaymentMethodId; label: string; description: string }[] {
  return fulfilment ? paymentOptions[fulfilment] : [];
}

/** The payment method that actually applies (shipping forces bank transfer; invalid choices are dropped). */
export function effectivePayment(fulfilment: FulfilmentId | '', chosen: PaymentMethodId | ''): PaymentMethodId | '' {
  const opts = optionsFor(fulfilment);
  if (opts.length === 1) return opts[0].id;
  return opts.some((o) => o.id === chosen) ? chosen : '';
}

export function findBank(id: BankId | ''): Bank | undefined {
  return banks.find((b) => b.id === id);
}

export type Platform = 'android' | 'ios' | 'desktop';

export function detectPlatform(ua: string): Platform {
  if (/android/i.test(ua)) return 'android';
  if (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && /mobile/i.test(ua))) return 'ios';
  return 'desktop';
}

/**
 * Link that opens the bank's app.
 *  Android: an intent link that launches the installed app, falling back to Google Play.
 *  iPhone:  the App Store page (shows "Open" when the app is installed).
 *  Desktop: the bank's website.
 */
export function bankAppLink(bank: Bank, platform: Platform): string {
  if (platform === 'android') {
    const play = `https://play.google.com/store/apps/details?id=${bank.androidPackage}`;
    return `intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=${bank.androidPackage};S.browser_fallback_url=${encodeURIComponent(play)};end`;
  }
  if (platform === 'ios') return bank.iosAppStore;
  return bank.website;
}

/** Lines for the WhatsApp order message. */
export function paymentMessageLines(method: PaymentMethodId | '', fulfilment: FulfilmentId | '', bank: Bank | undefined): string[] {
  if (method === 'cash') {
    const label = optionsFor(fulfilment).find((o) => o.id === 'cash')?.label ?? 'Cash';
    return [`Payment: ${label}`];
  }
  if (method === 'transfer') {
    return [`Payment: Bank transfer${bank ? ` (${bank.name})` : ''}`, 'I will send the transfer screenshot in this chat.'];
  }
  return [];
}
