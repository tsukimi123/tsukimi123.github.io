(() => {
  const trigger = document.querySelector('.timeline-trigger');
  const dialog = document.getElementById('timeline-dialog');
  if (!trigger || !dialog) return;

  trigger.addEventListener('click', () => {
    dialog.showModal();
    document.documentElement.classList.add('has-image-zoom');
    trigger.setAttribute('aria-expanded', 'true');
    dialog.querySelector('.zoom-scroll').scrollTo(0, 0);
  });

  dialog.querySelector('.zoom-image').addEventListener('click', () => dialog.close());
  dialog.querySelector('.zoom-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-image-zoom');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.focus({ preventScroll: true });
  });
})();
