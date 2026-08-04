/**
 * Brands carried by Duke Marine.
 * ---------------------------------------------------------------------------
 * Real brand logos live in public/media/brands/<slug>.png. Each entry drives the
 * dedicated /brands page (logo + product type + write-up) and the featured strip
 * on the home page. `featured: true` marks the ones shown on the home page.
 */
export type Brand = {
  name: string;
  slug: string;
  /** Logo image in public/media/brands/ */
  logo: string;
  /** Set for logos designed on a dark background (shown on a dark tile). */
  dark?: boolean;
  /** Short product-type label, e.g. "Fishing reels". */
  category: string;
  /** Catchy, professional one-liner about the brand. */
  blurb: string;
  departments: ('marine' | 'fishing' | 'diving')[];
  featured?: boolean;
};

export const brands: Brand[] = [
  {
    name: 'Penn',
    slug: 'penn',
    logo: '/media/brands/penn.png',
    category: 'Fishing reels & rods',
    blurb:
      'A saltwater legend since 1932. From the offshore International and Fathom to the inshore Slammer and Spinfisher, Penn builds the sealed, hard-charging reels that stand up to Belize’s reef and blue water.',
    departments: ['fishing'],
    featured: true,
  },
  {
    name: 'Nomad Design',
    slug: 'nomad-design',
    logo: '/media/brands/nomad-design.png',
    dark: true,
    category: 'Lures & terminal tackle',
    blurb:
      'Australian bluewater lures born from the Nomad Sportfishing team. The famous DTX Minnow, Madscad and Gorilla-tough through-wire rigs keep swimming true after fish number fifty, from the flats to the tuna grounds.',
    departments: ['fishing'],
    featured: true,
  },
  {
    name: 'Awlgrip',
    slug: 'awlgrip',
    logo: '/media/brands/awlgrip.png',
    category: 'Topside coatings & finishes',
    blurb:
      'The gold standard in yacht finishes. An AkzoNobel marine brand, Awlgrip’s high-gloss polyurethane topcoats, primers and non-skid deliver a showroom shine that holds up to relentless tropical sun and salt.',
    departments: ['marine'],
    featured: true,
  },
  {
    name: 'Pettit',
    slug: 'pettit',
    logo: '/media/brands/pettit.png',
    category: 'Antifouling & marine paint',
    blurb:
      'American marine paint since 1888. Trinidad and water-based Hydrocoat antifouling, plus varnishes and primers, protect hulls against the barnacles, algae and hard growth of warm Caribbean water.',
    departments: ['marine'],
  },
  {
    name: 'Rule',
    slug: 'rule',
    logo: '/media/brands/rule.png',
    category: 'Bilge pumps & water management',
    blurb:
      'The name every boater knows for a dry bilge. A Xylem brand since 1965, Rule’s automatic, manual and livewell pumps are the benchmark other bilge pumps are measured against.',
    departments: ['marine'],
    featured: true,
  },
  {
    name: 'Ritchie Navigation',
    slug: 'ritchie',
    logo: '/media/brands/ritchie.png',
    category: 'Marine compasses',
    blurb:
      'Compasses that have pointed the way since 1850, when E.S. Ritchie invented the liquid-filled marine compass. Over 170 years on, Ritchie is still the industry leader for rugged, dead-accurate magnetic compasses.',
    departments: ['marine'],
    featured: true,
  },
  {
    name: 'Seachoice',
    slug: 'seachoice',
    logo: '/media/brands/seachoice.png',
    category: 'Marine hardware & accessories',
    blurb:
      'Made by boaters, for boaters. Since 1988 Seachoice has grown to more than 4,000 parts across 18 categories, from cleats, lighting and anchors to safety and electrical, the everyday gear that keeps a boat running.',
    departments: ['marine'],
  },
  {
    name: 'Marpac',
    slug: 'marpac',
    logo: '/media/brands/marpac.png',
    category: 'Navigation lights & hardware',
    blurb:
      'Compliance-grade boat hardware. Marpac’s USCG, ABYC and COLREG-certified LED navigation lights, electrical and fittings help you pass inspection and run safely after dark.',
    departments: ['marine'],
  },
];

export const featuredBrands = brands.filter((b) => b.featured);
