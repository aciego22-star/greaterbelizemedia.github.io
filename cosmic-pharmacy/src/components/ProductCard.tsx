import { Link } from 'react-router-dom';
import type { Product } from '../data/types';
import { requiresReview, hasNumericPrice } from '../lib/catalog';
import { formatBzd, priceLabel, productTypeLabels, stockLabels } from '../lib/format';
import { categoryBySlug } from '../data/categories';
import { useBasket } from '../basket/BasketProvider';
import { PlaceholderMedia } from './PlaceholderMedia';
import { mediaUrl } from '../lib/media';
import { buildQuestionMessage, whatsappUrl } from '../lib/whatsapp';

interface ProductCardProps {
  product: Product;
  /** Search/filter state to preserve when navigating into the product. */
  backSearch?: string;
}

export function ProductCard({ product, backSearch }: ProductCardProps) {
  const { add } = useBasket();
  const review = requiresReview(product);
  const detailTo = {
    pathname: `/product/${product.slug}`,
    search: backSearch ? `?back=${encodeURIComponent(backSearch)}` : undefined
  };

  return (
    <article className="product-card">
      <Link to={detailTo} className="product-card-media" aria-hidden="true" tabIndex={-1}>
        {mediaUrl(product.image) ? (
          <img src={mediaUrl(product.image)} alt="" loading="lazy" decoding="async" width={400} height={400} />
        ) : (
          <PlaceholderMedia note={product.imageAlt} compact />
        )}
        {product.sale && <span className="badge badge-sale card-flag">Sale</span>}
        {!product.sale && product.newArrival && <span className="badge badge-new card-flag">New</span>}
      </Link>

      <div className="product-card-body">
        {product.brand && <span className="product-brand">{product.brand}</span>}
        <h3 className="product-name">
          <Link to={detailTo}>{product.name}</Link>
        </h3>
        {product.size && <span className="product-size">{product.size}</span>}

        <div className="product-meta">
          <span className={`product-price num ${hasNumericPrice(product) ? '' : 'pending'}`}>
            {priceLabel(product)}
            {hasNumericPrice(product) && typeof product.compareAtPriceBzd === 'number' && (
              <s className="product-compare num">{formatBzd(product.compareAtPriceBzd)}</s>
            )}
          </span>
          <span className={`stock ${product.stockStatus}`}>{stockLabels[product.stockStatus]}</span>
        </div>

        <div className="product-tags">
          <span className="badge badge-type">{productTypeLabels[product.productType]}</span>
          <span className="product-cat">{categoryBySlug.get(product.category)?.shortName ?? product.category}</span>
        </div>

        <div className="product-actions">
          <Link className="btn btn-outline-light btn-sm" to={detailTo}>
            View Details
          </Link>
          {review ? (
            product.prescriptionRequired || product.category === 'prescription-refills' ? (
              <Link className="btn btn-magenta btn-sm" to="/prescriptions">
                Send Prescription
              </Link>
            ) : (
              <a
                className="btn btn-magenta btn-sm"
                href={whatsappUrl(buildQuestionMessage(product.brand ? `${product.brand} ${product.name}` : product.name))}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ask the Pharmacist
              </a>
            )
          ) : (
            <button type="button" className="btn btn-primary btn-sm" data-add-to-cart onClick={() => add(product.id)}>
              Add to Basket
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
