/**
 * Brands carried.
 * ---------------------------------------------------------------------------
 * The first block are brands confirmed from Duke Marine's own material
 * (Calcutta, BOSS Audio, Pettit). The remainder are common
 * category leaders shown as representative, please confirm/trim to the
 * real line-up, and add any that are missing.
 */
export type Brand = {
  name: string;
  category: string;
  blurb: string;
  departments: ('marine' | 'fishing' | 'diving')[];
  featured?: boolean;
};

export const brands: Brand[] = [
  // Confirmed
  { name: 'Calcutta', category: 'Fishing & Eyewear', blurb: 'Reels, coolers, apparel & polarized eyewear.', departments: ['fishing'], featured: true },
  { name: 'BOSS Audio', category: 'Marine Electronics', blurb: 'Weatherproof marine stereos & speakers.', departments: ['marine'], featured: true },
  { name: 'Pettit', category: 'Paint & Coatings', blurb: 'Trinidad antifouling & marine finishes.', departments: ['marine'], featured: true },

  // Representative, confirm with the shop
  { name: 'Garmin', category: 'Navigation', blurb: 'GPS, sonar & chartplotters.', departments: ['marine'] },
  { name: 'Sea-Dog', category: 'Hardware', blurb: 'Stainless boat hardware.', departments: ['marine'] },
  { name: 'Solas', category: 'Propellers', blurb: 'Stainless & aluminium props.', departments: ['marine'] },
  { name: 'Interstate', category: 'Batteries', blurb: 'Marine & deep-cycle power.', departments: ['marine'] },
  { name: 'Shimano', category: 'Rods & Reels', blurb: 'Spinning & conventional gear.', departments: ['fishing'], featured: true },
  { name: 'Penn', category: 'Reels', blurb: 'Offshore & inshore reels.', departments: ['fishing'], featured: true },
  { name: 'PowerPro', category: 'Line & Braid', blurb: 'High-strength braided line.', departments: ['fishing'] },
  { name: 'Mustad', category: 'Terminal Tackle', blurb: 'Hooks & terminal tackle.', departments: ['fishing'] },
  { name: 'Cressi', category: 'Dive Gear', blurb: 'Masks, fins, regs & wetsuits.', departments: ['diving'], featured: true },
  { name: 'Mares', category: 'Dive Gear', blurb: 'Regulators, BCDs & computers.', departments: ['diving'] },
  { name: 'Cataract', category: 'Spearfishing', blurb: 'Spearguns & spearfishing gear.', departments: ['diving'] },
  { name: 'Pelican', category: 'Coolers & Cases', blurb: 'Roto-molded coolers & cases.', departments: ['fishing', 'marine'] },
];

export const featuredBrands = brands.filter((b) => b.featured);
