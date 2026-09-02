#!/usr/bin/env python3
"""Build the 1200x630 social-sharing card for the spiny lobster article.

Composed from artwork already approved and already in the project: the client's
own Belizean Pride product collage, which carries the NATFISH lockup within it.
Nothing is redrawn, relabelled or stretched.

The collage is 16:9 and the card is 1.905:1, so the collage is scaled to fit by
HEIGHT and centred, and the two narrow side bands are filled with the collage's
own background tone sampled from its corner. Cropping to 1.905 instead would
shave the top, and the lockup lives there.

Usage:
    python3 tools/make-social-card.py
"""
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "img" / "official" / "hero-belizean-pride-range-desktop-1920.jpg"
OUT = ROOT / "assets" / "img" / "official" / "og-article-spiny-lobster.jpg"
W, H = 1200, 630


def main():
    art = Image.open(SRC).convert("RGB")
    scale = H / art.height
    art = art.resize((round(art.width * scale), H), Image.LANCZOS)
    ground = art.getpixel((6, 6))
    card = Image.new("RGB", (W, H), ground)
    if art.width >= W:
        # Wider than the card once fitted by height: centre it and let the
        # narrow edges fall outside rather than squeeze the picture.
        card.paste(art, ((W - art.width) // 2, 0))
    else:
        card.paste(art, ((W - art.width) // 2, 0))
    card.save(OUT, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  {OUT.relative_to(ROOT)}  {W}x{H}  ground {ground}")


if __name__ == "__main__":
    main()
