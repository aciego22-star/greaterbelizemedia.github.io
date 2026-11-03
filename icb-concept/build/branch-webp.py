"""Compress the supplied branch photographs for the site.

    python3 build/branch-webp.py <folder of supplied files> assets/img/branches

One WebP per branch. No JPEG twin: every browser the site supports reads
WebP, and the single-file preview inlines every file under assets/img as
base64, so a second copy of each photograph costs the preview a third
again of its own weight for nothing.

Target: 1200px wide, which covers the lightbox (it caps at 1100 CSS px)
with a little to spare, at quality 74, which holds up on the sky and
foliage in these frames without banding.

JOBS is cumulative, so it is also the record of which supplied file
became which branch and what was cropped off it. A source that is not
in the folder given is skipped and named, since the batches arrive in
separate folders.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = 74

# supplied filename -> (output stem, crop box as fractions of the source)
JOBS = [
    # Batch one, 3 Nov 2026. Named by the client.
    ("ICB_Bella_Vista_Agency_Desktop_1600x1200.jpg", "bella-vista", None),
    # Trims some of the foreground lawn so the building fills more of the
    # tile. Nothing of the branch itself is cut.
    ("ICB_Belmopan_City_Branch_Desktop_1600x1200.jpg", "belmopan", (0.0, 0.0, 1.0, 0.85)),
    ("ICB_Benque_Viejo_Border_Desktop_1600x1200.jpg", "benque-viejo-border", None),
    ("ICB_Benque_Viejo_Branch_Desktop_1600x1200.jpg", "benque-town-board", None),
    # Crops off the third-party spa advertising board above ICB's own sign.
    ("ICB_Caye_Caulker_Agency_Desktop_1600x1200.jpg", "caye-caulker", (0.0, 0.242, 1.0, 0.992)),

    # Batch two, 3 Nov 2026. Supplied numbered rather than named, so each
    # was identified from its own signboard:
    #   02  "DANGRIGA BRANCH  PHONE: 522-0706"
    #   04  "AIRPORT PLAZA, LADYVILLE  TEL: 670-6970"
    #   05  "Tel: 322-3509 / 613-0817 ... icb_ow@icbinsurance.com"
    # 01 and 03 carry no branch name and are not wired up yet.
    ("ICB_Branch_02_Desktop_1600x1200.jpg", "dangriga", None),
    ("ICB_Branch_04_Desktop_1600x1200.jpg", "ladyville", None),
    # Trims the empty concrete forecourt at the bottom.
    ("ICB_Branch_05_Desktop_1600x1200.jpg", "orange-walk", (0.0, 0.0, 1.0, 0.86)),
]

os.makedirs(OUT, exist_ok=True)
for src, stem, box in JOBS:
    path_in = os.path.join(SRC, src)
    if not os.path.exists(path_in):
        print("%-22s skipped, %s is not in this folder" % (stem, src))
        continue
    im = Image.open(path_in).convert("RGB")
    if box:
        w, h = im.size
        im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    if im.width > 1200:
        im = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
    path = os.path.join(OUT, stem + ".webp")
    im.save(path, "WEBP", quality=QUALITY, method=6)
    print("%-22s %4dx%-4d q=%-3d %6.1f KB" % (stem, im.width, im.height, QUALITY, os.path.getsize(path) / 1024))
