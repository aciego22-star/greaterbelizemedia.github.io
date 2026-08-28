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

  it('resolves every phone crop to a shipped asset', () => {
    for (const slide of images) {
      if (!slide.imageMobile) continue;
      expect(heroFiles.has(slide.imageMobile), `${slide.id} phone crop missing`).toBe(true);
    }
  });

  it('art-directs every still for the phone', () => {
    // The hero fills the phone screen, so a wide crop scaled down loses the
    // subject entirely. Every still needs its own tall crop, not a resize.
    for (const slide of images) {
      expect(slide.imageMobile, `${slide.id} has no phone crop`).toBeTruthy();
      expect(slide.imageMobile).not.toBe(slide.image);
    }
  });

  it('leaves no hero asset orphaned', () => {
    const used = new Set<string>();
    for (const slide of images) {
      used.add(slide.image);
      if (slide.imageMobile) used.add(slide.imageMobile);
    }
    for (const slide of videos) {
      used.add(slide.videoSrcDesktop);
      used.add(slide.poster);
      if (slide.videoSrcMobile) used.add(slide.videoSrcMobile);
    }
    for (const file of heroFiles) {
      expect(used.has(file), `${file} ships but no slide references it`).toBe(true);
    }
  });

  it('lays no copy over a slide that carries its own wording', () => {
    // The how-it-works graphic and the reel both carry their own headline in
    // the artwork. Overlaying the site's copy would collide with it and say the
    // same thing twice, so both are shown whole.
    const howItWorks = images.find((s) => s.image === 'hero-how-it-works-desktop');
    expect(howItWorks?.overlay).toBe('none');
    const reel = videos.find((s) => s.videoSrcDesktop === 'cosmic-hero');
    expect(reel?.overlay).toBe('none');
  });

  it('gives every slide that does carry copy a headline and a way to act', () => {
    for (const slide of heroSlides) {
      if (slide.overlay === 'none') continue;
      expect(slide.headline, `${slide.id} has no headline`).toBeTruthy();
      expect(slide.ctaLabel && slide.ctaTo, `${slide.id} has no call to action`).toBeTruthy();
    }
  });

  it('declares the reel as scored, so the sound control is offered', () => {
    const reel = videos.find((s) => s.videoSrcDesktop === 'cosmic-hero');
    // The reel is muxed with the client's supplied track; see ASSET-HANDOFF.md.
    // If a silent edit ever replaces it this has to go back to false, or the
    // interface offers sound the file does not carry.
    expect(reel?.hasAudio).toBe(true);
  });
});
