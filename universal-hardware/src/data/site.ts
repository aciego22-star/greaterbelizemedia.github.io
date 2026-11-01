export const SITE = {
  name: 'Universal Hardware',
  conceptTitle: 'Universal Hardware — Independent Website Concept',
  author: 'Austere Automations',
  demoDate: '28 October 2026',
  demoDateISO: '2026-10-28',
  officialUrl: 'https://universalhardware.bz/',
  disclaimer:
    'Independent concept demonstration by Austere Automations. Not commissioned, approved or affiliated with Universal Hardware Company Ltd.',
  conceptStatement:
    'Independent website concept prepared by Austere Automations for presentation purposes. Not affiliated with or endorsed by Universal Hardware. Product information is illustrative and must be confirmed with the retailer.',
  nothingSent: 'Concept demonstration only. Nothing has been sent or submitted.',
};

/** `short` is shown in the desktop bar when the full label does not fit. */
export const NAV: { href: string; label: string; short?: string }[] = [
  { href: '/shop/', label: 'Shop' },
  { href: '/products/', label: 'Products' },
  { href: '/brands/', label: 'Brands' },
  { href: '/locations/', label: 'Locations' },
  { href: '/about/', label: 'About' },
  { href: '/whats-new/', label: "What's New at Universal", short: "What's New" },
];

/**
 * Universal Hardware's own social accounts, as linked from the Contact panel of
 * universalhardware.bz/about.html (read 1 November 2026). Direct WhatsApp uses
 * each branch's Sales line from src/data/branches.ts.
 */
export const SOCIAL = [
  { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/universalhardware.bz/' },
  { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/universalhardware_bz/' },
  { id: 'youtube', label: 'YouTube', href: 'https://www.youtube.com/channel/UC1iOB19Z3cxVEcv5ZBKv2OA' },
] as const;
