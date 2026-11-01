# Universal Hardware — Independent Website Concept

> **Independent concept demonstration by Austere Automations. Not commissioned, approved or affiliated with Universal Hardware Company Ltd.**
> Product information is illustrative and based on Universal Hardware's public website as viewed on 28 October 2026. No stock or availability is shown. The only prices are the Shop's past sale prices, copied from the company's February 2026 sale graphics. Nothing on the site takes a payment or sends any enquiry or order.

A static, mobile-first concept site with an interactive 3D hero, a searchable catalogue of the 12 publicly listed product categories, a Shop with cart and a credit/debit card checkout that runs in demo mode, a guided product finder, the Universal AI assistant (rule-based in this build), a What's New at Universal page of sales and events, brand and branch pages, a one-tap English / Spanish switch for the whole site, and the data safeguards required for an unapproved private demo. On-page disclosure is the "Concept Preview" badge in the top bar and the paragraph in the footer.

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
npm run test:logic     # Universal AI conversations + every finder answer combination
npm run test:e2e       # Playwright suite against the preview server (start `npm run preview` first)
npm test               # both
```

The end-to-end suite needs a Chromium build for Playwright (`npx playwright install chromium`, or set `PLAYWRIGHT_BROWSERS_PATH`). It checks every route on direct load, metadata and disclaimers, console errors, horizontal overflow at 7 viewports, navigation, the mobile menu's keyboard behaviour, search and filters, the finder, the English / Spanish switch (whole site, islands, Universal AI, checkout, Spanish browser default, no overflow), Universal AI's launcher, greeting and required conversations, the What's New page, the Shop, cart and demo checkout (including that the checkout has no card fields and sends no request), session persistence, WebGL, the no-WebGL fallback and reduced motion, link formats, axe-core accessibility, and a network audit that fails if anything contacts a third-party origin.

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

Every page opens at its top, on the deployed site and in the preview. Links that name an item on the next page (`/brands/#makita`, `/locations/#belize-city`, `/whats-new/#mega-sale-2026`) don't jump to it: the item carries `data-anchor` instead of an `id`, and `src/lib/page-behaviors.ts` highlights it (on Brands it also moves to the front of its list). Same-page links such as the hero's "Find the Right Solution" still scroll to their section.

The preview host can show the page in a frame as tall as the page itself, so the host page keeps its scroll position when a link opens a new page. Inside a frame only, `page-behaviors.ts` brings the top of the page into view when the top is out of sight: as the page opens, after it loads, and on the tap that leaves for another page (never once the visitor has started scrolling). A deployed site is never framed, so this does nothing there.

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
                shop (the 32 Shop items as printed in the sale graphics), shop-about (their short descriptions, EN/ES)
  lib/          site-state (branch + UI events), cart-store + tab-storage, i18n (EN/ES switch), search, finder rules, icons,
                asset-url, payments/ (PaymentProvider contract + demo provider),
                guide/ (engine contract, local rule engine, optional Chatbase adapter)
  hero/         HeroCarousel.astro (homepage slideshow), Hero.astro, hero-loader (progressive enhancement),
                drill-scene + drill-model (Three.js)
  i18n/         es.json (Spanish dictionary, keyed by the English text) + es.ts (runtime patterns)
  islands/      Preact: GlobalUI (Universal AI, toasts), ProductFinder, CatalogueSearch, SitePicture,
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

### English / Spanish

The EN / ES button next to the cart (and the menu on phones) switches the whole site, instantly and without a reload. Pages are built in English. `src/lib/i18n.ts` applies the Spanish dictionary (`src/i18n/es.json`, about 1,000 strings, loaded only when Spanish is chosen) to every text node, `alt` / `aria-label` / `placeholder` / `title` and the page title, and a MutationObserver translates whatever the islands render later (finder, search, cart, checkout, toasts). `src/i18n/es.ts` covers runtime strings such as counts, prices and product names. Universal AI answers in the site's language. The choice is kept for the tab; on a first visit a Spanish browser opens in Spanish. Switching back restores the original English.

To add or change copy: edit the English, rebuild, then run `node scripts/collect-text.cjs` (all visible text, including island states) and `node scripts/collect-text.cjs --lang=es && node scripts/i18n-check.mjs`, which lists any English still showing in Spanish. Add those strings to `es.json`.

### What's New at Universal

`/whats-new/` (in the header as "What's New at Universal", shortened to "What's New" between 1000 and 1119 px) lists the company's sales and events, newest first, from its News / Promotions posts: the Mega Sale, the Friends & Family Sale, the Spanish Lookout Expo, the GST Holiday Sale and the Makita Clinics. Each post on the company's site is a set of flyers, so each entry's date, place and details are read from the post's main flyer, which is shown beside it (resized by `scripts/build-whats-new-flyers.py`; no prices). To add an event, put its flyer in `public/site-images/whats-new/` and add an entry at the top of `NEWS` in `src/data/whats-new.ts`, with its Spanish date and place for Universal AI's replies, and add the new strings to `src/i18n/es.json`. Universal AI answers "What's new?" and "Is there a sale coming up?" from the same data.

### Universal AI: what it knows and does

