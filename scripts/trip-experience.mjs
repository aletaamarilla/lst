const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={wave:'M3 17c4 0 4-7 9-7 4 0 5 5 9 5M3 22c4 0 5-3 9-3s5 3 9 3M13 10c-2-5 4-8 7-4-3-1-4 2-3 4',bed:'M3 21V8m0 9h23v4M3 13h23v8M7 13V8h15v5M7 8V5h15v3',sun:'M15 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM15 2v3m0 20v3M2 15h3m20 0h3M6 6l2 2m14 14 2 2M6 24l2-2M22 8l2-2',arrow:'M5 24 24 5M5 5h19v19'};
export const tripIcon=(kind,cls='')=>`<svg class="trip-sketch ${cls}" aria-hidden="true" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[kind]??paths.wave}"/></svg>`;
export function groupedInclusions(items){
 const groups=[{name:'Cama & mesa',icon:'bed',items:[]},{name:'Surf & movimiento',icon:'wave',items:[]},{name:'El resto del plan',icon:'sun',items:[]}];
 for(const item of items??[]){const group=/noches|pensión|desayuno|comida|cena|alojamiento/i.test(item)?0:/surf|coaching|videoanálisis|videocorrecciones|Animal Flow|estiramientos|material/i.test(item)?1:2;groups[group].items.push(item);}
 return groups.filter(g=>g.items.length).map(g=>`<div class="inclusion-group">${tripIcon(g.icon)}<h4>${g.name}</h4><ul>${g.items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></div>`).join('');
}
