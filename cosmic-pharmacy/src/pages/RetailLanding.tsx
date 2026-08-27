import { Link } from 'react-router-dom';
import { categories } from '../data/categories';
import { productsInCategories } from '../lib/catalog';
import { ProductGrid } from '../components/ProductGrid';
import { PharmacistCard } from '../components/PharmacistCard';
import { usePageMeta } from '../lib/usePageMeta';
import { CatalogueNotice } from '../components/CatalogueNotice';

export interface RetailLandingProps {
  title: string;
  eyebrow: string;
  intro: string;
  /** Catalogue category slugs this page surfaces — same central database, filtered. */
  categorySlugs: string[];
  metaDescription: string;
  children?: React.ReactNode;
}

/**
 * Shared retail landing template: every department page reads from the same
 * central product database, so content never drifts between pages.
 */
export function RetailLanding({ title, eyebrow, intro, categorySlugs, metaDescription, children }: RetailLandingProps) {
  usePageMeta(`${title} | Cosmic Pharmacy`, metaDescription);
  const pageProducts = productsInCategories(categorySlugs);
  const pageCategories = categories.filter((c) => categorySlugs.includes(c.slug));

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="section-title">{title}</h1>
          <p className="section-intro">{intro}</p>

          <CatalogueNotice />

          <div className="landing-cats">
            {pageCategories.map((c) => (
              <Link key={c.slug} className="chip" to={`/shop?mode=search&cat=${c.slug}`}>
                {c.shortName ?? c.name} →
              </Link>
            ))}
          </div>
        </section>

        {children}

        <section className="panel-section cool section-pad">
          <h2>Browse {title.toLowerCase()}</h2>
          <p className="section-intro">
            {pageProducts.length} demo product{pageProducts.length === 1 ? '' : 's'} in this department. The full catalogue is populated
            from Cosmic's approved product list.
          </p>
          <ProductGrid products={pageProducts} />
          <div className="section-cta">
            <Link className="btn btn-primary" to={`/shop?mode=search${categorySlugs.length === 1 ? `&cat=${categorySlugs[0]}` : ''}`}>
              Open the full database
            </Link>
          </div>
        </section>

        <section className="panel-section section-pad">
          <PharmacistCard />
        </section>
      </div>
    </div>
  );
}
