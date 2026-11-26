// Keep the same Brevo payload. Step visibility never disables or clears fields.
const form = document.querySelector('#sib-form');
const dates = [...document.querySelectorAll('input[name="VIAJE_SURF"]')];
const dateNotice = document.querySelector('#registration-date-error');
const tripDate = document.querySelector('[data-trip-date]');
const datePicker = document.querySelector('[data-date-picker]');
const selectedDate = document.querySelector('[data-selected-date]');
const selectedFare = document.querySelector('[data-selected-fare]');
const requested = new URLSearchParams(location.search).get('salida');
if (requested !== null) {
  const selected = dates.find(input => input.dataset.departureId === requested);
  dates.forEach(input => { input.checked = input === selected; });
  dateNotice.hidden = Boolean(selected);
}
const updateDate = () => {
  const selected = dates.find(input => input.checked);
  if (tripDate) tripDate.textContent = selected?.dataset.dateLabel || 'Elige la fecha que te encaje.';
  if (selectedDate) selectedDate.textContent = selected?.dataset.dateLabel || 'Elige tu salida';
  if (selectedFare) selectedFare.textContent = selected?.dataset.priceLabel || '';
  if (datePicker) datePicker.open = !selected;
};
updateDate();
dates.forEach(input => input.addEventListener('change', () => { dateNotice.hidden = true; updateDate(); datePicker?.querySelector('summary').focus({preventScroll:true}); }));

// Personal information stays only in this page; no browser storage or URL persistence.

// Messages are written under each field: native validation bubbles never appear in iOS Safari
// or in the Instagram and WhatsApp in-app browsers, so a blocked step looked like a dead button.
const messageFor = input => {
  const v = input.validity;
  if (v.valueMissing && input.closest('.registration-birthdate')) return 'Elige el día, el mes y el año en que naciste.';
  if (v.valueMissing) return input.type === 'radio' ? 'Elige una opción.' : input.type === 'checkbox' ? 'Marca esta casilla para continuar.' : 'Rellena este campo.';
  if (v.customError) return input.validationMessage;
  if (v.typeMismatch && input.type === 'email') return 'Escribe un email válido. Por ejemplo: nombre@gmail.com.';
  if (v.patternMismatch && input.id === 'FECHADENACIMIENTO') return 'Escribe la fecha como dd-mm-aaaa. Por ejemplo: 15-06-1995.';
  if (v.patternMismatch && input.id === 'CODIGO_POSTAL') return 'Escribe solo números.';
  return input.validationMessage;
};
// Consent checkboxes have no Brevo error slot; one is added inside their label when needed.
const errorSlot = input => {
  const entry = input.closest('.form__entry');
  if (entry) return entry.querySelector('.entry__error');
  const option = input.closest('.registration-consent-option');
  if (!option) return null;
  return option.querySelector('.entry__error') ?? option.appendChild(Object.assign(document.createElement('span'), {className: 'entry__error entry__error--primary'}));
};
const showFieldError = (input, message = messageFor(input)) => {
  const slot = errorSlot(input);
  if (!slot) { input.reportValidity(); return; }
  slot.textContent = message;
  input.setAttribute('aria-invalid', 'true');
};
const clearFieldError = input => {
  const scope = input.closest('.form__entry, .registration-consent-option');
  if (!scope) return;
  const slot = scope.querySelector('.entry__error');
  if (slot) slot.textContent = '';
  scope.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
};

