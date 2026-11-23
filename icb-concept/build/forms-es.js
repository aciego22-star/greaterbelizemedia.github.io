/* ============================================================================
   ICB's nine claim forms, in Spanish.

   WHY. ICB's review of 4 November 2026: "Spanish page buttons still use
   English form names. None of the five PDFs exist in Spanish." A site
   that is bilingual everywhere else handed a Spanish-speaking claimant
   an English form at the one moment they are least able to deal with
   one, which is the morning after something has happened to them.

   WHAT THIS IS. One Spanish PDF per English form, generated from the
   data below and written to assets/forms/<name>-es.pdf. The English
   PDFs are ICB's own files and are not touched; both versions are
   published, and the claims page hands over whichever matches the
   language the visitor is reading.

   THE RULES THIS FOLLOWS, and they matter more here than anywhere else
   on the site, because this is the document somebody signs:

   1. Every question is a translation of a question ICB actually asks.
      Nothing is added, nothing is dropped, nothing is "improved". Where
      ICB's paper has a slip, the Spanish asks the question correctly
      and the English PDF keeps the slip, because ICB's paper is ICB's.

   2. Declarations, authorisations and anything printed above a
      signature are BILINGUAL: the Spanish first, then ICB's exact
      English underneath in smaller type. A claimant signs under words
      they can read, and the words ICB wrote are still on the page that
      was signed. This is the one place where a translation on its own
      would change what the document is.

   3. ICB's published form names stay in English, in the header, as
      they do everywhere else on the site. The Spanish name sits under
      it. A branch should recognise the document across a counter.

   4. Field positions, section order and the number of write-in lines
      follow the English form, so the two can be read side by side.

   STILL FOR ICB. The claims team should confirm they will accept a form
   completed in Spanish before these are treated as the official
   Spanish forms. Rule 2 is what makes that an easy yes rather than a
   legal question. Noted in ICB-FEEDBACK.md.

   USAGE: node build/forms-es.js      (needs the dev server on 8123 for
   the logo, or pass ICB_FORMS_ORIGIN)
   ========================================================================== */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "assets", "forms");
const ORIGIN = process.env.ICB_FORMS_ORIGIN || "http://127.0.0.1:8123";

/* Playwright, found wherever it happens to live, exactly as the other
   two builds do. */
function findPlaywright() {
  const tries = [];
  if (process.env.ICB_PLAYWRIGHT) tries.push(process.env.ICB_PLAYWRIGHT);
  tries.push("playwright");
  try {
    tries.push(path.join(
      execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "playwright"));
  } catch (e) { /* no npm on PATH */ }
  for (const t of tries) { try { return require(t); } catch (e) { /* next */ } }
  throw new Error("forms-es: playwright not found. Set ICB_PLAYWRIGHT.");
}

/* ------------------------------------------------------------------ */
/* Block renderers. Each form below is a list of these.                */
/* ------------------------------------------------------------------ */

const esc = s => String(s == null ? "" : s)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* A band heading, the black bar ICB uses to open a section. */
const band = t => '<h2 class="band">' + esc(t) + "</h2>";

/* A grid of labelled cells. Each row is an array of 1, 2 or 3 labels;
   a label of "" leaves the cell blank. The writing space is the cell
   itself, which is what the English forms do. */
function rows(list) {
  return '<table class="grid">' + list.map(r =>
    "<tr>" + r.map((cell, i) => {
      const span = r.length === 1 ? ' colspan="' + 2 + '"' : "";
      return '<td' + span + '><span class="lbl">' + esc(cell) + "</span></td>";
    }).join("") + "</tr>").join("") + "</table>";
}

/* A question with ruled lines under it to write on. n is how many
   lines the English form gives, so the two forms stay the same length. */
function ask(q, n) {
  return '<div class="ask"><span class="q">' + esc(q) + "</span>" +
    Array.from({ length: n || 1 }, () => '<span class="rule"></span>').join("") +
    "</div>";
}

/* A question answered in the space beside it rather than under it. */
function inline(q, width) {
  return '<div class="inl"><span class="q">' + esc(q) + "</span>" +
    '<span class="rule" style="width:' + (width || 60) + '%"></span></div>';
}

/* Yes / No boxes. */
function yesno(q) {
  return '<div class="inl yn"><span class="q">' + esc(q) + "</span>" +
    '<span class="box"></span><span class="bl">Sí</span>' +
    '<span class="box"></span><span class="bl">No</span></div>';
}

/* A plain paragraph of instruction. */
const para = t => "<p>" + esc(t) + "</p>";
const small = t => '<p class="sm">' + esc(t) + "</p>";

/* RULE 2. The Spanish a claimant reads, then ICB's own English under
   it, so the signature sits over both. */
function declare(es, en) {
  return '<div class="decl"><p>' + esc(es) + "</p>" +
    '<p class="en">' + esc(en) + "</p></div>";
}

/* Signature lines. Each entry is a label. */
function sign(list) {
  return '<div class="signrow">' + list.map(l =>
    '<div class="sig"><span class="rule"></span><span class="cap">' + esc(l) + "</span></div>"
  ).join("") + "</div>";
}

