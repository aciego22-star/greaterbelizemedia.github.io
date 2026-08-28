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

### The client's gallery pack (installed)

Six full-resolution assets, in `src/assets/gallery/` and keyed like everything
else. They lead the gallery, because they are the only uncropped, full-quality
media in it.

**Two of the six were not new items.** `cosmic-gallery-pmos-stop-the-noise` and
`cosmic-gallery-pharmacy-services` are the uncropped originals of graphics the
gallery already carried as 400x400 square crops from the catalogue folder, and
those crops had cut the wording off: the Stop the Noise crop lost its
"Contact us at 611-8080" line and its six-step footer strip, and the services
crop lost the phone number and the whole social row. The records now point at
the originals and the two square crops were deleted, which is why the catalogue
count went from 129 to 127 while the total went to 133.

Categories were mapped onto the gallery's existing filters rather than adding
new chips:

| Pack category | Filters used |
| --- | --- |
| Pharmacy & Services | `inside-cosmic`, `social-highlights` |
| Inside Cosmic Pharmacy | `inside-cosmic` |
| Product & Wellness Highlights | `products-wellness`, `social-highlights` |
| Women's Wellness & PMOS | `products-wellness`, `social-highlights` |
| Milestones & Community | `community`, `social-highlights` |

A "Women's Wellness & PMOS" chip of its own is a reasonable next step if the
client wants it, but two items did not justify one.

The pack's `fit` column has no counterpart in the data, deliberately. It asks
for `contain` on the graphics and `cover` on the photograph so nothing is
cropped; the gallery is a masonry that already lets every item keep its native
aspect ratio, so there is no crop to fit against and a `fit` field would be
dead. Everything else the pack asked for was already in place: the lightbox
opens the complete image, images below the fold are `loading="lazy"` and
`decoding="async"`, and the grid runs one column on a phone, two at the middle
breakpoint and three above it.

**Two things need Ms Carter before publication:**

1. The third-anniversary graphic carries a dated offer in its own artwork:
   "10% off on all prescriptions being filled, valid until 10th May." It sits
   under a milestone title, so it reads as a record rather than a live offer,
   but a visitor sees the graphic, not the caption. Confirm it stays.
2. The PMOS kit comparison carries the kits' own wellness wording. Per the
   pack's own rule, none of it is restated as advice anywhere else on the site,
   and it should not be.

## 4. Hero media (`src/data/heroSlides.ts`)

The hero is a **full-bleed stage**, not a framed card beside a column of text.
The media fills the section edge to edge and the copy sits on top of it. On a
phone it takes the whole screen below the header, which is what the client asked
for and what their other builds do.

### Every still is art-directed twice

The client supplied matched crops: **2400x1080 wide** and **1080x1920 tall**,
installed as `hero-<name>-desktop.webp` and `hero-<name>-mobile.webp`. A slide
carries both keys and the browser picks:

```
image:       'hero-storefront-desktop'   // wide crop
imageMobile: 'hero-storefront-mobile'    // tall crop, <= 900px
```

`<picture>` swaps at 900px, matching the CSS breakpoint. This is art direction,
not resolution: a wide crop scaled down loses the subject entirely on a 9:16
screen, which is the whole reason the crops were re-cut. A unit test fails if
any still ships without its own tall crop.

`imageFocus` and `imageFocusMobile` set `object-position` per crop, because the
subject sits in a different place in each.

### Two slides are shown whole, and reserve a control rail

The how-it-works graphic and the client's reel both carry their own headline,
their own steps and their own fine print, running to the edges of the frame.
Neither can be cropped and neither should have the site's copy laid over it, so
both are `overlay: 'none'` and `imageFit`/`videoFit: 'contain'`, anchored to the
top of the stage.

The slack that leaves collects at the foot of the stage as `--hero-rail`. The
carousel controls, the video's runtime chip and its play control all live in
that rail, so nothing is ever laid over the artwork it belongs to. The rail and
any side gutters take a blurred, dimmed copy of the artwork rather than flat
bars. Browser checks assert that the chrome never overlaps the painted media.

Slides that do carry copy stay `cover` and full-bleed; a photograph has no
critical content at its edges.

### Contrast over photographs

