#!/usr/bin/env python3
"""
Cut the Taco Taco mascot out of the supplied square logo artwork.

    pip install opencv-python-headless numpy pillow
    python3 tools/extract-mascot.py path/to/logo.jpg

Writes assets/mascot.webp and assets/mascot.png (transparent background).

Why it is not a plain colour key: the artwork is a JPEG, so the mascot's black
linework has softened edges, and a flood fill walks straight through the right
boot. Pre-marking the dark linework as an impermeable wall seals those gaps. The
mascot also overlaps the white "sticker" edging of the TACO wordmarks behind it,
which a fill keeps; that edging is removed afterwards by the one property that
separates it from the mascot's own whites (eyes, teeth, cuffs) -- it touches the
background, they are sealed inside the outline.
"""
import pathlib
import sys

import cv2
import numpy as np
from PIL import Image

DARK = 105       # below this grey the pixel is treated as linework
TOL = 28         # flood-fill tolerance against the neighbouring pixel
UPSCALE = 2      # the mascot is only ~366px wide in the source

root = pathlib.Path(__file__).resolve().parent.parent
src = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / "assets" / "logo-source.jpg"
base = cv2.imread(str(src))
if base is None:
    sys.exit(f"could not read {src}")
h, w = base.shape[:2]

wall = cv2.dilate((cv2.cvtColor(base, cv2.COLOR_BGR2GRAY) < DARK).astype(np.uint8),
                  np.ones((3, 3), np.uint8))
mask = np.zeros((h + 2, w + 2), np.uint8)
mask[1:-1, 1:-1] = wall
seeds = [(x, 0) for x in range(0, w, 6)] + [(x, h - 1) for x in range(0, w, 6)] + \
        [(0, y) for y in range(0, h, 6)] + [(w - 1, y) for y in range(0, h, 6)]
for s in seeds:
    if mask[s[1] + 1, s[0] + 1] == 0:
        cv2.floodFill(base.copy(), mask, s, 0, (TOL,) * 3, (TOL,) * 3,
                      4 | cv2.FLOODFILL_MASK_ONLY | (255 << 8))

background = mask[1:-1, 1:-1] == 255
n, lbl, stats, _ = cv2.connectedComponentsWithStats((~background).astype(np.uint8) * 255, 8)
idx = lbl[h // 2, w // 2] or max(range(1, n), key=lambda i: stats[i, cv2.CC_STAT_AREA])
m = (lbl == idx).astype(np.uint8) * 255

pad = cv2.copyMakeBorder(m, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)
flood = pad.copy()
cv2.floodFill(flood, np.zeros((pad.shape[0] + 2, pad.shape[1] + 2), np.uint8), (0, 0), 255)
m = (pad | cv2.bitwise_not(flood))[1:-1, 1:-1]

# drop the wordmark's white sticker edging where it touches the mascot
hsv = cv2.cvtColor(base, cv2.COLOR_BGR2HSV)
white = cv2.morphologyEx(
    ((hsv[..., 1] < 55) & (hsv[..., 2] > 185) & (m > 0)).astype(np.uint8),
    cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
near_bg = cv2.dilate((background).astype(np.uint8) * 255, np.ones((5, 5), np.uint8)) > 0
wn, wlbl, wstats, _ = cv2.connectedComponentsWithStats(white, 8)
for i in range(1, wn):
    comp = wlbl == i
    if wstats[i, cv2.CC_STAT_AREA] >= 40 and (comp & near_bg).sum() > 12:
        m[comp] = 0

n2, l2, s2, _ = cv2.connectedComponentsWithStats(
    cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8)), 8)
m = np.isin(l2, [i for i in range(1, n2) if s2[i, cv2.CC_STAT_AREA] > 300]).astype(np.uint8) * 255

# Pull the edge in by a pixel to shed the orange fringe the JPEG left behind,
# then feather so the cutout does not read as jagged on the dark page.
alpha = cv2.erode(m, np.ones((3, 3), np.uint8))
alpha = cv2.GaussianBlur(alpha, (0, 0), 0.9)

ys, xs = np.where(alpha > 8)
pad_px = 12
y0, y1 = max(0, ys.min() - pad_px), min(h, ys.max() + pad_px)
x0, x1 = max(0, xs.min() - pad_px), min(w, xs.max() + pad_px)

rgba = np.dstack([cv2.cvtColor(base, cv2.COLOR_BGR2RGB), alpha])[y0:y1, x0:x1]
out = cv2.resize(rgba, (rgba.shape[1] * UPSCALE, rgba.shape[0] * UPSCALE),
                 interpolation=cv2.INTER_LANCZOS4)
np.clip(out, 0, 255, out=out)

im = Image.fromarray(out.astype(np.uint8), "RGBA")
assets = root / "assets"
assets.mkdir(exist_ok=True)

# WebP at two widths for srcset, plus a quantised PNG fallback. The artwork is
# flat cartoon colour, so a palette costs nothing visually and takes the
# fallback from 660KB to under 90KB.
im.save(assets / "mascot.webp", quality=86, method=6)
half = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
half.save(assets / "mascot-400.webp", quality=86, method=6)
im.quantize(colors=255, method=Image.FASTOCTREE).save(assets / "mascot.png", optimize=True)

print(f"mascot {im.width}x{im.height} (half: {half.width}x{half.height})")

# ---------------------------------------------------------------------------
# App icons. At 16-32px the whole figure turns to mush, so the icon uses the
# head -- sombrero, eyes, moustache -- on a gold tile. Gold was picked over the
# deep green after comparing both at 16px: the dark sombrero needs a light
# ground to stay legible, and gold is the brand's primary colour anyway.
# ---------------------------------------------------------------------------
from PIL import ImageDraw

alpha_arr = np.asarray(im)[..., 3]
iys, ixs = np.where(alpha_arr > 24)
head = im.crop((ixs.min(), iys.min(), ixs.max(),
                iys.min() + int((iys.max() - iys.min()) * 0.62)))
GOLD = (245, 179, 1, 255)

def icon(size, pad=0.06):
    tile = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, size - 1, size - 1],
                                           radius=int(size * 0.22), fill=255)
    tile.paste(Image.new("RGBA", (size, size), GOLD), (0, 0), mask)
    inner = int(size * (1 - pad * 2))
    k = min(inner / head.width, inner / head.height)
    h = head.resize((max(1, int(head.width * k)), max(1, int(head.height * k))), Image.LANCZOS)
    tile.alpha_composite(h, ((size - h.width) // 2, (size - h.height) // 2))
    return tile

for name, size in (("favicon.png", 64), ("apple-touch-icon.png", 180),
                   ("icon-192.png", 192), ("icon-512.png", 512)):
    icon(size).save(assets / name, optimize=True)

for f in ("mascot.webp", "mascot-400.webp", "mascot.png",
          "favicon.png", "apple-touch-icon.png", "icon-192.png", "icon-512.png"):
    print(f"  {f}: {(assets / f).stat().st_size / 1024:.1f} KB")
