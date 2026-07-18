/**
 * Custom cursor: a dot that tracks the pointer 1:1, and a lerped ring that
 * trails behind. Hidden entirely on touch devices. Elements can opt into a
 * "View"/"Open" label via data-cursor-label; everything else just expands
 * the ring.
 */
export function initCursor() {
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  const label = document.createElement('span');
  label.className = 'cursor-label';
  ring.appendChild(label);
  document.body.append(dot, ring);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener(
    'mousemove',
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    },
    { passive: true }
  );

  function tick() {
    ringX += (mouseX - ringX) * 0.16;
    ringY += (mouseY - ringY) * 0.16;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const hoverTargets = document.querySelectorAll('a, button, [data-magnetic]');
  hoverTargets.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      ring.classList.add('is-active');
      label.textContent = el.dataset.cursorLabel || '';
    });
    el.addEventListener('mouseleave', () => ring.classList.remove('is-active'));
  });
}

export function initMagneticButtons() {
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (isTouch) return;

  document.querySelectorAll('.btn-primary, .btn-outline, [data-magnetic]').forEach((el) => {
    const strength = 0.3;

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      el.style.transform = `translate(${relX * strength}px, ${relY * strength}px)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });
}
