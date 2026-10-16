#!/usr/bin/env python3
"""Build the web derivatives for the two Miami 2026 hero slides.

Separate from tools/process-hero-images.py on purpose. That script rebuilds
all five of the original carousel slides from a delivery folder that is not in
this repository, so running it to add a slide would silently drop the four
that are already live. This one touches only the two stems it names, which is
the same rule the news, About and Miami gallery processors follow.

PROVENANCE AND CROPPING

The client supplied both photographs as landscape frames only, 1672x941. The
hero needs two crops: a landscape frame for the desktop layout and a portrait
frame for the phone, where the media box is 9:16. So unlike the five pairs the
client cropped themselves, the phone crop here had to be cut from what was
supplied, and the two slides needed different answers:

  hero-miami-delegation
      Four people standing side by side span about two thirds of the
      landscape frame's width. A 9:16 window is 529px of 1672, so no crop of
      it holds all four - two of the delegates fall outside whichever window
      is chosen. The client's own portrait photograph of the same group, in
      the same clothes on the same street corner, is already in this
      repository as the gallery's 08_delegation_in_miami.jpg, so the phone
      crop is cut from that instead. Both crops are the client's own
      photography of one moment, which is what art direction is meant to be.

  hero-miami-representative-sailboat
      No portrait counterpart exists, so the phone crop is a 9:16 window cut
      from the supplied landscape, placed to hold the full cap, the face in
      profile and the co-operative crest on the chest. The cap and face
      occupy x 230..780 of the frame and the model sailboat x 950..1550, so
      holding both would take a window about 1300px wide. The boat and its
      two Belize flags stay in the desktop crop, where they read clearly.

Both phone crops are ours, not the client's. If they send their own 1080x1920
crops, drop them in and the tiers below will do the rest.

Nothing is recoloured, retouched or sharpened. The only operations are
cropping to the frame, downscaling and stripping metadata.

Usage:
    python3 tools/process-miami-heroes.py source-images/hero-miami-2026
"""
import pathlib
import sys

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
OFFICIAL = ROOT / "assets" / "img" / "official"

# The gallery master the delegation phone crop is cut from. It is in this
# repository, so it is addressed from ROOT rather than from the argument.
GALLERY_MASTER = (ROOT / "source-images" / "miami-2026"
                  / "08_delegation_in_miami.jpg")

PHONE_RATIO = 9 / 16

# A hero fills 60vw of a desktop and the full width of a phone, so it wants a
# larger top tier than in-page photography does. A tier wider than the source
# is dropped rather than upscaled, and the source's own width is always kept
# as the last tier so the srcset never has to round a real file up to a
# standard number it is not.
DESKTOP_TIERS = (800, 1400, 1920, 2400)
MOBILE_TIERS = (360, 540, 720, 1080)
WEBP_QUALITY = 82

# stem -> (desktop source, phone source, phone crop box or None)
#
# A crop box is (left, upper, right, lower) in the phone source's own pixels.
# Both are 9:16 windows, chosen by eye against the rendered frame:
#   delegation      265..1165 of 1200. The four of them span 271..1142, so at
#                   9:16 this is very nearly the only window there is: 900 is
#                   the widest a 1600px-tall source can give, and it leaves
#                   about 10px of air on the left and 20px on the right. The
#                   pavement in the lower half comes with it. Taking the
#                   height down to crop the pavement out would take the width
#                   down with it and start cutting the people at the ends,
#                   so the foreground stays.
#   sailboat        240..769 of 1672 - the whole cap, the face in profile and
#                   the co-operative crest on the chest, which is the right
#                   edge of the window and the reason it is not further left.
HEROES = {
    "hero-miami-delegation": (
        "delegation-miami-beach.png",
        GALLERY_MASTER,
        (265, 0, 1165, 1600),
    ),
    "hero-miami-representative-sailboat": (
        "representative-sailboat.png",
        "representative-sailboat.png",
        (240, 0, 769, 941),
    ),
}


def load(path):
    """The pixels, in RGB, with no EXIF, ICC or other carried-over metadata."""
    im = Image.open(path)
    if im.mode != "RGB":
        im = im.convert("RGB")
    clean = Image.new("RGB", im.size)
    clean.paste(im)
    return clean


def tiers_for(width, candidates):
    """Every candidate the source can fill, plus the source's own width."""
    kept = [t for t in candidates if t < width]
    return tuple(kept + [width])


def derive(im, stem, candidates):
    written = []
    for w in tiers_for(im.width, candidates):
        h = round(im.height * w / im.width)
        resized = im if w == im.width else im.resize((w, h), Image.LANCZOS)
        resized.save(OFFICIAL / f"{stem}-{w}.webp", "WEBP",
                     quality=WEBP_QUALITY, method=6)
        written.append(w)
    print(f"  {stem:48s} {im.width}x{im.height} -> {written}")
    return im.size, tuple(written)


def main():
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    src = pathlib.Path(sys.argv[1])
    OFFICIAL.mkdir(parents=True, exist_ok=True)

    dims, tiers = {}, {}
    for stem, (desk_name, phone_name, box) in HEROES.items():
        desk_path = src / desk_name
        phone_path = (phone_name if isinstance(phone_name, pathlib.Path)
                      else src / phone_name)
        for p in (desk_path, phone_path):
            if not p.is_file():
                raise SystemExit(f"ERROR: missing source {p}")

        desk = load(desk_path)
        dims[f"{stem}-desktop"], tiers[f"{stem}-desktop"] = derive(
            desk, f"{stem}-desktop", DESKTOP_TIERS)

        phone = load(phone_path).crop(box)
        got = phone.width / phone.height
        if abs(got - PHONE_RATIO) > 0.005:
            raise SystemExit(
                f"ERROR: {stem} phone crop is {phone.width}x{phone.height} "
                f"({got:.4f}), which is not the 9:16 the phone frame is")
        dims[f"{stem}-mobile"], tiers[f"{stem}-mobile"] = derive(
            phone, f"{stem}-mobile", MOBILE_TIERS)

    out = ROOT / "tools" / "miami_hero_dims.py"
    lines = ["# Generated by tools/process-miami-heroes.py. Do not edit by hand.",
             "MIAMI_HERO_DIMS = {"]
    lines += [f'    "{k}": {v},' for k, v in dims.items()]
    lines += ["}", "", "MIAMI_HERO_TIERS = {"]
    lines += [f'    "{k}": {v},' for k, v in tiers.items()]
    lines += ["}", ""]
    out.write_text("\n".join(lines))
    print(f"\nwrote {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
