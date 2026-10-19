// A visitor chooses which level to explore; this never evaluates their surfing.
const names={rookies:['1','I','Rookies'],aprendices:['2','II','Aprendices'],riders:['3','III','Riders'],supercracks:['4','IV','Supercracks']};
const cards=[...document.querySelectorAll('.guide-level')];
const indexLinks=[...document.querySelectorAll('.guide-index a')];
const trips=[...document.querySelectorAll('[data-trip-levels]')];
const filters=[...document.querySelectorAll('[data-guide-filter]')];
const tripSection=document.querySelector('#viajes-por-nivel');
const title=document.querySelector('#guide-trips-title');
const status=document.querySelector('#guide-trips-status');
const enquiry=document.querySelector('[data-guide-enquiry]');
const generalEnquiry=enquiry.href;
const helpEyebrow=document.querySelector('.guide-help .eyebrow');
const generalHelpEyebrow=helpEyebrow.textContent;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
document.documentElement.classList.add('guide-enhanced');
document.querySelector('.guide-trip-filters').hidden=false;
function selectedFromUrl(){
 const slug=location.hash.slice(1);
 if(Object.hasOwn(names,slug))return slug;
 const query=new URLSearchParams(location.search).get('nivel');
 return Object.hasOwn(names,query)?query:null;
}
function showLevel(slug){
 const level=names[slug];
 indexLinks.forEach(link=>{
  if(link.hash==='#'+slug)link.setAttribute('aria-current','location');
  else link.removeAttribute('aria-current');
 });
 filters.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.guideFilter===(slug??''))));
 trips.forEach(trip=>trip.hidden=!!level&&!trip.dataset.tripLevels.split(' ').includes(level[0]));
 document.querySelectorAll('[data-trip-group]').forEach(group=>group.hidden=![...group.querySelectorAll('[data-trip-levels]')].some(trip=>!trip.hidden));
 const count=trips.filter(trip=>!trip.hidden).length;
 const countState=state=>trips.filter(trip=>!trip.hidden&&trip.closest('[data-trip-state]')?.dataset.tripState===state).length;
 const dated=countState('confirmed'),pending=countState('upcoming');
 const pendingCount=document.querySelector('[data-guide-pending-count]');
 if(pendingCount)pendingCount.textContent=String(pending);
 helpEyebrow.textContent=level?`ESTÁS EXPLORANDO ${level[1]} · ${level[2].toUpperCase()}`:generalHelpEyebrow;
 document.querySelector('.guide-trips-empty').hidden=count!==0;
 title.textContent=level?`Viajes para ${level[2]}.`:'Viajes de surf por nivel.';
 status.textContent=`${dated} ${dated===1?'viaje con fecha':'viajes con fecha'}${level?` para ${level[2]}`:''} · ${pending} ${pending===1?'destino por anunciar':'destinos por anunciar'}. Revisa si la salida pide autonomía.`;
 if(level){const url=new URL(generalEnquiry);url.searchParams.set('text',`¡Hola, LST! Me reconozco en el nivel ${level[1]} (${level[2]}) y quiero consultar qué viaje encaja conmigo. ¿Podemos revisar mi experiencia y autonomía en el agua?`);enquiry.href=url.href;}else enquiry.href=generalEnquiry;
}
function updateUrl(slug,hash){
 clearFlash();
 const url=new URL(location.href);
 if(slug)url.searchParams.set('nivel',slug);else url.searchParams.delete('nivel');
 url.hash=hash;
 history.pushState(null,'',url);
 showLevel(slug);
}
let arrivalFrame,highlightTimer;
function clearFlash(){
 cancelAnimationFrame(arrivalFrame);
 clearTimeout(highlightTimer);
 cards.forEach(card=>card.classList.remove('is-arriving'));
}
function flash(card){
 clearFlash();
 const started=performance.now();
 // Start the brief cue at the destination, after the native anchor scroll.
 const arrive=()=>{
  const top=card.getBoundingClientRect().top;
  const offset=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;
  if(Math.abs(top-offset)>3){
   if(performance.now()-started<2000)arrivalFrame=requestAnimationFrame(arrive);
   return;
  }
  card.classList.add('is-arriving');
  highlightTimer=setTimeout(()=>card.classList.remove('is-arriving'),1100);
 };
 arrivalFrame=requestAnimationFrame(arrive);
}
indexLinks.forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const slug=link.hash.slice(1);showLevel(slug);flash(document.getElementById(slug));
}));
function sync(){
 const slug=selectedFromUrl();showLevel(slug);
 // Keep the chosen context when a subsequent anchor opens travel options/help.
 if(Object.hasOwn(names,location.hash.slice(1))){const url=new URL(location.href);url.searchParams.set('nivel',slug);history.replaceState(null,'',url);}
}
window.addEventListener('hashchange',sync);
window.addEventListener('popstate',sync);
document.querySelectorAll('[data-guide-choice]').forEach(link=>link.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();updateUrl(link.dataset.guideChoice,'viajes-por-nivel');
 tripSection.scrollIntoView({block:'start',behavior:reducedMotion.matches?'instant':'smooth'});
 tripSection.focus({preventScroll:true});
}));
filters.forEach(button=>button.addEventListener('click',()=>updateUrl(button.dataset.guideFilter||null,'viajes-por-nivel')));
sync();
