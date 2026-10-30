// Presentation helpers. Programme text, prices and availability remain owned by the CMS.
export function programmeSummary(trip) {
  if (trip.state !== 'confirmed') return [];
  const items = trip.includes ?? [];
  const patterns = [/noches|alojamiento/i, /pensión|desayuno|comidas/i, /clases|coaching|surf guiding|surf en barco|surf todos/i, /transfers|traslados/i];
  return [...new Set(patterns.map(pattern => items.find(item => pattern.test(item))).filter(Boolean))];
}

export const surfLevelOptions = ['I · Rookies — Iniciación', 'II · Aprendices — Primeras paredes', 'III · Riders — Mejorar maniobras', 'IV · Supercracks — Surf avanzado'];

export function levelProfileTitle(title) {
  return new Map([['Nivel I · Iniciación', 'Nivel I · Rookies'], ['Nivel II · Intermedio bajo', 'Nivel II · Aprendices']]).get(title) ?? title;
}

export function compactDepartureDate(departure) {
  // Compact only the standard generated label; preserve custom editorial dates verbatim.
  const match = /^(\d{1,2}) ([a-záéíóú]{3}) (\d{4}) — (\d{1,2}) ([a-záéíóú]{3}) (\d{4})$/.exec(departure.date ?? '');
  if (!match) return departure.date;
  const [, first, month, year, last, endMonth, endYear] = match;
  if (year !== endYear) return departure.date;
  return month === endMonth ? `${first}–${last} ${month} ${year}` : `${first} ${month}–${last} ${endMonth} ${year}`;
}

export function surfRhythm(trip) {
  if (trip.state !== 'confirmed' || !trip.surfPlan?.length) return [];
  const text = trip.surfPlan.map(([title, copy]) => `${title} ${copy}`).join(' ');
  return [
    [/Animal Flow|estiramientos|movilidad/i, 'Preparar el cuerpo'],
    [/clases|coaching|surf guiding|sesiones/i, 'Entrar al agua'],
    [/videoanálisis|videocorrecciones/i, 'Revisar y aprender'],
  ].filter(([pattern]) => pattern.test(text)).map(([, label]) => label);
}
