/**
 * Home page hero slideshow.
 * ---------------------------------------------------------------------------
 * Shared rather than declared inside HomeHero because the home page preloads
 * the first slide: the slideshow draws its posters as CSS background images,
 * which the browser's preload scanner cannot see, so without a preload the
 * first poster is only discovered after the stylesheets have loaded and the
 * page has been laid out. Keeping the list here means the preload always names
 * whichever poster is actually shown first, even if the order changes.
 *
 * Slides without `href` are decorative.
 */
export interface HeroSlide {
  /** Portrait poster, shown at 980px and below. */
  src: string;
  /** Landscape banner, shown from 981px up. */
  desktop: string;
  label: string;
  href?: string;
}

export const heroSlides: HeroSlide[] = [
  {
    src: '/media/hero-catch.jpg',
    desktop: '/media/hero-catch-desktop.jpg',
    label: 'Built for the catch, fishing, diving and boat supplies',
  },
  {
    src: '/media/hero-dive.jpg',
    desktop: '/media/hero-dive-desktop.jpg',
    label: 'Every great dive starts with the right gear',
  },
  {
    src: '/media/hero-careers.jpg',
    desktop: '/media/hero-careers-desktop.jpg',
    href: '/careers',
    label: 'Careers at Duke Marine. Explore current employment opportunities.',
  },
];

/** The breakpoint HomeHero swaps posters at, kept here so the preload matches. */
export const HERO_DESKTOP_MIN = 981;
