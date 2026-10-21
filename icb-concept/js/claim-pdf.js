/* ============================================================================
   ICB.claimPdf — the completed claim form, as a PDF, built on the device.

   What ICB receives has to be a document their claims team can read,
   file and act on, in the order their own form asks. So this walks the
   same schema the on-screen form was built from, which is the only way
   the two cannot disagree.

   ALWAYS IN ENGLISH. A claimant may fill the form in Spanish; ICB's
   claims team works from an English form. Every question is written out
   in ICB's own English wording and only the answers are the claimant's,
   so a Spanish speaker gets a form in their language and ICB gets the
   form they know. The claimant's own copy is the same document, which
   matters: both sides are then holding the same piece of paper.

   THE DECLARATIONS ARE VERBATIM. Reproduced from ICB's form word for
   word, above the signature, so what is signed on a screen is what the
   printed form says.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  function pick(v, lang) {
    if (v == null) return "";
    if (typeof v === "object") return v[lang] || v.en || "";
    return String(v);
  }

  function stamp(d) {
    var months = ["January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"];
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? "PM" : "AM";
    h = h % 12; if (h === 0) h = 12;
    return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear() +
      " at " + h + ":" + (m < 10 ? "0" : "") + m + " " + ampm;
  }

  /* A reference the claimant can quote on the telephone, and ICB can
     search for. Not a claim number: ICB issues those. Just something
     unique to this submission that is on both copies. */
  function reference(formId, when) {
    var base = (formId.split("-")[0] || "claim").slice(0, 3).toUpperCase();
    var t = when.getTime().toString(36).toUpperCase();
    var r = Math.floor(Math.random() * 1296).toString(36).toUpperCase();
    while (r.length < 2) r = "0" + r;
    return base + "-" + t.slice(-6) + "-" + r;
  }

  function build(form, state, opts) {
    opts = opts || {};
    var lang = opts.lang || "en";
    var when = opts.when || new Date();
    var ref = opts.reference || reference(form.id, when);
    var L = ICB.DATA.claimForms.legal;

    var doc = new ICB.pdf.Doc({
      margin: 52,
      header: function (d, pageNo) {
        d.page.ops.push("BT 0.42 0.42 0.42 rg /F1 7.5 Tf 1 0 0 1 " +
          d.margin.toFixed(2) + " " + (d.pageH - 34).toFixed(2) + " Tm (" +
          "Insurance Corporation of Belize Ltd.   |   " + form.pdfTitle.replace(/[“”]/g, "") +
          "   |   " + ref + "   |   Page " + pageNo + ") Tj ET");
        d.y = d.pageH - 56;
      }
    });

    /* ---- title block ---- */
    doc.text("INSURANCE CORPORATION OF BELIZE LIMITED", { size: 13.5, bold: true });
    doc.text("P.O. Box 519, #16 Daly Street, Belize City, Belize   Phone: 224-5328/5329", { size: 8, grey: 0.45 });
    doc.space(10);
    doc.text(form.pdfTitle.replace(/[“”]/g, ""), { size: 12, bold: true });
    doc.rule(0.9, 0.35);
    doc.space(4);
    doc.text("Completed and signed online. Reference " + ref + ". " + stamp(when) + ".",
      { size: 8.5, grey: 0.4 });
    if (lang !== "en") {
      doc.text("The claimant completed this form in Spanish. The questions below are ICB's own English wording.",
        { size: 8, grey: 0.5 });
    }

    /* ---- the answers, step by step ---- */
    for (var s = 0; s < form.steps.length; s++) {
      var step = form.steps[s];
      var fields = step.fields.filter(function (x) { return x.t !== "note"; });
      if (!fields.length) continue;

      /* A step with nothing in it is left out rather than printed as a
         column of dashes: ICB should see what was answered. The
         signature step always prints. */
      /* Signatures and sketches are printed in their own sections lower
         down, so they do not count towards whether this step has
         anything to show. Counting them printed "Declaration and
         signatures" as an empty heading above the real one. */
      var any = fields.some(function (fld) {
        if (fld.t === "signature" || fld.t === "sketch") return false;
        if (fld.t === "table") return (state.tables[fld.k] || []).some(function (r) {
          return Object.keys(r).some(function (c) { return String(r[c] || "").trim(); });
        });
        if (fld.t === "attachments") return state.files.length > 0;
        return String(state.values[fld.k] || "").trim();
      });
      if (!any) continue;

      doc.heading(pick(step.title, "en"));

      for (var i = 0; i < fields.length; i++) {
        var fld = fields[i];
        var label = pick(fld.l, "en");

        if (fld.t === "signature" || fld.t === "sketch") continue;   /* handled below */

        if (fld.t === "table") {
          var rows = (state.tables[fld.k] || []).filter(function (r) {
            return Object.keys(r).some(function (c) { return String(r[c] || "").trim(); });
          });
          if (!rows.length) continue;
          doc.text(label, { size: 8.5, grey: 0.42 });
          doc.space(2);
          doc.table(
            fld.cols.map(function (c) { return { label: pick(c.l, "en"), w: c.w || 2 }; }),
            rows.map(function (r) {
              return fld.cols.map(function (c) { return r[c.k] || ""; });
            }));
          continue;
        }

        if (fld.t === "attachments") {
          if (!state.files.length) continue;
          doc.text(label, { size: 8.5, grey: 0.42 });
          doc.space(2);
          doc.table([{ label: "File", w: 7 }, { label: "Size", w: 2 }],
            state.files.map(function (f) {
              return [f.name, Math.max(1, Math.round(f.size / 1024)) + " KB"];
            }));
          doc.text("Sent alongside this form.", { size: 8, grey: 0.5 });
          continue;
        }

        var v = state.values[fld.k];
        if (!String(v == null ? "" : v).trim()) continue;
        doc.field(label, v);
      }
    }

    /* ---- sketches ---- */
    var sketches = [];
    ICB.claimform.eachField(form, function (fld) {
      if (fld.t === "sketch" && state.sigs[fld.k]) sketches.push(fld);
    });
    if (sketches.length) {
      doc.heading("Sketch");
      for (var sk = 0; sk < sketches.length; sk++) {
        var sketch = state.sigs[sketches[sk].k];
        var bytes = ICB.claimform.dataUrlToBytes(sketch.dataUrl);
        var size = sketchSize(bytes);
        var w = Math.min(doc.contentW(), 360);
        var h = size ? w * size.h / size.w : 200;
        doc.need(h + 24);
        doc.text(pick(sketches[sk].l, "en"), { size: 8.5, grey: 0.42 });
        doc.space(2);
        var idx = doc.images.length;
        doc.images.push({ bytes: bytes, w: size.w, h: size.h });
        doc.page.images["Im" + idx] = idx;
        doc.page.ops.push("q 0.8 G 0.5 w " + doc.margin.toFixed(2) + " " + (doc.y - h).toFixed(2) +
          " " + w.toFixed(2) + " " + h.toFixed(2) + " re S Q");
        doc.page.ops.push("q " + w.toFixed(2) + " 0 0 " + h.toFixed(2) + " " +
          doc.margin.toFixed(2) + " " + (doc.y - h).toFixed(2) + " cm /Im" + idx + " Do Q");
        doc.y -= h + 10;
      }
    }

    /* ---- declaration and signatures ---- */
    doc.heading("Declaration");
    if (form.release && L[form.release]) doc.text(L[form.release], { size: 8.5, lead: 11.5 }), doc.space(6);
    if (form.declaration && L[form.declaration]) doc.text(L[form.declaration], { size: 8.5, lead: 11.5 }), doc.space(6);
    if (form.closing && L[form.closing]) doc.text(L[form.closing], { size: 8.5, lead: 11.5 }), doc.space(6);
    doc.text(L.recording, { size: 8.5, lead: 11.5, grey: 0.3 });
    doc.space(8);

    var signed = 0;
    ICB.claimform.eachField(form, function (fld) {
      if (fld.t !== "signature") return;
      var sig = state.sigs[fld.k];
      if (!sig) return;
      signed++;
      doc.signature(ICB.claimform.dataUrlToBytes(sig.dataUrl), pick(fld.l, "en"),
        "Signed on this device, " + stamp(new Date(sig.at)));
    });
    if (!signed) {
      doc.text("No signature was captured.", { size: 9, grey: 0.4 });
    }

    /* The stamp some of ICB's forms ask for cannot be drawn on a phone,
       so the form says so rather than leaving a reader to wonder. */
    doc.space(6);
    doc.text("Where ICB's printed form provides for a stamp, none is applied here. This form was completed and signed on a device.",
      { size: 7.5, grey: 0.5 });

    doc.space(10);
    doc.rule(0.5);
    doc.text("Completed at icbinsurance.com. Reference " + ref + ".", { size: 7.5, grey: 0.5 });

    return { blob: doc.toBlob(), reference: ref, when: when, pages: doc.pages.length };
  }

  /* Same JPEG header read the writer uses, for sizing a sketch. */
  function sketchSize(bytes) {
    var i = 2;
    while (i < bytes.length) {
      if (bytes[i] !== 0xFF) { i++; continue; }
      var m = bytes[i + 1];
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) {
        return { h: (bytes[i + 5] << 8) | bytes[i + 6], w: (bytes[i + 7] << 8) | bytes[i + 8] };
      }
      i += 2 + ((bytes[i + 2] << 8) | bytes[i + 3]);
    }
    return null;
  }

  ICB.claimPdf = { build: build, reference: reference, stamp: stamp };
})();
