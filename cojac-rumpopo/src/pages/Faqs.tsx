import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { publishedFaqs } from '../content/faqs';
import { usePageMeta } from '../lib/usePageMeta';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { FaqAccordion } from '../components/sections';
import type { FaqItem } from '../types';

const groups: { id: FaqItem['category']; title: string }[] = [
  { id: 'general', title: 'About rumpopo & Cojac’s' },
  { id: 'ordering', title: 'Ordering' },
  { id: 'product', title: 'Our rumpopo' },
  { id: 'delivery', title: 'Delivery & pickup' },
];

export default function Faqs() {
  usePageMeta('faqs');
  const all = publishedFaqs();
  const enquiry = generalEnquiryUrl();
  return (
    <>
      <PageHero title="Frequently Asked Questions" lead="Everything you need to know about sending your rumpopo order request." />
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
            <h2 className="display-m">Still have a question?</h2>
            <p>Cojac’s is happy to help with flavours, ingredients and delivery.</p>
            {enquiry ? (
              <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <WhatsAppIcon /> Ask on WhatsApp
              </a>
            ) : (
              <Link to={routes.contact.path} className="btn">
                Connect with us
              </Link>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
