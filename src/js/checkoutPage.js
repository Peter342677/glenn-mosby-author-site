import { getEnrichedCart, getCartTotal, formatPrice, clearCart } from './cart.js';

export function initCheckoutPage() {
  const form = document.getElementById('checkout-form');
  const summaryItems = document.querySelector('.checkout-summary-items');
  const subtotalEl = document.querySelector('[data-checkout-subtotal]');
  const totalEl = document.querySelector('[data-checkout-total]');
  if (!form) return;

  const items = getEnrichedCart();

  if (!items.length) {
    form.hidden = true;
    document.querySelector('.order-summary').hidden = true;
    document.querySelector('.checkout-empty')?.removeAttribute('hidden');
    return;
  }

  if (summaryItems) {
    summaryItems.innerHTML = items
      .map(
        (item) => `
      <div class="checkout-summary-item">
        <span>${item.qty} × ${item.name}${item.variationLabel ? ` (${item.variationLabel})` : ''}</span>
        <span>${formatPrice(item.price * item.qty)}</span>
      </div>`
      )
      .join('');
  }

  const subtotal = getCartTotal();
  if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
  if (totalEl) totalEl.textContent = formatPrice(subtotal);

  const submitBtn = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (status) {
      status.textContent = '';
      status.className = 'form-status';
    }

    const formData = new FormData(form);
    const customer = Object.fromEntries(formData.entries());

    submitBtn.disabled = true;
    submitBtn.textContent = 'Redirecting to secure payment…';

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variationId: item.variationId,
            qty: item.qty,
          })),
          customer,
        }),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Something went wrong. Please try again.');
      }

      if (result.url) {
        clearCart();
        window.location.href = result.url;
        return;
      }

      throw new Error('No checkout session was returned.');
    } catch (err) {
      if (status) {
        status.textContent = err.message;
        status.classList.add('error');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Pay Now';
    }
  });
}
