/**
 * Catalog taxonomy, the category structure shown on the department pages and
 * used to group products. Edit labels/blurbs freely; `id` values are the
 * anchor targets and must match product `category` fields + nav hrefs.
 */
export type Category = {
  id: string;
  name: string;
  blurb: string;
  icon: string;
  examples: string[];
};

export const marineCategories: Category[] = [
  {
    id: 'outboards',
    name: 'Outboard Motors & Parts',
    blurb:
      'New and repower outboards plus the propellers, impellers, filters and service parts to keep them running.',
    icon: 'boat',
    examples: ['Outboard engines', 'Propellers', 'Water pumps', 'Fuel systems', 'Service kits'],
  },
  {
    id: 'hardware',
    name: 'Boat Hardware & Rigging',
    blurb:
      'Stainless cleats, rails, hinges, steering and control cables, the fittings that hold a vessel together.',
    icon: 'wrench',
    examples: ['Cleats & rails', 'Steering systems', 'Control cables', 'Fasteners', 'Bilge pumps'],
  },
  {
    id: 'electronics',
    name: 'Electronics & Navigation',
    blurb:
      'Chartplotters, fishfinders, VHF radios and stereo systems from the brands captains trust.',
    icon: 'gps',
    examples: ['GPS / chartplotters', 'Fishfinders', 'VHF radios', 'Batteries', 'Marine audio'],
  },
  {
    id: 'safety',
    name: 'Safety & Life-Saving',
    blurb:
      'Everything you need to pass inspection and get home, life jackets, flares, extinguishers and first aid.',
    icon: 'shield',
    examples: ['Life jackets (PFDs)', 'Flares & signals', 'Fire extinguishers', 'EPIRBs', 'First aid'],
  },
  {
    id: 'maintenance',
    name: 'Paint & Maintenance',
    blurb:
      'Antifouling paint, resins, sealants and cleaners to protect your investment against sun and salt.',
    icon: 'sparkle',
    examples: ['Antifouling paint', 'Epoxy & resin', 'Sealants', 'Waxes & cleaners', 'Zincs / anodes'],
  },
  {
    id: 'anchoring',
    name: 'Anchoring & Dock Lines',
    blurb:
      'Anchors, chain, rope, fenders and dock hardware sized for skiffs to commercial vessels.',
    icon: 'anchor',
    examples: ['Anchors', 'Chain & rode', 'Dock lines', 'Fenders', 'Buoys'],
  },
];

export const fishingCategories: Category[] = [
  {
    id: 'rods',
    name: 'Rods & Reels',
    blurb:
      'Spinning, conventional and fly combos built for flats, reef and blue-water fishing in Belize.',
    icon: 'rod',
    examples: ['Spinning reels', 'Conventional reels', 'Fly reels', 'Rods & combos', 'Rod holders'],
  },
  {
    id: 'tackle',
    name: 'Tackle & Terminal',
    blurb:
      'Hooks, leaders, swivels, weights and rigs, the terminal tackle that turns bites into catches.',
    icon: 'anchor',
    examples: ['Hooks', 'Leaders & wire', 'Swivels & snaps', 'Sinkers', 'Rig kits'],
  },
  {
    id: 'lures',
    name: 'Lures & Bait',
    blurb:
      'Soft plastics, hard baits, jigs and fresh, frozen and live bait for every target species.',
    icon: 'fish',
    examples: ['Soft plastics', 'Hard baits', 'Jigs & spoons', 'Flies', 'Live & frozen bait'],
  },
  {
    id: 'line',
    name: 'Line & Braid',
    blurb:
      'Monofilament, fluorocarbon and braid in the strengths and colors that match your reels.',
    icon: 'compass',
    examples: ['Braid', 'Monofilament', 'Fluorocarbon', 'Fly line', 'Backing'],
  },
  {
    id: 'coolers',
    name: 'Coolers & Storage',
    blurb:
      'Heavy-duty coolers, dry bags and tackle storage that survive the sun, salt and long runs.',
    icon: 'truck',
    examples: ['Hard coolers', 'Soft coolers', 'Dry bags', 'Tackle boxes', 'Bait wells'],
  },
  {
    id: 'apparel',
    name: 'Apparel & Sun Gear',
    blurb:
      'Performance shirts, gloves, buffs and polarized eyewear to fish comfortably all day.',
    icon: 'star',
    examples: ['Performance shirts', 'Sun gloves', 'Buffs & hats', 'Polarized sunglasses', 'Footwear'],
  },
];

export const divingCategories: Category[] = [
  {
    id: 'regulators',
    name: 'Regulators & BCDs',
    blurb:
      'Regulators, octopuses and buoyancy compensators to breathe easy and stay balanced at depth.',
    icon: 'gps',
    examples: ['Regulators', 'Octopus / alt-air', 'BCDs', 'Dive computers', 'Consoles'],
  },
  {
    id: 'masks',
    name: 'Masks, Fins & Snorkels',
    blurb:
      'Snorkel and scuba masks, fins and snorkels for divers, spearos and reef swimmers.',
    icon: 'compass',
    examples: ['Dive masks', 'Snorkels', 'Open & closed-heel fins', 'Mask straps', 'Anti-fog'],
  },
  {
    id: 'wetsuits',
    name: 'Wetsuits & Exposure',
    blurb:
      'Wetsuits, rash guards, boots and gloves to keep you comfortable on long dives.',
    icon: 'shield',
    examples: ['Wetsuits', 'Rash guards', 'Dive boots', 'Gloves', 'Hoods'],
  },
  {
    id: 'tanks',
    name: 'Tanks & Accessories',
    blurb:
      'Cylinders, gauges, weights and the hardware that keeps your kit dive-ready.',
    icon: 'anchor',
    examples: ['Cylinders', 'Tank bands', 'Weights', 'Gauges', 'O-rings & tools'],
  },
  {
    id: 'spearfishing',
    name: 'Spearfishing',
    blurb:
      'Spearguns, pole spears and rigging for free-dive and scuba spearfishing on the reef.',
    icon: 'fish',
    examples: ['Spearguns', 'Pole spears', 'Shafts & tips', 'Float lines', 'Reels'],
  },
  {
    id: 'safety',
    name: 'Dive Safety',
    blurb:
      'SMBs, lights, knives and signalling gear so every dive ends the way it should.',
    icon: 'shield',
    examples: ['Surface markers (SMBs)', 'Dive lights', 'Dive knives', 'Whistles', 'Reels & spools'],
  },
];

export const departments = {
  marine: {
    id: 'marine',
    title: 'Marine Supplies',
    href: '/marine-supplies',
    tagline: 'Rigging, parts & gear to keep your vessel on the water',
    categories: marineCategories,
  },
  fishing: {
    id: 'fishing',
    title: 'Fishing Supplies',
    href: '/fishing-supplies',
    tagline: 'Tackle & gear for flats, reef and blue-water anglers',
    categories: fishingCategories,
  },
  diving: {
    id: 'diving',
    title: 'Diving Supplies',
    href: '/diving-supplies',
    tagline: 'Scuba, free-dive & spearfishing gear for Belize’s reef',
    categories: divingCategories,
  },
} as const;

export type DepartmentId = keyof typeof departments;

const categoryLists: Record<DepartmentId, Category[]> = {
  marine: marineCategories,
  fishing: fishingCategories,
  diving: divingCategories,
};

export function categoryName(dept: DepartmentId, id: string): string {
  return categoryLists[dept].find((c) => c.id === id)?.name ?? id;
}