/* A table to be filled in by hand: column headings and n blank rows. */
function table(cols, n) {
  return '<table class="fill"><thead><tr>' +
    cols.map(c => "<th>" + esc(c) + "</th>").join("") + "</tr></thead><tbody>" +
    Array.from({ length: n }, () => "<tr>" + cols.map(() => "<td></td>").join("") + "</tr>").join("") +
    "</tbody></table>";
}

/* A big empty box, for a sketch or a long statement. */
function box(caption, mm) {
  return '<div class="bigbox" style="height:' + mm + 'mm">' +
    (caption ? '<span class="cap">' + esc(caption) + "</span>" : "") + "</div>";
}

const pagebreak = () => '<div class="pb"></div>';

const H = { esc, band, rows, ask, inline, yesno, para, small, declare, sign, table, box, pagebreak };

/* ------------------------------------------------------------------ */
/* The page. Letter, ICB's black and red, Public Sans for the screen    */
/* face the rest of the site uses; the print engine falls back to a     */
/* system sans where the font is not embedded, which is fine on paper.  */
/* ------------------------------------------------------------------ */

const CSS = `
  @page { size: Letter; margin: 13mm 12mm 12mm; }
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #000;
    font: 9.3pt/1.32 "Public Sans", "Segoe UI", Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact;
  }
  header.masthead { display: flex; align-items: center; gap: 9mm; margin-bottom: 3mm; }
  header.masthead img { width: 17mm; height: auto; }
  .org { font-size: 13pt; font-weight: 700; letter-spacing: .01em; line-height: 1.15; }
  .addr { font-size: 8.2pt; font-weight: 700; margin-top: .7mm; }
  h1 { font-size: 12.4pt; font-weight: 700; text-align: center; margin: 3.4mm 0 1mm;
       text-transform: uppercase; letter-spacing: .02em; }
  .subtitle { text-align: center; font-size: 9.6pt; font-weight: 700; color: #111;
              margin: 0 0 1.5mm; }
  .standfirst { text-align: center; font-size: 8.2pt; font-style: italic; color: #333;
                margin: 0 0 3mm; }
  h2.band { background: #000; color: #fff; font-size: 8.8pt; font-weight: 700;
            text-transform: uppercase; letter-spacing: .04em;
            padding: 1.1mm 2.2mm; margin: 3.4mm 0 1.6mm; break-after: avoid; }
  p { margin: 0 0 2mm; }
  p.sm { font-size: 8pt; color: #222; }
  table { width: 100%; border-collapse: collapse; }
  table.grid td { border: .4pt solid #000; height: 6.8mm; vertical-align: top;
                  padding: .8mm 1.4mm; width: 50%; }
  .lbl { font-size: 8.4pt; font-weight: 700; }
  .ask { margin: 0 0 2.4mm; }
  .ask .q, .inl .q { font-size: 8.7pt; font-weight: 700; display: inline-block; }
  .ask .q { margin-bottom: 1.2mm; }
  .ask .rule { display: block; border-bottom: .4pt solid #000; height: 4.7mm; }
  .inl { display: flex; align-items: flex-end; gap: 2mm; margin: 0 0 2.2mm; }
  .inl .rule { border-bottom: .4pt solid #000; height: 4.6mm; flex: 0 0 auto; }
  .yn .box { width: 3.4mm; height: 3.4mm; border: .5pt solid #000; display: inline-block;
             margin-left: 3mm; }
  .yn .bl { font-size: 8.4pt; margin-left: 1.2mm; }
  table.fill { margin: 1mm 0 3mm; }
  table.fill th { border: .4pt solid #000; background: #eee; font-size: 7.6pt;
                  font-weight: 700; padding: 1mm 1.2mm; text-align: left; }
  table.fill td { border: .4pt solid #000; height: 7.4mm; }
  .bigbox { border: .4pt solid #000; margin: 1mm 0 3mm; position: relative; }
  .bigbox .cap { position: absolute; top: 1.2mm; left: 1.6mm; font-size: 7.8pt;
                 font-weight: 700; color: #444; }
  .decl { border-left: 1.6pt solid #D12126; padding: 1.4mm 0 .3mm 2.6mm; margin: 2.4mm 0; }
  .decl p { font-size: 8.5pt; font-weight: 700; margin-bottom: 1.4mm; }
  .decl p.en { font-size: 7.4pt; font-weight: 400; color: #444; font-style: italic;
               margin-bottom: 0; }
  .signrow { display: flex; gap: 6mm; margin: 3mm 0 1.2mm; break-inside: avoid; }
  .sig { flex: 1; }
  .sig .rule { display: block; border-bottom: .5pt solid #000; height: 6.4mm; }
  .sig .cap { font-size: 8pt; font-weight: 700; }
  .pb { break-after: page; }
  /* Fixed, so it repeats on every page and takes no room in the flow.
     Two one-page forms were spilling a second page that held nothing
     but this. Every sheet of a claim form should say which form it is
     anyway: they get separated. */
  footer.foot { position: fixed; bottom: 0; left: 0; right: 0;
                border-top: .4pt solid #999; padding-top: 1.4mm;
                font-size: 7.2pt; color: #555; display: flex; justify-content: space-between;
                gap: 6mm; background: #fff; }
  body { padding-bottom: 5mm; }
`;

