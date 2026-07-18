import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Generic once-per-element scroll reveal: fade/slide for body content,
 * line-mask reveal for headings marked [data-reveal-lines]. */
export function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bodyTargets = document.querySelectorAll('[data-reveal]');
  const headings = document.querySelectorAll('[data-reveal-lines]');

  if (prefersReduced) {
    bodyTargets.forEach((el) => (el.style.opacity = 1));
    headings.forEach((el) => (el.style.opacity = 1));
    document.querySelectorAll('.about-photo-frame, .retailer-card, .merch-card, .stat').forEach((el) =>
      el.classList.add('is-visible')
    );
    return;
  }

  bodyTargets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 26 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }
    );
  });

  headings.forEach((el) => {
    const split = new SplitText(el, { type: 'lines', linesClass: 'split-line' });
    split.lines.forEach((line) => {
      const wrapper = document.createElement('span');
      wrapper.className = 'split-line-mask';
      wrapper.style.display = 'block';
      wrapper.style.overflow = 'hidden';
      line.parentNode.insertBefore(wrapper, line);
      wrapper.appendChild(line);
      line.style.display = 'block';
    });

    gsap.fromTo(
      split.lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: { trigger: el, start: 'top 85%' },
      }
    );
  });

  // Section image / decorative elements
  document.querySelectorAll('.about-photo-frame').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });

  // Card grids stagger in at 0.08s apart
  document.querySelectorAll('.retailer-grid, .merch-grid').forEach((grid) => {
    const cards = grid.querySelectorAll('.retailer-card, .merch-card');
    ScrollTrigger.create({
      trigger: grid,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        cards.forEach((card, i) => {
          setTimeout(() => card.classList.add('is-visible'), i * 80);
        });
      },
    });
  });

  document.querySelectorAll('.stat').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => el.classList.add('is-visible'),
    });
  });
}

/** Stat strip count-up, triggered once each number is in view. */
export function initCountUp() {
  const nodes = document.querySelectorAll('[data-count-to]');
  if (!nodes.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const animate = (el) => {
    const target = Number(el.dataset.countTo);
    if (prefersReduced) {
      el.textContent = String(target);
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );

  nodes.forEach((el) => observer.observe(el));
}

/** Subtle parallax on section background layers. */
export function initParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  document.querySelectorAll('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      y: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });
}
