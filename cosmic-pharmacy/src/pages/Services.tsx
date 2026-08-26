import { Link } from 'react-router-dom';
import { business } from '../data/business';
import { buildPrescriptionMessage, whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

const services = [
  {
    name: 'Prescription filling & refill assistance',
    desc: 'Bring or send your prescription and the pharmacist takes it from there — with clear guidance on what is required before dispensing.'
  },
  {
    name: 'Pharmacist guidance',
    desc: `${business.pharmacist} and the team ask the right questions before recommending or dispensing a product, so what you take home actually fits.`
  },
  {
    name: 'Product sourcing & special orders',
    desc: 'Looking for something hard to find? Cosmic helps customers source products that are not on the shelf.'
  },
  {
    name: 'WhatsApp product requests',
    desc: 'Search the online catalogue, build a basket, and send the whole request to Cosmic in one WhatsApp message.'
  },
  {
    name: 'Pickup at the pharmacy',
    desc: `Collect confirmed orders at ${business.address}.`
  },
  {
    name: 'Delivery & shipping',
    desc: 'Belize City delivery, plus out-district and main-island shipping — options and charges are confirmed by the pharmacy on each request.'
  }
];

export function Services() {
  usePageMeta(
    'Services | Cosmic Pharmacy',
    'Prescription filling, pharmacist guidance, product sourcing, WhatsApp requests, pickup, and delivery and shipping across Belize.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">Service-led pharmacy</span>
          <h1 className="section-title">Services</h1>
          <p className="section-intro">
            Cosmic's difference isn't just what's on the shelf — it's the pharmacist behind the counter. {business.promise}
          </p>
          <div className="services-grid">
            {services.map((s) => (
              <article key={s.name} className="service-card">
                <h2>{s.name}</h2>
                <p>{s.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel-section cool section-pad">
          <h2>Ready when you are</h2>
          <div className="section-cta-row">
            <Link className="btn btn-primary" to="/shop">
              Search Products
            </Link>
            <a className="btn btn-magenta" href={whatsappUrl(buildPrescriptionMessage())} target="_blank" rel="noopener noreferrer">
              Send a Prescription
            </a>
          </div>
          <p className="text-muted services-note">
            Delivery areas, shipping charges and timing are confirmed by Cosmic Pharmacy on each request — the website doesn't guarantee
            stock or delivery times.
          </p>
        </section>
      </div>
    </div>
  );
}
