import { RetailLanding } from './RetailLanding';
import { business } from '../data/business';
import { buildPmosMessage, whatsappUrl } from '../lib/whatsapp';

export function Supplements() {
  return (
    <RetailLanding
      title="Supplements"
      eyebrow="Vitamins & wellness"
      intro="Vitamins, minerals, herbal supplements and wellness formulas — Cosmic's range includes well over a hundred supplement options, with a pharmacist to help you choose what actually fits. (Range claim from Cosmic's own materials — to be verified before publication.)"
      categorySlugs={['vitamins-supplements']}
      metaDescription="Vitamins, minerals, herbal supplements and wellness products at Cosmic Pharmacy, Belize City — searchable online with WhatsApp requests."
    />
  );
}

export function HealthProducts() {
  return (
    <RetailLanding
      title="Health Products"
      eyebrow="Everyday health"
      intro="Over-the-counter medicine, first aid, eye and ear care, and diabetes and monitoring supplies — search online, request on WhatsApp, and let the pharmacist confirm what's right."
      categorySlugs={['otc-medicine', 'first-aid', 'eye-ear-care', 'diabetes-monitoring']}
      metaDescription="OTC medicine, first aid, eye and ear care, and monitoring supplies at Cosmic Pharmacy, Belize City."
    />
  );
}

export function PersonalCareBeauty() {
  return (
    <RetailLanding
      title="Personal Care & Beauty"
      eyebrow="Care & beauty"
      intro="Hygiene, skin care, hair care, lip care, feminine care, and mother-and-baby essentials — the front-shop favourites, searchable from anywhere in Belize."
      categorySlugs={['personal-care', 'skin-hair-beauty', 'mother-baby']}
      metaDescription="Personal care, hygiene, skin, hair and beauty products, and mother-and-baby care at Cosmic Pharmacy, Belize City."
    />
  );
}

export function WomensWellness() {
  return (
    <RetailLanding
      title="Women's Wellness & PMOS"
      eyebrow="Cosmic Wellness"
      intro="Cosmic's proprietary PMOS collections — pharmacist-guided, targeted wellness-support kits you browse by goal, then discuss before you choose."
      categorySlugs={['womens-wellness']}
      metaDescription="Cosmic Pharmacy's PMOS wellness-support kits and women's wellness range — browse by goal and talk it through with the pharmacist."
    >
      <section className="panel-section section-pad pmos-band">
        <h2>How the PMOS pathway works</h2>
        <ol className="how-steps">
          <li>
            <strong>Browse by goal</strong>
            <span>Each kit is named for the goal it supports — Skin Balance, Metabolic Reset, Fertility Support, Cycle Balance, Craving Control.</span>
          </li>
          <li>
            <strong>Talk it through</strong>
            <span>Message {business.pharmacist} on WhatsApp — she asks the right questions before recommending anything.</span>
          </li>
          <li>
            <strong>Start with confidence</strong>
            <span>Pick up in store or arrange delivery once the kit and pricing are confirmed.</span>
          </li>
        </ol>
        <a className="btn btn-whatsapp" href={whatsappUrl(buildPmosMessage())} target="_blank" rel="noopener noreferrer">
          Ask {business.pharmacist} Which Kit to Discuss
        </a>
        <p className="notice pmos-disclaimer">
          PMOS kits are wellness support, not diagnosis or treatment. For symptoms, fertility concerns, chronic conditions, pregnancy, or
          possible medication interactions, please consult an appropriate medical professional — the pharmacist can help you decide when
          that's the right step.
        </p>
      </section>
    </RetailLanding>
  );
}

export function MedicalDevices() {
  return (
    <RetailLanding
      title="Medical Devices & Daily Living"
      eyebrow="Devices & daily living"
      intro="Blood-pressure monitors, glucose monitoring, thermometers, pill organizers, insoles and daily-living aids — with help setting up and choosing supplies."
      categorySlugs={['diabetes-monitoring', 'mobility-daily-living']}
      metaDescription="Blood-pressure monitors, glucose monitors and strips, thermometers, pill organizers and daily-living aids at Cosmic Pharmacy, Belize City."
    />
  );
}
