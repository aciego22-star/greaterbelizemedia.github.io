# QA report

**Build:** `universal-hardware/` · Astro 7.3.8 static output · 20 pages · tested 28 October 2026
**Environment:** headless Chromium 1243 (Playwright 1.63) on Linux with **software WebGL (SwiftShader)**; local Netlify-like server with Brotli/gzip; Lighthouse 12.6.1.
**Not available here:** physical iPhone / Android / iPad hardware and real GPUs. See "Outstanding issues".

## Summary

| Area | Result |
|---|---|
| Automated end-to-end suite (`tests/run-qa.cjs`) | **183 / 183 checks pass** |
| Logic suite (`tests/guide-cases.ts`) | **All pass**: 11 guide conversations; every finder answer combination (276) resolves to listed categories and sub-types |
| Type check (`astro check`) | 0 errors, 0 warnings |
| Post-build checks | noindex + disclaimer on all 20 pages; `_headers`, `robots.txt`, `404.html` present; no secret patterns |
| axe-core (WCAG 2.1 A/AA + best practice) | 0 violations on all 19 content routes |
| Lighthouse mobile | Performance 97–100 · Accessibility 100 · Best Practices 100 · SEO 69 (intentional `noindex`) |
| Third-party network requests | **None**, on any route or during any interaction |

## End-to-end checks by group

| Group | Pass | What is verified |
|---|---|---|
| route | 21/21 | All 19 content routes load directly (refresh-safe) with status 200, one `<h1>`, `noindex`, the concept badge, the full disclaimer, an official-site link and alt text on every image; unknown URLs return the custom 404; `/products` redirects to `/products/` |
| console | 19/19 | No console errors on any route |
| images | 19/19 | Every image on every route (including the photos and logos from universalhardware.bz) loads with real dimensions, once lazy loading is forced to eager |
| axe | 19/19 | No accessibility violations |
| network | 22/22 | No request to any non-origin host on page load, in the finder/enquiry flows, in Guide conversations or across navigation |
| overflow | 7/7 | No horizontal overflow on any route at 320×640, 375×812, 390×844, 430×932, 768×1024, 1024×768, 1440×900 |
| nav | 9/9 | Header links set `aria-current`; Explore Products and Find the Right Product CTAs; hero "Find the Right Solution" → `#finder`; 8 department tiles → live category pages; every internal link target on every route resolves (no dead links) |
| mobile-menu | 4/4 | Opens as a modal `<dialog>` with focus inside, `aria-expanded`; Escape closes and returns focus; links navigate; no standalone tap target under 24 px |
| search | 17/17 | 12 categories by default; "submersible pump" ranks Water Pumps and highlights the sub-type; URL sync; English, Spanish and typo queries ("planta", "bomba de agua", "genrator"); finished empty state with recovery; department and brand filters; `?q=` deep link |
| finder | 5/5 | Six need paths; backup power → Generators with electrician caution; back navigation; farm → Water Pumps related; deep well → Submersible pumps |
| enquiry | 12/12 | Add from finder updates header badge and toast; drawer opens as `aria-modal` with `inert` background; focus trapped (40 tabs); summary includes categories, use, branch, notes and the "Nothing has been sent or submitted" line; **Copy writes exactly the preview text to the clipboard**; remove; add from select; Escape closes; persists across pages (session); category-page toggle; two-step Reset |
| guide | 13/13 | Labelled rule-based / not live AI / not official customer service; required conversations (generator ×3 turns, cordless drill, home water pump, motorbikes, Belize City store, quote); quote offers the Enquiry Summary; Spanish mode; Escape closes; category pages hand over a contextual prompt, even when tapped before the global UI has hydrated (requests are queued and replayed) |
| links | 4/4 | `tel:` and `https://wa.me/` links match the website-listed numbers exactly; external links use `rel="noopener"`; official-site links point to `universalhardware.bz` |
| branch | 1/1 | Preferred branch persists for the session across pages |
| privacy | 1/1 | No `localStorage` keys and no cookies are written |
| 3d | 8/8 | Poster first and WebGL chunk not loaded at first paint; scene reaches `ready`; idle motion animates; **Pause 3D motion** freezes frames and relabels to "Resume"; drag rotates; `touch-action: pan-y` (no scroll trap); `prefers-reduced-motion` → no idle animation; **WebGL-disabled browser shows the static render with a "Static render" badge and no errors** |
| motion | 2/2 | Reduced motion shows reveal content immediately; the footer "Reduce motion" toggle applies and persists for the session |

Raw results: `tests/results/qa-results.json`.

## Required Product Guide conversations (excerpted from the logic suite)

| Prompt | Behaviour verified |
|---|---|
| "I need backup power for my home. What type should I look at?" | Names the website's generator brands; asks which appliances and whether it's for occasional or regular use; then category guidance plus "a qualified electrician should evaluate the load and any connection"; offers Add to Enquiry; no sizing |
| "I need a cordless drill for concrete and steel." | Explains hammer drill vs standard drilling vs impact driver; asks material and frequency; points to Hammer drills + Cordless tools |
| "I need a pump for my home water supply." | Asks source, depth/height and use; deep well → submersible; recommends professional confirmation |
| "Do you carry motorbikes?" | Cites the Meilun & Lifan page (and Hisun page); says it can't state current models; asks riding style and branch |
| "Where is your Belize City store?" | Address, listed hours, phone, Sales and Service WhatsApp, with the verification notice and an "independent demo" note |
| "Can you send me a quote?" | Says it can't send quotes or contact the company; offers the copyable Enquiry Summary and the website-listed Sales WhatsApp lines |
| Also: "Are you a real AI?", "Is it open now?", warranty, Spanish | Honest identity; no "open now" inference; no invented warranty; Spanish replies with a no-formal-bilingual-service note |

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

