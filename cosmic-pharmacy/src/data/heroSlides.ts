import type { HeroSlide } from './types';

/**
 * Hero media sequence: three stills + one inlaid video slide, all four supplied
 * by the client as matched wide and tall crops.
 *
 * The hero is a full-bleed stage rather than a card beside a column of text, so
 * every slide is art-directed twice: a 20:9 wide crop and a 9:16 tall crop. The
 * wide crop scaled down does not survive a phone screen, which is the whole
 * reason the client re-cut them.
 *
 * Media are stored as keys, never paths, and resolved through lib/media.ts.
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
    durationMs: 6000,
    image: 'hero-storefront-desktop',
    imageMobile: 'hero-storefront-mobile',
    imageFit: 'cover',
    // The sign and the licence plate sit high in both crops, and the copy sits
    // over the lower third, so both frames are held above centre.
    imageFocus: 'center 38%',
    imageFocusMobile: 'center 32%',
    imageAlt:
      'The Cosmic Pharmacy storefront, with the illuminated sign and the licence plate reading Marion Carter, RPh, Chemist and Druggist',
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
    durationMs: 6000,
    image: 'hero-interior-desktop',
    imageMobile: 'hero-interior-mobile',
    imageFit: 'cover',
    // Weighted to the shelving rather than the ceiling or the floor tiles.
    imageFocus: 'center 45%',
    imageFocusMobile: 'center 40%',
    imageAlt: 'Inside Cosmic Pharmacy: stocked shelves of supplements, medicine, baby care and everyday health products',
    placeholderNote: 'Final asset: medicine, health, supplements and everyday-care range photograph'
  },
  {
    kind: 'image',
    id: 'whatsapp-service',
    // A designed slide that already carries its own headline, its own three
    // numbered steps and its own fine print, in both crops. Overlaying the
    // site's copy would collide with the artwork and repeat what it says, so
    // this slide is shown whole and speaks for itself.
    overlay: 'none',
    eyebrow: 'Countrywide service',
    headline: 'Search. Add to cart. Send on WhatsApp.',
    durationMs: 6000,
    image: 'hero-how-it-works-desktop',
    imageMobile: 'hero-how-it-works-mobile',
    // The one asset that must never be cropped: it is a designed graphic whose
    // three numbered steps run to the edges of the frame, and the stage is not
    // cut to either crop's exact ratio. Contained and anchored to the top, so
    // the slack collects at the foot of the stage as the control rail.
    imageFit: 'contain',
    imageFocus: 'center top',
    imageFocusMobile: 'center top',
    imageAlt:
      'How it works: search the catalogue, build your cart, then send it on WhatsApp. Availability and pricing confirmed by the pharmacy.',
    placeholderNote: 'Final asset: search, basket, WhatsApp ordering and countrywide-service visual'
  },
  {
    kind: 'video',
    id: 'cosmic-video',
    // The reel carries Cosmic's own wording on every card. Same reasoning as
    // the slide above: it is shown whole, with no copy over it.
    overlay: 'none',
    eyebrow: 'Cosmic in motion',
    headline: 'Meet Cosmic Pharmacy.',
    // Only the fallback: what the slide holds for if the reel cannot play at
    // all. When it plays, the carousel waits for it to finish and then holds
    // for endDwellMs.
    durationMs: 8000,
    endDwellMs: 20000,
    // Client-supplied promotional reel. One 720x1280 encode serves both
    // breakpoints: it is already phone-sized, so a separate mobile file would
    // only add weight. Remuxed with the moov atom first so it starts streaming
    // rather than waiting for the whole file.
    videoSrcDesktop: 'cosmic-hero',
    poster: 'hero-video-poster',
    posterAlt: 'Cosmic Pharmacy logo over a nebula, with the line Medicine. Health. Beauty.',
    durationSeconds: 38, // Measured from the supplied file: 37.53s.
    // Scored with the client's own supplied track, 1:00 to 1:38 of it, cut to
    // the picture's exact 37.53s with a fade at each end. See ASSET-HANDOFF.md:
    // the licence for it is still the client's to settle before publication.
    hasAudio: true,
    // A 9:16 reel on a 9:16 phone screen covers it with almost nothing lost, so
    // the phone gets it edge to edge. From the tablet breakpoint up the frame
    // turns wide and it is contained instead, because its cards are almost
    // entirely wording and cropping would cut the headings off.
    videoFit: 'contain',
    captionLabel: 'Cosmic Pharmacy in 38 Seconds',
    placeholderNote: 'Final asset: client-owned Cosmic Pharmacy video (desktop + mobile encodes and poster)'
  }
];