// Brevo joins the country prefix and the number, and accepts 6 to 19 digits in all, with no + or 0 in front.
// Spaces, dashes, a typed prefix (+34, 0034) and a leading trunk 0 are removed; a typed prefix also picks the country.
const phone = document.querySelector('#WHATSAPP');
const phoneCode = document.querySelector('[name="WHATSAPP__COUNTRY_CODE"]');
const phoneMessage = 'El WhatsApp debe tener entre 6 y 19 cifras contando el prefijo del país, sin + ni 0 delante. Elige el prefijo en la lista y escribe el número. Por ejemplo: 612345678.';
const nationalNumber = () => {
  const raw = phone.value.trim();
  let digits = raw.replace(/\D/g, '');
  if (/^(\+|00)/.test(raw)) {
    if (raw.startsWith('00')) digits = digits.slice(2);
    const option = [...(phoneCode?.options ?? [])].map(o => ({o, code: o.value.replace(/\D/g, '')}))
      .filter(({code}) => code && digits.startsWith(code)).sort((a, b) => b.code.length - a.code.length)[0];
    if (option) { phoneCode.value = option.o.value; digits = digits.slice(option.code.length); }
  }
  return digits.replace(/^0+/, '');
};
const checkPhone = () => {
  const digits = nationalNumber();
  const total = (phoneCode?.value.replace(/\D/g, '') ?? '').length + digits.length;
  phone.setCustomValidity(!phone.value.trim() || (digits.length && total >= 6 && total <= 19) ? '' : phoneMessage);
  return digits;
};
phone?.addEventListener('input', checkPhone);
phone?.addEventListener('change', () => {
  const digits = checkPhone();
  if (digits && phone.checkValidity()) phone.value = digits;
  if (phone.value.trim() && !phone.checkValidity()) showFieldError(phone);
});
phoneCode?.addEventListener('change', () => { if (phone.value.trim()) { checkPhone(); if (phone.checkValidity()) clearFieldError(phone); else showFieldError(phone); } });

// The browser accepts an address with nothing after the domain (nombre@gmailcom); Brevo refuses it.
const email = document.querySelector('#EMAIL');
const checkEmail = () => {
  const value = email.value.trim();
  email.setCustomValidity(value && !email.validity.typeMismatch && !/@[^@\s]+\.[^@\s.]{2,}$/.test(value)
    ? 'Al email le falta el final, como .com o .es. Por ejemplo: nombre@gmail.com.' : '');
};
email?.addEventListener('input', checkEmail);

// The birth date is chosen in three lists instead of typed in a format. They write dd-mm-aaaa into the
// Brevo field, which stays in the form for the payload and is what people type without JavaScript.
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const birthDate = document.querySelector('#FECHADENACIMIENTO');
const birthDay = birthDate ? birthLists(birthDate) : null;
function birthLists(input) {
  const pad = n => String(n).padStart(2, '0');
  const thisYear = new Date().getFullYear();
  const list = (part, label, autocomplete, options) => {
    const select = Object.assign(document.createElement('select'), {className: 'input', id: `FECHADENACIMIENTO-${part}`, required: true, autocomplete});
    select.setAttribute('aria-label', `${label} de nacimiento`);
    select.setAttribute('aria-describedby', 'error-FECHADENACIMIENTO');
    select.append(new Option(label, ''), ...options.map(([text, value]) => new Option(text, value)));
    return select;
  };
  const lists = [
    list('dia', 'Día', 'bday-day', Array.from({length: 31}, (_, i) => [String(i + 1), pad(i + 1)])),
    list('mes', 'Mes', 'bday-month', MONTHS.map((name, i) => [name, pad(i + 1)])),
    list('ano', 'Año', 'bday-year', Array.from({length: 91}, (_, i) => String(thisYear - i)).map(year => [year, year])),
  ];
  const [day] = lists;
  const group = Object.assign(document.createElement('div'), {className: 'registration-birthdate'});
  for (const select of lists) {
    const box = Object.assign(document.createElement('div'), {className: 'entry__field'});
    box.append(select);
    group.append(box);
  }
  const typed = input.closest('.entry__field');
  typed.before(group);
  typed.hidden = true;
  input.closest('.form__entry').querySelector('.entry__label').htmlFor = day.id;
  const help = document.querySelector('#help-FECHADENACIMIENTO');
  if (help) help.hidden = true;
  const sync = () => {
    const [d, m, y] = lists.map(select => select.value);
    day.setCustomValidity('');
    input.value = '';
    if (!d || !m || !y) return;
    const days = new Date(Date.UTC(Number(y), Number(m), 0)).getUTCDate();
    if (Number(d) <= days) { input.value = `${d}-${m}-${y}`; return; }
    const name = MONTHS[Number(m) - 1];
    day.setCustomValidity(`${name[0].toUpperCase()}${name.slice(1)} de ${y} tiene ${days} días.`);
    showFieldError(day);
  };
  // A date the browser restored into the field is shown in the lists.
  const restored = /^(\d{2})-(\d{2})-(\d{4})$/.exec(input.value);
  if (restored) lists.forEach((select, i) => { select.value = restored[i + 1]; });
  lists.forEach(select => select.addEventListener('change', sync));
  sync();
  return day;
}

