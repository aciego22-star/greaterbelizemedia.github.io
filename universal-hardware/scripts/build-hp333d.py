"""Build the 3D hero kit from Universal Hardware's own product photo.

Input: the Friends & Family 2026 graphic with the Makita HP333D kit on white,
https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg (1080 x 1080,
not committed). The hero recreates the whole kit as photographed: the drill,
the 1.5Ah battery and the DC10WD charger. Output, in public/hero/:

  hp333d.webp        the kit cut out of the photo (colour + alpha matte), 2x
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
thin plate on the near side. The battery and charger are rounded slabs set a
little in front of the drill, as they stand in the photo; the battery, which
overlaps the charger's corner, is split off along its measured edge. The photo
is then projected onto the front and (mirrored, text re-flipped at runtime)
onto the back.

Each file name carries a hash of its content (hp333d.<hash>.webp and so on),
listed in hp333d.json, so a changed file always gets a new URL.

Usage: python3 scripts/build-hp333d.py <path-to-HP333DYX3B.jpg>
Needs numpy, scipy and Pillow.
"""
import hashlib
import io
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SRC = sys.argv[1]
OUT = Path(__file__).resolve().parent.parent / 'public' / 'hero'
CROP = (30, 363, 652, 962)  # kit bounding box in the 1080 graphic, plus about 10 px
GRID = 3  # mesh grid spacing in photo pixels
FILES = {}
for old in OUT.glob('hp333d*'):
    old.unlink()  # replaced by this run's content-named files


def save(img, key, name, ext, **opts):
    """Write `img` as hp333d<name>.<content hash>.<ext>: every change gets a new URL, so no host or browser cache can serve an old copy."""
    buf = io.BytesIO()
    img.save(buf, format='WEBP' if ext == 'webp' else 'PNG', **opts)
    data = buf.getvalue()
    fname = f'hp333d{name}.{hashlib.sha256(data).hexdigest()[:10]}.{ext}'
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / fname).write_bytes(data)
    FILES[key] = fname

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
order = np.argsort(sizes)[::-1] + 1
# The two largest shapes: the drill, and the charger with the battery in front.
first, second = (lab == order[0]), (lab == order[1])
drill_px, kit_px = (first, second) if fx[first].mean() > fx[second].mean() else (second, first)
drill_mask = ndi.binary_fill_holes(drill_px)
holes, hn = ndi.label(drill_mask & ~drill_px)
for i in range(1, hn + 1):
    sel = holes == i
    if fy[sel].min() > 840 and mn[sel].mean() >= 240:
        drill_mask[sel] = False  # see-through openings in the belt clip
kit_mask = ndi.binary_fill_holes(kit_px)
# The battery's edge where it overlaps the charger (full-graphic pixels): right
# of and below this line is battery, the rest of that shape is charger.
from PIL import ImageDraw
BATTERY_SIDE = [(392, 700), (700, 700), (700, 1000), (300, 1000), (318, 900), (322, 860), (338, 826), (366, 823), (378, 818), (392, 812)]
cv = Image.new('L', (W, H), 0)
ImageDraw.Draw(cv).polygon([(x - CROP[0], y - CROP[1]) for x, y in BATTERY_SIDE], fill=255)
battery_mask = kit_mask & (np.asarray(cv) > 127)
charger_mask = kit_mask & ~battery_mask
mask = drill_mask | kit_mask
alpha = ndi.gaussian_filter(mask.astype(np.float32), 0.6)

# Colour decontamination: edge pixels are blended with the white background,
# so replace the outer band (and everything outside) with the nearest interior
# colour. Interior pixels are untouched.
core = ndi.binary_erosion(mask, iterations=1)
_, (iy, ix) = ndi.distance_transform_edt(~core, return_indices=True)
clean = rgb.copy()
band = ~core
clean[band] = rgb[iy[band], ix[band]]

# ---- Thickness field (drill) ----
D = ndi.distance_transform_edt(drill_mask)
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
hb *= drill_mask

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
clip_only = drill_mask & (fy > 836) & (fx > 552)
clip_w = ndi.gaussian_filter(clip_only.astype(np.float32), 2.0)
CZ = HF * 0.86
hclip = 5.0 * np.sqrt(1 - (1 - np.clip(D / 3.0, 0, 1)) ** 2)

body = np.maximum(hb * m, wf * slab)
c = clip_w * CZ
h = (1 - clip_w) * body + clip_w * hclip
front = np.where(drill_mask, c + h, 0).astype(np.float32)
back = np.where(drill_mask, c - h, 0).astype(np.float32)

# Battery and charger: rounded slabs, set forward of the drill (z offsets),
# each as deep as its real proportions suggest. Units are photo pixels.
for part, half, radius, zoff in ((charger_mask, 58.0, 22.0, 30.0), (battery_mask, 40.0, 10.0, 62.0)):
    Dp = ndi.distance_transform_edt(part)
    hp = half * np.sqrt(1 - (1 - np.clip(Dp / radius, 0, 1)) ** 2)
    front = np.where(part, zoff + hp, front).astype(np.float32)
    back = np.where(part, zoff - hp, back).astype(np.float32)

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
save(Image.fromarray(packed, 'RGB'), 'depth', '-depth', 'png', optimize=True)

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
save(Image.fromarray(snap, 'RGB'), 'snap', '-snap', 'png', optimize=True)
print('max snap distance', float(np.hypot(dx, dy).max()))

# ---- Textures ----
rgba = np.dstack([np.clip(clean, 0, 255), alpha * 255]).astype(np.uint8)
tex1 = Image.fromarray(rgba, 'RGBA')
save(tex1, 'photoLo', '-lo', 'webp', quality=90, method=6)
col2 = Image.fromarray(np.clip(clean, 0, 255).astype(np.uint8)).resize((W * 2, H * 2), Image.LANCZOS)
col2 = col2.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=1))
al2 = Image.fromarray((alpha * 255).astype(np.uint8)).resize((W * 2, H * 2), Image.BICUBIC)
tex2 = col2.convert('RGBA')
tex2.putalpha(al2)
save(tex2, 'photo', '', 'webp', quality=88, method=6)

# Text regions flipped back in place on the mirrored far side, so they still
# read correctly (full-graphic x, y, w, h): the drill's wordmark and clutch
# numbers, the battery's wordmark and label, and the charger's label.
FLIP = [
    (514, 439, 90, 38), (406, 405, 18, 15), (444, 407, 15, 13), (424, 417, 18, 23), (438, 449, 17, 25), (439, 480, 16, 22),
    (326, 884, 66, 62), (400, 856, 128, 80),
    (150, 668, 240, 105),
]

ys, xs = np.nonzero(mask)
meta = {
    'source': 'https://universalhardware.bz/news/wp-content/uploads/HP333DYX3B.jpg',
    'crop': CROP,
    'size': [W, H],
    'grid': GRID,
    'gridSize': [len(gx), len(gy)],
    'bbox': [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())],
    'depthRange': [float(back[mask].min()), float(front[mask].max())],
    'flip': [[x - CROP[0], y - CROP[1], w, h] for x, y, w, h in FLIP],
    'files': FILES,
}
(Path(__file__).resolve().parent.parent / 'src' / 'hero' / 'hp333d.json').write_text(json.dumps(meta, indent=1) + '\n')
print(json.dumps(meta))
print('valid grid points', int(valid.sum()), 'of', valid.size)
