// Pure filtering over levels resolved by trip-model.mjs during the build.
// The commercial state describes dates, never remaining places or availability.
export function catalogFilters(level = '', state = '') {
  return {
    level: /^[1-4]$/.test(String(level)) ? Number(level) : null,
    state: ['confirmed', 'upcoming'].includes(state) ? state : null,
  };
}

export function filterCatalog(trips, level = '', state = '') {
  const filters = catalogFilters(level, state);
  return trips.filter(trip =>
    (filters.level === null || trip.levels.includes(filters.level)) &&
    (filters.state === null || trip.state === filters.state)
  );
}
