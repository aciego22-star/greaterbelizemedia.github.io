import type { CategoryDef } from './types';

/**
 * The twelve catalogue categories from the build brief (§6).
 * Category slugs are referenced by products.json — change slugs with care.
 */
export const categories: CategoryDef[] = [
  {
    slug: 'otc-medicine',
    name: 'Over-the-Counter Medicine',
    shortName: 'OTC Medicine',
    description: 'Everyday relief for pain, fever, sinus, allergy and digestion — with a pharmacist nearby when you have questions.',
    icon: 'capsule',
    retailPage: 'health-products'
  },
  {
    slug: 'vitamins-supplements',
    name: 'Vitamins & Supplements',
    shortName: 'Supplements',
    description: 'Daily multivitamins, minerals, herbal support and targeted wellness formulas.',
    icon: 'leaf',
    retailPage: 'supplements'
  },
  {
    slug: 'womens-wellness',
    name: "Women's Wellness & PMOS",
    shortName: "Women's Wellness",
    description: "Cosmic's pharmacist-guided PMOS collections and female-wellness support.",
    icon: 'orbit',
    retailPage: 'womens-wellness'
  },
  {
    slug: 'diabetes-monitoring',
    name: 'Diabetes & Health Monitoring',
    shortName: 'Diabetes & Monitoring',
    description: 'Glucose monitors, test strips, blood-pressure monitors and monitoring supplies.',
    icon: 'monitor',
    retailPage: 'medical-devices'
  },
  {
    slug: 'first-aid',
    name: 'First Aid & Medical Supplies',
    shortName: 'First Aid',
    description: 'Wound care, antiseptics, supports and home medical supplies.',
    icon: 'cross',
    retailPage: 'health-products'
  },
  {
    slug: 'personal-care',
    name: 'Personal Care & Hygiene',
    shortName: 'Personal Care',
    description: 'Daily hygiene, feminine care and personal essentials.',
    icon: 'drop',
    retailPage: 'personal-care-beauty'
  },
  {
    slug: 'skin-hair-beauty',
    name: 'Skin, Hair & Beauty',
    shortName: 'Beauty',
    description: 'Skin care, hair care, lip care and front-shop beauty finds.',
    icon: 'sparkle',
    retailPage: 'personal-care-beauty'
  },
  {
    slug: 'mother-baby',
    name: 'Mother & Baby',
    shortName: 'Mother & Baby',
    description: 'Care for mothers and little ones, from feeding support to gentle essentials.',
    icon: 'heart',
    retailPage: 'personal-care-beauty'
  },
  {
    slug: 'eye-ear-care',
    name: 'Eye & Ear Care',
    shortName: 'Eye & Ear',
    description: 'Contact-lens care, eye comfort and ear-care basics.',
    icon: 'eye',
    retailPage: 'health-products'
  },
  {
    slug: 'mobility-daily-living',
    name: 'Mobility & Daily Living',
    shortName: 'Daily Living',
    description: 'Pill organizers, insoles, supports and daily-living aids.',
    icon: 'steps',
    retailPage: 'medical-devices'
  },
  {
    slug: 'prescription-refills',
    name: 'Prescription & Refills',
    shortName: 'Prescriptions',
    description: 'Prescription medicine and refills, always reviewed by the pharmacist before dispensing.',
    icon: 'rx',
    retailPage: 'prescriptions'
  },
  {
    slug: 'sale-featured',
    name: 'Sale & Featured Products',
    shortName: 'Sale & Featured',
    description: 'Current specials and featured picks from around the shop.',
    icon: 'tag'
  }
];

export const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

export function categoryName(slug: string): string {
  return categoryBySlug.get(slug)?.name ?? slug;
}
