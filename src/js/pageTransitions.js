/**
 * Quick fade overlay between internal page loads — no heavy preloader,
 * just a brief cross-fade so navigation doesn't feel like a hard cut.
 */
export function initPageTransitions() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const overlay = document.createElement('div');
  overlay.className = 'page-transition-overlay';
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '996',
    background: 'var(--color-barn-red)',
    opacity: '0',
    pointerEvents: 'none',
    transition: prefersReduced ? 'none' : 'opacity 0.35s ease',
  });
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.style.opacity = '0';
  });

  document.querySelectorAll('a[href]').forEach((link) => {
    const url = link.getAttribute('href');
    if (!url || url.startsWith('http') || url.startsWith('#') || url.startsWith('mailto:') || link.target === '_blank') {
      return;
    }

    link.addEventListener('click', (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      overlay.style.pointerEvents = 'auto';
      overlay.style.opacity = '1';
      const delay = prefersReduced ? 0 : 320;
      setTimeout(() => {
        window.location.href = url;
      }, delay);
    });
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    }
  });
}
