# Universal Hardware — Independent Website Concept

> **Independent concept demonstration by Austere Automations. Not commissioned, approved or affiliated with Universal Hardware Company Ltd.**
> Product information is illustrative and based on Universal Hardware's public website as viewed on 28 October 2026. No stock or availability is shown. The only prices are the Shop's past sale prices, copied from the company's February 2026 sale graphics. Nothing on the site takes a payment or sends any enquiry or order.

A static, mobile-first concept site with a real-time 3D hero, a searchable catalogue of the 12 publicly listed product categories, a Shop with cart and a credit/debit card checkout that runs in demo mode, a guided product finder, a session-only Enquiry Summary, a rule-based Product Guide (English and Spanish), brand and branch pages, and the disclosures and data safeguards required for an unapproved private demo.

| | |
|---|---|
| Stack | Astro 7 (static output) · TypeScript · Preact islands · Three.js (vanilla, lazy-loaded) · hand-written CSS |
| Output | 55 prerendered pages, 11.1 MB total, `index.html` at the root of `dist/` |
| Netlify ZIP | `deliverables/universal-hardware-concept-netlify.zip` |
| Screenshots | `deliverables/screenshots/` |
| QA | [`QA_REPORT.md`](QA_REPORT.md) · raw results in `tests/results/qa-results.json` |

## Quick start

Requires Node 22.12+.

```bash
npm ci                 # install exact locked versions
npm run build          # astro build + post-build safety checks
npm run preview        # Netlify-like local server on http://localhost:4322
npm run zip            # package dist/ as the Netlify drag-and-drop ZIP
npm run release        # one build -> Netlify ZIP + private preview copy, always in step
```

`npm run dev` starts the Astro dev server with hot reload.

## Testing

```bash
npm run test:logic     # Product Guide conversations + every finder answer combination
npm run test:e2e       # Playwright suite against the preview server (start `npm run preview` first)
npm test               # both
```

The end-to-end suite needs a Chromium build for Playwright (`npx playwright install chromium`, or set `PLAYWRIGHT_BROWSERS_PATH`). It checks every route on direct load, metadata and disclaimers, console errors, horizontal overflow at 7 viewports, navigation, the mobile menu's keyboard behaviour, search and filters, the finder, the Enquiry Summary (add, remove, copy, reset, focus trap), the Product Guide's required conversations, the Shop, cart and demo checkout (including that the checkout has no card fields and sends no request), session persistence, WebGL, the no-WebGL fallback and reduced motion, link formats, axe-core accessibility, and a network audit that fails if anything contacts a third-party origin.

Other scripts:

| Script | Purpose |
|---|---|
| `npm run posters` | Re-render the hero poster images from the live 3D scene (preview server must be running) |
| `npm run screenshots` | Regenerate `deliverables/screenshots/` |
| `npm run fonts` | Rebuild the trimmed self-hosted fonts (needs `pip install fonttools brotli`) |
| `npm run check` | TypeScript / Astro type check |

## Routes

| Route | Content |
|---|---|
| `/` | Showcase homepage: image slideshow, then the 3D hero, 8 departments, product finder, brand wall, service, branches, closing CTA |
| `/products/` | Instant search across categories, product types and brands; department and brand filters; URL-synced (`?q=`, `?dept=`, `?brand=`) |
| `/products/[slug]/` | 12 category pages: `power-tools`, `welding-supplies`, `generators`, `water-pumps`, `lawn-and-garden`, `motorcycles`, `household`, `lighting-and-fans`, `woodworking`, `shop-tools`, `agriculture`, `hand-tools` |
| `/shop/` | Shop: 32 items from the February 2026 sale graphics, with filters and add to cart (deep links: `/shop/#motorcycles`) |
| `/shop/[id]/` | 32 product pages: photo, model, description, colours, quantity, source graphic |
| `/cart/` | Cart: quantities, remove, total |
| `/checkout/` | Checkout: contact details (memory only), branch collection, demo card step, confirmation |
| `/find/` | Full-page product finder (deep links: `/find/?need=backup-power`) |
| `/brands/` | Every brand the website names, with the exact page and basis for each mention |
| `/locations/` | Both branches: listed hours, tel / WhatsApp links, service lines, map |
| `/about/` | Source-backed company overview and the full source list |
| `/concept/` | Concept statement, what works vs. what's illustrative, data handling, approvals needed |
| `/404.html` | Served by Netlify for unknown URLs |

## Private preview artifact (owner review)

For day-to-day review without using Netlify credits, the exact production build is also published as a **private** Claude artifact for the project owner only.

