import { useEffect, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import routes from '../content/routes';
import { collections, getCatalogue } from '../content/catalogue';
import { buildFlags } from '../content/site';
import { usePageMeta } from '../lib/usePageMeta';
import { isAcceptingOrders } from '../lib/season';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { FlavourCard } from '../components/FlavourCard';
import { InfoIcon, WhatsAppIcon } from '../components/Icons';
import { PageHero, Reveal, SectionHead } from '../components/ui';
import { Sparkle } from '../components/Art';
import { t } from '../i18n/lang';

export default function Flavours() {
  usePageMeta('flavours');
  const { hash } = useLocation();
  const catalogue = getCatalogue();
  const anyUnconfirmed = catalogue.some((p) => !p.confirmedThisSeason);
  const enquiry = generalEnquiryUrl();

  useEffect(() => {
    if (!hash) return;
    const timer = window.setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ block: 'start' }), 60);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    <>
      <PageHero
        title={
          <>
            {t('More Than Just ', 'Mucho más que ')}
            <em className="italic-gold">{t('Classic Vanilla', 'vainilla clásica')}</em>
          </>
        }
        lead={t(
          'Classic Vanilla may have started it all, but it didn’t stop there. Choose your flavours, add them to your order request and send it to Cojac’s on WhatsApp.',
          'Classic Vanilla quizá lo empezó todo, pero no se quedó ahí. Elige tus sabores, añádelos a tu pedido y envíaselo a Cojac’s por WhatsApp.',
        )}
      />

      <section className="section section--paper flavours-page">
        <div className="container">
          {buildFlags.illustrativeMenu && (
            <div className="notice illustrative-banner" role="note">
              <InfoIcon size={20} />
              <p>
                <strong>{t('Illustrative layout: menu awaiting confirmation.', 'Diseño ilustrativo: menú por confirmar.')}</strong>{' '}
                {t(
                  'Bottle sizes shown are samples for internal review only. No prices or stock levels are real.',
                  'Los tamaños de botella son muestras solo para revisión interna. Ningún precio ni inventario es real.',
                )}
              </p>
            </div>
          )}
          {anyUnconfirmed && (
            <Reveal className="notice notice--soft menu-note" role="note">
              <InfoIcon size={20} />
              <p>
                {t(
                  'These are the family’s classic and customer-favourite flavours. This season’s menu, bottle sizes and prices are confirmed by Cojac’s when you send your order request. Flavours may change from season to season.',
                  'Estos son los sabores clásicos de la familia y los favoritos de los clientes. Cojac’s confirma el menú, los tamaños y los precios de esta temporada cuando envías tu pedido. Los sabores pueden cambiar de una temporada a otra.',
                )}
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
              <h2 className="display-m">{t('Seasonal creations & new releases', 'Creaciones de temporada y nuevos lanzamientos')}</h2>
              <p>
                {t(
                  'From customer favourites to seasonal creations and new releases, there’s always something different to discover. Ask Cojac’s what’s new this season.',
                  'Desde los favoritos de los clientes hasta las creaciones de temporada y los nuevos lanzamientos, siempre hay algo diferente por descubrir. Pregúntale a Cojac’s qué hay de nuevo esta temporada.',
                )}
              </p>
            </div>
            {enquiry ? (
              <a href={enquiry} target="_blank" rel="noopener noreferrer" className="btn btn--whatsapp">
                <WhatsAppIcon /> {t('Ask what’s new', 'Pregunta qué hay de nuevo')}
              </a>
            ) : (
              <Link to={routes.contact.path} className="btn btn--gold">
                {t('Connect with us', 'Conecta con nosotros')}
              </Link>
            )}
          </Reveal>
        </div>
      </section>

      <section className="section section--cream">
        <div className="container">
          <SectionHead
            center
            title={t('Good to know', 'Bueno saber')}
            lead={
              isAcceptingOrders()
                ? t('A few details to keep in mind while you choose.', 'Algunos detalles para tener en cuenta mientras eliges.')
                : t('Order requests are closed until next season.', 'Los pedidos están cerrados hasta la próxima temporada.')
            }
          />
          <div className="know-grid">
            <Reveal className="know">
              <h3>{t('Contains alcohol', 'Contiene alcohol')}</h3>
              <p>
                {t(
                  'Our rumpopo is for adults of legal drinking age only. Please enjoy responsibly.',
                  'Nuestro rumpopo es solo para adultos mayores de edad. Disfrútalo con responsabilidad.',
                )}
              </p>
            </Reveal>
            <Reveal delay={80} className="know">
              <h3>{t('Allergies & ingredients', 'Alergias e ingredientes')}</h3>
              <p>
                {t(
                  'Rumpopo may contain eggs and dairy, and some flavours may contain nuts. Ask Cojac’s about any flavour before ordering.',
                  'El rumpopo puede contener huevo y lácteos, y algunos sabores pueden contener nueces o maní. Pregúntale a Cojac’s sobre cualquier sabor antes de pedir.',
                )}
              </p>
            </Reveal>
            <Reveal delay={160} className="know">
              <h3>{t('Confirmed on WhatsApp', 'Confirmado por WhatsApp')}</h3>
              <p>
                {t(
                  'Availability, final total, payment and delivery or pickup are confirmed with you directly by Cojac’s.',
                  'Cojac’s confirma directamente contigo la disponibilidad, el total final, el pago y la entrega o recogida.',
                )}
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
