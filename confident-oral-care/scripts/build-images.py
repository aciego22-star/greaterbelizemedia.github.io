"""Generate web derivatives from the supplied originals.

The originals in public/img/original are kept untouched. Run from the project root:

    python3 scripts/build-images.py

Requires Pillow (pip install Pillow).
"""
from pathlib import Path

from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "img" / "original"
OUT = ROOT / "public" / "img" / "web"

# name -> widths to generate (the original width is always included)
PHOTOS = {
    "reception-desktop": [768, 1200],
    "reception-mobile": [480, 720],
    "opening-desktop": [768, 1200],
    "opening-mobile": [480, 720],
    "treatment-desktop": [768, 1200],
    "treatment-mobile": [480, 720],
    "team-celebration": [640],
    "reception-team": [640],
    "waiting-area": [640],
}


def save_photo(img: Image.Image, name: str, width: int) -> None:
    if width < img.width:
        height = round(img.height * width / img.width)
        img = img.resize((width, height), Image.LANCZOS)
    img.save(OUT / f"{name}-{width}.webp", "WEBP", quality=78, method=6)
    img.save(OUT / f"{name}-{width}.jpg", "JPEG", quality=80, optimize=True, progressive=True)


def build_photos() -> None:
    for name, widths in PHOTOS.items():
        img = Image.open(SRC / f"{name}.jpg").convert("RGB")
        for width in sorted(set(widths + [img.width])):
            save_photo(img, name, width)


def build_logo() -> None:
    """Crop the wordmark, flatten the paper texture to white, then turn white into alpha."""
    img = Image.open(SRC / "confident-logo.jpg").convert("RGB")
    crop = img.crop((320, 235, 980, 495))

    # Estimate the background (letters removed with a max filter, then blurred) and divide it out.
    background = crop.filter(ImageFilter.MaxFilter(41)).filter(ImageFilter.GaussianBlur(25))
    flat = Image.new("RGB", crop.size)
    src_px, bg_px, out_px = crop.load(), background.load(), flat.load()
    for y in range(crop.height):
        for x in range(crop.width):
            out_px[x, y] = tuple(
                min(255, round(c / max(b, 1) * 255 / 0.96)) for c, b in zip(src_px[x, y], bg_px[x, y])
            )

    # "Colour to alpha" against white: keeps the gold and its soft shadow on any light field.
    rgba = Image.new("RGBA", crop.size)
    rgba_px = rgba.load()
    for y in range(flat.height):
        for x in range(flat.width):
            r, g, b = out_px[x, y]
            alpha = (255 - min(r, g, b)) / 255
            if alpha < 0.04:
                rgba_px[x, y] = (255, 255, 255, 0)
                continue
            un = [round(min(255, max(0, (c - (1 - alpha) * 255) / alpha))) for c in (r, g, b)]
            rgba_px[x, y] = (*un, round(alpha * 255))

    bbox = rgba.getbbox()
    rgba = rgba.crop(bbox)
    rgba.save(OUT / "confident-logo.png", "PNG", optimize=True)
    for width in (240, 480):
        height = round(rgba.height * width / rgba.width)
        small = rgba.resize((width, height), Image.LANCZOS)
        small.save(OUT / f"confident-logo-{width}.webp", "WEBP", quality=90, method=6)
        small.save(OUT / f"confident-logo-{width}.png", "PNG", optimize=True)

    # Social preview image from the reception photo.
    og = Image.open(SRC / "reception-desktop.jpg").convert("RGB").resize((1200, 675), Image.LANCZOS)
    og.save(OUT / "og-reception.jpg", "JPEG", quality=80, optimize=True)


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    build_photos()
    build_logo()
    for f in sorted(OUT.iterdir()):
        print(f.name, f.stat().st_size)
