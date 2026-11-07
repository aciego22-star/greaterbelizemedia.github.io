import { useEffect, useState } from 'react';
import { banks, type BankId, type PaymentMethodId } from '../content/payments';
import { bankAppLink, detectPlatform, effectivePayment, findBank, optionsFor, type Platform } from '../lib/payments';
import { formatBZD } from '../lib/order';
import { asset, copyText } from '../lib/whatsapp';
import type { FulfilmentOption, OrderDetails } from '../types';
import { CheckIcon, CopyIcon, ExternalIcon, InfoIcon } from './Icons';

interface Props {
  details: OrderDetails;
  setDetails: (patch: Partial<OrderDetails>) => void;
  fulfilment: FulfilmentOption | undefined;
  /** Order total when every price and the charge are known, otherwise null. */
  total: number | null;
  attempted: boolean;
  errors: { payment: string; bank: string };
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="account-row">
      <dt>{label}</dt>
      <dd>
        <span>{value}</span>
        <button
          type="button"
          className="account-row__copy"
          aria-label={`Copy ${label.toLowerCase()}`}
          onClick={async () => {
            if (await copyText(value)) {
              setDone(true);
              window.setTimeout(() => setDone(false), 2000);
            }
          }}
        >
          {done ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
        </button>
      </dd>
    </div>
  );
}

/**
 * Step 3 of the order page: how the customer will pay. Bank transfers show the
 * three banks; choosing one reveals a button that opens that bank's app, the
 * amount, and the instruction to send the transfer screenshot on WhatsApp.
 */
export function PaymentStep({ details, setDetails, fulfilment, total, attempted, errors }: Props) {
  const [platform, setPlatform] = useState<Platform>('desktop');
  useEffect(() => setPlatform(detectPlatform(navigator.userAgent)), []);

  const options = optionsFor(fulfilment?.id ?? '');
  const method = effectivePayment(fulfilment?.id ?? '', details.payment);
  const bank = findBank(details.bank);

  return (
    <section className="order-step card" aria-labelledby="step-pay">
      <div className="order-step__head">
        <span className="order-step__num">3</span>
        <h2 id="step-pay">How will you pay?</h2>
      </div>

      {!fulfilment ? (
        <p className="hint pay-wait">Choose delivery, pickup or shipping above to see the payment options.</p>
      ) : (
        <>
          <fieldset className="field" id="payment-group" tabIndex={-1} aria-describedby={attempted && errors.payment ? 'payment-error' : undefined}>
            <legend>Payment method *</legend>
            <div className="option-grid">
              {options.map((o) => (
                <label key={o.id} className={`option-card ${method === o.id ? 'is-selected' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value={o.id}
                    checked={method === o.id}
                    onChange={() => setDetails({ payment: o.id as PaymentMethodId })}
                  />
                  <span className="option-card__title">{o.label}</span>
                  <span className="option-card__desc">{o.description}</span>
                </label>
              ))}
            </div>
            {attempted && errors.payment && (
              <p className="field-error" id="payment-error">
                {errors.payment}
              </p>
            )}
          </fieldset>

          {method === 'transfer' && (
            <>
              <fieldset className="field" id="bank-group" tabIndex={-1} aria-describedby={attempted && errors.bank ? 'bank-error' : undefined}>
                <legend>Which bank will you pay from? *</legend>
                <div className="bank-grid">
                  {banks.map((b) => (
                    <label key={b.id} className={`bank-option ${details.bank === b.id ? 'is-selected' : ''}`}>
                      <input type="radio" name="bank" value={b.id} checked={details.bank === b.id} onChange={() => setDetails({ bank: b.id as BankId })} />
                      <picture>
                        <source type="image/webp" srcSet={`${asset(`${b.icon}-96.webp`)} 1x, ${asset(`${b.icon}-192.webp`)} 2x`} />
                        <img src={asset(`${b.icon}-192.webp`)} width={56} height={56} alt="" loading="lazy" decoding="async" />
                      </picture>
                      <span className="bank-option__name">{b.name}</span>
                    </label>
                  ))}
                </div>
                {attempted && errors.bank && (
                  <p className="field-error" id="bank-error">
                    {errors.bank}
                  </p>
                )}
              </fieldset>

              {bank && (
                <div className="transfer-panel" role="region" aria-label={`Paying with ${bank.name}`}>
                  <a
                    className="btn btn--block transfer-panel__open"
                    href={bankAppLink(bank, platform)}
                    {...(platform === 'android' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {platform === 'desktop' ? `Open ${bank.name} online banking` : `Open the ${bank.name} app`}
                    <ExternalIcon size={16} />
                  </a>

                  <dl className="transfer-facts">
                    <div className="account-row">
                      <dt>Amount</dt>
                      <dd>
                        <strong>{total !== null ? formatBZD(total) : 'Confirmed by Cojac’s on WhatsApp'}</strong>
                      </dd>
                    </div>
                    {bank.account && (
                      <>
                        <CopyRow label="Account name" value={bank.account.accountName} />
                        <CopyRow label="Account number" value={bank.account.accountNumber} />
                        <div className="account-row">
                          <dt>Account type</dt>
                          <dd>{bank.account.accountType}</dd>
                        </div>
                      </>
                    )}
                  </dl>

                  <ol className="transfer-steps">
                    {bank.account ? (
                      <>
                        <li>Transfer the amount in your {bank.name} app.</li>
                        <li>Tap “Send Order Request on WhatsApp” below.</li>
                        <li>
                          In the chat, send a <strong>screenshot of your completed transfer</strong>.
                        </li>
                      </>
                    ) : (
                      <>
                        <li>Tap “Send Order Request on WhatsApp” below.</li>
                        <li>Cojac’s replies with the account details{total === null ? ' and your total' : ''}.</li>
                        <li>Make the transfer in your {bank.name} app.</li>
                        <li>
                          Send a <strong>screenshot of your completed transfer</strong> in the chat.
                        </li>
                      </>
                    )}
                  </ol>
                  <p className="transfer-panel__note">
                    <InfoIcon size={18} />
                    <span>
                      <strong>Your order is placed once Cojac’s receives your transfer screenshot.</strong>
                    </span>
                  </p>
                </div>
              )}
            </>
          )}

          {method === 'cash' && (
            <p className="pay-cash">
              <CheckIcon size={18} /> {fulfilment.id === 'pickup' ? 'Pay in cash when you collect your order.' : 'Pay in cash when your order arrives.'}
            </p>
          )}
        </>
      )}
    </section>
  );
}
