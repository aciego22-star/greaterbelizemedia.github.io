import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { HeroVideoSlide as HeroVideoSlideData } from '../data/types';
import { PlaceholderMedia } from './PlaceholderMedia';
import { mediaUrl } from '../lib/media';

type VideoState = 'idle' | 'blocked' | 'playing' | 'paused' | 'ended';

interface HeroVideoSlideProps {
  slide: HeroVideoSlideData;
  active: boolean;
  reducedMotion: boolean;
  onPlayingChange: (playing: boolean) => void;
}

/**
 * MIME type for a resolved source. The Netlify build resolves to a hashed file
 * path and the single-file build to a data URI, so the type is read from
 * whichever form came back rather than assumed from the slide data.
 */
function videoType(url: string): string {
  const data = /^data:(video\/[a-z0-9.+-]+)/i.exec(url);
  if (data) return data[1].toLowerCase();
  const ext = /\.([a-z0-9]+)(?:[?#]|$)/i.exec(url);
  return ext && ext[1].toLowerCase() === 'webm' ? 'video/webm' : 'video/mp4';
}

function formatDuration(seconds: number): string {
  if (seconds % 60 === 0) return `${seconds / 60 === 1 ? '60' : seconds} Seconds`;
  return `${seconds} Seconds`;
}

/**
 * First-class hero video slide.
 *
 * A clip with sound attempts audible autoplay when the slide becomes active and
 * detects blocking from the play() promise; it never silently downgrades to
 * muted autoplay, so blocked or reduced-motion visits get the poster with a
 * "Play with Sound" action instead.
 *
 * A silent clip (hasAudio: false) has nothing to downgrade. It autoplays muted,
 * which every browser permits without a gesture, and the sound affordances are
 * withheld rather than offering sound the file does not carry.
 */
export function HeroVideoSlide({ slide, active, reducedMotion, onPlayingChange }: HeroVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>('idle');
  const [muted, setMuted] = useState(!slide.hasAudio);
  const attemptedRef = useRef(false);

  const desktopSrc = mediaUrl(slide.videoSrcDesktop);
  const mobileSrc = mediaUrl(slide.videoSrcMobile);
  const posterSrc = mediaUrl(slide.poster);
  const hasSource = Boolean(desktopSrc || mobileSrc);
  const overlayLabel = slide.hasAudio
    ? `Cosmic Pharmacy in ${formatDuration(slide.durationSeconds)} · Play with Sound`
    : `Cosmic Pharmacy in ${formatDuration(slide.durationSeconds)} · Play`;

  const startPlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    // A silent clip stays muted: muted autoplay is never blocked, so it starts
    // on its own. Only a clip that carries sound has an audible attempt to make.
    video.muted = !slide.hasAudio;
    setMuted(!slide.hasAudio);
    const attempt = video.play();
    if (attempt && typeof attempt.then === 'function') {
      attempt
        .then(() => {
          setState('playing');
          onPlayingChange(true);
        })
        .catch(() => {
          // Autoplay blocked: wait for the visitor's deliberate play.
          video.pause();
          setState('blocked');
          onPlayingChange(false);
        });
    } else {
      setState('playing');
      onPlayingChange(true);
    }
  }, [onPlayingChange, slide.hasAudio]);

  // Attempt playback once per activation of this slide.
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
    <div
      className={`hero-media hero-video ${slide.videoFit === 'contain' ? 'is-contained' : ''}`}
      // A portrait edit cannot fill a landscape frame. Rather than leave flat
      // bars, the poster fills the frame behind it, blurred and dimmed, the way
      // every video platform treats a vertical upload.
      style={posterSrc ? ({ '--hero-video-backdrop': `url(${posterSrc})` } as CSSProperties) : undefined}
    >
      <video
        ref={videoRef}
        playsInline
        muted={!slide.hasAudio}
        preload="metadata"
        poster={posterSrc || undefined}
        aria-label={slide.posterAlt}
        style={{ objectFit: slide.videoFit ?? 'cover' }}
        onEnded={() => {
          setState('ended');
          onPlayingChange(false);
        }}
      >
        {mobileSrc && <source src={mobileSrc} type={videoType(mobileSrc)} media="(max-width: 720px)" />}
        {desktopSrc && <source src={desktopSrc} type={videoType(desktopSrc)} />}
      </video>

      {/* A contained portrait reel leaves gutters at the sides, not the bottom,
          so the full caption would sit across the reel's own wording. The
          runtime alone fits the gutter; the headline beside it already names
          the pharmacy. */}
      <span className="hero-video-caption">
        {slide.videoFit === 'contain' ? `${slide.durationSeconds} sec` : slide.captionLabel}
      </span>

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
          {slide.hasAudio && (
            <button type="button" className="icon-btn on-video" onClick={toggleMute} aria-label={muted ? 'Unmute video' : 'Mute video'}>
              {muted ? '🔇' : '🔊'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
