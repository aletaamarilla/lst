const toggle=document.querySelector('.menu-toggle');const nav=document.querySelector('#main-nav');toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú');nav.classList.toggle('is-open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');nav.classList.remove('is-open')}));
const levelData={
1:{name:'ROOKIES',title:'Estás empezando',description:'Estás aprendiendo a remar y a ponerte de pie, y empiezas a disfrutar en espumas y olas pequeñas.',url:'https://www.letsurftogether.com/rookies/'},
2:{name:'APRENDICES',title:'Ya recorres la pared',description:'Ya coges olas verdes y quieres ganar velocidad, trabajar tus primeros giros y sentir más control sobre la tabla.',url:'https://www.letsurftogether.com/nivel-ii-aprendices/'},
3:{name:'RIDERS',title:'Tienes autonomía en el agua',description:'Surfeas con autonomía y enlazas maniobras. Buscas afinar la técnica y sacar más partido a cada ola.',url:'https://www.letsurftogether.com/nivel-iii-rides/'},
4:{name:'SUPERCRACKS',title:'Quieres afinar tu técnica',description:'Tienes un surf sólido en olas con fuerza. Quieres perfeccionar tus giros, conectar maniobras y seguir puliendo tu técnica.',url:'https://www.letsurftogether.com/nivel-iv-supercracks/'}
};
const tabs=[...document.querySelectorAll('[data-level]')];
function setLevel(tab){const id=tab.dataset.level;const data=levelData[id];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});document.querySelector('#level-panel').setAttribute('aria-labelledby',tab.id);document.querySelector('#level-caption').textContent=`NIVEL ${['I','II','III','IV'][Number(id)-1]} / ${data.name}`;document.querySelector('#level-title').textContent=data.title;document.querySelector('#level-description').textContent=data.description;document.querySelector('#level-source').href=data.url;}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>setLevel(tab));tab.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%tabs.length;if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;if(event.key==='Home')index=0;if(event.key==='End')index=tabs.length-1;if(index!==undefined){event.preventDefault();tabs[index].focus();setLevel(tabs[index]);}})});
const dialog=document.querySelector('#trip-dialog');
let detailTrigger=null;
document.querySelectorAll('[data-details]').forEach(button=>button.addEventListener('click',()=>{detailTrigger=button;dialog.showModal();dialog.scrollTop=0;dialog.querySelector('.dialog-close').focus();}));
dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{const box=dialog.getBoundingClientRect();if(event.target===dialog&&(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom))dialog.close();});
dialog.addEventListener('close',()=>detailTrigger?.focus());
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('is-open')){nav.classList.remove('is-open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Abrir menú');toggle.focus();}});
