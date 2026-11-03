"""Compress the supplied branch photographs for the site.

One WebP per branch. No JPEG twin: every browser the site supports reads
WebP, and the single-file preview inlines every file under assets/img as
base64, so a second copy of each photograph costs the preview a third
again of its own weight for nothing.

Target: 1200px wide, which covers the lightbox (it caps at 1100 CSS px)
with a little to spare, at quality 74, which holds up on the sky and
foliage in these frames without banding.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = 74

# name -> (output stem, crop box as fractions of the source, or None)
JOBS = [
    ("ICB_Bella_Vista_Agency_Desktop_1600x1200.jpg", "bella-vista", None),
    # Trims some of the foreground lawn so the building fills more of the
    # tile. Nothing of the branch itself is cut.
    ("ICB_Belmopan_City_Branch_Desktop_1600x1200.jpg", "belmopan", (0.0, 0.0, 1.0, 0.85)),
    ("ICB_Benque_Viejo_Border_Desktop_1600x1200.jpg", "benque-viejo-border", None),
    ("ICB_Benque_Viejo_Branch_Desktop_1600x1200.jpg", "benque-town-board", None),
    # Crops off the third-party spa advertising board above ICB's own sign.
    ("ICB_Caye_Caulker_Agency_Desktop_1600x1200.jpg", "caye-caulker", (0.0, 0.242, 1.0, 0.992)),
]

os.makedirs(OUT, exist_ok=True)
for src, stem, box in JOBS:
    im = Image.open(os.path.join(SRC, src)).convert("RGB")
    if box:
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    if im.width > 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, stem + ".webp")
    im.save(path, "WEBP", quality=QUALITY, method=6)
    print("%-22s %4dx%-4d q=%-3d %6.1f KB" % (stem, im.width, im.height, QUALITY, os.path.getsize(path) / 1024))
