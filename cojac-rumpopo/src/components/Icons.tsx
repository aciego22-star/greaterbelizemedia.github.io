import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement> & { size?: number };
const base = (size = 20): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
});

export const WhatsAppIcon = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path
      fill="currentColor"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.24 8.24 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.16.25-.64.81-.79.98-.14.16-.29.18-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.43.13-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.22-.16-.47-.28Z"
    />
  </svg>
);
export const BagIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 7h12l1 13H5L6 7Z" />
    <path d="M9 7V5.5a3 3 0 0 1 6 0V7" />
  </svg>
);
export const MenuIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const CloseIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const PlusIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14" />
  </svg>
);
export const TrashIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
  </svg>
);
export const ChevronIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const ArrowIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const ExternalIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </svg>
);
export const CopyIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="8" y="8" width="12" height="12" rx="2" />
    <path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3" />
  </svg>
);
export const InfoIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);
export const PinIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
);
export const PlayIcon = ({ size = 22, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" />
  </svg>
);
export const CheckIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const FacebookIcon = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.87.25-1.46 1.5-1.46h1.6V4.46A21 21 0 0 0 14.27 4.3c-2.3 0-3.87 1.4-3.87 3.98v2.22H7.8v3h2.6V21h3.1Z" />
  </svg>
);
export const InstagramIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.3" cy="6.7" r="0.6" fill="currentColor" />
  </svg>
);
export const YouTubeIcon = ({ size = 20, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" {...p}>
    <path fill="currentColor" d="M21.6 7.2a2.5 2.5 0 0 0-1.76-1.77C18.27 5 12 5 12 5s-6.27 0-7.84.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.76 1.77C5.73 19 12 19 12 19s6.27 0 7.84-.43a2.5 2.5 0 0 0 1.76-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
  </svg>
);
export const PhoneIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
  </svg>
);
export const MailIcon = ({ size, ...p }: P) => (
  <svg {...base(size)} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

/* Guarantee pillar icons — line drawings */
export const CreamIcon = ({ size = 44, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M8 30c4-8 10 2 16-4s10-2 16 4" />
    <path d="M8 30v6a4 4 0 0 0 4 4h24a4 4 0 0 0 4-4v-6" />
    <path d="M18 18c0-4 6-4 6-9M28 20c0-3 4-3 4-7" />
  </svg>
);
export const WhiskIcon = ({ size = 44, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M24 30v12" />
    <path d="M24 30c-8 0-10-10-10-16a10 10 0 0 1 20 0c0 6-2 16-10 16Z" />
    <path d="M24 30c-3 0-5-10-5-16s2-10 5-10 5 4 5 10-2 16-5 16Z" />
    <path d="M24 4v26" />
  </svg>
);
export const FullBottleIcon = ({ size = 44, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M20 4h8v8c0 3 7 4 7 10v20a2 2 0 0 1-2 2H15a2 2 0 0 1-2-2V22c0-6 7-7 7-10V4Z" />
    <path d="M20 9h8" />
    <path d="M14.5 21c2 1 4 1 6 0s4-1 6 0 4 1 6 0" />
    <path d="M16 26v14" opacity=".5" />
  </svg>
);
export const DropsIcon = ({ size = 44, ...p }: P) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true" {...p}>
    <path d="M16 6s-8 10-8 16a8 8 0 0 0 16 0c0-6-8-16-8-16Z" />
    <path d="M34 18s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z" />
    <path d="M26 34s-4 4-4 7a4 4 0 0 0 8 0c0-3-4-7-4-7Z" />
  </svg>
);
