#!/usr/bin/env python3
"""Build the favicon package from the official NATFISH artwork.

The complete horizontal logo is illegible below about 100px, so the icon uses
the emblem alone: the hand holding a spiny lobster inside the wave ring. The
emblem is CROPPED from the approved file, never redrawn, recoloured or
restretched - the only operations here are crop, pad to a square and downscale.

The emblem is taller than it is wide, because the lobster's antennae reach
above the ring, so it is centred in a square canvas rather than stretched to
fill one. The ground is white: the artwork is navy and teal line work, and on a
transparent ground the ring disappears against a dark browser tab.

Usage:
    python3 tools/make-favicons.py
"""
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "img" / "natfish-logo-approved-final.png"

# Two crops of the same artwork, both measured from it rather than guessed.
#
# FULL is the whole emblem: ink from x 51-689, y 7-814, with the lobster's
# antennae reaching well above the ring. It is 638 wide by 807 tall, so in a
# square canvas it only fills about four fifths of the width.
#
# RING is the circular device alone - the navy ring and teal waves run
# x 53-690, y 177-814, which is very nearly a perfect square. Cropping to it
# lets the mark fill the frame instead of being letterboxed by its own
# antennae.
#
# The larger icons use FULL, because at 180px and up the antennae read as part
# of the lobster and slicing them would look like a mistake. The 16 and 32px
# icons use RING, because at that size the antennae are a single grey pixel of
# noise and the padding they force costs the ring the resolution it needs to be
# recognizable at all. Shipping a different crop per size is what a favicon set
# is for.
FULL = (51, 7, 690, 815)
RING = (53, 177, 691, 815)

# Breathing room, as a fraction of the square canvas. The tiny icons take less:
# every pixel spent on margin at 16px is a pixel the ring does not get.
PAD_LARGE = 0.08
PAD_SMALL = 0.02

LARGE = {
    "apple-touch-icon.png": 180,
    "android-chrome-192x192.png": 192,
    "android-chrome-512x512.png": 512,
}
SMALL = {
    "favicon-16x16.png": 16,
    "favicon-32x32.png": 32,
}
ICO_SIZES = [16, 32, 48]


def square(box, pad, master=1024):
    """One crop of the emblem, centred on a white square with padding."""
    art = Image.open(SRC).convert("RGB").crop(box)
    inner = round(master * (1 - 2 * pad))
    scale = min(inner / art.width, inner / art.height)
    art = art.resize((round(art.width * scale), round(art.height * scale)),
                     Image.LANCZOS)
    canvas = Image.new("RGB", (master, master), "#ffffff")
    canvas.paste(art, ((master - art.width) // 2, (master - art.height) // 2))
    return canvas


def main():
    big = square(FULL, PAD_LARGE)
    small = square(RING, PAD_SMALL)
    # Apple's icon is composited on white by iOS anyway and must not carry
    # alpha; the rest are opaque for the same reason the ground is white at all.
    for name, size in LARGE.items():
        big.resize((size, size), Image.LANCZOS).save(ROOT / name, "PNG",
                                                     optimize=True)
        print(f"  {name:32s} {size}x{size}  full emblem")
    for name, size in SMALL.items():
        small.resize((size, size), Image.LANCZOS).save(ROOT / name, "PNG",
                                                       optimize=True)
        print(f"  {name:32s} {size}x{size}  ring crop")
    # Each .ico frame is resampled from the crop that suits its size, rather
    # than letting the encoder downscale one master badly.
    frames = [small.resize((s, s), Image.LANCZOS) for s in ICO_SIZES]
    frames[0].save(ROOT / "favicon.ico", format="ICO",
                   sizes=[(s, s) for s in ICO_SIZES],
                   append_images=frames[1:])
    print(f"  {'favicon.ico':32s} {', '.join(f'{s}x{s}' for s in ICO_SIZES)}  ring crop")


if __name__ == "__main__":
    main()
