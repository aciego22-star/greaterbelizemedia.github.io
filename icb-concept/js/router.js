/* ============================================================================
   ICB.router — routes by real path, and still understands a hash.

   Route form: /segment[/sub][?key=value]  or  #/segment[/sub][@anchor]
   Examples: /insurance/motor   /es/claims   #/claims@motor

   TWO URL SHAPES, BOTH REQUIRED.

   Real paths are what the site deploys as, one directory per route per
   language, because a fragment is not a URL. Everything after a # is
   stripped before a request is ever made, so a crawler asking for
   #/insurance/motor is asking for the homepage: seventeen pages of
   content would arrive as one, and the Spanish site would have no
   address at all. Paths are what make each page its own document, with
   its own title, its own canonical and its own hreflang pair.

   Hash routes stay understood because links to them are already out in
   the world, and because the single-file build has no server to resolve
   a path against. A hash wins when one is present; otherwise the path is
   read. Path interception is confined to http and https, so the
   single file opened from disk keeps the hash behaviour it has always
   had.

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

  /* ------------------------------------------------------------------ */
  /* Paths                                                               */
  /* ------------------------------------------------------------------ */

  var LANG_PREFIX = /^\/(es|en)(?=\/|$)/;

  /* The route, with any language prefix and any index.html stripped off:
     "/es/insurance/motor/" and "/insurance/motor/index.html" both give
     back "insurance/motor". */
  function routeFromPath(pathname) {
    return String(pathname || "/")
      .replace(/index\.html?$/i, "")
      .replace(LANG_PREFIX, "")
      .replace(/^\/+|\/+$/g, "");
  }

  function langFromPath(pathname) {
    var m = LANG_PREFIX.exec(String(pathname || "/"));
    return m ? m[1] : null;
  }

  function pathFor(route, lang) {
    var base = lang === "es" ? "/es" : "";
    return route ? base + "/" + route : base + "/";
  }

  /* "#/claims@marine" is this app's own shape for a route plus an anchor.
     As a real link that is a path and a fragment: /claims#marine. */
  function hrefForRoute(raw, lang) {
    var anchor = "", query = "";
    var at = raw.indexOf("@");
    if (at >= 0) { anchor = raw.slice(at + 1); raw = raw.slice(0, at); }
    var qm = raw.indexOf("?");
    if (qm >= 0) { query = raw.slice(qm); raw = raw.slice(0, qm); }
    var route = raw.replace(/^\/+|\/+$/g, "");
    return pathFor(route, lang) + query + (anchor ? "#" + anchor : "");
  }

  /* Every view and every piece of chrome writes its links as #/route,
     and that is left alone: it is the one form that works from a file on
     disk, and it keeps forty-odd call sites from having to know about
     any of this.

     On a server they are rewritten in place to real paths, after each
     render and after the chrome is rebuilt on a language change. Without
     this the prerendered HTML would carry real links for a crawler and
     the app would put the hash ones back the moment it booted, so the
     reader and the crawler would be walking two different sites. */
  function pathifyLinks(root) {
    if (!hosted()) return;
    var lang = ICB.i18n.get();
    var as = (root || document).querySelectorAll('a[href^="#/"]');
    for (var i = 0; i < as.length; i++) {
      as[i].setAttribute("href", hrefForRoute(as[i].getAttribute("href").slice(2), lang));
    }
  }

  /* Only a hosted page routes by path. Opened from disk there is no
     server to serve /claims, so the hash stays in charge. */
  function hosted() {
    return location.protocol === "http:" || location.protocol === "https:";
  }

  /* A route hash starts "#/". A bare "#main" is the skip link, and
     "#marine" is an anchor on a real page: neither is a route, and
     treating them as one lands the reader on the not-found view. */
  function hashRoute() {
    var h = String(location.hash || "");
    return /^#\//.test(h) ? h.replace(/^#\//, "") : "";
  }

  /* Whichever source is in play, expressed in the one shape parse()
     already understands. On a real path the fragment is the anchor, so
     /claims#marine means the same as the old #/claims@marine.

     A path this app does not recognise is NOT a missing page. It means
     the app is not being served from the root of a host: the single
     file sitting at /artifact/<id>, or a copy opened out of a
     subdirectory. Reading those as routes showed "That page is not
     here." to anyone opening the preview, which is a page the visitor
     never asked for and cannot navigate out of by reloading. So an
     unrecognised path falls back to the homepage, and only a hash can
     reach the not-found view.

     The one exception is 404.html, which a host serves at the wrong
     address that was asked for. There the unrecognised path is the
     whole point, and the build marks that file so the app can tell the
     two cases apart and leave the not-found view standing. */
  function servedAsNotFound() {
    return document.documentElement.hasAttribute("data-notfound");
  }

  function currentRoute() {
    var h = hashRoute();
    if (h) return "#/" + h;
    var frag = String(location.hash || "").replace(/^#/, "");
    var tail = (location.search || "") + (frag ? "@" + frag : "");
    var route = routeFromPath(location.pathname);
    if (route && resolve(parse("#/" + route)).view === "notfound" && !servedAsNotFound()) {
      return "#/" + tail;
    }
    return "#/" + route + tail;
  }

  function setNav(navId) {
    var links = document.querySelectorAll("[data-nav], .mm-nav a");
    Array.prototype.forEach.call(links, function (a) {
      var id = a.getAttribute("data-nav") || "";
      if (id && id === navId) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* Clear of the sticky header, plus a little air. Measured rather than
     fixed: the header is one row on a phone and two on a wide screen
     since the logo was centred, so a constant that was right for 72px
     would tuck the heading under a 116px header. */
  function anchorHeadroom() {
    var h = document.getElementById("site-header");
    var tall = h ? h.getBoundingClientRect().height : 0;
    return (tall || 72) + 12;
  }

  /* An explicit anchor always wins: someone asking for #/claims@marine
     wants that pathway, whatever they were reading there last time. */
  function scrollAfterRender(anchor, remembered) {
    if (anchor && mount.querySelector('[data-anchor="' + anchor + '"]')) {
      settleScroll(function () {
        var el = mount.querySelector('[data-anchor="' + anchor + '"]');
        if (!el) return null;
        // Absolute document position, so it stays valid as we scroll.
        return el.getBoundingClientRect().top + (window.pageYOffset || 0) - anchorHeadroom();
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

    var ctx = parse(currentRoute());
    var match = resolve(ctx);
    ctx.productId = match.productId || null;

    var view = ICB.views[match.view] || ICB.views.notfound;
    mount.innerHTML = view.render(ctx) || "";
    // Resolve data-asset slots before mounted(): the hero slider calls
    // play() on its film as soon as it initialises.
    ICB.hydrateAssets(mount);

    // A view's title may be a plain string or an { en, es } pair.
    var title = ICB.t(typeof view.title === "function" ? view.title(ctx) : view.title);
    document.title = title || "ICB Concept Experience";

    setNav(match.navId);
    /* Whole document, not just the mount: the header, the mobile menu
       and the footer are chrome and are rebuilt on their own schedule. */
    pathifyLinks(document);
    if (view.mounted) view.mounted(mount, ctx);
    ICB.reveal(mount);
    ICB.art.enhance(mount);
    scrollAfterRender(ctx.anchor, entry.revisited ? scrollMemory[entry.key] : null);
    if (announcer) announcer.textContent = ICB.s("pageLoaded", { title: title || ICB.s("page") });

    // Close any open sheets or overlays on navigation.
    if (ICB.closeLightbox) ICB.closeLightbox();
    document.dispatchEvent(new CustomEvent("icb:navigated"));
  }

  ICB.views.notfound = {
    title: { en: "Page not found | ICB", es: "Página no encontrada | ICB" },
    render: function () {
      var R = ICB.render;
      /* Its own h1, rather than the h2 a section head would give it.
         This view is also what the host serves as 404.html, and a page
         with no first-level heading is a page a reader arriving by
         accident has nothing to orient on. */
      return '<section class="section"><div class="shell">' +
        '<div class="section-head">' +
          '<span class="eyebrow">ICB</span>' +
          "<h1>" + R.esc({ en: "That page is not here.", es: "Esta página no está aquí." }) + "</h1>" +
          "<p>" + R.esc({ en: "The link may have moved. Everything on this concept site is reachable from the menu.", es: "El enlace pudo haber cambiado. Todo en este sitio de concepto se alcanza desde el menú." }) + "</p>" +
        "</div>" +
        '<div class="btn-row"><a class="btn btn-primary" href="#/">' + ICB.t({ en: "Back to the homepage", es: "Volver al inicio" }) + "</a>" +
        '<a class="btn btn-outline" href="#/insurance">' + ICB.t({ en: "Explore insurance", es: "Ver seguros" }) + "</a></div>" +
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
    scrollAfterRender(parse(currentRoute()).anchor, null);
  }

  /* Links to real paths are taken over rather than followed.

     A full page load would work, and would even be fast on a static
     site, but it throws the document away: the Talk to Bee panel is an
     iframe, so anyone mid-conversation who tapped a link would lose it.
     Everything a browser expects of a link still happens here. A modified
     click, a new tab, a download, another origin or an unknown route all
     fall through untouched, so the browser does what it always would. */
  function onPathClick(e) {
    if (!hosted() || e.defaultPrevented) return;
    if (e.button > 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a || a.hasAttribute("download")) return;
    if (a.target && a.target !== "_self") return;

    var url;
    try { url = new URL(a.href, location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    /* A fragment link is somebody else's job: either the hash router's
       or the browser's own in-page scroll. */
    if (url.hash && url.hash.length > 1) return;
    /* A link to the page you are already on changes nothing in the URL,
       so nothing would happen and the tap would read as broken. Take
       them to the top, which is what it does everywhere else. */
    if (url.pathname === location.pathname && url.search === location.search) {
      e.preventDefault();
      scrollAfterRender(null, null);
      return;
    }

    var probe = parse("#/" + routeFromPath(url.pathname) + url.search);
    if (resolve(probe).view === "notfound") return;

    e.preventDefault();
    history.pushState(null, "", url.pathname + url.search);
    var lang = langFromPath(url.pathname);
    /* Crossing between /claims and /es/claims is a language change as
       well as a navigation. Render once, not twice. */
    if (lang && ICB.i18n.get() !== lang) ICB.i18n.set(lang, { rerender: false });
    render();
  }

  /* The address has to keep telling the truth. Switching to Spanish on
     /claims moves the reader to /es/claims without a reload, so the URL,
     the canonical and the content never disagree. */
  function syncPathToLang() {
    pathifyLinks(document);
    if (!hosted() || hashRoute()) return;
    var want = pathFor(routeFromPath(location.pathname), ICB.i18n.get());
    if (want === location.pathname) return;
    try { history.replaceState(history.state, "", want + location.search); }
    catch (e) { /* not fatal: the content is already correct */ }
  }

  /* An old #/route link, rewritten to the real path it now has.

     Links to the hash form are out in the world from before the site had
     real URLs, and they still work, but they leave the address bar
     saying something misleading. Safari on a phone shows only the
     domain once the bar is compact, so /#/insurance reads as
     icb.austereautomations.com while the Insurance page is on screen,
     and the site looks as though it opened somewhere it should not
     have. Rewriting on arrival makes the address agree with the page.

     It also stops the hash form lingering as a second address for every
     page, which is the thing the canonical and the sitemap exist to
     prevent. A hash that resolves to nothing is left alone, so a bad
     link still reaches the not-found view rather than being quietly
     tidied into the homepage. */
  function normaliseLegacyHash() {
    if (!hosted()) return;
    var h = hashRoute();
    if (!h) return;
    var ctx = parse("#/" + h);
    if (resolve(ctx).view === "notfound") return;

    var qs = Object.keys(ctx.query).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(ctx.query[k]);
    }).join("&");
    var want = pathFor(ctx.parts.join("/"), ICB.i18n.get()) +
      (qs ? "?" + qs : location.search || "") +
      (ctx.anchor ? "#" + ctx.anchor : "");
    try { history.replaceState(history.state, "", want); }
    catch (e) { /* not fatal: the page is already correct */ }
  }

  ICB.router = {
    init: function () {
      mount = document.getElementById("main");
      announcer = document.getElementById("route-announcer");
      normaliseLegacyHash();
      window.addEventListener("hashchange", render);
      window.addEventListener("popstate", render);
      document.addEventListener("click", onSameRouteClick);
      document.addEventListener("click", onPathClick);
      document.addEventListener("icb:lang", syncPathToLang);
      render();
    },
    refresh: render,
    /* The prerender build asks for these so the static pages it writes
       and the router that takes over from them agree on one scheme. */
    pathFor: pathFor,
    routeFromPath: routeFromPath
  };
})();
