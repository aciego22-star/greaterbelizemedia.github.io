/* ============================================================================
   ICB.art — crafted visual system, pass 2: "red light, black ground".
   Every visual panel is generated inline SVG: deep charcoal grounds, red
   light (glows, discs, signals), white fine linework, architectural
   silhouettes, film grain. Zero external image requests; nothing can
   render broken. Every panel carries exactly one red idea.

   The Belize outline is geographically accurate: derived from 1:1m
   coastline data (open ODbL source), simplified for clean rendering.

   Photography upgrade path: panels carry data-img-slot attributes and
   ICB.art.enhance() fades approved photos in over the artwork when sources
   are provided in js/data/images.js (see IMAGES.md).
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var uid = 0;
  function nid(p) { uid += 1; return p + uid; }

  /* Palette (mirrors css tokens; art is intentionally self-contained) */
  var RED = "#D12126";
  var RED_SOFT = "#E5504E";
  var INK_DEEP = "#060607";
  var WHITE = "#FFFFFF";
  var WARM = "#F5F4F2";

  /* ------------------------------------------------------------------ */
  /* Accurate Belize geometry (viewBox 0 0 300 560)                      */
  /* ------------------------------------------------------------------ */

  var BELIZE_MAIN = "M25.6 177.5 L25.6 157.1 L28.8 151.7 L32.0 152.2 L42.6 146.6 L49.4 149.8 L48.8 151.7 L51.5 155.9 L52.1 154.1 L55.9 155.1 L58.1 153.9 L62.0 161.1 L71.4 164.6 L71.5 159.5 L83.3 150.5 L82.6 148.4 L85.6 146.0 L86.0 141.6 L93.9 137.3 L93.4 133.4 L94.9 131.2 L93.6 129.3 L99.7 120.7 L96.9 117.2 L109.8 110.5 L112.6 99.8 L111.3 99.3 L120.9 88.0 L119.7 85.7 L124.8 71.5 L131.3 66.2 L135.0 67.2 L136.0 69.2 L143.2 65.8 L146.6 68.6 L155.1 66.7 L158.7 69.6 L159.8 72.1 L156.4 76.3 L143.9 84.9 L144.2 88.9 L146.1 90.5 L144.8 91.5 L156.2 87.1 L152.1 92.0 L154.1 93.6 L168.7 88.2 L170.3 89.5 L168.9 90.2 L169.6 91.6 L174.1 89.7 L171.6 94.1 L191.0 85.9 L189.8 91.5 L187.0 91.6 L186.1 95.2 L182.3 97.6 L186.4 96.8 L187.6 93.6 L190.4 94.4 L191.1 90.7 L190.0 101.0 L191.5 100.5 L192.2 113.0 L189.7 130.7 L189.3 128.5 L186.6 138.3 L182.1 136.6 L183.8 139.3 L182.8 138.3 L180.9 140.4 L183.2 141.7 L179.6 143.3 L181.3 143.5 L182.1 146.3 L180.4 145.8 L181.4 147.6 L179.2 148.2 L179.8 150.7 L177.8 152.5 L179.7 153.8 L176.7 154.8 L174.0 159.4 L174.3 162.5 L175.8 160.4 L170.1 193.7 L171.4 181.9 L169.8 180.9 L167.0 185.2 L168.0 185.8 L165.7 186.9 L166.7 190.0 L162.7 191.9 L164.7 195.4 L168.2 195.8 L170.0 194.1 L164.0 205.4 L161.1 206.1 L164.7 202.5 L162.8 199.9 L159.9 205.0 L160.9 205.8 L161.6 203.3 L163.3 203.7 L161.1 204.0 L159.5 210.0 L162.0 218.9 L161.0 219.9 L162.3 219.2 L161.4 220.8 L162.4 219.2 L164.8 221.7 L168.7 222.5 L170.7 226.6 L174.1 227.3 L175.0 225.9 L177.9 230.0 L173.7 233.6 L170.5 230.9 L167.0 233.7 L158.6 271.9 L159.2 291.8 L162.7 299.7 L167.7 300.6 L172.0 316.6 L170.6 321.4 L162.6 324.7 L160.9 329.5 L166.9 343.2 L163.4 343.1 L157.5 349.6 L159.1 357.2 L157.4 361.0 L157.7 366.4 L151.1 373.2 L149.0 380.6 L150.5 386.3 L148.6 389.3 L149.3 391.2 L143.9 393.1 L142.6 390.7 L139.8 390.2 L143.4 393.1 L140.2 397.2 L137.8 395.8 L138.3 400.8 L135.9 399.5 L137.3 402.2 L134.7 401.2 L135.5 402.3 L133.3 403.0 L132.6 401.1 L132.2 402.3 L135.9 402.9 L136.1 407.0 L134.0 407.0 L131.1 410.1 L129.1 418.8 L121.4 425.7 L120.9 430.7 L116.2 431.3 L114.8 435.8 L114.3 432.6 L112.1 433.9 L104.9 428.7 L102.6 434.4 L101.2 433.5 L96.9 435.1 L96.8 436.5 L92.6 436.2 L88.7 440.0 L89.8 444.1 L87.9 446.2 L89.6 447.8 L87.9 450.5 L88.6 452.8 L81.5 455.8 L79.2 462.1 L76.1 462.3 L72.4 465.9 L71.6 470.4 L60.2 477.5 L59.7 481.5 L63.1 491.8 L61.7 493.9 L56.5 493.8 L50.3 491.1 L46.5 492.8 L46.3 490.0 L43.0 489.4 L41.5 491.5 L41.1 489.0 L39.3 491.8 L37.7 490.2 L37.0 492.3 L33.1 489.8 L31.2 490.7 L31.6 492.5 L28.7 490.6 L26.0 492.4 L21.7 489.7 L20.1 492.2 L16.3 492.2 L14.7 494.2 L14.0 492.6 L25.9 301.6 L25.6 177.5 Z";

  var BELIZE_ISLANDS = ["M235.0 224.8 L235.9 221.5 L238.3 224.8 L240.5 223.6 L238.4 227.1 L241.5 228.8 L243.6 227.6 L243.4 228.6 L238.3 232.2 L235.9 238.2 L234.3 238.0 L236.1 239.0 L232.8 241.8 L230.3 242.0 L229.9 238.0 L227.0 239.5 L226.5 242.0 L224.4 240.8 L222.9 241.9 L222.1 247.4 L220.2 248.7 L222.9 247.7 L221.8 250.0 L222.6 251.8 L221.0 256.0 L220.2 255.3 L219.1 257.3 L219.0 261.0 L217.6 261.4 L219.4 262.7 L218.1 263.2 L218.4 269.3 L215.7 262.4 L219.1 255.0 L221.0 254.5 L219.1 252.7 L221.9 252.2 L221.0 249.0 L219.7 250.0 L219.2 248.7 L220.2 248.7 L219.1 248.5 L218.8 252.1 L218.2 248.5 L227.5 232.9 L229.4 233.5 L227.1 235.0 L227.0 237.0 L233.4 235.8 L232.8 234.9 L234.9 234.2 L235.2 230.5 L239.3 229.2 L239.2 227.9 L237.6 227.9 L238.1 225.3 L235.8 224.3 L234.7 227.9 L233.3 228.3 L235.0 224.8 Z", "M231.5 127.9 L225.4 133.3 L216.9 153.6 L212.2 159.1 L218.5 149.6 L220.0 145.1 L218.1 144.0 L220.0 143.1 L221.8 138.2 L219.8 136.9 L217.5 138.6 L216.5 137.1 L215.9 139.1 L216.1 137.1 L218.3 133.9 L219.3 134.7 L221.2 133.3 L220.0 132.7 L220.5 130.4 L219.8 132.7 L218.5 133.0 L218.6 131.4 L221.8 127.9 L222.4 123.9 L223.0 125.7 L224.3 124.9 L223.4 125.0 L224.7 123.2 L223.7 123.6 L223.8 121.1 L226.5 117.2 L229.1 120.8 L229.9 128.3 L233.0 126.6 L230.5 117.3 L233.3 126.6 L231.5 127.9 Z", "M213.3 146.7 L215.9 142.0 L217.1 143.3 L216.2 145.0 L217.7 143.1 L218.3 143.8 L216.2 150.7 L210.2 158.5 L209.0 156.6 L206.9 159.2 L213.3 146.7 Z", "M207.3 165.5 L206.1 163.1 L207.1 163.0 L206.6 164.4 L208.9 163.0 L213.0 158.7 L207.6 166.8 L203.1 167.8 L201.4 166.3 L205.5 165.0 L206.9 166.5 L207.3 165.5 Z", "M230.0 265.8 L228.5 263.9 L231.4 265.0 L229.8 262.0 L232.9 262.5 L230.9 266.7 L228.1 267.1 L230.0 267.0 L230.0 265.8 Z", "M233.3 243.6 L234.1 241.3 L236.0 241.4 L234.5 243.9 L238.7 256.9 L237.2 261.5 L236.2 261.1 L237.6 259.0 L236.3 257.9 L232.8 261.3 L234.5 258.1 L234.0 251.6 L235.5 251.4 L235.8 249.5 L234.5 245.0 L232.3 244.6 L233.3 243.6 Z", "M235.5 264.2 L236.3 264.9 L234.1 268.2 L232.1 268.2 L231.2 269.9 L228.1 268.7 L231.8 268.1 L232.5 266.8 L233.4 268.1 L235.5 264.2 Z", "M209.7 132.6 L210.4 130.8 L211.5 132.1 L212.4 130.8 L211.0 134.7 L208.2 134.8 L209.7 132.6 Z", "M214.4 131.1 L213.3 132.4 L214.4 130.5 L213.3 131.4 L212.9 129.9 L215.9 129.2 L214.4 131.1 Z", "M223.1 272.9 L224.3 272.2 L225.5 273.1 L224.5 274.4 L226.3 274.7 L227.1 271.3 L228.8 271.9 L226.9 276.5 L224.2 275.5 L223.1 272.9 Z", "M208.4 161.0 L209.2 157.8 L208.7 161.0 L207.1 161.7 L207.8 159.6 L208.4 161.0 Z"];

  /* ------------------------------------------------------------------ */
  /* Primitives — each returns { d: defsMarkup, b: bodyMarkup }          */
  /* ------------------------------------------------------------------ */

  function part(d, b) { return { d: d || "", b: b || "" }; }

  function compose(parts) {
    var d = "", b = "";
    for (var i = 0; i < parts.length; i++) { d += parts[i].d; b += parts[i].b; }
    return { d: d, b: b };
  }

  function ground(stops) {
    var id = nid("g");
    stops = stops || [[0, "#1B1A1B"], [0.55, "#121214"], [1, "#0B0B0C"]];
    var g = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">';
    for (var i = 0; i < stops.length; i++) {
      g += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"/>';
    }
    g += "</linearGradient>";
    return part(g, '<rect width="800" height="450" fill="url(#' + id + ')"/>');
  }

  function glow(cx, cy, r, hex, a) {
    var id = nid("gl");
    var g = '<radialGradient id="' + id + '">' +
      '<stop offset="0" stop-color="' + hex + '" stop-opacity="' + a + '"/>' +
      '<stop offset="0.7" stop-color="' + hex + '" stop-opacity="' + (a * 0.35) + '"/>' +
      '<stop offset="1" stop-color="' + hex + '" stop-opacity="0"/></radialGradient>';
    return part(g, '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="url(#' + id + ')"/>');
  }

  function line(x1, y1, x2, y2, stroke, w, o, dash) {
    return part("", '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 +
      '" stroke="' + stroke + '" stroke-width="' + w + '" opacity="' + o + '"' +
      (dash ? ' stroke-dasharray="' + dash + '"' : "") + ' stroke-linecap="round"/>');
  }

  function pathLine(d, stroke, w, o, dash) {
    return part("", '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="' + w +
      '" opacity="' + o + '"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") +
      ' stroke-linecap="round" stroke-linejoin="round"/>');
  }

  function shape(d, fill, o, stroke, sw, so) {
    var out = '<path d="' + d + '" fill="' + fill + '" fill-opacity="' + o + '"';
    if (stroke) out += ' stroke="' + stroke + '" stroke-width="' + (sw || 1) + '" stroke-opacity="' + (so || 0.3) + '"';
    return part("", out + "/>");
  }

  function rect(x, y, w, h, fill, o) {
    return part("", '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
      '" fill="' + fill + '" opacity="' + o + '"/>');
  }

  function circle(cx, cy, r, fill, o, stroke, sw) {
    var out = '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '"';
    out += stroke ? ' fill="none" stroke="' + stroke + '" stroke-width="' + (sw || 1) + '"' : ' fill="' + fill + '"';
    return part("", out + ' opacity="' + o + '"/>');
  }

  /* Horizontal sky hairlines, opacity graded top to bottom. */
  function skylines(y0, count, step, o0, o1, stroke) {
    var b = "";
    for (var i = 0; i < count; i++) {
      var o = o0 + (o1 - o0) * (i / Math.max(1, count - 1));
      b += '<line x1="0" y1="' + (y0 + i * step) + '" x2="800" y2="' + (y0 + i * step) +
        '" stroke="' + (stroke || WHITE) + '" stroke-width="1" opacity="' + o.toFixed(3) + '"/>';
    }
    return part("", b);
  }

  function grid(x0, y0, x1, y1, step, o) {
    var b = "";
    for (var x = x0; x <= x1; x += step) {
      b += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + y1 + '" stroke="' + WHITE + '" stroke-width="0.6" opacity="' + o + '"/>';
    }
    for (var y = y0; y <= y1; y += step) {
      b += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="' + WHITE + '" stroke-width="0.6" opacity="' + o + '"/>';
    }
    return part("", b);
  }

  function guilloche(cx, cy, rx, ry, n, rotStep, stroke, o) {
    var b = "";
    for (var i = 0; i < n; i++) {
      b += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + (rx + i * 6) + '" ry="' + (ry + i * 4) + '"' +
        ' fill="none" stroke="' + stroke + '" stroke-width="0.75" opacity="' + o + '"' +
        ' transform="rotate(' + (i * rotStep) + " " + cx + " " + cy + ')"/>';
    }
    return part("", b);
  }

  function waves(y0, count, gap, amp, o0, o1) {
    var b = "";
    for (var i = 0; i < count; i++) {
      var y = y0 + i * gap;
      var a = amp * (1 - i / (count * 1.8));
      var o = o0 + (o1 - o0) * (i / Math.max(1, count - 1));
      var d = "M0 " + y;
      for (var s = 0; s < 4; s++) {
        d += " q100 " + ((s % 2 === 0 ? -1 : 1) * a).toFixed(1) + " 200 0";
      }
      b += '<path d="' + d + '" fill="none" stroke="' + WHITE + '" stroke-width="0.9" opacity="' + o.toFixed(3) + '"/>';
    }
    return part("", b);
  }

  /* Architectural silhouette: filled dark polygon + edge-light polyline. */
  function silhouette(pts, edgeUpTo, edgeO) {
    var d = "M" + pts.map(function (p) { return p[0] + " " + p[1]; }).join(" L") + " Z";
    var body = '<path d="' + d + '" fill="' + INK_DEEP + '" fill-opacity="0.93"/>';
    if (edgeUpTo) {
      var edge = pts.slice(0, edgeUpTo);
      body += '<polyline points="' + edge.map(function (p) { return p[0] + "," + p[1]; }).join(" ") +
        '" fill="none" stroke="' + WHITE + '" stroke-width="1" opacity="' + (edgeO || 0.3) + '"/>';
    }
    return part("", body);
  }

  function vignette() {
    var id = nid("v");
    return part(
      '<radialGradient id="' + id + '" cx="0.5" cy="0.46" r="0.75">' +
      '<stop offset="0" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="0.72" stop-color="#000" stop-opacity="0"/>' +
      '<stop offset="1" stop-color="#000" stop-opacity="0.38"/></radialGradient>',
      '<rect width="800" height="450" fill="url(#' + id + ')"/>'
    );
  }

  function grain(a) {
    var id = nid("n");
    return part(
      '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>' +
      '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ' + a + ' 0"/></filter>',
      '<rect width="800" height="450" filter="url(#' + id + ')"/>'
    );
  }

  /* Belize outline group (accurate), stroke-only watermark. */
  function belizeOutline(tx, ty, s, stroke, o) {
    var sw = (1.1 / s).toFixed(2);
    var b = '<g transform="translate(' + tx + " " + ty + ') scale(' + s + ')">' +
      '<path d="' + BELIZE_MAIN + '" fill="rgba(255,255,255,0.03)" stroke="' + stroke + '" stroke-width="' + sw + '" opacity="' + o + '"/>';
    for (var i = 0; i < BELIZE_ISLANDS.length; i++) {
      b += '<path d="' + BELIZE_ISLANDS[i] + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '" opacity="' + (o * 0.8) + '"/>';
    }
    return part("", b + "</g>");
  }

  /* Marker positions inside the 300x560 map space (accurate projections). */
  var MAP_PTS = {
    corozal: [145.4, 82.6], "orange-walk": [118.0, 133.9], "san-pedro": [211.6, 160.2],
    ladyville: [160.3, 219.8], corporate: [176.8, 228.6], "belize-city-southside": [174.6, 231.2],
    belmopan: [85.5, 270.3], "san-ignacio": [38.3, 285.7], dangriga: [171.4, 316.2],
    "punta-gorda": [79.4, 459.3]
  };

  function mapPoint(id, tx, ty, s) {
    var p = MAP_PTS[id];
    return [tx + p[0] * s, ty + p[1] * s];
  }

  /* ------------------------------------------------------------------ */
  /* Motif recipes                                                       */
  /* ------------------------------------------------------------------ */

  function roofline(pts, litWindow) {
    var poly = pts.concat([[800, 450], [0, 450]]);
    var parts = [silhouette(poly, pts.length, 0.3)];
    if (litWindow) {
      parts.push(rect(litWindow[0], litWindow[1], litWindow[2], litWindow[3], RED, 0.85));
      parts.push(glow(litWindow[0] + litWindow[2] / 2, litWindow[1] + litWindow[3] / 2, 90, RED, 0.35));
    }
    return compose(parts);
  }

  var MOTIFS = {

    /* --- Hero slides --- */

    "hero-home": function () {
      return compose([
        ground(),
        glow(600, 330, 220, RED, 0.5),
        part("", '<clipPath id="hclip1"><rect x="0" y="0" width="800" height="300"/></clipPath>' +
          '<circle cx="600" cy="300" r="120" fill="' + RED + '" opacity="0.35" clip-path="url(#hclip1)"/>'),
        line(0, 300, 800, 300, RED_SOFT, 1.5, 0.8),
        line(0, 307, 800, 307, WHITE, 1, 0.15),
        skylines(36, 12, 18, 0.12, 0.05),
        roofline([[0, 330], [70, 330], [140, 252], [210, 330], [300, 330], [330, 300], [420, 232], [510, 300], [540, 330], [620, 330], [660, 266], [700, 300], [800, 300]], [438, 322, 22, 28]),
        vignette(), grain(0.05)
      ]);
    },

    "hero-path": function () {
      return compose([
        ground([[0, "#141416"], [1, "#0B0B0C"]]),
        glow(560, 200, 180, RED, 0.4),
        line(0, 200, 800, 200, WHITE, 1, 0.2),
        line(40, 450, 560, 200, WHITE, 1, 0.35),
        line(760, 450, 560, 200, WHITE, 1, 0.35),
        line(180, 450, 560, 200, WHITE, 1, 0.15),
        line(660, 450, 560, 200, WHITE, 1, 0.15),
        line(400, 450, 560, 200, RED, 2.5, 0.85, "20 26"),
        circle(440, 388, 5, RED, 0.95), circle(440, 388, 11, null, 0.25, WHITE, 1),
        circle(472, 338, 4, RED, 0.9), circle(472, 338, 10, null, 0.22, WHITE, 1),
        circle(504, 288, 3.5, RED, 0.85), circle(504, 288, 9, null, 0.2, WHITE, 1),
        circle(536, 238, 3, RED, 0.8), circle(536, 238, 8, null, 0.18, WHITE, 1),
        vignette(), grain(0.05)
      ]);
    },

    "hero-breadth": function () {
      var parts = [ground(), grid(0, 0, 800, 450, 64, 0.10)];
      var radii = [90, 130, 170, 210, 250, 290, 330];
      var ops = [0.7, 0.6, 0.5, 0.4, 0.3, 0.25, 0.2];
      for (var i = 0; i < radii.length; i++) {
        parts.push(pathLine("M" + (800 - radii[i]) + " 450 A" + radii[i] + " " + radii[i] + " 0 0 1 800 " + (450 - radii[i]), RED, 1.5, ops[i]));
      }
      parts.push(pathLine("M736 450 A64 64 0 0 1 800 386 L800 450 Z", RED, 0, 0));
      parts.push(shape("M736 450 A64 64 0 0 1 800 386 L800 450 Z", RED, 0.3));
      for (var x = 64; x <= 448; x += 64) {
        parts.push(rect(x - 5, 187, 10, 10, WHITE, 0.5));
      }
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },

    "hero-nation": function () {
      var tx = 470, ty = 25, s = 0.71;
      var order = ["corozal", "orange-walk", "corporate", "belmopan", "dangriga", "punta-gorda"];
      var pts = order.map(function (id) { return mapPoint(id, tx, ty, s); });
      var d = "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L");
      var parts = [
        ground(),
        glow(580, 240, 260, RED, 0.3),
        belizeOutline(tx, ty, s, WARM, 0.55),
        skylines(120, 9, 30, 0.08, 0.03),
        pathLine(d, RED, 1.8, 0.9, "2 8")
      ];
      pts.forEach(function (p) {
        parts.push(circle(p[0], p[1], 4, RED, 0.95));
        parts.push(circle(p[0], p[1], 9, null, 0.5, RED_SOFT, 1));
      });
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },

    /* --- Product panels --- */

    property: function () {
      return compose([
        ground(),
        grid(0, 60, 800, 450, 56, 0.07),
        roofline([[0, 330], [180, 330], [300, 212], [420, 330], [470, 330], [560, 248], [650, 330], [800, 330]], [332, 268, 26, 30]),
        vignette(), grain(0.05)
      ]);
    },

    motor: function () {
      var id = nid("tl");
      return compose([
        ground([[0, "#141416"], [1, "#0B0B0C"]]),
        line(0, 190, 800, 190, WHITE, 1, 0.25),
        line(60, 450, 620, 190, WHITE, 1, 0.3),
        line(740, 450, 620, 190, WHITE, 1, 0.3),
        line(400, 450, 620, 190, WHITE, 1, 0.35, "14 18"),
        part('<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="' + RED + '" stop-opacity="0.9"/>' +
          '<stop offset="1" stop-color="' + RED + '" stop-opacity="0"/></linearGradient>',
          '<rect x="180" y="262" width="260" height="6" rx="3" fill="url(#' + id + ')"/>' +
          '<rect x="240" y="288" width="200" height="4" rx="2" fill="url(#' + id + ')" opacity="0.7"/>' +
          '<rect x="186" y="264" width="140" height="2" fill="' + WHITE + '" opacity="0.35"/>'),
        vignette(), grain(0.05)
      ]);
    },

    marine: function () {
      return compose([
        ground([[0, "#1D1C1E"], [0.4, "#121214"], [1, "#0B0B0C"]]),
        line(0, 170, 800, 170, WARM, 1, 0.5),
        waves(190, 10, 16, 7, 0.20, 0.08),
        silhouette([[760, 120], [430, 300], [800, 340], [800, 120]], 2, 0.3),
        line(474, 302, 800, 332, RED, 3, 0.9),
        vignette(), grain(0.05)
      ]);
    },

    cargo: function () {
      var parts = [ground(), line(0, 90, 520, 30, WHITE, 1, 0.3), line(380, 44, 380, 130, WHITE, 1, 0.25)];
      var stacks = [[470, 2], [590, 3], [700, 2]];
      stacks.forEach(function (st) {
        for (var i = 0; i < st[1]; i++) {
          var y = 380 - (i + 1) * 46;
          parts.push(part("", '<rect x="' + st[0] + '" y="' + y + '" width="96" height="44" fill="#0A0A0B" fill-opacity="0.9" stroke="' + WHITE + '" stroke-width="0.8" stroke-opacity="0.18"/>'));
          for (var vx = st[0] + 12; vx < st[0] + 96; vx += 12) {
            parts.push(line(vx, y + 4, vx, y + 40, WHITE, 0.5, 0.10));
          }
        }
      });
      parts.push(part("", '<rect x="590" y="288" width="96" height="44" fill="none" stroke="' + RED + '" stroke-width="1.5" opacity="0.9"/>'));
      parts.push(line(0, 410, 800, 410, RED, 1, 0.4, "2 8"));
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },

    liability: function () {
      return compose([
        ground([[0, "#121214"], [1, "#0B0B0C"]]),
        guilloche(620, 225, 60, 42, 24, 7.5, WARM, 0.14),
        guilloche(620, 225, 26, 18, 8, 22, RED, 0.45),
        line(60, 225, 470, 225, RED_SOFT, 1.2, 0.7),
        pathLine("M40 40 h14 M40 40 v14 M760 40 h-14 M760 40 v14 M40 410 h14 M40 410 v-14 M760 410 h-14 M760 410 v-14", WHITE, 1, 0.3),
        vignette(), grain(0.05)
      ]);
    },

    travel: function () {
      return compose([
        ground(),
        line(400, 450, 430, 300, WHITE, 2, 0.5, "10 16"),
        pathLine("M90 380 Q380 60 740 90", RED_SOFT, 1.6, 0.9, "1 9"),
        circle(90, 380, 4, RED, 0.95), circle(740, 90, 4, RED, 0.95),
        circle(660, 110, 110, WHITE, 0.05),
        circle(660, 110, 110, null, 0.12, WHITE, 1),
        skylines(330, 3, 24, 0.10, 0.05),
        vignette(), grain(0.05)
      ]);
    },

    mexican: function () {
      return compose([
        ground(),
        line(300, 450, 400, 140, WHITE, 1, 0.3),
        line(520, 450, 420, 140, WHITE, 1, 0.3),
        line(415, 450, 410, 140, RED, 2, 0.85, "14 16"),
        silhouette([[330, 140], [344, 140], [344, 260], [330, 260]], 0),
        silhouette([[456, 140], [470, 140], [470, 260], [456, 260]], 0),
        line(344, 190, 456, 162, RED, 3, 0.9),
        part("", '<rect x="500" y="120" width="44" height="30" fill="none" stroke="' + WHITE + '" stroke-width="1" opacity="0.3"/>'),
        vignette(), grain(0.05)
      ]);
    },

    /* --- Section panels --- */

    claims: function () {
      var parts = [ground([[0, "#0E0E10"], [1, "#0B0B0C"]])];
      var radii = [70, 140, 210, 280, 350, 420];
      var ops = [0.16, 0.13, 0.10, 0.08, 0.06, 0.05];
      for (var i = 0; i < radii.length; i++) {
        parts.push(circle(110, 330, radii[i], null, ops[i], WARM, 1));
      }
      parts.push(glow(110, 330, 160, RED, 0.5));
      parts.push(line(110, 330, 760, 330, RED, 3, 0.95));
      [110, 330, 545, 750].forEach(function (x) {
        parts.push(circle(x, 330, 10, RED, 1));
        parts.push(circle(x, 330, 4, "#0B0B0C", 1));
        parts.push(circle(x, 330, 18, null, 0.2, WHITE, 1));
      });
      [220, 437, 647].forEach(function (x) {
        parts.push(line(x, 315, x, 345, WHITE, 1, 0.12));
      });
      parts.push(vignette(), grain(0.06));
      return compose(parts);
    },

    business: function () {
      var parts = [ground(), grid(0, 0, 800, 220, 48, 0.07)];
      parts.push(line(0, 310, 800, 310, RED, 1, 0.4));
      var towers = [[60, 240, 90], [170, 190, 110], [300, 150, 120], [440, 210, 80], [540, 260, 100], [660, 230, 95]];
      towers.forEach(function (t) {
        parts.push(part("", '<rect x="' + t[0] + '" y="' + t[1] + '" width="' + t[2] + '" height="' + (450 - t[1]) + '" fill="#08080A" fill-opacity="0.95"/>' +
          '<line x1="' + t[0] + '" y1="' + t[1] + '" x2="' + (t[0] + t[2]) + '" y2="' + t[1] + '" stroke="' + WHITE + '" stroke-width="1" opacity="0.3"/>'));
      });
      var win = "";
      for (var r = 0; r < 8; r++) {
        for (var c = 0; c < 4; c++) {
          if ((r * 5 + c * 3) % 4 === 0) {
            win += '<rect x="' + (316 + c * 24) + '" y="' + (170 + r * 26) + '" width="6" height="8" fill="' + WHITE + '" opacity="0.35"/>';
          }
        }
      }
      win += '<rect x="340" y="196" width="6" height="8" fill="' + RED + '" opacity="0.8"/>' +
        '<rect x="364" y="222" width="6" height="8" fill="' + RED + '" opacity="0.8"/>' +
        '<rect x="316" y="248" width="6" height="8" fill="' + RED + '" opacity="0.8"/>' +
        '<rect x="388" y="170" width="6" height="8" fill="' + RED + '" opacity="0.8"/>' +
        '<rect x="340" y="274" width="6" height="8" fill="' + RED + '" opacity="0.8"/>';
      parts.push(part("", win));
      var idg = nid("ix");
      parts.push(part('<linearGradient id="' + idg + '" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="' + WHITE + '" stop-opacity="0.4"/>' +
        '<stop offset="0.66" stop-color="' + WHITE + '" stop-opacity="0.4"/>' +
        '<stop offset="1" stop-color="' + RED_SOFT + '" stop-opacity="0.7"/></linearGradient>',
        '<path d="M60 380 L200 330 L300 300 L430 180" fill="none" stroke="url(#' + idg + ')" stroke-width="1.5"/>'));
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },

    poster: function () {
      return compose([
        ground([[0, "#141416"], [1, "#121214"]]),
        glow(400, 210, 260, WHITE, 0.05),
        rect(0, 0, 800, 56, INK_DEEP, 0.9),
        rect(0, 394, 800, 56, INK_DEEP, 0.9),
        line(60, 225, 356, 225, RED, 1.5, 0.7),
        line(444, 225, 740, 225, RED, 1.5, 0.7),
        pathLine("M84 84 h12 M84 84 v12 M716 84 h-12 M716 84 v12 M84 366 h12 M84 366 v-12 M716 366 h-12 M716 366 v-12", WHITE, 1.2, 0.4),
        belizeOutline(560, 100, 0.44, WHITE, 0.10),
        vignette(), grain(0.07)
      ]);
    },

    heritage: function () {
      return compose([
        ground(),
        line(180, 60, 180, 390, WHITE, 1, 0.3),
        part("", [1, 2, 3, 4, 5, 6, 7, 8].map(function (i) {
          return '<line x1="174" y1="' + (60 + i * 38) + '" x2="186" y2="' + (60 + i * 38) + '" stroke="' + WHITE + '" stroke-width="1" opacity="0.2"/>';
        }).join("")),
        circle(180, 100, 6, RED, 1),
        circle(180, 100, 14, null, 0.5, RED_SOFT, 1),
        glow(180, 100, 120, RED, 0.35),
        guilloche(560, 250, 60, 40, 12, 9, WHITE, 0.10),
        line(420, 250, 720, 250, RED, 1, 0.5),
        vignette(), grain(0.05)
      ]);
    },

    contact: function () {
      var parts = [ground([[0, "#1A1A1D"], [1, "#121214"]])];
      var radii = [40, 100, 160, 220, 280, 340];
      for (var i = 0; i < radii.length; i++) {
        parts.push(circle(170, 225, radii[i], null, (0.14 - i * 0.018).toFixed(3), WHITE, 1));
      }
      parts.push(circle(170, 225, 6, RED, 1));
      parts.push(circle(170, 225, 20, null, 0.8, RED, 1.5));
      parts.push(glow(170, 225, 110, RED, 0.4));
      parts.push(line(520, 80, 780, 40, WHITE, 1, 0.08));
      parts.push(line(560, 140, 800, 110, WHITE, 1, 0.08));
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },

    /* --- District gallery panels --- */

    "d-corozal": function () {
      return compose([
        ground(),
        line(0, 130, 800, 130, WHITE, 1, 0.3),
        part("", '<clipPath id="czclip"><rect x="0" y="0" width="800" height="130"/></clipPath>' +
          '<circle cx="610" cy="130" r="60" fill="' + RED + '" opacity="0.3" clip-path="url(#czclip)"/>'),
        waves(150, 6, 24, 8, 0.18, 0.08),
        districtKit("corozal"),
        vignette(), grain(0.05)
      ]);
    },
    "d-orange-walk": function () {
      return compose([
        ground(),
        pathLine("M0 300 C200 280 340 240 480 220 C600 204 700 190 800 180", WARM, 1.5, 0.4),
        pathLine("M0 316 C200 296 340 256 480 236 C600 220 700 206 800 196", WARM, 1, 0.15),
        pathLine("M0 286 C200 266 340 226 480 206 C600 190 700 176 800 166", WARM, 1, 0.15),
        districtKit("orange-walk"),
        vignette(), grain(0.05)
      ]);
    },
    "d-belize": function () {
      return compose([
        ground(),
        silhouette([[0, 360], [110, 360], [110, 330], [200, 330], [200, 352], [320, 352], [320, 338], [430, 338], [430, 360], [560, 360], [560, 344], [700, 344], [700, 360], [800, 360]].concat([[800, 450], [0, 450]]), 14, 0.25),
        line(640, 300, 520, 210, WHITE, 1, 0.12),
        line(640, 300, 560, 180, WHITE, 1, 0.12),
        circle(640, 300, 4, RED, 0.95),
        districtKit("belize"),
        vignette(), grain(0.05)
      ]);
    },
    "d-cayo": function () {
      return compose([
        ground(),
        skylines(140, 4, 26, 0.12, 0.05),
        silhouette([[410, 330], [440, 330], [440, 306], [470, 306], [470, 282], [500, 282], [500, 258], [560, 258], [560, 282], [590, 282], [590, 306], [620, 306], [620, 330], [650, 330]].concat([[650, 450], [410, 450]]), 14, 0.3),
        districtKit("cayo"),
        vignette(), grain(0.05)
      ]);
    },
    "d-stann-creek": function () {
      var parts = [ground(), line(340, 280, 800, 280, WHITE, 1.2, 0.35)];
      for (var x = 380; x <= 760; x += 76) {
        parts.push(line(x, 280, x, 340, WHITE, 1, 0.2));
      }
      parts.push(waves(300, 5, 22, 7, 0.15, 0.06));
      parts.push(circle(348, 276, 4, RED, 0.95));
      parts.push(glow(348, 276, 70, RED, 0.35));
      parts.push(districtKit("stann-creek"));
      parts.push(vignette(), grain(0.05));
      return compose(parts);
    },
    "d-toledo": function () {
      return compose([
        ground(),
        pathLine("M0 320 Q200 268 420 300 Q620 328 800 296", WHITE, 1.2, 0.20),
        pathLine("M0 356 Q220 314 440 340 Q640 362 800 336", WHITE, 1, 0.13),
        pathLine("M0 392 Q240 360 460 380 Q660 396 800 376", WHITE, 1, 0.08),
        pathLine("M120 450 Q170 400 150 356 Q136 320 190 300", RED, 1.2, 0.7, "2 8"),
        districtKit("toledo"),
        vignette(), grain(0.05)
      ]);
    }
  };

  /* District node + Belize watermark shared kit. */
  var DISTRICT_NODE = {
    corozal: "corozal", "orange-walk": "orange-walk", belize: "corporate",
    cayo: "belmopan", "stann-creek": "dangriga", toledo: "punta-gorda"
  };

  function districtKit(district) {
    var tx = 300, ty = 40, s = 0.6;
    var p = mapPoint(DISTRICT_NODE[district], tx, ty, s);
    return compose([
      belizeOutline(tx, ty, s, WARM, 0.18),
      glow(p[0], p[1], 90, RED, 0.3),
      part("", '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5" fill="' + RED + '"/>' +
        '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="12" fill="none" stroke="' + RED_SOFT + '" stroke-width="1" opacity="0.5"/>')
    ]);
  }

  function panel(motif) {
    var fn = MOTIFS[motif] || MOTIFS.heritage;
    var made = fn();
    return '<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      "<defs>" + made.d + "</defs>" + made.b + "</svg>";
  }

  /* ------------------------------------------------------------------ */
  /* Belize map component (accurate)                                     */
  /* ------------------------------------------------------------------ */

  function belizeMap(options) {
    options = options || {};
    var markers = options.markers || [];
    var labels = options.labels !== false;
    var cls = options.mini ? "belize-map belize-map--mini" : "belize-map";
    var out = '<svg viewBox="0 0 300 560" class="' + cls + '" role="img" aria-label="' +
      (options.ariaLabel || "Map of Belize showing ICB locations") + '">';
    out += '<path d="' + BELIZE_MAIN + '" class="bm-land"/>';
    for (var i = 0; i < BELIZE_ISLANDS.length; i++) {
      out += '<path d="' + BELIZE_ISLANDS[i] + '" class="bm-isle"/>';
    }
    for (var j = 0; j < markers.length; j++) {
      var m = markers[j];
      out += '<g class="bm-marker" data-map-id="' + m.id + '">' +
        '<circle cx="' + m.x + '" cy="' + m.y + '" r="10" class="bm-halo"/>' +
        '<circle cx="' + m.x + '" cy="' + m.y + '" r="4.5" class="bm-dot"/>';
      if (labels && m.label) {
        var anchor = m.labelSide === "left" ? "end" : "start";
        var dx = m.labelSide === "left" ? -12 : 12;
        out += '<text x="' + (m.x + dx) + '" y="' + (m.y + 4) + '" text-anchor="' + anchor + '" class="bm-label">' + m.label + "</text>";
      }
      out += "</g>";
    }
    return out + "</svg>";
  }

  /* ------------------------------------------------------------------ */
  /* Glyph library — 24px grid, 1.5 stroke, round caps.                  */
  /* ------------------------------------------------------------------ */

  var GLYPH_PATHS = {
    shield: '<path d="M12 3.2l7 2.6v5.1c0 4.6-3 8.7-7 10.1-4-1.4-7-5.5-7-10.1V5.8z"/>',
    document: '<path d="M7 3.5h7l4 4v13H7z"/><path d="M14 3.5v4h4"/><path d="M9.5 12h5.5M9.5 15.5h5.5"/>',
    card: '<rect x="3.5" y="6" width="17" height="12.5" rx="2"/><path d="M3.5 10h17M7 14.5h4"/>',
    marker: '<path d="M12 20.8s-6.4-5.9-6.4-10.3C5.6 6.7 8.5 4 12 4s6.4 2.7 6.4 6.5c0 4.4-6.4 10.3-6.4 10.3z"/><circle cx="12" cy="10.4" r="2.3"/>',
    briefcase: '<rect x="3.5" y="8" width="17" height="11.5" rx="2"/><path d="M9 8V6a2 2 0 012-2h2a2 2 0 012 2v2M3.5 13h17"/>',
    chat: '<path d="M12 4c4.7 0 8.5 3 8.5 6.8S16.7 17.6 12 17.6c-.9 0-1.8-.1-2.6-.3L5 19l.9-3.1c-1.5-1.2-2.4-3-2.4-5.1C3.5 7 7.3 4 12 4z"/>',
    house: '<path d="M4.5 11.5L12 4.5l7.5 7"/><path d="M6.5 10v9.5h11V10"/><path d="M10.2 19.5v-5h3.6v5"/>',
    car: '<path d="M5 13.5l1.6-4.6A2 2 0 018.5 7.5h7a2 2 0 011.9 1.4l1.6 4.6"/><path d="M4.5 13.5h15a1 1 0 011 1v3h-2.2M4.5 13.5a1 1 0 00-1 1v3h2.2M8.9 17.5h6.2"/><circle cx="7.3" cy="17.5" r="1.6"/><circle cx="16.7" cy="17.5" r="1.6"/>',
    boat: '<path d="M4 15.5h16l-2.4 4H6.4z"/><path d="M7 15.5V12h10v3.5M12 12V5.5"/><path d="M12 5.5c2.6 0 4.6 1.5 5 3.5h-5z"/>',
    container: '<rect x="3.5" y="7" width="17" height="10.5" rx="1.2"/><path d="M7.5 7v10.5M12 7v10.5M16.5 7v10.5"/>',
    scales: '<path d="M12 4.5v15M6.5 6.5h11M5 19.5h14"/><path d="M6.5 6.5L4 12.5a2.6 2.6 0 005 0zM17.5 6.5L15 12.5a2.6 2.6 0 005 0z"/>',
    plane: '<path d="M10.5 20.5l1.2-6.2-5.9 1.4-1.6-1.5 5.4-2.6L5.5 6l1.5-1.4 6.3 3.2 4.4-4.2a1.5 1.5 0 012.1 2.1l-4.2 4.4 3.2 6.3L17.4 18l-5.6-4.1-1.3 6.6z" transform="scale(0.92) translate(1 1)"/>',
    border: '<path d="M7 20L10 4M17 20L14 4"/><path d="M12 6v2.4M12 11.2v2.4M12 16.4v2.4"/>',
    people: '<circle cx="9" cy="8.5" r="3"/><path d="M3.8 19.5c0-2.9 2.3-5.2 5.2-5.2s5.2 2.3 5.2 5.2"/><path d="M15.5 6.1a3 3 0 010 4.9M17.4 14.6c1.7.8 2.8 2.6 2.8 4.9"/>',
    storm: '<circle cx="12" cy="12" r="2.6"/><path d="M12 4.5A7.5 7.5 0 004.6 11M12 19.5a7.5 7.5 0 007.4-6.5"/><path d="M17.8 5.6A7.5 7.5 0 0119.4 9M6.2 18.4A7.5 7.5 0 014.6 15"/>',
    phone: '<path d="M7.6 4h2.6l1.3 4-2 1.5a11.5 11.5 0 005 5l1.5-2 4 1.3v2.6a2 2 0 01-2.2 2A15.5 15.5 0 015.6 6.2 2 2 0 017.6 4z"/>',
    mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4.5 7.5l7.5 5.5 7.5-5.5"/>',
    external: '<path d="M10 5.5H5.5v13h13V14"/><path d="M13.5 4.5H19.5v6M19 5l-7.5 7.5"/>',
    download: '<path d="M12 4.5v10M8 11l4 4 4-4"/><path d="M4.5 19.5h15"/>',
    play: '<path d="M9 6.5l9 5.5-9 5.5z"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
    compass: '<circle cx="12" cy="12" r="8.2"/><path d="M14.8 9.2l-1.9 4.3-3.7 1.3 1.9-4.3z"/>',
    question: '<circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.6a2.4 2.4 0 114 1.8c-.8.7-1.6 1.1-1.6 2.2"/><circle cx="12" cy="16.6" r="0.4" fill="currentColor" stroke="none"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    pause: '<path d="M9 6v12M15 6v12"/>',
    "chev-left": '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
    "chev-right": '<path d="M9.5 5.5L16 12l-6.5 6.5"/>'
  };

  function glyph(name, cls) {
    var body = GLYPH_PATHS[name] || GLYPH_PATHS.shield;
    return '<svg viewBox="0 0 24 24" class="' + (cls || "glyph") + '" aria-hidden="true" focusable="false"' +
      ' fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      body + "</svg>";
  }

  /* Official WhatsApp brand glyph (accurate speech-bubble-and-handset mark).
     variant "roundel": white glyph on the brand-green circle (directory rows).
     default: brand-green glyph on the current surface. */
  var WA_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

  function waIcon(variant, cls) {
    if (variant === "roundel") {
      return '<svg viewBox="0 0 24 24" class="' + (cls || "wa-roundel") + '" aria-hidden="true" focusable="false">' +
        '<circle cx="12" cy="12" r="12" fill="#25D366"/>' +
        '<g transform="translate(4.8 4.8) scale(0.6)"><path d="' + WA_PATH + '" fill="#FFFFFF"/></g></svg>';
    }
    return '<svg viewBox="0 0 24 24" class="' + (cls || "glyph") + '" aria-hidden="true" focusable="false">' +
      '<path d="' + WA_PATH + '" fill="#25D366"/></svg>';
  }

  /* ------------------------------------------------------------------ */
  /* Photo slot enhancer (dormant until images.js provides sources)      */
  /* ------------------------------------------------------------------ */

  function enhance(root) {
    var slots = (ICB.DATA.images && ICB.DATA.images.slots) || {};
    var nodes = (root || document).querySelectorAll("[data-img-slot]");
    Array.prototype.forEach.call(nodes, function (node) {
      var conf = slots[node.getAttribute("data-img-slot")];
      if (!conf || !conf.src || node.querySelector(".slot-photo")) return;
      var probe = new Image();
      probe.onload = function () {
        var img = document.createElement("img");
        img.src = ICB.assetUrl(conf.src);
        img.alt = conf.alt || "";
        img.className = "slot-photo";
        if (conf.pos) img.style.objectPosition = conf.pos;
        node.appendChild(img);
        requestAnimationFrame(function () { img.classList.add("is-loaded"); });
      };
      // On failure nothing happens: the artwork simply remains.
      probe.src = ICB.assetUrl(conf.src);
    });
  }

  ICB.art = {
    panel: panel,
    belizeMap: belizeMap,
    glyph: glyph,
    waIcon: waIcon,
    enhance: enhance,
    mapPoints: MAP_PTS
  };
})();
