import { useEffect, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../content/routes.json';
import { collections, getCatalogue } from '../content/catalogue';
import { buildFlags } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { isAcceptingOrders } from '../lib/season';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { FlavourCard } from '../components/FlavourCard';
import { InfoIcon, WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal, SectionHead } from '../components/ui';
import { Sparkle } from '../components/Art';

export default function Flavours() {
  usePageMeta('flavours');
  const { hash } = useLocation();
  const catalogue = getCatalogue();
  const anyUnconfirmed = catalogue.some((p) => !p.confirmedThisSeason);
  const enquiry = generalEnquiryUrl();

  useEffect(() => {
    if (!hash) return;
    const t = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <>
      <PageHero
        eyebrow="Find Your Flavour"
        title={
          <>
            More Than Just <em className="italic-gold">Classic Vanilla</em>
          </>
        }
        lead="Classic Vanilla may have started it all, but it didn’t stop there. Choose your flavours, add them to your order request and send it to Cojac’s on WhatsApp."
      />

      <section className="section section--paper flavours-page">
        <div className="container">
          {buildFlags.illustrativeMenu && (
            <div className="notice illustrative-banner" role="note">
              <InfoIcon size={20} />
              <p>
                <strong>Illustrative layout — menu awaiting confirmation.</strong> Bottle sizes shown are samples for internal review only. No
                prices or stock levels are real.
              </p>
            </div>
          )}
          {anyUnconfirmed && (
            <Reveal className="notice notice--soft menu-note" role="note">
              <InfoIcon size={20} />
              <p>
                These are the family’s classic and customer-favourite flavours. This season’s menu, bottle sizes and prices are confirmed by
                Cojac’s when you send your order request — flavours may change from season to season.
              </p>
            </Reveal>
          )}

          {collections.map((c) => {
            const items = catalogue.filter((p) => c.includes.includes(p.seasonalCollection));
            if (!items.length) return null;
            return (
              <section key={c.id} className="collection" aria-labelledby={`col-${c.id}`}>
                <Reveal className="collection__head">
                  <h2 id={`col-${c.id}`} className="display-m">
                    {c.title}
                  </h2>
                  <p>{c.intro}</p>
                </Reveal>
                <div className="flavour-grid" style={{ '--cols': Math.min(items.length, 4) } as CSSProperties}>
                  {items.map((p, i) => (
                    <Reveal key={p.id} delay={i * 90} id={p.slug} className="flavour-grid__item">
                      <FlavourCard product={p} />
                    </Reveal>
                  ))}
                </div>
              </section>
            );
          })}

          <Reveal className="discover-tile">
            <Sparkle size={22} className="discover-tile__spark" />
            <div>
              <h2 className="display-m">Seasonal creations &amp; new releases</h2>
              <p>
                From customer favourites to seasonal creations and new releases, there’s always something different to discover. Ask Cojac’s
                what’s new this season.
              </p>
            </div>
            {enquiry ? (
              <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <WhatsAppIcon /> Ask what’s new
              </a>
            ) : (
              <Link to={routes.contact.path} className="btn btn--gold">
                Connect with us
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            eyebrow="Before you order"
            title="Good to know"
            lead={isAcceptingOrders() ? 'A few details to keep in mind while you choose.' : 'Order requests are closed until next season.'}
          />
          <div className="know-grid">
            <Reveal className="know">
              <h3>Contains alcohol</h3>
              <p>Our rumpopo is for adults of legal drinking age only. Please enjoy responsibly.</p>
            </Reveal>
            <Reveal delay={80} className="know">
              <h3>Allergies &amp; ingredients</h3>
              <p>Rumpopo may contain eggs and dairy, and some flavours may contain nuts. Ask Cojac’s about any flavour before ordering.</p>
            </Reveal>
            <Reveal delay={160} className="know">
              <h3>Confirmed on WhatsApp</h3>
              <p>Availability, final total, payment and delivery or pickup are confirmed with you directly by Cojac’s.</p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
