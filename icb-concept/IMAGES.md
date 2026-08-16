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
| Marine Hull card + page | Boat photography from the campaign artwork |
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
| Branch gallery (3 of 12 tiles) | HQ photograph, the Daly Street Corporate Office, the Southside branch |
| Insurance page hero | Supplied photograph of an ICB office building |
| Resources page hero | Supplied photograph: the curved red facade against the sky |
| Gallery page hero | Three supplied ICB buildings, cycling on a five second timer |

## Still to supply: branch photography

The branch gallery is the priority. Nine tiles currently render a
designed location plate built from the verified branch record, and each
upgrades to a photograph the moment a file is dropped in:

| Tile | File to supply |
| --- | --- |
| Ladyville Branch | `assets/img/branches/ladyville.jpg` |
| San Pedro Branch | `assets/img/branches/san-pedro.jpg` |
| Corozal Border Branch | `assets/img/branches/corozal-border.jpg` |
| Santa Elena Branch | `assets/img/branches/santa-elena.jpg` |
| San Ignacio Branch | `assets/img/branches/san-ignacio.jpg` |
| Independence Branch | `assets/img/branches/independence.jpg` |
| Belmopan City Branch | `assets/img/branches/belmopan.jpg` |
| Dangriga Branch | `assets/img/branches/dangriga.jpg` |

Most of these are the branch photographs published in ICB's own contact
gallery. They could not be fetched from this environment (outbound
requests to icbinsurance.com are blocked here), so they need to be
supplied directly.

**San Narciso** is a special case. Its record is held at `active: false`
in `js/data/locations.js` because ICB's current operating status for it
is not verified, so it does not appear in the branch finder, the map, the
call directory or the WhatsApp directory. A supplied photograph will
render in the gallery, captioned "San Narciso, Corozal District" rather
than as a branch. Set `active: true` once ICB confirms it and every
surface picks it up at once.

Staff, event and community photography is also welcome; it goes in a
second row of the same grid with no layout change.

## The Gallery page hero

Its slot in `js/data/images.js` carries `srcs` (three files) and
`rotate: 5000` instead of a single `src`, and `rotateSlot` in `js/art.js`
cycles them. There are no controls: it is a backdrop behind a heading,
not something to operate. It never starts under reduced motion, holds
while the tab is hidden, and ends itself once the page is navigated away
from.

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
