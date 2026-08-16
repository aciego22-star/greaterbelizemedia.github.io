/* ============================================================================
   Contact view — guided three-step enquiry journey.
   Step 1: what is this about. Step 2: adaptive details. Step 3: review.
   The concept form transmits nothing; submitting reveals the demo notice.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var state = null;

  function freshState(query) {
    return {
      step: 1,
      topicId: query.topic || null,
      values: { category: query.category || "" }
    };
  }

  function topicById(id) {
    var t = ICB.DATA.contactFlows.topics;
    for (var i = 0; i < t.length; i++) if (t[i].id === id) return t[i];
    return null;
  }

  function fieldOptions(field) {
    /* A NEW insurance enquiry offers only what ICB can quote today. Listing
       Travel here would invite an enquiry for a product whose sales are
       suspended, and Mexican Insurance is arranged through ANA Seguros
       rather than by ICB enquiry. Both remain reachable from their own
       pages by their own routes. */
    if (field.optionsFrom === "products") {
      return ICB.DATA.quotableProducts().map(function (p) { return { value: p.id, label: p.name }; });
    }
    if (field.optionsFrom === "claims") {
      return ICB.DATA.claims.pathways.map(function (c) { return { value: c.id, label: c.name }; });
    }
    if (field.optionsFrom === "locations") {
      return ICB.DATA.activeLocations().map(function (l) { return { value: l.id, label: l.name + ", " + l.town }; });
    }
    return field.options || [];
  }

  function renderField(field, values) {
    var R = ICB.render;
    var val = values[field.id] || "";
    var help = field.help ? '<p class="help" id="help-' + field.id + '">' + R.esc(field.help) + "</p>" : "";
    var describedBy = field.help ? ' aria-describedby="help-' + field.id + '"' : "";
    var required = field.required ? " required" : "";
    var label = '<label for="f-' + field.id + '">' + R.esc(field.label) +
      (field.required ? "" : ' <span class="help" style="display:inline">(optional)</span>') + "</label>";

    if (field.type === "select") {
      var opts = fieldOptions(field).map(function (o) {
        return '<option value="' + R.esc(o.value) + '"' + (o.value === val ? " selected" : "") + ">" + R.esc(o.label) + "</option>";
      }).join("");
      return '<div class="field">' + label +
        '<select class="input" id="f-' + field.id + '" name="' + field.id + '"' + describedBy + required + ">" +
        '<option value="">Choose...</option>' + opts + "</select>" + help + "</div>";
    }
    if (field.type === "textarea") {
      return '<div class="field">' + label +
        '<textarea class="input" id="f-' + field.id + '" name="' + field.id + '"' + describedBy + required + ">" + R.esc(val) + "</textarea>" + help + "</div>";
    }
    var ac = field.autocomplete ? ' autocomplete="' + field.autocomplete + '"' : "";
    return '<div class="field">' + label +
      '<input class="input" type="' + field.type + '" id="f-' + field.id + '" name="' + field.id + '" value="' + R.esc(val) + '"' + ac + describedBy + required + ">" + help + "</div>";
  }

  function progress(step) {
    var labels = ["What is this about?", "Your details", "Review"];
    return '<ol class="contact-progress">' + labels.map(function (l, i) {
      var n = i + 1;
      var cur = n === step ? ' aria-current="step"' : "";
      var done = n < step ? ' class="is-done"' : "";
      return "<li" + cur + done + '><span class="p-num" aria-hidden="true">' + n + "</span>" + l + "</li>";
    }).join("") + "</ol>";
  }

  function stepOne() {
    var R = ICB.render;
    var flows = ICB.DATA.contactFlows;
    var tiles = flows.topics.map(function (t) {
      return '<button type="button" class="topic-option" data-topic="' + t.id + '">' +
        "<strong>" + R.esc(t.label) + "</strong><span>" + R.esc(t.description) + "</span></button>";
    }).join("");
    return '<h2 id="contact-step-title">How can we help?</h2><p>' + R.esc(flows.intro) + "</p>" +
      '<div class="topic-grid">' + tiles + "</div>";
  }

  function stepTwo() {
    var R = ICB.render;
    var topic = topicById(state.topicId);
    var out = '<h2 id="contact-step-title">' + R.esc(topic.label) + "</h2>";

    if (topic.shortCircuit) {
      out += "<p>" + R.esc(topic.shortCircuit.text) + "</p>" +
        '<div class="msg-actions">' +
        topic.shortCircuit.actions.map(function (a) {
          var ext = /^https?:/.test(a.href);
          return '<a class="msg-action" href="' + R.esc(a.href) + '"' + (ext ? R.extAttrs() : "") + ">" +
            ICB.art.glyph(a.kind === "tel" ? "phone" : "arrow") + "<span>" + R.esc(a.label) + "</span></a>";
        }).join("") + "</div>" +
        '<div class="form-nav"><button type="button" class="btn btn-ghost" data-step-back>Back</button></div>';
      return out;
    }

    if (topic.safetyNote) {
      out += '<p class="safety-note">' + ICB.art.glyph("shield") + "<span>" + R.esc(topic.safetyNote) + "</span></p>";
    }

    out += '<form data-contact-form novalidate>';
    ICB.DATA.contactFlows.commonFields.forEach(function (f) { out += renderField(f, state.values); });
    (topic.fields || []).forEach(function (f) { out += renderField(f, state.values); });
    out += '<p class="help">This concept form asks only for routing basics. Please do not include policy numbers or payment details.</p>';

    if (topic.sideNote) {
      var sa = topic.sideAction;
      var href = sa.hrefKey ? ICB.DATA.site.external[sa.hrefKey] : sa.href;
      var ext = !!sa.external || /^https?:/.test(href);
      out += '<div class="notice" style="margin-bottom: var(--sp-5);"><p>' + R.esc(topic.sideNote) + " " +
        '<a href="' + R.esc(href) + '"' + (ext ? R.extAttrs() : "") + ">" + R.esc(sa.label) + (ext ? R.extNote(R.hostOf(href)) : "") + "</a></p></div>";
    }

    out += '<div class="form-nav">' +
      '<button type="button" class="btn btn-ghost" data-step-back>Back</button>' +
      '<button type="submit" class="btn btn-primary">Continue to review</button>' +
      "</div></form>";
    return out;
  }

  function stepThree() {
    var R = ICB.render;
    var topic = topicById(state.topicId);
    var rows = [["Enquiry type", topic.label]];
    var all = ICB.DATA.contactFlows.commonFields.concat(topic.fields || []);
    all.forEach(function (f) {
      var v = state.values[f.id];
      if (!v) return;
      if (f.id === "category") { var p = ICB.DATA.productById(v); v = p ? p.name : v; }
      if (f.id === "claimType") { var c = ICB.DATA.claimById(v); v = c ? c.name : v; }
      if (f.id === "branch") { var l = ICB.DATA.locationById(v); v = l ? l.name : v; }
      rows.push([f.label, v]);
    });
    var dl = rows.map(function (r) {
      return "<div><dt>" + R.esc(r[0]) + "</dt><dd>" + R.esc(r[1]) + "</dd></div>";
    }).join("");
    return '<h2 id="contact-step-title">Review your enquiry</h2>' +
      '<dl class="review-list">' + dl + "</dl>" +
      '<div class="form-nav">' +
      '<button type="button" class="btn btn-ghost" data-step-back>Back</button>' +
      '<button type="button" class="btn btn-primary" data-step-submit>Send to ICB</button>' +
      "</div>";
  }

  function stepDone() {
    var R = ICB.render;
    var n = ICB.DATA.contactFlows.demoNotice;
    return '<div class="demo-notice" data-demo-notice tabindex="-1">' +
      '<h3 id="contact-step-title">' + R.esc(n.title) + "</h3><p>" + R.esc(n.body) + "</p>" +
      '<div class="msg-actions">' +
      n.actions.map(function (a) {
        return '<a class="msg-action" href="' + R.esc(a.href) + '">' +
          ICB.art.glyph(a.kind === "tel" ? "phone" : "mail") + "<span>" + R.esc(a.label) + "</span></a>";
      }).join("") + "</div>" +
      '<div class="form-nav"><button type="button" class="btn btn-ghost" data-step-restart>Start another enquiry</button></div>' +
      "</div>";
  }

  function panelHtml() {
    var body;
    if (state.step === 1) body = stepOne();
    else if (state.step === 2) body = stepTwo();
    else if (state.step === 3) body = stepThree();
    else body = stepDone();
    return (state.step <= 3 ? progress(Math.min(state.step, 3)) : "") + body;
  }

  function rerender(mount) {
    var panel = mount.querySelector("[data-contact-panel]");
    panel.innerHTML = panelHtml();
    var live = mount.querySelector("[data-contact-live]");
    if (live) {
      live.textContent = state.step === 4 ? "Enquiry review complete" : "Step " + state.step + " of 3";
    }
    var title = panel.querySelector("#contact-step-title");
    if (title && state.interacted) { title.setAttribute("tabindex", "-1"); title.focus(); }
    wire(mount);
  }

  function collect(form) {
    Array.prototype.forEach.call(form.elements, function (el) {
      if (el.name) state.values[el.name] = el.value.trim();
    });
  }

  function wire(mount) {
    var panel = mount.querySelector("[data-contact-panel]");

    Array.prototype.forEach.call(panel.querySelectorAll("[data-topic]"), function (btn) {
      btn.addEventListener("click", function () {
        state.topicId = btn.getAttribute("data-topic");
        state.step = 2;
        state.interacted = true;
        rerender(mount);
      });
    });

    var back = panel.querySelector("[data-step-back]");
    if (back) back.addEventListener("click", function () {
      var form = panel.querySelector("[data-contact-form]");
      if (form) collect(form);
      state.step = Math.max(1, state.step - 1);
      state.interacted = true;
      rerender(mount);
    });

    var form = panel.querySelector("[data-contact-form]");
    if (form) form.addEventListener("submit", function (e) {
      e.preventDefault();
      collect(form);
      var firstInvalid = null;
      Array.prototype.forEach.call(form.querySelectorAll("[required]"), function (el) {
        if (!el.value.trim() && !firstInvalid) firstInvalid = el;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      state.step = 3;
      state.interacted = true;
      rerender(mount);
    });

    var submit = panel.querySelector("[data-step-submit]");
    if (submit) submit.addEventListener("click", function () {
      state.step = 4;
      state.interacted = true;
      rerender(mount);
      var notice = panel.querySelector("[data-demo-notice]");
      if (notice) notice.focus();
    });

    var restart = panel.querySelector("[data-step-restart]");
    if (restart) restart.addEventListener("click", function () {
      state = freshState({});
      state.interacted = true;
      rerender(mount);
    });
  }

  ICB.views.contact = {
    title: "Contact ICB | Talk to us",
    render: function (ctx) {
      var R = ICB.render;
      var site = ICB.DATA.site;
      state = freshState(ctx.query);
      if (state.topicId && !topicById(state.topicId)) state.topicId = null;
      if (state.topicId) state.step = 2;

      return '' +
        '<section class="page-hero on-dark" aria-labelledby="contact-title">' +
          '<div class="page-hero-art art-panel" data-img-slot="contact-hero" aria-hidden="true">' + ICB.art.panel("hero") + "</div>" +
          '<div class="shell page-hero-inner">' +
            R.crumbsHome("Contact") +
            '<span class="eyebrow">Contact</span>' +
            '<h1 id="contact-title">Talk to ICB.</h1>' +
            '<p class="hero-lead">' + R.esc(site.org.serviceQuote) + "</p>" +
          "</div>" +
        "</section>" +

        '<section class="section" aria-labelledby="contact-form-heading">' +
          '<div class="shell">' +
            '<h2 id="contact-form-heading" class="visually-hidden">Start an enquiry</h2>' +
            '<p class="visually-hidden" aria-live="polite" data-contact-live></p>' +
            '<div class="contact-layout">' +
              '<div class="contact-panel rv" data-contact-panel></div>' +
              '<aside class="contact-rail rv">' +
                "<h2>Reach ICB directly</h2>" +
                "<address>" + R.esc(site.corporate.label) + "<br>" +
                  R.esc(site.corporate.address) + ", " + R.esc(site.corporate.poBox) + "<br>" +
                  R.esc(site.corporate.city) + ", Belize</address>" +
                '<div class="msg-actions">' +
                  '<a class="msg-action" href="tel:' + R.esc(site.corporate.phoneTel) + '">' + ICB.art.glyph("phone") + "<span>" + R.esc(site.corporate.phoneDisplay) + "</span></a>" +
                  '<button type="button" class="msg-action msg-action--wa" data-wa-directory>' + ICB.art.waIcon() + "<span>WhatsApp ICB</span></button>" +
                  '<a class="msg-action" href="mailto:' + R.esc(site.corporate.email) + '">' + ICB.art.glyph("mail") + "<span>" + R.esc(site.corporate.email) + "</span></a>" +
                  '<a class="msg-action" href="#/locations">' + ICB.art.glyph("marker") + "<span>Every branch and agency</span></a>" +
                "</div>" +
                ICB.render.assistBadge(true) +
              "</aside>" +
            "</div>" +
          "</div>" +
        "</section>";
    },
    mounted: function (mount) {
      rerender(mount);
    }
  };
})();
