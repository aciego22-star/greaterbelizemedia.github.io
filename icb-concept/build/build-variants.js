#!/usr/bin/env node
/* ============================================================================
   Two deployable folders from one source, for showing ICB the site with and
   without the assistant.

   The point is that the two differ in exactly one thing. Rolling back to an
   older Netlify deploy would also roll back the boat photograph, the Gallery
   banner, the Spanish and the mobile fixes, so the client would be comparing
   two different sites and drawing conclusions about the wrong difference.
   These are built from the same commit minutes apart.

       dist/with-bee/   the site as it stands
       dist/no-bee/     the same site, minus the assistant

   Removing it is a subtraction, never a second copy of anything: the script
   tag, the mount point, js/assistant.js and the bee badge come out, and
   nothing is edited. That is possible because two things were arranged for
   it. js/main.js starts the assistant only if it is there, and the footer
   reserves room for the launcher through .has-bee, a class js/assistant.js
   puts on the document itself. No assistant, no class, no reserved space,
   and no stylesheet of its own to keep in step.

   Run: node build/build-variants.js
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const dist = path.join(root, "dist");

/* Everything a deployed site needs. The single-file preview, the docs and
   this build folder are not part of it. */
const SHIP = ["index.html", "css", "js", "assets"];

/* Carried by the folder build but not by any page: an earlier encode kept
   for reference, and the crop the Marine hero used before the boat. */
const SKIP = new Set([
  "assets/video/icb-story.mp4",
  "assets/img/products/marine.jpg"
]);

function copy(from, to, rel) {
  const stat = fs.statSync(from);
  if (stat.isDirectory()) {
    fs.mkdirSync(to, { recursive: true });
    for (const entry of fs.readdirSync(from)) {
      copy(path.join(from, entry), path.join(to, entry), rel ? rel + "/" + entry : entry);
    }
    return;
  }
  if (SKIP.has(rel)) return;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function build(name) {
  const out = path.join(dist, name);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  for (const item of SHIP) copy(path.join(root, item), path.join(out, item), item);
  return out;
}

function bytes(dir) {
  let n = 0, files = 0;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p);
      else { n += fs.statSync(p).size; files += 1; }
    }
  })(dir);
  return { mb: (n / 1024 / 1024).toFixed(2), files };
}

/* ------------------------------------------------------------------ */

const withBee = build("with-bee");
console.log("dist/with-bee   " + JSON.stringify(bytes(withBee)));

const noBee = build("no-bee");

/* 1. The script tag. */
const indexPath = path.join(noBee, "index.html");
let html = fs.readFileSync(indexPath, "utf8");

const SCRIPT = '  <script src="js/assistant.js"></script>\n';
if (!html.includes(SCRIPT)) {
  console.error("Build error: the assistant script tag is not where it was. Did index.html change?");
  process.exit(1);
}
html = html.replace(SCRIPT, "");

/* 2. The mount point, comment and all. */
const MOUNT = /\n  <!-- Talk to Bee\.[\s\S]*?-->\n  <div id="assistant-mount"><\/div>\n/;
if (!MOUNT.test(html)) {
  console.error("Build error: the assistant mount point is not where it was. Did index.html change?");
  process.exit(1);
}
html = html.replace(MOUNT, "\n");
fs.writeFileSync(indexPath, html, "utf8");

/* 3. The styling. It is the last section of the stylesheet and it is
      fenced by its own heading, so it comes out whole. The one rule that
      lives elsewhere, the footer's clearance, comes out with it. */
const cssPath = path.join(noBee, "css/site.css");
let css = fs.readFileSync(cssPath, "utf8");

const SECTION = "/* ============================ Talk to Bee ============================ */";
const CLEARANCE = /\/\* Only when there is a launcher to clear\.[\s\S]*?\.has-bee \.site-footer \{[^}]*\}\n\n/;
if (css.indexOf(SECTION) < 0 || !CLEARANCE.test(css)) {
  console.error("Build error: the assistant's styles are not where they were. Did site.css change?");
  process.exit(1);
}
css = css.slice(0, css.indexOf(SECTION)).replace(/\s+$/, "\n");
css = css.replace(CLEARANCE, "");
fs.writeFileSync(cssPath, css, "utf8");

/* 4. The behaviour and the badge. */
const GONE = [
  "js/assistant.js",
  "assets/img/icb-bee-128.webp", "assets/img/icb-bee-128.png",
  "assets/img/icb-bee-256.webp", "assets/img/icb-bee-256.png"
];
for (const rel of GONE) fs.rmSync(path.join(noBee, rel), { force: true });

/* Nothing may still be reaching for what was removed, and no page in this
   variant may name the assistant's host. */
const leftovers = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/\.(html|css|js)$/.test(e.name)) continue;
    const text = fs.readFileSync(p, "utf8");
    const rel = path.relative(noBee, p);
    if (/chatbase\.co/.test(text)) leftovers.push(rel + " still names chatbase.co");
    if (/assistant\.js|icb-bee-/.test(text)) leftovers.push(rel + " still asks for a removed file");
  }
})(noBee);
if (leftovers.length) {
  console.error("Build error: the assistant is not fully out:\n  " + leftovers.join("\n  "));
  process.exit(1);
}

console.log("dist/no-bee     " + JSON.stringify(bytes(noBee)));
console.log("\nBoth folders built from the same source. Drag either onto Netlify.");
