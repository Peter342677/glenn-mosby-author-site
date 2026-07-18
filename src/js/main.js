import '../css/tokens.css';
import '../css/base.css';
import '../css/components.css';
import '../css/animations.css';

import { initNav } from './nav.js';
import { initSmoothScroll } from './smoothScroll.js';
import { initReveal, initCountUp, initParallax } from './scroll.js';
import { initCursor, initMagneticButtons } from './cursor.js';
import { initCompass } from './compass.js';
import { initHero, initPageHeroVideo } from './hero.js';
import { initBookflip } from './bookflip.js';
import { initContactForm } from './contact.js';
import { initIntroLoader } from './loader.js';
import { initPageTransitions } from './pageTransitions.js';
import { initMerchGallery } from './merchGallery.js';
import { initCartBadge } from './cart.js';
import { initProductPage } from './productPage.js';
import { initCartPage } from './cartPage.js';
import { initCheckoutPage } from './checkoutPage.js';

// Each init runs in isolation — one module's error must never block the
// rest (e.g. a compass edge case shouldn't be able to prevent hero video
// playback just because it happens to run earlier in this list).
[
  initIntroLoader,
  initNav,
  initSmoothScroll,
  initCursor,
  initMagneticButtons,
  initReveal,
  initCountUp,
  initParallax,
  initCompass,
  initHero,
  initPageHeroVideo,
  initBookflip,
  initContactForm,
  initPageTransitions,
  initMerchGallery,
  initCartBadge,
  initProductPage,
  initCartPage,
  initCheckoutPage,
].forEach((init) => {
  try {
    init();
  } catch (err) {
    console.error(`[init] ${init.name} failed:`, err);
  }
});
