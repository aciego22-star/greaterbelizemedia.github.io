import { useEffect, useRef, useState, type ElementType, type ReactNode, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import routes from '../content/routes.json';
import { site } from '../content/site';
import { MinusIcon, PlusIcon } from './Icons';
import { asset } from '../lib/whatsapp';
import type { Availability } from '../types';

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
  eyebrow,
  title,
  lead,
  center,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  id?: string;
}) {
  return (
    <Reveal className={`section-head ${center ? 'section-head--center' : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
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
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label={`Decrease ${label}`}>
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
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`Increase ${label}`}>
        <PlusIcon size={16} />
      </button>
    </div>
  );
}

const availabilityText: Record<Availability, string> = {
  available: 'Available this season',
  limited: 'Limited — few left',
  'sold-out': 'Sold out',
  ask: 'Ask about availability',
  'coming-soon': 'Coming soon',
};

export function AvailabilityChip({ value }: { value: Availability }) {
  const cls =
    value === 'available' || value === 'limited' ? 'chip--available' : value === 'sold-out' ? 'chip--soldout' : 'chip--ask';
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
      <img src={`${src320}.png`} width={320} height={289} alt={`${site.brandName} — ${site.logoTagline}`} decoding="async" />
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
  eyebrow,
  title,
  lead,
  children,
  tone = 'burgundy',
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  tone?: 'burgundy' | 'evergreen';
}) {
  return (
    <header className={`page-hero page-hero--${tone} grain on-dark`}>
      <div className="page-hero__glow" aria-hidden="true" />
      <div className="container page-hero__inner">
        <p className="eyebrow" style={{ animation: 'fadeUp .8s var(--ease) both' }}>
          {eyebrow}
        </p>
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
