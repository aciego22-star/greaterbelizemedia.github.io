# Imagery status and plan

The concept uses REAL ICB imagery wherever an official asset exists: the
supplied headquarters photographs, frames from ICB's own "Life Happens
Fast" campaign film, photography cropped from the "Protect Your
Investment" campaign artwork, and the supplied border, airport and port
photographs. Generated concept artwork remains only where no official ICB
visual has been supplied.

## Currently real (official ICB material)

| Placement | Source |
| --- | --- |
| Hero slides 1-3 | HQ photograph, Protect Your Investment artwork, the film |
| Property card + page | Film frame: couple at their Belizean home |
| Motor card + page | Film frame: couple with their vehicle |
| Marine Hull card + page | Supplied photograph: red and black motorboat underway |
| Claims page hero | Film frame: customer completing paperwork with ICB |
| Property / Motor / Liability page insets | Native-scale crops of the campaign artwork panels |
| Liability card + page | Film frame: handshake with an ICB representative |
| Travel card + page | Supplied image: traveller at the departure gate |
| Cargo card + page | Supplied image: container ship, port and freight trucks |
| Mexican Insurance card + page | Supplied photograph: Aduana Mexico at Subteniente Lopez |
| Contact / Locations page heroes | Film frame and the HQ building |
| Business feature | Film frame: ICB team member in branded uniform |
| About page hero | HQ photograph |
| ICB in Motion featured video | The compressed campaign film + poster frame |
| Hero slide 3 | Nationwide Cash Express, two supplied compositions |
| Branch gallery (23 of 23 tiles) | Every location |
| Insurance page hero | Supplied photograph of an ICB office building |
| Resources page hero | Supplied photograph: the curved red facade against the sky |
| Gallery page banner | All 23 gallery photographs, cycling on a five second timer |

## The Gallery banner: art direction, and why 16:9

`assets/img/gallery/banner/` holds the desktop sources: `southside-16x9`
and `border-16x9`, each as WebP at two widths with a JPEG of the same crop
as the fallback. The 4:3 originals in `assets/img/branches/southside.jpg`
and `assets/img/gallery/icb-branch-coastal.jpg` are untouched and are the
mobile sources.

The banner is art direction, not a responsive size. Each shot carries a
`<source media="(min-width: 769px)">` for the 16:9 crop, and the plain
`<img>` underneath is the original 4:3. The container takes the matching
ratio at each breakpoint through `--banner-ratio` on
`.page-hero--banner`, so the picture and its box are the same shape:
nothing is stretched, and `object-fit: contain` crops nothing because
there is nothing to crop.

**Why 16:9 rather than the 21:9 that was requested.** Neither supplied
file was 21:9 to begin with: the Belize City frame is 1489x807 (1.85) and
the border frame 906x821 (1.10). Reaching 2.33 means cutting height, and
the numbers do not allow it. The border building occupies about 630px of
its 1086px frame from roofline to base; a 21:9 window over that frame is
621px tall, so the building does not fit at any bias, and the crop loses
either the ICB lettering and the roofline or both entrance doors. The
Belize City frame at 21:9 loses the foot of its doors. 16:9 gives an
815px window and holds the signage, the roofline and the entrances on
both. `scratchpad/check/banner-art.js` asserts that arithmetic alongside
the rendered geometry, so the decision is checkable rather than a matter
of taste. `--banner-ratio` is one line if genuinely wider frames arrive.

**Layout.** Desktop keeps the copy over the picture, sharing a grid cell
with it so the picture sets the height and the heading centres against
it; a 16:9 banner at 1440 is 810px tall, and a heading underneath that
would be below the fold. Below 769px the copy sits beneath the picture: a
4:3 box at 390px is 293px tall and the copy needs about 430px, so
overlaying it would either overflow the picture or force the box off its
ratio.

The third photograph that used to be in this rotation, the curved red
facade, is not in the banner any more. It is shot from below and a 16:9
crop takes its roof off. It remains the Insurance page hero, where the
4:3 it needs is what it gets.

