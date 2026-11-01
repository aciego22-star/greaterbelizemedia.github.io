import { useEffect, useState } from 'preact/hooks';
import { PRODUCT_BY_ID, formatPrice, productTitle } from '../data/shop';
import { iconSvg, type IconName } from '../lib/icons';
import { MAX_QTY, cartCount, cartTotal, getCart, hasPriced, hasRequests, isRequest, lineKey, lineTotal, removeLine, setQty, subscribeCart, type CartLine } from '../lib/cart-store';
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
      <p class="muted">Add tools or motorcycles from the Shop, or search for anything else and add it as a request.</p>
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
            if (isRequest(l)) return <RequestRow line={l} key={lineKey(l)} />;
            const p = PRODUCT_BY_ID[l.id];
            const title = productTitle(p);
            return (
              <li class="cart-line" key={lineKey(l)}>
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
          {hasRequests(lines) && (
            <p class="summary__row summary__row--muted">
              <span>Requested items</span>
              <span>Price to be confirmed</span>
            </p>
          )}
          <p class="summary__row summary__row--muted">
            <span>Collection</span>
            <span>At a branch</span>
          </p>
        </div>
        <p class="summary__total">
          <span>{hasPriced(lines) ? 'Total' : 'To pay now'}</span>
          <span>{formatPrice(total)}</span>
        </p>
        <a class="btn btn--lg btn--block" href="/checkout/">
          <Icon name={hasPriced(lines) ? 'lock' : 'send'} /> {hasPriced(lines) ? 'Checkout' : 'Continue to request'}
        </a>
        <p class="price-note">
          {hasRequests(lines)
            ? 'The branch confirms the price and availability of requested items before you pay for them.'
            : 'February 2026 sale prices. Collect at Spanish Lookout or Belize City.'}
        </p>
      </aside>
    </div>
  );
}

/** A requested item: the name the customer typed, with no price until the branch confirms one. */
export function RequestRow({ line }: { line: Extract<CartLine, { kind: 'request' }> }) {
  return (
    <li class="cart-line cart-line--request">
      <div class="cart-line__media cart-line__media--request" aria-hidden="true">
        <Icon name="search" size={28} />
      </div>
      <div class="cart-line__info">
        <p class="cart-line__title" data-i18n-skip>
          {line.text}
        </p>
        <p class="cart-line__meta">Requested item</p>
        <p class="cart-line__meta">The branch confirms price and availability.</p>
      </div>
      <div class="cart-line__controls">
        <div class="stepper" role="group" aria-label={`Quantity of ${line.text}`}>
          <button type="button" onClick={() => setQty(line, line.qty - 1)} aria-label={line.qty === 1 ? `Remove ${line.text}` : `One fewer ${line.text}`}>
            <Icon name={line.qty === 1 ? 'trash' : 'minus'} />
          </button>
          <output aria-live="polite">{line.qty}</output>
          <button type="button" onClick={() => setQty(line, line.qty + 1)} disabled={line.qty >= MAX_QTY} aria-label={`One more ${line.text}`}>
            <Icon name="plus" />
          </button>
        </div>
        <p class="cart-line__total cart-line__total--tbc">Price to be confirmed</p>
        <button type="button" class="link-btn" onClick={() => removeLine(line)}>
          Remove<span class="sr-only"> {line.text}</span>
        </button>
      </div>
    </li>
  );
}
