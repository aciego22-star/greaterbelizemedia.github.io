import { Link } from 'react-router-dom';
import { business } from '../data/business';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <strong className="footer-name">{business.name}</strong>
          <span className="footer-tag">{business.tagline}</span>
          <p className="footer-promise">{business.promise}</p>
          <p className="footer-detail">{business.address}</p>
          <p className="footer-detail">
            <a href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a> ·{' '}
            <a href={`mailto:${business.email}`}>{business.email}</a>
          </p>
          <p className="footer-detail">
            <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram {business.instagram}
            </a>{' '}
            ·{' '}
            <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          </p>
        </div>

        <nav className="footer-nav" aria-label="Footer">
          <div>
            <h3>Shop</h3>
            <Link to="/shop">Shop All</Link>
            <Link to="/products/supplements">Supplements</Link>
            <Link to="/products/health">Health Products</Link>
            <Link to="/products/personal-care-beauty">Personal Care & Beauty</Link>
            <Link to="/products/womens-wellness">Women's Wellness & PMOS</Link>
            <Link to="/products/medical-devices">Medical Devices</Link>
          </div>
          <div>
            <h3>Cosmic</h3>
            <Link to="/services">Services</Link>
            <Link to="/prescriptions">Prescriptions & Refills</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact & Hours</Link>
          </div>
        </nav>

        <div className="footer-hours">
          <h3>Hours</h3>
          {business.hours.map((h) => (
            <p key={h.days} className="footer-detail">
              <span>{h.days}</span>
              <br />
              {h.open} – {h.close}
            </p>
          ))}
          <p className="footer-detail">{business.serviceReach}</p>
        </div>
      </div>

      <div className="wrap footer-legal">
        <p>
          Product information is provided for general reference. Availability, pricing, prescription status and suitability are confirmed by
          Cosmic Pharmacy. Consult a qualified healthcare professional when medical advice is required.
        </p>
        <p className="footer-fineprint">
          © {new Date().getFullYear()} {business.name}, Belize City · Private concept demonstration — not the official Cosmic Pharmacy
          website.
        </p>
      </div>
    </footer>
  );
}
