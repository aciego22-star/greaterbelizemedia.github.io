import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { guarantee } from '../content/copy';
import { usePageMeta } from '../lib/usePageMeta';
import { InfoIcon } from '../components/Icons';
import { PageHero, Reveal } from '../components/ui';
import { FinalCta, GuaranteePillars } from '../components/sections';
import { t } from '../i18n/lang';

export default function Guarantee() {
  usePageMeta('guarantee');
  return (
    <>
      <PageHero
        tone="evergreen"
        title={
          <>
            {t('What You Can Expect in ', 'Lo que puedes esperar en ')}
            <em className="italic-gold">{t('Every Bottle', 'cada botella')}</em>
          </>
        }
        lead={t(
          'Rich and creamy. No eggy taste. Filled to the top. More than just Classic Vanilla.',
          'Rico y cremoso. Sin sabor a huevo. Lleno hasta el tope. Mucho más que vainilla clásica.',
        )}
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
              <h2>{t('A note on ingredients', 'Una nota sobre los ingredientes')}</h2>
              <p>
                {t(
                  '“No eggy taste” describes flavour, not ingredients. Rumpopo may contain eggs and dairy, and some flavours may contain other allergens such as nuts. If you have an allergy or dietary question, please ask Cojac’s about the specific flavour before ordering.',
                  '“Sin sabor a huevo” describe el sabor, no los ingredientes. El rumpopo puede contener huevo y lácteos, y algunos sabores pueden contener otros alérgenos, como nueces o maní. Si tienes una alergia o una pregunta sobre tu dieta, pregúntale a Cojac’s por el sabor específico antes de pedir.',
                )}
              </p>
              <Link to={routes.faqs.path} className="text-link">
                {t('Read our FAQs →', 'Lee nuestras preguntas frecuentes →')}
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
      <FinalCta />
    </>
  );
}
