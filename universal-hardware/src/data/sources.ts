/**
 * Public web pages used as the factual basis for this concept.
 * All were viewed on 28 October 2026. They are Universal Hardware's own public
 * pages, not a verified inventory, price list or statement of current stock.
 */
export const SOURCE_VIEWED = '28 October 2026';
export const SOURCE_VIEWED_ISO = '2026-10-28';

export type SourceId =
  | 'home'
  | 'productListing'
  | 'brands'
  | 'meilun'
  | 'hisun'
  | 'about'
  | 'news'
  | 'catalogues';

export interface SourceRecord {
  id: SourceId;
  title: string;
  url: string;
  supports: string;
}

export const SOURCES: Record<SourceId, SourceRecord> = {
  home: {
    id: 'home',
    title: 'Homepage',
    url: 'https://universalhardware.bz/',
    supports: 'Retail and wholesale distribution of hardware tools, household appliances, power equipment, motorcycles and welding supplies.',
  },
  productListing: {
    id: 'productListing',
    title: 'Product Listing',
    url: 'https://universalhardware.bz/product-listing.html',
    supports: 'The twelve product categories, their listed sub-types and the brands named within each category.',
  },
  brands: {
    id: 'brands',
    title: 'Our Brands',
    url: 'https://universalhardware.bz/brands.html',
    supports: 'Brand names shown on the Brands page and the statement of True Value cooperative membership.',
  },
  meilun: {
    id: 'meilun',
    title: 'Meilun & Lifan',
    url: 'https://universalhardware.bz/meilun.html',
    supports: 'Lifan and Meilun scooter, street, trail and cargo motorcycle pages, plus Meilun engines, generators and water pumps. Model prices shown there are historical and are not repeated here.',
  },
  hisun: {
    id: 'hisun',
    title: 'Hisun',
    url: 'https://universalhardware.bz/Hisun.html',
    supports: 'A Hisun page in the site navigation listing UTV and ATV models. Prices shown there are not repeated here.',
  },
  about: {
    id: 'about',
    title: 'Contact Us',
    url: 'https://universalhardware.bz/about.html',
    supports: 'Branch addresses, opening hours, telephone, WhatsApp sales and service-center numbers, holiday closure note and general sales email.',
  },
  news: {
    id: 'news',
    title: 'News / Promotions',
    url: 'https://universalhardware.bz/news/',
    supports: 'Recent posts including Universal Mega Sale 2026, Spanish Lookout Commercial Industrial Expo 2026 and Friends And Family Day 2026.',
  },
  catalogues: {
    id: 'catalogues',
    title: 'Meilun Catalogues',
    url: 'https://universalhardware.bz/catalogues.html',
    supports: 'Meilun parts catalogues (scooter, street, trail, cargo, generator and pump) published for parts orders.',
  },
};

export const OFFICIAL_SITE = 'https://universalhardware.bz/';
