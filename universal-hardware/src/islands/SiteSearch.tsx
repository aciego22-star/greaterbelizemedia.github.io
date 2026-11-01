/**
 * Site search: one box for the Shop, the product categories and the brands.
 * Shop items go straight into the cart with one tap. Anything the site does
 * not list can be added to the cart as a request, which the branch prices and
 * confirms before the customer pays for it. Loaded the first time the panel
 * opens; it searches local data only and makes no network request.
 */
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { SHOP_GROUPS, SHOP_PRODUCTS, formatPrice, productTitle, type ShopProduct } from '../data/shop';
import { BRANDS } from '../data/brands';
import { POPULAR_SEARCHES, normalize, searchCategories, tokens, wordMatch } from '../lib/search';
import { addRequest, addToCart, MAX_REQUEST_LEN } from '../lib/cart-store';
import { toast } from '../lib/site-state';
import { iconSvg, type IconName } from '../lib/icons';
import { setBackgroundInert, useFocusTrap } from '../lib/ui-hooks';
import { SitePicture } from './SitePicture';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

// Everyday words (English and Spanish) for what each product is.
const SYNONYMS: [RegExp, string][] = [
  [/drill|hammer/i, 'drill taladro rotomartillo'],
  [/grinder/i, 'grinder esmeril amoladora pulidora'],
  [/saw/i, 'saw sierra'],
  [/sander/i, 'sander lijadora'],
  [/trimmer|brushcutter/i, 'trimmer weed eater desbrozadora chapeadora'],
  [/pressure washer/i, 'pressure washer hidrolavadora lavadora a presion'],
  [/battery/i, 'battery bateria'],
  [/charger/i, 'charger cargador'],
  [/scooter/i, 'scooter moto motocicleta'],
  [/bike|street|trail|wheel/i, 'motorcycle motorbike moto motocicleta'],
];
const GROUP_LABEL = Object.fromEntries(SHOP_GROUPS.map((g) => [g.id, g.label]));

const PRODUCT_INDEX = SHOP_PRODUCTS.map((p) => ({
  p,
  text: normalize(
    `${p.brand} ${p.model} ${p.model.replace(/-/g, '')} ${p.name} ${GROUP_LABEL[p.group]} ${SYNONYMS.filter(([re]) => re.test(`${p.name} ${p.group}`))
      .map(([, w]) => w)
      .join(' ')}`,
  ),
}));

