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
  /** Optional real category photo in public/media/products/. Falls back to a designed placeholder. */
  image?: string;
};

export const marineCategories: Category[] = [
  {
    id: 'anchors',
    name: 'Anchors & Rode',
    blurb:
      'Anchors, chain, swivels and rode sized to hold your boat in Belize sand and grass.',
    icon: 'anchor',
    examples: ['Fluke & claw anchors', 'Anchor chain', 'Galvanized swivels', 'Mushroom anchors'],
    image: '/media/products/danforth-hooker-anchor.jpg',
  },
  {
    id: 'dock',
    name: 'Rope, Fenders & Dock Lines',
    blurb:
      'Dock and mooring gear that takes the daily grind of tying up in salt water.',
    icon: 'waves',
    examples: ['Braided & twisted rope', 'Dock lines', 'Fenders', 'Mooring buoys'],
    image: '/media/products/polyform-buoys.jpg',
  },
  {
    id: 'bilge',
    name: 'Bilge Pumps & Plumbing',
    blurb:
      'Keep the water where it belongs with dependable Rule pumps and bilge gear.',
    icon: 'sparkle',
    examples: ['Rule bilge pumps', 'Float switches', 'Bilge absorbents', 'Hose & fittings'],
    image: '/media/products/2000gph-rule-bilge-pump.jpg',
  },
  {
    id: 'electrical',
    name: 'Electrical & Lighting',
    blurb:
      'Marine-grade switching, wiring and lighting wired to survive spray and sun.',
    icon: 'gps',
    examples: ['Switch panels', 'Battery switches', 'LED nav lights', 'Marine wire'],
    image: '/media/products/6-gang-rocker-switch-panel.jpg',
  },
  {
    id: 'hardware',
    name: 'Stainless Hardware & Rigging',
    blurb:
      '316 stainless cleats, chocks, hinges and fasteners that shrug off Caribbean salt.',
    icon: 'wrench',
    examples: ['Cleats & chocks', 'Bow eyes', 'Hinges', 'Bolts & screws'],
    image: '/media/products/12-cleat-ss.jpg',
  },
  {
    id: 'bimini',
    name: 'Bimini & Canvas',
    blurb:
      'Bimini frames, fittings and canvas to put shade over your center console.',
    icon: 'boat',
    examples: ['Bimini tops', 'Rail bases & fittings', 'Deck hinges', 'Jaw slides & caps'],
    image: '/media/products/carver-bimini-top.jpg',
  },
  {
    id: 'trailer',
    name: 'Trailer Parts',
    blurb:
      'Rollers, jacks, lights and hardware to get your boat to the ramp and back.',
    icon: 'truck',
    examples: ['Keel & bow rollers', 'Trailer jacks', 'Submersible lights', 'Winch straps'],
    image: '/media/products/fold-up-trailer-jack.jpg',
  },
  {
    id: 'fiberglass',
    name: 'Fiberglass & Repair',
    blurb:
      'Resin, matting and core for repairs and layups that last in the tropics.',
    icon: 'tag',
    examples: ['Resin', 'Chopped-strand mat', 'Woven roving', 'Structural core'],
    image: '/media/products/roving.jpg',
  },
  {
    id: 'propulsion',
    name: 'Propellers & Power',
    blurb:
      'Props, trolling motors and running gear to keep you moving on the water.',
    icon: 'compass',
    examples: ['Propellers', 'Trolling motors', 'Cutlass bearings', 'Prop hardware'],
    image: '/media/products/minn-kota-endura-36.jpg',
  },
  {
    id: 'safety',
    name: 'Safety & Life-Saving',
    blurb:
      'Coast Guard-style safety gear to pass inspection and get everyone home.',
    icon: 'shield',
    examples: ['Life vests (PFDs)', 'Fire extinguishers', 'Air horns', 'Life rings'],
    image: '/media/products/type-ii-life-vest.jpg',
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
