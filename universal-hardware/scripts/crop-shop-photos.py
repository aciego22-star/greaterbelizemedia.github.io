"""Cut the product photos for the Shop out of Universal Hardware's single-product
Friends & Family Sale graphics (Spanish Lookout, 19-21 February 2026).

Usage: python3 -I scripts/crop-shop-photos.py <originals-dir> public/site-images/shop
(needs numpy, scipy and Pillow)

<originals-dir> holds the 1080 x 1080 uploads listed in src/data/shop.ts,
downloaded from https://universalhardware.bz/news/wp-content/uploads/<file>.jpg
(not committed).

Only the product is kept. Within the band below the sale banner, the product
is the large connected shape on the left of the graphic; the model badge,
description and price sit to its right (or below it) as separate shapes and are
painted out along with the backdrop, so no price, date or phone number is
copied. Each cut-out is centred on a white 4:3 plate. The product itself is not
retouched.
"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

# file -> output key, and the vertical band the product occupies.
MAKITA = (350, 975)
BIKE = (340, 872)
FILES = {
    '5007NK-3': MAKITA, '9557HPGX1-1': MAKITA, 'BO5030-2': MAKITA, 'DLX2142Y-2': MAKITA,
    'DLX2180TX': MAKITA, 'DLX2336SYX-1': MAKITA, 'DLX2414YX7-1': MAKITA, 'DUR181SF': MAKITA,
    'DUR365UZ': MAKITA, 'GA4530X2-5': MAKITA, 'HP1630-3': MAKITA, 'HP333DYX3B': MAKITA,
    'HR2470-3': MAKITA, 'HW101-2': MAKITA, 'LW1401': MAKITA, 'M9507B-3': MAKITA,
    'LF100-A-2': BIKE, 'LF110-7A-2': BIKE, 'LF150-5L-2': BIKE, 'LF150-5U-2': BIKE,
    'LF150-7-2': BIKE, 'LF150T-12C-2': BIKE, 'LF200-14F-2': BIKE, 'LF200GY-4-2': BIKE,
    'LF250GY-4-2': BIKE, 'ML125-16D-1': BIKE, 'ML125-5-2': BIKE, 'ML125-7-2': BIKE,
    'ML150GY-3A-2': BIKE, 'ML200GY-4-1': BIKE, 'ML200ZH-2': BIKE, 'ML250GY-4-2': BIKE,
}
# Text that reaches into the product's side of the graphic, painted out (x0, y0, x1, y1).
PAINT_OUT = {
    'DUR181SF': [(530, 700, 1080, 775)],   # "SALE PRICE:" beside the trimmer
    'DUR365UZ': [(530, 700, 1080, 775)],
    'HR2470-3': [(280, 688, 795, 945)],    # logo, model, description and price under the tool
}
TEXT_X = 640    # shapes centred right of this are the graphic's text column
MAX_W = 720

src, out = sys.argv[1], sys.argv[2]
for name, (y0, y1) in FILES.items():
    im = np.asarray(Image.open(f'{src}/{name}.jpg').convert('RGB')).astype(np.float32)
    band = im[y0:y1]
    lum = band.mean(axis=2)
    chroma = band.max(axis=2) - band.min(axis=2)
    fg = (lum < 226) | (chroma > 26)
    for x0, ry0, x1, ry1 in PAINT_OUT.get(name, []):
        fg[max(0, ry0 - y0):max(0, ry1 - y0), x0:x1] = False
    fg = ndi.binary_closing(fg, np.ones((5, 5)), iterations=1)
    lab, n = ndi.label(fg, np.ones((3, 3)))
    areas = ndi.sum(np.ones_like(lum), lab, index=np.arange(1, n + 1))
    cents = ndi.center_of_mass(np.ones_like(lum), lab, index=np.arange(1, n + 1))
    big = areas.max()
    keep = [i + 1 for i in range(n) if areas[i] >= 0.035 * big and cents[i][1] < TEXT_X]
    mask = ndi.binary_fill_holes(np.isin(lab, keep))
    mask = ndi.binary_dilation(mask, iterations=3)
    alpha = ndi.gaussian_filter(mask.astype(np.float32), 1.2)[..., None]
    cut = band * alpha + 255 * (1 - alpha)
    # Lift the near-white, colourless backdrop streaks to white.
    L = cut.mean(axis=2, keepdims=True)
    C = cut.max(axis=2, keepdims=True) - cut.min(axis=2, keepdims=True)
    t = np.clip((L - 232) / 16, 0, 1) * (C < 18)
    t = t * t * (3 - 2 * t)
    cut = cut + (255 - cut) * t

    ys, xs = np.nonzero(mask)
    pad = 18
    x0, x1 = max(0, xs.min() - pad), min(cut.shape[1], xs.max() + pad)
    yy0, yy1 = max(0, ys.min() - pad), min(cut.shape[0], ys.max() + pad)
    crop = cut[yy0:yy1, x0:x1]
    h, w = crop.shape[:2]
    W = max(w, round(h * 4 / 3)); H = round(W * 3 / 4)
    plate = np.full((H, W, 3), 255, np.float32)
    oy, ox = (H - h) // 2, (W - w) // 2
    plate[oy:oy + h, ox:ox + w] = crop
    img = Image.fromarray(np.clip(plate + 0.5, 0, 255).astype(np.uint8))
    if img.width > MAX_W:
        img = img.resize((MAX_W, round(MAX_W * 3 / 4)), Image.LANCZOS)
    key = name.lower().rsplit('-', 1)[0] if name[-2] == '-' else name.lower()
    img.save(f'{out}/{key}.jpg', quality=86, optimize=True, progressive=True)
    img.save(f'{out}/{key}.webp', quality=80, method=6)
    print(f'{name:14s} -> {key:12s} {img.width}x{img.height}  kept {len(keep)} of {n} shapes')
