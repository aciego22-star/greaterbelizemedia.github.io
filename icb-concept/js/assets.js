/* ============================================================================
   ICB asset resolver.

   Views never write an asset URL into their HTML string. They emit
   data-asset="assets/..." (and data-asset-poster="..." for video posters)
   and this hydrates them into real src/poster properties after the markup
   is in the DOM.

   In the deployed folder build ICB.ASSETS is empty, so a slot resolves to
   its own path and nothing changes. In the single-file preview build,
   build/build-single.js fills ICB.ASSETS with base64 data URIs. Assigning
   those as properties keeps multi-megabyte strings out of every innerHTML
   the router performs, and stores each asset once no matter how many
   places use it. Without this a single navigation to the homepage asked
   the HTML parser to tokenise about ten megabytes of base64.
   ========================================================================== */
window.ICB = window.ICB || {};

ICB.ASSETS = ICB.ASSETS || {};

ICB.assetUrl = function (p) {
  if (!p) return p;
  if (Object.prototype.hasOwnProperty.call(ICB.ASSETS, p)) return ICB.ASSETS[p];
  /* Nothing bundled, so this is the folder build asking for a real file.
     Pages now live at real paths, and a relative path like the ones in
     this file, written into a document served from /insurance/motor/,
     resolves inside that directory, where there is no assets folder.
     Anchor it to the site root instead.

     Written without an example path on purpose: build-single.js scans
     the bundle for anything shaped like an asset reference and fails if
     it is not bundled, and it cannot tell prose from markup.

     Only over http and https. Opened from disk a leading slash points at
     the root of the filesystem, and the single-file build has every
     asset inlined above anyway, so neither needs this. */
  if (/^([a-z]+:|\/|#)/i.test(p)) return p;
  if (location.protocol === "http:" || location.protocol === "https:") return "/" + p;
  return p;
};

/* force: also resolve elements marked data-asset-defer. Those are the
   film and hero <video> elements, whose sources are the largest strings
   in the bundle and are not needed until something plays. Leaving them
   deferred keeps every navigation cheap. */
ICB.hydrateAssets = function (root, force) {
  var scope = root || document;
  var nodes = scope.querySelectorAll("[data-asset], [data-asset-poster], [data-asset-srcset]");
  for (var i = 0; i < nodes.length; i++) {
    var el = nodes[i];
    if (!force && el.hasAttribute("data-asset-defer")) continue;
    /* <source> inside a <picture> resolves first, so the browser has the
       whole candidate set before the <img> gets its fallback src and
       starts fetching. */
    var srcset = el.getAttribute("data-asset-srcset");
    if (srcset) {
      el.srcset = ICB.assetUrl(srcset);
      el.removeAttribute("data-asset-srcset");
    }
    var src = el.getAttribute("data-asset");
    if (src) {
      el.src = ICB.assetUrl(src);
      el.removeAttribute("data-asset");
    }
    var poster = el.getAttribute("data-asset-poster");
    if (poster) {
      el.poster = ICB.assetUrl(poster);
      el.removeAttribute("data-asset-poster");
    }
    el.removeAttribute("data-asset-defer");
  }
};
