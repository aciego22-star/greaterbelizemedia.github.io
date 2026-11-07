import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { site } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { PhoneIcon, PinIcon, WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal, SocialIcons } from '../components/ui';
import { Ornament } from '../components/Art';
import { AtAGlance, LocationMap } from '../components/sections';
import { t } from '../i18n/lang';

export default function Contact() {
  usePageMeta('contact');
  const enquiry = generalEnquiryUrl();
  const { contact } = site;

  return (
    <>
      <PageHero
        title={t('We’d Love to Hear From You', 'Nos encantaría saber de ti')}
        lead={t('WhatsApp is the quickest way to reach Cojac’s for orders and questions.', 'WhatsApp es la forma más rápida de contactar a Cojac’s para pedidos y preguntas.')}
      />
      <section className="section section--paper">
        <div className="container contact-grid">
          <Reveal className="contact-primary card">
            <span className="contact-primary__icon">
              <WhatsAppIcon size={34} />
            </span>
            <h2 className="display-m">{t('Order & enquiries on WhatsApp', 'Pedidos y consultas por WhatsApp')}</h2>
            <p>
              {t(
                'Build your order request on the website and send it in one message, or simply say hello with a question.',
                'Arma tu pedido en el sitio web y envíalo en un solo mensaje, o simplemente escríbenos con tu pregunta.',
              )}
            </p>
            <div className="contact-primary__social">
              <SocialIcons size="lg" />
            </div>
            <div className="btn-row">
              <Link to={routes.flavours.path} className="btn btn--whatsapp">
                <WhatsAppIcon /> {t('Start an order request', 'Empezar un pedido')}
              </Link>
              {enquiry && (
                <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--ghost-dark">
                  {t('Ask a question', 'Hacer una pregunta')}
                </a>
              )}
            </div>
          </Reveal>

          <div className="contact-side">
            <Reveal delay={80} className="contact-item card">
              <PinIcon size={24} />
              <div>
                <h3>{t('Where we’re based', 'Dónde estamos')}</h3>
                <p>{contact.addressLine}</p>
                <p className="hint">
                  {t('Delivery, shipping and any pickup arrangements are confirmed on WhatsApp.', 'La entrega, el envío y cualquier arreglo para recoger se confirman por WhatsApp.')}
                </p>
                {contact.mapUrl && (
                  <a href="#map" className="text-link">
                    {t('See the map ↓', 'Ver el mapa ↓')}
                  </a>
                )}
              </div>
            </Reveal>
            {contact.phoneDisplay && contact.phoneDial && (
              <Reveal delay={120} className="contact-item card">
                <PhoneIcon size={24} />
                <div>
                  <h3>{t('Phone', 'Teléfono')}</h3>
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
