/**
 * THE SUMPTUOUS GALLERY
 * Add approved photos to /public/gallery and set `src` (e.g. '/gallery/bottles-2026.jpg').
 * Items with an empty `src` render as a clearly labelled "photo coming soon" tile —
 * they are never presented as real photography.
 */
import type { GalleryItem } from '../types';

export const gallery: GalleryItem[] = [
  { id: 'g1', src: '', shape: 'tall', category: 'product', alt: '', caption: 'The season’s bottles' },
  { id: 'g2', src: '', shape: 'square', category: 'product', alt: '', caption: 'A creamy pour' },
  { id: 'g3', src: '', shape: 'wide', category: 'packaging', alt: '', caption: 'Holiday gifting' },
  { id: 'g4', src: '', shape: 'square', category: 'memories', alt: '', caption: 'Family memories' },
  { id: 'g5', src: '', shape: 'tall', category: 'events', alt: '', caption: 'Community events' },
  { id: 'g6', src: '', shape: 'square', category: 'process', alt: '', caption: 'Behind the bottle' },
  { id: 'g7', src: '', shape: 'wide', category: 'product', alt: '', caption: 'Flavours of the season' },
  { id: 'g8', src: '', shape: 'square', category: 'events', alt: '', caption: 'Christmas features' },
];

export const galleryCategories: Record<GalleryItem['category'], string> = {
  product: 'Bottles & flavours',
  packaging: 'Holiday packaging',
  process: 'Behind the bottle',
  memories: 'Memories',
  events: 'Events & features',
};
