import { business } from '../data/business';
import { whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

export function Contact() {
  usePageMeta(
    'Contact & Visit Us | Cosmic Pharmacy',
    'Visit Cosmic Pharmacy at #41 Corner Holy Emmanuel Street/CET Site, Belize City. Phone and WhatsApp +501 611-8080.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">Contact & Visit Us</span>
          <h1 className="section-title">Come see us, or just message</h1>
          <div className="visit-grid">
            <div>
              <h2>Location</h2>
              <p>{business.address}</p>
              <h2>Phone & WhatsApp</h2>
              <p>
                <a href={`tel:${business.phoneTel}`}>{business.phoneDisplay}</a>
              </p>
              <h2>Email</h2>
              <p>
                <a href={`mailto:${business.email}`}>{business.email}</a>
              </p>
              <h2>Social</h2>
              <p>
                <a href={business.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram {business.instagram}
                </a>
                <br />
                <a href={business.facebookUrl} target="_blank" rel="noopener noreferrer">
                  {business.facebookName}
                </a>
              </p>
            </div>
            <div>
              <h2>Opening hours</h2>
              {business.hours.map((h) => (
                <p key={h.days}>
                  <strong>{h.days}</strong>
                  <br />
                  {h.open} – {h.close}
                </p>
              ))}
              <p className="text-muted">Hours from Cosmic's current public page. Please confirm around public holidays.</p>
              <a className="btn btn-whatsapp" href={whatsappUrl('Hello Cosmic Pharmacy! I have a quick question.')} target="_blank" rel="noopener noreferrer">
                Message Us on WhatsApp
              </a>
            </div>
            <div className="map-placeholder" role="img" aria-label="Map placeholder, embedded map pending">
              <span>Map embed pending</span>
              <span className="text-muted">#41 Corner Holy Emmanuel Street/CET Site</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
