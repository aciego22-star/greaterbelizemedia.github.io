// Standard booking flow. The same component runs on the Appointments page and inside the
// confident AI panel; both call the same scheduling API.

const facts = JSON.parse(document.getElementById('clinic-facts')?.textContent || '{}');

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
  const res = await fetch(path, body ? {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
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
    h('a', { href: facts.phoneHref }, `Call ${facts.phone}`), ' · ',
    h('a', { href: facts.instagram, rel: 'noopener' }, 'Message us on Instagram'));
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

  const previewNote = () => (previewLabel ? h('p', { class: 'test-banner', role: 'note' }, h('strong', {}, 'Test booking. '), previewLabel.replace(/^Test booking\.\s*/, '')) : null);
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
      h(H, { tabindex: '-1', 'data-step-heading': true }, 'What would you like to book?'),
      h('fieldset', { class: 'visit-options' },
        h('legend', { class: 'visually-hidden' }, 'Visit type'),
        visitTypes.map((v, i) => h('label', { class: 'visit-option' },
          h('input', { type: 'radio', name, value: v.id, checked: selected ? v.id === selected : i === 0 }),
          h('span', {},
            h('strong', {}, v.label, v.booking === 'staff-review' ? h('span', { class: 'badge' }, 'Team arranges time') : v.durationMinutes ? h('span', { class: 'badge' }, `${v.durationMinutes} min`) : null),
            h('span', {}, v.description)),
        ))),
      h('div', { class: 'form-actions' }, h('button', { class: 'btn btn-primary', type: 'submit' }, 'Continue')));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const visit = visitTypes.find((v) => v.id === form.elements[name].value);
      if (visit.booking === 'direct') return chooseSlot(visit);
      const button = form.querySelector('button[type=submit]');
      button.disabled = true;
      const { ok, data } = await api('/api/booking/prepare', { visitType: visit.id });
      if (!ok) { button.disabled = false; return render(errorBox('Something went wrong', data.message || facts.messages.unavailable, fallbackLinks())); }
      reviewStep(data.review);
    });
    render(previewNote(), form);
  }

  /* Step 2: date and time (available times only) */
  async function chooseSlot(visit, notice = null, alternatives = null) {
    const heading = h(H, { tabindex: '-1', 'data-step-heading': true }, `Choose a time: ${visit.label}`);
    const status = h('div', { 'aria-live': 'polite' });
    const days = h('div', { class: 'slot-days' });
    const back = h('button', { class: 'link-button', type: 'button', onclick: () => chooseVisit(visit.id) }, 'Change visit type');
    let selectedRef = null;
    const continueBtn = h('button', { class: 'btn btn-primary', type: 'button', disabled: true }, 'Continue');

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
            'aria-label': `${s.dateLabel} at ${s.timeLabel}, Belize time`,
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

    const prevBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, '← Earlier');
    const nextBtn = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Later →');
    const range = h('span', { class: 'range' });
    const load = async () => {
      selectedRef = null;
      continueBtn.disabled = true;
      status.replaceChildren(h('p', { class: 'loading' }, 'Checking available times…'));
      days.replaceChildren();
      const { ok, data } = await api(`/api/availability?visitType=${encodeURIComponent(visit.id)}&from=${weekStart}&to=${addDays(weekStart, 6)}`);
      if (!ok) {
        status.replaceChildren(errorBox('Times unavailable', data.message || facts.messages.unavailable, fallbackLinks()));
        return;
      }
      weekStart = data.fromDate;
      range.textContent = `${data.slots[0]?.shortDateLabel ?? data.fromDate} onward · Belize time`;
      prevBtn.disabled = weekStart <= todayInBelize();
      nextBtn.disabled = addDays(weekStart, 7) > data.lastBookableDate;
      if (!data.slots.length) {
        status.replaceChildren(h('p', { class: 'status-msg' }, 'No times are available in this week. Try later dates, or call the clinic.'));
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
      range.textContent = 'Next available options · Belize time';
      if (alternatives.length) renderSlots(alternatives);
      else status.replaceChildren(h('p', { class: 'status-msg' }, 'No other times are available right now.'), fallbackLinks());
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
    const nameLabel = h('label', { for: `${id}-name` }, 'Your name');
    const patientField = field('patientName', 'Patient’s name', input('patientName', 'text', { autocomplete: 'off' }));
    patientField.hidden = true;
    minor.addEventListener('change', () => {
      patientField.hidden = !minor.checked;
      nameLabel.textContent = minor.checked ? 'Responsible adult’s name' : 'Your name';
    });
    const nameField = h('div', { class: 'field' }, nameLabel, input('name', 'text', { autocomplete: 'name', required: true }), h('span', { class: 'field-error', id: `${id}-name-error`, hidden: true }));

    const serviceSelect = review.services ? h('select', { id: `${id}-service`, name: 'service' },
      h('option', { value: '' }, 'Choose a treatment (optional)'),
      review.services.map((s) => h('option', { value: s, selected: s === initialService }, s))) : null;

    const summary = h('div', { class: 'review-summary' },
      h('dl', {},
        h('dt', {}, 'Visit'), h('dd', {}, review.visitType.label),
        booking ? [h('dt', {}, 'Date'), h('dd', {}, review.slot.dateLabel), h('dt', {}, 'Time'), h('dd', {}, `${review.slot.timeLabel} Belize time`)]
          : [h('dt', {}, 'Time'), h('dd', {}, 'The team will contact you to arrange a time')],
        h('dt', {}, 'Where'), h('dd', {}, 'The Boardwalk Belize, Belize City')));

    const formStatus = h('div', { 'aria-live': 'assertive' });
    const submit = h('button', { class: 'btn btn-primary', type: 'submit' }, booking ? 'Confirm booking' : 'Send request');
    const form = h('form', { class: 'booking-step', novalidate: true },
      h(H, { tabindex: '-1', 'data-step-heading': true }, booking ? 'Review and confirm' : 'Request a visit'),
      summary,
      h('p', { class: 'small muted' }, 'Enter one way for the team to reach you. If you’re booking for a child, use the responsible adult’s details.'),
      h('div', { class: 'form-grid' },
        nameField,
        h('label', { class: 'check' }, minor, h('span', {}, 'I’m booking for someone under 18')),
        patientField,
        h('div', { class: 'form-grid two' },
          field('phone', 'Phone', input('phone', 'tel', { autocomplete: 'tel', inputmode: 'tel' })),
          field('email', 'Email', input('email', 'email', { autocomplete: 'email' }))),
        h('span', { class: 'field-error', id: `${id}-contact-error`, hidden: true }),
        serviceSelect ? field('service', 'Treatment', serviceSelect) : null,
        !booking ? field('preferredTimes', 'Preferred days or times (optional)', h('textarea', { id: `${id}-preferredTimes`, name: 'preferredTimes', rows: 2, maxlength: 200 })) : null),
      formStatus,
      h('div', { class: 'form-actions' }, submit,
        h('button', { class: 'link-button', type: 'button', onclick: () => chooseVisit(review.visitType.id) }, 'Start again')));

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
      formStatus.replaceChildren(h('p', { class: 'loading' }, booking ? 'Saving your booking…' : 'Sending your request…'));
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
        h(H, { tabindex: '-1', 'data-step-heading': true }, 'Appointment confirmed'),
        h('p', {}, result.message),
        h('p', {}, 'Booking reference: ', h('span', { class: 'ref' }, result.bookingRef)),
        h('p', { class: 'small muted' }, `To change or cancel, call ${facts.phone} or message the practice on Instagram.`)));
    }
    if (result.status === 'staff_review_recorded') {
      return render(previewNote(), h('div', { class: 'result result-review', role: 'status' },
        h(H, { tabindex: '-1', 'data-step-heading': true }, 'Request received'),
        h('p', {}, result.message),
        h('p', {}, 'Request reference: ', h('span', { class: 'ref' }, result.requestRef)),
        h('p', { class: 'small muted' }, 'No appointment time has been set yet.')));
    }
    if (result.status === 'slot_taken') return chooseSlot(visit, result.message, result.alternatives || []);
    if (result.status === 'unconfirmed') {
      const again = h('button', { class: 'btn btn-secondary', type: 'button' }, 'Check again');
      again.addEventListener('click', async () => {
        again.disabled = true;
        showResult(await retry(), review, retry);
      });
      return render(previewNote(), h('div', { class: 'result result-error', role: 'alert' },
        h(H, { tabindex: '-1', 'data-step-heading': true }, 'Not confirmed'),
        h('p', {}, result.message),
        h('p', { class: 'small' }, 'Your booking is not confirmed. “Check again” looks up the same request; it will not create a second booking.'),
        h('div', { class: 'form-actions' }, again), fallbackLinks()));
    }
    if (result.status === 'expired' || result.status === 'invalid_review') {
      return render(errorBox('Please start again', result.message, h('button', { class: 'btn btn-secondary', type: 'button', onclick: () => chooseVisit(visit.id) }, 'Start again')));
    }
    return render(previewNote(), errorBox('Not confirmed', facts.messages.unavailable, fallbackLinks()));
  }

  (async () => {
    container.replaceChildren(h('p', { class: 'loading' }, 'Loading booking options…'));
    try {
      await loadVisitTypes();
    } catch {
      return render(errorBox('Online booking unavailable', facts.messages.unavailable, fallbackLinks()));
    }
    if (initialReview) return reviewStep(initialReview);
    const preset = visitTypes.find((v) => v.id === initialVisit);
    if (preset && preset.booking === 'direct' && initialVisit) return chooseVisit(preset.id);
    return chooseVisit(preset?.id);
  })();
}
