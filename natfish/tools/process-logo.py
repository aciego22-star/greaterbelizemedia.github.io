#!/usr/bin/env python3
"""Derive the NATFISH logo assets from the supplied transparent PNG.

Three lockups come out of one piece of artwork, with no recolouring and no
filters. The alpha channel is preserved exactly as supplied.

  natfish-logo.png        full horizontal logo, mark + wordmark + legal name
  natfish-logo-mark.png   compact lockup, mark + NATFISH wordmark only
  natfish-icon.png        square crop of the circular mark, for the favicon

Why the compact lockup exists: the two legal-name lines occupy 6.1% of the
artwork's height, so in a sticky header they render under 5px tall and cannot be
read. The full logo is used where it is large enough to be legible (footer panel,
About page) and the compact lockup carries the header.

Run from the natfish/ folder:
    python3 tools/process-logo.py path/to/logo.png
"""
import pathlib
import sys
from PIL import Image

OUT = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img"

# Measured against the trimmed 1708x861 artwork, as fractions so the geometry
# survives a different export size.
#
# The compact lockup is made by ERASING the legal-name lines, not by cropping a
# horizontal strip. Cropping cut through the wave ring, the hand and the sleeve
# and left the emblem looking unfinished. Column profiling of every band below
# the wordmark shows emblem ink stops by x=671 while the red rule and both text
# lines start at x>=712, so clearing everything right of x=700 and below y=570
# removes the text and leaves the emblem completely intact.
LEGAL_LEFT = 700 / 1708   # left edge of the clear region
LEGAL_TOP = 570 / 861     # top edge, just under the NATFISH wordmark
MARK_RIGHT = 0.395        # right edge of the circular lobster mark


def trim(im):
    """Drop the transparent margin so layout boxes match the visible art."""
    box = im.getbbox()
    return im.crop(box) if box else im


def save(im, name, widths):
    for w in widths:
        h = round(im.height * w / im.width)
        out = im.resize((w, h), Image.LANCZOS) if im.width != w else im
        suffix = "" if w == widths[0] else f"@{round(w / widths[0])}x"
        path = OUT / f"{name}{suffix}.png"
        out.save(path, "PNG", optimize=True)
        print(f"  {path.name:28} {out.width}x{out.height}  {path.stat().st_size/1024:6.1f} KB")


def main():
    src = pathlib.Path(sys.argv[1])
    full = trim(Image.open(src).convert("RGBA"))
    print(f"source {src.name} -> trimmed {full.width}x{full.height}")

    OUT.mkdir(parents=True, exist_ok=True)

    print("full logo (footer panel, About page):")
    save(full, "natfish-logo", [520, 1040])

    # Compact lockup: the complete emblem plus the NATFISH wordmark, with only
    # the legal-name lines and their rule erased. Nothing is cropped away.
    print("compact lockup (header):")
    compact = full.copy()
    clear = Image.new("RGBA", (
        compact.width - round(compact.width * LEGAL_LEFT),
        compact.height - round(compact.height * LEGAL_TOP),
    ), (0, 0, 0, 0))
    compact.paste(clear, (round(compact.width * LEGAL_LEFT),
                          round(compact.height * LEGAL_TOP)))
    compact = trim(compact)
    save(compact, "natfish-logo-mark", [360, 720])

    # Square icon from the circular mark alone. The brief rules out using the
    # complete horizontal logo as a favicon.
    print("icon (favicon):")
    mark = trim(full.crop((0, 0, round(full.width * MARK_RIGHT), full.height)))
    side = max(mark.width, mark.height)
    canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    canvas.paste(mark, ((side - mark.width) // 2, (side - mark.height) // 2), mark)
    save(canvas, "natfish-icon", [180])
    canvas.resize((32, 32), Image.LANCZOS).save(OUT / "favicon.png", "PNG", optimize=True)
    print(f"  {'favicon.png':28} 32x32")


if __name__ == "__main__":
    main()