Copy over a photograph is the one place where the theme tokens cannot be
trusted: `--on-sky` is navy in the day theme, and the hero scrim is dark in all
four. So `.hero-copy` and `.hero-controls` take fixed light ink instead of
following the sky, and the eyebrow uses a paler pink than the brand magenta
elsewhere, because the deeper one does not clear 4.5:1 against the brightest
thing the stills put behind it.

The scrim is two parts, and the second exists for a measured reason:

1. A stage gradient, weighted to the foot of the frame.
2. On narrow screens, a backing tied to the **copy block itself**. How far up
   the stage the copy starts depends on how many lines the headline takes and
   how tall the screen is: it measured anywhere from 37% to 52% across the
   sizes we ship, so a stage-percentage gradient cannot guarantee contrast. The
   backing bleeds past the copy to the edges of the stage, which clips it, so
   it reads as the scrim deepening rather than as a panel with sides.

A sweep samples the pixel actually painted behind every run of hero copy, across
3 widths x 4 themes: **112/112 pass AA**, tightest 5.01:1. Re-run it after any
change to a hero image, the scrim, or the copy: a brighter photograph in the
same slot can fail it on its own.

### Replacing a still

- Supply both crops, ~2400x1080 and ~1080x1920, WebP under ~250 KB each.
- Add both keys, real `imageAlt`, and a focus for each crop.
- If the new asset carries its own wording, set `overlay: 'none'` and
  `imageFit: 'contain'`.
- Re-run the contrast sweep.

### The video slide (installed)

The client's promotional reel is installed as `src/assets/hero/cosmic-hero.mp4`
with `src/assets/hero/hero-video-poster.webp` as its poster, both resolved by
key through `lib/media.ts` like every other asset.

What was supplied and what was done to it:

- 720x1280 portrait, H.264, 30 fps, 37.53 s, 1.5 MB. It is a slideshow of
  Cosmic's own branded cards: shop with us, card payments, online bank
  transfers, DigiWallet, city delivery, Tropic Air and BPMS shipping, text or
  call, and opening hours, opening and closing on the logo over a nebula.
- Remuxed (stream copy, no re-encode, so nothing was degraded) with the moov
  atom moved to the front of the file, so it starts streaming immediately
  instead of downloading in full first. The supplied file had it at the end.
- The poster is the frame at t=2.2 s, where the logo and the full
  "Medicine. Health. Beauty." line are both on screen.
- One encode serves every breakpoint. At 720x1280 and 1.5 MB it is already
  phone-sized, so a separate mobile file would only add weight for no gain.
  `videoSrcMobile` stays free for a second encode if a heavier edit replaces it.

**The file carries no audio track.** It is a video-only MP4, so `hasAudio` is
`false` on that slide, and the player behaves accordingly: it autoplays muted,
which every browser permits without a gesture, and it withholds the sound
affordances rather than offering sound the file does not have. The overlay reads
"Play" rather than "Play with Sound", and no mute/unmute control is rendered.
Set `hasAudio: true` the moment a mixed file replaces it and all of that comes
back on its own.

If a different edit is supplied later:

- `videoSrcDesktop`: MP4 H.264 + AAC, target under ~25 MB.
- `videoSrcMobile`: lighter encode, under ~12 MB, served on small screens so
  phones never pull the desktop file. Skip it when one encode is already small.
- `poster`: a frame from the video, ~1600 px wide.
- `durationSeconds`: the edit's REAL runtime. The caption and the overlay both
  read it, and a unit test fails if the caption drifts away from it.
- `hasAudio`: whether the file actually carries an audio track. Confirm it,
  do not assume it.
- `videoFit`: `contain` for a portrait or text-bearing edit, `cover` for a
  landscape one.

### Audio (installed)

The reel is scored with a track the client supplied themselves, described as
temporary, for a presentation.

What was done:

- The client sent a 3:12 MP4. Only its audio was used: its picture was dropped
  outright (`-vn`).
- The requested segment is 1:00 to 1:38, which is 38.0 s. It was cut to the
  reel's exact **37.53 s** instead, so the track ends with the picture rather
  than being clipped mid-note by the player when the video runs out.
- 0.2 s fade in, 1.4 s fade out. The segment starts and ends mid-track and a
  hard cut at either end reads as a glitch. Measured result: -21 dB at the head,
  -8.8 dB through the middle, -31.6 dB at the tail.
