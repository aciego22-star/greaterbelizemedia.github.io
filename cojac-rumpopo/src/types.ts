/**
 * Shared data types for Cojac's Sumptuous Rumpopo.
 * The family edits the files in src/content/ — these types keep those edits safe.
 */

/** How certain we are about a product or variant this season. */
export type Availability =
  | 'available' // confirmed by the family for this season
  | 'limited' // confirmed, but only a few left
  | 'sold-out' // confirmed, none left — cannot be added to an order
  | 'ask' // not yet confirmed this season — customer may ask on WhatsApp
  | 'coming-soon'; // announced but not yet taking requests

export interface ProductVariant {
  variantId: string;
  /** e.g. "750 ml bottle" — only enter sizes the family has confirmed. */
  bottleSize: string;
  /** Price in Belize dollars. Leave null until the family approves the price. */
  priceBZD: number | null;
  availability: Availability;
  /** Optional maximum per order request. */
  quantityLimit?: number;
  /** Internal flag for illustrative preview data — never shown as real. */
  illustrative?: boolean;
}

export interface FlavourPalette {
  /** Main liquid colour used in the illustrated bottle and card accents. */
  cream: string;
  /** Deeper shade for gradients. */
  deep: string;
  /** Accent (ribbon / foil). */
  accent: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  /** Short flavour narrative. Use the family's own words wherever possible. */
  description: string;
  /** Approved product photos (paths in /public). Leave empty to show the illustrated bottle. */
  images: { src: string; alt: string }[];
  seasonalCollection: 'classic' | 'customer-favourite' | 'seasonal' | 'new-release';
  /** Set false to hide the flavour from the site entirely. */
  active: boolean;
  /** Featured on the homepage. */
  highlighted: boolean;
  /**
   * true only when the family has confirmed this flavour is on the current season's menu.
   * Unconfirmed flavours appear with "Ask about availability".
   */
  confirmedThisSeason: boolean;
  variants: ProductVariant[];
  containsAlcohol: boolean;
  alcoholInformation: string | null;
  /** Approved allergen list, e.g. ["Egg", "Milk"]. null = not yet confirmed. */
  allergens: string[] | null;
  ingredientsDisclosure: string | null;
  dietaryLabel: string | null;
  leadTime: string | null;
  collectionOrDeliveryOptions: string[] | null;
  /** Internal notes for the family / developers — never rendered. */
  editorialNotes?: string;
  palette: FlavourPalette;
}

export type FulfilmentId = 'delivery' | 'pickup' | 'shipping' | 'advise';

export interface FulfilmentOption {
  id: FulfilmentId;
  label: string;
  description: string;
  /** Only switch on options the family has approved. */
  enabled: boolean;
  /** Ask the customer for an area / town / address hint. */
  asksForArea: boolean;
  areaLabel?: string;
  /** Few-word summary shown in the season announcement, e.g. "within Belize City limits". */
  short?: string;
  /** How the charge is named in the order summary, e.g. "Delivery charge". */
  chargeLabel: string;
  /** Charge in BZD. 0 = no charge. null = a charge applies; amount confirmed by Cojac's. */
  feeBZD: number | null;
}

export interface CartLine {
  /** productId + variantId — unique per line. */
  key: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  note: string;
}

export interface OrderDetails {
  name: string;
  fulfilment: FulfilmentId | '';
  area: string;
  preferredDate: string;
  notes: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  /** Only published FAQs appear on the site. Draft answers wait for family approval. */
  published: boolean;
  category: 'ordering' | 'product' | 'delivery' | 'general';
}

export interface MediaItem {
  id: string;
  platform: 'youtube' | 'facebook';
  kind: 'video' | 'reel';
  url: string;
  /** YouTube video id — enables click-to-play embed. */
  youtubeId?: string;
  title: string;
  /** Exact title as published on the source, for reference. */
  sourceTitle?: string;
  publisher?: string;
  thumbnail?: string;
  /** Upload date on YouTube (YYYY-MM-DD). Enables VideoObject structured data. */
  uploadDate?: string;
  featured: boolean;
}

export interface GalleryItem {
  id: string;
  /** Approved photo path. Leave empty for a labelled placeholder. */
  src: string;
  alt: string;
  caption: string;
  category: 'product' | 'packaging' | 'process' | 'memories' | 'events';
  /** Shape in the grid. */
  shape: 'tall' | 'wide' | 'square' | 'feature';
  /** CSS object-position for cropping, e.g. '100% 50%' keeps the right side in view. */
  position?: string;
  /** Photo credit shown in the lightbox. */
  credit?: string;
}
