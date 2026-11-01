/**
 * Checkout for the concept shop. It is a working demonstration: the whole
 * journey runs, but no order is placed, no payment is taken and nothing is
 * sent, and every step and the confirmation say so.
 *
 * Contact details live in this component's memory only: they are not stored,
 * logged or sent. Card payment goes through the PaymentProvider interface; the
 * concept ships only the demo provider, which collects no card details and
 * charges nothing (see src/lib/payments and PAYMENTS.md).
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { BRANCHES, BRANCH_BY_ID, type BranchId } from '../data/branches';
import { PRODUCT_BY_ID, formatPrice, productTitle } from '../data/shop';
import { iconSvg, type IconName } from '../lib/icons';
import { cartCount, cartTotal, clearCart, hasPriced, hasRequests, isRequest, lineKey, lineTotal, type CartLine } from '../lib/cart-store';
import { getBranch } from '../lib/site-state';
import { getPaymentProvider, newOrderReference } from '../lib/payments';
import type { DemoOutcome, DemoProvider } from '../lib/payments/demo';
import { CartEmpty, useCart } from './CartView';
import { SitePicture } from './SitePicture';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

type Field = 'name' | 'phone' | 'email';
interface Contact {
  name: string;
  phone: string;
  email: string;
}
interface PlacedOrder {
  reference: string;
  lines: CartLine[];
  total: number;
  branch: BranchId;
  name: string;
  /** False when the order held only requested items, so nothing was paid. */
  paid: boolean;
  requests: boolean;
}

const SAMPLE: Contact = { name: 'Sample Customer', phone: '+501 000-0000', email: 'customer@example.com' };

function validate(c: Contact): Partial<Record<Field, string>> {
  const e: Partial<Record<Field, string>> = {};
  if (c.name.trim().length < 2) e.name = 'Enter your name.';
  if (c.phone.replace(/\D/g, '').length < 7) e.phone = 'Enter a phone number with at least 7 digits.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = 'Enter an email address like name@example.com.';
  return e;
}

function SummaryItems({ lines }: { lines: CartLine[] }) {
  return (
    <ul class="summary__items">
      {lines.map((l) => {
        if (isRequest(l))
          return (
            <li class="summary__item" key={lineKey(l)}>
              <div class="summary__item-request" aria-hidden="true">
                <Icon name="search" size={20} />
              </div>
              <div>
                <p class="summary__item-title" data-i18n-skip>
                  {l.text}
                </p>
                <p class="summary__item-meta">Requested · Qty {l.qty}</p>
              </div>
              <span class="summary__tbc">To be confirmed</span>
            </li>
          );
        const p = PRODUCT_BY_ID[l.id];
        return (
          <li class="summary__item" key={lineKey(l)}>
            <div class="photo-stage">
              <SitePicture image={p.image} decorative />
            </div>
            <div>
              <p class="summary__item-title">{productTitle(p)}</p>
              <p class="summary__item-meta">
                {l.colour ? `${l.colour} · ` : ''}Qty {l.qty}
              </p>
            </div>
            <span>{formatPrice(lineTotal(l))}</span>
          </li>
        );
      })}
    </ul>
  );
}

