/**
 * Images taken from Universal Hardware's current public website
 * (universalhardware.bz, retrieved 28 October 2026) for this private concept.
 * They belong to Universal Hardware and the respective manufacturers, and are
 * shown exactly as the company presents them. Photos are re-encoded to WebP
 * with the original JPEG as fallback; logos are unaltered.
 *
 * `src` paths are relative to the site root (no leading slash) so both the
 * production build and the private preview can resolve them.
 */
export interface SiteImage {
  src: string;
  webp?: string;
  width: number;
  height: number;
  alt: string;
  sourceUrl: string;
  caption?: string;
}

/** Largest CSS width a photo may be shown at: 1.25× its own pixels, so small files stay reasonably sharp. */
export const photoCap = (image: SiteImage) => Math.round(image.width * 1.25);

const SITE = 'https://universalhardware.bz/i/';
const photo = (path: string, w: number, h: number, alt: string, source: string, caption?: string): SiteImage => ({
  src: `site-images/${path}.jpg`,
  webp: `site-images/${path}.webp`,
  width: w,
  height: h,
  alt,
  sourceUrl: SITE + source,
  caption,
});
const listed = (what: string) => `${what}, as pictured on Universal Hardware's Product Listing page`;

/** One representative photo per category, from the Product Listing page (motorcycles: Meilun & Lifan page). */
export const CATEGORY_PHOTOS: Record<string, SiteImage> = {
  'welding-supplies': photo('categories/welding-supplies', 200, 223, listed('Arc welder with leads'), 'arc-welder.jpg'),
  'power-tools': photo('categories/power-tools', 200, 201, listed('Circular saw'), 'power-tools.jpg'),
  'hand-tools': photo('categories/hand-tools', 200, 266, listed('Hammer, pipe wrench and hand saw'), 'handtools.jpg'),
  'lawn-and-garden': photo('categories/lawn-and-garden', 200, 293, listed('String trimmer'), 'lawn.jpg'),
  'lighting-and-fans': photo('categories/lighting-and-fans', 200, 263, listed('Ceiling fan with light kit'), 'fans.jpg'),
  woodworking: photo('categories/woodworking', 200, 180, listed('Table saw'), 'woodwork.jpg'),
  generators: photo('categories/generators', 200, 223, listed('Portable generator'), 'generators.jpg', 'Portable generator (Product Listing page)'),
  'water-pumps': photo('categories/water-pumps', 200, 223, listed('Engine-driven water pump'), 'waterpumps.jpg', 'Engine-driven water pump (Product Listing page)'),
  household: photo('categories/household', 200, 263, listed('Gas barbecue grill'), 'bbqgrill.jpg'),
  agriculture: photo('categories/agriculture', 200, 209, listed('Roll of barbed wire'), 'barbwire.jpg'),
  'shop-tools': photo('categories/shop-tools', 200, 190, listed('Air compressor'), 'compressor.jpg'),
  motorcycles: photo(
    'products/meilun-trail-motorcycle',
    489,
    325,
    "Trail motorcycle, as pictured on Universal Hardware's Meilun & Lifan page",
    'ML150GY-4RED.jpg',
  ),
};

/** Larger product shots from the Meilun & Lifan and Hisun pages, shown as a small gallery. */
export const PRODUCT_SHOTS: Record<string, SiteImage[]> = {
  motorcycles: [
    photo('products/meilun-trail-motorcycle', 489, 325, 'Red trail motorcycle on the Meilun & Lifan page', 'ML150GY-4RED.jpg', 'Trail motorcycle (Meilun)'),
    photo('products/lifan-street-motorcycle', 489, 325, 'Red street motorcycle on the Meilun & Lifan page', 'lifan-lf125-5-red.jpg', 'Street motorcycle (Lifan)'),
    photo('products/lifan-scooter', 489, 325, 'Blue cub bike on the Meilun & Lifan page', 'lifan-lf100-blue.jpg', 'Cub bike / scooter (Lifan)'),
    photo('products/meilun-cargo-motorcycle', 489, 326, 'Red cargo tricycle on the Meilun & Lifan page', 'ml150zh-3.jpg', 'Cargo motorcycle (Meilun)'),
    photo('products/hisun-utv', 489, 288, 'Camouflage UTV on the Hisun page', 'hisun-HS750UTV.jpg', 'UTV (Hisun page)'),
  ],
  generators: [
    photo('products/lifan-generator', 489, 367, 'Orange-framed portable generator on the Meilun & Lifan page', 'meilun/lifan-5500.jpg', 'Portable generator (Meilun & Lifan page)'),
    photo('products/meilun-generator', 489, 367, 'Black-framed Meilun generator on the Meilun & Lifan page', 'meilun/8000E.jpg', 'Generator (Meilun)'),
  ],
  'water-pumps': [
    photo('products/meilun-water-pump', 489, 367, 'Meilun engine-driven water pump on the Meilun & Lifan page', 'meilun/50ZB.jpg', 'Engine-driven water pump (Meilun)'),
  ],
};

