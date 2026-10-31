// Service claims are derived from current CMS data; PDF-only offers are never fallbacks.
const clean = value => String(value ?? '').replace(/\s*\(p\.\s*\d+[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
const list = value => Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const included = trip => list(trip.includes);
const excluded = trip => list(trip.excludes);
const storyText = trip => (trip.story ?? []).map(item => clean(Array.isArray(item) ? item[1] : item.text)).join(' ');
const optionalSnorkel = items => items.some(item => /snorkel[^.;]*opcional|opcional[^.;]*snorkel/i.test(item) && !/no (?:es )?opcional|obligatori/i.test(item));
const join = items => [...new Set(items)].join('. ').replace(/\.\./g, '.');

export function salesPitch(trip) {
  if (trip.state !== 'confirmed') return {title: '', text: 'Estamos preparando las próximas salidas. Consulta las fechas y el programa con el equipo.'};
  return {title: trip.tagline || '', text: trip.destinationDescription || 'Consulta el programa de este viaje y pregunta al equipo si tienes dudas antes de solicitar plaza.'};
}

export function practicalDetails(trip) {
  if (trip.state !== 'confirmed') return [];
  const inc = included(trip), exc = excluded(trip), details = [];
  const transfers = inc.filter(item => /transfers|traslados/i.test(item));
  const flightsExcluded = exc.some(item => /vuelos/i.test(item));
  const transportExcluded = exc.some(item => /transporte|coches compartidos/i.test(item));
  if (transfers.length || flightsExcluded || transportExcluded) {
    const parts = [];
    if (flightsExcluded) parts.push('Los vuelos se contratan aparte. Consulta con el equipo qué llegada y salida encajan con el viaje.');
    if (transportExcluded) parts.push(exc.some(item => /coches compartidos/i.test(item)) ? 'El transporte hasta el destino no está incluido. Consulta cómo coordinar coches compartidos con el grupo.' : 'El transporte hasta el destino no está incluido. Consulta con el equipo las opciones de llegada.');
    if (transfers.length) parts.push(join(transfers));
    details.push({title: 'Cómo llegar y moverte', text: join(parts)});
  }
  const meals = inc.filter(item => /pensión|desayuno|comidas|cenas/i.test(item));
  const extraMeals = exc.filter(item => /comidas|cenas|bebidas/i.test(item));
  if (meals.length || extraMeals.length) details.push({title: 'Las comidas, claras desde el principio', text: join([...meals, ...(extraMeals.length ? ['Por tu cuenta: ' + extraMeals.join('; ')] : [])])});
  const equipment = inc.filter(item => /material|neopreno/i.test(item));
  const extraEquipment = exc.filter(item => /material|tabla|shortboard|neopreno/i.test(item));
  if (equipment.length || extraEquipment.length) details.push({title: 'Tabla, neopreno y material', text: join([...equipment, ...(extraEquipment.length ? ['Aparte del precio: ' + extraEquipment.join('; ')] : [])])});
  else if (/surf|coaching/i.test(inc.join(' '))) details.push({title: 'Antes de hacer la maleta', text: 'Consulta con el equipo qué tabla y equipación necesitas para este viaje y qué opciones hay en destino.'});
  const schoolInsurance = inc.some(item => /seguro.*escuela|escuela.*seguro/i.test(item));
  const insuranceExcluded = exc.some(item => /seguro/i.test(item));
  const discount = inc.some(item => /descuento.*seguro/i.test(item));
  if (schoolInsurance || insuranceExcluded || discount) {
    const parts = [];
    if (schoolInsurance) parts.push('Las clases incluyen el seguro de la escuela local. Esa cobertura es distinta de un seguro de viaje.');
    if (insuranceExcluded) parts.push('El seguro de viaje no está incluido y se contrata aparte.');
    if (discount) parts.push('Hay un descuento para contratar seguro; consulta sus condiciones con el equipo.');
    if (!insuranceExcluded && !schoolInsurance && discount) parts.push('Consulta qué cobertura necesitas: el descuento no equivale a una póliza incluida.');
    details.push({title: 'El seguro para tu viaje', text: join(parts)});
  }
  return details;
}

export function salesFaqs(trip) {
  if (trip.state !== 'confirmed') return [];
  const faqs = [], inc = included(trip), exc = excluded(trip), story = storyText(trip);
  if (inc.some(item => /clases|coaching|surf guiding|surf en barco|surf todos/i.test(item))) faqs.push([
    '¿El programa de surf es fijo?',
    'El surf depende de las condiciones del mar. El programa te ayuda a conocer la propuesta del viaje; consulta con el equipo cómo se organizan las sesiones y qué puede variar.',
  ]);
  // This question also replaces stale flight-price answers from imported PDFs.
  if (exc.some(item => /vuelos/i.test(item))) faqs.push([
    '¿Están incluidos los vuelos?',
    'Los vuelos no están incluidos en el precio del viaje. Consulta con el equipo qué horarios encajan con el programa antes de comprarlos. Las tarifas dependen de la compañía y del momento de compra.',
  ]);
  if (optionalSnorkel(inc)) faqs.push([
    '¿Y si no hay olas?',
    'El snorkel es una actividad opcional dentro del programa, como alternativa al surf o para descansar. Los encuentros con animales dependen de la naturaleza.',
  ]);
  if (/fiesta.*80|80.*90/i.test(inc.join(' ') + ' ' + story)) faqs.push([
    '¿Tengo que participar en todos los planes?',
    'Puedes vivir los ratos libres a tu ritmo. La fiesta y los planes fuera del agua son una invitación a compartir; también hay espacio para descansar, respetando los horarios del grupo.',
  ]);
  return faqs;
}

