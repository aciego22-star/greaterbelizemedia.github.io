// Standard booking flow. The same component runs on the Appointments page and inside the
// confident AI panel; both call the same scheduling API.

const facts = JSON.parse(document.getElementById('clinic-facts')?.textContent || '{}');
const S = facts.strings || {};
const LANG = facts.locale || 'en';
const fill = (str, values = {}) => String(str).replace(/\{(\w+)\}/g, (m, k) => (k in values ? values[k] : m));

function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'text') el.textContent = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

async function api(path, body) {
  if (!body) path += `${path.includes('?') ? '&' : '?'}lang=${LANG}`;
  const res = await fetch(path, body ? {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, lang: LANG }),
    credentials: 'same-origin',
  } : { credentials: 'same-origin' });
  let data = {};
  try { data = await res.json(); } catch { /* ignore */ }
  return { ok: res.ok, status: res.status, data };
}

function todayInBelize() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Belize', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  return parts; // YYYY-MM-DD
}

function addDays(dateStr, n) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

function fallbackLinks() {
  return h('p', {},
    h('a', { href: facts.phoneHref }, fill(S.callPhone, { phone: facts.phone })), ' · ',
    h('a', { href: facts.whatsapp, rel: 'noopener' }, S.messageWhatsApp));
}

let uid = 0;

