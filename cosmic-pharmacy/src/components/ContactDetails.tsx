import { business } from '../data/business';
import { whatsappUrl } from '../lib/whatsapp';

/** Google Maps pin, in Google's red. */
const Pin = () => (
  <path
    d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
    fill="#ea4335"
  />
);
const Phone = () => (
  <path d="M6.6 3h2.9c.5 0 .9.3 1 .8l.9 3.3c.1.4 0 .8-.4 1L9.4 9.4a12.6 12.6 0 0 0 5.2 5.2l1.3-1.6c.2-.3.6-.5 1-.4l3.3.9c.5.1.8.5.8 1v2.9c0 .8-.7 1.5-1.5 1.5A16.5 16.5 0 0 1 3 6.6c0-.8.7-1.6 1.6-1.6h2Z" />
);
/** WhatsApp's own mark: the bubble in WhatsApp green with a white handset. */
const Chat = () => (
  <>
    <path
      d="M12 2.2c-5.4 0-9.8 4.4-9.8 9.8 0 1.73.46 3.42 1.33 4.9L2.1 21.9l5.13-1.34a9.76 9.76 0 0 0 4.77 1.24h.01c5.4 0 9.8-4.4 9.8-9.8 0-2.62-1.02-5.08-2.87-6.93A9.74 9.74 0 0 0 12 2.2Z"
      fill="#25d366"
    />
    <path
      d="M9.6 7.2c-.18-.42-.37-.42-.55-.43h-.47c-.16 0-.43.06-.66.3-.22.25-.86.85-.86 2.06s.88 2.39 1 2.55c.13.17 1.71 2.74 4.23 3.73 2.09.82 2.52.66 2.97.62.45-.04 1.46-.6 1.67-1.17.2-.58.2-1.07.14-1.17-.06-.1-.22-.17-.47-.29-.24-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12-.16.25-.63.8-.77.96-.14.16-.28.18-.53.06-.24-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.7-.14-.25-.02-.38.11-.5.11-.11.24-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.54-1.33-.76-1.83Z"
      fill="#ffffff"
    />
  </>
);
const Mail = () => (
  <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2.2-.5 6.8 5.1L18.8 6H5.2ZM19 7.7l-6.4 4.8a1 1 0 0 1-1.2 0L5 7.7v9.8c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V7.7Z" />
);
const Clock = () => (
  <>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M12 7v5.3l3.4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </>
);

function Row({
  icon,
  label,
  children,
  href,
  external,
  tint
}: {
  icon: JSX.Element;
  label: string;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
  /** Set when the destination has a real brand colour of its own. */
  tint?: string;
}) {
  const body = (
    <>
      <span className={`contact-row-icon${tint ? ' branded' : ''}`} style={tint ? ({ '--tint': tint } as React.CSSProperties) : undefined} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          {icon}
        </svg>
      </span>
      <span className="contact-row-body">
        <span className="contact-row-label">{label}</span>
        <span className="contact-row-value">{children}</span>
      </span>
    </>
  );

  if (!href) {
    return <div className="contact-row contact-row-static">{body}</div>;
  }
  return (
    <a
      className="contact-row"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {body}
    </a>
  );
}

/** Every contact detail is a live action: tap to call, message, mail or map. */
export function ContactDetails() {
  return (
    <div className="contact-rows">
      <Row icon={<Pin />} label="Visit us" href={business.googleBusinessUrl} external tint="#ea4335">
        {business.address}
      </Row>
      <Row icon={<Phone />} label="Call the pharmacy" href={`tel:${business.phoneTel}`}>
        {business.phoneDisplay}
      </Row>
      <Row
        icon={<Chat />}
        label="WhatsApp"
        href={whatsappUrl('Hello Cosmic Pharmacy! I have a quick question.')}
        external
        tint="#25d366"
      >
        Message us on {business.phoneDisplay}
      </Row>
      <Row icon={<Mail />} label="Email" href={`mailto:${business.email}`}>
        {business.email}
      </Row>
      <Row icon={<Clock />} label="Opening hours">
        {business.hours.map((h) => (
          <span key={h.days} className="contact-hours-line">
            <strong>{h.days}</strong> {h.open} – {h.close}
          </span>
        ))}
      </Row>
    </div>
  );
}
