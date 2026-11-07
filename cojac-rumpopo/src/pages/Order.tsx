import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes';
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
import { t } from '../i18n/lang';

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
    fulfilment: !fulfilment ? t('Please choose delivery, pickup or shipping.', 'Elige entrega, recoger o envío.') : '',
    name: details.name.trim().length < 2 ? t('Please enter your name.', 'Escribe tu nombre.') : '',
    address: fulfilment?.asksForArea && details.area.trim().length < 6 ? t('Please enter your exact address.', 'Escribe tu dirección exacta.') : '',
    payment: fulfilment && !payMethod ? t('Please choose how you will pay.', 'Elige cómo vas a pagar.') : '',
    bank: payMethod === 'transfer' && !payBank ? t('Please choose your bank.', 'Elige tu banco.') : '',
    age: !ageOk ? t(`Please confirm you are ${site.alcohol.legalAge} or older.`, `Confirma que tienes ${site.alcohol.legalAge} años o más.`) : '',
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
        <PageHero title={t('Order requests are closed', 'Los pedidos están cerrados')} lead={`${site.season.closedHeadline} ${site.season.closedText}`} />
        <section className="section section--paper">
          <div className="container--narrow center">
            <Link to={routes.flavours.path} className="btn">
              {t('See our flavours', 'Ver nuestros sabores')}
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <PageHero
        title={t('Your Order Request', 'Tu pedido')}
        lead={t(
          'Choose your flavours, tell us where to bring them and how you’ll pay (cash on delivery or bank transfer), then send your request to Cojac’s on WhatsApp.',
          'Elige tus sabores, dinos a dónde llevarlos y cómo vas a pagar (efectivo contra entrega o transferencia bancaria), y envía tu pedido a Cojac’s por WhatsApp.',
        )}
      />
      <section className="section section--paper order-section">
        <div className="container">
          {resolved.length === 0 ? (
            <div className="order-empty card">
              <BagIcon size={44} />
              <h2 className="display-m">{t('Your order request is empty', 'Tu pedido está vacío')}</h2>
              <p>
                {t(
                  'Choose your flavours and quantities first, then come back here to send everything in one WhatsApp message.',
                  'Primero elige tus sabores y cantidades, y luego vuelve aquí para enviarlo todo en un solo mensaje de WhatsApp.',
                )}
              </p>
              <div className="btn-row" style={{ justifyContent: 'center' }}>
                <Link to={routes.flavours.path} className="btn">
                  {routes.flavours.nav}
                </Link>
                {generalEnquiryUrl() && (
                  <a href={generalEnquiryUrl()!} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark">
                    <WhatsAppIcon /> {t('Just send us a question', 'Solo envíanos una pregunta')}
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
                    <h2 id="step-items">{t('Your flavours', 'Tus sabores')}</h2>
                    <Link to={routes.flavours.path} className="text-link order-step__aside">
                      {t('+ Add more', '+ Añadir más')}
                    </Link>
                  </div>
                  <CartLines />
                  <button type="button" className="drawer__clear" onClick={clear}>
                    {t('Clear order request', 'Vaciar pedido')}
                  </button>
                </section>

                <section className="order-step card" aria-labelledby="step-fulfil">
                  <div className="order-step__head">
                    <span className="order-step__num">2</span>
                    <h2 id="step-fulfil">{t('Your details', 'Tus datos')}</h2>
                  </div>
                  <fieldset
                    className="field"
                    id="fulfilment-group"
                    tabIndex={-1}
                    aria-describedby={attempted && errors.fulfilment ? 'fulfilment-error' : undefined}
                  >
                    <legend>{t('Delivery, pickup or shipping?', '¿Entrega, recoger o envío?')} *</legend>
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
                              {feeLabel(f)}
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
                    <label htmlFor="name">{t('Your name', 'Tu nombre')} *</label>
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
                      <label htmlFor="area">{fulfilment.areaLabel ?? t('Exact address', 'Dirección exacta')} *</label>
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
                      <label htmlFor="date">{t('Preferred date (optional)', 'Fecha preferida (opcional)')}</label>
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
                    <label htmlFor="notes">{t('Notes for Cojac’s (optional)', 'Notas para Cojac’s (opcional)')}</label>
                    <textarea
                      id="notes"
                      className="textarea"
                      maxLength={MAX_ORDER_NOTES_LENGTH}
                      value={details.notes}
                      onChange={(e) => setDetails({ notes: e.target.value })}
                      placeholder={t('e.g. best time to deliver', 'p. ej. la mejor hora para entregar')}
                    />
                    <p className="hint">{t('Please don’t include card or payment details.', 'No incluyas datos de tarjeta ni de pago.')}</p>
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
                  <h2 id="step-send">{t('Review & send', 'Revisar y enviar')}</h2>
                </div>
                <ul className="summary-lines">
                  {resolved.map((r) => (
                    <li key={r.line.key}>
                      <span>
                        {r.product.name} <small>{r.sizeLabel} × {r.line.quantity}</small>
                      </span>
                      <span>{r.lineTotal === null ? t('TBC', 'Por confirmar') : formatBZD(r.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="summary-totals">
                  <div>
                    <dt>{t('Subtotal', 'Subtotal')}</dt>
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
                      <dt>{t('Total', 'Total')}</dt>
                      <dd>{formatBZD(totals.pricedSubtotal + fulfilment.feeBZD)}</dd>
                    </div>
                  )}
                  {payMethod && (
                    <div>
                      <dt>{t('Payment', 'Pago')}</dt>
                      <dd>
                        {payMethod === 'cash'
                          ? fulfilment?.id === 'pickup'
                            ? t('Cash at pickup', 'Efectivo al recoger')
                            : t('Cash on delivery', 'Efectivo contra entrega')
                          : `${t('Bank transfer', 'Transferencia bancaria')}${payBank ? ` (${payBank.name})` : ''}`}
                      </dd>
                    </div>
                  )}
                  {details.preferredDate && (
                    <div>
                      <dt>{t('Preferred date', 'Fecha preferida')}</dt>
                      <dd>{formatLongDate(details.preferredDate)}</dd>
                    </div>
                  )}
                </dl>
                <p className="summary-note">
                  <InfoIcon size={16} /> {t('Cojac’s will confirm availability and payment on WhatsApp.', 'Cojac’s confirmará la disponibilidad y el pago por WhatsApp.')}
                </p>

                <details className="message-preview">
                  <summary>{t('Preview your WhatsApp message', 'Vista previa de tu mensaje de WhatsApp')}</summary>
                  <pre>{message}</pre>
                </details>

                <label className={`check age-check ${attempted && errors.age ? 'has-error' : ''}`}>
                  <input id="age-confirm" type="checkbox" checked={ageOk} onChange={(e) => setAgeOk(e.target.checked)} />
                  <span>
                    {t(
                      `I confirm I am ${site.alcohol.legalAge} or older. I understand rumpopo contains alcohol and may contain allergens such as egg, dairy or nuts.`,
                      `Confirmo que tengo ${site.alcohol.legalAge} años o más. Entiendo que el rumpopo contiene alcohol y puede contener alérgenos como huevo, lácteos o nueces.`,
                    )}
                  </span>
                </label>
                {attempted && errors.age && <p className="field-error">{errors.age}</p>}

                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp btn--block send-btn" onClick={onSend}>
                    <WhatsAppIcon size={22} /> {t('Send Order Request on WhatsApp', 'Enviar pedido por WhatsApp')}
                  </a>
                ) : (
                  <>
                    <button type="button" className="btn btn--whatsapp btn--block send-btn" disabled aria-describedby="no-number">
                      <WhatsAppIcon size={22} /> {t('Send Order Request on WhatsApp', 'Enviar pedido por WhatsApp')}
                    </button>
                    <p className="notice notice--danger" id="no-number">
                      {destination.ok === false && destination.reason === 'invalid'
                        ? t(
                            'The WhatsApp order number is not set up correctly yet. Please copy your order details below and contact Cojac’s directly.',
                            'El número de WhatsApp para pedidos aún no está bien configurado. Copia los detalles de tu pedido abajo y contacta a Cojac’s directamente.',
                          )
                        : t(
                            'Our WhatsApp order line is being set up. Please copy your order details below and send them to Cojac’s directly.',
                            'Estamos configurando nuestra línea de pedidos por WhatsApp. Copia los detalles de tu pedido abajo y envíaselos a Cojac’s directamente.',
                          )}
                    </p>
                    {previewUrl && (
                      <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark btn--block" onClick={onSend}>
                        {t('Internal preview: open WhatsApp & choose a chat', 'Vista interna: abre WhatsApp y elige un chat')}
                      </a>
                    )}
                  </>
                )}
                {destination.ok && destination.source === 'qa' && <p className="qa-flag">{t('QA test line, not the business number', 'Línea de prueba, no es el número del negocio')}</p>}

                <button type="button" className="btn btn--ghost-dark btn--block" onClick={onCopy}>
                  <CopyIcon size={18} /> {t('Copy order details', 'Copiar detalles del pedido')}
                </button>

                <div className="send-status" role="status" aria-live="polite">
                  {status === 'opened' && (
                    <p className="notice">
                      <WhatsAppIcon size={20} />
                      <span>
                        {t(
                          'WhatsApp will open with your order request. Please send the message to complete your enquiry. Cojac’s will confirm details directly.',
                          'WhatsApp se abrirá con tu pedido. Envía el mensaje para completar tu solicitud. Cojac’s confirmará los detalles directamente.',
                        )}
                        <br />
                        <small>
                          {t(
                            'WhatsApp didn’t open? Use “Copy order details” and paste it into a chat with Cojac’s.',
                            '¿No se abrió WhatsApp? Usa “Copiar detalles del pedido” y pégalo en un chat con Cojac’s.',
                          )}
                        </small>
                      </span>
                    </p>
                  )}
                  {status === 'copied' && (
                    <p className="notice notice--soft">
                      <CheckIcon size={20} />{' '}
                      {t(
                        'Order details copied. Paste them into a WhatsApp chat with Cojac’s and press Send.',
                        'Detalles del pedido copiados. Pégalos en un chat de WhatsApp con Cojac’s y presiona Enviar.',
                      )}
                    </p>
                  )}
                  {status === 'copy-failed' && (
                    <p className="notice notice--danger">
                      {t(
                        'Copying isn’t available in this browser. Open “Preview your WhatsApp message” above and copy the text manually.',
                        'Este navegador no permite copiar. Abre “Vista previa de tu mensaje de WhatsApp” arriba y copia el texto a mano.',
                      )}
                    </p>
                  )}
                </div>
                <p className="privacy-fine">
                  {t(
                    'WhatsApp is a separate service run by Meta and has its own privacy policy. This website doesn’t store your order or take payments.',
                    'WhatsApp es un servicio independiente de Meta y tiene su propia política de privacidad. Este sitio web no guarda tu pedido ni recibe pagos.',
                  )}{' '}
                  <Link to={routes.privacy.path} className="text-link">
                    {t('Privacy', 'Privacidad')}
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
