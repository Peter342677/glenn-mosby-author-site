import { PRODUCTS } from './products.js';
import { addToCart } from './cart.js';

function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

function renderCard(product) {
  const card = document.createElement('article');
  card.className = 'merch-card';

  const variationHtml = product.variations
    ? `<div class="variation-grid" data-variations>
        ${product.variations
          .map(
            (v, i) =>
              `<label class="variation-option${i === 0 ? ' is-selected' : ''}">
                <input type="radio" name="variation-${product.id}" value="${v.id}" ${i === 0 ? 'checked' : ''} hidden />
                ${v.label}
              </label>`
          )
          .join('')}
      </div>`
    : '';

  card.innerHTML = `
    <div class="merch-media">
      <img class="merch-photo is-active" src="${product.image}" alt="${product.name}" loading="lazy" />
    </div>
    <div class="merch-body">
      ${product.badge ? `<span class="merch-badge">${product.badge}</span>` : ''}
      <h3>${product.name}</h3>
      <p class="product-price">${formatPrice(product.price)}</p>
      <p>${product.description}</p>
      ${variationHtml}
      <button type="button" class="btn btn-primary" data-add-to-cart data-cursor-label="Add">Add to Cart</button>
      <p class="add-to-cart-status" role="status" aria-live="polite"></p>
    </div>
  `;

  const variationInputs = card.querySelectorAll(`input[name="variation-${product.id}"]`);
  variationInputs.forEach((input) => {
    input.addEventListener('change', () => {
      card.querySelectorAll('.variation-option').forEach((opt) => opt.classList.remove('is-selected'));
      input.closest('.variation-option').classList.add('is-selected');
    });
  });

  const addBtn = card.querySelector('[data-add-to-cart]');
  const status = card.querySelector('.add-to-cart-status');
  addBtn.addEventListener('click', () => {
    const selectedVariation = card.querySelector(`input[name="variation-${product.id}"]:checked`);
    addToCart(product.id, selectedVariation ? selectedVariation.value : null, 1);
    status.textContent = 'Added to cart!';
    status.classList.add('success');
    setTimeout(() => {
      status.textContent = '';
      status.classList.remove('success');
    }, 2000);
  });

  return card;
}

export function initMerchGallery() {
  const grid = document.querySelector('[data-merch-grid]');
  if (grid) {
    PRODUCTS.forEach((product) => grid.appendChild(renderCard(product)));
  }

  const raffleBtn = document.querySelector('[data-add-to-cart="anniversary-raffle"]');
  if (raffleBtn) {
    raffleBtn.addEventListener('click', () => {
      addToCart('anniversary-raffle', null, 1);
      const status = document.querySelector('[data-raffle-status]');
      if (status) {
        status.textContent = 'Raffle entry added to cart!';
        status.classList.add('success');
        setTimeout(() => {
          status.textContent = '';
          status.classList.remove('success');
        }, 2000);
      }
    });
  }
}
