/* ============================================================================
   ICB.art — crafted visual system.
   Every visual panel in the concept is generated here as inline SVG:
   layered gradient washes, fine guilloche line-work (echoing security
   printing on insurance documents), topographic contours, and a simplified
   Belize map. Zero external image requests; nothing can render broken.

   Photography upgrade path: panels carry data-img-slot attributes and
   ICB.art.enhance() fades approved photos in over the artwork when sources
   are provided in js/data/images.js (see IMAGES.md).
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + "-" + uid; }

  /* ------------------------------------------------------------------ */
  /* Primitive generators                                                */
  /* ------------------------------------------------------------------ */

  // Fine concentric ellipse line-work, offset and rotated like the
  // engraved patterns on financial documents.
  function guilloche(cx, cy, rx, ry, n, rotStep, stroke, opacity) {
    var out = "";
    for (var i = 0; i < n; i++) {
      var rot = i * rotStep;
      var drx = rx + i * 6;
      var dry = ry + i * 4;
      out += '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + drx + '" ry="' + dry + '"' +
        ' fill="none" stroke="' + stroke + '" stroke-width="0.75" opacity="' + opacity + '"' +
        ' transform="rotate(' + rot + ' ' + cx + " " + cy + ')"/>';
    }
    return out;
  }

  // Horizontal flowing contour lines.
  function waves(x0, x1, yStart, count, gap, amp, stroke, opacity) {
    var out = "";
    var w = x1 - x0;
    for (var i = 0; i < count; i++) {
      var y = yStart + i * gap;
      var a = amp * (1 - i / (count * 1.6));
      var phase = i * 14;
      var d = "M" + x0 + " " + y;
      var seg = w / 4;
      for (var s = 0; s < 4; s++) {
        var sx = x0 + seg * s;
        var up = (s % 2 === 0) ? -1 : 1;
        d += " q" + (seg / 2) + " " + (up * a + (phase % 7) - 3) + " " + seg + " 0";
      }
      out += '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="0.9" opacity="' + opacity + '"/>';
    }
    return out;
  }

  // Fine architectural grid.
  function grid(x0, y0, x1, y1, step, stroke, opacity) {
    var out = "";
    for (var x = x0; x <= x1; x += step) {
      out += '<line x1="' + x + '" y1="' + y0 + '" x2="' + x + '" y2="' + y1 + '" stroke="' + stroke + '" stroke-width="0.6" opacity="' + opacity + '"/>';
    }
    for (var y = y0; y <= y1; y += step) {
      out += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" stroke="' + stroke + '" stroke-width="0.6" opacity="' + opacity + '"/>';
    }
    return out;
  }

  // Dashed route with node markers.
  function route(points, stroke, opacity, nodeFill) {
    var d = "M" + points[0][0] + " " + points[0][1];
    for (var i = 1; i < points.length; i++) {
      var p = points[i - 1], q = points[i];
      d += " Q" + ((p[0] + q[0]) / 2 + 24) + " " + ((p[1] + q[1]) / 2 - 26) + " " + q[0] + " " + q[1];
    }
    var out = '<path d="' + d + '" fill="none" stroke="' + stroke + '" stroke-width="1.2" stroke-dasharray="1 7" stroke-linecap="round" opacity="' + opacity + '"/>';
    for (var j = 0; j < points.length; j++) {
      out += '<circle cx="' + points[j][0] + '" cy="' + points[j][1] + '" r="3" fill="' + nodeFill + '" opacity="' + (opacity * 1.6) + '"/>';
    }
    return out;
  }

  function grain(id, opacity) {
    return '<filter id="' + id + '"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/>' +
      '<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 ' + opacity + ' 0"/></filter>' +
      '<rect width="100%" height="100%" filter="url(#' + id + ')"/>';
  }

  /* Simplified Belize outline (viewBox 0 0 300 560). Deliberately smoothed;
     an artistic mark, not a survey map. */
  var BELIZE_PATH =
    "M196 16" +
    " C203 26 195 38 201 52" +
    " C209 70 198 84 202 100" +
    " C208 118 199 132 206 148" +
    " C212 164 202 178 210 192" +
    " C218 201 212 212 204 218" +
    " C192 232 197 250 190 268" +
    " C184 288 191 305 184 322" +
    " C178 342 187 360 182 378" +
    " C178 398 189 408 184 420" +
    " C176 440 168 452 158 468" +
    " C150 482 146 492 142 502" +
    " C136 514 129 526 118 534" +
    " L62 522" +
    " C60 470 58 420 58 370" +
    " L58 110" +
    " C82 82 116 62 146 45" +
    " C163 35 181 24 196 16" +
    " Z";

  // Barrier reef / cayes suggestion, offshore.
  var REEF_PATH = "M252 104 C258 130 246 158 240 186 C234 216 231 254 228 292 C226 316 224 336 220 356";

  /* ------------------------------------------------------------------ */
  /* Panel compositions                                                  */
  /* ------------------------------------------------------------------ */

  var GOLD = "#C29A3B";
  var GOLD_SOFT = "#E6C87E";
  var BLUE_LINE = "#7C97B8";
  var PAPER = "#F8F6F1";

  function baseDefs(id, angle, stops) {
    var g = '<linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"';
    if (angle === "v") g = '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"';
    g += ">";
    for (var i = 0; i < stops.length; i++) {
      g += '<stop offset="' + stops[i][0] + '" stop-color="' + stops[i][1] + '"/>';
    }
    return g + "</linearGradient>";
  }

  function belizeWatermark(x, y, scale, stroke, opacity) {
    return '<g transform="translate(' + x + " " + y + ') scale(' + scale + ')">' +
      '<path d="' + BELIZE_PATH + '" fill="none" stroke="' + stroke + '" stroke-width="' + (1.4 / scale) + '" opacity="' + opacity + '"/>' +
      '<path d="' + REEF_PATH + '" fill="none" stroke="' + stroke + '" stroke-width="' + (1.1 / scale) + '" stroke-dasharray="2 6" opacity="' + (opacity * 0.85) + '"/>' +
      "</g>";
  }

  var MOTIFS = {
    hero: function (gid) {
      var fg = gid + "-fade";
      return baseDefs(gid, "v", [[0, "#0A1A2F"], [0.55, "#0E2A4A"], [1, "#143559"]]) +
        '<linearGradient id="' + fg + '" x1="0" y1="0" x2="1" y2="0">' +
          '<stop offset="0" stop-color="#000"/><stop offset="0.34" stop-color="#1c1c1c"/>' +
          '<stop offset="0.62" stop-color="#fff"/></linearGradient>' +
        '<mask id="' + fg + '-m"><rect width="800" height="450" fill="url(#' + fg + ')"/></mask>' +
        "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<g mask="url(#' + fg + '-m)">' +
          guilloche(648, 296, 54, 54, 10, 7, GOLD, 0.17) +
          '<line x1="0" y1="292" x2="800" y2="292" stroke="' + GOLD + '" stroke-width="1" opacity="0.6"/>' +
          waves(0, 800, 312, 8, 17, 7, BLUE_LINE, 0.3) +
        "</g>" +
        belizeWatermark(492, 34, 0.66, GOLD_SOFT, 0.26);
    },
    poster: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        guilloche(400, 225, 90, 58, 12, 15, GOLD, 0.18) +
        guilloche(400, 225, 40, 26, 6, 30, GOLD_SOFT, 0.16) +
        '<line x1="330" y1="330" x2="470" y2="330" stroke="' + GOLD + '" stroke-width="1.2" opacity="0.55"/>';
    },
    property: function (gid) {
      return baseDefs(gid, "d", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        grid(430, 40, 790, 400, 44, BLUE_LINE, 0.19) +
        '<rect x="520" y="128" width="176" height="176" fill="none" stroke="' + GOLD + '" stroke-width="1" opacity="0.4"/>' +
        '<rect x="544" y="152" width="176" height="176" fill="none" stroke="' + GOLD_SOFT + '" stroke-width="0.8" opacity="0.28"/>' +
        waves(0, 340, 330, 4, 20, 6, BLUE_LINE, 0.26);
    },
    motor: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<line x1="0" y1="150" x2="800" y2="150" stroke="' + BLUE_LINE + '" stroke-width="0.9" opacity="0.25"/>' +
        '<path d="M60 450 L560 150" stroke="' + BLUE_LINE + '" stroke-width="1" opacity="0.3" fill="none"/>' +
        '<path d="M420 450 L600 150" stroke="' + BLUE_LINE + '" stroke-width="1" opacity="0.3" fill="none"/>' +
        '<path d="M250 450 L578 150" stroke="' + GOLD + '" stroke-width="1.4" stroke-dasharray="14 18" opacity="0.5" fill="none"/>' +
        guilloche(680, 90, 40, 40, 6, 10, GOLD, 0.16);
    },
    marine: function (gid) {
      return baseDefs(gid, "v", [[0, "#0E2A4A"], [0.5, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<line x1="0" y1="170" x2="800" y2="170" stroke="' + GOLD + '" stroke-width="1" opacity="0.45"/>' +
        waves(0, 800, 200, 9, 24, 9, BLUE_LINE, 0.32) +
        guilloche(150, 100, 46, 46, 6, 12, GOLD_SOFT, 0.16);
    },
    cargo: function (gid) {
      return baseDefs(gid, "d", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        route([[80, 350], [280, 300], [470, 250], [700, 160]], GOLD, 0.45, GOLD_SOFT) +
        grid(40, 60, 260, 200, 40, BLUE_LINE, 0.18);
    },
    liability: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        guilloche(620, 225, 60, 60, 14, 0, BLUE_LINE, 0.18) +
        guilloche(620, 225, 30, 30, 5, 0, GOLD, 0.3) +
        '<line x1="60" y1="225" x2="470" y2="225" stroke="' + GOLD + '" stroke-width="0.9" opacity="0.35"/>';
    },
    travel: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<path d="M90 360 Q400 60 720 200" fill="none" stroke="' + GOLD + '" stroke-width="1.2" stroke-dasharray="1 9" stroke-linecap="round" opacity="0.5"/>' +
        '<circle cx="90" cy="360" r="3.5" fill="' + GOLD_SOFT + '" opacity="0.8"/>' +
        '<circle cx="720" cy="200" r="3.5" fill="' + GOLD_SOFT + '" opacity="0.8"/>' +
        waves(0, 800, 400, 3, 16, 6, BLUE_LINE, 0.24) +
        guilloche(660, 90, 34, 34, 5, 14, BLUE_LINE, 0.2);
    },
    mexican: function (gid) {
      return baseDefs(gid, "d", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<line x1="0" y1="120" x2="800" y2="96" stroke="' + GOLD + '" stroke-width="1" stroke-dasharray="10 8" opacity="0.45"/>' +
        route([[140, 400], [260, 300], [360, 210], [430, 110]], GOLD, 0.4, GOLD_SOFT) +
        '<path d="M640 300 l0 -70 m-12 14 l12 -14 l12 14" fill="none" stroke="' + BLUE_LINE + '" stroke-width="1.4" opacity="0.4"/>';
    },
    /* District gallery motifs */
    corozal: function (gid) {
      return baseDefs(gid, "v", [[0, "#143559"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        waves(0, 800, 90, 5, 20, 8, BLUE_LINE, 0.32) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="512" cy="82" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="512" cy="82" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    "orange-walk": function (gid) {
      return baseDefs(gid, "d", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        waves(0, 800, 130, 8, 26, 11, BLUE_LINE, 0.3) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="494" cy="119" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="494" cy="119" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    belize: function (gid) {
      return baseDefs(gid, "v", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        '<line x1="0" y1="210" x2="800" y2="210" stroke="' + GOLD + '" stroke-width="0.9" opacity="0.4"/>' +
        waves(0, 800, 232, 6, 20, 8, BLUE_LINE, 0.3) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="413" cy="170" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="413" cy="170" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    cayo: function (gid) {
      return baseDefs(gid, "d", [[0, "#143559"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        guilloche(240, 330, 120, 44, 8, 4, BLUE_LINE, 0.22) +
        guilloche(560, 260, 150, 54, 7, 3, BLUE_LINE, 0.18) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="356" cy="207" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="356" cy="207" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    "stann-creek": function (gid) {
      return baseDefs(gid, "v", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        waves(0, 800, 260, 7, 22, 10, BLUE_LINE, 0.32) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="400" cy="243" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="400" cy="243" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    toledo: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        guilloche(400, 460, 200, 80, 10, 2, BLUE_LINE, 0.2) +
        belizeWatermark(300, 40, 0.6, GOLD_SOFT, 0.22) +
        '<circle cx="376" cy="336" r="4" fill="' + GOLD + '"/>' +
        '<circle cx="376" cy="336" r="11" fill="none" stroke="' + GOLD + '" opacity="0.5"/>';
    },
    business: function (gid) {
      return baseDefs(gid, "d", [[0, "#12315A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        grid(480, 30, 800, 420, 48, BLUE_LINE, 0.19) +
        '<path d="M60 380 L230 380 L230 250 L360 250 L360 320 L470 320 L470 380 L620 380" fill="none" stroke="' + GOLD + '" stroke-width="1" opacity="0.4"/>' +
        guilloche(160, 130, 46, 46, 6, 10, GOLD_SOFT, 0.16);
    },
    heritage: function (gid) {
      return baseDefs(gid, "d", [[0, "#0E2A4A"], [1, "#0A1A2F"]]) + "</defs>" +
        '<rect width="800" height="450" fill="url(#' + gid + ')"/>' +
        guilloche(400, 225, 120, 76, 10, 9, GOLD, 0.15) +
        belizeWatermark(90, 30, 0.7, GOLD_SOFT, 0.26) +
        '<line x1="560" y1="225" x2="740" y2="225" stroke="' + GOLD + '" stroke-width="1" opacity="0.5"/>';
    }
  };

  function panel(motif, opts) {
    opts = opts || {};
    var fn = MOTIFS[motif] || MOTIFS.hero;
    var gid = nextId("g");
    var noiseId = nextId("n");
    var inner = fn(gid);
    // Motif functions emit "<defs content></defs>" split: they return defs
    // content followed by body; wrap in defs open here.
    return '<svg viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs>' +
      inner + grain(noiseId, 0.028) + "</svg>";
  }

  /* ------------------------------------------------------------------ */
  /* Belize map                                                          */
  /* ------------------------------------------------------------------ */

  function belizeMap(options) {
    options = options || {};
    var markers = options.markers || [];
    var labels = options.labels !== false;
    var cls = options.mini ? "belize-map belize-map--mini" : "belize-map";
    var out = '<svg viewBox="0 0 300 560" class="' + cls + '" role="img" aria-label="' +
      (options.ariaLabel || "Map of Belize showing ICB locations") + '">';
    out += '<path d="' + BELIZE_PATH + '" class="bm-land"/>';
    out += '<path d="' + REEF_PATH + '" class="bm-reef"/>';
    for (var i = 0; i < markers.length; i++) {
      var m = markers[i];
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
    out += "</svg>";
    return out;
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
    whatsapp: '<path d="M12 4c4.4 0 8 3.3 8 7.3s-3.6 7.2-8 7.2c-.9 0-1.8-.1-2.6-.4L5 19.5l1-3.4C4.9 14.9 4 13.2 4 11.3 4 7.3 7.6 4 12 4z"/><path d="M9.4 9.2h1.2l.6 1.7-.9.8c.5 1 1.3 1.8 2.3 2.3l.8-.9 1.7.6v1.2"/>',
    external: '<path d="M10 5.5H5.5v13h13V14"/><path d="M13.5 4.5H19.5v6M19 5l-7.5 7.5"/>',
    download: '<path d="M12 4.5v10M8 11l4 4 4-4"/><path d="M4.5 19.5h15"/>',
    play: '<path d="M9 6.5l9 5.5-9 5.5z"/>',
    arrow: '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    check: '<path d="M4.5 12.5l5 5L19.5 7"/>',
    compass: '<circle cx="12" cy="12" r="8.2"/><path d="M14.8 9.2l-1.9 4.3-3.7 1.3 1.9-4.3z"/>',
    question: '<circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.6a2.4 2.4 0 114 1.8c-.8.7-1.6 1.1-1.6 2.2"/><circle cx="12" cy="16.6" r="0.4" fill="currentColor" stroke="none"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    send: '<path d="M4.5 12L19.5 4.5 15 19.5l-3.2-5.3z"/><path d="M19.5 4.5L11.8 14.2"/>'
  };

  function glyph(name, cls) {
    var body = GLYPH_PATHS[name] || GLYPH_PATHS.shield;
    return '<svg viewBox="0 0 24 24" class="' + (cls || "glyph") + '" aria-hidden="true" focusable="false"' +
      ' fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      body + "</svg>";
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
        img.src = conf.src;
        img.alt = conf.alt || "";
        img.className = "slot-photo";
        node.appendChild(img);
        requestAnimationFrame(function () { img.classList.add("is-loaded"); });
      };
      // On failure nothing happens: the artwork simply remains.
      probe.src = conf.src;
    });
  }

  ICB.art = {
    panel: panel,
    belizeMap: belizeMap,
    glyph: glyph,
    enhance: enhance
  };
})();