**On "retaining the PNG originals".** The supplied files arrived as JPEG,
not PNG, and each crop ships as WebP with a JPEG of the same crop behind
it, which is the role a PNG would have played. A lossless PNG of a
photograph this size is around 3MB against 118-177KB for the JPEG, and
the single-file preview has a 16MB ceiling, so the fallback is a JPEG.

## The Bee badge

`assets/img/icb-bee-{128,256}.{webp,png}` is the supplied ICB bee badge,
the mark for the Talk to Bee launcher. The artwork arrives as a circle in
a square of white; the red ring measures 1173x1175 centred at (625, 610),
so the frame is cropped square to that centre with four pixels of margin.
The badge then fills its crop edge to edge and the launcher's round clip
lands just outside the ring rather than shaving it.

The 256px file is what is served into a 46px slot, which is what keeps the
mascot crisp on a phone. It is used only by the launcher and by the panel
cover; the header, footer and favicon keep the plain ICB mark.

## Icons

`favicon.ico` at the root, plus `assets/img/icon-{48,96,144,192,512}.png`
and `assets/img/apple-touch-icon.png`. All of them are the supplied ICB
logo, trimmed and resized, never redrawn.

The sizes are not arbitrary. Google asks for a square favicon whose side
is a multiple of 48px, and it reads the home page to find it, so the set
starts at 48 and climbs in multiples. Apple specifies 180 for a touch
icon, which is why that one breaks the pattern. The root `favicon.ico`
carries 16, 32 and 48 together, and exists because browsers and crawlers
request `/favicon.ico` by path whether or not any markup mentions it; a
404 there is the ordinary reason an icon never shows up in search results.

The logo arrives at 480x490 with no margin to trim, so it is centred on a
white square with four percent of breathing room, fourteen percent for the
Apple icon since iOS clips to a rounded square and would otherwise shave
the mark. White rather than transparency is deliberate: the mark is black
and red, and on a dark browser tab a transparent version would disappear.

To regenerate after a logo change, trim to the ink, centre on a white
square, and resize with a Lanczos filter to each size above. At 16px a
monogram this detailed goes soft, which is the honest cost of the rule
that the logo is never redrawn; the 48px file, which is the one Google
actually reads, is clean.

## Corozal Border Branch

`assets/img/branches/corozal-border.*` is the supplied frame at its own
ratio, 906x821, WebP with a JPEG behind it. It is the same building as
the banner's border shot, framed to include the forecourt.

INTERNAL TODO (not client-facing): the identification is the client's.
Every other branch photograph on the site is traceable to something ICB
published; confirm with ICB that this building is the Corozal Border
Branch before the tile is presented as fact. The caption itself comes
from the branch record, as every caption in the grid does.

## The Marine Hull hero: a subject that has to be seen whole

`assets/img/products/marine-boat*` is the supplied red-and-black motorboat
photograph, 1672x941. It ships as WebP at 640, 1000 and 1600 wide with
`marine-boat.jpg` at 1600 as the fallback for anything that cannot decode
WebP, offered through a `<picture>` with `sizes="100vw"`. No crop is baked
into the files: the whole frame is in each one and the hero decides how
much of it to show.

A boat is a long horizontal object, and the brief was that the bow,
canopy, stern and lower black hull all stay in frame. `object-fit: cover`
alone cannot promise that, because the hero's shape is set by how much
copy sits in it, not by the picture. So this hero adapts to the
photograph, through `heroPhoto: "whole"` on the product and
`.page-hero--whole-media` in the stylesheet:

- **1100px and up.** The panel fills the hero as usual, and a min-height
  of `min(35.1vw, 620px)` stops the hero ever being wider than about
  2.85:1. Measured from the pixels, that is the shape at which the top of
  the canopy and the bottom of the hull are both still inside a centred
  cover crop; anything wider starts eating the boat. Past about 1760px the
  cap holds and the crop tightens gently rather than suddenly.
- **Below 720px.** The hero is portrait, and no crop of a landscape
  photograph shows a whole boat in a portrait box. The photograph stops
  being a background and becomes a band across the top of the hero at its
  own aspect ratio, uncropped and with no scrim over it, with the copy in
  the dark block beneath. Nothing is zoomed and nothing is lost.

`scratchpad/check/marine-hero.js` measures the boat's bounding box against
what a cover crop actually shows at fifteen widths, and fails naming the
part that would be lost.

