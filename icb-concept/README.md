# ICB Concept Experience

A speculative, first-draft website concept for Insurance Corporation of
Belize Ltd., prepared by Austere Automations for private client review.
ICB has not commissioned this work; nothing here is an official ICB
website or an offer of insurance.

## What this is

A complete, self-contained front-end prototype that reorganizes ICB's
published public information around customer tasks: Get Covered, Make a
Claim, Find a Branch, Ask ICB. It runs from a static folder with zero
external requests (fonts are embedded, all visuals are generated brand
artwork), so it works identically on any host, offline, and from disk.

- `index.html` — single shell; views render client-side with hash routes
- `css/site.css` — the entire design system (tokens at the top)
- `css/fonts.css` — embedded Source Serif 4 + Public Sans (OFL licensed)
- `js/data/*.js` — ALL content and operational data, structured for reuse
- `js/art.js` — generated artwork, glyphs, Belize map, photo-slot system
- `js/views/*.js` — one module per page
- `js/ask-engine.js` + `js/ask-icb.js` — the Ask ICB demonstration
- `build/build-single.js` — optional one-file build (`dist/`)

See `DEPLOY.md` for hosting and `IMAGES.md` for the photography plan.

## Data provenance and placeholders

Every branch address, phone number, WhatsApp line, email, product
category and claims form name was taken from ICB's current public
website. Where a detail could not be verified, the interface says so
plainly (for example, the San Pedro branch phone routes through the
corporate office) instead of inventing anything. Search the data files
for "TBC" and "to be confirmed" before any official use.

Two details to revisit with ICB before the concept goes further:

- **Palette.** The navy/gold scheme is a provisional design direction.
  Swap the hex values in the tokens block at the top of `css/site.css`
  for ICB's official brand colors; everything follows.
- **Logo.** The shield monogram in `index.html` (and `js/ask-icb.js`)
  is an interim mark, clearly commented, to be replaced with the
  official ICB logo asset.
- **Claims forms.** "Download form" actions open ICB's official claims
  page. When direct PDF URLs are available, set them per pathway in
  `js/data/claims.js` (`external.claimsForms` in `js/data/site.js`
  holds the shared default).
- **Travel insurance.** The availability notice reflects ICB's current
  published suspension of travel insurance sales; update the `status`
  field in `js/data/products.js` when that changes.

## The Ask ICB demonstration

Ask ICB is a scripted preview of a future digital assistant. The
interface (`js/ask-icb.js`) talks only to an engine contract defined in
`js/ask-engine.js`; the shipped engine pattern-matches against curated
responses in `js/data/ask-icb.js`. To connect a live assistant later,
replace the single `ICB.askEngine` assignment at the bottom of
`js/ask-engine.js` with a production implementation that resolves the
same response shape. No other file changes.

The scripted responses deliberately never quote prices, confirm
coverage, interpret policy language or assess claims.

## The contact form

The guided enquiry journey is a front-end demonstration. Submitting
reveals a notice that nothing is transmitted and points to ICB's real
phone and email. Wire the final step to a real destination before any
production use.
