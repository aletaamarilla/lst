// Remove labels from the original one-document-per-date import.
export function tripName(name) {
  return name.replace(/\s*·\s*(?:nivel(?:es)?\s+[\dIVX,\s–—-]+|Semana Santa(?:\s+\d{4})?|Pascua(?:\s+\d{4})?)\s*$/i, '').trim();
}

// Dates share a trip only when the level range and complete programme match.
const programmeFields = ['levelRequirement', 'intro', 'storyTitle', 'storyLabel', 'storyIntro', 'story', 'includes', 'excludes', 'inclusionsNote', 'faqs', 'levelText', 'levelChecks', 'stay', 'team'];
export const aggregateAvailability = departures => !departures.length ? 'enquiry' : departures.every(d => d.availability === 'full') ? 'full'
  : departures.some(d => d.availability === 'available') ? 'available'
  : departures.some(d => d.availability === 'last_places') ? 'last_places' : 'enquiry';

export function consolidateTrips(trips) {
  const groups = new Map();
  for (const source of trips) {
    const imported = /-\d{4}-\d{2}-\d{2}$/.test(source.slug);
    const destination = source.slug.replace(/-\d{4}-\d{2}-\d{2}$/, '');
    // Stable identity for the two existing Morocco products, including old dated URLs.
    const advanced = destination === 'marruecos' && source.levels.every(level => level >= 3);
    const slug = advanced ? 'marruecos-avanzado' : destination;
    const trip = advanced ? {...source, name: 'Marruecos avanzado', tagline: source.tagline === source.name ? 'Marruecos avanzado' : source.tagline} : source;
    const key = JSON.stringify([slug, trip.name, [...trip.levels].sort(), ...programmeFields.map(field => trip[field] ?? null)]);
    if (!groups.has(key)) groups.set(key, {slug, imported, members: []});
    groups.get(key).members.push(trip);
  }
  const candidates = [...groups.values()];
  const result = candidates.map(({slug: preferred, imported, members}) => {
    members.sort((a, b) => (a.departures[0]?.start ?? '9999').localeCompare(b.departures[0]?.start ?? '9999'));
    const first = members[0];
    // Different programmes at the same destination retain their original identities.
    const slug = candidates.filter(group => group.slug === preferred).length > 1 ? first.slug : preferred;
    if (!imported && members.length === 1 && slug === first.slug) return first;
    const departures = members.flatMap(member => member.departures.map(departure => ({...departure,
      dossier: departure.dossier || member.dossier,
      availability: departure.availability ?? member.availability,
      capacity: departure.capacity ?? member.capacity,
      payment: departure.payment ?? member.payment,
    }))).sort((a, b) => (a.start ?? '').localeCompare(b.start ?? ''));
    if (new Set(departures.map(d => d.id)).size !== departures.length) throw Error('Claves de salida duplicadas al agrupar fechas');
    const samePayment = members.every(member => JSON.stringify(member.payment) === JSON.stringify(first.payment));
    return {...first, id: slug, slug,
      state: members.some(member => member.state === 'confirmed') ? 'confirmed' : 'upcoming',
      aliases: [...new Set(members.flatMap(member => [member.slug, ...(member.aliases ?? [])]))].filter(alias => alias !== slug),
      departures, availability: aggregateAvailability(departures),
      dossier: members.length === 1 ? first.dossier : '',
      capacity: members.length === 1 ? first.capacity : {total: null, available: null},
      payment: samePayment ? first.payment : {depositAmount: null, terms: ''},
    };
  });
  const routes = result.flatMap(trip => [trip.slug, ...(trip.aliases ?? [])]);
  if (new Set(routes).size !== routes.length) throw Error('Colisión de rutas: usa una URL propia para cada programa');
  return result;
}
