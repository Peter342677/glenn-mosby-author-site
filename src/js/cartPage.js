import { getEnrichedCart, updateQty, removeFromCart, getCartTotal, formatPrice } from './cart.js';

export function initCartPage() {
  const list = document.querySelector('.cart-list');
  const empty = document.querySelector('.cart-empty');
  const summary = document.querySelector('.order-summary');
  if (!list) return;

  function render() {
    const items = getEnrichedCart();

    if (!items.length) {
      list.hidden = true;
      if (summary) summary.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }

    if (empty) empty.hidden = true;
    list.hidden = false;
    if (summary) summary.hidden = false;

    list.innerHTML = items
      .map(
        (item) => `
      <div class="cart-item" data-product-id="${item.productId}" data-variation-id="${item.variationId || ''}">
        <img src="${item.image}" alt="${item.name}" />
        <div>
          <h3>${item.name}</h3>
          ${item.variationLabel ? `<div class="cart-item-variation">Scene: ${item.variationLabel}</div>` : ''}
          <div class="cart-item-variation">${formatPrice(item.price)} each</div>
        </div>
        <div class="cart-item-actions">
          <div class="qty-stepper">
            <button type="button" class="qty-decrease" aria-label="Decrease quantity">&minus;</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-increase" aria-label="Increase quantity">+</button>
          </div>
          <button type="button" class="cart-item-remove">Remove</button>
        </div>
      </div>`
      )
      .join('');

    const subtotal = getCartTotal();
    const subtotalEl = summary?.querySelector('[data-cart-subtotal]');
    const totalEl = summary?.querySelector('[data-cart-total]');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (totalEl) totalEl.textContent = formatPrice(subtotal);
  }

  list.addEventListener('click', (e) => {
    const row = e.target.closest('.cart-item');
    if (!row) return;
    const productId = row.dataset.productId;
    const variationId = row.dataset.variationId || null;

    if (e.target.closest('.qty-increase')) {
      const qty = Number(row.querySelector('.qty-stepper span').textContent) + 1;
      updateQty(productId, variationId, Math.min(20, qty));
    } else if (e.target.closest('.qty-decrease')) {
      const qty = Number(row.querySelector('.qty-stepper span').textContent) - 1;
      updateQty(productId, variationId, Math.max(0, qty));
    } else if (e.target.closest('.cart-item-remove')) {
      removeFromCart(productId, variationId);
    }
  });

  window.addEventListener('cart:change', render);
  render();
}