// Health details are optional; once given, their specific consent becomes required.
const healthConsent = document.querySelector('[data-consent="health"]');
const healthFields = ['#ALERGIAS_INTOLERANCIAS', '#ENFERMEDAD_PROBLEMA'].map(id => document.querySelector(id)).filter(Boolean);
const updateHealthConsent = () => { if (healthConsent) healthConsent.required = healthFields.some(input => input.value.trim()); };
healthFields.forEach(input => input.addEventListener('input', updateHealthConsent));
updateHealthConsent();

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
    // A fact for the measurement script: a step reached for the first time, never what was typed.
    if (index > visited) document.dispatchEvent(new CustomEvent('lst:registration-step', {detail: {step: index + 1}}));
    current = index;
    visited = Math.max(visited, index);
    update();
    if (focus) {
      announcement.textContent = sections[current].querySelector('.registration-step-count').textContent;
      sections[current].focus({preventScroll:true});
      progress.scrollIntoView({block:'start', behavior:'auto'});
    }
  };
  // Writes the message under the field, then brings it into view with focus on it.
  const flag = invalid => {
    if (invalid.name === 'VIAJE_SURF' && datePicker) datePicker.open = true;
    showFieldError(invalid);
    invalid.focus({preventScroll:true});
    (invalid.closest('.form__entry, .registration-consent-option') ?? invalid).scrollIntoView({block:'center', behavior:'auto'});
  };
  const invalidIn = section => [...section.querySelectorAll('input,select,textarea')].find(input => !input.checkValidity());
  const advance = () => {
    if (locked) return;
    const invalid = invalidIn(sections[current]);
    if (invalid) { flag(invalid); return; }
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
        if (invalid) { show(i, false); flag(invalid); return false; }
      }
      return true;
    },
    // Shows the step of a field Brevo refused and puts the person on it, keeping the message under it.
    reveal(input) {
      const index = sections.indexOf(input.closest('[data-registration-step]'));
      if (index >= 0) show(index, false);
      if (input.name === 'VIAJE_SURF' && datePicker) datePicker.open = true;
      input.focus({preventScroll:true});
      (input.closest('.form__entry, .registration-consent-option') ?? input).scrollIntoView({block:'center', behavior:'auto'});
    },
  };
}

