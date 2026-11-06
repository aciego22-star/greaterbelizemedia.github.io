import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { site } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { PhoneIcon, PinIcon, WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal, SocialIcons } from '../components/ui';
import { Ornament } from '../components/Art';
import { AtAGlance, LocationMap } from '../components/sections';

export default function Contact() {
  usePageMeta('contact');
  const enquiry = generalEnquiryUrl();
  const { contact } = site;

  return (
    <>
      <PageHero eyebrow="Connect With Us" title="We’d Love to Hear From You" lead="WhatsApp is the quickest way to reach Cojac’s for orders and questions." />
      <section className="section section--paper">
        <div className="container contact-grid">
          <Reveal className="contact-primary card">
            <span className="contact-primary__icon">
              <WhatsAppIcon size={34} />
            </span>
            <h2 className="display-m">Order &amp; enquiries on WhatsApp</h2>
            <p>Build your order request on the website and send it in one message, or simply say hello with a question.</p>
            <div className="contact-primary__social">
              <p className="contact-primary__social-label">Message or follow us</p>
              <SocialIcons size="lg" />
            </div>
            <div className="btn-row">
              <Link to={routes.flavours.path} className="btn btn--whatsapp">
                <WhatsAppIcon /> Start an order request
              </Link>
              {enquiry && (
                <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark">
                  Ask a question
                </a>
              )}
            </div>
          </Reveal>

          <div className="contact-side">
            <Reveal delay={80} className="contact-item card">
              <PinIcon size={24} />
              <div>
                <h3>Where we’re based</h3>
                <p>{contact.addressLine}</p>
                <p className="hint">Delivery, shipping and any pickup arrangements are confirmed on WhatsApp.</p>
                {contact.mapUrl && (
                  <a href="#map" className="text-link">
                    See the map ↓
                  </a>
                )}
              </div>
            </Reveal>
            {contact.phoneDisplay && contact.phoneDial && (
              <Reveal delay={120} className="contact-item card">
                <PhoneIcon size={24} />
                <div>
                  <h3>Phone</h3>
                  <a href={`tel:+${contact.phoneDial}`} className="text-link">
                    {contact.phoneDisplay}
                  </a>
                </div>
              </Reveal>
            )}
          </div>
        </div>
        {contact.mapUrl && (
          <div className="container" style={{ marginTop: 56 }}>
            <LocationMap />
          </div>
        )}
        <div className="container--narrow" style={{ marginTop: 56 }}>
          <AtAGlance />
        </div>
        <div className="container--narrow center contact-foot">
          <Ornament />
          <p>{site.alcohol.responsibleMessage}</p>
        </div>
      </section>
    </>
  );
}
