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
  responsible.html
  news.html
  gallery.html
  contact.html
)

cp -- "${PAGES[@]}" netlify.toml "$STAGE/"
mkdir -p "$STAGE/assets"
cp -R assets/css assets/js assets/img "$STAGE/assets/"

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