The earlier crop from ICB's Protect Your Investment artwork is still in the
repository at `assets/img/products/marine.jpg`, unreferenced, if the
campaign framing is ever wanted back.

INTERNAL TODO (not client-facing): confirm with ICB whether this
photograph is theirs to publish. It arrived through the client rather than
from ICB's own material, and every other photograph on the site is
traceable to something ICB published.

## How a branch photograph is prepared

One file per branch, WebP, 1200px on the long edge, quality 74. That
covers the lightbox, which caps at 1100 CSS pixels, with a little to
spare.

There is no JPEG twin. Every browser the site supports reads WebP, and
the single-file preview build inlines every file under `assets/img` as
base64, so a second copy of each photograph would add a third again of
its own weight to a preview that is already near the size a preview can
be. The two older files that do have a JPEG twin, Corozal Border and
Southside, predate that rule and are left alone.

The tiles are a fixed height and the photographs are not all the same
shape, so `object-fit: cover` trims something off every one of them, and
which axis it trims changes with the screen: a four-by-three frame loses
its sides in the four-column grid and loses its top and bottom on a
phone. Where that would clip the branch signboard, the entry carries a
`pos` (a CSS `object-position`) to hold the sign in frame at both. Two
entries use it today, both of the Benque frames.

`build/branch-webp.py` is the script that produced the 3 Nov batch,
including the two crops noted below. It takes the folder of supplied
files and the folder to write into:

    python3 build/branch-webp.py <supplied> assets/img/branches

## Still to supply: branch photography

All 22 locations have a tile and every tile carries a photograph (23
tiles in all, because the Corporate Office has two). No designed plates
are left in the grid.

**One to swap: San Estevan.** The frame there is the village welcome
sign rather than the agency office, so the tile is captioned "San
Estevan Village" instead of taking "San Estevan Agency" from the branch
record. See below. When ICB send a photograph of the office, replace
the file and delete that entry's `caption` in `js/data/gallery.js`;
nothing else changes.

Staff, event and community photography is also welcome; it goes in a
second row of the same grid with no layout change.

## The 3 November batch, and the two frames that were cropped

Five photographs supplied by ICB through the client: Bella Vista,
Belmopan City, Benque Viejo Border, Benque Town Board and Caye Caulker.
Each arrived as a 1600x1200 desktop crop and a 1080x1350 portrait crop;
only the landscape crop is used, because the tiles are landscape at
every screen size and the lightbox shows whatever it is given.

Two were cropped further:

- **Caye Caulker.** The frame as supplied carried a third-party spa
  advertising board above ICB's own sign. The top 24% is cropped off, so
  the tile and the lightbox show ICB's sign and nothing else.
- **Belmopan City.** The bottom 15% is trimmed to take some of the
  foreground lawn out, so the building fills more of the tile. Nothing
  of the branch is cut.

Both full frames are in the client's folder if either is ever wanted
back.

**Benque Town Board** is the only interior frame in the set: a signboard
on a green wall rather than a street view of the office. It reads
differently from the other eight. Worth asking ICB for an exterior.

## The second 3 November batch

Five more, supplied numbered rather than named, as `ICB_Branch_01`
through `ICB_Branch_05`. Three were identified from their own
signboards and are wired up:

| Supplied as | Branch | What the sign says |
| --- | --- | --- |
| `ICB_Branch_02` | Dangriga | "DANGRIGA BRANCH  PHONE: 522-0706" |
| `ICB_Branch_04` | Ladyville | "AIRPORT PLAZA, LADYVILLE  TEL: 670-6970" |
| `ICB_Branch_05` | Orange Walk | "Tel: 322-3509 / 613-0817", "38 Belize Corozal Road.", `icb_ow@icbinsurance.com` |

Every number on all three matches the branch record. The one thing that
does not is the Orange Walk street number: the sign says 38, the
directory says #48. Recorded in OPEN-QUESTIONS.md.

Orange Walk is trimmed at the bottom to take the empty concrete
forecourt out. Ladyville carries a `pos` because its signboard sits
across the top of the frame and a phone crop would cut it in half.

