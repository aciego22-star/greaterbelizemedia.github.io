#!/usr/bin/env python3
"""Prepare the NATFISH V1 image set from the supplied source pack.

1. Crop image 2 to the facade band, dropping the fabricated phone number,
   opening hours and species list below it. See INTERNAL-NOTES.md section 4.
2. Emit 800w and 1400w WebP + JPEG variants for every image.

Point SRC at the unpacked Natfish_V1_Image_Pack_Complete.zip, then run:
    python3 tools/process-images.py
"""
import pathlib
from PIL import Image

SRC = pathlib.Path("./source-images")
OUT = pathlib.Path("./assets/img")
OUT.mkdir(parents=True, exist_ok=True)

WIDTHS = [800, 1400]

# natfish_image_02.jpg carries three blocks of fabricated data: a phone number
# that contradicts the verified 227-3165, fixed opening hours, and a five-species
# catch list. All three sit below y=335 in the 1400x787 source. Cropping to the
# facade band drops them by framing, which looks intentional, where blurring them
# in place reads as redaction. The legal-name lettering above the cut is true and
# is what makes the shot worth using.
REF_H = 787
FACADE_CUT = 335


def retouch_storefront(src_path):
    im = Image.open(src_path).convert("RGB")
    cut = round(FACADE_CUT * im.height / REF_H)
    return im.crop((0, 0, im.width, cut))


def emit_variants(im, stem):
    for w in WIDTHS:
        if im.width < w:
            resized = im
        else:
            h = round(im.height * w / im.width)
            resized = im.resize((w, h), Image.LANCZOS)
        resized.save(OUT / f"{stem}-{w}.webp", "WEBP", quality=82, method=6)
        resized.save(OUT / f"{stem}-{w}.jpg", "JPEG", quality=80,
                     optimize=True, progressive=True)


def main():
    for f in OUT.glob("*"):
        f.unlink()

    # Image 2 is cropped to the facade band; its full frame is never deployed.
    retouched = retouch_storefront(SRC / "natfish_image_02.jpg")

    for path in sorted(SRC.glob("natfish_image_*.jpg")):
        stem = path.stem.replace("natfish_image_", "img")
        im = retouched if path.name == "natfish_image_02.jpg" else Image.open(path).convert("RGB")
        emit_variants(im, stem)
        print(f"{path.name} -> {stem}-{{800,1400}}.{{webp,jpg}}  {im.size}")

    total = sum(f.stat().st_size for f in OUT.iterdir())
    print(f"\n{len(list(OUT.iterdir()))} files, {total/1024:.0f} KB total")


if __name__ == "__main__":
    main()
