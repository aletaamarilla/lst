import {catalogFilters, filterCatalog} from './catalog-filter.js';

const controls = document.querySelector('[data-catalog-filters]');
const level = document.querySelector('#catalog-level');
const status = document.querySelector('#catalog-status');
const empty = document.querySelector('#catalog-empty');
const trips = [...document.querySelectorAll('[data-catalog-trip]')].map(card => ({
  card,
  levels: card.dataset.levels.split(' ').map(Number),
}));

function showResults() {
  const visible = new Set(filterCatalog(trips, level.value));
  trips.forEach(trip => {
    trip.card.hidden = !visible.has(trip);
  });
  empty.hidden = visible.size !== 0 || !trips.length;
  const context = level.value ? ' · ' + level.selectedOptions[0].textContent : '';
  status.textContent = !trips.length ? 'No hay viajes publicados en este momento.' : visible.size + ' de ' + trips.length + ' viajes' + context + '.';
}

function syncFromUrl() {
  const params = new URLSearchParams(location.search);
  // Older date links still open the catalogue, with only the level applied.
  const filters = catalogFilters(params.get('nivel'));
  level.value = filters.level === null ? '' : String(filters.level);
  showResults();
}

function updateFilters() {
  const url = new URL(location.href);
  url.searchParams.delete('estado');
  url.searchParams.delete('fecha');
  if (level.value) url.searchParams.set('nivel', level.value);
  else url.searchParams.delete('nivel');
  if (url.href !== location.href) history.pushState(null, '', url);
  showResults();
}

level.addEventListener('change', updateFilters);
document.querySelectorAll('[data-catalog-clear]').forEach(button => {
  button.addEventListener('click', () => {
    level.value = '';
    if (empty.contains(button)) level.focus({preventScroll: true});
    updateFilters();
  });
});
window.addEventListener('popstate', syncFromUrl);
syncFromUrl();
controls.hidden = false;
