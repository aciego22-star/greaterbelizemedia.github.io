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
  tagline: 'Belize’s marine & fishing supply headquarters',
  description:
    'Duke Marine is Belize’s trusted source for marine and fishing supplies — outboard parts, tackle, safety gear and commercial provisioning for anglers, captains, resorts and fleets.',
  // Update before deploy; used for canonical URLs, sitemap and social cards.
  url: 'https://www.dukemarine.com',
  // PLACEHOLDER contact details — swap for the real ones.
  phoneDisplay: '(+501) 000-0000',
  phoneHref: '+5010000000',
  whatsapp: '5010000000',
  email: 'info@dukemarine.com',
  salesEmail: 'sales@dukemarine.com',
  address: {
    line1: 'Marine Parade',
    line2: '',
    city: 'Belize City',
    region: 'Belize District',
    country: 'Belize',
    // Approx. Belize City coords — update to the exact storefront.
    lat: 17.4979,
    lng: -88.1962,
    mapQuery: 'Belize City, Belize',
  },
  hours: [
    { day: 'Monday – Friday', time: '7:30 AM – 6:00 PM' },
    { day: 'Saturday', time: '7:30 AM – 4:00 PM' },
    { day: 'Sunday', time: 'Closed' },
  ],
  founded: 1998,
  social: {
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    youtube: 'https://youtube.com/',
  },
} as const;

export type NavChild = { label: string; href: string; desc?: string };
export type NavItem = { label: string; href: string; children?: NavChild[] };

export const nav: NavItem[] = [
  {
    label: 'Marine Supplies',
    href: '/marine-supplies',
    children: [
      { label: 'Outboard Motors & Parts', href: '/marine-supplies#outboards', desc: 'Engines, props, service parts' },
      { label: 'Boat Hardware & Rigging', href: '/marine-supplies#hardware', desc: 'Cleats, rails, fittings' },
      { label: 'Electronics & Navigation', href: '/marine-supplies#electronics', desc: 'GPS, sounders, VHF' },
      { label: 'Safety & Life-Saving', href: '/marine-supplies#safety', desc: 'PFDs, flares, extinguishers' },
      { label: 'Paint & Maintenance', href: '/marine-supplies#maintenance', desc: 'Anti-foul, resins, care' },
      { label: 'Anchoring & Dock Lines', href: '/marine-supplies#anchoring', desc: 'Anchors, rode, fenders' },
    ],
  },
  {
    label: 'Fishing Supplies',
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
  { label: 'Brands', href: '/brands' },
  { label: 'Commercial', href: '/commercial' },
  { label: 'Services', href: '/services' },
  {
    label: 'Company',
    href: '/about',
    children: [
      { label: 'About Duke Marine', href: '/about', desc: 'Our story & leadership' },
      { label: 'News & Events', href: '/news', desc: 'Latest from the shop' },
      { label: 'Careers', href: '/careers', desc: 'Join the crew' },
      { label: 'Contact', href: '/contact', desc: 'Visit or message us' },
    ],
  },
];

export const primaryCta = { label: 'Request a Quote', href: '/contact#quote' };
