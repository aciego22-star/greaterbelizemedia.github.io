# Asset attributions

No stock photography, social-media images, staff portraits or customer images are used. Product photos and brand logos come only from Universal Hardware's own public website (listed below).

| Asset | Files | Source / author | Licence / basis | Depicts | Edits |
|---|---|---|---|---|---|
| Universal Hardware wordmark | `public/brand/universal-hardware-logo{,-sm}.{webp,png}` | User-supplied reference JPEG `universal_hardware_reference_logo_user_supplied.jpg` (888×249) | Property of Universal Hardware Company Ltd.; used for a private, clearly labelled concept presentation only | The company wordmark | Cropped; flat light-grey background converted to transparency by per-pixel coverage estimation (no redrawing, no vectorising, no geometry or colour changes); exported at native and half size. Always shown on white or near-white. The official site's `i/logo.gif` (253×45) is lower resolution, so it was not used. **A high-resolution master should be requested from the company.** |
| Favicons & app icons | `public/favicon.ico`, `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Derived from the same wordmark | As above | The "U" glyph of the wordmark on a white tile | Cropped glyph, scaled; no new mark invented |
| Hero 3D drill (real-time) | `src/hero/drill-model.ts`, `src/hero/drill-scene.ts` | Original procedural model by Austere Automations for this concept | Original work | A generic, unbranded cordless drill | See [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md) |
| Hero poster renders | `public/hero/drill-poster-{desktop,mobile}.{avif,webp,png}` | Rendered from the same procedural scene with `scripts/render-poster.cjs` | Original work | Same generic drill | Transparent captures of the WebGL canvas, encoded as AVIF / WebP / PNG |
| UI icons | `src/lib/icons.ts` | Original 24×24 stroke icons | Original work | Interface symbols | — |
| Map of Belize | `src/data/belize-map.json`, `src/components/BelizeMap.astro` | Natural Earth 1:10m Admin 0 countries, https://www.naturalearthdata.com/ (via github.com/nvkelso/natural-earth-vector) | Public domain | Belize outline with neighbouring borders | Projected (equirectangular with latitude correction), simplified and clipped at build time. Pins are approximate town positions. |
| Open Graph image | `public/og-concept.jpg` | Composed from the poster render and the wordmark | Original composition | Concept preview card | Includes "Independent concept by Austere Automations · not the official website" |
| Archivo (display type) | `public/fonts/archivo-var.woff2` | Omnibus-Type, via `@fontsource-variable/archivo` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Archivo.txt`) | — | Variable axes restricted (wght 600–800, wdth 100–112) and subset to Latin / Latin-1 with fontTools |
| Inter (text type) | `public/fonts/inter-var.woff2` | Rasmus Andersson, via `@fontsource-variable/inter` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Inter.txt`) | — | Weight axis restricted to 400–700 and subset to Latin / Latin-1 |
| JetBrains Mono (labels) | `public/fonts/jetbrains-mono-500.woff2` | JetBrains, via `@fontsource/jetbrains-mono` | SIL Open Font License 1.1 (`public/fonts/LICENSE-JetBrainsMono.txt`) | — | None |

## Images from Universal Hardware's current website

These photos are the only product imagery on the concept. They appear in the homepage department tiles, the product finder, the search cards, each category page (hero, gallery and related cards) and the 404 page. Each category uses its sharpest available photo: the 489 px product shot where the Meilun & Lifan page has one (generators, water pumps, motorcycles), otherwise the 200 px Product Listing photo. Small photos are never shown at more than 1.25× their own size.

Retrieved from `https://universalhardware.bz/i/…` on 28 October 2026 for this private concept, at the request of the concept's author. They belong to Universal Hardware Company Ltd. and the respective manufacturers. They are shown as the company presents them, with the caption "As pictured on universalhardware.bz" or "Pictured on the current website". They depict example products, not confirmed stock or current models. **Request high-resolution, approved files before any public use.**

