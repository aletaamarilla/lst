import {catalogFilters, filterCatalog} from './catalog-filter.js';

const controls = document.querySelector('[data-catalog-filters]');
const status = document.querySelector('#catalog-status');
const empty = document.querySelector('#catalog-empty');
const chips = [...document.querySelectorAll('[data-catalog-level]')];
const months = [...document.querySelectorAll('[data-catalog-month]')];
const seasonEntries = [...document.querySelectorAll('.ct-season li[data-levels]')];
const trips = [...document.querySelectorAll('[data-catalog-trip]')].map(card => ({
  card,
  levels: card.dataset.levels.split(' ').map(Number),
}));
let level = '';

function showResults() {
  const visible = new Set(filterCatalog(trips, level));
  trips.forEach(trip => {
    trip.card.hidden = !visible.has(trip);
  });
  // A month with no matching trip disappears; the season index only dims.
  months.forEach(month => {
    month.hidden = ![...month.querySelectorAll('[data-catalog-trip]')].some(card => !card.hidden);
  });
  seasonEntries.forEach(entry => {
    entry.classList.toggle('is-off', !!level && !entry.dataset.levels.split(' ').includes(level));
  });
  chips.forEach(chip => chip.setAttribute('aria-pressed', String(chip.dataset.catalogLevel === level)));
  if (empty) empty.hidden = visible.size !== 0 || !trips.length;
  const chip = chips.find(c => c.dataset.catalogLevel === level);
  const context = level && chip ? ' para ' + chip.dataset.catalogLabel : '';
  if (status) status.textContent = !trips.length ? 'No hay viajes publicados en este momento.' : visible.size + ' de ' + trips.length + ' viajes' + context + '.';
}

function syncFromUrl() {
  // Older date links still open the catalogue, with only the level applied.
  const filters = catalogFilters(new URLSearchParams(location.search).get('nivel'));
  level = filters.level === null ? '' : String(filters.level);
  showResults();
}

function select(value) {
  level = value;
  const url = new URL(location.href);
  url.searchParams.delete('estado');
  url.searchParams.delete('fecha');
  if (level) url.searchParams.set('nivel', level);
  else url.searchParams.delete('nivel');
  if (url.href !== location.href) history.pushState(null, '', url);
  showResults();
}

// From further down the page, a new level brings the first matching month into view.
function revealResults() {
  const results = document.querySelector('#catalog-results');
  const bar = document.querySelector('.ct-chips');
  if (!results || !bar || results.getBoundingClientRect().top >= bar.getBoundingClientRect().bottom) return;
  const first = months.find(month => !month.hidden) || empty;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  first?.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'});
}

chips.forEach(chip => chip.addEventListener('click', () => {
  select(chip.dataset.catalogLevel);
  chip.scrollIntoView?.({block: 'nearest', inline: 'nearest'});
  revealResults();
}));
document.querySelectorAll('[data-catalog-clear]').forEach(button => {
  button.addEventListener('click', () => {
    select('');
    if (empty && empty.contains(button)) chips[0]?.focus({preventScroll: true});
  });
});
window.addEventListener('popstate', syncFromUrl);
syncFromUrl();
if (controls) controls.hidden = false;
