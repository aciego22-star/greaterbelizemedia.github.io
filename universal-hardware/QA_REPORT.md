# QA report

**Build:** `universal-hardware/` · Astro 7.3.8 static output · 55 pages · tested 28 October 2026; Shop, cart and checkout added and re-tested 29 October 2026; homepage slideshow added and re-tested 30 October 2026; English / Spanish switch added, Enquiry Summary removed and wording cleaned up, re-tested 31 October 2026
**Environment:** headless Chromium 1243 (Playwright 1.63) on Linux with **software WebGL (SwiftShader)**; local Netlify-like server with Brotli/gzip; Lighthouse 12.6.1.
**Not available here:** physical iPhone / Android / iPad hardware and real GPUs. See "Outstanding issues".

## Summary

| Area | Result |
|---|---|
| Automated end-to-end suite (`tests/run-qa.cjs`) | **236 / 236 checks pass** |
| Logic suite (`tests/guide-cases.ts`) | **All pass**: 13 guide conversations; every finder answer combination (276) resolves to listed categories and sub-types |
| Spanish coverage (`scripts/i18n-check.mjs`) | **0 English strings left** in Spanish mode across all 55 pages and the finder, search, cart, checkout, Guide and menu states |
| Type check (`astro check`) | 0 errors, 0 warnings |
| Post-build checks | noindex + footer disclaimer on all 55 pages; `_headers`, `robots.txt`, `404.html` present; no secret patterns |
| axe-core (WCAG 2.1 A/AA + best practice) | 0 violations on all 24 tested routes, plus the cart with items, checkout with errors, the order confirmation, and the Spanish homepage and confirmation |
| Lighthouse mobile | Performance 96–100 · Accessibility 100 · Best Practices 100 · SEO 69 (intentional `noindex`); Spanish homepage 97 |
| Lighthouse desktop (home, with the slideshow above the 3D hero) | Performance 100 on three consecutive runs · LCP 0.7 s · TBT 0 ms · CLS 0 · 534 KB (was 69 with the earlier procedural drill) |
| Third-party network requests | **None**, on any route or during any interaction |
| Shop and checkout writes | **None**: the whole add-to-cart → checkout → demo payment flow sends no POST or other write request, and the checkout has no card inputs |

## End-to-end checks by group

