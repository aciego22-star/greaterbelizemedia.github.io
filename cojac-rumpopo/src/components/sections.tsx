import { useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { guarantee } from '../content/copy';
import { buildFlags, site } from '../content/site';
import type { FaqItem, GalleryItem, MediaItem } from '../types';
import { media } from '../content/media';
import { getCatalogue } from '../content/catalogue';
import { formatLongDate } from '../lib/season';
import { asset } from '../lib/whatsapp';
import { CreamIcon, DropsIcon, ExternalIcon, FacebookIcon, FullBottleIcon, PinIcon, PlayIcon, WhiskIcon, WhatsAppIcon, YouTubeIcon, ChevronIcon } from './Icons';
import { Logo, Reveal } from './ui';
import { Sparkle, Sprig } from './Art';

const pillarIcons = [CreamIcon, WhiskIcon, FullBottleIcon, DropsIcon];

export function GuaranteePillars({ large = false }: { large?: boolean }) {
  return (
    <ol className={`pillars ${large ? 'pillars--large' : ''}`}>
      {guarantee.pillars.map((p, i) => {
        const Icon = pillarIcons[i];
        return (
          <Reveal as="li" key={p.id} delay={i * 90} className="pillar">
            <span className="pillar__num" aria-hidden="true" data-num={`0${i + 1}`} />
            <Icon className="pillar__icon" />
            <h3>{p.title}</h3>
            <p>{p.text}</p>
          </Reveal>
        );
      })}
    </ol>
  );
}

export function HowItWorks() {
  const steps = [
    { t: 'Choose your flavours', d: 'Browse the season’s rumpopo and pick your favourites.' },
    { t: 'Build your order request', d: 'Select quantities, add any notes and review everything in one place.' },
    { t: 'Send it on WhatsApp', d: 'WhatsApp opens with your request ready. Press Send — that’s it.' },
    { t: 'Cojac’s confirms', d: 'We confirm availability, final total, payment and delivery or pickup with you directly.' },
  ];
  return (
    <ol className="steps">
      {steps.map((s, i) => (
        <Reveal as="li" key={s.t} delay={i * 90} className="step">
          <span className="step__num">{i + 1}</span>
          <h3>{s.t}</h3>
          <p>{s.d}</p>
        </Reveal>
      ))}
    </ol>
  );
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const uid = useId();
  return (
    <div className="accordion">
      {items.map((f) => {
        const isOpen = open === f.id;
        return (
          <div key={f.id} className={`accordion__item ${isOpen ? 'is-open' : ''}`}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${uid}-${f.id}`}
                id={`${uid}-${f.id}-btn`}
                onClick={() => setOpen(isOpen ? null : f.id)}
              >
                <span>{f.question}</span>
                <ChevronIcon size={20} />
              </button>
            </h3>
            <div id={`${uid}-${f.id}`} role="region" aria-labelledby={`${uid}-${f.id}-btn`} className="accordion__panel" hidden={!isOpen}>
              <p>{f.answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VideoCard({ item }: { item: MediaItem }) {
  const [playing, setPlaying] = useState(false);
  if (item.platform === 'youtube' && item.youtubeId) {
    return (
      <article className="video-card">
        <div className="video-card__frame">
          {buildFlags.noEmbeds ? (
            <a className="video-card__poster" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch on YouTube: ${item.title}`}>
              {item.thumbnail && <img src={asset(item.thumbnail)} alt="" loading="lazy" decoding="async" />}
              <span className="video-card__play">
                <PlayIcon size={26} />
              </span>
            </a>
          ) : playing ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            />
          ) : (
            <button type="button" className="video-card__poster" onClick={() => setPlaying(true)} aria-label={`Play video: ${item.title}`}>
              {item.thumbnail && <img src={asset(item.thumbnail)} alt="" loading="lazy" decoding="async" />}
              <span className="video-card__play">
                <PlayIcon size={26} />
              </span>
            </button>
          )}
        </div>
        <div className="video-card__body">
          <p className="video-card__source">
            <YouTubeIcon size={18} /> YouTube{item.publisher ? ` · ${item.publisher}` : ''}
          </p>
          <h3>{item.title}</h3>
          <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer">
            Watch on YouTube <ExternalIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
          </a>
        </div>
      </article>
    );
  }
  return (
    <article className="video-card video-card--external">
      <a className="video-card__frame video-card__fb" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`${item.title} — opens Facebook in a new tab`}>
        <Sprig className="video-card__sprig" />
        <span className="video-card__fb-icon">
          <FacebookIcon size={30} />
        </span>
        <span className="video-card__fb-kind">{item.kind === 'reel' ? 'Facebook Reel' : 'Facebook Video'}</span>
        <span className="video-card__play video-card__play--sm">
          <PlayIcon size={20} />
        </span>
      </a>
      <div className="video-card__body">
        <p className="video-card__source">
          <FacebookIcon size={18} /> Facebook
        </p>
        <h3>{item.title}</h3>
        <a className="text-link" href={item.url} target="_blank" rel="noopener noreferrer">
          Watch on Facebook <ExternalIcon size={14} style={{ display: 'inline', verticalAlign: '-2px' }} />
        </a>
      </div>
    </article>
  );
}

