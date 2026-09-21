#!/usr/bin/env python3
"""
Build the morning mascot from the awake one.

    pip install opencv-python-headless numpy pillow
    python3 tools/make-coffee-mascot.py

Reads assets/mascot.png and writes assets/mascot-coffee.{webp,png}: awake but
not yet awake, one arm relaxed, a mug of coffee in the other, heavy lids. The
page shows it from 7am until opening, which in practice is Monday to Thursday,
the only days Taco Taco opens as late as ten. Re-run after
tools/extract-mascot.py. Run with --debug to write mascot-coffee-debug.png.

Three decisions worth knowing.

THE RAISED ARM DOES NOT MOVE. Every rotation that brings the right fist down to
mug height pushes the elbow past the right edge of the canvas, and widening the
canvas would give this pose a different aspect ratio from the other two, which
would jump the hero layout when the clock rolls over. A mug held up in the hand
that is already up costs nothing and reads better than one down by the boots.
Only the left arm comes down, which is what stops the pose reading as a cheer.

THE LIDS ARE CLIPPED TO THE EYE WHITES, not drawn as free shapes. The eye is
found in the artwork, so the lid follows its real outline and lands correctly
whatever the logo does next. Covering the top 45% leaves the pupils showing,
which is what separates "heavy-lidded" from "asleep": the sleeping pose closes
them completely, and the two have to read differently at a glance.

THE MUG IS DRAWN, not cut from anything. It is the one element with no source in
the artwork. It is kept to flat fills inside a heavy outline, which is the
grammar the rest of the logo already uses, and to brand colours. The steam is
not here: it is CSS on the page, like the z's, so it drifts.
"""
import pathlib
import sys

import cv2
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from mascot_lib import Art, over, save_set          # noqa: E402

# ---- hand-measured, in assets/mascot.png pixels ------------------------------
ARM_BOX_L = (0, 214, 140, 400)          # the left arm only; see the sleeping tool
PIVOT_L = (245.0, 425.0)                # the left shoulder
SWING_L = 112.0                         # degrees; enough to read as "at rest"
CUT_GROW = 15

MUG = (912, 1090, 108, 274)             # x0, x1, y0, y1 of the mug body
LID_COVER = 0.55                        # fraction of each eye the lid takes
LID_LIFT = 0.05                         # how far above the eye the lid's arc sits

# The artwork's own linework, sampled rather than guessed, so a lid drawn on
# top of an eye sits in the same ink as the outline it lands against.
INK = (9, 5, 4)
CREAM = (229, 246, 255)                 # BGR
GREEN = (74, 115, 18)
COFFEE = (36, 60, 92)
COFFEE_HI = (70, 104, 146)

DEBUG = "--debug" in sys.argv
root = pathlib.Path(__file__).resolve().parent.parent
art = Art(root / "assets" / "mascot.png")
f = art.face()
eyes, moustache, grin = f["eyes"], f["moustache"], f["grin"]

# ---- the left arm comes down, the right stays up holding the mug -------------
m = art.src.astype(np.float32)
L = art.arm(*ARM_BOX_L)
base = m.copy()
base[cv2.dilate(L.astype(np.uint8) * 255, np.ones((CUT_GROW, CUT_GROW), np.uint8)) > 0] = 0
armL = m.copy()
armL[~L] = 0
comp = over(np.zeros_like(m), art.rotate(armL, PIVOT_L, SWING_L))
comp = over(comp, base)
rgb = np.clip(comp[..., :3], 0, 255).astype(np.uint8)
alpha = np.clip(comp[..., 3], 0, 255).astype(np.uint8)

# The grin is left alone. Erasing it means interpolating the face tone across the
# whole lower half, which the sleeping pose gets away with because everything
# else there has changed too; here it reads as a smear on an otherwise crisp
# face. He is pleased about the coffee. The eyes carry the mood.

