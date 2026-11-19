/* ============================================================================
   Nothing ICB reads is written for ICB to read.

   WHY THIS EXISTS. This codebase is heavily commented, on purpose: the
   reasoning behind a decision is worth more beside the code than in a
   document nobody opens. But a comment in a .js file is not private. It
   is served to every visitor, it is two keystrokes away in any browser's
   view-source, and search engines index it.

   On 18 Nov 2026 ICB read them. Roughly 700 lines of internal notes went
   out with the site: dated records of what ICB asked for and when, what
   was got wrong and put back, questions still open with them, and
   nineteen blocks marked INTERNAL TODO which said in as many words that
   they were not client-facing while being exactly that. The assistant's
   vendor was named in a comment in index.html, which the prerender
   copied into all seventy-two pages.

   The rule was "development notes belong in code comments, never in
   client-facing copy". The flaw in it was treating "client-facing" as
   meaning the rendered page. It means anything the client receives.

   WHAT THIS DOES. The source keeps every comment. The build strips them
   out of everything it ships, so the repository stays documented and the
   deployed site carries code and nothing else. One place to change, and
   it cannot be forgotten on a file somebody adds later, because it runs
   over whatever the build is copying rather than over a list.

   JavaScript goes through terser with compress and mangle BOTH OFF. That
   is deliberate: this is a comment strip, not a minify. Nothing is
   renamed, nothing is restructured, no branch is folded away, so what
   ships is what was written and a stack trace still points at something
   recognisable. Terser rather than a regex because a regex cannot tell a
   comment from the characters "//" inside a string or a URL, and quietly
   corrupting one file in forty is not worth the saved dependency.
   ========================================================================== */
"use strict";

/* Looked up wherever it happens to be installed rather than depended
   on, exactly as build-static.js does with Playwright, so the
   repository still ships no node_modules of its own. */
function find() {
  const tries = [];
  if (process.env.ICB_TERSER) tries.push(process.env.ICB_TERSER);
  tries.push("terser");
  try {
    const { execFileSync } = require("child_process");
    const path = require("path");
    tries.push(path.join(
      execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim(), "terser"));
  } catch (e) { /* no npm on PATH; the other candidates may still work */ }
  for (const t of tries) {
    try { return require(t); } catch (e) { /* next */ }
  }
  return null;
}

const terser = find();

/* ---------------------------------------------------------------- */
function js(code, label) {
  if (!terser) {
    throw new Error(
      "strip-comments: terser is not installed, and the build will not ship\n" +
      "  commented JavaScript. Install it where playwright already lives:\n" +
      "    npm install -g terser\n" +
      "  or point ICB_TERSER at an existing copy.\n" +
      "  (file: " + (label || "?") + ")");
  }
  const out = terser.minify_sync(code, {
    compress: false,
    mangle: false,
    format: { comments: false },
    sourceMap: false
  });
  if (out.error) {
    throw new Error("strip-comments: could not parse " + (label || "?") + ": " + out.error);
  }
  if (typeof out.code !== "string" || !out.code.length) {
    throw new Error("strip-comments: empty output for " + (label || "?"));
  }
  return out.code;
}

/* ----------------------------------------------------------------
   CSS. Comments cannot nest, so the only thing to be careful of is a
   "/*" sitting inside a quoted string or a url(), which this walks
   past rather than treating as the start of one. */
function css(text) {
  let out = "";
  let i = 0;
  const n = text.length;
  while (i < n) {
    const c = text[i];
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      while (j < n && text[j] !== quote) { j += text[j] === "\\" ? 2 : 1; }
      out += text.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }
    if (c === "/" && text[i + 1] === "*") {
      const end = text.indexOf("*/", i + 2);
      i = end === -1 ? n : end + 2;
      /* A comment between two rules leaves a blank line behind it;
         collapsing runs of them keeps the file from becoming a ladder
         of empty lines. */
      continue;
    }
    out += c;
    i += 1;
  }
  return out.replace(/\n[ \t]*(?=\n)/g, "").replace(/\n{3,}/g, "\n\n");
}

