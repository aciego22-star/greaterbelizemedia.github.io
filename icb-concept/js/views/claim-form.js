/* ============================================================================
   Claim form view — ICB's claim forms, filled in and signed on the device.

   One step at a time rather than one long page. The insured motor form
   asks a hundred and five questions; presented as a single scroll on a
   phone it reads as impossible, and a claimant filling it in at the
   roadside gives up. Thirteen short steps with a progress bar is the
   same form and a different experience.

   Nothing is required except the few answers that identify the claim.
   A half-filled form that reaches ICB today is worth more than a
   complete one that is abandoned, and ICB's claims team can telephone
   for the rest. The review step says plainly what is still blank.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var R, T, esc;
  var state = null, form = null, step = 0, pads = {};

  function init() {
    R = ICB.render; T = ICB.T; esc = R.esc;
  }

  function lang() { return ICB.i18n.get(); }
  function pick(v) { var l = lang(); return v && typeof v === "object" ? (v[l] || v.en) : v; }

  /* ---------------------------------------------------------------- */
  /* Fields                                                            */
  /* ---------------------------------------------------------------- */
  var INPUT_TYPE = { text: "text", tel: "tel", email: "email", number: "number",
                     money: "text", date: "date", time: "time" };

  function fieldHtml(f, idx) {
    if (f.t === "note") {
      return '<p class="cf-note">' + esc(pick(f.l)) + "</p>";
    }
    var id = "cf-" + f.k;
    var label = '<label class="cf-label" for="' + id + '">' + esc(pick(f.l)) +
      (f.req ? ' <span class="cf-req" aria-hidden="true">*</span><span class="visually-hidden">' +
        esc(T("required", "obligatorio")) + "</span>" : "") + "</label>";
    var hint = f.h ? '<p class="cf-hint" id="' + id + '-hint">' + esc(pick(f.h)) + "</p>" : "";
    var described = f.h ? ' aria-describedby="' + id + '-hint"' : "";
    var v = state.values[f.k] || "";
    var wide = f.w === "half" ? " cf-field--half" : "";
    var body;

    if (INPUT_TYPE[f.t]) {
      body = '<input class="cf-input" id="' + id + '" type="' + INPUT_TYPE[f.t] + '"' +
        (f.t === "money" ? ' inputmode="decimal" placeholder="$"' : "") +
        (f.t === "tel" ? ' inputmode="tel"' : "") +
        ' data-k="' + esc(f.k) + '" value="' + esc(v) + '"' + described +
        (f.req ? ' required' : "") + ">";
    } else if (f.t === "long") {
      body = '<textarea class="cf-input cf-textarea" id="' + id + '" rows="' + (f.rows || 4) +
        '" data-k="' + esc(f.k) + '"' + described + ">" + esc(v) + "</textarea>";
    } else if (f.t === "yesno") {
      body = '<div class="cf-choice" role="group" aria-labelledby="' + id + '-lbl">' +
        ["Yes", "No"].map(function (o) {
          var on = v === o;
          return '<button type="button" class="cf-pill' + (on ? " is-on" : "") +
            '" data-choice="' + esc(f.k) + '" data-value="' + o + '" aria-pressed="' + on + '">' +
            esc(o === "Yes" ? T("Yes", "Sí") : T("No", "No")) + "</button>";
        }).join("") + "</div>";
    } else if (f.t === "select") {
      body = '<select class="cf-input" id="' + id + '" data-k="' + esc(f.k) + '"' + described + ">" +
        '<option value="">' + esc(T("Choose one", "Elija una")) + "</option>" +
        f.opts.map(function (o) {
          return '<option value="' + esc(o.v) + '"' + (v === o.v ? " selected" : "") + ">" +
            esc(pick(o.l)) + "</option>";
        }).join("") + "</select>";
    } else if (f.t === "checks") {
      var on = String(v).split("|").filter(Boolean);
      body = '<div class="cf-choice cf-choice--wrap">' + f.opts.map(function (o) {
        var set = on.indexOf(o.v) >= 0;
        return '<button type="button" class="cf-pill' + (set ? " is-on" : "") +
          '" data-check="' + esc(f.k) + '" data-value="' + esc(o.v) + '" aria-pressed="' + set + '">' +
          esc(pick(o.l)) + "</button>";
      }).join("") + "</div>";
    } else if (f.t === "table") {
      body = tableHtml(f);
    } else if (f.t === "signature" || f.t === "sketch") {
      var sig = state.sigs[f.k];
      body = '<div class="cf-pad' + (f.t === "sketch" ? " cf-pad--sketch" : "") + '" data-pad="' + esc(f.k) + '">' +
        '<canvas class="cf-canvas" data-canvas="' + esc(f.k) + '" aria-label="' + esc(pick(f.l)) + '"></canvas>' +
        '<p class="cf-pad-hint"' + (sig ? ' hidden' : "") + ' data-padhint="' + esc(f.k) + '">' +
          esc(f.t === "sketch" ? T("Draw here", "Dibuje aquí") : T("Sign here", "Firme aquí")) + "</p>" +
        "</div>" +
        '<div class="cf-pad-actions">' +
          '<button type="button" class="btn btn-ghost btn-sm" data-padclear="' + esc(f.k) + '">' +
            esc(T("Clear", "Borrar")) + "</button>" +
          '<span class="cf-pad-state" data-padstate="' + esc(f.k) + '">' +
            (sig ? esc(T("Signed", "Firmado")) : "") + "</span>" +
        "</div>";
    } else if (f.t === "attachments") {
      body = attachmentsHtml(f);
    } else {
      body = "";
    }

    return '<div class="cf-field' + wide + '" data-field="' + esc(f.k) + '">' +
      label + hint + body + "</div>";
  }

  function tableHtml(f) {
    var rows = state.tables[f.k] || [];
    var out = '<div class="cf-table" data-table="' + esc(f.k) + '">';
    if (!rows.length) {
      out += '<p class="cf-empty">' + esc(T("Nothing added yet.", "Nada agregado todavía.")) + "</p>";
    }
    rows.forEach(function (row, i) {
      out += '<div class="cf-row" data-row="' + i + '">' +
        '<div class="cf-row-head"><span>' + esc(T("Entry", "Entrada")) + " " + (i + 1) + "</span>" +
          '<button type="button" class="cf-row-del" data-delrow="' + esc(f.k) + '" data-i="' + i + '">' +
            esc(T("Remove", "Quitar")) + "</button></div>";
      f.cols.forEach(function (c) {
        out += '<label class="cf-cell"><span>' + esc(pick(c.l)) + "</span>" +
          '<input class="cf-input" data-cell="' + esc(f.k) + '" data-col="' + esc(c.k) +
          '" data-i="' + i + '" value="' + esc(row[c.k] || "") + '"></label>';
      });
      out += "</div>";
    });
    out += '<button type="button" class="btn btn-outline btn-sm" data-addrow="' + esc(f.k) + '">' +
      esc(T("Add an entry", "Agregar una entrada")) + "</button></div>";
    return out;
  }

  function attachmentsHtml(f) {
    var hint = f.hintKey && ICB.DATA.claimForms.attachmentHint[f.hintKey];
    var out = '<div class="cf-files" data-files="1">';
    if (hint) out += '<p class="cf-hint">' + esc(pick(hint)) + "</p>";
    out += '<label class="btn btn-outline btn-sm cf-filebtn">' +
      ICB.art.glyph("download") + "<span>" + esc(T("Choose photos or files", "Elegir fotos o archivos")) + "</span>" +
      '<input type="file" multiple accept="image/*,application/pdf" data-fileinput="1" hidden></label>';
    out += '<ul class="cf-filelist">' + state.files.map(function (x, i) {
      return "<li>" + esc(x.name) + ' <span class="cf-filesize">' +
        Math.max(1, Math.round(x.size / 1024)) + " KB</span>" +
        '<button type="button" class="cf-row-del" data-delfile="' + i + '">' +
        esc(T("Remove", "Quitar")) + "</button></li>";
    }).join("") + "</ul>";
    out += '<p class="cf-hint">' + esc(ICB.s("cfFileLimit", {
      n: ICB.claimform.MAX_FILES, mb: ICB.claimform.MAX_FILE_MB })) + "</p>";
    return out + "</div>";
  }

  /* ---------------------------------------------------------------- */
  /* Steps                                                             */
  /* ---------------------------------------------------------------- */
  function stepsNav() {
    return '<ol class="cf-steps">' + form.steps.map(function (s, i) {
      return '<li><button type="button" class="cf-step' + (i === step ? " is-on" : "") +
        '" data-step="' + i + '"' + (i === step ? ' aria-current="step"' : "") + ">" +
        '<span class="cf-step-n">' + (i + 1) + "</span>" +
        '<span class="cf-step-t">' + esc(pick(s.title)) + "</span></button></li>";
    }).join("") + "</ol>";
  }

  function stepBody() {
    var s = form.steps[step];
    return '<div class="cf-stepbody">' +
      '<h2 class="cf-steptitle">' + esc(pick(s.title)) + "</h2>" +
      '<div class="cf-grid">' + s.fields.map(fieldHtml).join("") + "</div>" +
      "</div>";
  }

  function reviewBody() {
    var missing = state.missing();
    var p = state.progress();
    var out = '<div class="cf-stepbody">' +
      '<h2 class="cf-steptitle">' + esc(T("Review and send", "Revisar y enviar")) + "</h2>";
    out += '<p class="cf-lead">' + esc(ICB.s("cfAnswered", { done: p.done, total: p.total })) + "</p>";

    if (missing.length) {
      out += '<div class="cf-warn"><p><b>' +
        esc(ICB.s("cfStillBlank", { n: missing.length })) + "</b></p><ul>" +
        missing.map(function (m) {
          return "<li>" + esc(pick(m.field.l)) + ' <span class="cf-of">' + esc(pick(m.step.title)) + "</span></li>";
        }).join("") + "</ul></div>";
    }

    out += '<div class="cf-declaration">' +
      "<h3>" + esc(T("What you are signing", "Lo que usted está firmando")) + "</h3>";
    var L = ICB.DATA.claimForms.legal;
    [form.release, form.declaration, form.closing].forEach(function (k) {
      if (k && L[k]) out += "<p>" + esc(L[k]) + "</p>";
    });
    out += "<p>" + esc(L.recording) + "</p></div>";

    out += '<p class="cf-privacy">' + esc(ICB.s("cfPrivacy")) + "</p>";
    out += '<div class="cf-send">' +
      '<button type="button" class="btn btn-primary" data-send="1">' +
        ICB.art.glyph("whatsapp") + "<span>" + esc(T("Send to ICB", "Enviar a ICB")) + "</span></button>" +
      '<button type="button" class="btn btn-outline" data-download="1">' +
        ICB.art.glyph("download") + "<span>" + esc(T("Download a copy", "Descargar una copia")) + "</span></button>" +
      "</div>";
    out += '<p class="cf-status" data-status="1" role="status"></p>';
    return out + "</div>";
  }

  /* What this form is, before the first question. It is also the only
     thing on the page a crawler or an answer engine can read: the form
     itself is a hundred empty inputs, which is no content at all. So it
     says plainly what the form does, what it is worth having to hand,
     and that it can be signed on a phone, which is the thing somebody
     searching for an ICB claim form actually wants to know.

     It states nothing about what a claim requires or how one is
     settled. That is ICB's to say, not a website's. */
  function intro() {
    var counts = { steps: form.steps.length, q: state.progress().total };
    var hintField = null;
    ICB.claimform.eachField(form, function (f) { if (f.t === "attachments") hintField = f; });
    var hint = hintField && hintField.hintKey &&
      ICB.DATA.claimForms.attachmentHint[hintField.hintKey];
    var pathway = ICB.DATA.claims.pathways.filter(function (x) { return x.id === form.pathway; })[0];

    return '<div class="cf-intro">' +
      "<p>" + esc(ICB.s("cfIntro", { title: form.title.en, steps: counts.steps })) + "</p>" +
      '<ul class="cf-intro-list">' +
        "<li>" + esc(T("Sign with your finger on a phone, or with the mouse on a computer.",
                       "Firme con el dedo en el teléfono, o con el ratón en una computadora.")) + "</li>" +
        "<li>" + esc(T("Your answers are saved on this device as you type, so you can stop and come back.",
                       "Sus respuestas se guardan en este dispositivo mientras escribe, así puede parar y volver.")) + "</li>" +
        "<li>" + esc(T("Attach photographs and documents, and send everything to ICB together.",
                       "Adjunte fotografías y documentos, y envíe todo junto a ICB.")) + "</li>" +
        (hint ? "<li>" + esc(T("Useful to have with you: ", "Útil tener a la mano: ")) +
                esc(pick(hint)) + "</li>" : "") +
      "</ul>" +
      '<p class="cf-intro-alt">' +
        esc(T("Would rather fill it in on paper? ", "¿Prefiere llenarlo en papel? ")) +
        (pathway && pathway.formFile
          ? '<a data-asset-href="' + esc(pathway.formFile) + '" href="' + esc(pathway.formFile) + '" download>' +
            esc(T("Download the blank form", "Descargue el formulario en blanco")) + "</a>. "
          : "") +
        esc(T("Either way it reaches the same claims team.",
              "De cualquier manera llega al mismo equipo de reclamos.")) +
      "</p>" +
      "</div>";
  }

  /* ---------------------------------------------------------------- */
  /* The page                                                          */
  /* ---------------------------------------------------------------- */
  function page() {
    var p = state.progress();
    var isReview = step >= form.steps.length;
    return '' +
      '<section class="section section--flush-top cf" aria-labelledby="cf-title">' +
        '<div class="shell">' +
          '<nav class="cf-back"><a href="#/claims">' + esc(T("Back to claims", "Volver a reclamos")) + "</a></nav>" +
          '<div class="section-head">' +
            '<span class="eyebrow">' + esc(T("Claim form", "Formulario de reclamo")) + "</span>" +
            '<h1 id="cf-title">' + esc(pick(form.title)) + "</h1>" +
            "<p>" + esc(pick(form.lead)) + "</p>" +
          "</div>" +
          intro() +
          '<div class="cf-progress" role="group" aria-label="' + esc(T("Progress", "Progreso")) + '">' +
            '<div class="cf-bar"><span style="width:' + p.pct + '%"></span></div>' +
            '<p class="cf-progress-text" data-progress="1">' +
              esc(ICB.s("cfAnswered", { done: p.done, total: p.total })) +
              (state.savedAt ? " " + esc(T("Saved on this device.", "Guardado en este dispositivo.")) : "") +
            "</p>" +
          "</div>" +
          '<div class="cf-layout">' +
            '<aside class="cf-aside">' + stepsNav() +
              '<button type="button" class="cf-clear" data-clearall="1">' +
                esc(T("Clear this form", "Borrar este formulario")) + "</button>" +
            "</aside>" +
            '<div class="cf-main">' +
              (isReview ? reviewBody() : stepBody()) +
              '<div class="cf-nav">' +
                '<button type="button" class="btn btn-outline btn-sm" data-prev="1"' +
                  (step === 0 ? " disabled" : "") + ">" + esc(T("Back", "Atrás")) + "</button>" +
                '<button type="button" class="btn btn-primary btn-sm" data-next="1"' +
                  (isReview ? " disabled" : "") + ">" +
                  esc(step === form.steps.length - 1 ? T("Review", "Revisar") : T("Next", "Siguiente")) +
                "</button>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</div>" +
      "</section>";
  }

  ICB.views.claimForm = {
    title: function (ctx) {
      var f = ICB.claimform.formById(ctx.formId);
      return f ? { en: f.title.en + " | ICB", es: f.title.es + " | ICB" } : "ICB";
    },
    render: function (ctx) {
      init();
      var f = ICB.claimform.formById(ctx.formId);
      if (!f) return ICB.views.notfound.render(ctx);
      if (!form || form.id !== f.id) { form = f; state = new ICB.claimform.State(f); step = 0; }
      return page();
    },
    mounted: function (mount) {
      if (!form) return;
      wire(mount);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Behaviour                                                         */
  /* ---------------------------------------------------------------- */
  function repaint(mount) {
    var main = mount.querySelector(".cf-layout");
    if (!main) return;
    destroyPads();
    var holder = document.createElement("div");
    holder.innerHTML = page();
    main.parentNode.replaceChild(holder.querySelector(".cf-layout"), main);
    mountPads(mount);
    var head = mount.querySelector(".cf-steptitle");
    if (head) {
      head.setAttribute("tabindex", "-1");
      head.focus({ preventScroll: true });
      var y = head.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    }
  }

  function destroyPads() {
    for (var k in pads) if (pads[k] && pads[k].destroy) pads[k].destroy();
    pads = {};
  }

  function mountPads(mount) {
    var canvases = mount.querySelectorAll("[data-canvas]");
    Array.prototype.forEach.call(canvases, function (c) {
      var k = c.getAttribute("data-canvas");
      var hint = mount.querySelector('[data-padhint="' + k + '"]');
      var label = mount.querySelector('[data-padstate="' + k + '"]');
      var pad = ICB.claimform.attachPad(c, {
        width: c.closest(".cf-pad--sketch") ? 2.6 : 2.1,
        onChange: function (has) { if (hint) hint.hidden = !!has; },
        onEnd: function () {
          state.sigs[k] = { dataUrl: pad.toJpeg(), at: Date.now() };
          if (label) label.textContent = ICB.T("Signed", "Firmado");
          updateProgress(mount);
        }
      });
      /* A signature already taken this visit is painted back, so a step
         revisited does not look like it was never signed. */
      var existing = state.sigs[k];
      if (existing) {
        var img = new Image();
        img.onload = function () {
          var ctx2 = c.getContext("2d");
          var r = c.getBoundingClientRect();
          ctx2.drawImage(img, 0, 0, r.width, r.height);
          if (hint) hint.hidden = true;
        };
        img.src = existing.dataUrl;
      }
      pads[k] = pad;
    });
  }

  function updateProgress(mount) {
    var p = state.progress();
    var bar = mount.querySelector(".cf-bar span");
    var txt = mount.querySelector("[data-progress]");
    if (bar) bar.style.width = p.pct + "%";
    if (txt) txt.textContent = ICB.s("cfAnswered", { done: p.done, total: p.total }) + " " +
      ICB.T("Saved on this device.", "Guardado en este dispositivo.");
  }

  function wire(mount) {
    mountPads(mount);

    mount.addEventListener("input", function (e) {
      var el = e.target;
      if (el.hasAttribute && el.hasAttribute("data-k")) {
        state.values[el.getAttribute("data-k")] = el.value;
        state.save(); updateProgress(mount);
      } else if (el.hasAttribute && el.hasAttribute("data-cell")) {
        var k = el.getAttribute("data-cell"), i = +el.getAttribute("data-i");
        state.tables[k] = state.tables[k] || [];
        state.tables[k][i] = state.tables[k][i] || {};
        state.tables[k][i][el.getAttribute("data-col")] = el.value;
        state.save(); updateProgress(mount);
      }
    });
    mount.addEventListener("change", function (e) {
      var el = e.target;
      if (el.hasAttribute && el.hasAttribute("data-k")) {
        state.values[el.getAttribute("data-k")] = el.value;
        state.save(); updateProgress(mount);
      }
      if (el.hasAttribute && el.hasAttribute("data-fileinput")) addFiles(mount, el.files);
    });

    mount.addEventListener("click", function (e) {
      var t = e.target.closest ? e.target.closest("[data-step],[data-prev],[data-next],[data-choice]," +
        "[data-check],[data-addrow],[data-delrow],[data-delfile],[data-padclear],[data-clearall]," +
        "[data-send],[data-download]") : null;
      if (!t) return;

      if (t.hasAttribute("data-step")) { step = +t.getAttribute("data-step"); repaint(mount); return; }
      if (t.hasAttribute("data-prev")) { if (step > 0) { step--; repaint(mount); } return; }
      if (t.hasAttribute("data-next")) { if (step < form.steps.length) { step++; repaint(mount); } return; }

      if (t.hasAttribute("data-choice")) {
        var ck = t.getAttribute("data-choice"), cv = t.getAttribute("data-value");
        state.values[ck] = state.values[ck] === cv ? "" : cv;
        state.save();
        var group = t.parentNode.querySelectorAll("[data-choice]");
        Array.prototype.forEach.call(group, function (b) {
          var on = b.getAttribute("data-value") === state.values[ck];
          b.classList.toggle("is-on", on);
          b.setAttribute("aria-pressed", on);
        });
        updateProgress(mount);
        return;
      }

      if (t.hasAttribute("data-check")) {
        var hk = t.getAttribute("data-check"), hv = t.getAttribute("data-value");
        var set = String(state.values[hk] || "").split("|").filter(Boolean);
        var at = set.indexOf(hv);
        if (at >= 0) set.splice(at, 1); else set.push(hv);
        state.values[hk] = set.join("|");
        state.save();
        t.classList.toggle("is-on", at < 0);
        t.setAttribute("aria-pressed", at < 0);
        updateProgress(mount);
        return;
      }

      if (t.hasAttribute("data-addrow")) {
        var ak = t.getAttribute("data-addrow");
        state.tables[ak] = state.tables[ak] || [];
        state.tables[ak].push({});
        state.save(); repaint(mount);
        return;
      }
      if (t.hasAttribute("data-delrow")) {
        var dk = t.getAttribute("data-delrow");
        state.tables[dk].splice(+t.getAttribute("data-i"), 1);
        state.save(); repaint(mount);
        return;
      }
      if (t.hasAttribute("data-delfile")) {
        state.files.splice(+t.getAttribute("data-delfile"), 1);
        repaint(mount);
        return;
      }
      if (t.hasAttribute("data-padclear")) {
        var pk = t.getAttribute("data-padclear");
        if (pads[pk]) pads[pk].clear();
        delete state.sigs[pk];
        var lbl = mount.querySelector('[data-padstate="' + pk + '"]');
        if (lbl) lbl.textContent = "";
        updateProgress(mount);
        return;
      }
      if (t.hasAttribute("data-clearall")) {
        if (!window.confirm(ICB.T(
          "Clear everything you have typed into this form? This cannot be undone.",
          "¿Borrar todo lo que ha escrito en este formulario? Esto no se puede deshacer."))) return;
        state.clear(); step = 0; repaint(mount);
        return;
      }
      if (t.hasAttribute("data-send")) { send(mount, false); return; }
      if (t.hasAttribute("data-download")) { send(mount, true); return; }
    });
  }

  function addFiles(mount, list) {
    var status = [];
    Array.prototype.forEach.call(list, function (file) {
      if (state.files.length >= ICB.claimform.MAX_FILES) {
        status.push(ICB.s("cfTooMany", { n: ICB.claimform.MAX_FILES })); return;
      }
      if (file.size > ICB.claimform.MAX_FILE_MB * 1024 * 1024) {
        status.push(ICB.s("cfTooBig", { name: file.name, mb: ICB.claimform.MAX_FILE_MB })); return;
      }
      state.files.push({ file: file, name: file.name, size: file.size, type: file.type });
    });
    repaint(mount);
    if (status.length) setStatus(mount, status.join(" "));
  }

  function setStatus(mount, msg) {
    var el = mount.querySelector("[data-status]");
    if (el) el.textContent = msg;
  }

  /* ---------------------------------------------------------------- */
  /* Sending                                                           */
  /* ---------------------------------------------------------------- */
  function send(mount, downloadOnly) {
    setStatus(mount, ICB.T("Building your form...", "Preparando su formulario..."));
    var built;
    try {
      built = ICB.claimPdf.build(form, state, { lang: lang() });
    } catch (err) {
      setStatus(mount, ICB.T(
        "The form could not be built on this device. Please download the blank form instead and send it to your branch.",
        "No se pudo preparar el formulario en este dispositivo. Descargue el formulario en blanco y envíelo a su sucursal."));
      return;
    }
    var name = "ICB-" + form.id + "-" + built.reference + ".pdf";
    var pdfFile = null;
    try { pdfFile = new File([built.blob], name, { type: "application/pdf" }); } catch (e) {}

    if (downloadOnly) {
      saveBlob(built.blob, name);
      setStatus(mount, ICB.s("cfDownloaded", { ref: built.reference }));
      return;
    }

    /* The device's own share sheet: on a phone that is WhatsApp, Mail
       and everything else the claimant already has, with the PDF and
       the photographs attached. Nothing passes through us. */
    var files = pdfFile ? [pdfFile] : [];
    state.files.forEach(function (x) { if (x.file) files.push(x.file); });
    var shareText = ICB.s("cfShareText", { form: form.title.en, ref: built.reference });

    if (navigator.canShare && pdfFile && navigator.canShare({ files: files })) {
      navigator.share({ files: files, title: form.title.en, text: shareText })
        .then(function () {
          setStatus(mount, ICB.s("cfSent", { ref: built.reference }));
          state.clear();
        })
        .catch(function () { /* the claimant closed the sheet; say nothing */ });
      return;
    }

    /* No share sheet, which is most desktops. The completed form is
       saved and the claimant's own mail program opens, addressed and
       with the reference in the subject, for them to attach it. Told
       plainly, because a download that just happens is a download
       nobody notices. */
    saveBlob(built.blob, name);
    setStatus(mount, ICB.s("cfSavedAttach", { ref: built.reference, name: name }));
    var to = ICB.DATA.site.corporate.email;
    var subject = form.title.en + " - " + built.reference;
    window.setTimeout(function () {
      window.location.href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(shareText + "\n\n" +
          ICB.T("Please attach the file saved to this device: ", "Adjunte el archivo guardado en este dispositivo: ") + name);
    }, 400);
  }

  function saveBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
  }
})();
