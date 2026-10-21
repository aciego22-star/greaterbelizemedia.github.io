/* ============================================================================
   ICB.pdf — a small PDF writer, in the browser, with no library.

   A claimant who fills a claim form on this site ends up with a real PDF
   of what they signed. That file is the thing ICB receives and the thing
   the claimant keeps, so it is built here rather than on a server: the
   answers, the signature and the photographs never leave the device
   except by the claimant's own act of sending them.

   WHY NOT A LIBRARY. The site ships no dependencies and makes no outside
   request before someone asks it to. A PDF of text and a few images is a
   few hundred lines of a well documented format, so it is written out
   directly and the property is kept.

   WHAT IT SUPPORTS, and no more than this is needed:
   - Helvetica and Helvetica-Bold, the standard fonts every reader has
     built in, so nothing has to be embedded.
   - WinAnsiEncoding, which covers English and the accented Spanish
     characters. Anything outside it is transliterated rather than
     dropped, because a missing letter in a claimant's name is worse
     than an approximated one.
   - JPEG images, embedded as-is with /DCTDecode. A canvas gives JPEG
     bytes directly, so a signature needs no decoding or re-encoding.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var PT = 1;
  var A4 = { w: 595.28, h: 841.89 };

  /* Helvetica advance widths, in 1/1000 em, for the WinAnsi range this
     site can produce. Measured text is the only way to wrap a line
     correctly, and the browser's own metrics are for the browser's
     Helvetica, which is not necessarily the reader's. These are the
     values from the standard font's own metrics. */
  var W_REG = [
    278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,
    556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,
    1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,
    667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,
    333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,
    556,556,333,500,278,556,500,722,500,500,500,334,260,334,584
  ];
  var W_BOLD = [
    278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,
    556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,
    975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,
    667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,
    333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,
    611,611,389,556,333,611,556,778,556,556,500,389,280,389,584
  ];
  /* Everything above code 126 that this site can emit, by code point.
     Spanish needs the accented vowels, the tilde n and the inverted
     marks; the rest are what a pasted character is folded into. */
  var W_HIGH_REG = { 160:278, 161:333, 191:611, 192:667, 193:667, 201:667, 205:278, 209:722,
    211:778, 218:722, 220:722, 224:556, 225:556, 226:556, 231:500, 232:556, 233:556, 234:556,
    237:278, 239:278, 241:556, 243:556, 244:556, 246:556, 250:556, 252:556, 8211:556, 8212:1000,
    8216:222, 8217:222, 8220:333, 8221:333, 8226:350 };
  var W_HIGH_BOLD = { 160:278, 161:333, 191:611, 192:722, 193:722, 201:667, 205:278, 209:722,
    211:778, 218:722, 220:722, 224:556, 225:556, 226:556, 231:556, 232:556, 233:556, 234:556,
    237:278, 239:278, 241:611, 243:611, 244:611, 246:611, 250:611, 252:611, 8211:556, 8212:1000,
    8216:278, 8217:278, 8220:500, 8221:500, 8226:350 };

  /* Characters WinAnsi cannot carry, folded to something it can. A claim
     form typed on a phone picks up smart quotes and dashes without
     anyone meaning to. */
  var FOLD = { 8211: "-", 8212: "-", 8216: "'", 8217: "'", 8220: '"', 8221: '"',
               8230: "...", 8226: "-", 160: " ", 8203: "" };

  function fold(s) {
    var out = "", i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charCodeAt(i);
      if (FOLD[c] !== undefined) { out += FOLD[c]; continue; }
      if (c > 255) { out += "?"; continue; }   /* outside WinAnsi entirely */
      out += s.charAt(i);
    }
    return out;
  }

  function charWidth(code, bold) {
    if (code >= 32 && code <= 126) return (bold ? W_BOLD : W_REG)[code - 32];
    var high = bold ? W_HIGH_BOLD : W_HIGH_REG;
    return high[code] !== undefined ? high[code] : (bold ? 556 : 556);
  }

  /* Width of a string at a given size, in points. */
  function textWidth(s, size, bold) {
    var w = 0, i;
    for (i = 0; i < s.length; i++) w += charWidth(s.charCodeAt(i), bold);
    return w * size / 1000;
  }

  /* Greedy wrap. A single word longer than the line is broken rather
     than allowed to run off the page, which is what a policy number
     typed without spaces does. */
  function wrap(s, size, bold, maxW) {
    var lines = [], para = String(s == null ? "" : s).split(/\r?\n/), p, words, line, i, w;
    for (p = 0; p < para.length; p++) {
      words = para[p].split(/\s+/).filter(function (x) { return x.length; });
      if (!words.length) { lines.push(""); continue; }
      line = "";
      for (i = 0; i < words.length; i++) {
        w = line ? line + " " + words[i] : words[i];
        if (textWidth(w, size, bold) <= maxW) { line = w; continue; }
        if (line) { lines.push(line); line = ""; }
        /* the word alone is too wide: cut it where it stops fitting */
        var word = words[i];
        while (textWidth(word, size, bold) > maxW) {
          var cut = 1;
          while (cut < word.length && textWidth(word.slice(0, cut + 1), size, bold) <= maxW) cut++;
          lines.push(word.slice(0, cut));
          word = word.slice(cut);
        }
        line = word;
      }
      if (line) lines.push(line);
    }
    return lines;
  }

  function esc(s) {
    return fold(String(s == null ? "" : s))
      .replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }

  /* ---- JPEG header read, for the width and height of a signature ---- */
  function jpegSize(bytes) {
    var i = 2;
    while (i < bytes.length) {
      if (bytes[i] !== 0xFF) { i++; continue; }
      var marker = bytes[i + 1];
      if (marker >= 0xC0 && marker <= 0xCF &&
          marker !== 0xC4 && marker !== 0xC8 && marker !== 0xCC) {
        return { h: (bytes[i + 5] << 8) | bytes[i + 6],
                 w: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
      i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
    }
    return null;
  }

  /* ------------------------------------------------------------------ */
  /* The document                                                        */
  /* ------------------------------------------------------------------ */
  function Doc(opts) {
    opts = opts || {};
    this.margin = opts.margin || 52;
    this.pageW = A4.w;
    this.pageH = A4.h;
    this.pages = [];          /* each: { ops: [], images: {} } */
    this.images = [];         /* each: { bytes, w, h } */
    this.header = opts.header || null;
    this.footer = opts.footer || null;
    this.y = 0;
    this.newPage();
  }

  Doc.prototype.contentW = function () { return this.pageW - this.margin * 2; };

  Doc.prototype.newPage = function () {
    this.page = { ops: [], images: {} };
    this.pages.push(this.page);
    this.y = this.pageH - this.margin;
    if (this.header) this.header(this, this.pages.length);
  };

  Doc.prototype.space = function (n) {
    this.y -= n;
    if (this.y < this.margin + 36) this.newPage();
  };

  Doc.prototype.need = function (h) {
    if (this.y - h < this.margin + 36) this.newPage();
  };

  /* A run of text, wrapped, at the current position. */
  Doc.prototype.text = function (s, o) {
    o = o || {};
    var size = o.size || 10;
    var bold = !!o.bold;
    var lead = o.lead || size * 1.35;
    var indent = o.indent || 0;
    var maxW = (o.width || this.contentW()) - indent;
    var grey = o.grey;
    var lines = wrap(s, size, bold, maxW), i;
    for (i = 0; i < lines.length; i++) {
      this.need(lead);
      this.page.ops.push(
        "BT" +
        (grey ? " " + grey + " " + grey + " " + grey + " rg" : " 0 0 0 rg") +
        " /" + (bold ? "F2" : "F1") + " " + size + " Tf" +
        " 1 0 0 1 " + (this.margin + indent).toFixed(2) + " " + (this.y - size).toFixed(2) + " Tm" +
        " (" + esc(lines[i]) + ") Tj ET");
      this.y -= lead;
    }
    return this;
  };

  /* A label and its answer, the shape every line of a claim form takes.
     The answer carries the weight, so the label is the quieter of the
     two: a reader scanning a filled form is looking for the answers. */
  Doc.prototype.field = function (label, value, o) {
    o = o || {};
    var size = o.size || 10;
    this.need(size * 2.6);
    this.text(label, { size: size - 1.5, grey: 0.42, lead: (size - 1.5) * 1.3 });
    this.text(value === "" || value == null ? "-" : value, { size: size, lead: size * 1.35 });
    this.y -= 4;
    return this;
  };

  Doc.prototype.heading = function (s, o) {
    o = o || {};
    this.need(34);
    this.y -= o.tight ? 6 : 14;
    this.text(s, { size: o.size || 12, bold: true, lead: (o.size || 12) * 1.3 });
    this.rule(0.6);
    this.y -= 6;
    return this;
  };

  Doc.prototype.rule = function (w, grey) {
    this.need(8);
    this.y -= 4;
    this.page.ops.push("q " + (grey === undefined ? 0.75 : grey) + " G " + (w || 0.5) +
      " w " + this.margin.toFixed(2) + " " + this.y.toFixed(2) + " m " +
      (this.pageW - this.margin).toFixed(2) + " " + this.y.toFixed(2) + " l S Q");
    this.y -= 2;
    return this;
  };

  /* A simple grid, for the tables these forms carry: passengers, third
     parties, the contents of a damaged building. */
  Doc.prototype.table = function (cols, rows, o) {
    o = o || {};
    var size = o.size || 8.5;
    var pad = 4;
    var total = cols.reduce(function (a, c) { return a + c.w; }, 0);
    var scale = this.contentW() / total;
    var i, r, c, x, cellLines, maxLines, j, widths = cols.map(function (c) { return c.w * scale; });

    var self = this;
    function row(cells, bold, shade) {
      cellLines = [];
      maxLines = 1;
      for (i = 0; i < cells.length; i++) {
        var ls = wrap(cells[i], size, bold, widths[i] - pad * 2);
        if (!ls.length) ls = [""];
        cellLines.push(ls);
        if (ls.length > maxLines) maxLines = ls.length;
      }
      var h = maxLines * size * 1.3 + pad * 2;
      self.need(h);
      var top = self.y;
      if (shade) {
        self.page.ops.push("q 0.945 0.945 0.945 rg " + self.margin.toFixed(2) + " " +
          (top - h).toFixed(2) + " " + self.contentW().toFixed(2) + " " + h.toFixed(2) + " re f Q");
      }
      x = self.margin;
      for (i = 0; i < cellLines.length; i++) {
        for (j = 0; j < cellLines[i].length; j++) {
          self.page.ops.push("BT 0 0 0 rg /" + (bold ? "F2" : "F1") + " " + size + " Tf 1 0 0 1 " +
            (x + pad).toFixed(2) + " " + (top - pad - size - j * size * 1.3).toFixed(2) +
            " Tm (" + esc(cellLines[i][j]) + ") Tj ET");
        }
        x += widths[i];
      }
      /* the grid itself */
      self.page.ops.push("q 0.8 G 0.4 w");
      self.page.ops.push(self.margin.toFixed(2) + " " + (top - h).toFixed(2) + " " +
        self.contentW().toFixed(2) + " " + h.toFixed(2) + " re S");
      x = self.margin;
      for (i = 0; i < widths.length - 1; i++) {
        x += widths[i];
        self.page.ops.push(x.toFixed(2) + " " + (top - h).toFixed(2) + " m " +
          x.toFixed(2) + " " + top.toFixed(2) + " l S");
      }
      self.page.ops.push("Q");
      self.y = top - h;
    }

    this.need(40);
    row(cols.map(function (c) { return c.label; }), true, true);
    for (r = 0; r < rows.length; r++) row(rows[r].map(function (v) { return v == null ? "" : String(v); }), false, false);
    this.y -= 6;
    return this;
  };

  /* A signature, drawn from a canvas. Sized to a sensible height and
     placed with its caption, so it reads as a signature block rather
     than a picture that happens to be there. */
  Doc.prototype.signature = function (jpegBytes, caption, meta) {
    var size = jpegSize(jpegBytes);
    if (!size) return this;
    var h = 46;
    var w = Math.min(this.contentW(), size.w * h / size.h);
    this.need(h + 34);
    this.y -= 6;
    var idx = this.images.length;
    this.images.push({ bytes: jpegBytes, w: size.w, h: size.h });
    var name = "Im" + idx;
    this.page.images[name] = idx;
    this.page.ops.push("q " + w.toFixed(2) + " 0 0 " + h.toFixed(2) + " " +
      this.margin.toFixed(2) + " " + (this.y - h).toFixed(2) + " cm /" + name + " Do Q");
    this.y -= h + 2;
    this.page.ops.push("q 0.6 G 0.5 w " + this.margin.toFixed(2) + " " + this.y.toFixed(2) +
      " m " + (this.margin + Math.max(w, 150)).toFixed(2) + " " + this.y.toFixed(2) + " l S Q");
    this.y -= 3;
    this.text(caption, { size: 8, grey: 0.42, lead: 10 });
    if (meta) this.text(meta, { size: 7.5, grey: 0.55, lead: 10 });
    this.y -= 6;
    return this;
  };

  /* ------------------------------------------------------------------ */
  /* Serialise                                                           */
  /* ------------------------------------------------------------------ */
  Doc.prototype.toBlob = function () {
    var self = this;
    var parts = [];            /* Uint8Array / string pieces, in order */
    var offsets = [];
    var length = 0;

    function pushStr(s) {
      var b = new Uint8Array(s.length), i;
      for (i = 0; i < s.length; i++) b[i] = s.charCodeAt(i) & 0xFF;
      parts.push(b); length += b.length;
    }
    function pushBytes(b) { parts.push(b); length += b.length; }

    /* object numbering: 1 catalog, 2 pages, 3 F1, 4 F2, then images,
       then one content stream and one page object per page */
    var nImg = this.images.length;
    var firstImg = 5;
    var firstPage = firstImg + nImg;          /* page objects */
    var firstContent = firstPage + this.pages.length;
    var total = firstContent + this.pages.length - 1;

    function begin(n) { offsets[n] = length; pushStr(n + " 0 obj\n"); }
    function end() { pushStr("endobj\n"); }

    pushStr("%PDF-1.4\n%âãÏÓ\n");

    begin(1);
    pushStr("<< /Type /Catalog /Pages 2 0 R >>\n");
    end();

    begin(2);
    var kids = this.pages.map(function (_, i) { return (firstPage + i) + " 0 R"; }).join(" ");
    pushStr("<< /Type /Pages /Kids [" + kids + "] /Count " + this.pages.length + " >>\n");
    end();

    begin(3);
    pushStr("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\n");
    end();
    begin(4);
    pushStr("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\n");
    end();

    this.images.forEach(function (im, i) {
      begin(firstImg + i);
      pushStr("<< /Type /XObject /Subtype /Image /Width " + im.w + " /Height " + im.h +
        " /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length " +
        im.bytes.length + " >>\nstream\n");
      pushBytes(im.bytes);
      pushStr("\nendstream\n");
      end();
    });

    this.pages.forEach(function (pg, i) {
      begin(firstPage + i);
      var xo = Object.keys(pg.images).map(function (name) {
        return "/" + name + " " + (firstImg + pg.images[name]) + " 0 R";
      }).join(" ");
      pushStr("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 " + self.pageW.toFixed(2) + " " +
        self.pageH.toFixed(2) + "] /Resources << /Font << /F1 3 0 R /F2 4 0 R >>" +
        (xo ? " /XObject << " + xo + " >>" : "") + " >> /Contents " +
        (firstContent + i) + " 0 R >>\n");
      end();
    });

    this.pages.forEach(function (pg, i) {
      var body = pg.ops.join("\n") + "\n";
      begin(firstContent + i);
      pushStr("<< /Length " + body.length + " >>\nstream\n" + body + "endstream\n");
      end();
    });

    var xref = length;
    var out = "xref\n0 " + (total + 1) + "\n0000000000 65535 f \n";
    for (var n = 1; n <= total; n++) {
      out += ("0000000000" + (offsets[n] || 0)).slice(-10) + " 00000 n \n";
    }
    out += "trailer\n<< /Size " + (total + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
    pushStr(out);

    return new Blob(parts, { type: "application/pdf" });
  };

  ICB.pdf = {
    Doc: Doc,
    textWidth: textWidth,
    wrap: wrap,
    A4: A4
  };
})();
