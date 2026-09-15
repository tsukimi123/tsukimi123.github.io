'use strict';

document.querySelectorAll('[data-gallery]').forEach(container => {
  const track = container.querySelector('.media-track');
  const controls = container.querySelector('.gallery-controls');
  const count = controls.querySelector('[data-count]');
  const buttons = [...controls.querySelectorAll('[data-step]')];
  const slides = [...track.children];
  const options = container.querySelector('.media-options');
  const selectors = [...options.querySelectorAll('[data-slide]')];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const current = () => Math.max(0, Math.min(slides.length - 1, Math.round(track.scrollLeft / track.clientWidth)));
  function update() {
    const index = current();
     selectors.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    count.textContent = `${index + 1} / ${slides.length}`;
    buttons[0].disabled = index === 0;
    buttons[1].disabled = index === slides.length - 1;
    slides.forEach((slide, i) => {
      slide.inert = i !== index;
      if (i !== index) slide.querySelectorAll('video').forEach(video => video.pause());
    });
  }
  function move(step) {
    track.scrollTo({ left: Math.max(0, Math.min(slides.length - 1, current() + step)) * track.clientWidth,
      behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  }
  controls.hidden = false;
  options.hidden = false;
  selectors.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.slide) - current())));
  buttons.forEach(button => button.addEventListener('click', () => move(Number(button.dataset.step))));
  track.addEventListener('scroll', update, { passive: true });
  track.addEventListener('keydown', event => {
    if (event.target !== track) return;
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      move(event.key === 'ArrowRight' ? 1 : -1);
    }
  });
  new ResizeObserver(update).observe(track);
  update();
});
document.querySelectorAll('.media-slide video').forEach(video => {
  video.addEventListener('play', () => {
    document.querySelectorAll('.media-slide video').forEach(other => { if (other !== video) other.pause(); });
  });
});
