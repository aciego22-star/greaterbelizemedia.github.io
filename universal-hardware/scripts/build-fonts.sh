#!/usr/bin/env bash
# Rebuilds the self-hosted fonts as trimmed variable fonts (requires: pip install fonttools brotli).
# Keeps only the axis ranges and characters the design uses (Latin + Latin-1, incl. Spanish accents).
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
UNI="U+0020-007E,U+00A0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+2192,U+00B7,U+00AE,U+2122"
python3 -m fontTools.varLib.instancer node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2 wdth=100:112 wght=600:800 -o "$tmp/archivo.ttf"
python3 -m fontTools.varLib.instancer node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2 wght=400:700 -o "$tmp/inter.ttf"
python3 -m fontTools.subset "$tmp/archivo.ttf" --unicodes="$UNI" --layout-features='kern,liga,calt,ss01,cv11' --flavor=woff2 --output-file=public/fonts/archivo-var.woff2
python3 -m fontTools.subset "$tmp/inter.ttf" --unicodes="$UNI" --layout-features='kern,liga,calt,ss01,cv11,tnum' --flavor=woff2 --output-file=public/fonts/inter-var.woff2
cp node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2 public/fonts/jetbrains-mono-500.woff2
ls -la public/fonts/*.woff2
