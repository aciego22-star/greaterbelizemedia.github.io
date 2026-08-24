#!/usr/bin/env bash
# Package the NATFISH site for Netlify drag-and-drop deployment.
#
# The site sits at the ZIP ROOT so index.html is what Netlify serves. Internal
# material and build scripts are deliberately left out: INTERNAL-NOTES.md holds
# unconfirmed client details and must never reach a public host.
#
# Run from the natfish/ folder:
#     bash tools/make-netlify-zip.sh
#
# Output: natfish-netlify.zip

set -euo pipefail

cd "$(dirname "$0")/.."

OUT="natfish-netlify.zip"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

# Named explicitly rather than globbed: a *.html glob also sweeps in the
# single-file artifact bundle, which is a 1.7 MB duplicate of the whole site.
PAGES=(
  index.html
  about.html
  seafood-services.html
  seafood-seasons.html
  responsible.html
  news.html
  gallery.html
  natfish-ai.html
  contact.html
)

# Every page in the folder must be listed above, or a new page silently
# ships missing. This caught seafood-seasons.html once already.
for f in *.html; do
  case " ${PAGES[*]} " in
    *" $f "*) ;;
    *) [ "$f" = "natfish-preview.html" ] || {
         echo "ERROR: $f exists but is not in PAGES" >&2; exit 1; } ;;
  esac
done

cp -- "${PAGES[@]}" netlify.toml "$STAGE/"
mkdir -p "$STAGE/assets"
cp -R assets/css assets/js assets/img assets/fonts "$STAGE/assets/"

# The approved logo master is the source the display sizes are generated from,
# not something any page loads. It stays in the repository and out of the
# deployment package, which should carry only what the site actually requests.
rm -f "$STAGE/assets/img/natfish-logo-approved-final.png"

rm -f "$OUT"
( cd "$STAGE" && zip -qr -X "$OLDPWD/$OUT" . )

echo "$OUT"
unzip -l "$OUT" | tail -n 3

# Fail loudly rather than ship internal material by accident.
if unzip -l "$OUT" | grep -qiE 'INTERNAL-NOTES|tools/|natfish-preview'; then
  echo "ERROR: internal or build-only files leaked into the zip" >&2
  exit 1
fi
echo "OK: no internal files in the package"

# The superseded logo lockups must never reappear in a deployment package.
if unzip -l "$OUT" | grep -qE 'natfish-logo-mark|natfish-logo\.png|natfish-logo@2x|natfish-logo-approved-final'; then
  echo "ERROR: a superseded or source-only logo asset is in the zip" >&2
  exit 1
fi
echo "OK: only the approved logo derivatives are packaged"

# Every image in the package must be referenced by a page, so no stale asset
# rides along unnoticed.
stale=0
for f in "$STAGE"/assets/img/*.png "$STAGE"/assets/img/*/*.webp; do
  [ -e "$f" ] || continue
  name="${f#"$STAGE"/}"
  if ! grep -qF "$name" "$STAGE"/*.html "$STAGE"/assets/css/*.css 2>/dev/null; then
    echo "WARNING: $name is packaged but referenced by nothing" >&2
    stale=$((stale + 1))
  fi
done
[ "$stale" -eq 0 ] && echo "OK: every packaged image is referenced"
