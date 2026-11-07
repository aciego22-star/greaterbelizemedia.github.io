import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { guarantee } from '../content/copy';
import { usePageMeta } from '../lib/usePageMeta';
import { InfoIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { FinalCta, GuaranteePillars } from '../components/sections';

export default function Guarantee() {
  usePageMeta('guarantee');
  return (
    <>
      <PageHero
        tone="evergreen"
        title={
          <>
            What You Can Expect in <em className="italic-gold">Every Bottle</em>
          </>
        }
        lead="Rich and creamy. No eggy taste. Filled to the top. More than just Classic Vanilla."
      />
      <section className="section section--paper">
        <div className="container">
          <h2 className="visually-hidden">{guarantee.title}</h2>
          <GuaranteePillars large />
        </div>
      </section>
      <section className="section section--tight section--cream">
        <div className="container--narrow">
          <Reveal className="notice ingredient-note" role="note">
            <InfoIcon size={22} />
            <div>
              <h2>A note on ingredients</h2>
              <p>
                “No eggy taste” describes flavour, not ingredients. Rumpopo may contain eggs and dairy, and some flavours may contain other
                allergens such as nuts. If you have an allergy or dietary question, please ask Cojac’s about the specific flavour before
                ordering.
              </p>
              <Link to={routes.faqs.path} className="text-link">
                Read our FAQs →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
