# Cosmic Pharmacy — Asset Handoff Guide

How to drop the real Cosmic Pharmacy media into the concept build without
touching any component code. Every placeholder in the site is data-driven: give
a record a real file path and the labeled placeholder disappears.

## 1. Folder layout (stable — do not rename)

```
src/assets/catalogue/     product and gallery images, referenced by key
public/assets/hero/       hero stills, hero video encodes, video poster
public/assets/gallery/    gallery videos and video posters
```

Two schemes, for a reason:

- **Images go in `src/assets/catalogue/` and are referenced by key**
  (`"image": "cosmic-product-041"`), resolved by `src/lib/media.ts`. Vite emits
  hashed files for the Netlify build and inlines data URIs for the single-file
  preview, so one record works in both.
- **Video stays in `public/`** and is referenced by relative path
  (`assets/gallery/tour.mp4`). Video is far too large to inline, so it is served
  as a file and simply does not play in the single-file preview.

Anything under `public/` is copied, never inlined. That is why images are not
kept there: they would be blank in the preview artifact.

## 2. Product images

The catalogue currently runs on the client's supplied images (see the catalogue
section below). To replace one with real photography:

- **Naming**: `src/assets/catalogue/<key>.webp`, reusing the key already in the
  record (`cosmic-product-041`). Records store keys, not paths.
- **Content**: real packaging, legible label, uncropped, on a clean neutral
  background. Background cleanup and colour correction only — never fabricate,
  relabel or AI-alter packaging.
- **Format/size**: WebP or JPG, square, under ~250 KB each. 400 px is enough for
  the current cards; go larger once the source justifies a detail-size image too.
- **Hook-up**: nothing to change if you keep the key. For a new product, set
  `"image"` to the new key and write a real `"imageAlt"` describing what is
  actually visible.

## 3. Gallery media (`src/data/gallery.json`)

Each record:

```json
{
  "id": "g-10",
  "kind": "photo | video",
  "title": "Shown under the item",
  "filters": ["inside-cosmic", "products-wellness", "community", "social-highlights", "videos"],
  "src": "assets/gallery/<file>",
  "poster": "assets/gallery/<poster>.jpg   (videos only)",
  "alt": "What is actually visible",
  "aspect": "portrait | landscape | square",
  "sourceNote": "Source platform/post URL and approval note"
}
```

- Photos: JPG/WebP, longest edge ~1600 px, under ~350 KB.
- Videos: MP4 (H.264 + AAC), portrait social clips are fine, under ~15 MB each,
  with a poster JPG.
- Use original camera files when available; do not embed screenshots of social
  posts or platform UI chrome.
- Record the source post URL in `sourceNote` — this file doubles as the asset
  manifest.
- Audio: platform-licensed music is NOT cleared for the website — use clips with
  Cosmic's own voice/audio or properly licensed web audio.

## 4. Hero media (`src/data/heroSlides.ts`)

Three stills + one video slide. For each still:

- Desktop composition ~2000×1250 px (16:10), JPG/WebP under ~400 KB.
- Set `image: 'assets/hero/<file>'` and a real `imageAlt`.
- Intentional mobile composition matters more than resolution — keep the
  subject centred; the frame renders ~4:3 to 16:10.

For the video slide:

- `videoSrcDesktop`: MP4 H.264 + AAC, 1080p, target under ~25 MB.
- `videoSrcMobile`: lighter encode (720p, under ~12 MB) — served on small
  screens so phones never pull the desktop file.
- `poster`: JPG frame from the video, ~1600 px wide.
- `durationSeconds`: set to the final edit's REAL runtime — the on-video
  caption and the "Play with Sound" overlay both read it.
- The player attempts audible autoplay when the slide activates and falls back
  to the poster + "Cosmic Pharmacy in [duration] — Play with Sound" overlay
  when the browser blocks it. No code changes needed.

## 5. Replacing placeholders — exact steps

1. Copy the files into the folders above with the naming rules.
2. Point the matching data record (`products.json`, `gallery.json`,
   `heroSlides.ts`) at the file path.
3. Write alt text from what is actually visible.
4. Run `npm run validate:data` (products) and `npm run build`.
5. Check the affected pages at 360 px and desktop widths.

## 6. Approval checklist before production publication

- [ ] Ms. Carter has approved each selected photo/video, including her own
      portrait now used on the home page.
- [ ] Permission confirmed for any identifiable customer, staff member or child.
- [ ] No prescriptions, health information or sensitive context visible.
- [ ] Music/audio cleared for web use (not just platform-licensed).
- [ ] Hours, prices, and any supplement-count claim verified with the client.
- [ ] `CATALOGUE-REVIEW.csv` returned by the pharmacy, confirming product names,
      brands, prices, stock, prescription status and permission to publish each
      of the 286 images.

