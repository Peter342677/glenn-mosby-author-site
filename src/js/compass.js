import { gsap } from 'gsap';

/**
 * Decorative compass: the needle continuously points at the cursor
 * (atan2 + lerp), the outer ring rotates with overall scroll progress, and
 * clicking a retailer card spins the needle to settle pointing at that
 * card before the link opens. Static under prefers-reduced-motion.
 */
export function initCompass() {
  const compass = document.querySelector('.compass');
  if (!compass) return;

  const needle = compass.querySelector('.compass-needle');
  const ring = compass.querySelector('.compass-ring');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    wireRetailerLinks(compass, needle, true);
    return;
  }

  let targetAngle = 0;
  let currentAngle = 0;
  let userIsAiming = true;

  function angleTo(clientX, clientY) {
    const rect = compass.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI + 90;
  }

  window.addEventListener(
    'mousemove',
    (e) => {
      if (!userIsAiming) return;
      targetAngle = angleTo(e.clientX, e.clientY);
    },
    { passive: true }
  );

  function shortestDelta(from, to) {
    let delta = (to - from) % 360;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return delta;
  }

  function tick() {
    if (userIsAiming) {
      currentAngle += shortestDelta(currentAngle, targetAngle) * 0.1;
      if (needle) needle.style.transform = `rotate(${currentAngle}deg)`;
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function updateRing() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
    if (ring) ring.style.transform = `rotate(${progress * 360}deg)`;
  }
  updateRing();
  window.addEventListener('scroll', updateRing, { passive: true });

  wireRetailerLinks(compass, needle, false, {
    setAiming: (val) => (userIsAiming = val),
    getCurrentAngle: () => currentAngle,
    setCurrentAngle: (val) => (currentAngle = val),
  });
}

function wireRetailerLinks(compass, needle, prefersReduced, ctl) {
  document.querySelectorAll('.retailer-card[href]').forEach((card) => {
    card.addEventListener('click', (e) => {
      const href = card.getAttribute('href');
      if (!href) return;
      const target = card.target === '_blank';

      if (prefersReduced || !needle) return; // let the click proceed natively

      e.preventDefault();
      compass.classList.add('is-settling');
      ctl.setAiming(false);

      const rect = compass.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const tx = cardRect.left + cardRect.width / 2;
      const ty = cardRect.top + cardRect.height / 2;
      const finalAngle = (Math.atan2(ty - cy, tx - cx) * 180) / Math.PI + 90;

      const spun = ctl.getCurrentAngle() + 720 + ((finalAngle - ctl.getCurrentAngle()) % 360);

      gsap.to(
        { a: ctl.getCurrentAngle() },
        {
          a: spun,
          duration: 0.9,
          ease: 'power2.inOut',
          onUpdate: function () {
            needle.style.transform = `rotate(${this.targets()[0].a}deg)`;
          },
          onComplete: () => {
            ctl.setCurrentAngle(spun % 360);
            compass.classList.remove('is-settling');
            ctl.setAiming(true);
            setTimeout(() => {
              if (target) window.open(href, '_blank', 'noopener,noreferrer');
              else window.location.href = href;
            }, 150);
          },
        }
      );
    });
  });
}
