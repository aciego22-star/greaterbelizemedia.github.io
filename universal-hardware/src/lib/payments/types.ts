/**
 * The checkout talks to card processors only through this interface, so a
 * processor can be added without touching the checkout (see PAYMENTS.md).
 */
export interface PaymentRequest {
  /** Order reference created by the shop. */
  reference: string;
  /** Amount in cents. */
  amount: number;
  currency: 'BZD';
  description: string;
}

export type PaymentResult =
  | { status: 'approved'; reference: string; authCode: string; simulated: boolean }
  | { status: 'declined' | 'error'; reference: string; message: string; simulated: boolean };

export interface PaymentProvider {
  id: string;
  /** True only when real cards are charged. */
  live: boolean;
  /**
   * Renders the card form into `el`. A live provider mounts the processor's
   * hosted fields here (its own iframes), so card numbers never reach this
   * site's code or servers.
   */
  mount(el: HTMLElement): void | Promise<void>;
  unmount(): void;
  /**
   * Asks the processor to authorise the payment. A live provider tokenises the
   * card in the hosted fields and has the merchant's server (which holds the
   * secret key) confirm the charge.
   */
  pay(req: PaymentRequest): Promise<PaymentResult>;
}
