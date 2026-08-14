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
| Mexican Insurance card + page | Film frame: aerial Belize City coastal road |
| Business feature | Film frame: ICB team member in branded uniform |
| About page hero | HQ photograph |
| ICB Across Belize gallery (8 items) | HQ photograph + seven film scenes |
| Video poster | Frame from the film |

## Still using replaceable concept artwork

| Slot | What to supply |
| --- | --- |
| `product-cargo` | Cargo/freight imagery (icbinsurance.com/products has one) |
| `product-travel` | ICB travel campaign creative (official social media) |
| Gallery | Branch photographs from icbinsurance.com/contact (Southside, Santa Elena, San Pedro, San Ignacio, Corozal Border, Independence, Ladyville and others) |

## How to swap in an image

1. Place the file under `assets/img/`.
2. Point the matching slot's `src` in `js/data/images.js` at it (product
   and section slots), or add it to the `GALLERY` list in
   `js/views/home.js` with a short verified caption.
3. Optional `pos` sets the crop focal point (CSS object-position).

Guidelines: landscape at least 1000px wide for cards, 1400px for
feature placements; never stretch small images; do not caption an image
with a branch or event identity unless it is verified.
