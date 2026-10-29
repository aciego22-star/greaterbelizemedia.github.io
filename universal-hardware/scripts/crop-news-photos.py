"""Crop product photos out of Universal Hardware's News / Promotions graphics.

Usage: python3 scripts/crop-news-photos.py <originals-dir> public/site-images/news

<originals-dir> holds the 1080 x 1080 uploads named below, downloaded from
https://universalhardware.bz/news/wp-content/uploads/<name>.jpg (not committed).

Only the product region is kept: every box excludes prices, dates, phone
numbers and sale text. Near-white backdrop texture is lifted to white, and
non-white flyer backgrounds get their outer margin faded to white, so the photo
sits on the site's white plates. The product itself is not retouched.
"""
import sys
from PIL import Image

CROPS = {
    'makita-drill-kit': ('HP333DYX3B', (0, 362, 638, 958)),
    'knova-table-saws': ('FF-Sale-Saws', (20, 385, 650, 790)),
    'lincoln-welders': ('Mega-Sale-i9-Lincoln', (90, 440, 600, 905)),
    'hoteche-air-compressors': ('Mega-Sale-H-Air-Compressors', (110, 445, 670, 910)),
    'hoteche-socket-set': ('EXPO-2026-Hoteche', (170, 415, 540, 835)),
    'cub-cadet-zero-turn': ('FF-Sale-Cub-Cadet-4', (55, 365, 645, 790)),
    'hunter-ceiling-fans': ('FF-Sale-Hunter-4', (100, 380, 690, 820)),
    'sankey-refrigerators': ('FF-Sale-Sankey-Refrigerators', (120, 490, 650, 760)),
    'gaucho-barbed-wire': ('EXPO-2026-Wire', (125, 445, 565, 845)),
    'makita-clinic': ('MakitaClinic-feb2026', (0, 0, 1080, 410)),
}

src, out = sys.argv[1], sys.argv[2]
for key, (name, box) in CROPS.items():
    im = Image.open(f'{src}/{name}.jpg').convert('RGB').crop(box)
    w, h = im.size; px = im.load()
    edge = [px[x, 0] for x in range(w)] + [px[x, h - 1] for x in range(w)] + [px[0, y] for y in range(h)] + [px[w - 1, y] for y in range(h)]
    lum = sum(sum(c) / 3 for c in edge) / len(edge)
    faded = False
    if key != 'makita-clinic' and lum < 246:
        F = max(12, round(0.12 * min(w, h)))
        mask = Image.new('L', (w, h)); m = mask.load()
        for y in range(h):
            for x in range(w):
                d = min(x, y, w - 1 - x, h - 1 - y) / F
                t = 1.0 if d >= 1 else d * d * (3 - 2 * d)
                m[x, y] = int(255 * t)
        im = Image.composite(im, Image.new('RGB', (w, h), (255, 255, 255)), mask)
        faded = True
    if key != 'makita-clinic':
        # Lift near-white, colourless backdrop texture to pure white (products are untouched).
        px = im.load()
        for y in range(h):
            for x in range(w):
                r, g, b = px[x, y]; L = (r + g + b) / 3
                if L > 232 and max(r, g, b) - min(r, g, b) < 18:
                    t = min(1.0, (L - 232) / 16); t = t * t * (3 - 2 * t)
                    px[x, y] = tuple(round(c + (255 - c) * t) for c in (r, g, b))
    im.save(f'{out}/{key}.jpg', quality=88, optimize=True, progressive=True)
    im.save(f'{out}/{key}.webp', quality=82, method=6)
    print(f'{key:18s} {w}x{h} edge-lum {lum:5.1f} {"faded" if faded else "as cropped"}')
