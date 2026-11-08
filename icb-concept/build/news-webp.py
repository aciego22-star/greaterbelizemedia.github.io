"""Compress the What's New hero images for the site.

    python3 build/news-webp.py <folder of supplied files> assets/img/news

Two files per entry, because the two crops are composed separately and
are different shapes: a wide one for the desktop banner and a tall or
short one for a phone. The article serves them through one <picture>
with a media query, so each screen gets the frame that was made for it
rather than a crop of the other one.

The supplied files are already WebP at 1920 wide. They are re-encoded
here at 1600 and 900, which is as much as the article column ever shows,
and a smaller rendition of each is written to build/preview/news for the
single-file preview, the same arrangement the branch photographs and the
two campaign films already use. The deployed folder and the ZIP always
carry the full-size file.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = 74

PREVIEW_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview", "news")
PREVIEW_QUALITY = 62

# supplied filename -> (output stem, width to publish, width for the preview)
JOBS = [
    ("01_AML_CFT_Conference/ICB_AML_CFT_2026_Desktop_1920x1080.webp", "aml-cft-conference-wide", 1600, 820),
    ("01_AML_CFT_Conference/ICB_AML_CFT_2026_Mobile_1080x1350.webp", "aml-cft-conference-tall", 900, 560),
    ("02_ClaimsVAULT_Belize/ICB_ClaimsVAULT_Belize_Desktop_1920x960.webp", "claimsvault-wide", 1600, 820),
    ("02_ClaimsVAULT_Belize/ICB_ClaimsVAULT_Belize_Mobile_1080x540.webp", "claimsvault-tall", 900, 560),
    ("03_Benque_Viejo_Border_Kiosk_DRAFT/ICB_Benque_Viejo_Border_Kiosk_Desktop_1920x1080.webp", "benque-kiosk-wide", 1600, 820),
    ("03_Benque_Viejo_Border_Kiosk_DRAFT/ICB_Benque_Viejo_Border_Kiosk_Mobile_1080x1350.webp", "benque-kiosk-tall", 900, 560),
    ("ICB_New_Website_Launch_Desktop_1920x1080.webp", "website-launch-wide", 1600, 820),
    ("ICB_New_Website_Launch_Mobile_1080x1350.webp", "website-launch-tall", 900, 560),
]

os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
for src, stem, width, prev_width in JOBS:
    path_in = os.path.join(SRC, src)
    if not os.path.exists(path_in):
        print("%-26s skipped, %s is not in this folder" % (stem, src))
        continue
    im = Image.open(path_in).convert("RGB")
    full = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS) if im.width > width else im
    path = os.path.join(OUT, stem + ".webp")
    full.save(path, "WEBP", quality=QUALITY, method=6)

    small = full.resize((prev_width, round(full.height * prev_width / full.width)), Image.LANCZOS)
    prev = os.path.join(PREVIEW_DIR, stem + ".webp")
    small.save(prev, "WEBP", quality=PREVIEW_QUALITY, method=6)

    print("%-26s %4dx%-4d %6.1f KB   preview %4dx%-4d %5.1f KB"
          % (stem, full.width, full.height, os.path.getsize(path) / 1024,
             small.width, small.height, os.path.getsize(prev) / 1024))
