// Home enhancements. Without JavaScript every trip stays visible and linked;
// these only add the rotating destination, level filters and the level quiz.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Hero: "¿Te vienes a surfear?" rotates through published destinations.
const rot = document.querySelector('.hp-rot[data-words]');
if (rot && !reduceMotion) {
  let words = [];
  try { words = JSON.parse(rot.dataset.words); } catch { words = []; }
  const sequence = [rot.textContent.trim(), ...words];
  let index = 0;
  if (sequence.length > 1) setInterval(() => {
    if (document.hidden) return;
    const current = rot.lastElementChild;
    index = (index + 1) % sequence.length;
    const next = document.createElement('span');
    next.textContent = sequence[index];
    next.className = 'is-in';
    rot.append(next);
    next.getBoundingClientRect();
    setTimeout(() => { current.className = 'is-out'; next.className = ''; }, 20);
    setTimeout(() => current.remove(), 700);
  }, 2400);
}

// Trips: level filters, slide counter and dots on the mobile rail.
const rail = document.querySelector('.hp-rail');
const tickets = [...document.querySelectorAll('.hp-ticket')];
const chips = [...document.querySelectorAll('.hp-chip')];
const empty = document.querySelector('.hp-filter-empty');
const count = document.querySelector('.hp-count');
const dots = document.querySelector('.hp-dots');
const visible = () => tickets.filter(ticket => !ticket.hidden);

function updatePosition() {
  const shown = visible();
  if (!rail || !count || !dots || !shown.length) return;
  const step = shown[0].getBoundingClientRect().width + parseFloat(getComputedStyle(rail).columnGap || 0);
  const current = Math.min(shown.length - 1, Math.round(rail.scrollLeft / (step || 1)));
  count.textContent = `${current + 1} / ${shown.length}`;
  [...dots.children].forEach((dot, i) => dot.classList.toggle('is-on', i === current));
}
function drawDots() {
  if (!dots) return;
  dots.replaceChildren(...visible().map(() => document.createElement('i')));
  updatePosition();
}
export function filterTrips(value) {
  chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.filter === value)));
  for (const ticket of tickets) {
    const levels = ticket.dataset.levels.split(' ').map(Number);
    ticket.hidden = !(value === 'all' || (value === '3' ? levels.some(level => level >= 3) : levels.includes(Number(value))));
  }
  if (empty) empty.hidden = visible().length > 0;
  rail?.scrollTo({left: 0});
  drawDots();
}
chips.forEach(chip => chip.addEventListener('click', () => filterTrips(chip.dataset.filter)));
rail?.addEventListener('scroll', updatePosition, {passive: true});
drawDots();

// Levels: a three-question orientation that highlights a level and filters trips.
const quiz = document.querySelector('[data-quiz]');
if (quiz) {
  quiz.hidden = false;
  const questions = [...quiz.querySelectorAll('.hp-q')];
  const result = quiz.querySelector('.hp-result');
  const levels = [...document.querySelectorAll('.hp-lvl')];
  const names = {1: 'Nivel 1 · Iniciación', 2: 'Nivel 2 · Base', 3: 'Nivel 3 · Intermedio', 4: 'Nivel 4 · Avanzado'};
  let score = 0, step = 0, level = 1;
  quiz.querySelectorAll('.hp-opts button').forEach(button => button.addEventListener('click', () => {
    score += Number(button.dataset.v);
    questions[step].classList.remove('is-on');
    step += 1;
    if (step < questions.length) { questions[step].classList.add('is-on'); questions[step].querySelector('button')?.focus(); return; }
    level = score <= 1 ? 1 : score <= 3 ? 2 : score <= 5 ? 3 : 4;
    result.querySelector('.hp-result-level').textContent = names[level];
    result.hidden = false;
    levels.forEach(item => item.classList.toggle('is-on', Number(item.dataset.lvl) === level));
  }));
  quiz.querySelector('[data-quiz-go]')?.addEventListener('click', () => filterTrips(String(Math.min(level, 3))));
  quiz.querySelector('[data-quiz-reset]')?.addEventListener('click', () => {
    score = 0; step = 0; result.hidden = true;
    questions.forEach((q, i) => q.classList.toggle('is-on', i === 0));
    levels.forEach(item => item.classList.remove('is-on'));
    questions[0].querySelector('button')?.focus();
  });
}

// Catalogue and shared trip cards (/viajes/ also loads this file): the date
// control. Native details remain usable without JavaScript. Enhancement adds hover and
// explicit pinning on the date control; the card link opens the trip page.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const records = [...document.querySelectorAll('[data-home-dates]')].map(details => {
  const card = details.closest('.home-trip');
  const media = card;
  const summary = details.querySelector('summary');
  let pinned = false;
  let suppressed = false;
  const record = {card, details, summary, close() {pinned = false; suppressed = media.matches(':hover'); details.open = false;}};
  summary.addEventListener('click', event => {
    event.preventDefault();
    const next = !pinned;
    records.forEach(other => {if (other !== record) other.close();});
    pinned = next;
    suppressed = !next;
    details.open = next;
  });
  media.addEventListener('pointerenter', () => {
    if (!finePointer.matches || suppressed || pinned || records.some(other => other !== record && other.details.open && other.summary.matches(':focus-visible'))) return;
    records.forEach(other => {if (other !== record) other.close();});
    details.open = true;
  });
  media.addEventListener('pointerleave', () => {
    suppressed = false;
    if (!pinned && !details.contains(document.activeElement)) details.open = false;
  });
  card.addEventListener('focusout', event => {
    if (!pinned && !card.contains(event.relatedTarget)) details.open = false;
  });
  return record;
});
document.addEventListener('click', event => {
  records.forEach(record => {if (!record.card.contains(event.target)) record.close();});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  records.forEach(record => {
    if (!record.details.open) return;
    const restoreFocus = record.details.contains(document.activeElement);
    record.close();
    if (restoreFocus) record.summary.focus({preventScroll: true});
  });
});
document.querySelectorAll('.home-more-trips').forEach(collection => {
  collection.addEventListener('toggle', () => {
    if (!collection.open) records.forEach(record => {if (collection.contains(record.card)) record.close();});
  });
});

// Filtering a collection closes its date controls and clears pinned state.
export function closeTripDates(container) {
  records.forEach(record => { if (container.contains(record.card)) record.close(); });
}
