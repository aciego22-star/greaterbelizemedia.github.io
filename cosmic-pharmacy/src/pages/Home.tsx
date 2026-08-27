import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeroCarousel } from '../components/HeroCarousel';
import { business } from '../data/business';
import { ContactDetails } from '../components/ContactDetails';
import { LocationMap } from '../components/LocationMap';
import msCarter from '../assets/people/ms-carter.webp';
import { NovaBadge } from '../components/NovaBadge';
import kitFertility from '../assets/kits/kit-fertility.webp';
import kitSkin from '../assets/kits/kit-skin.webp';
import kitMetabolic from '../assets/kits/kit-metabolic.webp';
import kitCraving from '../assets/kits/kit-craving.webp';
import kitCycle from '../assets/kits/kit-cycle.webp';
import kitsInHand from '../assets/kits/kits-in-hand.webp';
import { whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

/**
 * The PMOS kits, in the order Cosmic lists them in her own campaign. Copy is
 * taken from that campaign rather than written here: the kits are wellness
 * bundles, and what each one contains is for the pharmacy to confirm.
 */
const KITS = [
  { name: 'Fertility Support', kit: 'Fertility Support Kit', image: kitFertility },
  { name: 'Skin Balance', kit: 'Skin Balance Kit', image: kitSkin },
  { name: 'Metabolic Support', kit: 'Metabolic Reset Kit', image: kitMetabolic },
  { name: 'Craving Control', kit: 'Craving Control Kit', image: kitCraving },
  { name: 'Cycle Balance', kit: 'Cycle Balance Kit', image: kitCycle }
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
        {/* Pharmacist guidance */}
        <section className="panel-section section-pad guidance-band">
          <div className="guidance-grid">
            <div>
              <span className="eyebrow">Pharmacist-guided</span>
              <h2 className="section-title">Real guidance, not just a shelf</h2>
              <p className="section-intro">
                {business.pharmacist} and the Cosmic team are known for asking the right questions before recommending anything, for helping
                customers source hard-to-find products, and for friendly, efficient service at fair prices across Belize.{' '}
                {business.promise}
              </p>
              <a
                className="btn btn-whatsapp"
                href={whatsappUrl('Hello Cosmic Pharmacy! I would like some guidance from the pharmacist.')}
                target="_blank"
                rel="noopener noreferrer"
              >
                Talk to the Pharmacist
              </a>
            </div>
            <figure className="guidance-visual">
              <span className="guidance-halo" aria-hidden="true" />
              <img
                className="guidance-portrait"
                src={msCarter}
                alt={`${business.pharmacistFullName}, ${business.pharmacistTitle} at ${business.name}`}
                width={551}
                height={1000}
              />
              <figcaption className="guidance-caption">
                <strong>{business.pharmacistFullName}</strong>
                <span>{business.pharmacistTitle}</span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* What's new: the PMOS kits */}
        <section className="panel-section section-pad whats-new">
          <div className="whats-new-head">
            <div className="whats-new-head-copy">
              <span className="eyebrow">What's new at Cosmic</span>
              <h2 className="section-title">Women are tired of guessing.</h2>
              <p className="section-intro">
                Many supplements, but which ones make sense together? That is where Cosmic Pharmacy comes in: five kits, each built around
                one concern, put together and guided by a pharmacist.
              </p>
            </div>
            <NovaBadge />
          </div>

          {/* Continuous right-to-left march. The list is rendered twice so the
              translation can loop seamlessly at the halfway point. */}
          <div className="kits-marquee" aria-hidden="true">
            <div className="kits-marquee-track">
              {[...KITS, ...KITS].map((k, i) => (
                <img key={`${k.kit}-${i}`} src={k.image} alt="" loading="lazy" decoding="async" />
              ))}
            </div>
          </div>

          <p className="kits-prompt">Choose your main concern:</p>
          <ul className="kits-grid">
            {KITS.map((k) => (
              <li key={k.kit} className="kit-card">
                <img src={k.image} alt={`${k.kit} box`} loading="lazy" decoding="async" />
                <strong>{k.name}</strong>
                <span>{k.kit}</span>
              </li>
            ))}
          </ul>

          <div className="kits-close">
            <figure className="kits-photo">
              <img
                src={kitsInHand}
                alt={`${business.pharmacistFullName} holding the Skin Balance and Craving Control kits at ${business.name}`}
                width={900}
                height={543}
                loading="lazy"
                decoding="async"
              />
            </figure>

            <div className="kits-close-copy">
              <p className="kits-headline">Your wellness kit, designed with you in mind, available only at Cosmic Pharmacy.</p>
              <p className="kits-note">
                Guided by a pharmacist, here to simplify your wellness. {business.pharmacistFullName} confirms what is in each kit, whether
                it suits you, and the price, before anything is final.
              </p>
              <div className="section-cta-row">
                <Link className="btn btn-magenta" to="/products/womens-wellness">
                  Let's get started on yours
                </Link>
                <a
                  className="btn btn-outline-light"
                  href={whatsappUrl('Hello Cosmic Pharmacy! I would like to ask about the wellness kits.')}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ask about a kit
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="panel-section cool section-pad">
          <p className="section-kicker">Our entire pharmacy is now online.</p>
          <span className="eyebrow">How it works</span>
          <h2 className="section-title how-title">Search. Add to cart. Send to WhatsApp. Done.</h2>
          <ol className="how-steps">
            <li>
              <strong>Search the catalogue</strong>
              <span>Find products by name, brand, category or A–Z: medicine, wellness, beauty and medical devices.</span>
            </li>
            <li>
              <strong>Build your cart</strong>
              <span>Add items and quantities. Prices shown are confirmed by the pharmacy before anything is final.</span>
            </li>
            <li>
              <strong>Send it on WhatsApp</strong>
              <span>One tap sends your whole request to Cosmic. A pharmacist reviews it and confirms availability and pricing.</span>
            </li>
            <li>
              <strong>Pickup or delivery</strong>
              <span>Collect in person, or arrange Belize City delivery, out-district or Cayes shipping.</span>
            </li>
          </ol>
        </section>

        {/* Explore the pharmacy: slim, centered pointers to the deeper pages */}
        <section className="panel-section section-pad band-center">
          <span className="eyebrow">Explore Cosmic</span>
          <h2 className="section-title">The rest lives on its own pages</h2>
          <p className="section-intro">
            Browse the departments, see current specials, or start a prescription request. Each has a dedicated page of its own.
          </p>
          <div className="section-cta-row center">
            <Link className="btn btn-primary" to="/shop?mode=categories">
              Browse Departments
            </Link>
            <Link className="btn btn-outline-light" to="/shop?mode=search&cat=sale-featured">
              Current Specials
            </Link>
            <Link className="btn btn-outline-light" to="/products/womens-wellness">
              Cosmic PMOS Collection
            </Link>
            <Link className="btn btn-magenta" to="/prescriptions">
              Send a Prescription
            </Link>
          </div>
        </section>

        {/* Visit */}
        <section className="panel-section cool section-pad">
          <span className="eyebrow">Visit us</span>
          <h2 className="section-title">Find Cosmic Pharmacy</h2>
          <div className="contact-layout">
            <ContactDetails />
            <LocationMap />
          </div>
        </section>
      </div>
    </div>
  );
}
