"""Build the 3D hero drill from Universal Hardware's own product photo.

Input: the Friends & Family 2026 graphic with the Makita HP333D kit on white,
https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg (1080 x 1080,
not committed). Output, in public/hero/:

  hp333d.webp        the drill cut out of the photo (colour + alpha matte), 2x
  hp333d-lo.webp     the same at 1x, for low-power devices
  hp333d-depth.png   front and back surface depth on a 3 px grid (12 bits each,
                     packed into RGB), used to build the 3D mesh at runtime
  hp333d-snap.png    for grid points just outside the outline, the offset that
                     moves them onto it, so the mesh edge follows the photo
and src/hero/hp333d.json (sizes and grid, imported by drill-model.ts).

How the shape is made: the drill's outline in the photo is "inflated" into a
solid. Every point inside the outline gets a thickness from the largest balls
that fit inside the outline (union of balls), so the chuck, housing and handle
come out round. The foot is a flat slab with rounded edges, and the belt clip a
thin plate on the near side. The 1.5Ah battery from the same photo is fitted
under the foot (see below). The photo is then projected onto the front and
(mirrored, text re-flipped at runtime) onto the back.

Usage: python3 scripts/build-hp333d.py <path-to-HP333DYX3B.jpg>
Needs numpy, scipy and Pillow.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SRC = sys.argv[1]
OUT = Path(__file__).resolve().parent.parent / 'public' / 'hero'
CROP = (258, 363, 648, 884)  # drill bounding box in the 1080 graphic, plus 10 px
GRID = 3  # mesh grid spacing in photo pixels

im = Image.open(SRC).convert('RGB').crop(CROP)
rgb = np.asarray(im).astype(np.float32)
H, W = rgb.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
fy = yy + CROP[1]  # full-graphic coordinates, for the region rules below
fx = xx + CROP[0]

# ---- Matte: white background flood plus the open gaps in the belt clip ----
mn = rgb.min(axis=2)
bg = mn >= 238
lab, n = ndi.label(~bg)
sizes = ndi.sum(np.ones_like(lab), lab, range(1, n + 1))
drill = lab == (int(np.argmax(sizes)) + 1)
mask = ndi.binary_fill_holes(drill)
holes, hn = ndi.label(mask & ~drill)
for i in range(1, hn + 1):
    sel = holes == i
    if fy[sel].min() > 840 and mn[sel].mean() >= 240:
        mask[sel] = False  # see-through openings in the clip
drill_alpha = ndi.gaussian_filter(mask.astype(np.float32), 0.6)

# Colour decontamination: edge pixels are blended with the white background,
# so replace the outer band (and everything outside) with the nearest interior
# colour. Interior pixels are untouched.
core = ndi.binary_erosion(mask, iterations=1)
_, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
clean = rgb.copy()
band = ~core
clean[band] = rgb[iy[band], ix[band]]

# ---- Thickness field ----
D = ndi.distance_transform_edt(mask)
# Medial ridge: local maxima of D along any of four directions.
ridge = np.zeros_like(mask)
for dy, dx in ((0, 1), (1, 0), (1, 1), (1, -1)):
    a = np.roll(D, (dy, dx), (0, 1))
    b = np.roll(D, (-dy, -dx), (0, 1))
    ridge |= (D >= a) & (D >= b)
ridge &= D >= 1.5
# Rounder chuck, slightly squarer housing and grip (superellipse exponent).
expo = np.where(fx < 470, 2.0, 2.6)
hb = np.zeros((H, W), np.float32)
for qy, qx in zip(*np.nonzero(ridge)):
    r = D[qy, qx]
    p = expo[qy, qx]
    R = int(np.ceil(r))
    y0, y1 = max(0, qy - R), min(H, qy + R + 1)
    x0, x1 = max(0, qx - R), min(W, qx + R + 1)
    d = np.hypot(yy[y0:y1, x0:x1] - qy, xx[y0:y1, x0:x1] - qx) / r
    t = np.clip(1 - d**p, 0, None) ** (1 / p) * r
    np.maximum(hb[y0:y1, x0:x1], t, out=hb[y0:y1, x0:x1])
hb *= mask

# Depth multipliers: real proportions are a little slimmer than round.
m = np.full((H, W), 0.92, np.float32)
m[fx < 470] = 1.0
m[(fy > 560) & (fy < 780) & (fx >= 470)] = 0.84
m = ndi.gaussian_filter(m, 12)

# Foot: flat slab with rounded edges, as deep as the housing.
HF = 82.0
rr = 14.0
k = np.clip(D / rr, 0, 1)
slab = HF * np.sqrt(1 - (1 - k) ** 2)
wf = np.clip((fy - 752) / (792 - 752), 0, 1)
wf = wf * wf * (3 - 2 * wf)

# Belt clip below the foot: a thin plate on the near side.
clip_only = mask & (fy > 836) & (fx > 552)
clip_w = ndi.gaussian_filter(clip_only.astype(np.float32), 2.0)
CZ = HF * 0.86
hclip = 5.0 * np.sqrt(1 - (1 - np.clip(D / 3.0, 0, 1)) ** 2)

body = np.maximum(hb * m, wf * slab)
c = clip_w * CZ
h = (1 - clip_w) * body + clip_w * hclip
front = np.where(mask, c + h, 0).astype(np.float32)
back = np.where(mask, c - h, 0).astype(np.float32)

# ---- 1.5Ah battery, fitted under the foot ----
# The kit photo shows the BL1016 beside the drill, seen from the same
# front-left angle: its front end ("makita") on the left, its long side (teal
# 1.5Ah label) on the right. Under the foot, the battery takes the same
# layout: front end below the toe, side below the foot's near side, top edges
# tucked behind the foot. Each face is warped from the kit photo with a
# homography between four corners. Kit corners are full-graphic pixels, drill
# corners crop pixels, both top-left, top-right, bottom-right, bottom-left.
# Kit bottom corners sit 1.5 px inside edges fitted to the photo (front bottom
# edge y = 0.684x + 677.3, side bottom edge y = -0.531x + 1164.6).
KIT_FRONT = [(324.5, 868), (393, 913), (396, 946.5), (327, 898)]
KIT_SIDE = [(393, 913), (522, 846), (524, 885), (396, 946.5)]
BAT_FRONT = [(172, 414), (246, 440), (246, 510), (172, 484)]
BAT_SIDE = [(246, 440), (348, 416), (348, 486), (246, 510)]
HBT = 64.0  # battery half depth: a little narrower than the foot (HF)
RB = 8.0  # rounding of its edges
full = Image.open(SRC).convert('RGB')


def warp(dst, src):
    """Image of the crop's size showing quad `src` of the graphic mapped onto quad `dst`."""
    A, B = [], []
    for (x, y), (u, v) in zip(dst, src):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        B += [u, v]
    cf = np.linalg.solve(np.array(A, float), np.array(B, float))
    return np.asarray(full.transform((W, H), Image.PERSPECTIVE, tuple(cf), Image.BICUBIC)).astype(np.float32)