`ICB_Branch_01` and `ICB_Branch_03` carry no sign that names the
office. 01 is a two-storey white building with a small "INSURANCE /
SEGUROS" plaque; 03 is single storey with a long red fascia sign and a
pole sign at the roadside, and its door decals are legible but carry no
branch name. The client identified both on 3 Nov from the raw frames
ICB sent: **01 is Corozal Town** and **03 is Independence**. Both are
wired up.

The door decals on `ICB_Branch_03` also post opening hours that differ
from the ones ICB gave us. Recorded in OPEN-QUESTIONS.md.

## The third 3 November batch

Eight more, named this time, at 1448x1086. Seven map straight onto a
location and are wired up: Moro, Punta Gorda, San Ignacio, San Juan,
San Pedro, Santa Elena and Velasquez.

The eighth was supplied as `ICB_Yellow_Village_Branch`, and there is no
Yellow Village in the directory of 22 that ICB sent. Its sign reads
INSURANCE CORPORATION OF BELIZE LTD and nothing else legible, so the
photograph could not name itself either. The client identified it on
3 Nov from the raw frame as **Seine Bight**, so the file name was
descriptive rather than a location, and there is no 23rd branch.

Its ICB signboard stands at the right-hand edge of the frame, so the
entry carries `pos: "right center"` to keep that edge in the tile
rather than the middle of the picture.

Every number on every sign in this batch matches the branch record
except on three frames, all recorded in OPEN-QUESTIONS.md: Moro
(four differences), San Juan (the email) and Punta Gorda (the email).

Cropped: Moro loses the shopfront next door off the left and a little
grass off the bottom, San Ignacio loses the road in the foreground,
Velasquez loses the grass and the step. San Pedro carries a `pos`
because its signboard sits across the top of the frame.

Moro and Seine Bight are the heaviest files in the set, at 219 KB and
280 KB against an average nearer 120. Both frames are dense with
foliage, which is expensive to compress, and dropping the quality
barely helps: Seine Bight at quality 60 is still 243 KB, which is a
visible loss for a 13 percent saving. Both are left at quality 74.
They are two photographs out of twenty-two and they load lazily.

The frames for San Juan, Velasquez and Moro carry Digi, BEL and
Infinite agent signage. Unlike the spa board cropped out of the Caye
Caulker frame, those are services the agency itself provides, so they
stay.

## San Estevan, and why its tile is captioned as a village

The frame supplied for San Estevan on 6 Nov 2026 is the pink and yellow
"WELCOME TO SAN ESTEVAN" monument at the entrance to the village, with
a Lions International crest on top and an old clapboard house behind
it. There is no ICB building and no ICB sign anywhere in it.

Every other tile in the grid takes its caption from the branch record,
so this one would have read "San Estevan Agency" over a picture of a
house that, as far as anything in the frame shows, is not ICB's office.
That is an assertion the photograph does not support, so the entry
carries a `caption` of its own and the tile reads **"San Estevan
Village"**. The district subtitle is unchanged, and the location is
still San Estevan Agency everywhere else on the site: the branch
finder, the map, the call directory and the structured data.

This is the rule the head of `js/data/gallery.js` already sets out, that
a photograph is captioned as a place rather than as a branch.

Trimmed at the bottom to take the foreground lawn out, which also keeps
the whole monument inside the phone crop. At 212 KB it is one of the
heavier files, for the same reason Moro and Seine Bight are: grass and
foliage across most of the frame.

To finish it: drop ICB's photograph of the office in, delete the
`caption`, and the tile reads like every other one.

## What's New hero images

`assets/img/news/` holds two files per article, because ICB composes
the wide frame and the tall one separately and they are different
pictures, not two sizes of one. The article serves them through a
single `<picture>` with a `media` query, so a phone is given the frame
made for a phone rather than a crop of the desktop one. Neither is
cropped by the page: both carry their width and height, the box takes
whatever shape the picture is, and the space is reserved before the
bytes arrive.

`build/news-webp.py` is the pipeline. It re-encodes the supplied files
at 1600 wide and 900 wide, which is as much as the article column ever
shows, and writes a lighter rendition of each to
`build/preview/news` for the one-file preview, the same arrangement
the branch photographs and the two campaign films use.

