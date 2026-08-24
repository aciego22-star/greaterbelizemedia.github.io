/* NATFISH AI: the Chatbase embed, the floating launcher and every
   "Ask NATFISH AI" trigger on the site.
   ==========================================================================

   Everything to do with the assistant lives in this one file, loaded on every
   page. Nothing is pasted into individual pages, so the embed exists in
   exactly one place and the launcher behaves identically everywhere.

   THE EMBED IS THE IFRAME ONE THE CLIENT SUPPLIED, not the script/bubble one.
   That distinction drives the whole design of this file:

     - The iframe embed has NO JavaScript API. There is no chatbase("open"),
       no getState, no queue, no way to ask it anything from the host page.
       So the panel that holds it is ours, and opening and closing is simply
       showing and hiding that panel.
     - Because the panel is ours, the chat inside it is still entirely
       Chatbase's: this is their iframe at their URL, unmodified. Nothing is
       drawn to look like a chat, and nothing reaches into the frame.
     - On natfish-ai.html the same embed runs inline in the page, which is
       what this embed form is for. Triggers on that page scroll to it rather
       than opening a second copy of the same conversation. */

(function () {
  "use strict";

  /* =====================================================================
     CONFIGURATION - the only place the Chatbase chatbot id belongs.
     From the embed supplied by the client:

       <iframe src="https://www.chatbase.co/chatbot-iframe/eqR-QbTH69GbLMJsTuw8I"
               width="100%" style="height:100%;min-height:700px"
               frameborder="0" allow="microphone"></iframe>

     Nothing is appended to that URL. No query parameter, no fragment, no
     hidden instruction: the agent's behaviour is configured in Chatbase and
     nowhere else.
     ===================================================================== */
  var AGENT_ID = "eqR-QbTH69GbLMJsTuw8I";

  var IFRAME_BASE = "https://www.chatbase.co/chatbot-iframe/";

  var state = {
    open: false,        /* the floating panel is showing */
    loaded: false,      /* the panel's iframe has been given its src */
    docked: false,      /* the pill has finished gliding to the right margin */
    lastTrigger: null   /* where focus goes back to when the panel closes */
  };

  var panel = null;
  var statusEl = null;

  /* ---------------------------------------------------------- helpers -- */

  function t(english) {
    /* Reuse the site's translator so the assistant's chrome switches with
       everything else. Falls back to English if i18n has not loaded. */
    var api = window.NATFISH;
    return api && typeof api.t === "function" ? api.t(english) : english;
  }

  function announce(english) {
    if (!statusEl) return;
    statusEl.textContent = english ? t(english) : "";
  }

  function src() {
    return IFRAME_BASE + AGENT_ID;
  }

  /* The artifact preview is a single self-contained file served under a strict
     Content-Security-Policy that blocks every external host, so the Chatbase
     frame cannot load there and never will. An empty white box reads as a
     broken build, so the preview says what it is instead. Set only by
     tools/bundle-preview.py; on the real site this is never true. */
  function isPreview() {
    return window.NATFISH_PREVIEW === true;
  }

  function previewNote() {
    var wrap = document.createElement("div");
    wrap.className = "ai-blocked";
    var h = document.createElement("p");
    h.className = "ai-blocked__title";
    h.textContent = t("NATFISH AI is live on the website itself.");
    var b = document.createElement("p");
    b.textContent = t("This shareable preview is a single file and cannot load "
      + "the chat window. Open the deployed site to talk to NATFISH AI.");
    wrap.appendChild(h);
    wrap.appendChild(b);
    return wrap;
  }

  /* Built rather than written into every page: it has no visual presence
     until it is opened, so nine copies of it in the markup would be nine
     copies of nothing. The pill stays in the shell markup, because that one
     IS visible at first paint. */
  function makeIframe(title) {
    var frame = document.createElement("iframe");
    frame.title = title;
    frame.setAttribute("allow", "microphone");
    frame.setAttribute("frameborder", "0");
    frame.className = "ai-frame";
    return frame;
  }

  /* ------------------------------------------------------- the panel -- */

  function buildPanel() {
    if (panel) return panel;

    panel = document.createElement("div");
    panel.className = "ai-panel";
    panel.id = "ai-panel";
    panel.hidden = true;
    /* Not aria-modal: the page behind stays readable and operable, which is
       the point of a docked assistant rather than a takeover. */
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", t("NATFISH AI"));

    var bar = document.createElement("div");
    bar.className = "ai-panel__bar";

    var title = document.createElement("span");
    title.className = "ai-panel__title";
    title.textContent = "NATFISH AI";

    var close = document.createElement("button");
    close.type = "button";
    close.className = "ai-panel__close";
    close.setAttribute("aria-label", t("Close NATFISH AI"));
    close.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" aria-hidden="true" ' +
      'focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    close.addEventListener("click", function () { closePanel(true); });

    bar.appendChild(title);
    bar.appendChild(close);

    var body = document.createElement("div");
    body.className = "ai-panel__body";

    panel.appendChild(bar);
    panel.appendChild(body);
    document.body.appendChild(panel);
    return panel;
  }

  /* The src is set on first open, never on page load. A visitor who never
     asks for the assistant never sends a request to chatbase.co. */
  function loadPanel() {
    if (state.loaded) return;
    state.loaded = true;
    var body = panel.querySelector(".ai-panel__body");
    if (isPreview()) {
      body.appendChild(previewNote());
      return;
    }
    var frame = makeIframe(t("NATFISH AI chat"));
    frame.src = src();
    body.appendChild(frame);
  }

  function openPanel() {
    buildPanel();
    loadPanel();
    panel.hidden = false;
    /* One frame between unhiding and the open class so the entrance
       transition has a starting point to animate from. */
    window.requestAnimationFrame(function () {
      panel.classList.add("is-open");
    });
    state.open = true;
    document.documentElement.classList.add("ai-panel-open");
    panel.querySelector(".ai-panel__close").focus();
    announce("NATFISH AI is open.");
  }

  function closePanel(restoreFocus) {
    if (!panel || !state.open) return;
    panel.classList.remove("is-open");
    state.open = false;
    document.documentElement.classList.remove("ai-panel-open");
    /* Hidden only after the exit transition, and the iframe is kept: closing
       the panel must not throw away the conversation the visitor is having. */
    window.setTimeout(function () {
      if (!state.open) panel.hidden = true;
    }, 240);
    if (restoreFocus && state.lastTrigger) state.lastTrigger.focus();
    announce("");
  }

  /* ------------------------------------------- the inline embed, if any -- */

  /* natfish-ai.html carries the same embed in the page itself. Where that
     exists it is the destination for every trigger on that page, so the
     visitor never ends up with the assistant open twice. */
  /* The block, whether or not it is currently on screen. Used for wiring. */
  function embedBlock() {
    return document.getElementById("ai-embed");
  }

  /* The block only when it is actually RENDERED. Used for routing a click.

     On the real site each page is its own document, so where the block exists
     it is always rendered and the two are the same thing. The artifact preview
     puts all nine routes in ONE document and hides the inactive ones, and
     without this check every route in the preview believed it owned the
     in-page embed and scrolled to a display:none block instead of opening the
     panel. The wiring above must NOT apply the same test, or a route that
     starts hidden would never be wired at all. */
  function inlineHost() {
    var host = embedBlock();
    return host && host.offsetParent !== null ? host : null;
  }

  function loadInline(host) {
    if (host.getAttribute("data-loaded")) return;
    host.setAttribute("data-loaded", "true");
    var slot = host.querySelector(".ai-embed__frame");
    if (isPreview()) {
      slot.appendChild(previewNote());
      return;
    }
    var frame = makeIframe(t("NATFISH AI chat"));
    frame.src = src();
    slot.appendChild(frame);
  }

  function watchInline(host) {
    /* Load when it comes into view rather than at first paint: it is the
       point of the page, but it is still a third-party request and the
       visitor should reach it before it fires. */
    if (!("IntersectionObserver" in window)) {
      loadInline(host);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          loadInline(host);
          io.disconnect();
        }
      });
    }, { rootMargin: "300px" });
    io.observe(host);
  }

  function goToInline(host) {
    loadInline(host);
    host.scrollIntoView({ behavior: "smooth", block: "start" });
    /* Focus the region, not the iframe: dropping focus straight into a
       third-party frame takes the keyboard away without warning. */
    host.setAttribute("tabindex", "-1");
    host.focus({ preventScroll: true });
  }

  /* ------------------------------------------------- swim and docking -- */

  /* How far the pill may drift before its right edge reaches the right margin.
     Measured rather than guessed: the label changes width between English and
     Spanish and the margins change at the small breakpoint, so a hard-coded
     distance would either cut the swim short or push the pill off screen and
     create horizontal overflow. */
  function measureTravel(pill) {
    var styles = window.getComputedStyle(pill);
    var left = parseFloat(styles.left) || 0;
    /* getBoundingClientRect reflects the current transform, so the untransformed
       width comes from offsetWidth. */
    var width = pill.offsetWidth;
    var travel = document.documentElement.clientWidth - width - left * 2;
    pill.style.setProperty("--ai-travel", Math.max(0, Math.round(travel)) + "px");
  }

  function watchTravel(pill) {
    measureTravel(pill);
    var pending = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(pending);
      pending = window.setTimeout(function () { measureTravel(pill); }, 120);
    });
    /* The label is re-rendered when the language changes, which changes the
       pill's width and therefore its travel. */
    document.addEventListener("natfish:languagechange", function () {
      window.setTimeout(function () { measureTravel(pill); }, 0);
    });
  }

  /* Glide to the right margin and stay there. Freezing the current transform
     first is what makes it a glide rather than a jump: without it the element
     would snap from wherever the swim had reached to the docked position the
     instant the animation is removed. */
  function dock(pill, done) {
    if (pill.classList.contains("is-docked")) {
      if (done) done();
      return;
    }
    measureTravel(pill);
    var current = window.getComputedStyle(pill).transform;
    pill.style.transform = current === "none" ? "translateX(0)" : current;
    pill.classList.add("is-docking");

    /* Two frames: one for the frozen transform to be committed, one for the
       transition to have something to animate from. */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        pill.style.transform = "";
        pill.classList.add("is-docked");
        if (done) whenSettled(pill, done);
      });
    });
  }

  /* Wait for the glide to actually finish rather than for a duration that
     matches it. The two frames above push the transition's end past any
     hard-coded 550ms, and the panel opening while the pill is still 10px short
     of the margin is exactly the seam this is meant to avoid. The timeout is
     only a safety net, for reduced motion and for any browser that does not
     fire the event. */
  function whenSettled(pill, done) {
    var finished = false;
    var finish = function () {
      if (finished) return;
      finished = true;
      pill.removeEventListener("transitionend", onEnd);
      done();
    };
    var onEnd = function (event) {
      if (event.propertyName === "transform" && event.target === pill) finish();
    };
    pill.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 900);
  }

  /* Any trigger anywhere on the page docks the pill, so the launcher is always
     at rest beside the panel that just opened. */
  function dockPill(done) {
    var pill = document.querySelector(".ai-pill");
    if (!pill) {
      state.docked = true;
      if (done) done();
      return;
    }
    dock(pill, function () {
      state.docked = true;
      if (done) done();
    });
  }

  /* ---------------------------------------------------------- triggers -- */

  /* Every trigger is a real link whose href is a sensible destination if the
     script never runs. That is why none of them is href="#": with JavaScript
     off the visitor still lands on natfish-ai.html, where the embed runs in
     the page itself, instead of on a dead control. */
  function onTrigger(event) {
    var el = event.currentTarget;

    /* Modified clicks belong to the browser, not to us. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;

    event.preventDefault();
    state.lastTrigger = el;

    var host = inlineHost();
    if (host) {
      dockPill();
      goToInline(host);
      return;
    }

    dockPill(function () { openPanel(); });
  }

  /* ------------------------------------------------------------- init -- */

  function init() {
    statusEl = document.getElementById("ai-status");

    /* Wired from the raw lookup: an IntersectionObserver on a display:none
       element simply does not fire until it is shown, which is the behaviour
       the preview's router needs. */
    var block = embedBlock();
    if (block) watchInline(block);

    var pill = document.querySelector(".ai-pill");
    if (pill) watchTravel(pill);

    var triggers = document.querySelectorAll("[data-ai-open]");
    Array.prototype.forEach.call(triggers, function (el) {
      el.addEventListener("click", onTrigger);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.open) closePanel(true);
    });

    /* The label inside our own chrome is translated; the conversation inside
       the frame is Chatbase's and answers in whichever language it is
       addressed in. */
    document.addEventListener("natfish:languagechange", function () {
      if (!panel) return;
      panel.setAttribute("aria-label", t("NATFISH AI"));
      panel.querySelector(".ai-panel__close")
           .setAttribute("aria-label", t("Close NATFISH AI"));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
