import { readCart, updateQty, removeFromCart } from './cart.js';
import { getProductById } from './products.js';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function render() {
  const list = document.querySelector('[data-cart-list]');
  const emptyState = document.querySelector('[data-cart-empty]');
  const summary = document.querySelector('[data-cart-summary]');
  const totalEl = document.querySelector('[data-cart-total]');
  if (!list) return;

  const items = readCart();
  list.innerHTML = '';

  if (items.length === 0) {
    if (emptyState) emptyState.hidden = false;
    if (summary) summary.hidden = true;
    return;
  }

  if (emptyState) emptyState.hidden = true;
  if (summary) summary.hidden = false;

  let total = 0;

  items.forEach((item) => {
    const product = getProductById(item.productId);
    if (!product) return;
    const variation = product.variations?.find((v) => v.id === item.variationId);
    const lineTotal = product.price * item.qty;
    total += lineTotal;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <div>
        <h3>${product.name}</h3>
        ${variation ? `<p class="cart-item-variation">${variation.label}</p>` : ''}
        <div class="qty-stepper">
          <button type="button" data-qty-decrease aria-label="Decrease quantity">−</button>
          <span>${item.qty}</span>
          <button type="button" data-qty-increase aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cart-item-actions">
        <strong>${formatPrice(lineTotal)}</strong>
        <button type="button" class="cart-item-remove" data-remove aria-label="Remove item">Remove</button>
      </div>
    `;

    row.querySelector('[data-qty-decrease]').addEventListener('click', () => {
      updateQty(item.productId, item.variationId, item.qty - 1);
      if (item.qty - 1 <= 0) removeFromCart(item.productId, item.variationId);
      render();
    });
    row.querySelector('[data-qty-increase]').addEventListener('click', () => {
      updateQty(item.productId, item.variationId, item.qty + 1);
      render();
    });
    row.querySelector('[data-remove]').addEventListener('click', () => {
      removeFromCart(item.productId, item.variationId);
      render();
    });

    list.appendChild(row);
  });

  if (totalEl) totalEl.textContent = formatPrice(total);
}

export function initCartPage() {
  const list = document.querySelector('[data-cart-list]');
  if (!list) return;
  render();
}
