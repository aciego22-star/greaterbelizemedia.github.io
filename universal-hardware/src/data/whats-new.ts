/**
 * What's New at Universal: sales, events and clinics, newest first.
 *
 * Taken from the posts on Universal Hardware's News / Promotions page
 * (universalhardware.bz/news, read 31 October 2026). Each post there is a set of
 * flyers, so the dates, places and details below are read from each post's main
 * flyer, which is shown alongside (resized by scripts/build-whats-new-flyers.py).
 * To add an event, put its flyer in public/site-images/whats-new/ and add an
 * entry at the top of NEWS.
 */
import type { BranchId } from './branches';
import type { SiteImage } from './site-images';

const UPLOADS = 'https://universalhardware.bz/news/wp-content/uploads/';
const flyer = (key: string, width: number, height: number, alt: string, upload: string): SiteImage => ({
  src: `site-images/whats-new/${key}.jpg`,
  webp: `site-images/whats-new/${key}.webp`,
  width,
  height,
  alt,
  sourceUrl: UPLOADS + upload,
});

export type NewsKind = 'Sale' | 'Event' | 'Clinic';

export interface NewsItem {
  id: string;
  kind: NewsKind;
  title: string;
  /** ISO dates, first and last day. */
  start: string;
  end: string;
  /** Shown as written, e.g. "21–23 May 2026". */
  when: string;
  where: string;
  /** Date and place in Spanish, for Universal AI's replies (the page itself uses the site dictionary). */
  es: { when: string; where: string };
  branch?: BranchId;
  summary: string;
  details: string[];
  brands: string[];
  image: SiteImage;
  /** A second flyer for an event held alongside, such as a Makita Clinic. */
  extra?: { title: string; summary: string; image: SiteImage };
  postUrl: string;
}

const MAKITA_CLINIC =
  'Free maintenance for Makita tools: a full cleaning, plus new carbon brushes and fresh grease if your tool needs them.';

