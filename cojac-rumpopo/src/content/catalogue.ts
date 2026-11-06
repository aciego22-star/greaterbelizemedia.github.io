/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FLAVOUR CATALOGUE — edit each season. See docs/HANDOVER.md.
 *
 *  The three flavours below are named in the family's sitemap as tradition and
 *  customer favourites. They are NOT yet confirmed as the complete 2026/27 menu,
 *  so `confirmedThisSeason` is false, `variants` is empty (no sizes/prices yet)
 *  and the site shows "Ask about availability".
 *
 *  When the family confirms the menu:
 *    1. set confirmedThisSeason: true
 *    2. add each bottle size to `variants` with its approved priceBZD
 *    3. add approved photos to /public/products and list them in `images`
 *    4. fill in allergens / ingredientsDisclosure once approved
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Product, ProductVariant } from '../types';
import { buildFlags } from './site';

const ALCOHOL_NOTE = 'Contains alcohol. For adults of legal drinking age only.';

export const products: Product[] = [
  {
    id: 'classic-vanilla',
    slug: 'classic-vanilla',
    name: 'Classic Vanilla',
    subtitle: 'Where it all started',
    description:
      'Classic Vanilla may have started it all — the familiar holiday favourite our story began with, made to be rich, smooth and creamy.',
    images: [],
    seasonalCollection: 'classic',
    active: true,
    highlighted: true,
    confirmedThisSeason: false,
    variants: [],
    containsAlcohol: true,
    alcoholInformation: ALCOHOL_NOTE,
    allergens: null,
    ingredientsDisclosure: null,
    dietaryLabel: null,
    leadTime: null,
    collectionOrDeliveryOptions: null,
    editorialNotes: 'Named in sitemap draft. Awaiting 2026/27 confirmation, sizes, prices, photo and allergens.',
    palette: { cream: '#F3E6C8', deep: '#D9BF8C', accent: '#7A1F2B' },
  },
  {
    id: 'peanut-delight',
    slug: 'peanut-delight',
    name: 'Peanut Delight',
    subtitle: 'A customer favourite',
    description:
      'One of the flavours many customers now look forward to just as much as the original — proof that some traditions are worth reinventing.',
    images: [],
    seasonalCollection: 'customer-favourite',
    active: true,
    highlighted: true,
    confirmedThisSeason: false,
    variants: [],
    containsAlcohol: true,
    alcoholInformation: ALCOHOL_NOTE,
    allergens: null,
    ingredientsDisclosure: null,
    dietaryLabel: null,
    leadTime: null,
    collectionOrDeliveryOptions: null,
    editorialNotes:
      'Named in sitemap draft. Likely peanut allergen — DO NOT publish allergen list until the family approves it.',
    palette: { cream: '#E6C79A', deep: '#B98A52', accent: '#1F4A3A' },
  },
  {
    id: 'pumpkin-spice',
    slug: 'pumpkin-spice',
    name: 'Pumpkin Spice',
    subtitle: 'A customer favourite',
    description:
      'A customer favourite with its own seasonal twist — for anyone who believes Christmas should be a little more than classic.',
    images: [],
    seasonalCollection: 'customer-favourite',
    active: true,
    highlighted: true,
    confirmedThisSeason: false,
    variants: [],
    containsAlcohol: true,
    alcoholInformation: ALCOHOL_NOTE,
    allergens: null,
    ingredientsDisclosure: null,
    dietaryLabel: null,
    leadTime: null,
    collectionOrDeliveryOptions: null,
    editorialNotes: 'Named in sitemap draft. Awaiting 2026/27 confirmation, sizes, prices, photo and allergens.',
    palette: { cream: '#E9B97E', deep: '#C27B3E', accent: '#7A1F2B' },
  },
];

/** Collection headings, in display order. */
export const collections: { id: Product['seasonalCollection']; title: string; intro: string }[] = [
  { id: 'classic', title: 'The Classic', intro: 'The flavour that started it all.' },
  {
    id: 'customer-favourite',
    title: 'Customer Favourites',
    intro: 'Flavours many customers now look forward to just as much as the original.',
  },
  { id: 'seasonal', title: 'Seasonal Creations', intro: 'Limited flavours for this season.' },
  { id: 'new-release', title: 'New Releases', intro: 'Something different to discover.' },
];

/**
 * Internal stakeholder preview only (npm run build:illustrative).
 * Sample sizes with NO prices, clearly labelled — never real menu data.
 */
const illustrativeVariants: ProductVariant[] = [
  { variantId: 'sample-a', bottleSize: 'Sample size A', priceBZD: null, availability: 'ask', illustrative: true },
  { variantId: 'sample-b', bottleSize: 'Sample size B', priceBZD: null, availability: 'ask', illustrative: true },
];

export function getCatalogue(): Product[] {
  const list = products.filter((p) => p.active);
  if (!buildFlags.illustrativeMenu) return list;
  return list.map((p) => (p.variants.length ? p : { ...p, variants: illustrativeVariants }));
}

export function findProduct(id: string): Product | undefined {
  return getCatalogue().find((p) => p.id === id);
}
