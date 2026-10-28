/**
 * Branch details exactly as listed on https://universalhardware.bz/about.html
 * (viewed 28 October 2026). These are website-listed details, not live
 * operating data: never infer that a branch is open now.
 */
export type BranchId = 'spanish-lookout' | 'belize-city';

export interface PhoneLine {
  label: string;
  display: string;
  /** E.164 digits for tel: links. */
  e164: string;
}

export interface WhatsAppLine {
  label: 'Sales' | 'Service Center';
  display: string;
  /** Digits only for https://wa.me/ links. */
  wa: string;
}

export interface Branch {
  id: BranchId;
  name: string;
  tag?: string;
  addressLines: string[];
  addressNote?: string;
  district: string;
  hours: { days: string; time: string }[];
  phones: PhoneLine[];
  whatsapp: WhatsAppLine[];
  mapQuery: string;
  /** Approximate town position for the illustrative map only. */
  approx: { lat: number; lng: number };
}

export const BRANCHES: Branch[] = [
  {
    id: 'spanish-lookout',
    name: 'Spanish Lookout',
    tag: 'Main branch',
    addressLines: ['585 Center Road', 'Spanish Lookout, Cayo', 'Belize'],
    addressNote: 'Listed on the website as the company mailing address; the branch is listed on Center Road.',
    district: 'Cayo District',
    hours: [
      { days: 'Monday – Friday', time: '7:30 AM – 5:00 PM' },
      { days: 'Saturday', time: '7:30 AM – 3:00 PM' },
    ],
    phones: [
      { label: 'Telephone', display: '+501 823-0254', e164: '+5018230254' },
      { label: 'Alternate (Smart)', display: '+501 880-0254', e164: '+5018800254' },
    ],
    whatsapp: [
      { label: 'Sales', display: '+501 652-9933', wa: '5016529933' },
      { label: 'Service Center', display: '+501 668-0311', wa: '5016680311' },
    ],
    mapQuery: 'Universal Hardware, 585 Center Road, Spanish Lookout, Belize',
    approx: { lat: 17.26, lng: -89.02 },
  },
  {
    id: 'belize-city',
    name: 'Belize City',
    addressLines: ['3380 Chetumal Street', 'Belama Phase 2', 'Belize City, Belize'],
    district: 'Belize District',
    hours: [
      { days: 'Monday – Friday', time: '8:00 AM – 5:00 PM' },
      { days: 'Saturday', time: '8:00 AM – 1:00 PM' },
    ],
    phones: [
      { label: 'Telephone', display: '+501 224-4140', e164: '+5012244140' },
      { label: 'Alternate (Smart)', display: '+501 280-0254', e164: '+5012800254' },
    ],
    whatsapp: [
      { label: 'Sales', display: '+501 667-3937', wa: '5016673937' },
      { label: 'Service Center', display: '+501 652-9330', wa: '5016529330' },
    ],
    mapQuery: 'Universal Hardware, 3380 Chetumal Street, Belama Phase 2, Belize City, Belize',
    approx: { lat: 17.52, lng: -88.21 },
  },
];

export const BRANCH_BY_ID = Object.fromEntries(BRANCHES.map((b) => [b.id, b])) as Record<BranchId, Branch>;

export const GENERAL_SALES_EMAIL = 'sales@universalhardware.bz';

export const HOLIDAY_NOTE =
  'The website states that Universal Hardware is closed on Belize public and bank holidays. Confirm holiday hours with the branch.';

export const BRANCH_VERIFY_NOTE =
  "Details listed on Universal Hardware's current website; confirm hours and availability with the branch.";

export function mapsUrl(b: Branch): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.mapQuery)}`;
}

export function waUrl(line: WhatsAppLine): string {
  return `https://wa.me/${line.wa}`;
}
