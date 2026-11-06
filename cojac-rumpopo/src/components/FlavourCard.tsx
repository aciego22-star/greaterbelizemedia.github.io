import { useId, useState } from 'react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { clampQuantity, formatBZD, isOrderable, maxQuantityFor, MAX_NOTE_LENGTH, UNKNOWN_PRICE } from '../lib/order';
import { isAcceptingOrders } from '../lib/season';
import { asset } from '../lib/whatsapp';
import { BottleArt, Sparkle } from './Art';
import { CheckIcon, PlusIcon } from './Icons';
import { AvailabilityChip, QuantityStepper } from './ui';

export function FlavourVisual({ product, large = false }: { product: Product; large?: boolean }) {
  const p = product.palette;
  return (
    <div
      className={`flavour-visual ${large ? 'flavour-visual--large' : ''}`}
      style={{
        background: `radial-gradient(70% 60% at 50% 38%, ${p.cream}66, transparent 70%), linear-gradient(165deg, ${p.accent}, #2a0a10 95%)`,
      }}
    >
      <span className="flavour-visual__halo" style={{ background: `radial-gradient(circle, ${p.cream}aa, transparent 65%)` }} />
      {product.images[0] ? (
        <img src={asset(product.images[0].src)} alt={product.images[0].alt} loading="lazy" decoding="async" />
      ) : (
        <>
          <BottleArt palette={p} tag={product.name} className="flavour-visual__bottle" />
          <span className="flavour-visual__label">Illustration · photo coming soon</span>
        </>
      )}
      <Sparkle className="flavour-visual__spark s1" size={10} />
      <Sparkle className="flavour-visual__spark s2" size={7} />
    </div>
  );
}

/** Full catalogue card with size, quantity, note and Add to Order. */
export function FlavourCard({ product }: { product: Product }) {
  const { add, openDrawer } = useCart();
  const uid = useId();
  const orderable = product.variants.filter((v) => isOrderable(v.availability));
  const [variantId, setVariantId] = useState<string | null>(orderable[0]?.variantId ?? null);
  const variant = product.variants.find((v) => v.variantId === variantId) ?? null;
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState('');
  const [showNote, setShowNote] = useState(false);
  const [added, setAdded] = useState(false);

  const accepting = isAcceptingOrders();
  const hasVariants = product.variants.length > 0;
  const allSoldOut = hasVariants && orderable.length === 0;
  const availability = variant?.availability ?? (allSoldOut ? 'sold-out' : product.confirmedThisSeason ? 'available' : 'ask');
  const canAdd = accepting && !allSoldOut;

  const onAdd = () => {
    add(product.id, variantId, clampQuantity(qty, variant), note.trim());
    setAdded(true);
    setQty(1);
    setNote('');
    setShowNote(false);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <article className="flavour-card" aria-labelledby={`${uid}-name`}>
      <FlavourVisual product={product} />
      <div className="flavour-card__body">
        <div className="flavour-card__chips">
          <AvailabilityChip value={availability} />
          {variant?.illustrative && <span className="chip chip--illustrative">Illustrative sizes</span>}
        </div>
        <p className="flavour-card__subtitle">{product.subtitle}</p>
        <h3 className="flavour-card__name" id={`${uid}-name`}>
          {product.name}
        </h3>
        <p className="flavour-card__desc">{product.description}</p>

        <div className="flavour-card__controls">
          {hasVariants ? (
            <div className="field field--inline">
              <label htmlFor={`${uid}-size`}>Bottle size</label>
              <select id={`${uid}-size`} className="select" value={variantId ?? ''} onChange={(e) => setVariantId(e.target.value)} disabled={!canAdd}>
                {product.variants.map((v) => (
                  <option key={v.variantId} value={v.variantId} disabled={!isOrderable(v.availability)}>
                    {v.bottleSize}
                    {v.priceBZD !== null ? ` — ${formatBZD(v.priceBZD)}` : ''}
                    {!isOrderable(v.availability) ? ' (unavailable)' : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <p className="flavour-card__tbc">Bottle sizes are confirmed by Cojac’s when you send your request.</p>
          )}
          <div className="flavour-card__price">
            <span>Price</span>
            <strong>{variant?.priceBZD != null ? formatBZD(variant.priceBZD) : UNKNOWN_PRICE}</strong>
          </div>
        </div>

        {canAdd ? (
          <>
            <div className="flavour-card__buy">
              <QuantityStepper value={qty} onChange={setQty} max={maxQuantityFor(variant)} label={`Quantity of ${product.name}`} />
              <button type="button" className={`btn flavour-card__add ${added ? 'is-added' : ''}`} onClick={onAdd}>
                {added ? (
                  <>
                    <CheckIcon size={18} /> Added
                  </>
                ) : (
                  <>
                    <PlusIcon size={18} /> Add to Order
                  </>
                )}
              </button>
            </div>
            <div className="flavour-card__extras">
              {showNote ? (
                <label className="flavour-card__note">
                  <span>Note for this flavour (optional)</span>
                  <input
                    className="input"
                    type="text"
                    value={note}
                    maxLength={MAX_NOTE_LENGTH}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. one bottle for a gift"
                  />
                </label>
              ) : (
                <button type="button" className="link-btn" onClick={() => setShowNote(true)}>
                  + Add a note
                </button>
              )}
              {added && (
                <button type="button" className="link-btn" onClick={openDrawer}>
                  View order request →
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="notice notice--soft flavour-card__closed">
            {allSoldOut ? 'Sold out for this season.' : 'Order requests are closed until next season.'}
          </p>
        )}

        <details className="flavour-card__details">
          <summary>Ingredients, allergens &amp; alcohol</summary>
          <dl>
            <dt>Alcohol</dt>
            <dd>{product.alcoholInformation ?? 'Contains alcohol. For adults of legal drinking age only.'}</dd>
            <dt>Allergens</dt>
            <dd>
              {product.allergens && product.allergens.length
                ? `Contains: ${product.allergens.join(', ')}.`
                : 'Allergen information for this flavour is being confirmed. Rumpopo may contain egg and dairy — please ask Cojac’s on WhatsApp about ingredients before ordering.'}
            </dd>
            {product.ingredientsDisclosure && (
              <>
                <dt>Ingredients</dt>
                <dd>{product.ingredientsDisclosure}</dd>
              </>
            )}
            {product.dietaryLabel && (
              <>
                <dt>Dietary</dt>
                <dd>{product.dietaryLabel}</dd>
              </>
            )}
            {product.leadTime && (
              <>
                <dt>Lead time</dt>
                <dd>{product.leadTime}</dd>
              </>
            )}
          </dl>
        </details>
      </div>
    </article>
  );
}
