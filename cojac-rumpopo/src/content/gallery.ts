/**
 * THE SUMPTUOUS GALLERY (owner editable)
 *
 * Nine photo scenes supplied by the family (Nov 2026). Each entry is ONE gallery
 * photo with two files in /public/gallery that share a name ("base"):
 *   <base>_Desktop_1600x1200.jpg   shown above 767px wide (4:3)
 *   <base>_Mobile_1080x1350.jpg    shown on phones (4:5)
 * plus web-optimised WebP copies (_Desktop_800x600.webp, _Desktop_1600x1200.webp,
 * _Mobile_540x675.webp, _Mobile_1080x1350.webp).
 *
 * To add a photo: put the two JPGs (and WebP copies) in /public/gallery, then add
 * an entry below. Reorder entries to change the order on the page. The first
 * entry is also the first photo in the homepage gallery preview.
 * Describe what is visible in `alt`; do not name flavours, sizes or prices.
 */
import type { GalleryItem } from '../types';

export const gallery: GalleryItem[] = [
  {
    id: 'poinsettia-bottle-display',
    base: 'Cojacs_Gallery_01_Poinsettia_Bottle_Display',
    caption: 'Poinsettia bottle display',
    alt: 'Rows of Cojac’s rumpopo bottles on a glass table beneath red poinsettias',
    category: 'product',
  },
  {
    id: 'crystal-stopper-bottles',
    base: 'Cojacs_Gallery_02_Crystal_Stopper_Bottles',
    caption: 'Crystal stopper bottles',
    alt: 'Decorative glass bottles with crystal stoppers, filled with rumpopo in several colours, in front of Christmas decorations',
    category: 'packaging',
  },
  {
    id: 'assorted-glass-bottle-display',
    base: 'Cojacs_Gallery_03_Assorted_Glass_Bottle_Display',
    caption: 'Glass bottle display',
    alt: 'A large display of Cojac’s rumpopo in tall glass bottles with red, gold and black caps on a granite counter',
    category: 'product',
  },
  {
    id: 'chilled-rumpopo-ice-tub',
    base: 'Cojacs_Gallery_04_Chilled_Rumpopo_Ice_Tub',
    caption: 'Chilled on ice',
    alt: 'Bottles of Cojac’s rumpopo chilling in a metal tub of ice',
    category: 'product',
  },
  {
    id: 'festive-bottle-collection',
    base: 'Cojacs_Gallery_05_Festive_Bottle_Collection',
    caption: 'Festive bottle collection',
    alt: 'Rows of Cojac’s rumpopo bottles with red ribbon labels',
    category: 'product',
  },
  {
    id: 'gift-baskets',
    base: 'Cojacs_Gallery_01_Gift_Baskets',
    caption: 'Holiday gift baskets',
    alt: 'Gift-ready Cojac’s rumpopo baskets wrapped for the holidays',
    category: 'packaging',
  },
  {
    id: 'assorted-bottles',
    base: 'Cojacs_Gallery_02_Assorted_Bottles',
    caption: 'Assorted bottles',
    alt: 'Assorted rumpopo bottles including red and decorative glass bottles',
    category: 'packaging',
  },
  {
    id: 'bottle-selection',
    base: 'Cojacs_Gallery_03_Bottle_Selection',
    caption: 'Bottle selection',
    alt: 'Small and large bottles of rumpopo arranged on a marble counter',
    category: 'product',
  },
  {
    id: 'gift-bottles-and-jars',
    base: 'Cojacs_Gallery_04_Gift_Bottles_And_Jars',
    caption: 'Gift bottles and jars',
    alt: 'Gift-ready rum popo jars, tall bottles and heart-shaped containers',
    category: 'packaging',
  },
];

/** File paths for one gallery entry, following the naming convention above. */
export function galleryFiles(item: GalleryItem) {
  const b = `/gallery/${item.base}`;
  return {
    desktopJpg: `${b}_Desktop_1600x1200.jpg`,
    desktopWebp: `${b}_Desktop_1600x1200.webp`,
    desktopWebpSmall: `${b}_Desktop_800x600.webp`,
    mobileJpg: `${b}_Mobile_1080x1350.jpg`,
    mobileWebp: `${b}_Mobile_1080x1350.webp`,
    mobileWebpSmall: `${b}_Mobile_540x675.webp`,
  };
}

export const galleryCategories: Record<GalleryItem['category'], string> = {
  product: 'Bottles & flavours',
  packaging: 'Holiday packaging & gifting',
  process: 'Behind the bottle',
  memories: 'Memories',
  events: 'Events & features',
};
