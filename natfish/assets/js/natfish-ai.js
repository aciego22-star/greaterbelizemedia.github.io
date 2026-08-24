/* NATFISH AI: Chatbase loader, the floating launcher and every "Ask NATFISH AI"
   trigger on the site.
   ==========================================================================

   Everything to do with the assistant lives in this one file, loaded on every
   page. Nothing is pasted into individual pages, so the agent id exists in
   exactly one place and the launcher behaves identically everywhere.

   THE ONE VALUE THAT STILL HAS TO BE SUPPLIED IS AGENT_ID, DIRECTLY BELOW.
   Until it is filled in, every trigger degrades to a plain link: the pill and
   the page buttons still work, they just navigate instead of opening a chat
   panel. No fake id is used, because a wrong id fails silently at runtime and
   looks exactly like a working one until someone clicks it. */

(function () {
  "use strict";

  /* =====================================================================
     CONFIGURATION - the only place an agent id belongs.
     Paste the id from Chatbase (Dashboard > the NATFISH agent > Connect >
     Embed; it is the value assigned to script.id) between the quotes.
     ===================================================================== */
  var AGENT_ID = ""; /* TODO: REPLACE WITH THE NATFISH CHATBASE AGENT ID */

  var EMBED_SRC = "https://www.chatbase.co/embed.min.js";
  var EMBED_DOMAIN = "www.chatbase.co";

  /* How long a click waits for a still-loading widget before giving up and
     letting the link navigate instead. Long enough for a slow phone
     connection, short enough that nothing feels broken. */
  var OPEN_TIMEOUT_MS = 6000;

  var state = {
    requested: false,   /* the embed script has been asked for */
    ready: false,       /* chatbase has answered "initialized" */
    failed: false,      /* the script errored, or there is no id */
    pending: false      /* a click is waiting on the widget right now */
  };

  var statusEl = null;

  /* ---------------------------------------------------------- helpers -- */

  function t(english) {
    /* Reuse the site's translator so the assistant's strings switch with
       everything else. Falls back to English if i18n has not loaded. */
    var api = window.NATFISH;
    return api && typeof api.t === "function" ? api.t(english) : english;
  }

  function announce(english) {
    if (!statusEl) return;
    statusEl.textContent = english ? t(english) : "";
  }

  /* --------------------------------------------------------- chatbase -- */

  function installQueue() {
    /* Chatbase's own stub: calls made before the script loads are queued and
       replayed. Written out rather than inlined per page so there is one
       copy. */
    if (window.chatbase && window.chatbase("getState") === "initialized") return;

    var stub = function () {
      if (!stub.q) stub.q = [];
      stub.q.push(arguments);
    };
    window.chatbase = new Proxy(stub, {
      get: function (target, prop) {
        if (prop === "q") return target.q;
        return function () {
          var args = Array.prototype.slice.call(arguments);
          return target.apply(null, [prop].concat(args));
        };
      }
    });
  }

  function load() {
    /* Idempotent: the embed is requested once per page, no matter how many
       triggers the visitor clicks. */
    if (state.requested) return;
    state.requested = true;

    if (!AGENT_ID) {
      state.failed = true;
      return;
    }

    installQueue();

    var script = document.createElement("script");
    script.src = EMBED_SRC;
    script.id = AGENT_ID;
    script.domain = EMBED_DOMAIN;
    script.async = true;
    script.onerror = function () {
      state.failed = true;
      announce("NATFISH AI could not be reached. You can contact the team directly instead.");
    };
    document.body.appendChild(script);

    /* Poll for readiness rather than trusting onload: the script tag having
       run is not the same as the widget being able to open. */
    var started = Date.now();
    var poll = window.setInterval(function () {
      var up = false;
      try {
        up = window.chatbase && window.chatbase("getState") === "initialized";
      } catch (err) {
        up = false;
      }
      if (up) {
        state.ready = true;
        window.clearInterval(poll);
      } else if (Date.now() - started > OPEN_TIMEOUT_MS * 3) {
        state.failed = true;
        window.clearInterval(poll);
      }
    }, 250);
  }

  function openWidget() {
    try {
      window.chatbase("open");
      return true;
    } catch (err) {
      return false;
    }
  }

  /* ---------------------------------------------------------- triggers -- */

  /* Every trigger is a real link whose href is a sensible destination if the
     widget never arrives. That is why none of them is href="#": with
     JavaScript off, or Chatbase down, the visitor still gets somewhere useful
     instead of a dead control. */
  function onTrigger(event) {
    var el = event.currentTarget;

    /* Modified clicks belong to the browser, not to us. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;

    if (state.failed || !AGENT_ID) return;   /* let the link navigate */

    if (state.ready) {
      event.preventDefault();
      if (!openWidget()) {
        state.failed = true;
        window.location.href = el.getAttribute("href");
      }
      return;
    }

    /* Still loading. Hold the click briefly rather than either doing nothing
       or navigating away from a page the visitor wanted to stay on. */
    if (state.pending) {
      event.preventDefault();
      return;                                 /* ignore the impatient re-click */
    }

    event.preventDefault();
    state.pending = true;
    el.setAttribute("aria-busy", "true");
    announce("Opening NATFISH AI.");
    load();

    var waited = 0;
    var wait = window.setInterval(function () {
      waited += 200;
      if (state.ready && openWidget()) {
        window.clearInterval(wait);
        state.pending = false;
        el.removeAttribute("aria-busy");
        announce("");
      } else if (state.failed || waited >= OPEN_TIMEOUT_MS) {
        window.clearInterval(wait);
        state.pending = false;
        el.removeAttribute("aria-busy");
        announce("NATFISH AI is taking too long to load. Opening the NATFISH AI page instead.");
        window.location.href = el.getAttribute("href");
      }
    }, 200);
  }

  /* ------------------------------------------------------------- init -- */

  function init() {
    var triggers = document.querySelectorAll("[data-ai-open]");
    if (!triggers.length) return;

    statusEl = document.getElementById("ai-status");

    Array.prototype.forEach.call(triggers, function (el) {
      el.addEventListener("click", onTrigger);
    });

    /* Warm the embed on first intent rather than on page load, so a visitor
       who never asks for the assistant never pays for it. Passive and
       one-shot. */
    var warm = function () {
      load();
      window.removeEventListener("pointerdown", warm, true);
      window.removeEventListener("keydown", warm, true);
    };
    Array.prototype.forEach.call(triggers, function (el) {
      el.addEventListener("pointerenter", load, { once: true });
      el.addEventListener("focus", load, { once: true });
    });
    window.addEventListener("pointerdown", warm, { capture: true, once: true });
    window.addEventListener("keydown", warm, { capture: true, once: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
