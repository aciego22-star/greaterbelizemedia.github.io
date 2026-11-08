"""Make a lighter copy of a published PDF for the single-file preview.

    python3 build/doc-preview.py

The deployed site and the ZIP always serve ICB's own file, byte for byte.
This only produces the rendition the single-file preview inlines, the same
arrangement the branch photographs, the campaign films and the What's New
heroes already use.

ICB's Hurricane Guide is a four-page Publisher export at just under four
megabytes. Base64 adds a third again, which on its own would put the
preview past the sixteen megabyte ceiling a single file has to live under.
Rasterising the four pages at screen resolution keeps every word legible
on a laptop while costing a fraction of the bytes. Nobody prints from the
preview; the download button in the real site hands over ICB's original.
"""
import os, subprocess, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "build", "preview", "docs")

# published file -> dots per inch to rasterise at
JOBS = [("icb-hurricane-guide.pdf", 80)]

os.makedirs(OUT, exist_ok=True)
for name, dpi in JOBS:
    src = os.path.join(ROOT, "assets", "docs", name)
    if not os.path.exists(src):
        print("%-30s skipped, not in assets/docs" % name)
        continue
    stem = os.path.join(OUT, name[:-4])
    subprocess.run(["pdftoppm", "-jpeg", "-r", str(dpi), src, stem], check=True)

    pages = sorted(p for p in os.listdir(OUT)
                   if p.startswith(os.path.basename(stem) + "-") and p.endswith(".jpg"))
    if not pages:
        print("%-30s skipped, nothing rendered" % name)
        continue
    ims = [Image.open(os.path.join(OUT, p)).convert("RGB") for p in pages]
    dest = os.path.join(OUT, name)
    ims[0].save(dest, "PDF", save_all=True, append_images=ims[1:],
                resolution=dpi, quality=42, optimize=True)
    for p in pages:
        os.remove(os.path.join(OUT, p))

    print("%-30s %d pages  %6.1f KB  (was %6.1f KB)"
          % (name, len(ims), os.path.getsize(dest) / 1024,
             os.path.getsize(src) / 1024))
