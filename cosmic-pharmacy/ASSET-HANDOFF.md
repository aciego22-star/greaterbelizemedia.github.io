# Cosmic Pharmacy — Asset Handoff Guide

How to drop the real Cosmic Pharmacy media into the concept build without
touching any component code. Every placeholder in the site is data-driven: give
a record a real file path and the labeled placeholder disappears.

## 1. Folder layout (stable — do not rename)

```
public/assets/products/   product packaging photographs
public/assets/gallery/    gallery photographs and short videos (+ video posters)
public/assets/hero/       hero stills, hero video encodes, video poster
```

Paths stored in data files are **relative, without a leading slash** — e.g.
`assets/products/centrum-women.jpg` — so both the Netlify build and the
single-file preview resolve them.

## 2. Product images

- **Naming**: `assets/products/<product-slug>.jpg` (match the product's `slug`
  in `src/data/products.json`, e.g. `centrum-women-multivitamin.jpg`).
- **Content**: real packaging, legible label, uncropped, on a clean neutral
  background. Background cleanup and colour correction only — never fabricate,
  relabel or AI-alter packaging.
- **Format/size**: JPG or WebP, ~1200×1200 px square (the UI renders
  `object-fit: contain`, so any aspect works but square is cleanest), under
  ~250 KB each.
- **Hook-up**: set the product's `"image"` field and write a real `"imageAlt"`
  describing what is actually visible.

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
- [ ] Hours, prices, and the "100+ supplements" claim verified with the client.

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

## 10. Colour system

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

## 9. Social links

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

## 13. Footer safety notice (removed on request)

The general "Product information is provided for general reference..." line was
removed from the footer at the client's request. The build brief (section 15)
asked for that notice, so consider restoring it before production publication.
Point-of-need wording still appears where it matters: product detail pages
carry "Availability, final price and fulfilment are confirmed by Cosmic
Pharmacy", and the PMOS collection keeps its own consultation disclaimer.