export function mountBooking(container, {
  initialVisit = null, initialService = null, review: initialReview = null, source = 'form', headingLevel = 3, onResult = () => {},
} = {}) {
  const id = `bk${++uid}`;
  const H = `h${headingLevel}`;
  let visitTypes = [];
  let services = [];
  let previewLabel = null;
  let weekStart = todayInBelize();

  const render = (...nodes) => {
    container.replaceChildren(...nodes);
    const heading = container.querySelector('[data-step-heading]');
    if (heading && container.dataset.mounted) {
      heading.focus({ preventScroll: true });
      container.scrollIntoView({ block: 'nearest', behavior: 'auto' });
    }
    container.dataset.mounted = '1';
  };

  const previewNote = () => (previewLabel ? h('p', { class: 'test-banner', role: 'note' }, h('strong', {}, `${S.testBooking} `), previewLabel.replace(/^(Test booking|Cita de prueba)\.\s*/, '')) : null);
  const errorBox = (title, message, ...extra) => h('div', { class: 'result result-error', role: 'alert' }, h(H, {}, title), h('p', {}, message), ...extra);

  async function loadVisitTypes() {
    const { ok, data } = await api('/api/visit-types');
    if (!ok) throw new Error('visit types');
    visitTypes = data.visitTypes;
    services = data.services;
    previewLabel = data.previewLabel;
  }

  /* Step 1: visit type */
  function chooseVisit(selected = initialVisit) {
    const name = `${id}-visit`;
    const form = h('form', { class: 'booking-step', novalidate: true },
      h(H, { tabindex: '-1', 'data-step-heading': true }, S.whatWouldYouBook),
      h('fieldset', { class: 'visit-options' },
        h('legend', { class: 'visually-hidden' }, S.visit),
        visitTypes.map((v, i) => h('label', { class: 'visit-option' },
          h('input', { type: 'radio', name, value: v.id, checked: selected ? v.id === selected : i === 0 }),
          h('span', {},
            h('strong', {}, v.label, v.booking === 'staff-review' ? h('span', { class: 'badge' }, S.teamArranges) : v.durationMinutes ? h('span', { class: 'badge' }, fill(S.minutes, { n: v.durationMinutes })) : null),
            h('span', {}, v.description)),
        ))),
      h('div', { class: 'form-actions' }, h('button', { class: 'btn btn-primary', type: 'submit' }, S.continue)));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const visit = visitTypes.find((v) => v.id === form.elements[name].value);
      if (visit.booking === 'direct') return chooseSlot(visit);
      const button = form.querySelector('button[type=submit]');
      button.disabled = true;
      const { ok, data } = await api('/api/booking/prepare', { visitType: visit.id });
      if (!ok) { button.disabled = false; return render(errorBox(S.somethingWrong, data.message || facts.messages.unavailable, fallbackLinks())); }
      reviewStep(data.review);
    });
    render(previewNote(), form);
  }

  /* Step 2: date and time (available times only) */
  async function chooseSlot(visit, notice = null, alternatives = null) {
    const heading = h(H, { tabindex: '-1', 'data-step-heading': true }, fill(S.chooseTime, { visit: visit.label }));
    const status = h('div', { 'aria-live': 'polite' });
    const days = h('div', { class: 'slot-days' });
    const back = h('button', { class: 'link-button', type: 'button', onclick: () => chooseVisit(visit.id) }, S.changeVisit);
    let selectedRef = null;
    const continueBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, S.continue);

    const renderSlots = (slots) => {
      days.replaceChildren();
      const byDay = new Map();
      for (const s of slots) {
        if (!byDay.has(s.date)) byDay.set(s.date, { label: s.dateLabel, slots: [] });
        byDay.get(s.date).slots.push(s);
      }
      for (const [date, day] of byDay) {
        const list = h('ul', { class: 'slot-list', role: 'list' });
        for (const s of day.slots) {
          const btn = h('button', {
            type: 'button', class: 'slot-btn', 'aria-pressed': 'false', 'data-ref': s.slotRef,
            'aria-label': fill(S.slotAria, { date: s.dateLabel, time: s.timeLabel }),
            onclick: () => {
              days.querySelectorAll('.slot-btn').forEach((b) => b.setAttribute('aria-pressed', 'false'));
              btn.setAttribute('aria-pressed', 'true');
              selectedRef = s.slotRef;
              continueBtn.disabled = false;
            },
          }, s.timeLabel);
          list.append(h('li', {}, btn));
        }
        days.append(h('div', { class: 'slot-day', 'data-date': date }, h('h4', {}, day.label), list));
      }
    };

    const prevBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, S.earlier);
    const nextBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, S.later);
    const range = h('span', { class: 'range' });
    const load = async () => {
      selectedRef = null;
      continueBtn.disabled = true;
      status.replaceChildren(h('p', { class: 'loading' }, S.checking));
      days.replaceChildren();
      const { ok, data } = await api(`/api/availability?visitType=${encodeURIComponent(visit.id)}&from=${weekStart}&to=${addDays(weekStart, 6)}`);
      if (!ok) {
        status.replaceChildren(errorBox(S.timesUnavailable, data.message || facts.messages.unavailable, fallbackLinks()));
        return;
      }
      weekStart = data.fromDate;
      range.textContent = fill(S.onward, { date: data.slots[0]?.shortDateLabel ?? data.fromDate });
      prevBtn.disabled = weekStart <= todayInBelize();
      nextBtn.disabled = addDays(weekStart, 7) > data.lastBookableDate;
      if (!data.slots.length) {
        status.replaceChildren(h('p', { class: 'status-msg' }, S.noTimesWeek));
        return;
      }
      status.replaceChildren();
      renderSlots(data.slots);
    };
    prevBtn.addEventListener('click', () => { weekStart = addDays(weekStart, -7); load(); });
    nextBtn.addEventListener('click', () => { weekStart = addDays(weekStart, 7); load(); });
    continueBtn.addEventListener('click', async () => {
      if (!selectedRef) return;
      continueBtn.disabled = true;
      const { ok, status: code, data } = await api('/api/booking/prepare', { slotRef: selectedRef });
      if (ok) return reviewStep(data.review);
      if (code === 409) return chooseSlot(visit, data.message, data.alternatives || []);
      continueBtn.disabled = false;
      status.replaceChildren(h('p', { class: 'status-msg error', role: 'alert' }, data.message || facts.messages.unavailable));
    });

    const children = [previewNote(), heading,
      notice ? h('p', { class: 'status-msg', role: 'alert' }, notice) : null,
      h('div', { class: 'week-nav' }, prevBtn, range, nextBtn), status, days,
      h('div', { class: 'form-actions' }, continueBtn, back)];
    render(h('div', { class: 'booking-step' }, ...children));
    if (alternatives) {
      range.textContent = S.nextOptions;
      if (alternatives.length) renderSlots(alternatives);
      else status.replaceChildren(h('p', { class: 'status-msg' }, S.noOtherTimes), fallbackLinks());
    } else {
      await load();
    }
  }

  /* Step 3: details and final review */
  function reviewStep(review) {
    const idempotencyKey = crypto.randomUUID();
    const booking = review.kind === 'booking';
    const label = review.previewLabel || previewLabel;
    if (label) previewLabel = label;
    const field = (name, labelText, input, hint) => h('div', { class: 'field' },
      h('label', { for: `${id}-${name}` }, labelText),
      hint ? h('span', { class: 'hint', id: `${id}-${name}-hint` }, hint) : null,
      input,
      h('span', { class: 'field-error', id: `${id}-${name}-error`, hidden: true }));
    const input = (name, type, attrs = {}) => h('input', { id: `${id}-${name}`, name, type, ...attrs });

    const minor = h('input', { type: 'checkbox', name: 'isMinor', id: `${id}-minor` });
    const nameLabel = h('label', { for: `${id}-name` }, S.yourName);
    const patientField = field('patientName', S.patientName, input('patientName', 'text', { autocomplete: 'off' }));
    patientField.hidden = true;
    minor.addEventListener('change', () => {
      patientField.hidden = !minor.checked;
      nameLabel.textContent = minor.checked ? S.adultName : S.yourName;
    });
    const nameField = h('div', { class: 'field' }, nameLabel, input('name', 'text', { autocomplete: 'name', required: true }), h('span', { class: 'field-error', id: `${id}-name-error`, hidden: true }));

    const serviceSelect = review.services ? h('select', { id: `${id}-service`, name: 'service' },
      h('option', { value: '' }, S.chooseTreatment),
      review.services.map((s) => h('option', { value: s.value, selected: s.value === initialService }, s.label))) : null;

    const summary = h('div', { class: 'review-summary' },
      h('dl', {},
        h('dt', {}, S.visit), h('dd', {}, review.visitType.label),
        booking ? [h('dt', {}, S.date), h('dd', {}, review.slot.dateLabel), h('dt', {}, S.time), h('dd', {}, fill(S.belizeTime, { time: review.slot.timeLabel }))]
          : [h('dt', {}, S.time), h('dd', {}, S.teamWillContact)],
        h('dt', {}, S.where), h('dd', {}, S.whereValue)));

    const formStatus = h('div', { 'aria-live': 'assertive' });
    const submit = h('button', { class: 'btn btn-primary', type: 'submit' }, booking ? S.confirmBooking : S.sendRequest);
    const form = h('form', { class: 'booking-step', novalidate: true },
      h(H, { tabindex: '-1', 'data-step-heading': true }, booking ? S.reviewConfirm : S.requestVisit),
      summary,
      h('p', { class: 'small muted' }, S.contactHelp),
      h('div', { class: 'form-grid' },
        nameField,
        h('label', { class: 'check' }, minor, h('span', {}, S.minor)),
        patientField,
        h('div', { class: 'form-grid two' },
          field('phone', S.phone, input('phone', 'tel', { autocomplete: 'tel', inputmode: 'tel' })),
          field('email', S.email, input('email', 'email', { autocomplete: 'email' }))),
        h('span', { class: 'field-error', id: `${id}-contact-error`, hidden: true }),
        serviceSelect ? field('service', S.treatment, serviceSelect) : null,
        !booking ? field('preferredTimes', S.preferred, h('textarea', { id: `${id}-preferredTimes`, name: 'preferredTimes', rows: 2, maxlength: 200 })) : null),
      formStatus,
      h('div', { class: 'form-actions' }, submit,
        h('button', { class: 'link-button', type: 'button', onclick: () => chooseVisit(review.visitType.id) }, S.startAgain)));

    const showErrors = (errors = {}) => {
      for (const el of form.querySelectorAll('.field-error')) { el.hidden = true; el.textContent = ''; }
      for (const el of form.querySelectorAll('[aria-invalid]')) el.removeAttribute('aria-invalid');
      let first = null;
      for (const [key, msg] of Object.entries(errors)) {
        const err = form.querySelector(`#${id}-${key}-error`);
        if (err) { err.hidden = false; err.textContent = msg; }
        const ctl = form.querySelector(`#${id}-${key === 'contact' ? 'phone' : key}`);
        if (ctl) {
          ctl.setAttribute('aria-invalid', 'true');
          ctl.setAttribute('aria-describedby', `${id}-${key}-error`);
          first ??= ctl;
        }
      }
      first?.focus();
    };

    const submitOnce = async () => {
      submit.disabled = true;
      formStatus.replaceChildren(h('p', { class: 'loading' }, booking ? S.saving : S.sending));
      const fd = new FormData(form);
      const contact = Object.fromEntries(fd.entries());
      contact.isMinor = minor.checked;
      let res;
      try {
        res = await api('/api/booking/complete', { reviewId: review.reviewId, idempotencyKey, contact, source });
      } catch {
        res = { ok: false, data: { status: 'network' } };
      }
      submit.disabled = false;
      formStatus.replaceChildren();
      return res.data;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const result = await submitOnce();
      if (result.status === 'invalid') return showErrors(result.errors);
      showResult(result, review, submitOnce);
    });

    render(previewNote(), form);
  }

  /* Step 4: outcome */
  function showResult(result, review, retry) {
    onResult(result);
    const visit = visitTypes.find((v) => v.id === review.visitType.id) ?? review.visitType;
    if (result.status === 'confirmed') {
      return render(previewNote(), h('div', { class: 'result result-confirmed', role: 'status' },
        h(H, { tabindex: '-1', 'data-step-heading': true }, S.confirmed),
        h('p', {}, result.message),
        h('p', {}, S.bookingRef, h('span', { class: 'ref' }, result.bookingRef)),
        facts.calendarUrl ? h('p', {}, h('a', { class: 'text-link', href: facts.calendarUrl }, S.seeCalendar)) : null,
        h('p', { class: 'small muted' }, fill(S.changeCancel, { phone: facts.phone }))));
    }
    if (result.status === 'staff_review_recorded') {
      return render(previewNote(), h('div', { class: 'result result-review', role: 'status' },
        h(H, { tabindex: '-1', 'data-step-heading': true }, S.requestReceived),
        h('p', {}, result.message),
        h('p', {}, S.requestRef, h('span', { class: 'ref' }, result.requestRef)),
        h('p', { class: 'small muted' }, S.noTimeYet)));
    }
    if (result.status === 'slot_taken') return chooseSlot(visit, result.message, result.alternatives || []);
    if (result.status === 'unconfirmed') {
      const again = h('button', { class: 'btn btn-secondary', type: 'button' }, S.checkAgain);
      again.addEventListener('click', async () => {
        again.disabled = true;
        showResult(await retry(), review, retry);
      });
      return render(previewNote(), h('div', { class: 'result result-error', role: 'alert' },
        h(H, { tabindex: '-1', 'data-step-heading': true }, S.notConfirmed),
        h('p', {}, result.message),
        h('p', { class: 'small' }, S.notConfirmedHelp),
        h('div', { class: 'form-actions' }, again), fallbackLinks()));
    }
    if (result.status === 'expired' || result.status === 'invalid_review') {
      return render(errorBox(S.pleaseStartAgain, result.message, h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => chooseVisit(visit.id) }, S.startAgain)));
    }
    return render(previewNote(), errorBox(S.notConfirmed, facts.messages.unavailable, fallbackLinks()));
  }

  (async () => {
    container.replaceChildren(h('p', { class: 'loading' }, S.loadingBooking));
    try {
      await loadVisitTypes();
    } catch {
      return render(errorBox(S.bookingUnavailable, facts.messages.unavailable, fallbackLinks()));
    }
    if (initialReview) return reviewStep(initialReview);
    const preset = visitTypes.find((v) => v.id === initialVisit);
    if (preset && preset.booking === 'direct' && initialVisit) return chooseVisit(preset.id);
    return chooseVisit(preset?.id);
  })();
}
