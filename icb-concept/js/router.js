/* ============================================================================
   ICB.router — hash router.
   Route form: #/segment[/sub][?key=value][@anchor]
   Examples: #/  #/insurance/motor  #/contact?topic=business  #/claims@motor
   Views register themselves on ICB.views as { title, render(mount, ctx) }.
   ========================================================================== */
window.ICB = window.ICB || {};
ICB.views = ICB.views || {};

(function () {
  "use strict";

  var mount, announcer;

  /* ------------------------------------------------------------------ */
  /* Scroll memory                                                        */
  /*                                                                      */
  /* The browser cannot do this for us. Every route lives at the same     */
  /* document, so its own restoration has nothing to restore, and if it   */
  /* tries it fights us; hence scrollRestoration = "manual".              */
  /*                                                                      */
  /* Each history entry is stamped with a key, and the scroll position is */
  /* filed against that key on the way out. A link click pushes an entry  */
  /* with no state of ours, which is exactly how a fresh navigation is    */
  /* told apart from a back or a forward: fresh opens at the top, back    */
  /* returns the reader to where they were.                               */
  /* ------------------------------------------------------------------ */

  var scrollMemory = {};
  var entrySeq = 0;
  var currentKey = null;

  if ("scrollRestoration" in history) {
    try { history.scrollRestoration = "manual"; } catch (e) { /* not fatal */ }
  }

  /* Returns the key for the entry now being shown, and whether we have
     stood on it before. replaceState can throw on some file:// engines;
     if it does, every entry looks new and the old top-of-page behaviour
     is what remains, which is a safe place to land. */
  function claimEntry() {
    var st = history.state;
    if (st && typeof st.icbKey === "number") return { key: st.icbKey, revisited: true };
    var key = ++entrySeq;
    try { history.replaceState({ icbKey: key }, ""); } catch (e) { return { key: key, revisited: false }; }
    return { key: key, revisited: false };
  }

  /* Hold a scroll position while the page finishes settling.

     Scrolling once at render time is not enough. Images, films and map
     art get their size after the markup lands, so a position computed in
     that first instant can be short by the time everything has weight:
     the page grows underneath the reader and they end up somewhere they
     did not ask for. Measured on the claims page, an anchor moved 62px
     after the jump.

     So the target is a function, re-evaluated every frame for a short
     window. An anchor that shifts is followed rather than missed. It
     stops the instant the reader takes over, and abandons immediately if
     another navigation starts, so two of these can never fight. */
  var settleToken = 0;

  /* Move there now, with no animation.

     The document sets scroll-behavior: smooth, which is right for in-page
     moves the reader asked for and wrong for arriving somewhere. Note
     that scrollTo's behavior: "auto" does NOT mean instant, it means
     "whatever the CSS says", so it glides too. An inline style outranks
     the stylesheet for the moment it takes to jump, and scrollTo is
     synchronous, so putting it back straight away is safe. */
  function jumpTo(y) {
    var root = document.documentElement;
    var prev = root.style.scrollBehavior;
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, Math.max(0, y));
    root.style.scrollBehavior = prev;
  }

  function settleScroll(getTarget) {
    var LIMIT = 500;
    var mine = ++settleToken;
    var start = null;
    var surrendered = false;

    function surrender() { surrendered = true; }
    function listen(on) {
      var fn = on ? window.addEventListener : window.removeEventListener;
      fn.call(window, "wheel", surrender, { passive: true });
      fn.call(window, "touchstart", surrender, { passive: true });
      fn.call(window, "keydown", surrender);
    }
    /* Instant, every time. An animated scroll re-issued each frame keeps
       restarting itself and the page crawls instead of arriving; and a
       restore should be instantaneous anyway, so that coming back feels
       like the page was never gone. */
    function apply() {
      var t = getTarget();
      if (typeof t !== "number") return;
      if (Math.abs((window.pageYOffset || 0) - t) > 2) jumpTo(t);
    }

    listen(true);
    apply();

    /* The clock starts on the first frame, not here: rAF timestamps and
       the synchronous call above are not on the same scale. */
    requestAnimationFrame(function step(ts) {
      if (start === null) start = ts;
      if (surrendered || mine !== settleToken || ts - start >= LIMIT) { listen(false); return; }
      apply();
      requestAnimationFrame(step);
    });
  }

  function parse(hash) {
    var raw = (hash || "#/").replace(/^#\/?/, "");
    var anchor = null, query = {};
    var at = raw.indexOf("@");
    if (at >= 0) { anchor = raw.slice(at + 1); raw = raw.slice(0, at); }
    var qm = raw.indexOf("?");
    if (qm >= 0) {
      raw.slice(qm + 1).split("&").forEach(function (pair) {
        if (!pair) return;
        var kv = pair.split("=");
        query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
      });
      raw = raw.slice(0, qm);
    }
    var parts = raw.split("/").filter(Boolean);
    return { parts: parts, query: query, anchor: anchor };
  }

  function resolve(ctx) {
    var p = ctx.parts;
    // navId "home" so the mobile menu's Home entry can mark itself current.
    if (p.length === 0) return { view: "home", navId: "home" };
    if (p[0] === "insurance" && p.length === 1) return { view: "insurance", navId: "insurance" };
    if (p[0] === "insurance" && p.length === 2) {
      return ICB.DATA.productById(p[1])
        ? { view: "product", navId: "insurance", productId: p[1] }
        : { view: "notfound", navId: null };
    }
    if (ICB.views[p[0]] && p.length === 1) return { view: p[0], navId: p[0] };
    return { view: "notfound", navId: null };
  }

  function setNav(navId) {
    var links = document.querySelectorAll("[data-nav], .mm-nav a");
    Array.prototype.forEach.call(links, function (a) {
      var id = a.getAttribute("data-nav") || "";
      if (id && id === navId) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  var ANCHOR_HEADROOM = 84;

  /* An explicit anchor always wins: someone asking for #/claims@marine
     wants that pathway, whatever they were reading there last time. */
  function scrollAfterRender(anchor, remembered) {
    if (anchor && mount.querySelector('[data-anchor="' + anchor + '"]')) {
      settleScroll(function () {
        var el = mount.querySelector('[data-anchor="' + anchor + '"]');
        if (!el) return null;
        // Absolute document position, so it stays valid as we scroll.
        return el.getBoundingClientRect().top + (window.pageYOffset || 0) - ANCHOR_HEADROOM;
      });
      return;
    }
    if (typeof remembered === "number" && remembered > 0) {
      settleScroll(function () { return remembered; });
      return;
    }
    // A fresh page opens at the top, and jumps there rather than gliding.
    jumpTo(0);
  }

  function render() {
    // File where we are before leaving, against the entry we are leaving.
    if (currentKey !== null) scrollMemory[currentKey] = window.pageYOffset || 0;
    var entry = claimEntry();
    currentKey = entry.key;

    var ctx = parse(location.hash);
    var match = resolve(ctx);
    ctx.productId = match.productId || null;

    var view = ICB.views[match.view] || ICB.views.notfound;
    mount.innerHTML = view.render(ctx) || "";
    // Resolve data-asset slots before mounted(): the hero slider calls
    // play() on its film as soon as it initialises.
    ICB.hydrateAssets(mount);

    var title = typeof view.title === "function" ? view.title(ctx) : view.title;
    document.title = title || "ICB Concept Experience";

    setNav(match.navId);
    if (view.mounted) view.mounted(mount, ctx);
    ICB.reveal(mount);
    ICB.art.enhance(mount);
    scrollAfterRender(ctx.anchor, entry.revisited ? scrollMemory[entry.key] : null);
    if (announcer) announcer.textContent = (title || "Page") + " loaded";

    // Close any open sheets or overlays on navigation.
    if (ICB.closeLightbox) ICB.closeLightbox();
    document.dispatchEvent(new CustomEvent("icb:navigated"));
  }

  ICB.views.notfound = {
    title: "Page not found | ICB",
    render: function () {
      return '<section class="section"><div class="shell">' +
        ICB.render.sectionHead({ eyebrow: "ICB", title: "That page is not here.", sub: "The link may have moved. Everything on this concept site is reachable from the menu.", rv: false }) +
        '<div class="btn-row"><a class="btn btn-primary" href="#/">Back to the homepage</a>' +
        '<a class="btn btn-outline" href="#/insurance">Explore insurance</a></div>' +
        "</div></section>";
    }
  };

  /* Same-route taps.

     A link to the page you are already on changes nothing in the URL, so
     no hashchange fires and the router never runs. The tap reads as
     broken. It is easy to hit now that the mobile menu opens with Home:
     someone at the foot of the homepage taps Home and, without this,
     stays exactly where they were.

     So take them to the top, which is what tapping Home does everywhere
     else, or back to the anchor if the link named one. No preventDefault:
     in the one case where the hash does change (a bare index.html with no
     hash yet, versus "#/") the router renders and lands at the top too,
     so both paths agree. */
  function normalise(hash) {
    return "#/" + String(hash || "").replace(/^#\/?/, "");
  }

  function onSameRouteClick(e) {
    if (e.defaultPrevented || e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var a = e.target.closest && e.target.closest('a[href^="#/"]');
    if (!a) return;
    if (normalise(a.getAttribute("href")) !== normalise(location.hash)) return;
    scrollAfterRender(parse(location.hash).anchor, null);
  }

  ICB.router = {
    init: function () {
      mount = document.getElementById("main");
      announcer = document.getElementById("route-announcer");
      window.addEventListener("hashchange", render);
      document.addEventListener("click", onSameRouteClick);
      render();
    },
    refresh: render
  };
})();