/**
 * The sharpest website photo for each category, used wherever a category is
 * shown as a tile or card and in its page hero: a 489 px product shot where the
 * Meilun & Lifan page has one, otherwise the 200 px Product Listing photo.
 */
export const FEATURED_PHOTOS: Record<string, SiteImage> = {
  ...CATEGORY_PHOTOS,
  generators: PRODUCT_SHOTS.generators[0],
  'water-pumps': PRODUCT_SHOTS['water-pumps'][0],
};

/** Gallery for a category page: its product shots plus the Product Listing photo, minus the one in the hero. */
export function galleryFor(slug: string): SiteImage[] {
  const shots = PRODUCT_SHOTS[slug];
  if (!shots) return [];
  const listing = CATEGORY_PHOTOS[slug];
  const all = listing && !shots.some((s) => s.src === listing.src) ? [...shots, listing] : shots;
  return all.filter((s) => s.src !== FEATURED_PHOTOS[slug]?.src);
}

const logo = (id: string, ext: string, w: number, h: number, name: string, source: string): SiteImage => ({
  src: `site-images/logos/${id}.${ext}`,
  width: w,
  height: h,
  alt: name,
  sourceUrl: SITE + source,
});

/** Brand logos exactly as displayed on Universal Hardware's Brands page (Lifan and Hisun from their own pages). */
export const BRAND_LOGOS: Record<string, SiteImage> = {
  makita: logo('makita', 'gif', 148, 42, 'Makita', 'makita-logo.gif'),
  'lincoln-electric': logo('lincoln-electric', 'gif', 148, 51, 'Lincoln Electric', 'lincoln-electric-logo.gif'),
  'echo-shindaiwa': logo('echo-shindaiwa', 'png', 150, 55, 'ECHO / Shindaiwa', 'brand-logo-echo.png'),
  'cub-cadet': logo('cub-cadet', 'gif', 180, 32, 'Cub Cadet', 'cubcadet-logo.gif'),
  meilun: logo('meilun', 'png', 150, 55, 'Meilun', 'brand-logo-meilun.png'),
  lifan: logo('lifan', 'png', 170, 88, 'Lifan', 'lifan-logo.png'),
  'briggs-stratton': logo('briggs-stratton', 'gif', 150, 87, 'Briggs & Stratton', 'briggs-logo.gif'),
  westinghouse: logo('westinghouse', 'gif', 150, 48, 'Westinghouse', 'westinghouse-logo.gif'),
  'true-value': logo('true-value', 'gif', 150, 33, 'True Value', 'true-value-logo.gif'),
  sankey: logo('sankey', 'gif', 150, 24, 'Sankey', 'sankey-logo.gif'),
  homelite: logo('homelite', 'gif', 150, 30, 'Homelite', 'homelite-logo.gif'),
  lasko: logo('lasko', 'gif', 150, 32, 'Lasko', 'lasko-logo.gif'),
  toolcraft: logo('toolcraft', 'jpg', 150, 36, 'Toolcraft', 'toolcraft-logo.jpg'),
  poulan: logo('poulan', 'gif', 150, 35, 'Poulan', 'poulan-logo.gif'),
  leatherman: logo('leatherman', 'gif', 150, 37, 'Leatherman', 'leatherman-logo.gif'),
  'leeson-electric': logo('leeson-electric', 'gif', 146, 56, 'Leeson Electric', 'leeson-logo.gif'),
  bekaert: logo('bekaert', 'gif', 146, 24, 'Bekaert', 'bekaert-logo.gif'),
  hisun: logo('hisun', 'png', 170, 88, 'Hisun', 'hisun-logo.png'),
};

export const SITE_IMAGE_NOTE = 'Images from Universal Hardware’s current website. Models and availability may have changed.';