| File (`public/site-images/…`) | Source URL | Used on | Edits |
|---|---|---|---|
| `categories/welding-supplies` | https://universalhardware.bz/i/arc-welder.jpg | Welding Supplies page, search card, Welding & Shop department tile | WebP copy added (JPEG kept) |
| `categories/power-tools` | https://universalhardware.bz/i/power-tools.jpg | Power Tools | WebP copy |
| `categories/hand-tools` | https://universalhardware.bz/i/handtools.jpg | Hand Tools, 404 page | WebP copy |
| `categories/lawn-and-garden` | https://universalhardware.bz/i/lawn.jpg | Lawn and Garden | Source file is truncated by 2 bytes; decoded and re-saved as a complete JPEG (q92) + WebP |
| `categories/lighting-and-fans` | https://universalhardware.bz/i/fans.jpg | Lighting and Fans | WebP copy |
| `categories/woodworking` | https://universalhardware.bz/i/woodwork.jpg | Woodworking | WebP copy |
| `categories/generators` | https://universalhardware.bz/i/generators.jpg | Generators gallery | WebP copy |
| `categories/water-pumps` | https://universalhardware.bz/i/waterpumps.jpg | Water Pumps gallery | WebP copy |
| `categories/household` | https://universalhardware.bz/i/bbqgrill.jpg | Household | Source file is truncated by 4 bytes; re-saved as a complete JPEG (q92) + WebP |
| `categories/agriculture` | https://universalhardware.bz/i/barbwire.jpg | Agriculture | WebP copy |
| `categories/shop-tools` | https://universalhardware.bz/i/compressor.jpg | Shop Tools (photo shows a Porter-Cable compressor, a brand not on the Brands page) | WebP copy |
| `products/meilun-trail-motorcycle` | https://universalhardware.bz/i/ML150GY-4RED.jpg | Motorcycles hero, department tile, finder | WebP copy |
| `products/lifan-street-motorcycle` | https://universalhardware.bz/i/lifan-lf125-5-red.jpg | Motorcycles gallery | WebP copy |
| `products/lifan-scooter` | https://universalhardware.bz/i/lifan-lf100-blue.jpg | Motorcycles gallery | WebP copy |
| `products/meilun-cargo-motorcycle` | https://universalhardware.bz/i/ml150zh-3.jpg | Motorcycles gallery, homepage "Beyond the shelf" panel | WebP copy |
| `products/hisun-utv` | https://universalhardware.bz/i/hisun-HS750UTV.jpg | Motorcycles gallery | WebP copy |
| `products/lifan-generator` | https://universalhardware.bz/i/meilun/lifan-5500.jpg | Generators hero, department tile, finder | WebP copy |
| `products/meilun-generator` | https://universalhardware.bz/i/meilun/8000E.jpg | Generators gallery | WebP copy |
| `products/meilun-water-pump` | https://universalhardware.bz/i/meilun/50ZB.jpg | Water Pumps hero, department tile, finder | WebP copy |
| `logos/*` (18 files) | `https://universalhardware.bz/i/<name>-logo.gif` etc. (Brands page); `lifan-logo.png` from the Meilun & Lifan page; `hisun-logo.png` from the Hisun page | Homepage brand wall, Brands page | **None**: original files, renamed by brand id |

Logos are manufacturers' trademarks, shown here because Universal Hardware's own Brands page displays them. Brands the website names without a logo (Master Mechanic, MTD, Hunter, Grizzly, Denyo, Honda) appear as text. Exact paths and alt text for every image are recorded in `src/data/site-images.ts`.

## Brand names

Brand names and logos appear for identification because Universal Hardware's website names and displays them. Trademarks belong to their owners. A mention does not imply a current distribution agreement, endorsement or stock.

## Software

| Package | Licence |
|---|---|
| Astro, @astrojs/preact | MIT |
| Preact | MIT |
| Three.js (incl. `RoundedBoxGeometry` from examples) | MIT |
| axe-core (dev, testing only) | MPL-2.0 |
| Playwright (dev, testing only) | Apache-2.0 |
