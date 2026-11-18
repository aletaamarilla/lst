import {closeTripDates} from './home.js';
// Level guide (content generated from scripts/surf-levels.mjs): level tabs,
// sublevel ladder, the quick test and the trips filtered by level.
const data=JSON.parse(document.getElementById('level-test-data').textContent);
const LEVELS=data.levels; // {1:'Iniciación',…}
const LEGACY={rookies:1,aprendices:2,riders:3,supercracks:4};
const STORE='lstLevel';
const guide=document.querySelector('.lv-guide');
const tabs=[...document.querySelectorAll('[data-level-tab]')];
const panels=[...document.querySelectorAll('[data-level-panel]')];
const steps=[...document.querySelectorAll('[data-step]')];
const pickbar=document.querySelector('[data-pickbar]');
const chooseButtons=[...document.querySelectorAll('[data-choose]')];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTo=el=>el.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
const storage={get(){try{return localStorage.getItem(STORE);}catch{return null;}},set(v){try{localStorage.setItem(STORE,v);}catch{}}};
const validCode=code=>Object.hasOwn(data.names,code??'');
let current=1,mine=validCode(storage.get())?storage.get():null,choosing=false;

// ---- Levels and sublevels -------------------------------------------------
guide.classList.add('is-enhanced');
function selectLevel(n){
 current=n;
 panels.forEach(p=>p.hidden=Number(p.dataset.levelPanel)!==n);
 tabs.forEach(t=>{if(Number(t.dataset.levelTab)===n)t.setAttribute('aria-current','true');else t.removeAttribute('aria-current');});
 steps.forEach(s=>s.classList.toggle('is-current',Number(s.dataset.stepLevel)===n));
}
function markMine(){
 steps.forEach(s=>{s.classList.toggle('is-mine',s.dataset.step===mine);if(s.dataset.step===mine)s.setAttribute('aria-label',`${s.dataset.step}, tu nivel`);else s.removeAttribute('aria-label');});
 document.querySelectorAll('.lv-sub').forEach(d=>d.classList.toggle('is-mine',d.dataset.sub===mine));
}
function openSub(code,{scroll=true}={}){
 const n=Number(code.split('.')[0]);selectLevel(n);
 const el=document.getElementById('subnivel-'+code.replace('.','-'));
 if(!el)return;
 if(el.tagName==='DETAILS')el.open=true;
 if(scroll)scrollTo(el);
 el.querySelector('summary')?.focus({preventScroll:true});
}
function setUrl(hash,level,push=false){
 const url=new URL(location.href);
 if(level&&level<=4)url.searchParams.set('nivel',String(level));else url.searchParams.delete('nivel');
 url.hash=hash;
 history[push?'pushState':'replaceState'](null,'',url);
}
tabs.forEach(tab=>tab.addEventListener('click',event=>{
 event.preventDefault();
 const n=Number(tab.dataset.levelTab);selectLevel(n);showTrips(n<=4?n:null);setUrl('nivel-'+n,n);
 scrollTo(document.getElementById('nivel-'+n));
}));
steps.forEach(step=>step.addEventListener('click',event=>{
 event.preventDefault();
 const code=step.dataset.step,n=Number(step.dataset.stepLevel);openSub(code);showTrips(n<=4?n:null);setUrl(step.hash.slice(1),n);
}));
// Ticking every «Ya hace» item suggests checking the next sublevel.
document.querySelectorAll('.lv-sub').forEach(sub=>sub.addEventListener('change',()=>{
 const boxes=[...sub.querySelectorAll('[data-can]')];
 sub.querySelector('[data-can-hint]').hidden=!boxes.every(b=>b.checked);
}));

