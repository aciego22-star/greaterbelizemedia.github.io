import { useEffect, useRef, useState } from 'react';
import { useBasket } from './BasketProvider';
import { QuantityControl } from './QuantityControl';
import { productById, hasNumericPrice, requiresReview } from '../lib/catalog';
import { formatBzd, priceLabel } from '../lib/format';
import { buildBasketMessage, fulfilmentLabels, whatsappUrl } from '../lib/whatsapp';
import { PlaceholderMedia } from '../components/PlaceholderMedia';
import type { FulfilmentOption } from '../data/types';

/**
 * Slide-over basket (full-screen sheet on mobile via CSS).
 * SEARCH → VIEW → ADD TO BASKET → SEND TO WHATSAPP.
 */
export function BasketDrawer() {
  const { lines, summary, isOpen, closeBasket, setQuantity, remove, clear } = useBasket();
  const [fulfilment, setFulfilment] = useState<FulfilmentOption>('pickup');
  const [notes, setNotes] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeBasket();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, closeBasket]);

  if (!isOpen) return null;

  const message = buildBasketMessage(lines, (id) => productById.get(id), fulfilment, notes);
  const url = whatsappUrl(message);

  return (
    <div className="drawer-overlay" onClick={closeBasket}>
      <div
        className="basket-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Your request basket"
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="basket-head">
          <h2>Your Request Basket</h2>
          <button type="button" className="icon-btn" onClick={closeBasket} aria-label="Close basket">
            ✕
          </button>
        </header>

        {lines.length === 0 ? (
          <div className="basket-empty">
            <p>Your basket is empty.</p>
            <p className="text-muted">Search the catalogue and add products to build a WhatsApp request for Cosmic Pharmacy.</p>
          </div>
        ) : (
          <>
            <ul className="basket-lines">
              {lines.map((line) => {
                const p = productById.get(line.productId);
                if (!p) return null;
                return (
                  <li key={line.productId} className="basket-line">
                    <div className="basket-thumb">
                      <PlaceholderMedia note={p.imageAlt} compact />
                    </div>
                    <div className="basket-line-info">
                      <span className="basket-line-name">{p.name}</span>
                      {p.brand && <span className="basket-line-brand">{p.brand}</span>}
                      <span className="basket-line-price num">
                        {priceLabel(p)}
                        {hasNumericPrice(p) && line.quantity > 1 && (
                          <> · line {formatBzd((p.priceBzd as number) * line.quantity)}</>
                        )}
                      </span>
                      {requiresReview(p) && <span className="badge badge-review">Pharmacist review</span>}
                    </div>
                    <div className="basket-line-actions">
                      <QuantityControl value={line.quantity} onChange={(q) => setQuantity(line.productId, q)} label={p.name} />
                      <button type="button" className="link-btn" onClick={() => remove(line.productId)}>
                        Remove
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="basket-summary">
              <div className="basket-subtotal">
                <span>Estimated subtotal{summary.confirmPriceLineCount > 0 ? ' (priced items only)' : ''}</span>
                <strong className="num">{formatBzd(summary.subtotalBzd)}</strong>
              </div>
              {summary.confirmPriceLineCount > 0 && (
                <p className="text-muted basket-note">
                  {summary.confirmPriceLineCount} item{summary.confirmPriceLineCount > 1 ? 's' : ''} need
                  {summary.confirmPriceLineCount > 1 ? '' : 's'} price confirmation from Cosmic and {summary.confirmPriceLineCount > 1 ? 'are' : 'is'} not
                  included in the estimate.
                </p>
              )}

              <div className="field">
                <label htmlFor="fulfilment">Fulfilment preference</label>
                <select id="fulfilment" value={fulfilment} onChange={(e) => setFulfilment(e.target.value as FulfilmentOption)}>
                  {(Object.keys(fulfilmentLabels) as FulfilmentOption[]).map((key) => (
                    <option key={key} value={key}>
                      {fulfilmentLabels[key]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="basket-notes">Order notes (optional)</label>
                <textarea
                  id="basket-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything Cosmic should know about this request"
                />
              </div>

              <p className="notice">
                Sending your basket creates a product request, not a completed purchase. Cosmic Pharmacy will confirm availability, final
                pricing, suitability requirements, prescription requirements, delivery or shipping charges, and payment arrangements.
              </p>

              <a className="btn btn-whatsapp btn-block" href={url} target="_blank" rel="noopener noreferrer">
                Send Request to Cosmic via WhatsApp
              </a>
              <button type="button" className="link-btn basket-clear" onClick={clear}>
                Clear basket
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
