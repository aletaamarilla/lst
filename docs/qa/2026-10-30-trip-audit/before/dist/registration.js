// Keep the same Brevo payload. Step visibility never disables or clears fields.
const form = document.querySelector('#sib-form');
const dates = [...document.querySelectorAll('input[name="VIAJE_SURF"]')];
const dateNotice = document.querySelector('#registration-date-error');
const tripDate = document.querySelector('[data-trip-date]');
const requested = new URLSearchParams(location.search).get('salida');
if (requested !== null) {
  const selected = dates.find(input => input.dataset.departureId === requested);
  dates.forEach(input => { input.checked = input === selected; });
  dateNotice.hidden = Boolean(selected);
}
const updateDate = () => {
  const selected = dates.find(input => input.checked);
  if (tripDate) tripDate.textContent = selected?.dataset.dateLabel || 'Elige la fecha que te encaje.';
};
updateDate();
dates.forEach(input => input.addEventListener('change', () => { dateNotice.hidden = true; updateDate(); }));

// Personal information stays only in this page; no browser storage or URL persistence.
const birthDate = document.querySelector('#FECHADENACIMIENTO');
birthDate?.addEventListener('input', () => {
  const parts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(birthDate.value);
  if (!parts) { birthDate.setCustomValidity(''); return; }
  const [, day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  birthDate.setCustomValidity(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === `${year}-${month}-${day}` ? '' : 'Introduce una fecha válida.');
});

function createSteps(form) {
  const sections = [...form.querySelectorAll('[data-registration-step]')];
  const progress = form.querySelector('.registration-progress');
  const links = [...progress.querySelectorAll('[data-go-step]')];
  const previous = form.querySelector('[data-step-prev]');
  const next = form.querySelector('[data-step-next]');
  const submit = form.querySelector('.registration-submit');
  const note = form.querySelector('[data-submit-note]');
  const announcement = form.querySelector('#registration-step-announcement');
  let current = 0;
  let visited = 0;
  let locked = false;
  const update = () => {
    sections.forEach((section, i) => { section.hidden = i !== current; });
    links.forEach((link, i) => {
      link.disabled = locked || i > visited;
      link.toggleAttribute('data-complete', i < visited);
      if (i === current) link.setAttribute('aria-current', 'step');
      else link.removeAttribute('aria-current');
    });
    previous.hidden = current === 0;
    previous.disabled = locked;
    next.hidden = current === sections.length - 1;
    next.disabled = locked;
    submit.hidden = current !== sections.length - 1;
    note.hidden = current !== sections.length - 1;
    form.dataset.currentStep = String(current);
  };
  const show = (index, focus = true) => {
    current = index;
    visited = Math.max(visited, index);
    update();
    if (focus) {
      announcement.textContent = sections[current].querySelector('.registration-step-count').textContent;
      sections[current].focus({preventScroll:true});
      progress.scrollIntoView({block:'start', behavior:'auto'});
    }
  };
  const invalidIn = section => [...section.querySelectorAll('input,select,textarea')].find(input => !input.checkValidity());
  const advance = () => {
    if (locked) return;
    const invalid = invalidIn(sections[current]);
    if (invalid) { invalid.reportValidity(); return; }
    if (current < sections.length - 1) show(current + 1);
  };
  previous.addEventListener('click', () => { if (!locked && current > 0) show(current - 1); });
  next.addEventListener('click', advance);
  links.forEach((link, index) => link.addEventListener('click', () => { if (!locked && index <= visited) show(index); }));
  // Validate only the visible step, then all steps before sending; native no-JS POST remains intact.
  form.noValidate = true;
  document.body.classList.add('registration-enhanced');
  progress.hidden = false;
  show(0, false);
  return {
    get last() { return current === sections.length - 1; },
    advance,
    lock(value) { locked = value; update(); },
    validateAll() {
      for (let i = 0; i < sections.length; i++) {
        const invalid = invalidIn(sections[i]);
        if (invalid) { show(i); invalid.reportValidity(); return false; }
      }
      return true;
    },
    reveal(input) {
      const index = sections.indexOf(input?.closest('[data-registration-step]'));
      if (index >= 0) show(index, false);
    },
  };
}

if (form) {
  const wizard = createSteps(form);
  const button = form.querySelector('button[type="submit"]');
  const success = document.querySelector('#success-message');
  const error = document.querySelector('#error-message');
  const originalError = error.querySelector('.sib-form-message-panel__inner-text').textContent;
  let sending = false;
  let complete = false;
  const show = (panel, message) => {
    if (message) panel.querySelector('.sib-form-message-panel__inner-text').textContent = message;
    panel.classList.add('sib-form-message-panel--active');
    panel.focus({preventScroll:true});
    panel.scrollIntoView({behavior:'auto', block:'center'});
  };
  form.addEventListener('input', event => {
    const entry = event.target.closest('.form__entry');
    if (entry) {
      entry.querySelector('.entry__error').textContent = '';
      entry.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || complete) return;
    // Enter follows the same progression as the Continue button.
    if (!wizard.last) { wizard.advance(); return; }
    if (!wizard.validateAll()) return;
    sending = true;
    wizard.lock(true);
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Enviando…';
    success.classList.remove('sib-form-message-panel--active');
    error.classList.remove('sib-form-message-panel--active');
    form.querySelectorAll('.entry__error').forEach(label => { label.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    try {
      const endpoint = new URL(form.action);
      endpoint.searchParams.set('isAjax', '1');
      const response = await fetch(endpoint, {method:'POST', body:new FormData(form), credentials:'omit', signal:AbortSignal.timeout(30000)});
      if (!response.ok) throw Error('Brevo HTTP error');
      const result = await response.json();
      if (result.success !== true) {
        let firstInvalid = null;
        for (const [name, message] of Object.entries(result.errors ?? {})) {
          const control = form.elements.namedItem(name);
          const input = control instanceof RadioNodeList ? control[0] : control;
          const label = input?.closest('.form__entry')?.querySelector('.entry__error');
          if (label) {
            label.textContent = String(message);
            input.setAttribute('aria-invalid', 'true');
            firstInvalid ??= input;
          }
        }
        if (firstInvalid) wizard.reveal(firstInvalid);
        show(error, typeof result.message === 'string' ? result.message : originalError);
        return;
      }
      complete = true;
      button.textContent = 'Inscripción enviada';
      form.hidden = true;
      show(success, typeof result.message === 'string' ? result.message : '¡Genial! Tu inscripción se ha enviado correctamente. El equipo de LST revisará tus datos para confirmar la plaza contigo.');
      if (typeof result.redirect === 'string') {
        try {
          const redirect = new URL(result.redirect);
          if (redirect.protocol === 'https:' && !redirect.username && !redirect.password) location.assign(redirect.href);
        } catch { /* Keep the accepted submission confirmed if the redirect is malformed. */ }
      }
    } catch {
      // Keep the completed fields; never retry a personal-data submission automatically.
      show(error, 'No hemos podido confirmar el envío. Comprueba tu conexión. Si el problema continúa, consulta con el equipo antes de volver a enviar.');
    } finally {
      sending = false;
      wizard.lock(complete);
      button.removeAttribute('aria-busy');
      button.disabled = complete;
      if (!complete) button.textContent = 'Me apunto al viaje ↗';
    }
  });
}
