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
    name: 'Anchors & Rope',
    blurb:
      'Anchors, chain, swivels and rope sized to hold your boat in Belize sand and grass.',
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
      'Spinning and conventional reels, rods and rod-and-reel combos for flats, reef and blue-water fishing in Belize.',
    icon: 'rod',
    examples: ['Spinning reels', 'Conventional reels', 'Rods', 'Rod & reel combos'],
    image: '/media/fishing/spinning-reel.jpg',
  },
  {
    id: 'line',
    name: 'Line & Leader',
    blurb:
      'Monofilament and braided fishing line plus wire leader in the strengths anglers rely on.',
    icon: 'compass',
    examples: ['Monofilament', 'Braided line', 'Wire leader'],
    image: '/media/fishing/braided-line.jpg',
  },
  {
    id: 'tackle',
    name: 'Tackle & Terminal',
    blurb:
      'Hooks, swivels, sinkers and terminal tackle, the bits that turn bites into catches.',
    icon: 'anchor',
    examples: ['Hooks', 'Swivels', 'Sinkers', 'Leaders'],
    image: '/media/fishing/swivels.jpg',
  },
  {
    id: 'lures',
    name: 'Lures',
    blurb:
      'Hard baits, minnows and trolling lures in proven colours for local target species.',
    icon: 'fish',
    examples: ['Minnow lures', 'Trolling lures', 'Skirts'],
    image: '/media/fishing/lure-firetiger.jpg',
  },
  {
    id: 'nets',
    name: 'Cast Nets',
    blurb:
      'Cast nets for catching fresh bait, in the mesh sizes and weights that work Belize’s flats.',
    icon: 'waves',
    examples: ['Cast nets', 'Bait nets'],
    image: '/media/fishing/cast-net.jpg',
  },
  {
    id: 'accessories',
    name: 'Tackle Boxes & Accessories',
    blurb:
      'Tackle boxes, gaff hooks and the accessories that keep your gear organised and ready.',
    icon: 'tag',
    examples: ['Tackle boxes', 'Gaff hooks'],
    image: '/media/fishing/tackle-box.jpg',
  },
];

export const divingCategories: Category[] = [
  {
    id: 'masks',
    name: 'Masks & Snorkels',
    blurb:
      'Dive and snorkel masks and mask-and-snorkel sets, including full-face snorkel masks.',
    icon: 'compass',
    examples: ['Dive masks', 'Snorkels', 'Mask & snorkel sets', 'Full-face masks'],
    image: '/media/diving/mask-snorkel-set.jpg',
  },
  {
    id: 'fins',
    name: 'Fins & Footwear',
    blurb:
      'Fins and dive booties for free-diving, spearfishing and reef swimming.',
    icon: 'boat',
    examples: ['Fins', 'Dive booties'],
    image: '/media/diving/fins.jpg',
  },
  {
    id: 'spearfishing',
    name: 'Spearfishing Equipment',
    blurb:
      'Band-powered spearguns, barbed poles and shafts for free-dive spearfishing on the reef.',
    icon: 'fish',
    examples: ['Spearguns', 'Barbed poles', 'Shafts'],
    image: '/media/diving/speargun.jpg',
  },
  {
    id: 'parts',
    name: 'Replacement Parts & Accessories',
    blurb:
      'Speargun bands, barbs and replacement surgical tubing to keep your gear reef-ready.',
    icon: 'wrench',
    examples: ['Speargun bands', 'Barbs', 'Surgical tubing'],
    image: '/media/diving/speargun-band.jpg',
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
    tagline: 'Snorkelling, free-dive & spearfishing gear for Belize’s reef',
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
