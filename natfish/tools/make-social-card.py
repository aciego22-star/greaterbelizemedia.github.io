#!/usr/bin/env python3
"""Build the 1200x630 social-sharing cards for the Insights articles.

Composed from artwork already approved and already in the project: the
client's own Belizean Pride product collage for the spiny lobster piece, and
their queen conch carton artwork for the conch piece. Nothing is redrawn,
relabelled or stretched.

Both sources are 16:9 and the card is 1.905:1, so each is scaled to fit by
HEIGHT and centred, and the two narrow side bands are filled with the
artwork's own background tone sampled from its corner. Cropping to 1.905
instead would shave the top and the bottom, which on the collage is where the
lockup sits and on the conch carton is the printed wording.

JPEG, not WebP, and that is deliberate: these are read by Facebook, LinkedIn,
WhatsApp and Slack scrapers rather than by browsers, and those are the one
audience that still cannot be relied on for WebP.

Usage:
    python3 tools/make-social-card.py
"""
import pathlib

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OFFICIAL = ROOT / "assets" / "img" / "official"
W, H = 1200, 630

# (source, output). Each source is the widest derivative already on disk.
CARDS = [
    ("hero-belizean-pride-range-desktop-1920.jpg", "og-article-spiny-lobster.jpg"),
    ("banner-whats-new-conch-desktop-1920.webp", "og-article-queen-conch.jpg"),
]


def card(src_name, out_name):
    art = Image.open(OFFICIAL / src_name).convert("RGB")
    scale = H / art.height
    art = art.resize((round(art.width * scale), H), Image.LANCZOS)
    ground = art.getpixel((6, 6))
    sheet = Image.new("RGB", (W, H), ground)
    # Fitted by height the artwork may be wider or narrower than the card.
    # Centre it either way: wider and the narrow edges fall outside, narrower
    # and the ground colour fills the gap. Neither squeezes the picture.
    sheet.paste(art, ((W - art.width) // 2, 0))
    out = OFFICIAL / out_name
    sheet.save(out, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  {out.relative_to(ROOT)}  {W}x{H}  from {src_name}  ground {ground}")


def main():
    for src_name, out_name in CARDS:
        card(src_name, out_name)


if __name__ == "__main__":
    main()