```bash
npm run release            # build, then the Netlify ZIP and .preview/ (gitignored) from that same build
```

Every preview publish ships with the ZIP from the same build, so the two always match.

`scripts/make-preview.mjs` adapts plumbing only; design, scripts, 3D and content are unchanged:
- the main page is emitted without its outer `<html>/<head>/<body>`, because the host supplies them
- root-absolute URLs become relative (`../products/index.html`), and links rendered at runtime are rewritten by a small injected script
- `_assets/` is renamed `assets/`, because the host reserves names starting with `_`
- fonts are inlined as data URIs
- Netlify-only files are omitted

The preview is not for sharing. The Netlify ZIP remains the deliverable.

## Deploying (private demo only)

1. `npm run build && npm run zip`
2. In Netlify: **Add new site → Deploy manually**, drop `deliverables/universal-hardware-concept-netlify.zip`.
3. Use an Austere-controlled Netlify subdomain. Never deploy to or near `universalhardware.bz`.
4. Optionally update `site` in `astro.config.mjs` to the real subdomain (it only affects canonical and Open Graph URLs) and rebuild.
5. Optional: enable Netlify's site password protection for the private link.

Indexing is blocked three ways: `<meta name="robots" content="noindex, nofollow…">` on every page, an `X-Robots-Tag` header in `_headers`, and `robots.txt` disallowing everything. `_headers` also sets a strict Content-Security-Policy (self-only), so the demo cannot load third-party scripts. `netlify.toml` is provided for an optional Git-based deploy.

## Architecture

```
src/
  data/         Source-backed records: categories, departments, brands, branches, sources, site copy,
                site-images (photos and logos from universalhardware.bz, with source URLs),
                shop (the 32 Shop items as printed in the sale graphics)
  lib/          enquiry-store (sessionStorage), cart-store + tab-storage, search, finder rules, icons,
                asset-url, payments/ (PaymentProvider contract + demo provider),
                guide/ (engine contract, local rule engine, optional Chatbase adapter)
  hero/         HeroCarousel.astro (homepage slideshow), Hero.astro, hero-loader (progressive enhancement),
                drill-scene + drill-model (Three.js)
  islands/      Preact: GlobalUI (Enquiry drawer, Product Guide, toasts), ProductFinder, CatalogueSearch, SitePicture,
                CartView, Checkout
  components/   Astro: header, footer, utility bar, branch card, map, department tile, page hero, site photo, product card
  pages/        Routes (see above)
  styles/       global.css (tokens, base), components.css, islands.css, shop.css (Shop, cart, checkout)
scripts/        postbuild checks, ZIP, posters, screenshots, fonts, local server, News photo crops, Shop photo cut-outs,
                slideshow encoding (build-hero-slides.mjs),
                3D drill from photo (build-hp333d.py)
tests/          guide-cases.ts (logic), run-qa.cjs (end-to-end)
```

Product photos and brand logos in `public/site-images/` are copied from Universal Hardware's current website and labelled as such on the page. Each file's source URL is recorded in `src/data/site-images.ts` and [`ASSET_ATTRIBUTIONS.md`](ASSET_ATTRIBUTIONS.md). The main product photos are cropped from the 2026 News / Promotions graphics (`scripts/crop-news-photos.py`), keeping only the product. Original high-resolution files should be requested before any launch.

Design tokens come from the supplied wordmark: blue `#5592CB` (sampled), action blue `#1768B4`, graphite `#121D29`, ink `#0D1C2C`. Typefaces are Archivo (display), Inter (text) and JetBrains Mono (labels), all self-hosted.

### Homepage slideshow

The page opens with a full-width slideshow above the 3D hero: a storefront with a Lifan motorcycle, a store floor and a paint aisle. These are concept images supplied for this presentation, not photographs of a branch, and each carries a small "Concept image · not a photograph" label. Every slide has a 16:9 desktop and a 4:5 mobile composition. Phones (below 768 px) get the mobile one and tablets and desktops the desktop one, so neither is cropped into the other's shape. Slides fade every 7 seconds in an endless loop. Choosing a slide, swiping, the arrow keys or the pause button stop autoplay. It waits while off-screen or in a background tab, and starts paused with reduced motion. Only the first image loads with the page; each later one is fetched 3.5 s before it is due. `scripts/build-hero-slides.mjs` encodes the source PNGs as AVIF / WebP (two widths each) plus a JPEG fallback, under content-hashed names listed in `src/hero/slides.json`.

### 3D hero