**The preview is getting full.** The one-file build is at 15.16 MB
against a hard 16 MB ceiling, and it stops itself at 15.5. Each new
What's New entry costs it roughly 90 KB, so there is room for about
three more before something has to give. When it does, the lever is the
two campaign films: they are 6.2 MB of the bundle once base64 is
counted, and a lighter preview encode of them would free more than
every photograph on the site put together. The deployed site is not
affected by any of this.

## The bee on the signage

Several ICB signboards carry a cartoon bee in a suit alongside the ICB
mark, Orange Walk's among them. It is ICB's own character on ICB's own
signage. The site does not use it: the assistant is called Bee and uses
the ICB mark rather than the character, and nothing has been lifted out
of a photograph. Raised with the client on 3 Nov 2026 and closed on
4 Nov; it is not a question for ICB. Recorded only so nobody spots the
bee in a photograph later and wonders whether it was missed.

## Why the preview carries lighter photographs

`build/build-single.js` inlines every asset as base64, which adds a
third again to each byte, against a hard 16MB cap on a single
document. With nineteen branch photographs in the grid that became the
binding constraint, so `build/branch-webp.py` now writes a second,
lighter rendition of each photograph to `build/preview/branches`
(900px, quality 68) and the single-file build substitutes it, exactly
as it already does for the two campaign films.

The deployed folder and the ZIP always carry the full-quality file.
The only place the lighter rendition is ever seen is the one-file
preview, and only in the lightbox, where it is about a quarter softer
than the real thing.

## The Gallery page hero

Its slot in `js/data/images.js` carries `shots` and `rotate: 5000`
instead of a single `src`, and `rotateSlot` in `js/art.js` cycles them.
There are no controls: it is a backdrop behind a heading, not something
to operate. It never starts under reduced motion, holds while the tab
is hidden, and ends itself once the page is navigated away from.

**It carries every branch photograph, all 22.** Two are written out in
the slot and stay at the front, because they are the only two with a
16:9 crop cut for the banner and the opening frame is worth getting
exactly right. The rest are appended at the foot of `images.js`
straight from `ICB.DATA.gallery.branches`, which is also what the grid
further down the page is built from, so the two cannot fall out of step
and a photograph that arrives tomorrow joins the rotation without
anyone editing the slot.

Three things follow from that:

- The banner is `object-fit: cover`, not `contain`. The two opening
  frames are already 16:9 so cover does nothing to them; the branch
  photographs are four by three, and `contain` would letterbox every
  one of them. Each carries the same focal point its gallery tile uses,
  so the crop holds the signage rather than the middle of the picture.
- `rotateSlot` asks for each photograph only as its turn approaches:
  the first two up front, then one more each time the banner changes.
  Creating all 22 at once would pull about two and a half megabytes
  before the visitor has finished reading the heading. Someone who
  stays half a minute fetches six.
- They are the same files the grid uses, so by the time a visitor
  scrolls down the browser already has them.

Two of the three files are the ones already used by the Insurance hero
and the Southside gallery tile. The single-file build keys its asset map
by path, so reusing a path adds nothing to the preview's size.

Any slot can be made to rotate the same way. If you do, check the copy
over it: the scrim in `.page-hero-art::after` sits above the photographs
but below the copy, and bright daylight photographs need it. There is a
measured contrast check in the verification suite rather than a
by-eye one, because an earlier attempt at this looked correct in the
markup and unreadable on screen.

## How to swap in an image

1. Place the file under `assets/img/branches/` (or `assets/img/` for
   section slots).
2. **Branch gallery:** set `src` on the matching entry in
   `js/data/gallery.js`. The caption, district and type come from
   `js/data/locations.js`, so they always match the branch record.
3. **Product and section slots:** point the matching slot's `src` in
   `js/data/images.js` at the file. Optional `pos` sets the crop focal
   point (CSS `object-position`).
The gallery carries branch photography only. Campaign stills were
removed from it: the films themselves live in ICB in Motion, and film
frames still serve the product cards and page heroes through
`js/data/images.js`.

## Hero lineup

The order is fixed and lives in one place, the `SLIDES` array at the top
of `js/views/home.js`:

