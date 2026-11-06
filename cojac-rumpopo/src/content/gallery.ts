/**
 * THE SUMPTUOUS GALLERY
 * The two Greater Belize Media stills are frames from the published YouTube features
 * (thumbnails supplied by YouTube). Confirm the family and the presenter are happy
 * for them to appear, and replace them with original photos when available.
 * Add approved photos to /public/gallery and set `src` (e.g. '/gallery/bottles-2026.jpg').
 * Items with an empty `src` render as a clearly labelled "photo coming soon" tile —
 * they are never presented as real photography.
 */
import type { GalleryItem } from '../types';

export const gallery: GalleryItem[] = [
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
  { id: 'g1', src: '', shape: 'tall', category: 'product', alt: '', caption: 'The season’s bottles' },
  { id: 'g2', src: '', shape: 'square', category: 'product', alt: '', caption: 'A creamy pour' },
  { id: 'g3', src: '', shape: 'square', category: 'packaging', alt: '', caption: 'Holiday gifting' },
  { id: 'g4', src: '', shape: 'square', category: 'memories', alt: '', caption: 'Family memories' },
  { id: 'g5', src: '', shape: 'tall', category: 'events', alt: '', caption: 'Community events' },
  { id: 'g6', src: '', shape: 'square', category: 'process', alt: '', caption: 'Behind the bottle' },
  { id: 'g7', src: '', shape: 'square', category: 'product', alt: '', caption: 'Flavours of the season' },
];

export const galleryCategories: Record<GalleryItem['category'], string> = {
  product: 'Bottles & flavours',
  packaging: 'Holiday packaging',
  process: 'Behind the bottle',
  memories: 'Memories',
  events: 'Events & features',
};