/* ----------------------------------------------------------------
   HTML. Only ever run on markup, never on a document that already has
   base64 or script bodies pasted into it: a data URI cannot contain
   "<!--", but there is no reason to walk one looking.

   Conditional comments are not stripped. None exist here, and a build
   that silently removed one would break the thing it was there for. */
function html(text) {
  return text
    .replace(/<!--(?!\[if )[\s\S]*?-->/g, "")
    .replace(/\n[ \t]*(?=\n)/g, "")
    .replace(/\n{3,}/g, "\n\n");
}

/* ----------------------------------------------------------------
   The gate. Run over whatever the build is about to write, so a note
   that slips through any of the three strippers stops the build rather
   than reaching ICB. The words are the ones that actually went out.

   It is deliberately a small list of phrases rather than a cleverer
   test. Anything that tries to judge whether a sentence is "internal"
   will be wrong in both directions; these are the exact markers this
   codebase uses, and the vendor name nobody outside the build has any
   business reading. */
const FORBIDDEN = [
  /INTERNAL TODO/i,
  /not client-facing/i,
  /chatbase/i
];

function audit(text, label) {
  const hits = [];
  for (const re of FORBIDDEN) {
    const m = re.exec(text);
    if (m) {
      const at = Math.max(0, m.index - 60);
      hits.push(m[0] + "  ...  " + text.slice(at, m.index + 90).replace(/\s+/g, " "));
    }
  }
  if (hits.length) {
    throw new Error("strip-comments: " + (label || "?") +
      " still carries notes that must not ship:\n    " + hits.join("\n    "));
  }
  return text;
}

/* ----------------------------------------------------------------
   The sweep, which is the gate that cannot be forgotten.

   audit() above only sees what a caller hands it, and on 19 Nov 2026
   that turned out to be the weakness: build-static.js strips each page
   inside the loop that writes it, and 404.html is written on its own
   below that loop, so it shipped with all seven of the shell's HTML
   comments in it. The page a lost visitor lands on was the one page
   still carrying development notes.

   So the build calls this at the end, over the directory it has just
   finished writing, and it reads every file rather than every file
   somebody remembered. A comment marker in a shipped .js, .css or
   .html is a strip that did not run. */
function sweep(dir, opts) {
  const fs = require("fs");
  const path = require("path");
  const skip = (opts && opts.skip) || [];
  const problems = [];
  let read = 0;

  (function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const full = path.join(d, name);
      const rel = path.relative(dir, full);
      if (skip.indexOf(rel) >= 0) continue;
      const st = fs.statSync(full);
      if (st.isDirectory()) { walk(full); continue; }
      const ext = path.extname(name).toLowerCase();
      if ([".html", ".js", ".css"].indexOf(ext) < 0) continue;
      read += 1;
      const text = fs.readFileSync(full, "utf8");
      /* The single-file build pastes base64 and whole script bodies
         into one document, where "/*" and "<!--" can legitimately
         appear inside a data URI or a string. Only the multi-page
         output is swept for markers; the word list runs on both. */
      if (!(opts && opts.markersOff)) {
        if (ext === ".html" && /<!--(?!\[if )/.test(text)) problems.push(rel + ": HTML comment");
        if (ext === ".css" && /\/\*/.test(text)) problems.push(rel + ": CSS comment");
        if (ext === ".js" && /^\s*(\/\*|\/\/)/m.test(text)) problems.push(rel + ": JS comment");
      }
      for (const re of FORBIDDEN) if (re.test(text)) problems.push(rel + ": " + re);
    }
  })(dir);

  if (problems.length) {
    throw new Error("strip-comments: " + problems.length +
      " file(s) in " + dir + " were written without being stripped:\n    " +
      problems.join("\n    "));
  }
  return read;
}

module.exports = { js, css, html, audit, sweep };
