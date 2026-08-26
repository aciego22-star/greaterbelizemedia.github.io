#!/usr/bin/env node
/**
 * Validates src/data/products.json against the catalogue rules.
 * Run: npm run validate:data
 * Exits non-zero with clear messages when a record is invalid.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const PRODUCTS_PATH = join(root, 'src/data/products.json');

const PRODUCT_TYPES = ['general-otc', 'pharmacy-otc', 'prescription', 'supplement', 'personal-care', 'medical-device'];
const STOCK_STATUSES = ['in-stock', 'low-stock', 'confirm-availability', 'out-of-stock'];
const PRICE_STATUSES = ['verified', 'confirm-price', 'demo-only'];
const CATEGORY_SLUGS = [
  'otc-medicine',
  'vitamins-supplements',
  'womens-wellness',
  'diabetes-monitoring',
  'first-aid',
  'personal-care',
  'skin-hair-beauty',
  'mother-baby',
  'eye-ear-care',
  'mobility-daily-living',
  'prescription-refills',
  'sale-featured'
];

export function validateProducts(products) {
  const errors = [];
  const ids = new Set();
  const slugs = new Set();

  products.forEach((p, i) => {
    const label = p?.id || p?.slug || p?.name || `record #${i + 1}`;

    if (!p.id || typeof p.id !== 'string') errors.push(`${label}: missing id`);
    else if (ids.has(p.id)) errors.push(`${label}: duplicate id "${p.id}"`);
    else ids.add(p.id);

    if (!p.slug || typeof p.slug !== 'string') errors.push(`${label}: missing slug`);
    else if (slugs.has(p.slug)) errors.push(`${label}: duplicate slug "${p.slug}"`);
    else slugs.add(p.slug);

    if (!p.name) errors.push(`${label}: missing name`);
    if (!p.shortDescription) errors.push(`${label}: missing shortDescription`);

    if (!CATEGORY_SLUGS.includes(p.category)) errors.push(`${label}: unknown category "${p.category}"`);
    if (!PRODUCT_TYPES.includes(p.productType)) errors.push(`${label}: invalid productType "${p.productType}"`);
    if (!STOCK_STATUSES.includes(p.stockStatus)) errors.push(`${label}: invalid stockStatus "${p.stockStatus}"`);
    if (!PRICE_STATUSES.includes(p.priceStatus)) errors.push(`${label}: invalid priceStatus "${p.priceStatus}"`);

    if (p.priceBzd !== null && p.priceBzd !== undefined) {
      if (typeof p.priceBzd !== 'number' || Number.isNaN(p.priceBzd) || p.priceBzd < 0) {
        errors.push(`${label}: invalid priceBzd "${p.priceBzd}" (must be a non-negative number or null)`);
      }
    }
    if (p.priceStatus === 'confirm-price' && typeof p.priceBzd === 'number') {
      errors.push(`${label}: priceStatus is confirm-price but a numeric priceBzd is set — pick one`);
    }

    if (typeof p.prescriptionRequired !== 'boolean') errors.push(`${label}: prescriptionRequired must be true/false`);
    if (typeof p.pharmacistGuidanceRequired !== 'boolean') errors.push(`${label}: pharmacistGuidanceRequired must be true/false`);

    if (!Array.isArray(p.keywords)) errors.push(`${label}: keywords must be an array`);

    if (typeof p.image !== 'string') {
      errors.push(`${label}: image path missing (use "" while the photo is pending)`);
    } else if (p.image && !p.image.startsWith('assets/products/')) {
      errors.push(`${label}: image "${p.image}" must live under assets/products/ (or be "" while pending)`);
    }
    if (!p.imageAlt) errors.push(`${label}: missing imageAlt`);
  });

  return errors;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  let products;
  try {
    products = JSON.parse(readFileSync(PRODUCTS_PATH, 'utf8'));
  } catch (err) {
    console.error(`Could not read/parse ${PRODUCTS_PATH}: ${err.message}`);
    process.exit(1);
  }
  const errors = validateProducts(products);
  if (errors.length) {
    console.error(`✗ ${errors.length} problem(s) in products.json:\n`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exit(1);
  }
  console.log(`✓ products.json valid — ${products.length} products.`);
}
