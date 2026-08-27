import { business } from '../data/business';
import { ContactDetails } from '../components/ContactDetails';
import { LocationMap } from '../components/LocationMap';
import { SocialLinks } from '../components/SocialLinks';
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
          <p className="section-intro">
            Every detail below is live: tap to call, message, mail or open the map. {business.promise}
          </p>

          <div className="contact-layout">
            <ContactDetails />
            <LocationMap />
          </div>

          <div className="contact-social">
            <h2>Find us on social</h2>
            <SocialLinks />
          </div>
        </section>
      </div>
    </div>
  );
}