# ---- heavy lids, clipped to the real eye whites ------------------------------
# The ellipse is deliberately wider than the eye so its lower edge crosses as a
# shallow curve rather than a flat cut, and it is clipped to the eye so it stops
# exactly on the drawn outline whatever shape the eye is.
for (cx, cy, rx, ry), blob in zip(eyes, f["eye_blobs"]):
    ys, xs = np.where(blob)
    top, bottom, W, H = ys.min(), ys.max(), xs.max() - xs.min(), ys.max() - ys.min()
    lid = np.zeros_like(alpha)
    cv2.ellipse(lid, (cx, int(top - H * LID_LIFT)),
                (int(W * 0.62), int(H * (LID_COVER + LID_LIFT))), 0, 0, 360, 255, -1)
    rgb[(lid > 0) & blob] = INK

# ---- the mug -----------------------------------------------------------------
x0, x1, y0, y1 = MUG
w, hgt = x1 - x0, y1 - y0
line = max(9, w // 12)
taper = int(w * 0.07)            # narrower at the foot, the way a mug is drawn
r = int(w * 0.16)                # corner radius


def mug_body():
    """A tapered body with rounded corners, as a filled mask."""
    body = np.zeros_like(alpha)
    tl, tr = x0, x1 - int(w * 0.16)
    bl, br = x0 + taper, x1 - int(w * 0.16) - taper
    cv2.fillPoly(body, [np.array([
        (tl + r, y0), (tr - r, y0), (tr, y0 + r),
        (br, y1 - r), (br - r, y1), (bl + r, y1), (bl, y1 - r),
        (tl, y0 + r)], np.int32)], 255)
    for cx_, cy_ in ((tl + r, y0 + r), (tr - r, y0 + r),
                     (bl + r, y1 - r), (br - r, y1 - r)):
        cv2.circle(body, (cx_, cy_), r, 255, -1)
    return body


body = mug_body()
handle = np.zeros_like(alpha)
cv2.ellipse(handle, (x1 - int(w * 0.17), y0 + int(hgt * 0.46)),
            (int(w * 0.20), int(hgt * 0.23)), 0, -80, 80, 255, line, cv2.LINE_AA)
handle[body > 0] = 0                                  # the body wins where they meet

silhouette = ((body > 0) | (handle > 0)).astype(np.uint8) * 255
ink = cv2.dilate(silhouette, np.ones((line, line), np.uint8))
inner = cv2.erode(body, np.ones((line, line), np.uint8))

rgb[ink > 0] = INK
rgb[inner > 0] = CREAM
alpha[ink > 0] = 255

iy, ix = np.where(inner > 0)
if len(ix):
    ix0, ix1, iy0, iy1 = ix.min(), ix.max(), iy.min(), iy.max()
    ih = iy1 - iy0
    # Everything inside the mug is painted on a scratch layer and then stamped
    # through `inner`. Drawing straight onto the artwork let the band's square
    # corners hang outside the tapered body.
    fill = np.zeros_like(rgb)
    cv2.rectangle(fill, (ix0, iy0 + int(ih * 0.56)), (ix1, iy0 + int(ih * 0.76)), GREEN, -1)
    cv2.ellipse(fill, ((ix0 + ix1) // 2, iy0 + int(ih * 0.10)),
                ((ix1 - ix0) // 2, max(7, int(ih * 0.11))), 0, 0, 360, COFFEE, -1, cv2.LINE_AA)
    cv2.ellipse(fill, ((ix0 + ix1) // 2 - int((ix1 - ix0) * 0.17), iy0 + int(ih * 0.082)),
                (int((ix1 - ix0) * 0.15), max(3, int(ih * 0.038))), 0, 0, 360,
                COFFEE_HI, -1, cv2.LINE_AA)
    painted = (fill.any(axis=2)) & (inner > 0)
    rgb[painted] = fill[painted]

if DEBUG:
    dbg = rgb.copy()
    dbg[grin > 0] = (0, 255, 0)
    dbg[moustache] = (255, 0, 255)
    cv2.imwrite(str(root / "mascot-coffee-debug.png"), dbg)
    print(f"  eyes {eyes}\n  mouth at ({mx},{my})\n  mug {MUG}")

save_set(rgb, alpha, root / "assets", "mascot-coffee")
