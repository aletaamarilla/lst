// Preserve the client's Brevo field names, category IDs and form endpoint.
// The unenhanced HTML also supports a native POST directly to Brevo.
const form = document.querySelector('#sib-form');
const dates = [...document.querySelectorAll('input[name="VIAJE_SURF"]')];
const requested = new URLSearchParams(location.search).get('salida');
if (requested !== null) {
  const selected = dates.find(input => input.dataset.departureId === requested);
  dates.forEach(input => { input.checked = input === selected; });
  const notice = document.querySelector('#registration-date-error');
  notice.hidden = Boolean(selected);

}

dates.forEach(input => input.addEventListener('change', () => { document.querySelector('#registration-date-error').hidden = true; }));

// Do not save personal information to URLs or browser storage.
const birthDate = document.querySelector('#FECHADENACIMIENTO');
birthDate?.addEventListener('input', () => {
  const parts = /^(\d{2})-(\d{2})-(\d{4})$/.exec(birthDate.value);
  if (!parts) { birthDate.setCustomValidity(''); return; }
  const [, day, month, year] = parts;
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);
  birthDate.setCustomValidity(Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === `${year}-${month}-${day}` ? '' : 'Introduce una fecha válida.');
});

if (form) {
  const button = form.querySelector('button[type="submit"]');
  const success = document.querySelector('#success-message');
  const error = document.querySelector('#error-message');
  const originalError = error.querySelector('span').textContent;
  let sending = false;
  let complete = false;
  const show = (panel, message) => {
    if (message) panel.querySelector('span').textContent = message;
    panel.classList.add('sib-form-message-panel--active');
    panel.setAttribute('tabindex', '-1');
    panel.focus();
    panel.scrollIntoView({behavior: 'auto', block: 'center'});
  };
  form.addEventListener('input', event => {
    const entry = event.target.closest('.form__entry');
    if (entry) entry.querySelector('.entry__error').textContent = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || complete || !form.reportValidity()) return;
    sending = true;
    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Enviando…';
    success.classList.remove('sib-form-message-panel--active');
    error.classList.remove('sib-form-message-panel--active');
    form.querySelectorAll('.entry__error').forEach(label => { label.textContent = ''; });
    try {
      const endpoint = new URL(form.action);
      // Brevo's embedded form uses this response mode with the same FormData.
      endpoint.searchParams.set('isAjax', '1');
      const response = await fetch(endpoint, {method:'POST', body:new FormData(form), credentials:'omit', signal:AbortSignal.timeout(30000)});
      if (!response.ok) throw Error('Brevo HTTP error');
      const result = await response.json();
      if (result.success !== true) {
        for (const [name, message] of Object.entries(result.errors ?? {})) {
          const control = form.elements.namedItem(name);
          const input = control instanceof RadioNodeList ? control[0] : control;
          const label = input?.closest('.form__entry')?.querySelector('.entry__error');
          if (label) label.textContent = String(message);
        }
        show(error, typeof result.message === 'string' ? result.message : originalError);
        return;
      }
      complete = true;
      button.textContent = 'Inscripción enviada';
      show(success, typeof result.message === 'string' ? result.message : '¡Genial! Tu inscripción se ha enviado correctamente. El equipo de LST revisará tus datos para confirmar la plaza contigo.');
      if (typeof result.redirect === 'string') {
        try {
          const redirect = new URL(result.redirect);
          if (redirect.protocol === 'https:' && !redirect.username && !redirect.password) location.assign(redirect.href);
        } catch { /* The submission succeeded; retain its confirmation if a redirect is malformed. */ }
      }
    } catch {
      // Preserve the completed fields; never retry a personal-data submission automatically.
      show(error, 'No hemos podido confirmar el envío. Comprueba tu conexión. Si el problema continúa, consulta con el equipo antes de volver a enviar.');
    } finally {
      sending = false;
      button.removeAttribute('aria-busy');
      button.disabled = complete;
      if (!complete) button.textContent = 'Me apunto al viaje';
    }
  });
}
