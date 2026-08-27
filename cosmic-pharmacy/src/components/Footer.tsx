import { Link } from 'react-router-dom';
import { business } from '../data/business';
import { SocialLinks } from './SocialLinks';
import logoPrimary from '../assets/brand/cosmic-pharmacy-logo-primary.svg';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-inner">
        <Link to="/" className="footer-logo" aria-label={`${business.name}, go to the home page`}>
          <img src={logoPrimary} alt={`${business.name}. ${business.tagline}`} width={260} height={93} />
        </Link>

        <p className="footer-promise">{business.promise}</p>

        <address className="footer-contact">
          <span>{business.address}</span>
          <span aria-hidden="true" className="footer-sep">
            ·
          </span>
          <a href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a>
          <span aria-hidden="true" className="footer-sep">
            ·
          </span>
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </address>

        <div className="footer-hours">
          {business.hours.map((h) => (
            <span key={h.days}>
              <strong>{h.days}</strong> {h.open} – {h.close}
            </span>
          ))}
        </div>

        <SocialLinks />

        <nav className="footer-nav" aria-label="Footer">
          <div className="footer-nav-col">
            <h2>Explore</h2>
            <Link to="/shop">Shop All</Link>
            <Link to="/products/supplements">Supplements</Link>
            <Link to="/products/health">Health Products</Link>
            <Link to="/products/personal-care-beauty">Personal Care & Beauty</Link>
            <Link to="/products/womens-wellness">Women's Wellness & PMOS</Link>
            <Link to="/products/medical-devices">Medical Devices</Link>
          </div>
          <div className="footer-nav-col">
            <h2>Company</h2>
            <Link to="/services">Services</Link>
            <Link to="/prescriptions">Prescriptions & Refills</Link>
            <Link to="/blog">Blog</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </nav>

        <p className="footer-reach">{business.serviceReach}</p>
      </div>

      <div className="wrap footer-legal">
        <p className="footer-fineprint">
          © {new Date().getFullYear()} {business.name}, Belize City · Private concept demonstration, not the official Cosmic Pharmacy
          website.
        </p>
      </div>
    </footer>
  );
}
