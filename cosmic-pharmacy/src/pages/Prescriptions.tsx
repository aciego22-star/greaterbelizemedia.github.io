import { business } from '../data/business';
import { buildPrescriptionMessage, whatsappUrl } from '../lib/whatsapp';
import { usePageMeta } from '../lib/usePageMeta';

export function Prescriptions() {
  usePageMeta(
    'Prescription & Refill Request | Cosmic Pharmacy',
    'Send a prescription or refill request to Cosmic Pharmacy on WhatsApp, reviewed by the pharmacist before dispensing.'
  );

  return (
    <div className="page">
      <div className="wrap page-stack">
        <section className="panel-section section-pad">
          <span className="eyebrow">Pharmacist-review pathway</span>
          <h1 className="section-title">Prescription & Refill Request</h1>
          <p className="section-intro">
            Prescription medicine requires pharmacist review, and where applicable a valid prescription, before it can be dispensed.
            That review happens in a direct WhatsApp conversation with Cosmic Pharmacy, not through an online checkout.
          </p>

          <ol className="how-steps">
            <li>
              <strong>Start the conversation</strong>
              <span>Tap the button below to open WhatsApp with a simple opening message. No medical details are collected by this website.</span>
            </li>
            <li>
              <strong>Share what's needed</strong>
              <span>The Cosmic team tells you exactly what they require and you share your prescription directly in the chat, under the pharmacy's own process.</span>
            </li>
            <li>
              <strong>Pharmacist review</strong>
              <span>{business.pharmacist} reviews the request, confirms availability and pricing, and flags anything that needs a doctor's input.</span>
            </li>
            <li>
              <strong>Pickup or delivery</strong>
              <span>Once confirmed, collect in store or arrange delivery or shipping.</span>
            </li>
          </ol>

          <a className="btn btn-magenta rx-cta" href={whatsappUrl(buildPrescriptionMessage())} target="_blank" rel="noopener noreferrer">
            Continue to WhatsApp
          </a>

          <p className="notice">
            This website never stores prescriptions, diagnoses, medication history or any other medical information. Everything sensitive
            stays inside your direct conversation with the pharmacy.
          </p>
        </section>
      </div>
    </div>
  );
}
