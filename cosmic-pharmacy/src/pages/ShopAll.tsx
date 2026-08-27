import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { products, allBrands } from '../lib/catalog';
import {
  ALPHABET,
  filterProducts,
  lettersWithProducts,
  looksLikeMedicalQuestion,
  productsForLetter,
  searchProducts,
  sortProducts,
  type SortKey
} from '../lib/search';
import { categories } from '../data/categories';
import { ProductGrid } from '../components/ProductGrid';
import { PharmacistCard } from '../components/PharmacistCard';
import { usePageMeta } from '../lib/usePageMeta';
import { productTypeLabels } from '../lib/format';
import { CatalogueNotice } from '../components/CatalogueNotice';

type Mode = 'search' | 'categories' | 'az';

const modeLabels: Record<Mode, string> = { search: 'Search', categories: 'Categories', az: 'A–Z' };

export function ShopAll() {
  usePageMeta(
    'Shop All | Cosmic Pharmacy',
    'Search the Cosmic Pharmacy catalogue by product, brand or category, browse A–Z, and build a WhatsApp request basket.'
  );

  const [params, setParams] = useSearchParams();
  const location = useLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const mode = (params.get('mode') as Mode) || (params.get('letter') ? 'az' : 'search');
  const query = params.get('q') ?? '';
  const letter = params.get('letter') ?? '';
  const category = params.get('cat') ?? '';
  const brand = params.get('brand') ?? '';
  const productType = params.get('type') ?? '';
  const saleOnly = params.get('sale') === '1';
  const availability = params.get('avail') ?? '';
  const maxPriceRaw = params.get('maxprice') ?? '';
  const sort = (params.get('sort') as SortKey) || 'featured';

  // Local input state so typing is debounced into the URL (no full reload, state survives back-navigation).
  const [inputValue, setInputValue] = useState(query);
  useEffect(() => setInputValue(query), [query]);
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (inputValue !== query) {
        updateParams({ q: inputValue || null });
      }
    }, 250);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  useEffect(() => {
    if (params.get('focus') === '1') {
      inputRef.current?.focus();
      updateParams({ focus: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateParams(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setParams(next, { replace: true });
  }

  const filters = useMemo(
    () => ({
      category: category || undefined,
      brand: brand || undefined,
      productType: productType || undefined,
      saleOnly: saleOnly || undefined,
      availability: availability || undefined,
      maxPrice: maxPriceRaw ? Number(maxPriceRaw) : undefined
    }),
    [category, brand, productType, saleOnly, availability, maxPriceRaw]
  );

  const hasActiveFilters = Boolean(category || brand || productType || saleOnly || availability || maxPriceRaw);

  const results = useMemo(() => {
    const filtered = filterProducts(products, filters);
    if (mode === 'az' && letter) return productsForLetter(filtered, letter);
    const searched = query ? searchProducts(query, filtered) : filtered;
    // A live search already ranks by relevance; otherwise apply the chosen sort.
    return query && sort === 'featured' ? searched : sortProducts(searched, sort);
  }, [filters, mode, letter, query, sort]);

  const activeLetters = useMemo(() => lettersWithProducts(filterProducts(products, filters)), [filters]);
  const medicalQuery = looksLikeMedicalQuestion(query);
  const backSearch = location.search;

  const verifiedPrices = products.filter((p) => typeof p.priceBzd === 'number');
  const maxCataloguePrice = Math.max(...verifiedPrices.map((p) => p.priceBzd as number), 0);

  return (
    <div className="page shop-page">
      <div className="wrap">
        <section className="panel-section section-pad">
          <span className="eyebrow">Searchable Product Database</span>
          <h1 className="section-title">Shop All</h1>
          <p className="section-intro">
            Search by product, brand or category, browse by department, or go A–Z. Add what you need to your basket and send the whole
            request to Cosmic Pharmacy on WhatsApp. The pharmacist confirms availability, pricing and next steps.
          </p>
          <CatalogueNotice />

          <div className="mode-tabs" role="group" aria-label="Browse mode">
            {(Object.keys(modeLabels) as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={`mode-tab ${mode === m ? 'active' : ''}`}
                aria-pressed={mode === m}
                onClick={() => updateParams({ mode: m, letter: m === 'az' ? letter || 'A' : null })}
              >
                {modeLabels[m]}
              </button>
            ))}
          </div>

          {mode === 'search' && (
            <div className="search-row">
              <div className="search-orbit">
                <label className="visually-hidden" htmlFor="shop-search">
                  Search products
                </label>
                <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" width="20" height="20">
                  <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
                  <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  id="shop-search"
                  ref={inputRef}
                  type="search"
                  placeholder="Search products, brands or categories…"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button type="button" className="btn btn-outline-light filters-toggle" aria-expanded={filtersOpen} onClick={() => setFiltersOpen((v) => !v)}>
                Filters{hasActiveFilters ? ' •' : ''}
              </button>
            </div>
          )}

          {mode === 'categories' && (
            <div className="category-grid">
              {categories.map((c) =>
                c.slug === 'prescription-refills' ? (
                  <Link key={c.slug} to="/prescriptions" className="category-card rx-card">
                    <span className="category-card-name">{c.name}</span>
                    <span className="category-card-desc">{c.description}</span>
                    <span className="category-card-cta">Pharmacist-review pathway →</span>
                  </Link>
                ) : (
                  <button
                    key={c.slug}
                    type="button"
                    className="category-card"
                    onClick={() => updateParams({ mode: 'search', cat: c.slug, q: null, letter: null })}
                  >
                    <span className="category-card-name">{c.name}</span>
                    <span className="category-card-desc">{c.description}</span>
                    <span className="category-card-cta">Browse →</span>
                  </button>
                )
              )}
            </div>
          )}

          {mode === 'az' && (
            <div className="alpha-index-wrap">
              <div className="alpha-index" role="group" aria-label="Browse alphabetically">
                {ALPHABET.map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`alpha-letter ${letter === l ? 'active' : ''} ${activeLetters.has(l) ? '' : 'empty'}`}
                    aria-pressed={letter === l}
                    onClick={() => updateParams({ letter: l })}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'search' && filtersOpen && (
            <div className="filter-rail" aria-label="Filters">
              <div className="field">
                <label htmlFor="f-cat">Category</label>
                <select id="f-cat" value={category} onChange={(e) => updateParams({ cat: e.target.value || null })}>
                  <option value="">All categories</option>
                  {categories
                    .filter((c) => c.slug !== 'prescription-refills')
                    .map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-brand">Brand</label>
                <select id="f-brand" value={brand} onChange={(e) => updateParams({ brand: e.target.value || null })}>
                  <option value="">All brands</option>
                  {allBrands.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-type">Product type</label>
                <select id="f-type" value={productType} onChange={(e) => updateParams({ type: e.target.value || null })}>
                  <option value="">All types</option>
                  {Object.entries(productTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-avail">Availability</label>
                <select id="f-avail" value={availability} onChange={(e) => updateParams({ avail: e.target.value || null })}>
                  <option value="">Any availability</option>
                  <option value="in-stock">In stock</option>
                  <option value="low-stock">Low stock</option>
                  <option value="confirm-availability">Confirm availability</option>
                </select>
              </div>
              <div className="field">
                <label htmlFor="f-price">Max price (verified prices)</label>
                <select id="f-price" value={maxPriceRaw} onChange={(e) => updateParams({ maxprice: e.target.value || null })}>
                  <option value="">Any price</option>
                  <option value="5">Up to BZD 5</option>
                  <option value="10">Up to BZD 10</option>
                  <option value="20">Up to BZD 20</option>
                  {maxCataloguePrice > 20 && <option value={String(Math.ceil(maxCataloguePrice))}>Up to BZD {Math.ceil(maxCataloguePrice)}</option>}
                </select>
              </div>
              <label className="check-field">
                <input type="checkbox" checked={saleOnly} onChange={(e) => updateParams({ sale: e.target.checked ? '1' : null })} /> Sale items
                only
              </label>
              {hasActiveFilters && (
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => updateParams({ cat: null, brand: null, type: null, sale: null, avail: null, maxprice: null })}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {mode !== 'categories' && (
            <>
              <div className="results-bar">
                <p className="results-count" role="status">
                  {results.length} product{results.length === 1 ? '' : 's'}
                  {mode === 'az' && letter ? ` starting with “${letter}”` : ''}
                  {query ? ` for “${query}”` : ''}
                  {hasActiveFilters ? ' (filtered)' : ''}
                </p>
                <div className="field sort-field">
                  <label htmlFor="f-sort">Sort</label>
                  <select id="f-sort" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
                    <option value="featured">Featured</option>
                    <option value="name-asc">Name A–Z</option>
                    <option value="price-asc">Price low–high</option>
                    <option value="price-desc">Price high–low</option>
                    <option value="new">New arrivals</option>
                  </select>
                </div>
              </div>

              {medicalQuery && <PharmacistCard context="That reads like a health question. Search can find products, but only a pharmacist can tell you what fits." />}

              {results.length > 0 ? (
                <ProductGrid products={results} backSearch={backSearch} />
              ) : (
                <div className="empty-state">
                  <h2>{mode === 'az' && letter ? `No products starting with “${letter}” yet` : 'No matching products'}</h2>
                  <p className="text-muted">
                    {mode === 'az'
                      ? 'Try another letter, or search the full catalogue. Cosmic can also source hard-to-find products on request.'
                      : 'Try a different spelling or a broader term, or reset your filters. Cosmic can also source hard-to-find products on request.'}
                  </p>
                  <div className="empty-actions">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={() =>
                        updateParams({ q: null, cat: null, brand: null, type: null, sale: null, avail: null, maxprice: null })
                      }
                    >
                      Reset search & filters
                    </button>
                  </div>
                  <PharmacistCard />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
