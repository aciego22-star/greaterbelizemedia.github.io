# Asset attributions

No stock photography, social-media images, staff portraits or customer images are used. Product photos and brand logos come only from Universal Hardware's own public website (listed below).

| Asset | Files | Source / author | Licence / basis | Depicts | Edits |
|---|---|---|---|---|---|
| Universal Hardware wordmark | `public/brand/universal-hardware-logo{,-sm}.{webp,png}` | User-supplied reference JPEG `universal_hardware_reference_logo_user_supplied.jpg` (888×249) | Property of Universal Hardware Company Ltd.; used for a private, clearly labelled concept presentation only | The company wordmark | Cropped; flat light-grey background converted to transparency by per-pixel coverage estimation (no redrawing, no vectorising, no geometry or colour changes); exported at native and half size. Always shown on white or near-white. The official site's `i/logo.gif` (253×45) is lower resolution, so it was not used. **A high-resolution master should be requested from the company.** |
| Favicons & app icons | `public/favicon.ico`, `favicon-16/32.png`, `apple-touch-icon.png`, `icon-192/512.png` | Derived from the same wordmark | As above | The "U" glyph of the wordmark on a white tile | Cropped glyph, scaled; no new mark invented |
| Hero 3D drill kit (real-time) | `public/hero/hp333d{,-lo}.<hash>.webp`, `hp333d-{depth,snap}.<hash>.png` (names in `src/hero/hp333d.json`); `src/hero/drill-model.ts`, `drill-scene.ts`; built by `scripts/build-hp333d.py` | Universal Hardware's product photo (https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg), inflated into 3D by Austere Automations | Company photo, used as published for this private concept; Makita marks belong to Makita Corporation | The Makita HP333D 12V drill, 1.5Ah battery and DC10WD charger, laid out as photographed | Cut out, edge colours cleaned, upscaled 2x; depth estimated from the outline. See [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md) |
| Hero poster renders | `public/hero/drill-poster-{desktop,mobile}.<hash>.{avif,webp,png}` (names in `src/hero/posters.json`) | Rendered from the same scene with `scripts/render-poster.cjs` | As above | Same Makita drill | Transparent captures of the WebGL canvas, encoded as AVIF / WebP / PNG |
| UI icons | `src/lib/icons.ts` | Original 24×24 stroke icons | Original work | Interface symbols | — |
| Map of Belize | `src/data/belize-map.json`, `src/components/BelizeMap.astro` | Natural Earth 1:10m Admin 0 countries, https://www.naturalearthdata.com/ (via github.com/nvkelso/natural-earth-vector) | Public domain | Belize outline with neighbouring borders | Projected (equirectangular with latitude correction), simplified and clipped at build time. Pins are approximate town positions. |
| Open Graph image | `public/og-concept.jpg` | Composed from the poster render and the wordmark | Original composition | Concept preview card | Includes "Independent concept by Austere Automations · not the official website" |
| Archivo (display type) | `public/fonts/archivo-var.woff2` | Omnibus-Type, via `@fontsource-variable/archivo` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Archivo.txt`) | — | Variable axes restricted (wght 600–800, wdth 100–112) and subset to Latin / Latin-1 with fontTools |
| Inter (text type) | `public/fonts/inter-var.woff2` | Rasmus Andersson, via `@fontsource-variable/inter` | SIL Open Font License 1.1 (`public/fonts/LICENSE-Inter.txt`) | — | Weight axis restricted to 400–700 and subset to Latin / Latin-1 |
| JetBrains Mono (labels) | `public/fonts/jetbrains-mono-500.woff2` | JetBrains, via `@fontsource/jetbrains-mono` | SIL Open Font License 1.1 (`public/fonts/LICENSE-JetBrainsMono.txt`) | — | None |

## Images from Universal Hardware's current website

These photos and the News crops below are the only product imagery on the concept. They appear in the homepage department tiles, the product finder, the search cards, each category page (hero, gallery and related cards) and the 404 page. Each category uses its sharpest available photo: the 489 px product shot where the Meilun & Lifan page has one (generators, water pumps, motorcycles), otherwise a crop from a News / Promotions post (see the next section). Small photos are never shown at more than 1.25× their own size.

Retrieved from `https://universalhardware.bz/i/…` on 28 October 2026 for this private concept, at the request of the concept's author. They belong to Universal Hardware Company Ltd. and the respective manufacturers. They are shown as the company presents them, with the caption "As pictured on universalhardware.bz" or "Pictured on the current website". They depict example products, not confirmed stock or current models. **Request high-resolution, approved files before any public use.**

| File (`public/site-images/…`) | Source URL | Used on | Edits |
|---|---|---|---|
| `categories/welding-supplies` | https://universalhardware.bz/i/arc-welder.jpg | Welding Supplies gallery | WebP copy added (JPEG kept) |
| `categories/power-tools` | https://universalhardware.bz/i/power-tools.jpg | Power Tools gallery | WebP copy |
| `categories/hand-tools` | https://universalhardware.bz/i/handtools.jpg | Hand Tools gallery | WebP copy |
| `categories/lawn-and-garden` | https://universalhardware.bz/i/lawn.jpg | Lawn and Garden gallery | Source file is truncated by 2 bytes; decoded and re-saved as a complete JPEG (q92) + WebP |
| `categories/lighting-and-fans` | https://universalhardware.bz/i/fans.jpg | Lighting and Fans gallery | WebP copy |
| `categories/woodworking` | https://universalhardware.bz/i/woodwork.jpg | Woodworking gallery | WebP copy |
| `categories/generators` | https://universalhardware.bz/i/generators.jpg | Generators gallery | WebP copy |
| `categories/water-pumps` | https://universalhardware.bz/i/waterpumps.jpg | Water Pumps gallery | WebP copy |
| `categories/household` | https://universalhardware.bz/i/bbqgrill.jpg | Household gallery | Source file is truncated by 4 bytes; re-saved as a complete JPEG (q92) + WebP |
| `categories/agriculture` | https://universalhardware.bz/i/barbwire.jpg | Agriculture gallery | WebP copy |
| `categories/shop-tools` | https://universalhardware.bz/i/compressor.jpg | Shop Tools gallery (photo shows a Porter-Cable compressor, a brand not on the Brands page) | WebP copy |
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