| Group | Pass | What is verified |
|---|---|---|
| route | 26/26 | All 24 tested routes (including the Shop, two product pages, cart and checkout) load directly (refresh-safe) with status 200, one `<h1>`, `noindex`, the Concept Preview badge, the footer disclaimer and alt text on every image; unknown URLs return the custom 404; `/products` redirects to `/products/` |
| console | 24/24 | No console errors on any route |
| images | 24/24 | Every image on every route (including the photos and logos from universalhardware.bz) loads with real dimensions, once lazy loading is forced to eager |
| axe | 29/29 | No accessibility violations, on every route, on the cart, checkout-error and confirmation states, and in Spanish (mobile homepage, order confirmation) |
| network | 30/30 | No request to any non-origin host on page load, in the finder flows, in Guide conversations, while switching language, in the shop and checkout, or across navigation; the shop and checkout send no write request at all |
| overflow | 8/8 | No horizontal overflow on any route at 320×640, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900; in Spanish (longer labels) none at 320, 1024 and 1200 px |
| nav | 10/10 | Header links (Shop, Products, Brands, Locations, About) set `aria-current`; Explore Products and Find the Right Product CTAs; hero "Find the Right Solution" → `#finder`; 8 department tiles → live category pages; every internal link target on every route resolves (no dead links) |
| mobile-menu | 4/4 | Opens as a modal `<dialog>` with focus inside, `aria-expanded`; Escape closes and returns focus; links navigate; no standalone tap target under 24 px |
| search | 17/17 | 12 categories by default; "submersible pump" ranks Water Pumps and highlights the sub-type; URL sync; English, Spanish and typo queries ("planta", "bomba de agua", "genrator"); finished empty state with recovery; department and brand filters; `?q=` deep link |
| finder | 7/7 | Six need paths; backup power → Generators with electrician caution; back navigation; farm → Water Pumps related; deep well → Submersible pumps; no Enquiry Summary controls or wording left on any page; the next step hands the answers to the Product Guide as a ready-made question |
| guide | 13/13 | Opens with its welcome; required conversations (generator ×3 turns, cordless drill, home water pump, motorbikes, Belize City store, quote); quote says it can't send anything and points to the branch WhatsApp lines; says it is rule-based when asked; switching the site to Spanish switches the Guide's welcome and replies; Escape closes; category pages hand over a contextual prompt, even when tapped before the global UI has hydrated (requests are queued and replayed) |
| i18n | 8/8 | English pages never load the Spanish dictionary; the header EN/ES button flips the page (heading, menu, title, button label); Spanish persists across pages; island toasts follow the language; checkout errors, Pay button and order confirmation in Spanish; switching back restores English without a reload; a Spanish-language browser opens in Spanish |
| links | 3/3 | `tel:` and `https://wa.me/` links match the website-listed numbers exactly; external links use `rel="noopener"` |
| branch | 1/1 | Preferred branch persists for the session across pages |
| privacy | 2/2 | No `localStorage` keys and no cookies are written; checkout contact details never reach `sessionStorage` or `window.name` |
| shop | 4/4 | 32 products, each with a BZ$ price; the motorcycle filter shows 16; add to cart updates the header count and offers View cart; the product page adds the chosen quantity |
| cart | 3/3 | Lines, colour and total (BZ$3,654.15 for the test basket) survive navigation; the stepper updates quantity and total; remove |
| checkout | 4/4 | No card inputs or third-party frames; Enter with empty details shows three errors and focuses the first field; simulated decline shows an alert and keeps the cart; approved simulated payment shows a `TEST-` reference and empties the cart |
| reel | 8/8 | At 1440, 768 and 390 px the slideshow opens the page with the 3D hero directly below; desktop images on desktop and tablet, mobile images on phones; only the first image loads with the page; autoplay fades to the next slide after about 7 s with inactive slides `aria-hidden`; choosing a slide stops autoplay (still there 8 s later, button reads "Play slideshow"); Play resumes and arrow keys change slide; reduced motion starts paused |
| 3d | 9/9 | Poster first and WebGL chunk not loaded at first paint; nothing loads while the stage is below the slideshow; scene reaches `ready` once scrolled into view; idle motion animates; **Pause 3D motion** freezes frames and relabels to "Resume"; drag rotates; `touch-action: pan-y` (no scroll trap); `prefers-reduced-motion` → no idle animation; **WebGL-disabled browser shows the static render with a "Static render" badge and no errors** |
| motion | 2/2 | Reduced motion shows reveal content immediately; the footer "Reduce motion" toggle applies and persists for the session |

Raw results: `tests/results/qa-results.json`.

## Required Product Guide conversations (excerpted from the logic suite)

| Prompt | Behaviour verified |
|---|---|
| "I need backup power for my home. What type should I look at?" | Names the generator brands; asks which appliances and whether it's for occasional or regular use; then category guidance plus "a qualified electrician should evaluate the load and any connection"; no sizing |
| "I need a cordless drill for concrete and steel." | Explains hammer drill vs standard drilling vs impact driver; asks material and frequency; points to Hammer drills + Cordless tools |
| "I need a pump for my home water supply." | Asks source, depth/height and use; deep well → submersible; recommends professional confirmation |
| "Do you carry motorbikes?" | Cites the Meilun & Lifan page (and Hisun page); says it can't state current models; asks riding style and branch |
| "Where is your Belize City store?" | Address, hours, phone, Sales and Service WhatsApp |
| "Can you send me a quote?" | Says it can't send quotes itself; points to each branch's Sales WhatsApp line for prices and stock |
| Also: "Are you a real AI?", "Is it open now?", warranty, Spanish | Honest identity (rule-based); no "open now" inference; no invented warranty; Spanish replies |

