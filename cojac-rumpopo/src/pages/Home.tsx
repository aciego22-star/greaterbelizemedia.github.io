import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { homeCopy, seasonMoments, guarantee } from '../content/copy';
import { getCatalogue } from '../content/catalogue';
import { gallery } from '../content/gallery';
import { media } from '../content/media';
import { publishedFaqs } from '../content/faqs';
import { site } from '../content/site';
import { formatLongDate, getSeasonState } from '../lib/season';
import { usePageMeta } from '../lib/usePageMeta';
import { isEs, t } from '../i18n/lang';
import { Ornament, Sparkle, Sprig } from '../components/Art';
import { ArrowIcon, WhatsAppIcon } from '../components/Icons';
import { Reveal, SectionHead } from '../components/ui';
import { FlavourVisual } from '../components/FlavourCard';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { PostCard } from '../components/blog';
import { publishedPosts } from '../content/blog/posts';
import { FaqAccordion, FinalCta, GalleryTile, GuaranteePillars, HowItWorks, TrustStrip, VideoCard } from '../components/sections';

function Hero() {
  return (
    <>
      <HeroSlideshow />
      <section className="hero-intro grain on-dark" aria-labelledby="hero-title">
        <div className="hero-intro__glow" aria-hidden="true" />
        <div className="container hero-intro__inner">
          <h1 id="hero-title" className="hero__title">
            {isEs ? (
              <>
                No hay nada como la temporada de <em className="italic-gold">rumpopo</em>
              </>
            ) : (
              <>
                There’s Nothing Quite Like <em className="italic-gold">Rumpopo</em> Season
              </>
            )}
          </h1>
          <p className="hero__lead">{homeCopy.heroLead}</p>
          <div className="btn-row hero__ctas">
            <Link to={routes.flavours.path} className="btn btn--gold">
              {routes.flavours.nav} <ArrowIcon size={18} />
            </Link>
            <Link to={routes.order.path} className="btn btn--whatsapp">
              <WhatsAppIcon /> {t('Order on WhatsApp', 'Pedir por WhatsApp')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

function SeasonStatus() {
  const state = getSeasonState();
  if (state === 'closed' || state === 'upcoming') {
    return (
      <section className="season-card-wrap" aria-label={t('Season status', 'Estado de la temporada')}>
        <div className="container">
          <Reveal className="season-card season-card--closed">
            <div>
              <h2 className="display-m">{state === 'closed' ? site.season.closedHeadline : t('Rumpopo season is almost here.', 'La temporada de rumpopo ya casi llega.')}</h2>
              <p>{state === 'closed' ? site.season.closedText : t('Order requests open when the season begins.', 'Los pedidos se abren cuando empiece la temporada.')}</p>
            </div>
          </Reveal>
        </div>
      </section>
    );
  }
  return (
    <section className="season-card-wrap" aria-labelledby="season-title">
      <div className="container">
        <Reveal className="season-card">
          <div className="season-card__intro">
            <h2 id="season-title" className="display-m">
              {t('Rumpopo season is here!', '¡Llegó la temporada de rumpopo!')}
            </h2>
            <p>
              {t('Order requests are open until ', 'Los pedidos están abiertos hasta el ')}
              <strong>{formatLongDate(site.season.seasonClosesOn)}</strong>.
            </p>
          </div>
          <ul className="season-card__list">
            {site.fulfilment
              .filter((f) => f.enabled && f.id !== 'advise')
              .map((f) => (
                <li key={f.id}>
                  <Sparkle size={12} />
                  <span>
                    {f.label}
                    {f.short && <small className="season-card__note">: {f.short}</small>}
                  </span>
                </li>
              ))}
          </ul>
          <div className="season-card__cta">
            <Link to={routes.flavours.path} className="btn">
              {t('Start your order', 'Empieza tu pedido')}
            </Link>
            <p className="season-card__fine">
              {t(
                'Delivery is BZD $5 in Belize City. Shipping charges are confirmed on WhatsApp.',
                'La entrega cuesta BZD $5 en la Ciudad de Belice. El costo de envío se confirma por WhatsApp.',
              )}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StoryStrip() {
  return (
    <section className="section section--paper story-strip" aria-labelledby="story-title">
      <Sprig className="story-strip__sprig" />
      <div className="container story-strip__grid">
        <Reveal className="story-strip__quote">
          <h2 id="story-title" className="display-l">
            “{homeCopy.storyOpener}”
          </h2>
        </Reveal>
        <Reveal delay={120} className="story-strip__text">
          <p className="lead">{homeCopy.storyParagraphs[0]}</p>
          <p>{homeCopy.storyParagraphs[1]}</p>
          <Link to={routes.story.path} className="text-link">
            {t('Read our story: Behind the Bottle →', 'Lee nuestra historia: detrás de la botella →')}
          </Link>
        </Reveal>
      </div>
      <div className="container">
        <ul className="moments">
          {seasonMoments.map((m, i) => (
            <Reveal as="li" key={m.title} delay={i * 80} className="moment">
              <span className="moment__num">0{i + 1}</span>
              <h3>{m.title}</h3>
              <p>{m.text}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FeaturedFlavours() {
  const featured = getCatalogue().filter((p) => p.highlighted);
  if (!featured.length) return null;
  return (
    <section className="section section--cream" aria-labelledby="featured-title">
      <div className="container">
        <SectionHead
          center
          title={<span id="featured-title">{t('More Than Just Classic Vanilla', 'Mucho más que vainilla clásica')}</span>}
          lead={t('Classic Vanilla may have started it all, but it didn’t stop there.', 'Classic Vanilla quizá lo empezó todo, pero no se quedó ahí.')}
        />
        <div className="featured">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 100} className="featured__item">
              <Link to={`${routes.flavours.path}#${p.slug}`} className="featured__link">
                <FlavourVisual product={p} />
                <div className="featured__body">
                  <h3>{p.name}</h3>
                  <span className="featured__go">
                    {t('Choose this flavour', 'Elegir este sabor')} <ArrowIcon size={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="featured__foot">
          <p>
            {t(
              'Seven flavours this season, every one in a half liter (500 mL) or liter (1 L) bottle.',
              'Siete sabores esta temporada, cada uno en botella de medio litro (500 mL) o de litro (1 L).',
            )}
          </p>
          <Link to={routes.flavours.path} className="btn btn--ghost-dark">
            {t('See all flavours', 'Ver todos los sabores')}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta('home');
  const latestPost = publishedPosts()[0];
  const homeFaqIds = ['what-is-rumpopo', 'how-to-order', 'prices', 'delivery-areas', 'is-order-confirmed'];
  const faqs = homeFaqIds.map((id) => publishedFaqs().find((f) => f.id === id)).filter((f): f is NonNullable<typeof f> => !!f);
  const videos = media.filter((m) => m.featured && m.platform === 'youtube').slice(0, 2);
  return (
    <>
      <Hero />
      <SeasonStatus />
      <TrustStrip />
      <StoryStrip />
      <FeaturedFlavours />

      <section className="section section--evergreen grain" aria-labelledby="guarantee-title">
        <div className="container">
          <SectionHead
            center
            title={<span id="guarantee-title">{guarantee.title}</span>}
          />
          <GuaranteePillars />
          <Reveal className="center-link">
            <Link to={routes.guarantee.path} className="text-link">
              {t('Read the Cojac’s Guarantee →', 'Lee la garantía Cojac’s →')}
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--paper" aria-labelledby="how-title">
        <div className="container">
          <SectionHead
            center
            title={<span id="how-title">{t('Simple, from your phone to your table', 'Fácil, de tu teléfono a tu mesa')}</span>}
            lead={t(
              'No accounts and no card payments online. Pay cash on delivery or by bank transfer, and your order request goes straight to Cojac’s on WhatsApp.',
              'Sin cuentas y sin pagos con tarjeta en línea. Paga en efectivo contra entrega o por transferencia bancaria, y tu pedido llega directo a Cojac’s por WhatsApp.',
            )}
          />
          <HowItWorks />
          <Reveal className="center-link">
            <Link to={routes.flavours.path} className="btn">
              {t('Start your order request', 'Empieza tu pedido')}
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream" aria-labelledby="gallery-title">
        <div className="container">
          <div className="split-head">
            <SectionHead title={<span id="gallery-title">{t('Moments from the season', 'Momentos de la temporada')}</span>} />
            <Link to={routes.gallery.path} className="text-link split-head__link">
              {t('View the gallery →', 'Ver la galería →')}
            </Link>
          </div>
          <div className="gallery-preview">
            {gallery.slice(0, 4).map((g, i) => (
              <Reveal key={g.id} delay={i * 80}>
                <GalleryTile item={g} portrait />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="section section--burgundy grain" aria-labelledby="videos-title">
          <div className="container">
            <div className="split-head">
              <SectionHead title={<span id="videos-title">{t('A few moments from the journey', 'Algunos momentos del camino')}</span>} />
              <Link to={routes.videos.path} className="text-link split-head__link">
                {t('All videos & features →', 'Todos los videos y reportajes →')}
              </Link>
            </div>
            <div className="video-grid">
              {videos.map((v, i) => (
                <Reveal key={v.id} delay={i * 100}>
                  <VideoCard item={v} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {latestPost && (
        <section className="section section--cream" aria-labelledby="blog-home-title">
          <div className="container">
            <div className="split-head">
              <SectionHead title={<span id="blog-home-title">{t('From the Holiday Blog', 'Desde el blog navideño')}</span>} />
              <Link to={routes.holidayBlog.path} className="text-link split-head__link">
                {t('All Holiday Blog stories →', 'Todas las historias del blog navideño →')}
              </Link>
            </div>
            <Reveal>
              <PostCard post={latestPost} variant="compact" headingLevel={3} />
            </Reveal>
          </div>
        </section>
      )}

      <section className="section section--paper" aria-labelledby="faq-title">
        <div className="container faq-preview">
          <div>
            <SectionHead title={<span id="faq-title">{t('Good to know', 'Bueno saber')}</span>} />
            <Ornament />
            <Link to={routes.faqs.path} className="text-link">
              {t('All frequently asked questions →', 'Todas las preguntas frecuentes →')}
            </Link>
          </div>
          <Reveal>
            <FaqAccordion items={faqs} />
          </Reveal>
        </div>
      </section>

      <FinalCta />
    </>
  );
}
