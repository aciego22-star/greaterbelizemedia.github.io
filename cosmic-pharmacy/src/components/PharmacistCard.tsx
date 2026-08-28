import { buildQuestionMessage, whatsappUrl } from '../lib/whatsapp';

interface PharmacistCardProps {
  /** Optional context line above the standard guidance copy. */
  context?: string;
}

/**
 * The safety-rail card: search finds products, a pharmacist decides fit.
 * Surfaced on medical-sounding queries and empty result states.
 */
export function PharmacistCard({ context }: PharmacistCardProps) {
  return (
    <aside className="pharmacist-card" aria-label="Pharmacist guidance">
      <div className="pharmacist-card-icon" aria-hidden="true">
        <svg viewBox="0 0 40 40" width="34" height="34">
          <circle cx="20" cy="20" r="15" fill="none" stroke="currentColor" strokeWidth="2.4" />
          <path d="M20 12v16M12 20h16" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        {context && <p className="pharmacist-card-context">{context}</p>}
        <h3>Not sure what you need?</h3>
        <p>Send your question to Cosmic Pharmacy and let a pharmacist guide you.</p>
        <a className="btn btn-whatsapp btn-sm" href={whatsappUrl(buildQuestionMessage())} target="_blank" rel="noopener noreferrer">
          Ask on WhatsApp
        </a>
      </div>
    </aside>
  );
}
