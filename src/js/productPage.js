import { getProduct, formatPrice } from './products.js';
import { addToCart } from './cart.js';

export function initProductPage() {
  const root = document.querySelector('[data-product-page]');
  if (!root) return;

  const product = getProduct(root.dataset.productPage);
  if (!product) return;

  let selectedVariation = product.variations ? product.variations[0].id : null;
  let qty = 1;

  const mainImage = root.querySelector('.product-gallery-main img');
  const thumbs = root.querySelectorAll('.product-thumb');
  const variationOptions = root.querySelectorAll('.variation-option');
  const qtyDisplay = root.querySelector('.qty-stepper span');
  const status = root.querySelector('.add-to-cart-status');
  const addBtn = root.querySelector('.add-to-cart-btn');

  function setImage(src) {
    if (mainImage) mainImage.src = src;
    thumbs.forEach((t) => t.classList.toggle('is-active', t.dataset.src === src));
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => setImage(thumb.dataset.src));
  });

  variationOptions.forEach((opt) => {
    opt.addEventListener('click', () => {
      selectedVariation = opt.dataset.variationId;
      variationOptions.forEach((o) => o.classList.toggle('is-selected', o === opt));
      const variation = product.variations.find((v) => v.id === selectedVariation);
      if (variation) setImage(variation.image);
      if (status) {
        status.textContent = '';
        status.className = 'add-to-cart-status';
      }
    });
  });

  root.querySelector('.qty-decrease')?.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    if (qtyDisplay) qtyDisplay.textContent = String(qty);
  });

  root.querySelector('.qty-increase')?.addEventListener('click', () => {
    qty = Math.min(20, qty + 1);
    if (qtyDisplay) qtyDisplay.textContent = String(qty);
  });

  addBtn?.addEventListener('click', () => {
    addToCart(product.id, selectedVariation, qty);
    if (status) {
      const variation = product.variations?.find((v) => v.id === selectedVariation);
      status.textContent = `Added ${qty} × ${product.name}${variation ? ` (${variation.label})` : ''} to your cart.`;
      status.className = 'add-to-cart-status success';
    }
  });
}
