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
 * `receivingAccount`: the account ALL transfers are paid into (supplied by the
 * owner, Nov 2026). Customers of other banks send it as a transfer to another
 * bank in Belize. Set it to null to hide it; the site then tells customers that
 * Cojac's will send the account details in the WhatsApp chat.
 */
import type { FulfilmentId } from '../types';
import { t } from '../i18n/lang';

const TRANSFER = t('Bank transfer', 'Transferencia bancaria');
const TRANSFER_DESC = t('Pay from your banking app and send us the screenshot.', 'Paga desde la app de tu banco y envíanos la captura de pantalla.');

export type PaymentMethodId = 'cash' | 'transfer';
export type BankId = 'heritage' | 'belize-bank' | 'atlantic';

export interface ReceivingAccount {
  bankId: BankId;
  bankName: string;
  accountName: string;
  accountNumber: string;
  /** Optional, e.g. "Savings". Leave empty if not supplied. */
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
  },
  {
    id: 'belize-bank',
    name: 'Belize Bank',
    appName: 'Belize Bank Mobile Banking',
    icon: '/banks/belize-bank-app',
    iosAppStore: 'https://apps.apple.com/bz/app/belize-bank-mobile-banking/id1361907333',
    androidPackage: 'com.belizebank.mobile',
    website: 'https://www.belizebank.com/',
  },
  {
    id: 'atlantic',
    name: 'Atlantic Bank',
    appName: 'Atlantic Bank Mobile Banking',
    icon: '/banks/atlantic-app',
    iosAppStore: 'https://apps.apple.com/bz/app/atlantic-bank-mobile-banking/id1608600308',
    androidPackage: 'com.mobilebankingatlanticbank',
    website: 'https://www.atlabank.com/',
  },
];

export const receivingAccount: ReceivingAccount | null = {
  bankId: 'atlantic',
  bankName: 'Atlantic Bank Limited',
  accountName: 'Cojac Smith',
  accountNumber: '212001055',
  accountType: '',
};

/** Payment options offered for each fulfilment choice, in display order. */
export const paymentOptions: Record<FulfilmentId, { id: PaymentMethodId; label: string; description: string }[]> = {
  delivery: [
    { id: 'cash', label: t('Cash on delivery', 'Efectivo contra entrega'), description: t('Pay in cash when your order arrives.', 'Paga en efectivo cuando llegue tu pedido.') },
    { id: 'transfer', label: TRANSFER, description: TRANSFER_DESC },
  ],
  pickup: [
    { id: 'cash', label: t('Cash at pickup', 'Efectivo al recoger'), description: t('Pay in cash when you collect your order.', 'Paga en efectivo cuando recojas tu pedido.') },
    { id: 'transfer', label: TRANSFER, description: TRANSFER_DESC },
  ],
  shipping: [
    {
      id: 'transfer',
      label: TRANSFER,
      description: t('Shipping orders are paid by bank transfer before they are sent.', 'Los pedidos con envío se pagan por transferencia bancaria antes de enviarse.'),
    },
  ],
  advise: [
    { id: 'cash', label: t('Cash', 'Efectivo'), description: t('Pay in cash when you receive your order.', 'Paga en efectivo cuando recibas tu pedido.') },
    { id: 'transfer', label: TRANSFER, description: TRANSFER_DESC },
  ],
};
