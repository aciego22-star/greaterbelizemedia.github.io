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
| Insurance / Resources / Contact / Locations page heroes | Film frames and the HQ building |
| Business feature | Film frame: ICB team member in branded uniform |
| About page hero | HQ photograph |
| ICB in Motion featured video | The compressed campaign film + poster frame |
| Branch gallery (2 of 10 tiles) | HQ photograph and the Daly Street Corporate Office |
| Campaign gallery (6 tiles) | Scenes from the film and the campaign title card |

## Still to supply: branch photography

The branch gallery is the priority. Eight tiles currently render a
designed location plate built from the verified branch record, and each
upgrades to a photograph the moment a file is dropped in:

| Tile | File to supply |
| --- | --- |
| Belize City Southside Branch | `assets/img/branches/southside.jpg` |
| Ladyville Branch | `assets/img/branches/ladyville.jpg` |
| San Pedro Branch | `assets/img/branches/san-pedro.jpg` |
| Corozal Border Branch | `assets/img/branches/corozal-border.jpg` |
| San Narciso Branch | `assets/img/branches/san-narciso.jpg` |
| Santa Elena Branch | `assets/img/branches/santa-elena.jpg` |
| San Ignacio Branch | `assets/img/branches/san-ignacio.jpg` |
| Independence Branch | `assets/img/branches/independence.jpg` |

These are the branch photographs published in ICB's own contact gallery.
They could not be fetched from this environment (outbound requests to
icbinsurance.com are blocked here), so they need to be supplied directly.

Staff, event and community photography is also welcome; it goes in a
second row of the same grid with no layout change.

## How to swap in an image

1. Place the file under `assets/img/branches/` (or `assets/img/` for
   section slots).
2. **Branch gallery:** set `src` on the matching entry in
   `js/data/gallery.js`. The caption, district and type come from
   `js/data/locations.js`, so they always match the branch record.
3. **Product and section slots:** point the matching slot's `src` in
   `js/data/images.js` at the file. Optional `pos` sets the crop focal
   point (CSS `object-position`).
4. **Campaign stills:** add `{ src, caption, alt }` to
   `ICB.DATA.gallery.campaign`.

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
