#!/usr/bin/env python3
"""Build the web derivatives for the homepage hero carousel.

Two provenances share this script, and the folder each lands in is what keeps
them apart:

CLIENT PAIRS -> assets/img/official/
    Photographs the client supplied for the hero, delivered as pre-cropped
    responsive pairs: a 2400x1080 landscape frame for the desktop hero and a
    1080x1920 portrait frame for the phone. Both crops of a pair are the same
    photograph; the client chose each crop, so neither is re-cropped here. They
    sit in official/ with the rest of the client's own photography.

CONCEPT      -> assets/img/concept/
    Illustrative sea-and-boat imagery from the original V1 concept pack. Their
    alt text follows the concept-imagery rule from the original brief and never
    asserts that a person, vessel or catch belongs to NATFISH.

Nothing is recoloured, retouched or crop-adjusted. The only operations are
downscaling to web sizes and stripping metadata.

Usage:
    python3 tools/process-hero-images.py <pairs-dir> <v1-image-pack-dir>
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONCEPT = ROOT / "assets" / "img" / "concept"
OFFICIAL = ROOT / "assets" / "img" / "official"

# A hero fills the viewport width on a phone and 60% of it on a desktop, so it
# needs a larger top tier than the in-page photography does. Tiers are widths,
# because that is what a srcset `w` descriptor means - which matters for the
# portrait crops, whose long edge is the height.
# The landscape crop is only ever served above 600px, where the frame is at
# least 600 CSS px wide, so a 480w tier would never be chosen. The portrait crop
# is the opposite - it is only served below 600px - so it starts at 360.
TIERS_DESKTOP = (800, 1400, 1920, 2400)

# The surviving concept hero is a single 1400px source with no phone crop, so
# it keeps the older three tiers - which must stay in step with HERO_TIERS in
# tools/build_shell.py, since that is what its srcset lists.
TIERS_SINGLE = (480, 800, 1400)
TIERS_MOBILE = (360, 540, 720, 1080)

# The client-supplied responsive pairs, in carousel order. Each entry is
# (published stem, desktop source, mobile source).
PAIRS = [
    ("hero-lobster-diver-dock",
     "NATFISH-lobster-diver-desktop-2400x1080",
     "NATFISH-lobster-diver-mobile-1080x1920"),
    ("hero-diver-lobster-catch",
     "NATFISH-diver-lobster-desktop",
     "NATFISH-diver-lobster-mobile"),
    ("hero-lobster-boat-catch",
     "NATFISH-lobster-boat-desktop-2400x1080",
     "NATFISH-lobster-boat-mobile-1080x1920"),
    ("hero-trade-show-stand",
     "NATFISH-trade-show-desktop-2400x1080",
     "NATFISH-trade-show-mobile-1080x1920"),
    ("hero-belizean-pride-range",
     "natfish-product-hero-desktop-1920x1080",
     "natfish-product-hero-mobile-1080x1920"),
]

# What survives from the V1 concept pack. All three of its heroes have now been
# replaced by the client's own photographs, so nothing here appears in the hero
# carousel any more. `hero-2-boat-leaving-harbour` is still built because the
# Gallery's video facade uses it as its poster; the other two were deleted
# outright when they were dropped, because the packaging step refuses to ship an
# image nothing references.
CONCEPT_HEROES = [
    ("natfish_image_10", "hero-2-boat-leaving-harbour"),
]


def strip(im):
    """Return the pixels with no EXIF, ICC or other carried-over metadata."""
    clean = Image.new(im.mode, im.size)
    clean.putdata(list(im.getdata()))
    return clean


def derive(im, stem, tiers, out):
    """Write every tier the source can actually fill.

    A tier wider than the source is skipped rather than upscaled, so a 1672px
    photograph yields no -2400 file. The tiers that were written are recorded
    and carried into the markup, because a srcset that lists a tier nobody
    generated is a 404 on the page - which is exactly what happened when the
    first sub-2400 hero arrived.

    Returns (largest size, tiers written).
    """
    written, kept = [], []
    for tier in tiers:
        width = min(tier, im.width)
        scale = width / im.width
        size = (width, round(im.height * scale))
        if size in written:
            continue
        r = im.resize(size, Image.LANCZOS)
        r.save(out / f"{stem}-{tier}.webp", "WEBP", quality=82, method=6)
        r.save(out / f"{stem}-{tier}.jpg", "JPEG", quality=84,
               optimize=True, progressive=True)
        written.append(size)
        kept.append(tier)
    print(f"  {stem:38s} {im.width}x{im.height} -> "
          f"{', '.join(f'{w}x{h}' for w, h in written)}")
    return written[-1], kept


# The client has sent hero sources as .jpg, .png and .webp across batches, so
# the extension is discovered rather than assumed.
SOURCE_EXTS = (".jpg", ".jpeg", ".png", ".webp")


def open_source(directory, name):
    for ext in SOURCE_EXTS:
        path = directory / f"{name}{ext}"
        if path.exists():
            return strip(Image.open(path).convert("RGB"))
    raise SystemExit(f"ERROR: missing source {directory / name}"
                     f" (tried {', '.join(SOURCE_EXTS)})")


def main():
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    pairs_dir = pathlib.Path(sys.argv[1])
    v1_dir = pathlib.Path(sys.argv[2])
    CONCEPT.mkdir(parents=True, exist_ok=True)
    OFFICIAL.mkdir(parents=True, exist_ok=True)

    dims, tiers = {}, {}

    def run(im, stem, tier_list, out):
        dims[stem], tiers[stem] = derive(im, stem, tier_list, out)

    print("client pairs -> official/")
    for stem, desktop_src, mobile_src in PAIRS:
        run(open_source(pairs_dir, desktop_src), f"{stem}-desktop",
            TIERS_DESKTOP, OFFICIAL)
        run(open_source(pairs_dir, mobile_src), f"{stem}-mobile",
            TIERS_MOBILE, OFFICIAL)

    print("concept -> concept/")
    for src, stem in CONCEPT_HEROES:
        run(open_source(v1_dir, src), stem, TIERS_SINGLE, CONCEPT)

    lines = ["# Generated by tools/process-hero-images.py. Do not edit by hand.",
             "HERO_DIMS = {"]
    for stem, (w, h) in dims.items():
        lines.append(f'    "{stem}": ({w}, {h}),')
    lines.append("}")
    lines.append("")
    lines.append("# The tiers actually written for each stem. A source narrower "
                 "than a tier is not")
    lines.append("# upscaled, so this is what the srcset may list.")
    lines.append("HERO_TIERS_BY_STEM = {")
    for stem, kept in tiers.items():
        lines.append(f'    "{stem}": {tuple(kept)!r},')
    lines.append("}")
    (ROOT / "tools" / "hero_dims.py").write_text("\n".join(lines) + "\n",
                                                 encoding="utf-8")
    print(f"\nwrote {len(dims)} hero image sets")


if __name__ == "__main__":
    main()
