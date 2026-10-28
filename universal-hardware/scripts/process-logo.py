"""Prepare the user-supplied Universal Hardware reference logo for web display.

No redrawing or vectorising: the original raster pixels are kept. Steps:
1. crop away the scanner/screenshot edge line and surplus margin,
2. convert the flat light-grey background to transparency using a
   colour-to-alpha un-blend (preserves anti-aliased edges exactly),
3. export PNG + WebP at native resolution and a half-size variant.
Also prints sampled brand colours for the design tokens.
"""
import sys
import numpy as np
from PIL import Image

src, outdir = sys.argv[1], sys.argv[2]
im = Image.open(src).convert("RGB")
a = np.asarray(im).astype(np.float64)
bg = np.array([247.0, 247.0, 247.0])

# Crop: ignore the first 6 columns (grey edge line); find content bbox.
work = a[:, 6:, :]
diff = np.abs(work - bg).max(axis=2)
ys, xs = np.where(diff > 18)
pad = 6
y0, y1 = max(ys.min() - pad, 0), min(ys.max() + pad, work.shape[0] - 1)
x0, x1 = max(xs.min() - pad, 0), min(xs.max() + pad, work.shape[1] - 1)
crop = work[y0:y1 + 1, x0:x1 + 1, :]
print("crop box", x0 + 6, y0, x1 + 6, y1, "size", crop.shape[1], crop.shape[0])

# Alpha matte: the artwork has two solid inks (blue wordmark, near-black
# lettering) on a flat light background. For every pixel, project it onto
# the bg->ink line for each ink and keep the better fit; that projection is
# the coverage (alpha). Interior pixels keep their original colour.
flat = crop.reshape(-1, 3)
dist = np.abs(flat - bg).max(axis=1)
solid = flat[dist > 120]
blueish = solid[solid[:, 2] > solid[:, 0] + 60]
darkish = solid[solid.max(axis=1) < 110]
ink_blue = np.median(blueish, axis=0)
ink_dark = np.median(darkish, axis=0)
print("ink blue", ink_blue, "#%02X%02X%02X" % tuple(ink_blue.round().astype(int)))
print("ink dark", ink_dark, "#%02X%02X%02X" % tuple(ink_dark.round().astype(int)))
best_alpha = None
best_res = None
for ink in (ink_blue, ink_dark):
    d = ink - bg
    t = ((flat - bg) @ d) / (d @ d)
    t = np.clip(t, 0, 1)
    res = np.linalg.norm(flat - (bg + t[:, None] * d), axis=1)
    if best_alpha is None:
        best_alpha, best_res = t, res
    else:
        take = res < best_res
        best_alpha = np.where(take, t, best_alpha)
        best_res = np.where(take, res, best_res)
alpha = best_alpha.reshape(crop.shape[:2])
alpha = np.where(alpha < 0.04, 0, alpha)
alpha = np.where(alpha > 0.96, 1, alpha)
safe = np.where(alpha > 0, alpha, 1)[..., None]
fg = bg + (crop - bg) / safe
fg = np.clip(fg, 0, 255)
rgba = np.dstack([fg, alpha * 255]).round().astype(np.uint8)
out = Image.fromarray(rgba, "RGBA")
out.save(f"{outdir}/universal-hardware-logo.png", optimize=True)
out.save(f"{outdir}/universal-hardware-logo.webp", quality=92, method=6)
half = out.resize((out.width // 2, out.height // 2), Image.LANCZOS)
half.save(f"{outdir}/universal-hardware-logo-sm.png", optimize=True)
half.save(f"{outdir}/universal-hardware-logo-sm.webp", quality=92, method=6)
print("logo", out.size, "half", half.size)

