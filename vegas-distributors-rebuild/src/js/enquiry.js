/* Enquiry form.
 *
 * There is no backend on this concept build, so the form never claims success.
 * It validates, then shows the exact payload a connected endpoint would receive.
 * Set forms.endpoint in data/site.json to switch to a real submission.
 */
(function () {
  'use strict';

  var form = document.getElementById('enquiry-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var ENDPOINT = form.getAttribute('data-endpoint') || null;

  var MESSAGES = JSON.parse(form.getAttribute('data-messages') || '{}');

  var setError = function (name, message) {
    var wrap = form.querySelector('[data-field="' + name + '"]');
    var field = form.elements[name];
    var box = document.getElementById(name + '-error');
    if (!wrap || !box) return;

    if (message) {
      wrap.classList.add('field--invalid');
      box.textContent = message;
      box.hidden = false;
      if (field) {
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', name + '-error');
      }
    } else {
      wrap.classList.remove('field--invalid');
      box.textContent = '';
      box.hidden = true;
      if (field) field.removeAttribute('aria-invalid');
    }
  };

  var validate = function () {
    var errors = [];

    var name = form.elements.name;
    if (!name.value.trim()) {
      setError('name', MESSAGES.name);
      errors.push(name);
    } else setError('name', null);

    var email = form.elements.email;
    // Deliberately permissive: reject only what is clearly not an address.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError('email', MESSAGES.email);
      errors.push(email);
    } else setError('email', null);

    var message = form.elements.message;
    if (!message.value.trim()) {
      setError('message', MESSAGES.message);
      errors.push(message);
    } else setError('message', null);

    return errors;
  };

  var payload = function () {
    var data = new FormData(form);
    var out = {};
    data.forEach(function (value, key) {
      if (String(value).trim()) out[key] = value;
    });
    out.locale = document.documentElement.lang;
    out.submittedFrom = window.location.pathname;
    return out;
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var errors = validate();
    if (errors.length) {
      status.hidden = false;
      status.setAttribute('data-state', 'error');
      status.textContent = MESSAGES.summary || '';
      errors[0].focus();
      return;
    }

    var body = payload();

    if (!ENDPOINT) {
      // Development mode: state plainly that nothing was sent.
      status.hidden = false;
      status.setAttribute('data-state', 'review');
      status.innerHTML = '';

      var heading = document.createElement('strong');
      heading.textContent = MESSAGES.devHeading || '';
      var intro = document.createElement('p');
      intro.textContent = MESSAGES.devBody || '';
      var pre = document.createElement('pre');
      pre.style.cssText = 'overflow-x:auto;margin:0.75rem 0 0;font-size:0.85rem;line-height:1.5';
      pre.textContent = JSON.stringify(body, null, 2);

      status.appendChild(heading);
      status.appendChild(intro);
      status.appendChild(pre);
      return;
    }

    // Integration point: a configured endpoint receives the same payload.
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('Request failed: ' + res.status);
        status.hidden = false;
        status.removeAttribute('data-state');
        status.textContent = MESSAGES.sent || '';
        form.reset();
      })
      .catch(function () {
        status.hidden = false;
        status.setAttribute('data-state', 'error');
        status.textContent = MESSAGES.failed || '';
      });
  });

  /* Deep links preselect the enquiry type and prefill context, so a
     "Request availability" button on a brand page lands ready to send. */
  var params = new URLSearchParams(window.location.search);

  var type = params.get('type');
  if (type) {
    var radio = form.querySelector('input[name="enquiryType"][value="' + type.replace(/"/g, '') + '"]');
    if (radio) radio.checked = true;
  }

  var category = params.get('category');
  if (category && form.elements.category) form.elements.category.value = category;

  var brand = params.get('brand');
  if (brand && form.elements.product) {
    form.elements.product.value = brand.replace(/-/g, ' ').replace(/\b\w/g, function (ch) {
      return ch.toUpperCase();
    });
  }
})();