function searchProducts(q: string): ShopProduct[] {
  const qts = tokens(q);
  if (!qts.length) return [];
  return PRODUCT_INDEX.map(({ p, text }) => {
    let score = 0;
    for (const qt of qts) {
      const m = wordMatch(qt, text);
      if (!m) return { p, score: 0 };
      score += m;
    }
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.p.price - b.p.price)
    .map((x) => x.p);
}

function searchBrands(q: string) {
  const qts = tokens(q);
  if (!qts.length) return [];
  return BRANDS.filter((b) => qts.every((qt) => wordMatch(qt, normalize(`${b.name} ${(b.alsoWritten ?? []).join(' ')}`)) >= 2));
}

export default function SiteSearch({ open, initial, onClose }: { open: boolean; initial?: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [q, setQ] = useState('');
  const [added, setAdded] = useState<string | null>(null);
  useFocusTrap(ref, open, onClose);

  useEffect(() => {
    setBackgroundInert(open);
    if (open) {
      setQ(initial ?? '');
      setAdded(null);
    }
    return () => setBackgroundInert(false);
  }, [open]);

  const query = q.trim();
  const products = useMemo(() => searchProducts(query).slice(0, 6), [query]);
  const categories = useMemo(() => (tokens(query).length ? searchCategories(query).slice(0, 4) : []), [query]);
  const brands = useMemo(() => searchBrands(query).slice(0, 4), [query]);
  const nothing = query.length >= 2 && !products.length && !categories.length && !brands.length;

  const addProduct = (p: ShopProduct, colour?: string) => {
    if (addToCart(p.id, 1, colour)) {
      const label = `${productTitle(p)}${colour ? ` (${colour})` : ''}`;
      setAdded(label);
      toast(`${label} added to your cart`, 'open-cart');
    }
  };
  const request = () => {
    if (addRequest(query)) {
      setAdded(query);
      toast(`${query.slice(0, MAX_REQUEST_LEN)} added to your cart`, 'open-cart');
    }
  };

  if (!open) return null;
  return (
    <div class="search-root">
      <div class="drawer-backdrop" onClick={onClose} aria-hidden="true" />
      <div class="search" role="dialog" aria-modal="true" aria-labelledby="search-title" ref={ref}>
        <div class="search__head">
          <h2 id="search-title" class="sr-only">
            Search
          </h2>
          <span class="search__icon">
            <Icon name="search" size={20} />
          </span>
          <input
            id="site-search-input"
            class="search__input"
            type="search"
            enterKeyHint="search"
            autocomplete="off"
            maxLength={MAX_REQUEST_LEN}
            placeholder="Search for a product, brand or job"
            aria-label="Search for a product, brand or job"
            value={q}
            onInput={(e) => {
              setQ((e.target as HTMLInputElement).value);
              setAdded(null);
            }}
            onKeyDown={(e) => {
              // Enter adds the typed item as a request when nothing on the site matches.
              if (e.key === 'Enter' && !e.isComposing) {
                e.preventDefault();
                if (nothing) request();
              }
            }}
            data-autofocus
          />
          <button type="button" class="icon-btn" onClick={onClose} aria-label="Close search">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div class="search__body" aria-live="polite">
          {!query && (
            <div class="search__section">
              <p class="search__label">Popular searches</p>
              <div class="search__chips">
                {POPULAR_SEARCHES.map((s) => (
                  <button type="button" class="chip" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
              <p class="search__hint">
                Universal carries far more in store than this site lists. If you don't find your item, search for it and add it to your cart as a
                request.
              </p>
            </div>
          )}

          {query.length >= 2 && (nothing || products.length === 0) && (
            <RequestCard query={query} added={added === query} onAdd={request} prominent={nothing} />
          )}

          {products.length > 0 && (
            <div class="search__section">
              <p class="search__label">In the Shop</p>
              <ul class="search__products">
                {products.map((p) => (
                  <li class="search-product" key={p.id}>
                    <a class="search-product__media" href={`/shop/${p.id}/`} tabIndex={-1} aria-hidden="true">
                      <div class="photo-stage">
                        <SitePicture image={p.image} decorative />
                      </div>
                    </a>
                    <div class="search-product__info">
                      <a class="search-product__title" href={`/shop/${p.id}/`}>
                        {productTitle(p)}
                      </a>
                      <span class="search-product__name">{p.name}</span>
                      <span class="search-product__price">{formatPrice(p.price)}</span>
                    </div>
                    <div class="search-product__add">
                      {p.colours && p.colours.length > 1 ? (
                        <div class="search-product__colours" role="group" aria-label={`Add ${productTitle(p)} to cart in`}>
                          {p.colours.map((c) => (
                            <button type="button" class="chip chip--sm" onClick={() => addProduct(p, c)} aria-label={`Add ${productTitle(p)} in ${c} to cart`}>
                              <Icon name="plus" size={14} /> {c}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <button type="button" class="btn btn--sm" onClick={() => addProduct(p)} aria-label={`Add ${productTitle(p)} to cart`}>
                          <Icon name="cart" size={16} /> Add
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {categories.length > 0 && (
            <div class="search__section">
              <p class="search__label">Categories</p>
              <ul class="search__links">
                {categories.map((h) => (
                  <li key={h.category.slug}>
                    <a href={`/products/${h.category.slug}/`}>
                      <span>
                        <strong>{h.category.name}</strong>
                        {h.subMatches.length > 0 && <span class="search__sub">{h.subMatches.slice(0, 3).join(' · ')}</span>}
                      </span>
                      <Icon name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {brands.length > 0 && (
            <div class="search__section">
              <p class="search__label">Brands</p>
              <ul class="search__links">
                {brands.map((b) => (
                  <li key={b.id}>
                    <a href={`/brands/#${b.id}`}>
                      <span>
                        <strong>{b.name}</strong>
                        <span class="search__sub">{b.focus}</span>
                      </span>
                      <Icon name="arrow-right" size={16} />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {query.length >= 2 && !nothing && products.length > 0 && <RequestCard query={query} added={added === query} onAdd={request} />}

          {added && (
            <p class="search__added" role="status">
              <Icon name="check" size={16} /> <span data-i18n-skip>{added}</span>
              <a href="/cart/">View cart</a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function RequestCard({ query, added, onAdd, prominent = false }: { query: string; added: boolean; onAdd: () => void; prominent?: boolean }) {
  return (
    <div class={`search-request${prominent ? ' search-request--prominent' : ''}`}>
      <div>
        <p class="search-request__title">{prominent ? 'Not listed on the site yet' : "Don't see exactly what you need?"}</p>
        <p class="search-request__text">
          Add <strong data-i18n-skip>“{query}”</strong> to your cart as a request. The branch confirms the price and availability before you pay.
        </p>
      </div>
      <button type="button" class="btn" onClick={onAdd} disabled={added}>
        <Icon name={added ? 'check' : 'plus'} size={16} /> {added ? 'Added to cart' : 'Add as a request'}
      </button>
    </div>
  );
}