- AAC 160 kbps, 44.1 kHz stereo, muxed with the **picture stream-copied**, so
  the video itself was never re-encoded and lost nothing. moov atom to the
  front again. 1.5 MB to 2.4 MB.

`hasAudio` on the slide is now `true`.

**The licence is still open.** The client supplied the file and called it
temporary for a presentation, which is their call to make. Nothing about that
settles publication: a commercial recording on a live pharmacy site needs a sync
licence in Cosmic's name, and the rule from the original brief still stands for
anything published. Swap the track or clear it before this goes public.

### How playback degrades, and why

No browser lets a video start with sound on its own. Rather than let that freeze
a full-bleed hero on its poster, playback degrades in one direction and never
silently:

1. Audible autoplay is attempted first. It succeeds where the visitor has
   already interacted with the site.
2. Refused, the reel plays **muted** and says so: the sound control turns into a
   labelled "Sound" button. The hero keeps moving and the track is one tap away.
3. Only if muted playback fails too does it fall back to the poster and a
   deliberate play action.

This is verified both ways. The browser harness runs the whole slide twice: once
with autoplay permitted, once with `play()` rejecting while unmuted until a
trusted gesture lands, which is Chrome's and Safari's actual rule. Headless
Chromium permits audible autoplay and ignores `--autoplay-policy`, so the
refusal has to be reproduced at that seam or the fallback is never exercised.

### The rail on a phone

The caption reads "Cosmic Pharmacy in 38 Seconds" in full at every width, at the
client's request. At 390px that plus the carousel controls plus the video's own
controls do not fit on one line, so the rail runs two rows: caption and video
controls on top, carousel controls beneath. Its height is measured against what
the controls actually render at, 54px and 42px, not guessed. A browser check
asserts that none of the three overlaps either the reel or each other.

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

## 13. The 100-product demo catalogue (installed)

The client's 100-product demo pack replaced the earlier 286-image draft. Only
these 100 products appear in the catalogue.

- `src/assets/catalogue/` holds 100 product images (the pack's 1200x1200 JPEGs
  re-encoded to 600px WebP, 1.9 MB total) plus the 29 editorial graphics the
  gallery still uses. 129 files in all, and a unit test asserts that split.
- Every record carries the pack's BZD price, marked `demo-only`, and
  `in-stock`, exactly as the pack specifies.
- **Nothing asserts prescription status.** The pack states it is unconfirmed for
  every item, so no record sets `prescriptionRequired` or
  `pharmacistGuidanceRequired`, every card offers Add to Basket, and
  `CatalogueNotice` carries the caveat on the shop and every retail page.
- Image provenance (source URLs, screenshot ids, grid positions) is kept out of
  the bundle entirely, per the pack's rule against exposing it. It lives in
  `CATALOGUE-SOURCES.csv` at the project root, which the app never imports. A
  unit test fails if any of it leaks into `products.json`.

### The site's categories were not changed

The pack groups its 100 items into five broad buckets. The site's twelve
category slugs, its five retail pages and its product types are unchanged;
each product was placed into the slug it actually belongs to, using the bucket
only as a starting point. Baby items in the pack's "Health Products" bucket go
to `mother-baby`, glucose meters in "Medical Devices" go to
`diabetes-monitoring`, and so on. Distribution across the retail pages:
Supplements 20, Health Products 15, Personal Care & Beauty 36, Women's Wellness
20, Medical Devices 12.

### Regenerating

The importer lives in the session scratchpad rather than the repo, since it is
a one-time migration. To reload from a new pack, follow the same mapping rules
above and re-run `npm run validate:data`, which checks every image key against
the files actually on disk.

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

The five kit renders are the client's own supplied files (1200x1200 PNG,
trimmed to the box and re-encoded to 620px WebP). They replaced earlier crops
taken from the campaign reel.

The section runs the kits twice: a continuous right-to-left marquee at the top,
then the same five as cards below. **The marquee carries `contain: inline-size`
and that is not optional.** Its track is `width: max-content`, and without
containment that intrinsic width feeds back into the auto-sized `.page-stack`
grid column, sizing every section on the page to the track and pushing the
whole page about 1080px wider. `overflow: hidden` cannot save it, because the
container itself has grown.

