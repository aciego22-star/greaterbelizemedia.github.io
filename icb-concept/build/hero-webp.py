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

    # --- What's New, slide 3. ICB replaced the two supplied
    # compositions with a photograph of their own signage on 8 Nov
    # 2026, so this slide stopped being a finished lockup that painted
    # its own headline and became an ordinary photographic slide with
    # real copy and a real button. Three cuts, like the head office.
    #
    # The wide one is taken from the landscape frame, where trimming to
    # 2.34 only takes sky and foreground: the lettering runs almost the
    # full width of that file, so nothing may come off the sides.
    # The other two come from the upright frame for exactly that
    # reason, and are held high enough to keep the roundel and all
    # three lines of the name.
    ("ICB_Sign_Wide.png",        "whats-new-wide",  2.340, 0.50, 1672, 980, 0.49),
    ("ICB_Sign_Portrait.png",    "whats-new-mid",   1.340, 0.50, 1260, 700, 0.449),
    ("ICB_Sign_Portrait.png",    "whats-new-stack", 1.000, 0.50,  941, 560, 0.449),

    # --- The border kiosk, slide 4, added 8 Nov 2026. The kiosk at
    # Benque Viejo is where ICB sells short-term motor cover to drivers
    # bringing a foreign-registered vehicle in from Guatemala, and the
    # slide carries people to the page about it.
    #
    # Wide and mid come from the landscape frame: the kiosk sits just
    # left of centre in it, at 0.485 across, so the mid cut is held
    # there rather than at the middle. The phone cut comes from the
    # upright frame, squared off, because the sky above the kiosk and
    # the gravel below it are the parts worth losing and the building
    # is what is left.
    ("ICB_Kiosk_Wide.png",       "icb-kiosk-wide",  2.340, 0.50, 1672, 980, 0.52),
    ("ICB_Kiosk_Wide.png",       "icb-kiosk-mid",   1.340, 0.485, 1260, 700, 0.50),
    ("ICB_Kiosk_Portrait.png",   "icb-kiosk-stack", 1.000, 0.50,  941, 560, 0.449),

    # --- The headquarters building, for the Locations page hero. Not a
    # slider slide: it fills the interior page hero band, which runs
    # near 16:9 at every width (see .page-hero--whole-media). The frame
    # ICB supplied on 8 Nov 2026 is already 16:9, so it is resized and
    # never cut. It replaces the Daly Street street view that was in
    # that slot, which ICB also asked to be taken off the home page.
    ("ICB_HQ_Building_Wide.png", "icb-building-wide", None, None, 1672, 980, 0.50),
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
