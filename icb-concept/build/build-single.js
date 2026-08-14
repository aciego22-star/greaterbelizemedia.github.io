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

/* Inline real assets (images and, when present, the video) as data URIs so
   the single file needs no companion folder. Asset paths are unique strings
   throughout the bundle, so a global replace is safe. */
const MIME = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", mp4: "video/mp4" };
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
    const data = fs.readFileSync(path.join(abs, entry.name));
    const uri = "data:" + MIME[ext] + ";base64," + data.toString("base64");
    result = result.split(rel).join(uri);
    console.log("inlined", rel, Math.round(data.length / 1024) + "KB");
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
console.log("Built", outFile, Math.round(result.length / 1024) + " KB");
