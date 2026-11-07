import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { buildFlags, site } from '../content/site';
import { useCart } from '../context/CartContext';
import { buildOrderMessage, buildWhatsAppUrl, feeLabel, formatBZD, MAX_ORDER_NOTES_LENGTH, subtotalLabel } from '../lib/order';
import { belizeDateString, formatLongDate, isAcceptingOrders } from '../lib/season';
import { copyText, generalEnquiryUrl, getDestination } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';
import { CartLines } from '../components/CartDrawer';
import { BagIcon, CheckIcon, CopyIcon, InfoIcon, WhatsAppIcon } from '../components/Icons';
import { PageHero } from '../components/ui';
import { PaymentStep } from '../components/PaymentStep';
import { effectivePayment, findBank } from '../lib/payments';

const AGE_KEY = 'cojac-age-confirmed-v1';

export default function Order() {
  usePageMeta('order');
  const { resolved, totals, details, setDetails, clear } = useCart();
  const accepting = isAcceptingOrders();
  const destination = getDestination();
  const enabledOptions = site.fulfilment.filter((f) => f.enabled);
  const fulfilment = enabledOptions.find((f) => f.id === details.fulfilment);

  const [ageOk, setAgeOk] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(AGE_KEY) === 'yes') setAgeOk(true);
    } catch {
      /* storage unavailable */
    }
  }, []);
  const [attempted, setAttempted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'opened' | 'copied' | 'copy-failed'>('idle');

  const message = useMemo(
    () => buildOrderMessage({ brandName: site.brandName, resolved, details, fulfilment }),
    [resolved, details, fulfilment],
  );
  const url = destination.ok ? buildWhatsAppUrl(destination.number, message) : null;
  // Internal preview only: lets stakeholders open WhatsApp and pick their own chat.
  const previewUrl = !destination.ok && buildFlags.showLaunchNotes ? `https://wa.me/?text=${encodeURIComponent(message)}` : null;

  const payMethod = effectivePayment(details.fulfilment, details.payment);
  const payBank = findBank(details.bank);
  const orderTotal = totals.allPriced && fulfilment && fulfilment.feeBZD !== null ? totals.pricedSubtotal + fulfilment.feeBZD : null;
  const errors = {
    fulfilment: !fulfilment ? 'Please choose delivery, pickup or shipping.' : '',
    name: details.name.trim().length < 2 ? 'Please enter your name.' : '',
    address: fulfilment?.asksForArea && details.area.trim().length < 6 ? 'Please enter your exact address.' : '',
    payment: fulfilment && !payMethod ? 'Please choose how you will pay.' : '',
    bank: payMethod === 'transfer' && !payBank ? 'Please choose your bank.' : '',
    age: !ageOk ? `Please confirm you are ${site.alcohol.legalAge} or older.` : '',
  };
  const firstError = (['fulfilment', 'name', 'address', 'payment', 'bank', 'age'] as const).find((k) => errors[k]);
  const valid = !firstError;
  const focusId = { fulfilment: 'fulfilment-group', name: 'name', address: 'area', payment: 'payment-group', bank: 'bank-group', age: 'age-confirm' } as const;
  const today = belizeDateString();

  const onSend = (e: React.MouseEvent<HTMLAnchorElement>) => {
    setAttempted(true);
    if (!valid) {
      e.preventDefault();
      if (firstError) document.getElementById(focusId[firstError])?.focus();
      return;
    }
    setStatus('opened');
  };

  const onCopy = async () => {
    const ok = await copyText(message);
    setStatus(ok ? 'copied' : 'copy-failed');
  };

  if (!accepting) {
    return (
      <>
        <PageHero title="Order requests are closed" lead={`${site.season.closedHeadline} ${site.season.closedText}`} />
        <section className="section section--paper">
          <div className="container--narrow center">
            <Link to={routes.flavours.path} className="btn">
              See our flavours
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title="Your Order Request"
        lead="Choose your flavours, tell us where to bring them and how you’ll pay (cash on delivery or bank transfer), then send your request to Cojac’s on WhatsApp."
      />
      <section className="section section--paper order-section">
        <div className="container">
          {resolved.length === 0 ? (
            <div className="order-empty card">
              <BagIcon size={44} />
              <h2 className="display-m">Your order request is empty</h2>
              <p>Choose your flavours and quantities first, then come back here to send everything in one WhatsApp message.</p>
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <Link to={routes.flavours.path} className="btn">
                  Find Your Flavour
                </Link>
                {generalEnquiryUrl() && (
                  <a href={generalEnquiryUrl()!} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark">
                    <WhatsAppIcon /> Just send us a question
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="order-grid">
              <div className="order-main">
                <section className="order-step card" aria-labelledby="step-items">
                  <div className="order-step__head">
                    <span className="order-step__num">1</span>
                    <h2 id="step-items">Your flavours</h2>
                    <Link to={routes.flavours.path} className="text-link order-step__aside">
                      + Add more
                    </Link>
                  </div>
                  <CartLines />
                  <button type="button" className="drawer__clear" onClick={clear}>
                    Clear order request
                  </button>
                </section>

                <section className="order-step card" aria-labelledby="step-fulfil">
                  <div className="order-step__head">
                    <span className="order-step__num">2</span>
                    <h2 id="step-fulfil">Your details</h2>
                  </div>
                  <fieldset
                    className="field"
                    id="fulfilment-group"
                    tabIndex={-1}
                    aria-describedby={attempted && errors.fulfilment ? 'fulfilment-error' : undefined}
                  >
                    <legend>Delivery, pickup or shipping? *</legend>
                    <div className="option-grid">
                      {enabledOptions.map((f) => (
                        <label key={f.id} className={`option-card ${details.fulfilment === f.id ? 'is-selected' : ''}`}>
                          <input
                            type="radio"
                            name="fulfilment"
                            value={f.id}
                            checked={details.fulfilment === f.id}
                            onChange={() => setDetails({ fulfilment: f.id })}
                          />
                          <span className="option-card__title">{f.label}</span>
                          <span className="option-card__desc">{f.description}</span>
                          {f.id !== 'advise' && (
                            <span className={`option-card__fee ${f.feeBZD === 0 ? 'is-free' : ''}`}>
                              {f.feeBZD === 0 ? 'Free' : f.feeBZD === null ? 'Charge confirmed by Cojac’s' : formatBZD(f.feeBZD)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                    {attempted && errors.fulfilment && (
                      <p className="field-error" id="fulfilment-error">
                        {errors.fulfilment}
                      </p>
                    )}
                  </fieldset>

                  <div className="field">
                    <label htmlFor="name">Your name *</label>
                    <input
                      id="name"
                      className="input"
                      type="text"
                      maxLength={80}
                      value={details.name}
                      onChange={(e) => setDetails({ name: e.target.value })}
                      autoComplete="name"
                      aria-invalid={attempted && !!errors.name}
                      aria-describedby={attempted && errors.name ? 'name-error' : undefined}
                    />
                    {attempted && errors.name && (
                      <p className="field-error" id="name-error">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {fulfilment?.asksForArea && (
                    <div className="field">
                      <label htmlFor="area">{fulfilment.areaLabel ?? 'Exact address'} *</label>
                      <textarea
                        id="area"
                        className="textarea textarea--short"
                        rows={2}
                        maxLength={160}
                        value={details.area}
                        onChange={(e) => setDetails({ area: e.target.value })}
                        autoComplete="street-address"
                        placeholder={fulfilment.addressHint}
                        aria-invalid={attempted && !!errors.address}
                        aria-describedby={attempted && errors.address ? 'area-error' : undefined}
                      />
                      {attempted && errors.address && (
                        <p className="field-error" id="area-error">
                          {errors.address}
                        </p>
                      )}
                    </div>
                  )}

                  {site.askPreferredDate && (
                    <div className="field">
                      <label htmlFor="date">Preferred date (optional)</label>
                      <input
                        id="date"
                        className="input"
                        type="date"
                        min={today}
                        max={site.season.seasonClosesOn}
                        value={details.preferredDate}
                        onChange={(e) => setDetails({ preferredDate: e.target.value })}
                      />
                    </div>
                  )}
                  <div className="field">
                    <label htmlFor="notes">Notes for Cojac’s (optional)</label>
                    <textarea
                      id="notes"
                      className="textarea"
                      maxLength={MAX_ORDER_NOTES_LENGTH}
                      value={details.notes}
                      onChange={(e) => setDetails({ notes: e.target.value })}
                      placeholder="e.g. best time to deliver"
                    />
                    <p className="hint">Please don’t include card or payment details.</p>
                  </div>
                </section>

                <PaymentStep
                  details={details}
                  setDetails={setDetails}
                  fulfilment={fulfilment}
                  total={orderTotal}
                  attempted={attempted}
                  errors={{ payment: errors.payment, bank: errors.bank }}
                />
              </div>

              <aside className="order-summary card" aria-labelledby="step-send">
                <div className="order-step__head">
                  <span className="order-step__num">4</span>
                  <h2 id="step-send">Review &amp; send</h2>
                </div>
                <ul className="summary-lines">
                  {resolved.map((r) => (
                    <li key={r.line.key}>
                      <span>
                        {r.product.name} <small>{r.sizeLabel} × {r.line.quantity}</small>
                      </span>
                      <span>{r.lineTotal === null ? 'TBC' : formatBZD(r.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="summary-totals">
                  <div>
                    <dt>Subtotal</dt>
                    <dd>{subtotalLabel(totals)}</dd>
                  </div>
                  {fulfilment && fulfilment.id !== 'advise' && (
                    <div>
                      <dt>{fulfilment.chargeLabel}</dt>
                      <dd>{feeLabel(fulfilment)}</dd>
                    </div>
                  )}
                  {totals.allPriced && fulfilment && fulfilment.feeBZD !== null && (
                    <div className="summary-totals__total">
                      <dt>Total</dt>
                      <dd>{formatBZD(totals.pricedSubtotal + fulfilment.feeBZD)}</dd>
                    </div>
                  )}
                  {payMethod && (
                    <div>
                      <dt>Payment</dt>
                      <dd>
                        {payMethod === 'cash'
                          ? fulfilment?.id === 'pickup'
                            ? 'Cash at pickup'
                            : 'Cash on delivery'
                          : `Bank transfer${payBank ? ` (${payBank.name})` : ''}`}
                      </dd>
                    </div>
                  )}
                  {details.preferredDate && (
                    <div>
                      <dt>Preferred date</dt>
                      <dd>{formatLongDate(details.preferredDate)}</dd>
                    </div>
                  )}
                </dl>
                <p className="summary-note">
                  <InfoIcon size={16} /> Cojac’s will confirm availability and payment on WhatsApp.
                </p>

                <details className="message-preview">
                  <summary>Preview your WhatsApp message</summary>
                  <pre>{message}</pre>
                </details>

                <label className={`check age-check ${attempted && errors.age ? 'has-error' : ''}`}>
                  <input id="age-confirm" type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} />
                  <span>
                    I confirm I am {site.alcohol.legalAge} or older. I understand rumpopo contains alcohol and may contain allergens such as egg, dairy or nuts.
                  </span>
                </label>
                {attempted && errors.age && <p className="field-error">{errors.age}</p>}

                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp btn--block send-btn" onClick={onSend}>
                    <WhatsAppIcon size={22} /> Send Order Request on WhatsApp
                  </a>
                ) : (
                  <>
                    <button type="button" className="btn btn--whatsapp btn--block send-btn" disabled aria-describedby="no-number">
                      <WhatsAppIcon size={22} /> Send Order Request on WhatsApp
                    </button>
                    <p className="notice notice--danger" id="no-number">
                      {destination.ok === false && destination.reason === 'invalid'
                        ? 'The WhatsApp order number is not set up correctly yet. Please copy your order details below and contact Cojac’s directly.'
                        : 'Our WhatsApp order line is being set up. Please copy your order details below and send them to Cojac’s directly.'}
                    </p>
                    {previewUrl && (
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark btn--block" onClick={onSend}>
                        Internal preview: open WhatsApp &amp; choose a chat
                      </a>
                    )}
                  </>
                )}
                {destination.ok && destination.source === 'qa' && <p className="qa-flag">QA test line, not the business number</p>}

                <button type="button" className="btn btn--ghost-dark btn--block" onClick={onCopy}>
                  <CopyIcon size={18} /> Copy order details
                </button>

                <div className="send-status" role="status" aria-live="polite">
                  {status === 'opened' && (
                    <p className="notice">
                      <WhatsAppIcon size={20} />
                      <span>
                        WhatsApp will open with your order request. Please send the message to complete your enquiry. Cojac’s will confirm
                        details directly.
                        <br />
                        <small>WhatsApp didn’t open? Use “Copy order details” and paste it into a chat with Cojac’s.</small>
                      </span>
                    </p>
                  )}
                  {status === 'copied' && (
                    <p className="notice notice--soft">
                      <CheckIcon size={20} /> Order details copied. Paste them into a WhatsApp chat with Cojac’s and press Send.
                    </p>
                  )}
                  {status === 'copy-failed' && (
                    <p className="notice notice--danger">Copying isn’t available in this browser. Open “Preview your WhatsApp message” above and copy the text manually.</p>
                  )}
                </div>
                <p className="privacy-fine">
                  WhatsApp is a separate service run by Meta and has its own privacy policy. This website doesn’t store your order or take payments.{' '}
                  <Link to={routes.privacy.path} className="text-link">
                    Privacy
                  </Link>
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
