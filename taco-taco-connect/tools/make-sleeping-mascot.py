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
from PIL import Image

# ---- the hand-measured values, in assets/mascot.png pixels -------------------
ARM_BOX_L = (0, 214, 140, 400)      # x0, x1, y0, y1: contains the left arm only
ARM_BOX_R = (900, 1114, 140, 400)
PIVOT_L, PIVOT_R = (245.0, 425.0), (860.0, 428.0)   # the shoulders

SWING = 118.0        # degrees; 70 reads as "arms out", 145 hides them behind the body
CUT_GROW = 15        # px; smaller leaves a pale wedge at the shoulder
INK = (28, 22, 40)

DEBUG = "--debug" in sys.argv
root = pathlib.Path(__file__).resolve().parent.parent
src = cv2.imread(str(root / "assets" / "mascot.png"), cv2.IMREAD_UNCHANGED)
if src is None:
    sys.exit("assets/mascot.png not found; run tools/extract-mascot.py first")
h, w = src.shape[:2]
alpha0 = src[..., 3]
hsv = cv2.cvtColor(src[..., :3], cv2.COLOR_BGR2HSV)
dark = ((hsv[..., 2] < 95) & (alpha0 > 200)).astype(np.uint8)
bright = ((hsv[..., 1] < 55) & (hsv[..., 2] > 195) & (alpha0 > 200)).astype(np.uint8)


def biggest_blob(x0, x1, y0, y1):
    box = np.zeros((h, w), np.uint8)
    box[y0:y1, x0:x1] = 255
    sel = ((alpha0 > 60) & (box > 0)).astype(np.uint8)
    n, lbl, st, _ = cv2.connectedComponentsWithStats(sel, 8)
    if n < 2:
        sys.exit(f"no artwork found in arm box ({x0},{x1},{y0},{y1})")
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


def _clean(mask, y, x, step, reach=60):
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
            lx, rx = _clean(mask, y, x0 - 1, -1), _clean(mask, y, x1 + 1, +1)
            if lx is None and rx is None:
                continue          # no face tone to borrow: leave the row alone
            # at the corners of the smile the only face tone is on one side, the
            # other being the moustache; carrying that one across beats leaving a
            # white sliver of the grin behind
            cl = out[y, lx if lx is not None else rx]
            cr = out[y, rx if rx is not None else lx]
            t = np.linspace(0, 1, x1 - x0 + 3)[1:-1][:, None]
            out[y, x0:x1 + 1] = cl * (1 - t) + cr * t
    return np.clip(out, 0, 255).astype(np.uint8)


# ---- find the eyes, then the teeth, then the moustache by elimination --------
nb, lb, sb, cb = cv2.connectedComponentsWithStats(bright, 8)
if nb < 3:
    sys.exit("no eye whites found in assets/mascot.png")
eye_ids = sorted(range(1, nb), key=lambda i: -sb[i, 4])[:2]
if sb[eye_ids[1], 4] < sb[eye_ids[0], 4] * 0.45:
    sys.exit("the two largest white shapes are not a pair of eyes; check the artwork")
eyes = []
for i in sorted(eye_ids, key=lambda i: cb[i][0]):
    x, y, cw, ch, _ = sb[i]
    eyes.append((int(x + cw / 2), int(y + ch / 2), int(cw / 2 + 16), int(ch / 2 + 16)))

eye_mask = np.zeros((h, w), np.uint8)
for cx, cy, rx, ry in eyes:
    cv2.ellipse(eye_mask, (cx, cy), (rx, ry), 0, 0, 360, 255, -1)
eye_bot = max(cy + ry for _, cy, _, ry in eyes)
ex0 = min(cx - rx for cx, _, rx, _ in eyes)
ex1 = max(cx + rx for cx, _, rx, _ in eyes)

teeth = np.zeros((h, w), np.uint8)
for i in range(1, nb):
    if sb[i, 4] > 500 and cb[i][1] > eye_bot and ex0 - 160 < cb[i][0] < ex1 + 160:
        teeth[lb == i] = 255
