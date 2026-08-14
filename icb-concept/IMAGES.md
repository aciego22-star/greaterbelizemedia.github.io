# Imagery status and plan

The concept now uses REAL ICB imagery wherever an official asset is
available: the supplied headquarters photograph, frames extracted from
ICB's own "Life Happens Fast" campaign film, and photography cropped
from the "Protect Your Investment" campaign artwork. Generated concept
artwork remains only where no official ICB visual has been supplied yet.

## Currently real (official ICB material)

| Placement | Source |
| --- | --- |
| Hero slides 1-3 | HQ photograph, Protect Your Investment artwork, the film |
| Property card + page | Film frame: couple at their Belizean home |
| Motor card + page | Film frame: couple with their vehicle |
| Marine Hull card + page | Boat photography from the campaign artwork |
| Claims page hero | Film frame: customer completing paperwork with ICB |
| Property / Motor / Liability page insets | Native-scale crops of the campaign artwork panels (home, vehicle, family) |
| Liability card + page | Film frame: handshake with an ICB representative |
| Travel card + page | Film frame: aerial Belize City coast |
| Cargo card + page | Film frame: Belize City waterfront road (goods by road and sea) |
| Insurance / Resources / Contact / Locations page heroes | Film frames and the HQ building |
| Business feature | Film frame: ICB team member in branded uniform |
| About page hero | HQ photograph |
| ICB Across Belize gallery (8 items) | HQ photograph + seven film scenes |
| Video poster | Frame from the film |

## Interim imagery to replace when official files arrive

| Slot | What to supply |
| --- | --- |
| `product-mexican` | A photograph of the Belize and Mexico border crossing. Currently shows a driving scene from the film as an interim. |
| `product-cargo` | Official cargo/freight imagery from icbinsurance.com/products |
| `product-travel` | ICB travel campaign creative from the official social channels |
| Gallery and location cards | Branch photographs from icbinsurance.com/contact (Southside, Santa Elena, San Pedro, San Ignacio, Corozal Border, Independence, Ladyville and others), plus staff, event and community photography |

Gallery images live in one list, `ICB.GALLERY_ITEMS` at the top of
`js/views/home.js`, shared by the homepage section (first six) and the
Gallery page (all). Add `{ src, caption, alt }` entries and both
surfaces pick them up with no layout change.

## How to swap in an image

1. Place the file under `assets/img/`.
2. Point the matching slot's `src` in `js/data/images.js` at it (product
   and section slots), or add it to the `GALLERY` list in
   `js/views/home.js` with a short verified caption.
3. Optional `pos` sets the crop focal point (CSS object-position).

Guidelines: landscape at least 1000px wide for cards, 1400px for
feature placements; never stretch small images; do not caption an image
with a branch or event identity unless it is verified.
