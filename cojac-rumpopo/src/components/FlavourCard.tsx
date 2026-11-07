import { useId, useRef, useState, type MouseEvent } from 'react';
import type { Product, ProductImage } from '../types';
import { useCart } from '../context/CartContext';
import { clampQuantity, formatBZD, isOrderable, maxQuantityFor, MAX_NOTE_LENGTH, UNKNOWN_PRICE } from '../lib/order';
import { isAcceptingOrders } from '../lib/season';
import { flyToCart } from '../lib/flyToCart';
import { asset } from '../lib/whatsapp';
import { BottleArt, Sparkle } from './Art';
import { CheckIcon, PlusIcon } from './Icons';
import { AvailabilityChip, QuantityStepper } from './ui';
import { t } from '../i18n/lang';

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
      <span className="flavour-visual__label">{t('Illustration · photo coming soon', 'Ilustración · foto muy pronto')}</span>
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
  const cardRef = useRef<HTMLElement>(null);

  const accepting = isAcceptingOrders();
  const hasVariants = product.variants.length > 0;
  const allSoldOut = hasVariants && orderable.length === 0;
  const availability = variant?.availability ?? (allSoldOut ? 'sold-out' : product.confirmedThisSeason ? 'available' : 'ask');
  const canAdd = accepting && !allSoldOut;

  const onAdd = (e: MouseEvent<HTMLButtonElement>) => {
    const count = clampQuantity(qty, variant);
    add(product.id, variantId, count, note.trim());
    flyToCart(cardRef.current?.querySelector('.flavour-visual img') ?? null, e.currentTarget, count);
    setAdded(true);
    setQty(1);
    setNote('');
    setShowNote(false);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <article className="flavour-card" ref={cardRef} aria-labelledby={`${uid}-name`}>
      <FlavourVisual product={product} />
      <div className="flavour-card__body">
        <div className="flavour-card__chips">
          <AvailabilityChip value={availability} />
          {variant?.illustrative && <span className="chip chip--illustrative">{t('Illustrative sizes', 'Tamaños ilustrativos')}</span>}
          {product.dietaryLabel?.startsWith('Vegan') && <span className="chip chip--vegan">{t('Vegan', 'Vegano')}</span>}
        </div>
        <h3 className="flavour-card__name" id={`${uid}-name`}>
          {product.name}
        </h3>
        <p className="flavour-card__desc">{product.description}</p>

        <div className="flavour-card__controls">
          {hasVariants ? (
            <fieldset className="size-picker" disabled={!canAdd}>
              <legend>{t('Choose a size', 'Elige un tamaño')}</legend>
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
                        {off ? t('Unavailable', 'No disponible') : v.priceBZD !== null ? formatBZD(v.priceBZD) : t('Price TBC', 'Precio por confirmar')}
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          ) : (
            <p className="flavour-card__tbc">
              {t('Bottle sizes are confirmed by Cojac’s when you send your request.', 'Cojac’s confirma los tamaños de botella cuando envías tu pedido.')}
            </p>
          )}
          <div className="flavour-card__price">
            <span>{variant ? `${variant.bottleSize} × ${qty}` : t('Price', 'Precio')}</span>
            <strong>{variant?.priceBZD != null ? formatBZD(variant.priceBZD * clampQuantity(qty, variant)) : UNKNOWN_PRICE}</strong>
          </div>
        </div>

        {canAdd ? (
          <>
            <div className="flavour-card__buy">
              <QuantityStepper value={qty} onChange={setQty} max={maxQuantityFor(variant)} label={`${t('Quantity of', 'Cantidad de')} ${product.name}`} />
              <button type="button" className={`btn flavour-card__add ${added ? 'is-added' : ''}`} onClick={onAdd}>
                {added ? (
                  <>
                    <CheckIcon size={18} /> {t('Added', 'Añadido')}
                  </>
                ) : (
                  <>
                    <PlusIcon size={18} /> {t('Add to Order', 'Añadir al pedido')}
                  </>
                )}
              </button>
            </div>
            <div className="flavour-card__extras">
              {showNote ? (
                <label className="flavour-card__note">
                  <span>{t('Note for this flavour (optional)', 'Nota para este sabor (opcional)')}</span>
                  <input
                    className="input"
                    type="text"
                    value={note}
                    maxLength={MAX_NOTE_LENGTH}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={t('e.g. one bottle for a gift', 'p. ej. una botella para regalo')}
                  />
                </label>
              ) : (
                <button type="button" className="link-btn" onClick={() => setShowNote(true)}>
                  {t('+ Add a note', '+ Añadir una nota')}
                </button>
              )}
              {added && (
                <button type="button" className="link-btn" onClick={openDrawer}>
                  {t('View order request →', 'Ver pedido →')}
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="notice notice--soft flavour-card__closed">
            {allSoldOut
              ? t('Sold out for this season.', 'Agotado esta temporada.')
              : t('Order requests are closed until next season.', 'Los pedidos están cerrados hasta la próxima temporada.')}
          </p>
        )}

        <details className="flavour-card__details">
          <summary>{t('Ingredients, allergens & alcohol', 'Ingredientes, alérgenos y alcohol')}</summary>
          <dl>
            <dt>{t('Alcohol', 'Alcohol')}</dt>
            <dd>{product.alcoholInformation ?? t('Contains alcohol. For adults of legal drinking age only.', 'Contiene alcohol. Solo para adultos mayores de edad.')}</dd>
            <dt>{t('Allergens', 'Alérgenos')}</dt>
            <dd>
              {product.allergens && product.allergens.length
                ? `${t('Contains', 'Contiene')}: ${product.allergens.join(', ')}.`
                : t(
                    'Allergen information for this flavour is being confirmed. Rumpopo may contain egg and dairy. Please ask Cojac’s on WhatsApp about ingredients before ordering.',
                    'La información de alérgenos de este sabor se está confirmando. El rumpopo puede contener huevo y lácteos. Pregúntale a Cojac’s por WhatsApp sobre los ingredientes antes de pedir.',
                  )}
            </dd>
            {product.ingredientsDisclosure && (
              <>
                <dt>{t('Ingredients', 'Ingredientes')}</dt>
                <dd>{product.ingredientsDisclosure}</dd>
              </>
            )}
            {product.dietaryLabel && (
              <>
                <dt>{t('Dietary', 'Dieta')}</dt>
                <dd>{product.dietaryLabel}</dd>
              </>
            )}
            {product.leadTime && (
              <>
                <dt>{t('Lead time', 'Tiempo de preparación')}</dt>
                <dd>{product.leadTime}</dd>
              </>
            )}
          </dl>
        </details>
      </div>
    </article>
  );
}