def poly_alpha(pts, ss=4):
    from PIL import ImageDraw
    cv = Image.new('L', (W * ss, H * ss), 0)
    ImageDraw.Draw(cv).polygon([(x * ss, y * ss) for x, y in pts], fill=255)
    return np.asarray(cv.resize((W, H), Image.BOX)).astype(np.float32) / 255


a_front = poly_alpha(BAT_FRONT)
a_side = poly_alpha(BAT_SIDE)
bat_alpha = np.clip(a_front + a_side, 0, 1)
bat_rgb = np.where((a_front > a_side)[..., None], warp(BAT_FRONT, KIT_FRONT), warp(BAT_SIDE, KIT_SIDE))
bat = bat_alpha > 0.5
drill_mask = mask
mask = drill_mask | bat

# Depth: a slab with rounded edges; drill parts in front of it (the foot's
# lip, the belt clip) keep their own surfaces.
DB = ndi.distance_transform_edt(mask)
bslab = HBT * np.sqrt(1 - (1 - np.clip(DB / RB, 0, 1)) ** 2)
front = np.where(bat, np.maximum(front, bslab), front).astype(np.float32)
back = np.where(bat, np.minimum(back, -bslab), back).astype(np.float32)

# Colour: the battery shows through wherever the drill is not.
inb = (bat_alpha > 0)[..., None]
clean = np.where(inb, drill_alpha[..., None] * clean + (1 - drill_alpha[..., None]) * bat_rgb, clean)
alpha = np.maximum(drill_alpha, bat_alpha)
core = ndi.binary_erosion(mask, iterations=1)
_, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
band = ~core & ~drill_mask
clean[band] = clean[iy[band], ix[band]]

