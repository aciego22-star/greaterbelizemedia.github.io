import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { homeCopy, seasonMoments, guarantee } from '../content/copy';
import { getCatalogue } from '../content/catalogue';
import { gallery } from '../content/gallery';
import { media } from '../content/media';
import { publishedFaqs } from '../content/faqs';
import { site } from '../content/site';
import { formatLongDate, getSeasonState } from '../lib/season';
import { usePageMeta } from '../lib/usePageMeta';
import { Ornament, Sparkle, Sprig } from '../components/Art';
import { ArrowIcon, WhatsAppIcon } from '../components/Icons';
import { Reveal, SectionHead } from '../components/ui';
import { FlavourVisual } from '../components/FlavourCard';
import { HeroSlideshow } from '../components/HeroSlideshow';
import { FaqAccordion, FinalCta, GalleryTile, GuaranteePillars, HowItWorks, TrustStrip, VideoCard } from '../components/sections';

function Hero() {
  return (
    <>
      <HeroSlideshow />
      <section className="hero-intro grain on-dark" aria-labelledby="hero-title">
        <div className="hero-intro__glow" aria-hidden="true" />
        <div className="container hero-intro__inner">
          <h1 id="hero-title" className="hero__title">
            There’s Nothing Quite Like <em className="italic-gold">Rumpopo</em> Season
          </h1>
          <p className="hero__lead">{homeCopy.heroLead}</p>
          <div className="btn-row hero__ctas">
            <Link to={routes.flavours.path} className="btn btn--gold">
              Find Your Flavour <ArrowIcon size={18} />
            </Link>
            <Link to={routes.order.path} className="btn btn--whatsapp">
              <WhatsAppIcon /> Order on WhatsApp
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
      <section className="season-card-wrap" aria-label="Season status">
        <div className="container">
          <Reveal className="season-card season-card--closed">
            <div>
              <h2 className="display-m">{state === 'closed' ? site.season.closedHeadline : 'Rumpopo season is almost here.'}</h2>
              <p>{state === 'closed' ? site.season.closedText : 'Order requests open when the season begins.'}</p>
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
              Rumpopo season is here!
            </h2>
            <p>
              Order requests are open until <strong>{formatLongDate(site.season.seasonClosesOn)}</strong>.
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
              Start your order
            </Link>
            <p className="season-card__fine">Delivery is BZD $5 in Belize City. Shipping charges are confirmed on WhatsApp.</p>
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
            Read our story: Behind the Bottle →
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
          title={<span id="featured-title">More Than Just Classic Vanilla</span>}
          lead="Classic Vanilla may have started it all, but it didn’t stop there."
        />
        <div className="featured">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 100} className="featured__item">
              <Link to={`${routes.flavours.path}#${p.slug}`} className="featured__link">
                <FlavourVisual product={p} />
                <div className="featured__body">
                  <h3>{p.name}</h3>
                  <span className="featured__go">
                    Choose this flavour <ArrowIcon size={16} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
        <Reveal className="featured__foot">
          <p>Seven flavours this season, every one in a half liter (500 mL) or liter (1 L) bottle.</p>
          <Link to={routes.flavours.path} className="btn btn--ghost-dark">
            See all flavours
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  usePageMeta('home');
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
              Read the Cojac’s Guarantee →
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--paper" aria-labelledby="how-title">
        <div className="container">
          <SectionHead
            center
            title={<span id="how-title">Simple, from your phone to your table</span>}
            lead="No accounts and no online payment. Your order request goes straight to Cojac’s on WhatsApp."
          />
          <HowItWorks />
          <Reveal className="center-link">
            <Link to={routes.flavours.path} className="btn">
              Start your order request
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="section section--cream" aria-labelledby="gallery-title">
        <div className="container">
          <div className="split-head">
            <SectionHead title={<span id="gallery-title">Moments from the season</span>} />
            <Link to={routes.gallery.path} className="text-link split-head__link">
              View the gallery →
            </Link>
          </div>
          <div className="gallery-preview">
            {gallery.slice(0, 4).map((g, i) => (
              <Reveal key={g.id} delay={i * 80}>
                <GalleryTile item={g} index={i} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {videos.length > 0 && (
        <section className="section section--burgundy grain" aria-labelledby="videos-title">
          <div className="container">
            <div className="split-head">
              <SectionHead title={<span id="videos-title">A few moments from the journey</span>} />
              <Link to={routes.videos.path} className="text-link split-head__link">
                All videos &amp; features →
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

      <section className="section section--paper" aria-labelledby="faq-title">
        <div className="container faq-preview">
          <div>
            <SectionHead title={<span id="faq-title">Good to know</span>} />
            <Ornament />
            <Link to={routes.faqs.path} className="text-link">
              All frequently asked questions →
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
