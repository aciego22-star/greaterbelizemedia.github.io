import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroCarousel } from '../components/HeroCarousel';
import { ProductGrid } from '../components/ProductGrid';
import { GalleryGrid } from '../components/GalleryGrid';
import { ArticleCard } from '../components/ArticleCard';
import { featuredProducts, saleProducts } from '../lib/catalog';
import { business } from '../data/business';
import rawArticles from '../data/articles.json';
import type { Article } from '../data/types';
import { buildPmosMessage, whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

const articles = rawArticles as Article[];

const pathways = [
  { to: '/services', name: 'Services', desc: 'Prescriptions, guidance, sourcing and delivery.' },
  { to: '/products/supplements', name: 'Supplements', desc: 'Vitamins, minerals and wellness formulas.' },
  { to: '/products/health', name: 'Health Products', desc: 'OTC medicine, first aid and monitoring.' },
  { to: '/products/personal-care-beauty', name: 'Personal Care & Beauty', desc: 'Hygiene, skin, hair and everyday care.' },
  { to: '/products/womens-wellness', name: "Women's Wellness", desc: 'Cosmic PMOS kits and guided support.' },
  { to: '/shop', name: 'Shop All', desc: 'The full searchable product database.' }
];

export function Home() {
  usePageMeta(
    'Cosmic Pharmacy | Medicine · Health · Beauty | Belize City',
    'Search medicine, wellness and personal-care products, build your request, and send it to Cosmic Pharmacy on WhatsApp. Pharmacist-guided service across Belize.'
  );
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    navigate(`/shop?mode=search${q.trim() ? `&q=${encodeURIComponent(q.trim())}` : '&focus=1'}`);
  };

  const featured = [...new Set([...featuredProducts, ...saleProducts])].slice(0, 8);

  return (
    <div className="page home-page">
      <HeroCarousel />

      {/* Universal search directly beneath the hero */}
      <div className="wrap">
        <form className="home-search panel-section" onSubmit={onSearch} role="search" aria-label="Search the product database">
          <div className="search-orbit large">
            <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true" width="22" height="22">
              <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <label className="visually-hidden" htmlFor="home-search">
              Search products
            </label>
            <input
              id="home-search"
              type="search"
              placeholder="Search products, brands or categories…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>
      </div>

      <div className="wrap page-stack">
        {/* Customer pathways */}
        <section className="panel-section section-pad">
          <span className="eyebrow">Find your way</span>
          <h2 className="section-title">Where would you like to start?</h2>
          <div className="pathway-grid">
            {pathways.map((p) => (
              <Link key={p.to} to={p.to} className="pathway-card">
                <span className="pathway-name">{p.name}</span>
                <span className="pathway-desc">{p.desc}</span>
                <span className="pathway-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured & sale */}
        <section className="panel-section cool section-pad">
          <span className="eyebrow">Featured & on sale</span>
          <h2 className="section-title">Picks from the shop floor</h2>
          <p className="section-intro">
            Sale prices shown are recent references from Cosmic's own posts — the pharmacy confirms current pricing on every request.
          </p>
          <ProductGrid products={featured} />
          <div className="section-cta">
            <Link className="btn btn-primary" to="/shop?mode=search&cat=sale-featured">
              See all featured & sale items
            </Link>
          </div>
        </section>

        {/* Pharmacist guidance */}
        <section className="panel-section section-pad guidance-band">
          <div className="guidance-grid">
            <div>
              <span className="eyebrow">Pharmacist-guided</span>
              <h2 className="section-title">Real guidance, not just a shelf</h2>
              <p className="section-intro">
                {business.pharmacist} and the Cosmic team are known for asking the right questions before recommending anything, helping
                customers source hard-to-find products, and serving people well beyond the neighbourhood — friendly, efficient and fairly
                priced. {business.promise}
              </p>
              <ul className="guidance-list">
                <li>Knowledgeable pharmacist guidance on every request</li>
                <li>The right questions before a product is recommended or dispensed</li>
                <li>Help sourcing hard-to-find products</li>
                <li>Service to Belize City, the districts and the islands</li>
              </ul>
              <a className="btn btn-whatsapp" href={whatsappUrl('Hello Cosmic Pharmacy! I would like some guidance from the pharmacist.')} target="_blank" rel="noopener noreferrer">
                Talk to the Pharmacist
              </a>
            </div>
            <div className="guidance-visual" aria-hidden="true">
              <svg viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="52" fill="none" stroke="#3d6df2" strokeWidth="3" />
                <ellipse cx="100" cy="100" rx="92" ry="34" fill="none" stroke="#d6409f" strokeWidth="2" transform="rotate(-18 100 100)" />
                <circle cx="172" cy="72" r="7" fill="#d6409f" />
                <path d="M100 74v52M74 100h52" stroke="#3d6df2" strokeWidth="7" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </section>

        {/* PMOS feature */}
        <section className="panel-section cool section-pad">
          <span className="eyebrow">Cosmic Wellness</span>
          <h2 className="section-title">The Cosmic PMOS Collection</h2>
          <p className="section-intro">
            Cosmic's own pharmacist-guided wellness-support kits — browse by goal, then talk it through with {business.pharmacist} before
            you choose.
          </p>
          <div className="section-cta-row">
            <Link className="btn btn-primary" to="/products/womens-wellness">
              Explore the Collection
            </Link>
            <a className="btn btn-whatsapp" href={whatsappUrl(buildPmosMessage())} target="_blank" rel="noopener noreferrer">
              Ask {business.pharmacist} Which Kit to Discuss
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="panel-section section-pad">
          <span className="eyebrow">How it works</span>
          <h2 className="section-title">Search. Basket. WhatsApp. Done.</h2>
          <ol className="how-steps">
            <li>
              <strong>Search the database</strong>
              <span>Find products by name, brand, category or A–Z — over the counter, wellness, beauty and devices.</span>
            </li>
            <li>
              <strong>Build your basket</strong>
              <span>Add items and quantities. Prices shown are confirmed by the pharmacy before anything is final.</span>
            </li>
            <li>
              <strong>Send it on WhatsApp</strong>
              <span>One tap sends your whole request to Cosmic — a pharmacist reviews it and confirms availability and pricing.</span>
            </li>
            <li>
              <strong>Pickup or delivery</strong>
              <span>Collect in store, or arrange Belize City delivery, out-district or island shipping.</span>
            </li>
          </ol>
        </section>

        {/* Blog previews */}
        <section className="panel-section cool section-pad">
          <span className="eyebrow">Health & Wellness Journal</span>
          <h2 className="section-title">From the blog</h2>
          <div className="article-grid">
            {articles.slice(0, 3).map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
          <div className="section-cta">
            <Link className="btn btn-outline-light" to="/blog">
              Read the Journal
            </Link>
          </div>
        </section>

        {/* Gallery preview */}
        <section className="panel-section section-pad">
          <span className="eyebrow">Cosmic in Motion</span>
          <h2 className="section-title">Inside the pharmacy</h2>
          <GalleryGrid limit={4} showFilters={false} />
          <div className="section-cta">
            <Link className="btn btn-primary" to="/gallery">
              View Gallery
            </Link>
          </div>
        </section>

        {/* Shipping message */}
        <section className="panel-section cool section-pad shipping-band">
          <span className="eyebrow">Countrywide</span>
          <h2 className="section-title">Out-district and island shipping</h2>
          <p className="section-intro">
            Not in Belize City? Cosmic serves out-district customers and the main islands — build your request online and the team confirms
            shipping options and charges on WhatsApp.
          </p>
          <Link className="btn btn-primary" to="/services">
            See Delivery & Shipping Options
          </Link>
        </section>

        {/* Testimonials placeholder */}
        <section className="panel-section section-pad">
          <span className="eyebrow">What customers say</span>
          <h2 className="section-title">Testimonials</h2>
          <div className="testimonial-placeholder">
            <p className="text-muted">
              Approved customer testimonials will appear here. Cosmic Pharmacy publishes testimonial copy only with the customer's
              permission and never publishes customer health information.
            </p>
          </div>
        </section>

        {/* Visit */}
        <section className="panel-section cool section-pad">
          <span className="eyebrow">Visit us</span>
          <h2 className="section-title">Find Cosmic Pharmacy</h2>
          <div className="visit-grid">
            <div>
              <h3>Location</h3>
              <p>{business.address}</p>
              <h3>Contact</h3>
              <p>
                <a href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a> (phone & WhatsApp)
                <br />
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </p>
            </div>
            <div>
              <h3>Hours</h3>
              {business.hours.map((h) => (
                <p key={h.days}>
                  <strong>{h.days}</strong>
                  <br />
                  {h.open} – {h.close}
                </p>
              ))}
              <p className="text-muted">Hours shown from Cosmic's current public page — confirm before holidays.</p>
            </div>
            <div className="map-placeholder" role="img" aria-label="Map placeholder — embedded map pending">
              <span>Map embed pending</span>
              <span className="text-muted">#41 Corner Holy Emmanuel Street/CET Site</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
