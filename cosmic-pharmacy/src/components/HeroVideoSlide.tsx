import { useCallback, useEffect, useRef, useState } from 'react';
import type { HeroVideoSlide as HeroVideoSlideData } from '../data/types';
import { PlaceholderMedia } from './PlaceholderMedia';

type VideoState = 'idle' | 'blocked' | 'playing' | 'paused' | 'ended';

interface HeroVideoSlideProps {
  slide: HeroVideoSlideData;
  active: boolean;
  reducedMotion: boolean;
  onPlayingChange: (playing: boolean) => void;
}

function formatDuration(seconds: number): string {
  if (seconds % 60 === 0) return `${seconds / 60 === 1 ? '60' : seconds} Seconds`;
  return `${seconds} Seconds`;
}

/**
 * First-class hero video slide. Attempts audible autoplay when the slide
 * becomes active and detects blocking from the play() promise — it never
 * silently downgrades to muted autoplay. Blocked or reduced-motion visits get
 * the poster with a "Play with Sound" action instead.
 */
export function HeroVideoSlide({ slide, active, reducedMotion, onPlayingChange }: HeroVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>('idle');
  const [muted, setMuted] = useState(false);
  const attemptedRef = useRef(false);

  const hasSource = Boolean(slide.videoSrcDesktop || slide.videoSrcMobile);
  const overlayLabel = `Cosmic Pharmacy in ${formatDuration(slide.durationSeconds)} · Play with Sound`;

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setMuted(false);
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt
        .then(() => {
          setState('playing');
          onPlayingChange(true);
        })
        .catch(() => {
          // Audible autoplay blocked: wait for the visitor's deliberate play.
          video.pause();
          setState('blocked');
          onPlayingChange(false);
        });
    } else {
      setState('playing');
      onPlayingChange(true);
    }
  }, [onPlayingChange]);

  // Attempt audible autoplay once per activation of this slide.
  useEffect(() => {
    if (!active) {
      attemptedRef.current = false;
      const video = videoRef.current;
      if (video && !video.paused) video.pause();
      if (state === 'playing') {
        setState('paused');
        onPlayingChange(false);
      }
      return;
    }
    if (!hasSource || reducedMotion || attemptedRef.current) return;
    if (state === 'ended') return;
    attemptedRef.current = true;
    startPlayback();
  }, [active, hasSource, reducedMotion, startPlayback, state, onPlayingChange]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().then(
        () => {
          setState('playing');
          onPlayingChange(true);
        },
        () => setState('blocked')
      );
    } else {
      video.pause();
      setState('paused');
      onPlayingChange(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  if (!hasSource) {
    return (
      <div className="hero-media hero-video-pending">
        <PlaceholderMedia note={slide.placeholderNote} />
        <span className="hero-video-caption">{slide.captionLabel}</span>
      </div>
    );
  }

  const showOverlay = state === 'idle' || state === 'blocked' || (reducedMotion && state !== 'playing' && state !== 'paused');
  const started = state === 'playing' || state === 'paused' || state === 'ended';

  return (
    <div className="hero-media hero-video">
      <video
        ref={videoRef}
        playsInline
        preload="metadata"
        poster={slide.poster || undefined}
        onEnded={() => {
          setState('ended');
          onPlayingChange(false);
        }}
      >
        {slide.videoSrcMobile && <source src={slide.videoSrcMobile} media="(max-width: 720px)" />}
        {slide.videoSrcDesktop && <source src={slide.videoSrcDesktop} />}
      </video>

      <span className="hero-video-caption">{slide.captionLabel}</span>

      {showOverlay && (
        <button type="button" className="hero-video-overlay" onClick={startPlayback}>
          <span className="hero-play-ring" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="26" height="26">
              <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
            </svg>
          </span>
          <span>{overlayLabel}</span>
        </button>
      )}

      {started && (
        <div className="hero-video-controls">
          <button type="button" className="icon-btn on-video" onClick={togglePlay} aria-label={state === 'playing' ? 'Pause video' : 'Play video'}>
            {state === 'playing' ? '⏸' : '▶'}
          </button>
          <button type="button" className="icon-btn on-video" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'}>
            {muted ? '🔇' : '🔊'}
          </button>
        </div>
      )}
    </div>
  );
}
