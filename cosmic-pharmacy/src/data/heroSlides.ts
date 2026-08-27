import type { HeroSlide } from './types';

/**
 * Hero media sequence (ICB pattern): three stills + one inlaid video slide.
 * Edit slide order, copy, timing and media paths here only.
 * Media paths point at public/assets/hero/ — empty string renders a clearly
 * labeled placeholder until the final Cosmic assets arrive (see ASSET-HANDOFF.md).
 */
export const heroSlides: HeroSlide[] = [
  {
    kind: 'image',
    id: 'brand-service',
    eyebrow: 'Cosmic Pharmacy · Belize City',
    headline: 'Everything you need. Guidance you can trust.',
    copy: 'Search medicine, wellness and personal-care products, build your request, and send it directly to Cosmic Pharmacy on WhatsApp.',
    ctaLabel: 'Search Products',
    ctaTo: '/shop',
    secondaryCtaLabel: 'Send a Prescription',
    secondaryCtaTo: '/prescriptions',
    durationMs: 9000,
    image: '',
    imageAlt: 'Cosmic Pharmacy storefront and pharmacist-led service',
    placeholderNote: 'Final asset: Cosmic Pharmacy storefront or pharmacist-led service photograph'
  },
  {
    kind: 'image',
    id: 'range',
    eyebrow: 'Medicine · Health · Beauty',
    headline: 'From daily essentials to hard-to-find products.',
    copy: 'OTC medicine, vitamins and supplements, personal care, and medical devices, with a pharmacist who helps you source what others don’t stock.',
    ctaLabel: 'Browse the Range',
    ctaTo: '/products/supplements',
    durationMs: 8000,
    image: '',
    imageAlt: 'Medicine, health, supplement and everyday-care range at Cosmic Pharmacy',
    placeholderNote: 'Final asset: medicine, health, supplements and everyday-care range photograph'
  },
  {
    kind: 'image',
    id: 'whatsapp-service',
    eyebrow: 'Countrywide service',
    headline: 'Search. Add to basket. Send on WhatsApp.',
    copy: 'Cosmic confirms availability, pricing and next steps, with pickup, Belize City delivery, and out-district and Cayes shipping.',
    ctaLabel: 'How It Works',
    ctaTo: '/services',
    durationMs: 8000,
    image: '',
    imageAlt: 'Search, basket and WhatsApp ordering from Cosmic Pharmacy',
    placeholderNote: 'Final asset: search, basket, WhatsApp ordering and countrywide-service visual'
  },
  {
    kind: 'video',
    id: 'cosmic-video',
    eyebrow: 'Cosmic in motion',
    headline: 'Meet Cosmic Pharmacy.',
    durationMs: 12000,
    videoSrcDesktop: '', // e.g. 'assets/hero/cosmic-90s-desktop.mp4' once supplied
    videoSrcMobile: '', // e.g. 'assets/hero/cosmic-90s-mobile.mp4' once supplied
    poster: '',
    posterAlt: 'Cosmic Pharmacy video poster',
    durationSeconds: 90, // VERIFY: replace with the final edit's real runtime
    captionLabel: 'Cosmic Pharmacy in 90 Seconds',
    placeholderNote: 'Final asset: client-owned Cosmic Pharmacy video (desktop + mobile encodes and poster)'
  }
];