export default function Checkout() {
  const lines = useCart();
  const provider = useMemo(() => getPaymentProvider(), []);
  const [ready, setReady] = useState(false);
  const [contact, setContact] = useState<Contact>({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [branch, setBranch] = useState<BranchId>('spanish-lookout');
  const [outcome, setOutcome] = useState<DemoOutcome>('approve');
  const [status, setStatus] = useState<'idle' | 'paying'>('idle');
  const [payError, setPayError] = useState('');
  const [order, setOrder] = useState<PlacedOrder | null>(null);
  const slot = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const showForm = ready && !order && hasPriced(lines);

  useEffect(() => {
    setReady(true);
    const b = getBranch();
    if (b) setBranch(b);
  }, []);

  useEffect(() => {
    if (!showForm || !slot.current) return;
    provider.mount(slot.current);
    return () => provider.unmount();
  }, [showForm, provider]);

  useEffect(() => {
    if (provider.id === 'demo') (provider as DemoProvider).outcome = outcome;
  }, [outcome, provider]);

  useEffect(() => {
    if (!order) return;
    confirmRef.current?.focus({ preventScroll: true });
    confirmRef.current?.scrollIntoView({ block: 'start' });
  }, [order]);

  if (!ready) return <p class="muted island-loading">Loading checkout…</p>;

  if (order) {
    const b = BRANCH_BY_ID[order.branch];
    return (
      <div class="confirm" ref={confirmRef} tabIndex={-1} aria-labelledby="confirm-title">
        <span class="confirm__badge">
          <Icon name="check" size={28} />
        </span>
        <div>
          <h2 class="h2" id="confirm-title">
            {order.paid ? 'Demo order complete' : 'Demo request complete'}
          </h2>
          <p class="confirm__ref" style={{ marginTop: '10px' }}>
            Demo reference {order.reference}
          </p>
        </div>
        <p class="demo-notice">
          <Icon name="info" size={16} />
          <span>
            <strong>Demonstration mode — no actual orders or payments are processed.</strong>{' '}
            {order.paid ? 'No order was placed and no payment was taken.' : 'No request was sent.'}
          </span>
        </p>
        <p class="lead">
          {order.paid
            ? `Thanks, ${order.name.trim()}. This checkout was a demonstration: no card was charged and nothing was sent to Universal Hardware. Once live, this page would show the real order reference, an email receipt would follow and the branch would be alerted to prepare the order for collection.`
            : `Thanks, ${order.name.trim()}. This request was a demonstration and was not sent to Universal Hardware. Once live, the branch would confirm the price and availability and contact the customer before payment.`}
        </p>
        {order.requests && order.paid && (
          <p class="request-note">
            <Icon name="info" />
            <span>Once live, the branch confirms the price and availability of requested items and contacts the customer before they pay for them.</span>
          </p>
        )}
        <div class="confirm__grid">
          <section class="confirm__panel" aria-labelledby="confirm-items">
            <h3 id="confirm-items">Items in this demo</h3>
            <SummaryItems lines={order.lines} />
            <p class="summary__total">
              <span>Demo total</span>
              <span>{formatPrice(order.total)}</span>
            </p>
          </section>
          <section class="confirm__panel" aria-labelledby="confirm-branch">
            <h3 id="confirm-branch">Collection, once live</h3>
            <p>
              <strong>{b.name}</strong>
            </p>
            <p>{b.addressLines.join(', ')}</p>
            {b.hours.map((h) => (
              <p class="muted" key={h.days}>
                {h.days}: {h.time}
              </p>
            ))}
            <p class="muted">Customers would bring their order reference to collect.</p>
          </section>
        </div>
        <div class="confirm__actions">
          <a class="btn" href="/shop/">
            Back to the Shop
          </a>
        </div>
      </div>
    );
  }

  if (!lines.length) return <CartEmpty />;

  const n = cartCount(lines);
  const total = cartTotal(lines);
  const priced = hasPriced(lines);
  const requested = hasRequests(lines);
  const set = (k: Field) => (e: Event) => {
    const v = (e.currentTarget as HTMLInputElement).value;
    setContact((c) => ({ ...c, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  const submit = async (e: Event) => {
    e.preventDefault();
    if (status === 'paying') return;
    const errs = validate(contact);
    setErrors(errs);
    const first = (['name', 'phone', 'email'] as Field[]).find((k) => errs[k]);
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setPayError('');
    const reference = newOrderReference(provider);
    if (!priced) {
      setOrder({ reference, lines, total: 0, branch, name: contact.name, paid: false, requests: true });
      clearCart();
      return;
    }
    setStatus('paying');
    const result = await provider.pay({ reference, amount: total, currency: 'BZD', description: `Universal Hardware order, ${n} items` });
    setStatus('idle');
    if (result.status === 'approved') {
      setOrder({ reference, lines, total, branch, name: contact.name, paid: true, requests: hasRequests(lines) });
      clearCart();
    } else {
      setPayError(result.message);
    }
  };

  const fieldProps = (k: Field) => ({
    id: `co-${k}`,
    class: 'input',
    value: contact[k],
    onInput: set(k),
    'aria-invalid': errors[k] ? (true as const) : undefined,
    'aria-describedby': errors[k] ? `co-${k}-error` : undefined,
  });

  return (
    <div class="checkout">
      {/* Pay is a plain button and Enter is handled here: sandboxed preview frames block form submission. */}
      <form
        class="checkout__form"
        id="checkout-form"
        onSubmit={submit}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.isComposing && (e.target as HTMLElement).tagName === 'INPUT') submit(e);
        }}
        noValidate
      >
        <fieldset class="co-step">
          <legend class="co-step__head">
            <span class="co-step__title">
              <span class="co-step__num">1</span> Your details
            </span>
          </legend>
          <p class="hint">
            What you type stays on this page; it is not saved or sent.{' '}
            <button type="button" class="link-btn" style={{ minHeight: 0, padding: 0 }} onClick={() => (setContact(SAMPLE), setErrors({}))}>
              Fill in sample details
            </button>
          </p>
          <div class="co-fields">
            <div class="field field--wide">
              <label for="co-name">Full name</label>
              <input {...fieldProps('name')} type="text" autocomplete="name" />
              {errors.name && (
                <p class="field-error" id="co-name-error">
                  {errors.name}
                </p>
              )}
            </div>
            <div class="field">
              <label for="co-phone">Phone</label>
              <input {...fieldProps('phone')} type="tel" autocomplete="tel" inputMode="tel" />
              {errors.phone && (
                <p class="field-error" id="co-phone-error">
                  {errors.phone}
                </p>
              )}
            </div>
            <div class="field">
              <label for="co-email">Email</label>
              <input {...fieldProps('email')} type="email" autocomplete="email" />
              {errors.email && (
                <p class="field-error" id="co-email-error">
                  {errors.email}
                </p>
              )}
            </div>
          </div>
        </fieldset>

        <fieldset class="co-step">
          <legend class="co-step__head">
            <span class="co-step__title">
              <span class="co-step__num">2</span> Collection
            </span>
          </legend>
          <div class="choice-list choice-list--2">
            {BRANCHES.map((b) => (
              <label class="choice" key={b.id}>
                <input type="radio" name="branch" value={b.id} checked={branch === b.id} onChange={() => setBranch(b.id)} />
                <span class="choice__title">Collect at {b.name}</span>
                <span class="choice__meta">{b.addressLines.slice(0, 2).join(', ')}</span>
              </label>
            ))}
            <label class="choice">
              <input type="radio" name="branch" value="delivery" disabled />
              <span class="choice__title">Delivery</span>
              <span class="choice__meta">Not available online yet. Ask the branch about delivery.</span>
            </label>
          </div>
        </fieldset>

        <fieldset class="co-step">
          <legend class="co-step__head">
            <span class="co-step__title">
              <span class="co-step__num">3</span> Payment
            </span>
          </legend>
          {requested && (
            <p class="request-note">
              <Icon name="info" />
              <span>
                {priced
                  ? 'Only priced items are paid at checkout. Once live, the branch confirms the price and availability of requested items and contacts the customer before they pay for them.'
                  : 'Nothing is paid at checkout. Once live, the branch confirms the price and availability of requested items and contacts the customer before payment.'}
              </span>
            </p>
          )}
          {priced && (
          <>
          <p class="pay-cards">
            <Icon name="card" size={20} />
            <span>Credit or debit card. Once live, the accepted card networks are set by the bank that provides Universal Hardware's merchant account.</span>
          </p>
          <div class="pay-slot" ref={slot} />
          {!provider.live && (
            <div class="demo-outcome">
              <span id="demo-outcome-label">Demo outcome</span>
              <div class="seg" role="radiogroup" aria-labelledby="demo-outcome-label">
                {(['approve', 'decline'] as DemoOutcome[]).map((o) => (
                  <label key={o}>
                    <input type="radio" name="demo-outcome" value={o} checked={outcome === o} onChange={() => setOutcome(o)} />
                    {o === 'approve' ? 'Approved' : 'Declined'}
                  </label>
                ))}
              </div>
            </div>
          )}
          </>
          )}
          {payError && (
            <p class="pay-error" role="alert">
              <Icon name="info" />
              <span>{payError}</span>
            </p>
          )}
        </fieldset>
      </form>

      <aside class="summary" aria-labelledby="co-summary-title">
        <h2 class="summary__title" id="co-summary-title">
          Order summary
        </h2>
        <SummaryItems lines={lines} />
        <div class="summary__rows">
          <p class="summary__row">
            <span>
              {n} {n === 1 ? 'item' : 'items'}
            </span>
            <span>{formatPrice(total)}</span>
          </p>
          {requested && (
            <p class="summary__row summary__row--muted">
              <span>Requested items</span>
              <span>Price to be confirmed</span>
            </p>
          )}
          <p class="summary__row summary__row--muted">
            <span>Collect at</span>
            <span>{BRANCH_BY_ID[branch].name}</span>
          </p>
        </div>
        <p class="summary__total">
          <span>{priced ? 'Total' : 'To pay now'}</span>
          <span>{formatPrice(total)}</span>
        </p>
        <button type="button" class="btn btn--lg btn--block pay-btn" onClick={submit} disabled={status === 'paying'} aria-busy={status === 'paying'}>
          {status === 'paying' ? (
            <>
              <span class="spinner" aria-hidden="true" /> Simulating the card processor…
            </>
          ) : (
            <>
              <Icon name={priced ? 'lock' : 'send'} /> {priced ? `Simulate payment · ${formatPrice(total)}` : 'Simulate request'}
            </>
          )}
        </button>
        <p class="price-note" aria-live="polite">
          {status === 'paying' ? 'Simulating the card processor’s answer. Nothing is charged.' : ''}
        </p>
        <a class="link-arrow" href="/cart/">
          <Icon name="arrow-left" size={16} /> Edit cart
        </a>
      </aside>
    </div>
  );
}
