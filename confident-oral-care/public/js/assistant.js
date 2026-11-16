// confident AI panel. Conversation state lives on the server; this only renders it.
import { mountBooking } from './booking.js';

const facts = JSON.parse(document.getElementById('clinic-facts')?.textContent || '{}');
const S = facts.strings || {};
const LANG = facts.locale || 'en';
const STORE_KEY = `confident-ai-log-${LANG}`;
const SEEN_KEY = 'confident-ai-seen';
const fill = (str, values = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));

const ALLOWED_LINK = /^(\/(?!\/)|tel:|mailto:|https:\/\/(www\.)?(instagram\.com|facebook\.com|google\.com\/maps|wa\.me)\/)/;

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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * fetch with a time limit and one retry. The first request after the site has been idle can hit a
 * cold server function; a short pause and a second try usually succeeds.
 */
async function request(url, options = {}, { timeoutMs = 30000, retries = 1 } = {}) {
  for (let attempt = 0; ; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { credentials: 'same-origin', ...options, signal: controller.signal });
      if ([502, 503, 504].includes(res.status) && attempt < retries) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      await wait(1200);
    } finally {
      clearTimeout(timer);
    }
  }
}

async function readJson(res) {
  try { return await res.json(); } catch { return {}; }
}

export function initAssistant() {
  const panel = document.getElementById('ai-panel');
  if (!panel) return;
  const log = panel.querySelector('.ai-log');
  const form = panel.querySelector('[data-ai-form]');
  const textarea = form.querySelector('textarea');
  const sendBtn = form.querySelector('button[type=submit]');
  const launcher = document.querySelector('.ai-launcher');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let opener = null;
  let available = null;
  let statusCheck = null;
  let busy = false;
  let history = [];

  try { history = JSON.parse(sessionStorage.getItem(STORE_KEY) || '[]'); } catch { history = []; }
  const persist = () => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(history.slice(-30))); } catch { /* ignore */ } };

  // The launcher glows every few seconds until the visitor has opened the assistant once.
  let seen = false;
  try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* ignore */ }
  if (!seen && !reducedMotion.matches) launcher?.classList.add('is-calling');
  const markSeen = () => {
    launcher?.classList.remove('is-calling');
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
  };

  const scroll = () => { log.scrollTop = log.scrollHeight; };

  function addMessage(role, content, { html = false, save = true } = {}) {
    const el = document.createElement('div');
    el.className = `msg msg-${role}`;
    if (role === 'ai' || role === 'note') el.innerHTML = html ? content : renderMarkdown(content);
    else el.textContent = content;
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
    el.className = 'msg msg-ai msg-typing';
    el.innerHTML = `<span class="visually-hidden">${escapeHtml(S.typing || '')}</span><span class="typing" aria-hidden="true"><span></span><span></span><span></span></span>`;
    log.append(el);
    scroll();
    return el;
  }

  /** Show the typing indicator for about three seconds (or as long as the reply takes). */
  async function thinkThen(work) {
    const indicator = typing();
    const minimum = 2700 + Math.round(Math.random() * 600);
    const started = Date.now();
    try {
      const result = await work();
      const left = minimum - (Date.now() - started);
      if (left > 0) await wait(left);
      return result;
    } finally {
      indicator.remove();
    }
  }

  /** Asks the server once whether the assistant is on. A failed check is not remembered, so the next message tries again. */
  function checkStatus() {
    if (available !== null) return Promise.resolve(available);
    if (!statusCheck) {
      statusCheck = (async () => {
        try {
          const res = await request(`/api/assistant/status?lang=${LANG}`);
          if (!res.ok) return false;
          available = (await readJson(res)).available === true;
          return available;
        } catch {
          return false;
        } finally {
          statusCheck = null;
        }
      })();
    }
    return statusCheck;
  }

  function bookingWidget(options = {}) {
    addWidget((el) => mountBooking(el.appendChild(document.createElement('div')), {
      ...options,
      source: 'assistant',
      headingLevel: 3,
      onResult: async (result) => {
        let reply = null;
        if (result.status === 'confirmed') {
          reply = fill(S.bookedFollowUp, { when: `${result.slot.dateLabel}, ${result.slot.timeLabel}`, ref: result.bookingRef });
          if (facts.calendarUrl) reply += `\n\n${fill(S.bookedSeeIt, { calendar: facts.calendarUrl, phone: facts.phone })}`;
        } else if (result.status === 'staff_review_recorded') {
          reply = fill(S.requestFollowUp, { ref: result.requestRef });
        }
        if (!reply) return;
        // Hold the conversation while confident AI "types" the follow-up.
        busy = true;
        sendBtn.disabled = true;
        try {
          await thinkThen(async () => {});
          addMessage('ai', reply);
        } finally {
          busy = false;
          sendBtn.disabled = false;
        }
      },
    }));
  }

  async function send(text, { echo = text } = {}) {
    const message = text.trim();
    if (!message || busy) return;
    if (echo) addMessage('user', echo);
    busy = true;
    sendBtn.disabled = true;
    try {
      if (!(await checkStatus())) {
        await thinkThen(async () => {});
        addMessage('ai', `${facts.messages.unavailable}\n\n${S.unavailableExtra}`);
        return;
      }
      const data = await thinkThen(async () => {
        const res = await request('/api/assistant', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ message, page: location.pathname, lang: LANG }),
        });
        return readJson(res);
      });
      // Always answer: an error response without a reply still gets the phone/WhatsApp message.
      addMessage('ai', data.reply || facts.messages.unavailable);
      for (const action of data.actions || []) {
        if (action.type === 'review') bookingWidget({ review: action.review });
      }
    } catch {
      addMessage('ai', `${facts.messages.unavailable}\n\n${S.unavailableExtra}`);
    } finally {
      busy = false;
      sendBtn.disabled = false;
    }
  }

  const actions = {
    'find-service': async () => {
      if (busy) return;
      addMessage('user', S.findServiceUser);
      busy = true;
      sendBtn.disabled = true;
      try { await thinkThen(async () => {}); } finally { busy = false; sendBtn.disabled = false; }
      addMessage('ai', `${S.findServiceReply}\n\n${facts.categories.map((c) => `- [${c.title}](${c.path})`).join('\n')}\n\n${S.findServiceAfter}`);
    },
    'request-appointment': async () => {
      if (await checkStatus()) return send(S.requestAppointmentUser);
      addMessage('user', S.requestAppointmentUser);
      bookingWidget();
    },
  };

  function greet() {
    addMessage('ai', S.greeting, { save: false });
  }

  async function newChat() {
    if (busy) return;
    if (history.length && !window.confirm(S.newChatConfirm)) return;
    history = [];
    persist();
    log.replaceChildren();
    greet();
    textarea.focus();
    try {
      await request('/api/assistant/reset', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lang: LANG }),
      }, { retries: 0 });
    } catch { /* the next message starts fresh on the server anyway */ }
  }

  function setViewportVars() {
    const vv = window.visualViewport;
    if (!vv) return;
    panel.style.setProperty('--vv-height', `${vv.height}px`);
    panel.style.setProperty('--vv-top', `${vv.offsetTop}px`);
  }

  function open(prompt) {
    opener = document.activeElement;
    markSeen();
    if (panel.hidden) {
      panel.hidden = false;
      document.body.classList.add('ai-open');
      document.querySelectorAll('[data-ai-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
      if (window.matchMedia('(max-width: 600px)').matches) document.body.classList.add('ai-open-mobile');
      setViewportVars();
      if (!log.childElementCount) {
        greet();
        for (const m of history) addMessage(m.role, m.content, { html: m.html, save: false });
      }
    }
    if (prompt) send(prompt);
    else textarea.focus();
    checkStatus();
  }

  function close() {
    panel.hidden = true;
    document.body.classList.remove('ai-open-mobile', 'ai-open');
    document.querySelectorAll('[data-ai-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    (opener && document.contains(opener) && opener !== document.body ? opener : launcher)?.focus();
  }

  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-ai-open]');
    if (trigger) { e.preventDefault(); open(trigger.dataset.aiPrompt); }
  });
  panel.querySelector('[data-ai-close]').addEventListener('click', close);
  panel.querySelector('[data-ai-new]')?.addEventListener('click', newChat);
  panel.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } });
  panel.querySelectorAll('[data-ai-action]').forEach((el) => {
    const fn = actions[el.dataset.aiAction];
    if (fn) el.addEventListener('click', (e) => { e.preventDefault(); fn(); });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // While a reply is on its way, keep what the visitor typed in the box instead of dropping it.
    if (busy || !textarea.value.trim()) return;
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
