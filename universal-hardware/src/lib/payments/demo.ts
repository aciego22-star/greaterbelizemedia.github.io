/**
 * Demo card processor for the concept. It stands in for the processor's
 * hosted card fields: there is nothing to type, no card details are collected,
 * nothing is sent anywhere and no card is charged. `pay` simulates the
 * processor's answer so the checkout can show both outcomes.
 */
import type { PaymentProvider, PaymentRequest, PaymentResult } from './types';

export type DemoOutcome = 'approve' | 'decline';

export interface DemoProvider extends PaymentProvider {
  outcome: DemoOutcome;
}

function el(tag: string, cls: string, text?: string): HTMLElement {
  const n = document.createElement(tag);
  n.className = cls;
  if (text) n.textContent = text;
  return n;
}

function field(label: string, value: string, wide = false): HTMLElement {
  const f = el('div', `pay-demo__field${wide ? ' pay-demo__field--wide' : ''}`);
  f.append(el('span', 'pay-demo__label', label), el('span', 'pay-demo__value', value));
  return f;
}

export function createDemoProvider(): DemoProvider {
  let host: HTMLElement | null = null;
  return {
    id: 'demo',
    live: false,
    outcome: 'approve',
    mount(target) {
      host = target;
      const frame = el('div', 'pay-demo');
      frame.setAttribute('role', 'group');
      frame.setAttribute('aria-label', 'Card details (simulated)');
      const bar = el('div', 'pay-demo__bar');
      bar.append(el('span', 'pay-demo__lock', 'Secure card form'), el('span', 'pay-demo__badge', 'Processor-hosted'));
      const grid = el('div', 'pay-demo__grid');
      grid.append(field('Card number', '•••• •••• •••• ••••', true), field('Expiry', 'MM / YY'), field('Security code', 'CVC'));
      const note = el(
        'p',
        'pay-demo__note',
        'Card payments are being set up. Until then this step is simulated: there is nothing to type and no card is charged. The card processor’s own secure form will appear here, so card numbers never touch this website.',
      );
      frame.append(bar, grid, note);
      target.replaceChildren(frame);
    },
    unmount() {
      host?.replaceChildren();
      host = null;
    },
    async pay(req: PaymentRequest): Promise<PaymentResult> {
      await new Promise((r) => window.setTimeout(r, 1200));
      if (this.outcome === 'decline') {
        return {
          status: 'declined',
          reference: req.reference,
          message: 'The card was declined (simulated). The processor’s reason appears here, and you can try another card.',
          simulated: true,
        };
      }
      return { status: 'approved', reference: req.reference, authCode: 'DEMO00', simulated: true };
    },
  };
}