The logic suite also fails any Guide reply that mentions "concept", "demonstration" or the Enquiry Summary.

## Lighthouse (simulated throttling)

| Form factor | Route | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI |
|---|---|---|---|---|---|---|---|---|---|---|
| mobile | `/` | 98 | 100 | 100 | 69 | 1.3 s | 2.4 s | 0 ms | 0 | 1.7 s |
| mobile | `/products/` | 99 | 100 | 100 | 69 | 1.3 s | 2.0 s | 0 ms | 0 | 1.5 s |
| mobile | `/products/water-pumps/` | 99 | 100 | 100 | 69 | 1.3 s | 2.0 s | 0 ms | 0 | 2.5 s |
| mobile | `/locations/` | 99 | 100 | 100 | 69 | 1.3 s | 2.0 s | 0 ms | 0.005 | 2.7 s |
| mobile | `/products/generators/`, `/brands/`, `/about/`, `/concept/`, `/find/` | 99 | 100 | 100 | 69 | 1.3–1.4 s | 2.0 s | 0 ms | 0 | — |
| desktop | `/` | **69** | 100 | 100 | 69 | 0.3 s | 0.5 s | **1,560 ms** | 0 | 1.5 s |
| desktop | `/products/`, `/products/water-pumps/`, `/locations/` | 100 | 100 | 100 | 69 | 0.4 s | 0.5 s | 0 ms | ≤0.003 | — |

After switching to the sharper News / Promotions crops (mobile, re-run on the photo-led routes):

| Form factor | Route | Perf | A11y | BP | SEO | FCP | LCP | TBT | CLS | SI | Transfer |
|---|---|---|---|---|---|---|---|---|---|---|---|
| mobile | `/` (8 department photos, 6 finder photos, service photo, logos) | 98 | 100 | 100 | 69 | 1.3 s | 2.3 s | 0 ms | 0 | 1.3 s | 382 KB |
| mobile | `/products/` (12 photo cards) | 100 | 100 | 100 | 69 | 1.1 s | 1.5 s | 0 ms | 0 | 1.1 s | 278 KB |
| mobile | `/products/power-tools/` (638 px hero crop + gallery) | 99 | 100 | 100 | 69 | 1.1 s | 2.0 s | 0 ms | 0 | 1.1 s | 215 KB |

After adding the Shop (mobile, 29 October 2026):

| Form factor | Route | Perf | A11y | BP | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| mobile | `/shop/` (32 product cards) | 99 | 100 | 100 | 1.9 s | 37 ms | 0 |
| mobile | `/shop/lifan-lf100-a/` | 99 | 100 | 100 | 2.1 s | 0 ms | 0 |
| mobile | `/cart/` | 99 | 100 | — | — | — | 0 |
| mobile | `/checkout/` | 100 | 100 | 100 | 1.8 s | 0 ms | 0 (was 0.079 before the island reserved its space) |

After adding the homepage slideshow (30 October 2026, repeated runs):

| Form factor | Route | Perf | A11y | BP | FCP | LCP | TBT | CLS | Transfer |
|---|---|---|---|---|---|---|---|---|---|
| desktop | `/` (×3) | 100, 100, 100 | 100 | 100 | 0.3 s | 0.7 s | 0 ms | 0 | 534 KB |
| mobile | `/` (×2) | 97, 98 | 100 | 100 | 1.1–1.2 s | 2.3–2.6 s | 0 ms | 0 | 446 KB |

After adding the English / Spanish switch and removing the Enquiry Summary (31 October 2026):

| Form factor | Route | Language | Perf | A11y | BP | CLS |
|---|---|---|---|---|---|---|
| desktop | `/` | English | 100 | 100 | 100 | 0 |
| mobile | `/` | English | 96 | 100 | 100 | 0 |
| mobile | `/` | Spanish | 97 | 100 | 100 | 0 |
| mobile | `/shop/` | Spanish | 99 | 100 | 100 | 0 |
| mobile | `/checkout/` | English | 99 | 100 | 100 | 0 (FCP 1.0 s, LCP 2.0 s, TBT 0 ms, 134 KB) |

