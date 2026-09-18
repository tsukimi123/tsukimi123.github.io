(() => {
  const preview = document.getElementById('path-preview');
  const dialog = document.getElementById('path-dialog');
  const zoom = document.getElementById('path-zoom');
  if (!preview || !dialog || !zoom) return;

  const trigger = preview.querySelector('button');
  const scrollRange = element => element.scrollWidth - element.clientWidth;
  const position = element => element.scrollLeft / (scrollRange(element) || 1);

  requestAnimationFrame(() => {
    preview.scrollLeft = scrollRange(preview) * 0.18;
  });

  // Touch uses native scrolling; mouse dragging should not also open the image.
  for (const viewport of [preview, zoom]) {
    let drag = null;
    let suppressClick = false;

    viewport.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      suppressClick = false;
      drag = { id: event.pointerId, x: event.clientX, left: viewport.scrollLeft };
    });
    viewport.addEventListener('pointermove', event => {
      if (!drag || event.pointerId !== drag.id) return;
      const distance = event.clientX - drag.x;
      if (!suppressClick && Math.abs(distance) < 5) return;
      suppressClick = true;
      viewport.setPointerCapture(event.pointerId);
      viewport.classList.add('is-dragging');
      viewport.scrollLeft = drag.left - distance;
      event.preventDefault();
    });
    const endDrag = event => {
      if (!drag || event.pointerId !== drag.id) return;
      drag = null;
      viewport.classList.remove('is-dragging');
      if (viewport.hasPointerCapture(event.pointerId)) viewport.releasePointerCapture(event.pointerId);
      setTimeout(() => { suppressClick = false; }, 0);
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);
    viewport.addEventListener('lostpointercapture', endDrag);
    viewport.addEventListener('click', event => {
      if (suppressClick) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, true);
    viewport.addEventListener('keydown', event => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      viewport.scrollLeft += (event.key === 'ArrowRight' ? 1 : -1) * viewport.clientWidth * 0.25;
    });
  }

  trigger.addEventListener('click', () => {
    const ratio = position(preview);
    dialog.showModal();
    document.documentElement.classList.add('has-image-zoom');
    trigger.setAttribute('aria-expanded', 'true');
    // Preserve the viewed image centre when mobile zoom shows a smaller area.
    const centre = ratio * scrollRange(preview) / preview.scrollWidth + preview.clientWidth / preview.scrollWidth / 2;
    zoom.scrollLeft = centre * zoom.scrollWidth - zoom.clientWidth / 2;
  });
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
