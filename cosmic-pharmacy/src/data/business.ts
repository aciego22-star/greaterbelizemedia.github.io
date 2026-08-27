/**
 * Single source of truth for Cosmic Pharmacy's business details.
 * Edit here only — components read from this object.
 */
export const business = {
  name: 'Cosmic Pharmacy',
  tagline: 'Medicine · Health · Beauty',
  promise: 'We take care of you.',
  /** Proprietor/pharmacist reference. Do not add a first name unless confirmed by the client. */
  pharmacist: 'Ms. Carter',
  phoneDisplay: '+501 611-8080',
  phoneTel: '+5016118080',
  /** Digits-only number used in wa.me deep links. */
  whatsappNumber: '5016118080',
  email: 'cosmicpharmacybz@gmail.com',
  address: '#41 Corner Holy Emmanuel Street/CET Site, Belize City, Belize',
  instagram: '@cosmicpharmacybz',
  instagramUrl: 'https://www.instagram.com/cosmicpharmacybz/',
  facebookName: 'Cosmic Pharmacy, Belize City',
  facebookUrl: 'https://www.facebook.com/people/Cosmic-Pharmacy/100091933047386/',
  // VERIFY WITH CLIENT BEFORE PUBLICATION - handle assumed to match Instagram;
  // confirm the real TikTok account before this link goes live.
  tiktok: '@cosmicpharmacybz',
  tiktokUrl: 'https://www.tiktok.com/@cosmicpharmacybz',
  // VERIFY WITH CLIENT BEFORE PUBLICATION - Google Maps search link for the
  // business. Replace with the Google Business Profile short link once supplied.
  googleBusinessUrl:
    'https://www.google.com/maps/search/?api=1&query=Cosmic+Pharmacy+Holy+Emmanuel+Street+Belize+City',
  /** Keyless Google Maps embed. Swap for the Business Profile place ID when supplied. */
  mapEmbedUrl:
    'https://www.google.com/maps?q=Cosmic+Pharmacy%2C+Holy+Emmanuel+Street%2FCET+Site%2C+Belize+City%2C+Belize&output=embed',
  serviceReach: 'Belize City · out-district · The Cayes',
  // VERIFY WITH CLIENT BEFORE PUBLICATION — hours conflict across current public sources;
  // these are the hours on Cosmic's current coming-soon page.
  hours: [
    { days: 'Monday – Saturday', open: '9:00 a.m.', close: '7:30 p.m.' },
    { days: 'Sunday', open: '9:00 a.m.', close: '1:00 p.m.' }
  ],
  hoursShort: 'Mon–Sat 9:00–7:30 · Sun 9:00–1:00'
} as const;
