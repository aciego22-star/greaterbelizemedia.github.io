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
    image: 'hero-storefront',
    // Client photograph, close to square. Framed slightly high so the sign and
    // the licence plate stay in view when the 4:3 frame crops.
    imageFit: 'cover',
    imageFocus: 'center 42%',
    imageAlt:
      'The Cosmic Pharmacy storefront on Holy Emmanuel Street, with the illuminated sign and the licence plate reading Marion Carter, RPh, Chemist and Druggist',
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
    image: 'hero-shelves',
    // Portrait photograph of the shelves; framed on the upper wall so the
    // stocked supplement and medicine shelving reads at 4:3.
    imageFit: 'cover',
    imageFocus: 'center 30%',
    imageAlt: 'Stocked shelves inside Cosmic Pharmacy: supplements, medicine, baby care and everyday health products',
    placeholderNote: 'Final asset: medicine, health, supplements and everyday-care range photograph'
  },
  {
    kind: 'image',
    id: 'whatsapp-service',
    eyebrow: 'Countrywide service',
    headline: 'Search. Add to cart. Send on WhatsApp.',
    copy: 'Cosmic confirms availability, pricing and next steps, with pickup, Belize City delivery, and out-district and Cayes shipping.',
    ctaLabel: 'How It Works',
    ctaTo: '/services',
    durationMs: 8000,
    image: 'hero-how-it-works',
    // A designed graphic rather than a photograph: cropping it would cut the
    // headline off, so it is shown whole against the frame.
    imageFit: 'contain',
    imageAlt:
      'How it works: search the catalogue, build your cart, then send it on WhatsApp. Availability and pricing confirmed by the pharmacy.',
    placeholderNote: 'Final asset: search, basket, WhatsApp ordering and countrywide-service visual'
  },
  {
    kind: 'video',
    id: 'cosmic-video',
    eyebrow: 'Cosmic in motion',
    headline: 'Meet Cosmic Pharmacy.',
    copy: 'Ways to pay, ways to reach us, and how your order gets to you, whether you are in Belize City, out district or on the Cayes.',
    ctaLabel: 'How It Works',
    ctaTo: '/services',
    durationMs: 12000,
    // Client-supplied promotional reel. One 720x1280 encode serves both
    // breakpoints: it is already phone-sized, so a separate mobile file would
    // only add weight. Remuxed with the moov atom first so it starts streaming
    // rather than waiting for the whole file.
    videoSrcDesktop: 'cosmic-hero',
    poster: 'hero-video-poster',
    posterAlt: 'Cosmic Pharmacy logo over a nebula, with the line Medicine. Health. Beauty.',
    durationSeconds: 38, // Measured from the supplied file: 37.53s.
    // The supplied file carries no audio track, so nothing here offers sound.
    hasAudio: false,
    // A 720x1280 portrait reel whose cards are almost entirely wording.
    // Cropping it to the landscape frame would cut the headings off.
    videoFit: 'contain',
    captionLabel: 'Cosmic Pharmacy in 38 Seconds',
    placeholderNote: 'Final asset: client-owned Cosmic Pharmacy video (desktop + mobile encodes and poster)'
  }
];