const tileTones = [
  ['#6b1525', '#3a0a13'],
  ['#1f4231', '#0f2219'],
  ['#8a5537', '#4d2e1e'],
  ['#a27a3c', '#5a3624'],
];

export function GalleryTile({ item, index, onOpen }: { item: GalleryItem; index: number; onOpen?: () => void }) {
  const [a, b] = tileTones[index % tileTones.length];
  const content = item.src ? (
    <img src={asset(item.src)} alt={item.alt} loading="lazy" decoding="async" style={item.position ? { objectPosition: item.position } : undefined} />
  ) : (
    <span className="gallery-tile__placeholder" style={{ background: `radial-gradient(80% 60% at 30% 20%, rgba(236,214,166,.25), transparent 60%), linear-gradient(150deg, ${a}, ${b})` }}>
      <Sparkle size={18} className="gallery-tile__spark" />
      <span className="gallery-tile__ph-label">Photo coming soon</span>
    </span>
  );
  return (
    <figure className={`gallery-tile gallery-tile--${item.shape}`}>
      {onOpen ? (
        <button type="button" onClick={onOpen} aria-label={`Open ${item.caption}${item.src ? '' : ' (photo coming soon)'}`}>
          {content}
        </button>
      ) : (
        content
      )}
      <figcaption>{item.caption}</figcaption>
    </figure>
  );
}

export function FinalCta() {
  return (
    <section className="section final-cta grain on-dark" aria-labelledby="final-cta-title">
      <div className="final-cta__glow" aria-hidden="true" />
      <div className="container final-cta__inner">
        <Reveal>
          <Logo size="feature" className="final-cta__logo" />
          <p className="final-cta__lead">
            After all, Christmas only comes once a year, and when it does, we believe it should be a little more:
          </p>
          <h2 id="final-cta-title" className="final-cta__word">
            Sumptuous.
          </h2>
        </Reveal>
        <Reveal delay={120} className="btn-row" style={{ justifyContent: 'center' }}>
          <Link to={routes.flavours.path} className="btn btn--gold">
            Find Your Flavour
          </Link>
          <Link to={routes.order.path} className="btn btn--whatsapp">
            <WhatsAppIcon /> Order on WhatsApp
          </Link>
        </Reveal>
        <p className="final-cta__fine">{site.alcohol.responsibleMessage}</p>
      </div>
    </section>
  );
}

/** Verified trust points only (family description, supplied address, published media). */
export function TrustStrip() {
  const publisher = media.find((m) => m.publisher)?.publisher;
  const items = [
    'Belizean family recipe',
    `${site.experienceStatement[0].toUpperCase()}${site.experienceStatement.slice(1)} of rumpopo`,
    site.contact.addressLine && `Based on ${site.contact.addressLine}`,
    publisher && `Featured by ${publisher.replace(/\s*\|.*$/, '')}`,
  ].filter(Boolean) as string[];
  return (
    <section className="trust-strip" aria-label="About Cojac’s">
      <ul className="container">
        {items.map((t) => (
          <li key={t}>
            <Sparkle size={11} />
            {t}
          </li>
        ))}
      </ul>
    </section>
  );
}

