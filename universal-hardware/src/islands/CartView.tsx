import { useEffect, useState } from 'preact/hooks';
import { PRODUCT_BY_ID, formatPrice, productTitle } from '../data/shop';
import { iconSvg, type IconName } from '../lib/icons';
import { MAX_QTY, cartCount, cartTotal, getCart, lineTotal, removeLine, setQty, subscribeCart, type CartLine } from '../lib/cart-store';
import { SitePicture } from './SitePicture';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

export function useCart(): CartLine[] {
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => {
    setLines(getCart());
    return subscribeCart(setLines);
  }, []);
  return lines;
}

export function CartEmpty() {
  return (
    <div class="cart-empty">
      <p class="h3">Your cart is empty.</p>
      <p class="muted">Add tools or motorcycles from the Shop, then come back here to check out.</p>
      <a class="btn" href="/shop/">
        Go to the Shop <Icon name="arrow-right" />
      </a>
    </div>
  );
}

export default function CartView() {
  const lines = useCart();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) return <p class="muted island-loading">Loading your cart…</p>;
  if (!lines.length) return <CartEmpty />;

  const n = cartCount(lines);
  const total = cartTotal(lines);
  return (
    <div class="cart">
      <div>
        <h2 class="sr-only">Items</h2>
        <ul class="cart-lines">
          {lines.map((l) => {
            const p = PRODUCT_BY_ID[l.id];
            const title = productTitle(p);
            return (
              <li class="cart-line" key={`${l.id}|${l.colour ?? ''}`}>
                <a class="cart-line__media" href={`/shop/${p.id}/`} tabIndex={-1} aria-hidden="true">
                  <div class="photo-stage">
                    <SitePicture image={p.image} decorative />
                  </div>
                </a>
                <div class="cart-line__info">
                  <p class="cart-line__title">
                    <a href={`/shop/${p.id}/`}>{title}</a>
                  </p>
                  <p class="cart-line__meta">{p.name}</p>
                  <p class="cart-line__meta">
                    {l.colour ? `${l.colour} · ` : ''}
                    {formatPrice(p.price)} each
                  </p>
                </div>
                <div class="cart-line__controls">
                  <div class="stepper" role="group" aria-label={`Quantity of ${title}`}>
                    <button type="button" onClick={() => setQty(l, l.qty - 1)} aria-label={l.qty === 1 ? `Remove ${title}` : `One fewer ${title}`}>
                      <Icon name={l.qty === 1 ? 'trash' : 'minus'} />
                    </button>
                    <output aria-live="polite">{l.qty}</output>
                    <button type="button" onClick={() => setQty(l, l.qty + 1)} disabled={l.qty >= MAX_QTY} aria-label={`One more ${title}`}>
                      <Icon name="plus" />
                    </button>
                  </div>
                  <p class="cart-line__total">{formatPrice(lineTotal(l))}</p>
                  <button type="button" class="link-btn" onClick={() => removeLine(l)}>
                    Remove<span class="sr-only"> {title}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <p style={{ marginTop: '18px' }}>
          <a class="link-arrow" href="/shop/">
            <Icon name="arrow-left" size={16} /> Continue shopping
          </a>
        </p>
      </div>
      <aside class="summary" aria-labelledby="cart-summary-title">
        <h2 class="summary__title" id="cart-summary-title">
          Order summary
        </h2>
        <div class="summary__rows">
          <p class="summary__row">
            <span>
              {n} {n === 1 ? 'item' : 'items'}
            </span>
            <span>{formatPrice(total)}</span>
          </p>
          <p class="summary__row summary__row--muted">
            <span>Collection</span>
            <span>At a branch</span>
          </p>
        </div>
        <p class="summary__total">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </p>
        <a class="btn btn--lg btn--block" href="/checkout/">
          <Icon name="lock" /> Checkout
        </a>
        <p class="price-note">
          February 2026 sale prices. Collect at Spanish Lookout or Belize City.
        </p>
      </aside>
    </div>
  );
}
