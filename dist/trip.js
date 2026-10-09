const dialog = document.querySelector('.photo-dialog');
const strip = dialog.querySelector('.photo-strip');
const slides = [...strip.querySelectorAll('.photo-slide')];
const counter = dialog.querySelector('.photo-counter');
const previous = dialog.querySelector('[data-photo-prev]');
const next = dialog.querySelector('[data-photo-next]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let trigger = null;
let scrollFrame = 0;

function updatePhoto(selected) {
  index = Math.max(0, Math.min(selected, slides.length - 1));
  const label = `${index + 1} / ${slides.length}`;
  if (counter.textContent !== label) counter.textContent = label;
  previous.disabled = index === 0;
  next.disabled = index === slides.length - 1;
  slides[index].querySelector('img').loading = 'eager';
}

function movePhoto(selected, animate = true) {
  updatePhoto(selected);
  strip.scrollTo({
    left: index * strip.clientWidth,
    behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
  });
}

function openPhoto(selected, button) {
  trigger = button;
  updatePhoto(selected);
  dialog.showModal();
  movePhoto(index, false);
  dialog.querySelector('.photo-close').focus();
}

document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => openPhoto(Number(button.dataset.photo), button));
});
document.querySelector('[data-open-gallery]')?.addEventListener('click', event => openPhoto(0, event.currentTarget));
previous.addEventListener('click', () => movePhoto(index - 1));
next.addEventListener('click', () => movePhoto(index + 1));
dialog.querySelector('.photo-close').addEventListener('click', () => dialog.close());
strip.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (strip.clientWidth) updatePhoto(Math.round(strip.scrollLeft / strip.clientWidth));
  });
}, {passive: true});
new ResizeObserver(() => {
  if (dialog.open && strip.clientWidth) movePhoto(index, false);
}).observe(strip);
dialog.addEventListener('keydown', event => {
  const target = {ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: slides.length - 1}[event.key];
  if (target !== undefined) {
    event.preventDefault();
    movePhoto(target);
  }
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});
dialog.addEventListener('close', () => trigger?.focus({preventScroll: true}));

// Use the visible native date picker: on the page in mobile, in the sidebar on desktop.
document.querySelectorAll('[data-open-dates]').forEach(link => {
  link.addEventListener('click', event => {
    const picker = [...document.querySelectorAll('[data-date-picker]')].find(element => element.getClientRects().length);
    if (!picker) return;
    event.preventDefault();
    picker.open = true;
    const summary = picker.querySelector('summary');
    summary.focus({preventScroll: true});
    summary.scrollIntoView({block: 'start', behavior: reducedMotion.matches ? 'instant' : 'smooth'});
  });
});
