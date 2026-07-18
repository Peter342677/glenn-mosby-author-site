import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Autoplays a muted background video only while it's in view, and skips
 * it entirely under prefers-reduced-motion (the poster image stands in). */
function setupBgVideo(video) {
  if (!video) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    video.remove();
    return;
  }

  video.play().catch(() => {});

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      });
    },
    { threshold: 0.1 }
  );
  observer.observe(video);
}

/** Same treatment for the smaller cloud-video background on subpage title
 * sections (Book, Author, Contact, Merchandise). */
export function initPageHeroVideo() {
  setupBgVideo(document.querySelector('.page-hero-video'));
}

/**
 * Hero: staggered headline reveal on load, cursor-parallax on the video /
 * book / decorative layers (lerped, different depths), a slow autonomous
 * drift as the touch-device fallback, idle levitation on the book cover,
 * and video pause when the hero scrolls out of view.
 */
export function initHero() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // Headline mask reveal
  const lines = hero.querySelectorAll('.hero-title .line span');
  if (lines.length) {
    if (prefersReduced) {
      gsap.set(lines, { yPercent: 0 });
    } else {
      gsap.fromTo(
        lines,
        { yPercent: 110 },
        { yPercent: 0, duration: 1, ease: 'power3.out', stagger: 0.12, delay: 0.3 }
      );
    }
  }

  const restCopy = hero.querySelectorAll('.hero-subtitle, .hero-cta');
  if (restCopy.length) {
    if (prefersReduced) {
      gsap.set(restCopy, { opacity: 1, y: 0 });
    } else {
      gsap.fromTo(
        restCopy,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.1, delay: 0.7 }
      );
    }
  }

  // Idle levitation on the book cover
  const bookCover = hero.querySelector('.hero-book-cover');
  if (bookCover && !prefersReduced) {
    bookCover.classList.add('is-floating');
  }

  // A gentle page-turn flip as the hero scrolls out of view
  const bookFlip = hero.querySelector('.hero-book-flip');
  if (bookFlip && !prefersReduced) {
    gsap.to(bookFlip, {
      rotateY: -35,
      rotateX: 6,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.5,
      },
    });
  }

  // Parallax layers
  const layers = hero.querySelectorAll('[data-parallax-depth]');
  if (layers.length && !prefersReduced) {
    let targetX = 0;
    let targetY = 0;
    const current = new Map();
    layers.forEach((el) => current.set(el, { x: 0, y: 0 }));

    if (!isTouch) {
      hero.addEventListener(
        'mousemove',
        (e) => {
          const rect = hero.getBoundingClientRect();
          targetX = e.clientX - rect.left - rect.width / 2;
          targetY = e.clientY - rect.top - rect.height / 2;
        },
        { passive: true }
      );
      hero.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
      });
    }

    let driftT = 0;
    function tick() {
      if (isTouch) {
        driftT += 0.006;
        targetX = Math.sin(driftT) * 60;
        targetY = Math.cos(driftT * 0.8) * 30;
      }
      layers.forEach((el) => {
        const depth = Number(el.dataset.parallaxDepth) || 0.03;
        const pos = current.get(el);
        pos.x += (targetX * depth - pos.x) * 0.08;
        pos.y += (targetY * depth - pos.y) * 0.08;
        el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      });
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // Pause hero video off-screen; play once loaded/in view
  setupBgVideo(hero.querySelector('.hero-video'));
}
