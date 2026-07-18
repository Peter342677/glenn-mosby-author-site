import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Signature scroll-pinned 3D book: the cover and three inner leaves each
 * rotate open around their left edge (rotateY) as the user scrolls through
 * a tall pinned scene, timed as sequential segments of one scrubbed
 * timeline. On desktop, when the scene isn't pinned/scrubbing, the closed
 * book also tilts toward the cursor.
 */
export function initBookflip() {
  const scene = document.querySelector('.bookflip-scene');
  const book = document.querySelector('.bookflip-book');
  if (!scene || !book) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const cover = book.querySelector('.bookflip-cover');
  const pages = book.querySelectorAll('.bookflip-page');
  const caption = document.querySelector('.bookflip-caption');
  const captions = caption ? JSON.parse(caption.dataset.captions || '[]') : [];
  const illustrations = scene.dataset.illustrations ? JSON.parse(scene.dataset.illustrations) : [];

  const leaves = [cover, ...pages];

  // Two stacked, alternating background layers so illustration changes
  // cross-fade instead of popping.
  const pin = document.querySelector('.bookflip-pin');
  let bgLayers = [];
  let bgActiveIndex = -1;
  if (pin && illustrations.length) {
    const bgA = document.createElement('div');
    bgA.className = 'bookflip-bg';
    const bgB = document.createElement('div');
    bgB.className = 'bookflip-bg';
    pin.prepend(bgB);
    pin.prepend(bgA);
    bgLayers = [bgA, bgB];
  }

  function updateIllustration(progress) {
    if (!bgLayers.length) return;
    const idx = Math.min(illustrations.length - 1, Math.floor(progress * illustrations.length));
    if (idx === bgActiveIndex) return;
    bgActiveIndex = idx;
    const incoming = bgLayers.find((el) => !el.classList.contains('is-active')) || bgLayers[0];
    incoming.style.backgroundImage = `url('${illustrations[idx]}')`;
    bgLayers.forEach((el) => el.classList.toggle('is-active', el === incoming));
  }

  if (prefersReduced) {
    gsap.set(leaves, { rotateY: 0 });
    updateIllustration(0);
    return;
  }

  gsap.set(leaves, { rotateY: 0 });
  leaves.forEach((leaf, i) => gsap.set(leaf, { zIndex: leaves.length - i }));

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: scene,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.6,
      onUpdate: (self) => {
        updateCaption(self.progress);
        updateIllustration(self.progress);
      },
    },
  });

  leaves.forEach((leaf, i) => {
    tl.to(leaf, { rotateY: -155, duration: 1, ease: 'power2.inOut' }, i);
  });

  function updateCaption(progress) {
    if (!caption || !captions.length) return;
    const idx = Math.min(captions.length - 1, Math.floor(progress * captions.length));
    const text = captions[idx] || '';
    if (caption.textContent !== text) caption.textContent = text;
  }

  // Desktop hover tilt on the closed book (outside the pinned scroll range)
  const stage = document.querySelector('.bookflip-stage');
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  if (stage && !isTouch) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    stage.addEventListener('mousemove', (e) => {
      const rect = stage.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetY = relX * 12;
      targetX = -relY * 12;
    });

    stage.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
    });

    function tick() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      const st = tl.scrollTrigger;
      const pinned = st && st.isActive;
      if (!pinned) {
        book.style.transform = `rotateX(${currentX}deg) rotateY(${currentY}deg)`;
      } else {
        book.style.transform = '';
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}
