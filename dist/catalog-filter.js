// The level range belongs to the trip; dates only determine the calendar month.
export function catalogFilters(level = '', date = '') {
  return {
    level: /^[1-4]$/.test(String(level)) ? Number(level) : null,
    date: /^\d{4}-(0[1-9]|1[0-2])$/.test(String(date)) ? date : null,
  };
}

export function departureMonths({start, end}) {
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '') &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!valid(start)) return [];
  const first = Number(start.slice(0, 4)) * 12 + Number(start.slice(5, 7)) - 1;
  const last = valid(end) && end >= start
    ? Number(end.slice(0, 4)) * 12 + Number(end.slice(5, 7)) - 1 : first;
  return Array.from({length: last - first + 1}, (_, i) =>
    `${String(Math.floor((first + i) / 12)).padStart(4, '0')}-${String((first + i) % 12 + 1).padStart(2, '0')}`);
}

export function filterCatalog(trips, level = '', date = '') {
  const filters = catalogFilters(level, date);
  return trips.filter(trip => {
    return (filters.level === null || trip.levels.includes(filters.level)) &&
      (filters.date === null || (trip.departures ?? []).some(departure => departureMonths(departure).includes(filters.date)));
  });
}
