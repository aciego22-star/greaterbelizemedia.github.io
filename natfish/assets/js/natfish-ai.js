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

  /* =====================================================================
     CONFIGURATION - passing the chosen product to the assistant.

     Every "Order with NATFISH AI" button carries the product it belongs to in
     data-ai-product. This constant decides what, if anything, is done with
     that value, and it is deliberately BLANK by default: with no value here
     the product is never sent anywhere, and the assistant simply opens.

     To turn it on, put the name of the context call that the NATFISH Chatbase
     plan actually exposes between the quotes - the one from Chatbase's own
     documentation for this account. It is invoked as

         chatbase(PRODUCT_CONTEXT_METHOD, { product: "Frozen Spiny Lobster Tails" });

     immediately before the panel opens. If the payload key differs from
     "product" for that call, change it in sendProductContext below; that is
     the only other place it appears.

     Two things this must never become, both of them out of bounds for this
     codebase: a synthetic message typed into the panel on the visitor's
     behalf, and any reach into the Chatbase iframe's DOM. Neither is a
     supported integration, and both would be putting words in the visitor's
     mouth. A method name that is not supported is a no-op inside the try
     below, which is the correct failure: the panel still opens.
     ===================================================================== */
  var PRODUCT_CONTEXT_METHOD = ""; /* TODO: SUPPORTED CHATBASE CONTEXT CALL, IF ANY */

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
    pending: false,     /* a click is waiting on the widget right now */
    docked: false       /* the pill has finished gliding to the right margin */
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

  /* Fired only from a trigger the visitor clicked, only when the constant
     above has been filled in, and only with the product name that is printed
     on the button they pressed. Nothing is inferred and nothing is hidden. */
  function sendProductContext(el) {
    var product = el && el.getAttribute("data-ai-product");
    if (!product || !PRODUCT_CONTEXT_METHOD) return;
    try {
      window.chatbase(PRODUCT_CONTEXT_METHOD, { product: product });
    } catch (err) {
      /* Unsupported call: the panel opens without the context, which is the
         same experience as leaving the constant blank. */
    }
  }

  function openWidget() {
    try {
      window.chatbase("open");
      return true;
    } catch (err) {
      return false;
    }
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

  /* ---------------------------------------------------------- triggers -- */

  /* Every trigger is a real link whose href is a sensible destination if the
     widget never arrives. That is why none of them is href="#": with
     JavaScript off, or Chatbase down, the visitor still gets somewhere useful
     instead of a dead control. */
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

  function onTrigger(event) {
    var el = event.currentTarget;

    /* Modified clicks belong to the browser, not to us. */
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button > 0) return;

    if (state.failed || !AGENT_ID) return;   /* let the link navigate */

    if (state.ready) {
      event.preventDefault();
      dockPill(function () {
        sendProductContext(el);
        if (!openWidget()) {
          state.failed = true;
          window.location.href = el.getAttribute("href");
        }
      });
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
    dockPill();
    load();

    var waited = 0;
    var sentContext = false;
    var wait = window.setInterval(function () {
      waited += 200;
      /* Both conditions, not either: the embed has to be ready AND the pill
         has to have arrived. Waiting on readiness alone opened the panel while
         the pill was still gliding, which is the seam this whole sequence
         exists to hide. */
      if (state.ready && state.docked) {
        /* Once, and inside the branch rather than in the condition: neither a
           tick that is still waiting nor a retry after a failed open may fire
           the context call again. */
        if (!sentContext) {
          sentContext = true;
          sendProductContext(el);
        }
        if (openWidget()) {
          window.clearInterval(wait);
          state.pending = false;
          el.removeAttribute("aria-busy");
          announce("");
          return;
        }
      }
      if (state.failed || waited >= OPEN_TIMEOUT_MS) {
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

    var pill = document.querySelector(".ai-pill");
    if (pill) watchTravel(pill);

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
