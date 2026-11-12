import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { heroIntervalMs, heroSlides } from '../content/hero';
import { asset } from '../lib/whatsapp';
import { t } from '../i18n/lang';

function Slide({ i, active, show }: { i: number; active: boolean; show: boolean }) {
  const s = heroSlides[i];
  return (
    <div
      className={`hero-slides__slide ${active ? 'is-active' : ''} ${s.fit === 'contain' ? 'hero-slides__slide--contain' : ''}`}
      style={
        s.backdrop
          ? ({ '--slide-bg-desktop': s.backdrop.desktop, '--slide-bg-mobile': s.backdrop.mobile } as CSSProperties)
          : undefined
      }
      role="group"
      aria-roledescription={t('slide', 'diapositiva')}
      aria-label={`${i + 1} ${t('of', 'de')} ${heroSlides.length}`}
      aria-hidden={!active}
    >
      {show && (
        <picture>
          <source
            media="(max-width: 767px)"
            type="image/webp"
            srcSet={`${asset(`${s.mobile}-540.webp`)} 540w, ${asset(`${s.mobile}-720.webp`)} 720w, ${asset(`${s.mobile}.webp`)} 941w`}
            sizes="100vw"
          />
          <source media="(max-width: 767px)" srcSet={asset(`${s.mobile}.jpg`)} />
          <source
            type="image/webp"
            srcSet={`${asset(`${s.desktop}-960.webp`)} 960w, ${asset(`${s.desktop}-1280.webp`)} 1280w, ${asset(`${s.desktop}.webp`)} 1672w`}
            sizes="100vw"
          />
          <img
            src={asset(`${s.desktop}.jpg`)}
            width={1672}
            height={941}
            alt={s.alt}
            decoding="async"
            loading={i === 0 ? 'eager' : 'lazy'}
            {...(i === 0 ? { fetchpriority: 'high' } : {})}
          />
        </picture>
      )}
    </div>
  );
}

/**
 * Full-bleed homepage slideshow. Rotates every 6 seconds and loops. It pauses
 * on hover or keyboard focus and when the tab is hidden, and has a pause button.
 * It starts paused for visitors who ask for reduced motion.
 */
export function HeroSlideshow() {
  const n = heroSlides.length;
  const [current, setCurrent] = useState(0);
  // Only the first slide is in the pre-rendered HTML; the rest load just before they appear.
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(false);
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPaused(true);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    // Fetch the next photo a little before it is due, not straight away, so the
    // first photo (the one people see) gets the connection to itself.
    const timer = window.setTimeout(
      () =>
        setLoaded((prev) => {
          const next = new Set(prev);
          next.add(current);
          next.add((current + 1) % n);
          return next.size === prev.size ? prev : next;
        }),
      Math.max(0, heroIntervalMs - 2500),
    );
    return () => window.clearTimeout(timer);
  }, [current, n]);

  const go = useCallback((i: number) => setCurrent(((i % n) + n) % n), [n]);

  useEffect(() => {
    if (paused || hovering || hidden || n < 2) return;
    const timer = window.setTimeout(() => go(current + 1), heroIntervalMs);
    return () => window.clearTimeout(timer);
  }, [current, paused, hovering, hidden, go, n]);

  if (!n) return null;
  return (
    <section
      ref={root}
      className="hero-slides"
      aria-roledescription={t('carousel', 'carrusel')}
      aria-label={t('Cojac’s holiday photos', 'Fotos navideñas de Cojac’s')}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!root.current?.contains(e.relatedTarget as Node)) setHovering(false);
      }}
    >
      <div className="hero-slides__track" aria-live={paused ? 'polite' : 'off'}>
        {heroSlides.map((s, i) => (
          <Slide key={s.id} i={i} active={i === current} show={loaded.has(i) || i === current} />
        ))}
      </div>
      {n > 1 && (
        <div className="hero-slides__controls">
          <button
            type="button"
            className="hero-slides__pause"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? t('Play slideshow', 'Reproducir presentación') : t('Pause slideshow', 'Pausar presentación')}
          >
            {paused ? (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M7 4.5v15l13-7.5-13-7.5Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
              </svg>
            )}
          </button>
          <div className="hero-slides__dots">
            {heroSlides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                className={`hero-slides__dot ${i === current ? 'is-active' : ''}`}
                aria-label={t(`Show photo ${i + 1} of ${n}`, `Mostrar foto ${i + 1} de ${n}`)}
                aria-current={i === current}
                onClick={() => go(i)}
              >
                <span />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
