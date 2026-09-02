import { readCart } from './cart.js';
import { getProductById } from './products.js';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderSummary() {
  const summaryList = document.querySelector('[data-checkout-summary]');
  const totalEl = document.querySelector('[data-checkout-total]');
  if (!summaryList) return 0;

  const items = readCart();
  summaryList.innerHTML = '';
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
        <p>Qty: ${item.qty}</p>
      </div>
      <strong>${formatPrice(lineTotal)}</strong>
    `;
    summaryList.appendChild(row);
  });

  if (totalEl) totalEl.textContent = formatPrice(total);
  return total;
}

export function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  const total = renderSummary();
  const statusEl = form.querySelector('.form-status');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (total === 0) {
    submitBtn.disabled = true;
    if (statusEl) {
      statusEl.textContent = 'Your cart is empty.';
      statusEl.classList.add('error');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = readCart();
    if (items.length === 0) return;

    const formData = new FormData(form);
    const customer = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to payment…';
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = 'form-status';
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer }),
      });
      const result = await res.json();

      if (!res.ok || !result.url) {
        throw new Error(result.error || 'Could not start checkout right now.');
      }

      window.location.href = result.url;
    } catch (err) {
      if (statusEl) {
        statusEl.textContent = err.message || 'Something went wrong. Please try again.';
        statusEl.classList.add('error');
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Proceed to Payment';
    }
  });
}
