// Native details remain usable without JavaScript. Enhancement adds hover and
// explicit pinning on the date control; the card link opens the trip page.
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const records = [...document.querySelectorAll('[data-home-dates]')].map(details => {
  const card = details.closest('.home-trip');
  const media = card;
  const summary = details.querySelector('summary');
  let pinned = false;
  let suppressed = false;
  const record = {card, details, summary, close() {pinned = false; suppressed = media.matches(':hover'); details.open = false;}};
  summary.addEventListener('click', event => {
    event.preventDefault();
    const next = !pinned;
    records.forEach(other => {if (other !== record) other.close();});
    pinned = next;
    suppressed = !next;
    details.open = next;
  });
  media.addEventListener('pointerenter', () => {
    if (!finePointer.matches || suppressed || pinned || records.some(other => other !== record && other.details.open && other.summary.matches(':focus-visible'))) return;
    records.forEach(other => {if (other !== record) other.close();});
    details.open = true;
  });
  media.addEventListener('pointerleave', () => {
    suppressed = false;
    if (!pinned && !details.contains(document.activeElement)) details.open = false;
  });
  card.addEventListener('focusout', event => {
    if (!pinned && !card.contains(event.relatedTarget)) details.open = false;
  });
  return record;
});
document.addEventListener('click', event => {
  records.forEach(record => {if (!record.card.contains(event.target)) record.close();});
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  records.forEach(record => {
    if (!record.details.open) return;
    const restoreFocus = record.details.contains(document.activeElement);
    record.close();
    if (restoreFocus) record.summary.focus({preventScroll: true});
  });
});
document.querySelectorAll('.home-more-trips').forEach(collection => {
  collection.addEventListener('toggle', () => {
    if (!collection.open) records.forEach(record => {if (collection.contains(record.card)) record.close();});
  });
});

// Filtering a collection closes its date controls and clears pinned state.
export function closeTripDates(container) {
  records.forEach(record => { if (container.contains(record.card)) record.close(); });
}
