import { useId, useState } from 'react';
import type { Product, ProductImage } from '../types';
import { useCart } from '../context/CartContext';
import { clampQuantity, formatBZD, isOrderable, maxQuantityFor, MAX_NOTE_LENGTH, UNKNOWN_PRICE } from '../lib/order';
import { isAcceptingOrders } from '../lib/season';
import { asset } from '../lib/whatsapp';
import { BottleArt, Sparkle } from './Art';
import { CheckIcon, PlusIcon } from './Icons';
import { AvailabilityChip, QuantityStepper } from './ui';

/**
 * Product photo: mobile 4:5 crop at 767px and below, desktop 4:3 above, WebP with
 * the supplied JPG as fallback. Shown whole (object-fit: contain) so no cap,
 * base or label is clipped.
 */
export function ProductPicture({
  image,
  mode = 'responsive',
  sizes = '(min-width: 1200px) 380px, (min-width: 768px) 50vw, 100vw',
  eager = false,
  className = '',
}: {
  image: ProductImage;
  mode?: 'responsive' | 'mobile' | 'desktop';
  sizes?: string;
  eager?: boolean;
  className?: string;
}) {
  const b = image.base ? asset(`/products/${image.base}`) : null;
  const mobileWebp = b && `${b}_Mobile_540x675.webp 540w, ${b}_Mobile_1080x1350.webp 1080w`;
  const desktopWebp = b && `${b}_Desktop_800x600.webp 800w, ${b}_Desktop_1600x1200.webp 1600w`;
  const mobileJpg = image.mobileSrc ? asset(image.mobileSrc) : null;
  const useMobileOnly = mode === 'mobile' && mobileJpg;
  return (
    <picture className={className}>
      {mode === 'responsive' && mobileWebp && <source media="(max-width: 767px)" type="image/webp" srcSet={mobileWebp} sizes="100vw" />}
      {mode === 'responsive' && mobileJpg && <source media="(max-width: 767px)" srcSet={mobileJpg} />}
      {useMobileOnly && mobileWebp && <source type="image/webp" srcSet={mobileWebp} sizes={sizes} />}
      {!useMobileOnly && desktopWebp && <source type="image/webp" srcSet={desktopWebp} sizes={sizes} />}
      <img
        src={useMobileOnly ? mobileJpg! : asset(image.src)}
        width={useMobileOnly ? 1080 : 1600}
        height={useMobileOnly ? 1350 : 1200}
        alt={image.alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </picture>
  );
}

export function FlavourVisual({ product, large = false }: { product: Product; large?: boolean }) {
  const p = product.palette;
  const img = product.images[0];
  if (img) {
    return (
      <div className={`flavour-visual flavour-visual--photo ${large ? 'flavour-visual--large' : ''}`}>
        <ProductPicture image={img} />
      </div>
    );
  }
  return (
    <div
      className={`flavour-visual ${large ? 'flavour-visual--large' : ''}`}
      style={{
        background: `radial-gradient(70% 60% at 50% 38%, ${p.cream}66, transparent 70%), linear-gradient(165deg, ${p.accent}, #2a0a10 95%)`,
      }}
    >
      <span className="flavour-visual__halo" style={{ background: `radial-gradient(circle, ${p.cream}aa, transparent 65%)` }} />
      <BottleArt palette={p} tag={product.name} className="flavour-visual__bottle" />
      <span className="flavour-visual__label">Illustration · photo coming soon</span>
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
            <fieldset className="size-picker" disabled={!canAdd}>
              <legend>Choose a size</legend>
              <div className="size-picker__options">
                {product.variants.map((v) => {
                  const off = !isOrderable(v.availability);
                  return (
                    <label key={v.variantId} className={`size-option ${variantId === v.variantId ? 'is-selected' : ''} ${off ? 'is-off' : ''}`}>
                      <input
                        type="radio"
                        name={`${uid}-size`}
                        value={v.variantId}
                        checked={variantId === v.variantId}
                        disabled={off}
                        onChange={() => setVariantId(v.variantId)}
                      />
                      <span className="size-option__size">
                        {v.bottleSize.split(' (')[0]}
                        {v.bottleSize.includes(' (') && <small> {v.bottleSize.split(' (')[1].replace(')', '')}</small>}
                      </span>
                      <span className="size-option__price">
                        {off ? 'Unavailable' : v.priceBZD !== null ? formatBZD(v.priceBZD) : 'Price TBC'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="flavour-card__tbc">Bottle sizes are confirmed by Cojac’s when you send your request.</p>
          )}
          <div className="flavour-card__price">
            <span>{variant ? `${variant.bottleSize} × ${qty}` : 'Price'}</span>
            <strong>{variant?.priceBZD != null ? formatBZD(variant.priceBZD * clampQuantity(qty, variant)) : UNKNOWN_PRICE}</strong>
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
