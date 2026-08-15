# ICB Concept Experience

A speculative, first-draft website concept for Insurance Corporation of
Belize Ltd., prepared by Austere Automations for private client review.
ICB has not commissioned this work; nothing here is an official ICB
website or an offer of insurance.

## What this is

A complete, self-contained front-end prototype in ICB's red, black and
white identity that reorganizes ICB's published public information
around customer tasks: Explore Insurance, File a Claim, Find a Branch. It runs
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
- `js/assets.js` — asset resolver: views emit `data-asset="assets/..."`
  and it hydrates real `src`/`poster` properties after mount
- `build/build-single.js` — optional one-file build (`dist/`)

See `DEPLOY.md` for hosting and `IMAGES.md` for the photography plan.

## Weight on the wire

The repository is large because it carries two campaign films, but total
repository size is not page weight. A first-time visitor to the homepage
downloads about 1.7 MB, and about 0.9 MB for any interior page. Moving
between pages after that costs between 2 KB and 57 KB, because the shell,
the fonts and the CSS are already cached and only new photography is
fetched.

The films are `preload="none"` and never autoplay with sound, so their
16 MB is downloaded only by a visitor who presses play, and even then
`+faststart` means playback begins before the file finishes arriving.

## Assets and the preview build

Views never write an asset URL into their HTML string. They emit
`data-asset="assets/..."` and `js/assets.js` hydrates it into a real
`src` after the markup is in the DOM, resolving through `ICB.ASSETS`.

In the deployed folder that map is empty, so a slot resolves to its own
path and the browser fetches the file normally. In the single-file
preview `build/build-single.js` fills the map with base64 data URIs. This
matters for two reasons: each asset is stored once no matter how many
places use it, and multi-megabyte strings never pass through the HTML
parser on navigation. Film and hero video sources carry
`data-asset-defer` on top of that, so they resolve only when something
plays.

Without this the preview re-parsed roughly ten megabytes of base64 every
time you clicked a menu item.

## Real ICB assets

Supplied by the client and integrated in this pass:

- `assets/img/icb-logo.png` — the official ICB logo (trimmed and resized
  only, never redrawn). Used in the header, footer and favicon.
- `assets/img/icb-hq.webp` — the headquarters photograph (hero slide 1,
  About page).
- `assets/img/icb-protect-artwork.jpg` — the "Protect Your Investment"
  campaign artwork (hero slide 2).
- `assets/video/icb-life-happens-fast.mp4` and
  `icb-life-happens-fast-es.mp4` — ICB's campaign film in English and
  Spanish, compressed for web (ICB in Motion, and the English cut on the
  hero's fourth slide).
- `assets/img/brands/nce-wide.webp` and `nce-tall.webp` — the two
  supplied Nationwide Cash Express compositions, banner and vertical.
- `assets/img/products/`, `assets/img/gallery/` — real product and
  gallery imagery: frames from the film and photography cropped from
  the campaign artwork (see `IMAGES.md` for the full map).
- The site palette is sampled directly from the logo (red `#D12126`,
  black `#000000`).

### The hero film

The hero's fourth slide plays the film as ambient motion the moment the
slide comes up. No browser will start a video with audio unprompted, so
it opens muted and sound is one tap away: the whole picture is a toggle,
not just the speaker button in the corner, and the choice is remembered
for the session so later visits to the slide start with sound already
on. Looping is
dropped once the sound is on, and the carousel is held so the film is not
slid away mid-sentence. Leaving the slide stops it, so audio never
carries under another slide. If a browser refuses even muted playback, a
play button appears as a fallback.

### The ICB films

Both supplied 1080p cuts are compressed for web playback at 1280x720,
two-pass ~800 kb/s H.264 with AAC stereo at 128 kb/s, full length, moov
atom at the front. ICB in Motion plays them with controls and sound, one
at a time, and nothing downloads until a visitor presses play. The hero
uses the same model rather than autoplaying anything.

Titles come from the films themselves: the English cut closes on "Life
Happens Fast / Protect Yourself With ICB", the Spanish cut on "La Vida
Pasa Rapido / Protegete Con ICB".

`build/preview/` carries a lighter encode of each film used only by the
single-file preview build, which is size-capped. See `IMAGES.md`.

## WhatsApp directory

Every WhatsApp number on the site comes from the client-supplied verified
directory (16 lines across all six districts) stored once in
`js/data/locations.js`. Links are built by `ICB.render.waHref()` as
digits-only `https://wa.me/<number>` URLs with a neutral prefilled
greeting, opened with `target="_blank" rel="noopener noreferrer"`. The
"WhatsApp ICB" modal (`js/whatsapp.js`), branch cards, contact areas and
the mobile quick bar all read from that single dataset. Locations without
a supplied WhatsApp number show no WhatsApp button.

## Content rules

Every public-facing sentence in this concept is one of three things:
verified ICB information, a safe modern paraphrase of verified ICB
information, or plain UX copy that makes no substantive insurance claim.
Nothing states policy terms, premiums, limits, exclusions, claim
requirements or legal requirements that ICB does not publish itself.

Product categories and subcategories, the claims service values and the
five claim form names are ICB's published lists, used verbatim. The
claims pathway is administrative only: identify the claim type, open the
official form, contact ICB, and the claims team explains the applicable
next steps. It deliberately does not describe documents, reports,
evidence or settlement.

Development notes live in code comments, never on the page. Search the
data files for `INTERNAL TODO` for the full list. The open items are:

- **Claims forms.** Form buttons open ICB's official claims page. Set
  direct PDF URLs per pathway in `js/data/claims.js` when ICB supplies
  them (`external.claimsForms` in `js/data/site.js` holds the default).
- **Travel Insurance.** The page reflects ICB's current published
  suspension of sales, and carries no action implying cover can be
  arranged. Clear `suspended` in `js/data/products.js` if that changes.
- **Mexican Insurance.** The ANA Seguros pathways (Buy Now, View
  Coverage, Claims, FAQs) all route to ICB's Mexican Insurance page
  until ICB supplies the direct ANA URLs.
- **Branch details.** Several branches have no published landline,
  street address or email reachable from here. Those cards offer the
  Corporate Office line, clearly labelled as the Corporate Office, and
  `js/data/locations.js` lists exactly which records need reconciling
  against ICB's contact page.
- **San Juan Village.** ICB's social presence indicates service there.
  No contact details are published, so it is deliberately absent from
  the public dataset and noted for confirmation instead.
- **Resource Centre.** The seven consumer-education articles written for
  the first draft were removed. They were not ICB material. The section
  now signposts only what ICB publishes, with one clearly marked slot
  for guides ICB writes and approves later.
- **Branch photography.** Eight branch tiles render a designed location
  plate until official photographs are supplied (`IMAGES.md`).

## Locations

`js/data/locations.js` is the single source of truth for all 19 branches,
agencies and the Corporate Office, and it feeds the branch finder, the
map, the WhatsApp directory, the call directory, the contact flow, the
mobile quick actions and the gallery captions. Every published location
is listed whether or not it has a WhatsApp line; WhatsApp availability
never decides whether a location exists.

## Future digital assistance

This draft contains no chat interface and makes no claim about one, since
ICB has not announced an assistant. The data files (`js/data/*.js`)
structure products, claims, locations and resources so one can be built
on the same content if ICB decides to.

## The contact form

The guided enquiry journey is a front-end demonstration. Submitting
reveals a notice that nothing is transmitted and points to ICB's real
phone and email. Wire the final step to a real destination before any
production use.
