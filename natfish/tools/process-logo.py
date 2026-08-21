#!/usr/bin/env python3
"""Build the site's logo assets from the client-approved artwork.

Input: assets/img/natfish-logo-approved-final.png, the final approved logo
exactly as the client supplied it. Its wordmark reads

    NATFISH
    National Fishermen Producers
    Co-operative Society Ltd.

with no apostrophe after "Producers".

The artwork is never redrawn, recoloured, stretched or re-proportioned. Two
mechanical operations are applied, and only these:

1. De-matting. The supplied file is RGB on an opaque white background, but the
   About page sets its identity panel on sand, where an opaque white rectangle
   would show as a box around the logo. The white is therefore made
   transparent by flood-filling inward from the four corners, so only
   background that is actually connected to the edge is cleared. A global
   "white becomes transparent" would punch holes through the lobster's pale
   speckles and the highlights on the hand; this cannot, because those whites
   are enclosed by darker pixels. The check in verify() fails the build if the
   cleared area ever strays outside the expected range.

2. A square crop, for the favicon and touch icon only. A browser tab is square
   and the logo is 2:1, so the full lockup cannot be used there. The crop is
   the circular emblem with the whole lobster, hand and sleeve inside it,
   stopping 1px short of the wordmark. The logo itself is never cropped.

Run from the natfish/ folder:
    python3 tools/process-logo.py
"""
import pathlib

from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
MASTER = IMG / "natfish-logo-approved-final.png"

# Display widths for the full lockup. The header renders it around 126px wide
# and the footer and About panel up to 380px, so 400/800/1200 covers 1x and 2x
# for every placement without shipping the full 1789px master to a phone.
TIERS = (400, 800, 1200)

# Measured on the approved artwork: the wordmark's "N" begins at x=698, so the
# emblem crop stops at 697. Vertically it is centred on the navy ring, whose
# ink runs to y=814, with the lobster's antennae reaching above it.
EMBLEM = (30, 150, 697, 817)

ICON = 180      # apple-touch-icon
FAVICON = 48


def dematte(im):
    """Clear the background-connected white, leaving interior whites alone."""
    rgba = im.convert("RGBA")
    w, h = rgba.size
    # A generous tolerance takes the JPEG-ish halo around the artwork with it;
    # anything darker than the halo stops the fill.
    for corner in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)):
        ImageDraw.floodfill(rgba, corner, (255, 255, 255, 0), thresh=42)
    return rgba


def verify(rgba, label):
    """Fail loudly if the fill ate into the artwork or barely ran at all."""
    alpha = rgba.getchannel("A")
    clear = sum(1 for v in alpha.getdata() if v == 0)
    total = rgba.width * rgba.height
    pct = clear / total
    if not 0.25 < pct < 0.85:
        raise SystemExit(
            f"ERROR: {label}: {pct:.1%} of the image was cleared, which is "
            "outside the expected range. The flood fill has either leaked "
            "into the artwork or failed to run. Do not ship this."
        )
    print(f"  {label}: background cleared over {pct:.1%} of the frame")
    return pct


def main():
    if not MASTER.exists():
        raise SystemExit(f"ERROR: approved artwork not found at {MASTER}")

    src = Image.open(MASTER)
    print(f"approved master: {src.width}x{src.height} {src.mode}")

    logo = dematte(src)
    verify(logo, "full lockup")

    # Full lockup, alpha preserved, aspect ratio never touched.
    for tier in TIERS:
        if tier > logo.width:
            continue
        h = round(logo.height * tier / logo.width)
        logo.resize((tier, h), Image.LANCZOS).save(
            IMG / f"natfish-logo-{tier}.png", optimize=True)
        print(f"  natfish-logo-{tier}.png  {tier}x{h}")

    # Square emblem for the icons. Cropped from the de-matted master so the
    # ring sits on transparency rather than a white tile.
    emblem = logo.crop(EMBLEM)
    side = max(emblem.size)
    square = Image.new("RGBA", (side, side), (255, 255, 255, 0))
    square.paste(emblem, ((side - emblem.width) // 2, (side - emblem.height) // 2))

    square.resize((ICON, ICON), Image.LANCZOS).save(
        IMG / "natfish-icon.png", optimize=True)
    square.resize((FAVICON, FAVICON), Image.LANCZOS).save(
        IMG / "favicon.png", optimize=True)
    print(f"  natfish-icon.png  {ICON}x{ICON}")
    print(f"  favicon.png       {FAVICON}x{FAVICON}")

    # The pages carry these as width/height so the header never reflows.
    print(f"\nintrinsic ratio {logo.width}/{logo.height} "
          f"= {logo.width / logo.height:.4f}")


if __name__ == "__main__":
    main()
