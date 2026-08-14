/* ============================================================================
   Ask ICB — conversation engine (NO interface code here).
   -----------------------------------------------------------------------------
   ADAPTER BOUNDARY. The Ask ICB interface (js/ask-icb.js) depends only on
   this contract:

     engine.send(text, context) -> Promise<{
       blocks: Array<
         { t: "p", text: string } |
         { t: "link", label: string, href: string, external?: boolean } |
         { t: "contact", label: string, href: string, kind: "tel"|"wa"|"mail" }
       >,
       suggestions?: string[]
     }>

   This file ships a scripted demonstration engine that matches questions
   against curated responses in js/data/ask-icb.js. To connect the live
   assistant later, replace the ICB.askEngine assignment at the bottom with
   an implementation that calls the production service and resolves the
   same shape. Nothing else in the site changes.
   ========================================================================== */
window.ICB = window.ICB || {};

(function () {
  "use strict";

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  ICB.createScriptedEngine = function (data) {
    function match(text) {
      var norm = normalize(text);
      var tokens = norm.split(" ");
      var best = null, bestScore = -1;

      data.responses.forEach(function (r) {
        var hits = 0, ok = true;
        r.match.groups.forEach(function (group) {
          var groupHits = 0;
          group.forEach(function (word) {
            for (var i = 0; i < tokens.length; i++) {
              if (tokens[i] === word || (word.length > 3 && tokens[i].indexOf(word) === 0)) {
                groupHits += 1;
                break;
              }
            }
          });
          if (groupHits === 0) ok = false;
          hits += groupHits;
        });
        if (ok) {
          var score = hits + (r.match.priority || 0);
          if (score > bestScore) { bestScore = score; best = r; }
        }
      });
      return best;
    }

    function suggestionsFor(response) {
      if (!response || !response.followups) return null;
      return response.followups.map(function (i) { return data.suggestions[i]; }).filter(Boolean);
    }

    return {
      send: function (text) {
        var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var delay = reduced ? 150 : 650 + Math.floor(Math.random() * 300);
        return new Promise(function (resolve) {
          setTimeout(function () {
            var r = match(text);
            if (r) {
              resolve({ blocks: r.blocks, suggestions: suggestionsFor(r) });
            } else {
              resolve({ blocks: data.fallback.blocks, suggestions: data.suggestions.slice(0, 3) });
            }
          }, delay);
        });
      }
    };
  };

  /* Active engine. Swap this single assignment to go live. */
  ICB.askEngine = ICB.createScriptedEngine(ICB.DATA.askIcb);
})();
