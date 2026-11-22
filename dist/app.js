// Early bird ends at midnight in Spain. Static pages may outlive that day, so the
// browser retires the offer itself: struck prices and notes go, the general price returns.
{
  const today = new Intl.DateTimeFormat('en-CA', {timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  const days = until => Math.round((Date.parse(`${until}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 864e5);
  for (const node of document.querySelectorAll('[data-eb-until]')) {
    const left = days(node.dataset.ebUntil);
    const role = node.dataset.eb;
    if (left >= 0) {
      if (role === 'days') node.textContent = left === 0 ? 'Hoy es el último día. ' : `Quedan ${left} ${left === 1 ? 'día' : 'días'}. `;
      continue;
    }
    if (role === 'price') node.textContent = node.dataset.ebRegular;
    else if (role === 'label') node.dataset.priceLabel = node.dataset.ebRegular;
    else node.remove();
  }
}
const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
const header = document.querySelector('.site-header');
// Anchor targets clear the fixed header even when its text size changes.
const updateHeaderHeight = () => {
  document.documentElement.style.setProperty('--home-header-height', `${Math.ceil(header.getBoundingClientRect().height)}px`);
};
updateHeaderHeight();
new ResizeObserver(updateHeaderHeight).observe(header);
const mobileMenu = window.matchMedia('(max-width: 999px)');
// In the phone menu each section says what is inside it (hidden on the desktop bar).
const navNotes = {'/viajes/': 'Fechas, destinos y precios', '/niveles/': '¿En qué ola estás?', '/conocenos/': 'Quién hay detrás de LST', '/preguntas-frecuentes/': 'Lo que todo el mundo pregunta'};
nav.querySelectorAll('a').forEach(link => {
  const note = link.classList.contains('lst-nav-contact') ? 'Te respondemos por WhatsApp' : navNotes[new URL(link.href, location.href).pathname];
  if (!note || link.querySelector('.nav-sub')) return;
  const span = document.createElement('span');
  span.className = 'nav-sub';
  span.setAttribute('aria-hidden', 'true');
  span.textContent = note;
  link.append(span);
});
function setMenu(open) {
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  // The panel starts right under the header, wherever the header is at that moment.
  if (open) nav.style.setProperty('--menu-top', `${Math.max(0, Math.round(header.getBoundingClientRect().bottom))}px`);
  nav.classList.toggle('is-open', open);
  document.documentElement.classList.toggle('menu-open', open && mobileMenu.matches);
}
toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  if (!mobileMenu.matches) return;
  setMenu(false);
  // External links open a new tab; keep a visible focus target in this page.
  if (link.target === '_blank') toggle.focus({preventScroll: true});
}));
header.addEventListener('focusout', event => {
  if (!header.contains(event.relatedTarget)) setMenu(false);
});
document.addEventListener('click', event => {
  if (!header.contains(event.target)) setMenu(false);
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) {
    setMenu(false);
    toggle.focus({preventScroll: true});
  }
});
mobileMenu.addEventListener('change', () => {
  const focused = document.activeElement;
  setMenu(false);
  if (mobileMenu.matches && nav.contains(focused)) toggle.focus({preventScroll: true});
  else if (!mobileMenu.matches && focused === toggle) nav.querySelector('a').focus({preventScroll: true});
});

const levelData={
1:{name:'INICIACIÓN',title:'Estás empezando',description:'Estás aprendiendo a remar y a ponerte de pie, y empiezas a disfrutar en espumas y olas pequeñas.',url:'/niveles/#nivel-1'},
2:{name:'BASE',title:'Ya recorres la pared',description:'Ya coges olas verdes y quieres ganar velocidad, trabajar tus primeros giros y sentir más control sobre la tabla.',url:'/niveles/#nivel-2'},
3:{name:'INTERMEDIO',title:'Tienes autonomía en el agua',description:'Surfeas con autonomía y enlazas maniobras. Buscas afinar la técnica y sacar más partido a cada ola.',url:'/niveles/#nivel-3'},
4:{name:'AVANZADO',title:'Quieres afinar tu técnica',description:'Tienes un surf sólido en olas con fuerza. Quieres perfeccionar tus giros, conectar maniobras y seguir puliendo tu técnica.',url:'/niveles/#nivel-4'}
};
const tabs=[...document.querySelectorAll('[data-level]')];
function setLevel(tab){const id=tab.dataset.level;const data=levelData[id];tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});document.querySelector('#level-panel').setAttribute('aria-labelledby',tab.id);document.querySelector('#level-caption').textContent=`NIVEL ${id} / ${data.name}`;document.querySelector('#level-title').textContent=data.title;document.querySelector('#level-description').textContent=data.description;document.querySelector('#level-source').href=data.url;}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>setLevel(tab));tab.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%tabs.length;if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;if(event.key==='Home')index=0;if(event.key==='End')index=tabs.length-1;if(index!==undefined){event.preventDefault();tabs[index].focus();setLevel(tabs[index]);}})});

const updateHeaderState = () => header.classList.toggle('is-scrolled', window.scrollY > 0);
updateHeaderState();
window.addEventListener('scroll', updateHeaderState, {passive: true});
