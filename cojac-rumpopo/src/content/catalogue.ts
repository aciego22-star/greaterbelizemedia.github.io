/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  FLAVOUR CATALOGUE — edit each season. See docs/HANDOVER.md.
 *
 *  2026/27 menu supplied by the family (Nov 2026): seven flavours (Coquito
 *  replaced Dark Chocolate Peppermint on 12 Nov 2026), each in a
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
import { t } from '../i18n/lang';

const ALCOHOL_NOTE = t('Contains alcohol. For adults of legal drinking age only.', 'Contiene alcohol. Solo para adultos mayores de edad.');
const HALF = t('Half liter (500 mL)', 'Medio litro (500 mL)');
const LITER = t('Liter (1 L)', 'Litro (1 L)');

/** Two sizes and two prices, in BZD, as supplied by the family. */
function sizes(halfLiter: number, liter: number): ProductVariant[] {
  return [
    { variantId: 'half-liter', bottleSize: HALF, priceBZD: halfLiter, availability: 'on-menu' },
    { variantId: 'liter', bottleSize: LITER, priceBZD: liter, availability: 'on-menu' },
  ];
}

/** Desktop + mobile photo pair from the supplied image package. */
function photo(base: string, flavour: string): ProductImage[] {
  return [
    {
      base,
      src: `/products/${base}_Desktop_1600x1200.jpg`,
      mobileSrc: `/products/${base}_Mobile_1080x1350.jpg`,
      alt: t(`Bottle of Cojac’s ${flavour} Rumpopo in front of a Christmas tree`, `Botella de rumpopo Cojac’s ${flavour} frente a un árbol de Navidad`),
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
    subtitle: t('Where it all started', 'Donde todo comenzó'),
    description: t(
      'Classic Vanilla may have started it all. The familiar holiday favourite our story began with, made to be rich, smooth and creamy.',
      'Classic Vanilla quizá lo empezó todo. El favorito navideño de siempre con el que comenzó nuestra historia, hecho para ser rico, suave y cremoso.',
    ),
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
    subtitle: t('A customer favourite', 'Un favorito de los clientes'),
    description:
      t(
        'One of the flavours many customers now look forward to just as much as the original. Proof that some traditions are worth reinventing.',
        'Uno de los sabores que muchos clientes ahora esperan tanto como el original. La prueba de que algunas tradiciones merecen reinventarse.',
      ),
    images: photo('Cojacs_Peanut_Delight_Rumpopo', 'Peanut Delight'),
    seasonalCollection: 'customer-favourite',
    highlighted: true,
    variants: sizes(20, 38),
    dietaryLabel: null,
    editorialNotes: 'Likely peanut allergen, publish the allergen list only once the family approves it.',
    palette: { cream: '#E6C79A', deep: '#B98A52', accent: '#1F4A3A' },
  },
  {
    ...common,
    id: 'pumpkin-spice',
    slug: 'pumpkin-spice',
    name: 'Pumpkin Spice Rumpopo',
    subtitle: t('A customer favourite', 'Un favorito de los clientes'),
    description: t(
      'A customer favourite with its own seasonal twist, for anyone who believes Christmas should be a little more than classic.',
      'Un favorito de los clientes con su propio toque de temporada, para quienes creen que la Navidad debe ser un poco más que clásica.',
    ),
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
    subtitle: t('Seasonal creation', 'Creación de temporada'),
    description: t(
      'White chocolate and hazelnut, made the Cojac’s way. A seasonal creation for anyone looking for something different to discover.',
      'Chocolate blanco y avellana, al estilo Cojac’s. Una creación de temporada para quienes buscan algo diferente por descubrir.',
    ),
    images: photo('Cojacs_White_Chocolate_Hazelnut_Rumpopo', 'White Chocolate w/ Hazelnut'),
    seasonalCollection: 'seasonal',
    highlighted: true,
    variants: sizes(25, 48),
    dietaryLabel: null,
    editorialNotes: 'Name suggests a tree-nut (hazelnut) allergen, confirm before publishing allergens.',
    palette: { cream: '#F1E6CF', deep: '#D6C29C', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'coquito',
    slug: 'coquito',
    name: 'Coquito Rumpopo',
    subtitle: t('New this season', 'Nuevo esta temporada'),
    description: t(
      'New to the menu this season: Coquito, a festive holiday favourite, poured the Cojac’s way.',
      'Nuevo en el menú esta temporada: Coquito, un favorito festivo de las fiestas, servido al estilo Cojac’s.',
    ),
    images: photo('Cojacs_Coquito_Rumpopo', 'Coquito'),
    seasonalCollection: 'new-release',
    highlighted: false,
    variants: sizes(25, 45),
    dietaryLabel: null,
    editorialNotes: 'Added 12 Nov 2026. Confirm ingredients/allergens before publishing them.',
    palette: { cream: '#F1E4C8', deep: '#D2BC8E', accent: '#7A1F2B' },
  },
  {
    ...common,
    id: 'snickerdeluxe',
    slug: 'snickerdeluxe',
    name: 'Snickerdeluxe Rumpopo',
    subtitle: t('Seasonal creation', 'Creación de temporada'),
    description: t(
      'One of Cojac’s seasonal creations: a little more indulgent, and something different to discover this Christmas.',
      'Una de las creaciones de temporada de Cojac’s: un poco más indulgente, y algo diferente por descubrir esta Navidad.',
    ),
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
    subtitle: t('Vegan', 'Vegano'),
    description: t(
      'Cojac’s rumpopo, made vegan, so more people at the table can share the season. Like every Cojac’s rumpopo, it contains alcohol.',
      'El rumpopo Cojac’s en versión vegana, para que más personas en la mesa puedan compartir la temporada. Como todo rumpopo Cojac’s, contiene alcohol.',
    ),
    images: photo('Cojacs_Vegan_Rumpopo', 'Vegan'),
    seasonalCollection: 'seasonal',
    highlighted: false,
    variants: sizes(25, 50),
    dietaryLabel: t('Vegan (as named by Cojac’s). Contains alcohol.', 'Vegano (según lo nombra Cojac’s). Contiene alcohol.'),
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
    title: t('The Classic & Customer Favourites', 'El clásico y los favoritos de los clientes'),
    intro: t(
      'Classic Vanilla started it all, and these are the flavours many customers now look forward to just as much as the original.',
      'Classic Vanilla lo empezó todo, y estos son los sabores que muchos clientes ahora esperan tanto como el original.',
    ),
  },
  {
    id: 'seasonal',
    includes: ['seasonal', 'new-release'],
    title: t('Seasonal Creations', 'Creaciones de temporada'),
    intro: t('There’s always something different to discover.', 'Siempre hay algo diferente por descubrir.'),
  },
];

/** The two sizes every flavour comes in (for FAQs and summaries). */
export const sizeNames = [HALF, LITER];

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
