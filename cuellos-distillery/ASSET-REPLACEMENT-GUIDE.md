# Asset Replacement Guide — Cuello's V1.1

Every visual asset, where it appears, and how to replace it. All images are
WebP; each photo ships in two widths (`name.webp` full, `name-640.webp` small)
— when replacing, export both. Recommended tooling: any image editor +
[squoosh.app](https://squoosh.app) (WebP, quality ~80).

**General rule:** keep the same filename and dimensions class and the layout
adapts automatically — replacement is a file swap, never a rebuild.

## Status legend
- **CLIENT** — supplied by/derived from Cuello's material; confirm rights before launch.
- **PROVISIONAL** — acceptable for V1 presentation; replace before production launch.

---

## Brand (`assets/img/brand/`)

| File | Used on | Size | Notes | Status |
|---|---|---|---|---|
| `rums-of-belize-mark.png` | JSON-LD logo, source master | 1600×1594 | AI-upscaled from a 582px original. **A vector or high-resolution transparent version of the official trademark is required for final launch.** Do not redraw or recolour the turkey mark. | PROVISIONAL |
| `rums-of-belize-mark-480.webp` | Header, footer, age gate, Our Story | 480×478 | Derived from above; regenerate if master is replaced | PROVISIONAL |
| `favicon-32.png`, `favicon-192.png`, `apple-touch-icon.png` | Browser tabs / home-screen | 32/192/180 px square | Centre-crop of the trademark; regenerate with master | PROVISIONAL |
| `og-default.jpg` | Social sharing (all pages) | 1200×630 | Crop of the BELIZE installation photo. Consider a dedicated branded share image per page later. | PROVISIONAL |

## Products (`assets/img/products/`, 9 bottles)

All: 900×1350 WebP + 450w thumb, uniform warm-cream backdrop `#F3EBDD`
(this backdrop is a deliberate card system — do not remove or recolour it).
Used on: Our Spirits grid + drawer, Home spirit rail (4 featured).

| File | Product |
|---|---|
| `caribbean-extra-strong-rum(.webp/-450.webp)` | Caribbean Extra Strong Rum |
| `czar-vodka` | CZAR Vodka |
| `caribbean-white-rum` | Caribbean White Rum |
| `trafalgar-gin` | Trafalgar Gin |
| `anise` | Anise |
| `caribbean-coconut-rum` | Caribbean Coconut Rum |
| `imperial-brandy` | Imperial Brandy |
| `green-stripe` | Green Stripe |
| `caribbean-gold-rum` | Caribbean Gold Rum (label reads "Caribbean Rum", gold presentation) |

**Status: PROVISIONAL-CLIENT.** These are enhanced concept reconstructions
built from older isolated product photos + current social references. Bottle
silhouettes, principal names and label designs were checked against supplied
references, but small regulatory/label text is concept-level. **Cuello's must
confirm every label is current before public launch.** Hi-res 1200×1800 PNG
source masters are kept in `assets/img/products-hires/` (excluded from the
deploy ZIP; not referenced by any page).

Replacement: photograph each bottle straight-on, cap-to-base, on seamless
`#F3EBDD`; export 900×1350 (`name.webp`) and 450×675 (`name-450.webp`).

## Editorial (`assets/img/editorial/`)

| File | Page · Section | Native size | Desktop crop | Mobile crop | Focal point | Status |
|---|---|---|---|---|---|---|
| `belize-letters-installation` | Home · video-slide poster; Gallery | 1284×450 | poster for hero slide 4 | poster | centre, keep all letters + bottles | CLIENT |
| `carnival-brand-activation` | Home · culture; News · featured | 1284×943 | 16:10 frame | 92vw wide | dancers' upper bodies (50% 35%) | CLIENT |
| `white-rum-cocktail` | Home · serve; Cocktails · hero art | 1284×1657 | 3:4 frame | 92vw tall | glass + bottle centre | CLIENT |
| `barrel-and-miniatures` | Home · heritage; Our Story · roots | 1284×1653 | 3:4 frame | 92vw tall | barrel brand + bottles (50% 60%) | CLIENT |
| `san-pedro-storefront` | Locations · hero art + feature | 1182×1698 | 3:4 frame | 92vw tall | storefront signage (50% 35–45%) | CLIENT |
| `community-trade-booth` | Trade · hero art; News · card | 1284×1672 | hero art fades left | card 16:10 | booth + people (50% 30%) | CLIENT |

## Gallery (`assets/img/gallery/`, source photos)

Used on the Gallery page (filterable) — plus at most one main-page appearance
each (site rule: no photo appears more than twice). Aspect ratios are
preserved in the masonry; focal points are set per item in
`assets/js/data.js` → `GALLERY[].focal`.

`trafalgar-gin-garden-display` (also hero slide 2), `vintage-product-lineup`
(hero slide 1 + Our Spirits group shot; not in the Gallery grid),
`white-rum-flambe` (also Cocktails), `outdoor-product-lineup` (also Trade),
`secret-beach-brand-display`, `bar-product-lineup`,
`basketball-court-activation` (also News card), `beach-product-lineup`
(also Home gallery strip), `belizes-best-beach-flags` (also News card),
`orange-walk-mural-lineup`, `czar-vodka-beach-portrait` (also hero slide 3)
— all CLIENT (social-media sourced; confirm usage rights and
identifiable-person permissions before launch).

To add/remove gallery items: edit `GALLERY` in `assets/js/data.js` (captions +
alt text in EN and ES, category, focal point). No layout changes needed.

## Our Story production photos (`assets/img/story/`)

`distillery-exterior`, `production-line`, `bottling-closeup`,
`bottling-machinery` — 1280×720, 16:9 frames on Our Story + Gallery
(Distillery filter). Neutral captions only; no capacity/process claims.
Status: CLIENT (older reference material — confirm they may represent current
facilities, or reshoot).

## Hero carousel (`index.html`, V1.1)

| Slide | File | Treatment |
|---|---|---|
| 1 | `assets/img/gallery/vintage-product-lineup.webp` | `object-fit: contain` over a blurred copy of itself — the full lineup, Cuello's name and slogan stay completely visible. Never crop. |
| 2 | `assets/img/gallery/trafalgar-gin-garden-display.webp` | `cover`, `object-position: 50% 42%` |
| 3 | Desktop: `assets/img/gallery/czar-vodka-beach-portrait.webp` · Mobile (<768px): `assets/img/hero/czar-vodka-mobile-hero-v2.webp` | Desktop: complete bottle via `contain` over a blurred backdrop. Mobile: dedicated 4:5 composition, full-bleed `cover` via `<picture>`. |
| 4 | `assets/video/cuello-hero-video.mp4` | SUPPLIED (46 s, 1280×622, muted, social-app framing cropped out). Shown complete over a blurred poster backdrop; plays only while active; advances the carousel when finished. Poster: `assets/img/gallery/cuello-hero-video-poster.webp`. |

## Video (`assets/video/`)

| File | Used on | Spec | Notes |
|---|---|---|---|
| `cuello-hero-video.mp4` | Home hero slide 4 (tablet/desktop) · Gallery (Videos) | 46 s, 1280×622, H.264, 30 fps, ~7.5 MB, **with audio** (AAC 96k) | Derived from a supplied social screen recording: black frame cropped out. Audio retained per instruction — music rights unverified, see checklist. Unmuted autoplay attempted; muted fallback + on-slide sound toggle. |
| `cuello-beach-moments.mp4` | Gallery (Videos) | 33 s, 720×1262 portrait, H.264, 30 fps, ~6.4 MB, **no audio** | Derived from a supplied social screen recording: status bar, reaction rail, captions, account branding and comment bar cropped out; audio stripped. |

| `cuello-hero-video-mobile.mp4` | Home hero slide 4 (phones, <768px) | 46 s, 720×1124 portrait centre-crop at the recording's native resolution, ~6.9 MB, with audio | Sharp full-bleed portrait playback on phones — no upscaling blur. Selected automatically via `config.js → heroVideo.srcMobile`. |

Posters: `assets/img/gallery/cuello-hero-video-poster(.webp/-640.webp)` and
`cuello-beach-moments-poster(.webp/-640.webp)` — extracted stills; replace by
re-exporting a frame if a different opening image is preferred.

To replace either video: export H.264 MP4 (faststart), overwrite the file,
and update the poster still. Additional gallery videos: add an MP4 + poster
and a `GALLERY` entry in `data.js` (snippet in README).
