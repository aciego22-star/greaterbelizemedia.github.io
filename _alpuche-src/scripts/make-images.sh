#!/usr/bin/env bash
# Builds web derivatives from the supplied originals (not committed: the
# courthouse and Macal River originals are 9 MB and 3 MB).
# Usage: scripts/make-images.sh /path/to/extracted/handoff/assets
set -euo pipefail
SRC="${1:?path to handoff assets/ folder}"
OUT="$(cd "$(dirname "$0")/.." && pwd)/static/img"
mkdir -p "$OUT"
q=80

# Firm assets: crop only the blank capture margins listed in DESIGN-DIRECTION.md.
# José: photographed area x0-710, y235-1301 (keeps the Knight & Day credit intact).
convert "$SRC/brand/jose-m-alpuche.jpeg" -crop 710x1066+0+235 +repage -strip "$OUT/jose-710.jpg"
for w in 480 710; do
  convert "$OUT/jose-710.jpg" -resize ${w}x -strip -quality $q "$OUT/jose-$w.jpg"
  convert "$OUT/jose-710.jpg" -resize ${w}x -strip -quality $q "$OUT/jose-$w.webp"
done
# Janine: x38-1022, y76-807
convert "$SRC/brand/janine-ebanks-alpuche.jpeg" -crop 984x731+38+76 +repage -strip "$OUT/janine-984.jpg"
for w in 640 984; do
  convert "$OUT/janine-984.jpg" -resize ${w}x -strip -quality $q "$OUT/janine-$w.jpg"
  convert "$OUT/janine-984.jpg" -resize ${w}x -strip -quality $q "$OUT/janine-$w.webp"
done
# JMA mark: x14-527, y19-424 (black artwork only, unaltered)
convert "$SRC/brand/jma-monogram.jpeg" -crop 513x405+14+19 +repage -strip -quality 90 "$OUT/jma-mark.jpg"
convert "$OUT/jma-mark.jpg" -resize 160x -strip -quality 90 "$OUT/jma-mark-160.jpg"

# Firm nameplate (supplied by the agency, 13 Nov 2026): backgrounds for the Practice Areas,
# Our Team, What to Expect and Contact page heads. Desktop PNG has a transparent background and is
# flattened onto the site ink; the mobile JPEG's outer white is flood-filled with ink from the corners.
if [ -f "$SRC/brand/nameplate-desktop.png" ]; then
  convert "$SRC/brand/nameplate-desktop.png" -background '#11171b' -flatten -strip "$OUT/plaque-desktop-src.png"
  for w in 1024 1600; do
    convert "$OUT/plaque-desktop-src.png" -resize ${w}x -strip -interlace Plane -quality $q "$OUT/plaque-desktop-$w.jpg"
    convert "$OUT/plaque-desktop-src.png" -resize ${w}x -strip -quality $q "$OUT/plaque-desktop-$w.webp"
  done
  rm "$OUT/plaque-desktop-src.png"
fi
if [ -f "$SRC/brand/nameplate-mobile.jpg" ]; then
  convert "$SRC/brand/nameplate-mobile.jpg" -fuzz 12% -fill '#11171b' -draw 'color 0,0 floodfill' -draw 'color 940,0 floodfill' \
    -draw 'color 0,1671 floodfill' -draw 'color 940,1671 floodfill' -strip "$OUT/plaque-mobile-src.png"
  for w in 640 940; do
    convert "$OUT/plaque-mobile-src.png" -resize ${w}x -strip -interlace Plane -quality $q "$OUT/plaque-mobile-$w.jpg"
    convert "$OUT/plaque-mobile-src.png" -resize ${w}x -strip -quality $q "$OUT/plaque-mobile-$w.webp"
  done
  rm "$OUT/plaque-mobile-src.png"
fi

# Belize photography: resized only (no crop or tonal change in the files).
for name in belize-city-harbour belize-city-courthouse macal-river-san-ignacio placencia-beach baron-bliss-lighthouse; do
  f="$SRC/belize/$name.jpg"
  ow=$(identify -format %w "$f")
  for w in 640 1024 1600; do
    [ "$w" -gt "$ow" ] && w=$ow
    convert "$f" -resize ${w}x -strip -interlace Plane -quality $q "$OUT/$name-$w.jpg"
    convert "$f" -resize ${w}x -strip -quality $q "$OUT/$name-$w.webp"
  done
  # 1200x630 social card crop
  convert "$f" -resize 1200x630^ -gravity center -extent 1200x630 -strip -quality 82 "$OUT/og-$name.jpg"
done
