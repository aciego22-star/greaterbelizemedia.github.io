/* ============================================================
   CUELLO'S DISTILLERY — Netlify Forms handling
   Client-side validation + AJAX submit to Netlify Forms with
   clear success / error states and a mailto fallback.
   After deployment, enable form notifications in the Netlify
   dashboard (see README.md → "Netlify configuration").
   ============================================================ */

(function () {
  "use strict";

  var I = window.CuellosI18N;
  var FALLBACK_EMAIL = "mainoffice@cuellosdistilleryltd.bz";

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function setError(field, msgKey) {
    var wrap = field.closest(".field");
    if (!wrap) return;
    wrap.classList.add("is-invalid");
    var err = $(".err", wrap);
    if (err && msgKey) err.textContent = I.t(msgKey);
    field.setAttribute("aria-invalid", "true");
  }
  function clearError(field) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.remove("is-invalid");
    field.removeAttribute("aria-invalid");
  }

  function validate(form) {
    var ok = true;
    var firstBad = null;
    $$("[required]", form).forEach(function (field) {
      clearError(field);
      var val = (field.value || "").trim();
      if (!val) {
        setError(field, "form.required");
        ok = false;
        firstBad = firstBad || field;
        return;
      }
      if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        setError(field, "form.invalidEmail");
        ok = false;
        firstBad = firstBad || field;
      }
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function encode(form) {
    var data = new FormData(form);
    var pairs = [];
    data.forEach(function (value, key) {
      pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(value));
    });
    return pairs.join("&");
  }

  function showStatus(form, kind, extraLink) {
    var ok = $(".form-status--ok", form.parentElement);
    var err = $(".form-status--err", form.parentElement);
    if (ok) ok.classList.toggle("is-visible", kind === "ok");
    if (err) {
      err.classList.toggle("is-visible", kind === "err");
      if (kind === "err") {
        err.innerHTML = I.t("form.error") + ' <a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + "</a>.";
      }
    }
    var target = kind === "ok" ? ok : err;
    if (target) {
      target.setAttribute("role", "status");
      target.focus && target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  function bind(form) {
    form.setAttribute("novalidate", "novalidate");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      var btn = $('button[type="submit"]', form);
      if (btn) btn.disabled = true;

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode(form)
      }).then(function (res) {
        if (btn) btn.disabled = false;
        if (res.ok) {
          form.reset();
          form.style.display = "none";
          showStatus(form, "ok");
        } else {
          showStatus(form, "err");
        }
      }).catch(function () {
        if (btn) btn.disabled = false;
        showStatus(form, "err");
      });
    });

    $$("[required]", form).forEach(function (field) {
      field.addEventListener("input", function () { clearError(field); });
    });
  }

  function boot() {
    $$("form[data-netlify], form[netlify]").forEach(bind);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
