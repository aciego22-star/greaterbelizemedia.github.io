#!/usr/bin/env node
/**
 * Converts a staff-edited CSV (see data-templates/products-template.csv)
 * into src/data/products.json, validating every record.
 *
 * Usage: npm run import:csv -- path/to/products.csv
 * The converted catalogue replaces src/data/products.json only when every
 * record is valid; otherwise nothing is written and errors are listed.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validateProducts } from './validate-products.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const OUT_PATH = join(root, 'src/data/products.json');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npm run import:csv -- path/to/products.csv');
  process.exit(1);
}

/** Minimal CSV parser with quoted-field support. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  row.push(field);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

const bool = (v) => String(v).trim().toLowerCase() === 'true' || String(v).trim().toLowerCase() === 'yes';
const num = (v) => (String(v).trim() === '' ? null : Number(v));
const str = (v) => String(v ?? '').trim();

const text = readFileSync(csvPath, 'utf8');
const [header, ...rows] = parseCsv(text);
const col = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

const required = ['id', 'slug', 'name', 'category', 'productType', 'shortDescription', 'priceStatus', 'stockStatus', 'imageAlt'];
const missingCols = required.filter((c) => !(c in col));
if (missingCols.length) {
  console.error(`CSV is missing required column(s): ${missingCols.join(', ')}`);
  process.exit(1);
}

const products = rows.map((r) => {
  const get = (name) => (name in col ? str(r[col[name]]) : '');
  const product = {
    id: get('id'),
    slug: get('slug'),
    name: get('name'),
    brand: get('brand') || undefined,
    category: get('category'),
    subcategory: get('subcategory') || undefined,
    productType: get('productType'),
    shortDescription: get('shortDescription'),
    size: get('size') || undefined,
    dosageForm: get('dosageForm') || undefined,
    priceBzd: num(get('priceBzd')),
    compareAtPriceBzd: num(get('compareAtPriceBzd')),
    priceStatus: get('priceStatus'),
    stockStatus: get('stockStatus'),
    prescriptionRequired: bool(get('prescriptionRequired')),
    pharmacistGuidanceRequired: bool(get('pharmacistGuidanceRequired')),
    keywords: get('keywords')
      ? get('keywords')
          .split(';')
          .map((k) => k.trim())
          .filter(Boolean)
      : [],
    image: get('image'),
    imageAlt: get('imageAlt'),
    featured: bool(get('featured')) || undefined,
    sale: bool(get('sale')) || undefined,
    newArrival: bool(get('newArrival')) || undefined,
    lastVerified: get('lastVerified') || null
  };
  // Drop undefined optionals so the JSON stays tidy.
  return Object.fromEntries(Object.entries(product).filter(([, v]) => v !== undefined));
});

const errors = validateProducts(products);
if (errors.length) {
  console.error(`✗ CSV has ${errors.length} problem(s) — nothing was written:\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

writeFileSync(OUT_PATH, `${JSON.stringify(products, null, 2)}\n`);
console.log(`✓ Wrote ${products.length} products to src/data/products.json`);