// ---- Trips by level --------------------------------------------------------
const trips=[...document.querySelectorAll('[data-trip-levels]')];
const filters=[...document.querySelectorAll('[data-guide-filter]')];
const tripsTitle=document.querySelector('#guide-trips-title');
const tripsStatus=document.querySelector('#guide-trips-status');
const enquiry=document.querySelector('[data-guide-enquiry]');
const generalEnquiry=enquiry.href;
const helpEyebrow=document.querySelector('.guide-help .eyebrow');
const generalHelpEyebrow=helpEyebrow.textContent;
document.querySelector('.guide-trip-filters').hidden=false;
function showTrips(level){
 const name=level?LEVELS[level]:null;
 filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.guideFilter===(level?String(level):''))));
 trips.forEach(trip=>{trip.hidden=!!level&&!trip.dataset.tripLevels.split(' ').includes(String(level));if(trip.hidden)closeTripDates(trip);});
 document.querySelectorAll('[data-trip-group]').forEach(g=>g.hidden=![...g.querySelectorAll('[data-trip-levels]')].some(t=>!t.hidden));
 const count=state=>trips.filter(t=>!t.hidden&&t.closest('[data-trip-state]')?.dataset.tripState===state).length;
 const dated=count('confirmed'),pending=count('upcoming');
 const pendingCount=document.querySelector('[data-guide-pending-count]');if(pendingCount)pendingCount.textContent=String(pending);
 document.querySelector('.guide-trips-empty').hidden=dated+pending!==0;
 helpEyebrow.textContent=level?`ESTÁS EXPLORANDO EL NIVEL ${level} · ${name.toUpperCase()}`:generalHelpEyebrow;
 tripsTitle.textContent=level?`Viajes para nivel ${level} · ${name}.`:'Viajes de surf por nivel.';
 tripsStatus.textContent=`${dated} ${dated===1?'viaje con fecha':'viajes con fecha'}${level?` para el nivel ${level}`:''}${pending?` · ${pending} ${pending===1?'destino por anunciar':'destinos por anunciar'}`:''}. Revisa si la salida pide autonomía.`;
 const code=mine&&Number(mine.split('.')[0])===level?mine:null;
 if(level){const url=new URL(generalEnquiry);url.searchParams.set('text',`¡Hola, LST! ${code?`He hecho el test de niveles y me sale el ${code} (${data.names[code]})`:`Me reconozco en el nivel ${level} (${name})`} y quiero consultar qué viaje encaja conmigo. ¿Podemos revisar mi experiencia y autonomía en el agua?`);enquiry.href=url.href;}else enquiry.href=generalEnquiry;
}
filters.forEach(b=>b.addEventListener('click',()=>{const level=Number(b.dataset.guideFilter)||null;showTrips(level);if(level)selectLevel(level);setUrl('viajes-por-nivel',level,true);}));