## Product photos cropped from News / Promotions posts

The sharpest product imagery on the company's site is in its 2026 News / Promotions posts (https://universalhardware.bz/news/): 1080 × 1080 sale and Expo graphics. They carry prices, sale dates, phone numbers and sale wording, none of which may appear in the concept's images. So only the product photograph is cropped out of each graphic. Every crop box was checked pixel by pixel so that no price, date, phone number, logo lock-up or sale text is included. The crops are 370–638 px wide, two to three times the 200 px Product Listing photos they replace as the main image. The Product Listing photos still appear in each category page's "Pictured on the current website" gallery.

Edits are limited to cropping, plus presentation clean-up so the photos sit on the site's white plates. Near-white, colourless backdrop texture is lifted to pure white. On the grey or blue Expo and Mega Sale backgrounds, the outer 12% is faded to white. Products are not retouched. `scripts/crop-news-photos.py` reproduces every file exactly from the original uploads. Retrieved 29 October 2026.

| File (`public/site-images/news/…`) | Source (1080 × 1080 graphic) | Post | Crop box (x1, y1, x2, y2) | Used on | Edits |
|---|---|---|---|---|---|
| `makita-drill-kit` | https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg | Friends & Family Sale 2026 | 0, 362, 638, 958 | Power Tools hero, tile, finder, search card | Cropped; near-white backdrop lifted to white |
| `knova-table-saws` | https://universalhardware.bz/news/wp-content/uploads/FF-Sale-Saws.jpg | Friends & Family Sale 2026 | 20, 385, 650, 790 | Woodworking | Cropped; backdrop lifted to white |
| `lincoln-welders` | https://universalhardware.bz/news/wp-content/uploads/Mega-Sale-i9-Lincoln.jpg | Universal Mega Sale 2026 | 90, 440, 600, 905 | Welding Supplies, Welding & Shop tile | Cropped; blue flyer background faded to white at the edges |
| `hoteche-air-compressors` | https://universalhardware.bz/news/wp-content/uploads/Mega-Sale-H-Air-Compressors.jpg | Universal Mega Sale 2026 | 110, 445, 670, 910 | Shop Tools | Cropped; edges faded to white |
| `hoteche-socket-set` | https://universalhardware.bz/news/wp-content/uploads/EXPO-2026-Hoteche.jpg | Spanish Lookout Commercial Industrial Expo 2026 | 170, 415, 540, 835 | Hand Tools, 404 page | Cropped; edges faded to white |
| `cub-cadet-zero-turn` | https://universalhardware.bz/news/wp-content/uploads/FF-Sale-Cub-Cadet-4.jpg | Friends & Family Sale 2026 | 55, 365, 645, 790 | Lawn and Garden | Cropped; backdrop lifted to white |
| `hunter-ceiling-fans` | https://universalhardware.bz/news/wp-content/uploads/FF-Sale-Hunter-4.jpg | Friends & Family Sale 2026 | 100, 380, 690, 820 | Lighting and Fans | Cropped; backdrop lifted to white |
| `sankey-refrigerators` | https://universalhardware.bz/news/wp-content/uploads/FF-Sale-Sankey-Refrigerators.jpg | Friends & Family Sale 2026 | 120, 490, 650, 760 | Household, Home & Appliances tile | Cropped; backdrop lifted to white |
| `gaucho-barbed-wire` | https://universalhardware.bz/news/wp-content/uploads/EXPO-2026-Wire.jpg | Spanish Lookout Commercial Industrial Expo 2026 | 125, 445, 565, 845 | Agriculture | Cropped; edges faded to white |
| `makita-clinic` | https://universalhardware.bz/news/wp-content/uploads/MakitaClinic-feb2026.jpg | Makita Clinic (Friends & Family 2026) | 0, 0, 1080, 410 | Homepage "Beyond the shelf" panel | Cropped above the event banner; no other change |

Some photographed brands are not on the website's Brands page: Hoteche (hand tools, shop tools) and Knova (woodworking). They appear because the company promoted them in 2026. A photo does not confirm current stock, price or model.

## Shop photos cut out of the Friends & Family Sale graphics

The Shop's 32 product photos (`public/site-images/shop/<model>.{jpg,webp}`) come from the single-product graphics of Universal Hardware's Friends & Family Sale (Spanish Lookout, 19–21 February 2026), at `https://universalhardware.bz/news/wp-content/uploads/<file>.jpg`. Each product's source file is recorded in `src/data/shop.ts` and linked from its Shop page. Retrieved 29 October 2026.

`scripts/crop-shop-photos.py` reproduces every file from the original uploads. Below the sale banner, it keeps the large connected shape on the product side of the graphic. The model badge, description, price, logo and contact details are separate shapes, and are painted out with the backdrop, as are three areas where text reaches into the product side (`PAINT_OUT` in the script). Near-white backdrop streaks are lifted to white. Each cut-out is centred on a white 4:3 plate (up to 720 × 540). The products are not retouched. No price, date or phone number appears in any image. The price is shown as text beside the photo, labelled as a February 2026 sale price.

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