export const NEWS: NewsItem[] = [
  {
    id: 'mega-sale-2026',
    kind: 'Sale',
    title: 'Universal Mega Sale 2026',
    start: '2026-05-21',
    end: '2026-05-23',
    when: '21–23 May 2026',
    where: 'Belize City branch, Chetumal Boulevard',
    es: { when: 'del 21 al 23 de mayo de 2026', where: 'sucursal de Ciudad de Belice, Chetumal Boulevard' },
    branch: 'belize-city',
    summary: 'Three days of sale prices across the store, with a Makita Clinic Event running alongside.',
    details: [
      'Motorcycles, power tools, woodworking machines, outdoor power equipment, generators, lighting and appliances on sale.',
      'For walk-in customers only.',
    ],
    brands: ['Sankey', 'Makita', 'Hoteche', 'Echo', 'Lifan'],
    image: flyer('mega-sale-2026', 1200, 627, 'Mega Sale in Belize City flyer, May 21, 22 and 23, with Sankey air conditioning, a Makita drill kit, a Hoteche air compressor, an Echo chainsaw and a Lifan motorcycle', 'Mega-Sale-LinkedIn.jpg'),
    extra: {
      title: 'Makita Clinic Event',
      summary: MAKITA_CLINIC,
      image: flyer('makita-clinic-mega-sale-2026', 800, 800, 'Makita Clinic Event flyer for the Belize City Mega Sale: free maintenance', 'Makita-Clinic.jpg'),
    },
    postUrl: 'https://universalhardware.bz/news/2026/04/universal-mega-sale-2026/',
  },
  {
    id: 'expo-2026',
    kind: 'Event',
    title: 'Spanish Lookout Commercial Industrial Expo 2026',
    start: '2026-03-13',
    end: '2026-03-14',
    when: '13–14 March 2026',
    where: 'Countryside Park, Spanish Lookout',
    es: { when: '13 y 14 de marzo de 2026', where: 'Countryside Park, Spanish Lookout' },
    summary: 'Universal Hardware had a booth at the Expo, showing tools, motorcycles, generators, pumps and more.',
    details: [
      'Booth visitors received discount coupons, valid on any in-stock item at the Spanish Lookout and Belize City stores until 30 April 2026.',
      'No sales took place on the Expo grounds.',
    ],
    brands: ['Lifan', 'Makita', 'Shindaiwa', 'Meilun', 'Sankey', 'Echo', 'Hoteche', 'Knova', 'Wasuns'],
    image: flyer('expo-2026', 1200, 457, 'Spanish Lookout Commercial Industrial Expo 2026 flyer: March 13 and 14, Countryside Park, Spanish Lookout', 'EXPO-2026-FB-COVER-2.jpg'),
    postUrl: 'https://universalhardware.bz/news/2026/03/spanish-lookout-commercial-industrial-expo-2026/',
  },
  {
    id: 'friends-family-2026',
    kind: 'Sale',
    title: 'Friends & Family Sale 2026',
    start: '2026-02-19',
    end: '2026-02-21',
    when: '19–21 February 2026',
    where: 'Spanish Lookout branch, Center Avenue',
    es: { when: 'del 19 al 21 de febrero de 2026', where: 'sucursal de Spanish Lookout, Center Avenue' },
    branch: 'spanish-lookout',
    summary: 'Huge discounts, food and great raffles at the main branch, with a Makita Clinic Event on all three days.',
    details: ['Motorcycles, power tools, woodworking machines, lawn and garden equipment, lighting and appliances on sale.'],
    brands: ['Lifan', 'Shindaiwa', 'Knova', 'Sankey', 'Wasuns', 'Makita'],
    image: flyer('friends-family-2026', 800, 799, 'Friends & Family Sale in Spanish Lookout flyer, February 19 to 21, 2026: huge discounts, food and great raffles', 'ff26-main-flyer.jpeg'),
    extra: {
      title: 'Makita Clinic Event',
      summary: MAKITA_CLINIC,
      image: flyer('makita-clinic-friends-family-2026', 800, 800, 'Makita Clinic Event flyer, February 19 to 21, 2026, at the Friends & Family Sale: free maintenance', 'MakitaClinic-feb2026.jpg'),
    },
    postUrl: 'https://universalhardware.bz/news/2026/01/friends-and-family-day-2026/',
  },
  {
    id: 'gst-holiday-2025',
    kind: 'Sale',
    title: 'GST Holiday Sale',
    start: '2025-12-06',
    end: '2025-12-20',
    when: '6 and 20 December 2025',
    where: 'Spanish Lookout and Belize City',
    es: { when: '6 y 20 de diciembre de 2025', where: 'Spanish Lookout y Ciudad de Belice' },
    summary: 'On both days, 12.5% GST off plus a further 12.5% discount, at both branches.',
    details: ['Outdoor power equipment, power tools, air conditioning, paint, flooring, ceiling fans and ladders featured.'],
    brands: ['Shindaiwa', 'Sankey', 'Makita', 'Hoteche', 'GreenSheen', 'Cub Cadet', 'Cali', 'Hunter', 'Werner'],
    image: flyer('gst-holiday-2025', 800, 799, 'GST Holiday Sale flyer, December 6 and 20: GST 12.5% off plus a 12.5% discount', 'a-2025.jpeg'),
    postUrl: 'https://universalhardware.bz/news/2025/12/gst-holiday-2025/',
  },
  {
    id: 'mega-sale-2025',
    kind: 'Sale',
    title: 'Universal Mega Sale 2025',
    start: '2025-05-15',
    end: '2025-05-17',
    when: '15–17 May 2025',
    where: 'Belize City branch, Chetumal Boulevard',
    es: { when: 'del 15 al 17 de mayo de 2025', where: 'sucursal de Ciudad de Belice, Chetumal Boulevard' },
    branch: 'belize-city',
    summary: 'Sale prices across the store and a Mega Raffle.',
    details: ['For walk-in customers only.'],
    brands: ['Cali', 'Makita', 'Shindaiwa', 'Hoteche', 'Sankey', 'Lifan'],
    image: flyer('mega-sale-2025', 800, 800, 'Mega Sale in Belize City flyer, May 15, 16 and 17: win big in our Mega Raffle', 'Mega-Sale-INSTA-FB.jpg'),
    postUrl: 'https://universalhardware.bz/news/2025/04/universal-mega-sale-2025/',
  },
  {
    id: 'friends-family-2025',
    kind: 'Sale',
    title: 'Friends & Family Sale 2025',
    start: '2025-02-27',
    end: '2025-03-01',
    when: '27 February – 1 March 2025',
    where: 'Spanish Lookout branch, Center Avenue',
    es: { when: 'del 27 de febrero al 1 de marzo de 2025', where: 'sucursal de Spanish Lookout, Center Avenue' },
    branch: 'spanish-lookout',
    summary: 'Everything on deep discounts, with food and drinks and grand raffles galore.',
    details: ['Final grand raffle on 1 March at 5 PM.'],
    brands: ['Hoteche', 'Shindaiwa', 'Cali', 'Lifan', 'Sankey', 'Makita'],
    image: flyer('friends-family-2025', 1200, 457, 'Friends & Family Sale in Spanish Lookout flyer, February 27, 28 and March 1, 2025: food and drinks, grand raffles galore', 'FB-Cover-FF-Sale-2025.jpg'),
    postUrl: 'https://universalhardware.bz/news/2025/02/friends-and-family-day-2025/',
  },
];

/** Events Universal holds every year, from the dates on its flyers. */
export const YEARLY = [
  {
    title: 'Friends & Family Sale',
    when: 'Usually in February',
    where: 'Spanish Lookout branch',
    note: 'Discounts, food and raffles over three days: 22–24 February 2024, 27 February – 1 March 2025 and 19–21 February 2026.',
  },
  {
    title: 'Universal Mega Sale',
    when: 'Usually in May',
    where: 'Belize City branch',
    note: 'Three days of sale prices for walk-in customers. Held every May since 2023.',
  },
];
