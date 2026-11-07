import { useEffect, useState } from 'react';
import { banks, receivingAccount as acct, type BankId, type PaymentMethodId } from '../content/payments';
import { bankAppLink, detectPlatform, effectivePayment, findBank, optionsFor, type Platform } from '../lib/payments';
import { formatBZD } from '../lib/order';
import { asset, copyText } from '../lib/whatsapp';
import type { FulfilmentOption, OrderDetails } from '../types';
import { CheckIcon, CopyIcon, ExternalIcon, InfoIcon } from './Icons';
import { t } from '../i18n/lang';

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
          aria-label={`${t('Copy', 'Copiar')} ${label.toLowerCase()}`}
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
        <h2 id="step-pay">{t('How will you pay?', '¿Cómo vas a pagar?')}</h2>
      </div>

      {!fulfilment ? (
        <p className="hint pay-wait">
          {t('Choose delivery, pickup or shipping above to see the payment options.', 'Elige entrega, recoger o envío arriba para ver las opciones de pago.')}
        </p>
      ) : (
        <>
          <fieldset className="field" id="payment-group" tabIndex={-1} aria-describedby={attempted && errors.payment ? 'payment-error' : undefined}>
            <legend>{t('Payment method', 'Forma de pago')} *</legend>
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
                <legend>{t('Which bank will you pay from?', '¿Desde qué banco vas a pagar?')} *</legend>
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
                <div className="transfer-panel" role="region" aria-label={`${t('Paying with', 'Pago con')} ${bank.name}`}>
                  <a
                    className="btn btn--block transfer-panel__open"
                    href={bankAppLink(bank, platform)}
                    {...(platform === 'android' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
                  >
                    {platform === 'desktop'
                      ? t(`Open ${bank.name} online banking`, `Abrir la banca en línea de ${bank.name}`)
                      : t(`Open the ${bank.name} app`, `Abrir la app de ${bank.name}`)}
                    <ExternalIcon size={16} />
                  </a>

                  <dl className="transfer-facts">
                    <div className="account-row">
                      <dt>{t('Amount', 'Monto')}</dt>
                      <dd>
                        <strong>{total !== null ? formatBZD(total) : t('Confirmed by Cojac’s on WhatsApp', 'Cojac’s lo confirma por WhatsApp')}</strong>
                      </dd>
                    </div>
                    {acct && (
                      <>
                        <div className="account-row">
                          <dt>{t('Pay to', 'Pagar a')}</dt>
                          <dd>{acct.bankName}</dd>
                        </div>
                        <CopyRow label={t('Account number', 'Número de cuenta')} value={acct.accountNumber} />
                        <CopyRow label={t('Recipient name', 'Nombre del destinatario')} value={acct.accountName} />
                        {acct.accountType && (
                          <div className="account-row">
                            <dt>{t('Account type', 'Tipo de cuenta')}</dt>
                            <dd>{acct.accountType}</dd>
                          </div>
                        )}
                      </>
                    )}
                  </dl>

                  {acct && bank.id !== acct.bankId && (
                    <p className="transfer-hint">
                      {t(`Paying from ${bank.name}: in your app, choose the option to send money to `, `Si pagas desde ${bank.name}: en tu app, elige la opción para enviar dinero a `)}
                      <strong>{t('another bank in Belize', 'otro banco en Belice')}</strong>
                      {t(` and select ${acct.bankName}.`, ` y selecciona ${acct.bankName}.`)}
                    </p>
                  )}

                  <ol className="transfer-steps">
                    {acct && total !== null ? (
                      <>
                        <li>
                          {t(`In your ${bank.name} app, send `, `En tu app de ${bank.name}, envía `)}
                          <strong>{formatBZD(total)}</strong>
                          {t(' to the account above.', ' a la cuenta de arriba.')}
                        </li>
                        <li>
                          {t('Take a ', 'Toma una ')}
                          <strong>{t('screenshot of your completed transfer', 'captura de pantalla de tu transferencia completada')}</strong>.
                        </li>
                        <li>
                          {t(
                            'Tap “Send Order Request on WhatsApp” below and send the screenshot in the chat.',
                            'Toca “Enviar pedido por WhatsApp” abajo y envía la captura en el chat.',
                          )}
                        </li>
                      </>
                    ) : acct ? (
                      <>
                        <li>{t('Tap “Send Order Request on WhatsApp” below.', 'Toca “Enviar pedido por WhatsApp” abajo.')}</li>
                        <li>{t('Cojac’s replies with your total, including the shipping charge.', 'Cojac’s te responde con tu total, incluido el costo de envío.')}</li>
                        <li>{t(`In your ${bank.name} app, send that amount to the account above.`, `En tu app de ${bank.name}, envía ese monto a la cuenta de arriba.`)}</li>
                        <li>
                          {t('Send a ', 'Envía una ')}
                          <strong>{t('screenshot of your completed transfer', 'captura de pantalla de tu transferencia completada')}</strong>
                          {t(' in the chat.', ' en el chat.')}
                        </li>
                      </>
                    ) : (
                      <>
                        <li>{t('Tap “Send Order Request on WhatsApp” below.', 'Toca “Enviar pedido por WhatsApp” abajo.')}</li>
                        <li>
                          {total === null
                            ? t('Cojac’s replies with the account details and your total.', 'Cojac’s te responde con los datos de la cuenta y tu total.')
                            : t('Cojac’s replies with the account details.', 'Cojac’s te responde con los datos de la cuenta.')}
                        </li>
                        <li>{t(`Make the transfer in your ${bank.name} app.`, `Haz la transferencia en tu app de ${bank.name}.`)}</li>
                        <li>
                          {t('Send a ', 'Envía una ')}
                          <strong>{t('screenshot of your completed transfer', 'captura de pantalla de tu transferencia completada')}</strong>
                          {t(' in the chat.', ' en el chat.')}
                        </li>
                      </>
                    )}
                  </ol>
                  <p className="transfer-panel__note">
                    <InfoIcon size={18} />
                    <span>
                      <strong>
                        {t(
                          'Your order is placed once Cojac’s receives your transfer screenshot.',
                          'Tu pedido queda hecho cuando Cojac’s recibe la captura de tu transferencia.',
                        )}
                      </strong>
                    </span>
                  </p>
                </div>
              )}
            </>
          )}

          {method === 'cash' && (
            <p className="pay-cash">
              <CheckIcon size={18} />{' '}
              {fulfilment.id === 'pickup'
                ? t('Pay in cash when you collect your order.', 'Paga en efectivo cuando recojas tu pedido.')
                : t('Pay in cash when your order arrives.', 'Paga en efectivo cuando llegue tu pedido.')}
            </p>
          )}
        </>
      )}
    </section>
  );
}
