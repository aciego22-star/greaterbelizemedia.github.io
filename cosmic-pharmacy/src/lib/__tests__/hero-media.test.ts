import { describe, expect, it } from 'vitest';
import { heroSlides } from '../../data/heroSlides';
import type { HeroImageSlide, HeroVideoSlide } from '../../data/types';

// Enumerated exactly the way lib/media.ts does, so this asserts against what
// the build will actually resolve rather than against a directory listing.
const heroFiles = new Set<string>(
  Object.keys(import.meta.glob(['../../assets/hero/*.webp', '../../assets/hero/*.mp4'])).map((path) =>
    path.split('/').pop()!.replace(/\.[a-z0-9]+$/i, '')
  )
);

const images = heroSlides.filter((s): s is HeroImageSlide => s.kind === 'image');
const videos = heroSlides.filter((s): s is HeroVideoSlide => s.kind === 'video');

describe('hero media', () => {
  it('resolves every hero image key to a shipped asset', () => {
    for (const slide of images) {
      expect(heroFiles.has(slide.image), `${slide.id} points at a missing hero asset`).toBe(true);
    }
  });

  it('resolves the video slide sources and poster to shipped assets', () => {
    for (const slide of videos) {
      expect(heroFiles.has(slide.videoSrcDesktop), `${slide.id} desktop source missing`).toBe(true);
      expect(heroFiles.has(slide.poster), `${slide.id} poster missing`).toBe(true);
      if (slide.videoSrcMobile) {
        expect(heroFiles.has(slide.videoSrcMobile), `${slide.id} mobile source missing`).toBe(true);
      }
    }
  });

  it('keeps the caption runtime honest against the declared duration', () => {
    // The caption is the only runtime a visitor sees. It drifting away from the
    // real file length is exactly the sort of small lie that survives a redesign.
    for (const slide of videos) {
      expect(slide.captionLabel).toContain(String(slide.durationSeconds));
    }
  });

  it('leaves no hero asset orphaned', () => {
    const used = new Set<string>();
    for (const slide of images) used.add(slide.image);
    for (const slide of videos) {
      used.add(slide.videoSrcDesktop);
      used.add(slide.poster);
      if (slide.videoSrcMobile) used.add(slide.videoSrcMobile);
    }
    for (const file of heroFiles) {
      expect(used.has(file), `${file} ships but no slide references it`).toBe(true);
    }
  });

  it('contains rather than crops any media that carries wording', () => {
    // Both the how-it-works graphic and the portrait reel are mostly type.
    // Cropping either to the landscape frame cuts the headings off.
    const howItWorks = images.find((s) => s.image === 'hero-how-it-works');
    expect(howItWorks?.imageFit).toBe('contain');
    const reel = videos.find((s) => s.videoSrcDesktop === 'cosmic-hero');
    expect(reel?.videoFit).toBe('contain');
  });

  it('declares the supplied reel as silent so no sound control is offered', () => {
    const reel = videos.find((s) => s.videoSrcDesktop === 'cosmic-hero');
    // The file the client supplied carries a video track only; see
    // ASSET-HANDOFF.md. Flip this the moment a mixed file replaces it.
    expect(reel?.hasAudio).toBe(false);
  });
});
