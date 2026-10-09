const photoDialog = document.querySelector('.photo-dialog');
const strip = photoDialog.querySelector('.photo-strip');
const slides = [...strip.querySelectorAll('.photo-slide')];
const counter = photoDialog.querySelector('.photo-counter');
const previous = photoDialog.querySelector('[data-photo-prev]');
const next = photoDialog.querySelector('[data-photo-next]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let scrollFrame = 0;

// Native dialogs keep keyboard focus inside and prevent background interaction.
function wireDialog(dialog, closeSelector) {
  let opener = null;
  let scrollPosition = 0;
  const close = dialog.querySelector(closeSelector);
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])')].filter(element => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    const root = document.documentElement;
    const previousBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, scrollPosition);
    root.style.scrollBehavior = previousBehavior;
    opener?.focus({preventScroll: true});
  });
  return button => {
    opener = button;
    scrollPosition = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    dialog.showModal();
    close.focus({preventScroll: true});
  };
}

const openGallery = wireDialog(photoDialog, '.photo-close');

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
  strip.scrollTo({left: index * strip.clientWidth, behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant'});
}

function openPhoto(selected, button) {
  updatePhoto(selected);
  openGallery(button);
  movePhoto(index, false);
}

document.querySelectorAll('[data-photo]').forEach(button => {
  button.addEventListener('click', () => openPhoto(Number(button.dataset.photo), button));
});
document.querySelector('[data-open-gallery]')?.addEventListener('click', event => openPhoto(0, event.currentTarget));
previous.addEventListener('click', () => movePhoto(index - 1));
next.addEventListener('click', () => movePhoto(index + 1));
strip.addEventListener('scroll', () => {
  if (scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (strip.clientWidth) updatePhoto(Math.round(strip.scrollLeft / strip.clientWidth));
  });
}, {passive: true});
new ResizeObserver(() => {
  if (photoDialog.open && strip.clientWidth) movePhoto(index, false);
}).observe(strip);
photoDialog.addEventListener('keydown', event => {
  let selected;
  if (event.key === 'ArrowRight') selected = index + 1;
  if (event.key === 'ArrowLeft') selected = index - 1;
  if (event.key === 'Home') selected = 0;
  if (event.key === 'End') selected = slides.length - 1;
  if (selected !== undefined) {
    event.preventDefault();
    movePhoto(selected);
  }
});

const departureDialog = document.querySelector('.departure-dialog');
if (departureDialog) {
  const openDates = wireDialog(departureDialog, '.departure-close');
  document.querySelectorAll('[data-open-dates]').forEach(button => {
    button.addEventListener('click', () => openDates(button));
  });
}
