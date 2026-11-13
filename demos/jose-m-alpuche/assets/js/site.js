/* José M. Alpuche website: menu, Alpuche AI chat, consultation buttons and contact page.
   Alpuche AI answers in the browser (see alpuche-ai.js). The only network request it can make
   is sending an enquiry the visitor has reviewed and confirmed, and only when a lead endpoint
   is configured at build time. Nothing is stored in the browser. */
(function () {
  'use strict';

  // The single-file preview re-runs this script on every page change; drop old listeners.
  if (window.__siteAbort) window.__siteAbort.abort();
  var aborter = typeof AbortController !== 'undefined' ? new AbortController() : null;
  window.__siteAbort = aborter;
  var opts = aborter ? { signal: aborter.signal } : false;
  var passiveOpts = aborter ? { signal: aborter.signal, passive: true } : { passive: true };

  var meta = function (name) { var m = document.querySelector('meta[name="' + name + '"]'); return m ? m.content : ''; };
  var linkMode = window.__linkMode || meta('alpuche-links') || 'dir';
  var rootPrefix = meta('alpuche-root');
  var currentRoute = window.__currentRoute || meta('alpuche-route') || '/';
  var query = new URLSearchParams(window.__routeQuery != null ? window.__routeQuery : window.location.search);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  // Site route ("/contact/?area=x#y") → link that works in this build (folder, file:// or single file).
  function toHref(route) {
    if (!route || /^(https?:|mailto:|tel:)/.test(route)) return route;
    if (linkMode === 'hash') return '#' + route;
    var m = route.match(/^([^?#]*)(.*)$/);
    var p = m[1].replace(/^\//, '');
    if (linkMode === 'file' && (p === '' || /\/$/.test(p))) p += 'index.html';
    return (rootPrefix + p || './') + m[2];
  }

  // ---------- Disclosures: mobile menu and assistant ----------
  var mobileMenu = document.querySelector('.mobile-nav');
  var assistant = document.querySelector('.office-assistant');

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { mobileMenu.open = false; });
    });
    document.addEventListener('click', function (event) {
      if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
    }, opts);
  }

  [mobileMenu, assistant].forEach(function (d) {
    if (!d) return;
    d.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && d.open) { d.open = false; d.querySelector('summary').focus(); }
    });
  });

  if (mobileMenu && assistant) {
    mobileMenu.addEventListener('toggle', function () { if (mobileMenu.open) assistant.open = false; });
    assistant.addEventListener('toggle', function () { if (assistant.open) mobileMenu.open = false; });
  }

  // ---------- Alpuche AI ----------
  var data = window.ALPUCHE_AI_DATA;
  var lib = window.AlpucheAI;
  var chat = null;

  if (assistant && data && lib) {
    var engine = window.__alpucheEngine || (window.__alpucheEngine = lib.createEngine(data));
    var session = engine.newSession({ route: currentRoute });
    var log = assistant.querySelector('.chat-log');
    var chipsBox = assistant.querySelector('.chat-chips');
    var input = assistant.querySelector('#chat-text');
    var sendBtn = assistant.querySelector('.chat-send');
    var closeBtn = assistant.querySelector('.assistant-close');
    var busy = false;
    var started = false;

    log.textContent = '';
    input.disabled = false;
    sendBtn.disabled = false;

    var scrollToEnd = function () { log.scrollTop = log.scrollHeight; };

    // Office phone numbers, email and 911 in answers become tap-to-call / mail links.
    function appendText(parent, text) {
      var wa = data.office && data.office.whatsapp;
      var pattern = /(\+501 223-119[45])|(contact@alpuchelaw\.com)|(\b911\b)|(\+501 625-3032)/g;
      var last = 0;
      var m;
      while ((m = pattern.exec(text))) {
        if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
        var a = document.createElement('a');
        a.textContent = m[0];
        a.href = m[1] ? 'tel:' + m[1].replace(/[^+\d]/g, '') : m[2] ? 'mailto:' + m[2] : m[4] ? (wa ? wa.href : 'tel:+5016253032') : 'tel:911';
        if (m[4]) { a.target = '_blank'; a.rel = 'noopener'; addIcon(a, 'whatsapp'); }
        parent.appendChild(a);
        last = pattern.lastIndex;
      }
      if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
    }

    // Brand icons (WhatsApp, Facebook) are fixed SVG strings generated at build time.
    function addIcon(el, name) {
      var svg = name && data.icons && data.icons[name];
      if (!svg) return;
      el.insertAdjacentHTML('afterbegin', svg);
      el.classList.add('with-icon');
    }

    function addUser(text, redacted) {
      var div = document.createElement('div');
      div.className = 'msg msg-user' + (redacted ? ' is-redacted' : '');
      var p = document.createElement('p');
      p.textContent = redacted ? 'Message hidden: it looked like it contained personal details.' : text;
      div.appendChild(p);
      log.appendChild(div);
      scrollToEnd();
      return div;
    }

    function addBot(msg) {
      var div = document.createElement('div');
      div.className = 'msg msg-bot' + (msg.kind ? ' is-' + msg.kind : '');
      if (msg.text) { var p = document.createElement('p'); appendText(p, msg.text); div.appendChild(p); }
      if (msg.summary) {
        var dl = document.createElement('dl');
        msg.summary.forEach(function (row) {
          var dt = document.createElement('dt'); dt.textContent = row[0];
          var dd = document.createElement('dd'); dd.textContent = row[1];
          dl.appendChild(dt); dl.appendChild(dd);
        });
        div.appendChild(dl);
      }
      if (msg.note) { var n = document.createElement('p'); n.className = 'msg-note'; n.textContent = msg.note; div.appendChild(n); }
      (msg.previews || []).forEach(function (pv) {
        var det = document.createElement('details');
        det.className = 'msg-preview';
        var sum = document.createElement('summary'); sum.textContent = pv.title;
        var pre = document.createElement('pre'); pre.textContent = pv.body;
        det.appendChild(sum); det.appendChild(pre);
        div.appendChild(det);
      });
      (msg.links || []).filter(Boolean).forEach(function (l) {
        var a = document.createElement('a');
        a.className = 'msg-link';
        a.href = l.href || toHref(l.route);
        if (/^https?:/.test(a.getAttribute('href'))) { a.rel = 'noopener'; a.target = '_blank'; }
        a.textContent = l.label + ' →';
        addIcon(a, l.icon);
        div.appendChild(a);
      });
      log.appendChild(div);
      scrollToEnd();
    }

    function setChips(chips) {
      chipsBox.textContent = '';
      (chips || []).forEach(function (c) {
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = c.label;
        addIcon(b, c.icon);
        b.addEventListener('click', function () { if (!busy) run({ action: c.action, area: c.area }, c.label); });
        chipsBox.appendChild(b);
      });
    }

    function setInput(spec) {
      spec = spec || {};
      input.type = spec.type || 'text';
      input.placeholder = spec.placeholder || 'Type your question…';
      input.setAttribute('autocomplete', spec.autocomplete || 'off');
      input.setAttribute('inputmode', spec.type === 'email' ? 'email' : spec.type === 'tel' ? 'tel' : 'text');
    }

    // Show "Alpuche AI is typing…" for about a second or two before each reply.
    function typing(ms, label) {
      var div = document.createElement('div');
      div.className = 'msg msg-bot is-typing';
      div.setAttribute('aria-label', label || 'Alpuche AI is typing');
      div.innerHTML = '<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="typing-label">' + (label || 'Alpuche AI is typing…') + '</span>';
      log.appendChild(div);
      scrollToEnd();
      return new Promise(function (resolve) {
        setTimeout(function () { div.remove(); resolve(); }, ms);
      });
    }

    function delayFor(out) {
      var scale = typeof window.ALPUCHE_TYPING_SCALE === 'number' ? window.ALPUCHE_TYPING_SCALE : 1;
      var len = out.messages.reduce(function (n, m) { return n + (m.text || '').length; }, 0);
      return Math.round((900 + Math.min(1100, len * 4)) * scale);
    }

    function lock(on) {
      busy = on;
      log.setAttribute('aria-busy', on ? 'true' : 'false');
      sendBtn.disabled = on;
      chipsBox.querySelectorAll('button').forEach(function (b) { b.disabled = on; });
    }

    function render(out) {
      var before = log.children.length;
      out.messages.forEach(addBot);
      setChips(out.chips);
      setInput(out.input);
      // Long replies: show their beginning; short ones: show the end of the conversation.
      var first = log.children[before];
      if (first && log.scrollHeight - first.offsetTop > log.clientHeight) log.scrollTop = Math.max(0, first.offsetTop - 8);
      else scrollToEnd();
    }

    function deliver(payload) {
      var t = data.transport || {};
      if (t.mode !== 'endpoint' || !t.endpoint) {
        return new Promise(function (r) { setTimeout(function () { r({ ok: true, mode: 'demo' }); }, 600); });
      }
      var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
      // text/plain keeps this a "simple" request, which Google Apps Script accepts without a preflight.
      return fetch(t.endpoint, { method: 'POST', body: JSON.stringify(payload), headers: { 'Content-Type': 'text/plain;charset=utf-8' }, signal: ctrl ? ctrl.signal : undefined, credentials: 'omit', redirect: 'follow' })
        .then(function (res) { return res.json(); })
        .then(function (json) { clearTimeout(timer); return { ok: !!(json && json.ok), mode: 'sent', ref: json && json.ref }; })
        .catch(function () { clearTimeout(timer); return { ok: false }; });
    }

    function run(inputObj, userLabel) {
      if (busy) return;
      started = true;
      var out = engine.handle(session, inputObj);
      if (userLabel != null) addUser(userLabel, out.redactUser);
      setChips([]);
      lock(true);
      if (out.send) {
        typing(900, 'Sending your enquiry…').then(function () {
          return deliver(out.send);
        }).then(function (res) {
          var after = engine.handle(session, { action: 'intake:result', ok: res.ok, mode: res.mode, payload: out.send });
          lock(false);
          render(after);
        });
        return;
      }
      typing(delayFor(out)).then(function () {
        if (!assistant.isConnected) return;
        lock(false);
        render(out);
        if (!coarse && assistant.open) input.focus();
      });
    }

    function submit() {
      var text = input.value.trim();
      if (!text || busy) return;
      input.value = '';
      run({ text: text }, text);
    }

    sendBtn.addEventListener('click', submit);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
    });

    function greet() {
      if (started) return;
      started = true;
      var out = engine.greeting();
      lock(true);
      typing(Math.round(700 * (typeof window.ALPUCHE_TYPING_SCALE === 'number' ? window.ALPUCHE_TYPING_SCALE : 1))).then(function () { lock(false); render(out); });
    }

    assistant.addEventListener('toggle', function () {
      if (assistant.open) {
        greet();
        if (!coarse) setTimeout(function () { input.focus(); }, 50);
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        assistant.open = false;
        assistant.querySelector('summary').focus();
      });
    }

    chat = {
      openIntake: function (area) {
        started = true;
        assistant.open = true;
        run({ action: 'intake:start', area: area || null }, null);
      },
    };
  }

  // ---------- Consultation buttons open the Alpuche AI enquiry ----------
  document.addEventListener('click', function (event) {
    var el = event.target.closest && event.target.closest('[data-intake]');
    if (!el || !chat) return;
    event.preventDefault();
    if (mobileMenu) mobileMenu.open = false;
    var area = el.getAttribute('data-area') || '';
    chat.openIntake(area);
  }, opts);

  // ---------- Keep the assistant button off links and controls ----------
  if (assistant) {
    var ticking = false;
    var overlaps = function (a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; };
    var check = function () {
      ticking = false;
      if (!assistant.isConnected) return;
      if (assistant.open) { assistant.classList.remove('is-tucked'); return; }
      // The fixed container is not moved by the summary's transform, so it gives the resting position.
      var box = assistant.getBoundingClientRect();
      var pad = 6;
      var zone = { left: box.left - pad, right: box.right + pad, top: box.top - pad, bottom: box.bottom + pad };
      var hit = false;
      var targets = document.querySelectorAll('main a, main button, main input, main select, main textarea, footer a');
      for (var i = 0; i < targets.length && !hit; i++) {
        var r = targets[i].getBoundingClientRect();
        if (r.bottom < zone.top || r.top > zone.bottom) continue;
        var rects = targets[i].getClientRects();
        for (var j = 0; j < rects.length; j++) if (overlaps(rects[j], zone)) { hit = true; break; }
      }
      assistant.classList.toggle('is-tucked', hit);
    };
    var schedule = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(check); } };
    window.addEventListener('scroll', schedule, passiveOpts);
    window.addEventListener('resize', schedule, opts);
    assistant.addEventListener('toggle', schedule);
    window.addEventListener('load', schedule, opts);
    schedule();
  }

  // ---------- Contact page: practice carried from ?area= ----------
  var areasEl = document.getElementById('contact-areas');
  if (areasEl) {
    var areas = JSON.parse(areasEl.textContent); // { key: label } for the seven known practice areas
    var key = query.get('area');
    // Only whitelisted labels are ever rendered; the raw query value is never written to the page.
    var label = key && Object.prototype.hasOwnProperty.call(areas, key) ? areas[key] : null;
    var note = document.querySelector('[data-area-note]');
    if (note) {
      note.classList.toggle('is-visible', !!label);
      var nl = note.querySelector('[data-area-label]');
      if (nl) nl.textContent = label || '';
    }
    document.querySelectorAll('[data-mail-subject]').forEach(function (a) {
      a.href = 'mailto:contact@alpuchelaw.com?subject=' + encodeURIComponent('Consultation enquiry' + (label ? ' – ' + label : ''));
    });
    var start = document.querySelector('[data-contact-intake]');
    if (start) {
      if (label) {
        start.setAttribute('data-area', key);
        start.textContent = 'Start a ' + label + ' enquiry with Alpuche AI';
      }
      start.hidden = !chat;
    }
  }
})();
