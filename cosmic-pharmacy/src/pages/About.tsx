import { Link } from 'react-router-dom';
import { business } from '../data/business';
import { usePageMeta } from '../lib/usePageMeta';

export function About() {
  usePageMeta(
    'About | Cosmic Pharmacy',
    'Cosmic Pharmacy, Belize City — a pharmacist-led pharmacy known for guidance, sourcing hard-to-find products, and friendly service countrywide.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">About Cosmic</span>
          <h1 className="section-title">{business.promise}</h1>
          <p className="section-intro">
            Cosmic Pharmacy is a pharmacist-led pharmacy at {business.address} — {business.tagline.toLowerCase()}, under one roof.
          </p>
          <p>
            What customers consistently mention isn't just the range: it's the guidance. {business.pharmacist} is known for asking the right
            questions before recommending or dispensing anything, for helping people track down hard-to-find products, and for friendly,
            efficient service at reasonable prices — including for customers well outside the immediate neighbourhood.
          </p>
          <p>
            This website extends that same service online: search the catalogue conveniently from anywhere in Belize, then let a real
            pharmacist confirm what is appropriate and available before anything is dispensed or shipped.
          </p>
          <div className="section-cta-row">
            <Link className="btn btn-primary" to="/shop">
              Search the Catalogue
            </Link>
            <Link className="btn btn-outline-light" to="/services">
              See Our Services
            </Link>
          </div>
        </section>

        <section className="panel-section cool section-pad">
          <h2>What guides the counter</h2>
          <div className="services-grid">
            <article className="service-card">
              <h3>Guidance first</h3>
              <p>The right questions come before any recommendation — that's the Cosmic way.</p>
            </article>
            <article className="service-card">
              <h3>Honest pricing</h3>
              <p>Fair, transparent prices, confirmed clearly before you commit to anything.</p>
            </article>
            <article className="service-card">
              <h3>We find it</h3>
              <p>If it's hard to find, Cosmic helps you source it.</p>
            </article>
            <article className="service-card">
              <h3>All of Belize</h3>
              <p>Belize City, the districts and the islands — service doesn't stop at the neighbourhood.</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
