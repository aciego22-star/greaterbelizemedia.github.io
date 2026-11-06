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
   * Brand name. Spelling "Cojac" follows the family's sitemap draft.
   * LAUNCH BLOCKER: confirm Cojac vs Cojak before launch — change it here only.
   */
  brandShort: "Cojac's",
  brandName: "Cojac's Sumptuous Rumpopo",
  tagline: 'A Belizean Christmas Tradition',

  /** Public site address — used for canonical links, sitemap and social previews. */
  siteUrl: 'https://cojacs-rumpopo.netlify.app',

  /** Family's own description. Do not replace with a founding year until confirmed. */
  experienceStatement: 'more than fifteen years',

  // ── WhatsApp ordering ──────────────────────────────────────────────────────
  whatsapp: {
    /**
     * Official order number in international format, digits only
     * (e.g. Belize numbers start with 501 followed by 7 digits).
     * LAUNCH BLOCKER: empty until the family confirms the number.
     * While empty, the "Send on WhatsApp" button is safely disabled and
     * customers can still copy their order details.
     */
    orderNumber: '',
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
      label: 'Delivery in Belize City',
      description: 'Delivery arrangements and any fee are confirmed by Cojac’s on WhatsApp.',
      enabled: true,
      asksForArea: true,
      areaLabel: 'Area / neighbourhood in Belize City',
      feeBZD: null,
    },
    {
      id: 'shipping',
      label: 'Countrywide shipping',
      description: 'Shipping to other parts of Belize. Eligibility, schedule and fees are confirmed by Cojac’s.',
      enabled: true,
      asksForArea: true,
      areaLabel: 'Town / village and district',
      feeBZD: null,
    },
    {
      id: 'pickup',
      label: 'Pickup',
      description: 'Collect your order at an arranged time and place.',
      enabled: false, // LAUNCH BLOCKER: enable only once a pickup point is approved.
      asksForArea: false,
      feeBZD: null,
    },
    {
      id: 'advise',
      label: 'Not sure yet — please advise',
      description: 'Cojac’s will suggest the best option for you.',
      enabled: true,
      asksForArea: true,
      areaLabel: 'Where are you located?',
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
    facebook: '',
    instagram: '',
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
};
