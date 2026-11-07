import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { publishedFaqs } from '../content/faqs';
import { usePageMeta } from '../lib/usePageMeta';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { FaqAccordion } from '../components/sections';
import type { FaqItem } from '../types';
import { t } from '../i18n/lang';

const groups: { id: FaqItem['category']; title: string }[] = [
  { id: 'general', title: t('About rumpopo & Cojac’s', 'Sobre el rumpopo y Cojac’s') },
  { id: 'ordering', title: t('Ordering', 'Pedidos') },
  { id: 'product', title: t('Our rumpopo', 'Nuestro rumpopo') },
  { id: 'delivery', title: t('Delivery & pickup', 'Entrega y recogida') },
];

export default function Faqs() {
  usePageMeta('faqs');
  const all = publishedFaqs();
  const enquiry = generalEnquiryUrl();
  return (
    <>
      <PageHero
        title={t('Frequently Asked Questions', 'Preguntas frecuentes')}
        lead={t('Everything you need to know about sending your rumpopo order request.', 'Todo lo que necesitas saber para enviar tu pedido de rumpopo.')}
      />
      <section className="section section--paper">
        <div className="container faq-page">
          {groups.map((g) => {
            const items = all.filter((f) => f.category === g.id);
            if (!items.length) return null;
            return (
              <Reveal key={g.id} className="faq-group">
                <h2 className="display-m">{g.title}</h2>
                <FaqAccordion items={items} />
              </Reveal>
            );
          })}
          <Reveal className="faq-cta card">
            <h2 className="display-m">{t('Still have a question?', '¿Todavía tienes alguna pregunta?')}</h2>
            <p>{t('Cojac’s is happy to help with flavours, ingredients and delivery.', 'Cojac’s te ayuda con gusto con los sabores, los ingredientes y la entrega.')}</p>
            {enquiry ? (
              <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <WhatsAppIcon /> {t('Ask on WhatsApp', 'Pregunta por WhatsApp')}
              </a>
            ) : (
              <Link to={routes.contact.path} className="btn">
                {t('Connect with us', 'Conecta con nosotros')}
              </Link>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
