/**
 * Centralized page-header (hero) configuration.
 * ---------------------------------------------------------------------------
 * Each entry drives <PageHero>. Leaving `src` undefined makes the header fall
 * back to the animated ocean canvas over a static Duke Marine navy gradient,
 * so a header never renders blank or broken while artwork is outstanding.
 *
 * To publish an approved photograph, drop the file into `public/media/` and
 * fill in `src` (plus `mobileSrc`, `alt`, `position`, `width`, `height`).
 * No other file needs to change.
 */
export interface PageHeroImage {
  /** Wide desktop/tablet source, served from /public/media. */
  src?: string;
  /** Optional portrait-friendly crop served at 640px and below. */
  mobileSrc?: string;
  /** Descriptive alt text. Leave empty only when the image is decorative. */
  alt?: string;
  /** Focal point, e.g. "center 40%", so the subject survives tight crops. */
  position?: string;
  /** Intrinsic pixel size of `src`; supplied to reduce layout shift. */
  width?: number;
  height?: number;
  /**
   * Aspect ratio of `src`. Supplying it makes the header take the shape of the
   * picture, so the whole frame shows instead of a crop of it.
   */
  aspect?: number;
  /** Same, for `mobileSrc`. */
  aspectMobile?: number;
}

export const pageHeroes = {
  /**
   * GALLERY HEADER — INTERIM APPROVED SITE ASSET.
   *
   * gallery-2.jpg is already published in the Duke Marine gallery, is
   * landscape (1284x766) and carries no embedded promotional wording, so it
   * suits a wide header. It replaced life/sandbar-sail.jpg, which is portrait
   * (1200x1600) and cropped poorly here.
   *
   * AWAITING A POSSIBLE FINAL CLIENT-SUPPLIED REPLACEMENT: swap `src` (and add
   * `mobileSrc`) once Duke Marine approves a dedicated gallery photograph.
   */
  gallery: {
    src: '/media/gallery-2.jpg',
    alt: 'Marine pumps and boat parts on the shelves at Duke Marine in Belize City',
    position: 'center 42%',
    width: 1284,
    height: 766,
  },

  /**
   * CONTACT HEADER — PENDING APPROVED DUKE MARINE HEADER IMAGE.
   *
   * Until a photograph is supplied this header uses the animated ocean canvas
   * over the static navy gradient fallback. No placeholder or stock imagery is
   * used. Populate the fields below when the approved asset arrives.
   */
  contact: {
    // src: '/media/…',        // PENDING APPROVED DUKE MARINE HEADER IMAGE
    // mobileSrc: '/media/…',
    // alt: '…',
    position: 'center 45%',
  },

  /**
   * CAREERS HEADER — PENDING APPROVED DUKE MARINE HEADER IMAGE.
   *
   * hero-careers-desktop.jpg is deliberately NOT used here: it carries
   * baked-in wording that would duplicate the live page headings.
   */
  careers: {
    // src: '/media/…',        // PENDING APPROVED DUKE MARINE HEADER IMAGE
    // mobileSrc: '/media/…',
    // alt: '…',
    position: 'center 45%',
  },
} satisfies Record<string, PageHeroImage>;
