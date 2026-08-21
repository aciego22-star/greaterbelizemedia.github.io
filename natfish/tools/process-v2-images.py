#!/usr/bin/env python3
"""Build the V2 web derivatives from the client-supplied photography.

Two sources, kept apart on purpose:

  assets/img/official/   ten photographs supplied by Ms. Denise O'Brien. These
                         are the site's documentary authority and are used
                         unretouched apart from resizing.
  assets/img/products/   packaging photographs recreated from an older
                         low-resolution pamphlet. Not documentary evidence, so
                         they are cropped (see CROP below) and captioned
                         generically.

Each source emits WebP and JPEG at 480, 800 and 1400 px on the long edge. Tiers
above a file's native long edge are dropped rather than upscaled, so nothing is
ever enlarged past the resolution actually supplied. Metadata is stripped: the
originals carry camera and location EXIF that has no business on a public host.

Usage:
    python3 tools/process-v2-images.py <authentic-dir> <recreations-dir>
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OFFICIAL = ROOT / "assets" / "img" / "official"
PRODUCTS = ROOT / "assets" / "img" / "products"

TIERS = (480, 800, 1400)

# Ten authentic photographs, copied under their supplied names.
AUTHENTIC = [
    "01-lobster-packing-team-wide",
    "02-lobster-packing-line-portrait",
    "03-lobster-processing-room-wide",
    "04-fresh-conch-processing-closeup",
    "05-lobster-tail-packing-boxes",
    "06-lobster-tail-packing-close",
    "07-lobster-washing-station",
    "08-lobster-weighing-and-sorting",
    "09-lobster-processing-table",
    "10-cold-storage-room",
]

# Four packaging recreations. The last two supplied files (a processing room
# and a processing table) are deliberately not built: they reconstruct scenes
# that authentic photographs 03 and 08 already cover, and an authentic
# photograph should always win over a reconstruction of the same subject.
RECREATIONS = [
    "01-belizean-pride-lobster-cases",
    "02-belizean-pride-orange-lobster-tails",
    "03-belizean-pride-raw-lobster-tails",
    "04-wild-caught-frozen-conch",
]

# Fraction of the image height removed from the top before resizing.
#
# The recreated box lids carry printed text that the recreation invented: a
# "BELIZE MINISTRY OF FISHERIES / INSPECTED / LICENCE NUMBER C-122" panel on
# file 02, an "Inspected and Approved for Export Only / EST. NO." stamp on file
# 03, and a "SEAFOOD BELIZE INSPECTED" roundel with "NET WEIGHT 5 Pounds /
# 2.27kg" on file 04. A recreated regulatory licence number is a certification
# claim and the net weights are package specifications; neither was supplied as
# fact, so neither may be published. Cropping below the lid removes all of it
# and leaves a cleaner product photograph than the original framing.
#
# File 01 is not cropped: its only legible text is the client's own brand line
# "Belizean Pride / Spiny Lobster Tails". The two seals on that lid rendered as
# illegible marks carrying no number, weight or readable claim.
CROP = {
    "02-belizean-pride-orange-lobster-tails": 0.46,
    "03-belizean-pride-raw-lobster-tails": 0.52,
    "04-wild-caught-frozen-conch": 0.385,
}

# Open Graph needs one fixed-ratio landscape image. Built from the widest
# authentic photograph so social previews show real NATFISH work.
OG_SOURCE = "01-lobster-packing-team-wide"
OG_SIZE = (1200, 630)


def strip(im):
    """Return the pixels with no EXIF, ICC or other carried-over metadata."""
    clean = Image.new(im.mode, im.size)
    clean.putdata(list(im.getdata()))
    return clean


def emit(im, out_dir, stem):
    """Write every tier that does not enlarge the source. Returns the sizes."""
    out_dir.mkdir(parents=True, exist_ok=True)
    native = max(im.size)
    written = []
    for tier in TIERS:
        # Clamp rather than skip, so the largest tier always exists even when
        # the supplied file is smaller than 1400px on its long edge.
        edge = min(tier, native)
        scale = edge / native
        size = (max(1, round(im.width * scale)), max(1, round(im.height * scale)))
        if size in [s for s, _ in written]:
            continue
        resized = im.resize(size, Image.LANCZOS)
        resized.save(out_dir / f"{stem}-{tier}.webp", "WEBP", quality=82, method=6)
        resized.save(out_dir / f"{stem}-{tier}.jpg", "JPEG", quality=84,
                     optimize=True, progressive=True)
        written.append((size, tier))
    return written


def build(src_dir, names, out_dir, label):
    print(f"\n{label} -> {out_dir.relative_to(ROOT)}")
    dims = {}
    for stem in names:
        path = src_dir / f"{stem}.png"
        if not path.exists():
            raise SystemExit(f"ERROR: missing source {path}")
        im = strip(Image.open(path).convert("RGB"))

        cut = CROP.get(stem)
        if cut:
            top = round(im.height * cut)
            im = im.crop((0, top, im.width, im.height))

        written = emit(im, out_dir, stem)
        big = written[-1][0]
        dims[stem] = big
        note = f"  (top {cut:.0%} cropped)" if cut else ""
        print(f"  {stem:42s} {im.width}x{im.height} -> "
              f"{', '.join(f'{w}x{h}' for (w, h), _ in written)}{note}")
    return dims


def build_og(src_dir):
    """A 1200x630 social card, centre-cropped from the widest authentic frame."""
    im = strip(Image.open(src_dir / f"{OG_SOURCE}.png").convert("RGB"))
    target = OG_SIZE[0] / OG_SIZE[1]
    if im.width / im.height > target:
        w = round(im.height * target)
        im = im.crop(((im.width - w) // 2, 0, (im.width - w) // 2 + w, im.height))
    else:
        h = round(im.width / target)
        im = im.crop((0, (im.height - h) // 2, im.width, (im.height - h) // 2 + h))
    im = im.resize(OG_SIZE, Image.LANCZOS)
    im.save(OFFICIAL / "og-card.jpg", "JPEG", quality=86, optimize=True)
    print(f"\nog-card.jpg  {OG_SIZE[0]}x{OG_SIZE[1]} from {OG_SOURCE}")


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    authentic_dir = pathlib.Path(sys.argv[1])
    recreation_dir = pathlib.Path(sys.argv[2])

    a = build(authentic_dir, AUTHENTIC, OFFICIAL, "Authentic client photographs")
    p = build(recreation_dir, RECREATIONS, PRODUCTS, "Packaging recreations")
    build_og(authentic_dir)

    # Emitted as a Python literal so build_shell.py can import exact intrinsic
    # dimensions instead of the pages carrying guessed width/height attributes.
    lines = ["# Generated by tools/process-v2-images.py. Do not edit by hand.",
             "DIMS = {"]
    for stem, (w, h) in list(a.items()) + list(p.items()):
        lines.append(f'    "{stem}": ({w}, {h}),')
    lines.append("}")
    (ROOT / "tools" / "v2_dims.py").write_text("\n".join(lines) + "\n",
                                               encoding="utf-8")

    total = sum(f.stat().st_size for d in (OFFICIAL, PRODUCTS)
                for f in d.iterdir() if f.is_file())
    print(f"\nwrote {len(a) + len(p)} images, {total / 1024 / 1024:.2f} MB total")


if __name__ == "__main__":
    main()
