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

# The single-file preview inlines every photograph as base64, which adds
# a third again to each one, against a hard 16MB cap on one document. So
# a lighter rendition of each is written to build/preview/branches and
# build/build-single.js picks it up in place of the real file. The
# deployed folder and the ZIP always carry the full-quality file; this
# is the same arrangement the two campaign films already use.
PREVIEW_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview", "branches")
PREVIEW_WIDTH = 900
PREVIEW_QUALITY = 68

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
    # 01 and 03 carry no branch name. The client identified them on
    # 3 Nov from the raw frames ICB sent: 01 is Corozal Town, which is
    # why the only plaque on it reads SEGUROS, and 03 is Independence,
    # whose door decals are the ones posting the business hours that
    # disagree with the hours we were given.
    # Trims a little of the gravel forecourt.
    ("ICB_Branch_01_Desktop_1600x1200.jpg", "corozal", (0.0, 0.0, 1.0, 0.93)),
    ("ICB_Branch_02_Desktop_1600x1200.jpg", "dangriga", None),
    # Trims the concrete apron in the foreground.
    ("ICB_Branch_03_Desktop_1600x1200.jpg", "independence", (0.0, 0.0, 1.0, 0.85)),
    ("ICB_Branch_04_Desktop_1600x1200.jpg", "ladyville", None),
    # Trims the empty concrete forecourt at the bottom.
    ("ICB_Branch_05_Desktop_1600x1200.jpg", "orange-walk", (0.0, 0.0, 1.0, 0.86)),

    # Batch three, 3 Nov 2026. Named by the client. Seven names match a
    # location in the directory outright. The eighth was supplied as
    # "Yellow Village", which is not a location: the client identified
    # it on 3 Nov from the raw frame as SEINE BIGHT.
    # Trims the neighbouring shopfront and its awning off the left, so
    # the frame is ICB's agency rather than ICB's agency and the shop
    # next door, and takes a little grass off the bottom.
    ("ICB_Moro_Agency_Landscape.jpg", "moro", (0.14, 0.0, 1.0, 0.95)),
    ("ICB_Punta_Gorda_Branch_Landscape.jpg", "punta-gorda", None),
    # Trims the road in the foreground.
    ("ICB_San_Ignacio_Branch_Landscape.jpg", "san-ignacio", (0.0, 0.0, 1.0, 0.88)),
    ("ICB_San_Juan_Agency_Landscape.jpg", "san-juan", None),
    ("ICB_San_Pedro_Branch_Landscape.jpg", "san-pedro", None),
    ("ICB_Santa_Elena_Branch_Landscape.jpg", "santa-elena", None),
    # Trims the grass and the step in the foreground.
    ("ICB_Velasquez_Agency_Landscape.jpg", "velasquez", (0.0, 0.0, 1.0, 0.85)),
    ("ICB_Yellow_Village_Branch_Landscape.jpg", "seine-bight", None),
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

    os.makedirs(PREVIEW_DIR, exist_ok=True)
    small = im.resize((PREVIEW_WIDTH, round(im.height * PREVIEW_WIDTH / im.width)), Image.LANCZOS) \
        if im.width > PREVIEW_WIDTH else im
    prev = os.path.join(PREVIEW_DIR, stem + ".webp")
    small.save(prev, "WEBP", quality=PREVIEW_QUALITY, method=6)

    print("%-22s %4dx%-4d q=%-3d %6.1f KB   preview %5.1f KB"
          % (stem, im.width, im.height, QUALITY, os.path.getsize(path) / 1024,
             os.path.getsize(prev) / 1024))
