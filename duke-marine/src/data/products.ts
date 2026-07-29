/**
 * Product catalog (placeholder data).
 * ---------------------------------------------------------------------------
 * Add, remove or edit entries here, each becomes a catalog card and its own
 * detail page at /products/<slug>. Prices are indicative "from" figures in BZD
 * and can be omitted. `department` + `category` must match src/data/catalog.ts.
 *
 * TODO (client): replace with real products, brands, prices and photos.
 */
export type Department = 'marine' | 'fishing' | 'diving';

export type Product = {
  slug: string;
  name: string;
  department: Department;
  category: string;
  brand?: string;
  blurb: string;
  description?: string;
  /** Optional real product photo in public/media/products/. Falls back to a designed placeholder. */
  image?: string;
  /** Pricing is intentionally NOT displayed anywhere; kept optional so data need not change. */
  priceFrom?: number;
  unit?: string;
  specs?: { label: string; value: string }[];
  icon: string;
  seed?: string;
  featured?: boolean;
};

export const products: Product[] = [
  // ---- Marine -----------------------------------------------------------
  {
    slug: 'chartplotter-7-touch',
    name: '7" Touchscreen Chartplotter / Fishfinder',
    department: 'marine',
    category: 'electronics',
    brand: 'Garmin',
    blurb: 'Combo GPS and CHIRP sonar with bright, glove-friendly touchscreen and Belize coastal charts.',
    description:
      'Find the fish and find your way home. High-visibility 7" touchscreen, CHIRP sonar, and preloaded coastal charting, a favourite for guides working the flats and reef.',
    priceFrom: 1980,
    unit: 'each',
    specs: [
      { label: 'Display', value: '7" touch' },
      { label: 'Sonar', value: 'CHIRP' },
      { label: 'GPS', value: '10 Hz' },
    ],
    icon: 'gps',
    seed: 'plotter1',
    featured: true,
  },
  {
    slug: 'offshore-life-jacket',
    name: 'Offshore Life Jacket (Type I PFD)',
    department: 'marine',
    category: 'safety',
    brand: 'Mustang',
    blurb: 'High-buoyancy, high-visibility PFD rated for offshore conditions and long exposure.',
    priceFrom: 130,
    unit: 'each',
    specs: [
      { label: 'Type', value: 'I, Offshore' },
      { label: 'Sizes', value: 'Adult / Child' },
    ],
    icon: 'shield',
    seed: 'pfd1',
  },
  {
    slug: 'antifouling-paint-gal',
    name: 'Pettit Trinidad Antifouling Paint, Gallon',
    department: 'marine',
    category: 'maintenance',
    brand: 'Pettit',
    blurb: 'Hard-wearing antifouling that keeps hulls clean through Caribbean fouling seasons.',
    priceFrom: 260,
    unit: 'per gallon',
    specs: [
      { label: 'Coverage', value: '~400 sq ft' },
      { label: 'Type', value: 'Hard / ablative' },
      { label: 'Colors', value: 'Blue / Black / Red' },
    ],
    icon: 'sparkle',
    seed: 'paint1',
    featured: true,
  },
  {
    slug: 'marine-stereo-bluetooth',
    name: 'Bluetooth Marine Stereo & Speakers',
    department: 'marine',
    category: 'electronics',
    brand: 'BOSS Audio',
    blurb: 'Weatherproof marine head unit and speakers built to take sun, spray and salt.',
    priceFrom: 320,
    unit: 'per set',
    specs: [
      { label: 'Connectivity', value: 'Bluetooth / USB' },
      { label: 'Rating', value: 'Weatherproof' },
    ],
    icon: 'gps',
    seed: 'stereo1',
  },
  {
    slug: 'galvanized-anchor-kit',
    name: 'Galvanized Anchor & Rode Kit',
    department: 'marine',
    category: 'anchoring',
    brand: 'Duke Marine',
    blurb: 'Complete anchoring kit, anchor, chain, rope and shackles, sized and spliced in-store.',
    priceFrom: 340,
    unit: 'per kit',
    specs: [
      { label: 'Anchor', value: '13 lb galvanized' },
      { label: 'Chain', value: '6 ft, 5/16"' },
      { label: 'Rode', value: '150 ft, 1/2"' },
    ],
    icon: 'anchor',
    seed: 'anchor1',
    featured: true,
  },
  {
    slug: 'stainless-cleat-set',
    name: 'Stainless Steel Cleat Set',
    department: 'marine',
    category: 'hardware',
    brand: 'Sea-Dog',
    blurb: '316 stainless cleats that resist Caribbean salt, sold singly or as a rigging set.',
    priceFrom: 45,
    unit: 'each',
    icon: 'wrench',
    seed: 'cleat1',
  },
  {
    slug: 'dual-purpose-battery',
    name: 'Dual-Purpose Marine Battery',
    department: 'marine',
    category: 'electronics',
    brand: 'Interstate',
    blurb: 'Starting and deep-cycle in one, dependable cranking plus reserve for electronics.',
    priceFrom: 420,
    unit: 'each',
    icon: 'gps',
    seed: 'battery1',
  },

  // ---- Fishing ----------------------------------------------------------
  {
    slug: 'flats-spinning-combo',
    name: 'Flats Spinning Rod & Reel Combo',
    department: 'fishing',
    category: 'rods',
    brand: 'Shimano',
    blurb: 'Light, corrosion-tough spinning combo tuned for bonefish, permit and snook on the flats.',
    description:
      'Built for Belize’s world-class flats. A sealed, saltwater-ready reel on a fast-action rod, balanced, spooled and ready to fish when you walk out the door.',
    priceFrom: 560,
    unit: 'combo',
    specs: [
      { label: 'Reel size', value: '4000' },
      { label: 'Rod', value: "7'0\" medium-fast" },
      { label: 'Line', value: 'Up to 20 lb' },
    ],
    icon: 'rod',
    seed: 'combo1',
    featured: true,
  },
  {
    slug: 'offshore-conventional-reel',
    name: 'Offshore Conventional Reel',
    department: 'fishing',
    category: 'rods',
    brand: 'Penn',
    blurb: 'Sealed drag and big line capacity for trolling and bottom fishing the blue water.',
    priceFrom: 780,
    unit: 'each',
    specs: [
      { label: 'Drag', value: '30 lb sealed' },
      { label: 'Bearings', value: '6 stainless' },
    ],
    icon: 'fish',
    seed: 'reel1',
    featured: true,
  },
  {
    slug: 'braided-line-spool',
    name: 'Braided Line, Bulk Spool',
    department: 'fishing',
    category: 'line',
    brand: 'PowerPro',
    blurb: 'Thin-diameter, high-strength braid spooled to your reel on our in-store line station.',
    priceFrom: 90,
    unit: 'per spool',
    specs: [
      { label: 'Strength', value: '10-80 lb' },
      { label: 'Colors', value: 'Moss / Blue / Hi-Vis' },
    ],
    icon: 'compass',
    seed: 'braid1',
  },
  {
    slug: 'tackle-terminal-kit',
    name: 'Reef & Flats Terminal Tackle Kit',
    department: 'fishing',
    category: 'tackle',
    brand: 'Mustad',
    blurb: 'Curated hooks, leaders, swivels and weights for reef and flats fishing in one box.',
    priceFrom: 65,
    unit: 'per kit',
    icon: 'anchor',
    seed: 'tackle1',
  },
  {
    slug: 'soft-plastic-lure-pack',
    name: 'Soft Plastic Lure Variety Pack',
    department: 'fishing',
    category: 'lures',
    brand: 'Z-Man',
    blurb: 'Durable soft plastics in proven local colors for snook, tarpon and jacks.',
    priceFrom: 28,
    unit: 'per pack',
    icon: 'fish',
    seed: 'lure1',
    featured: true,
  },
  {
    slug: 'rotomolded-cooler-45',
    name: 'Roto-Molded Cooler, 45 QT',
    department: 'fishing',
    category: 'coolers',
    brand: 'Calcutta',
    blurb: 'Bear-tough, long-ice-retention cooler that doubles as a casting platform.',
    priceFrom: 610,
    unit: 'each',
    specs: [
      { label: 'Capacity', value: '45 QT' },
      { label: 'Ice retention', value: 'Up to 7 days' },
    ],
    icon: 'truck',
    seed: 'cooler1',
  },
  {
    slug: 'performance-sun-shirt',
    name: 'UPF 50+ Performance Sun Shirt',
    department: 'fishing',
    category: 'apparel',
    brand: 'Pelagic',
    blurb: 'Breathable, quick-dry long-sleeve with UPF 50+ protection for all-day sun on the water.',
    priceFrom: 75,
    unit: 'each',
    icon: 'star',
    seed: 'shirt1',
  },
  {
    slug: 'polarized-fishing-sunglasses',
    name: 'Polarized Fishing Sunglasses',
    department: 'fishing',
    category: 'apparel',
    brand: 'Calcutta',
    blurb: 'Glare-cutting polarized lenses that help you spot fish on the flats and reef edges.',
    priceFrom: 90,
    unit: 'each',
    icon: 'compass',
    seed: 'glasses1',
  },

  // ---- Diving -----------------------------------------------------------
  {
    slug: 'scuba-regulator-set',
    name: 'Scuba Regulator & Octopus Set',
    department: 'diving',
    category: 'regulators',
    blurb: 'Balanced first and second stage with alternate air, serviced and ready for reef diving.',
    description:
      'A dependable regulator setup for Belize’s reef and wall dives. Comes with an alternate-air (octopus) second stage. We can service and pressure-test before you dive.',
    priceFrom: 950,
    unit: 'per set',
    specs: [
      { label: 'Stages', value: '1st + 2nd + octo' },
      { label: 'Ports', value: 'Balanced' },
    ],
    icon: 'gps',
    seed: 'reg1',
    featured: true,
  },
  {
    slug: 'dive-mask-fin-snorkel',
    name: 'Mask, Fin & Snorkel Set',
    department: 'diving',
    category: 'masks',
    blurb: 'Low-volume mask, open-heel fins and dry snorkel, a complete set for scuba or free-diving.',
    priceFrom: 220,
    unit: 'per set',
    icon: 'compass',
    seed: 'mask1',
  },
  {
    slug: 'shorty-wetsuit-3mm',
    name: '3mm Shorty Wetsuit',
    department: 'diving',
    category: 'wetsuits',
    blurb: 'Lightweight 3mm neoprene that’s ideal for warm Caribbean water and long reef dives.',
    priceFrom: 280,
    unit: 'each',
    specs: [
      { label: 'Thickness', value: '3 mm' },
      { label: 'Sizes', value: 'S - XXL' },
    ],
    icon: 'shield',
    seed: 'wetsuit1',
  },
  {
    slug: 'reef-speargun',
    name: 'Reef Speargun',
    department: 'diving',
    category: 'spearfishing',
    blurb: 'Balanced speargun for free-dive and scuba spearfishing on Belize’s reef and flats.',
    priceFrom: 340,
    unit: 'each',
    icon: 'fish',
    seed: 'spear1',
    featured: true,
  },
  {
    slug: 'surface-marker-buoy',
    name: 'Surface Marker Buoy (SMB) & Reel',
    department: 'diving',
    category: 'safety',
    blurb: 'High-visibility SMB with finger reel to signal boats and mark your ascent.',
    priceFrom: 120,
    unit: 'per set',
    icon: 'shield',
    seed: 'smb1',
  },
];

export const featuredProducts = products.filter((p) => p.featured);

export function productsByDepartment(dept: Department) {
  return products.filter((p) => p.department === dept);
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
