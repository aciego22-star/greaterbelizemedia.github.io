#!/usr/bin/env python3
"""
Regenerate the inline QR markup for Taco Taco Connect.

    pip install segno
    python3 tools/make-qr.py

Writes assets/qr.svg (standalone) and assets/qr-path.txt (the single <path>
"d" attribute that is pasted inline into index.html / print.html so the page
ships zero extra network requests).

Encoded payload is deliberately a permanent URL -- printed cards outlive
deploys, so this value must never change once cards are in the wild.
"""
import pathlib
import segno

URL = "https://connect.tacotaco.bz/"
# Level H tolerates ~30% damage, which is what lets the small centre emblem
# sit on top of the code without hurting real-world scans.
ECC = "h"
QUIET = 4  # modules of quiet zone, the spec minimum

root = pathlib.Path(__file__).resolve().parent.parent
qr = segno.make(URL, error=ECC, micro=False)
matrix = [[bool(m) for m in row] for row in qr.matrix]
size = len(matrix)

# Merge each row's dark modules into horizontal runs so the path data stays small.
runs = []
for y, row in enumerate(matrix):
    x = 0
    while x < size:
        if row[x]:
            start = x
            while x < size and row[x]:
                x += 1
            runs.append((start, y, x - start))
        else:
            x += 1

d = "".join(f"M{x} {y}h{w}v1h-{w}z" for x, y, w in runs)
total = size + QUIET * 2
view = f"{-QUIET} {-QUIET} {total} {total}"

(root / "assets" / "qr-path.txt").write_text(
    f"viewBox: {view}\nmodules: {size}\nversion: {qr.version}  ecc: {ECC.upper()}\n"
    f"payload: {URL}\n\nd=\"{d}\"\n",
    encoding="utf-8",
)

svg = (
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" '
    f'shape-rendering="crispEdges" role="img" aria-label="QR code linking to {URL}">'
    f'<rect x="{-QUIET}" y="{-QUIET}" width="{total}" height="{total}" fill="#ffffff"/>'
    f'<path d="{d}" fill="#000000"/></svg>'
)
(root / "assets" / "qr.svg").write_text(svg, encoding="utf-8")

print(f"version {qr.version} / ECC {ECC.upper()} / {size}x{size} modules")
print(f"path data: {len(d)} bytes, {len(runs)} runs")
print(f"viewBox: {view}")
