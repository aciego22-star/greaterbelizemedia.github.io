#!/usr/bin/env node
/* ============================================================================
   Single-file build.
   Inlines every local stylesheet and script referenced by index.html into
   one self-contained HTML file at dist/icb-concept.html. Used for preview
   surfaces that require a single document; the plain folder remains the
   deployable site (drag-drop it into any static host).
   Zero dependencies. Run: node build/build-single.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

function inline(source) {
  let out = source.replace(
    /<link rel="stylesheet" href="([^"]+)">/g,
    (m, href) => {
      const css = fs.readFileSync(path.join(root, href), "utf8");
      return "<style>\n" + css + "\n</style>";
    }
  );
  out = out.replace(
    /<script src="([^"]+)"><\/script>/g,
    (m, src) => {
      const js = fs.readFileSync(path.join(root, src), "utf8")
        .replace(/<\/script/gi, "<\\/script");
      return "<script>\n" + js + "\n</script>";
    }
  );
  return out;
}

let result = inline(html);

/* Assets become one ICB.ASSETS map of data URIs rather than being pasted
   into every reference. Two reasons:

   1. Size. The English film is used twice (hero slide and film card), and
      the logo three times. Substituting inline stored each copy again;
      the map stores every asset exactly once.
   2. Speed. Views emit data-asset="assets/..." and ICB.hydrateAssets
      assigns the URL as a property after the markup is in the DOM. With
      inline substitution, every navigation to the homepage handed the
      HTML parser about ten megabytes of base64, which is what made the
      preview feel slow to click through.

   Video is the one place the preview and the deployed site differ:
   assets/video holds the site encodes (1280x720), and base64 adds a third
   again to every byte against a 16MB single-document cap, so a lighter
   encode from build/preview is substituted when present. The deployed
   folder and ZIP always ship the full-quality files. */
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", mp4: "video/mp4" };
const PREVIEW_DIR = path.join(root, "build", "preview");
const assets = {};

function sourceFor(dir, name) {
  if (dir === "assets/video") {
    const proxy = path.join(PREVIEW_DIR, name);
    if (fs.existsSync(proxy)) return { file: proxy, note: " (preview encode)" };
  }
  return { file: path.join(root, dir, name), note: "" };
}

function collectAssets(dir, prefix) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      collectAssets(path.join(dir, entry.name), prefix + entry.name + "/");
      continue;
    }
    const ext = entry.name.split(".").pop().toLowerCase();
    if (!MIME[ext]) continue;
    const rel = prefix + entry.name;
    if (!result.includes(rel)) continue;
    const src = sourceFor(dir, entry.name);
    const data = fs.readFileSync(src.file);
    assets[rel] = "data:" + MIME[ext] + ";base64," + data.toString("base64");
    console.log("bundled", rel, Math.round(data.length / 1024) + "KB" + src.note);
  }
}
collectAssets("assets/img", "assets/img/");
collectAssets("assets/video", "assets/video/");

/* The map is seeded in js/assets.js, ahead of every data file and view,
   so ICB.ASSETS is populated before anything renders. Base64 cannot
   contain "</script", so no escaping is needed. */
const SEED = "ICB.ASSETS = ICB.ASSETS || {};";
if (!result.includes(SEED)) {
  console.error("Build error: the ICB.ASSETS seed line is missing. Did js/assets.js change?");
  process.exit(1);
}
result = result.replace(SEED, "ICB.ASSETS = " + JSON.stringify(assets) + ";");

/* Static <head> references (the favicon) are plain attributes, not
   data-asset slots, so they are substituted directly. There is one of
   each, so no duplication is introduced. */
result = result.replace(/(href|content)="(assets\/[^"]+)"/g, (m, attr, rel) =>
  assets[rel] ? `${attr}="${assets[rel]}"` : m);

/* Every asset path the bundle asks for must be a key in the map,
   otherwise the single file would reach for a companion folder. */
const wanted = new Set((result.match(/assets\/[\w./-]+\.(?:png|jpe?g|webp|mp4)/g) || []));
const missing = [...wanted].filter(p => !(p in assets));
if (missing.length) {
  console.error("Build error: referenced but not bundled:", missing.slice(0, 10));
  process.exit(1);
}

const leftoverLinks = result.match(/<link rel="stylesheet"[^>]*>/g);
const leftoverScripts = result.match(/<script src=/g);
if (leftoverLinks || leftoverScripts) {
  console.error("Build error: some assets were not inlined.", leftoverLinks, leftoverScripts);
  process.exit(1);
}

const outDir = path.join(root, "dist");
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, "icb-concept.html");
fs.writeFileSync(outFile, result);

const mb = result.length / 1048576;
console.log("Built", outFile, mb.toFixed(2) + " MB");
if (mb > 15.5) {
  console.error("Build error: " + mb.toFixed(2) + "MB exceeds the 16MB preview cap. " +
    "Re-encode the files in build/preview at a lower bitrate.");
  process.exit(1);
}