The Spanish dictionary (about 1,000 strings) is a separate chunk, fetched only when Spanish is chosen; English pages never request it. In Spanish the page stays hidden until the translation is applied (about 0.2 s after load, with a 2.5 s failsafe), so there is no flash of English and no layout shift.

The LCP element is now the first slideshow image (AVIF, 1672 px on desktop, 750 px on phones). Before two changes, desktop flipped between 100 and 60. Slides 2 and 3 downloaded right after load and kept the network busy, so the 3D scene could start inside Lighthouse's window, where SwiftShader frames count as blocking time. Now each later slide loads just before it is due, and the scene waits until its stage is on screen.

The first table is the pre-image baseline. Below-the-fold images are lazy-loaded, every image has explicit dimensions (CLS 0), and photos are served as WebP with a JPEG fallback.

How to read these honestly:

- **SEO 69 is intentional.** The only failing audit is "Page is blocked from indexing" (`noindex`), which this private demo requires.
- **Mobile homepage 98 is measured before the 3D scene starts.** On touch devices the scene starts on first interaction or after a 3.2 s idle delay, which falls after Lighthouse's measurement window. Its own cost is reported separately below and is not hidden.
- **Desktop homepage 69**: on desktop the scene starts after 1.6 s idle, inside the window. The 1.56 s TBT comes from software-rendered (SwiftShader) shader compilation and environment baking. Real GPUs with parallel shader compilation should be far cheaper, but this is **unverified here**.
- **Update:** with the drill now built from the company's photo (one mesh, simpler materials), the desktop homepage scores **100** with 0 ms TBT, and mobile 98 (re-measured 29 October 2026).
- The local server compresses like Netlify. Without compression the numbers would be worse than production.

## 3D scene measurements (software WebGL, worst case)

| Profile | Trigger → ready | Long tasks after trigger | Canvas | JS heap |
|---|---|---|---|---|
| Desktop 1440×900 | 2.0 s | 437, 63, 114, 86, 431 ms | 840×644 | 11 MB |
| Mobile 390×844, touch (low-power path) | 1.6 s | 179, 103, 508 ms | 535×504 | 12 MB |