The table above that one is the pre-image baseline. Below-the-fold images are lazy-loaded, every image has explicit dimensions (CLS 0), and photos are served as WebP with a JPEG fallback.

How to read these honestly:

- **SEO 69 is intentional.** The only failing audit is "Page is blocked from indexing" (`noindex`), which this private demo requires.
- **Mobile homepage 98 is measured before the 3D scene starts.** On touch devices the scene starts on first interaction or after a 3.2 s idle delay, which falls after Lighthouse's measurement window. Its own cost is reported separately below and is not hidden.
- **Desktop homepage 69**: on desktop the scene starts after 1.6 s idle, inside the window. The 1.56 s TBT comes from software-rendered (SwiftShader) shader compilation and environment baking. Real GPUs with parallel shader compilation should be far cheaper, but this is **unverified here**.
- The local server compresses like Netlify. Without compression the numbers would be worse than production.

## 3D scene measurements (software WebGL, worst case)

| Profile | Trigger → ready | Long tasks after trigger | Canvas | JS heap |
|---|---|---|---|---|
| Desktop 1440×900 | 2.0 s | 437, 63, 114, 86, 431 ms | 840×644 | 11 MB |
| Mobile 390×844, touch (low-power path) | 1.6 s | 179, 103, 508 ms | 535×504 | 12 MB |

Bundle: the WebGL chunk is ≈136 KB gzip and is never requested before first paint. The drill (now the Makita HP333D model) is 54 meshes and ≈42.2k triangles (≈31.9k low-detail), lighter than the earlier generic drill (≈63.6k). Frame rate under SwiftShader was ~14–17 fps; this is a CPU-rendering artefact, not representative of GPU devices.

Optimisations applied after measuring (homepage mobile went from Performance 55 / TBT 9.7 s to 98 / 0 ms):
- the expensive up-front WebGL capability probe was replaced by a cheap feature check
- the scene starts on interaction or idle
- async shader compilation, with set-up yielding between steps
- low-power profile: no shadow map, 1.5× DPR cap, ~30 fps cap
- CSS inlined, which removes the render-blocking request
- fonts trimmed from 138 KB to 55 KB (axis instancing + subsetting)
- AVIF/WebP posters

## Visual review

Reviewed by screenshot at every tested viewport (see `deliverables/screenshots/`): hero, departments, finder states, drawer, guide, search, category, locations, brands, mobile menu, 320/768/1024 views and the no-WebGL fallback. Fixes made during review:
- branch card layout at 1440
- mobile HUD clearance from the Guide button
- figure label collision on small stages
- extra headroom for the drill on small stages
- toast covering drawer actions on mobile
- footer official-site button contrast
- map overflow
- the "Not listed — see note" wording
- photo plates: tall 200 px photos were cropped by an auto-sized grid row; the cell is now clamped so every photo is contained
- category hero: 200 px photos get a smaller square plate on desktop instead of being enlarged; galleries no longer repeat the hero photo
- News / Promotions crops: each crop box was checked pixel by pixel so that no price, date, phone number or sale text is included. The Makita drill box ends one pixel before the flyer's "+ 1.5Ah" text, so the drill is whole and the text excluded
- "Beyond the shelf" panel: now the Makita Clinic photo, full-bleed under a dark gradient so the callouts stay legible; the Service callout moved up to clear the caption on phones
- Astro scoped styles don't reach a child component's root, so the service photo sits in a page-owned wrapper
- brand cards: "No logo on the website" label contrast raised to pass axe

## Outstanding issues (named explicitly)

1. **No physical-device testing.** iPhone Safari, Android Chrome and iPad landscape need hands-on checks, especially 3D smoothness, the drag-rotate vs scroll feel, the bottom-sheet drawer and Guide with the on-screen keyboard, and safe-area insets.
2. **3D performance on real GPUs is unmeasured.** The numbers above are a software-rendering worst case.
3. **Desktop Lighthouse home = 69** under SwiftShader (see above).
4. **Chatbase adapter untested.** No agent ID was supplied. Enabling it also requires CSP changes (see README).
5. **At 320×640 only**, the floating Product Guide button can sit over the stage's top-right Pause control until the page is scrolled. Pause stays reachable after a small scroll and via keyboard.
6. **Utility strip wraps to two lines at ≤360 px** (by design, to avoid overflow).
7. **Wordmark is a modest-resolution raster**; a high-resolution master is needed for production.
8. **Canonical / Open Graph URLs** use a placeholder Netlify subdomain until `site` is updated.
9. **Map pins are approximate town positions**, labelled as such; "Open in Google Maps" uses an address search.
10. **Website photos are mid resolution.** The main images are 370–638 px crops from 1080 px promotion graphics, plus 489 px product shots; gallery photos are 200 px and logos ~150 px. They are sharp at the sizes used, and never shown above 1.25× their own size, but original high-resolution files should be requested before any launch.
11. Lighthouse flags `dom-size` (~1,365 elements on the homepage, mostly inline SVG artwork). It's informational, and TBT stayed at 0 ms.
