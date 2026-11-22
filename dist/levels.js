// Level guide (content generated from scripts/surf-levels.mjs): one chapter per
// level with its trips, and the quick test, whose result lists the trips for you.
const data=JSON.parse(document.getElementById('level-test-data').textContent);
const LEVELS=data.levels; // {1:'Iniciación',…}
const LEGACY={rookies:1,aprendices:2,riders:3,supercracks:4};
const STORE='lstLevel';
const index=[...document.querySelectorAll('[data-level-tab]')];
const pickbar=document.querySelector('[data-pickbar]');
const chooseButtons=[...document.querySelectorAll('[data-choose]')];
const enquiry=document.querySelector('[data-guide-enquiry]');
const generalEnquiry=enquiry.href;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scrollTo=el=>el.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
const storage={get(){try{return localStorage.getItem(STORE);}catch{return null;}},set(v){try{localStorage.setItem(STORE,v);}catch{}}};
const validCode=code=>Object.hasOwn(data.descriptions,code??'');
const levelOf=code=>Number(code.split('.')[0]);
let mine=validCode(storage.get())?storage.get():null;

// ---- Chapters and steps ----------------------------------------------------
function selectLevel(n){
 index.forEach(a=>{if(Number(a.dataset.levelTab)===n)a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
}
// The help link to WhatsApp mentions the visitor's level once they know it.
function markMine(){
 document.querySelectorAll('.lv-sub').forEach(d=>d.classList.toggle('is-mine',d.dataset.sub===mine));
 if(!mine){enquiry.href=generalEnquiry;return;}
 const url=new URL(generalEnquiry);
 url.searchParams.set('text',`¡Hola, LST! He hecho el test de niveles y me sale ${LEVELS[levelOf(mine)]}, en el paso «${data.names[mine]}» (${mine}). ¿Qué viaje encaja conmigo? ¿Podemos revisar mi experiencia y autonomía en el agua?`);
 enquiry.href=url.href;
}
function openSub(code,{scroll=true}={}){
 selectLevel(levelOf(code));
 const el=document.getElementById('subnivel-'+code.replace('.','-'));
 if(!el)return;
 if(el.tagName==='DETAILS')el.open=true;
 if(scroll)scrollTo(el.closest('li')??el);
 el.querySelector('summary')?.focus({preventScroll:true});
}
index.forEach(a=>a.addEventListener('click',()=>selectLevel(Number(a.dataset.levelTab))));

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
 // Only a result reached by answering is announced to the measurement script, never a level picked by hand or restored.
 if(r){mine=r.code;storage.set(mine);markMine();document.dispatchEvent(new CustomEvent('lst:level-test',{detail:{level:levelOf(mine)}}));showResult(r);}else question(true);
}
const nextOf=code=>{const i=T.findIndex(([c])=>c===code);return T[i+1]?.[0];};
// The chapter already lists its trips; the result shows the first three of them.
function tripsFor(level){
 const list=document.querySelector(`[data-level-trips="${level}"] .lv-trip-list`);
 if(!list)return '<p>Ahora mismo no hay salidas para tu nivel. Escríbenos y te avisamos de las próximas.</p>';
 const copy=list.cloneNode(true);
 [...copy.children].slice(3).forEach(li=>li.remove());
 return copy.outerHTML;
}
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
  <div class="lv-result-actions"><a class="button" href="#subnivel-${code.replace('.','-')}" data-see>Ver mi nivel</a><button type="button" class="lv-q-back" data-restart>Repetir el test</button></div>
  <div class="lv-result-trips" data-result-trips><h4>Viajes para ${esc(name)}</h4>${tripsFor(level)}<a href="/viajes/?nivel=${level}">Ver todos en el catálogo</a></div>
  <div class="lv-agree" data-agree><h4>¿Te ves en este nivel?</h4><p>Míralo en la guía antes de responder: qué ya haces y qué te falta.</p><div class="lv-q-answers"><button type="button" class="button" data-yes>Sí, es el mío</button><button type="button" class="button lv-btn-light" data-no>No del todo</button></div></div>
  <div class="lv-agree" data-refine hidden><h4>Vamos a afinarlo</h4><p>Repite el test o elige tu nivel directamente en la guía.</p><div class="lv-q-answers"><button type="button" class="button" data-restart>Repetir el test</button><button type="button" class="button lv-btn-light" data-choose-open>Elegir en la guía</button></div></div>
  <div class="lv-agree lv-thanks" data-thanks hidden><h4>Perfecto, ya sabes tu nivel</h4><p>Únete al grupo de WhatsApp de LST: compartimos consejos para mejorar tu surf y los próximos viajes.</p><a class="button" href="${COMMUNITY}" target="_blank" rel="noopener noreferrer">Unirme al grupo de WhatsApp</a></div>
 </div>`));
 box.querySelector('[data-see]').addEventListener('click',e=>{e.preventDefault();openSub(code);history.replaceState(null,'',e.currentTarget.hash);});
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
 if(sub){openSub(sub,{scroll:false});return;}
 selectLevel(level??(mine?levelOf(mine):1));
 // Old links (#riders, ?nivel=riders) and trip-filter links land on the level's chapter.
 const hash=location.hash.slice(1);
 if(level&&(LEGACY[hash]||!hash||hash==='viajes-por-nivel')){const url=new URL(location.href);url.searchParams.delete('nivel');url.hash='nivel-'+level;history.replaceState(null,'',url);}
}
// The test and opened steps change the layout, so land on the requested level or step once loaded.
function arrive(){
 const target=document.getElementById(location.hash.slice(1));
 if(target&&target.closest('.lv-intro,.lv-chapters,.lv-comp'))(target.closest('li')??target).scrollIntoView({block:'start',behavior:'instant'});
}
markMine();
if(mine)showResult({code:mine},{focus:false});else question(false);
sync();
if(document.readyState==='complete')arrive();else addEventListener('load',arrive,{once:true});
addEventListener('hashchange',()=>{sync();arrive();});

// ---- Barra de niveles (fija al bajar por los capítulos) ---------------------
// Marca el nivel que se está leyendo, para saber siempre dónde estás.
const jumps=[...document.querySelectorAll('[data-level-jump]')];
const chapters=[...document.querySelectorAll('.lv-chapter')];
if(jumps.length&&chapters.length&&'IntersectionObserver' in window){
 const mark=n=>jumps.forEach(a=>{if(a.dataset.levelJump===String(n))a.setAttribute('aria-current','true');else a.removeAttribute('aria-current');});
 const seen=new Map();
 const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>seen.set(e.target,e.isIntersecting));
  const current=chapters.find(c=>seen.get(c));
  if(current)mark(current.id.replace('nivel-',''));
 },{rootMargin:'-45% 0px -50% 0px'});
 chapters.forEach(c=>io.observe(c));
}
// La barra de niveles solo aparece cuando la portada (con los mismos cuatro nombres) ya no se ve.
const jumpBar=document.querySelector('.lv-jump');
const intro=document.querySelector('.lv-intro');
if(jumpBar&&intro&&'IntersectionObserver' in window){
 jumpBar.dataset.watch='';
 new IntersectionObserver(([e])=>jumpBar.classList.toggle('is-on',!e.isIntersecting)).observe(intro);
}