Bundle: the WebGL chunk is ≈122 KB gzip and is never requested before first paint. The hero (now the company's Makita HP333D kit photo, drill, battery and charger, in 3D) is one mesh of ≈73.2k triangles plus ≈161 KB of texture and depth data (≈84 KB on low-power devices). Frame rate under SwiftShader was ~14–17 fps; this is a CPU-rendering artefact, not representative of GPU devices.

Optimisations applied after measuring (homepage mobile went from Performance 55 / TBT 9.7 s to 98 / 0 ms):
- the expensive up-front WebGL capability probe was replaced by a cheap feature check
- the scene starts on interaction or idle, and (since the slideshow was added) only once its stage is on screen
- async shader compilation, with set-up yielding between steps
- low-power profile: no shadow map, 1.5× DPR cap, ~30 fps cap
- CSS inlined, which removes the render-blocking request
- fonts trimmed from 138 KB to 55 KB (axis instancing + subsetting)
- AVIF/WebP posters

## Visual review

Reviewed by screenshot at every tested viewport (see `deliverables/screenshots/`): hero, departments, finder states, Spanish homepage, guide, search, category, locations, brands, mobile menu, 320/768/1024 views and the no-WebGL fallback. Fixes made during review:
- branch card layout at 1440
- mobile HUD clearance from the Guide button
- figure label collision on small stages
- extra headroom for the drill on small stages
- footer official-site button contrast
- map overflow
- the "Not listed — see note" wording
- photo plates: tall 200 px photos were cropped by an auto-sized grid row; the cell is now clamped so every photo is contained
- category hero: 200 px photos get a smaller square plate on desktop instead of being enlarged; galleries no longer repeat the hero photo
- News / Promotions crops: each crop box was checked pixel by pixel so that no price, date, phone number or sale text is included. The Makita drill box ends one pixel before the flyer's "+ 1.5Ah" text, so the drill is whole and the text excluded
- "Beyond the shelf" panel: now the Makita Clinic photo, full-bleed under a dark gradient so the callouts stay legible; the Service callout moved up to clear the caption on phones
- Astro scoped styles don't reach a child component's root, so the service photo sits in a page-owned wrapper
- brand cards: "No logo on the website" label contrast raised to pass axe
- Shop: colour pickers on bike cards were squeezed to one letter, so they now take their own row; two product columns on phones; filter chips scroll sideways on phones
- Shop at 320 px: the extra cart icon pushed the header 8 px wide, so header icon buttons shrink to 40 px below 400 px
- Checkout in the private preview: the preview frame blocks form submission, so Pay never fired there. Pay and the Product Guide's Send are now plain buttons with Enter handled in script. Verified in an opaque-origin sandbox emulation: cart kept across pages (sessionStorage is blocked there, so the `window.name` fallback is used), demo payment completes, and Guide Enter and Send both reply
- Homepage slideshow: controls sit bottom-centre on desktop so they clear the floating Product Guide button; on phones the controls move right so the two never overlap at 320 px
- 3D tests: with the stage now below the slideshow, its 1.6 s intro starts when it scrolls into view, so the pause and no-WebGL checks first scroll the stage into view and let the intro finish
- Shop photos: the automatic cut-outs kept "SALE" beside the two trimmers and clipped the rotary hammer's handle; fixed with three paint-out areas

## Outstanding issues (named explicitly)

1. **No physical-device testing.** iPhone Safari, Android Chrome and iPad landscape need hands-on checks, especially 3D smoothness, the drag-rotate vs scroll feel, the Guide panel with the on-screen keyboard, the EN/ES button, and safe-area insets.
2. **3D performance on real GPUs is unmeasured.** The numbers above are a software-rendering worst case.
3. ~~Desktop Lighthouse home = 69~~ under SwiftShader: resolved by the photo-based drill (now 100).
4. **Chatbase adapter untested.** No agent ID was supplied. Enabling it also requires CSP changes (see README).
5. **At 320×640 only**, the floating Product Guide button can sit over the stage's top-right Pause control until the page is scrolled. Pause stays reachable after a small scroll and via keyboard.
6. **Utility strip wraps to two lines at ≤360 px** (by design, to avoid overflow).
7. **Wordmark is a modest-resolution raster**; a high-resolution master is needed for production.
8. **Canonical / Open Graph URLs** use a placeholder Netlify subdomain until `site` is updated.
9. **Map pins are approximate town positions**, labelled as such; "Open in Google Maps" uses an address search.
10. **Website photos are mid resolution.** The main images are 370–638 px crops from 1080 px promotion graphics, plus 489 px product shots; gallery photos are 200 px and logos ~150 px. They are sharp at the sizes used, and never shown above 1.25× their own size, but original high-resolution files should be requested before any launch.
11. Lighthouse flags `dom-size` (~1,365 elements on the homepage, mostly inline SVG artwork). It's informational, and TBT stayed at 0 ms.
12. **Card payments are not live** by design. The demo provider is the only one shipped; the live path is in `PAYMENTS.md` and depends on Universal Hardware's own merchant account.
13. **Shop prices are past sale prices** from February 2026 graphics, read as Belize dollars; GST treatment is unknown.
14. **Spanish is a working translation**, written for this build, and has not yet been reviewed by a native speaker in Belize. It should be before launch, especially product names, sizing terms and the checkout.
15. **The Product Guide does not pass enquiries on to staff.** It answers from the site's own content and points customers to the branch WhatsApp lines. Handing a conversation to a branch needs the approved live AI Employee and a destination Universal Hardware chooses.
