import { business } from '../data/business';
import { whatsappUrl } from '../lib/whatsapp';

const Pin = () => (
  <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
);
const Phone = () => (
  <path d="M6.6 3h2.9c.5 0 .9.3 1 .8l.9 3.3c.1.4 0 .8-.4 1L9.4 9.4a12.6 12.6 0 0 0 5.2 5.2l1.3-1.6c.2-.3.6-.5 1-.4l3.3.9c.5.1.8.5.8 1v2.9c0 .8-.7 1.5-1.5 1.5A16.5 16.5 0 0 1 3 6.6c0-.8.7-1.6 1.6-1.6h2Z" />
);
const Chat = () => (
  <path d="M12 3c5 0 9 3.4 9 7.6 0 4.2-4 7.6-9 7.6-.9 0-1.8-.1-2.6-.3L4.5 21l.9-3.6C3.9 16 3 13.4 3 10.6 3 6.4 7 3 12 3Z" />
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
  external
}: {
  icon: JSX.Element;
  label: string;
  children: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  const body = (
    <>
      <span className="contact-row-icon" aria-hidden="true">
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
      <Row icon={<Pin />} label="Visit us" href={business.googleBusinessUrl} external>
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
