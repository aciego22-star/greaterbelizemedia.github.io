/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FLAVOUR CATALOGUE — edit each season. See docs/HANDOVER.md.
 *
 *  2026/27 menu supplied by the family (Nov 2026): seven flavours, each in a
 *  Half liter (500 mL) and a Liter (1 L) bottle, with approved BZD prices and
 *  product photography in /public/products.
 *
 *  Availability is "on-menu" (on this season's menu) — not a live stock count.
 *  Cojac's confirms availability on WhatsApp. Allergen and ingredient fields stay
 *  null until the family approves them for each flavour.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Product, ProductImage, ProductVariant } from '../types';
import { buildFlags } from './site';

const ALCOHOL_NOTE = 'Contains alcohol. For adults of legal drinking age only.';

/** Two sizes and two prices, in BZD, as supplied by the family. */
function sizes(halfLiter: number, liter: number): ProductVariant[] {
  return [
    { variantId: 'half-liter', bottleSize: 'Half liter (500 mL)', priceBZD: halfLiter, availability: 'on-menu' },
    { variantId: 'liter', bottleSize: 'Liter (1 L)', priceBZD: liter, availability: 'on-menu' },
  ];
}

/** Desktop + mobile photo pair from the supplied image package. */
function photo(base: string, flavour: string): ProductImage[] {
  return [
    {
      base,
      src: `/products/${base}_Desktop_1600x1200.jpg`,
      mobileSrc: `/products/${base}_Mobile_1080x1350.jpg`,
      alt: `Bottle of Cojac’s ${flavour} Rumpopo in front of a Christmas tree`,
    },
  ];
}

const common = {
  active: true,
  confirmedThisSeason: true,
  containsAlcohol: true,
  alcoholInformation: ALCOHOL_NOTE,
  allergens: null,
  ingredientsDisclosure: null,
  leadTime: null,
  collectionOrDeliveryOptions: null,
} as const;

