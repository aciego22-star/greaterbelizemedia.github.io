# Cosmic Pharmacy — Catalogue Maintenance Guide

The whole website reads its products from **one file**:

```
src/data/products.json
```

Every retail page (Supplements, Health Products, Personal Care & Beauty, Women's
Wellness & PMOS, Medical Devices) and the Shop All database show slices of this
same list — add a product once and it appears everywhere it belongs.

## Adding or editing a product (JSON, for the developer)

1. Open `src/data/products.json`.
2. Copy an existing record and change every field. Required fields:
   `id` (unique, e.g. `cp-038`), `slug` (unique, lowercase-with-dashes), `name`,
   `category` (one of the twelve category slugs in `src/data/categories.ts`),
   `productType`, `shortDescription`, `priceStatus`, `stockStatus`,
   `prescriptionRequired`, `pharmacistGuidanceRequired`, `keywords`, `image`,
   `imageAlt`.
3. Pricing rules:
   - Known, client-verified price → `"priceBzd": 12.50, "priceStatus": "verified"`.
   - Price needs confirmation → `"priceBzd": null, "priceStatus": "confirm-price"`
     (the site shows **Confirm price** and keeps the item out of subtotals).
   - Demo/sale-reference price → `"priceStatus": "demo-only"`.
4. Safety rules:
   - `"prescriptionRequired": true` or `"pharmacistGuidanceRequired": true`
     replaces **Add to Basket** with the pharmacist pathway.
   - Never invent ingredients, doses, pack sizes, indications or benefits — use
     "Confirm details with pharmacist" wording when the source is unclear.
5. Images are **keys, not paths**. Save the photo as
   `src/assets/catalogue/<key>.webp` and set `"image": "<key>"` (no folder, no
   extension). `src/lib/media.ts` resolves the key at build time, which is what
   lets the same record work in the Netlify build and in the single-file preview.
   Leave `"image": ""` while a photo is pending and the site shows a labeled
   placeholder.
   - Several photographs of the same product go in `"images": ["key-a", "key-b"]`
     with the primary key repeated first. The detail page then shows a view
     switcher; cards always use the primary.
6. Check your work:

```bash
npm run validate:data
```

The validator reports missing IDs, duplicate slugs, invalid prices, invalid
product types, unknown categories and missing image paths.

## Adding products from a spreadsheet (for staff)

1. Start from `data-templates/products-template.csv` — one row per product, same
   columns as above. Separate multiple keywords with semicolons (`;`).
2. Hand the finished CSV to the developer, who runs:

```bash
npm run import:csv -- path/to/products.csv
```

The import validates everything and only replaces the catalogue when the whole
file is clean, so a typo can't half-break the site.

## Later: moving to a database or CMS

The interface never talks to `products.json` directly — components read through
`src/lib/catalog.ts`. Swapping the JSON import there for an API/CMS fetch is the
only change needed to move the catalogue to managed storage.
