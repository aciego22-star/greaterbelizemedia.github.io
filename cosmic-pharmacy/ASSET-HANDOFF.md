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

- [ ] Ms. Carter has approved each selected photo/video.
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
