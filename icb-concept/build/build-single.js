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

/* Inline real assets (images and video) as data URIs so the single file
   needs no companion folder. Asset paths are unique strings throughout the
   bundle, so a global replace is safe.

   Video is the one place where the preview and the deployed site differ.
   assets/video holds the site encodes (1280x720). Base64 adds a third
   again to every byte, and preview surfaces cap a single document at
   16MB, so when build/preview holds a lighter encode of the same film it
   is substituted here. The deployed folder and ZIP always ship the
   full-quality files. */
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", mp4: "video/mp4" };
const PREVIEW_DIR = path.join(root, "build", "preview");

function sourceFor(dir, name) {
  if (dir === "assets/video") {
    const proxy = path.join(PREVIEW_DIR, name);
    if (fs.existsSync(proxy)) return { file: proxy, note: " (preview encode)" };
  }
  return { file: path.join(root, dir, name), note: "" };
}

function inlineAssets(dir, prefix) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      inlineAssets(path.join(dir, entry.name), prefix + entry.name + "/");
      continue;
    }
    const ext = entry.name.split(".").pop().toLowerCase();
    if (!MIME[ext]) continue;
    const rel = prefix + entry.name;
    if (!result.includes(rel)) continue;
    const src = sourceFor(dir, entry.name);
    const data = fs.readFileSync(src.file);
    const uri = "data:" + MIME[ext] + ";base64," + data.toString("base64");
    result = result.split(rel).join(uri);
    console.log("inlined", rel, Math.round(data.length / 1024) + "KB" + src.note);
  }
}
inlineAssets("assets/img", "assets/img/");
inlineAssets("assets/video", "assets/video/");
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
