import {catalogFilters, filterCatalog} from './catalog-filter.js';

const controls = document.querySelector('[data-catalog-filters]');
const level = document.querySelector('#catalog-level');
const state = document.querySelector('#catalog-state');
const status = document.querySelector('#catalog-status');
const empty = document.querySelector('#catalog-empty');
const trips = [...document.querySelectorAll('[data-catalog-trip]')].map(card => ({
  card,
  levels: card.dataset.levels.split(' ').map(Number),
  state: card.dataset.state,
}));

function showResults() {
  const visible = new Set(filterCatalog(trips, level.value, state.value));
  trips.forEach(trip => { trip.card.hidden = !visible.has(trip); });
  empty.hidden = visible.size !== 0;
  const context = [level, state].filter(select => select.value)
    .map(select => select.selectedOptions[0].textContent);
  status.textContent = `${visible.size} de ${trips.length} destinos${context.length ? ` · ${context.join(' · ')}` : ''}.`;
}

function syncFromUrl() {
  const params = new URLSearchParams(location.search);
  const filters = catalogFilters(params.get('nivel'), params.get('estado'));
  level.value = filters.level === null ? '' : String(filters.level);
  state.value = filters.state ?? '';
  showResults();
}

function updateFilters() {
  const url = new URL(location.href);
  for (const [name, value] of [['nivel', level.value], ['estado', state.value]]) {
    if (value) url.searchParams.set(name, value);
    else url.searchParams.delete(name);
  }
  if (url.href !== location.href) history.pushState(null, '', url);
  showResults();
}

level.addEventListener('change', updateFilters);
state.addEventListener('change', updateFilters);
document.querySelectorAll('[data-catalog-clear]').forEach(button => {
  button.addEventListener('click', () => {
    level.value = '';
    state.value = '';
    // The empty-state action disappears after clearing; keep focus on a visible control.
    if (empty.contains(button)) level.focus({preventScroll: true});
    updateFilters();
  });
});
window.addEventListener('popstate', syncFromUrl);
syncFromUrl();
controls.hidden = false;
