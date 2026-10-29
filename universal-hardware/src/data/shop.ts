/**
 * Shop catalogue for the concept's cart and checkout.
 *
 * Every item is a single-product graphic from Universal Hardware's Friends &
 * Family Sale (Spanish Lookout, 19–21 February 2026) on the website's News /
 * Promotions page. Model, description, colours and price are copied exactly
 * from that graphic (prices as printed, read in Belize dollars). The sale has
 * ended, so these are past sale prices used to demonstrate the checkout, not a
 * current price list or confirmed stock. Photos are cut out of the same
 * graphics by scripts/crop-shop-photos.py, leaving the price text out.
 */
import type { SiteImage } from './site-images';

export type ShopGroup = 'cordless' | 'corded' | 'outdoor' | 'motorcycles';

export interface ShopProduct {
  id: string;
  brand: 'Makita' | 'Lifan' | 'Meilun';
  model: string;
  /** Description as printed on the graphic. */
  name: string;
  group: ShopGroup;
  /** Price printed on the graphic, in cents. */
  price: number;
  /** "Available in …" colours, where the graphic lists them. */
  colours?: string[];
  /** Matching category page, if the site has one. */
  category?: string;
  image: SiteImage;
  /** Upload name of the source graphic (without .jpg). */
  source: string;
  note?: string;
}

export const SHOP_PROMO = {
  name: 'Friends & Family Sale',
  where: 'Spanish Lookout, Center Avenue',
  dates: '19–21 February 2026',
  ended: true,
  pageUrl: 'https://universalhardware.bz/news/',
};

export const SHOP_GROUPS: { id: ShopGroup; label: string }[] = [
  { id: 'cordless', label: 'Cordless kits' },
  { id: 'corded', label: 'Corded power tools' },
  { id: 'outdoor', label: 'Outdoor & cleaning' },
  { id: 'motorcycles', label: 'Motorcycles & scooters' },
];

export const PRICE_NOTE = `Sale price printed in Universal Hardware’s ${SHOP_PROMO.name} graphic (${SHOP_PROMO.where}, ${SHOP_PROMO.dates}). That sale has ended: shown to demonstrate the checkout, not a current price.`;

const UPLOADS = 'https://universalhardware.bz/news/wp-content/uploads/';
export const sourceUrl = (p: ShopProduct) => `${UPLOADS}${p.source}.jpg`;

const pic = (file: string, w: number, h: number, alt: string): SiteImage => ({
  src: `site-images/shop/${file}.jpg`,
  webp: `site-images/shop/${file}.webp`,
  width: w,
  height: h,
  alt,
  sourceUrl: '',
});

type Row = [id: string, brand: ShopProduct['brand'], model: string, name: string, group: ShopGroup, price: number, source: string, size: [number, number], alt: string, extra?: Partial<ShopProduct>];