// ---- Quick test ------------------------------------------------------------
const box=document.querySelector('[data-level-test]');
const T=data.test;
let answers=[];
const el=(html)=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const COMMUNITY='https://chat.whatsapp.com/DoqfNJPCkM337LAVePu2Eq';
function result(list){
 const no=list.indexOf(false);
 if(no===-1)return list.length===T.length?{code:'4.3',top:true}:null;
 return {code:no===0?'1.1':T[no-1][0],start:no===0};
}
function render(view){box.replaceChildren(view);}
function question(focus){
 const i=answers.length;
 render(el(`<div class="lv-q" role="group" aria-labelledby="lv-q-text">
  <p class="lv-q-count">Pregunta ${i+1} de ${T.length}</p>
  <div class="lv-q-progress" aria-hidden="true"><span style="width:${i/T.length*100}%"></span></div>
  <p class="lv-q-text" id="lv-q-text" tabindex="-1">${esc(T[i][1])}</p>
  <div class="lv-q-answers"><button type="button" class="button" data-answer="yes">Sí</button><button type="button" class="button lv-btn-light" data-answer="no">Todavía no</button>${i?'<button type="button" class="lv-q-back" data-back>← Atrás</button>':''}</div>
 </div>`));
 box.querySelector('[data-answer="yes"]').addEventListener('click',()=>answer(true));
 box.querySelector('[data-answer="no"]').addEventListener('click',()=>answer(false));
 box.querySelector('[data-back]')?.addEventListener('click',()=>{answers.pop();question(true);});
 if(focus)box.querySelector('#lv-q-text').focus();
}
function answer(yes){
 answers.push(yes);
 const r=result(answers);
 if(r){mine=r.code;storage.set(mine);markMine();showResult(r);}else question(true);
}
function nextOf(code){const i=T.findIndex(([c])=>c===code);return T[i+1]?.[0];}
function showResult(r,{chosen=false,focus=true}={}){
 const code=r.code,level=Number(code.split('.')[0]),next=nextOf(code);
 const text=chosen?'Has elegido este nivel. Si te ves en él, confírmalo abajo.'
  :r.top?'Estás en la cima técnica. Siguiente paso: progresión libre o la ruta de competición.'
  :r.start?'Estás empezando: el 1.1 es tu punto de partida. Lo importante ahora es la postura, la remada y la seguridad.'
  :`Tu siguiente paso es el ${next} · ${data.names[next]}. Mira en tu subnivel qué te falta en «Todavía no».`;
 render(el(`<div class="lv-result" aria-live="polite">
  <p class="eyebrow">TU NIVEL</p>
  <p class="lv-result-code" tabindex="-1">${code}</p>
  <h3>${esc(data.names[code])}</h3>
  <p class="lv-result-level">Nivel ${level} · ${esc(LEVELS[level])}</p>
  <p>${esc(text)}</p>
  <div class="lv-result-actions"><a class="button" href="#subnivel-${code.replace('.','-')}" data-see>Ver mi nivel en detalle</a><a class="button lv-btn-dark" href="#viajes-por-nivel" data-trips>Viajes para nivel ${level}</a><button type="button" class="lv-q-back" data-restart>Repetir el test</button></div>
  <div class="lv-agree" data-agree><h4>¿Estás de acuerdo con tu nivel?</h4><p>Revisa lo que pone en «Ya hace» y «Todavía no» de tu subnivel antes de responder.</p><div class="lv-q-answers"><button type="button" class="button" data-yes>Sí</button><button type="button" class="button lv-btn-light" data-no>No</button></div></div>
  <div class="lv-agree" data-refine hidden><h4>Vamos a afinarlo</h4><p>Puedes repetir el test o revisar los niveles y elegir el que de verdad te describe.</p><div class="lv-q-answers"><button type="button" class="button" data-restart>Repetir el test</button><button type="button" class="button lv-btn-light" data-choose-open>Elegir mi nivel</button></div></div>
  <div class="lv-agree lv-thanks" data-thanks hidden><h4>¡Hecho! Tu nivel es el ${code} · ${esc(data.names[code])}</h4><p>Únete a la comunidad de Let’s Surf Together en WhatsApp: compartimos tips para mejorar tu surf e información de los próximos viajes.</p><a class="button" href="${COMMUNITY}" target="_blank" rel="noopener noreferrer">Unirme al grupo de WhatsApp</a></div>
 </div>`));
 box.querySelector('[data-see]').addEventListener('click',e=>{e.preventDefault();openSub(code);showTrips(level);setUrl(e.currentTarget.hash.slice(1),level);});
 box.querySelector('[data-trips]').addEventListener('click',e=>{e.preventDefault();selectLevel(level);showTrips(level);setUrl('viajes-por-nivel',level,true);scrollTo(document.getElementById('viajes-por-nivel'));});
 box.querySelectorAll('[data-restart]').forEach(b=>b.addEventListener('click',restart));
 box.querySelector('[data-yes]').addEventListener('click',()=>{box.querySelector('[data-agree]').hidden=true;box.querySelector('[data-thanks]').hidden=false;});
 box.querySelector('[data-no]').addEventListener('click',()=>{box.querySelector('[data-agree]').hidden=true;box.querySelector('[data-refine]').hidden=false;});
 box.querySelector('[data-choose-open]').addEventListener('click',()=>setChoosing(true));
 if(focus)box.querySelector('.lv-result-code').focus();
}
function restart(){answers=[];setChoosing(false);question(true);scrollTo(document.getElementById('test'));}
function setChoosing(on){
 choosing=on;pickbar.hidden=!on;chooseButtons.forEach(b=>b.hidden=!on);
 if(on){const level=mine?Number(mine.split('.')[0]):1;selectLevel(level);scrollTo(document.getElementById('guia-niveles'));pickbar.focus?.();}
}
chooseButtons.forEach(b=>b.addEventListener('click',()=>{
 mine=b.dataset.choose;storage.set(mine);markMine();setChoosing(false);
 showResult({code:mine},{chosen:true});scrollTo(document.getElementById('test'));
}));

// ---- Initial state from the URL (and old #rookies-style links) ----------------
function fromUrl(){
 const hash=location.hash.slice(1),query=new URLSearchParams(location.search).get('nivel');
 const sub=/^subnivel-([1-5])-([1-3])$/.exec(hash);
 const level=/^nivel-([1-5])$/.exec(hash)?.[1]??LEGACY[hash]??(/^[1-4]$/.test(query??'')?query:LEGACY[query]);
 return {sub:sub?`${sub[1]}.${sub[2]}`:null,level:level?Number(level):null};
}
function sync(){
 const {sub,level}=fromUrl();
 if(sub){openSub(sub,{scroll:false});const n=Number(sub[0]);showTrips(n<=4?n:null);return;}
 const n=level??(mine?Number(mine.split('.')[0]):1);
 selectLevel(n);showTrips(level&&level<=4?level:null);
 if(LEGACY[location.hash.slice(1)]){setUrl('nivel-'+level,level);document.getElementById('nivel-'+level).scrollIntoView();}
}
markMine();
if(mine)showResult({code:mine},{focus:false});else question(false);
sync();
addEventListener('hashchange',sync);
addEventListener('popstate',sync);
