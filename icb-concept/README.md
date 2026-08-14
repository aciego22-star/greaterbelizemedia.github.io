# ICB Concept Experience

A speculative, first-draft website concept for Insurance Corporation of
Belize Ltd., prepared by Austere Automations for private client review.
ICB has not commissioned this work; nothing here is an official ICB
website or an offer of insurance.

## What this is

A complete, self-contained front-end prototype in ICB's red, black and
white identity that reorganizes ICB's published public information
around customer tasks: Get Covered, Make a Claim, Find a Branch. It runs
from a static folder with zero external requests (fonts embedded, all
visuals generated brand artwork), so it works identically on any host,
offline, and from disk.

- `index.html` — single shell; views render client-side with hash routes
- `css/site.css` — the entire design system (tokens at the top)
- `css/fonts.css` — embedded Archivo + Public Sans (OFL licensed)
- `js/data/*.js` — ALL content and operational data, structured for reuse
- `js/art.js` — generated artwork, glyphs, and the accurate Belize map
  (outline derived from 1:1m open coastline data, ODbL)
- `js/views/*.js` — one module per page; the homepage hero is a
  rotating four-slide carousel with autoplay, pause and swipe
- `build/build-single.js` — optional one-file build (`dist/`)

See `DEPLOY.md` for hosting and `IMAGES.md` for the photography plan.

## Data provenance and placeholders

Every branch address, phone number, WhatsApp line, email, product
category and claims form name was taken from ICB's current public
website. Where a detail could not be verified, the interface says so
plainly (for example, the San Pedro branch phone routes through the
corporate office) instead of inventing anything. Search the data files
for "TBC" and "to be confirmed" before any official use.

Details to revisit with ICB before the concept goes further:

- **Palette.** The red/black/white system follows ICB's identity, but
  the exact hex values are a design direction. Swap the values in the
  tokens block at the top of `css/site.css` for ICB's official brand
  colors; everything follows.
- **Logo.** The header and footer carry a text wordmark placeholder
  (clearly commented in `index.html`). Drop in the official ICB logo
  asset unchanged; no new mark was invented for this concept.
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
