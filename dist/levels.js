import {closeTripDates} from './home.js';
// Level guide (content generated from scripts/surf-levels.mjs): the wave picker,
// each level's steps, the quick test and the trips filtered by level.
const data=JSON.parse(document.getElementById('level-test-data').textContent);
const LEVELS=data.levels; // {1:'Iniciación',…}
const LEGACY={rookies:1,aprendices:2,riders:3,supercracks:4};
const STORE='lstLevel';
const guide=document.querySelector('.lv-guide');
const waves=[...document.querySelectorAll('[data-level-tab]')];
const panels=[...document.querySelectorAll('[data-level-panel]')];
const pickbar=document.querySelector('[data-pickbar]');
const chooseButtons=[...document.querySelectorAll('[data-choose]')];
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTo=el=>el.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
const storage={get(){try{return localStorage.getItem(STORE);}catch{return null;}},set(v){try{localStorage.setItem(STORE,v);}catch{}}};
const validCode=code=>Object.hasOwn(data.descriptions,code??'');
const levelOf=code=>Number(code.split('.')[0]);
let mine=validCode(storage.get())?storage.get():null;

// ---- Wave picker and steps -------------------------------------------------
guide.classList.add('is-enhanced');
function selectLevel(n){
 if(!(n>=1&&n<=4))return;
 panels.forEach(p=>p.hidden=Number(p.dataset.levelPanel)!==n);
 waves.forEach(w=>{if(Number(w.dataset.levelTab)===n)w.setAttribute('aria-current','true');else w.removeAttribute('aria-current');});
}
function markMine(){document.querySelectorAll('.lv-sub').forEach(d=>d.classList.toggle('is-mine',d.dataset.sub===mine));}
function openSub(code,{scroll=true}={}){
 selectLevel(levelOf(code));
 const el=document.getElementById('subnivel-'+code.replace('.','-'));
 if(!el)return;
 if(el.tagName==='DETAILS')el.open=true;
 if(scroll)scrollTo(el.closest('li')??el);
 el.querySelector('summary')?.focus({preventScroll:true});
}
function setUrl(hash,level,push=false){
 const url=new URL(location.href);
 if(level>=1&&level<=4)url.searchParams.set('nivel',String(level));else url.searchParams.delete('nivel');
 url.hash=hash;
 history[push?'pushState':'replaceState'](null,'',url);
}
waves.forEach(wave=>wave.addEventListener('click',event=>{
 if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 const n=Number(wave.dataset.levelTab);selectLevel(n);showTrips(n);setUrl('nivel-'+n,n);
 scrollTo(document.getElementById('nivel-'+n));
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
 helpEyebrow.textContent=level?`ESTÁS VIENDO EL NIVEL ${name.toUpperCase()}`:generalHelpEyebrow;
 tripsTitle.textContent=level?`Viajes para ${name}.`:'Viajes de surf por nivel.';
 tripsStatus.textContent=`${dated} ${dated===1?'viaje con fecha':'viajes con fecha'}${level?` para ${name}`:''}${pending?`, y ${pending} ${pending===1?'destino por anunciar':'destinos por anunciar'}`:''}. Revisa si la salida pide autonomía.`;
 const code=mine&&levelOf(mine)===level?mine:null;
 if(level){const url=new URL(generalEnquiry);url.searchParams.set('text',`¡Hola, LST! ${code?`He hecho el test de niveles y me sale ${name}, en el paso «${data.names[code]}» (${code})`:`Me reconozco en el nivel ${name}`} y quiero consultar qué viaje encaja conmigo. ¿Podemos revisar mi experiencia y autonomía en el agua?`);enquiry.href=url.href;}else enquiry.href=generalEnquiry;
}
filters.forEach(b=>b.addEventListener('click',()=>{const level=Number(b.dataset.guideFilter)||null;showTrips(level);if(level)selectLevel(level);setUrl('viajes-por-nivel',level,true);}));

// ---- Quick test ------------------------------------------------------------
const box=document.querySelector('[data-level-test]');
const T=data.test;
let answers=[];
const el=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const COMMUNITY='https://chat.whatsapp.com/DoqfNJPCkM337LAVePu2Eq';
function result(list){
 const no=list.indexOf(false);
 if(no===-1)return list.length===T.length?{code:'4.3',top:true}:null;
 return {code:no===0?'1.1':T[no-1][0],start:no===0};
}
function question(focus){
 const i=answers.length;
 box.replaceChildren(el(`<div class="lv-q" role="group" aria-labelledby="lv-q-text">
  <p class="lv-q-count">Pregunta ${i+1} de ${T.length}</p>
  <div class="lv-q-progress" aria-hidden="true"><span style="width:${i/T.length*100}%"></span></div>
  <p class="lv-q-text" id="lv-q-text" tabindex="-1">${esc(T[i][1])}</p>
  <div class="lv-q-answers"><button type="button" class="button" data-answer="yes">Sí</button><button type="button" class="button lv-btn-light" data-answer="no">Todavía no</button>${i?'<button type="button" class="lv-q-back" data-back>Atrás</button>':''}</div>
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
const nextOf=code=>{const i=T.findIndex(([c])=>c===code);return T[i+1]?.[0];};
function showResult(r,{chosen=false,focus=true}={}){
 const code=r.code,level=levelOf(code),next=nextOf(code),name=LEVELS[level];
 const nextText=chosen?'Lo has elegido tú. Si te ves aquí, confírmalo abajo.'
  :r.top?'Estás en lo más alto. Lo siguiente es progresar por tu cuenta o probar la competición.'
  :r.start?'Es el punto de partida: postura, remada y seguridad en el agua.'
  :`Lo siguiente: «${data.names[next]}». En tu paso tienes lo que te falta.`;
 box.replaceChildren(el(`<div class="lv-result" aria-live="polite">
  <p class="lv-result-lead">Estás en</p>
  <p class="lv-result-level" tabindex="-1">${esc(name)}</p>
  <h3>${esc(data.names[code])}</h3>
  <p class="lv-result-desc">${esc(data.descriptions[code])}</p>
  <p class="lv-result-next">${esc(nextText)}</p>
  <div class="lv-result-actions"><a class="button" href="#subnivel-${code.replace('.','-')}" data-see>Ver mi nivel</a><a class="button lv-btn-dark" href="#viajes-por-nivel" data-trips>Viajes para ${esc(name)}</a><button type="button" class="lv-q-back" data-restart>Repetir el test</button></div>
  <div class="lv-agree" data-agree><h4>¿Te ves en este nivel?</h4><p>Míralo en la guía antes de responder: qué ya haces y qué te falta.</p><div class="lv-q-answers"><button type="button" class="button" data-yes>Sí, es el mío</button><button type="button" class="button lv-btn-light" data-no>No del todo</button></div></div>
  <div class="lv-agree" data-refine hidden><h4>Vamos a afinarlo</h4><p>Repite el test o elige tu nivel directamente en la guía.</p><div class="lv-q-answers"><button type="button" class="button" data-restart>Repetir el test</button><button type="button" class="button lv-btn-light" data-choose-open>Elegir en la guía</button></div></div>
  <div class="lv-agree lv-thanks" data-thanks hidden><h4>Perfecto, ya sabes tu nivel</h4><p>Únete al grupo de WhatsApp de LST: compartimos consejos para mejorar tu surf y los próximos viajes.</p><a class="button" href="${COMMUNITY}" target="_blank" rel="noopener noreferrer">Unirme al grupo de WhatsApp</a></div>
 </div>`));
 box.querySelector('[data-see]').addEventListener('click',e=>{e.preventDefault();openSub(code);showTrips(level);setUrl(e.currentTarget.hash.slice(1),level);});
 box.querySelector('[data-trips]').addEventListener('click',e=>{e.preventDefault();selectLevel(level);showTrips(level);setUrl('viajes-por-nivel',level,true);scrollTo(document.getElementById('viajes-por-nivel'));});
 box.querySelectorAll('[data-restart]').forEach(b=>b.addEventListener('click',restart));
 box.querySelector('[data-yes]').addEventListener('click',()=>{box.querySelector('[data-agree]').hidden=true;box.querySelector('[data-thanks]').hidden=false;});
 box.querySelector('[data-no]').addEventListener('click',()=>{box.querySelector('[data-agree]').hidden=true;box.querySelector('[data-refine]').hidden=false;});
 box.querySelector('[data-choose-open]').addEventListener('click',()=>setChoosing(true));
 if(focus)box.querySelector('.lv-result-level').focus();
}
function restart(){answers=[];setChoosing(false);question(true);scrollTo(document.getElementById('test'));}
function setChoosing(on){
 pickbar.hidden=!on;chooseButtons.forEach(b=>b.hidden=!on);
 if(on){selectLevel(mine?levelOf(mine):1);scrollTo(document.getElementById('guia-niveles'));}
}
chooseButtons.forEach(b=>b.addEventListener('click',()=>{
 mine=b.dataset.choose;storage.set(mine);markMine();setChoosing(false);
 showResult({code:mine},{chosen:true});scrollTo(document.getElementById('test'));
}));

// ---- Initial state from the URL (and old #rookies-style links) ----------------
function fromUrl(){
 const hash=location.hash.slice(1),query=new URLSearchParams(location.search).get('nivel');
 const sub=/^subnivel-([1-4])-([1-3])$/.exec(hash);
 const level=/^nivel-([1-4])$/.exec(hash)?.[1]??LEGACY[hash]??(/^[1-4]$/.test(query??'')?query:LEGACY[query]);
 return {sub:sub?`${sub[1]}.${sub[2]}`:null,level:level?Number(level):null};
}
function sync(){
 const {sub,level}=fromUrl();
 if(sub){openSub(sub,{scroll:false});showTrips(levelOf(sub));return;}
 selectLevel(level??(mine?levelOf(mine):1));showTrips(level);
 if(LEGACY[location.hash.slice(1)])setUrl('nivel-'+level,level);
}
// Hidden panels change the layout, so land on the requested level or step once they are set.
function arrive(){
 const target=document.getElementById(location.hash.slice(1));
 if(target&&(target.closest('.lv-guide')||target.id==='viajes-por-nivel'))(target.closest('li')??target).scrollIntoView({block:'start',behavior:'instant'});
}
markMine();
if(mine)showResult({code:mine},{focus:false});else question(false);
sync();
if(document.readyState==='complete')arrive();else addEventListener('load',arrive,{once:true});
addEventListener('hashchange',sync);
addEventListener('popstate',sync);
