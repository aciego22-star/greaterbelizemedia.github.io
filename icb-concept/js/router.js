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
    if (p.length === 0) return { view: "home", navId: null };
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

  function scrollAfterRender(anchor) {
    if (anchor) {
      var target = mount.querySelector('[data-anchor="' + anchor + '"]');
      if (target) {
        var y = target.getBoundingClientRect().top + window.pageYOffset - 84;
        window.scrollTo({ top: y, behavior: "auto" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }

  function render() {
    var ctx = parse(location.hash);
    var match = resolve(ctx);
    ctx.productId = match.productId || null;

    var view = ICB.views[match.view] || ICB.views.notfound;
    mount.innerHTML = view.render(ctx) || "";

    var title = typeof view.title === "function" ? view.title(ctx) : view.title;
    document.title = title || "ICB Concept Experience";

    setNav(match.navId);
    if (view.mounted) view.mounted(mount, ctx);
    ICB.reveal(mount);
    ICB.art.enhance(mount);
    scrollAfterRender(ctx.anchor);
    if (announcer) announcer.textContent = (title || "Page") + " loaded";

    // Close any open sheets on navigation.
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

  ICB.router = {
    init: function () {
      mount = document.getElementById("main");
      announcer = document.getElementById("route-announcer");
      window.addEventListener("hashchange", render);
      render();
    },
    refresh: render
  };
})();
