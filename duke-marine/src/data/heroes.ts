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
   * GALLERY HEADER — CLIENT-SUPPLIED, COMPOSED FOR THE SHAPES IT SERVES.
   *
   * Two files: a wide one for desktop and a portrait one for phones. Because
   * `aspect` is given, the header takes the shape of whichever file it is
   * showing, so the whole frame appears instead of a crop of it.
   *
   * This replaced gallery-2.jpg, which stays in use inside the gallery grid.
   */
  gallery: {
    src: '/media/gallery-header.jpg',
    mobileSrc: '/media/gallery-header-mobile.jpg',
    alt: 'An angler rigging a skirted trolling lure on the boat off Belize',
    // Only has an effect where the header has to crop, which is at tablet
    // widths where this page's longer heading needs more height than the wide
    // file's shape gives. Biased right so the angler stays in frame there.
    position: '92% center',
    width: 1870,
    height: 841,
    aspect: 1870 / 841,
    aspectMobile: 941 / 1672,
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
