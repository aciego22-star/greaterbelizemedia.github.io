/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  BUSINESS SETTINGS — the one file to edit for names, contacts and the season.
 *  See docs/HANDOVER.md for step-by-step instructions.
 *
 *  Rule of thumb: if a value has not been confirmed by the family, leave it
 *  empty ('' or null). The website hides or labels anything unconfirmed rather
 *  than guessing.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { FulfilmentOption } from '../types';

export const site = {
  /**
   * Brand name. "Cojac's" matches the official logo supplied by the family
   * and the sitemap draft.
   */
  brandShort: "Cojac's",
  brandName: "Cojac's Sumptuous Rumpopo",
  tagline: 'A Belizean Christmas Tradition',
  /** Tagline printed on the official logo. */
  logoTagline: 'A very merry treat and must have addition to your holiday celebrations!',

  /** Public site address — used for canonical links, sitemap and social previews. */
  siteUrl: 'https://cojacs-rumpopo.netlify.app',

  /** Family's own description. Do not replace with a founding year until confirmed. */
  experienceStatement: 'more than fifteen years',

  // ── WhatsApp ordering ──────────────────────────────────────────────────────
  whatsapp: {
    /**
     * Official order number in international format, digits only
     * (e.g. Belize numbers start with 501 followed by 7 digits).
     * Confirmed Nov 2026. If cleared, the "Send on WhatsApp" button is safely
     * disabled and customers can still copy their order details.
     */
    orderNumber: '5016230447',
    /** The number itself is not printed on the page — customers tap the WhatsApp logo. */
    display: '+501 623-0447',
  },

  // ── Season ─────────────────────────────────────────────────────────────────
  season: {
    /** Master switch. Set false when the season ends (or let seasonClosesOn do it). */
    isSeasonOpen: true,
    /** Accept order requests through the website. */
    acceptOrderRequests: true,
    /** First day of the season (YYYY-MM-DD). Banner shows from this date. */
    seasonOpensOn: '2026-11-01',
    /** Last day of the season (YYYY-MM-DD, Belize time). After this the site switches to "season ended". */
    seasonClosesOn: '2027-01-03',
    /** Show the announcement bar at the top of every page. */
    showBanner: true,
    /** Family-supplied banner copy (sitemap draft). Confirm shipping details before launch. */
    bannerText:
      'Rumpopo season is here! Delivery in Belize City and countrywide shipping available everyday until January 3rd 2027.',
    /** Shown after the season closes. */
    closedHeadline: 'Our season has ended.',
    closedText:
      'Thank you for making this Christmas a little more sumptuous. Follow us for the next release.',
  },

  // ── Fulfilment ─────────────────────────────────────────────────────────────
  /**
   * Options customers may choose on the order page. Delivery in Belize City and
   * countrywide shipping are named in the family's banner copy; pickup is off
   * until a pickup point is approved. Fees stay null ("To be confirmed by Cojac's")
   * until approved.
   */
  fulfilment: [
    {
      id: 'delivery',
      label: 'Delivery',
      short: 'within Belize City limits',
      description: 'Within Belize City limits. A delivery charge applies.',
      enabled: true,
      asksForArea: true,
      areaLabel: 'Area / neighbourhood (within Belize City limits)',
      chargeLabel: 'Delivery charge',
      feeBZD: null, // Charge applies — enter the approved amount, e.g. 10
    },
    {
      id: 'pickup',
      label: 'Pickup',
      short: 'no charge',
      description: 'No charge. Pickup location and time are confirmed by Cojac’s on WhatsApp.',
      enabled: true,
      asksForArea: false,
      chargeLabel: 'Pickup',
      feeBZD: 0, // 0 = no charge
    },
    {
      id: 'shipping',
      label: 'Shipping',
      short: 'out-district, to other districts',
      description: 'Out-district — to other districts outside Belize City. A shipping charge applies.',
      enabled: true,
      asksForArea: true,
      areaLabel: 'Town / village and district',
      chargeLabel: 'Shipping charge',
      feeBZD: null, // Charge applies — enter the approved amount
    },
    {
      id: 'advise',
      label: 'Not sure yet — please advise',
      description: 'Cojac’s will suggest the best option for you.',
      enabled: false,
      asksForArea: true,
      areaLabel: 'Where are you located?',
      chargeLabel: 'Charge',
      feeBZD: null,
    },
  ] as FulfilmentOption[],

  /** Let customers suggest a preferred date. */
  askPreferredDate: true,

  // ── Contact & social ───────────────────────────────────────────────────────
  contact: {
    /** Supplied in the sitemap draft. Not described as a walk-in shop or pickup point. */
    addressLine: 'Diego St, Belize City',
    /** Public phone number for display, e.g. "+501 600-0000". Empty = hidden. */
    phoneDisplay: '',
    /** Digits only for tel: links, e.g. "5016000000". */
    phoneDial: '',
    email: '',
    /** Approved map link for a confirmed pickup address. Empty = hidden. */
    mapUrl: '',
  },
  social: {
    facebook: 'https://www.facebook.com/share/1PdoHB7dwv/',
    instagram: 'https://www.instagram.com/cojacsumptuousrumpopo/',
  },

  // ── Website credit (footer) ─────────────────────────────────────────────────
  credit: {
    label: 'Website development in Belize by Austere Automations',
    url: 'https://austereautomations.com/website-development-belize',
  },

  // ── Responsible enjoyment ──────────────────────────────────────────────────
  alcohol: {
    /** LAUNCH BLOCKER: confirm the legal purchasing age and obligations with the family / counsel. */
    legalAge: 18,
    showAgeNotice: true,
    responsibleMessage: 'Rumpopo contains alcohol. Please enjoy responsibly. Not for sale to minors.',
  },
};

/** Internal preview switches, set at build time (see README). Never on in production. */
export const buildFlags = {
  /** Shows the internal "launch notes" ribbon and checklist page. */
  showLaunchNotes: import.meta.env.VITE_SHOW_LAUNCH_NOTES === 'true',
  /** Loads sample bottle sizes/prices labelled "Illustrative" for stakeholder review. */
  illustrativeMenu: import.meta.env.VITE_ILLUSTRATIVE_MENU === 'true',
  /**
   * Optional QA WhatsApp number (digits) for internal testing builds only.
   * Lets the team test the hand-off without messaging the business.
   */
  qaWhatsAppNumber: (import.meta.env.VITE_QA_WHATSAPP as string | undefined) ?? '',
  /** Sandboxed artifact preview: third-party iframes are blocked, so videos open externally. */
  noEmbeds: import.meta.env.VITE_ARTIFACT === 'true',
};
