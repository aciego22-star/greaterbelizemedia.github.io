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
import { t } from '../i18n/lang';

export const site = {
  /**
   * Brand name. "Cojac's" matches the official logo supplied by the family
   * and the sitemap draft.
   */
  brandShort: "Cojac's",
  brandName: "Cojac's Sumptuous Rumpopo",
  tagline: t('A Belizean Christmas Tradition', 'Una tradición navideña beliceña'),
  /** Tagline printed on the official logo. */
  logoTagline: t(
    'A very merry treat and must have addition to your holiday celebrations!',
    '¡Un antojo muy alegre que no puede faltar en tus celebraciones navideñas!',
  ),

  /** Public site address — used for canonical links, sitemap and social previews. */
  siteUrl: 'https://shiny-truffle-ef9459.netlify.app',

  /** Family's own description. Do not replace with a founding year until confirmed. */
  experienceStatement: t('more than fifteen years', 'más de quince años'),

  // ── WhatsApp ordering ──────────────────────────────────────────────────────
  whatsapp: {
    /**
     * Official order number in international format, digits only
     * (e.g. Belize numbers start with 501 followed by 7 digits).
     * Confirmed Nov 2026. If cleared, the "Send on WhatsApp" button is safely
     * disabled and customers can still copy their order details.
     */
    orderNumber: '5016218372',
    /** The number itself is not printed on the page — customers tap the WhatsApp logo. */
    display: '+501 621-8372',
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
    bannerText: t(
      'Rumpopo season is here! Delivery in Belize City and countrywide shipping available everyday until January 3rd 2027.',
      '¡Llegó la temporada de rumpopo! Entrega en la Ciudad de Belice y envíos a todo el país todos los días hasta el 3 de enero de 2027.',
    ),
    /** Shown after the season closes. */
    closedHeadline: t('Our season has ended.', 'Nuestra temporada ha terminado.'),
    closedText: t(
      'Thank you for making this Christmas a little more sumptuous. Follow us for the next release.',
      'Gracias por hacer esta Navidad un poco más suntuosa. Síguenos para enterarte del próximo lanzamiento.',
    ),
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
      label: t('Delivery', 'Entrega'),
      short: t('BZD $5 anywhere in Belize City', 'BZD $5 en cualquier parte de la Ciudad de Belice'),
      description: t('Anywhere in and within Belize City. Delivery is BZD $5.', 'En cualquier parte de la Ciudad de Belice. La entrega cuesta BZD $5.'),
      enabled: true,
      asksForArea: true,
      areaLabel: t('Exact delivery address', 'Dirección exacta de entrega'),
      addressHint: t(
        'Street, house number and a landmark, e.g. 12 Cleghorn St, blue house beside the church',
        'Calle, número de casa y un punto de referencia, p. ej. 12 Cleghorn St, casa azul junto a la iglesia',
      ),
      messageLabel: t('Delivery (Belize City)', 'Entrega (Ciudad de Belice)'),
      chargeLabel: t('Delivery', 'Entrega'),
      feeBZD: 5,
    },
    {
      id: 'pickup',
      label: t('Pickup', 'Recoger'),
      short: t('free', 'gratis'),
      description: t('Free. Cojac’s will tell you where and when to collect.', 'Gratis. Cojac’s te dirá dónde y cuándo recoger tu pedido.'),
      enabled: true,
      asksForArea: false,
      messageLabel: t('Pickup', 'Recoger'),
      chargeLabel: t('Pickup', 'Recoger'),
      feeBZD: 0, // 0 = no charge
    },
    {
      id: 'shipping',
      label: t('Shipping', 'Envío'),
      short: t('to other districts', 'a otros distritos'),
      description: t(
        'Out of district, to anywhere outside Belize City. The shipping charge is confirmed by Cojac’s.',
        'Fuera del distrito, a cualquier lugar fuera de la Ciudad de Belice. Cojac’s confirma el costo del envío.',
      ),
      enabled: true,
      asksForArea: true,
      areaLabel: t('Exact shipping address', 'Dirección exacta de envío'),
      addressHint: t('Street or house, town or village, and district', 'Calle o casa, pueblo o aldea, y distrito'),
      messageLabel: t('Shipping (out of district)', 'Envío (fuera del distrito)'),
      chargeLabel: t('Shipping', 'Envío'),
      feeBZD: null, // Charge applies; enter the approved amount
    },
    {
      id: 'advise',
      label: t('Not sure yet', 'Aún no sé'),
      description: t('Cojac’s will suggest the best option for you.', 'Cojac’s te sugerirá la mejor opción.'),
      enabled: false,
      asksForArea: true,
      areaLabel: t('Where are you located?', '¿Dónde te encuentras?'),
      chargeLabel: t('Charge', 'Costo'),
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
    email: 'rumpopobze@gmail.com',
    /** Google Maps link for the address above. Empty = hidden. */
    mapUrl: 'https://www.google.com/maps/search/?api=1&query=Diego+St%2C+Belize+City%2C+Belize',
    /** Google Maps embed (loaded only when the visitor taps "Show map"). */
    mapEmbedUrl: 'https://www.google.com/maps?q=Diego+St,+Belize+City,+Belize&z=16&output=embed',
  },
  social: {
    facebook: 'https://www.facebook.com/share/1EJbfQLwDq/',
    instagram: 'https://www.instagram.com/cojacsumptuousrumpopo/',
  },

  // ── Website credit (footer) ─────────────────────────────────────────────────
  credit: {
    label: t('Website developed by Austere Automations', 'Sitio web desarrollado por Austere Automations'),
    url: 'https://austereautomations.com/website-development-belize',
  },

  // ── Responsible enjoyment ──────────────────────────────────────────────────
  alcohol: {
    /** LAUNCH BLOCKER: confirm the legal purchasing age and obligations with the family / counsel. */
    legalAge: 18,
    showAgeNotice: true,
    responsibleMessage: t(
      'Rumpopo contains alcohol. Please enjoy responsibly. Not for sale to minors.',
      'El rumpopo contiene alcohol. Disfrútalo con responsabilidad. Prohibida su venta a menores de edad.',
    ),
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
