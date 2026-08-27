import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../data/heroSlides';
import { HeroVideoSlide } from './HeroVideoSlide';
import { PlaceholderMedia } from './PlaceholderMedia';
import { mediaUrl } from '../lib/media';

/**
 * ICB-style hero media sequence: ordered stills + one inlaid video slide in a
 * single hero system. Rotation pauses on hover, focus, interaction, and while
 * the video plays; reduced motion disables auto-rotation entirely.
 */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const count = heroSlides.length;
  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  const rotationHeld = hovered || focused || userPaused || videoPlaying || reducedMotion;

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rotationHeld) return;
    timerRef.current = window.setTimeout(() => goTo(index + 1), heroSlides[index].durationMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, rotationHeld, goTo]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Cosmic Pharmacy highlights"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setFocused(false);
      }}
    >
      <div className="hero-track">
        {heroSlides.map((slide, i) => {
          const active = i === index;
          return (
            <div
              key={slide.id}
              className={`hero-slide ${active ? 'active' : ''}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} of ${count}`}
              aria-hidden={!active}
            >
              {slide.kind === 'image' ? (
                <div className="hero-media">
                  {mediaUrl(slide.image) ? (
                    <img
                      src={mediaUrl(slide.image)}
                      alt={slide.imageAlt}
                      style={{ objectFit: slide.imageFit ?? 'cover', objectPosition: slide.imageFocus ?? 'center' }}
                    />
                  ) : (
                    <PlaceholderMedia note={slide.placeholderNote} />
                  )}
                </div>
              ) : (
                <HeroVideoSlide slide={slide} active={active} reducedMotion={reducedMotion} onPlayingChange={setVideoPlaying} />
              )}

              <div className="hero-copy" hidden={!active}>
                {slide.eyebrow && <span className="eyebrow on-dark">{slide.eyebrow}</span>}
                <h1 className="hero-headline">{slide.headline}</h1>
                {slide.copy && <p className="hero-lead">{slide.copy}</p>}
                <div className="hero-ctas">
                  {slide.ctaLabel && slide.ctaTo && (
                    <Link className="btn btn-primary" to={slide.ctaTo}>
                      {slide.ctaLabel}
                    </Link>
                  )}
                  {slide.secondaryCtaLabel && slide.secondaryCtaTo && (
                    <Link className="btn btn-outline-dark" to={slide.secondaryCtaTo}>
                      {slide.secondaryCtaLabel}
                    </Link>
                  )}
                </div>
                {i === 0 && (
                  <p className="hero-supportline">Pharmacist-guided service · WhatsApp ordering · Out-district and Cayes shipping</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="hero-controls">
        <button type="button" className="icon-btn hero-arrow" aria-label="Previous slide" onClick={() => goTo(index - 1)}>
          ‹
        </button>
        <div className="hero-dots">
          {heroSlides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={`hero-dot ${i === index ? 'active' : ''}`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="icon-btn hero-arrow" aria-label="Next slide" onClick={() => goTo(index + 1)}>
          ›
        </button>
        <button
          type="button"
          className="icon-btn hero-pause"
          aria-label={userPaused ? 'Resume automatic rotation' : 'Pause automatic rotation'}
          aria-pressed={userPaused}
          onClick={() => setUserPaused((v) => !v)}
        >
          {userPaused ? '▶' : '⏸'}
        </button>
      </div>
    </section>
  );
}