Universal AI runs entirely in the browser: no API, no account, no cost, nothing sent anywhere. It answers from this site's data plus what Universal Hardware's live website says (`src/data/live-site.ts`, read 1 November 2026): every brand page, Meilun & Lifan models with their listed prices and specs, Hisun UTVs and ATVs, the Meilun parts catalogues, Sankey's air conditioner sizing chart and inverter guide, the holiday closures, contact details and the employment form.

- **Pictures in the chat**: Shop products (with one-tap Add, colour by colour for motorcycles), categories, brand logos, listed models and event flyers appear as cards under its replies (`src/islands/GuideCards.tsx`, loaded with the panel).
- **Adds to the cart for you**: "add 2 red LF100-A to my cart", "add the second one", "agregue la LF125-5 al carrito". Items the Shop doesn't list go in as requests, worded as typed. It reads the cart too ("what's in my cart?").
- **Smarter answers**: air conditioner size from room dimensions (Sankey's chart and adjustments), open or closed right now from the listed hours in Belize time, model specs, brand facts, jobs, parts catalogues, holidays; questions it can't place fall back to a search of the whole site.
- **WhatsApp handoff (free)**: "talk to a person" (and quote, stock, service and policy questions) show buttons that open WhatsApp to a branch's Sales or Service Center line with the conversation and cart summarised in the message. It uses WhatsApp's free click-to-chat links: nothing is sent until the visitor presses send in WhatsApp.

The engine (`src/lib/guide/local-engine.ts`, `skills.ts`, `smarts.ts`) sits behind the `GuideEngine` interface, so a hosted model can replace it later without changing the panel.

### Universal AI launcher

The floating pill reads "Universal AI / Assistant" ("Universal AI" on phones). A rapid blue pulse radiates from it until the visitor opens it once in the session; with reduced motion (system setting or the footer toggle) it shows a steady halo instead. Its greeting is "Hi, I'm Universal AI. How may I assist you today?", with suggested questions below.

### Site search and requested items

The search button in the header (and "Search for a product" in the phone menu, the Shop and Products pages) opens one search box over the Shop, the categories and the brands (`src/islands/SiteSearch.tsx`, loaded the first time it opens). Shop items go into the cart with one tap, colour by colour for motorcycles. Anything the site does not list can be added to the cart as a **request**: just the name the customer typed (up to 80 characters), shown as "Price to be confirmed" and left out of the total. At checkout the customer pays for priced items only; a cart with only requests has no card step and ends in "Request received (simulated)". Requests are not sent anywhere in this build; going live needs a destination at the branch (see `PRODUCTION_OPTIONS.md`).

### Contact us now

`src/components/ContactLinks.astro` puts direct WhatsApp buttons (each branch's Sales line) and Universal Hardware's Facebook, Instagram and YouTube in the footer, the phone menu, Locations, About and What's New. The social links are the ones on the company's own About page (`SOCIAL` in `src/data/site.ts`).

### One tap

Every control responds to the first tap on a touch screen. A PostCSS plugin (`scripts/postcss-hover-media.mjs`, wired in `astro.config.mjs`) moves every `:hover` rule into `@media (hover: hover) and (pointer: fine)`, because on iPhones a hover effect can swallow the first tap. Controls use `touch-action: manipulation`, so quick repeated taps (steppers, chips) all count, and standalone links are at least 24 px tall. Slideshow dots light up the moment they are tapped, even while the next image loads. The end-to-end suite checks all of this on every route with touch emulation.

### Homepage slideshow

The page opens with a full-width slideshow above the 3D hero: a storefront with a Lifan motorcycle, a store floor and a paint aisle. The images were supplied by Austere Automations. Every slide has a 16:9 desktop and a 4:5 mobile composition. Phones (below 768 px) get the mobile one and tablets and desktops the desktop one, so neither is cropped into the other's shape. Slides fade every 7 seconds in an endless loop. Choosing a slide, swiping, the arrow keys or the pause button stop autoplay. It waits while off-screen or in a background tab, and starts paused with reduced motion. Only the first image loads with the page; each later one is fetched 3.5 s before it is due. `scripts/build-hero-slides.mjs` encodes the source PNGs as AVIF / WebP (two widths each) plus a JPEG fallback, under content-hashed names listed in `src/hero/slides.json`.

### Inner-page hero photos

Shop, Products, Brands, Locations, About and What's New open with a full-width photo in the same frame as the homepage slideshow (`src/components/PageBanner.astro`): 16:9 on desktop and 4:5 on phones, never taller than the screen below the header, then the page's heading. Shop shows motorcycles beside the Makita wall, Products the numbered aisles, Locations a branch at dusk, About a team member helping customers, and What's New a crowd at a store event. Brands reuses the homepage's aisle slide until a brand-display photo is supplied. The photos were supplied by Austere Automations, redone with ChatGPT from photos of the branches: 1672 × 941 desktop versions, and mobile versions that are cropped to the 4:5 phone frame around the subject where they came as 941 × 1672. `scripts/build-page-heroes.mjs <source-dir>` encodes `<page>-desktop.png` / `<page>-mobile.png` the same way as the slideshow (keeping a photo's full width when it is smaller than the standard sizes), into `public/hero/pages/` and `src/hero/pages.json`. On phones a photo supplied in another shape keeps its own proportions, so nothing in it is cut off (all five are 4:5 now). Cart, checkout, the finder and the concept page keep their text-only headings.

### 3D hero

The hero is the Makita HP333D kit (drill, 1.5Ah battery and charger) from Universal Hardware's own product photo, given 3D depth: `scripts/build-hp333d.py` cuts the kit out of the photo and inflates each piece's outline into a solid, and the photo is mapped onto it. The hero ships with a static render of the same scene (AVIF/WebP/PNG), so the first paint is instant and identical. The hero sits directly below the homepage slideshow. The Three.js bundle (≈122 KB gzip) and the kit data (≈161 KB) load only once a fifth of the stage is on screen, then on the next interaction or after a short idle period. Shaders compile asynchronously, and the scene pauses off-screen or in background tabs, is disposed on page hide, caps resolution and frame rate on low-power devices, and respects `prefers-reduced-motion`, the footer "Reduce motion" toggle and the "Pause 3D motion" button. The stage's badge names what is actually running: no badge over the still render, "Loading 3D" while the scene loads, "Interactive 3D" once it renders (with "Drag to rotate" and the Pause button). Without WebGL 2, if the scene fails, or if the browser later drops the WebGL context, the still render stays (or comes back) with no 3D label. The drill data and posters carry a content hash in their file names (listed in `src/hero/hp333d.json` and `src/hero/posters.json`), so an update is never served from a stale cache. Regenerate the posters with `npm run posters` (serve `dist/` first). See [`3D_ASSET_LICENSE.md`](3D_ASSET_LICENSE.md).

### Shop and payments

The Shop lists the 32 single-product graphics of the company's Friends & Family Sale (Spanish Lookout, 19–21 February 2026). Model, description, colours and price are copied as printed and labelled as past sale prices. The photos are cut out of the same graphics, without the price text, by `scripts/crop-shop-photos.py`. The cart keeps ids, colours and quantities only.

Every product card, and the product page, has an **Ask AI about this** button. One tap shows a short description of the item, in English or Spanish, without opening Universal AI; a "More questions? Ask Universal AI" link inside it opens the assistant on that model. The descriptions live in `src/data/shop-about.ts` and say only what the sale graphic shows (what's in the box, colours) and, for the bikes, the specs on Universal's Meilun & Lifan page. Universal AI uses the same text when asked about a model.

The whole store runs in **demonstration mode**. The Shop, product pages, cart and checkout carry the notice "Demonstration mode — no actual orders or payments are processed." (`src/components/DemoNotice.astro`), and the Shop's heading is "Explore our online store concept." The checkout ("Preview the checkout experience") keeps every step: details, branch collection, the card step and a confirmation. Its button reads "Simulate payment · BZ$…", and the confirmation reads "Demo order complete" with a `TEST-` demo reference, the same notice, and a short account of what would happen once live (real reference, email receipt, branch alert). Nothing on it says a paid order was placed.

Checkout reaches card processors only through the `PaymentProvider` interface in `src/lib/payments/`. The only provider shipped is `demo` (`live: false`): a stand-in for the processor's hosted card fields that collects nothing and simulates an approved or declined answer. There is no live provider, payment SDK, API key or network call in the build. Going live needs Universal Hardware's own merchant account and processor, a small server step for the secret key, and current prices. See [`PAYMENTS.md`](PAYMENTS.md).

### Privacy model

- No analytics, cookies, trackers, third-party fonts or scripts. The CSP enforces this.
- The cart (including the names of requested items), language, preferred branch and motion setting live in `sessionStorage` (cleared when the tab closes). Where it is blocked, the cart falls back to the tab's `window.name`. Checkout contact details and Universal AI conversations are kept in memory only.
- The only way data leaves the page is the visitor copying the summary, or tapping a phone, WhatsApp, map, email or official-website link. The checkout sends nothing.

## Optional live AI (disabled by default)

The Universal AI panel talks to an engine through `src/lib/guide/types.ts`. The default `LocalGuideEngine` is deterministic and, when asked, says it is rule-based and not live AI. To demo an **Austere-owned, approved Chatbase test agent**:

```bash
PUBLIC_CHATBASE_AGENT_ID=<test-agent-id> npm run build
```

This adds a "Try the live AI test widget" option that loads Chatbase's embed only when clicked. You must also allow `https://www.chatbase.co` in `script-src`, `connect-src` and `frame-src` in `public/_headers`. Never put API keys in `PUBLIC_*` variables or frontend code. Train the agent only on `AI_EMPLOYEE_KNOWLEDGE_SEED` content and keep its disclaimer visible. This path is untested because no agent ID was supplied.

## Browser support

Current Chrome, Edge, Safari (iOS 16.4+ / macOS 13+) and Firefox. The 3D hero needs WebGL 2; other browsers get the still render. Native `<dialog>`, `inert`, `:has()` and AVIF are used, with fallbacks where they matter (WebP/PNG posters, clipboard fallback).

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