/* Just the two Public Sans weights the forms use, lifted out of the
   site's font sheet.

   Linking the whole sheet put Archivo and three Public Sans weights in
   front of the print engine, and Chromium embeds a subset of every
   face a page touches. Two weights is the same typeface on paper at a
   fraction of the weight, which matters because the one-file preview
   has to carry all nine forms as base64 on top of everything else.
   Dropping webfonts altogether is worse, not better: measured on
   23 Nov 2026, the Linux fallback embedded 1.5MB against 588KB. */
let FONT_CACHE = null;
function formFont() {
  if (FONT_CACHE !== null) return FONT_CACHE;
  const sheet = fs.readFileSync(path.join(ROOT, "css", "fonts.css"), "utf8");
  const keep = (sheet.match(/@font-face\s*\{[^}]*\}/g) || []).filter(b =>
    /font-family:\s*"?Public Sans/.test(b) && /font-weight:\s*(400|700)\b/.test(b));
  if (keep.length !== 2) {
    throw new Error("forms-es: expected Public Sans 400 and 700 in css/fonts.css, found " +
      keep.length + ". The forms follow the site's typography, so this is worth a look.");
  }
  FONT_CACHE = keep.join("\n");
  return FONT_CACHE;
}

function document_(form, logo) {
  return "<!DOCTYPE html><html lang=\"es\"><head><meta charset=\"utf-8\">" +
    "<title>" + esc(form.title) + "</title>" +
    "<style>" + formFont() + "</style>" +
    "<style>" + CSS + "</style></head><body>" +
    '<header class="masthead"><img src="' + logo + '" alt="">' +
      '<div><div class="org">INSURANCE CORPORATION OF BELIZE LIMITED</div>' +
      '<div class="addr">' + esc(form.addr ||
        "P.O. Box 519, #16 Daly Street, Belize City, Belize   Tel: 224-5328/5329   Fax: 223-2786") +
      "</div></div></header>" +
    "<h1>" + esc(form.name) + "</h1>" +
    '<p class="subtitle">' + esc(form.nameEs) + "</p>" +
    (form.standfirst ? '<p class="standfirst">' + esc(form.standfirst) + "</p>" : "") +
    form.body(H) +
    '<footer class="foot"><span>' + esc(form.name) + " · " + esc(form.nameEs) + "</span>" +
    "<span>Las preguntas y las declaraciones son las mismas que las del formulario en inglés.</span>" +
    "</footer></body></html>";
}

async function main() {
  const { chromium } = findPlaywright();
  const forms = require("./forms-es-data")(H);
  const logo = ORIGIN + "/assets/img/icb-logo.png";

  const browser = await chromium.launch({
    executablePath: process.env.ICB_CHROMIUM || "/opt/pw-browsers/chromium"
  });
  const page = await browser.newPage();
  let wrote = 0;

  for (const form of forms) {
    await page.setContent(document_(form, logo), { waitUntil: "networkidle" });
    const file = path.join(OUT, form.file);
    await page.pdf({
      path: file, format: "Letter", printBackground: true,
      margin: { top: "13mm", bottom: "12mm", left: "12mm", right: "12mm" }
    });
    /* Chromium writes no /Title, and a claim form whose browser tab
       says "icb-windscreen-claim-form-es" is the complaint ICB made
       about the English ones on 4 Nov. Set it the same way. */
    titlePdf(file, form.title);
    const pages = countPages(file);
    console.log("  " + form.file.padEnd(44) + pages + " page" + (pages === 1 ? "" : "s") +
      "  " + Math.round(fs.statSync(file).size / 1024) + "KB");
    wrote += 1;
  }

  await browser.close();
  console.log("\n" + wrote + " Spanish claim forms written to assets/forms/");
}

/* pypdf lives under python3.13 in this container, not python3. */
function py() { return process.env.ICB_PYTHON || "python3.13"; }

function titlePdf(file, title) {
  execFileSync(py(), ["-I", "-c",
    "import sys;from pypdf import PdfReader,PdfWriter;" +
    "r=PdfReader(sys.argv[1]);w=PdfWriter();w.append_pages_from_reader(r);" +
    "w.add_metadata({'/Title':sys.argv[2]});" +
    "f=open(sys.argv[1],'wb');w.write(f);f.close()", file, title]);
}

function countPages(file) {
  return parseInt(execFileSync(py(), ["-I", "-c",
    "import sys;from pypdf import PdfReader;print(len(PdfReader(sys.argv[1]).pages))", file],
    { encoding: "utf8" }).trim(), 10);
}

if (require.main === module) {
  main().catch(e => { console.error(e); process.exit(1); });
}

module.exports = { H, CSS, document_, ROOT, OUT, ORIGIN, findPlaywright };
