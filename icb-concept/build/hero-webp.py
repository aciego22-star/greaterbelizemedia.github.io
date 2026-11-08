"""Compress a hero slide's two compositions for the site.

    python3 build/hero-webp.py <folder of supplied files> assets/img/heroes

A brand slide is a finished composition: the artwork already carries the
headline and the call to action, and the slider shows it whole rather
than cropping it, so the only job here is to get it to a sensible size.
Wide for 561px and up, tall below that, matching the two files the
designer supplies.

1600 wide and 900 wide match what the Nationwide Cash Express slide
already uses, so the two sit at the same weight in the page. A lighter
rendition of each goes to build/preview/heroes for the single-file
preview, as everything else does.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = 78

PREVIEW_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview", "heroes")
PREVIEW_QUALITY = 64

# supplied filename -> (output stem, width to publish, width for the preview)
JOBS = [
    # The What's New slide. Two finished compositions, each carrying the
    # heading and a painted button, so neither is cropped by the page.
    ("ICB_Whats_New_Hero_Wide.webp", "whats-new-wide", 1800, 980),
    ("ICB_Whats_New_Hero_Tall.jpg", "whats-new-tall", 900, 540),
]

os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
for src, stem, width, prev_width in JOBS:
    path_in = os.path.join(SRC, src)
    if not os.path.exists(path_in):
        print("%-20s skipped, %s is not in this folder" % (stem, src))
        continue
    im = Image.open(path_in).convert("RGB")
    full = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS) if im.width > width else im
    path = os.path.join(OUT, stem + ".webp")
    full.save(path, "WEBP", quality=QUALITY, method=6)

    small = full.resize((prev_width, round(full.height * prev_width / full.width)), Image.LANCZOS)
    prev = os.path.join(PREVIEW_DIR, stem + ".webp")
    small.save(prev, "WEBP", quality=PREVIEW_QUALITY, method=6)

    print("%-20s %4dx%-4d %6.1f KB   preview %4dx%-4d %5.1f KB"
          % (stem, full.width, full.height, os.path.getsize(path) / 1024,
             small.width, small.height, os.path.getsize(prev) / 1024))