const ROWS: Row[] = [
  ['makita-hp333dyx3b', 'Makita', 'HP333DYX3B', '12V CXT Drill + 1.5Ah Battery + Charger', 'cordless', 24825, 'HP333DYX3B', [720, 540], 'Black Makita 12V cordless drill with its battery and charger', { category: 'power-tools' }],
  ['makita-dlx2336syx', 'Makita', 'DLX2336SYX', '2pc 18V LXT Combo + (2) 1.5Ah Batteries + Charger', 'cordless', 52350, 'DLX2336SYX-1', [720, 540], 'Makita 18V hammer drill and impact driver with two batteries, charger and tool bag', { category: 'power-tools' }],
  ['makita-dlx2142y', 'Makita', 'DLX2142Y', '2pc 18V LXT Combo + (2) 1.5Ah Batteries + Charger + Case', 'cordless', 57675, 'DLX2142Y-2', [720, 540], 'Makita 18V drill and impact driver with two batteries, charger and carry case', { category: 'power-tools' }],
  ['makita-dlx2414yx7', 'Makita', 'DLX2414YX7', '2pc 18V LXT Brushless Combo + (2) 1.5Ah Batteries + Charger', 'cordless', 60300, 'DLX2414YX7-1', [720, 540], 'Makita 18V brushless drill and impact driver with two batteries and charger', { category: 'power-tools' }],
  ['makita-dlx2180tx', 'Makita', 'DLX2180TX', '2pc 18V LXT Combo + (2) 5.0Ah Batteries + Charger', 'cordless', 83175, 'DLX2180TX', [720, 540], 'Makita 18V hammer drill and impact driver with two 5.0Ah batteries, charger and case', { category: 'power-tools' }],
  ['makita-m9507b', 'Makita', 'M9507B', 'MT 4-1/2″ Angle Grinder 750W', 'corded', 8850, 'M9507B-3', [720, 540], 'Makita MT 4-1/2 inch angle grinder', { category: 'power-tools' }],
  ['makita-hp1630', 'Makita', 'HP1630', '5/8″ Hammer Drill 710W', 'corded', 12825, 'HP1630-3', [720, 540], 'Makita corded hammer drill with side handle', { category: 'power-tools' }],
  ['makita-ga4530x2', 'Makita', 'GA4530X2', '4-1/2″ Angle Grinder 720W + 3 Discs', 'corded', 13275, 'GA4530X2-5', [720, 540], 'Makita 4-1/2 inch angle grinder with three discs', { category: 'power-tools' }],
  ['makita-9557hpgx1', 'Makita', '9557HPGX1', '4-1/2″ Angle Grinder 840W + 5 Discs', 'corded', 17325, '9557HPGX1-1', [720, 540], 'Makita angle grinder in an aluminium case with five discs', { category: 'power-tools' }],
  ['makita-bo5030', 'Makita', 'BO5030', 'Orbit Sander 300W', 'corded', 18450, 'BO5030-2', [720, 540], 'Makita random orbit sander with dust bag', { category: 'power-tools' }],
  ['makita-5007nk', 'Makita', '5007NK', '7-1/4″ Circular Saw 1,800W', 'corded', 30450, '5007NK-3', [657, 493], 'Makita 7-1/4 inch circular saw with carry case', { category: 'power-tools' }],
  ['makita-hr2470', 'Makita', 'HR2470', '2.7J SDS Plus Rotary Hammer', 'corded', 41400, 'HR2470-3', [720, 540], 'Makita SDS Plus rotary hammer', { category: 'power-tools' }],
  ['makita-lw1401', 'Makita', 'LW1401', '14″ 15AMP Cut-Off Saw', 'corded', 42300, 'LW1401', [720, 540], 'Makita 14 inch cut-off saw', { category: 'power-tools' }],
  ['makita-dur181sf', 'Makita', 'DUR181SF', '18V String Trimmer + 3.0Ah Battery + Charger', 'outdoor', 21225, 'DUR181SF', [720, 540], 'Makita 18V cordless string trimmer with battery and charger', { category: 'lawn-and-garden' }],
  ['makita-hw101', 'Makita', 'HW101', 'Pressure Washer', 'outdoor', 23775, 'HW101-2', [720, 540], 'Makita electric pressure washer with lance and detergent bottle'],
  ['makita-dur365uz', 'Makita', 'DUR365UZ', '36V Brushcutter', 'outdoor', 69675, 'DUR365UZ', [720, 540], 'Makita 36V cordless brushcutter with bike handle', { category: 'lawn-and-garden' }],
  ['lifan-lf100-a', 'Lifan', 'LF100-A', 'Bike – Scooter 100cc', 'motorcycles', 174240, 'LF100-A-2', [690, 518], 'Lifan LF100-A 100cc scooter bikes in black, blue and red', { colours: ['Black', 'Blue', 'Red'], category: 'motorcycles' }],
  ['meilun-ml125-5', 'Meilun', 'ML125-5', 'Bike – Street 125cc', 'motorcycles', 179920, 'ML125-5-2', [684, 513], 'ML125-5 125cc street motorcycles in green, purple and red', { colours: ['Black', 'Red', 'Green'], category: 'motorcycles', note: 'The sale graphic carries the Lifan logo; the model code and tank badge are Meilun.' }],
  ['lifan-lf110-7a', 'Lifan', 'LF110-7A', 'Bike – Scooter 110cc', 'motorcycles', 198080, 'LF110-7A-2', [664, 498], 'Lifan LF110-7A 110cc scooter bikes in red and black', { colours: ['Black', 'Red'], category: 'motorcycles' }],
  ['meilun-ml125-7', 'Meilun', 'ML125-7', 'Bike – Street 125cc', 'motorcycles', 208640, 'ML125-7-2', [681, 511], 'ML125-7 125cc street motorcycles in black and red', { colours: ['Black', 'Red', 'Green'], category: 'motorcycles', note: 'The sale graphic carries the Lifan logo; the model code and tank badge are Meilun.' }],
  ['meilun-ml125-16d', 'Meilun', 'ML125-16D', 'Scooter 125cc Meilun Flash', 'motorcycles', 212080, 'ML125-16D-1', [599, 449], 'Meilun Flash 125cc scooters in blue and red', { colours: ['Blue', 'Red'], category: 'motorcycles' }],
  ['lifan-lf150-7', 'Lifan', 'LF150-7', 'Bike – Street 150cc', 'motorcycles', 216480, 'LF150-7-2', [610, 458], 'Lifan LF150-7 150cc street motorcycles in red and black', { colours: ['Black', 'Red'], category: 'motorcycles' }],
  ['lifan-lf150t-12c', 'Lifan', 'LF150T-12C', 'Bike – Scooter 150cc', 'motorcycles', 251040, 'LF150T-12C-2', [620, 465], 'Lifan LF150T-12C 150cc scooter in blue and black', { colours: ['Black', 'Blue'], category: 'motorcycles' }],
  ['lifan-lf150-5l', 'Lifan', 'LF150-5L', 'Bike – Street 150cc', 'motorcycles', 254480, 'LF150-5L-2', [663, 497], 'Lifan LF150-5L 150cc street motorcycles in black and white', { colours: ['Black', 'White'], category: 'motorcycles' }],
  ['lifan-lf200gy-4', 'Lifan', 'LF200GY-4', 'Bike – Trail 200cc', 'motorcycles', 300640, 'LF200GY-4-2', [642, 482], 'Lifan LF200GY-4 200cc trail motorcycles in black and red', { colours: ['Black', 'Red'], category: 'motorcycles' }],
  ['meilun-ml150gy-3a', 'Meilun', 'ML150GY-3A', 'Bike – Trail 150cc', 'motorcycles', 301360, 'ML150GY-3A-2', [595, 446], 'Meilun ML150GY-3A 150cc trail motorcycle in red', { colours: ['Red'], category: 'motorcycles' }],
  ['meilun-ml200gy-4', 'Meilun', 'ML200GY-4', 'Bike – Trail 200cc', 'motorcycles', 311520, 'ML200GY-4-1', [633, 475], 'Meilun ML200GY-4 200cc trail motorcycles in red and blue', { colours: ['Red', 'Blue'], category: 'motorcycles' }],
  ['lifan-lf150-5u', 'Lifan', 'LF150-5U', 'Bike – Street 150cc', 'motorcycles', 339920, 'LF150-5U-2', [623, 467], 'Lifan LF150-5U 150cc street motorcycle in white', { colours: ['White'], category: 'motorcycles' }],
  ['meilun-ml250gy-4', 'Meilun', 'ML250GY-4', 'Bike – Trail 250cc', 'motorcycles', 359840, 'ML250GY-4-2', [625, 469], 'Meilun ML250GY-4 250cc trail motorcycles in red and blue', { colours: ['Red', 'Blue'], category: 'motorcycles' }],
  ['lifan-lf250gy-4', 'Lifan', 'LF250GY-4', 'Bike – Trail 250cc', 'motorcycles', 367520, 'LF250GY-4-2', [642, 482], 'Lifan LF250GY-4 250cc trail motorcycles in black and red', { colours: ['Black', 'Red'], category: 'motorcycles' }],
  ['meilun-ml200zh-3', 'Meilun', 'ML200ZH-3', '3 Wheel KCD Street 200cc', 'motorcycles', 371680, 'ML200ZH-2', [645, 484], 'Meilun ML200ZH-3 200cc three-wheel cargo motorcycle in red', { colours: ['Red'], category: 'motorcycles' }],
  ['lifan-lf200-14f', 'Lifan', 'LF200-14F', 'Bike – Street 200cc', 'motorcycles', 450720, 'LF200-14F-2', [675, 506], 'Lifan LF200-14F 200cc cruiser motorcycle in black', { colours: ['Black'], category: 'motorcycles' }],
];

export const SHOP_PRODUCTS: ShopProduct[] = ROWS.map(([id, brand, model, name, group, price, source, [w, h], alt, extra]) => ({
  id,
  brand,
  model,
  name,
  group,
  price,
  source,
  image: { ...pic(source.toLowerCase().replace(/-\d$/, ''), w, h, `${alt}, from Universal Hardware’s February 2026 sale graphic`), sourceUrl: UPLOADS + source + '.jpg' },
  ...extra,
}));

export const PRODUCT_BY_ID: Record<string, ShopProduct> = Object.fromEntries(SHOP_PRODUCTS.map((p) => [p.id, p]));

export const productTitle = (p: ShopProduct) => `${p.brand} ${p.model}`;

/** Cents → "BZ$1,742.40" (fixed format so build-time and runtime output match). */
export function formatPrice(cents: number): string {
  const neg = cents < 0;
  const abs = Math.abs(Math.round(cents));
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '−' : ''}BZ$${whole}.${String(abs % 100).padStart(2, '0')}`;
}
