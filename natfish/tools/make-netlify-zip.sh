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
  insights.html
  insights-belizean-caribbean-spiny-lobster.html
)

# Root-level files the site serves directly: the favicon set, the manifest and
# the two files search engines look for. Listed rather than globbed for the
# same reason PAGES is - so a missing one is an error, not a silent gap.
ROOTFILES=(
  favicon.ico
  favicon-16x16.png
  favicon-32x32.png
  apple-touch-icon.png
  android-chrome-192x192.png
  android-chrome-512x512.png
  site.webmanifest
  robots.txt
  sitemap.xml
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

for f in "${ROOTFILES[@]}"; do
  [ -f "$f" ] || { echo "ERROR: missing $f - run tools/build_site_files.py and tools/make-favicons.py" >&2; exit 1; }
done

cp -- "${PAGES[@]}" "${ROOTFILES[@]}" netlify.toml "$STAGE/"
mkdir -p "$STAGE/assets"
cp -R assets/css assets/js assets/img assets/fonts "$STAGE/assets/"

# The approved logo master is the source the display sizes are generated from,
# not something any page loads. It stays in the repository and out of the
# deployment package, which should carry only what the site actually requests.
rm -f "$STAGE/assets/img/natfish-logo-approved-final.png"

# The package carries only what the site actually requests. Anything under
# assets/img that no page or stylesheet names is dropped here rather than
# merely warned about, so a generator that writes a wider tier ladder than the
# markup uses cannot quietly add megabytes to a deployment.
#
# JPEGs are included in the sweep. They were not, once, and the hero's
# fallback ladder went on shipping 2400w JPEGs for two megabytes after the
# markup had stopped naming them.
dropped=0
freed=0
for f in "$STAGE"/assets/img/*.png "$STAGE"/assets/img/*/*.webp \
         "$STAGE"/assets/img/*/*.jpg "$STAGE"/assets/img/*/*.png; do
  [ -e "$f" ] || continue
  name="${f#"$STAGE"/}"
  if ! grep -qF "$name" "$STAGE"/*.html "$STAGE"/assets/css/*.css 2>/dev/null; then
    freed=$((freed + $(stat -c%s "$f")))
    rm -f "$f"
    dropped=$((dropped + 1))
  fi
done
if [ "$dropped" -eq 0 ]; then
  echo "OK: every packaged image is referenced"
else
  echo "OK: dropped $dropped unreferenced image(s), $((freed / 1024)) KB"
fi

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

# Cache-busting hashes must match the bytes actually being shipped.
#
# The stylesheet and scripts are served immutable for a year, so the ?v= hash
# in the HTML is the ONLY thing that tells a returning browser to fetch a new
# copy. The hashes are stamped when build_pages.py runs, so editing a
# stylesheet afterwards and packaging without re-running it would ship an
# update that no returning visitor ever sees. That failure is silent in
# testing - a fresh browser looks perfect - so it is checked here.
bad=0
for f in "$STAGE"/assets/css/*.css "$STAGE"/assets/js/*.js; do
  [ -e "$f" ] || continue
  name="${f#"$STAGE"/}"
  # Only assets the pages actually link with a hash are checked.
  want=$(sha256sum "$f" | cut -c1-8)
  got=$(grep -ho "$(basename "$name")?v=[a-f0-9]\{8\}" "$STAGE"/*.html 2>/dev/null | head -1 | cut -d= -f2)
  [ -z "$got" ] && continue
  if [ "$got" != "$want" ]; then
    echo "ERROR: $name ships hash $got but its content hashes to $want." >&2
    echo "       Re-run 'python3 tools/build_pages.py' after editing assets." >&2
    bad=$((bad + 1))
  fi
done
if [ "$bad" -ne 0 ]; then
  exit 1
fi
echo "OK: every cache-busting hash matches the file it points at"

# Say out loud whether this package is indexable. The noindex header that kept
# the temporary Netlify subdomain out of search results was removed when the
# site went live, and the failure mode if it ever comes back is silent: the
# site deploys, looks perfect, and is invisible to Google.
if grep -q "X-Robots-Tag" netlify.toml; then
  echo "NOTE: netlify.toml carries an X-Robots-Tag. This package is NOT indexable." >&2
  grep -n "X-Robots-Tag" netlify.toml >&2
else
  echo "OK: no X-Robots-Tag - this package is indexable"
fi

# The pages themselves must never carry a noindex either.
if grep -qil "noindex" "$STAGE"/*.html; then
  echo "ERROR: a page carries a noindex robots meta tag" >&2
  exit 1
fi
echo "OK: no page carries a noindex meta tag"
