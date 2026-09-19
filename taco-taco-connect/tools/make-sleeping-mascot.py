#!/usr/bin/env python3
"""
Build the sleeping mascot from the awake one.

    pip install opencv-python-headless numpy pillow
    python3 tools/make-sleeping-mascot.py

Reads assets/mascot.png and writes assets/mascot-sleep.{webp,png}: arms lowered,
eyes closed, a small sleeping mouth. Re-run it after regenerating the mascot.

Three things are worth knowing before changing the numbers below.

The arms are cut from the top corners, where the artwork has nothing else (the
hat brim stops well inside), and rotated about the shoulder to hang at the sides.
The cut is dilated first, or the anti-aliased rim of the raised fists is left
behind as a ghost. The rotated arms composite BEHIND the body, which is where a
resting arm sits.

The eyes and grin are removed by interpolating each row between its nearest
clean pixels left and right, not by inpainting. The face carries a gradient and
is bounded by its own tone on both sides, so the interpolation blends; TELEA
inpainting dragged the dark moustache across the mouth instead.

The moustache is left alone. It is the mascot's strongest feature and the face
stops reading as Taco Taco without it, so the eye mask is clipped above it and
the mouth mask is built from the teeth outward rather than as a box.
"""
import pathlib
import sys

import cv2
import numpy as np
from PIL import Image

ARM_BOX_L = (20, 196, 90, 280)     # x0, x1, y0, y1
ARM_BOX_R = (590, 766, 90, 280)
PIVOT_L, PIVOT_R = (188.0, 268.0), (622.0, 268.0)
SWING = 118.0                      # degrees; 70 reads as "arms out", 145 hides them
CUT_GROW = 15                      # px; smaller leaves a pale wedge at the shoulder
EYES = ((325, 288, 44, 40), (419, 290, 44, 36))   # cx, cy, rx, ry
MOUSTACHE_TOP = 322                # eye mask never reaches below this
MOUSTACHE_SEED = (390, 335)        # a point inside the moustache
GRIN_TOP, GRIN_BOTTOM = 344, 425   # rows the grin mask may occupy
INK = (28, 22, 40)

root = pathlib.Path(__file__).resolve().parent.parent
src = cv2.imread(str(root / "assets" / "mascot.png"), cv2.IMREAD_UNCHANGED)
if src is None:
    sys.exit("assets/mascot.png not found; run tools/extract-mascot.py first")
h, w = src.shape[:2]
alpha0 = src[..., 3]


def biggest_blob(x0, x1, y0, y1):
    box = np.zeros((h, w), np.uint8)
    box[y0:y1, x0:x1] = 255
    sel = ((alpha0 > 60) & (box > 0)).astype(np.uint8)
    n, lbl, st, _ = cv2.connectedComponentsWithStats(sel, 8)
    _, i = max((st[i, 4], i) for i in range(1, n))
    return lbl == i


def over(bot, top):
    ta, ba = top[..., 3:4] / 255.0, bot[..., 3:4] / 255.0
    oa = ta + ba * (1 - ta)
    rgb = np.where(oa > 1e-6, (top[..., :3] * ta + bot[..., :3] * ba * (1 - ta)) / np.maximum(oa, 1e-6), 0)
    return np.dstack([rgb, oa * 255])


def rotate(img, pivot, deg):
    M = cv2.getRotationMatrix2D(pivot, deg, 1.0)
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC,
                          borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))


def _clean(mask, y, x, step, reach=44):
    """Nearest unmasked, opaque, light-enough pixel in one direction."""
    for _ in range(reach):
        if x < 0 or x >= w:
            return None
        if mask[y, x] == 0 and alpha0[y, x] > 245 and int(src[y, x, :3].max()) > 120:
            return x
        x += step
    return None


def seam_fill(img, mask):
    out = img.astype(np.float32).copy()
    for y in range(h):
        xs = np.where(mask[y] > 0)[0]
        if not len(xs):
            continue
        runs, start = [], xs[0]
        for i in range(1, len(xs)):
            if xs[i] != xs[i - 1] + 1:
                runs.append((start, xs[i - 1]))
                start = xs[i]
        runs.append((start, xs[-1]))
        for x0, x1 in runs:
            lx = _clean(mask, y, x0 - 1, -1)
            rx = _clean(mask, y, x1 + 1, +1)
            if lx is None or rx is None:
                continue          # no face tone to blend between: leave it alone
            cl, cr = out[y, lx], out[y, rx]
            t = np.linspace(0, 1, x1 - x0 + 3)[1:-1][:, None]
            out[y, x0:x1 + 1] = cl * (1 - t) + cr * t
    return np.clip(out, 0, 255).astype(np.uint8)


