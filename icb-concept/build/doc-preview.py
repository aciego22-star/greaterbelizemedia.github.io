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

# Each job: the folder under assets/, the folder under build/preview/,
# the file, the dots per inch, and the title a browser tab should show.
#
# ICB's nine English claim forms were added on 23 Nov 2026, when the
# nine Spanish forms arrived beside them and the preview went past its
# ceiling. The arithmetic: the Spanish forms are lean, 536KB of text
# and two font weights, and the English ones are 1.6MB of scans and
# spreadsheet exports. Rasterising ICB's nine at screen resolution
# costs nothing anybody can see on a laptop and buys back the room.
#
# The deployed site and the ZIP always serve ICB's own file, untouched.
# The title is carried over deliberately: ICB's review of 4 Nov asked
# for these PDFs to stop showing a filename in the browser tab, and a
# rendition that lost it again would reintroduce the complaint in the
# one artifact ICB actually opens.
JOBS = (
    [("docs", "docs", "icb-hurricane-guide.pdf", 80, None)] +
    [("forms", "forms", f, 96, t) for f, t in [
        ("icb-insured-motor-accident-report-form.pdf", "ICB Insured Motor Accident Report Form"),
        ("icb-claimant-motor-accident-report-form.pdf", "ICB Claimant Motor Accident Report Form"),
        ("icb-property-claim-form.pdf", "ICB Property Claim Form"),
        ("icb-property-catastrophe-claim-form.pdf", "ICB Property Catastrophe Claim Form"),
        ("icb-marine-claimant-form.pdf", "ICB Marine Claimant Form"),
        ("icb-inland-cargo-claim-form.pdf", "ICB Inland Cargo Claim Form"),
        ("icb-personal-accident-claim-form.pdf", "ICB Personal Accident Claim Form"),
        ("icb-public-liability-claim-form.pdf", "ICB Public Liability Claim Form"),
        ("icb-windscreen-claim-form.pdf", "ICB Windscreen Claim Form"),
    ]]
)

for srcdir, outdir, name, dpi, title in JOBS:
    OUT = os.path.join(ROOT, "build", "preview", outdir)
    os.makedirs(OUT, exist_ok=True)
    src = os.path.join(ROOT, "assets", srcdir, name)
    if not os.path.exists(src):
        print("%-46s skipped, not in assets/%s" % (name, srcdir))
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
    extra = {"title": title} if title else {}
    ims[0].save(dest, "PDF", save_all=True, append_images=ims[1:],
                resolution=dpi, quality=42, optimize=True, **extra)
    for p in pages:
        os.remove(os.path.join(OUT, p))

    # Rasterising only helps a PDF that is already pictures. Four of
    # ICB's nine forms are scans or spreadsheet exports and halve; the
    # other five are text, and turning text into a JPEG of text made
    # them two and three times bigger. So the rendition is kept only
    # when it beats the original, and the build falls back to ICB's own
    # file for the rest, which is the better file anyway.
    before, after = os.path.getsize(src), os.path.getsize(dest)
    if after >= before:
        os.remove(dest)
        print("%-46s %d pages  %6.1f KB  dropped, ICB's own file is smaller (%6.1f KB)"
              % (name, len(ims), after / 1024, before / 1024))
        continue

    print("%-46s %d pages  %6.1f KB  (was %6.1f KB)"
          % (name, len(ims), after / 1024, before / 1024))
