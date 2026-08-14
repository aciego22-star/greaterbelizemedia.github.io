# ICB Concept Experience

A speculative, first-draft website concept for Insurance Corporation of
Belize Ltd., prepared by Austere Automations for private client review.
ICB has not commissioned this work; nothing here is an official ICB
website or an offer of insurance.

## What this is

A complete, self-contained front-end prototype in ICB's red, black and
white identity that reorganizes ICB's published public information
around customer tasks: Get Covered, Make a Claim, Find a Branch. It runs
from a static folder with zero external requests (fonts embedded, real
ICB media included locally), so it works identically on any host,
offline, and from disk.

- `index.html` — single shell; views render client-side with hash routes
- `css/site.css` — the entire design system (tokens at the top,
  sampled from the official ICB logo)
- `css/fonts.css` — embedded Archivo + Public Sans (OFL licensed)
- `js/data/*.js` — ALL content and operational data, structured for reuse
- `js/art.js` — generated artwork, glyphs, and the accurate Belize map
  (outline derived from 1:1m open coastline data, ODbL)
- `js/views/*.js` — one module per page; the homepage hero is a
  rotating three-slide real-media carousel with autoplay, pause and swipe
- `build/build-single.js` — optional one-file build (`dist/`)

See `DEPLOY.md` for hosting and `IMAGES.md` for the photography plan.

## Real ICB assets

Supplied by the client and integrated in this pass:

- `assets/img/icb-logo.png` — the official ICB logo (trimmed and resized
  only, never redrawn). Used in the header, footer and favicon.
- `assets/img/icb-hq.webp` — the headquarters photograph (hero slide 1,
  About page).
- `assets/img/icb-protect-artwork.jpg` — the "Protect Your Investment"
  campaign artwork (hero slide 2).
- `assets/video/icb-story.mp4` — the "Life Happens Fast" film,
  compressed for web (hero slide 3, The ICB Story section).
- `assets/img/products/`, `assets/img/gallery/` — real product and
  gallery imagery: frames from the film and photography cropped from
  the campaign artwork (see `IMAGES.md` for the full map).
- The site palette is sampled directly from the logo (red `#D12126`,
  black `#000000`).

### The ICB film

`assets/video/icb-story.mp4` is the supplied "Life Happens Fast" ad
(1080p, 23.7 MB source) compressed for web playback: H.264 at 1024px
wide with light AAC audio, moov atom at the front, 3.8 MB total. The
hero's third slide autoplays it muted and looped (paused under reduced
motion and while the slide is inactive); The ICB Story section plays it
with controls and sound. `assets/img/video-poster.jpg` is a frame from
the film used as the poster. To swap in a new cut, replace the mp4 (and
poster) and keep the same filenames.

## WhatsApp directory

Every WhatsApp number on the site comes from the client-supplied verified
directory (16 lines across all six districts) stored once in
`js/data/locations.js`. Links are built by `ICB.render.waHref()` as
digits-only `https://wa.me/<number>` URLs with a neutral prefilled
greeting, opened with `target="_blank" rel="noopener noreferrer"`. The
"WhatsApp ICB" modal (`js/whatsapp.js`), branch cards, contact areas and
the mobile quick bar all read from that single dataset. Locations without
a supplied WhatsApp number show no WhatsApp button.

## Data provenance and placeholders

Every branch address, phone number, WhatsApp line, email, product
category and claims form name was taken from ICB's current public
website. Where a detail could not be verified, the interface says so
plainly (for example, the San Pedro branch phone routes through the
corporate office) instead of inventing anything. Search the data files
for "TBC" and "to be confirmed" before any official use.

Details to revisit with ICB before the concept goes further:

- **Claims forms.** "Download form" actions open ICB's official claims
  page. When direct PDF URLs are available, set them per pathway in
  `js/data/claims.js` (`external.claimsForms` in `js/data/site.js`
  holds the shared default).
- **Travel insurance.** The availability notice reflects ICB's current
  published suspension of travel insurance sales; update the `status`
  field in `js/data/products.js` when that changes.
- **Photography.** Every visual panel is generated concept artwork and
  doubles as a slot for approved ICB photography (`IMAGES.md`).

## Future digital assistance

This draft deliberately contains no chat interface. A small "future
digital assistance" note appears in the contact areas; the data files
(`js/data/*.js`) already structure products, claims, locations and
resources so a future ICB digital assistant can be built on the same
content when the website concept is approved.

## The contact form

The guided enquiry journey is a front-end demonstration. Submitting
reveals a notice that nothing is transmitted and points to ICB's real
phone and email. Wire the final step to a real destination before any
production use.
