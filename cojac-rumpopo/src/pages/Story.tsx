import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { homeCopy, seasonMoments } from '../content/copy';
import { getCatalogue } from '../content/catalogue';
import { site } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { BottleArt, Ornament, Sprig } from '../components/Art';
import { PageHero, Reveal } from '../components/ui';
import { ProductPicture } from '../components/FlavourCard';
import { AtAGlance, FinalCta } from '../components/sections';
import { t } from '../i18n/lang';

export default function Story() {
  usePageMeta('story');
  const [p1, p2, p3] = homeCopy.storyParagraphs;
  const cat = getCatalogue();
  return (
    <>
      <PageHero
        title={
          <>
            {t('Behind the ', 'Detrás de la ')}
            <em className="italic-gold">{t('Bottle', 'botella')}</em>
          </>
        }
        lead={homeCopy.storyOpener}
      />

      <section className="section section--paper story-chapter">
        <div className="container story-chapter__grid">
          <Reveal className="story-chapter__label">
            <span className="story-chapter__num">I</span>
            <h2 className="story-chapter__title">{t('A Belizean Christmas', 'Una Navidad beliceña')}</h2>
          </Reveal>
          <Reveal delay={100} className="story-chapter__text">
            <p className="dropcap lead">{p1}</p>
          </Reveal>
        </div>
        <div className="container">
          <ul className="moments moments--story">
            {seasonMoments.map((m, i) => (
              <Reveal as="li" key={m.title} delay={i * 80} className="moment">
                <span className="moment__num">0{i + 1}</span>
                <h3>{m.title}</h3>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section--burgundy grain story-chapter story-chapter--dark">
        <Sprig className="story-chapter__sprig" />
        <div className="container story-chapter__grid">
          <Reveal className="story-chapter__label">
            <span className="story-chapter__num">II</span>
            <h2 className="story-chapter__title">{t('A family recipe', 'Una receta familiar')}</h2>
          </Reveal>
          <Reveal delay={100} className="story-chapter__text">
            <p className="lead">{p2}</p>
            <p className="story-years">
              {t('Shared with Belizean families for ', 'Compartido con familias beliceñas desde hace ')}
              <strong>{site.experienceStatement}</strong>.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container evolution">
          <Reveal className="evolution__intro">
            <h2 className="display-l">{t('What started with a classic favourite has grown.', 'Lo que empezó con un clásico favorito ha crecido.')}</h2>
            <p className="lead">
              {t(
                'Classic Vanilla may have started it all, but it didn’t stop there. Customer favourites, seasonal creations and new releases followed.',
                'Classic Vanilla quizá lo empezó todo, pero no se quedó ahí. Luego llegaron los favoritos de los clientes, las creaciones de temporada y los nuevos lanzamientos.',
              )}
            </p>
            <Link to={routes.flavours.path} className="btn">
              {routes.flavours.nav}
            </Link>
          </Reveal>
          <Reveal delay={120} className="evolution__bottles" aria-hidden="true">
            {cat.slice(0, 3).map((p, i) => (
              <div key={p.id} className={`evolution__bottle e${i}`}>
                {p.images[0] ? (
                  <div className="evolution__photo">
                    <ProductPicture image={p.images[0]} mode="mobile" sizes="(min-width: 900px) 180px, 30vw" />
                  </div>
                ) : (
                  <BottleArt palette={p.palette} tag={p.name} title="" />
                )}
                <span>{p.name.replace(/ Rumpopo$/, '')}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <section className="section section--paper story-chapter">
        <div className="container story-chapter__grid">
          <Reveal className="story-chapter__label">
            <span className="story-chapter__num">III</span>
            <h2 className="story-chapter__title">{t('Preserving & reinventing', 'Conservar y reinventar')}</h2>
          </Reveal>
          <Reveal delay={100} className="story-chapter__text">
            <p className="lead">{p3}</p>
          </Reveal>
        </div>
        <div className="container--narrow center story-pull">
          <Ornament />
          <Reveal as="blockquote" className="pull-quote">
            {t(
              'Some traditions are worth preserving, and some are worth reinventing. At Cojac’s, we’re proud to do both.',
              'Algunas tradiciones merecen conservarse y otras merecen reinventarse. En Cojac’s, nos enorgullece hacer ambas cosas.',
            )}
          </Reveal>
          <Link to={routes.videos.path} className="text-link">
            {t('See our videos & features →', 'Mira nuestros videos y reportajes →')}
          </Link>
        </div>
      </section>

      <section className="section section--tight section--cream">
        <div className="container--narrow">
          <AtAGlance />
        </div>
      </section>
      <FinalCta />
    </>
  );
}
