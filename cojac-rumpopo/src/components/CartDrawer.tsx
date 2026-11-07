import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { useCart } from '../context/CartContext';
import { formatBZD, maxQuantityFor, subtotalLabel, UNKNOWN_PRICE } from '../lib/order';
import { BottleArt } from './Art';
import { BagIcon, CloseIcon, TrashIcon } from './Icons';
import { QuantityStepper } from './ui';
import { asset } from '../lib/whatsapp';

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
              <button type="button" className="icon-btn icon-btn--sm" onClick={() => remove(r.line.key)} aria-label={`Remove ${r.product.name} (${r.sizeLabel})`}>
                <TrashIcon size={18} />
              </button>
            </div>
            <p className="cart-line__meta">
              {r.sizeLabel}
              {r.variant?.illustrative && <span className="chip chip--illustrative" style={{ marginLeft: 8 }}>Illustrative</span>}
            </p>
            <div className="cart-line__row">
              <QuantityStepper
                size="sm"
                value={r.line.quantity}
                max={maxQuantityFor(r.variant)}
                onChange={(n) => setQty(r.line.key, n)}
                label={`Quantity of ${r.product.name}`}
              />
              <span className="cart-line__price">{r.lineTotal === null ? UNKNOWN_PRICE : formatBZD(r.lineTotal)}</span>
            </div>
            {!compact && (
              <label className="cart-line__note">
                <span className="visually-hidden">Note for {r.product.name}</span>
                <input
                  className="input"
                  type="text"
                  maxLength={200}
                  placeholder="Add a note (optional) — e.g. for a gift"
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
          <h2 id="drawer-title">Your order request</h2>
          <button type="button" className="icon-btn" onClick={closeDrawer} aria-label="Close order request">
            <CloseIcon size={22} />
          </button>
        </div>
        {resolved.length === 0 ? (
          <div className="drawer__empty">
            <BagIcon size={40} />
            <p>Your order request is empty.</p>
            <Link to={routes.flavours.path} className="btn" onClick={closeDrawer}>
              Find Your Flavour
            </Link>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              <CartLines />
              <button type="button" className="drawer__clear" onClick={clear}>
                Clear order request
              </button>
            </div>
            <div className="drawer__foot">
              <div className="drawer__subtotal">
                <span>Subtotal</span>
                <strong>{subtotalLabel(totals)}</strong>
              </div>
              <p className="drawer__fine">Final total, availability and delivery are confirmed by Cojac’s on WhatsApp.</p>
              <Link to={routes.order.path} className="btn btn--whatsapp btn--block" onClick={closeDrawer}>
                Review &amp; send request
              </Link>
              <button type="button" className="btn btn--ghost-dark btn--block" onClick={closeDrawer}>
                Continue browsing
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