/** "At a glance" facts — short, consistent, machine-friendly answers built from site.ts. */
export function AtAGlance() {
  const facts: [string, ReactNode][] = [
    ['What', 'Rumpopo (rum popo) — a rich, creamy Belizean Christmas drink that contains alcohol'],
    ['Who', `${site.brandName}, a Belizean family business`],
    ['Where', `${site.contact.addressLine}, Belize`],
    ['Experience', `Sharing rumpopo for ${site.experienceStatement}`],
    ['Flavours', getCatalogue().map((p) => p.name).join(', ') + ', plus seasonal creations and new releases'],
    ['Season', `Order requests open until ${formatLongDate(site.season.seasonClosesOn)}`],
    [
      'How to order',
      <>
        Choose flavours on <Link to={routes.flavours.path}>Find Your Flavour</Link>, then send your order request on WhatsApp — Cojac’s confirms availability, price and delivery directly.
      </>,
    ],
    ['Payment', 'Arranged directly with Cojac’s — no online payment on this website'],
  ];
  return (
    <section className="glance" aria-labelledby="glance-title">
      <h2 id="glance-title" className="display-m">
        {site.brandShort} at a glance
      </h2>
      <dl>
        {facts.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/**
 * Google Map of the business location. The map only loads when the visitor asks
 * for it (faster page, no Google tracking until then); "Open in Google Maps"
 * always works, including for directions on a phone.
 */
export function LocationMap() {
  const [show, setShow] = useState(false);
  const { contact } = site;
  return (
    <section className="map-card card" id="map" aria-labelledby="map-title">
      <div className="map-card__info">
        <p className="eyebrow">Find us</p>
        <h2 id="map-title" className="display-m">
          {contact.addressLine}
        </h2>
        <p>{site.brandName} is based on {contact.addressLine}, Belize. Delivery, pickup and shipping are arranged on WhatsApp.</p>
        <div className="btn-row">
          <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="btn">
            <PinIcon size={18} /> Open in Google Maps
          </a>
        </div>
      </div>
      <div className="map-card__frame">
        {show && !buildFlags.noEmbeds && contact.mapEmbedUrl ? (
          <iframe
            src={contact.mapEmbedUrl}
            title={`Map of ${contact.addressLine}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="map-card__placeholder">
            <MapArt />
            {buildFlags.noEmbeds || !contact.mapEmbedUrl ? (
              <a href={contact.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn--gold">
                <PinIcon size={18} /> View on Google Maps
              </a>
            ) : (
              <button type="button" className="btn btn--gold" onClick={() => setShow(true)}>
                <PinIcon size={18} /> Show map
              </button>
            )}
            <small>Map by Google</small>
          </div>
        )}
      </div>
    </section>
  );
}

/** Stylised street-map illustration used before the live map loads. */
function MapArt() {
  return (
    <svg className="map-card__art" viewBox="0 0 400 260" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="260" fill="#efe4cf" />
      <path d="M0 210 C80 190 120 230 210 200 S340 150 400 170 V260 H0Z" fill="#cfe0d6" />
      <g stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round">
        <path d="M-10 80 L410 120" />
        <path d="M120 -10 L160 270" />
        <path d="M280 -10 L250 270" />
        <path d="M-10 170 L410 150" />
      </g>
      <g stroke="#e3d3b4" strokeWidth="4" fill="none">
        <path d="M40 -10 L60 270" />
        <path d="M-10 30 L410 50" />
        <path d="M340 -10 L360 270" />
      </g>
      <g transform="translate(205 100)">
        <ellipse cx="0" cy="34" rx="14" ry="5" fill="#000" opacity=".15" />
        <path d="M0 34 C-6 22 -18 12 -18 0 A18 18 0 0 1 18 0 C18 12 6 22 0 34Z" fill="#9b2335" />
        <circle r="6.5" fill="#fff" />
      </g>
    </svg>
  );
}