if not teeth.any():
    sys.exit("no teeth found below the eyes; check the artwork")
teeth_d = cv2.dilate(teeth, np.ones((9, 9), np.uint8))

mous = dark.copy()
mous[eye_mask > 0] = 0
for x in np.where(teeth_d.any(0))[0]:
    mous[np.where(teeth_d[:, x])[0].min():, x] = 0
nm, lm, sm, _ = cv2.connectedComponentsWithStats(mous, 8)
# the widest blob is the shell's own outline, so ignore anything that spans the art
mous_id = max(range(1, nm), key=lambda i: sm[i, 4] if sm[i, 2] < w * 0.6 else 0)
moustache = lm == mous_id
mous_bottom = np.full(w, -1)
for x in np.where(moustache.any(0))[0]:
    mous_bottom[x] = np.where(moustache[:, x])[0].max()

# ---- the grin: from the moustache's lower edge to below the lip, per column --
wide = cv2.dilate(teeth, np.ones((31, 31), np.uint8))
grin = np.zeros((h, w), np.uint8)
lip_bottom = 0
for x in np.where(wide.any(0))[0]:
    ys = np.where(wide[:, x])[0]
    top = mous_bottom[x] + 4 if mous_bottom[x] >= 0 else ys.min()
    tb = np.where(teeth_d[:, x])[0].max() if teeth_d[:, x].any() else ys.max()
    bot, y = tb + 6, tb
    while y < tb + 26 and y < h - 1 and not dark[y, x]:
        y += 1
    if y < tb + 26:                      # the lower lip, if there is one below
        e = y
        while e < h - 1 and dark[e, x] and e - y < 16:
            e += 1
        if e - y < 16:                   # thicker than a lip: the shell's edge
            bot = e + 4
    bot = min(bot, tb + 20)
    lip_bottom = max(lip_bottom, bot)
    if top < bot:
        grin[top:bot, x] = 255

gx0, gx1 = np.where(wide.any(0))[0][[0, -1]]
stray = bright * 255                     # smile highlights past the moustache tips
stray[:eye_bot, :] = 0
stray[lip_bottom:, :] = 0
stray[:, :max(0, gx0 - 30)] = 0
stray[:, gx1 + 30:] = 0
for i in eye_ids:
    stray[lb == i] = 0
grin |= cv2.dilate(stray, np.ones((15, 15), np.uint8))
grin[moustache] = 0

# ---- arms down ---------------------------------------------------------------
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

# ---- clear the eyes and the grin --------------------------------------------
mask = eye_mask.copy()
mask[moustache] = 0                      # the moustache survives intact
mask |= grin
mask = np.where(mask > 0, 255, 0).astype(np.uint8)

filled = seam_fill(rgb, mask)
soft = (cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 3.5) / 255.0)[..., None]
rgb = np.clip(rgb * (1 - soft) + filled * soft, 0, 255).astype(np.uint8)

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
    print(f"  eyes {eyes}\n  moustache rows "
          f"{np.where(moustache.any(1))[0].min()}-{int(mous_bottom.max())}\n"
          f"  grin rows {int(gy.min())}-{int(gy.max())}, mouth at {mouth} r={mr}")

out = Image.fromarray(np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), alpha]), "RGBA")
assets = root / "assets"
out.save(assets / "mascot-sleep.webp", quality=86, method=6)
out.resize((out.width // 2, out.height // 2), Image.LANCZOS).save(
    assets / "mascot-sleep-400.webp", quality=86, method=6)
out.quantize(colors=255, method=Image.FASTOCTREE).save(assets / "mascot-sleep.png", optimize=True)
for f in ("mascot-sleep.webp", "mascot-sleep-400.webp", "mascot-sleep.png"):
    print(f"  {f}: {(assets / f).stat().st_size / 1024:.1f} KB")
