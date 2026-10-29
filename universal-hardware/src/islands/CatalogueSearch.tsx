import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { DEPARTMENTS } from '../data/departments';
import { BRANDS } from '../data/brands';
import { searchCategories, POPULAR_SEARCHES } from '../lib/search';
import { artSvg } from '../lib/category-art';
import { CATEGORY_PHOTOS } from '../data/site-images';
import { assetUrl } from '../lib/asset-url';
import { iconSvg, type IconName } from '../lib/icons';
import { hasCategory, toggleCategory, subscribe, openGuide, toast } from '../lib/enquiry-store';

const Icon = ({ name, size = 18 }: { name: IconName; size?: number }) => (
  <span class="i" aria-hidden="true" dangerouslySetInnerHTML={{ __html: iconSvg(name, size) }} />
);

const BRAND_OPTIONS = [...BRANDS].sort((a, b) => a.name.localeCompare(b.name)).filter((b) => b.categories.length);

function readParams() {
  if (typeof window === 'undefined') return { q: '', dept: '', brand: '' };
  const p = new URLSearchParams(window.location.search);
  return { q: p.get('q') ?? '', dept: p.get('dept') ?? '', brand: p.get('brand') ?? '' };
}

export default function CatalogueSearch() {
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [brand, setBrand] = useState('');
  const [, force] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    const p = readParams();
    setQ(p.q);
    setDept(DEPARTMENTS.some((d) => d.id === p.dept) ? p.dept : '');
    setBrand(BRANDS.some((b) => b.id === p.brand) ? p.brand : '');
    hydrated.current = true;
    return subscribe(() => force((n) => n + 1));
  }, []);

  // Keep the URL shareable and refresh-safe.
  useEffect(() => {
    if (!hydrated.current) return;
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (dept) p.set('dept', dept);
    if (brand) p.set('brand', brand);
    const url = `${location.pathname}${p.toString() ? `?${p}` : ''}`;
    try {
      history.replaceState(null, '', url);
    } catch {
      /* sandboxed frames may refuse URL updates; search still works */
    }
  }, [q, dept, brand]);

  const results = useMemo(() => {
    let hits = searchCategories(q);
    if (dept) {
      const d = DEPARTMENTS.find((x) => x.id === dept)!;
      hits = hits.filter((h) => d.categories.includes(h.category.slug));
    }
    if (brand) {
      const b = BRANDS.find((x) => x.id === brand)!;
      hits = hits.filter((h) => b.categories.some((l) => l.slug === h.category.slug));
    }
    return hits;
  }, [q, dept, brand]);

  const brandObj = brand ? BRANDS.find((b) => b.id === brand) : null;
  const active = !!(q.trim() || dept || brand);
  const subTotal = results.reduce((n, r) => n + r.subMatches.length, 0);
  const clearAll = () => {
    setQ('');
    setDept('');
    setBrand('');
    inputRef.current?.focus();
  };

  return (
    <div class="catalogue">
      <div class="catalogue__controls">
        <form class="catalogue__search" role="search" onSubmit={(e) => e.preventDefault()}>
          <label for="catalogue-q" class="sr-only">Search products, sub-types and brands</label>
          <span class="catalogue__search-icon"><Icon name="search" size={20} /></span>
          <input
            id="catalogue-q"
            ref={inputRef}
            type="search"
            class="catalogue__input"
            placeholder="Search e.g. “submersible pump”, “MIG welder” or “Makita”"
            value={q}
            onInput={(e) => setQ((e.target as HTMLInputElement).value)}
            autocomplete="off"
            enterkeyhint="search"
          />
          {q && (
            <button type="button" class="catalogue__clear" onClick={() => { setQ(''); inputRef.current?.focus(); }} aria-label="Clear search">
              <Icon name="x" size={16} />
            </button>
          )}
        </form>
        <div class="catalogue__popular" aria-label="Popular searches">
          <span class="mono">Popular</span>
          {POPULAR_SEARCHES.map((p) => (
            <button type="button" class="catalogue__pop" onClick={() => setQ(p)}>
              {p}
            </button>
          ))}
        </div>

        <div class="catalogue__filters">
          <div class="catalogue__depts" role="group" aria-label="Filter by department">
            <button type="button" class="chip" aria-pressed={!dept} onClick={() => setDept('')}>
              All departments
            </button>
            {DEPARTMENTS.map((d) => (
              <button type="button" class="chip" aria-pressed={dept === d.id} onClick={() => setDept(dept === d.id ? '' : d.id)}>
                {d.name}
              </button>
            ))}
          </div>
          <div class="catalogue__brand field">
            <label for="catalogue-brand" class="sr-only">Filter by brand</label>
            <select id="catalogue-brand" class="select" value={brand} onChange={(e) => setBrand((e.target as HTMLSelectElement).value)}>
              <option value="">All brands</option>
              {BRAND_OPTIONS.map((b) => (
                <option value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div class="catalogue__status" aria-live="polite">
        <p>
          {results.length === 0
            ? 'No matching categories'
            : `${results.length} ${results.length === 1 ? 'category' : 'categories'}${q.trim() && subTotal ? ` · ${subTotal} matching product ${subTotal === 1 ? 'type' : 'types'}` : ''}`}
          {q.trim() && <> for “{q.trim()}”</>}
          {brandObj && <> · brand: {brandObj.name}</>}
        </p>
        {active && (
          <button type="button" class="finder__link catalogue__reset" onClick={clearAll}>
            <Icon name="reset" size={16} /> Clear filters
          </button>
        )}
      </div>
      {brandObj && (
        <p class="catalogue__brandnote">
          <Icon name="info" size={16} /> {brandObj.relationship} A website mention doesn't confirm current stock.
        </p>
      )}

      {results.length === 0 ? (
        <div class="catalogue__empty">
          <h2 class="h3">Nothing matched{q.trim() ? ` “${q.trim()}”` : ''}.</h2>
          <p>
            This concept searches the categories and product types listed on Universal Hardware's website, so some specific items won't appear. Try a
            broader word, or ask the Product Guide.
          </p>
          <div class="catalogue__empty-actions">
            <button type="button" class="btn" onClick={() => openGuide(q.trim() || undefined)}>
              <Icon name="guide" size={18} /> Ask the Product Guide
            </button>
            <button type="button" class="btn btn--ghost" onClick={clearAll}>
              Clear search and filters
            </button>
          </div>
          <p class="catalogue__empty-try">
            Try:{' '}
            {POPULAR_SEARCHES.slice(0, 5).map((p, i) => (
              <>
                {i > 0 && ', '}
                <button type="button" class="catalogue__pop catalogue__pop--inline" onClick={() => { setDept(''); setBrand(''); setQ(p); }}>
                  {p}
                </button>
              </>
            ))}
          </p>
        </div>
      ) : (
        <ul class="catalogue__grid" role="list">
          {results.map(({ category: c, subMatches, brandMatches }) => {
            const shown = subMatches.length ? subMatches : c.subcategories.slice(0, 4).map((s) => s.name);
            const more = c.subcategories.length - (subMatches.length ? 0 : 4);
            const added = hasCategory(c.slug);
            return (
              <li class="cat-card" key={c.slug}>
                <div class="cat-card__art">
                  <div class="cat-card__illus" dangerouslySetInnerHTML={{ __html: artSvg(c.illustration) }} />
                  {CATEGORY_PHOTOS[c.slug] && (
                    <picture class="cat-card__photo">
                      {CATEGORY_PHOTOS[c.slug].webp && <source type="image/webp" srcset={assetUrl(CATEGORY_PHOTOS[c.slug].webp!)} />}
                      <img
                        src={assetUrl(CATEGORY_PHOTOS[c.slug].src)}
                        width={CATEGORY_PHOTOS[c.slug].width}
                        height={CATEGORY_PHOTOS[c.slug].height}
                        alt={CATEGORY_PHOTOS[c.slug].alt}
                        loading="lazy"
                        decoding="async"
                      />
                    </picture>
                  )}
                </div>
                <div class="cat-card__body">
                  <h2 class="cat-card__title">
                    <a href={`/products/${c.slug}/`} class="cat-card__link">{c.name}</a>
                  </h2>
                  <p class="cat-card__summary">{c.summary}</p>
                  <ul class="cat-card__subs" aria-label={subMatches.length ? 'Matching product types' : 'Product types'}>
                    {shown.map((s) => (
                      <li class={subMatches.includes(s) ? 'is-match' : ''}>{s}</li>
                    ))}
                    {!subMatches.length && more > 0 && <li class="cat-card__more">+{more} more</li>}
                  </ul>
                  {(brandMatches.length > 0 || c.listedBrands.length > 0) && (
                    <p class="cat-card__brands">
                      {brandMatches.length ? 'Brand match: ' : 'Brands named: '}
                      <strong>{(brandMatches.length ? brandMatches : c.listedBrands).join(', ')}</strong>
                    </p>
                  )}
                </div>
                <div class="cat-card__actions">
                  <a class="link-arrow" href={`/products/${c.slug}/`} tabIndex={-1} aria-hidden="true">
                    View category <Icon name="arrow-right" size={16} />
                  </a>
                  <button
                    type="button"
                    class="cat-card__add"
                    aria-pressed={added}
                    onClick={() => {
                      const on = toggleCategory(c.slug);
                      toast(on ? `${c.name} added to your Enquiry Summary` : `${c.name} removed from your Enquiry Summary`, on ? 'open-enquiry' : undefined);
                    }}
                  >
                    <Icon name={added ? 'check' : 'plus'} size={16} />
                    <span>{added ? 'In enquiry' : 'Add to enquiry'}</span>
                    <span class="sr-only"> — {c.name}</span>
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
