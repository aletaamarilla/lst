const money = value => Number.isFinite(value) && value > 0 && Math.abs(Math.round(value * 100) - value * 100) < 1e-8;

// A tariff is selected by an editor. These ranges describe the offer, not live stock.
export function validatePromotions(value, regularPrice, capacity = null) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw Error('Las tarifas reducidas deben ser una lista');
  if (!value.length) return [];
  if (!money(regularPrice)) throw Error('Indica la tarifa general antes de añadir descuentos');
  let active = 0;
  const promotions = value.map(item => {
    if (!item || typeof item !== 'object' || typeof item.label !== 'string' || !item.label.trim() || item.label.length > 60) throw Error('Cada tarifa reducida necesita un nombre de hasta 60 caracteres');
    if (!money(item.price) || item.price >= regularPrice) throw Error('El precio reducido debe ser positivo, con hasta dos decimales e inferior a la tarifa general');
    if (item.active != null && typeof item.active !== 'boolean') throw Error('La tarifa vigente debe indicarse con una casilla');
    if (item.active) active++;
    const firstPlace = item.firstPlace ?? null;
    const lastPlace = item.lastPlace ?? null;
    if ((firstPlace === null) !== (lastPlace === null)) throw Error('Indica las plazas inicial y final del tramo, o deja ambas vacías');
    if (firstPlace !== null && (!Number.isInteger(firstPlace) || !Number.isInteger(lastPlace) || firstPlace < 1 || lastPlace < firstPlace || (capacity != null && lastPlace > capacity))) throw Error('El tramo de plazas es inválido o supera la capacidad de la salida');
    if (item.condition != null && typeof item.condition !== 'string') throw Error('La condición de la tarifa debe ser texto');
    const condition = (item.condition ?? '').trim();
    if (condition.length > 80 || (firstPlace === null && !condition)) throw Error('Sin cupo numérico, indica la condición publicada (hasta 80 caracteres)');
    return {label: item.label.trim(), price: item.price, firstPlace, lastPlace, condition, active: item.active === true};
  });
  if (active > 1) throw Error('Solo puede haber una tarifa reducida vigente por salida');
  const ranged = promotions.filter(p => p.firstPlace !== null).sort((a, b) => a.firstPlace - b.firstPlace);
  for (let i = 1; i < ranged.length; i++) {
    if (ranged[i].firstPlace <= ranged[i - 1].lastPlace) throw Error('Los tramos de plazas no pueden solaparse');
    if (ranged[i].price <= ranged[i - 1].price) throw Error('El precio debe aumentar entre tramos de plazas');
  }
  return promotions;
}

export function promotionCondition(promotion) {
  if (promotion.firstPlace === 1) return `Primeras ${promotion.lastPlace} plazas`;
  if (promotion.firstPlace != null) return `Plazas ${promotion.firstPlace}–${promotion.lastPlace}`;
  return promotion.condition;
}

export function departurePricing(departure, defaults = {}) {
  if (departure.promotions == null) return {price: departure.price ?? null};
  // regularPrice makes repeated normalization safe: never discount a discounted price.
  const regularPrice = departure.regularPrice ?? departure.price ?? null;
  const promotions = validatePromotions(departure.promotions, regularPrice, (departure.capacity ?? defaults.capacity)?.total);
  const availability = departure.availability ?? defaults.availability;
  const full = availability ? availability === 'full' : (departure.capacity ?? defaults.capacity)?.available === 0;
  const promotion = !full && (departure.state ?? defaults.state) === 'confirmed' ? promotions.find(p => p.active) ?? null : null;
  return {price: promotion?.price ?? regularPrice, regularPrice, promotions, promotion};
}
