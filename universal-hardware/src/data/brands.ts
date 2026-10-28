import type { SourceId } from './sources';

/**
 * Brand names exactly as they appear on Universal Hardware's public website,
 * with the page(s) that mention them. A mention on the website is NOT treated
 * as proof of a current distribution agreement, exclusivity or stock.
 *
 * `basis` records how each category link was established:
 *  - 'listing'      the Product Listing (or Meilun/Hisun) page names the brand in that category
 *  - 'brands-page'  inferred from how the Brands page itself describes the brand
 */
export interface BrandCategoryLink {
  slug: string;
  basis: 'listing' | 'brands-page';
}

export interface Brand {
  id: string;
  name: string;
  /** Other spellings that appear on the website. */
  alsoWritten?: string[];
  sources: SourceId[];
  onBrandsPage: boolean;
  categories: BrandCategoryLink[];
  /** Neutral one-line description written for this concept. */
  focus: string;
  /** Precise relationship statement backed by the source page. */
  relationship: string;
}

const L = (slug: string): BrandCategoryLink => ({ slug, basis: 'listing' });
const B = (slug: string): BrandCategoryLink => ({ slug, basis: 'brands-page' });

export const BRANDS: Brand[] = [
  {
    id: 'makita',
    name: 'Makita',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('power-tools'), L('generators')],
    focus: 'Power tools; also named among generator brands.',
    relationship: 'Shown on the Brands page and named in the Power Tools and Generators sections.',
  },
  {
    id: 'lincoln-electric',
    name: 'Lincoln Electric',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('welding-supplies'), L('generators')],
    focus: 'Welding equipment; also named among generator brands.',
    relationship: 'Shown on the Brands page and named in the Welding Supplies and Generators sections.',
  },
  {
    id: 'echo-shindaiwa',
    name: 'ECHO / Shindaiwa',
    alsoWritten: ['Echo Shindaiwa', 'Echo & Shindaiwa'],
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('lawn-and-garden')],
    focus: 'Outdoor power equipment such as chainsaws, blowers and brush cutters.',
    relationship: 'Shown on the Brands page and named in the Lawn and Garden section.',
  },
  {
    id: 'cub-cadet',
    name: 'Cub Cadet',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('lawn-and-garden')],
    focus: 'Riding tractors, utility vehicles and mowers, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'meilun',
    name: 'Meilun',
    sources: ['brands', 'meilun', 'catalogues', 'productListing'],
    onBrandsPage: true,
    categories: [L('motorcycles'), L('generators'), L('water-pumps')],
    focus: 'Motorcycles and scooters, plus engines, generators and water pumps.',
    relationship:
      'Shown on the Brands page, with its own Meilun & Lifan page and parts catalogues; also named among generator brands.',
  },
  {
    id: 'lifan',
    name: 'Lifan',
    sources: ['meilun'],
    onBrandsPage: false,
    categories: [L('motorcycles')],
    focus: 'Scooters, street and trail motorcycles.',
    relationship: 'Listed on the Meilun & Lifan page.',
  },
  {
    id: 'briggs-stratton',
    name: 'Briggs & Stratton',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('lawn-and-garden'), L('generators')],
    focus: 'Small engines, lawn equipment engines and generators.',
    relationship: 'Shown on the Brands page and named in the Lawn and Garden and Generators sections.',
  },
  {
    id: 'westinghouse',
    name: 'Westinghouse',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('lighting-and-fans')],
    focus: 'Light fixtures, bulbs and ceiling fans.',
    relationship: 'Shown on the Brands page and named in the Lighting and Fans section.',
  },
  {
    id: 'true-value',
    name: 'True Value',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [],
    focus: 'Hardware cooperative.',
    relationship: 'The Brands page states that Universal Hardware is a member of the True Value cooperative.',
  },
  {
    id: 'sankey',
    name: 'Sankey',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('household')],
    focus: 'Refrigerant-based equipment and home appliances, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'homelite',
    name: 'Homelite',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('lawn-and-garden')],
    focus: 'Consumer outdoor power equipment.',
    relationship: 'Shown on the Brands page and named in the Lawn and Garden section.',
  },
  {
    id: 'lasko',
    name: 'Lasko',
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('lighting-and-fans')],
    focus: 'Fans and home comfort products.',
    relationship: 'Shown on the Brands page and named in the Lighting and Fans section.',
  },
  {
    id: 'toolcraft',
    name: 'Toolcraft',
    alsoWritten: ['Tool Craft'],
    sources: ['brands', 'productListing'],
    onBrandsPage: true,
    categories: [L('power-tools'), L('woodworking')],
    focus: 'Professional tools.',
    relationship:
      'Shown on the Brands page as "Toolcraft" and named as "Tool Craft" in the Power Tools and Woodworking sections.',
  },
  {
    id: 'poulan',
    name: 'Poulan',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('lawn-and-garden')],
    focus: 'Outdoor power equipment, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'leatherman',
    name: 'Leatherman',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('hand-tools')],
    focus: 'Multi-tools, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'leeson-electric',
    name: 'Leeson Electric',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('shop-tools')],
    focus: 'Electric motors and gearmotors, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'bekaert',
    name: 'Bekaert',
    sources: ['brands'],
    onBrandsPage: true,
    categories: [B('agriculture')],
    focus: 'Agricultural fencing products, as described on the Brands page.',
    relationship: 'Shown on the Brands page.',
  },
  {
    id: 'master-mechanic',
    name: 'Master Mechanic',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('power-tools')],
    focus: 'Power tools.',
    relationship: 'Named in the Power Tools section of the Product Listing page.',
  },
  {
    id: 'mtd',
    name: 'MTD',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('lawn-and-garden')],
    focus: 'Lawn and garden equipment.',
    relationship: 'Named in the Lawn and Garden section of the Product Listing page.',
  },
  {
    id: 'hunter',
    name: 'Hunter',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('lighting-and-fans')],
    focus: 'Ceiling fans.',
    relationship: 'Named for ceiling fans in the Lighting and Fans section.',
  },
  {
    id: 'grizzly',
    name: 'Grizzly',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('woodworking')],
    focus: 'Woodworking machinery.',
    relationship: 'Named in the Woodworking section of the Product Listing page.',
  },
  {
    id: 'denyo',
    name: 'Denyo',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('generators')],
    focus: 'Generators.',
    relationship: 'Named in the Generators section of the Product Listing page.',
  },
  {
    id: 'honda',
    name: 'Honda',
    sources: ['productListing'],
    onBrandsPage: false,
    categories: [L('generators')],
    focus: 'Generators.',
    relationship: 'Named in the Generators section of the Product Listing page.',
  },
  {
    id: 'hisun',
    name: 'Hisun',
    sources: ['hisun'],
    onBrandsPage: false,
    categories: [L('motorcycles')],
    focus: 'UTVs and ATVs.',
    relationship: 'Has its own page in the website navigation listing UTV and ATV models.',
  },
];

export const BRAND_BY_ID = Object.fromEntries(BRANDS.map((b) => [b.id, b]));

/** Brands whose category link is source-backed for a given category slug. */
export function brandsForCategory(slug: string): { listing: Brand[]; related: Brand[] } {
  const listing: Brand[] = [];
  const related: Brand[] = [];
  for (const b of BRANDS) {
    const link = b.categories.find((c) => c.slug === slug);
    if (!link) continue;
    (link.basis === 'listing' ? listing : related).push(b);
  }
  return { listing, related };
}
