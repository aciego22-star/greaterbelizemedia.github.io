import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { useCart } from '../context/CartContext';
import { formatBZD, maxQuantityFor, subtotalLabel, UNKNOWN_PRICE } from '../lib/order';
import { BottleArt } from './Art';
import { BagIcon, CloseIcon, TrashIcon } from './Icons';
import { QuantityStepper } from './ui';
import { asset } from '../lib/whatsapp';
import { t } from '../i18n/lang';

export function CartLines({ compact = false }: { compact?: boolean }) {
  const { resolved, setQty, remove, setNote } = useCart();
  return (
    <ul className={`cart-lines ${compact ? 'cart-lines--compact' : ''}`}>
      {resolved.map((r) => (
        <li key={r.line.key} className="cart-line">
          <div className="cart-line__thumb" style={{ background: `linear-gradient(160deg, ${r.product.palette.cream}, ${r.product.palette.deep})` }}>
            {r.product.images[0] ? (
              <img src={asset(r.product.images[0].base ? `/products/${r.product.images[0].base}_Mobile_540x675.webp` : r.product.images[0].src)} alt="" loading="lazy" />
            ) : (
              <BottleArt palette={r.product.palette} title="" className="cart-line__bottle" />
            )}
          </div>
          <div className="cart-line__body">
            <div className="cart-line__head">
              <h3>{r.product.name}</h3>
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => remove(r.line.key)} aria-label={`${t('Remove', 'Quitar')} ${r.product.name} (${r.sizeLabel})`}>
                <TrashIcon size={18} />
              </button>
            </div>
            <p className="cart-line__meta">
              {r.sizeLabel}
              {r.variant?.illustrative && <span className="chip chip--illustrative" style={{ marginLeft: 8 }}>{t('Illustrative', 'Ilustrativo')}</span>}
            </p>
            <div className="cart-line__row">
              <QuantityStepper
                size="sm"
                value={r.line.quantity}
                max={maxQuantityFor(r.variant)}
                onChange={(n) => setQty(r.line.key, n)}
                label={`${t('Quantity of', 'Cantidad de')} ${r.product.name}`}
              />
              <span className="cart-line__price">{r.lineTotal === null ? UNKNOWN_PRICE : formatBZD(r.lineTotal)}</span>
            </div>
            {!compact && (
              <label className="cart-line__note">
                <span className="visually-hidden">
                  {t('Note for', 'Nota para')} {r.product.name}
                </span>
                <input
                  className="input"
                  type="text"
                  maxLength={200}
                  placeholder={t('Add a note (optional), e.g. for a gift', 'Añade una nota (opcional), p. ej. para regalo')}
                  value={r.line.note}
                  onChange={(e) => setNote(r.line.key, e.target.value)}
                />
              </label>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export function CartDrawer() {
  const { drawerOpen, closeDrawer, resolved, totals, clear } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    lastFocus.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, select, textarea');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [drawerOpen, closeDrawer]);

  if (!drawerOpen) return null;
  return (
    <div className="drawer-root">
      <div className="drawer-backdrop" onClick={closeDrawer} />
      <div className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" ref={panel} tabIndex={-1}>
        <div className="drawer__head">
          <h2 id="drawer-title">{t('Your order request', 'Tu pedido')}</h2>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label={t('Close order request', 'Cerrar pedido')}>
            <CloseIcon size={22} />
          </button>
        </div>
        {resolved.length === 0 ? (
          <div className="drawer__empty">
            <BagIcon size={40} />
            <p>{t('Your order request is empty.', 'Tu pedido está vacío.')}</p>
            <Link to={routes.flavours.path} className="btn" onClick={closeDrawer}>
              {routes.flavours.nav}
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <CartLines />
              <button type="button" className="drawer__clear" onClick={clear}>
                {t('Clear order request', 'Vaciar pedido')}
              </button>
            </div>
            <div className="drawer__foot">
              <div className="drawer__subtotal">
                <span>{t('Subtotal', 'Subtotal')}</span>
                <strong>{subtotalLabel(totals)}</strong>
              </div>
              <p className="drawer__fine">
                {t(
                  'Final total, availability and delivery are confirmed by Cojac’s on WhatsApp.',
                  'Cojac’s confirma por WhatsApp el total final, la disponibilidad y la entrega.',
                )}
              </p>
              <Link to={routes.order.path} className="btn btn--whatsapp btn--block" onClick={closeDrawer}>
                {t('Review & send request', 'Revisar y enviar pedido')}
              </Link>
              <button type="button" className="btn btn--ghost-dark btn--block" onClick={closeDrawer}>
                {t('Continue browsing', 'Seguir viendo')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
