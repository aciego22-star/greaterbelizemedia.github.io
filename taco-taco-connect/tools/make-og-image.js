// Render assets/og-image.jpg from tools/og-image.html.
//
//     npm i -g playwright && NODE_PATH=$(npm root -g) node tools/make-og-image.js
//
// The sharing card is a small web page rather than a drawing so it can reuse
// the hero's ring and the real mascot cut-out: re-run it whenever the artwork
// changes and the card follows. 1200x630 is what Facebook, WhatsApp and X read.
// CommonJS on purpose: NODE_PATH, which is how a global Playwright is found,
// is ignored by ESM imports.
const { chromium } = require("playwright");
const { statSync } = require("node:fs");
const { pathToFileURL } = require("node:url");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "assets", "og-image.jpg");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(path.join(root, "tools", "og-image.html")).href);
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
  const ok = await page.evaluate(() =>
    [...document.fonts].some((f) => f.family === "Archivo Black" && f.status === "loaded"));
  if (!ok) throw new Error("Archivo Black did not load; the headline would render in a fallback");
  await page.screenshot({ path: out, type: "jpeg", quality: 88 });
  await browser.close();
  console.log(`  og-image.jpg: ${(statSync(out).size / 1024).toFixed(1)} KB`);
})();
