import { useEffect, useRef, useState, type ElementType, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes';
import { site } from '../content/site';
import { FacebookIcon, InstagramIcon, MailIcon, MinusIcon, PlusIcon, WhatsAppIcon } from './Icons';
import { generalEnquiryUrl } from '../lib/whatsapp';
import { asset } from '../lib/whatsapp';
import type { Availability } from '../types';
import { t } from '../i18n/lang';

/** Fades content in as it scrolls into view (respects reduced motion via CSS). */
export function Reveal({
  as: Tag = 'div',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}: { as?: ElementType; delay?: number; className?: string; style?: CSSProperties; children: ReactNode } & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'is-visible' : ''} ${className}`}
      style={{ ...style, '--delay': `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHead({
  title,
  lead,
  center,
  id,
}: {
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  id?: string;
}) {
  return (
    <Reveal className={`section-head ${center ? 'section-head--center' : ''}`}>
      <h2 className="display-l" id={id}>
        {title}
      </h2>
      {lead && <p className="lead" style={center ? { marginInline: 'auto' } : undefined}>{lead}</p>}
    </Reveal>
  );
}

export function QuantityStepper({
  value,
  onChange,
  max,
  label,
  size = 'md',
}: {
  value: number;
  onChange: (n: number) => void;
  max: number;
  label: string;
  size?: 'sm' | 'md';
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    onChange(Number.isFinite(n) ? Math.max(1, Math.min(max, n)) : value);
  };
  return (
    <div className={`stepper stepper--${size}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label={`${t('Decrease', 'Disminuir')} ${label}`}>
        <MinusIcon size={16} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={draft}
        aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value);
        }}
      />
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`${t('Increase', 'Aumentar')} ${label}`}>
        <PlusIcon size={16} />
      </button>
    </div>
  );
}

const availabilityText: Record<Availability, string> = {
  available: t('Available this season', 'Disponible esta temporada'),
  limited: t('Limited, few left', 'Pocas unidades'),
  'sold-out': t('Sold out', 'Agotado'),
  'on-menu': t('On this season’s menu', 'En el menú de esta temporada'),
  ask: t('Ask about availability', 'Pregunta por la disponibilidad'),
  'coming-soon': t('Coming soon', 'Muy pronto'),
};

export function AvailabilityChip({ value }: { value: Availability }) {
  const cls =
    value === 'available' || value === 'limited' || value === 'on-menu' ? 'chip--available' : value === 'sold-out' ? 'chip--soldout' : 'chip--ask';
  return (
    <span className={`chip ${cls}`}>
      <span className="chip-dot" />
      {availabilityText[value]}
    </span>
  );
}

/**
 * Official Cojac's logo (supplied by the family, Nov 2026).
 * Transparent cut-outs live in /public/brand. `size` sets the rendered height.
 */
export function Logo({ size = 'header', className = '' }: { size?: 'header' | 'menu' | 'footer' | 'feature'; className?: string }) {
  const src320 = asset('/brand/cojacs-logo-320');
  const src640 = asset('/brand/cojacs-logo-640');
  return (
    <picture className={`logo logo--${size} ${className}`}>
      <source type="image/webp" srcSet={`${asset('/brand/cojacs-logo-160')}.webp 160w, ${src320}.webp 320w, ${src640}.webp 640w`} sizes={size === 'feature' ? '260px' : size === 'footer' ? '170px' : '80px'} />
      <img
        src={`${src320}.png`}
        width={320}
        height={289}
        alt={`${site.brandName}: ${site.logoTagline}`}
        decoding="async"
        loading={size === 'header' ? 'eager' : 'lazy'}
      />
    </picture>
  );
}

type RouteKey = keyof typeof routes;
export function PageLink({ to, children, className }: { to: RouteKey; children?: ReactNode; className?: string }) {
  return (
    <Link to={routes[to].path} className={className}>
      {children ?? routes[to].nav}
    </Link>
  );
}

export function PageHero({
  title,
  lead,
  children,
  tone = 'burgundy',
}: {
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  tone?: 'burgundy' | 'evergreen';
}) {
  return (
    <header className={`page-hero page-hero--${tone} grain on-dark`}>
      <div className="page-hero__glow" aria-hidden="true" />
      <div className="container page-hero__inner">
        <h1 className="display-xl" style={{ animation: 'fadeUp .9s .08s var(--ease) both' }}>
          {title}
        </h1>
        {lead && (
          <p className="lead" style={{ animation: 'fadeUp .9s .16s var(--ease) both' }}>
            {lead}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}

/**
 * WhatsApp, Facebook, Instagram and email logos side by side. The WhatsApp number
 * and email address sit behind their logos rather than being printed on the page.
 */
export function SocialIcons({ size = 'md', light = false }: { size?: 'md' | 'lg'; light?: boolean }) {
  const wa = generalEnquiryUrl();
  const items = [
    wa && { href: wa, label: 'WhatsApp', cls: 'whatsapp', Icon: WhatsAppIcon },
    site.social.facebook && { href: site.social.facebook, label: 'Facebook', cls: 'facebook', Icon: FacebookIcon },
    site.social.instagram && { href: site.social.instagram, label: 'Instagram', cls: 'instagram', Icon: InstagramIcon },
    site.contact.email && { href: `mailto:${site.contact.email}`, label: 'Email', cls: 'email', Icon: MailIcon },
  ].filter(Boolean) as { href: string; label: string; cls: string; Icon: typeof WhatsAppIcon }[];
  if (!items.length) return null;
  return (
    <ul className={`social-icons social-icons--${size} ${light ? 'social-icons--light' : ''}`}>
      {items.map(({ href, label, cls, Icon }) => (
        <li key={label}>
          <a
            href={href}
            {...(label === 'Email' ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
            className={`social-icon social-icon--${cls}`}
            aria-label={
              label === 'WhatsApp'
                ? t(`Chat with ${site.brandShort} on WhatsApp`, `Escríbele a ${site.brandShort} por WhatsApp`)
                : label === 'Email'
                  ? t(`Email ${site.brandShort}`, `Envía un correo a ${site.brandShort}`)
                  : t(`${site.brandShort} on ${label}`, `${site.brandShort} en ${label}`)
            }
            title={label === 'Email' ? t('Email', 'Correo') : label}
          >
            <Icon size={size === 'lg' ? 26 : 20} />
          </a>
        </li>
      ))}
    </ul>
  );
}
