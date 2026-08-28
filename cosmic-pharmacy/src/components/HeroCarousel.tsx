import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { heroSlides } from '../data/heroSlides';
import { HeroVideoSlide, type VideoState } from './HeroVideoSlide';
import { PlaceholderMedia } from './PlaceholderMedia';
import { mediaUrl } from '../lib/media';

/**
 * Full-bleed hero stage: ordered stills + one inlaid video slide, the media
 * filling the section edge to edge with the copy overlaid on it rather than
 * sitting in a column beside a framed card.
 *
 * Rotation pauses on hover, focus, interaction, and while the video plays;
 * reduced motion disables auto-rotation entirely.
 *
 * How long a slide holds is decided in dwellFor() rather than read straight off
 * durationMs, because the video slide has four different answers depending on
 * what the reel is actually doing. Every one of them is finite except a
 * deliberate pause, so the carousel can never come to rest on its own.
 */
export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const timerRef = useRef<number | null>(null);

  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  const count = heroSlides.length;
  const goTo = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  const current = heroSlides[index];
  const rotationHeld = hovered || focused || userPaused || reducedMotion;

  /** Milliseconds this slide holds for, or null to hold until something changes. */
  const dwell = ((): number | null => {
    if (current.kind !== 'video') return current.durationMs;
    switch (videoState) {
      // Let it run. onEnded is what moves things on.
      case 'playing':
        return null;
      // Deliberately paused by the visitor: their call, not ours.
      case 'paused':
        return null;
      // Played out in full, so hold on the last frame before moving on.
      case 'ended':
        return current.endDwellMs ?? current.durationMs;
      // Refused or errored. Show the poster for the fallback dwell rather than
      // stranding the carousel on a still frame forever.
      case 'blocked':
        return current.durationMs;
      // Still trying to start. Give it room, but not unlimited room: if nothing
      // has happened by then, something is wrong and the hero should move on.
      case 'idle':
      default:
        return 6000;
    }
  })();

  useEffect(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (rotationHeld || dwell === null) return;
    timerRef.current = window.setTimeout(() => goTo(index + 1), dwell);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [index, rotationHeld, dwell, goTo]);

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label="Cosmic Pharmacy highlights"
      // Pointer events, and only a real mouse. A touch tap fires compatibility
      // mouse events, so mouseenter used to set this on a phone and mouseleave
      // never arrived: one tap anywhere in the hero stopped the carousel for
      // the rest of the visit. Hovering to pause is a mouse idea; a finger
      // that is no longer touching the screen is not hovering anything.
      onPointerEnter={(e) => {
        if (e.pointerType === 'mouse') setHovered(true);
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === 'mouse') setHovered(false);
      }}
      onPointerCancel={() => setHovered(false)}
      // Only a keyboard focus holds rotation. Focus from a tap or a click was
      // holding it too, and since the control keeps focus afterwards, every
      // visitor who touched a dot or an arrow stopped the carousel for good:
      // it never moved again until they tapped somewhere else on the page.
      onFocusCapture={(e) => {
        const t = e.target as HTMLElement;
        if (typeof t.matches === 'function' && t.matches(':focus-visible')) setFocused(true);
      }}
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
                <div
                  className={`hero-media ${slide.imageFit === 'contain' ? 'is-contained' : ''}`}
                  // Contained media leaves slack in the frame. Filling it with a
                  // blurred copy of the artwork reads as part of the piece,
                  // where flat bars would read as a mistake.
                  style={
                    slide.imageFit === 'contain'
                      ? ({ '--hero-backdrop': `url(${mediaUrl(slide.image)})` } as CSSProperties)
                      : undefined
                  }
                >
                  {mediaUrl(slide.image) ? (
                    // Art direction, not resolution: the phone gets its own tall
                    // crop, because the wide one scaled down loses the subject.
                    <picture>
                      {mediaUrl(slide.imageMobile) && (
                        <source media="(max-width: 900px)" srcSet={mediaUrl(slide.imageMobile)} />
                      )}
                      <img
                        src={mediaUrl(slide.image)}
                        alt={slide.imageAlt}
                        // The tall crop's subject sits elsewhere in the frame, so
                        // its focus travels with it as a custom property.
                        style={
                          {
                            objectFit: slide.imageFit ?? 'cover',
                            objectPosition: slide.imageFocus ?? 'center',
                            '--hero-focus-mobile': slide.imageFocusMobile ?? slide.imageFocus ?? 'center'
                          } as CSSProperties
                        }
                      />
                    </picture>
                  ) : (
                    <PlaceholderMedia note={slide.placeholderNote} />
                  )}
                </div>
              ) : (
                <HeroVideoSlide slide={slide} active={active} reducedMotion={reducedMotion} onStateChange={setVideoState} />
              )}

              {/* The scrim only exists where copy sits on top of the media. A
                  slide shown whole gets none, so the artwork is not dimmed for
                  the sake of text that is not there. */}
              {slide.overlay !== 'none' && <div className="hero-scrim" aria-hidden="true" />}

              {slide.overlay !== 'none' && (
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
              )}
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
