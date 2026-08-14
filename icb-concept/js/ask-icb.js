/* ============================================================================
   Ask ICB — interface.
   A polished, site-native guide panel. Talks only to ICB.askEngine
   (see js/ask-engine.js for the adapter boundary).
   States: closed -> ready -> awaiting (input disabled while a reply is
   being prepared) -> ready.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var panel, overlay, log, input, sendBtn, suggestWrap, opener = null, isOpen = false, busy = false;

  function R() { return ICB.render; }

  function blockHtml(b) {
    var r = R();
    if (b.t === "link") {
      var ext = !!b.external || /^https?:/.test(b.href);
      return '<a class="msg-action" href="' + r.esc(b.href) + '"' + (ext ? r.extAttrs() : "") + ">" +
        ICB.art.glyph("arrow") + "<span>" + r.esc(b.label) + "</span>" + (ext ? r.extNote(r.hostOf(b.href)) : "") + "</a>";
    }
    if (b.t === "contact") {
      var glyphName = b.kind === "tel" ? "phone" : (b.kind === "wa" ? "whatsapp" : "mail");
      var extc = /^https?:/.test(b.href);
      return '<a class="msg-action" href="' + r.esc(b.href) + '"' + (extc ? r.extAttrs() : "") + ">" +
        ICB.art.glyph(glyphName) + "<span>" + r.esc(b.label) + "</span>" + (extc ? r.extNote(r.hostOf(b.href)) : "") + "</a>";
    }
    return "<p>" + r.esc(b.text) + "</p>";
  }

  function appendMessage(who, blocks) {
    var msg = document.createElement("div");
    msg.className = "msg msg-" + who;
    var speaker = who === "user" ? "You said" : "ICB replied";
    var paragraphs = blocks.filter(function (b) { return b.t === "p"; });
    var actions = blocks.filter(function (b) { return b.t !== "p"; });
    msg.innerHTML =
      '<span class="visually-hidden">' + speaker + ": </span>" +
      '<div class="msg-bubble">' + paragraphs.map(blockHtml).join("") + "</div>" +
      (actions.length ? '<div class="msg-actions">' + actions.map(blockHtml).join("") + "</div>" : "");
    log.appendChild(msg);
    log.scrollTop = log.scrollHeight;
    return msg;
  }

  function showTyping() {
    var t = document.createElement("div");
    t.className = "msg msg-icb";
    t.setAttribute("data-typing", "");
    t.innerHTML = '<div class="msg-bubble typing" aria-label="ICB is preparing a reply"><i></i><i></i><i></i></div>';
    log.appendChild(t);
    log.scrollTop = log.scrollHeight;
  }

  function clearTyping() {
    var t = log.querySelector("[data-typing]");
    if (t) t.remove();
  }

  function setSuggestions(list) {
    var r = R();
    suggestWrap.innerHTML = (list || []).map(function (s) {
      return '<button type="button" class="chip" data-ask-suggest>' + r.esc(s) + "</button>";
    }).join("");
  }

  function setBusy(b) {
    busy = b;
    input.disabled = b;
    sendBtn.disabled = b;
  }

  function submit(text) {
    text = String(text || "").trim();
    if (!text || busy) return;
    appendMessage("user", [{ t: "p", text: text }]);
    input.value = "";
    setBusy(true);
    setSuggestions([]);
    showTyping();
    ICB.askEngine.send(text, { route: location.hash }).then(function (reply) {
      clearTyping();
      appendMessage("icb", reply.blocks);
      setSuggestions(reply.suggestions || []);
      setBusy(false);
      if (isOpen) input.focus();
    });
  }

  function inertTargets() {
    return ["main", "site-header", "site-footer", "quick-bar-mount"].map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);
  }

  function open(fromEl, prefill) {
    if (isOpen) { if (prefill) submit(prefill); return; }
    isOpen = true;
    opener = fromEl || null;
    overlay.hidden = false;
    panel.hidden = false;
    document.body.classList.add("sheet-open");
    document.body.style.overflow = "hidden";
    inertTargets().forEach(function (el) { el.setAttribute("inert", ""); });
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
      panel.classList.add("is-open");
    });
    if (!log.childElementCount) {
      var g = ICB.DATA.askIcb.greeting;
      appendMessage("icb", g.blocks);
      setSuggestions(ICB.DATA.askIcb.suggestions);
    }
    setTimeout(function () { input.focus(); }, 60);
    if (prefill) submit(prefill);
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove("is-open");
    panel.classList.remove("is-open");
    document.body.classList.remove("sheet-open");
    document.body.style.overflow = "";
    inertTargets().forEach(function (el) { el.removeAttribute("inert"); });
    setTimeout(function () {
      overlay.hidden = true;
      panel.hidden = true;
    }, 260);
    if (opener && opener.focus) opener.focus();
  }

  function trapFocus(e) {
    if (!isOpen || e.key !== "Tab") return;
    var focusables = panel.querySelectorAll("a[href], button:not([disabled]), input:not([disabled])");
    if (!focusables.length) return;
    var first = focusables[0], last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
    else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
  }

  function init() {
    var r = R();
    var data = ICB.DATA.askIcb;
    var mountEl = document.getElementById("ask-icb-mount");
    mountEl.innerHTML =
      '<div class="ask-overlay" data-ask-overlay hidden></div>' +
      '<section class="ask-panel" role="dialog" aria-modal="true" aria-labelledby="ask-title-text" hidden>' +
        '<header class="ask-head">' +
          '<svg class="brand-mark" viewBox="0 0 44 44" aria-hidden="true" focusable="false">' +
            '<rect x="1" y="1" width="42" height="42" rx="9" fill="#0A1A2F"/>' +
            '<path d="M22 7.5l10.5 4.2v9.3c0 6.4-4.2 12-10.5 14.6C15.7 33 11.5 27.4 11.5 21v-9.3z" fill="none" stroke="#E6C87E" stroke-width="1.7"/>' +
            '<text x="22" y="25.5" text-anchor="middle" font-family="Georgia, serif" font-size="11.5" font-weight="700" fill="#FFFFFF" letter-spacing="0.5">ICB</text>' +
          "</svg>" +
          '<div class="ask-title"><strong id="ask-title-text">' + r.esc(data.title) + "</strong><span>" + r.esc(data.subtitle) + "</span></div>" +
          '<button type="button" class="ask-close" data-ask-close aria-label="Close Ask ICB">' + ICB.art.glyph("close") + "</button>" +
        "</header>" +
        '<div class="ask-log" role="log" aria-live="polite" data-ask-log></div>' +
        '<div class="ask-suggest" data-ask-suggest-wrap aria-label="Suggested questions"></div>' +
        '<form class="ask-form" data-ask-form>' +
          '<label class="visually-hidden" for="ask-input">Ask ICB a question</label>' +
          '<input class="input" id="ask-input" type="text" autocomplete="off" placeholder="Type a question...">' +
          '<button type="submit" class="ask-send" aria-label="Send">' + ICB.art.glyph("send") + "</button>" +
        "</form>" +
        '<p class="ask-foot">' + r.esc(data.disclaimer) + "</p>" +
      "</section>";

    overlay = mountEl.querySelector("[data-ask-overlay]");
    panel = mountEl.querySelector(".ask-panel");
    log = mountEl.querySelector("[data-ask-log]");
    suggestWrap = mountEl.querySelector("[data-ask-suggest-wrap]");
    input = mountEl.querySelector("#ask-input");
    sendBtn = mountEl.querySelector(".ask-send");

    mountEl.querySelector("[data-ask-form]").addEventListener("submit", function (e) {
      e.preventDefault();
      submit(input.value);
    });
    suggestWrap.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-ask-suggest]");
      if (chip) submit(chip.textContent);
    });
    log.addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#/']");
      if (a) close();
    });
    mountEl.querySelector("[data-ask-close]").addEventListener("click", close);
    overlay.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen) close();
      trapFocus(e);
    });

    // Global launchers: any element with data-ask-launcher opens the panel;
    // data-ask-prefill sends a question immediately (used in demos and cards).
    document.addEventListener("click", function (e) {
      var launcher = e.target.closest("[data-ask-launcher]");
      if (!launcher) return;
      e.preventDefault();
      open(launcher, launcher.getAttribute("data-ask-prefill") || "");
    });
  }

  ICB.ask = { init: init, open: open, close: close };
})();
