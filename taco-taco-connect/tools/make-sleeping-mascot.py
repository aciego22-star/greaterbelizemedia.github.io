#!/usr/bin/env python3
"""
Build the sleeping mascot from the awake one.

    pip install opencv-python-headless numpy pillow
    python3 tools/make-sleeping-mascot.py

Reads assets/mascot.png and writes assets/mascot-sleep.{webp,png}: arms lowered,
eyes closed, a small sleeping mouth. Re-run after tools/extract-mascot.py.

Only three things are measured by hand, all in assets/mascot.png pixels: the two
corner boxes the arms live in and the shoulders they pivot about. The eyes, the
moustache and the grin are found from the artwork itself, so a redraw usually
needs only those updated rather than a dozen coordinates. Run with --debug to
write mascot-sleep-debug.png, a preview of what was detected.

Four things are worth knowing before changing any of it.

The arms are cut from the top corners, where the artwork has nothing else (the
hat brim stops inside them), and rotated about the shoulder to hang at the
sides. The cut is dilated first, or the anti-aliased rim of the raised fists is
left behind as a ghost. The rotated arms composite BEHIND the body, which is
where a resting arm sits.

The face is one connected mass of dark linework: the eye outlines, the
moustache and the mouth all touch, so no single flood fill isolates the
moustache. It is found instead by elimination, as the dark blob that is left
once the eyes and everything at or below the teeth are taken away.

The eyes and grin are removed by interpolating each row between its nearest
clean pixels left and right, not by inpainting: the face carries a gradient and
is bounded by its own tone on both sides, so interpolation blends where TELEA
dragged the dark moustache across the mouth. The fill refuses to run when the
nearest clean pixel is the shell's outline or the background, which is what put
a dark streak across the chin.

The moustache is never touched. It is the mascot's strongest feature and the
face stops reading as Taco Taco without it, so it is subtracted from every mask
and its lower edge is what bounds the grin, column by column. A single shape
will not do: an ellipse is too narrow where the smile curls up at the corners
and leaves a white sliver of it showing. Highlights of the smile that curl up
PAST the moustache tips are caught separately, as leftover bright pixels inside
the mouth's span.
"""
import pathlib
import sys

import cv2
import numpy as np

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from mascot_lib import Art, over, save_set          # noqa: E402

# ---- the hand-measured values, in assets/mascot.png pixels -------------------
ARM_BOX_L = (0, 214, 140, 400)      # x0, x1, y0, y1: contains the left arm only
ARM_BOX_R = (900, 1114, 140, 400)
PIVOT_L, PIVOT_R = (245.0, 425.0), (860.0, 428.0)   # the shoulders

SWING = 118.0        # degrees; 70 reads as "arms out", 145 hides them behind the body
CUT_GROW = 15        # px; smaller leaves a pale wedge at the shoulder
INK = (28, 22, 40)

DEBUG = "--debug" in sys.argv
root = pathlib.Path(__file__).resolve().parent.parent
art = Art(root / "assets" / "mascot.png")
f = art.face()
eyes, moustache, grin = f["eyes"], f["moustache"], f["grin"]

# ---- arms down ---------------------------------------------------------------
m = art.src.astype(np.float32)
L, R = art.arm(*ARM_BOX_L), art.arm(*ARM_BOX_R)
base = m.copy()
base[cv2.dilate(((L | R).astype(np.uint8)) * 255,
                np.ones((CUT_GROW, CUT_GROW), np.uint8)) > 0] = 0
armL, armR = m.copy(), m.copy()
armL[~L] = 0
armR[~R] = 0
comp = over(np.zeros_like(m), art.rotate(armL, PIVOT_L, SWING))
comp = over(comp, art.rotate(armR, PIVOT_R, -SWING))
comp = over(comp, base)
rgb = np.clip(comp[..., :3], 0, 255).astype(np.uint8)
alpha = np.clip(comp[..., 3], 0, 255).astype(np.uint8)

# ---- clear the eyes and the grin --------------------------------------------
mask = f["eye_mask"].copy()
mask[moustache] = 0                      # the moustache survives intact
mask |= grin
rgb = art.erase(rgb, mask)

# ---- the sleeping face -------------------------------------------------------
for cx, cy, rx, ry in eyes:
    lid_y, lid_rx, lid_ry = cy + int(ry * 0.14), int(rx * 0.80), max(12, int(ry * 0.38))
    thick = max(6, int(rx * 0.18))
    cv2.ellipse(rgb, (cx, lid_y), (lid_rx, lid_ry), 0, 182, 358, INK, thick, cv2.LINE_AA)
    lash = max(4, thick - 3)
    cv2.line(rgb, (cx - lid_rx - 10, lid_y - 4), (cx - lid_rx + 2, lid_y - 14), INK, lash, cv2.LINE_AA)
    cv2.line(rgb, (cx + lid_rx - 2, lid_y - 14), (cx + lid_rx + 10, lid_y - 4), INK, lash, cv2.LINE_AA)

gy, gx = np.where(grin > 0)
mouth = (int(gx.mean()), int(gy.mean()))
mr = (max(18, int((gx.max() - gx.min()) * 0.10)), max(14, int((gy.max() - gy.min()) * 0.22)))
cv2.ellipse(rgb, mouth, mr, 0, 0, 360, INK, -1, cv2.LINE_AA)
cv2.ellipse(rgb, (mouth[0], mouth[1] + int(mr[1] * 0.28)),
            (int(mr[0] * 0.60), int(mr[1] * 0.58)), 0, 0, 360, (80, 52, 104), -1, cv2.LINE_AA)

if DEBUG:
    dbg = rgb.copy()
    for cx, cy, rx, ry in eyes:
        cv2.ellipse(dbg, (cx, cy), (rx, ry), 0, 0, 360, (0, 255, 255), 2)
    dbg[moustache] = (255, 0, 255)
    dbg[grin > 0] = (0, 255, 0)
    cv2.imwrite(str(root / "mascot-sleep-debug.png"), dbg)
    print(f"  eyes {eyes}\n  mouth at {mouth} r={mr}")

save_set(rgb, alpha, root / "assets", "mascot-sleep")
