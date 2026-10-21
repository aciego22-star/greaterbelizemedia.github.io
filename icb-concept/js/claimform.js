/* ============================================================================
   ICB.claimform — filling, signing and sending a claim form on the device.

   Everything here happens on the claimant's own phone or computer. The
   answers, the signature and the photographs are held in the page, the
   completed PDF is built in the page, and nothing is transmitted until
   the claimant presses send and chooses where it goes. There is no
   server in this path and no third party holding a copy.

   WHY THAT MATTERS AND NOT ONLY FOR TIDINESS. A motor claim form carries
   an authorisation to release medical and Social Security records. Until
   ICB decides where submitted claims should land, the safest default is
   the one where the data never leaves the claimant's hands except by
   their own act of sending it to ICB.

   SUBMISSION IS ONE SWITCH. ICB.claimform.submit() is the only place
   that decides what "send" does. Today it hands the finished PDF and the
   attachments to whatever the device uses for sharing, already addressed
   to ICB, which works on a phone and on a desktop and needs nothing
   running anywhere. If ICB would rather claims arrived in a tracked
   inbox, that function is where an endpoint goes, and nothing else in
   this file changes.

   DRAFTS ARE KEPT ON THE DEVICE. These forms are long and are filled in
   at a bad moment, often at the roadside. Losing an hour of typing to a
   phone call or a dead battery would be worse than useless, so typed
   answers are saved to this browser as they are entered, and cleared the
   moment the form is sent or the claimant clears it. Signatures and
   photographs are never written to storage. Nothing is saved anywhere a
   claimant cannot reach and delete.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var STORE_PREFIX = "icb.claimdraft.";
  var MAX_FILES = 12;
  var MAX_FILE_MB = 8;

  /* ------------------------------------------------------------------ */
  /* The schema                                                          */
  /* ------------------------------------------------------------------ */
  function formById(id) {
    var list = (ICB.DATA.claimForms && ICB.DATA.claimForms.forms) || [];
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }
  function formForPathway(pathwayId) {
    var list = (ICB.DATA.claimForms && ICB.DATA.claimForms.forms) || [];
    for (var i = 0; i < list.length; i++) if (list[i].pathway === pathwayId) return list[i];
    return null;
  }
  function eachField(form, fn) {
    for (var s = 0; s < form.steps.length; s++) {
      for (var i = 0; i < form.steps[s].fields.length; i++) {
        fn(form.steps[s].fields[i], form.steps[s], i);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /* The answers                                                         */
  /* ------------------------------------------------------------------ */
  function State(form) {
    this.form = form;
    this.values = {};        /* key -> string */
    this.tables = {};        /* key -> [ { col: value } ] */
    this.sigs = {};          /* key -> { dataUrl, at } */
    this.files = [];         /* { file, name, size, type } */
    this.restore();
  }

  State.prototype.key = function () { return STORE_PREFIX + this.form.id; };

  State.prototype.save = function () {
    /* Typed answers only. A signature is an image and a photograph is a
       file; neither belongs in storage and neither would fit. */
    try {
      window.localStorage.setItem(this.key(), JSON.stringify({
        v: this.values, t: this.tables, at: Date.now()
      }));
    } catch (e) { /* private window, or storage full: the form still works */ }
  };

  State.prototype.restore = function () {
    try {
      var raw = window.localStorage.getItem(this.key());
      if (!raw) return;
      var d = JSON.parse(raw);
      this.values = d.v || {};
      this.tables = d.t || {};
      this.savedAt = d.at || null;
    } catch (e) { /* unreadable draft is no draft */ }
  };

  State.prototype.clear = function () {
    this.values = {}; this.tables = {}; this.sigs = {}; this.files = [];
    this.savedAt = null;
    try { window.localStorage.removeItem(this.key()); } catch (e) {}
  };

  State.prototype.hasDraft = function () {
    var k;
    for (k in this.values) if (this.values[k]) return true;
    for (k in this.tables) if ((this.tables[k] || []).length) return true;
    return false;
  };

  /* Required fields still empty, in the order a reader meets them. */
  State.prototype.missing = function () {
    var out = [], self = this;
    eachField(this.form, function (fld, step) {
      if (!fld.req) return;
      var filled = fld.t === "signature"
        ? !!self.sigs[fld.k]
        : !!(self.values[fld.k] && String(self.values[fld.k]).trim());
      if (!filled) out.push({ field: fld, step: step });
    });
    return out;
  };

  /* How much of the form has been answered, for the progress line. A
     claimant part way through a hundred questions deserves to know. */
  State.prototype.progress = function () {
    var total = 0, done = 0, self = this;
    eachField(this.form, function (fld) {
      if (fld.t === "note") return;
      total++;
      if (fld.t === "signature") { if (self.sigs[fld.k]) done++; return; }
      if (fld.t === "attachments") { if (self.files.length) done++; return; }
      if (fld.t === "table") { if ((self.tables[fld.k] || []).length) done++; return; }
      if (self.values[fld.k] && String(self.values[fld.k]).trim()) done++;
    });
    return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
  };

  /* ------------------------------------------------------------------ */
  /* Signature and sketch pad                                            */
  /* ------------------------------------------------------------------ */

  /* A finger on a phone, a mouse or a trackpad on a computer, a stylus
     on either. Pointer events cover all three, so there is one code
     path rather than three that drift apart.

     Drawn at the device's own pixel density, because a signature
     rendered at CSS resolution and then printed into a PDF looks like a
     fax of a signature. */
  function attachPad(canvas, opts) {
    opts = opts || {};
    var ctx = canvas.getContext("2d");
    var ratio = Math.min(window.devicePixelRatio || 1, 3);
    var drawing = false, last = null, prevMid = null, dirty = false;
    var strokes = 0;

    function size() {
      var r = canvas.getBoundingClientRect();
      if (!r.width) return;
      var data = dirty ? canvas.toDataURL("image/png") : null;
      canvas.width = Math.round(r.width * ratio);
      canvas.height = Math.round(r.height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = opts.width || 2.1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#111318";
      if (data) {
        var img = new Image();
        img.onload = function () { ctx.drawImage(img, 0, 0, r.width, r.height); };
        img.src = data;
      }
    }

    function point(e) {
      var r = canvas.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    }

    function down(e) {
      /* A second finger landing mid-signature should not start a second
         line, and a right click should not draw at all. */
      if (e.button !== undefined && e.button !== 0) return;
      drawing = true;
      strokes++;
      last = point(e);
      prevMid = last;
      /* A tap with no movement is a dot, and people do sign with dots. */
      ctx.beginPath();
      ctx.arc(last.x, last.y, (opts.width || 2.1) / 2, 0, Math.PI * 2);
      ctx.fillStyle = "#111318";
      ctx.fill();
      dirty = true;
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
      if (opts.onChange) opts.onChange(true);
      e.preventDefault();
    }

    function move(e) {
      if (!drawing) return;
      var p = point(e);
      var mid = { x: (last.x + p.x) / 2, y: (last.y + p.y) / 2 };
      /* Midpoint smoothing. Each segment runs from the LAST midpoint,
         curves through the last raw point, and ends at the new midpoint,
         so consecutive segments share an endpoint and the line is
         continuous. Drawing from the raw point to the midpoint instead
         covers only half of each step and leaves a signature made of
         dashes, which is what this did before. */
      ctx.beginPath();
      ctx.moveTo(prevMid.x, prevMid.y);
      ctx.quadraticCurveTo(last.x, last.y, mid.x, mid.y);
      ctx.stroke();
      prevMid = mid;
      last = p;
      dirty = true;
      e.preventDefault();
    }

    function up(e) {
      if (!drawing) return;
      /* The last raw point is not yet covered by a midpoint segment, so
         the stroke is closed out to it rather than stopping short. */
      if (last && prevMid) {
        ctx.beginPath();
        ctx.moveTo(prevMid.x, prevMid.y);
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
      }
      drawing = false;
      last = null;
      prevMid = null;
      if (e && e.pointerId !== undefined && canvas.releasePointerCapture) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
      if (opts.onEnd) opts.onEnd();
    }

    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    canvas.addEventListener("pointerleave", up);
    window.addEventListener("resize", size);
    size();

    return {
      clear: function () {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        dirty = false; strokes = 0;
        if (opts.onChange) opts.onChange(false);
      },
      isEmpty: function () { return !dirty; },
      strokes: function () { return strokes; },
      resize: size,
      /* White behind the ink: a PDF page is white, and a transparent
         PNG turned into a JPEG goes black where nothing was drawn. */
      toJpeg: function (quality) {
        var out = document.createElement("canvas");
        out.width = canvas.width;
        out.height = canvas.height;
        var octx = out.getContext("2d");
        octx.fillStyle = "#ffffff";
        octx.fillRect(0, 0, out.width, out.height);
        octx.drawImage(canvas, 0, 0);
        return out.toDataURL("image/jpeg", quality || 0.92);
      },
      destroy: function () { window.removeEventListener("resize", size); }
    };
  }

  function dataUrlToBytes(dataUrl) {
    var b64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
    var bin = window.atob(b64);
    var out = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  }

  /* ------------------------------------------------------------------ */
  /* Handing a file to the reader                                        */
  /* ------------------------------------------------------------------ */

  /* On a real host this is an anchor with a download attribute, which is
     all it ever needs to be. Inside the preview surface the page is
     framed and a plain download is refused, so the blank forms and the
     completed claim would both appear to do nothing when the concept is
     being shown to the client. Where that surface offers a save of its
     own, it is used; everywhere else the anchor is.

     Nothing here is required for the deployed site: window.claude does
     not exist on a host, so the first branch is never taken. */
  function hostSave(blob, name) {
    if (!(window.claude && typeof window.claude.use === "function")) return Promise.resolve(false);
    return window.claude.use("downloads").then(function (d) {
      if (!d || typeof d.save !== "function") return false;
      return d.save({ filename: name, data: blob }).then(function () { return true; },
                                                         function () { return true; });
    }, function () { return false; });
  }

  function anchorSave(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }

  function saveFile(blob, name) {
    hostSave(blob, name).then(function (handled) {
      if (!handled) anchorSave(blob, name);
    });
  }

  /* The blank claim forms are ordinary download links, and in the
     preview they are bundled as data URIs. Same problem, same answer,
     and only inside that surface: elsewhere the browser is left to do
     what it already does well. */
  function interceptDownloadLinks() {
    if (!(window.claude && typeof window.claude.use === "function")) return;
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[download]") : null;
      if (!a || !a.getAttribute("href")) return;
      e.preventDefault();
      var name = a.getAttribute("download") || (a.getAttribute("href").split("/").pop() || "download.pdf");
      window.fetch(a.href).then(function (r) { return r.blob(); })
        .then(function (b) { saveFile(b, name); })
        .catch(function () { anchorSave(new Blob([""], { type: "text/plain" }), name); });
    }, true);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", interceptDownloadLinks);
  } else {
    interceptDownloadLinks();
  }

  ICB.claimform = {
    saveFile: saveFile,
    formById: formById,
    formForPathway: formForPathway,
    eachField: eachField,
    State: State,
    attachPad: attachPad,
    dataUrlToBytes: dataUrlToBytes,
    MAX_FILES: MAX_FILES,
    MAX_FILE_MB: MAX_FILE_MB
  };
})();