The hero is the Makita HP333D kit (drill, 1.5Ah battery and charger) from Universal Hardware's own product photo, given 3D depth: `scripts/build-hp333d.py` cuts the kit out of the photo and inflates each piece's outline into a solid, and the photo is mapped onto it. The hero ships with a static render of the same scene (AVIF/WebP/PNG), so the first paint is instant and identical. The hero sits directly below the homepage slideshow. The Three.js bundle (≈122 KB gzip) and the kit data (≈161 KB) load only once a fifth of the stage is on screen, then on the next interaction or after a short idle period. Shaders compile asynchronously, and the scene pauses off-screen or in background tabs, is disposed on page hide, caps resolution and frame rate on low-power devices, and respects `prefers-reduced-motion`, the footer "Reduce motion" toggle and the "Pause 3D motion" button. Without WebGL 2 the static render stays and is labelled "Static render". The drill data and posters carry a content hash in their file names (listed in `src/hero/hp333d.json` and `src/hero/posters.json`), so an update is never served from a stale cache. Regenerate the posters with `npm run posters` (serve `dist/` first). See [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md).

### Shop and payments

The Shop lists the 32 single-product graphics of the company's Friends & Family Sale (Spanish Lookout, 19–21 February 2026). Model, description, colours and price are copied as printed and labelled as past sale prices. The photos are cut out of the same graphics, without the price text, by `scripts/crop-shop-photos.py`. The cart keeps ids, colours and quantities only.

Checkout reaches card processors only through the `PaymentProvider` interface in `src/lib/payments/`. The only provider shipped is `demo`: a stand-in for the processor's hosted card fields that collects nothing and simulates an approved or declined answer. Going live needs Universal Hardware's own merchant account and processor, a small server step for the secret key, and current prices. See [`PAYMENTS.md`](PAYMENTS.md).

### Privacy model

- No analytics, cookies, trackers, third-party fonts or scripts. The CSP enforces this.
- The cart, Enquiry Summary, preferred branch and motion setting live in `sessionStorage` (cleared when the tab closes). Where it is blocked, the cart falls back to the tab's `window.name`. Checkout contact details and Product Guide conversations are kept in memory only.
- The only way data leaves the page is the visitor copying the summary, or tapping a phone, WhatsApp, map, email or official-website link. The checkout sends nothing.

## Optional live AI (disabled by default)

The Product Guide panel talks to an engine through `src/lib/guide/types.ts`. The default `LocalGuideEngine` is deterministic and says it is not live AI. To demo an **Austere-owned, approved Chatbase test agent**:

```bash
PUBLIC_CHATBASE_AGENT_ID=<test-agent-id> npm run build
```

This adds a "Try the live AI test widget" option that loads Chatbase's embed only when clicked. You must also allow `https://www.chatbase.co` in `script-src`, `connect-src` and `frame-src` in `public/_headers`. Never put API keys in `PUBLIC_*` variables or frontend code. Train the agent only on `AI_EMPLOYEE_KNOWLEDGE_SEED` content and keep its disclaimer visible. This path is untested because no agent ID was supplied.

## Browser support

Current Chrome, Edge, Safari (iOS 16.4+ / macOS 13+) and Firefox. The 3D hero needs WebGL 2; other browsers get the static render. Native `<dialog>`, `inert`, `:has()` and AVIF are used, with fallbacks where they matter (WebP/PNG posters, clipboard fallback).

## Repository note

This project lives in `universal-hardware/` inside the `greaterbelizemedia.github.io` repository, which is **public** at the time of writing. GitHub Pages is not enabled. If Pages were enabled on a branch containing this folder, its source files and documents would be publicly served, so keep the concept off any Pages-publishing branch or move it to a private repository.

## Documentation

- [`SOURCES.md`](SOURCES.md): public pages used and the claims each supports
- [`ASSET_ATTRIBUTIONS.md`](ASSET_ATTRIBUTIONS.md): every visual asset and its licence
- [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md): how the 3D Makita drill is built from the company's photo
- [`DEMO_CAVEATS.md`](DEMO_CAVEATS.md): restrictions, open questions and approvals required
- [`PAYMENTS.md`](PAYMENTS.md): how the demo checkout works, and what live card payments need
- [`QA_REPORT.md`](QA_REPORT.md): test matrix, measurements and outstanding issues
- [`PITCH_STORYBOARD.md`](PITCH_STORYBOARD.md): 45-second walkthrough
- [`PRODUCTION_OPTIONS.md`](PRODUCTION_OPTIONS.md): possible next-phase options
