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
    /* Home before the panel appears, so it never opens off a pill that is
       halfway across the screen. */
    goHome(open);
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


  /* ------------------------------------------------------------------ */
  /* Flight                                                             */
  /*                                                                    */
  /* ICB's mascot is a bee, so the launcher flies like one instead of   */
  /* sitting in the corner: a slow wide drift with smaller, quicker     */
  /* bobs on top of it, wandering the right of the screen and now and   */
  /* again taking a wider excursion.                                    */
  /*                                                                    */
  /* Three waves on each axis, and the frequencies are deliberately not  */
  /* multiples of one another. Harmonically related waves close into a   */
  /* loop and the bee would visibly patrol a circuit; these do not meet  */
  /* again for hours, so the path never repeats while anyone is looking. */
  /*                                                                    */
  /* A moving target is a harder target, which is the honest cost of     */
  /* this, so three things give it back. It eases to a stop the moment a */
  /* pointer or the keyboard reaches it, so you never chase it. It flies */
  /* home and stays there while the panel is open, because a panel       */
  /* hanging off a moving pill would be seasick. And it does not fly at  */
  /* all for anyone who has asked their system for reduced motion.       */
  /* ------------------------------------------------------------------ */

  var FLIGHT = {
    x: [{ a: 0.54, f: 0.041, p: 0.00 },
        { a: 0.31, f: 0.107, p: 1.73 },
        { a: 0.15, f: 0.253, p: 4.11 }],
    y: [{ a: 0.47, f: 0.059, p: 2.31 },
        { a: 0.34, f: 0.151, p: 5.24 },
        { a: 0.19, f: 0.317, p: 0.87 }]
  };

  /* How much of the room available to it the bee actually uses, and the
     furthest it will go whatever the screen: on a wide monitor an
     uncapped reach would carry it halfway across the page, a long way
     from where anyone looks for a chat button. */
  var REACH_X = 0.88, MAX_X = 820;
  var REACH_Y = 0.66, MAX_Y = 520;

  /* Above 1 the bee favours its corner and only occasionally makes the
     long trip out, which is both more bee and less in the way than an
     even spread would be. Only a little above: measured at 1.25 and 1.35
     it barely left the corner, roaming 408px of a 1440px screen when the
     brief was to cross it. */
  var BIAS_X = 1.12, BIAS_Y = 1.18;

  /* Three sines of differing phase almost never peak together, so their
     sum keeps well inside its nominal range and the bee used about half
     the room it had. The gain pushes it back out; the clamp catches the
     rare moment they do align, and reads as the bee holding at the end of
     a sweep before turning back. */
  var GAIN = 1.28;

  /* Measured at 6 and 3.5 the bee took a second and a half to come fully
     to rest under a pointer, which is a long time to wait on a button.
     These bring it to a stop in about two thirds of a second, still a
     glide rather than a freeze. */
  var SETTLE = 9;     /* how fast the clock eases to a stop, per second */
  var FOLLOW = 5;     /* how closely the pill tracks the point it is given */

  var flight = {
    raf: null, last: null, t: 0,
    speed: 1, wanted: 1,
    x: 0, y: 0,
    homing: false,
    box: null
  };

  function wave(set, t) {
    var v = 0;
    for (var i = 0; i < set.length; i++) {
      v += set[i].a * Math.sin(2 * Math.PI * set[i].f * t + set[i].p);
    }
    v *= GAIN;
    return v < -1 ? -1 : v > 1 ? 1 : v;
  }

  /* The room the bee has, measured when it changes rather than every
     frame: the launcher's own box already clears the header, the quick
     bar and the safe areas, so the bee inherits all of that for free. */
  function measure() {
    if (!root || !pill) return null;
    var band = root.getBoundingClientRect();
    var inset = parseFloat(getComputedStyle(root).right) || 16;
    var pw = pill.offsetWidth, ph = pill.offsetHeight;
    var left = Math.max(0, Math.min(REACH_X * (band.right - inset - pw), MAX_X));
    /* The climb is tied to the width it has to play with as well as to the
       band. A phone is tall and narrow, and left to the band alone the bee
       roamed 153px across and 420px up: a yo-yo, not a bee, and most of
       the screen with it. Holding the box near a landscape shape keeps the
       flight reading as flight at any size. */
    flight.box = {
      left: left,
      up: Math.max(0, Math.min(REACH_Y * (band.height - ph), MAX_Y, left * 1.6))
    };
    return flight.box;
  }

  function fly(ts) {
    flight.raf = requestAnimationFrame(fly);
    if (flight.last === null) flight.last = ts;
    /* Capped, so a tab that was in the background does not come back and
       teleport the bee across the screen. */
    var dt = Math.min(0.05, (ts - flight.last) / 1000);
    flight.last = ts;
    if (document.hidden) return;

    flight.speed += (flight.wanted - flight.speed) * Math.min(1, dt * SETTLE);
    /* An exponential ease approaches nought without ever arriving, and the
       bee went on creeping about three pixels a second under a pointer
       that was trying to click it. Below a fortieth of speed there is
       nothing left worth easing, so it stops properly. */
    if (flight.wanted === 0 && flight.speed < 0.025) flight.speed = 0;
    flight.t += dt * flight.speed;

    var box = flight.box || measure();
    if (!box) return;

    var tx = 0, ty = 0;
    if (!flight.homing) {
      /* Each wave lands in -1..1; folded to 0..1 and bent by the bias, it
         becomes a distance out from the corner. */
      tx = -Math.pow((wave(FLIGHT.x, flight.t) + 1) / 2, BIAS_X) * box.left;
      ty = -Math.pow((wave(FLIGHT.y, flight.t) + 1) / 2, BIAS_Y) * box.up;
      /* Back to top owns the bottom left corner. Rather than collide and
         be pushed out, the bee simply swings wider the higher it is,
         which keeps that corner clear without a single sharp correction. */
      var high = box.up ? -ty / box.up : 0;
      tx *= 0.5 + 0.5 * high;
    }

    /* Exponential approach rather than a jump: it smooths the handover
       when the bee starts homing, and when the clock has eased to a stop
       it is what brings the bee gently to rest instead of freezing it
       mid-stride. */
    var k = 1 - Math.exp(-FOLLOW * dt);
    flight.x += (tx - flight.x) * k;
    flight.y += (ty - flight.y) * k;
    /* Same again for the position: once it is within a twentieth of a
       pixel of where it is headed it is there, and a still bee is still. */
    if (Math.abs(tx - flight.x) < 0.05) flight.x = tx;
    if (Math.abs(ty - flight.y) < 0.05) flight.y = ty;

    pill.style.transform = "translate3d(" + flight.x.toFixed(1) + "px," +
      flight.y.toFixed(1) + "px,0)";
  }

  function stillness() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function takeOff() {
    if (!pill || flight.raf || stillness()) return;
    measure();
    /* A random phase, so two people looking at the site are not watching
       the same bee fly the same path. */
    flight.t = Math.random() * 600;
    flight.last = null;
    flight.raf = requestAnimationFrame(fly);
  }

  /* Ease to a hover rather than stopping dead: the bee is a target, and a
     target you have to chase is a bad one. */
  function settle(yes) { flight.wanted = yes ? 0 : 1; }

  /* Fly home and stay there, so the panel has something still to hang off. */
  function goHome(yes) {
    flight.homing = yes;
    flight.wanted = yes ? 0 : 1;
    if (!yes) flight.last = null;
  }

  ICB.assistant = {
    init: function () {
      root = document.getElementById("assistant-mount");
      if (!root) return;
      /* Anything that has to make room for the launcher keys off this
         rather than assuming it is there. The build that ships without
         the assistant then needs no stylesheet of its own: no script, no
         class, no reserved space. */
      document.documentElement.classList.add("has-bee");
      root.className = "bee";
      root.innerHTML = markup();

      panel = root.querySelector(".bee-panel");
      frame = root.querySelector("[data-bee-frame]");
      note = root.querySelector("[data-bee-note]");
      pill = root.querySelector("[data-bee-toggle]");
      label = root.querySelector("[data-bee-label]");

      ICB.hydrateAssets(root);

      pill.addEventListener("click", function () { setOpen(!open, pill); });

      /* Reaching for it stops it. Pointer and keyboard both, because a
         control that moves while you are tabbing to it is worse than one
         that moves while you are pointing at it. */
      pill.addEventListener("pointerenter", function () { settle(true); });
      pill.addEventListener("pointerleave", function () { if (!open) settle(false); });
      pill.addEventListener("focus", function () { settle(true); });
      pill.addEventListener("blur", function () { if (!open) settle(false); });
      /* A finger has no hover, so the touch itself is the signal. */
      pill.addEventListener("touchstart", function () { settle(true); }, { passive: true });

      window.addEventListener("resize", measure, { passive: true });
      window.addEventListener("orientationchange", measure);

      takeOff();

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
