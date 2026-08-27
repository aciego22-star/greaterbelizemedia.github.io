import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { productBySlug, productsInCategory, requiresReview, hasNumericPrice } from '../lib/catalog';
import { formatBzd, priceLabel, productTypeLabels, stockLabels } from '../lib/format';
import { categoryBySlug } from '../data/categories';
import { useBasket } from '../basket/BasketProvider';
import { PlaceholderMedia } from '../components/PlaceholderMedia';
import { mediaUrls } from '../lib/media';
import { ProductGrid } from '../components/ProductGrid';
import { QuantityControl } from '../basket/QuantityControl';
import { buildQuestionMessage, whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

export function ProductDetail() {
  const { slug } = useParams();
  const [params] = useSearchParams();
  const { add } = useBasket();
  const [quantity, setQuantity] = useState(1);
  const [activeView, setActiveView] = useState(0);

  const product = slug ? productBySlug.get(slug) : undefined;
  usePageMeta(
    product ? `${product.name} | Cosmic Pharmacy` : 'Product not found | Cosmic Pharmacy',
    product?.shortDescription
  );

  const back = params.get('back') ?? '';
  const backTo = `/shop${back || ''}`;

  if (!product) {
    return (
      <div className="page">
        <div className="wrap">
          <section className="panel-section section-pad">
            <h1 className="section-title">Product not found</h1>
            <p className="section-intro">This product may have been removed from the demo catalogue.</p>
            <Link className="btn btn-primary" to="/shop">
              Back to Shop All
            </Link>
          </section>
        </div>
      </div>
    );
  }

  const views = mediaUrls(product.images ?? [product.image]);
  // The component is reused across product routes, so the selected view can
  // outlive the product that had it. Clamp rather than reset, so navigating
  // between two multi-view products keeps a sensible index.
  const active = Math.min(activeView, Math.max(views.length - 1, 0));

  const review = requiresReview(product);
  const related = productsInCategory(product.category)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const category = categoryBySlug.get(product.category);

  return (
    <div className="page">
      <div className="wrap">
        <section className="panel-section section-pad">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link to={backTo}>← Back to results</Link>
          </nav>

          <div className="detail-grid">
            {/* The frame is a fixed square that clips its contents, so the view
                switcher sits beside it rather than inside it. */}
            <div className="detail-media-col">
              <div className="detail-media">
                {views.length ? <img src={views[active]} alt={product.imageAlt} /> : <PlaceholderMedia note={product.imageAlt} />}
              </div>
              {views.length > 1 && (
                <div className="detail-views" role="group" aria-label={`${product.name}: ${views.length} views`}>
                  {views.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      className={`detail-view ${i === active ? 'active' : ''}`}
                      aria-pressed={i === active}
                      aria-label={`View ${i + 1} of ${views.length}`}
                      onClick={() => setActiveView(i)}
                    >
                      <img src={src} alt="" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="detail-info">
              {product.brand && <span className="product-brand">{product.brand}</span>}
              <h1 className="detail-name">{product.name}</h1>

              <div className="product-tags">
                <span className="badge badge-type">{productTypeLabels[product.productType]}</span>
                {category && (
                  <Link className="product-cat" to={`/shop?mode=search&cat=${category.slug}`}>
                    {category.name}
                  </Link>
                )}
                {product.sale && <span className="badge badge-sale">Sale</span>}
              </div>

              <p className="detail-desc">{product.shortDescription}</p>

              <dl className="detail-facts">
                {product.size && (
                  <>
                    <dt>Size</dt>
                    <dd>{product.size}</dd>
                  </>
                )}
                {product.dosageForm && (
                  <>
                    <dt>Form</dt>
                    <dd>{product.dosageForm}</dd>
                  </>
                )}
                <dt>Price</dt>
                <dd className="num">
                  {priceLabel(product)}
                  {hasNumericPrice(product) && typeof product.compareAtPriceBzd === 'number' && (
                    <s className="product-compare num">{formatBzd(product.compareAtPriceBzd)}</s>
                  )}
                </dd>
                <dt>Availability</dt>
                <dd className={`stock ${product.stockStatus}`}>{stockLabels[product.stockStatus]}</dd>
                {review && (
                  <>
                    <dt>Status</dt>
                    <dd>
                      <span className="badge badge-review">
                        {product.prescriptionRequired ? 'Prescription required' : 'Pharmacist review'}
                      </span>
                    </dd>
                  </>
                )}
              </dl>

              {review ? (
                <div className="detail-actions">
                  {product.prescriptionRequired || product.category === 'prescription-refills' ? (
                    <Link className="btn btn-magenta" to="/prescriptions">
                      Send a Prescription
                    </Link>
                  ) : (
                    <a
                      className="btn btn-magenta"
                      href={whatsappUrl(buildQuestionMessage(product.brand ? `${product.brand} ${product.name}` : product.name))}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Ask the Pharmacist on WhatsApp
                    </a>
                  )}
                  <p className="text-muted detail-review-note">
                    This item goes through pharmacist review instead of ordinary self-service checkout.
                  </p>
                </div>
              ) : (
                <div className="detail-actions">
                  <QuantityControl value={quantity} onChange={(q) => setQuantity(Math.max(1, q))} label={product.name} />
                  <button type="button" className="btn btn-primary" onClick={() => add(product.id, quantity)}>
                    Add to Basket
                  </button>
                  <a
                    className="btn btn-outline-light"
                    href={whatsappUrl(buildQuestionMessage(product.brand ? `${product.brand} ${product.name}` : product.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ask a Question
                  </a>
                </div>
              )}

              <p className="notice">Availability, final price and fulfilment are confirmed by Cosmic Pharmacy.</p>
            </div>
          </div>

          {related.length > 0 && (
            <div className="related">
              <h2>More in {category?.name ?? 'this category'}</h2>
              <ProductGrid products={related} backSearch={back} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
