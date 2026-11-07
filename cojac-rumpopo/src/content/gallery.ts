/**
 * THE SUMPTUOUS GALLERY
 *
 * Product photographs supplied by the family (Nov 2026, /public/products) plus two
 * stills from the published Greater Belize Media YouTube features (/public/gallery).
 * Confirm the family and the presenter are happy for the GBM stills to appear.
 *
 * To add a photo: put it in /public/gallery, then add an entry below.
 *  - `src`   — the image shown in the grid (a smaller, web-optimised file is ideal)
 *  - `large` — optional bigger file for the lightbox
 *  - `shape` — 'feature' (big, 2×2), 'tall' (1×2), 'wide' (2×1) or 'square'
 * Items with an empty `src` render as a clearly labelled "photo coming soon" tile.
 */
import type { GalleryItem } from '../types';

/** Grid tile from the product image package (mobile 4:5 crop keeps the whole bottle). */
function productTile(id: string, base: string, flavour: string, shape: GalleryItem['shape'] = 'tall'): GalleryItem {
  const feature = shape === 'feature';
  return {
    id,
    src: feature ? `/products/${base}_Desktop_800x600.webp` : `/products/${base}_Mobile_540x675.webp`,
    large: feature ? `/products/${base}_Desktop_1600x1200.jpg` : `/products/${base}_Mobile_1080x1350.jpg`,
    shape,
    category: 'product',
    alt: `Bottle of Cojac’s ${flavour} Rumpopo in front of a Christmas tree`,
    caption: `${flavour} Rumpopo`,
  };
}

// Order is arranged so the grid fills without gaps on desktop (4 columns) and mobile (2 columns).
export const gallery: GalleryItem[] = [
  productTile('p-classic-vanilla', 'Cojacs_Classic_Vanilla_Rumpopo', 'Classic Vanilla', 'feature'),
  productTile('p-peanut-delight', 'Cojacs_Peanut_Delight_Rumpopo', 'Peanut Delight'),
  productTile('p-pumpkin-spice', 'Cojacs_Pumpkin_Spice_Rumpopo', 'Pumpkin Spice'),
  productTile('p-dark-chocolate-peppermint', 'Cojacs_Dark_Chocolate_Peppermint_Rumpopo', 'Dark Chocolate Peppermint'),
  productTile('p-white-chocolate-hazelnut', 'Cojacs_White_Chocolate_Hazelnut_Rumpopo', 'White Chocolate w/ Hazelnut'),
  {
    id: 'gbm-demo',
    src: '/gallery/gbm-christmas-feature-demo.jpg',
    shape: 'feature',
    category: 'events',
    position: '85% 50%',
    alt: 'Cojac’s rumpopo being prepared on set during a Greater Belize Media Christmas feature, with bottles of rumpopo on the table',
    caption: 'Making rumpopo on a Greater Belize Media Christmas feature',
    credit: 'Still from Greater Belize Media (GBM) on YouTube',
  },
  {
    id: 'gbm-interview',
    src: '/gallery/gbm-interview.jpg',
    shape: 'feature',
    category: 'events',
    position: '40% 30%',
    alt: 'Cojac’s sharing the rumpopo story in a Greater Belize Media television interview',
    caption: 'Sharing our story with Greater Belize Media',
    credit: 'Still from Greater Belize Media (GBM) on YouTube',
  },
  productTile('p-snickerdeluxe', 'Cojacs_Snickerdeluxe_Rumpopo', 'Snickerdeluxe'),
  productTile('p-vegan', 'Cojacs_Vegan_Rumpopo', 'Vegan'),
];

export const galleryCategories: Record<GalleryItem['category'], string> = {
  product: 'Bottles & flavours',
  packaging: 'Holiday packaging',
  process: 'Behind the bottle',
  memories: 'Memories',
  events: 'Events & features',
};
