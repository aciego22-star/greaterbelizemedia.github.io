/**
 * PAYMENT SETTINGS (owner editable)
 *
 * Payment is made outside the website: cash, or a bank transfer from the
 * customer's banking app. The website never takes card details or money.
 *
 *   Delivery (Belize City) : cash on delivery OR bank transfer
 *   Pickup                 : cash at pickup OR bank transfer
 *   Shipping (out of district): bank transfer only
 *
 * For bank transfers the customer sends a screenshot of the completed transfer
 * in the WhatsApp chat; the order is confirmed once Cojac's receives it.
 *
 * Bank apps: the links below were checked against the official App Store and
 * Google Play listings (Nov 2026). On Android the button opens the installed app
 * (or its Play Store page if it is not installed); on iPhone it opens the App
 * Store page, which shows "Open" when the app is installed; on a computer it
 * opens the bank's website.
 *
 * `account`: OPTIONAL. If Cojac's wants customers to transfer straight away,
 * fill in the account that customers of that bank should pay into (name, number,
 * type). While empty, the site tells customers that Cojac's will send the account
 * details in the WhatsApp chat. Never guess these details.
 */
import type { FulfilmentId } from '../types';

export type PaymentMethodId = 'cash' | 'transfer';
export type BankId = 'heritage' | 'belize-bank' | 'atlantic';

export interface BankAccount {
  accountName: string;
  accountNumber: string;
  accountType: string;
}

export interface Bank {
  id: BankId;
  name: string;
  appName: string;
  icon: string;
  iosAppStore: string;
  androidPackage: string;
  website: string;
  account: BankAccount | null;
}

export const banks: Bank[] = [
  {
    id: 'heritage',
    name: 'Heritage Bank',
    appName: 'Heritage Bank Ltd',
    icon: '/banks/heritage-app',
    iosAppStore: 'https://apps.apple.com/bz/app/heritage-bank-ltd/id1484725931',
    androidPackage: 'com.heritage.mobile.android.ui',
    website: 'https://www.heritageibt.com/',
    account: null,
  },
  {
    id: 'belize-bank',
    name: 'Belize Bank',
    appName: 'Belize Bank Mobile Banking',
    icon: '/banks/belize-bank-app',
    iosAppStore: 'https://apps.apple.com/bz/app/belize-bank-mobile-banking/id1361907333',
    androidPackage: 'com.belizebank.mobile',
    website: 'https://www.belizebank.com/',
    account: null,
  },
  {
    id: 'atlantic',
    name: 'Atlantic Bank',
    appName: 'Atlantic Bank Mobile Banking',
    icon: '/banks/atlantic-app',
    iosAppStore: 'https://apps.apple.com/bz/app/atlantic-bank-mobile-banking/id1608600308',
    androidPackage: 'com.mobilebankingatlanticbank',
    website: 'https://www.atlabank.com/',
    account: null,
  },
];

/** Payment options offered for each fulfilment choice, in display order. */
export const paymentOptions: Record<FulfilmentId, { id: PaymentMethodId; label: string; description: string }[]> = {
  delivery: [
    { id: 'cash', label: 'Cash on delivery', description: 'Pay in cash when your order arrives.' },
    { id: 'transfer', label: 'Bank transfer', description: 'Pay from your banking app and send us the screenshot.' },
  ],
  pickup: [
    { id: 'cash', label: 'Cash at pickup', description: 'Pay in cash when you collect your order.' },
    { id: 'transfer', label: 'Bank transfer', description: 'Pay from your banking app and send us the screenshot.' },
  ],
  shipping: [{ id: 'transfer', label: 'Bank transfer', description: 'Shipping orders are paid by bank transfer before they are sent.' }],
  advise: [
    { id: 'cash', label: 'Cash', description: 'Pay in cash when you receive your order.' },
    { id: 'transfer', label: 'Bank transfer', description: 'Pay from your banking app and send us the screenshot.' },
  ],
};