# ---- arms down -------------------------------------------------------------
m = src.astype(np.float32)
L, R = biggest_blob(*ARM_BOX_L), biggest_blob(*ARM_BOX_R)
base = m.copy()
base[cv2.dilate(((L | R).astype(np.uint8)) * 255, np.ones((CUT_GROW, CUT_GROW), np.uint8)) > 0] = 0
armL, armR = m.copy(), m.copy()
armL[~L] = 0
armR[~R] = 0
comp = over(np.zeros_like(m), rotate(armL, PIVOT_L, SWING))
comp = over(comp, rotate(armR, PIVOT_R, -SWING))
comp = over(comp, base)
rgb = np.clip(comp[..., :3], 0, 255).astype(np.uint8)
alpha = np.clip(comp[..., 3], 0, 255).astype(np.uint8)

# ---- clear the eyes and the grin ------------------------------------------
hsv = cv2.cvtColor(src[..., :3], cv2.COLOR_BGR2HSV)
mask = np.zeros((h, w), np.uint8)
for cx, cy, rx, ry in EYES:
    cv2.ellipse(mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
mask[MOUSTACHE_TOP:, :] = 0

band = np.zeros((h, w), np.uint8)
band[340:430, 250:542] = 255
teeth = ((hsv[..., 1] < 55) & (hsv[..., 2] > 195) & (band > 0)).astype(np.uint8) * 255
lower = np.zeros((h, w), np.uint8)
lower[398:418, 258:536] = ((hsv[398:418, 258:536, 2] < 95) * 255).astype(np.uint8)
grin = cv2.dilate(teeth, np.ones((21, 21), np.uint8)) | cv2.dilate(lower, np.ones((13, 13), np.uint8))

# The grin is bounded above by the moustache, not by a tidy shape. An ellipse
# was too narrow where the smile curls up at the corners and left a white sliver
# of it showing under the moustache's right end, so the bound is taken from the
# moustache itself, column by column.
dark = ((hsv[..., 2] < 95) & (alpha0 > 200)).astype(np.uint8)
nm, lm, sm, _ = cv2.connectedComponentsWithStats(dark, 8)
mous_id = lm[MOUSTACHE_SEED[1], MOUSTACHE_SEED[0]]
if mous_id == 0:
    sys.exit("moustache seed point missed; check MOUSTACHE_SEED")
mous = lm == mous_id
allow = np.zeros((h, w), bool)
for x in range(w):
    col = np.where(mous[:, x])[0]
    top = (col.max() + 3) if len(col) else GRIN_TOP
    allow[max(top, GRIN_TOP):GRIN_BOTTOM, x] = True
grin &= (allow.astype(np.uint8) * 255)
mask |= grin

filled = seam_fill(rgb, mask)
soft = (cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 3.5) / 255.0)[..., None]
rgb = np.clip(rgb * (1 - soft) + filled * soft, 0, 255).astype(np.uint8)

# ---- the sleeping face -----------------------------------------------------
for cx, cy, rx, _ in EYES:
    lid_y, lid_rx, lid_ry = cy + 4, rx - 8, 17
    cv2.ellipse(rgb, (cx, lid_y), (lid_rx, lid_ry), 0, 182, 358, INK, 8, cv2.LINE_AA)
    cv2.line(rgb, (cx - lid_rx - 7, lid_y - 3), (cx - lid_rx + 1, lid_y - 10), INK, 5, cv2.LINE_AA)
    cv2.line(rgb, (cx + lid_rx - 1, lid_y - 10), (cx + lid_rx + 7, lid_y - 3), INK, 5, cv2.LINE_AA)
cv2.ellipse(rgb, (392, 392), (26, 20), 0, 0, 360, INK, -1, cv2.LINE_AA)
cv2.ellipse(rgb, (392, 397), (16, 12), 0, 0, 360, (80, 52, 104), -1, cv2.LINE_AA)

out = Image.fromarray(np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), alpha]), "RGBA")
assets = root / "assets"
out.save(assets / "mascot-sleep.webp", quality=86, method=6)
out.resize((out.width // 2, out.height // 2), Image.LANCZOS).save(
    assets / "mascot-sleep-400.webp", quality=86, method=6)
out.quantize(colors=255, method=Image.FASTOCTREE).save(assets / "mascot-sleep.png", optimize=True)
for f in ("mascot-sleep.webp", "mascot-sleep-400.webp", "mascot-sleep.png"):
    print(f"  {f}: {(assets / f).stat().st_size / 1024:.1f} KB")
