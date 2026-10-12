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
  const focusedControl = document.activeElement;
  previous.disabled = index === 0;
  next.disabled = index === slides.length - 1;
  // Disabling the focused end button would otherwise drop keyboard focus.
  if ((focusedControl === previous && previous.disabled) || (focusedControl === next && next.disabled)) {
    strip.focus({preventScroll: true});
  }
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

// Reserve the actual dock/header space when labels wrap or text is enlarged.
const tripHeader = document.querySelector('.trip-header');
const tripDock = document.querySelector('.trip-dock');
function updateReadingSpace() {
  document.body.classList.toggle('dock-in-flow', tripDock.getBoundingClientRect().height > window.innerHeight * .25);
  const height = (element, position) => getComputedStyle(element).position === position
    ? element.getBoundingClientRect().height : 0;
  document.documentElement.style.setProperty('--trip-header-height', `${height(tripHeader, 'sticky')}px`);
  document.documentElement.style.setProperty('--trip-dock-height', `${height(tripDock, 'fixed')}px`);
}
const readingSpaceObserver = new ResizeObserver(updateReadingSpace);
readingSpaceObserver.observe(tripHeader);
readingSpaceObserver.observe(tripDock);
window.addEventListener('resize', updateReadingSpace);
updateReadingSpace();

// Anchor only the close button if large text needs a scrolling dialog.
function positionDialogClose(dialog, heading, close) {
  const bounds = dialog.getBoundingClientRect();
  const style = getComputedStyle(heading);
  const top = parseFloat(style.paddingTop);
  dialog.style.setProperty('--dialog-close-width', `${close.getBoundingClientRect().width}px`);
  dialog.style.setProperty('--dialog-close-top', `${bounds.top + top}px`);
  dialog.style.setProperty('--dialog-close-right', `${window.innerWidth - bounds.right + parseFloat(style.paddingRight)}px`);
  dialog.style.setProperty('--dialog-close-space', `${top + close.getBoundingClientRect().height + 12}px`);
}

const photoHeading = photoDialog.querySelector('.photo-heading');
const photoControls = photoDialog.querySelector('.photo-controls');
const photoClose = photoDialog.querySelector('.photo-close');
const captions = slides.map(slide => slide.querySelector('figcaption'));
const photoFitObserver = new ResizeObserver(() => {
  if (!photoDialog.open) return;
  const captionHeight = Math.max(...captions.map(caption => caption.getBoundingClientRect().height));
  const imageSpace = photoDialog.clientHeight - photoHeading.getBoundingClientRect().height - photoControls.getBoundingClientRect().height - captionHeight;
  photoDialog.style.setProperty('--photo-caption-height', `${captionHeight}px`);
  photoDialog.classList.toggle('is-constrained', imageSpace < 96);
  positionDialogClose(photoDialog, photoHeading, photoClose);
});
[photoDialog, photoHeading, photoControls, photoClose, ...captions].forEach(part => photoFitObserver.observe(part));

// If large text leaves too little room for dates, scroll the whole panel.
if (departureDialog) {
  const fixedParts = [...departureDialog.querySelectorAll('.departure-dialog-heading, .departure-dialog-intro, .departure-dialog-help')];
  const fitDates = () => {
    if (!departureDialog.open) return;
    departureDialog.style.setProperty('--departure-heading-height', `${fixedParts[0].getBoundingClientRect().height + 12}px`);
    const remaining = departureDialog.clientHeight - fixedParts.reduce((sum, part) => sum + part.getBoundingClientRect().height, 0);
    departureDialog.classList.toggle('is-constrained', remaining < 160);
    departureDialog.classList.toggle('is-heading-tall', fixedParts[0].getBoundingClientRect().height > departureDialog.clientHeight - 100);
    positionDialogClose(departureDialog, fixedParts[0], departureDialog.querySelector('.departure-close'));
  };
  const datesObserver = new ResizeObserver(fitDates);
  [departureDialog, ...fixedParts].forEach(part => datesObserver.observe(part));
}