The section closes with `kits-in-hand.webp`, the real kits held by the
pharmacist, beside the campaign's own sign-off.

**One wording change from her campaign.** Her graphic reads "Designed for you in
mind", which mixes "designed for you" with "with you in mind". The site uses
"designed with you in mind". Revert it in `src/pages/Home.tsx` (`.kits-headline`)
if she wants her exact phrasing kept.

## 16. Add-to-cart meteorite

`src/components/CartMeteor.tsx` fires a meteorite (728ms flight) from the add-to-cart button
to the basket icon, then hands off to the badge, which pops with the new count.

- It listens once on the document for clicks on `[data-add-to-cart]` rather than
  taking props, so any add button anywhere gets the effect. Both add buttons
  carry that attribute.
- The badge is hidden for the duration of the flight (`.basket-btn.awaiting`),
  so the meteorite is what delivers the number instead of the count racing
  ahead of it. The button's `aria-label` carries the real count throughout, so
  assistive technology is never out of date.
- **Adding an item does not open the basket.** Being thrown to a checkout
  screen mid-shop reads as a rush. Instead the basket nudges once every ten
  seconds while it holds items (movement is the first 8% of the cycle, the rest
  is rest), and it opens only when the shopper taps it. The nudge stops while
  the basket is open.
- **The nudge animates the icon, not the button** (`.basket-btn.has-items > svg`).
  Animating the button moved its hit target for ~0.8s of every cycle, so a tap
  landing mid-nudge could miss the basket entirely - an intermittent miss the
  client hit in use. A check in the functional suite measures the button's
  bounding box across a full cycle and fails if it moves at all.
- Colour comes from `--meteor-core` / `--meteor-glow` / `--meteor-trail`, which
  are defined per sky, so the meteorite belongs to whichever theme is up: blue
  by day, rose at sunrise, gold at sunset, pale violet at night.
- Under `prefers-reduced-motion` there is no meteorite and no nudge; the count
  simply updates.

## 17. Supernova badge

`src/components/NovaBadge.tsx` sits at the far right of the "What's new at
Cosmic" heading: a core flares, shockwaves and ejecta scatter, the whole thing
collapses and resolves into the word **New**, which then holds for most of the
7s cycle so it reads as a label rather than a loop. Pure CSS on one element
tree, drawing its colours from the brand tokens so it follows the sky. Under
`prefers-reduced-motion` only the word remains.

## 18. Eyebrow rules

The small dash that used to lead every eyebrow is gone sitewide, at the
client's request. It came from a single `.eyebrow::before` rule in
`src/styles/base.css`; removing that rule cleared all 18 eyebrows across the
site at once. A browser check asserts no eyebrow carries a leading rule on any
route.

## 19. Footer safety notice (removed on request)

The general "Product information is provided for general reference..." line was
removed from the footer at the client's request. The build brief (section 15)
asked for that notice, so consider restoring it before production publication.
Point-of-need wording still appears where it matters: product detail pages
carry "Availability, final price and fulfilment are confirmed by Cosmic
Pharmacy", and the PMOS collection keeps its own consultation disclaimer.

## 20. Opening hours: a third source, and a conflict

Cosmic's promotional reel, supplied as the hero video, carries an opening-hours
card. What it states does not match what the site currently shows, and the two
sets look like a transposition of each other rather than a small drift:

| Source | Monday to Saturday | Sunday |
| --- | --- | --- |
| Site now (`src/data/business.ts`), from the coming-soon page | 9:00 a.m. to 7:30 p.m. | 9:00 a.m. to 1:00 p.m. |
| The reel's opening-hours card | 7:30 a.m. to 7:00 p.m. | 9:00 a.m. to 1:00 p.m., **and holidays** |

The reel also states the address as #41 Holy Emmanuel Street (Barbara Harris
St.), Belize City, and the contact number as 611-8080.

`business.ts` was **not** changed. The reel's date is unknown, and opening hours
are a fact customers act on: someone arriving at 8 a.m. on the strength of the
wrong set is a real cost. Ms Carter confirms which set is current, and whether
holidays follow the Sunday hours, before this goes anywhere public. The values
are one edit in `business.ts` once she does.
