/* ============================================================================
   Talk to Bee — the ICB assistant launcher.

   A pill in ICB red sits in the bottom right on every page. Tapping it
   opens a panel holding the Chatbase assistant exactly as supplied: their
   iframe, their chrome, their header. Nothing here restyles the assistant
   itself, so what ICB approved in the Chatbase preview is what a visitor
   sees.

   THE IFRAME IS NOT CREATED UNTIL THE PILL IS TAPPED. That is the whole
   point of "until engaged": every other page on this site makes zero
   requests off ICB's own domain, and this keeps that true for anyone who
   never opens the assistant. Once opened it stays in the document, so the
   conversation survives navigation around the site.

   The assistant is the first and only outside connection the site makes.
   Where that connection cannot be made, the panel says so and offers the
   assistant in a new tab rather than showing an empty white box: that is
   the case in the single-file preview, whose sandbox refuses every
   outside request, and on any network that cannot reach chatbase.co.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  var SRC = "https://www.chatbase.co/chatbot-iframe/goJ6R0Hw-bYT3iEd4kaKE";

  /* How long to wait for the frame before saying it did not arrive. Long
     enough for a slow phone on a Belizean mobile connection, short enough
     that a blocked request does not look like a hang. */
  var GIVE_UP = 6000;

  var root, panel, frame, pill, label, note, opener;
  var loaded = false;
  var open = false;

  function esc(s) { return ICB.render.esc(s); }

  /* The ICB bee badge, supplied as the mark for this launcher. It arrives
     as a circle already, ring and all, so it fills its plate edge to edge
     and the plate's round clip lands just outside the ring. Served at
     256px for a 42px slot, which is what keeps it crisp on a phone. */
  function badge(cls) {
    return '<span class="' + cls + '" aria-hidden="true"><picture>' +
      '<source type="image/webp" data-asset-srcset="assets/img/icb-bee-256.webp">' +
      '<img data-asset="assets/img/icb-bee-256.png" alt="" width="256" height="256">' +
      "</picture></span>";
  }

  /* The single-file preview carries every asset as a data URI, which is
     the one place ICB.ASSETS is populated. It is also the one place an
     outside request is refused outright, so the panel can say so straight
     away instead of waiting out the timeout. */
  function isSandboxedPreview() {
    return Object.keys(ICB.ASSETS || {}).length > 0;
  }

  function markup() {
    return '' +
      '<div class="bee-panel" id="bee-panel" role="dialog" aria-modal="false"' +
        ' aria-label="' + esc(ICB.s("assistantTitle")) + '" hidden>' +
        '<div class="bee-frame" data-bee-frame></div>' +
        /* Covers the frame from the moment it is created until it loads.
           Without it the first thing anyone sees is the browser's own
           broken-frame placeholder, a white rectangle with a torn-page
           icon, which reads as a broken feature rather than a slow one. */
        '<div class="bee-note" data-bee-note aria-live="polite" hidden>' +
          badge("bee-note-mark") +
          '<p data-bee-note-text></p>' +
          '<a class="btn btn-primary btn-sm" data-bee-note-link href="' + SRC + '"' +
            ' target="_blank" rel="noopener noreferrer" hidden>' +
            esc(ICB.s("assistantNewTab")) +
          "</a>" +
        "</div>" +
      "</div>" +
      '<button type="button" class="bee-pill" data-bee-toggle' +
        ' aria-expanded="false" aria-controls="bee-panel">' +
        badge("bee-mark") +
        '<span class="bee-label" data-bee-label>' + esc(ICB.s("assistantOpen")) + "</span>" +
        '<span class="bee-x" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"' +
          ' stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
        "</span>" +
      "</button>";
  }

  /* Built on first open and never again, so the conversation is not thrown
     away by navigating the site. */
  function mountFrame() {
    if (loaded) return;
    loaded = true;

    if (isSandboxedPreview()) {
      state = "preview";
      showNote("assistantPreviewNote", true);
      return;
    }

    state = "loading";
    showNote("assistantLoading", false);

    reachable().then(function (yes) {
      if (state !== "loading") return;
      if (!yes) { state = "offline"; showNote("assistantOfflineNote", true); return; }
      createFrame();
    });
  }

  /* Can we get to chatbase.co at all?

     The frame's own load event cannot answer that. A cross-origin iframe
     fires load for the browser's own error page exactly as readily as for
     the real assistant, and the document inside is unreadable from here,
     so a frame that failed looks identical to one that worked. Measured:
     with the request blocked, load fired inside 400ms and the panel
     cheerfully declared itself ready over a torn-page placeholder.

     A no-cors request does answer it. It resolves opaquely when the
     origin is reachable and rejects when the network refuses or a sandbox
     forbids the connection, which is the distinction that matters. Asking
     first also means the broken-frame placeholder is never painted at
     all: the panel goes from "connecting" either to the assistant or to
     an explanation, and never through a white rectangle. */
  function reachable() {
    if (typeof fetch !== "function" || typeof Promise !== "function") {
      return { then: function (fn) { fn(true); } };
    }
    var giveUp = new Promise(function (resolve) {
      setTimeout(function () { resolve(false); }, GIVE_UP);
    });
    var probe = fetch(SRC, { mode: "no-cors", cache: "no-store" })
      .then(function () { return true; }, function () { return false; });
    return Promise.race([probe, giveUp]);
  }

  function createFrame() {
    var el = document.createElement("iframe");
    el.src = SRC;
    el.title = ICB.s("assistantTitle");
    el.setAttribute("allow", "microphone");
    el.setAttribute("frameborder", "0");
    frame.appendChild(el);

    el.addEventListener("load", function () {
      state = "ready";
      note.hidden = true;
      root.classList.add("is-ready");
    });

    // Reachable but not arriving is still a failure worth naming.
    setTimeout(function () {
      if (state === "ready") return;
      state = "offline";
      showNote("assistantOfflineNote", true);
    }, GIVE_UP);
  }

  /* state is remembered so a language change can restate whichever note
     is showing without having to work out which one that was. */
  var state = "idle";

  function showNote(key, withLink) {
    noteKey = key;
    note.querySelector("[data-bee-note-text]").textContent = ICB.s(key);
    note.querySelector("[data-bee-note-link]").hidden = !withLink;
    note.hidden = false;
  }
  var noteKey = null;

  function setOpen(next, fromEl) {
    if (next === open) return;
    open = next;
    panel.hidden = !open;
    root.classList.toggle("is-open", open);
    pill.setAttribute("aria-expanded", String(open));
    label.textContent = ICB.s(open ? "assistantClose" : "assistantOpen");
    if (open) {
      opener = fromEl || pill;
      mountFrame();
    } else if (opener && opener.focus) {
      opener.focus();
      opener = null;
    }
  }

  /* Restated on a language change. Only the text: rewriting the markup
     would take the iframe with it and end the conversation mid-sentence. */
  function relabel() {
    if (!pill) return;
    label.textContent = ICB.s(open ? "assistantClose" : "assistantOpen");
    panel.setAttribute("aria-label", ICB.s("assistantTitle"));
    var link = panel.querySelector("[data-bee-note-link]");
    if (link) link.textContent = ICB.s("assistantNewTab");
    var text = panel.querySelector("[data-bee-note-text]");
    if (text && !note.hidden && noteKey) text.textContent = ICB.s(noteKey);
  }

  ICB.assistant = {
    init: function () {
      root = document.getElementById("assistant-mount");
      if (!root) return;
      root.className = "bee";
      root.innerHTML = markup();

      panel = root.querySelector(".bee-panel");
      frame = root.querySelector("[data-bee-frame]");
      note = root.querySelector("[data-bee-note]");
      pill = root.querySelector("[data-bee-toggle]");
      label = root.querySelector("[data-bee-label]");

      ICB.hydrateAssets(root);

      pill.addEventListener("click", function () { setOpen(!open, pill); });

      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && open) { setOpen(false); pill.focus(); }
      });

      /* The mobile menu and the two directories take over the screen, and
         a chat panel underneath them would be both unreachable and in the
         way of their close buttons. Watched from here rather than
         announced from there: one listener beats an event three other
         files have to remember to fire. */
      document.addEventListener("click", function (e) {
        if (!open) return;
        if (e.target.closest("[data-menu-toggle], [data-wa-directory], [data-call-directory]")) {
          setOpen(false);
        }
      }, true);

      document.addEventListener("icb:lang", relabel);
    },
    open: function () { setOpen(true); },
    close: function () { setOpen(false); },
    relabel: relabel
  };
})();
