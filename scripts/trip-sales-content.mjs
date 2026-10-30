// Service claims are derived from current CMS data; PDF-only offers are never fallbacks.
const clean = value => String(value ?? '').replace(/\s*\(p\.\s*\d+[^)]*\)/gi, '').replace(/\s+/g, ' ').trim();
const list = value => Array.isArray(value) ? value.map(clean).filter(Boolean) : [];
const included = trip => list(trip.includes);
const excluded = trip => list(trip.excludes);
const storyText = trip => (trip.story ?? []).map(item => clean(Array.isArray(item) ? item[1] : item.text)).join(' ');
const optionalSnorkel = items => items.some(item => /snorkel[^.;]*opcional|opcional[^.;]*snorkel/i.test(item) && !/no (?:es )?opcional|obligatori/i.test(item));
const join = items => [...new Set(items)].join('. ').replace(/\.\./g, '.');
const destination = trip => clean(typeof trip.slug === 'object' ? trip.slug.current : trip.slug).replace(/-\d{4}-\d{2}-\d{2}$/, '');

const pitches = {
  'el-palmar': ['Tu próxima escapada sabe a sal.', 'Cambiar de ritmo, dedicarle tiempo al surf y compartir los ratos entre baño y baño. El Palmar es una invitación a hacer sitio a todo eso.'],
  hossegor: ['Un fin de semana para mirar tu surf de otra manera.', 'A veces lo que apetece es parar, concentrarse en el agua y dedicarle atención a esos detalles que se escapan en el día a día. Ese es el espíritu de este viaje a Hossegor.'],
  marruecos: ['Un viaje para encontrar tu ritmo en el agua.', 'Hay mucho que disfrutar mientras aprendes: el primer baño, las conversaciones después de surfear y las ganas de volver al mar. Una semana para vivir Marruecos desde esa ilusión.'],
  'marruecos-avanzado': ['Dale tiempo a tu surf.', 'Si ya te mueves con autonomía en el agua, este viaje es una oportunidad para dedicarle una semana a tu técnica y disfrutar del ritmo de Marruecos entre sesiones.'],
  fuerteventura: ['Una pausa con sabor a isla.', 'Hacer hueco al surf, bajar el ritmo y mirar alrededor. Fuerteventura invita a una escapada que se vive tanto dentro del agua como en los ratos de tierra.'],
  senegal: ['Una semana que va más allá de las olas.', 'Surfear es el punto de partida. El resto lo pone la curiosidad por descubrir Senegal y compartir una forma distinta de pasar los días.'],
  maldivas: ['Haz sitio a una semana mirando al mar.', 'Desconectar del calendario de siempre y dedicarle tiempo a lo que te gusta. Un viaje a Maldivas para disfrutar del surf y saborear también los momentos entre sesiones.'],
};

function highlightsFor(trip) {
  const items = included(trip);
  const has = pattern => items.some(item => pattern.test(item));
  const highlights = [];
  if (has(/seguimiento individual de Lucas|coaching intensivo con Lucas/i)) {
    highlights.push({title: 'Tiempo para tu técnica', text: 'Coaching con Lucas para trabajar tu técnica con un seguimiento cercano durante el viaje.'});
  } else if (has(/3 grupos según nivel/i)) {
    highlights.push({title: 'Tu nivel tiene su espacio', text: 'Clases en tres grupos según nivel: una forma de compartir el viaje y trabajar el surf que te toca ahora.'});
  } else if (has(/clases.*adaptad|clases y coaching adaptados/i)) {
    highlights.push({title: 'Aprender desde donde estás', text: 'Clases adaptadas al nivel para dedicarle tiempo a tu surf y disfrutar del proceso.'});
  } else if (has(/surf todos los días con clases o surf guiding/i)) {
    highlights.push({title: 'El mar marca el ritmo', text: 'Surf con clases o guiding para disfrutar de las sesiones y seguir trabajando tu técnica.'});
  }
  if (has(/videoanálisis|videocorrecciones/i)) {
    highlights.push({title: 'Mírate con otros ojos', text: 'Las correcciones en vídeo ayudan a entender lo que haces en la ola y qué puedes trabajar en el siguiente baño.'});
  }
  const offWater = items.filter(item => /surfskate|desierto|Gorée|actividades de tarde|excursiones|teoría del mar|snorkel/i.test(item) && !/noches|alojamiento/i.test(item));
  if (offWater.length) {
    const first = offWater[0];
    const title = /desierto|Gorée/i.test(first) ? 'La aventura sigue en tierra' : /teoría del mar/i.test(first) ? 'Entender el mar también cuenta' : 'También hay vida después del baño';
    const text = /snorkel/i.test(first) && optionalSnorkel([first]) ? 'El programa contempla snorkel como actividad opcional. Una alternativa para los días en los que apetece cambiar de ritmo.' : join(offWater.slice(0, 2));
    highlights.push({title, text});
  }
  if (highlights.length < 3) {
    const home = items.find(item => /noches.*(?:surfhouse|surf house|casa|hotel|alojamiento)/i.test(item));
    if (home) highlights.push({title: 'Un lugar al que volver después del surf', text: home});
  }
  return highlights.slice(0, 3);
}

export function salesPitch(trip) {
  if (trip.state !== 'confirmed') return {
    title: 'Imagínate en tu próximo viaje.',
    text: 'Estamos preparando las próximas salidas. Pregúntanos por este destino y cuéntanos qué te gustaría vivir; te orientamos sobre las opciones cuando estén definidas.',
    highlights: [],
  };
  let key = destination(trip);
  if (key === 'marruecos' && trip.levels?.length === 1 && trip.levels[0] === 3) key = 'marruecos-avanzado';
  const [title, text] = pitches[key] ?? ['Unos días para dedicarle tiempo al surf.', 'Descubre el programa, comprueba qué encaja contigo y elige cómo quieres vivir tu próximo viaje. Si tienes dudas, el equipo te ayuda a resolverlas antes de reservar.'];
  return {title, text, highlights: highlightsFor(trip)};
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
  if (destination(trip) === 'el-palmar' && /fiesta.*80|80.*90/i.test(inc.join(' ') + ' ' + story)) faqs.push([
    '¿Tengo que participar en todos los planes?',
    'Puedes vivir los ratos libres a tu ritmo. La fiesta y los planes fuera del agua son una invitación a compartir; también hay espacio para descansar, respetando los horarios del grupo.',
  ]);
  return faqs;
}

