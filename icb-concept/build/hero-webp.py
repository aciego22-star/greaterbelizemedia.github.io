"""Cut and compress the home slider's artwork.

    python3 build/hero-webp.py <folder of supplied files> assets/img/heroes

WHY A SLIDE NEEDS MORE THAN ONE FILE.

The hero box is not one shape. Measured on the built site it runs from
2.67:1 on a 1920 desktop down to 0.54:1 on a 390 phone, a five-fold
swing. One picture cannot fill that: hand a wide photograph to a phone
and `cover` throws away three fifths of its width, which is how the
head office ended up as a close-up of its own roof. Letterbox it
instead and the slide grows bars down both sides, which is what the
What's New artwork was doing on every desktop.

So each slide is cut to the shapes the box actually takes:

    wide   2.34:1   desktops, where the box sits near 2.35
    mid    1.34:1   upright tablets
    stack  1.35:1   phones, which run this slide full screen

Below 769px a slide stops being a picture with words laid over it: the
media sits at the top at its own shape, uncropped, and the words go
underneath. So a phone does not need a portrait cut of a photograph.
It needs a landscape one shown whole, which is what mid is, and that
is why there are two photographic cuts here and not three. Composed
artwork still needs its upright version, because that one fills the
slide on its own and carries its own words.

The page picks one with two media queries and `object-fit: cover`, so
every slide fills its box edge to edge at every width and no crop is
ever worse than about a tenth. Nothing is letterboxed and nothing is
decapitated.

A PHOTOGRAPH can be cut to all three: the crops below say where to take
them from, as a fraction across the frame, because the subject is not
always in the middle. COMPOSED ARTWORK carrying its own headline cannot
be cut at all without slicing the words, so those slides are supplied
as finished compositions, one per shape, and are only resized here.

A lighter rendition of each goes to build/preview/heroes for the
single-file preview, as everything else does.
"""
import os, sys
from PIL import Image

SRC = sys.argv[1]
OUT = sys.argv[2]
QUALITY = 80

PREVIEW_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preview", "heroes")
PREVIEW_QUALITY = 64

# stem -> (supplied file, aspect, focus across the frame, publish width, preview width)
#
# focus is where the middle of the crop sits, 0.0 left edge to 1.0 right
# edge. It only bites when the source is wider than the shape asked for.
# 0.5 is the middle and is right for most things.
JOBS = [
    # --- The head office, slide 1. ICB supplied a matched pair on
    # 8 Nov 2026, one landscape and one upright, and all three cuts
    # come from them so the slide looks the same at every width. They
    # are regenerated rather than retouched: compared against the
    # photograph they are built from, the sky is blue instead of
    # overcast, the signage reads red instead of the navy actually on
    # the wall, and the anniversary banner and the two people at the
    # door survive in the upright one but not the landscape. Raised
    # with ICB; theirs to settle, and recorded in OPEN-QUESTIONS.md.
    #
    # The landscape one is cut wider still for desktops, and the trim
    # is taken off the sky rather than split, because splitting it
    # takes the road and the parked cars out of the bottom of the
    # frame.
    ("ICB_HQ_New_Wide.png",      "icb-hq-wide", 2.340, 0.50, 1672, 980, 0.42),
    ("ICB_HQ_New_Wide.png",      "icb-hq-mid",  1.340, 0.47, 1260, 700, 0.50),
    # The upright one is taken whole. At 0.563 it is close enough to
    # the shape a phone gives this slide that nearly nine tenths of
    # its width survives, and the signage sits between 7% and 25%
    # across it, measured off the file. check/signcheck.js holds it
    # to that.
    ("ICB_HQ_New_Portrait.png",  "icb-hq-stack", None, None,  941, 560, 0.50),

    # --- What's New, slide 3. Finished compositions: the headline and
    # the painted button are in the artwork, so these are resized,
    # never cut. ICB supplies the two shapes separately.
    ("ICB_Whats_New_Wide.webp",  "whats-new-wide", None, None, 1800, 980, 0.50),
    ("ICB_Whats_New_Tall.jpg",   "whats-new-tall", 0.580, 0.47,  900, 540, 0.50),
]


def cut(im, aspect, focus, vfocus=0.5):
    """The largest window of this shape that fits, centred on focus.

    focus is where the middle of the window sits across the frame and
    vfocus is the same down it, 0.0 top to 1.0 bottom. Only one of them
    ever applies: trimming the sides of a wide source uses focus,
    trimming the top and bottom of a tall one uses vfocus. The second
    matters when a landscape photograph is cut wider still, because
    splitting the difference takes the road out of the bottom of the
    frame and the trim is better taken off the sky."""
    w, h = im.size
    if w / h > aspect:                      # source too wide: trim the sides
        cw = int(round(h * aspect))
        centre = int(round(w * focus))
        left = max(0, min(w - cw, centre - cw // 2))
        return im.crop((left, 0, left + cw, h))
    ch = int(round(w / aspect))             # source too tall: trim top and bottom
    top = max(0, min(h - ch, int(round(h * vfocus)) - ch // 2))
    return im.crop((0, top, w, top + ch))


os.makedirs(OUT, exist_ok=True)
os.makedirs(PREVIEW_DIR, exist_ok=True)
for src, stem, aspect, focus, width, prev_width, vfocus in JOBS:
    path_in = os.path.join(SRC, src)
    if not os.path.exists(path_in):
        print("%-18s skipped, %s is not in this folder" % (stem, src))
        continue
    im = Image.open(path_in).convert("RGB")
    before = im.size
    if aspect is not None:
        im = cut(im, aspect, focus, vfocus)
    full = im.resize((width, max(1, round(im.height * width / im.width))), Image.LANCZOS) \
        if im.width > width else im
    path = os.path.join(OUT, stem + ".webp")
    full.save(path, "WEBP", quality=QUALITY, method=6)

    small = full.resize((prev_width, max(1, round(full.height * prev_width / full.width))), Image.LANCZOS)
    prev = os.path.join(PREVIEW_DIR, stem + ".webp")
    small.save(prev, "WEBP", quality=PREVIEW_QUALITY, method=6)

    print("%-18s %4dx%-4d ar %.2f  %6.1f KB   preview %4dx%-4d %5.1f KB   (from %dx%d)"
          % (stem, full.width, full.height, full.width / full.height,
             os.path.getsize(path) / 1024, small.width, small.height,
             os.path.getsize(prev) / 1024, before[0], before[1]))
