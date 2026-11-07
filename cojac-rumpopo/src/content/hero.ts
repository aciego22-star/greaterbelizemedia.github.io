/**
 * HOMEPAGE HERO SLIDESHOW
 * Supplied by the family (Nov 2026). Rotates every `intervalMs`, in this order, and loops.
 * Each slide has a desktop (16:9) and a mobile (9:16) image in /public/hero, as both
 * a high-quality WebP (served first) and the original PNG (fallback).
 * To add, remove or reorder slides, edit this list — nothing else needs to change.
 */
export interface HeroSlide {
  id: string;
  /** Path without extension, e.g. '/hero/Cojacs_Hero_01_Cocktail_Desktop_16x9' */
  desktop: string;
  mobile: string;
  alt: string;
}

export const heroIntervalMs = 6000;

export const heroSlides: HeroSlide[] = [
  {
    id: 'cocktail',
    desktop: '/hero/Cojacs_Hero_01_Cocktail_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_01_Cocktail_Mobile_9x16',
    alt: 'A bottle of Cojac’s rumpopo beside a glass of rumpopo in front of a lit Christmas tree',
  },
  {
    id: 'gift-bags',
    desktop: '/hero/Cojacs_Hero_02_Gift_Bags_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_02_Gift_Bags_Mobile_9x16',
    alt: 'Rows of Cojac’s rumpopo bottles wrapped in red Christmas gift bags',
  },
  {
    id: 'glass-bottles',
    desktop: '/hero/Cojacs_Hero_03_Glass_Bottles_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_03_Glass_Bottles_Mobile_9x16',
    alt: 'Three Cojac’s rumpopo bottles in blue and red among Christmas decorations',
  },
  {
    id: 'holiday-collection',
    desktop: '/hero/Cojacs_Hero_04_Holiday_Collection_Desktop_16x9',
    mobile: '/hero/Cojacs_Hero_04_Holiday_Collection_Mobile_9x16',
    alt: 'A holiday collection of Cojac’s rumpopo bottles surrounded by Christmas ornaments',
  },
];
