/* José M. Alpuche demo: menu, office assistant (prepared answers only) and contact preview.
   Nothing on this site sends, stores or logs what a visitor types or selects. */
(function () {
  'use strict';

  // ---------- Disclosures: mobile menu and assistant ----------
  var mobileMenu = document.querySelector('.mobile-nav');
  var assistant = document.querySelector('.office-assistant');

  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { mobileMenu.open = false; });
    });
    document.addEventListener('click', function (event) {
      if (mobileMenu.open && !mobileMenu.contains(event.target)) mobileMenu.open = false;
    });
  }

  [mobileMenu, assistant].forEach(function (disclosure) {
    if (!disclosure) return;
    disclosure.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && disclosure.open) {
        disclosure.open = false;
        disclosure.querySelector('summary').focus();
      }
    });
  });

  // Only one overlay open at a time.
  if (mobileMenu && assistant) {
    mobileMenu.addEventListener('toggle', function () { if (mobileMenu.open) assistant.open = false; });
    assistant.addEventListener('toggle', function () { if (assistant.open) mobileMenu.open = false; });
  }

  // ---------- Office assistant ----------
  var dataEl = document.getElementById('assistant-data');
  if (assistant && dataEl) {
    var data = JSON.parse(dataEl.textContent);
    var answerBox = assistant.querySelector('.assistant-answer');
    var closeBtn = assistant.querySelector('.assistant-close');
    var buttons = assistant.querySelectorAll('button[data-topic]');

    // Turn the office phone numbers and email in a prepared answer into links.
    function appendWithLinks(parent, text) {
      var pattern = /(\+501 223-119[45])|(contact@alpuchelaw\.com)|(\b911\b)/g;
      var last = 0;
      var match;
      while ((match = pattern.exec(text))) {
        if (match.index > last) parent.appendChild(document.createTextNode(text.slice(last, match.index)));
        var a = document.createElement('a');
        a.textContent = match[0];
        if (match[1]) a.href = 'tel:' + match[1].replace(/[^+\d]/g, '');
        else if (match[2]) a.href = 'mailto:' + match[2];
        else a.href = 'tel:911';
        parent.appendChild(a);
        last = pattern.lastIndex;
      }
      if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        var topic = data.topics[button.dataset.topic];
        if (!topic) return;
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', b === button ? 'true' : 'false'); });

        var asked = document.createElement('p');
        asked.className = 'asked';
        var askedLabel = document.createElement('strong');
        askedLabel.textContent = 'Sample question: ';
        asked.appendChild(askedLabel);
        asked.appendChild(document.createTextNode(topic.question));

        var answer = document.createElement('p');
        answer.className = 'answer-text';
        appendWithLinks(answer, topic.answer);

        var nodes = [asked, answer];
        if (topic.next) {
          var link = document.createElement('a');
          link.className = 'answer-next';
          link.href = topic.next.href;
          link.textContent = topic.next.label + ' →';
          nodes.push(link);
        }
        answerBox.classList.toggle('urgent', !!topic.urgent);
        answerBox.dataset.kb = topic.kb;
        answerBox.replaceChildren.apply(answerBox, nodes);
        // Bring the answer into view inside the panel (it can sit below the fold on phones).
        var panel = assistant.querySelector('.assistant-panel');
        var top = answerBox.offsetTop - 8;
        if (top + answerBox.offsetHeight > panel.scrollTop + panel.clientHeight || top < panel.scrollTop) {
          panel.scrollTop = Math.max(0, Math.min(top, panel.scrollHeight - panel.clientHeight));
        }
      });
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        assistant.open = false;
        assistant.querySelector('summary').focus();
      });
    }
  }

  // ---------- Keep the assistant button off links and controls ----------
  if (assistant) {
    var ticking = false;
    function overlaps(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
    function check() {
      ticking = false;
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
        var rects = targets[i].getClientRects(); // per line, for wrapped inline links
        for (var j = 0; j < rects.length; j++) if (overlaps(rects[j], zone)) { hit = true; break; }
      }
      assistant.classList.toggle('is-tucked', hit);
    }
    function schedule() { if (!ticking) { ticking = true; window.requestAnimationFrame(check); } }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    assistant.addEventListener('toggle', schedule);
    window.addEventListener('load', schedule);
    schedule();
  }

  // ---------- Contact page: practice preselect and preview form ----------
  var form = document.querySelector('[data-preview-form]');
  var areasEl = document.getElementById('contact-areas');
  if (form && areasEl) {
    var areas = JSON.parse(areasEl.textContent); // { key: label } for the seven known practice areas
    var select = form.querySelector('select[name="area"]');
    var note = document.querySelector('[data-area-note]');
    var noteLabel = note && note.querySelector('[data-area-label]');
    var mailLinks = document.querySelectorAll('[data-mail-subject]');
    var status = form.querySelector('.form-status');

    function applyArea(key) {
      var label = Object.prototype.hasOwnProperty.call(areas, key) ? areas[key] : null;
      // Only whitelisted labels are ever rendered; the raw query value is never written to the page.
      if (note) note.classList.toggle('is-visible', !!label);
      if (noteLabel) noteLabel.textContent = label || '';
      mailLinks.forEach(function (a) {
        var subject = 'Consultation enquiry' + (label ? ' – ' + label : '');
        a.href = 'mailto:contact@alpuchelaw.com?subject=' + encodeURIComponent(subject);
      });
      if (select) select.value = label ? key : '';
    }

    var params = new URLSearchParams(window.location.search);
    applyArea(params.get('area'));
    if (select) {
      select.addEventListener('change', function () { applyArea(select.value); });
    }

    var submit = form.querySelector('[data-preview-submit]');
    if (submit) {
      submit.addEventListener('click', function () {
        // Simulation only: clear every field and confirm nothing was sent or kept.
        form.reset();
        applyArea(params.get('area'));
        status.textContent = 'Preview only: nothing was sent or saved, and the fields have been cleared. ' +
          'After the firm approves a workflow, this step would send a short, non-confidential enquiry to the office.';
      });
    }
    form.addEventListener('submit', function (event) { event.preventDefault(); });
  }
})();