if (form) {
  const wizard = createSteps(form);
  const button = form.querySelector('button[type="submit"]');
  const success = document.querySelector('#success-message');
  const error = document.querySelector('#error-message');
  const originalError = error.querySelector('.sib-form-message-panel__inner-text').textContent;
  // Whatever goes wrong, the person can still ask the team in one tap (measured as a registration contact).
  const ask = document.querySelector('.registration-support .rg-whatsapp')?.cloneNode(true);
  if (ask) {
    ask.className = 'hp-btn rg-whatsapp';
    ask.textContent = 'Escríbenos por WhatsApp';
    error.append(ask);
  }
  // Brevo names the fields it refuses either in `errors` or only at the start of its message
  // ("WHATSAPP: revisa los datos que has introducido..."). Only names of this form's fields count;
  // the prefix and the number are one WhatsApp answer.
  const refusedFields = result => {
    const named = Object.keys(result.errors ?? {});
    if (typeof result.message === 'string') named.push(...[...result.message.matchAll(/\b([A-Z][A-Z0-9_]*)\s*:/g)].map(([, name]) => name));
    return [...new Set(named.map(name => name === 'WHATSAPP__COUNTRY_CODE' ? 'WHATSAPP' : name))].filter(name => form.elements.namedItem(name));
  };
  // The control people see for an answer: the day list for the birth date, the first option of a choice.
  const controlFor = name => {
    if (name === 'FECHADENACIMIENTO' && birthDay) return birthDay;
    const control = form.elements.namedItem(name);
    return control instanceof RadioNodeList ? control[0] : control;
  };
  // Our words when Brevo only names the field; its own text when it gives one for the field.
  const REFUSED = {
    EMAIL: 'Brevo no ha aceptado este email. Revisa que esté bien escrito. Por ejemplo: nombre@gmail.com.',
    WHATSAPP: phoneMessage,
    FECHADENACIMIENTO: 'Revisa la fecha de nacimiento: Brevo no la ha aceptado.',
  };
  let sending = false;
  let complete = false;
  const show = (panel, message, focus = true) => {
    if (message) panel.querySelector('.sib-form-message-panel__inner-text').textContent = message;
    panel.classList.add('sib-form-message-panel--active');
    if (!focus) return;
    panel.focus({preventScroll:true});
    panel.scrollIntoView({behavior:'auto', block:'center'});
  };
  form.addEventListener('input', event => clearFieldError(event.target));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || complete) return;
    // Enter follows the same progression as the Continue button.
    if (!wizard.last) { wizard.advance(); return; }
    if (phone) { const digits = checkPhone(); if (digits && phone.checkValidity()) phone.value = digits; }
    if (email) checkEmail();
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
    // Facts for the measurement script (only heard with consent): never messages or form data.
    const failed = detail => document.dispatchEvent(new CustomEvent('lst:registration-failed', {detail}));
    let httpStatus = null;
    try {
      const endpoint = new URL(form.action);
      endpoint.searchParams.set('isAjax', '1');
      const response = await fetch(endpoint, {method:'POST', body:new FormData(form), credentials:'omit', signal:AbortSignal.timeout(30000)});
      if (!response.ok) { httpStatus = response.status; throw Error('Brevo HTTP error'); }
      const result = await response.json();
      if (result.success !== true) {
        const refused = refusedFields(result);
        for (const name of refused) {
          const own = result.errors?.[name];
          showFieldError(controlFor(name), typeof own === 'string' ? own : REFUSED[name] ?? 'Revisa este dato: Brevo no lo ha aceptado.');
        }
        failed(refused.length ? {fields: true, field: refused[0]} : {fields: false});
        if (!refused.length) { show(error, typeof result.message === 'string' ? result.message : originalError); return; }
        show(error, 'No se ha enviado: revisa el dato marcado y vuelve a enviar la solicitud.', false);
        wizard.reveal(controlFor(refused[0]));
        return;
      }
      complete = true;
      // Measured only with consent; carries the start date of the departure chosen and no form data.
      document.dispatchEvent(new CustomEvent('lst:registration-accepted', {detail: {start: dates.find(input => input.checked)?.dataset.departureStart}}));
      button.textContent = 'Inscripción enviada';
      form.hidden = true;
      show(success, typeof result.message === 'string' ? result.message : '¡Genial! Tu inscripción se ha enviado correctamente. El equipo de LST revisará tus datos para confirmar la plaza contigo.');
      if (typeof result.redirect === 'string') {
        try {
          const redirect = new URL(result.redirect);
          if (redirect.protocol === 'https:' && !redirect.username && !redirect.password) location.assign(redirect.href);
        } catch { /* Keep the accepted submission confirmed if the redirect is malformed. */ }
      }
    } catch (problem) {
      failed(httpStatus ? {status: httpStatus} : {error: problem?.name});
      // Keep the completed fields; never retry a personal-data submission automatically.
      show(error, 'No hemos podido confirmar el envío. Comprueba tu conexión. Si el problema continúa, consulta con el equipo antes de volver a enviar.');
    } finally {
      sending = false;
      wizard.lock(complete);
      button.removeAttribute('aria-busy');
      button.disabled = complete;
      if (!complete) button.textContent = 'Enviar solicitud ↗';
    }
  });
}
