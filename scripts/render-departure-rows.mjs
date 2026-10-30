import {departuresFor} from './trip-model.mjs';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderDepartureRows(trip, className='') {
  return `<ul class="${className ? className+' ' : ''}departure-rows">${departuresFor(trip).map(d=>`<li class="departure-row"><span class="departure-row-date">${escape(d.date)}</span></li>`).join('')}</ul>`;
}
