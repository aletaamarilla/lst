const dialog=document.querySelector('.photo-dialog');
const photos=[...document.querySelectorAll('.gallery-track figure')].map(figure=>({src:figure.querySelector('img').src,alt:figure.querySelector('img').alt,caption:figure.querySelector('figcaption').textContent}));
let index=0,trigger=null;
function showPhoto(next){index=(next+photos.length)%photos.length;const data=photos[index];const img=dialog.querySelector('.photo-large');img.src=data.src;img.alt=data.alt;dialog.querySelector('#photo-caption').textContent=data.caption;dialog.querySelector('.photo-counter').textContent=`${index+1} / ${photos.length}`;}
function openPhoto(next,button){trigger=button;showPhoto(next);dialog.showModal();dialog.querySelector('.photo-close').focus();}
document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>openPhoto(Number(button.dataset.photo),button)));
document.querySelector('[data-open-gallery]')?.addEventListener('click',event=>openPhoto(0,event.currentTarget));
dialog.querySelector('[data-photo-prev]').addEventListener('click',()=>showPhoto(index-1));
dialog.querySelector('[data-photo-next]').addEventListener('click',()=>showPhoto(index+1));
dialog.querySelector('.photo-close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();showPhoto(index+1);}if(event.key==='ArrowLeft'){event.preventDefault();showPhoto(index-1);}});
dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>trigger?.focus());
