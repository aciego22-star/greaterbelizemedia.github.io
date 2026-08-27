export type ProductType =
  | 'general-otc'
  | 'pharmacy-otc'
  | 'prescription'
  | 'supplement'
  | 'personal-care'
  | 'medical-device';

export type StockStatus = 'in-stock' | 'low-stock' | 'confirm-availability' | 'out-of-stock';

export type PriceStatus = 'verified' | 'confirm-price' | 'demo-only';

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  subcategory?: string;
  productType: ProductType;
  shortDescription: string;
  size?: string;
  dosageForm?: string;
  priceBzd?: number | null;
  compareAtPriceBzd?: number | null;
  priceStatus: PriceStatus;
  stockStatus: StockStatus;
  prescriptionRequired: boolean;
  pharmacistGuidanceRequired: boolean;
  keywords: string[];
  /** Stable image key resolved through lib/media.ts, not a path. */
  image: string;
  /** Every view of this product, primary first. Present only when there is more than one. */
  images?: string[];
  imageAlt: string;
  /** Package text lifted by OCR from the source photograph. Search aid only, never displayed. */
  ocrText?: string;
  /** The catalogue image this record was curated from, for traceability. */
  sourceImage?: string;
  /** Set when the pack was not legible enough to name with confidence. */
  nameStatus?: 'confirm-with-pharmacy';
  featured?: boolean;
  sale?: boolean;
  newArrival?: boolean;
  lastVerified?: string | null;
  sortOrder?: number;
}

export interface CategoryDef {
  slug: string;
  name: string;
  shortName?: string;
  description: string;
  icon: string;
  /** Which retail landing page(s) surface this category. */
  retailPage?: RetailPageSlug;
}

export type RetailPageSlug =
  | 'supplements'
  | 'health-products'
  | 'personal-care-beauty'
  | 'womens-wellness'
  | 'medical-devices'
  | 'prescriptions';

export interface HeroSlideBase {
  id: string;
  eyebrow?: string;
  headline: string;
  copy?: string;
  ctaLabel?: string;
  ctaTo?: string;
  secondaryCtaLabel?: string;
  secondaryCtaTo?: string;
  /** Duration this slide stays active during auto-rotation, ms. */
  durationMs: number;
}

/**
 * How much of the site's own copy sits over a hero slide.
 *
 * 'full' overlays the eyebrow, headline, lead and calls to action. 'none'
 * leaves the artwork to speak for itself, which is the only honest option for a
 * designed slide that already carries its own headline: overlaying ours would
 * both collide with it and say the same thing twice.
 */
export type HeroOverlay = 'full' | 'none';

export interface HeroImageSlide extends HeroSlideBase {
  kind: 'image';
  /** Wide crop, resolved through lib/media.ts; empty renders the labeled placeholder. */
  image: string;
  /** Tall crop for phones. Art direction, not just resolution: the wide crop
   *  scaled down loses the subject entirely on a 9:16 screen. */
  imageMobile?: string;
  imageAlt: string;
  /** How the image sits in the frame. Both crops are cut to the frame's own
   *  shape, so 'cover' is right for all of them; 'contain' remains for any
   *  future asset that cannot be cropped. */
  imageFit?: 'cover' | 'contain';
  /** object-position for cropped photographs, e.g. 'center 35%'. */
  imageFocus?: string;
  /** Same, for the tall crop, whose subject usually sits elsewhere. */
  imageFocusMobile?: string;
  overlay?: HeroOverlay;
  /** Short label describing what the final asset should show (placeholder state only). */
  placeholderNote: string;
}

export interface HeroVideoSlide extends HeroSlideBase {
  kind: 'video';
  /** Video key resolved through lib/media.ts, or a path; empty renders the placeholder. */
  videoSrcDesktop: string;
  videoSrcMobile?: string;
  poster: string;
  posterAlt: string;
  /** Verified runtime in seconds. Update when the final edit is supplied. */
  durationSeconds: number;
  /**
   * Whether the file actually carries an audio track. A silent clip autoplays
   * muted (which every browser permits) and drops the sound affordances, so the
   * interface never offers sound that does not exist.
   */
  hasAudio: boolean;
  /** How the video sits in the frame. A portrait or text-bearing edit has to be
   *  contained; cropping it would cut the wording off. On phones the frame is
   *  itself close to 9:16, so a portrait reel covers it with almost nothing
   *  lost, and 'contain' applies from the tablet breakpoint up. */
  videoFit?: 'cover' | 'contain';
  overlay?: HeroOverlay;
  captionLabel: string;
  placeholderNote: string;
}

export type HeroSlide = HeroImageSlide | HeroVideoSlide;

export type GalleryFilter =
  | 'inside-cosmic'
  | 'products-wellness'
  | 'community'
  | 'social-highlights'
  | 'videos';

export interface GalleryItem {
  id: string;
  kind: 'photo' | 'video';
  title: string;
  filters: GalleryFilter[];
  /** Path under public/assets/gallery/; empty string renders the labeled placeholder. */
  src: string;
  poster?: string;
  alt: string;
  /** Aspect hint for the editorial masonry layout. */
  aspect: 'portrait' | 'landscape' | 'square';
  sourceNote?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  author: string;
  reviewedBy?: string;
  date: string;
  category: string;
  heroImage: string;
  heroAlt: string;
  /** Simple paragraphs; headings prefixed with "## ". */
  body: string[];
  demo: boolean;
}

export interface BasketLine {
  productId: string;
  quantity: number;
}

export type FulfilmentOption =
  | 'pickup'
  | 'belize-city-delivery'
  | 'out-district-shipping'
  | 'island-shipping';
