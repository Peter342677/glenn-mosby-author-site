import { gsap } from 'gsap';

/**
 * One-time animated logo intro, Home page only, first visit only
 * (sessionStorage-gated so it never repeats), capped at ~1.2s, and
 * always skippable by clicking anywhere.
 */
export function initIntroLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const alreadySeen = sessionStorage.getItem('ofj-intro-seen');

  if (prefersReduced || alreadySeen) {
    loader.remove();
    return;
  }
  sessionStorage.setItem('ofj-intro-seen', '1');

  const logo = loader.querySelector('img');
  const finish = () => {
    gsap.to(loader, {
      opacity: 0,
      duration: 0.4,
      ease: 'power1.out',
      onComplete: () => loader.remove(),
    });
  };

  gsap.timeline({ onComplete: () => setTimeout(finish, 250) }).fromTo(
    logo,
    { opacity: 0, scale: 0.85 },
    { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }
  );

  loader.addEventListener('click', finish, { once: true });
}
