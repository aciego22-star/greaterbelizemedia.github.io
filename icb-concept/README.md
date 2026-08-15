# ICB Concept Experience

A speculative, first-draft website concept for Insurance Corporation of
Belize Ltd., prepared by Austere Automations for private client review.
ICB has not commissioned this work; nothing here is an official ICB
website or an offer of insurance.

## What this is

A complete, self-contained front-end prototype in ICB's red, black and
white identity that reorganizes ICB's published public information
around customer tasks: Explore Insurance, Make a Claim, Find a Branch. It runs
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
  compressed for web (hero slide 3, the ICB in Motion area).
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
motion and while the slide is inactive); the ICB in Motion area plays it
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
