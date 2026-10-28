# Asset attributions

No stock photography, scraped images, manufacturer logos, staff portraits or customer images are used anywhere in this concept.

| Asset | Files | Source / author | Licence / basis | Depicts | Edits |
|---|---|---|---|---|---|
| Universal Hardware wordmark | `public/brand/universal-hardware-logo{,-sm}.{webp,png}` | User-supplied reference JPEG `universal_hardware_reference_logo_user_supplied.jpg` (888×249) | Property of Universal Hardware Company Ltd.; used for a private, clearly labelled concept presentation only | The company wordmark | Cropped; flat light-grey background converted to transparency by per-pixel coverage estimation (no redrawing, no vectorising, no geometry or colour changes); exported at native and half size. Always shown on white or near-white. The official site's `i/logo.gif` (253×45) is lower resolution, so it was not used. **A high-resolution master should be requested from the company.** |
| Favicons & app icons | `public/favicon.ico`, `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Derived from the same wordmark | As above | The "U" glyph of the wordmark on a white tile | Cropped glyph, scaled; no new mark invented |
| Hero 3D drill (real-time) | `src/hero/drill-model.ts`, `src/hero/drill-scene.ts` | Original procedural model by Austere Automations for this concept | Original work | A generic, unbranded cordless drill | See [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md) |
| Hero poster renders | `public/hero/drill-poster-{desktop,mobile}.{avif,webp,png}` | Rendered from the same procedural scene with `scripts/render-poster.cjs` | Original work | Same generic drill | Transparent captures of the WebGL canvas, encoded as AVIF / WebP / PNG |
| Category illustrations (12) | `src/lib/category-art.ts` | Original line drawings by Austere Automations | Original work | Generic forms: drill, MIG torch, wrench & hammer, mower, ceiling fan, saw blade, generator, pump, refrigerator, fence wire, compressor, motorcycle | Hand-authored SVG. None depicts a specific product, model or brand. |
| UI icons | `src/lib/icons.ts` | Original 24×24 stroke icons | Original work | Interface symbols | — |
| Map of Belize | `src/data/belize-map.json`, `src/components/BelizeMap.astro` | Natural Earth 1:10m Admin 0 countries, https://www.naturalearthdata.com/ (via github.com/nvkelso/natural-earth-vector) | Public domain | Belize outline with neighbouring borders | Projected (equirectangular with latitude correction), simplified and clipped at build time. Pins are approximate town positions. |
| Open Graph image | `public/og-concept.jpg` | Composed from the poster render and the wordmark | Original composition | Concept preview card | Includes "Independent concept by Austere Automations · not the official website" |
| Archivo (display type) | `public/fonts/archivo-var.woff2` | Omnibus-Type, via `@fontsource-variable/archivo` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Archivo.txt`) | — | Variable axes restricted (wght 600–800, wdth 100–112) and subset to Latin / Latin-1 with fontTools |
| Inter (text type) | `public/fonts/inter-var.woff2` | Rasmus Andersson, via `@fontsource-variable/inter` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Inter.txt`) | — | Weight axis restricted to 400–700 and subset to Latin / Latin-1 |
| JetBrains Mono (labels) | `public/fonts/jetbrains-mono-500.woff2` | JetBrains, via `@fontsource/jetbrains-mono` | SIL Open Font License 1.1 (`public/fonts/LICENSE-JetBrainsMono.txt`) | — | None |

## Brand names

Brand names (Makita, Lincoln Electric, ECHO / Shindaiwa, etc.) appear as **plain text only**, for identification, because Universal Hardware's website names them. No brand logos are reproduced. Trademarks belong to their owners. A mention does not imply a current distribution agreement, endorsement or stock.

## Software

| Package | Licence |
|---|---|
| Astro, @astrojs/preact | MIT |
| Preact | MIT |
| Three.js (incl. `RoundedBoxGeometry` from examples) | MIT |
| axe-core (dev, testing only) | MPL-2.0 |
| Playwright (dev, testing only) | Apache-2.0 |
