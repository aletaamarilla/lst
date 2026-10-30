import {departuresFor, levelLabel} from './trip-model.mjs';
const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const moods={
 'el-palmar':['La oficina puede esperar.','Sal del piloto automático. Aquí se viene a mojarse, compartir y volver con algo más que fotos.'],
 fuerteventura:['El invierno, que espere.','Pon el móvil en modo isla. Lo demás empieza con los pies en la arena.'],
 hossegor:['Menos excusas. Más surf.','Trae tu surf. Las ganas de mirarlo de cerca las ponemos entre todos.'],
 maldivas:['Mucho azul. Pocas excusas.','Cambia el fondo de pantalla por el de verdad. La rutina se queda en tierra.'],
 marruecos:['Salitre. Y otra ronda.','Una semana para encontrar tu ritmo entre olas, mercados y vida en grupo.'],
 'marruecos-avanzado':['Tu surf pide otra ronda.','Coaching, olas y tiempo para pulir tu surf. Trae autonomía en el agua y ganas de seguir aprendiendo.'],
 senegal:['Esto no cabe en un story.','Hay vida más allá del pico. Y viajes que te sacan del guion.'],
};
export const tripMood=trip=>trip.state==='confirmed'?(moods[trip.slug]??['Deja sitio para el salitre.','Tu siguiente historia empieza lejos del piloto automático.']):['La próxima ola está por llegar.','Las fechas y el programa están pendientes. Puedes preguntar al equipo por este destino.'];
const paths={wave:'M3 17c4 0 4-7 9-7 4 0 5 5 9 5M3 22c4 0 5-3 9-3s5 3 9 3M13 10c-2-5 4-8 7-4-3-1-4 2-3 4',bed:'M3 21V8m0 9h23v4M3 13h23v8M7 13V8h15v5M7 8V5h15v3',sun:'M15 9a6 6 0 1 0 0 12 6 6 0 0 0 0-12ZM15 2v3m0 20v3M2 15h3m20 0h3M6 6l2 2m14 14 2 2M6 24l2-2M22 8l2-2',arrow:'M5 24 24 5M5 5h19v19'};
export const tripIcon=(kind,cls='')=>`<svg class="trip-sketch ${cls}" aria-hidden="true" viewBox="0 0 30 30" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[kind]??paths.wave}"/></svg>`;
export function renderQuickFacts(trip){
 const dates=departuresFor(trip),durations=[...new Set(dates.map(d=>d.duration))];
 const duration=durations.length===1?durations[0]:dates.length?'Según la salida':'Por confirmar';
 const match=/^(\d+)\s+(.+)$/.exec(duration);
 const label=levelLabel(trip),level=label==='Todos los niveles'?'I–IV':label.replace(/^Niveles? /,'');
 const capacities=dates.map(d=>d.capacity?.total??null);
 const uniqueCapacities=[...new Set(capacities)];
 const group=uniqueCapacities.length===1&&uniqueCapacities[0]!=null?uniqueCapacities[0]:null;
 const mixedCapacity=capacities.some(n=>n!=null)&&group===null;
 return `<dl class="trip-quick-facts"><div><dt>El tiempo fuera</dt><dd><strong>${escape(match?.[1]??duration)}</strong>${match?`<span>${escape(match[2])}</span>`:''}</dd></div><div><dt>Tu nivel</dt><dd><strong>${escape(level)}</strong><span>${label==='Todos los niveles'?'todos los niveles':'nivel de surf'}</span></dd></div>${group!=null?`<div><dt>El grupo</dt><dd><strong>${escape(group)}<small> máx.</small></strong><span>personas por salida</span></dd></div>`:mixedCapacity?`<div><dt>El grupo</dt><dd><strong>Según la salida</strong><span>capacidad del grupo</span></dd></div>`:dates.length>1?`<div><dt>Tu fecha</dt><dd><strong>${dates.length}</strong><span>salidas para elegir</span></dd></div>`:''}</dl>`;
}
export function experienceScenes(trip){
 if(trip.state!=='confirmed')return '';
 const includes=trip.includes??[];
 const surf=includes.filter(s=>/clases|coaching|surf guiding|surf en barco|surf todos|videoanálisis|videocorrecciones/i.test(s)).slice(0,2);
 const off=includes.filter(s=>/surfskate|fiesta|actividades de tarde|desierto|excursiones|Gorée|Almadies|teoría del mar|Animal Flow|actividades de grupo/i.test(s)&&!/noches|alojamiento/i.test(s)).sort((a,b)=>Number(/Animal Flow/i.test(a))-Number(/Animal Flow/i.test(b))).slice(0,2);
 const base=includes.filter(s=>/noches|pensión|desayuno|comidas|cenas|alojamiento/i.test(s)).slice(0,2);
 if(!surf.length&&!off.length&&!base.length)return '';
 const photos=trip.gallery??[];
 const surfIndex=photos.findIndex(([,alt])=>/surfista|olas?|surfistas|explicación de surf/i.test(alt));
 const offMatch=off.some(s=>/surfskate/i.test(s))?/surfskate/i:off.some(s=>/desierto/i.test(s))?/campamento|dunas/i:/grupo|mercado|dunas/i;
 let offIndex=photos.findIndex(([,alt],i)=>i!==surfIndex&&offMatch.test(alt));
 if(offIndex<0)offIndex=photos.findIndex(([,alt],i)=>i!==surfIndex&&/grupo|campamento|mercado|dunas/i.test(alt));
 const photo=(index,kind)=>index>=0?`<figure class="scene-photo"><button class="gallery-photo" type="button" data-photo="${index}" aria-label="Ampliar foto: ${escape(photos[index][1])}"><img src="${escape(photos[index][0])}" alt="${escape(photos[index][1])}" width="1000" height="600" loading="lazy" decoding="async"><span aria-hidden="true">+</span></button><figcaption>${escape(photos[index][2])}</figcaption></figure>`:`<div class="scene-graphic" aria-hidden="true">${tripIcon(kind)}<span>${kind==='wave'?'SAL / AGUA / REPETIR':'FUERA DE LA RUTINA'}</span></div>`;
 const list=items=>`<ul>${items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul>`;
 return `<section class="trip-experience" aria-labelledby="experience-title"><div class="experience-heading"><p class="eyebrow">ESTO ES LO QUE HAY</p><h2 id="experience-title">Al agua.<br><em>Y al lío.</em></h2><span class="trip-stamp" aria-hidden="true">SALITRE<br>EN LAS VENAS</span></div><div class="experience-scenes">${surf.length?`<article class="experience-scene scene-surf">${photo(surfIndex,'wave')}<div class="scene-copy"><span class="scene-index">01 / AL AGUA</span><h3>Que hable<br>tu surf.</h3>${list(surf)}</div></article>`:''}${off.length?`<article class="experience-scene scene-off">${photo(offIndex,'sun')}<div class="scene-copy"><span class="scene-index">02 / CUANDO SALES</span><h3>La última ola<br>no cierra el día.</h3>${list(off)}</div></article>`:''}${base.length?`<article class="scene-base"><div class="base-mark" aria-hidden="true">${tripIcon('bed')}</div><div><span class="scene-index">LA BASE DE OPERACIONES</span><h3>Comer. Dormir.<br>Volver a liarla.</h3></div>${list(base)}</article>`:''}</div></section>`;
}
export function groupedInclusions(items){
 const groups=[{name:'Cama & mesa',icon:'bed',items:[]},{name:'Surf & movimiento',icon:'wave',items:[]},{name:'El resto del plan',icon:'sun',items:[]}];
 for(const item of items??[]){const group=/noches|pensión|desayuno|comida|cena|alojamiento/i.test(item)?0:/surf|coaching|videoanálisis|videocorrecciones|Animal Flow|estiramientos|material/i.test(item)?1:2;groups[group].items.push(item);}
 return groups.filter(g=>g.items.length).map(g=>`<div class="inclusion-group">${tripIcon(g.icon)}<h4>${g.name}</h4><ul>${g.items.map(item=>`<li>${escape(item)}</li>`).join('')}</ul></div>`).join('');
}
