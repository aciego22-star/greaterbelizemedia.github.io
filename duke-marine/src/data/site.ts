/**
 * Central site configuration for Duke Marine.
 * ---------------------------------------------------------------------------
 * Everything that a non-developer might want to change (contact details, hours,
 * navigation, social links, brand copy) lives here so real values can be
 * dropped in without touching page markup.
 *
 * TODO (client): replace the PLACEHOLDER values below with real details.
 */

export const site = {
  name: 'Duke Marine',
  legalName: 'Duke Marine',
  tagline: 'Fishing. Diving. Boat Supplies.',
  slogan: 'For all your marine needs.',
  description:
    'Duke Marine is Belize’s one-stop shop for marine parts, fishing and diving supplies, sales, parts and service for anglers, divers, captains and resorts. On the Philip Goldson Highway, Belize City.',
  // Domain matches the business email (rduke@dukemarinebz.com). Update if the
  // final domain differs. Powers canonical URLs, sitemap and social cards.
  url: 'https://www.dukemarinebz.com',
  phoneDisplay: '(+501) 223-0319',
  phoneHref: '+5012230319',
  whatsapp: '5016287395',
  email: 'rduke@dukemarinebz.com',
  salesEmail: 'dukemarine@btl.net',
  address: {
    line1: 'Mile 4½ Philip Goldson Highway',
    line2: '',
    city: 'Belize City',
    region: 'Belize District',
    country: 'Belize',
    // Approx. coords for Mile 4.5 Philip Goldson Hwy, refine to the exact spot.
    lat: 17.5312,
    lng: -88.2405,
    mapQuery: 'Duke Marine, Philip Goldson Highway, Belize City, Belize',
  },
  hours: [
    { day: 'Monday - Friday', time: '8:00 AM - 5:00 PM' },
    { day: 'Saturday', time: '8:00 AM - 12:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
  // Google rating snapshot, refresh periodically.
  rating: 4.3,
  reviews: 44,
  social: {
    facebook: 'https://www.facebook.com/share/1Ayxu9FrNn/?mibextid=wwXIfr',
    instagram: 'https://www.instagram.com/dukemarine.bz',
    youtube: '',
  },
} as const;

export type NavChild = { label: string; href: string; desc?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const nav: NavItem[] = [
  {
    label: 'Marine',
    href: '/marine-supplies',
    children: [
      { label: 'Boat Hardware & Rigging', href: '/marine-supplies#hardware', desc: 'Cleats, rails, fittings' },
      { label: 'Electronics & Navigation', href: '/marine-supplies#electronics', desc: 'GPS, sounders, VHF' },
      { label: 'Safety & Life-Saving', href: '/marine-supplies#safety', desc: 'PFDs, flares, extinguishers' },
      { label: 'Paint & Maintenance', href: '/marine-supplies#maintenance', desc: 'Anti-foul, resins, care' },
      { label: 'Anchoring & Dock Lines', href: '/marine-supplies#anchoring', desc: 'Anchors, rode, fenders' },
    ],
  },
  {
    label: 'Fishing',
    href: '/fishing-supplies',
    children: [
      { label: 'Rods & Reels', href: '/fishing-supplies#rods', desc: 'Spinning, conventional, fly' },
      { label: 'Tackle & Terminal', href: '/fishing-supplies#tackle', desc: 'Hooks, leaders, swivels' },
      { label: 'Lures & Bait', href: '/fishing-supplies#lures', desc: 'Live, frozen, artificial' },
      { label: 'Line & Braid', href: '/fishing-supplies#line', desc: 'Mono, fluoro, braid' },
      { label: 'Coolers & Storage', href: '/fishing-supplies#coolers', desc: 'Ice chests, bags' },
      { label: 'Apparel & Sun Gear', href: '/fishing-supplies#apparel', desc: 'Performance wear' },
    ],
  },
  {
    label: 'Diving',
    href: '/diving-supplies',
    children: [
      { label: 'Regulators & BCDs', href: '/diving-supplies#regulators', desc: 'Breathe & buoyancy' },
      { label: 'Masks, Fins & Snorkels', href: '/diving-supplies#masks', desc: 'Snorkel & scuba' },
      { label: 'Wetsuits & Exposure', href: '/diving-supplies#wetsuits', desc: 'Suits, boots, gloves' },
      { label: 'Tanks & Accessories', href: '/diving-supplies#tanks', desc: 'Cylinders, gauges' },
      { label: 'Spearfishing', href: '/diving-supplies#spearfishing', desc: 'Guns, pole spears' },
      { label: 'Dive Safety', href: '/diving-supplies#safety', desc: 'SMBs, lights, knives' },
    ],
  },
  { label: 'Brands', href: '/brands' },
  { label: 'Blog', href: '/blog' },
  { label: 'Services', href: '/services' },
  {
    label: 'Company',
    href: '/about',
    children: [
      { label: 'About Duke Marine', href: '/about', desc: 'Our story & leadership' },
      { label: 'Gallery & Video', href: '/gallery', desc: 'Photos & video from the shop' },
      { label: 'Careers', href: '/careers', desc: 'Join the crew' },
      { label: 'Contact', href: '/contact', desc: 'Visit or message us' },
    ],
  },
];

export const primaryCta = { label: 'Request a Quote', href: '/contact#quote' };
