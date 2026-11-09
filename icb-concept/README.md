# ICB Concept Experience

The rebuild of the Insurance Corporation of Belize Ltd. website, built
by Austere Automations and commissioned by ICB. It goes live on
www.icbinsurance.com and is reviewed in the meantime on the agency
subdomain. Nothing on it is an offer of insurance.

(This paragraph used to say the work was speculative and uncommissioned,
which it was when the first draft was written and has not been since.)

## What this is

A complete, self-contained front-end prototype in ICB's red, black and
white identity that reorganizes ICB's published public information
around customer tasks: Explore Insurance, File a Claim, Find a Branch. It runs
from a static folder with zero external requests until someone opens the
assistant (fonts embedded, real
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
- `js/data/news.js` + `js/views/news*.js` — What's New at ICB: a listing
  at `/news` and one real page per article at `/news/<slug>`, both
  languages, each with its own title, canonical and hreflang pair
- `js/data/claim-forms.js` — ICB's nine claim forms as structured
  fields, 376 of them in both languages. Each one is downloadable as
  ICB's own PDF and fillable on the device, signed with a finger, with
  the completed PDF written in the browser by `js/pdf.js`
- `js/assets.js` — asset resolver: views emit `data-asset="assets/..."`
  and it hydrates real `src`/`poster` properties after mount
- `build/build-single.js` — optional one-file build (`dist/`)
- `build/branch-webp.py`, `build/news-webp.py` — the photograph and hero
  image pipelines, each writing a full-size file for the site and a
  lighter rendition for the one-file preview

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

## Getting around

There is deliberately no back button of our own. Routes are hash routes,
so the phone's own back already works: edge-swipe on iOS, the gesture or
hardware key on Android, and the browser's arrow on a desktop. A second
back control would duplicate a working one and could disagree with it,
and it cannot know whether going back would leave the site altogether.

Three things make that native back feel right, and give a way home where
the browser's own chrome is hidden, as it is inside a preview frame:

- **Scroll memory.** `js/router.js` stamps every history entry with a key
  and files the scroll position against it on the way out, so back and
  forward return the reader to where they were rather than to the top of
  the page. A link click pushes an entry carrying no stamp, which is how
  a fresh navigation is told apart from a back: fresh opens at the top.
  Two things this depends on and neither is obvious. The browser's own
  `scrollRestoration` is set to `manual`, because otherwise it tries to
  restore a single-document app and fights us. And every jump goes
  through `jumpTo`, which turns off the document's `scroll-behavior:
  smooth` for the instant it takes to move: `scrollTo`'s `behavior:
  "auto"` does NOT mean instant, it means "whatever the CSS says", so
  without that the page glides instead of arriving.
- **A breadcrumb on every interior page**, one rung for a section and two
  for a product. Up-navigation, not back-navigation: it leads to the same
  place regardless of how the reader arrived. `ICB.render.crumbs` builds
  it, `crumbsHome` the common single-rung case.
- **Home in the mobile menu**, first in the list. The desktop bar does
  not carry it because the logo sits inches away and is always visible;
  in a list of destinations the word earns its place.

Positions are re-applied for a few frames after render rather than set
once. Images, films and map art get their size after the markup lands, so
a position computed in that first instant can be short by the time
everything has weight; an anchor on the claims page was measured moving
62px after the jump. The re-apply stops the moment the reader touches the
page, and abandons if another navigation starts.

A link to the page you are already on changes no hash, so no navigation
fires. Those taps are caught and answered by returning to the top, which
is what tapping Home does everywhere else. Without it, someone at the
foot of the homepage tapping Home would see nothing happen at all.

## The hero carousel

Five slides since 8 Nov 2026, in a fixed order the array in
`js/views/home.js` is the only source of truth for: the headquarters
photograph, the Protect Your Investment campaign artwork, What's New,
Short-Term Insurance at the border kiosk, and the film.

Slide 3 is a pair of supplied compositions that paint their own heading
and button, which is why the whole artwork is the link. **Do not swap
it for a photograph.** It was swapped once, on 8 Nov 2026, for the
signage photograph ICB sent for the What's New *page* hero, and put
back the same day.

Slide 4, the border kiosk, is a photograph cut to three shapes and runs
full screen on a phone with the words over it, which ICB asked for:
immersive, no band of ground underneath. That is what `.hero-slide--photo`
does by default, so the slide carries no `mobileAR`. It does carry
`phonePos`, because the default phone framing of 10% from the left
belongs to slide 1 and was measured against where that building's
signage sits; any other photographic slide states its own. Measured
across seven widths it loses at most a quarter of its width, at
upright-tablet size, and shows no bar anywhere; `check/herofill.js`
holds it to that.

Slide 4 also carries `logo: true`, which paints ICB's own roundel on a
white plate above the eyebrow. ICB asked for it because the only ICB
mark in that photograph is the signboard over the kiosk door, which is
unreadable at hero scale. It is hidden below 769px, where the header's
own logo is a couple of centimetres above it on the same screen.

Autoplay is driven by the active progress bar's CSS fill animation: when
it completes, the slider advances, and pausing the animation pauses the
clock. It holds for a hidden tab, for a pointer held down on the picture
(so a slide cannot move out from under a tap), for keyboard focus inside
the hero, and while the cursor is over the controls. Choosing a slide by
hand switches autoplay off for good, and reduced motion never starts it.

Hovering the picture itself does NOT pause it. It used to, and on a
desktop that quietly switched autoplay off altogether: the hero fills the
top of the window, so a resting cursor is usually on it, and once the
pointer stopped moving the carousel stayed paused. It looked broken on
desktop while working on a phone, which has no hover. Hovering the
controls still pauses, which is the part worth keeping, since that is a
small deliberate target rather than the whole picture.

Worth knowing for future tests: a headless pointer sits at 0,0 and never
moves, so `mouseenter` never fires and this class of bug is invisible
unless the test moves the mouse onto the hero first. `hero-autoplay.js`
does exactly that.

## Photographic heroes: how dark to go

Interior page heroes carry a photograph behind white copy, and the scrim
that makes the copy legible is the thing that decides how much of the
photograph a visitor ever sees. It was set far too heavy, most of all on
a phone, where nothing was lighter than 62% black.

Two changes, and the order matters. First the copy: the crumbs and the
lead were soft grey over a photograph, and dim text is what forced the
scrim to be heavy, because the scrim had to drag the picture down to meet
it. They are near-white now with a local text-shadow, which carries its
own contrast without touching the image. Only then could the scrim be
lightened, from 0.93/0.88/0.42/0.30 to 0.86/0.74/0.30/0.14 across, and on
a phone from 0.95/0.88/0.62 to 0.90/0.74/0.34.

Measured rather than eyeballed, in `scratchpad/check/legibility.js`,
across ten pages at both sizes. Two numbers per hero: mean luminance (how
much photograph is visible) and the worst contrast of any text against
the backdrop directly behind it, using each element's own computed colour
rather than assuming white. Result: desktop heroes went from 43 to 57
mean luminance, phones from 29 to 46, and the worst contrast anywhere is
5.1:1 against a 4.5:1 floor. The suite holds both ends, so a future
adjustment cannot quietly darken them again or push legibility under.

The homepage carousel is deliberately untouched. It has its own scrim,
tuned against different artwork, and it was not the problem.

The location plates were raised at the same time. Eight of them share a
grid with real photographs, and at near black they read as holes in it
rather than as tiles waiting for a picture.

## Product pages: what a "Learn more" page owes the reader

Someone who clicks Learn more has asked to understand the product, so
each product page answers five questions in order before it asks for
anything: what is this insurance, what can it help protect, what options
does ICB publish, who may find it relevant, and what to do next.

Sections are driven entirely by what a category carries in
`js/data/products.js` (`intro`, `whyInsure`, `coverageOptions`,
`extensions`, `partner`, `forWho`, `useful`). A category with little to
say renders a short page rather than a page of empty headings. Property
and Motor are the richest because ICB publishes the most about them.

**Published figures.** Where ICB publishes an amount it is reproduced
exactly and always as a ceiling: "up to", "protection level". A limit is
the most a policy may respond with, never an amount anyone is promised,
and the copy must not blur the two. The Motor flyer's figures are locked
into the content audit so they cannot drift.

The Motor flyer's options (Third-Party Act, Third-Party Act Plus,
Liability Levels 1-4, Comprehensive) are presented SEPARATELY from the
website's Liability Only / Collision and Upsets / Comprehensive list.
How the two relate is not published, and guessing would be an invention
about what someone is buying.

## Request a quote

`quote: true` on a product means ICB can quote it today. Everything that
offers a quote reads from `ICB.DATA.quotableProducts()` and links through
`ICB.DATA.quoteHref(id)`, so a category coming off sale is one flag
rather than a hunt through the views.

It is a request, not a quotation. Nothing is priced, approved or bound,
and `ICB.DATA.quoteNote` sits under every quote action saying so. The
content audit bans the wording that would imply otherwise: instant
quotes, guaranteed prices, approval, "get covered now".

The href carries the category, and the enquiry form reads it, so a
visitor who clicked Request a quote on Motor never gets asked what they
want to insure. The New Insurance Enquiry lists only quotable
categories, so the form cannot invite an enquiry for something ICB is
not selling through this site.

Mexican Insurance carries `quote: false`: ICB arranges it through ANA
Seguros, so the page leads with ANA's published pathways rather than an
ICB quote.

## Payments: ICB is paid by bank transfer

One exception, confirmed 8 Nov 2026: ICB's Short-Term Insurance for
visiting drivers IS bought and paid for online, by card, on ICB's own
system at `kiosk.icbinsurance.com`. That is ICB's origin, not ours, and
this site links to it rather than framing it, because a card field
belongs on the origin whose name is in the address bar. Everything below
is about premiums on ordinary policies, which is what the rest of the
site deals with.

ICB does not take payments on its website. Earlier drafts of this concept
linked an external billing host and mentioned a kiosk service; both were
wrong and every trace of them is gone, including the external `payments`
key that used to sit in `site.external`.

`#/payments` explains the real process: transfer through your own bank,
screenshot the confirmation, send it to your branch on WhatsApp, ICB
verifies before documents are issued. The page is deliberately incapable
of looking like a checkout. No amount field, no card field, no login, no
upload, no success state; the only control on it copies an account
number, and the verification suite fails if a form element appears.

Two honesty constraints worth keeping:

- A page cannot attach the customer's screenshot to WhatsApp, so the copy
  tells them to attach it themselves rather than letting them assume the
  link carried it.
- A page cannot reliably open a banking app or know whether it is
  installed, so no custom URL scheme is invented. iOS and Android
  visitors get the verified store page, which opens the app when it is
  already there; desktop leads with online banking.

Account numbers live in `js/data/payments.js` and are retyped
independently in `scratchpad/check/payments.js`, so the two have to agree
digit by digit or the suite fails. They are what a customer will type
into their bank.

The payment-confirmation directory is NOT a second list. It comes from
`ICB.DATA.receiptLines()`, which reads a `receipt` flag on the WhatsApp
lines in the location dataset, so a branch cannot be shown as taking
receipts on one screen and not another. Fifteen lines carry it. Caye
Caulker, Benque Town Board and San Juan do not: they have WhatsApp, but
ICB has not said those lines receive payment confirmations. Email is
offered for help only, never as a receipt channel.

## Not every WhatsApp number takes calls

`callable` on a WhatsApp line defaults to true, because a branch mobile
normally dials as well as it messages. Set it FALSE where ICB publishes
the number as WhatsApp only. The line then stays on every WhatsApp
surface and disappears from every calling one, and the location falls
back to the Corporate Office for calls, labelled as the Corporate Office.
San Juan Agency is the current case. A call button on a number that takes
no calls is a dead end, and assuming otherwise is the kind of guess this
project does not make.

## One tap, one result

ICB asked on 8 Nov 2026 that every tap and click do its job first time.
`check/onetap.js` sweeps 19 routes at phone and desktop width and holds
three things at zero:

- **Occluded.** Every control is hit-tested at its own centre, after
  being scrolled to the middle of the screen so that sitting briefly
  under the sticky header does not count. Anything else answering at
  that point means the first press goes somewhere the visitor did not
  aim.
- **Hover-only.** Read from the stylesheet rather than guessed at:
  any `:hover` rule that changes `opacity`, `visibility`, `display` or
  `pointer-events` on something pressable, where the resting state is
  inert. A phone has no hover, so the first tap applies the state and
  the second one acts. None exist here.
- **Dead.** Drawn to look pressable, with no link and no handler.

Tap size is printed but not asserted. It is dominated by links inside
running prose, where a line of text is the right size for a line of
text, and by controls whose invisible hit area is larger than their
paint: the carousel dots paint 36x28 and answer across 44x48.

Two faults it found, both fixed, and one thing it cannot fix:

- **The hero's own buttons were behind the quick bar** at rest on a
  short phone. At 360x740 Explore insurance and File a claim sat at
  y 687 with the bar starting at 677, so a tap on either went to Call.
  A full-screen slide's words are anchored to the bottom of the slide,
  and below 720px the hero is taller than the screen. They now clear
  the bar by `--bar-clear`, which costs nothing because those slides'
  words are far shorter than the row they sit in.
- **The assistant flew over things.** The launcher drifted on a loop
  that did not repeat, and the compensation for being a moving target
  was that it stopped when a pointer reached it. On a touch screen
  there is no pointer, and on a mouse, if it was over the button you
  were going for, moving to the button was reaching it, so it parked
  exactly where you were aiming. ICB asked on 9 Nov 2026 for the
  movement to go. **The flight is gone**, all of it, and the pill sits
  where the stylesheet puts it. It asks for attention by pulsing
  instead; see below.
- **The hero's second button and the launcher.** With the launcher
  parked in the bottom-right corner, the full-screen slides lift their
  words clear of both it and the quick bar through `--bar-clear`,
  which costs nothing because their words are far shorter than the row
  they sit in. The campaign poster cannot do that: it stacks, so its
  buttons are the end of its content and padding below them moves
  nothing. On a 390px phone the launcher covers the middle of its
  second button. Narrowing that row to wrap the buttons clear was
  tried and reverted, because this is the tallest slide and its height
  is the row's height: the film went from 70.9% of its frame cropped
  to 73.1% and the other three slides' buttons were pushed back down
  into the launcher. One slide's fix broke three. Raised with ICB.

## Asking for attention

The Talk to Bee launcher and ICB's social links pulse red for twenty
seconds after the page loads and then stop. Touching any of them stops
all of them at once, because they are one invitation rather than five;
so does opening the assistant, and so does closing it again.

`js/assistant.js` owns the timing and puts one class on the root
element, so the stylesheet owns what it looks like and the social rows,
which two other views render and which may not exist when the script
runs, need no wiring of their own.

Two things about it are deliberate and should not be "tightened" later.
It is a ring drawn with `box-shadow` outside each control's own box,
not a border: a border would change the box and shift what is around
it, while a ring costs no layout and takes no taps, so the thing asking
for attention is never the thing standing in front of something else.
And it runs at one pulse every 1.1 seconds. WCAG 2.3.1 draws the line
at three flashes a second, and content that crosses it can trigger a
seizure, so the urgency is paid for in contrast and in the size of the
ring rather than in speed. Reduced motion gets no pulse at all.
- **The carousel dots are below the fold** at rest on phones shorter
  than about 870px, because the hero is taller than the screen and
  they live at the foot of it. They are not covered once scrolled to,
  and a tap on them lands first time. Making them float was tried and
  reverted: held above the bar they covered the slides' own buttons,
  which is a worse trade, and the two cannot be reconciled because the
  controls would anchor to the viewport while the buttons anchor to
  the slide. The hero cannot be shortened to fit either: ICB's upright
  What's New composition alone is 621px at 360px wide, against 616px
  of room above the bar. Shortening it means cropping ICB's artwork,
  which is theirs to decide.

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
- **Mexican Insurance.** The ANA Seguros pathways (Buy Now, View
  Coverage, Claims, FAQs) all route to ICB's Mexican Insurance page
  until ICB supplies the direct ANA URLs.
- **Short-Term Insurance.** ICB publishes no premium for it anywhere, so
  `#/insurance/motor/visitors` states none. If ICB ever publishes a rate
  table, it belongs on that page; until then the page says what the
  cover is and sends people to ICB's own system to be priced.
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
  now signposts only what ICB publishes. A slot for guides ICB writes
  and approves later is reserved in the data and is no longer painted on
  the page, because an empty card describing itself is a note to the
  build team rather than something a visitor should read.
- **San Narciso.** Held at `active: false` pending ICB confirmation of
  its operating status, so it is absent from the branch finder, the map,
  the call directory and the WhatsApp directory. See Locations below.
- **Branch photography.** Ten branch tiles render a designed location
  plate until official photographs are supplied (`IMAGES.md`).

## Locations

`js/data/locations.js` is the single source of truth for all 19 branches,
agencies and the Corporate Office, and it feeds the branch finder, the
map, the WhatsApp directory, the call directory, the contact flow, the
mobile quick actions and the gallery captions. Every published location
is listed whether or not it has a WhatsApp line; WhatsApp availability
never decides whether a location exists.

Everything a visitor can see reads `ICB.DATA.activeLocations()`, never
the raw array. A record carrying `active: false` stays in the dataset for
reference but appears on no public surface, so a location held back for
confirmation cannot leak into one screen while being absent from another.
San Narciso is the one record held that way today; set `active: true`
once ICB confirms it and every surface picks it up at once. The gallery
is the single exception, and only in one direction: a held-back location
contributes a tile solely when a real photograph exists for it, captioned
as a place rather than as a branch.

The WhatsApp directory says "Choose a WhatsApp-enabled ICB location",
because not every ICB location publishes a WhatsApp line and the wording
must not suggest otherwise.

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