# Outside the outline, carry the nearest midline so front and back meet.
_, (my, mx) = ndi.distance_transform_edt(~mask, return_indices=True)
mid = (front + back) / 2
out = ~mask
front[out] = mid[my[out], mx[out]]
back[out] = mid[my[out], mx[out]]

# ---- Grid sample and pack (12 bits per surface, code 0 = no vertex) ----
gy = np.arange(0, H, GRID)
gx = np.arange(0, W, GRID)
dist_out = ndi.distance_transform_edt(~mask)
valid = (dist_out <= GRID * 1.5)[np.ix_(gy, gx)]
f = front[np.ix_(gy, gx)]
b = back[np.ix_(gy, gx)]
enc = lambda z: np.clip(np.round((z + 128) * 16), 1, 4095).astype(np.uint16)
fe = np.where(valid, enc(f), 0)
be = np.where(valid, enc(b), 0)
packed = np.zeros((len(gy), len(gx), 3), np.uint8)
packed[..., 0] = fe >> 4
packed[..., 1] = ((fe & 15) << 4) | (be >> 8)
packed[..., 2] = be & 255
OUT.mkdir(parents=True, exist_ok=True)
Image.fromarray(packed, 'RGB').save(OUT / 'hp333d-depth.png', optimize=True)

# Snap offsets: a grid point outside the outline moves to the contour, half a
# pixel out from its nearest inside pixel (1/16 px units, 128 = no offset).
_, (ny, nx) = ndi.distance_transform_edt(~mask, return_indices=True)
GY, GX = np.meshgrid(gy, gx, indexing='ij')
qy = ny[GY, GX].astype(np.float32)
qx = nx[GY, GX].astype(np.float32)
vy = GY - qy
vx = GX - qx
ln = np.maximum(np.hypot(vx, vy), 1e-6)
ty = qy + 0.5 * vy / ln
tx = qx + 0.5 * vx / ln
outside = ~mask[GY, GX] & valid
dx = np.where(outside, tx - GX, 0)
dy = np.where(outside, ty - GY, 0)
snap = np.zeros((len(gy), len(gx), 3), np.uint8)
snap[..., 0] = np.clip(np.round(128 + dx * 16), 0, 255)
snap[..., 1] = np.clip(np.round(128 + dy * 16), 0, 255)
snap[..., 2] = 128
Image.fromarray(snap, 'RGB').save(OUT / 'hp333d-snap.png', optimize=True)
print('max snap distance', float(np.hypot(dx, dy).max()))

# ---- Textures ----
rgba = np.dstack([np.clip(clean, 0, 255), alpha * 255]).astype(np.uint8)
tex1 = Image.fromarray(rgba, 'RGBA')
tex1.save(OUT / 'hp333d-lo.webp', quality=90, method=6)
col2 = Image.fromarray(np.clip(clean, 0, 255).astype(np.uint8)).resize((W * 2, H * 2), Image.LANCZOS)
col2 = col2.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=1))
al2 = Image.fromarray((alpha * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.BICUBIC)
tex2 = col2.convert('RGBA')
tex2.putalpha(al2)
tex2.save(OUT / 'hp333d.webp', quality=88, method=6)

ys, xs = np.nonzero(mask)
meta = {
    'source': 'https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg',
    'crop': CROP,
    'size': [W, H],
    'grid': GRID,
    'gridSize': [len(gx), len(gy)],
    'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
    'depthRange': [float(back[mask].min()), float(front[mask].max())],
}
(Path(__file__).resolve().parent.parent / 'src' / 'hero' / 'hp333d.json').write_text(json.dumps(meta, indent=1) + '\n')
print(json.dumps(meta))
print('valid grid points', int(valid.sum()), 'of', valid.size)