1. ICB headquarters photograph
2. "By land, sea or air, ICB is there" campaign artwork
3. Nationwide Cash Express brand lockup
4. The ICB film

`initSlider` always opens on index 0 and nothing persists a position, so
a fresh load always presents that sequence.

### Nationwide Cash Express

Two supplied compositions, chosen by a `<picture>` element:

| Viewport | File | Source |
| --- | --- | --- |
| 561px and up | `assets/img/brands/nce-wide.webp` | 1672x941 banner, resized to 1600x900 |
| below 561px | `assets/img/brands/nce-tall.webp` | 941x1672 poster, trimmed of 113px of empty ground at the top and 56px at the foot, resized to 900x1438 |

The breakpoint is about proportion, not device: from 561px the hero box
is wide enough to carry a landscape lockup. The vertical poster is
trimmed because the supplied file carries empty ground above the mascot
and below the sweep; removing most of it takes the aspect from 0.563 to
0.626 and lets a phone show the lockup meaningfully larger. Measured
share of viewport width: 55% at 1440px, 92% at 834px, 97% at 768px, 84%
on a short phone, 100% on a tall one.

Both are `object-fit: contain`, so neither is cropped or stretched at any
size, and the bottom inset keeps the slider chrome clear of the artwork.
The slide carries no overlaid headline or button: the lockup already
states the brand name and its line, and anything laid over it would
either cover the mascot or collide with the controls. The eyebrow and
title stay in the document for screen readers and the slide label.

## Video

`ICB.DATA.gallery.video.films` drives the ICB in Motion area. Both ICB
campaign films are in place, each with its own poster, language badge and
player:

| Film | File | Length |
| --- | --- | --- |
| Life Happens Fast (English) | `assets/video/icb-life-happens-fast.mp4` | 52.8s |
| La Vida Pasa Rapido (Spanish) | `assets/video/icb-life-happens-fast-es.mp4` | 55.7s |

Both titles are ICB's own, read from each film's closing card. Encoding:
H.264 High at 1280x720, two-pass ~800 kb/s, AAC stereo 128 kb/s, full
length, `+faststart` so the moov atom sits ahead of the media and
playback can begin before the file finishes downloading. Films are
`preload="none"`, so nothing downloads until a visitor presses play, and
only one plays at a time.

`build/preview/` holds a lighter 720x404 encode of each film with the
same duration and stereo sound. Base64 inflates every byte by a third and
the single-file preview is capped at 16MB, so `build/build-single.js`
substitutes those automatically. The deployed folder and the ZIP always
ship the full-quality files. The build fails loudly if the single file
would exceed the cap.

To add a third film, drop the mp4 in `assets/video/`, a poster in
`assets/img/video/`, and append an entry to `films`. The grid takes it
with no layout change.

The hero's third slide plays the English film muted and looped as ambient
motion only; the films with sound live in ICB in Motion.

Guidelines: landscape at least 1000px wide for gallery tiles, 1400px for
feature placements; never stretch small images; never caption an image
with a branch or event identity unless it is verified.

## YouTube thumbnails

`assets/img/video/youtube/<video-id>.jpg`, five frames at 480x270.

These are ICB's own thumbnails from their YouTube channel, so the videos
look the same on the site as they do there. They are shipped as site
assets rather than loaded from YouTube, because an embed or a remote
thumbnail would reach a third party on every visit whether or not
anyone ever pressed play, and the video section is built not to.

They were cut out of the screenshot of the channel the client supplied,
at native size: nothing here can reach youtube.com. The rows sit on a
318px pitch starting at y=5, each frame 480x270 at x=48, which is how
the crop is derived rather than eyeballed.

Twelve pixels come off the top and bottom of each before it is resized
back to 480x270. YouTube draws a progress bar along the bottom of a
thumbnail the viewer has already watched, in two forms, solid red and
red-plus-grey, and that bar belongs to whoever took the screenshot
rather than to ICB. A fixed trim clears both and costs under five
percent of the frame. The duration badge stays, because matching the
channel is the point, which is also why the card does not print the
running time underneath as well.

If ICB can supply the original thumbnail files, drop them in at the same
paths and the trim and the screenshot provenance stop mattering.
