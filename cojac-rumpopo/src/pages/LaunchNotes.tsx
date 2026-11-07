import { products } from '../content/catalogue';
import { faqs } from '../content/faqs';
import { gallery } from '../content/gallery';
import { buildFlags, site } from '../content/site';
import { getDestination } from '../lib/whatsapp';
import { getSeasonState } from '../lib/season';
import { CheckIcon, InfoIcon } from '../components/Icons';
import { PageHero } from '../components/ui';

/** Internal-only checklist (preview builds). Reads live config so it stays accurate. */
export default function LaunchNotes() {
  const d = getDestination();
  const items: { label: string; done: boolean; where: string }[] = [
    { label: 'Official logo supplied (spells “Cojac’s”)', done: true, where: 'public/brand/ + Logo in src/components/ui.tsx' },
    { label: 'Label art / bottle photography & official brand colours', done: false, where: 'catalogue.ts → images; global.css :root' },
    { label: 'Official WhatsApp order number', done: d.ok && d.source === 'official', where: 'src/content/site.ts → whatsapp.orderNumber' },
    { label: 'Facebook link', done: !!site.social.facebook, where: 'site.ts → social.facebook' },
    { label: 'Instagram link', done: !!site.social.instagram, where: 'site.ts → social.instagram' },
    { label: 'Public phone number', done: !!site.contact.phoneDisplay, where: 'site.ts → contact.phoneDisplay / phoneDial' },
    { label: 'Contact email', done: !!site.contact.email, where: 'site.ts → contact.email' },
    { label: '2026/27 flavour menu confirmed', done: products.every((p) => !p.active || p.confirmedThisSeason), where: 'catalogue.ts → confirmedThisSeason' },
    { label: 'Bottle sizes & approved BZD prices', done: products.every((p) => !p.active || p.variants.some((v) => v.priceBZD !== null && !v.illustrative)), where: 'catalogue.ts → variants' },
    { label: 'Product photography', done: products.every((p) => !p.active || p.images.length > 0), where: 'public/products + catalogue.ts → images' },
    { label: 'Allergen & ingredient information per flavour', done: products.every((p) => !p.active || p.allergens !== null), where: 'catalogue.ts → allergens / ingredientsDisclosure' },
    { label: 'Delivery & shipping charge amounts', done: site.fulfilment.every((f) => !f.enabled || f.feeBZD !== null), where: 'site.ts → fulfilment.feeBZD' },
    { label: 'Gallery photographs', done: gallery.length > 0, where: 'public/gallery + gallery.ts' },
    { label: 'Draft FAQ answers approved', done: faqs.every((f) => f.published), where: 'faqs.ts → published' },
    { label: 'Legal age / alcohol obligations reviewed', done: false, where: 'site.ts → alcohol' },
    { label: 'Final site URL / domain', done: !site.siteUrl.includes('netlify.app'), where: 'site.ts → siteUrl' },
  ];
  return (
    <>
      <PageHero title="Launch notes" lead="Visible only in preview builds. Items update automatically as the content files are completed." />
      <section className="section section--paper">
        <div className="container--narrow">
          <p className="notice notice--soft">
            <InfoIcon size={18} /> Season state: <strong>{getSeasonState()}</strong> · WhatsApp destination:{' '}
            <strong>{d.ok ? `${d.source} (${d.number})` : d.reason}</strong> · Illustrative menu: <strong>{String(buildFlags.illustrativeMenu)}</strong>
          </p>
          <ul className="launch-list">
            {items.map((i) => (
              <li key={i.label} className={i.done ? 'is-done' : ''}>
                <span className="launch-list__mark">{i.done ? <CheckIcon size={16} /> : '!'}</span>
                <div>
                  <strong>{i.label}</strong>
                  <small>{i.where}</small>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
