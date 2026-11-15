// confident AI panel. Conversation state lives on the server; this only renders it.
import { mountBooking } from './booking.js';

const GREETING = 'Hi, I’m confident AI, ConfiDent Oral Care’s virtual assistant. I can help you find a service, answer questions about the practice, or request an appointment.';
const STORE_KEY = 'confident-ai-log';
const facts = JSON.parse(document.getElementById('clinic-facts')?.textContent || '{}');

const ALLOWED_LINK = /^(\/(?!\/)|tel:|mailto:|https:\/\/(www\.)?(instagram\.com|facebook\.com|google\.com\/maps)\/)/;

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/** Minimal, safe Markdown: paragraphs, lists, **bold**, and allow-listed links. */
export function renderMarkdown(text) {
  const inline = (s) => escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
      const decoded = url.replace(/&amp;/g, '&');
      if (!ALLOWED_LINK.test(decoded)) return label;
      const external = /^https:/.test(decoded);
      return `<a href="${url}"${external ? ' rel="noopener" target="_blank"' : ''}>${label}</a>`;
    });
  const blocks = text.trim().split(/\n{2,}/);
  return blocks.map((block) => {
    const lines = block.split('\n');
    if (lines.every((l) => /^\s*[-*•]\s+/.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*•]\s+/, ''))}</li>`).join('')}</ul>`;
    if (lines.every((l) => /^\s*\d+[.)]\s+/.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('')}</ol>`;
    return `<p>${lines.map(inline).join('<br>')}</p>`;
  }).join('');
}

export function initAssistant() {
  const panel = document.getElementById('ai-panel');
  if (!panel) return;
  const log = panel.querySelector('.ai-log');
  const form = panel.querySelector('[data-ai-form]');
  const textarea = form.querySelector('textarea');
  const sendBtn = form.querySelector('button[type=submit]');
  const launcher = document.querySelector('.ai-launcher');
  let opener = null;
  let available = null;
  let busy = false;
  let history = [];

  try { history = JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]'); } catch { history = []; }
  const persist = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-30))); } catch { /* ignore */ } };

  const scroll = () => { log.scrollTop = log.scrollHeight; };

  function addMessage(role, content, { html = false, save = true } = {}) {
    const el = document.createElement('div');
    el.className = `msg msg-${role}`;
    if (role === 'ai' || role === 'note') {
      el.innerHTML = html ? content : renderMarkdown(content);
    } else {
      el.textContent = content;
    }
    log.append(el);
    if (save) { history.push({ role, content, html }); persist(); }
    scroll();
    return el;
  }

  function addWidget(build) {
    const el = document.createElement('div');
    el.className = 'msg msg-widget';
    log.append(el);
    build(el);
    scroll();
    return el;
  }

  function typing() {
    const el = document.createElement('div');
    el.className = 'msg msg-ai';
    el.innerHTML = '<span class="visually-hidden">confident AI is typing</span><span class="typing" aria-hidden="true"><span></span><span></span><span></span></span>';
    log.append(el);
    scroll();
    return el;
  }

  async function checkStatus() {
    if (facts.staticPreview) return false;
    if (available !== null) return available;
    try {
      const res = await fetch('/api/assistant/status', { credentials: 'same-origin' });
      available = (await res.json()).available === true;
    } catch {
      available = false;
    }
    return available;
  }

  function bookingWidget(options = {}) {
    addWidget((el) => mountBooking(el.appendChild(document.createElement('div')), {
      ...options,
      source: 'assistant',
      headingLevel: 3,
      onResult: (result) => {
        if (result.status === 'confirmed' || result.status === 'staff_review_recorded') {
          history.push({ role: 'note', content: result.message, html: false });
          persist();
        }
      },
    }));
  }

  async function send(text) {
    const message = text.trim();
    if (!message || busy) return;
    addMessage('user', message);
    if (!(await checkStatus())) {
      addMessage('ai', facts.staticPreview
        ? `In this static preview I can’t answer typed questions; that part runs on the clinic’s server. Try the suggestions below, call [${facts.phone}](${facts.phoneHref}), or message the practice on [Instagram](${facts.instagram}).`
        : `${facts.messages.unavailable}\n\nThe suggestions below can still help you find a service, check the hours or get directions.`);
      return;
    }
    busy = true;
    sendBtn.disabled = true;
    const indicator = typing();
    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ message, page: location.pathname }),
      });
      const data = await res.json();
      indicator.remove();
      if (data.reply) addMessage('ai', data.reply);
      for (const action of data.actions || []) {
        if (action.type === 'review') bookingWidget({ review: action.review });
      }
    } catch {
      indicator.remove();
      addMessage('ai', facts.messages.unavailable);
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  }

  const actions = {
    'find-service': () => {
      addMessage('user', 'Find a service');
      addMessage('ai', `Here are the services at ConfiDent Oral Care:\n\n${facts.categories.map((c) => `- [${c.title}](${c.path})`).join('\n')}\n\nOr tell me what you’re looking for and I’ll point you to the right page. You can also see the [full treatment index](/services).`);
    },
    'request-appointment': async () => {
      if (await checkStatus()) return send('I’d like to request an appointment.');
      addMessage('user', 'Request an appointment');
      if (facts.staticPreview) {
        addMessage('ai', `Online booking isn’t part of this static preview. To arrange a visit, call [${facts.phone}](${facts.phoneHref}) or message the practice on [Instagram](${facts.instagram}). See [Appointments](/appointments) for the visit types.`);
        return;
      }
      addMessage('ai', 'Choose a visit type below. You can also call or message the practice on Instagram.');
      bookingWidget();
    },
    hours: () => {
      addMessage('user', 'Check opening hours');
      addMessage('ai', `Posted hours:\n\n${facts.hours.map((h) => `- **${h.days}:** ${h.time}`).join('\n')}\n\n${facts.hoursNote}\n\nWe’re at ${facts.address}. See [Contact Us](/contact) or call [${facts.phone}](${facts.phoneHref}).`);
    },
  };

  function setViewportVars() {
    const vv = window.visualViewport;
    if (!vv) return;
    panel.style.setProperty('--vv-height', `${vv.height}px`);
    panel.style.setProperty('--vv-top', `${vv.offsetTop}px`);
  }

  function open(prompt) {
    opener = document.activeElement;
    if (panel.hidden) {
      panel.hidden = false;
      launcher?.setAttribute('aria-expanded', 'true');
      document.querySelectorAll('[data-ai-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      if (window.matchMedia('(max-width: 600px)').matches) document.body.classList.add('ai-open-mobile');
      setViewportVars();
      if (!log.childElementCount) {
        addMessage('ai', GREETING, { save: false });
        for (const m of history) addMessage(m.role, m.content, { html: m.html, save: false });
      }
    }
    if (prompt) send(prompt);
    else textarea.focus();
    checkStatus();
  }

  function close() {
    panel.hidden = true;
    document.body.classList.remove('ai-open-mobile');
    document.querySelectorAll('[data-ai-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    (opener && document.contains(opener) && opener !== document.body ? opener : launcher)?.focus();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-ai-open]');
    if (trigger) { e.preventDefault(); open(trigger.dataset.aiPrompt); }
  });
  panel.querySelector('[data-ai-close]').addEventListener('click', close);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  panel.querySelectorAll('[data-ai-action]').forEach((el) => {
    const fn = actions[el.dataset.aiAction];
    if (fn) el.addEventListener('click', (e) => { e.preventDefault(); fn(); });
    else if (el.tagName === 'A') { el.target = '_blank'; el.rel = 'noopener'; }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = textarea.value;
    textarea.value = '';
    textarea.style.height = '';
    send(value);
  });
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); }
  });
  textarea.addEventListener('input', () => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  });
  window.visualViewport?.addEventListener('resize', setViewportVars);
  window.visualViewport?.addEventListener('scroll', setViewportVars);
}
