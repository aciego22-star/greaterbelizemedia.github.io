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
 * Playback degrades in one direction, and never silently:
 *
 * 1. A clip with sound tries audible autoplay first. Every browser blocks that
 *    until the visitor has interacted with the page, so it succeeds on a return
 *    visit and fails on a first one.
 * 2. Blocked, it plays muted rather than freezing on its poster, and says so:
 *    a labelled Sound control appears, so the visitor is told the sound exists
 *    instead of being left to guess. A full-bleed hero that sits still on a
 *    poster until it is clicked is a worse trade than one that plays.
 * 3. Only if muted playback fails too does it fall back to the poster and a
 *    deliberate play action.
 *
 * A silent clip (hasAudio: false) skips step 1 and offers no sound control at
 * all, rather than offering sound the file does not carry.
 */
export function HeroVideoSlide({ slide, active, reducedMotion, onPlayingChange }: HeroVideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoState>('idle');
  const [muted, setMuted] = useState(!slide.hasAudio);
  /** Playing muted only because audible autoplay was refused, not by choice. */
  const [soundWithheld, setSoundWithheld] = useState(false);
  const attemptedRef = useRef(false);

  const desktopSrc = mediaUrl(slide.videoSrcDesktop);
  const mobileSrc = mediaUrl(slide.videoSrcMobile);
  const posterSrc = mediaUrl(slide.poster);
  const hasSource = Boolean(desktopSrc || mobileSrc);
  const overlayLabel = slide.hasAudio
    ? `Cosmic Pharmacy in ${formatDuration(slide.durationSeconds)} · Play with Sound`
    : `Cosmic Pharmacy in ${formatDuration(slide.durationSeconds)} · Play`;

  /** One playback attempt at a given sound setting. Resolves to whether it ran. */
  const attempt = useCallback(
    async (withSound: boolean): Promise<boolean> => {
      const video = videoRef.current;
      if (!video) return false;
      video.muted = !withSound;
      try {
        await video.play();
        setMuted(!withSound);
        setState('playing');
        onPlayingChange(true);
        return true;
      } catch {
        return false;
      }
    },
    [onPlayingChange]
  );

  const startPlayback = useCallback(
    async (preferSound = true) => {
      const wantSound = preferSound && slide.hasAudio;
      if (wantSound && (await attempt(true))) {
        setSoundWithheld(false);
        return;
      }
      // Muted playback is never blocked, so this is where an autoplay refusal
      // lands. The hero keeps moving and the sound becomes one tap away.
      if (await attempt(false)) {
        setSoundWithheld(wantSound);
        return;
      }
      videoRef.current?.pause();
      setState('blocked');
      onPlayingChange(false);
    },
    [attempt, onPlayingChange, slide.hasAudio]
  );

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
    void startPlayback();
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
    // A deliberate choice either way, so the "we withheld this" label goes.
    setSoundWithheld(false);
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
      // A portrait edit cannot fill a wide frame. Rather than leave flat bars,
      // the poster fills the frame behind it, blurred and dimmed, the way every
      // video platform treats a vertical upload. Whether it is letterboxed at
      // all is a breakpoint decision, so the fit itself lives in CSS.
      style={posterSrc ? ({ '--hero-backdrop': `url(${posterSrc})` } as CSSProperties) : undefined}
    >
      <video
        ref={videoRef}
        playsInline
        muted={!slide.hasAudio}
        preload="metadata"
        poster={posterSrc || undefined}
        aria-label={slide.posterAlt}
        onEnded={() => {
          setState('ended');
          onPlayingChange(false);
        }}
      >
        {mobileSrc && <source src={mobileSrc} type={videoType(mobileSrc)} media="(max-width: 720px)" />}
        {desktopSrc && <source src={desktopSrc} type={videoType(desktopSrc)} />}
      </video>

      <span className="hero-video-caption">{slide.captionLabel}</span>

      {showOverlay && (
        <button type="button" className="hero-video-overlay" onClick={() => void startPlayback(true)}>
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
            <button
              type="button"
              className={`icon-btn on-video ${soundWithheld ? 'is-labelled' : ''}`}
              onClick={toggleMute}
              aria-label={muted ? 'Play video with sound' : 'Mute video'}
            >
              {muted ? '🔇' : '🔊'}
              {soundWithheld && <span className="sound-label">Sound</span>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