## 7. Production notes

- Router: the site uses hash-based routing (`/#/shop`) so the same build works
  on Netlify drag-and-drop, local preview and the artifact preview with zero
  server config. For pretty URLs in production, switch `HashRouter` to
  `BrowserRouter` in `src/App.tsx` and add a `public/_redirects` file containing
  `/* /index.html 200`.
- Do not publish under Cosmic's official domain without written authorization —
  this build is a private demonstration.

## 8. Logo pack (installed)

The client's logo pack is installed and in use:

- `src/assets/brand/*.svg` are the working files the site imports (coordinate
  precision trimmed to 1 decimal, verified pixel-identical at display size,
  27% smaller / ~47 KB gzipped). The XML prolog is removed intentionally.
- `public/assets/brand/source-pack/` holds the untouched original pack for
  reference and reprint.
- `public/favicon.ico`, `icon-192.png`, `icon-512.png` and
  `apple-touch-icon-180.png` come straight from the pack's `web/` folder.

Placement: the full-colour horizontal lockup (`cosmic-pharmacy-logo-primary.svg`,
the pack's original file, unmodified) sits on the header and footer, with the
standalone colour mark below 1000 px where the lockup would fall under its
minimum legible width. The header lockup renders at 232 px wide against the
pack's "approximately 240 px" minimum; confirm with the client if they want it
larger (that would mean a taller sticky header).

## 9. Colour system

The site sits on a bright cosmic sky: a near-white ground carrying blue and
pink starlight, with white content panels floating on it. `src/styles/tokens.css`
splits the palette in two:

- `--brand-blue` (#1679D1), `--brand-pink` (#EA4F8D), `--cyan` and `--brand-navy`
  are the logo pack's exact values, used for the logo, the starfield and other
  decorative work.
- `--cosmic-blue` (#1470C9), `--magenta-deep` (#C62A68) and `--whatsapp` (#198446)
  are the same hues nudged just far enough to clear WCAG AA contrast when they
  carry white text on buttons and badges.

Every sampled piece of text across all 13 routes passes WCAG AA at these values.
If the client wants the brighter hues on buttons, the trade-off is contrast:
white text on #EA4F8D is only 3.5:1 against the 4.5:1 minimum.

## 10. Social links

`src/data/business.ts` holds every social destination. All five are now the
client's confirmed details: Facebook, Instagram, TikTok, Google Business
Profile and email. Nothing here is left assumed.

Two notes worth keeping:

- **TikTok** is `@cosmicpharmacy` with no `bz` suffix, unlike the Instagram
  handle `@cosmicpharmacybz`. Easy to get wrong.
- **Google Business Profile** is the client's share link,
  `https://maps.app.goo.gl/hbeZFGHJ43F7phbV7`. The app tracking parameters it
  arrived with (`?g_st=`) were stripped: they identify the sharing session,
  not the destination.

## 11. Map embed

`src/components/LocationMap.tsx` renders a keyless Google Maps embed of the
pharmacy (`business.mapEmbedUrl`). Sandboxed contexts, including the private
preview build, refuse third-party frames, so the component probes for outbound
access first and falls back to a branded card that still opens the real map.
The deployed Netlify site shows the live map; the preview shows the card.

`mapEmbedUrl` stays address-based on purpose. A `maps.app.goo.gl` share link
cannot be used as an iframe source, so the profile link and the embed URL are
two separate fields. Every outbound "open in Google Maps" link on the site
(the map card, the social row's Google icon, and the Visit us contact row)
points at the profile, so visitors land on her reviews and hours.

## 12. Pharmacist name and portrait

The build brief said not to display a first name unless the client confirmed it.
The client has since confirmed it, so the home page now names her in full:
**Marion Carter, Proprietor & Pharmacist-in-Charge**. Both strings live in
`src/data/business.ts` as `pharmacistFullName` and `pharmacistTitle`; running
copy elsewhere still uses the short `pharmacist` reference ("Ms. Carter").

`src/assets/people/ms-carter.webp` is Ms. Carter cut out of the supplied studio
photograph. The original arrived as RGB with a white backdrop rather than a
transparent PNG, so the background was flood-filled from the edges inward using
a strict threshold (backdrop measures 244-254 and perfectly neutral; her lab
coat is 223-239 with a blue cast). Filling inward rather than by colour alone
keeps the white coat intact. Verified against blue, pink and light backgrounds.

To replace it, drop in a new cutout at the same path (transparent WebP or PNG,
roughly 550x1000). The home page renders it at up to 400 px tall over a soft
brand-coloured halo.

## 13. The 286-image catalogue (installed)

The client's catalogue pack (286 images plus draft records) is curated and live.

### What was done

Every one of the 286 images was reviewed by eye, not by OCR alone. The pack's
own OCR was too noisy to name products from ("inus Headache PE", "m Animalin
C"), so it is kept only as a search aid. The result:

- **231 catalogue records** with real names, brands, categories, subcategories,
  pack sizes and keywords.
- **29 gallery items** for the images that are not products: Cosmic's own
  educational graphics, promotions, shop interiors and brand cards. These were
  never turned into fake product records.
- **26 images folded in as extra views** of a product already recorded, so
  duplicates do not appear as separate products. The detail page shows a view
  switcher for those 25 products.

286 = 231 primary + 26 extra views + 29 gallery. A unit test asserts that split
and fails if any supplied image stops being reachable.

### Where the images live

`src/assets/catalogue/*.webp` — 400x400, ~14 KB each, 4 MB total, down from the
21 MB of supplied JPEGs. The source tiles carry only about 232 px of true
detail (they are crops of social-media grid screenshots upscaled to 864 px), so
400 px is already generous; side-by-side comparison at display size shows no
visible loss.

Records store a **key** (`cosmic-product-041`), never a path, and `src/lib/media.ts`
resolves it. That is what lets one record work in both builds: Vite emits hashed
files for Netlify and inlines data URIs for the single-file preview.

### What is deliberately not claimed

Per the pack's own rules and the build brief, nothing clinical was inferred from
a photograph:

- `stockStatus` is **confirm-availability** on all 231 records.
- 19 records carry a price, and only because a sale sticker was legible in the
  photograph. They are marked `demo-only`, not `verified`. The other 212 are
  `confirm-price` with `priceBzd: null` and stay out of every subtotal.
- 44 records are flagged `pharmacistGuidanceRequired`, which replaces Add to
  Basket with the pharmacist pathway. One record (Clobetasol Propionate 0.05%,
  marked "Rx only" on the carton) is `prescriptionRequired` and routed to
  prescription-refills.
- 9 products whose packaging could not be read with confidence carry
  `nameStatus: "confirm-with-pharmacy"` and say so in the description.
- No ingredient, dose, indication or benefit was invented. Descriptions state
  the category, pack size and who confirms what.

### Client verification

`CATALOGUE-REVIEW.csv` in this folder is the sheet for Ms. Carter or her
designated representative. One row per image, carrying the proposed name, brand,
category and any price read off a shelf sticker, then blank CONFIRM_ columns for
name, brand, price, stock, prescription status and permission to publish the
image. The `ocr_suggested_name` column is included so a reviewer can see what
the machine read versus what was proposed.

Nothing here should go public until that sheet comes back.

### Replacing these images with real photography

These are crops of social-media screenshots. When Cosmic supplies original
camera files, drop a 400x400 (or larger) WebP at
`src/assets/catalogue/<key>.webp` under the same key and nothing else changes.
At that point it is worth generating a second, larger derivative for the detail
page, which the current source resolution cannot justify.

## 14. Time-of-day skies

The site changes sky with the visitor's local clock. Four skies, all drawn from
the client's own palette rather than from literal sunrise colours, so nothing
warm is introduced and the brand holds all day.

| Theme | Window | Sky |
|---|---|---|
| `sunrise` | 05:00-08:00 | Rose at the horizon lifting into a cool lilac |
| `day` | 08:00-17:00 | The bright cosmic white |
| `sunset` | 17:00-20:00 | Violet overhead, magenta through the middle, gold at the horizon |
| `night` | 20:00-05:00 | Violet black, from her coming-soon page |

Belize sits at about 17 degrees north and keeps UTC-6 all year with no daylight
saving, so sunrise only drifts between roughly 05:25 and 06:25 and sunset
between 17:25 and 18:35. Fixed windows stay accurate there year-round, which
they would not in a temperate country.

### How it is built

**Only the sky changes. Content cards do not.** White panels, product
photography and the ink inside them are identical in all four themes, which is
why the 231-product catalogue never needed a second design or a second contrast
pass.

- `src/styles/tokens.css` holds the four palettes under `:root[data-theme='...']`.
  Each block overrides the sky, the ink that sits directly on it, and the card
  shadows, which need to be deeper to lift a white panel off a dark ground.
- `--ink-card` and friends hold the never-changing card values, so a light
  surface nested inside a dark region (the pale hero button, the social
  circles) can reset back to them.
- Regions that sit on the sky rather than on a card - the header, the footer,
  the hero copy and the carousel controls - re-point `--ink` and friends to the
  `--on-sky` set. Every rule inside them still reads `var(--ink)` and simply
  resolves to the right value, so no rule needed rewriting. In the two light
  themes the two sets are identical, so nothing changes by day.
- The header also re-points `--panel`, so the Products dropdown and the mobile
  nav follow the dark bar instead of staying white against it.
- `src/lib/theme.ts` owns the schedule. It wakes exactly on the next boundary
  rather than polling, and re-checks on `visibilitychange` because background
  tabs throttle timers and a sleeping phone would otherwise wake still showing
  sunset.
- The inline script at the top of `index.html` sets `data-theme` before first
  paint, so the page never flashes the wrong sky. **It duplicates the schedule -
  change both together.** A unit test parses `index.html` and fails if the two
  drift apart. It carries no colours: `<meta name="theme-color">` is set from
  the rendered `--sky` in `theme.ts`, so the browser chrome follows the sky from
  one definition rather than a second hand-maintained list.
- `src/components/CosmicCanvas.tsx` holds one `SKIES` palette per theme and
  watches `data-theme` with a `MutationObserver`, so a change swaps colours on
  the next frame without regenerating the stars, which would make them jump.

### Deliberate deviations from the client's reference

Her coming-soon page renders the social icons as dark circles with a tinted
ring. Here they stay white circles in all four themes. On a dark circle the
black portion of the TikTok mark disappears, and white circles are consistent
with the light-cards-on-dark-sky direction she chose. Easy to reverse if she
prefers her original treatment, but each icon would then need restyling.

### Verification

`npm run test` covers the schedule: full 24-hour coverage, the exact boundary
hours, and the wake interval including the overnight rollover. Contrast is
swept across 13 routes x 4 themes (52 page loads) and all sampled text passes
WCAG AA. A browser check freezes the clock at 03:15, 06:15, 12:15, 18:15 and
22:15 and asserts the right sky is set both before paint and after React mounts.

### Changing the windows

Edit `SCHEDULE` in `src/lib/theme.ts` and the mirrored line in `index.html`.
The tests read `SCHEDULE`, so they follow automatically.

## 15. What's new at Cosmic: the PMOS kits

`src/assets/kits/*.webp` are the five kit boxes plus the group shot, cropped
from the client's own campaign reel (`kits-boxes` is the arrangement; the rest
are individual boxes). They are stored separately from `src/assets/catalogue/`
on purpose - the catalogue tests assert that folder holds exactly the 286
supplied images and that every one is used, so anything else belongs elsewhere.

The section sits on the home page below Ms. Carter and is built from her own
campaign wording, not copy written here:

- "Women are tired of guessing."
- "Many supplements, but which ones make sense together?"
- "That is where Cosmic Pharmacy comes in."
- "Choose your main concern:" with the five kits in her order.
- "Guided by a pharmacist, here to simplify your wellness."

**No kit contents are stated anywhere.** These are wellness bundles and what
goes in each one is the pharmacy's to confirm, so the section names the
concern, shows the box, and hands off to the PMOS collection or WhatsApp.

The boxes are photographed on Cosmic's own nebula backdrop, so the card tiles
keep that background rather than attempting a cutout, which would have looked
rough at this source resolution.

## 16. Add-to-cart meteorite

`src/components/CartMeteor.tsx` fires a meteorite from the add-to-cart button
to the basket icon, then hands off to the badge, which pops with the new count.

- It listens once on the document for clicks on `[data-add-to-cart]` rather than
  taking props, so any add button anywhere gets the effect. Both add buttons
  carry that attribute.
- The badge is hidden for the duration of the flight (`.basket-btn.awaiting`),
  so the meteorite is what delivers the number instead of the count racing
  ahead of it. The button's `aria-label` carries the real count throughout, so
  assistive technology is never out of date.
- The basket drawer is held back ~620ms in `BasketProvider` so it does not cover
  the effect the instant it starts.
- Colour comes from `--meteor-core` / `--meteor-glow` / `--meteor-trail`, which
  are defined per sky, so the meteorite belongs to whichever theme is up: blue
  by day, rose at sunrise, gold at sunset, pale violet at night.
- Under `prefers-reduced-motion` there is no meteorite and the drawer opens
  immediately.

## 17. Footer safety notice (removed on request)

The general "Product information is provided for general reference..." line was
removed from the footer at the client's request. The build brief (section 15)
asked for that notice, so consider restoring it before production publication.
Point-of-need wording still appears where it matters: product detail pages
carry "Availability, final price and fulfilment are confirmed by Cosmic
Pharmacy", and the PMOS collection keeps its own consultation disclaimer.
