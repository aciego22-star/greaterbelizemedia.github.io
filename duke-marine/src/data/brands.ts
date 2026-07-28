/**
 * Brands carried (placeholder list).
 * TODO (client): confirm the real brand line-up you stock.
 */
export type Brand = {
  name: string;
  category: string;
  blurb: string;
  departments: ('marine' | 'fishing')[];
  featured?: boolean;
};

export const brands: Brand[] = [
  { name: 'Mercury', category: 'Outboard Motors', blurb: 'Outboard power & propulsion.', departments: ['marine'], featured: true },
  { name: 'Yamaha', category: 'Outboard Motors', blurb: 'Outboards, parts & oils.', departments: ['marine'], featured: true },
  { name: 'Garmin', category: 'Marine Electronics', blurb: 'GPS, sonar & navigation.', departments: ['marine'], featured: true },
  { name: 'Interlux', category: 'Paint & Coatings', blurb: 'Antifouling & finishes.', departments: ['marine'] },
  { name: 'Mustang', category: 'Safety Gear', blurb: 'Life jackets & survival.', departments: ['marine'] },
  { name: 'Sea-Dog', category: 'Hardware', blurb: 'Stainless boat hardware.', departments: ['marine'] },
  { name: 'Solas', category: 'Propellers', blurb: 'Stainless & aluminium props.', departments: ['marine'] },
  { name: 'Interstate', category: 'Batteries', blurb: 'Marine & deep-cycle power.', departments: ['marine'] },
  { name: 'Shimano', category: 'Rods & Reels', blurb: 'Spinning & conventional gear.', departments: ['fishing'], featured: true },
  { name: 'Penn', category: 'Reels', blurb: 'Offshore & inshore reels.', departments: ['fishing'], featured: true },
  { name: 'Costa', category: 'Eyewear', blurb: 'Polarized fishing sunglasses.', departments: ['fishing'], featured: true },
  { name: 'PowerPro', category: 'Line & Braid', blurb: 'High-strength braided line.', departments: ['fishing'] },
  { name: 'Mustad', category: 'Terminal Tackle', blurb: 'Hooks & terminal tackle.', departments: ['fishing'] },
  { name: 'Z-Man', category: 'Lures', blurb: 'Durable soft-plastic baits.', departments: ['fishing'] },
  { name: 'Pelican', category: 'Coolers & Cases', blurb: 'Roto-molded coolers & cases.', departments: ['fishing', 'marine'] },
  { name: 'Pelagic', category: 'Apparel', blurb: 'Performance fishing apparel.', departments: ['fishing'] },
];

export const featuredBrands = brands.filter((b) => b.featured);