export const products: Product[] = [
  {
    ...common,
    id: 'classic-vanilla',
    slug: 'classic-vanilla',
    name: 'Classic Vanilla Rumpopo',
    subtitle: 'Where it all started',
    description:
      'Classic Vanilla may have started it all — the familiar holiday favourite our story began with, made to be rich, smooth and creamy.',
    images: photo('Cojacs_Classic_Vanilla_Rumpopo', 'Classic Vanilla'),
    seasonalCollection: 'classic',
    highlighted: true,
    variants: sizes(17, 32),
    dietaryLabel: null,
    palette: { cream: '#F3E6C8', deep: '#D9BF8C', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'peanut-delight',
    slug: 'peanut-delight',
    name: 'Peanut Delight Rumpopo',
    subtitle: 'A customer favourite',
    description:
      'One of the flavours many customers now look forward to just as much as the original — proof that some traditions are worth reinventing.',
    images: photo('Cojacs_Peanut_Delight_Rumpopo', 'Peanut Delight'),
    seasonalCollection: 'customer-favourite',
    highlighted: true,
    variants: sizes(20, 38),
    dietaryLabel: null,
    editorialNotes: 'Likely peanut allergen — publish the allergen list only once the family approves it.',
    palette: { cream: '#E6C79A', deep: '#B98A52', accent: '#1F4A3A' },
  },
  {
    ...common,
    id: 'pumpkin-spice',
    slug: 'pumpkin-spice',
    name: 'Pumpkin Spice Rumpopo',
    subtitle: 'A customer favourite',
    description: 'A customer favourite with its own seasonal twist — for anyone who believes Christmas should be a little more than classic.',
    images: photo('Cojacs_Pumpkin_Spice_Rumpopo', 'Pumpkin Spice'),
    seasonalCollection: 'customer-favourite',
    highlighted: true,
    variants: sizes(22, 42),
    dietaryLabel: null,
    palette: { cream: '#E9B97E', deep: '#C27B3E', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'white-chocolate-hazelnut',
    slug: 'white-chocolate-hazelnut',
    name: 'White Chocolate w/ Hazelnut Rumpopo',
    subtitle: 'Seasonal creation',
    description: 'White chocolate and hazelnut, made the Cojac’s way — a seasonal creation for anyone looking for something different to discover.',
    images: photo('Cojacs_White_Chocolate_Hazelnut_Rumpopo', 'White Chocolate w/ Hazelnut'),
    seasonalCollection: 'seasonal',
    highlighted: true,
    variants: sizes(25, 48),
    dietaryLabel: null,
    editorialNotes: 'Name suggests a tree-nut (hazelnut) allergen — confirm before publishing allergens.',
    palette: { cream: '#F1E6CF', deep: '#D6C29C', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'dark-chocolate-peppermint',
    slug: 'dark-chocolate-peppermint',
    name: 'Dark Chocolate Peppermint Rumpopo',
    subtitle: 'Seasonal creation',
    description: 'Dark chocolate and peppermint — a festive pairing for the season, poured the Cojac’s way.',
    images: photo('Cojacs_Dark_Chocolate_Peppermint_Rumpopo', 'Dark Chocolate Peppermint'),
    seasonalCollection: 'seasonal',
    highlighted: false,
    variants: sizes(22, 40),
    dietaryLabel: null,
    palette: { cream: '#B08A72', deep: '#7A5546', accent: '#1F4A3A' },
  },
  {
    ...common,
    id: 'snickerdeluxe',
    slug: 'snickerdeluxe',
    name: 'Snickerdeluxe Rumpopo',
    subtitle: 'Seasonal creation',
    description: 'One of Cojac’s seasonal creations — a little more indulgent, and something different to discover this Christmas.',
    images: photo('Cojacs_Snickerdeluxe_Rumpopo', 'Snickerdeluxe'),
    seasonalCollection: 'seasonal',
    highlighted: false,
    variants: sizes(25, 45),
    dietaryLabel: null,
    palette: { cream: '#B9937A', deep: '#8A6450', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'vegan',
    slug: 'vegan',
    name: 'Vegan Rumpopo',
    subtitle: 'Vegan',
    description: 'Cojac’s rumpopo, made vegan — so more people at the table can share the season. Like every Cojac’s rumpopo, it contains alcohol.',
    images: photo('Cojacs_Vegan_Rumpopo', 'Vegan'),
    seasonalCollection: 'seasonal',
    highlighted: false,
    variants: sizes(25, 50),
    dietaryLabel: 'Vegan (as named by Cojac’s). Contains alcohol.',
    editorialNotes: 'Confirm ingredients/allergens for the vegan recipe before publishing them.',
    palette: { cream: '#E3C79C', deep: '#B8955E', accent: '#1F4A3A' },
  },
];

/**
 * Sections on the Find Your Flavour page, in display order. Each section lists the
 * flavours whose `seasonalCollection` is in `includes`. Empty sections are hidden.
 */
export const collections: { id: string; includes: Product['seasonalCollection'][]; title: string; intro: string }[] = [
  {
    id: 'classics',
    includes: ['classic', 'customer-favourite'],
    title: 'The Classic & Customer Favourites',
    intro: 'Classic Vanilla started it all — and these are the flavours many customers now look forward to just as much as the original.',
  },
  {
    id: 'seasonal',
    includes: ['seasonal', 'new-release'],
    title: 'Seasonal Creations',
    intro: 'There’s always something different to discover.',
  },
];

/** The two sizes every flavour comes in (for FAQs and summaries). */
export const sizeNames = ['Half liter (500 mL)', 'Liter (1 L)'];

/**
 * Internal stakeholder preview only (npm run build:illustrative): sample sizes
 * for any flavour that has none. Not used now that the real menu is in place.
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

/** Lowest approved price on the menu, e.g. for "from BZD $17". */
export function lowestPrice(): number | null {
  const prices = getCatalogue().flatMap((p) => p.variants.map((v) => v.priceBZD).filter((n): n is number => n !== null));
  return prices.length ? Math.min(...prices) : null;
}
