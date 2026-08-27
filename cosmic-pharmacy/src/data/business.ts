/**
 * Single source of truth for Cosmic Pharmacy's business details.
 * Edit here only — components read from this object.
 */
export const business = {
  name: 'Cosmic Pharmacy',
  tagline: 'Medicine · Health · Beauty',
  promise: 'We take care of you.',
  /** Short reference used in running copy. */
  pharmacist: 'Ms. Carter',
  /** Full name and title, confirmed by the client. */
  pharmacistFullName: 'Marion Carter',
  pharmacistTitle: 'Proprietor & Pharmacist-in-Charge',
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
  /** Confirmed by the client. Note the handle has no "bz" suffix, unlike Instagram. */
  tiktok: '@cosmicpharmacy',
  tiktokUrl: 'https://www.tiktok.com/@cosmicpharmacy',
  /**
   * Google Business Profile share link, supplied by the client. App tracking
   * parameters (?g_st=) are stripped: they are session junk, not part of the
   * destination. This is a share link, so it cannot be framed - the map embed
   * below keeps its own URL.
   */
  googleBusinessUrl: 'https://maps.app.goo.gl/hbeZFGHJ43F7phbV7',
  /** Keyless Google Maps embed. Short share links cannot be framed, so this
   *  stays address-based; googleBusinessUrl carries the profile itself. */
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
