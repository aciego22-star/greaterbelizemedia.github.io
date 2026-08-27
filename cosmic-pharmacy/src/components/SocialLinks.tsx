import { business } from '../data/business';

interface SocialLink {
  key: string;
  label: string;
  href: string;
  /** The platform's own brand colour. */
  tint: string;
  /** Overrides the flat tint when a platform's mark is a gradient. */
  fill?: string;
  icon: JSX.Element;
}

const socials: SocialLink[] = [
  {
    key: 'facebook',
    label: 'Cosmic Pharmacy on Facebook',
    href: business.facebookUrl,
    tint: '#1877f2',
    icon: (
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    )
  },
  {
    key: 'instagram',
    label: `Cosmic Pharmacy on Instagram, ${business.instagram}`,
    href: business.instagramUrl,
    tint: '#e1306c',
    icon: (
      <>
        <defs>
          <linearGradient id="cp-ig" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffdc80" />
            <stop offset="25%" stopColor="#f77737" />
            <stop offset="50%" stopColor="#e1306c" />
            <stop offset="75%" stopColor="#c13584" />
            <stop offset="100%" stopColor="#833ab4" />
          </linearGradient>
        </defs>
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2-.1-1.3-.1-1.7-.1-4.9s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1Zm0 1.8c-3.1 0-3.5 0-4.7.1-1.1.05-1.7.2-2.1.35-.5.2-.9.45-1.3.85-.4.4-.65.8-.85 1.3-.15.4-.3 1-.35 2.1-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c.05 1.1.2 1.7.35 2.1.2.5.45.9.85 1.3.4.4.8.65 1.3.85.4.15 1 .3 2.1.35 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1.1-.05 1.7-.2 2.1-.35.5-.2.9-.45 1.3-.85.4-.4.65-.8.85-1.3.15-.4.3-1 .35-2.1.1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c-.05-1.1-.2-1.7-.35-2.1-.2-.5-.45-.9-.85-1.3-.4-.4-.8-.65-1.3-.85-.4-.15-1-.3-2.1-.35-1.2-.1-1.6-.1-4.7-.1Z" />
        <path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Zm0 8.25a3.25 3.25 0 1 1 0-6.5 3.25 3.25 0 0 1 0 6.5Z" />
        <circle cx="17.2" cy="6.8" r="1.2" />
      </>
    ),
    fill: 'url(#cp-ig)'
  },
  {
    key: 'tiktok',
    label: `Cosmic Pharmacy on TikTok, ${business.tiktok}`,
    href: business.tiktokUrl,
    tint: '#010101',
    icon: (
      <>
        <path
          d="M16.6 5.8a4.8 4.8 0 0 1-1.2-3.1h-3v12.6a2.5 2.5 0 1 1-2-2.45V9.7a5.6 5.6 0 1 0 5 5.55V9.1a7.9 7.9 0 0 0 4.4 1.35v-3a4.8 4.8 0 0 1-3.2-1.65Z"
          fill="#25f4ee"
          transform="translate(-1.1 -0.9)"
        />
        <path
          d="M16.6 5.8a4.8 4.8 0 0 1-1.2-3.1h-3v12.6a2.5 2.5 0 1 1-2-2.45V9.7a5.6 5.6 0 1 0 5 5.55V9.1a7.9 7.9 0 0 0 4.4 1.35v-3a4.8 4.8 0 0 1-3.2-1.65Z"
          fill="#fe2c55"
          transform="translate(1.1 0.9)"
        />
        <path d="M16.6 5.8a4.8 4.8 0 0 1-1.2-3.1h-3v12.6a2.5 2.5 0 1 1-2-2.45V9.7a5.6 5.6 0 1 0 5 5.55V9.1a7.9 7.9 0 0 0 4.4 1.35v-3a4.8 4.8 0 0 1-3.2-1.65Z" />
      </>
    )
  },
  {
    key: 'google',
    label: 'Cosmic Pharmacy on Google, find us and read reviews',
    href: business.googleBusinessUrl,
    tint: '#4285f4',
    icon: (
      <>
        <path d="M21.6 12.2c0-.7-.06-1.35-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.3 3-7.3Z" fill="#4285f4" />
        <path d="M12 22c2.7 0 4.96-.9 6.6-2.4l-3.2-2.5c-.9.6-2.05.95-3.4.95-2.6 0-4.8-1.75-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34a853" />
        <path d="M6.4 13.95a6 6 0 0 1 0-3.85V7.5H3.1a10 10 0 0 0 0 9l3.3-2.55Z" fill="#fbbc05" />
        <path d="M12 5.9c1.47 0 2.8.5 3.83 1.5l2.87-2.87A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.65 9.4 5.9 12 5.9Z" fill="#ea4335" />
      </>
    )
  },
  {
    key: 'email',
    label: `Email Cosmic Pharmacy at ${business.email}`,
    href: `mailto:${business.email}`,
    tint: '#1f9d55',
    icon: (
      <>
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2.2-.5 6.8 5.1L18.8 6H5.2ZM19 7.7l-6.4 4.8a1 1 0 0 1-1.2 0L5 7.7v9.8c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V7.7Z" />
      </>
    )
  }
];

/**
 * Footer social row. Each icon carries its platform's own brand colour and
 * drifts on its own slow rhythm, so the row feels alive without demanding
 * attention; motion stops under prefers-reduced-motion.
 */
export function SocialLinks() {
  return (
    <ul className="social-row" aria-label="Cosmic Pharmacy on social media">
      {socials.map((s, i) => (
        <li key={s.key} style={{ '--i': i } as React.CSSProperties}>
          <a
            className={`social-link social-${s.key}`}
            href={s.href}
            target={s.href.startsWith('mailto:') ? undefined : '_blank'}
            rel={s.href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            aria-label={s.label}
            title={s.label}
            style={{ '--tint': s.tint } as React.CSSProperties}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false" fill={s.fill ?? 'currentColor'}>
              {s.icon}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
