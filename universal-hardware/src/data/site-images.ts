/**
 * Images taken from Universal Hardware's current public website
 * (universalhardware.bz, retrieved 28 October 2026) for this private concept.
 * They belong to Universal Hardware and the respective manufacturers.
 * Product Listing, Meilun & Lifan and Hisun photos are shown as published, with
 * WebP copies added; logos are unaltered. News photos are cropped from 2026
 * promotion graphics down to the product alone, leaving out prices and text.
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
const listing = (path: string, w: number, h: number, what: string, source: string): SiteImage =>
  photo(path, w, h, what, source, what);

/** One representative photo per category, from the Product Listing page (motorcycles: Meilun & Lifan page). */
export const CATEGORY_PHOTOS: Record<string, SiteImage> = {
  'welding-supplies': listing('categories/welding-supplies', 200, 223, 'Arc welder with leads', 'arc-welder.jpg'),
  'power-tools': listing('categories/power-tools', 200, 201, 'Circular saw', 'power-tools.jpg'),
  'hand-tools': listing('categories/hand-tools', 200, 266, 'Hammer, pipe wrench and hand saw', 'handtools.jpg'),
  'lawn-and-garden': listing('categories/lawn-and-garden', 200, 293, 'String trimmer', 'lawn.jpg'),
  'lighting-and-fans': listing('categories/lighting-and-fans', 200, 263, 'Ceiling fan with light kit', 'fans.jpg'),
  woodworking: listing('categories/woodworking', 200, 180, 'Table saw', 'woodwork.jpg'),
  generators: listing('categories/generators', 200, 223, 'Portable generator', 'generators.jpg'),
  'water-pumps': listing('categories/water-pumps', 200, 223, 'Engine-driven water pump', 'waterpumps.jpg'),
  household: listing('categories/household', 200, 263, 'Gas barbecue grill', 'bbqgrill.jpg'),
  agriculture: listing('categories/agriculture', 200, 209, 'Roll of barbed wire', 'barbwire.jpg'),
  'shop-tools': listing('categories/shop-tools', 200, 190, 'Air compressor', 'compressor.jpg'),
  motorcycles: photo(
    'products/meilun-trail-motorcycle',
    489,
    325,
    'Red Meilun trail motorcycle',
    'ML150GY-4RED.jpg',
  ),
};

/** Larger product shots from the Meilun & Lifan and Hisun pages, shown as a small gallery. */
export const PRODUCT_SHOTS: Record<string, SiteImage[]> = {
  motorcycles: [
    photo('products/meilun-trail-motorcycle', 489, 325, 'Red Meilun trail motorcycle', 'ML150GY-4RED.jpg', 'Trail motorcycle (Meilun)'),
    photo('products/lifan-street-motorcycle', 489, 325, 'Red Lifan street motorcycle', 'lifan-lf125-5-red.jpg', 'Street motorcycle (Lifan)'),
    photo('products/lifan-scooter', 489, 325, 'Blue Lifan cub bike', 'lifan-lf100-blue.jpg', 'Cub bike / scooter (Lifan)'),
    photo('products/meilun-cargo-motorcycle', 489, 326, 'Red Meilun cargo tricycle', 'ml150zh-3.jpg', 'Cargo motorcycle (Meilun)'),
    photo('products/hisun-utv', 489, 288, 'Camouflage Hisun UTV', 'hisun-HS750UTV.jpg', 'UTV (Hisun)'),
  ],
  generators: [
    photo('products/lifan-generator', 489, 367, 'Orange-framed portable generator', 'meilun/lifan-5500.jpg', 'Portable generator'),
    photo('products/meilun-generator', 489, 367, 'Black-framed Meilun generator', 'meilun/8000E.jpg', 'Generator (Meilun)'),
  ],
  'water-pumps': [
    photo('products/meilun-water-pump', 489, 367, 'Meilun engine-driven water pump', 'meilun/50ZB.jpg', 'Engine-driven water pump (Meilun)'),
  ],
};

const NEWS = 'https://universalhardware.bz/news/wp-content/uploads/';
const fromNews = (file: string, w: number, h: number, what: string, upload: string): SiteImage => ({
  src: `site-images/news/${file}.jpg`,
  webp: `site-images/news/${file}.webp`,
  width: w,
  height: h,
  alt: what,
  sourceUrl: NEWS + upload,
});

/** Larger product photos cropped from the 1080 px promotion graphics on the News / Promotions page. */
export const NEWS_PHOTOS: Record<string, SiteImage> = {
  'power-tools': fromNews('makita-drill-kit', 638, 596, 'Makita 12V cordless drill with battery and charger', 'HP333DYX3B.jpg'),
  woodworking: fromNews('knova-table-saws', 630, 405, 'Two Knova table saws', 'FF-Sale-Saws.jpg'),
  'welding-supplies': fromNews('lincoln-welders', 510, 465, 'Lincoln Electric stick welder, welder/generator and MIG welder', 'Mega-Sale-i9-Lincoln.jpg'),
  'shop-tools': fromNews('hoteche-air-compressors', 560, 465, 'Three Hoteche air compressors', 'Mega-Sale-H-Air-Compressors.jpg'),
  'hand-tools': fromNews('hoteche-socket-set', 370, 420, 'Hoteche 110-piece socket and tool set in its case', 'EXPO-2026-Hoteche.jpg'),
  'lawn-and-garden': fromNews('cub-cadet-zero-turn', 590, 425, 'Cub Cadet zero-turn lawn mower', 'FF-Sale-Cub-Cadet-4.jpg'),
  'lighting-and-fans': fromNews('hunter-ceiling-fans', 590, 440, 'Two Hunter ceiling fans, one with a light kit', 'FF-Sale-Hunter-4.jpg'),
  household: fromNews('sankey-refrigerators', 530, 270, 'Four Sankey refrigerators', 'FF-Sale-Sankey-Refrigerators.jpg'),
  agriculture: fromNews('gaucho-barbed-wire', 440, 400, 'Roll of Gaucho high-strength barbed wire (Bekaert)', 'EXPO-2026-Wire.jpg'),
};

/** Photo from the Makita Clinic post (February 2026), used in the homepage service panel. */
export const SERVICE_PHOTO = fromNews('makita-clinic', 1080, 410, 'Gloved hands servicing a Makita power tool at the Makita Clinic event', 'MakitaClinic-feb2026.jpg');

/**
 * The sharpest website photo for each category, used wherever a category is
 * shown as a tile or card and in its page hero: a 489 px product shot from the
 * Meilun & Lifan page, otherwise a crop from the News page.
 */
export const FEATURED_PHOTOS: Record<string, SiteImage> = {
  ...CATEGORY_PHOTOS,
  ...NEWS_PHOTOS,
  generators: PRODUCT_SHOTS.generators[0],
  'water-pumps': PRODUCT_SHOTS['water-pumps'][0],
};

/** Gallery for a category page: its product shots plus the Product Listing photo, minus the one in the hero. */
export function galleryFor(slug: string): SiteImage[] {
  const all = [...(PRODUCT_SHOTS[slug] ?? [])];
  const listed = CATEGORY_PHOTOS[slug];
  if (listed && !all.some((s) => s.src === listed.src)) all.push(listed);
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

